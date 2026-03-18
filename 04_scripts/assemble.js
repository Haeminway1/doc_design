#!/usr/bin/env node
/**
 * assemble.js — 교재 빌드 파이프라인
 * YAML 매니페스트 → 최종 HTML 조립
 *
 * Usage:
 *   node 04_scripts/assemble.js --book grammar-bridge-ch02
 *   node 04_scripts/assemble.js --book all
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content');
const OUTPUT_HTML = path.join(ROOT, '02_textbooks', 'output', 'html');
const STYLES_DIR = path.join(ROOT, '02_textbooks', 'styles');
const SYSTEM_DIR = path.join(ROOT, '03_system');

const CIRCLED = ['', '①', '②', '③', '④', '⑤'];

/**
 * Strip existing circled number or letter prefix from choice text.
 * Handles: "① approved", "(A) approved", "A. approved", "a) approved"
 */
function normalizeChoice(text) {
  return text
    .replace(/^[①②③④⑤]\s*/, '')
    .replace(/^\([A-Ea-e]\)\s*/, '')
    .replace(/^[A-Ea-e][.)]\s*/, '')
    .trim();
}

/**
 * Format answer value for display with circled numbers.
 * Handles: number (1→①), string number ("2"→②), letter ("B"→②), free-text (as-is)
 */
function formatAnswer(answer) {
  if (typeof answer === 'number' && CIRCLED[answer]) {
    return CIRCLED[answer];
  }
  if (typeof answer === 'string') {
    const num = parseInt(answer);
    if (!isNaN(num) && CIRCLED[num]) {
      return CIRCLED[num];
    }
    const LETTER_TO_NUM = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    if (LETTER_TO_NUM[answer.toUpperCase()]) {
      return CIRCLED[LETTER_TO_NUM[answer.toUpperCase()]];
    }
    return answer;
  }
  return String(answer || '?');
}

const LAYOUT_OVERRIDES = `
/* === assemble.js layout overrides === */

/* 양쪽 정렬 전역 적용 */
.problem-text, .content-paragraph, .page-content p {
  text-align: justify !important;
}

/* 문제 3등분 균일 배치 (풀이 공간 확보) */
.problem-block {
  min-height: auto !important;
  box-sizing: border-box;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

/* 누락 클래스 기본 스타일 (book CSS에 없을 경우 적용) */
.problem-meta {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.problem-question {
  margin-bottom: 6px !important;
  font-weight: 500;
  font-size: 8pt !important;
}
.problem-text {
  font-size: 8pt !important;
  line-height: 1.5 !important;
  margin-bottom: 6px !important;
}
.problem-choices, .problem-choices li {
  font-size: 8pt !important;
}
.problem-choices {
  gap: 2px 12px !important;
  margin-top: 4px !important;
}
.problem-choices li {
  margin-bottom: 1px !important;
  padding: 2px 4px !important;
  line-height: 1.4 !important;
}

/* Prevent double numbering when choices already have circled numbers in HTML */
.problem-choices--html-numbered li::before {
  display: none !important;
}

/* Text answers in answer grid (error-identification type) */
.answer-grid-item--text {
  grid-column: span 2;
  flex-direction: row !important;
  gap: 8px;
}
.answer-grid-item--text .answer-grid-answer {
  font-size: 10px !important;
  font-weight: 500 !important;
  text-align: left !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* === Page overflow fix: allow content to grow beyond 297mm === */
.page {
  height: auto !important;
  min-height: 297mm !important;
  overflow: visible !important;
}

.page-content {
  overflow: visible !important;
}

@media print {
  .page {
    height: auto !important;
    min-height: 297mm !important;
    overflow: visible !important;
  }
  .page-content {
    overflow: visible !important;
  }
}

/* Cover and part-divider pages: restore fixed height for centering */
.page.cover-page,
.page.part-divider-page {
  height: 297mm !important;
  min-height: 297mm !important;
  max-height: 297mm !important;
  overflow: hidden !important;
}
@media print {
  .page.cover-page,
  .page.part-divider-page {
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    overflow: hidden !important;
  }
}

/* Chapter divider page styling */
.chapter-divider {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 250mm;
  text-align: center;
}
.chapter-divider-number {
  font-size: 18pt;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--color-deep-blue, #1B2A4A);
  margin-bottom: 16mm;
}
.chapter-divider-title {
  font-size: 28pt;
  font-weight: 700;
  color: var(--color-deep-blue, #1B2A4A);
  margin-bottom: 8mm;
}
.chapter-divider-subtitle {
  font-size: 12pt;
  font-weight: 400;
  color: var(--color-text-light, #718096);
}

/* Vol2 ch10 CSS compatibility — part2-only classes */
.example-list {
  list-style-type: '✓ ';
  padding-left: 20px;
  margin: 10px 0 15px 0;
  font-size: 10.5pt;
}
.example-list li { margin-bottom: 5px; }

code {
  font-family: 'Inter', sans-serif;
  color: var(--color-deep-blue, #1B2A4A);
  background-color: #f2f4f8;
  border: 1px solid var(--color-border, #EAEAEA);
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95em;
}

.comparison-table th:first-child,
.comparison-table td:first-child {
  width: 22%;
  white-space: nowrap;
}

/* part2 header class aliases (safety net) */
.part-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--color-deep-blue, #1B2A4A);
}
.part-number {
  font-family: 'Playfair Display', serif;
  font-size: 24pt;
  font-weight: 700;
  color: var(--color-deep-blue, #1B2A4A);
}

/* Fix double numbering: ol.problem-choices has browser default decimal + inline circled numbers */
.problem-choices {
  list-style: none !important;
  padding-left: 0 !important;
}
.problem-choices li {
  list-style: none !important;
}

/* Fallback passage styles (when book CSS uses different selectors) */
.passage-body {
  font-size: 9pt !important;
  line-height: 1.8 !important;
  margin-bottom: 1.5em !important;
  text-align: justify !important;
}
.passage-body.eng-text {
  font-family: 'Inter', sans-serif !important;
}
.passage-vocab-title {
  font-size: 10pt !important;
  font-weight: 700 !important;
  margin-bottom: 8px !important;
}

/* Fallback vocab styles */
.vocab-item {
  display: flex !important;
  gap: 8px !important;
  font-size: 8.5pt !important;
  line-height: 1.6 !important;
}
.vocab-word {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
}
.vocab-meaning {
  color: #475569 !important;
}

/* Fix problem-number size consistency */
.problem-number {
  font-size: 9pt !important;
  font-weight: 600 !important;
}

/* === 인쇄 페이지 여백 (Ctrl+P / Puppeteer 공통) === */
@page {
  size: A4 !important;
  margin: 15mm 18mm !important;
}

/* .page div 는 화면용 컨테이너 — 인쇄 시 padding 이 물리 페이지마다 반복되지 않으므로
   @page margin 에만 의존하고, .page 자체 padding 은 최소화 */
@media print {
  .page {
    padding: 0 !important;
    margin: 0 !important;
    width: auto !important;
    min-height: auto !important;
    box-shadow: none !important;
    page-break-after: always !important;
  }
  .page:last-child {
    page-break-after: avoid !important;
  }
  .page.no-header-footer {
    padding: 0 !important;
  }
}

/* === Page-break flow: 긴 컨테이너는 넘기되 개별 항목은 보호 === */
.explanation-card {
  overflow: visible !important;
  break-inside: auto !important;
  page-break-inside: auto !important;
}
.bilingual-pair,
.syntax-card {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.explanation-label,
.section-title {
  break-after: avoid !important;
  page-break-after: avoid !important;
}
`;

// ─── CLI ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const bookFlag = args.indexOf('--book');
if (bookFlag === -1 || !args[bookFlag + 1]) {
  console.error('Usage: node assemble.js --book <bookId|all>');
  process.exit(1);
}
const bookArg = args[bookFlag + 1];

// ─── Main ───────────────────────────────────────────────────
(async () => {
  try {
    if (bookArg === 'all') {
      const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.yaml'));
      for (const f of files) {
        const bookId = f.replace('.yaml', '');
        try {
          await buildBook(bookId);
        } catch (e) {
          console.error(`  ❌ ${bookId}: ${e.message}`);
        }
      }
    } else {
      await buildBook(bookArg);
    }
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
})();

// ─── Build One Book ─────────────────────────────────────────
async function buildBook(bookId) {
  console.log(`\n📘 Building: ${bookId}`);

  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = yaml.load(fs.readFileSync(manifestPath, 'utf8'));
  // Normalize manifest: some books use root-level keys instead of book: wrapper
  let book, pages;
  if (manifest.book && manifest.pages) {
    // Standard format: { book: {...}, pages: [...] }
    book = manifest.book;
    pages = manifest.pages;
  } else if (manifest.pages) {
    // Has pages but no book wrapper
    book = { title: manifest.title, author: manifest.author, style: manifest.style, template: manifest.template, series: manifest.series };
    pages = manifest.pages;
  } else {
    // Alternative format: root-level keys + data: instead of pages:
    book = { title: manifest.title, author: manifest.author, style: manifest.style, template: manifest.template, series: manifest.series || manifest.id };
    pages = manifest.data || manifest.pages || [];
    if (pages.length === 0) {
      console.warn(`  ⚠️  No pages or data found in manifest for ${bookId}`);
      return;
    }
  }

  // Resolve CSS
  const css = resolveCSS(book);

  // Resolve fonts
  const fonts = getFontLinks();

  // Build pages HTML
  let pagesHtml = '';
  for (const page of pages) {
    pagesHtml += renderPage(page, book);
  }

  // Assemble final HTML
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  ${fonts}
  <style>
${css}
  </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

  // Write output
  fs.mkdirSync(OUTPUT_HTML, { recursive: true });
  const outPath = path.join(OUTPUT_HTML, `${bookId}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✅ Output: ${outPath}`);
}

// ─── CSS Resolution ─────────────────────────────────────────
function resolveCSS(book) {
  // New: use original CSS extracted from source HTML
  if (book.style) {
    const stylePath = path.join(STYLES_DIR, `${book.style}.css`);
    if (fs.existsSync(stylePath)) {
      console.log(`  🎨 Style: ${book.style}`);
      let css = fs.readFileSync(stylePath, 'utf8');

      // Inject vera-core components that have ZERO class overlap with extracted CSS
      // These page types have no styling in any extracted CSS file
      const safeComponents = ['answer-grid.css', 'explanation.css'];
      const hasComponents = [];
      for (const comp of safeComponents) {
        const compPath = path.join(SYSTEM_DIR, 'components', comp);
        if (fs.existsSync(compPath)) {
          hasComponents.push(comp);
          css += `\n/* === vera-core component: ${comp} === */\n`;
          css += fs.readFileSync(compPath, 'utf8');
        }
      }

      // If we injected any vera-core components, they need CSS variable definitions.
      // These components use var(--color-accent-primary), var(--space-lg), etc.
      // Without definitions, borders are transparent, badges invisible, spacing 0.
      // We inject ONLY the :root variable declarations (no rules, no selectors).
      if (hasComponents.length > 0) {
        const cssVarBlock = `
/* === Minimal CSS variables for injected vera-core components === */
/* Source: 03_system/base/page-layout.css :root block (declarations only) */
:root {
  /* Colors */
  --color-white: #FFFFFF;
  --color-bg-subtle: #F7F8FA;
  --color-text-primary: #2D2D2D;
  --color-text-muted: #9CA3AF;
  --color-border-default: #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-accent-primary: #1B2A4A;
  --color-accent-dark: #1B2A4A;
  --color-accent-secondary: #C5A55A;
  --color-example-bg: #F7FEE7;
  --color-example-border: #22C55E;
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  /* Typography */
  --font-eng: 'Inter', sans-serif;
  --text-xs: 7.5pt;
  --text-sm: 8.5pt;
  --text-base: 10pt;
  --text-md: 10.5pt;
  --text-lg: 12pt;
  --text-xl: 14pt;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  /* Borders */
  --radius-sm: 4px;
}
`;
        // Prepend variable block BEFORE component CSS so vars are defined when components reference them
        css = cssVarBlock + css;
        console.log(`  🎨 Injected CSS variables + components: ${hasComponents.join(', ')}`);
      }

      return css + '\n' + LAYOUT_OVERRIDES;
    }
    console.warn(`  ⚠️  Style not found: ${stylePath}, falling back to template`);
  }

  // Legacy: vera-core + template (unchanged)
  const corePath = path.join(SYSTEM_DIR, 'vera-core.css');
  let css = resolveImports(corePath);

  if (book.template) {
    const templatePath = path.join(SYSTEM_DIR, 'templates', book.template, `${book.template}.css`);
    if (fs.existsSync(templatePath)) {
      css += '\n/* === Template: ' + book.template + ' === */\n';
      css += resolveImports(templatePath);
    } else {
      console.warn(`  ⚠️  Template not found: ${templatePath}`);
    }
  }

  return css + '\n' + LAYOUT_OVERRIDES;
}

function resolveImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  CSS not found: ${filePath}`);
    return '';
  }

  const dir = path.dirname(filePath);
  let content = fs.readFileSync(filePath, 'utf8');

  // Recursively resolve @import url('...')
  content = content.replace(/@import\s+url\(['"]?([^'")\s]+)['"]?\)\s*;/g, (match, importPath) => {
    const resolved = path.resolve(dir, importPath);
    return resolveImports(resolved);
  });

  return content;
}

// ─── Font Links ─────────────────────────────────────────────
function getFontLinks() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet">`;
}

// ─── Page Rendering ─────────────────────────────────────────
function renderPage(page, book) {
  switch (page.type) {
    case 'content':
      return renderContent(page, book);
    case 'problems':
      return renderProblems(page, book);
    case 'passages':
      return renderPassages(page, book);
    case 'vocabulary':
      return renderVocabulary(page, book);
    case 'answer-grid':
      return renderAnswerGrid(page, book);
    case 'explanations':
      return renderExplanations(page, book);
    case 'structural':
      return renderStructural(page);
    case 'toc':
      return '<!-- TOC: auto-generated -->\n';
    case 'chapter-divider':
      return renderChapterDivider(page, book);
    default:
      console.warn(`  ⚠️  Unknown page type: ${page.type}`);
      return '';
  }
}

// ─── Structural (pre-built page HTML) ───────────────────────
function renderStructural(page) {
  const filePath = path.join(CONTENT_DIR, page.src);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Structural page not found: ${filePath}`);
    return '';
  }
  // Already a complete <div class="page"> block — insert as-is
  return fs.readFileSync(filePath, 'utf8') + '\n';
}

// ─── Content (HTML) ─────────────────────────────────────────
function renderContent(page, book) {
  const filePath = path.join(CONTENT_DIR, page.src);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Content not found: ${filePath}`);
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return wrapPage(content, book, page.pageClass);
}

// ─── Chapter Divider ─────────────────────────────────────────
function renderChapterDivider(page, book) {
  const subtitle = page.subtitle
    ? `<div class="chapter-divider-subtitle">${page.subtitle}</div>` : '';
  return `
<div class="page no-header-footer">
  <div class="page-content">
    <div class="chapter-divider">
      <div class="chapter-divider-number">${page.chapter || ''}</div>
      <div class="chapter-divider-title">${page.title || ''}</div>
      ${subtitle}
    </div>
  </div>
</div>
`;
}

// ─── Problems (JSON) ────────────────────────────────────────
function renderProblems(page, book) {
  const data = loadJSON(page.src);
  if (!data) return '';

  let problems = data.problems || [];
  if (page.range) {
    const [start, end] = page.range;
    problems = problems.filter(p => p.number >= start && p.number <= end);
  }

  const perPage = getPerPage(page.layout, 'problems');
  let html = '';
  let pageProblems = [];

  for (const p of problems) {
    pageProblems.push(p);
    if (pageProblems.length >= perPage) {
      html += wrapPage(renderProblemGroup(pageProblems), book);
      pageProblems = [];
    }
  }
  if (pageProblems.length > 0) {
    html += wrapPage(renderProblemGroup(pageProblems), book);
  }

  return html;
}

function renderProblemGroup(problems) {
  return problems.map(p => {
    const layoutClass = p.choiceLayout === 'single-column' ? ' problem-choices--single-column' : '';
    const instruction = p.instruction ? `    <p class="problem-question">${p.instruction}</p>\n` : '';
    const stem = p.stem ? `    <div class="problem-text eng-text">${p.stem}</div>\n` : '';
    const choices = (p.choices || []).map((c, i) =>
      `      <li>${CIRCLED[i + 1] || (i + 1)} ${normalizeChoice(c)}</li>`
    ).join('\n');
    const choicesBlock = choices ? `    <ol class="problem-choices problem-choices--html-numbered${layoutClass}">\n${choices}\n    </ol>` : '';

    return `  <div class="problem-block" data-id="${p.id}" data-type="${p.type}">
    <div class="problem-meta">
      <span class="problem-number">${p.number}</span>
    </div>
${instruction}${stem}${choicesBlock}
  </div>`;
  }).join('\n\n');
}

// ─── Passages (JSON) ────────────────────────────────────────
function renderPassages(page, book) {
  const data = loadJSON(page.src);
  if (!data) return '';

  let html = '';
  for (const passage of (data.passages || [])) {
    // Passage page
    const vocabItems = (passage.vocabulary || []).map(v =>
      `      <li class="vocab-item"><span class="vocab-word">${v.word}</span><span class="vocab-meaning">${v.meaning}</span></li>`
    ).join('\n');

    const vocabSection = vocabItems
      ? `    <div class="passage-vocab">
      <h4 class="passage-vocab-title">Vocabulary</h4>
      <ul class="vocab-list">
${vocabItems}
      </ul>
    </div>` : '';

    const passageHtml = `  <article class="passage" data-id="${passage.id}">
    <header class="passage-header">
      <span class="passage-number">[지문 ${passage.number}]</span>
      <h3 class="passage-title">${passage.title}</h3>
    </header>
    <div class="passage-body eng-text">
      <p>${passage.text}</p>
    </div>
${vocabSection}
  </article>`;

    html += wrapPage(passageHtml, book);

    // Questions for this passage
    if (passage.questions && passage.questions.length > 0) {
      const qHtml = passage.questions.map(q => {
        const choices = q.choices.map((c, i) =>
          `      <li>${CIRCLED[i + 1] || (i + 1)} ${normalizeChoice(c)}</li>`
        ).join('\n');
        return `  <div class="problem-block" data-id="${q.id}" data-type="${q.type}">
    <div class="problem-meta">
      <span class="problem-number">${q.number}</span>
    </div>
    <p class="problem-question">${q.text}</p>
    <ol class="problem-choices problem-choices--html-numbered">
${choices}
    </ol>
  </div>`;
      }).join('\n\n');
      html += wrapPage(qHtml, book);
    }
  }

  return html;
}

// ─── Vocabulary (JSON) ──────────────────────────────────────
function renderVocabulary(page, book) {
  const data = loadJSON(page.src);
  if (!data) return '';

  const words = data.words || [];
  const perPage = 8;
  let html = '';
  let batch = [];

  for (const w of words) {
    batch.push(w);
    if (batch.length >= perPage) {
      html += wrapPage(renderWordGroup(batch), book);
      batch = [];
    }
  }
  if (batch.length > 0) {
    html += wrapPage(renderWordGroup(batch), book);
  }

  return html;
}

function renderWordGroup(words) {
  return words.map(w => {
    const pron = w.pronunciation ? `<span class="word-pronunciation">${w.pronunciation}</span>` : '';
    const exEn = w.example ? `<p class="example-en eng-text">${w.example.en}</p>` : '';
    const exKo = w.example ? `<p class="example-ko">${w.example.ko}</p>` : '';

    return `  <div class="word-entry" data-word="${w.word}">
    <div class="word-header">
      <h3 class="word-title eng-text">${w.word}</h3>
      ${pron}
      <span class="word-pos">${w.partOfSpeech || ''}</span>
    </div>
    <div class="word-body">
      <p class="word-meaning">${w.meaning}</p>
      <div class="word-example">
        ${exEn}
        ${exKo}
      </div>
    </div>
  </div>`;
  }).join('\n\n');
}

// ─── Answer Grid (JSON) ─────────────────────────────────────
function renderAnswerGrid(page, book) {
  const data = loadJSON(page.src);
  if (!data) return '';

  let problems = data.problems || [];
  if (page.range) {
    const [start, end] = page.range;
    problems = problems.filter(p => p.number >= start && p.number <= end);
  }

  const items = problems.map(p => {
    const isNumeric = typeof p.answer === 'number' ||
      (typeof p.answer === 'string' && /^[A-E1-5]$/.test(p.answer));
    const extraClass = isNumeric ? '' : ' answer-grid-item--text';
    return `      <div class="answer-grid-item${extraClass}">
        <span class="answer-grid-number">${p.number}</span>
        <span class="answer-grid-answer">${formatAnswer(p.answer)}</span>
      </div>`;
  }).join('\n');

  const gridHtml = `  <div class="answer-grid">
    <h3 class="answer-grid-title">정답</h3>
    <div class="answer-grid-table">
${items}
    </div>
  </div>`;

  return wrapPage(gridHtml, book);
}

// ─── Explanations (JSON) ────────────────────────────────────
function renderExplanations(page, book) {
  const data = loadJSON(page.src);
  if (!data) return '';

  let problems = data.problems || [];
  if (page.range) {
    const [start, end] = page.range;
    problems = problems.filter(p => p.number >= start && p.number <= end);
  }

  // Only problems with explanations
  problems = problems.filter(p => p.explanation);

  const perPage = getPerPage(page.layout, 'explanations');
  const compactClass = page.layout === 'compact' ? ' explanation--compact' : '';
  let html = '';
  let batch = [];

  for (const p of problems) {
    batch.push(p);
    if (batch.length >= perPage) {
      html += wrapPage(renderExplanationGroup(batch, compactClass), book);
      batch = [];
    }
  }
  if (batch.length > 0) {
    html += wrapPage(renderExplanationGroup(batch, compactClass), book);
  }

  return html;
}

function renderExplanationGroup(problems, compactClass) {
  return problems.map(p => {
    const body = mdToHtml(p.explanation);
    return `  <div class="explanation${compactClass}" data-problem-id="${p.id}">
    <div class="explanation-header">
      <span class="problem-number">${p.number}</span>
      <span class="answer-badge">정답: ${formatAnswer(p.answer)}</span>
    </div>
    <div class="explanation-body">
      ${body}
    </div>
  </div>`;
  }).join('\n\n');
}

// ─── Helpers ────────────────────────────────────────────────
function loadJSON(src) {
  const filePath = path.join(DATA_DIR, src);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Data not found: ${filePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function wrapPage(content, book, extraClass) {
  const cls = extraClass ? `page ${extraClass}` : 'page';
  return `
<div class="${cls}">
  <div class="page-header">
    <span class="eng-text">${book.author || "Vera's Flavor"}</span>
    <span>${book.title}</span>
  </div>
  <div class="page-content">
${content}
  </div>
  <div class="page-footer"></div>
</div>
`;
}

function getPerPage(layout, type) {
  const defaults = {
    problems: { default: 3, 'two-per-page': 3, compact: 5, 'three-per-page': 3 },
    explanations: { default: 3, compact: 5 },
  };
  return (defaults[type] && defaults[type][layout]) || defaults[type]?.default || 3;
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br>')
    .replace(/<br>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<br>/g, '$1')
    .split('<br><br>').map(p => `<p>${p}</p>`).join('\n      ');
}
