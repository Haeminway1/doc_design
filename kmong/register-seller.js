#!/usr/bin/env node
/**
 * register-seller.js
 * 크몽 전문가 등록 플로우 탐색 + 서비스 생성
 * 저장된 세션 쿠키 재사용
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname);
const DEBUG = path.join(ROOT, 'debug');
fs.mkdirSync(DEBUG, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function clickText(page, sel, pat) {
  const els = await page.$$(sel);
  for (const el of els) {
    const t = await page.evaluate(e => (e.innerText || '').trim(), el);
    if (pat.test(t)) { await el.click(); return true; }
  }
  return false;
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(DEBUG, `reg-${name}.png`), fullPage: true });
  console.log(`  [screenshot] reg-${name}.png`);
}

async function dumpPage(page, name) {
  const info = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.body.innerText.slice(0, 3000),
    inputs: Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
      tag: el.tagName, type: el.type, name: el.name, placeholder: el.placeholder,
      id: el.id, value: el.value, visible: el.offsetWidth > 0
    })).filter(i => i.visible),
    buttons: Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim().slice(0, 60)).filter(Boolean),
    fileInputs: Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
      name: el.name, accept: el.accept, id: el.id, multiple: el.multiple
    }))
  }));
  fs.writeFileSync(path.join(DEBUG, `reg-${name}.json`), JSON.stringify(info, null, 2));
  return info;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Load saved cookies
  const cookiePath = path.join(DEBUG, 'session-cookies.json');
  if (fs.existsSync(cookiePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
    await page.setCookie(...cookies);
    console.log('[1] 세션 쿠키 로드 완료');
  } else {
    console.error('세션 쿠키 없음. 먼저 explore-seller.js 실행');
    process.exit(1);
  }

  // Go to become-a-seller
  console.log('[2] 전문가 등록 페이지 이동...');
  await page.goto('https://kmong.com/seller/become-a-seller', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  await shot(page, '01-become-seller');

  // Click "전문가 등록하기" button
  console.log('[3] 전문가 등록하기 클릭...');
  const clicked = await clickText(page, 'button, a', /전문가 등록하기|전문가 시작/);
  if (clicked) {
    console.log('  ✓ 버튼 클릭');
    await sleep(3000);

    // Handle new tab if opened
    const pages = await browser.pages();
    const activePage = pages[pages.length - 1];
    if (activePage !== page) {
      console.log('  새 탭 열림:', activePage.url());
      await activePage.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
      await sleep(1000);
      await activePage.screenshot({ path: path.join(DEBUG, 'reg-02-newtab.png'), fullPage: true });
      const info = await dumpPage(activePage, '02-newtab');
      console.log('  URL:', info.url);
      console.log('  제목:', info.title);
      console.log('  입력:', info.inputs.length, '개');
      console.log('  버튼:', info.buttons.join(', ').slice(0, 200));
    } else {
      await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
      await shot(page, '02-after-click');
      const info = await dumpPage(page, '02-after-click');
      console.log('  URL:', info.url);
      console.log('  제목:', info.title);
      console.log('  입력:', info.inputs.length, '개');
      console.log('  버튼:', info.buttons.join(', ').slice(0, 200));
      console.log('  파일입력:', info.fileInputs.length, '개');

      // If it's a registration form, dump the visible text
      if (info.inputs.length > 0) {
        console.log('\n  === 페이지 텍스트 ===');
        console.log(info.text.slice(0, 1500));
      }
    }
  } else {
    console.log('  ✗ 버튼 못 찾음');
    const info = await dumpPage(page, '01-no-button');
    console.log('  버튼 목록:', info.buttons.join(', '));
  }

  await browser.close();
  console.log('\nDone');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
