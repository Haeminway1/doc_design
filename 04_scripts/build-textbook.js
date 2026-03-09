#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const yaml = require('js-yaml');
const { marked } = require('marked');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content');
const STYLES_DIR = path.join(ROOT, '07_archive', 'textbooks_legacy', 'styles');
const OUTPUT_HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const SYSTEM_DIR = path.join(ROOT, '03_system');

const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet">'
].join('\n  ');

const RUNTIME_CSS = `
html, body {
  margin: 0;
  padding: 0;
}

body {
  background: var(--color-bg-screen, #E9ECF0);
}

#textbook-pages {
  padding: 12px 0 24px;
  visibility: hidden;
}

html[data-textbook-ready="true"] #textbook-pages {
  visibility: visible;
}

#textbook-flow-root {
  display: none;
}

.page.page--fixed,
.page.page--paginated {
  height: var(--page-height) !important;
  min-height: var(--page-height) !important;
  max-height: var(--page-height) !important;
  overflow: hidden !important;
}

.page.page--fixed:not(.no-header-footer),
.page.page--paginated:not(.no-header-footer) {
  padding: var(--page-padding-y) var(--page-padding-x) !important;
}

.page.page--paginated {
  display: flex !important;
  flex-direction: column !important;
}

.page.page--fixed:not(.no-header-footer) .page-content,
.page.page--paginated .page-content {
  overflow: hidden !important;
  padding: 2mm 1mm 3mm !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
}

.page.page--paginated .page-footer {
  position: static !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  margin-top: auto !important;
}

.page.page--runtime-overflow {
  outline: 2px solid #dc2626;
  outline-offset: -2px;
}

.page-footer .page-footer-text {
  position: absolute;
  left: 0;
}

.flow-block {
  break-inside: avoid;
  page-break-inside: avoid;
}

.flow-block > *:first-child {
  margin-top: 0 !important;
}

.flow-block > *:last-child {
  margin-bottom: 0 !important;
}

.chapter-opener-body {
  display: flex;
  min-height: 240mm;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.chapter-opener-label {
  font-family: var(--font-eng);
  font-size: var(--text-xl);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.chapter-opener-title {
  font-size: 30pt;
  font-weight: 700;
  color: var(--color-accent-dark);
}
`;

const PAGINATION_SCRIPT = `
(function () {
  function run() {
    const pageRoot = document.getElementById('textbook-pages');
    const flowRoot = document.getElementById('textbook-flow-root');
    const sections = Array.from(flowRoot.querySelectorAll('.flow-section'));
    const errors = [];

    function buildPageShell(section) {
      const page = document.createElement('div');
      const extraClass = section.dataset.pageClass || '';
      page.className = ['page', 'page--paginated', extraClass].filter(Boolean).join(' ');

      const header = document.createElement('div');
      header.className = 'page-header';
      const headerLeft = document.createElement('span');
      headerLeft.textContent = section.dataset.headerLeft || '';
      const headerRight = document.createElement('span');
      headerRight.textContent = section.dataset.headerRight || '';
      header.appendChild(headerLeft);
      header.appendChild(headerRight);

      const content = document.createElement('div');
      content.className = 'page-content';

      const footer = document.createElement('div');
      footer.className = 'page-footer';
      if (section.dataset.footerText) {
        const footerText = document.createElement('span');
        footerText.className = 'page-footer-text';
        footerText.textContent = section.dataset.footerText;
        footer.appendChild(footerText);
      }

      page.appendChild(header);
      page.appendChild(content);
      page.appendChild(footer);

      return { page, content };
    }

    function createLivePage(section) {
      const shell = buildPageShell(section);
      pageRoot.appendChild(shell.page);
      return shell;
    }

    function pageFits(shell) {
      return shell.page.scrollHeight <= shell.page.clientHeight + 1;
    }

    function registerOverflow(section, block, page) {
      page.classList.add('page--runtime-overflow');
      errors.push({
        sectionId: section.dataset.sectionId || '',
        blockId: block.dataset.blockId || '',
        reason: 'block-exceeds-page'
      });
    }

    sections.forEach((section) => {
      const blocks = Array.from(section.children);
      if (!blocks.length) {
        return;
      }

      let shell = createLivePage(section);

      blocks.forEach((block) => {
        let clone = block.cloneNode(true);
        shell.content.appendChild(clone);

        if (pageFits(shell)) {
          return;
        }

        shell.content.removeChild(clone);

        if (!shell.content.children.length) {
          clone = block.cloneNode(true);
          shell.content.appendChild(clone);
          registerOverflow(section, block, shell.page);
          shell = createLivePage(section);
          return;
        }

        shell = createLivePage(section);
        clone = block.cloneNode(true);
        shell.content.appendChild(clone);

        if (!pageFits(shell)) {
          registerOverflow(section, block, shell.page);
          shell = createLivePage(section);
        }
      });

      if (!shell.content.children.length) {
        shell.page.remove();
      }
    });

    window.__TEXTBOOK_PAGINATION_ERRORS__ = errors;
    window.__TEXTBOOK_READY__ = true;
    document.documentElement.dataset.textbookReady = 'true';
  }

  Promise.resolve(document.fonts ? document.fonts.ready : null)
    .catch(function () { return null; })
    .then(function () {
      requestAnimationFrame(function () {
        run();
      });
    });
})();
`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(value) {
  if (value == null) return '';
  return String(value);
}

function renderMultilineText(value) {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/<(p|div|br|ul|ol|table|blockquote|strong|em|span)\b/i.test(raw)) {
    return raw;
  }

  return raw
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function normalizeChoice(value) {
  return String(value ?? '')
    .replace(/^[①②③④⑤]\s*/, '')
    .replace(/^\([A-Ea-e]\)\s*/, '')
    .replace(/^[A-Ea-e][.)]\s*/, '')
    .trim();
}

function formatAnswer(answer) {
  const circled = ['', '①', '②', '③', '④', '⑤'];
  if (typeof answer === 'number' && circled[answer]) {
    return circled[answer];
  }
  if (typeof answer === 'string') {
    const num = Number(answer);
    if (Number.isInteger(num) && circled[num]) {
      return circled[num];
    }
    const letters = { A: 1, B: 2, C: 3, D: 4, E: 5 };
    if (letters[answer.toUpperCase()]) {
      return circled[letters[answer.toUpperCase()]];
    }
    return escapeHtml(answer);
  }
  return escapeHtml(answer ?? '');
}

function getNumericSuffix(sourcePath, pattern) {
  const match = String(sourcePath || '').match(pattern);
  return match ? Number(match[1]) : null;
}

function normalizePageSequence(pages) {
  const normalized = Array.isArray(pages) ? [...pages] : [];

  for (let i = 0; i < normalized.length; i += 1) {
    const page = normalized[i];
    if (!page || !['answer-grid', 'explanations'].includes(page.kind) || !page.source?.path) {
      continue;
    }

    const previousRelatedIndex = normalized.slice(0, i).findLastIndex((candidate) => (
      candidate?.source?.path === page.source.path &&
      ['problem-set', 'passage-set'].includes(candidate.kind)
    ));
    if (previousRelatedIndex !== -1) {
      continue;
    }

    const nextRelatedIndex = normalized.slice(i + 1).findIndex((candidate) => (
      candidate?.source?.path === page.source.path &&
      ['problem-set', 'passage-set'].includes(candidate.kind)
    ));
    if (nextRelatedIndex === -1) {
      continue;
    }

    const fromIndex = i;
    const targetIndex = i + 1 + nextRelatedIndex;
    const [moved] = normalized.splice(fromIndex, 1);
    normalized.splice(targetIndex + 1, 0, moved);
    i -= 1;
  }

  for (let start = 0; start < normalized.length; start += 1) {
    if (normalized[start]?.kind !== 'passage-set') {
      continue;
    }

    let end = start;
    while (end + 1 < normalized.length && normalized[end + 1]?.kind === 'passage-set') {
      end += 1;
    }

    const block = normalized.slice(start, end + 1);
    block.sort((a, b) => (
      getNumericSuffix(a.source?.path, /part(\d+)-passages\.json$/i) || 0
    ) - (
      getNumericSuffix(b.source?.path, /part(\d+)-passages\.json$/i) || 0
    ));
    normalized.splice(start, block.length, ...block);
    start = end;
  }

  return normalized;
}

function rewriteRelativeAssetUrls(css, dir) {
  return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, rawUrl) => {
    const assetUrl = String(rawUrl || '').trim();
    if (!assetUrl || /^(data:|https?:|file:|#)/i.test(assetUrl)) {
      return match;
    }
    const absoluteUrl = pathToFileURL(path.resolve(dir, assetUrl)).href;
    return `url('${absoluteUrl}')`;
  });
}

function resolveImports(filePath, seen = new Set()) {
  if (seen.has(filePath)) {
    return '';
  }
  seen.add(filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSS not found: ${filePath}`);
  }

  const dir = path.dirname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const expanded = content.replace(/@import\s+url\(['"]?([^'")\s]+)['"]?\)\s*;|@import\s+['"]([^'"]+)['"]\s*;/g, (match, importUrlA, importUrlB) => {
    const importUrl = importUrlA || importUrlB;
    if (!importUrl || /^https?:/i.test(importUrl)) {
      return match;
    }
    return resolveImports(path.resolve(dir, importUrl), seen);
  });
  return rewriteRelativeAssetUrls(expanded, dir);
}

function inferLegacyStyleId(book) {
  if (book.legacyStyle) {
    return book.legacyStyle;
  }

  if (fileExists(path.join(STYLES_DIR, `${book.id}.css`))) {
    return book.id;
  }

  if (book.id === 'grammar-bridge-vol1') return 'grammar-bridge-part1';
  if (book.id === 'grammar-bridge-vol2') return 'grammar-bridge-part2';

  const chapterMatch = book.id.match(/^grammar-bridge-ch(\d{2})$/);
  if (chapterMatch) {
    const chapterNo = Number(chapterMatch[1]);
    return chapterNo <= 5 ? 'grammar-bridge-part1' : 'grammar-bridge-part2';
  }

  return '';
}

function resolveStyles(book, pages) {
  const corePath = path.join(SYSTEM_DIR, 'vera-core.css');
  const templatePath = path.join(SYSTEM_DIR, 'templates', book.theme, `${book.theme}.css`);
  const refreshPath = path.join(SYSTEM_DIR, 'base', 'bridge-refresh.css');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  const coreCss = sanitizeLegacyPalette(resolveImports(corePath));
  const templateCss = sanitizeLegacyPalette(resolveImports(templatePath));
  const styleChunks = [coreCss, templateCss];

  if (Array.isArray(pages) && pages.some((page) => page.kind === 'legacy-page')) {
    const legacyStyleId = inferLegacyStyleId(book);
    if (legacyStyleId) {
      const legacyStylePath = path.join(STYLES_DIR, `${legacyStyleId}.css`);
      if (fs.existsSync(legacyStylePath)) {
        styleChunks.push(sanitizeLegacyPalette(resolveImports(legacyStylePath)));
      }
    }
  }

  if (fs.existsSync(refreshPath)) {
    styleChunks.push(resolveImports(refreshPath));
  }

  styleChunks.push(RUNTIME_CSS);
  return styleChunks.join('\n\n');
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function ensurePath(baseDir, relPath, label, errors) {
  const absPath = path.join(baseDir, relPath);
  if (!fileExists(absPath)) {
    errors.push(`${label} not found: ${absPath}`);
  }
  return absPath;
}

function validateManifest(manifest, manifestPath) {
  const errors = [];
  if (manifest.version !== 2) {
    errors.push('version must be 2');
  }
  if (!manifest.book || typeof manifest.book !== 'object') {
    errors.push('book is required');
  }
  if (!Array.isArray(manifest.pages) || !manifest.pages.length) {
    errors.push('pages must be a non-empty array');
  }
  if (errors.length) {
    return errors;
  }

  const requiredBookFields = ['id', 'title', 'author', 'subject', 'level', 'theme'];
  requiredBookFields.forEach((field) => {
    if (!manifest.book[field]) {
      errors.push(`book.${field} is required`);
    }
  });

  const allowedKinds = new Set([
    'cover',
    'toc',
    'chapter-opener',
    'content',
    'problem-set',
    'passage-set',
    'vocabulary-set',
    'answer-grid',
    'explanations',
    'legacy-page'
  ]);

  manifest.pages.forEach((page, index) => {
    const prefix = `pages[${index}]`;
    if (!page.kind || !allowedKinds.has(page.kind)) {
      errors.push(`${prefix}.kind is invalid`);
      return;
    }

    if (page.kind === 'toc' && (!Array.isArray(page.items) || !page.items.length)) {
      errors.push(`${prefix}.items is required for toc`);
    }

    if (['content', 'problem-set', 'passage-set', 'vocabulary-set', 'answer-grid', 'explanations', 'legacy-page'].includes(page.kind)) {
      if (!page.source || !page.source.path) {
        errors.push(`${prefix}.source.path is required`);
      }
    }
  });

  const templatePath = path.join(SYSTEM_DIR, 'templates', manifest.book.theme || '', `${manifest.book.theme || ''}.css`);
  if (!fileExists(templatePath)) {
    errors.push(`theme CSS not found: ${templatePath}`);
  }

  manifest.pages.forEach((page, index) => {
    const prefix = `pages[${index}]`;
    if (!page.source || !page.source.path) {
      return;
    }
    if (page.kind === 'content') {
      ensurePath(CONTENT_DIR, page.source.path, `${prefix}.source`, errors);
    } else if (page.kind === 'legacy-page') {
      ensurePath(CONTENT_DIR, page.source.path, `${prefix}.source`, errors);
    } else {
      ensurePath(DATA_DIR, page.source.path, `${prefix}.source`, errors);
    }
  });

  if (errors.length) {
    errors.unshift(`Manifest validation failed: ${manifestPath}`);
  }
  return errors;
}

function isCoverLikePage(page) {
  if (!page || typeof page !== 'object') return false;
  if (page.kind === 'cover') return true;
  if (page.kind !== 'legacy-page' || !page.source || !page.source.path) return false;
  return /(^|\/)cover(?:[-_a-z0-9]*)?\.html$/i.test(page.source.path);
}

function ensureDefaultPages(book, pages) {
  const normalizedPages = normalizePageSequence(Array.isArray(pages) ? [...pages] : []);
  if (!normalizedPages.length || !isCoverLikePage(normalizedPages[0])) {
    normalizedPages.unshift({
      kind: 'cover',
      id: `${book.id}-auto-cover`
    });
  }
  return normalizedPages;
}

function renderPageShellStart(classNames) {
  return `<div class="${classNames.join(' ')}">`;
}

function renderCoverPage(page, book) {
  const cover = book.cover || {};
  const variant = page.variant || cover.variant || 'minimal';
  const mainTitle = cover.mainTitle || book.title;
  const edition = cover.edition || book.level;
  return `
${renderPageShellStart(['page', 'page--fixed', 'cover-page', 'no-header-footer', `cover--${variant}`])}
  <div class="cover-layout">
    <div class="cover-brand">${escapeHtml(book.brand || book.author)}</div>
    <div class="cover-main-title">${escapeHtml(mainTitle)}</div>
    <div class="cover-edition">${escapeHtml(edition)}</div>
    <div class="cover-author">${escapeHtml(book.author)}</div>
  </div>
</div>
`;
}

function renderTocPage(page) {
  const columnsClass = page.columns === 2 ? ' toc-list--two-columns' : '';
  const items = (page.items || []).map((item) => {
    const number = item.number ? `<span class="toc-item-number">${escapeHtml(item.number)}</span>` : '';
    const dots = '<span class="toc-item-dots"></span>';
    const pageCell = item.page ? `<span class="toc-item-page">${escapeHtml(item.page)}</span>` : '<span class="toc-item-page"></span>';
    return `
      <li class="toc-item">
        ${number}
        <span class="toc-item-title">${escapeHtml(item.title)}</span>
        ${dots}
        ${pageCell}
      </li>`;
  }).join('\n');

  return `
${renderPageShellStart(['page', 'page--fixed', 'toc-page'])}
  <div class="page-header">
    <span>${escapeHtml(page.title || 'Table of Contents')}</span>
    <span></span>
  </div>
  <div class="page-content">
    <div class="toc">
      <h1 class="toc-title">${escapeHtml(page.title || 'Table of Contents')}</h1>
      <ol class="toc-list${columnsClass}">
${items}
      </ol>
    </div>
  </div>
  <div class="page-footer"></div>
</div>
`;
}

function renderChapterOpener(page) {
  return `
${renderPageShellStart(['page', 'page--fixed', 'chapter-page'])}
  <div class="page-header">
    <span>${escapeHtml(page.subtitle || '')}</span>
    <span></span>
  </div>
  <div class="page-content">
    <div class="chapter-opener-body">
      <div class="chapter-opener-label">${escapeHtml(page.subtitle || '')}</div>
      <div class="chapter-opener-title">${escapeHtml(page.title || '')}</div>
    </div>
  </div>
  <div class="page-footer"></div>
</div>
`;
}

function sanitizeLegacyPalette(html) {
  return String(html || '')
    .replace(/var\(--color-deep-blue\)/g, 'var(--color-navy-deep)')
    .replace(/var\(--color-sea-blue\)/g, 'var(--color-sky)')
    .replace(/var\(--color-warm-orange\)/g, 'var(--color-gold)')
    .replace(/#3498db/gi, '#5ca9e6')
    .replace(/#2980b9/gi, '#1B2A4A')
    .replace(/#6c96c6/gi, '#5ca9e6')
    .replace(/#345c85/gi, '#1B2A4A')
    .replace(/#0ea5e9/gi, '#5ca9e6')
    .replace(/#0284c7/gi, '#5ca9e6')
    .replace(/#0369a1/gi, '#1B2A4A')
    .replace(/#27ae60/gi, '#c5a55a')
    .replace(/#2ecc71/gi, '#f4e3a0')
    // verajin 박스 색상 보존: #33691e(tip), #e65100(structure), #b71c1c(trap),
    // #283593(logic), #1a237e(logic-text), #e8eaf6(concept-bg), #f1f8e9(tip-bg),
    // #ffebee(warning-bg), #FFF3E0(structure-bg), #F1F8E9(tip-bg) — 리맵핑 제거
    .replace(/#16a34a/gi, '#c5a55a')
    .replace(/#10b981/gi, '#5ca9e6')
    .replace(/#e9a266/gi, '#c5a55a')
    .replace(/#c0392b/gi, '#c84c4c')
    .replace(/#ef4444/gi, '#c84c4c')
    .replace(/#e9f7fd/gi, '#eef7ff')
    // Legacy blue accents -> Navy
    .replace(/#2563EB/gi, '#1B2A4A')
    .replace(/#1E3A8A/gi, '#1B2A4A')
    .replace(/#2c3e50/gi, '#1B2A4A')
    .replace(/#5d6d7e/gi, '#7a7a7a')
    .replace(/#7f8c8d/gi, '#7a7a7a')
    // Purple -> Navy (reading-basic royal-purple 제거)
    .replace(/#9B59B6/gi, '#1B2A4A')
    .replace(/#8E44AD/gi, '#1B2A4A')
    .replace(/#6C3483/gi, '#1B2A4A')
    .replace(/#F5EEF8/gi, '#FAFAF7')
    .replace(/#7C3AED/gi, '#1B2A4A')
    .replace(/#6D28D9/gi, '#1B2A4A')
    .replace(/#F3E5F5/gi, '#EEF3FA')
    .replace(/#CE93D8/gi, '#7B9CC5')
    .replace(/#7B1FA2/gi, '#1B2A4A')
    .replace(/#9333EA/gi, '#1B2A4A')
    // Preserve gradient underline highlights (transparent XX%, #color XX%)
    // Strip other linear-gradient to first solid color
    .replace(/linear-gradient\(([^)]*)\)/gi, (match, inner) => {
      // Keep underline-style highlights: linear-gradient(transparent 55%, #BBDEFB 55%)
      if (/transparent\s+\d+%/.test(inner)) return match;
      // Extract first solid color from other gradients
      const colorMatch = inner.match(/#[0-9a-fA-F]{3,8}/);
      return colorMatch ? colorMatch[0] : '#1B2A4A';
    })
    // Strip box-shadow inline
    .replace(/box-shadow\s*:\s*[^;"]+/gi, 'box-shadow: none')
    // Strip rgba to solid
    .replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/gi, (_, r, g, b) => {
      const hex = '#' + [r, g, b].map(v => Number(v).toString(16).padStart(2, '0')).join('');
      return hex;
    })
    // Large border-radius (cosmetic cards) -> subtle
    .replace(/border-radius\s*:\s*1[2-9]px/gi, 'border-radius: 6px')
    .replace(/border-radius\s*:\s*[2-9]\dpx/gi, 'border-radius: 6px')
    // Strip !important from :root variable declarations so bridge-refresh wins
    .replace(/(--color-[a-z-]+:\s*[^;]+?)\s*!important/gi, '$1')
    .replace(/(--radius-[a-z-]+:\s*[^;]+?)\s*!important/gi, '$1')
    .replace(/(--table-[a-z-]+:\s*[^;]+?)\s*!important/gi, '$1')
    .replace(/(--header-[a-z-]+:\s*[^;]+?)\s*!important/gi, '$1');
}

function extractLegacyPagePayload(html) {
  const $ = cheerio.load(sanitizeLegacyPalette(html));
  const $page = $('.page').first();
  if (!$page.length) return null;

  const classes = ($page.attr('class') || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const $header = $page.children('.page-header').first();
  const headerSpans = $header.find('span').map((_, el) => $(el).text().trim()).get();
  const $content = $page.children('.page-content').first();
  const $footer = $page.children('.page-footer').first();
  const footerText = ($footer.find('.page-footer-text').text() || $footer.text() || '').trim();

  return {
    classes,
    headerLeft: headerSpans[0] || '',
    headerRight: headerSpans[1] || '',
    contentHtml: $content.length ? $content.html().trim() : '',
    footerText,
  };
}

function renderLegacyPage(page, book) {
  const absPath = path.join(CONTENT_DIR, page.source.path);
  const html = sanitizeLegacyPalette(fs.readFileSync(absPath, 'utf8').trim());
  const legacyPayload = extractLegacyPagePayload(html);

  if (isCoverLikePage(page)) {
    return renderCoverPage(page, book);
  }

  if (legacyPayload && /(^|\/)toc(?:[-_a-z0-9]*)?\.html$/i.test(page.source.path)) {
    return html;
  }

  if (legacyPayload && legacyPayload.contentHtml) {
    const pageClasses = ['page', 'page--fixed', 'legacy-page'];
    if (page.layout === 'compact') {
      pageClasses.push('compact-design');
    }

    const forwardedClasses = legacyPayload.classes.filter((className) => ![
      'page',
      'page-number',
      'cover-page',
      'no-header-footer',
    ].includes(className));
    pageClasses.push(...forwardedClasses);

    const headerLeft = escapeHtml(page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author));
    const headerRight = escapeHtml(page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title));
    const footerValue = page.meta && page.meta.footerText ? page.meta.footerText : legacyPayload.footerText;
    const footerText = footerValue ? `<span class="page-footer-text">${escapeHtml(footerValue)}</span>` : '';

    return `
${renderPageShellStart(pageClasses)}
  <div class="page-header">
    <span>${headerLeft}</span>
    <span>${headerRight}</span>
  </div>
  <div class="page-content">
${legacyPayload.contentHtml}
  </div>
  <div class="page-footer">${footerText}</div>
</div>
`;
  }

  const pageClasses = ['page', 'page--fixed', 'legacy-page'];
  if (page.layout === 'compact') {
    pageClasses.push('compact-design');
  }

  const headerLeft = escapeHtml(page.meta && page.meta.headerLeft ? page.meta.headerLeft : book.author);
  const headerRight = escapeHtml(page.meta && page.meta.headerRight ? page.meta.headerRight : book.title);
  const footerText = page.meta && page.meta.footerText ? `<span class="page-footer-text">${escapeHtml(page.meta.footerText)}</span>` : '';

  return `
${renderPageShellStart(pageClasses)}
  <div class="page-header">
    <span>${headerLeft}</span>
    <span>${headerRight}</span>
  </div>
  <div class="page-content">
${html}
  </div>
  <div class="page-footer">${footerText}</div>
</div>
`;
}

function renderProblem(problem, options = {}) {
  const compactClass = options.compact ? ' problem--compact' : '';
  const extraClass = options.extraClass ? ` ${options.extraClass}` : '';
  const choiceClass = problem.choiceLayout === 'single-column' || options.singleColumn ? ' problem-choices--single-column' : '';
  const typeBadge = options.typeBadge || '';
  const badgeHtml = typeBadge ? `<span class="problem-type-badge">${escapeHtml(typeBadge)}</span>` : '';
  const instruction = problem.instruction ? `<div class="problem-instruction">${renderInline(problem.instruction)}</div>` : '';
  const stemClass = problem.stem && /[A-Za-z]/.test(problem.stem) ? 'problem-stem eng-text' : 'problem-stem';
  const choices = (problem.choices || []).map((choice) => `<li>${escapeHtml(normalizeChoice(choice))}</li>`).join('');

  return `
<div class="problem${compactClass}${extraClass}" data-problem-id="${escapeHtml(problem.id || '')}">
  <div class="problem-header">
    <span class="problem-number">${escapeHtml(problem.number)}</span>
    ${badgeHtml}
  </div>
  ${instruction}
  <div class="${stemClass}">${renderMultilineText(problem.stem || problem.text || '')}</div>
  ${(problem.choices || []).length ? `<ol class="problem-choices${choiceClass}">${choices}</ol>` : ''}
</div>`;
}

function renderPassage(passage) {
  const vocabItems = (passage.vocabulary || []).map((item) => `
      <li class="vocab-item">
        <span class="vocab-word">${escapeHtml(item.word)}</span>
        <span class="vocab-meaning">${escapeHtml(item.meaning)}</span>
      </li>`).join('\n');

  const vocabSection = vocabItems ? `
    <div class="passage-vocab">
      <h4 class="passage-vocab-title">Vocabulary</h4>
      <ul class="vocab-list">
${vocabItems}
      </ul>
    </div>` : '';

  return `
<article class="passage" data-passage-id="${escapeHtml(passage.id || '')}" data-passage-number="${escapeHtml(passage.number || '')}">
  <header class="passage-header">
    <span class="passage-number">[지문 ${escapeHtml(passage.number)}]</span>
    <h3 class="passage-title">${escapeHtml(passage.title || '')}</h3>
  </header>
  <div class="passage-body eng-text">
    ${renderMultilineText(passage.text || '')}
  </div>
  ${vocabSection}
</article>`;
}

function renderPassageCluster(passage) {
  const questions = Array.isArray(passage.questions) ? passage.questions : [];
  const questionsHtml = questions.map((question) => renderProblem(question, {
    compact: true,
    typeBadge: 'Question',
    extraClass: 'problem--within-passage',
    singleColumn: true
  })).join('\n');

  return `
<section class="passage-cluster" data-passage-id="${escapeHtml(passage.id || '')}" data-question-count="${escapeHtml(questions.length)}">
  ${renderPassage(passage)}
  ${questions.length ? `<div class="passage-cluster-questions">${questionsHtml}</div>` : ''}
</section>`;
}

function renderWordEntry(word, options = {}) {
  const compactClass = options.compact ? ' word-entry--compact' : '';
  const pronunciation = word.pronunciation ? `<span class="word-pronunciation">${escapeHtml(word.pronunciation)}</span>` : '';
  const pos = word.partOfSpeech ? `<span class="word-pos">${escapeHtml(String(word.partOfSpeech).replace(/\s+/g, ' ').trim())}</span>` : '';
  const meaning = word.meaning ? `<p class="word-meaning">${escapeHtml(String(word.meaning).replace(/\s+/g, ' ').trim())}</p>` : '';

  let exampleHtml = '';
  if (word.example && (word.example.en || word.example.ko)) {
    exampleHtml = `
    <div class="word-example">
      ${word.example.en ? `<p class="example-en eng-text">${escapeHtml(word.example.en)}</p>` : ''}
      ${word.example.ko ? `<p class="example-ko">${escapeHtml(word.example.ko)}</p>` : ''}
    </div>`;
  } else if (Array.isArray(word.examples) && word.examples.length) {
    exampleHtml = word.examples.slice(0, 2).map((example) => `
    <div class="word-example">
      ${example.en ? `<p class="example-en eng-text">${escapeHtml(example.en)}</p>` : ''}
      ${example.ko ? `<p class="example-ko">${escapeHtml(example.ko)}</p>` : ''}
    </div>`).join('\n');
  }

  const relatedBits = [];
  if (word.coreImage) relatedBits.push(`<strong>핵심 이미지:</strong> ${escapeHtml(word.coreImage)}`);
  if (word.definition) relatedBits.push(`<strong>정의:</strong> ${escapeHtml(word.definition)}`);
  if (word.related) relatedBits.push(`<strong>관련어:</strong> ${escapeHtml(word.related)}`);
  const relatedHtml = relatedBits.length ? `<div class="word-related">${relatedBits.join('<br>')}</div>` : '';

  return `
<article class="word-entry${compactClass}" data-word="${escapeHtml(word.word || '')}">
  <div class="word-header">
    <h3 class="word-title eng-text">${escapeHtml(word.word || '')}</h3>
    ${pronunciation}
    ${pos}
  </div>
  <div class="word-body">
    ${meaning}
    ${exampleHtml}
    ${relatedHtml}
  </div>
</article>`;
}

function renderAnswerGrid(problems) {
  const items = problems.map((problem) => `
      <div class="answer-grid-item">
        <span class="answer-grid-number">${escapeHtml(problem.number)}</span>
        <span class="answer-grid-answer">${formatAnswer(problem.answer)}</span>
      </div>`).join('\n');

  return `
<div class="answer-grid">
  <h3 class="answer-grid-title">정답</h3>
  <div class="answer-grid-table">
${items}
  </div>
</div>`;
}

function renderExplanation(problem) {
  const explanationHtml = problem.explanation ? marked.parse(problem.explanation) : '';
  return `
<div class="explanation" data-problem-id="${escapeHtml(problem.id || '')}">
  <div class="explanation-header">
    <span class="problem-number">${escapeHtml(problem.number)}</span>
    <span class="answer-badge">정답: ${formatAnswer(problem.answer)}</span>
  </div>
  <div class="explanation-body">
    ${explanationHtml}
  </div>
</div>`;
}

function renderTable(block) {
  const caption = block.caption ? `<caption>${escapeHtml(block.caption)}</caption>` : '';
  const headers = block.headers ? `<thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>` : '';
  const rows = (block.rows || []).map((row) => `<tr>${row.map((cell) => {
    const className = cell.className ? ` class="${escapeHtml(cell.className)}"` : '';
    const value = cell.html ? renderInline(cell.html) : escapeHtml(cell.text || '');
    return `<td${className}>${value}</td>`;
  }).join('')}</tr>`).join('\n');
  return `<table class="grammar-table${block.className ? ` ${escapeHtml(block.className)}` : ''}">${caption}${headers}<tbody>${rows}</tbody></table>`;
}

function renderList(block) {
  const tag = block.ordered ? 'ol' : 'ul';
  const items = (block.items || []).map((item) => `<li>${item.html ? renderInline(item.html) : escapeHtml(item.text || '')}</li>`).join('\n');
  return `<${tag}${block.className ? ` class="${escapeHtml(block.className)}"` : ''}>${items}</${tag}>`;
}

function renderContentBlock(block) {
  switch (block.type) {
    case 'chapter-title':
      return `<h1 class="chapter-title${block.className ? ` ${escapeHtml(block.className)}` : ''}">${block.number ? `<span class="section-number">${escapeHtml(block.number)}</span>` : ''}${escapeHtml(block.title || '')}</h1>`;
    case 'section-title':
      return `<h2 class="section-title${block.variant ? ` section-title--${escapeHtml(block.variant)}` : ''}${block.className ? ` ${escapeHtml(block.className)}` : ''}">${block.number ? `<span class="section-number">${escapeHtml(block.number)}</span>` : ''}${escapeHtml(block.title || '')}</h2>`;
    case 'subsection-title':
      return `<h3 class="subsection-title${block.className ? ` ${escapeHtml(block.className)}` : ''}">${block.number ? `<span class="section-number">${escapeHtml(block.number)}</span>` : ''}${escapeHtml(block.title || '')}</h3>`;
    case 'paragraph':
      return `<p${block.className ? ` class="${escapeHtml(block.className)}${block.lang === 'en' ? ' eng-text' : ''}"` : block.lang === 'en' ? ' class="eng-text"' : ''}>${block.html ? renderInline(block.html) : escapeHtml(block.text || '')}</p>`;
    case 'markdown':
      return marked.parse(block.markdown || '');
    case 'list':
      return renderList(block);
    case 'table':
      return renderTable(block);
    case 'concept-box':
      return `<div class="concept-box${block.variant ? ` concept-box--${escapeHtml(block.variant)}` : ''}">
  <div class="concept-box-title">${escapeHtml(block.title || '')}</div>
  <div class="concept-box-content">${renderInline(block.body || '')}</div>
</div>`;
    case 'tip-box':
      return `<div class="tip-box${block.variant ? ` tip-box--${escapeHtml(block.variant)}` : ''}">
  <div class="tip-box-title">Vera's Flavor Tip</div>
  ${block.title ? `<div class="tip-subtitle">${escapeHtml(block.title)}</div>` : ''}
  <div class="tip-content">${renderInline(block.body || '')}</div>
</div>`;
    case 'example-block':
      return `<div class="example-block${block.variant ? ` example-block--${escapeHtml(block.variant)}` : ''}">
  ${block.title ? `<h4 class="example-block-title">${escapeHtml(block.title)}</h4>` : ''}
  ${block.sentence ? `<p class="example-sentence eng-text">${renderInline(block.sentence)}</p>` : ''}
  ${block.analysis ? `<div class="example-analysis">${renderInline(block.analysis)}</div>` : ''}
</div>`;
    case 'html':
      return renderInline(block.html || '');
    default:
      throw new Error(`Unsupported content block type: ${block.type}`);
  }
}

function createFlowSection(sectionId, pageClass, book, blocks, options = {}) {
  const attrs = [
    ['section-id', sectionId],
    ['page-class', pageClass || ''],
    ['header-left', options.headerLeft || book.author],
    ['header-right', options.headerRight || book.title],
    ['footer-text', options.footerText || '']
  ].map(([name, value]) => `data-${name}="${escapeHtml(value)}"`).join(' ');

  const blockHtml = blocks.map((block, index) => `<div class="flow-block" data-block-id="${escapeHtml(`${sectionId}-${index + 1}`)}">${block}</div>`).join('\n');
  return `<section class="flow-section" ${attrs}>\n${blockHtml}\n</section>`;
}

function filterRange(items, range) {
  if (!range || !Array.isArray(range) || range.length !== 2) {
    return items;
  }
  const [start, end] = range;
  return items.filter((item) => Number(item.number) >= start && Number(item.number) <= end);
}

function renderPageToArtifact(page, book) {
  if (page.kind === 'cover') {
    return { fixed: [renderCoverPage(page, book)], flows: [] };
  }
  if (page.kind === 'toc') {
    return { fixed: [renderTocPage(page)], flows: [] };
  }
  if (page.kind === 'chapter-opener') {
    return { fixed: [renderChapterOpener(page)], flows: [] };
  }
  if (page.kind === 'legacy-page') {
    return { fixed: [renderLegacyPage(page, book)], flows: [] };
  }
  if (page.kind === 'content') {
    const doc = readJson(path.join(CONTENT_DIR, page.source.path));
    const blocks = (doc.blocks || []).map(renderContentBlock);
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), page.layout === 'compact' ? 'compact-design' : '', book, blocks)]
    };
  }
  if (page.kind === 'problem-set') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const problems = filterRange(data.problems || [], page.range);
    const blocks = problems.map((problem) => renderProblem(problem, { compact: page.layout === 'compact', singleColumn: page.layout === 'single-column' }));
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), 'compact-design', book, blocks, { footerText: page.title || '' })]
    };
  }
  if (page.kind === 'passage-set') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const fixed = [];
    const flows = [];
    (data.passages || []).forEach((passage) => {
      flows.push(createFlowSection(`${page.id || 'passage'}-${passage.number}`, 'passage-cluster-page', book, [renderPassageCluster(passage)], {
        footerText: page.meta && page.meta.label ? `${page.meta.label} ${page.meta.title || ''}`.trim() : ''
      }));
    });
    return { fixed, flows };
  }
  if (page.kind === 'vocabulary-set') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const words = Array.isArray(data.words) ? data.words : [];
    const blocks = words.map((word) => renderWordEntry(word, { compact: page.layout === 'compact' }));
    const labelParts = [];
    if (data.day) labelParts.push(`DAY ${String(data.day).padStart(2, '0')}`);
    if (data.theme) labelParts.push(data.theme);
    if (page.title) labelParts.unshift(page.title);
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), '', book, blocks, {
        footerText: labelParts.join(' · ') || 'Vocabulary'
      })]
    };
  }
  if (page.kind === 'answer-grid') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const problems = filterRange(data.problems || [], page.range);
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), '', book, [renderAnswerGrid(problems)], {
        footerText: page.title || '정답'
      })]
    };
  }
  if (page.kind === 'explanations') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const problems = filterRange(data.problems || [], page.range).filter((problem) => problem.explanation);
    const blocks = problems.map(renderExplanation);
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), '', book, blocks, {
        footerText: page.title || '해설'
      })]
    };
  }
  throw new Error(`Unsupported page kind: ${page.kind}`);
}

function buildBook(bookId) {
  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  if (!fileExists(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = readYaml(manifestPath);
  const validationErrors = validateManifest(manifest, manifestPath);
  if (validationErrors.length) {
    throw new Error(validationErrors.join('\n'));
  }

  const pages = ensureDefaultPages(manifest.book, manifest.pages);
  const css = resolveStyles(manifest.book, pages);
  const fixedPages = [];
  const flowSections = [];

  pages.forEach((page) => {
    const rendered = renderPageToArtifact(page, manifest.book);
    fixedPages.push(...rendered.fixed);
    flowSections.push(...rendered.flows);
  });

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(manifest.book.title)}</title>
  ${FONT_LINKS}
  <style>
${css}
  </style>
</head>
<body>
  <div id="textbook-pages">
${fixedPages.join('\n')}
  </div>
  <div id="textbook-flow-root">
${flowSections.join('\n')}
  </div>
  <script>
${PAGINATION_SCRIPT}
  </script>
</body>
</html>`;

  fs.mkdirSync(OUTPUT_HTML_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_HTML_DIR, `${bookId}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`  ✅ HTML: ${outputPath}`);
}

function main() {
  const args = process.argv.slice(2);
  const bookFlag = args.indexOf('--book');
  if (bookFlag === -1 || !args[bookFlag + 1]) {
    console.error('Usage: node 04_scripts/build-textbook.js --book <bookId|all>');
    process.exit(1);
  }

  const bookArg = args[bookFlag + 1];
  if (bookArg === 'all') {
    const files = fs.readdirSync(BOOKS_DIR).filter((file) => file.endsWith('.yaml'));
    files.forEach((file) => {
      const bookId = file.replace(/\.yaml$/, '');
      console.log(`\n📘 Building: ${bookId}`);
      buildBook(bookId);
    });
    return;
  }

  console.log(`\n📘 Building: ${bookArg}`);
  buildBook(bookArg);
}

main();
