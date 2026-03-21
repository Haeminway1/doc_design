#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { loadManifest, ensureDefaultPages, usesExtravagantDocs } = require('./build-textbook.js');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const REPORTS_DIR = path.join(ROOT, '02_textbooks', 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'extravagantdocs-structure-audit.json');
const REPORT_MD = path.join(REPORTS_DIR, 'extravagantdocs-structure-audit.md');

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function discoverBooks(requestedBookIds) {
  const all = fs.readdirSync(BOOKS_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => path.basename(name, '.yaml'))
    .sort();
  const filtered = requestedBookIds.length ? all.filter((bookId) => requestedBookIds.includes(bookId)) : all;
  return filtered.filter((bookId) => {
    try {
      const manifest = loadManifest(path.join(BOOKS_DIR, `${bookId}.yaml`));
      return usesExtravagantDocs(manifest.book);
    } catch (_) {
      return false;
    }
  });
}

function getPagedHtmlPath(bookId) {
  return path.join(HTML_SRC_DIR, `${bookId}-paged-native.html`);
}

function countByKind(pages) {
  return pages.reduce((acc, page) => {
    const key = page.kind || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countChapterOpenersByVariant(pages) {
  return pages.reduce((acc, page) => {
    if (page.kind !== 'chapter-opener') return acc;
    const key = page.variant || 'default';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function findFirstIndex(haystack, needles) {
  const indexes = needles
    .map((needle) => haystack.indexOf(needle))
    .filter((index) => index !== -1);
  if (!indexes.length) return -1;
  return Math.min(...indexes);
}

function findRegexIndex(haystack, pattern) {
  const match = pattern.exec(haystack);
  return match ? match.index : -1;
}

function analyzeBook(bookId) {
  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  const manifest = loadManifest(manifestPath);
  const expectedPages = ensureDefaultPages(manifest.book || {}, manifest.pages || []);
  const expectedKinds = countByKind(expectedPages);
  const expectedOpeners = countChapterOpenersByVariant(expectedPages);
  const htmlPath = getPagedHtmlPath(bookId);
  const htmlExists = fs.existsSync(htmlPath);
  const issues = [];
  const checks = [];

  if (!htmlExists) {
    return {
      bookId,
      manifest: path.relative(ROOT, manifestPath),
      pagedHtml: path.relative(ROOT, htmlPath),
      status: 'fail',
      issues: ['paged-native html missing'],
      checks,
    };
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const actual = {
    cover: $('.xd-paged-cover, .page.cover-page').length,
    toc: $('.page.toc-page').length,
    openerDefault: $('.xd-paged-opener:not(.xd-paged-opener--practice):not(.xd-paged-opener--endmatter), .page.chapter-page:not(.chapter-page--practice):not(.chapter-page--endmatter)').length,
    openerPractice: $('.xd-paged-opener--practice, .page.chapter-page--practice').length,
    openerEndmatter: $('.xd-paged-opener--endmatter, .page.chapter-page--endmatter').length,
    answerGridTitle: $('.answer-grid-title').length,
    quickAnswerSection: $('.xd-paged-section__title').filter((_, el) => /빠른 정답/.test(normalizeText($(el).text()))).length,
    explanationSection: $('.xd-paged-section__title').filter((_, el) => /상세 해설/.test(normalizeText($(el).text()))).length,
  };

  checks.push(`expected kinds: ${JSON.stringify(expectedKinds)}`);
  checks.push(`expected opener variants: ${JSON.stringify(expectedOpeners)}`);
  checks.push(`actual structure: ${JSON.stringify(actual)}`);

  if ((expectedKinds.cover || 0) > 0 && actual.cover < expectedKinds.cover) {
    issues.push(`cover count too low (${actual.cover} < ${expectedKinds.cover})`);
  }

  if ((expectedKinds.toc || 0) > 0 && actual.toc < expectedKinds.toc) {
    issues.push(`toc count too low (${actual.toc} < ${expectedKinds.toc})`);
  }

  if ((expectedOpeners.default || 0) > 0 && actual.openerDefault < expectedOpeners.default) {
    issues.push(`default chapter opener count too low (${actual.openerDefault} < ${expectedOpeners.default})`);
  }

  if ((expectedOpeners.practice || 0) > 0 && actual.openerPractice < expectedOpeners.practice) {
    issues.push(`practice opener count too low (${actual.openerPractice} < ${expectedOpeners.practice})`);
  }

  if ((expectedOpeners.endmatter || 0) > 0 && actual.openerEndmatter < expectedOpeners.endmatter) {
    issues.push(`endmatter opener count too low (${actual.openerEndmatter} < ${expectedOpeners.endmatter})`);
  }

  if ((expectedKinds['answer-grid'] || 0) > 0 && actual.answerGridTitle === 0 && actual.quickAnswerSection === 0) {
    issues.push('answer-grid expected but no quick-answer marker found');
  }

  if ((expectedKinds.explanations || 0) > 0 && actual.explanationSection === 0) {
    issues.push('explanations expected but no detailed-explanation section marker found');
  }

  const coverIndex = findFirstIndex(html, ['<section class="xd-paged-cover"', '<div class="page cover-page']);
  const tocIndex = findFirstIndex(html, ['<div class="page page--fixed toc-page', '<div class="page toc-page']);
  const endmatterIndex = findFirstIndex(html, ['xd-paged-opener--endmatter', 'chapter-page--endmatter']);
  const answerIndex = Math.min(
    ...[
      findRegexIndex(html, /<h3 class="answer-grid-title">[\s\S]*?빠른 정답[\s\S]*?<\/h3>/i),
      findRegexIndex(html, /<h2 class="xd-paged-section__title">[\s\S]*?빠른 정답[\s\S]*?<\/h2>/i),
    ].filter((index) => index !== -1)
  );
  const explanationIndex = findRegexIndex(html, /<h2 class="xd-paged-section__title">[\s\S]*?상세 해설[\s\S]*?<\/h2>/i);

  if (coverIndex !== -1 && tocIndex !== -1 && tocIndex < coverIndex) {
    issues.push('toc appears before cover in paged-native html');
  }

  if (endmatterIndex !== -1 && answerIndex !== -1 && answerIndex < endmatterIndex) {
    issues.push('answer section appears before endmatter opener');
  }

  if (answerIndex !== Infinity && answerIndex !== -1 && explanationIndex !== -1 && explanationIndex < answerIndex) {
    issues.push('detailed explanation appears before quick answers');
  }

  return {
    bookId,
    manifest: path.relative(ROOT, manifestPath),
    pagedHtml: path.relative(ROOT, htmlPath),
    status: issues.length ? 'fail' : 'pass',
    issues,
    checks,
  };
}

function renderMarkdown(results) {
  const passed = results.filter((result) => result.status === 'pass').length;
  const failed = results.length - passed;
  const lines = [
    '# extravagantdocs Structure Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- Books: ${results.length}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    '',
  ];

  results.forEach((result) => {
    lines.push(`## ${result.bookId}`);
    lines.push('');
    lines.push(`- Status: ${result.status}`);
    lines.push(`- Manifest: ${result.manifest}`);
    lines.push(`- Paged HTML: ${result.pagedHtml}`);
    result.checks.forEach((check) => lines.push(`- Check: ${check}`));
    result.issues.forEach((issue) => lines.push(`- Issue: ${issue}`));
    lines.push('');
  });

  return `${lines.join('\n')}\n`;
}

function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const bookIds = discoverBooks(process.argv.slice(2).filter(Boolean));
  if (!bookIds.length) {
    console.error('No extravagantdocs books found to audit.');
    process.exit(1);
  }

  const results = bookIds.map(analyzeBook);
  const summary = {
    books: results.length,
    passed: results.filter((result) => result.status === 'pass').length,
    failed: results.filter((result) => result.status === 'fail').length,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify({ summary, books: results }, null, 2), 'utf8');
  fs.writeFileSync(REPORT_MD, renderMarkdown(results), 'utf8');

  console.log(`Audited ${summary.books} extravagantdocs book(s)`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`JSON: ${REPORT_JSON}`);
  console.log(`Markdown: ${REPORT_MD}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main();
