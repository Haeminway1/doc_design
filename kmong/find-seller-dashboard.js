#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname);
const DEBUG = path.join(ROOT, 'debug');

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

  const cookies = JSON.parse(fs.readFileSync(path.join(DEBUG, 'session-cookies.json'), 'utf8'));
  await page.setCookie(...cookies);
  console.log('[1] 쿠키 로드');

  // Go to signup-seller and click 돌아가기
  console.log('[2] signup-seller → 돌아가기...');
  await page.goto('https://kmong.com/signup-seller', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  await clickText(page, 'button, a', /돌아가기/);
  await sleep(3000);
  await page.screenshot({ path: path.join(DEBUG, 'dash-01-after-back.png') });
  console.log('  → URL:', page.url());

  // Now try a broad set of seller URLs
  console.log('[3] URL 탐색...');
  const urls = [
    'https://kmong.com/seller-my',
    'https://kmong.com/seller-home',
    'https://kmong.com/seller/manage',
    'https://kmong.com/seller/gigs',
    'https://kmong.com/gigs/manage',
    'https://kmong.com/seller/profile',
    'https://kmong.com/my/services',
    'https://kmong.com/my/gigs',
    'https://kmong.com/seller/dashboard',
    'https://kmong.com/seller/order',
    'https://kmong.com/seller/orders',
    'https://kmong.com/seller/revenue',
    'https://kmong.com/mykmong/gig',
    'https://kmong.com/mykmong/service',
    // Direct service edit attempts
    'https://kmong.com/gig/751510/edit',
    'https://kmong.com/seller/gig/create',
    'https://kmong.com/seller/service/create',
    'https://kmong.com/seller/gig/new',
  ];

  for (const url of urls) {
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null);
    await sleep(500);
    const title = await page.title();
    const cur = page.url();
    const is404 = title.includes('찾을 수 없습니다') || cur.includes('404');
    if (!is404) {
      console.log(`  ✓ ${url.replace('https://kmong.com','')}`);
      console.log(`    → ${cur} [${title.slice(0, 60)}]`);
      const safe = url.replace('https://kmong.com/', '').replace(/[^a-z0-9]/gi, '_');
      await page.screenshot({ path: path.join(DEBUG, `dash-${safe}.png`) });
    }
  }

  // Also check: navigate to homepage and look for any seller-specific UI
  console.log('[4] 홈페이지에서 셀러 메뉴 확인...');
  await page.goto('https://kmong.com/', { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(1000);

  // Look for any user menu / profile dropdown
  const headerLinks = await page.evaluate(() => {
    const header = document.querySelector('header') || document.querySelector('nav') || document.body;
    return Array.from(header.querySelectorAll('a, button'))
      .map(el => ({ tag: el.tagName, href: el.href || '', text: (el.innerText || '').trim().slice(0, 60) }))
      .filter(l => l.text && l.text.length < 40);
  });
  console.log('  헤더 메뉴:', JSON.stringify(headerLinks.slice(0, 15), null, 2));

  // Try clicking user profile/icon area (top right)
  const profileClicked = await page.evaluate(() => {
    // Look for profile icon or user menu trigger
    const candidates = Array.from(document.querySelectorAll('button, a, div'));
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      // Top-right area
      if (rect.x > 1200 && rect.y < 80 && rect.width > 20 && rect.width < 100) {
        const text = (el.innerText || '').trim();
        if (text.length < 20 || /마이|MY|프로필|내/.test(text)) {
          el.click();
          return { clicked: true, text, x: rect.x, y: rect.y };
        }
      }
    }
    return { clicked: false };
  });
  console.log('  프로필 클릭:', JSON.stringify(profileClicked));

  if (profileClicked.clicked) {
    await sleep(1500);
    await page.screenshot({ path: path.join(DEBUG, 'dash-profile-menu.png') });
    const menuLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => ({ href: a.href, text: (a.innerText || '').trim().slice(0, 60) }))
        .filter(l => /seller|전문가|서비스|관리|마이|내\s|설정|대시보드|gig/i.test(l.href + l.text));
    });
    console.log('  메뉴 링크:', JSON.stringify(menuLinks, null, 2));
  }

  await browser.close();
  console.log('\nDone');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
