#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadManifest, usesExtravagantDocs } = require('./build-textbook.js');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');
const REPORTS_DIR = path.join(ROOT, '02_textbooks', 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'pdf-page-anomalies.json');
const REPORT_MD = path.join(REPORTS_DIR, 'pdf-page-anomalies.md');
const PDFTOTEXT_RETRY_ERRORS = [
  'Couldn\'t find trailer dictionary',
  'Couldn\'t read xref table',
  'Document stream is empty',
];

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getPdfPath(manifest) {
  const bookId = manifest.book.id;
  if (usesExtravagantDocs(manifest.book)) {
    return path.join(PDF_DIR, `${bookId}-paged.pdf`);
  }
  return path.join(PDF_DIR, `${bookId}.pdf`);
}

function getPageCount(pdfPath) {
  const out = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
  const match = out.match(/Pages:\s+(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getPageText(pdfPath, pageNo) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return execFileSync('pdftotext', ['-f', String(pageNo), '-l', String(pageNo), pdfPath, '-'], {
        encoding: 'utf8',
      }).replace(/\f/g, ' ');
    } catch (error) {
      const stderr = String(error.stderr || error.message || '');
      const isTransient = PDFTOTEXT_RETRY_ERRORS.some((token) => stderr.includes(token));
      if (!isTransient || attempt === 4) {
        throw error;
      }
      sleep(300);
    }
  }
  return '';
}

function isSuspiciouslyBlank(lines, manifest, pageNo) {
  const book = manifest.book || {};
  const ignoreSet = new Set([
    normalizeText(book.author),
    normalizeText(book.brand),
    normalizeText(book.title),
    normalizeText(book.shortTitle),
    normalizeText(`Vera's Flavor`),
    normalizeText(`CONTENTS`),
    String(pageNo),
  ].filter(Boolean));

  const informativeTokens = lines.filter((line) => {
    const normalized = normalizeText(line);
    if (!normalized) return false;
    if (ignoreSet.has(normalized)) return false;
    return true;
  });

  const numericTokens = informativeTokens.filter((token) => /^\d{1,3}$/.test(token));
  const choiceTokens = informativeTokens.filter((token) => /^[①②③④⑤]$/.test(token));

  // Answer-grid style pages often extract as many short numeric/choice tokens.
  // Treat those as content-bearing so we do not flag them as blank.
  if (informativeTokens.length >= 20) {
    return false;
  }

  if (numericTokens.length >= 10 && choiceTokens.length >= 5) {
    return false;
  }

  const filtered = lines.filter((line) => {
    const normalized = normalizeText(line);
    if (!normalized) return false;
    if (ignoreSet.has(normalized)) return false;
    if (/^\d+$/.test(normalized)) return false;
    if (normalized.length <= 2) return false;
    return true;
  });

  return filtered.length === 0;
}

function analyzeBook(bookId) {
  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  const manifest = loadManifest(manifestPath);
  const pdfPath = getPdfPath(manifest);
  const exists = fs.existsSync(pdfPath);

  if (!exists) {
    return {
      bookId,
      pdf: path.relative(ROOT, pdfPath),
      status: 'fail',
      issues: ['pdf missing'],
      suspiciousPages: [],
    };
  }

  const pageCount = getPageCount(pdfPath);
  const suspiciousPages = [];

  for (let pageNo = 2; pageNo < pageCount; pageNo += 1) {
    const text = getPageText(pdfPath, pageNo);
    const lines = text.split(/\r?\n/).map(normalizeText).filter(Boolean);
    if (isSuspiciouslyBlank(lines, manifest, pageNo)) {
      suspiciousPages.push(pageNo);
    }
  }

  const issues = suspiciousPages.length
    ? [`suspicious blank interior pages: ${suspiciousPages.slice(0, 20).join(', ')}${suspiciousPages.length > 20 ? '…' : ''}`]
    : [];

  return {
    bookId,
    pdf: path.relative(ROOT, pdfPath),
    pageCount,
    status: issues.length ? 'fail' : 'pass',
    issues,
    suspiciousPages,
  };
}

function renderMarkdown(results) {
  const passed = results.filter((item) => item.status === 'pass').length;
  const failed = results.length - passed;
  const lines = [
    '# PDF Page Anomalies',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `- Books: ${results.length}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    '',
  ];

  for (const result of results) {
    lines.push(`## ${result.bookId}`);
    lines.push('');
    lines.push(`- Status: ${result.status}`);
    lines.push(`- PDF: ${result.pdf}`);
    if (result.pageCount !== undefined) {
      lines.push(`- Pages: ${result.pageCount}`);
    }
    if (result.suspiciousPages.length) {
      lines.push(`- Suspicious blank pages: ${result.suspiciousPages.join(', ')}`);
    }
    if (result.issues.length) {
      result.issues.forEach((issue) => lines.push(`- Issue: ${issue}`));
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const requestedBookIds = process.argv.slice(2).filter(Boolean);
  const bookIds = requestedBookIds.length
    ? requestedBookIds
    : fs.readdirSync(BOOKS_DIR)
      .filter((name) => name.endsWith('.yaml'))
      .map((name) => path.basename(name, '.yaml'))
      .sort();

  const results = bookIds.map(analyzeBook);
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

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main();
