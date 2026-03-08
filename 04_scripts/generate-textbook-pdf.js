#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');
const LEGACY_OUTPUT_HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const LEGACY_OUTPUT_PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');

async function captureStaticHtml(page) {
  return page.evaluate(() => {
    const clonedDoc = document.documentElement.cloneNode(true);
    const flowRoot = clonedDoc.querySelector('#textbook-flow-root');
    if (flowRoot) {
      flowRoot.remove();
    }
    clonedDoc.querySelectorAll('script').forEach((script) => script.remove());
    clonedDoc.setAttribute('data-textbook-ready', 'true');
    return `<!DOCTYPE html>\n${clonedDoc.outerHTML}`;
  });
}

function generateSyntaxBasicPreview() {
  execFileSync('node', [path.join(ROOT, '04_scripts', 'preview-syntax-basic.js')], {
    cwd: ROOT,
    stdio: 'inherit'
  });

  const previewHtmlPath = path.join(LEGACY_OUTPUT_HTML_DIR, 'syntax-basic-preview.html');
  const previewPdfPath = path.join(LEGACY_OUTPUT_PDF_DIR, 'syntax-basic-preview.pdf');
  if (!fs.existsSync(previewHtmlPath) || !fs.existsSync(previewPdfPath)) {
    throw new Error('syntax-basic preview output missing after preview generation');
  }

  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.copyFileSync(previewHtmlPath, path.join(HTML_DIR, 'syntax-basic.html'));
  fs.copyFileSync(previewPdfPath, path.join(PDF_DIR, 'syntax-basic.pdf'));
  console.log(`  ✅ HTML: ${path.join(HTML_DIR, 'syntax-basic.html')}`);
  console.log(`  ✅ PDF: ${path.join(PDF_DIR, 'syntax-basic.pdf')}`);
}

async function generatePdf(bookId) {
  if (bookId === 'syntax-basic') {
    generateSyntaxBasicPreview();
    return;
  }

  const htmlPath = path.join(HTML_SRC_DIR, `${bookId}.html`);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML not found: ${htmlPath}`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 180000
    });
    await page.waitForFunction(() => window.__TEXTBOOK_READY__ === true, {
      timeout: 180000
    });

    const paginationErrors = await page.evaluate(() => window.__TEXTBOOK_PAGINATION_ERRORS__ || []);
    if (paginationErrors.length) {
      throw new Error(`Pagination errors detected: ${JSON.stringify(paginationErrors, null, 2)}`);
    }

    const staticHtml = await captureStaticHtml(page);
    fs.mkdirSync(HTML_DIR, { recursive: true });
    const finalHtmlPath = path.join(HTML_DIR, `${bookId}.html`);
    fs.writeFileSync(finalHtmlPath, staticHtml, 'utf8');

    fs.mkdirSync(PDF_DIR, { recursive: true });
    const pdfPath = path.join(PDF_DIR, `${bookId}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 180000
    });

    console.log(`  ✅ HTML: ${finalHtmlPath}`);
    console.log(`  ✅ PDF: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Usage: node 04_scripts/generate-textbook-pdf.js <bookId|all>');
    process.exit(1);
  }

  const bookId = args[0];
  if (bookId === 'all') {
    const files = fs.readdirSync(HTML_SRC_DIR).filter((file) => file.endsWith('.html'));
    const failures = [];
    for (const file of files) {
      const currentId = file.replace(/\.html$/, '');
      console.log(`\n📄 Generating PDF: ${currentId}`);
      try {
        await generatePdf(currentId);
      } catch (error) {
        failures.push({ bookId: currentId, message: error.message });
        console.error(`  ❌ Failed: ${currentId}`);
        console.error(`     ${error.message}`);
      }
    }
    if (failures.length) {
      throw new Error(`Batch PDF generation failed for ${failures.length} books`);
    }
    return;
  }

  console.log(`\n📄 Generating PDF: ${bookId}`);
  await generatePdf(bookId);
}

main().catch((error) => {
  console.error('PDF generation failed:', error.message);
  process.exit(1);
});
