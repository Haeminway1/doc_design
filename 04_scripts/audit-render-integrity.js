#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { loadManifest, usesExtravagantDocs } = require('./build-textbook.js');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data');
const HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const REPORTS_DIR = path.join(ROOT, '02_textbooks', 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'textbook-render-integrity.json');
const REPORT_MD = path.join(REPORTS_DIR, 'textbook-render-integrity.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function resolveAuditHtmlPath(manifest) {
  const bookId = manifest.book.id;
  if (usesExtravagantDocs(manifest.book)) {
    return path.join(HTML_SRC_DIR, `${bookId}.html`);
  }
  return path.join(HTML_DIR, `${bookId}.html`);
}

function analyzeBook(fileName) {
  const manifestPath = path.join(BOOKS_DIR, fileName);
  const manifest = loadManifest(manifestPath);
  const bookId = manifest.book.id;
  const htmlPath = resolveAuditHtmlPath(manifest);
  const htmlExists = fs.existsSync(htmlPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, 'utf8') : '';
  const $ = htmlExists ? cheerio.load(html) : null;
  const pages = manifest.pages || [];
  const issues = [];
  const checks = [];

  if (!htmlExists) {
    issues.push(`final html missing: ${path.relative(ROOT, htmlPath)}`);
  }

  if (htmlExists && $('.page--runtime-overflow').length > 0) {
    issues.push('runtime overflow marker found in final html');
  }

  const firstProblemIndex = pages.findIndex((page) => ['problem-set', 'passage-set'].includes(page.kind));
  const firstAnswerIndex = pages.findIndex((page) => ['answer-grid', 'explanations'].includes(page.kind));
  if (firstProblemIndex !== -1 && firstAnswerIndex !== -1 && firstAnswerIndex < firstProblemIndex) {
    issues.push(`answer/explanations precede content in manifest (${firstAnswerIndex + 1} < ${firstProblemIndex + 1})`);
  }

  const passagePages = pages.filter((page) => page.kind === 'passage-set');
  if (htmlExists && passagePages.length) {
    let expectedPassages = 0;
    let expectedQuestions = 0;
    let expectedQuestionedPassages = 0;

    for (const page of passagePages) {
      const dataPath = path.join(DATA_DIR, page.source.path);
      const data = readJson(dataPath);
      expectedPassages += data.passages.length;
      for (const passage of data.passages) {
        const questions = Array.isArray(passage.questions) ? passage.questions : [];
        expectedQuestions += questions.length;
        if (questions.length) expectedQuestionedPassages += 1;
      }
    }

    const actualClusters = $('.passage-cluster').length;
    const actualPassages = $('.passage-cluster .passage').length;
    const actualQuestions = $('.passage-cluster .problem').length;
    const standaloneQuestions = $('.problem').filter((_, el) => $(el).closest('.passage-cluster').length === 0).length;

    checks.push(`passages expected=${expectedPassages} actualClusters=${actualClusters} actualPassages=${actualPassages}`);
    checks.push(`questions expected=${expectedQuestions} actualInClusters=${actualQuestions}`);

    if (actualClusters !== expectedPassages) {
      issues.push(`passage cluster count mismatch (${actualClusters} !== ${expectedPassages})`);
    }
    if (actualPassages !== expectedPassages) {
      issues.push(`passage count mismatch (${actualPassages} !== ${expectedPassages})`);
    }
    if (actualQuestions !== expectedQuestions) {
      issues.push(`question count mismatch (${actualQuestions} !== ${expectedQuestions})`);
    }
    if (standaloneQuestions > 0) {
      issues.push(`standalone reading questions detected outside passage clusters (${standaloneQuestions})`);
    }

    const brokenClusters = $('.passage-cluster').filter((_, el) => {
      const clusterQuestionCount = Number($(el).attr('data-question-count') || 0);
      const actualCount = $(el).find('.problem').length;
      return clusterQuestionCount !== actualCount;
    }).length;

    if (brokenClusters > 0) {
      issues.push(`passage clusters with mismatched internal question count (${brokenClusters})`);
    }

    if (expectedQuestionedPassages > 0) {
      const emptyClusters = $('.passage-cluster[data-question-count!="0"]').filter((_, el) => $(el).find('.problem').length === 0).length;
      if (emptyClusters > 0) {
        issues.push(`passages with expected questions rendered without questions (${emptyClusters})`);
      }
    }
  }

  return {
    bookId,
    manifest: path.relative(ROOT, manifestPath),
    html: path.relative(ROOT, htmlPath),
    status: issues.length ? 'fail' : 'pass',
    issues,
    checks,
  };
}

function renderMarkdown(results) {
  const lines = [];
  const passed = results.filter((item) => item.status === 'pass').length;
  const failed = results.length - passed;

  lines.push('# Textbook Render Integrity');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`- Books: ${results.length}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed}`);
  lines.push('');

  for (const result of results) {
    lines.push(`## ${result.bookId}`);
    lines.push('');
    lines.push(`- Status: ${result.status}`);
    lines.push(`- Manifest: ${result.manifest}`);
    lines.push(`- HTML: ${result.html}`);
    for (const check of result.checks) {
      lines.push(`- Check: ${check}`);
    }
    if (result.issues.length) {
      for (const issue of result.issues) {
        lines.push(`- Issue: ${issue}`);
      }
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const requestedBookIds = process.argv.slice(2).filter(Boolean);
  const files = fs.readdirSync(BOOKS_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .filter((name) => requestedBookIds.length === 0 || requestedBookIds.includes(path.basename(name, '.yaml')))
    .sort();
  const results = files.map(analyzeBook);
  const summary = {
    books: results.length,
    passed: results.filter((item) => item.status === 'pass').length,
    failed: results.filter((item) => item.status === 'fail').length,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify({ summary, books: results }, null, 2), 'utf8');
  fs.writeFileSync(REPORT_MD, renderMarkdown(results), 'utf8');

  console.log(`Audited ${summary.books} books`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`JSON: ${REPORT_JSON}`);
  console.log(`Markdown: ${REPORT_MD}`);

  if (summary.failed > 0) process.exitCode = 1;
}

main();
