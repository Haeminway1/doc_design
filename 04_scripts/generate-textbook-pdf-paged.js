#!/usr/bin/env node
/**
 * generate-textbook-pdf-paged.js — paged.js POC
 *
 * 기존 html_src HTML을 paged.js 호환 구조로 변환 → PDF 생성
 * 기존 커스텀 pagination 엔진을 paged.js로 대체하는 실험.
 *
 * Usage:
 *   node 04_scripts/generate-textbook-pdf-paged.js grammar-bridge-ch02
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const ROOT = path.resolve(__dirname, '..');
const HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');
const PAGED_JS_PATH = path.join(ROOT, 'node_modules', 'pagedjs', 'dist', 'paged.polyfill.js');

function shouldUseChunkedPaged(bookId) {
  return /^grammar-bridge-vol[12]-xd$/.test(String(bookId || ''));
}

function extractArtifactMeta($, el) {
  const $el = $(el);
  const cls = $el.attr('class') || '';
  const sid = $el.attr('data-section-id') || '';
  const title =
    $el.find('.chapter-opener-title').first().text().trim() ||
    $el.find('.xd-gb-shell__title').first().text().trim() ||
    $el.find('.xd-paged-section__title').first().text().trim() ||
    $el.find('.xd-gb-toc__title').first().text().trim() ||
    '';
  return {
    cls,
    sid,
    title,
    isChapter:
      ((/\bchapter-page\b/.test(cls) || /\bxd-paged-opener\b/.test(cls)) &&
        !(/\bchapter-page--practice\b/.test(cls) || /\bxd-paged-opener--practice\b/.test(cls)) &&
        !(/\bchapter-page--endmatter\b/.test(cls) || /\bxd-paged-opener--endmatter\b/.test(cls))),
    isPractice: /\bchapter-page--practice\b/.test(cls) || /\bxd-paged-opener--practice\b/.test(cls),
    isEndmatter: /\bchapter-page--endmatter\b/.test(cls) || /\bxd-paged-opener--endmatter\b/.test(cls),
    isCover: /\bcover-page\b/.test(cls) || /\bxd-paged-cover\b/.test(cls),
    isToc: /\btoc-page\b/.test(cls) || /\bxd-paged-section--toc\b/.test(cls),
    isIsolatedLegacy: /\bxd-paged-section--isolated\b/.test(cls),
    isAnswer: /answers-/i.test(sid),
    isExplanation: /explanations-/i.test(sid)
  };
}

function extractPagedArtifacts(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const bodyChildren = $('body').children().toArray();
  const artifacts = [];
  const scripts = [];

  for (let i = 0; i < bodyChildren.length; i += 1) {
    const el = bodyChildren[i];
    const $el = $(el);
    const cls = $el.attr('class') || '';
    const tag = el.tagName;

    if (tag === 'script') {
      scripts.push($.html(el));
      continue;
    }

    if (/\bxd-paged-running-source--left\b/.test(cls)) {
      const next = bodyChildren[i + 1];
      const content = bodyChildren[i + 2];
      if (next && content) {
        const nextCls = ($(next).attr('class') || '');
        if (/\bxd-paged-running-source--right\b/.test(nextCls) && content.tagName !== 'script') {
          artifacts.push({
            html: `${$.html(el)}\n${$.html(next)}\n${$.html(content)}`,
            ...extractArtifactMeta($, content)
          });
          i += 2;
          continue;
        }
      }
      continue;
    }

    artifacts.push({
      html: $.html(el),
      ...extractArtifactMeta($, el)
    });
  }

  return { $, artifacts, scripts };
}

function buildChunkPlan(artifacts) {
  const chunks = [];
  const firstChapterIndex = artifacts.findIndex((artifact) => artifact.isChapter);
  const endmatterIndex = artifacts.findIndex((artifact) => artifact.isEndmatter);
  const chapterStartIndexes = artifacts
    .map((artifact, index) => ({ artifact, index }))
    .filter(({ artifact, index }) => artifact.isChapter && (endmatterIndex === -1 || index < endmatterIndex))
    .map(({ index }) => index);

  if (firstChapterIndex > 0) {
    chunks.push({
      id: 'frontmatter',
      artifacts: artifacts.slice(0, firstChapterIndex)
    });
  }

  chapterStartIndexes.forEach((startIndex, idx) => {
    const nextIndex = chapterStartIndexes[idx + 1] ?? (endmatterIndex === -1 ? artifacts.length : endmatterIndex);
    const chapterArtifacts = artifacts.slice(startIndex, nextIndex);
    const practiceLocalIndex = chapterArtifacts.findIndex((artifact, localIndex) => localIndex > 0 && artifact.isPractice);

    if (practiceLocalIndex === -1) {
      if (chapterArtifacts.some((artifact, localIndex) => localIndex > 0 && artifact.isIsolatedLegacy)) {
        chunks.push({
          id: `chapter-opener-${idx + 1}`,
          artifacts: [chapterArtifacts[0]]
        });
        chapterArtifacts.slice(1).forEach((artifact, sectionIndex) => {
          chunks.push({
            id: `chapter-${idx + 1}-section-${String(sectionIndex + 1).padStart(2, '0')}`,
            artifacts: [artifact]
          });
        });
      } else {
        chunks.push({
          id: `chapter-${idx + 1}`,
          artifacts: chapterArtifacts
        });
      }
      return;
    }

    const practiceAbsoluteIndex = startIndex + practiceLocalIndex;
    const prePractice = artifacts.slice(startIndex, practiceAbsoluteIndex);
    const practiceArtifact = artifacts[practiceAbsoluteIndex];
    const postPractice = artifacts.slice(practiceAbsoluteIndex + 1, nextIndex);

    if (prePractice.length) {
      if (prePractice.some((artifact, localIndex) => localIndex > 0 && artifact.isIsolatedLegacy)) {
        chunks.push({
          id: `chapter-opener-${idx + 1}`,
          artifacts: [prePractice[0]]
        });
        prePractice.slice(1).forEach((artifact, sectionIndex) => {
          chunks.push({
            id: `chapter-${idx + 1}-section-${String(sectionIndex + 1).padStart(2, '0')}`,
            artifacts: [artifact]
          });
        });
      } else {
        chunks.push({
          id: `chapter-${idx + 1}`,
          artifacts: prePractice
        });
      }
    }

    chunks.push({
      id: `practice-opener-${idx + 1}`,
      artifacts: [practiceArtifact]
    });

    if (postPractice.length) {
      chunks.push({
        id: `practice-${idx + 1}`,
        artifacts: postPractice
      });
    }
  });

  if (endmatterIndex !== -1) {
    chunks.push({
      id: 'endmatter-opener',
      artifacts: [artifacts[endmatterIndex]]
    });
    const tail = artifacts.slice(endmatterIndex + 1);
    for (let i = 0; i < tail.length; i += 2) {
      chunks.push({
        id: `endmatter-${String((i / 2) + 1).padStart(2, '0')}`,
        artifacts: tail.slice(i, i + 2)
      });
    }
  }

  return chunks.filter((chunk) => chunk.artifacts.length);
}

function buildChunkHtml(baseHtml, artifactHtml, scripts) {
  const $ = cheerio.load(baseHtml, { decodeEntities: false });
  $('body').empty().append(`${artifactHtml.join('\n')}\n${scripts.join('\n')}`);
  return $.html();
}

async function renderPagedHtmlFile(browser, htmlPath, pdfPath, options = {}) {
  const page = await browser.newPage();
  try {
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 180000
    });

    await page.waitForFunction(() => window.__TEXTBOOK_READY__ === true, {
      timeout: 180000
    });

    await page.evaluate((hidePageNumbers) => {
      const fixedMarginSelectors = [
        '.pagedjs_margin-top',
        '.pagedjs_margin-bottom',
        '.pagedjs_margin-top-left-corner-holder',
        '.pagedjs_margin-top-right-corner-holder',
        '.pagedjs_margin-bottom-left-corner-holder',
        '.pagedjs_margin-bottom-right-corner-holder'
      ].join(',');
      const bottomSelectors = [
        '.pagedjs_margin-bottom',
        '.pagedjs_margin-bottom-left-corner-holder',
        '.pagedjs_margin-bottom-right-corner-holder'
      ].join(',');

      document.querySelectorAll('.pagedjs_page').forEach((pagedPage) => {
        if (hidePageNumbers) {
          pagedPage.querySelectorAll(bottomSelectors).forEach((node) => {
            node.style.visibility = 'hidden';
          });
        }
        if (!pagedPage.querySelector('.chapter-page, .xd-paged-opener, .cover-page, .toc-page, .xd-paged-section--toc')) {
          return;
        }
        pagedPage.querySelectorAll(fixedMarginSelectors).forEach((node) => {
          node.style.visibility = 'hidden';
        });
      });
    }, options.hidePageNumbers === true);

    await page.pdf({
      path: pdfPath,
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 180000
    });
  } finally {
    await page.close();
  }
}

async function mergePdfFiles(pdfPaths, outputPath) {
  const mergedPdf = await PDFDocument.create();
  const pageNumberFont = await mergedPdf.embedFont(StandardFonts.Helvetica);

  for (const pdfPath of pdfPaths) {
    const sourceBytes = fs.readFileSync(pdfPath);
    const sourcePdf = await PDFDocument.load(sourceBytes);
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((copiedPage) => mergedPdf.addPage(copiedPage));
  }

  mergedPdf.getPages().forEach((page, index) => {
    if (index === 0) {
      return;
    }
    const label = String(index + 1);
    const size = 7;
    const width = pageNumberFont.widthOfTextAtSize(label, size);
    const { width: pageWidth } = page.getSize();
    page.drawText(label, {
      x: (pageWidth - width) / 2,
      y: 12,
      size,
      font: pageNumberFont,
      color: rgb(0.61, 0.64, 0.69)
    });
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, await mergedPdf.save());
}

/**
 * CSS to inject for paged.js pagination.
 * Replaces the .page container model with CSS Paged Media rules.
 */
function getPagedCSS(options = {}) {
  const { extravagant = false } = options;
  if (extravagant) {
    return `
/* === paged.js overrides: extravagantdocs === */

.page,
.page--fixed,
.page--paginated,
.page.page--fixed,
.page.page--paginated {
  width: auto !important;
  min-height: auto !important;
  max-height: none !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  display: block !important;
  position: static !important;
  background: transparent !important;
  overflow: visible !important;
}

.page.page--fixed:not(.no-header-footer),
.page.page--paginated:not(.no-header-footer) {
  padding: 0 !important;
}

.page-header,
.page-footer {
  display: none !important;
}

.page-content,
.page.page--fixed:not(.no-header-footer) .page-content,
.page.page--paginated .page-content {
  display: block !important;
  overflow: visible !important;
  padding: 0 !important;
  flex: initial !important;
  min-height: auto !important;
}

.cover-page,
.legacy-page,
.paged-section {
  break-before: auto !important;
  page-break-before: auto !important;
}

.cover-page {
  break-after: auto !important;
  page-break-after: auto !important;
  min-height: 297mm !important;
  overflow: hidden !important;
}

.legacy-page {
  break-before: page !important;
  page-break-before: always !important;
  break-after: auto !important;
  page-break-after: auto !important;
}

.paged-section {
  break-before: page !important;
  page-break-before: always !important;
}

.paged-section--answers {
  break-after: page !important;
  page-break-after: always !important;
}

.paged-section__title {
  margin: 0 0 6mm !important;
  padding-bottom: 2mm !important;
  border-bottom: 0.35mm solid #d7d2c6 !important;
  font-size: 15pt !important;
  font-weight: 700 !important;
  color: #1b2a4a !important;
}

#textbook-pages,
#textbook-flow-root {
  display: none !important;
}

#paged-content {
  display: block !important;
}

.header-left-source,
.header-right-source {
  height: 0 !important;
  overflow: hidden !important;
}

.header-left-source {
  string-set: header-left content();
}

.header-right-source {
  string-set: header-right content();
}

.xd-gb-shell,
.xd-gb-shell__groups {
  display: block !important;
  min-height: auto !important;
  height: auto !important;
  flex: initial !important;
}

.xd-gb-group-spacer {
  display: none !important;
}

.xd-gb-cover--paged {
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

.cover-page .xd-gb-cover__overlay,
.xd-gb-cover--paged .xd-gb-cover__overlay {
  position: relative !important;
  inset: auto !important;
  margin-top: 0 !important;
  min-height: 297mm !important;
  padding: 24mm 18mm 22mm !important;
  display: flex !important;
  flex-direction: column !important;
}

.problem,
.passage,
.word-entry,
.explanation,
.answer-grid,
.concept-box,
.tip-box,
.warning-box,
.rule-box,
.comparison-table,
.grammar-table,
.example-block,
.xd-gb-formula-card,
.xd-gb-faq-card,
.xd-gb-focus-example {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.answer-grid {
  max-width: 160mm !important;
  margin: 0 auto !important;
}

.answer-grid-title {
  margin-bottom: 4mm !important;
}

.answer-grid-table {
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  gap: 3.2mm !important;
}

.answer-grid-item {
  display: grid !important;
  grid-template-columns: 1fr auto !important;
  align-items: center !important;
  gap: 2.2mm !important;
  min-height: 11.5mm !important;
  padding: 2mm 2.4mm !important;
  border: 0.3mm solid #d7d2c6 !important;
  background: #ffffff !important;
}

.xd-explanations-page {
  break-before: page !important;
  page-break-before: always !important;
}

.xd-explanations-page .page-content,
.xd-explanations-page {
  padding-bottom: 0 !important;
}

@page {
  size: A4;
  margin: 11mm 14mm 18mm 14mm;

  @top-left {
    content: string(header-left, first);
    font-size: 8pt;
    color: #6b7280;
    border-bottom: 0.3mm solid #d7d2c6;
    padding-bottom: 2mm;
    vertical-align: bottom;
  }

  @top-right {
    content: string(header-right, first);
    font-size: 8pt;
    color: #6b7280;
    border-bottom: 0.3mm solid #d7d2c6;
    padding-bottom: 2mm;
    vertical-align: bottom;
  }

  @bottom-center {
    content: counter(page);
    font-size: 7pt;
    color: #6b7280;
    border-top: 0.3mm solid #d7d2c6;
    padding-top: 2mm;
    vertical-align: top;
  }
}

@page :left {
  margin-left: 17mm;
  margin-right: 13mm;
}

@page :right {
  margin-left: 13mm;
  margin-right: 17mm;
}

@page :first {
  margin: 0;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
}

@media print {
  body {
    background: white !important;
  }
}
`;
  }

  return `
/* === paged.js overrides === */

/* Remove fixed-page container model — paged.js creates pages */
.page, .page--fixed, .page--paginated {
  width: auto !important;
  min-height: auto !important;
  max-height: none !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  page-break-after: auto !important;
  display: block !important;
  position: static !important;
  background: transparent !important;
  overflow: visible !important;
}

/* Re-apply page-content styles without flex */
.page-content {
  flex-grow: unset !important;
  display: block !important;
}

/* Hide manual header/footer — paged.js @page margin boxes handle these */
.page-header, .page-footer {
  display: none !important;
}

/* Flow root — make visible, remove hide */
#textbook-flow-root {
  display: block !important;
  visibility: visible !important;
  position: static !important;
  overflow: visible !important;
  width: auto !important;
  height: auto !important;
}

/* Flow sections — normal flow, page break between sections */
.flow-section {
  display: block !important;
  visibility: visible !important;
  position: static !important;
  break-before: page;
}

/* Fixed pages get break-before to start on new page */
.page--fixed {
  break-before: page;
}

/* Cover page — named page with no margins */
.cover-page {
  page: cover;
  break-before: auto; /* first page, no break-before needed */
  break-after: page;
}

/* Legacy pages — break-before only, no break-after (prevents blank pages) */
.legacy-page {
  break-before: page;
}

/* Last legacy page before flow content */
.legacy-page:last-of-type {
  break-after: auto;
}

/* Compact overrides via CSS variable + direct selectors.
   paged.js restructures DOM so #paged-content scoping breaks.
   Use :root variable overrides + high-specificity html selectors. */

:root {
  --space-2xl: 2px;
  --space-xl: 3px;
  --space-lg: 2px;
  --space-md: 2px;
  --space-sm: 1px;
  --space-xs: 0px;
  --text-base: 8.5pt;
  --text-md: 8.5pt;
  --text-sm: 7.5pt;
  --text-xs: 6.5pt;
  --leading-tight: 1.15;
  --leading-normal: 1.2;
  --leading-relaxed: 1.25;
  --choice-font-size: 7.5pt;
  --choice-gap: 0px;
  --passage-font-size: 8.5pt;
  --passage-line-height: 1.25;
}

/* Problems — ultra-compact (target: ~10 per page)
   Page area = 1020px. Target = 102px/problem.
   Current = 154px. Main cost: 5 choices in 2-col grid wrapping. */
html .problem {
  margin-bottom: 2px !important;
  padding: 2px 0 !important;
  border: none !important;
  border-bottom: 1px solid #eee !important;
  background: transparent !important;
}

html .problem-header {
  margin-bottom: 1px !important;
  gap: 3px !important;
}

html .problem-number {
  width: 16px !important;
  height: 16px !important;
  font-size: 7pt !important;
}

html .problem-type-badge {
  padding: 0px 3px !important;
  font-size: 6.5pt !important;
}

html .problem-stem {
  font-size: 8.5pt !important;
  line-height: 1.25 !important;
  margin-bottom: 1px !important;
}

html .problem-instruction {
  font-size: 7.5pt !important;
  margin-bottom: 1px !important;
}

html .problem-choices {
  font-size: 7.5pt !important;
  gap: 0px 4px !important;
  margin-top: 1px !important;
}

html .problem-choices li {
  padding: 0px 1px !important;
  line-height: 1.15 !important;
}

html .problem-choices li::before {
  width: 12px !important;
  height: 12px !important;
  font-size: 6pt !important;
  margin-top: 1px !important;
}

/* Answer grid — 5-column quick scan */
html .answer-grid-table {
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  max-width: 156mm !important;
  margin: 0 auto !important;
  gap: 3.2mm !important;
}

html .answer-grid-item {
  display: grid !important;
  grid-template-columns: 1fr auto !important;
  align-items: center !important;
  gap: 6px !important;
  min-height: 34px !important;
  padding: 6px 8px !important;
  font-size: 10pt !important;
  border: 1px solid #d7d2c6 !important;
  background: #ffffff !important;
}

html .answer-grid-number {
  font-size: 9.5pt !important;
}

html .answer-grid-answer {
  font-size: 11pt !important;
}

/* Explanation — compact */
html .explanation {
  margin-bottom: 6px !important;
  padding: 6px 8px !important;
}

html .explanation-header {
  margin-bottom: 3px !important;
}

html .explanation-body {
  font-size: 9.5pt !important;
  line-height: 1.35 !important;
}

html .explanation-body p {
  margin-bottom: 1.5mm !important;
}

/* === @page rules === */
@page {
  size: A4;
  margin: 12mm 13mm 15mm 13mm;

  @top-left {
    content: string(header-left, first);
    font-size: 8.5pt;
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 500;
    color: var(--color-accent-dark, #1E3A8A);
    border-bottom: 1px solid #E5E7EB;
    padding-bottom: 4px;
    vertical-align: bottom;
  }

  @top-right {
    content: string(header-right, first);
    font-size: 8.5pt;
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 500;
    color: var(--color-accent-dark, #1E3A8A);
    border-bottom: 1px solid #E5E7EB;
    padding-bottom: 4px;
    vertical-align: bottom;
  }

  @bottom-center {
    content: counter(page);
    font-size: 7.5pt;
    font-family: 'Noto Sans KR', sans-serif;
    color: #9CA3AF;
    border-top: 1px solid #E5E7EB;
    padding-top: 4px;
    vertical-align: top;
  }
}

/* 양면 인쇄 제본: 안쪽 마진 +5mm */
@page :left {
  margin-left: 13mm;
  margin-right: 18mm;
}
@page :right {
  margin-left: 18mm;
  margin-right: 13mm;
}

/* Cover page — full bleed, no header/footer */
@page cover {
  margin: 0;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
}

/* First page after cover — no header */
@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
}

/* Running header string sources */
.header-left-source {
  string-set: header-left content();
}
.header-right-source {
  string-set: header-right content();
}

/* Ensure cover fills the page */
.cover-page {
  display: flex !important;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.cover-layout {
  text-align: center;
}

/* Problem/component break rules — same as before */
.problem, .passage, .word-entry, .explanation, .answer-grid-block,
.concept-box, .tip-box, .warning-box, .rule-box,
.comparison-table, .grammar-table, .example-block {
  break-inside: avoid;
}

h1, h2, h3, h4 {
  break-after: avoid;
}

p, li {
  orphans: 3;
  widows: 3;
}

/* Print adjustments */
@media print {
  body {
    background: white !important;
  }
}
`;
}

function normalizeExtravagantCoverPage(pageHtml) {
  const $ = cheerio.load(pageHtml, { decodeEntities: false });
  const $cover = $('.cover-page').first();
  if (!$cover.length || !$cover.hasClass('xd-gb-cover')) {
    return pageHtml;
  }

  const artSrc = $cover.find('.xd-gb-cover__art').attr('src') || '';
  const brand = $cover.find('.xd-gb-cover__brand').text().trim();
  const label = $cover.find('.xd-gb-cover__label').text().trim();
  const title = $cover.find('.xd-gb-cover__title').text().trim();
  const edition = $cover.find('.xd-gb-cover__edition').text().trim();
  const background = artSrc ? ` style="background-image:url('${artSrc}');"` : '';

  return `
<div class="page page--fixed cover-page no-header-footer xd-gb-cover xd-gb-cover--paged"${background}>
  <div class="xd-gb-cover__overlay">
    <div class="xd-gb-cover__brand">${brand}</div>
    <div class="xd-gb-cover__rule"></div>
    <div class="xd-gb-cover__label">${label}</div>
    <div class="xd-gb-cover__title">${title}</div>
    <div class="xd-gb-cover__edition">${edition}</div>
  </div>
</div>
`;
}

/**
 * Transform existing html_src HTML into paged.js-compatible HTML.
 */
function transformForPagedJS(html, bookMeta) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const isExtravagant = $('body').hasClass('style-system-extravagantdocs');

  // 1. Remove the custom pagination script (the IIFE at the end)
  $('script').each((_, el) => {
    const text = $(el).html();
    if (text && text.includes('__TEXTBOOK_READY__')) {
      $(el).remove();
    }
  });

  // 2. Extract fixed pages from #textbook-pages
  const fixedPages = [];
  $('#textbook-pages .page--fixed').each((_, el) => {
    fixedPages.push($.html(el));
  });

  if (isExtravagant && fixedPages.length) {
    fixedPages[0] = normalizeExtravagantCoverPage(fixedPages[0]);
  }

  // 3. Extract flow sections from #textbook-flow-root
  const flowSections = [];
  $('#textbook-flow-root .flow-section').each((_, el) => {
    const $section = $(el);
    flowSections.push({
      html: $.html(el),
      headerLeft: $section.attr('data-header-left') || '',
      headerRight: $section.attr('data-header-right') || '',
      footerText: $section.attr('data-footer-text') || '',
      pageClass: $section.attr('data-page-class') || '',
      sectionId: $section.attr('data-section-id') || ''
    });
  });

  // 4. Clear body and rebuild
  $('body').empty();

  // 5. Add paged.js override CSS
  // Direct string replacement of CSS variables in the existing <style> tag.
  // Appending :root doesn't reliably win due to paged.js CSS processing.
  const existingStyle = $('style').first();
  if (existingStyle.length) {
    let css = existingStyle.html();

    if (!isExtravagant) {
      // Use regex replacements to avoid partial-match bugs.
      // Order: longer patterns first, use word boundaries via semicolon/colon context.
      const regexReplacements = [
      // CSS variable declarations (in :root blocks)
      [/--text-base:\s*10pt/g,           '--text-base: 8.5pt'],
      [/--text-base:\s*9\.5pt/g,         '--text-base: 8.5pt'],
      [/--text-md:\s*10\.5pt/g,          '--text-md: 8.5pt'],
      [/--text-md:\s*10pt/g,             '--text-md: 8.5pt'],
      [/--text-sm:\s*8\.5pt/g,           '--text-sm: 7.5pt'],
      [/--text-xs:\s*7\.5pt/g,           '--text-xs: 6.5pt'],
      [/--text-xs:\s*7pt/g,              '--text-xs: 6.5pt'],
      [/--leading-tight:\s*1\.35/g,      '--leading-tight: 1.15'],
      [/--leading-tight:\s*1\.3(?!\d)/g, '--leading-tight: 1.15'],
      [/--leading-normal:\s*1\.65/g,     '--leading-normal: 1.2'],
      [/--leading-normal:\s*1\.5(?!\d)/g,'--leading-normal: 1.2'],
      [/--leading-relaxed:\s*1\.75/g,    '--leading-relaxed: 1.25'],
      [/--leading-relaxed:\s*1\.7(?!\d)/g,'--leading-relaxed: 1.25'],
      [/--choice-font-size:\s*9\.5pt/g,  '--choice-font-size: 7.5pt'],
      [/--choice-font-size:\s*9pt/g,     '--choice-font-size: 7.5pt'],
      [/--choice-gap:\s*4px/g,           '--choice-gap: 0px'],
      [/--passage-font-size:\s*10pt/g,   '--passage-font-size: 8.5pt'],
      [/--passage-font-size:\s*9\.5pt/g, '--passage-font-size: 8.5pt'],
      [/--passage-line-height:\s*1\.85/g,'--passage-line-height: 1.25'],
      [/--passage-line-height:\s*1\.6(?!\d)/g, '--passage-line-height: 1.25'],
      [/--space-2xl:\s*32px/g,  '--space-2xl: 2px'],
      [/--space-xl:\s*24px/g,   '--space-xl: 3px'],
      [/--space-lg:\s*16px/g,   '--space-lg: 2px'],
      [/--space-md:\s*12px/g,   '--space-md: 2px'],
      [/--space-sm:\s*8px/g,    '--space-sm: 1px'],
      [/--space-xs:\s*4px/g,    '--space-xs: 0px'],

      // Literal font-size values (template CSS hardcodes these)
      [/font-size:\s*9\.5pt/g,  'font-size: 8.5pt'],
      [/font-size:\s*10pt/g,    'font-size: 8.5pt'],
      [/font-size:\s*10\.5pt/g, 'font-size: 8.5pt'],
      // Literal line-height values
      [/line-height:\s*1\.85/g, 'line-height: 1.25'],
      [/line-height:\s*1\.75/g, 'line-height: 1.25'],
      [/line-height:\s*1\.7(?!\d)/g, 'line-height: 1.25'],
      [/line-height:\s*1\.65/g, 'line-height: 1.2'],
      [/line-height:\s*1\.6(?!\d)/g, 'line-height: 1.2'],
      ];

      for (const [pattern, replacement] of regexReplacements) {
        css = css.replace(pattern, replacement);
      }
    }

    existingStyle.html(css + `\n/* === paged.js overrides === */\n${getPagedCSS({ extravagant: isExtravagant })}`);
  } else {
    $('head').append(`<style>${getPagedCSS({ extravagant: isExtravagant })}</style>`);
  }

  // 6. Create new content container
  const $content = $('<div id="paged-content"></div>');

  // 7. Add fixed pages (cover, legacy pages)
  fixedPages.forEach((pageHtml) => {
    $content.append(pageHtml);
  });

  // 8. Add flow sections with running header markers
  flowSections.forEach((section) => {
    // Add hidden elements for running headers
    const headerMarker = `
      <div class="header-left-source" style="height:0;overflow:hidden;">${section.headerLeft}</div>
      <div class="header-right-source" style="height:0;overflow:hidden;">${section.headerRight}</div>
    `;
    $content.append(headerMarker);

    // Add the section content (unwrap the flow-section wrapper)
    const $section = cheerio.load(section.html, { decodeEntities: false });
    const innerHtml = $section('.flow-section').html();
    const isAnswerSection = /answers-/i.test(section.sectionId) || section.headerRight === '정답';
    const isExplanationSection = /explanations-/i.test(section.sectionId) || section.headerRight === '해설';
    const sectionClasses = ['paged-section'];
    if (section.pageClass) {
      sectionClasses.push(section.pageClass);
    }
    if (isAnswerSection) {
      sectionClasses.push('paged-section--answers');
    }
    if (isExplanationSection) {
      sectionClasses.push('paged-section--explanations');
    }

    let sectionTitle = '';
    if (isAnswerSection) {
      sectionTitle = '빠른 정답';
    } else if (isExplanationSection) {
      sectionTitle = '상세 해설';
    }

    $content.append(`
      <section class="${sectionClasses.join(' ')}">
        ${sectionTitle ? `<h2 class="paged-section__title">${sectionTitle}</h2>` : ''}
        ${innerHtml}
      </section>
    `);
  });

  $('body').append($content);

  // 9. Add paged.js ready signal script
  $('body').append(`
    <script src="file://${PAGED_JS_PATH}"></script>
    <script>
      window.PagedConfig = window.PagedConfig || {};
      window.PagedConfig.auto = true;
      document.addEventListener('DOMContentLoaded', function() {
        // paged.js fires 'pagedjs' event when done, or we check the polyfill
        var checkReady = setInterval(function() {
          if (document.querySelector('.pagedjs_pages')) {
            clearInterval(checkReady);
            window.__TEXTBOOK_READY__ = true;
            document.documentElement.dataset.textbookReady = 'true';
            console.log('[paged.js] Pagination complete');
          }
        }, 200);
        // Timeout safety
        setTimeout(function() {
          clearInterval(checkReady);
          if (!window.__TEXTBOOK_READY__) {
            window.__TEXTBOOK_READY__ = true;
            console.warn('[paged.js] Timeout — proceeding anyway');
          }
        }, 120000);
      });
    </script>
  `);

  return $.html();
}

async function generatePdf(bookId) {
  console.log('  🔄 Building native paged HTML...');
  execFileSync('node', [path.join(ROOT, '04_scripts', 'build-textbook.js'), '--book', bookId, '--renderer', 'paged-native'], {
    cwd: ROOT,
    stdio: 'inherit'
  });

  const pagedHtmlPath = path.join(HTML_SRC_DIR, `${bookId}-paged-native.html`);
  if (!fs.existsSync(pagedHtmlPath)) {
    throw new Error(`Paged native HTML not found: ${pagedHtmlPath}`);
  }
  console.log(`  📝 Native paged HTML: ${pagedHtmlPath}`);

  console.log('  🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files'
    ]
  });

  try {
    fs.mkdirSync(PDF_DIR, { recursive: true });
    const pdfPath = path.join(PDF_DIR, `${bookId}-paged.pdf`);

    if (shouldUseChunkedPaged(bookId)) {
      const baseHtml = fs.readFileSync(pagedHtmlPath, 'utf8');
      const { artifacts, scripts } = extractPagedArtifacts(baseHtml);
      const chunks = buildChunkPlan(artifacts);
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${bookId}-paged-`));
      const chunkPdfPaths = [];

      console.log(`  🧩 Rendering ${chunks.length} paged chunks...`);
      for (const chunk of chunks) {
        const chunkHtmlPath = path.join(tmpDir, `${chunk.id}.html`);
        const chunkPdfPath = path.join(tmpDir, `${chunk.id}.pdf`);
        fs.writeFileSync(
          chunkHtmlPath,
          buildChunkHtml(baseHtml, chunk.artifacts.map((artifact) => artifact.html), scripts),
          'utf8'
        );
        await renderPagedHtmlFile(browser, chunkHtmlPath, chunkPdfPath, { hidePageNumbers: true });
        chunkPdfPaths.push(chunkPdfPath);
      }

      await mergePdfFiles(chunkPdfPaths, pdfPath);
      console.log(`  ✅ PDF: ${pdfPath}`);
    } else {
      await renderPagedHtmlFile(browser, pagedHtmlPath, pdfPath);
      console.log(`  ✅ PDF: ${pdfPath}`);
    }

    // Compare with original if it exists
    const originalPdfPath = path.join(PDF_DIR, `${bookId}.pdf`);
    if (fs.existsSync(originalPdfPath)) {
      const origSize = fs.statSync(originalPdfPath).size;
      const pagedSize = fs.statSync(pdfPath).size;
      console.log(`\n  📊 Comparison:`);
      console.log(`     Original: ${(origSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     paged.js: ${(pagedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     Ratio:    ${(pagedSize / origSize * 100).toFixed(1)}%`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const bookId = process.argv[2];
  if (!bookId) {
    console.error('Usage: node 04_scripts/generate-textbook-pdf-paged.js <bookId>');
    process.exit(1);
  }

  console.log(`\n📄 Generating PDF with paged.js: ${bookId}`);
  await generatePdf(bookId);
}

main().catch((error) => {
  console.error('PDF generation failed:', error.message);
  process.exit(1);
});
