#!/usr/bin/env node
/**
 * generate-textbook-pdf.js — 교재 HTML → PDF 변환
 *
 * Usage:
 *   node 04_scripts/generate-textbook-pdf.js grammar-bridge-ch02
 *   node 04_scripts/generate-textbook-pdf.js all
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');

const bookId = process.argv[2];
if (!bookId) {
  console.error('Usage: node generate-textbook-pdf.js <bookId|all>');
  process.exit(1);
}

(async () => {
  try {
    if (bookId === 'all') {
      const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));
      for (const f of files) {
        const id = f.replace('.html', '');
        await generatePDF(id);
      }
    } else {
      await generatePDF(bookId);
    }
  } catch (err) {
    console.error('PDF generation failed:', err.message);
    process.exit(1);
  }
})();

async function generatePDF(id) {
  const htmlPath = path.join(HTML_DIR, `${id}.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`  ❌ HTML not found: ${htmlPath}`);
    console.error(`     Run 'node 04_scripts/assemble.js --book ${id}' first.`);
    return;
  }

  console.log(`\n📄 Generating PDF: ${id}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const fileUrl = 'file://' + htmlPath;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 180000 });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  // 페이지 넘버 오버플로우 방지: 297mm를 초과하는 페이지의 푸터를 자동 숨김
  const hidden = await page.evaluate(() => {
    // 297mm를 현재 렌더링 컨텍스트의 px로 정확히 변환
    const ruler = document.createElement('div');
    ruler.style.width = '297mm';
    ruler.style.position = 'absolute';
    ruler.style.visibility = 'hidden';
    document.body.appendChild(ruler);
    const targetHeight = ruler.getBoundingClientRect().width; // 297mm in px
    document.body.removeChild(ruler);

    let count = 0;
    document.querySelectorAll('.page').forEach(pageEl => {
      const actual = pageEl.getBoundingClientRect().height;
      if (actual > targetHeight + 5) { // 5px tolerance
        const footer = pageEl.querySelector('.page-footer');
        if (footer) {
          footer.style.display = 'none';
          count++;
        }
      }
    });
    return count;
  });
  if (hidden > 0) {
    console.log(`  ℹ️  ${hidden}개 페이지에서 오버플로우 푸터 자동 숨김`);
  }

  fs.mkdirSync(PDF_DIR, { recursive: true });
  const pdfPath = path.join(PDF_DIR, `${id}.pdf`);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`  ✅ PDF: ${pdfPath}`);
}
