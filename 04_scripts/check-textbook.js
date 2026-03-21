#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');

async function main() {
  const bookId = process.argv[2];
  if (!bookId) {
    console.error('Usage: node 04_scripts/check-textbook.js <bookId>');
    process.exit(1);
  }

  const htmlPath = path.join(HTML_DIR, `${bookId}.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML not found: ${htmlPath}`);
    process.exit(1);
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

    const report = await page.evaluate(() => {
      const firstSection = document.querySelector('.flow-section');
      const firstBlock = firstSection ? firstSection.querySelector('.flow-block') : null;
      const firstPage = document.querySelector('.page.page--paginated');
      const firstContent = firstPage ? firstPage.querySelector('.page-content') : null;

      function buildPageShell(section) {
        const pageEl = document.createElement('div');
        const extraClass = section.dataset.pageClass || '';
        pageEl.className = ['page', 'page--paginated', extraClass].filter(Boolean).join(' ');

        const header = document.createElement('div');
        header.className = 'page-header';
        header.appendChild(document.createElement('span'));
        header.appendChild(document.createElement('span'));

        const content = document.createElement('div');
        content.className = 'page-content';

        const footer = document.createElement('div');
        footer.className = 'page-footer';

        pageEl.appendChild(header);
        pageEl.appendChild(content);
        pageEl.appendChild(footer);

        return { pageEl, content };
      }

      let measuredContentHeight = null;
      let firstCloneScrollHeight = null;
      if (firstSection && firstBlock) {
        const shell = buildPageShell(firstSection);
        document.getElementById('textbook-pages').appendChild(shell.pageEl);
        shell.pageEl.style.display = 'flex';
        shell.pageEl.style.flexDirection = 'column';
        shell.content.style.flex = '1 1 auto';
        shell.content.style.minHeight = '0';
        shell.pageEl.querySelector('.page-footer').style.position = 'static';
        measuredContentHeight = shell.content.clientHeight;
        shell.content.appendChild(firstBlock.cloneNode(true));
        firstCloneScrollHeight = shell.content.scrollHeight;
        shell.pageEl.remove();
      }

      return {
        paginationErrors: window.__TEXTBOOK_PAGINATION_ERRORS__ || [],
        firstFlowSection: firstSection ? {
          sectionId: firstSection.dataset.sectionId,
          headerLeft: firstSection.dataset.headerLeft,
          headerRight: firstSection.dataset.headerRight,
          footerText: firstSection.dataset.footerText
        } : null,
        firstFlowBlockHeight: firstBlock ? firstBlock.getBoundingClientRect().height : null,
        measuredContentHeight,
        firstCloneScrollHeight,
        firstPaginatedPageHeight: firstPage ? firstPage.getBoundingClientRect().height : null,
        firstPageContentHeight: firstContent ? firstContent.getBoundingClientRect().height : null,
        firstPageContentScrollHeight: firstContent ? firstContent.scrollHeight : null
      };
    });

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
