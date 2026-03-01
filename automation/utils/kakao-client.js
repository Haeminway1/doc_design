'use strict';

const config = require('../config');
const { makeLogger } = require('./logger');

const log = makeLogger('kakao-client');

let browser = null;
let page = null;

/**
 * Connect to an existing Chrome instance via CDP.
 */
async function connect() {
  // puppeteer-core is optional — check before requiring
  let puppeteer;
  try {
    puppeteer = require('puppeteer-core');
  } catch (e) {
    throw new Error('puppeteer-core is not installed. Run: npm install puppeteer-core');
  }

  const wsUrl = `http://127.0.0.1:${config.KAKAO_CDP_PORT}/json/version`;
  const http = require('http');

  const wsEndpoint = await new Promise((resolve, reject) => {
    http.get(wsUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (err) {
          reject(new Error(`Failed to parse CDP response: ${err.message}`));
        }
      });
    }).on('error', reject);
  });

  browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  const pages = await browser.pages();
  page = pages.find(p => p.url().includes('kakao')) || pages[0];

  if (!page) {
    throw new Error('No matching Kakao page found in Chrome instance');
  }

  log.info(`Connected to Chrome. Active page: ${page.url()}`);
  return { browser, page };
}

/**
 * Get the list of students (chat room names) visible in the sidebar.
 */
async function getStudentList() {
  if (!page) await connect();

  const students = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="grid"] [role="row"] > li');
    return Array.from(items).map(li => {
      const nameEl = li.querySelector('strong.tit_info span.txt_name');
      return nameEl ? nameEl.textContent.trim() : null;
    }).filter(Boolean);
  });

  log.info(`Found ${students.length} students`);
  return students;
}

/**
 * Get recent chat messages for a specific student.
 * Returns array of { text, isImage, timestamp }
 */
async function getChatMessages(studentName) {
  if (!page) await connect();

  // Click the student's chat room
  await page.evaluate((name) => {
    const items = document.querySelectorAll('[role="grid"] [role="row"] > li');
    for (const li of items) {
      const nameEl = li.querySelector('strong.tit_info span.txt_name');
      if (nameEl && nameEl.textContent.includes(name)) {
        const link = li.querySelector('a.link_chat');
        if (link) link.click();
        return true;
      }
    }
    return false;
  }, studentName);

  // Wait for chat to load
  await page.waitForTimeout(2000);

  const messages = await page.evaluate(() => {
    const bubbles = document.querySelectorAll('[class*="bubble"]');
    return Array.from(bubbles).map(b => {
      const img = b.querySelector('img:not([role="presentation"])');
      const text = b.textContent.trim();
      return {
        text: text || '',
        isImage: !!img,
        imageSrc: img ? img.src : null,
        timestamp: Date.now(),
      };
    });
  });

  log.info(`Got ${messages.length} messages for ${studentName}`);
  return messages;
}

/**
 * Send a message to a student's chat room.
 */
async function sendMessage(studentName, text) {
  if (!page) await connect();

  // Ensure we're in the right chat room
  await getChatMessages(studentName);

  // Find and use the message input
  await page.evaluate((msg) => {
    const input = document.querySelector('[contenteditable="true"], textarea[class*="input"], input[class*="input"]');
    if (!input) throw new Error('Message input not found');
    input.focus();
    document.execCommand('insertText', false, msg);
  }, text);

  await page.waitForTimeout(300);

  // Submit
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  log.info(`Message sent to ${studentName}: ${text.substring(0, 30)}...`);
}

/**
 * Disconnect from Chrome.
 */
async function disconnect() {
  if (browser) {
    await browser.disconnect();
    browser = null;
    page = null;
  }
}

module.exports = { connect, getStudentList, getChatMessages, sendMessage, disconnect };
