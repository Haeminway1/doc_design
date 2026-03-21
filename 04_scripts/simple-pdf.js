#!/usr/bin/env node
/**
 * simple-pdf.js — Lightweight HTML → PDF generator
 * Uses Playwright's Chromium via Puppeteer-core
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');

const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';

async function main() {
  const bookId = process.argv[2];
  if (!bookId) {
    console.error('Usage: node 04_scripts/simple-pdf.js <bookId>');
    process.exit(1);
  }

  const htmlPath = path.join(HTML_DIR, `${bookId}.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  console.log(`📄 Generating PDF: ${bookId}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 2000));

    fs.mkdirSync(PDF_DIR, { recursive: true });
    const pdfPath = path.join(PDF_DIR, `${bookId}.pdf`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 60000
    });

    console.log(`  ✅ PDF: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('PDF generation failed:', err.message);
  process.exit(1);
});
