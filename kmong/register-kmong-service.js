#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const DEBUG_DIR = path.join(ROOT, '05_assets', 'kmong', 'debug');

function getArg(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] || fallback;
}

async function ensureDebugDir() {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

async function clickByText(page, selector, pattern) {
  const handles = await page.$$(selector);
  for (const handle of handles) {
    const text = await page.evaluate((el) => (el.innerText || el.textContent || '').trim(), handle);
    if (pattern.test(text)) {
      await handle.click();
      return true;
    }
  }
  return false;
}

async function clickVisible(page, handle) {
  if (!handle) {
    return false;
  }

  const isVisible = await page.evaluate((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }, handle);

  if (!isVisible) {
    return false;
  }

  await handle.click();
  return true;
}

async function dumpElements(page, filename) {
  const snapshot = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, textarea, select, button, a'))
      .map((el) => ({
        tag: el.tagName,
        id: el.id || '',
        name: el.getAttribute('name') || '',
        type: el.getAttribute('type') || '',
        placeholder: el.getAttribute('placeholder') || '',
        text: (el.innerText || el.textContent || '').trim(),
        href: el.href || ''
      }))
      .filter((entry) => entry.placeholder || entry.name || entry.text);
  });

  const filePath = path.join(DEBUG_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  console.log(`Saved ${filePath}`);
}

async function login(page) {
  const email = process.env.KMONG_EMAIL;
  const password = process.env.KMONG_PASSWORD;
  const mfaCode = process.env.KMONG_MFA_CODE;

  if (!email || !password) {
    throw new Error('KMONG_EMAIL and KMONG_PASSWORD must be set');
  }

  await page.goto('https://kmong.com/', { waitUntil: 'networkidle2', timeout: 60000 });

  const clickedLogin = await clickByText(page, 'button, a', /로그인/);
  if (!clickedLogin) {
    throw new Error('Login trigger not found');
  }

  await page.waitForNetworkIdle({ idleTime: 500, timeout: 20000 }).catch(() => {});
  await page.waitForSelector('input', { timeout: 20000 });

  const emailSelector = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('input'));
    const match = candidates.find((el) => {
      const name = (el.getAttribute('name') || '').toLowerCase();
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const type = (el.getAttribute('type') || '').toLowerCase();
      return type === 'email' || name.includes('email') || placeholder.includes('이메일') || placeholder.includes('email');
    });
    return match ? match.outerHTML : '';
  });

  if (!emailSelector) {
    throw new Error('Email input not found');
  }

  const inputHandles = await page.$$('input');
  let emailHandle = null;
  let passwordHandle = null;

  for (const handle of inputHandles) {
    const meta = await page.evaluate((el) => ({
      type: (el.getAttribute('type') || '').toLowerCase(),
      name: (el.getAttribute('name') || '').toLowerCase(),
      placeholder: (el.getAttribute('placeholder') || '').toLowerCase()
    }), handle);

    if (!emailHandle && (meta.type === 'email' || meta.name.includes('email') || meta.placeholder.includes('이메일') || meta.placeholder.includes('email'))) {
      emailHandle = handle;
      continue;
    }

    if (!passwordHandle && (meta.type === 'password' || meta.name.includes('password') || meta.placeholder.includes('비밀번호') || meta.placeholder.includes('password'))) {
      passwordHandle = handle;
    }
  }

  if (!emailHandle || !passwordHandle) {
    throw new Error('Email/password inputs not found');
  }

  await emailHandle.click({ clickCount: 3 });
  await emailHandle.type(email, { delay: 35 });
  await passwordHandle.click({ clickCount: 3 });
  await passwordHandle.type(password, { delay: 35 });

  const submitHandle = await page.$('button[type="submit"]');
  let submitted = await clickVisible(page, submitHandle);

  if (!submitted) {
    submitted = await clickByText(page, 'button', /로그인|계속|확인/);
  }

  if (!submitted) {
    throw new Error('Login submit button not found');
  }

  await page.waitForNetworkIdle({ idleTime: 800, timeout: 30000 }).catch(() => {});

  if (mfaCode) {
    const needsMfa = await page.evaluate(() => /인증 코드를 입력|새로운 기기에서 로그인/.test(document.body.innerText));
    if (needsMfa) {
      const inputHandles = await page.$$('input');
      let mfaInput = null;

      for (const handle of inputHandles) {
        const meta = await page.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            placeholder: (el.getAttribute('placeholder') || '').toLowerCase(),
            visible: style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
          };
        }, handle);

        if (meta.visible && /입력|code|인증/.test(meta.placeholder)) {
          mfaInput = handle;
          break;
        }
      }

      if (!mfaInput) {
        throw new Error('MFA input not found');
      }

      await mfaInput.click({ clickCount: 3 });
      await mfaInput.type(mfaCode, { delay: 35 });

      const verifySubmitted = await clickByText(page, 'button', /인증하기/);
      if (!verifySubmitted) {
        throw new Error('MFA submit button not found');
      }

      await page.waitForNetworkIdle({ idleTime: 800, timeout: 30000 }).catch(() => {});
    }
  }

  await page.screenshot({ path: path.join(DEBUG_DIR, 'after-login.png'), fullPage: true });
  console.log(`Logged in URL: ${page.url()}`);
}

async function inspectLoginMode(page) {
  await page.goto('https://kmong.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  const clickedLogin = await clickByText(page, 'button, a', /로그인/);
  if (!clickedLogin) {
    throw new Error('Login trigger not found');
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  await page.screenshot({ path: path.join(DEBUG_DIR, 'login-modal.png'), fullPage: true });
  await dumpElements(page, 'login-elements.json');
}

async function inspectSellerMode(page) {
  await login(page);
  await dumpElements(page, 'after-login-elements.json');
  await page.goto('https://kmong.com/seller/become-a-seller', { waitUntil: 'networkidle2', timeout: 60000 });

  let popupUrl = '';
  page.browser().once('targetcreated', async (target) => {
    try {
      const popupPage = await target.page();
      if (popupPage) {
        await popupPage.waitForNetworkIdle({ idleTime: 800, timeout: 15000 }).catch(() => {});
        popupUrl = popupPage.url();
      }
    } catch (error) {
      popupUrl = `popup-error:${error.message}`;
    }
  });

  const started = await clickByText(page, 'button, a', /전문가 등록하기/);
  if (started) {
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 30000 }).catch(() => {});
  }

  fs.writeFileSync(path.join(DEBUG_DIR, 'seller-entry-state.json'), JSON.stringify({
    url: page.url(),
    popupUrl
  }, null, 2));

  await page.screenshot({ path: path.join(DEBUG_DIR, 'seller-entry.png'), fullPage: true });
  await dumpElements(page, 'seller-entry-elements.json');
}

async function debugLoginMode(page) {
  const events = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (!/login|auth|session|signin|seller|user/i.test(url)) {
      return;
    }

    const event = {
      url,
      status: response.status(),
      method: response.request().method()
    };

    if (/kid\.kmong\.com\/api\/authentication/i.test(url)) {
      try {
        event.body = await response.text();
      } catch (error) {
        event.body = `Failed to read body: ${error.message}`;
      }
    }

    events.push(event);
  });

  await login(page);

  const cookies = await page.cookies();
  const visibleText = await page.evaluate(() => document.body.innerText.slice(0, 3000));

  fs.writeFileSync(path.join(DEBUG_DIR, 'login-network.json'), JSON.stringify(events, null, 2));
  fs.writeFileSync(path.join(DEBUG_DIR, 'login-cookies.json'), JSON.stringify(cookies, null, 2));
  fs.writeFileSync(path.join(DEBUG_DIR, 'login-visible-text.txt'), visibleText);
  console.log(`Saved ${path.join(DEBUG_DIR, 'login-network.json')}`);
  console.log(`Saved ${path.join(DEBUG_DIR, 'login-cookies.json')}`);
  console.log(`Saved ${path.join(DEBUG_DIR, 'login-visible-text.txt')}`);
}

async function main() {
  await ensureDebugDir();

  const mode = getArg('--mode', 'inspect-login');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });

    if (mode === 'inspect-login') {
      await inspectLoginMode(page);
      return;
    }

    if (mode === 'inspect-seller') {
      await inspectSellerMode(page);
      return;
    }

    if (mode === 'debug-login') {
      await debugLoginMode(page);
      return;
    }

    throw new Error(`Unsupported mode: ${mode}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
