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
  background: #e4e2dd;
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
  height: var(--page-height, var(--xd-page-height, 297mm)) !important;
  min-height: var(--page-height, var(--xd-page-height, 297mm)) !important;
  max-height: var(--page-height, var(--xd-page-height, 297mm)) !important;
  overflow: hidden !important;
}

.page.page--fixed:not(.no-header-footer),
.page.page--paginated:not(.no-header-footer) {
  padding:
    var(--page-padding-top, var(--page-padding-y, var(--xd-margin-top, 11mm)))
    var(--page-padding-right, var(--page-padding-x, var(--xd-margin-right, 14mm)))
    var(--page-padding-bottom, var(--page-padding-y, var(--xd-margin-bottom, 18mm)))
    var(--page-padding-left, var(--page-padding-x, var(--xd-margin-left, 14mm))) !important;
}

.page.page--paginated {
  display: flex !important;
  flex-direction: column !important;
}

.page.page--fixed:not(.no-header-footer) .page-content,
.page.page--paginated .page-content {
  overflow: hidden !important;
  padding:
    var(--content-padding-top, var(--xd-content-pad-top, 0.5mm))
    var(--content-padding-right, var(--xd-content-pad-right, 0.5mm))
    var(--content-padding-bottom, var(--xd-content-pad-bottom, 2.5mm))
    var(--content-padding-left, var(--xd-content-pad-left, 0.5mm)) !important;
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

.page.page--paginated .page-content {
  display: flex !important;
  flex-direction: column !important;
}

.page.page--paginated .page-distribution-spacer {
  flex: 1 1 0 !important;
  min-height: 0 !important;
}

.page.page--runtime-overflow {
  outline: 2px solid #dc2626;
  outline-offset: -2px;
}

.page-footer .page-footer-text {
  position: static;
  display: block;
  text-align: center;
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
  font-family: var(--font-eng, var(--xd-font-latin));
  font-size: var(--text-xl, var(--xd-text-xl));
  color: var(--color-text-muted, var(--xd-color-muted));
  margin-bottom: var(--space-md, var(--xd-space-md));
  letter-spacing: 2px;
  text-transform: uppercase;
}

.chapter-opener-title {
  font-size: 30pt;
  font-weight: 700;
  color: var(--color-accent-dark, var(--xd-color-accent-strong));
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

    function appendBlock(shell, block) {
      const clone = block.cloneNode(true);
      const spacer = document.createElement('div');
      spacer.className = 'page-distribution-spacer';
      shell.content.appendChild(clone);
      shell.content.appendChild(spacer);
      return { clone, spacer };
    }

    function removeBlock(shell, pair) {
      if (pair.clone.parentNode === shell.content) {
        shell.content.removeChild(pair.clone);
      }
      if (pair.spacer.parentNode === shell.content) {
        shell.content.removeChild(pair.spacer);
      }
    }

    function shellHasBlocks(shell) {
      return Boolean(shell.content.querySelector('.flow-block'));
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
        let pair = appendBlock(shell, block);

        if (pageFits(shell)) {
          return;
        }

        removeBlock(shell, pair);

        if (!shellHasBlocks(shell)) {
          pair = appendBlock(shell, block);
          registerOverflow(section, block, shell.page);
          shell = createLivePage(section);
          return;
        }

        shell = createLivePage(section);
        pair = appendBlock(shell, block);

        if (!pageFits(shell)) {
          registerOverflow(section, block, shell.page);
          shell = createLivePage(section);
        }
      });

      if (!shellHasBlocks(shell)) {
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

function decodeBasicHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function renderMultilineText(value) {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  const decoded = decodeBasicHtmlEntities(raw);
  if (/<(p|div|br|ul|ol|table|blockquote|strong|em|span|u|b|i|del|sup|sub)\b/i.test(decoded)) {
    return decoded;
  }

  return decoded
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

function usesExtravagantDocs(book) {
  return book && book.styleSystem === 'extravagantdocs';
}

function isLayoutRuleEnabled(book, ...ruleNames) {
  const rules = (book && book.layoutRules) || {};
  return ruleNames.some((name) => Boolean(rules && rules[name]));
}

function resolveLegacyTemplatePath(book) {
  return path.join(SYSTEM_DIR, 'templates', book.theme, `${book.theme}.css`);
}

function resolveExtravagantTemplatePath(book) {
  const templateId = book.styleTemplate || 'exam-paper';
  return path.join(SYSTEM_DIR, 'extravagantdocs', 'templates', templateId, `${templateId}.css`);
}

function resolveStyles(book, pages, options = {}) {
  const { runtime = true, adapter = '' } = options;
  if (usesExtravagantDocs(book)) {
    const corePath = path.join(SYSTEM_DIR, 'extravagantdocs', 'extravagantdocs.css');
    const browserPrintPath = path.join(SYSTEM_DIR, 'extravagantdocs', 'adapters', 'browser-print.css');
    const templatePath = resolveExtravagantTemplatePath(book);
    const adapterPath = adapter
      ? path.join(SYSTEM_DIR, 'extravagantdocs', 'adapters', `${adapter}.css`)
      : '';
    const bridgeId = book.styleBridge || '';
    const bridgePath = bridgeId
      ? path.join(SYSTEM_DIR, 'extravagantdocs', 'bridges', `${bridgeId}.css`)
      : '';

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Extravagantdocs template not found: ${templatePath}`);
    }

    const styleChunks = [
      resolveImports(corePath),
      resolveImports(templatePath),
      resolveImports(browserPrintPath),
    ];

    if (adapterPath && fs.existsSync(adapterPath)) {
      styleChunks.push(resolveImports(adapterPath));
    }

    if (bridgePath && fs.existsSync(bridgePath)) {
      styleChunks.push(resolveImports(bridgePath));
    }

    if (runtime) {
      styleChunks.push(RUNTIME_CSS);
    }
    return styleChunks.join('\n\n');
  }

  const corePath = path.join(SYSTEM_DIR, 'vera-core.css');
  const templatePath = resolveLegacyTemplatePath(book);
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

  if (runtime) {
    styleChunks.push(RUNTIME_CSS);
  }
  return styleChunks.join('\n\n');
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function mergeManifest(baseManifest, overrideManifest) {
  return {
    ...baseManifest,
    ...overrideManifest,
    book: {
      ...(baseManifest.book || {}),
      ...(overrideManifest.book || {}),
    },
    pages: Array.isArray(overrideManifest.pages) ? overrideManifest.pages : baseManifest.pages,
  };
}

function loadManifest(manifestPath, seen = new Set()) {
  const resolvedPath = path.resolve(manifestPath);
  if (seen.has(resolvedPath)) {
    throw new Error(`Manifest extends cycle detected: ${resolvedPath}`);
  }
  seen.add(resolvedPath);

  const manifest = readYaml(resolvedPath);
  if (!manifest || typeof manifest !== 'object') {
    throw new Error(`Invalid manifest: ${resolvedPath}`);
  }

  if (!manifest.extends) {
    seen.delete(resolvedPath);
    return manifest;
  }

  const basePath = path.resolve(path.dirname(resolvedPath), manifest.extends);
  if (!fileExists(basePath)) {
    throw new Error(`Extended manifest not found: ${basePath}`);
  }

  const baseManifest = loadManifest(basePath, seen);
  const overrideManifest = { ...manifest };
  delete overrideManifest.extends;
  seen.delete(resolvedPath);
  return mergeManifest(baseManifest, overrideManifest);
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

  if (usesExtravagantDocs(manifest.book)) {
    const templatePath = resolveExtravagantTemplatePath(manifest.book);
    if (!manifest.book.styleTemplate) {
      errors.push('book.styleTemplate is required when book.styleSystem is extravagantdocs');
    }
    if (!fileExists(templatePath)) {
      errors.push(`extravagantdocs template CSS not found: ${templatePath}`);
    }
  } else {
    const templatePath = resolveLegacyTemplatePath(manifest.book);
    if (!fileExists(templatePath)) {
      errors.push(`theme CSS not found: ${templatePath}`);
    }
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

function isGrammarBridgeVolumeBook(book) {
  return /^grammar-bridge-vol[12](?:-xd)?$/i.test(String(book && book.id || ''));
}

function isGrammarBridgeXdVolume(book) {
  return usesExtravagantDocs(book)
    && book.styleBridge === 'grammar-bridge'
    && isGrammarBridgeVolumeBook(book);
}

function isGrammarBridgeStructuralCoverPage(page) {
  return page
    && page.kind === 'legacy-page'
    && /(^|\/)vol[12]-cover\.html$/i.test(String(page.source && page.source.path || ''));
}

function isGrammarBridgeStructuralTocPage(page) {
  return page
    && page.kind === 'legacy-page'
    && /(^|\/)vol[12]-toc\.html$/i.test(String(page.source && page.source.path || ''));
}

function detectGrammarBridgeTipOnlyPage(page) {
  if (!page || page.kind !== 'legacy-page' || !page.source || !page.source.path) {
    return false;
  }
  const absPath = path.join(CONTENT_DIR, page.source.path);
  if (!fileExists(absPath)) {
    return false;
  }
  const html = stripLegacyEmoji(sanitizeLegacyPalette(fs.readFileSync(absPath, 'utf8')));
  const $ = cheerio.load(`<div class="xd-bridge-tip-probe">${html}</div>`, null, false);
  const $root = $('.xd-bridge-tip-probe');
  const tipCount = $root.children('.tip-box').length;
  const headingCount = $root.children('.section-title, .part-header').length;
  return tipCount === 1 && headingCount === 0;
}

function parseGrammarBridgeTocItems(book, sourcePath) {
  const absPath = path.join(CONTENT_DIR, sourcePath);
  if (!fileExists(absPath)) {
    return [];
  }

  const html = fs.readFileSync(absPath, 'utf8');
  const $ = cheerio.load(html);
  return $('.toc-item').map((_, el) => {
    const $item = $(el);
    const rawNumber = getTextContent($item.find('.title b').first()).replace(/:$/, '');
    const chapterLabel = normalizeGrammarBridgeChapterLabel(book, {}, rawNumber);
    const title = getTextContent($item.find('.title').clone().find('b').remove().end());
    const pageNo = getTextContent($item.find('.page-num').first());
    return {
      number: chapterLabel,
      title,
      page: pageNo
    };
  }).get().filter((item) => item.title);
}

function createGrammarBridgeGeneratedTocPage(book, sourcePath) {
  const items = parseGrammarBridgeTocItems(book, sourcePath);
  if (!items.length) {
    return null;
  }

  return {
    kind: 'toc',
    id: `${book.id}-generated-toc`,
    title: 'Contents',
    columns: 2,
    generatedBy: 'grammar-bridge-legacy-toc',
    items
  };
}

function preprocessGrammarBridgeVolumePages(book, pages) {
  const coverIndex = pages.findIndex((page) => page.kind === 'cover');
  const legacyTocPage = pages.find((page) => isGrammarBridgeStructuralTocPage(page));
  const generatedTocPage = legacyTocPage
    ? createGrammarBridgeGeneratedTocPage(book, legacyTocPage.source.path)
    : null;

  const filteredPages = pages
    .filter((page) => !isGrammarBridgeStructuralCoverPage(page))
    .filter((page) => !isGrammarBridgeStructuralTocPage(page));

  const mainPages = [];
  const endMatterPages = [];
  let currentChapter = null;
  let lastContentPage = null;
  let chapterSectionIndex = 0;

  filteredPages.forEach((page) => {
    if (page.kind === 'chapter-opener') {
      currentChapter = {
        title: page.title || '',
        subtitle: page.subtitle || ''
      };
      lastContentPage = null;
      chapterSectionIndex = 0;
      mainPages.push(page);
      return;
    }

    const nextPage = {
      ...page,
      meta: {
        ...(page.meta || {})
      }
    };

    if (currentChapter && ['problem-set', 'answer-grid', 'explanations'].includes(nextPage.kind)) {
      nextPage.meta.chapterTitle = currentChapter.title;
      nextPage.meta.chapterSubtitle = currentChapter.subtitle;
      const chapterLabel = [currentChapter.subtitle, currentChapter.title].filter(Boolean).join(' · ');
      if (nextPage.kind === 'problem-set') {
        nextPage.title = nextPage.title || `${chapterLabel} 연습문제`;
      }
      if (nextPage.kind === 'answer-grid') {
        nextPage.title = nextPage.title || `${chapterLabel} 빠른 정답`;
      }
      if (nextPage.kind === 'explanations') {
        nextPage.title = nextPage.title || `${chapterLabel} 상세 해설`;
      }
    }

    if (nextPage.kind === 'legacy-page' && currentChapter) {
      nextPage.meta.chapterTitle = currentChapter.title;
      nextPage.meta.chapterSubtitle = currentChapter.subtitle;
      const isTipOnly = detectGrammarBridgeTipOnlyPage(nextPage);
      nextPage.meta.tipOnly = isTipOnly;
      if (isTipOnly && lastContentPage) {
        nextPage.meta.inlineTip = true;
      } else if (!isTipOnly) {
        chapterSectionIndex += 1;
        nextPage.meta.chapterSectionIndex = chapterSectionIndex;
        if (isLayoutRuleEnabled(book, 'startSubsectionOnNewPage', 'startSectionOnNewPage')) {
          nextPage.meta.startSubsectionOnNewPage = true;
        }
      }
      lastContentPage = nextPage;
    } else if (nextPage.kind === 'problem-set') {
      lastContentPage = null;
    }

    if (nextPage.kind === 'problem-set') {
      mainPages.push({
        kind: 'chapter-opener',
        id: `${nextPage.id}-opener`,
        title: `${currentChapter ? currentChapter.title : ''} 연습문제`,
        subtitle: currentChapter ? currentChapter.subtitle : 'Practice',
        variant: 'practice'
      });
      mainPages.push(nextPage);
      return;
    }

    if (['answer-grid', 'explanations'].includes(nextPage.kind)) {
      endMatterPages.push(nextPage);
      return;
    }

    mainPages.push(nextPage);
  });

  const finalPages = [...mainPages];
  if (generatedTocPage) {
    const insertIndex = coverIndex === -1 ? 0 : 1;
    finalPages.splice(insertIndex, 0, generatedTocPage);
  }

  if (endMatterPages.length) {
    finalPages.push({
      kind: 'chapter-opener',
      id: `${book.id}-endmatter`,
      title: '빠른 정답 & 상세 해설',
      subtitle: 'Answer Key',
      variant: 'endmatter'
    });
    finalPages.push(...endMatterPages);
  }

  return finalPages;
}

function ensureDefaultPages(book, pages) {
  const normalizedPages = normalizePageSequence(Array.isArray(pages) ? [...pages] : []);
  if (!normalizedPages.length || !isCoverLikePage(normalizedPages[0])) {
    normalizedPages.unshift({
      kind: 'cover',
      id: `${book.id}-auto-cover`
    });
  }
  if (isGrammarBridgeXdVolume(book)) {
    return preprocessGrammarBridgeVolumePages(book, normalizedPages);
  }
  if (isLayoutRuleEnabled(book, 'insertExplanationOpener')) {
    return preprocessExplanationOpenerPages(book, normalizedPages);
  }
  return normalizedPages;
}

function preprocessExplanationOpenerPages(book, pages) {
  const normalizedPages = [...pages];
  const coverIndex = normalizedPages.findIndex((page) => isCoverLikePage(page));
  const firstContentPage = normalizedPages.find((page) => page.kind !== 'cover');
  if (!firstContentPage) {
    return normalizedPages;
  }

  const insertIndex = coverIndex === -1 ? 0 : coverIndex + 1;
  const alreadyHasOpener = normalizedPages[insertIndex] && normalizedPages[insertIndex].kind === 'chapter-opener';
  if (alreadyHasOpener) {
    return normalizedPages;
  }

  const rules = (book && book.layoutRules) || {};
  normalizedPages.splice(insertIndex, 0, {
    kind: 'chapter-opener',
    id: `${book.id}-explanation-opener`,
    title: rules.explanationOpenerTitle || '상세 해설',
    subtitle: rules.explanationOpenerSubtitle || 'Answer & Analysis',
  });

  return normalizedPages;
}

function getProblemSetPageClass(book, page = {}) {
  const classes = ['compact-design', 'xd-problem-set-page'];
  const problemColumns = Number(((book || {}).layoutRules || {}).problemColumns || 0);
  if (problemColumns === 2) {
    classes.push('xd-problem-set-page--two-column');
  }
  return classes.join(' ');
}

function renderPageShellStart(classNames) {
  return `<div class="${classNames.filter(Boolean).join(' ')}">`;
}

function addClassesToFirstPageDiv(html, extraClasses = []) {
  const classesToAdd = extraClasses.filter(Boolean);
  if (!classesToAdd.length) {
    return html;
  }

  return String(html || '').replace(/<div class="([^"]*\bpage\b[^"]*)"/, (match, className) => {
    const merged = Array.from(new Set(`${className} ${classesToAdd.join(' ')}`.trim().split(/\s+/)));
    return `<div class="${merged.join(' ')}"`;
  });
}

function stripLegacyPageNumberMarkup(html) {
  return String(html || '').replace(/\s*<div class="page-number">[\s\S]*?<\/div>\s*/g, '\n');
}

function renderCoverPage(page, book) {
  if (usesExtravagantDocs(book) && book.styleTemplate === 'grammar-bridge') {
    const cover = book.cover || {};
    const mainTitle = cover.mainTitle || book.title;
    const edition = cover.edition || '2026 EDITION';
    const label = cover.label || 'GRAMMAR BRIDGE';
    const artUrl = getCoverArtUrl(book);
    return `
${renderPageShellStart(['page', 'page--fixed', 'cover-page', 'no-header-footer', 'xd-gb-cover'])}
  <div class="xd-gb-cover__frame">
    <img class="xd-gb-cover__art" src="${artUrl}" alt="">
    <div class="xd-gb-cover__overlay">
      <div class="xd-gb-cover__brand">Vera's Flavor</div>
      <div class="xd-gb-cover__rule"></div>
      <div class="xd-gb-cover__label">${escapeHtml(label)}</div>
      <div class="xd-gb-cover__title">${escapeHtml(mainTitle)}</div>
      <div class="xd-gb-cover__edition">${escapeHtml(edition)}</div>
    </div>
  </div>
</div>
`;
  }

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

function renderPagedCoverPage(page, book) {
  if (usesExtravagantDocs(book) && book.styleTemplate === 'grammar-bridge') {
    const cover = book.cover || {};
    const mainTitle = cover.mainTitle || book.title;
    const edition = cover.edition || '2026 EDITION';
    const label = cover.label || 'GRAMMAR BRIDGE';
    const artUrl = getCoverArtUrl(book);
    return `
<section class="xd-paged-cover xd-gb-cover xd-gb-cover--paged-native" style="--xd-cover-image: url('${artUrl}');">
  <div class="xd-gb-cover__overlay">
    <div class="xd-gb-cover__brand">Vera's Flavor</div>
    <div class="xd-gb-cover__rule"></div>
    <div class="xd-gb-cover__label">${escapeHtml(label)}</div>
    <div class="xd-gb-cover__title">${escapeHtml(mainTitle)}</div>
    <div class="xd-gb-cover__edition">${escapeHtml(edition)}</div>
  </div>
</section>
`;
  }

  const cover = book.cover || {};
  const mainTitle = cover.mainTitle || book.title;
  const edition = cover.edition || book.level;
  return `
<section class="xd-paged-cover">
  <div class="cover-layout">
    <div class="cover-brand">${escapeHtml(book.brand || book.author)}</div>
    <div class="cover-main-title">${escapeHtml(mainTitle)}</div>
    <div class="cover-edition">${escapeHtml(edition)}</div>
    <div class="cover-author">${escapeHtml(book.author)}</div>
  </div>
</section>
`;
}

function renderTocPage(page) {
  if (page.generatedBy === 'grammar-bridge-legacy-toc') {
    return renderGrammarBridgeTocPage(page);
  }

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

function canUpgradeLegacyTocHtml(html) {
  const source = String(html || '');
  return /\btoc-part-title\b/.test(source)
    && /\btoc-list\b/.test(source)
    && /\bpage-num\b/.test(source);
}

function renderUpgradedLegacyTocPage(page, book, html) {
  const $ = cheerio.load(String(html || ''));
  const title = $('.toc-header').first().text().trim()
    || (/(^|\/)toc[-_0-9a-z]*\d\.html$/i.test(String(page.source && page.source.path || '')) ? 'CONTENTS (Continued)' : '')
    || page.title
    || 'Contents';
  const $container = $('.page-content').first().length ? $('.page-content').first() : $('body');

  const sections = [];
  let currentTitle = '';
  let currentItems = [];

  const flush = () => {
    if (!currentTitle && !currentItems.length) return;
    sections.push({
      title: currentTitle,
      items: currentItems,
    });
    currentTitle = '';
    currentItems = [];
  };

  $container.children().each((_, element) => {
    const $el = $(element);
    if ($el.hasClass('toc-header')) {
      return;
    }
    if ($el.hasClass('toc-part-title')) {
      flush();
      currentTitle = $el.text().trim();
      return;
    }
    if ($el.hasClass('toc-list')) {
      const items = $el.find('.toc-item').map((__, itemEl) => {
        const $item = $(itemEl);
        return {
          title: $item.find('.title').text().replace(/\s+/g, ' ').trim(),
          page: $item.find('.page-num').text().trim(),
        };
      }).get().filter((item) => item.title);
      currentItems.push(...items);
    }
  });
  flush();

  const sectionsHtml = sections.map((section) => {
    const itemsHtml = section.items.map((item) => `
        <li class="toc-item">
          <span class="toc-item-title">${escapeHtml(item.title)}</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">${escapeHtml(item.page || '')}</span>
        </li>`).join('\n');

    return `
      <section class="toc-upgraded-section">
        <h2 class="toc-upgraded-part-title">${escapeHtml(section.title || '')}</h2>
        <ol class="toc-list">
${itemsHtml}
        </ol>
      </section>`;
  }).join('\n');

  return `
${renderPageShellStart(['page', 'page--fixed', 'toc-page', 'no-header-footer', 'toc-page--upgraded'])}
  <div class="page-content">
    <div class="toc toc--upgraded-legacy">
      <h1 class="toc-title">${escapeHtml(title)}</h1>
${sectionsHtml}
    </div>
  </div>
</div>
`;
}

function renderGrammarBridgeTocPage(page, options = {}) {
  const paged = options.paged === true;
  const items = (page.items || []).map((item) => `
      <li class="xd-gb-toc__item">
        <span class="xd-gb-toc__chapter">${escapeHtml(item.number || '')}</span>
        <span class="xd-gb-toc__entry-title">${escapeHtml(item.title || '')}</span>
        <span class="xd-gb-toc__page">${escapeHtml(item.page || '')}</span>
      </li>`).join('\n');

  const body = `
  <div class="xd-gb-toc">
    <div class="xd-gb-toc__eyebrow">Grammar Bridge</div>
    <h1 class="xd-gb-toc__title">${escapeHtml(page.title || 'Contents')}</h1>
    <ol class="xd-gb-toc__list">
${items}
    </ol>
  </div>`;

  if (paged) {
    return `
${createPagedRunningMarkers({ author: "Vera's Flavor", title: page.title || 'Contents' }, {
  headerLeft: 'Grammar Bridge',
  headerRight: page.title || 'Contents'
})}
<section class="xd-paged-section xd-paged-section--toc" data-section-id="${escapeHtml(page.id || 'toc')}">
${body}
</section>`;
  }

  return `
${renderPageShellStart(['page', 'page--fixed', 'toc-page', 'xd-gb-toc-page', 'no-header-footer'])}
  <div class="page-content">
${body}
  </div>
</div>
`;
}

function renderChapterOpener(page) {
  return `
${renderPageShellStart(['page', 'page--fixed', 'chapter-page', 'no-header-footer', page.variant ? `chapter-page--${escapeHtml(page.variant)}` : ''])}
  <div class="page-content">
    <div class="chapter-opener-body">
      <div class="chapter-opener-label">${escapeHtml(page.subtitle || '')}</div>
      <div class="chapter-opener-title">${escapeHtml(page.title || '')}</div>
    </div>
  </div>
</div>
`;
}

function applyPagedFixedPageStyle(html, pageName) {
  return String(html || '').replace(
    /<div class="([^"]*\bpage\b[^"]*)">/,
    `<div class="$1" style="page: ${escapeHtml(pageName)};">`
  );
}

function renderPagedFixedChapterOpener(page) {
  return applyPagedFixedPageStyle(renderChapterOpener(page), 'xd-opener');
}

function renderPagedChapterOpener(page) {
  const variantClass = page.variant ? ` xd-paged-opener--${escapeHtml(page.variant)}` : '';
  return `
<section class="xd-paged-opener${variantClass}" data-page-kind="chapter-opener" data-page-id="${escapeHtml(page.id || '')}">
  <div class="xd-paged-opener__body">
    <div class="chapter-opener-label">${escapeHtml(page.subtitle || '')}</div>
    <div class="chapter-opener-title">${escapeHtml(page.title || '')}</div>
  </div>
</section>
`;
}

function renderPagedFixedTocPage(page) {
  return applyPagedFixedPageStyle(renderGrammarBridgeTocPage(page), 'xd-fixed');
}

function sanitizeLegacyPalette(html) {
  return String(html || '')
    .replace(/linear-gradient\(([^)]*)\)/gi, (_, inner) => {
      const colorMatch = String(inner || '').match(/(#[0-9a-fA-F]{3,8}|var\(--[^)]+\))/);
      return colorMatch ? colorMatch[1] : '#1B2A4A';
    })
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

function stripLegacyEmoji(html) {
  return String(html || '')
    .replace(/<span[^>]*class=["'][^"']*\bemoji\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span[^>]*class=["'][^"']*\bemoji\b[^"']*["'][^>]*\/>/gi, '');
}

function extractLegacyPagePayload(html) {
  const $ = cheerio.load(stripLegacyEmoji(sanitizeLegacyPalette(html)));
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

function getTextContent($node) {
  return $node.text().replace(/\s+/g, ' ').trim();
}

function splitGrammarBridgeLabel(value) {
  const parts = String(value || '').split(/\s+-\s+/).map((item) => item.trim()).filter(Boolean);
  return {
    main: parts[0] || String(value || '').trim(),
    sub: parts[1] || ''
  };
}

function extractNumericSuffix(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function resolveGrammarBridgeEditorialChapterNumber(book, page, rawLabel = '') {
  const bookId = String(book && book.id || '');
  const sourcePath = String(page && page.source && page.source.path || '');
  const sourceMatch = sourcePath.match(/grammar\/bridge\/ch(\d{2})-/);
  const rawNumber = extractNumericSuffix(rawLabel);
  const metaNumber = extractNumericSuffix(page && page.meta && page.meta.chapterSubtitle || '');

  if (/^grammar-bridge-vol2(?:-xd)?$/.test(bookId)) {
    if (metaNumber !== null) {
      return metaNumber;
    }
    if (sourceMatch) {
      return Number(sourceMatch[1]) + 10;
    }
    if (rawNumber !== null) {
      return rawNumber >= 12 ? rawNumber : rawNumber + 10;
    }
  }

  if (/^grammar-bridge-vol1(?:-xd)?$/.test(bookId)) {
    return metaNumber !== null ? metaNumber : rawNumber;
  }

  if (/^grammar-bridge-ch(0[2-9]|10)(?:-xd)?$/.test(bookId)) {
    const bundleNo = sourceMatch ? Number(sourceMatch[1]) : extractNumericSuffix(bookId);
    if (bundleNo !== null) {
      return bundleNo + 10;
    }
  }

  if (rawLabel && /^Part\s+\d+/i.test(rawLabel) && rawNumber !== null) {
    return rawNumber;
  }

  return null;
}

function normalizeGrammarBridgeChapterLabel(book, page, rawLabel = '') {
  const chapterNo = resolveGrammarBridgeEditorialChapterNumber(book, page, rawLabel);
  if (chapterNo === null) {
    return String(rawLabel || '').trim();
  }
  return `Chapter ${chapterNo}`;
}

function normalizeGrammarBridgeLegacyHtml(book, page, html) {
  const normalizedHtml = String(html || '')
    .replace(/(<span[^>]*class=["'][^"']*\bpart-number\b[^"']*["'][^>]*>)\s*Part\s+(\d+)\s*(<\/span>)/gi, (match, open, number, close) => {
      return `${open}${normalizeGrammarBridgeChapterLabel(book, page, `Part ${number}`)}${close}`;
    })
    .replace(/(<b>)\s*Part\s+(\d+)\s*(:\s*<\/b>)/gi, (match, open, number, close) => {
      return `${open}${normalizeGrammarBridgeChapterLabel(book, page, `Part ${number}`)}${close}`;
    });

  const chapterNo = resolveGrammarBridgeEditorialChapterNumber(book, page, '');
  if (chapterNo === null) {
    return normalizedHtml;
  }

  const $ = cheerio.load(`<div class="xd-gb-normalize-root">${normalizedHtml}</div>`, null, false);
  const chapterSectionIndex = Number(page && page.meta && page.meta.chapterSectionIndex || 0);
  const $sectionTitle = $('.xd-gb-normalize-root').find('.section-title').first();

  if (chapterSectionIndex && $sectionTitle.length) {
    const currentHtml = $sectionTitle.html() || '';
    const nextHtml = currentHtml.replace(
      /^(\s*(?:<span[^>]*class=["'][^"']*\bemoji\b[^"']*["'][^>]*>[\s\S]*?<\/span>\s*)?)(\d+(?:\.\d+)+(?:\.)?)/,
      (match, prefix) => `${prefix}${chapterNo}.${chapterSectionIndex}.`
    );
    if (nextHtml !== currentHtml) {
      $sectionTitle.html(nextHtml);
    }
  }

  $('.xd-gb-normalize-root')
    .find('.section-title, .subsection-title, .chapter-header, h1, h2, h3, h4')
    .each((_, el) => {
      const $el = $(el);
      const currentHtml = $el.html() || '';
      let nextHtml = currentHtml
        .replace(
          /^(\s*(?:<span[^>]*class=["'][^"']*\bemoji\b[^"']*["'][^>]*>[\s\S]*?<\/span>\s*)?)(\d+)((?:\.\d+)+(?:\.)?)/,
          (match, prefix, rawTop, suffix) => `${prefix}${chapterNo}${suffix}`
        )
        .replace(
          /^(\s*)(Ch(?:apter)?\.?\s*)(\d+)(\b)/i,
          (match, prefix, label) => `${prefix}${label}${chapterNo}`
        );

      if (nextHtml !== currentHtml) {
        $el.html(nextHtml);
      }
    });

  return $('.xd-gb-normalize-root').html().trim();
}

function getCoverArtUrl(book) {
  const coverPath = book.coverArt
    ? path.join(ROOT, book.coverArt)
    : path.join(ROOT, '05_assets', 'backgrounds', 'extravagantdocs-grammar-bridge-cover.svg');
  return pathToFileURL(coverPath).href;
}

function collectGrammarBridgeGroups($, $container) {
  const intro = [];
  const groups = [];
  let current = null;

  $container.contents().each((_, node) => {
    const $node = $(node);
    if (node.type === 'text') {
      const text = $node.text().trim();
      if (!text) return;
      const paragraph = `<p>${escapeHtml(text)}</p>`;
      if (current) current.items.push(paragraph);
      else intro.push(paragraph);
      return;
    }

    if (node.type !== 'tag') {
      return;
    }

    if ($node.is('style') || $node.hasClass('emoji') || $node.hasClass('tip-box-title') || $node.hasClass('section-title') || $node.hasClass('part-header')) {
      return;
    }

    if ($node.is('h4')) {
      current = {
        title: getTextContent($node),
        items: []
      };
      groups.push(current);
      return;
    }

    const html = $.html(node).trim();
    if (!html) return;

    if (current) current.items.push(html);
    else intro.push(html);
  });

  return {
    introHtml: intro.join('\n'),
    groups
  };
}

function collectGrammarBridgeTipCards($, $root) {
  return $root.children('.tip-box').map((_, el) => {
    const $tip = $(el);
    const firstParagraph = $tip.find('p').first();
    const bold = firstParagraph.find('b').first().text().trim();
    const title = bold.replace(/^Q\d+\s*:\s*/i, '').trim() || 'Key Point';
    return {
      title,
      items: [$tip.html().trim()]
    };
  }).get();
}

function splitHtmlLines(html) {
  return String(html || '')
    .replace(/^<p[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .split(/<br\s*\/?>/i)
    .map((line) => line.replace(/\u00a0/g, ' ').trim())
    .filter(Boolean);
}

function renderStructuredGrammarCardGrid($, $table) {
  const cards = [];
  const rows = $table.find('tbody > tr').toArray();

  for (let index = 0; index < rows.length; index += 2) {
    const $formulaRow = $(rows[index]);
    const $exampleRow = $(rows[index + 1]);
    const formulaCells = $formulaRow.find('td');
    const exampleCells = $exampleRow.find('td');

    if (formulaCells.length < 4 || exampleCells.length < 2) {
      continue;
    }

    cards.push({
      title: getTextContent(formulaCells.eq(0)),
      ifFormula: (formulaCells.eq(1).html() || '').trim(),
      mainFormula: (formulaCells.eq(2).html() || '').trim(),
      meaning: (formulaCells.eq(3).html() || '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      ifExample: (exampleCells.eq(0).html() || '').trim(),
      mainExample: (exampleCells.eq(1).html() || '').trim()
    });
  }

  if (!cards.length) {
    return $.html($table);
  }

  return `
<div class="xd-gb-formula-grid">
  ${cards.map((card) => `
  <article class="xd-gb-formula-card">
    <div class="xd-gb-formula-card__head">
      <h3 class="xd-gb-formula-card__title">${escapeHtml(card.title)}</h3>
      <div class="xd-gb-formula-card__meaning">${escapeHtml(card.meaning)}</div>
    </div>
    <div class="xd-gb-formula-card__body">
      <div class="xd-gb-formula-card__row">
        <div class="xd-gb-formula-card__label">If절</div>
        <div class="xd-gb-formula-card__formula">${card.ifFormula}</div>
        <div class="xd-gb-formula-card__example">${card.ifExample}</div>
      </div>
      <div class="xd-gb-formula-card__row">
        <div class="xd-gb-formula-card__label">주절</div>
        <div class="xd-gb-formula-card__formula">${card.mainFormula}</div>
        <div class="xd-gb-formula-card__example">${card.mainExample}</div>
      </div>
    </div>
  </article>`).join('\n')}
</div>`;
}

function renderGrammarBridgeFocusExample(html) {
  const lines = splitHtmlLines(html);
  if (!lines.length) {
    return '';
  }

  const [lead, ...rest] = lines;
  return `
<div class="xd-gb-focus-example">
  <div class="xd-gb-focus-example__lead">${lead}</div>
  ${rest.length ? `<div class="xd-gb-focus-example__steps">
    ${rest.map((line) => `<div class="xd-gb-focus-example__step">${line.replace(/^→\s*/, '')}</div>`).join('\n')}
  </div>` : ''}
</div>`;
}

function renderGrammarBridgeFaqGroup(group) {
  const sourceHtml = (group.items || []).join('\n');
  const $ = cheerio.load(`<div class="xd-gb-faq-root">${sourceHtml}</div>`, null, false);
  const rawHtml = $('.xd-gb-faq-root').find('p').first().html() || $('.xd-gb-faq-root').html() || '';
  const lines = splitHtmlLines(rawHtml);
  const paragraphs = [];
  const bullets = [];

  lines.forEach((line, index) => {
    let current = line;
    if (index === 0) {
      current = current.replace(/<b>[\s\S]*?<\/b>/i, '').trim();
    }
    current = current.replace(/^A:\s*/i, '').trim();
    if (!current) {
      return;
    }
    if (/^(•|·|&bull;|&#8226;|→)\s*/i.test(current)) {
      bullets.push(current.replace(/^(•|·|&bull;|&#8226;|→)\s*/i, '').trim());
      return;
    }
    paragraphs.push(current);
  });

  return `
<article class="xd-gb-group xd-gb-group--faq">
  <div class="xd-gb-group__body">
    <div class="xd-gb-faq-card">
      <div class="xd-gb-faq-card__eyebrow">FAQ</div>
      <div class="xd-gb-faq-card__question">${escapeHtml(group.title || '')}</div>
      <div class="xd-gb-faq-card__answer">
        ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}
        ${bullets.length ? `<ul class="xd-gb-faq-list">
          ${bullets.map((item) => `<li>${item}</li>`).join('\n')}
        </ul>` : ''}
      </div>
    </div>
  </div>
</article>`;
}

function transformGrammarBridgeGroupItems(items) {
  const sourceHtml = (items || []).map((item) => String(item)
    .replace(/<br>\s*(\([^<]+\))/gi, '<span class="xd-gb-inline-note">$1</span>')
    .replace(/margin-top:-10px;/gi, '')
  ).join('\n');

  const $ = cheerio.load(`<div class="xd-gb-transform-root">${sourceHtml}</div>`, null, false);
  const $root = $('.xd-gb-transform-root');

  $root.find('.structured-grammar-table').each((_, el) => {
    const $table = $(el);
    $table.replaceWith(renderStructuredGrammarCardGrid($, $table));
  });

  $root.find('p').each((_, el) => {
    const $paragraph = $(el);
    const style = ($paragraph.attr('style') || '').toLowerCase();
    if (style.includes('background')) {
      $paragraph.replaceWith(renderGrammarBridgeFocusExample($.html($paragraph)));
      return;
    }
    $paragraph.removeAttr('style');
  });

  $root.find('ul, li, h4, div, table, tr, td, th').removeAttr('style');
  $root.find('.emoji, .tip-box-title').remove();

  return $root.html().trim();
}

function renderGrammarBridgeGroup(group, context = {}) {
  if (context.isFaqPage) {
    return renderGrammarBridgeFaqGroup(group);
  }

  const items = transformGrammarBridgeGroupItems(group.items || []);
  return `
<article class="xd-gb-group">
  <h2 class="xd-gb-group__title">${escapeHtml(group.title || '')}</h2>
  <div class="xd-gb-group__body">
${items}
  </div>
</article>`;
}

function renderGrammarBridgeLegacyPage(page, book, html) {
  const $ = cheerio.load(`<div class="xd-gb-fragment">${html}</div>`, null, false);
  const $root = $('.xd-gb-fragment');
  const $partHeader = $root.children('.part-header').first();
  const rawPartNumber = getTextContent($partHeader.find('.part-number').first());
  const partNumber = normalizeGrammarBridgeChapterLabel(book, page, rawPartNumber);
  const partLabelRaw = getTextContent($partHeader.clone().find('.part-number').remove().end());
  const partLabel = splitGrammarBridgeLabel(partLabelRaw);
  const sectionTitle = getTextContent($root.children('.section-title').first());

  let pageLabel = '';
  let introHtml = '';
  let groups = [];

  if ($root.children('.tip-box').length > 1) {
    groups = collectGrammarBridgeTipCards($, $root);
  } else if ($root.children('.tip-box').length === 1 && !$root.children('.section-title').length) {
    const $tip = $root.children('.tip-box').first();
    pageLabel = getTextContent($tip.children('.tip-box-title').first()) || 'Vera Insight';
    const collected = collectGrammarBridgeGroups($, $tip);
    introHtml = collected.introHtml;
    groups = collected.groups;
  } else {
    const collected = collectGrammarBridgeGroups($, $root);
    introHtml = collected.introHtml;
    groups = collected.groups;
  }

  const displayTitle = sectionTitle || pageLabel || partLabel.main || book.title;
  const displaySub = partLabel.sub || '';
  const pageClasses = ['page', 'page--fixed', 'legacy-page', 'xd-gb-page'];
  pageClasses.push(groups.length >= 2 ? 'xd-gb-page--balanced' : 'xd-gb-page--editorial');
  const isFaqPage = /자주 하는 질문/.test(displayTitle);

  const headerLeft = escapeHtml(book.shortTitle || book.brand || book.author);
  const headerRight = escapeHtml(partLabel.main || book.title);
  const eyebrow = [partNumber, displaySub].filter(Boolean).join(' / ');

  return `
${renderPageShellStart(pageClasses)}
  <div class="page-header">
    <span>${headerLeft}</span>
    <span>${headerRight}</span>
  </div>
  <div class="page-content">
    <div class="xd-gb-shell">
      <div class="xd-gb-shell__intro">
        ${eyebrow ? `<div class="xd-gb-shell__eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
        <h1 class="xd-gb-shell__title">${escapeHtml(displayTitle)}</h1>
        ${introHtml ? `<div class="xd-gb-shell__lede">${introHtml}</div>` : ''}
      </div>
      ${groups.length ? `<div class="xd-gb-shell__groups">
${groups.map((group) => `${renderGrammarBridgeGroup(group, { isFaqPage })}\n<div class="xd-gb-group-spacer"></div>`).join('\n')}
      </div>` : ''}
    </div>
  </div>
  <div class="page-footer"></div>
</div>
`;
}

function createPagedRunningMarkers(book, options = {}) {
  const headerLeft = options.headerLeft || book.author;
  const headerRight = options.headerRight || book.title;
  return `
<div class="xd-paged-running-source xd-paged-running-source--left">${escapeHtml(headerLeft)}</div>
<div class="xd-paged-running-source xd-paged-running-source--right">${escapeHtml(headerRight)}</div>`;
}

function createPagedSection(sectionId, pageClass, book, blocks, options = {}) {
  const sectionClasses = ['xd-paged-section'];
  if (pageClass) {
    sectionClasses.push(...String(pageClass).split(/\s+/).filter(Boolean));
  }
  if (options.variant) {
    sectionClasses.push(`xd-paged-section--${options.variant}`);
  }

  const titleHtml = options.title
    ? `<h2 class="xd-paged-section__title">${escapeHtml(options.title)}</h2>`
    : '';
  const bodyHtml = blocks.map((block, index) => `<div class="flow-block" data-block-id="${escapeHtml(`${sectionId}-${index + 1}`)}">${block}</div>`).join('\n');

  return `
${createPagedRunningMarkers(book, options)}
<section class="${sectionClasses.join(' ')}" data-section-id="${escapeHtml(sectionId)}">
  ${titleHtml}
${bodyHtml}
</section>`;
}

function renderGrammarBridgeLegacyPaged(page, book, html) {
  const $ = cheerio.load(`<div class="xd-gb-fragment">${html}</div>`, null, false);
  const $root = $('.xd-gb-fragment');
  const $partHeader = $root.children('.part-header').first();
  const rawPartNumber = getTextContent($partHeader.find('.part-number').first());
  const partNumber = normalizeGrammarBridgeChapterLabel(book, page, rawPartNumber);
  const partLabelRaw = getTextContent($partHeader.clone().find('.part-number').remove().end());
  const partLabel = splitGrammarBridgeLabel(partLabelRaw);
  const sectionTitle = getTextContent($root.children('.section-title').first());

  let pageLabel = '';
  let introHtml = '';
  let groups = [];

  if ($root.children('.tip-box').length > 1) {
    groups = collectGrammarBridgeTipCards($, $root);
  } else if ($root.children('.tip-box').length === 1 && !$root.children('.section-title').length) {
    const $tip = $root.children('.tip-box').first();
    pageLabel = getTextContent($tip.children('.tip-box-title').first()) || 'Vera Insight';
    const collected = collectGrammarBridgeGroups($, $tip);
    introHtml = collected.introHtml;
    groups = collected.groups;
  } else {
    const collected = collectGrammarBridgeGroups($, $root);
    introHtml = collected.introHtml;
    groups = collected.groups;
  }

  const displayTitle = sectionTitle || pageLabel || partLabel.main || book.title;
  const displaySub = partLabel.sub || '';
  const isFaqPage = /자주 하는 질문/.test(displayTitle);
  const content = `
<div class="xd-gb-shell ${groups.length >= 2 ? 'xd-gb-shell--balanced' : 'xd-gb-shell--editorial'}">
  <div class="xd-gb-shell__intro">
    <h1 class="xd-gb-shell__title">${escapeHtml(displayTitle)}</h1>
    ${introHtml ? `<div class="xd-gb-shell__lede">${introHtml}</div>` : ''}
  </div>
  ${groups.length ? `<div class="xd-gb-shell__groups">
${groups.map((group) => renderGrammarBridgeGroup(group, { isFaqPage })).join('\n')}
  </div>` : ''}
</div>`;

  const sectionClasses = [
    'xd-paged-section',
    'xd-paged-section--legacy',
    groups.length >= 2 ? 'xd-paged-section--balanced' : 'xd-paged-section--editorial'
  ];
  if (page && page.meta && page.meta.startSubsectionOnNewPage) {
    sectionClasses.push('xd-paged-section--isolated');
  }

  return `
${createPagedRunningMarkers(book, {
  headerLeft: book.shortTitle || book.brand || book.author,
  headerRight: partLabel.main || book.title
})}
<section class="${sectionClasses.join(' ')}" data-section-id="${escapeHtml(page.id || '')}">
${content}
</section>`;
}

function renderGrammarBridgeInlineTipPaged(page, book, html) {
  const $ = cheerio.load(`<div class="xd-gb-fragment">${html}</div>`, null, false);
  const $tip = $('.xd-gb-fragment').children('.tip-box').first();
  if (!$tip.length) {
    return renderGrammarBridgeLegacyPaged(page, book, html);
  }

  const collected = collectGrammarBridgeGroups($, $tip);
  const title = getTextContent($tip.children('.tip-box-title').first()) || "Vera's Flavor Tip";
  const inlineBlocks = [
    '<article class="xd-gb-inline-tip-card">',
    `  <h2 class="xd-gb-inline-tip-card__title">${escapeHtml(title)}</h2>`,
    collected.introHtml ? `  <div class="xd-gb-inline-tip-card__lede">${collected.introHtml}</div>` : '',
    ...collected.groups.map((group) => renderGrammarBridgeGroup(group)),
    '</article>'
  ].filter(Boolean).join('\n');

  return `
<section class="xd-gb-inline-tip" data-section-id="${escapeHtml(page.id || '')}">
  ${inlineBlocks}
</section>`;
}

function renderFixedLegacyMarkup(page, book, contentHtml, options = {}) {
  const pageClasses = ['page', 'page--fixed', 'legacy-page'];
  if (page.layout === 'compact') {
    pageClasses.push('compact-design');
  }
  if (options.extraClasses) {
    pageClasses.push(...options.extraClasses);
  }

  const headerLeft = escapeHtml(options.headerLeft || book.author);
  const headerRight = escapeHtml(options.headerRight || book.title);
  const footerValue = options.footerText || '';
  const footerText = footerValue ? `<span class="page-footer-text">${escapeHtml(footerValue)}</span>` : '';

  return `
${renderPageShellStart(pageClasses)}
  <div class="page-header">
    <span>${headerLeft}</span>
    <span>${headerRight}</span>
  </div>
  <div class="page-content">
${contentHtml}
  </div>
  <div class="page-footer">${footerText}</div>
</div>
`;
}

function renderPagedFixedLegacySection(page, book, contentHtml, options = {}) {
  const footerValue = options.footerText || '';
  const footerText = footerValue ? `<span class="xd-paged-fixed-legacy__footer-text">${escapeHtml(footerValue)}</span>` : '';
  const extraClasses = Array.isArray(options.extraClasses) ? options.extraClasses.filter(Boolean) : [];
  return `
<section class="${['xd-paged-fixed-legacy', ...extraClasses].join(' ')}" data-page-kind="legacy-page" data-page-id="${escapeHtml(page.id || '')}">
  <div class="xd-paged-fixed-legacy__header">
    <span>${escapeHtml(options.headerLeft || book.author)}</span>
    <span>${escapeHtml(options.headerRight || book.title)}</span>
  </div>
  <div class="xd-paged-fixed-legacy__content">
${contentHtml}
  </div>
  <div class="xd-paged-fixed-legacy__footer">${footerText}</div>
</section>`;
}

function isFlowFriendlyLegacyPagedHtml(html) {
  return /\bdetailed-answer-section\b/.test(String(html || ''))
    || /\bexplanation-problem\b/.test(String(html || ''));
}

function renderLegacyPage(page, book, options = {}) {
  const absPath = path.join(CONTENT_DIR, page.source.path);
  let html = stripLegacyEmoji(sanitizeLegacyPalette(fs.readFileSync(absPath, 'utf8').trim()));
  if (/^grammar-bridge-vol[12](?:-xd)?$/.test(String(book.id || '')) || /^grammar-bridge-ch(0[2-9]|10)(?:-xd)?$/.test(String(book.id || ''))) {
    html = normalizeGrammarBridgeLegacyHtml(book, page, html);
  }
  const legacyPayload = extractLegacyPagePayload(html);
  const mode = options.renderer || 'runtime';

  if (usesExtravagantDocs(book) && book.styleBridge === 'grammar-bridge') {
    if (mode === 'paged-native' && page.meta && page.meta.inlineTip) {
      return renderGrammarBridgeInlineTipPaged(page, book, html);
    }
    if (mode === 'paged-native') {
      return renderGrammarBridgeLegacyPaged(page, book, html);
    }
    return renderGrammarBridgeLegacyPage(page, book, html);
  }

  if (isCoverLikePage(page)) {
    return mode === 'paged-native' ? renderPagedCoverPage(page, book) : renderCoverPage(page, book);
  }

  if (/(^|\/)toc(?:[-_a-z0-9]*)?\.html$/i.test(page.source.path)) {
    if (canUpgradeLegacyTocHtml(html)) {
      return renderUpgradedLegacyTocPage(page, book, html);
    }
    if (mode === 'paged-native') {
      return addClassesToFirstPageDiv(stripLegacyPageNumberMarkup(html), ['page--fixed', 'toc-page', 'no-header-footer']);
    }
    return html;
  }

  if (mode === 'paged-native' && legacyPayload && legacyPayload.contentHtml) {
    if (isFlowFriendlyLegacyPagedHtml(legacyPayload.contentHtml)) {
      return `
${createPagedRunningMarkers(book, {
  headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author),
  headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title)
})}
<section class="xd-paged-section xd-paged-section--legacy xd-paged-section--legacy-flow" data-section-id="${escapeHtml(page.id || '')}">
${legacyPayload.contentHtml}
</section>`;
    }
    if (usesExtravagantDocs(book)) {
      return renderPagedFixedLegacySection(page, book, legacyPayload.contentHtml, {
        headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author),
        headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title),
        footerText: page.meta && page.meta.footerText ? page.meta.footerText : legacyPayload.footerText,
      });
    }
    return `
${createPagedRunningMarkers(book, {
  headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author),
  headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title)
})}
<section class="xd-paged-section xd-paged-section--legacy" data-section-id="${escapeHtml(page.id || '')}">
${legacyPayload.contentHtml}
</section>`;
  }

  if (legacyPayload && legacyPayload.contentHtml) {
    const forwardedClasses = legacyPayload.classes.filter((className) => ![
      'page',
      'page-number',
      'cover-page',
      'no-header-footer',
    ].includes(className));
    if (mode === 'paged-native') {
      return renderPagedFixedLegacySection(page, book, legacyPayload.contentHtml, {
        headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author),
        headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title),
        footerText: page.meta && page.meta.footerText ? page.meta.footerText : legacyPayload.footerText,
        extraClasses: forwardedClasses,
      });
    }
    return renderFixedLegacyMarkup(page, book, legacyPayload.contentHtml, {
      headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : (legacyPayload.headerLeft || book.author),
      headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : (legacyPayload.headerRight || book.title),
      footerText: page.meta && page.meta.footerText ? page.meta.footerText : legacyPayload.footerText,
      extraClasses: forwardedClasses,
    });
  }

  if (mode === 'paged-native') {
    if (isFlowFriendlyLegacyPagedHtml(html)) {
      return `
${createPagedRunningMarkers(book, {
  headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : book.author,
  headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : book.title
})}
<section class="xd-paged-section xd-paged-section--legacy xd-paged-section--legacy-flow" data-section-id="${escapeHtml(page.id || '')}">
${html}
</section>`;
    }
    return renderPagedFixedLegacySection(page, book, html, {
      headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : book.author,
      headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : book.title,
      footerText: page.meta && page.meta.footerText ? page.meta.footerText : '',
    });
  }

  return renderFixedLegacyMarkup(page, book, html, {
    headerLeft: page.meta && page.meta.headerLeft ? page.meta.headerLeft : book.author,
    headerRight: page.meta && page.meta.headerRight ? page.meta.headerRight : book.title,
    footerText: page.meta && page.meta.footerText ? page.meta.footerText : '',
  });
}

function renderProblem(problem, options = {}) {
  if (options.styleSystem === 'extravagantdocs') {
    const compactClass = options.compact ? ' problem--compact' : '';
    const choiceClass = problem.choiceLayout === 'single-column' || options.singleColumn ? ' problem-choices--single-column' : '';
    const instruction = problem.instruction ? `<div class="problem-instruction">${renderInline(problem.instruction)}</div>` : '';
    const stemClass = problem.stem && /[A-Za-z]/.test(problem.stem) ? 'problem-stem eng-text' : 'problem-stem';
    const circled = ['', '①', '②', '③', '④', '⑤'];
    const choices = (problem.choices || []).map((choice, index) => `
      <li>
        <span class="problem-choice-marker">${circled[index + 1] || `${index + 1}.`}</span>
        <span class="problem-choice-text">${escapeHtml(normalizeChoice(choice))}</span>
      </li>`).join('');

    return `
<article class="problem problem--xd${compactClass}" data-problem-id="${escapeHtml(problem.id || '')}">
  <div class="problem-shell">
    <div class="problem-gutter">
      <span class="problem-number">${escapeHtml(problem.number)}</span>
    </div>
    <div class="problem-body">
      ${instruction}
      <div class="${stemClass}">${renderMultilineText(problem.stem || problem.text || '')}</div>
      ${(problem.choices || []).length ? `<ol class="problem-choices${choiceClass}">${choices}</ol>` : ''}
    </div>
  </div>
</article>`;
  }

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

function renderPassageCluster(passage, options = {}) {
  const questions = Array.isArray(passage.questions) ? passage.questions : [];
  const questionsHtml = questions.map((question) => renderProblem(question, {
    compact: true,
    typeBadge: 'Question',
    extraClass: 'problem--within-passage',
    singleColumn: true,
    styleSystem: options.styleSystem || ''
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

function renderVocabularySectionIntro(data, page = {}) {
  const parts = [];
  if (data && data.day) {
    parts.push(`DAY ${String(data.day).padStart(2, '0')}`);
  }
  if (page.title) {
    parts.push(page.title);
  }

  const eyebrow = parts.join(' · ');
  const theme = data && data.theme ? data.theme : '';

  if (!eyebrow && !theme) {
    return '';
  }

  return `
<section class="xd-vocab-intro">
  ${eyebrow ? `<div class="xd-vocab-intro__eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
  ${theme ? `<h2 class="xd-vocab-intro__title">${escapeHtml(theme)}</h2>` : ''}
</section>`;
}

function renderAnswerGrid(problems, options = {}) {
  const items = problems.map((problem) => `
      <div class="answer-grid-item">
        <span class="answer-grid-number">${escapeHtml(problem.number)}</span>
        <span class="answer-grid-answer">${formatAnswer(problem.answer)}</span>
      </div>`).join('\n');

  return `
<div class="answer-grid">
  <h3 class="answer-grid-title">${escapeHtml(options.title || '빠른 정답')}</h3>
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

function chunkItems(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
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

function renderPageToArtifact(page, book, options = {}) {
  const renderer = options.renderer || 'runtime';
  if (renderer === 'paged-native') {
    if (page.kind === 'cover') {
      return { fixed: [], flows: [], paged: [renderPagedCoverPage(page, book)] };
    }
    if (page.kind === 'toc') {
      if (usesExtravagantDocs(book) && book.styleTemplate === 'grammar-bridge') {
        return { fixed: [], flows: [], paged: [renderPagedFixedTocPage(page)] };
      }
      return { fixed: [], flows: [], paged: [renderGrammarBridgeTocPage(page, { paged: true })] };
    }
    if (page.kind === 'chapter-opener') {
      return {
        fixed: [],
        flows: [],
        paged: [renderPagedChapterOpener(page)]
      };
    }
    if (page.kind === 'legacy-page') {
      return { fixed: [], flows: [], paged: [renderLegacyPage(page, book, { renderer })] };
    }
    if (page.kind === 'content') {
      const doc = readJson(path.join(CONTENT_DIR, page.source.path));
      const blocks = (doc.blocks || []).map(renderContentBlock);
      return {
        fixed: [],
        flows: [],
        paged: [createPagedSection(page.id || path.basename(page.source.path, '.json'), page.layout === 'compact' ? 'compact-design' : '', book, blocks, {
          headerRight: page.title || book.title
        })]
      };
    }
    if (page.kind === 'problem-set') {
      const data = readJson(path.join(DATA_DIR, page.source.path));
      const problems = filterRange(data.problems || [], page.range);
      const blocks = problems.map((problem) => renderProblem(problem, {
        compact: page.layout === 'compact',
        singleColumn: page.layout === 'single-column',
        styleSystem: usesExtravagantDocs(book) ? 'extravagantdocs' : ''
      }));
      return {
        fixed: [],
        flows: [],
        paged: [createPagedSection(page.id || path.basename(page.source.path, '.json'), getProblemSetPageClass(book, page), book, blocks, {
          headerRight: page.title || book.title
        })]
      };
    }
    if (page.kind === 'passage-set') {
      const data = readJson(path.join(DATA_DIR, page.source.path));
      const paged = [];
      (data.passages || []).forEach((passage) => {
        paged.push(createPagedSection(`${page.id || 'passage'}-${passage.number}`, 'passage-cluster-page', book, [renderPassageCluster(passage, {
          styleSystem: usesExtravagantDocs(book) ? 'extravagantdocs' : ''
        })], {
          headerRight: page.title || book.title
        }));
      });
      return { fixed: [], flows: [], paged };
    }
    if (page.kind === 'vocabulary-set') {
      const data = readJson(path.join(DATA_DIR, page.source.path));
      const words = Array.isArray(data.words) ? data.words : [];
      const blocks = [];
      const introBlock = renderVocabularySectionIntro(data, page);
      if (introBlock) blocks.push(introBlock);
      blocks.push(...words.map((word) => renderWordEntry(word, { compact: page.layout === 'compact' })));
      const headerRight = data.day ? `DAY ${String(data.day).padStart(2, '0')}` : (page.title || 'Vocabulary');
      return {
        fixed: [],
        flows: [],
        paged: [createPagedSection(page.id || path.basename(page.source.path, '.json'), '', book, blocks, {
          headerRight,
        })]
      };
    }
    if (page.kind === 'answer-grid') {
      const data = readJson(path.join(DATA_DIR, page.source.path));
      const problems = filterRange(data.problems || [], page.range);
      return {
        fixed: [],
        flows: [],
        paged: [createPagedSection(page.id || path.basename(page.source.path, '.json'), 'xd-answer-grid-page', book, [renderAnswerGrid(problems, {
          title: page.title || '빠른 정답'
        })], {
          headerRight: page.title || '정답',
          title: page.title || '빠른 정답',
          variant: 'answers'
        })]
      };
    }
    if (page.kind === 'explanations') {
      const data = readJson(path.join(DATA_DIR, page.source.path));
      const problems = filterRange(data.problems || [], page.range).filter((problem) => problem.explanation);
      const blocks = usesExtravagantDocs(book)
        ? chunkItems(problems.map(renderExplanation), 2).map((pair) => `
<div class="explanation-pair">
  ${pair.join('\n')}
</div>`)
        : problems.map(renderExplanation);
      return {
        fixed: [],
        flows: [],
        paged: [createPagedSection(page.id || path.basename(page.source.path, '.json'), usesExtravagantDocs(book) ? 'xd-explanations-page' : '', book, blocks, {
          headerRight: page.title || '해설',
          title: page.title || '상세 해설',
          variant: 'explanations'
        })]
      };
    }
  }

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
    const blocks = problems.map((problem) => renderProblem(problem, {
      compact: page.layout === 'compact',
      singleColumn: page.layout === 'single-column',
      styleSystem: usesExtravagantDocs(book) ? 'extravagantdocs' : ''
    }));
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), getProblemSetPageClass(book, page), book, blocks, {
        headerRight: page.title || book.title
      })]
    };
  }
  if (page.kind === 'passage-set') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const fixed = [];
    const flows = [];
    (data.passages || []).forEach((passage) => {
      flows.push(createFlowSection(`${page.id || 'passage'}-${passage.number}`, 'passage-cluster-page', book, [renderPassageCluster(passage, {
        styleSystem: usesExtravagantDocs(book) ? 'extravagantdocs' : ''
      })], {
        footerText: page.meta && page.meta.label ? `${page.meta.label} ${page.meta.title || ''}`.trim() : ''
      }));
    });
    return { fixed, flows };
  }
  if (page.kind === 'vocabulary-set') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const words = Array.isArray(data.words) ? data.words : [];
    const blocks = [];
    const introBlock = renderVocabularySectionIntro(data, page);
    if (introBlock) blocks.push(introBlock);
    blocks.push(...words.map((word) => renderWordEntry(word, { compact: page.layout === 'compact' })));
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
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), 'xd-answer-grid-page', book, [renderAnswerGrid(problems, {
        title: page.title || '빠른 정답'
      })], {
        headerRight: page.title || '정답'
      })]
    };
  }
  if (page.kind === 'explanations') {
    const data = readJson(path.join(DATA_DIR, page.source.path));
    const problems = filterRange(data.problems || [], page.range).filter((problem) => problem.explanation);
    const blocks = usesExtravagantDocs(book)
      ? chunkItems(problems.map(renderExplanation), 2).map((pair) => `
<div class="explanation-pair">
  ${pair.join('\n')}
</div>`)
      : problems.map(renderExplanation);
    return {
      fixed: [],
      flows: [createFlowSection(page.id || path.basename(page.source.path, '.json'), usesExtravagantDocs(book) ? 'xd-explanations-page' : '', book, blocks, {
        headerRight: page.title || '해설'
      })]
    };
  }
  throw new Error(`Unsupported page kind: ${page.kind}`);
}

function buildBook(bookId, options = {}) {
  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  if (!fileExists(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = loadManifest(manifestPath);
  const validationErrors = validateManifest(manifest, manifestPath);
  if (validationErrors.length) {
    throw new Error(validationErrors.join('\n'));
  }

  const pages = ensureDefaultPages(manifest.book, manifest.pages);
  const renderer = options.renderer || 'runtime';
  const css = resolveStyles(manifest.book, pages, {
    runtime: renderer !== 'paged-native',
    adapter: renderer === 'paged-native' ? 'paged-native' : ''
  });
  const fixedPages = [];
  const flowSections = [];
  const pagedSections = [];

  pages.forEach((page) => {
    const rendered = renderPageToArtifact(page, manifest.book, { renderer });
    fixedPages.push(...rendered.fixed);
    flowSections.push(...rendered.flows);
    pagedSections.push(...(rendered.paged || []));
  });

  const html = renderer === 'paged-native'
    ? `<!DOCTYPE html>
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
<body class="${escapeHtml([
    usesExtravagantDocs(manifest.book) ? 'style-system-extravagantdocs' : 'style-system-legacy',
    manifest.book.styleTemplate ? `style-template-${manifest.book.styleTemplate}` : '',
    manifest.book.subject ? `subject-${manifest.book.subject}` : '',
    'renderer-paged-native'
  ].filter(Boolean).join(' '))}">
${pagedSections.join('\n')}
  <script src="file://${path.join(ROOT, 'node_modules', 'pagedjs', 'dist', 'paged.polyfill.js')}"></script>
  <script>
window.PagedConfig = window.PagedConfig || {};
window.PagedConfig.auto = true;
document.addEventListener('DOMContentLoaded', function () {
  var checkReady = setInterval(function () {
    if (document.querySelector('.pagedjs_pages')) {
      clearInterval(checkReady);
      window.__TEXTBOOK_READY__ = true;
      document.documentElement.dataset.textbookReady = 'true';
    }
  }, 200);
  setTimeout(function () {
    clearInterval(checkReady);
    if (!window.__TEXTBOOK_READY__) {
      window.__TEXTBOOK_READY__ = true;
    }
  }, 120000);
});
  </script>
</body>
</html>`
    : `<!DOCTYPE html>
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
<body class="${escapeHtml([
    usesExtravagantDocs(manifest.book) ? 'style-system-extravagantdocs' : 'style-system-legacy',
    manifest.book.styleTemplate ? `style-template-${manifest.book.styleTemplate}` : '',
    manifest.book.subject ? `subject-${manifest.book.subject}` : ''
  ].filter(Boolean).join(' '))}">
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
  const reviewRenderer = manifest.book.reviewRenderer || 'runtime';
  const writeTargets = [];

  if (renderer === 'paged-native') {
    if (reviewRenderer === 'paged-native') {
      writeTargets.push(path.join(OUTPUT_HTML_DIR, `${bookId}.html`));
    }
    writeTargets.push(path.join(OUTPUT_HTML_DIR, `${bookId}-paged-native.html`));
  } else if (reviewRenderer === 'paged-native') {
    writeTargets.push(path.join(OUTPUT_HTML_DIR, `${bookId}-runtime.html`));
  } else {
    writeTargets.push(path.join(OUTPUT_HTML_DIR, `${bookId}.html`));
  }

  writeTargets.forEach((outputPath) => {
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`  ✅ HTML: ${outputPath}`);
  });
}

function main() {
  const args = process.argv.slice(2);
  const bookFlag = args.indexOf('--book');
  const rendererFlag = args.indexOf('--renderer');
  const renderer = rendererFlag !== -1 && args[rendererFlag + 1] ? args[rendererFlag + 1] : 'runtime';
  if (bookFlag === -1 || !args[bookFlag + 1]) {
    console.error('Usage: node 04_scripts/build-textbook.js --book <bookId|all> [--renderer runtime|paged-native]');
    process.exit(1);
  }

  const bookArg = args[bookFlag + 1];
  if (bookArg === 'all') {
    const files = fs.readdirSync(BOOKS_DIR).filter((file) => file.endsWith('.yaml'));
    files.forEach((file) => {
      const bookId = file.replace(/\.yaml$/, '');
      console.log(`\n📘 Building: ${bookId}`);
      buildBook(bookId, { renderer });
    });
    return;
  }

  console.log(`\n📘 Building: ${bookArg}`);
  buildBook(bookArg, { renderer });
}

if (require.main === module) {
  main();
}

module.exports = {
  buildBook,
  readYaml,
  loadManifest,
  fileExists,
  validateManifest,
  ensureDefaultPages,
  resolveStyles,
  usesExtravagantDocs,
};
