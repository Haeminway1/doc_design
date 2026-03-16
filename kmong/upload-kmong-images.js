#!/usr/bin/env node
/**
 * upload-kmong-images.js
 * 크몽 서비스에 이미지 업로드 자동화
 * Usage: node kmong/upload-kmong-images.js [--debug]
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname);
const IMAGES = path.join(ROOT, 'images');
const DEBUG_DIR = path.join(ROOT, 'debug');
const GIG_ID = '751510';

// Load .env
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^(\w+)=(.+)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

const EMAIL = process.env.KMONG_EMAIL;
const PASSWORD = process.env.KMONG_PASSWORD;
const DEBUG = process.argv.includes('--debug');

if (!EMAIL || !PASSWORD) {
  console.error('KMONG_EMAIL / KMONG_PASSWORD not set. Check kmong/.env');
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  const fp = path.join(DEBUG_DIR, `upload-${name}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  if (DEBUG) console.log(`  [debug] ${fp}`);
}

async function clickText(page, selector, pattern) {
  const els = await page.$$(selector);
  for (const el of els) {
    const text = await page.evaluate(e => (e.innerText || e.textContent || '').trim(), el);
    if (pattern.test(text)) { await el.click(); return true; }
  }
  return false;
}

// ─── Login ───────────────────────────────────────────────

async function login(page) {
  console.log('[1] 크몽 로그인...');
  await page.goto('https://kmong.com/', { waitUntil: 'networkidle2', timeout: 60000 });

  // Click login button
  const clicked = await clickText(page, 'button, a', /^로그인$/);
  if (!clicked) throw new Error('로그인 버튼 찾을 수 없음');

  await page.waitForSelector('input', { timeout: 15000 });
  await sleep(1000);

  // Find email & password inputs
  const inputs = await page.$$('input');
  let emailInput, pwInput;
  for (const inp of inputs) {
    const meta = await page.evaluate(el => ({
      type: (el.type || '').toLowerCase(),
      name: (el.name || '').toLowerCase(),
      placeholder: (el.placeholder || '').toLowerCase(),
      visible: el.offsetWidth > 0 && el.offsetHeight > 0
    }), inp);
    if (!meta.visible) continue;
    if (!emailInput && (meta.type === 'email' || meta.name.includes('email') || meta.placeholder.includes('이메일'))) emailInput = inp;
    if (!pwInput && (meta.type === 'password' || meta.name.includes('password') || meta.placeholder.includes('비밀번호'))) pwInput = inp;
  }

  if (!emailInput || !pwInput) {
    await screenshot(page, '01-login-fail');
    throw new Error('이메일/비밀번호 입력창 찾을 수 없음');
  }

  await emailInput.click({ clickCount: 3 });
  await emailInput.type(EMAIL, { delay: 30 });
  await pwInput.click({ clickCount: 3 });
  await pwInput.type(PASSWORD, { delay: 30 });

  // Submit
  const submit = await page.$('button[type="submit"]');
  if (submit) await submit.click();
  else await clickText(page, 'button', /로그인|계속|확인/);

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await sleep(2000);
  await screenshot(page, '01-after-login');

  // Check if login succeeded
  const url = page.url();
  console.log(`  로그인 후 URL: ${url}`);

  // Handle MFA if needed
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  if (/인증|새로운 기기|코드를 입력/.test(bodyText)) {
    console.log('  ⚠ MFA/인증 코드 필요 — KMONG_MFA_CODE 환경변수 설정 필요');
    await screenshot(page, '01-mfa-needed');
    throw new Error('MFA 인증 필요. KMONG_MFA_CODE를 설정하세요.');
  }

  return true;
}

// ─── Navigate to Service Edit ────────────────────────────

async function navigateToServiceEdit(page) {
  console.log('[2] 서비스 편집 페이지 이동...');

  // Try multiple possible edit URLs
  const editUrls = [
    `https://kmong.com/seller/service/${GIG_ID}/edit`,
    `https://kmong.com/seller/gig/${GIG_ID}/edit`,
    `https://kmong.com/seller/service/edit/${GIG_ID}`,
  ];

  // First try: go to seller dashboard to find the right URL
  await page.goto('https://kmong.com/seller/my-services', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await sleep(2000);
  await screenshot(page, '02-my-services');

  let currentUrl = page.url();
  console.log(`  내 서비스 목록 URL: ${currentUrl}`);

  // Look for edit link on the page
  const editLink = await page.evaluate((gigId) => {
    const links = Array.from(document.querySelectorAll('a'));
    for (const a of links) {
      const href = a.href || '';
      if (href.includes(gigId) && (href.includes('edit') || href.includes('수정'))) return href;
    }
    // Also check for any service management links
    for (const a of links) {
      const href = a.href || '';
      if (href.includes(gigId)) return href;
    }
    return null;
  }, GIG_ID);

  if (editLink) {
    console.log(`  편집 링크 발견: ${editLink}`);
    await page.goto(editLink, { waitUntil: 'networkidle2', timeout: 30000 });
  } else {
    // Try direct URLs
    for (const url of editUrls) {
      console.log(`  시도: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
      await sleep(1500);
      currentUrl = page.url();
      // If we didn't get redirected away, this might be correct
      if (currentUrl.includes('edit') || currentUrl.includes('service')) {
        console.log(`  → ${currentUrl}`);
        break;
      }
    }
  }

  await screenshot(page, '02-service-edit');

  // Dump page info for debugging
  const pageInfo = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    visibleText: document.body.innerText.slice(0, 2000),
    links: Array.from(document.querySelectorAll('a')).slice(0, 30).map(a => ({ href: a.href, text: (a.innerText || '').trim().slice(0, 50) })),
    inputs: Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({ name: i.name, accept: i.accept, id: i.id })),
    buttons: Array.from(document.querySelectorAll('button')).slice(0, 20).map(b => (b.innerText || '').trim().slice(0, 50))
  }));

  fs.writeFileSync(path.join(DEBUG_DIR, 'upload-02-page-info.json'), JSON.stringify(pageInfo, null, 2));
  console.log(`  페이지 제목: ${pageInfo.title}`);
  console.log(`  파일 입력: ${pageInfo.inputs.length}개`);
  console.log(`  버튼: ${pageInfo.buttons.filter(b => b).join(', ').slice(0, 100)}`);

  return pageInfo;
}

// ─── Upload Images ───────────────────────────────────────

async function uploadImages(page, pageInfo) {
  console.log('[3] 이미지 업로드...');

  const mainFiles = ['main-01.png', 'main-02.png'].map(f => path.join(IMAGES, f)).filter(f => fs.existsSync(f));
  const detailFiles = ['detail-01.png', 'detail-02.png', 'detail-03.png', 'detail-04.png', 'detail-05.png'].map(f => path.join(IMAGES, f)).filter(f => fs.existsSync(f));

  console.log(`  메인 이미지: ${mainFiles.length}장`);
  console.log(`  상세 이미지: ${detailFiles.length}장`);

  // Find file inputs on the page
  const fileInputs = await page.$$('input[type="file"]');
  if (fileInputs.length > 0) {
    console.log(`  파일 입력 ${fileInputs.length}개 발견`);

    // Usually first file input = main images, second = detail images
    // But we need to check the context
    for (let i = 0; i < fileInputs.length; i++) {
      const inputInfo = await page.evaluate(el => {
        const parent = el.closest('div, section, label');
        const label = parent ? (parent.innerText || '').trim().slice(0, 100) : '';
        return { name: el.name, accept: el.accept, multiple: el.multiple, label };
      }, fileInputs[i]);
      console.log(`  input[${i}]: name=${inputInfo.name} accept=${inputInfo.accept} multiple=${inputInfo.multiple} context="${inputInfo.label}"`);
    }

    // Try uploading to the first file input (main images)
    if (fileInputs.length >= 1 && mainFiles.length > 0) {
      console.log('  → 메인 이미지 업로드 중...');
      await fileInputs[0].uploadFile(...mainFiles);
      await sleep(3000);
      await screenshot(page, '03-after-main-upload');
      console.log('  ✓ 메인 이미지 업로드 완료');
    }

    // Upload detail images
    if (fileInputs.length >= 2 && detailFiles.length > 0) {
      console.log('  → 상세 이미지 업로드 중...');
      await fileInputs[1].uploadFile(...detailFiles);
      await sleep(3000);
      await screenshot(page, '03-after-detail-upload');
      console.log('  ✓ 상세 이미지 업로드 완료');
    }
  } else {
    // No file inputs found - look for upload buttons/areas
    console.log('  파일 입력 없음 — 업로드 영역 탐색...');

    // Try clicking upload buttons to trigger file inputs
    const uploadTriggered = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div, label'));
      for (const b of btns) {
        const text = (b.innerText || '').trim();
        if (/이미지.*등록|이미지.*추가|사진.*등록|파일.*선택|업로드/.test(text)) {
          return { found: true, text: text.slice(0, 50) };
        }
      }
      return { found: false };
    });

    if (uploadTriggered.found) {
      console.log(`  업로드 버튼 발견: "${uploadTriggered.text}"`);
    }

    await screenshot(page, '03-no-file-input');
  }

  return true;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log('=== 크몽 이미지 업로드 ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await login(page);
    const pageInfo = await navigateToServiceEdit(page);
    await uploadImages(page, pageInfo);

    await screenshot(page, '04-final');
    console.log('\n=== 완료 ===');
  } catch (err) {
    console.error(`\n✗ 에러: ${err.message}`);
    if (DEBUG) console.error(err.stack);
  } finally {
    await browser.close();
  }
}

main();
