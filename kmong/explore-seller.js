#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname);
const DEBUG = path.join(ROOT, 'debug');
fs.mkdirSync(DEBUG, { recursive: true });

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^(\w+)=(.+)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const EMAIL = process.env.KMONG_EMAIL;
const PASSWORD = process.env.KMONG_PASSWORD;
const MFA = process.argv[2] || '';

if (!MFA) { console.error('Usage: node explore-seller.js <MFA_CODE>'); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function clickText(page, sel, pat) {
  const els = await page.$$(sel);
  for (const el of els) {
    const t = await page.evaluate(e => (e.innerText || '').trim(), el);
    if (pat.test(t)) { await el.click(); return true; }
  }
  return false;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 1. Login
  console.log('[1] 로그인...');
  await page.goto('https://kmong.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  await clickText(page, 'button, a', /^로그인$/);
  await page.waitForSelector('input', { timeout: 15000 });
  await sleep(1000);

  // Find email/pw inputs specifically by type
  const emailSel = 'input[type="email"], input[name*="email"], input[placeholder*="이메일"]';
  const pwSel = 'input[type="password"]';

  await page.waitForSelector(emailSel, { timeout: 10000 });
  await page.click(emailSel, { clickCount: 3 });
  await page.type(emailSel, EMAIL, { delay: 20 });
  await page.click(pwSel, { clickCount: 3 });
  await page.type(pwSel, PASSWORD, { delay: 20 });

  const submit = await page.$('button[type="submit"]');
  if (submit) await submit.click();
  else await clickText(page, 'button', /로그인/);

  // Wait for MFA modal to appear
  console.log('[2] MFA 모달 대기...');
  await sleep(4000);
  await page.screenshot({ path: path.join(DEBUG, 'mfa-modal.png') });

  // Find the MFA input: look for input inside a modal/dialog overlay
  // The MFA input should be near "인증 코드" or "입력해 주세요" text
  const mfaFound = await page.evaluate((code) => {
    // Strategy: find all visible text inputs that are NOT the search bar
    const inputs = Array.from(document.querySelectorAll('input'));
    for (const inp of inputs) {
      const rect = inp.getBoundingClientRect();
      const style = window.getComputedStyle(inp);
      if (rect.width === 0 || style.display === 'none' || style.visibility === 'hidden') continue;
      if (inp.type === 'email' || inp.type === 'password' || inp.type === 'hidden') continue;

      // Check if this input is inside a modal/overlay (z-index, position fixed/absolute parent)
      let parent = inp.parentElement;
      let isModal = false;
      while (parent) {
        const ps = window.getComputedStyle(parent);
        const z = parseInt(ps.zIndex);
        if ((ps.position === 'fixed' || ps.position === 'absolute') && z > 100) {
          isModal = true;
          break;
        }
        // Also check for common modal classes/roles
        if (parent.getAttribute('role') === 'dialog' || parent.classList.toString().match(/modal|overlay|dialog|popup/i)) {
          isModal = true;
          break;
        }
        parent = parent.parentElement;
      }

      if (isModal) {
        // This is likely the MFA input
        inp.focus();
        inp.value = '';
        // Use native input setter to trigger React state
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inp, code);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        return { found: true, placeholder: inp.placeholder, isModal: true };
      }
    }

    // Fallback: find input near "인증" text
    const allText = document.body.innerText;
    if (/인증 코드|인증코드/.test(allText)) {
      // Find the input closest to the verification text
      for (const inp of inputs) {
        const rect = inp.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (inp.type === 'email' || inp.type === 'password' || inp.type === 'hidden') continue;
        const placeholder = inp.placeholder || '';
        if (/입력|코드|인증/.test(placeholder) || (rect.y > 200 && rect.y < 600)) {
          inp.focus();
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(inp, code);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return { found: true, placeholder, isModal: false, fallback: true };
        }
      }
    }

    return { found: false };
  }, MFA);

  console.log('  MFA result:', JSON.stringify(mfaFound));

  if (mfaFound.found) {
    await sleep(500);
    await clickText(page, 'button', /인증하기/);
    await sleep(5000);
  }

  await page.screenshot({ path: path.join(DEBUG, 'mfa-after.png') });
  console.log('  URL after MFA:', page.url());

  // Check login status
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  const loggedIn = !/로그인|회원가입/.test(bodyText.slice(0, 100)) || /마이페이지|내 서비스|전문가 등록/.test(bodyText);
  console.log('  로그인 성공:', loggedIn);

  if (loggedIn) {
    // 3. Explore seller pages
    console.log('[3] 셀러 페이지 탐색...');
    const urls = [
      'https://kmong.com/seller/become-a-seller',
      'https://kmong.com/seller/home',
      'https://kmong.com/seller/service',
      'https://kmong.com/seller/my-services',
      'https://kmong.com/my-page',
      'https://kmong.com/mypage',
      'https://kmong.com/mykmong',
    ];

    for (const url of urls) {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await sleep(1000);
      const title = await page.title();
      const cur = page.url();
      const is404 = title.includes('찾을 수 없습니다');
      console.log(`  ${is404 ? '✗' : '✓'} ${url.replace('https://kmong.com','')}`);
      console.log(`    → ${cur} [${title.slice(0, 60)}]`);
      if (is404 === false) {
        const safe = url.replace(/https?:\/\/kmong\.com\//, '').replace(/[^a-z0-9]/gi, '_');
        await page.screenshot({ path: path.join(DEBUG, `explore-${safe}.png`) });

        // Dump links from this page
        const pageLinks = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a'))
            .map(a => ({ href: a.href, text: (a.innerText||'').trim().slice(0,80) }))
            .filter(l => l.href.includes('kmong.com') && l.text)
            .slice(0, 30);
        });
        fs.writeFileSync(path.join(DEBUG, `explore-${safe}-links.json`), JSON.stringify(pageLinks, null, 2));
      }
    }

    // Save cookies for reuse
    const cookies = await page.cookies();
    fs.writeFileSync(path.join(DEBUG, 'session-cookies.json'), JSON.stringify(cookies, null, 2));
    console.log('[4] 세션 쿠키 저장 완료 (재사용 가능)');
  }

  await browser.close();
  console.log('\nDone');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
