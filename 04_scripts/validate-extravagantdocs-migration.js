#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const REPORTS_DIR = path.join(ROOT, '02_textbooks', 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'extravagantdocs-migration-validation.json');
const REPORT_MD = path.join(REPORTS_DIR, 'extravagantdocs-migration-validation.md');

const { loadManifest, validateManifest, buildBook, usesExtravagantDocs } = require('./build-textbook.js');

const ALLOWED_LAYOUT_RULES = new Set([
  'startSubsectionOnNewPage',
  'startSectionOnNewPage',
  'insertExplanationOpener',
  'explanationOpenerTitle',
  'explanationOpenerSubtitle',
  'problemColumns',
]);

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const bookIds = args.filter((arg) => !arg.startsWith('--'));
  return {
    bookIds,
    build: flags.has('--build'),
  };
}

function discoverExtravagantdocsBooks() {
  return fs.readdirSync(BOOKS_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => path.basename(name, '.yaml'))
    .filter((bookId) => {
      try {
        const manifest = loadManifest(path.join(BOOKS_DIR, `${bookId}.yaml`));
        return usesExtravagantDocs(manifest.book);
      } catch (_) {
        return false;
      }
    })
    .sort();
}

function validateExtravagantConfig(manifest) {
  const issues = [];
  const warnings = [];
  const book = manifest.book || {};
  const rules = book.layoutRules || {};

  if (!usesExtravagantDocs(book)) {
    issues.push('book.styleSystem must be extravagantdocs');
  }
  if (!book.styleTemplate) {
    issues.push('book.styleTemplate is required');
  }
  if (!book.reviewRenderer) {
    warnings.push('book.reviewRenderer is missing; paged-native is recommended');
  } else if (book.reviewRenderer !== 'paged-native') {
    warnings.push(`book.reviewRenderer is ${book.reviewRenderer}; paged-native is recommended`);
  }

  Object.keys(rules).forEach((ruleName) => {
    if (!ALLOWED_LAYOUT_RULES.has(ruleName)) {
      warnings.push(`unknown layout rule: ${ruleName}`);
    }
  });

  return { issues, warnings };
}

function ensurePagedOutput(bookId, shouldBuild) {
  const htmlPath = path.join(HTML_SRC_DIR, `${bookId}.html`);
  const pagedNativePath = path.join(HTML_SRC_DIR, `${bookId}-paged-native.html`);
  if (shouldBuild || !fs.existsSync(htmlPath) || !fs.existsSync(pagedNativePath)) {
    buildBook(bookId, { renderer: 'paged-native' });
  }
  return {
    htmlPath,
    pagedNativePath,
    htmlExists: fs.existsSync(htmlPath),
    pagedNativeExists: fs.existsSync(pagedNativePath),
  };
}

function runAudit(scriptName, bookIds) {
  const scriptPath = path.join(ROOT, '04_scripts', scriptName);
  try {
    execFileSync('node', [scriptPath, ...bookIds], {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { status: 'pass' };
  } catch (error) {
    return {
      status: 'fail',
      message: error.stdout || error.stderr || error.message,
    };
  }
}

function renderMarkdown(report) {
  const lines = [
    '# extravagantdocs Migration Validation',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `- Books: ${report.books.length}`,
    `- Build mode: ${report.build ? 'paged-native rebuild' : 'reuse existing outputs when present'}`,
    `- Passed: ${report.summary.passed}`,
    `- Failed: ${report.summary.failed}`,
    '',
    '## Audit Scripts',
    '',
  ];

  for (const audit of report.audits) {
    lines.push(`- ${audit.name}: ${audit.status}`);
    if (audit.message) {
      lines.push(`  - ${audit.message.split('\n')[0]}`);
    }
  }

  lines.push('');

  for (const book of report.books) {
    lines.push(`## ${book.bookId}`);
    lines.push('');
    lines.push(`- Status: ${book.status}`);
    lines.push(`- Manifest: ${book.manifestPath}`);
    lines.push(`- HTML: ${book.outputs.htmlPath}`);
    lines.push(`- Paged HTML: ${book.outputs.pagedNativePath}`);
    lines.push(`- Output exists: html=${book.outputs.htmlExists}, paged=${book.outputs.pagedNativeExists}`);
    if (book.issues.length) {
      book.issues.forEach((issue) => lines.push(`- Issue: ${issue}`));
    }
    if (book.warnings.length) {
      book.warnings.forEach((warning) => lines.push(`- Warning: ${warning}`));
    }
    lines.push('');
  }

  lines.push('## Reports');
  lines.push('');
  lines.push('- `02_textbooks/reports/textbook-data-validation.md`');
  lines.push('- `02_textbooks/reports/textbook-source-trace-audit.md`');
  lines.push('- `02_textbooks/reports/textbook-render-integrity.md`');
  lines.push('- `02_textbooks/reports/extravagantdocs-structure-audit.md`');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function main() {
  const { bookIds: requestedBookIds, build } = parseArgs(process.argv);
  const targetBookIds = requestedBookIds.length ? requestedBookIds : discoverExtravagantdocsBooks();

  if (!targetBookIds.length) {
    console.error('No extravagantdocs books found to validate.');
    process.exit(1);
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const books = targetBookIds.map((bookId) => {
    const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
    const manifest = loadManifest(manifestPath);
    const manifestErrors = validateManifest(manifest, manifestPath);
    const config = validateExtravagantConfig(manifest);
    const outputs = ensurePagedOutput(bookId, build);
    const issues = [...manifestErrors, ...config.issues];
    const warnings = [...config.warnings];
    if (!outputs.htmlExists) issues.push(`missing html output: ${outputs.htmlPath}`);
    if (!outputs.pagedNativeExists) issues.push(`missing paged-native output: ${outputs.pagedNativePath}`);

    return {
      bookId,
      manifestPath: path.relative(ROOT, manifestPath),
      outputs: {
        htmlPath: path.relative(ROOT, outputs.htmlPath),
        pagedNativePath: path.relative(ROOT, outputs.pagedNativePath),
        htmlExists: outputs.htmlExists,
        pagedNativeExists: outputs.pagedNativeExists,
      },
      issues,
      warnings,
      status: issues.length ? 'fail' : 'pass',
    };
  });

  const audits = [
    { name: 'validate-textbook-data.js', ...runAudit('validate-textbook-data.js', targetBookIds) },
    { name: 'audit-textbook-source-trace.js', ...runAudit('audit-textbook-source-trace.js', targetBookIds) },
    { name: 'audit-render-integrity.js', ...runAudit('audit-render-integrity.js', targetBookIds) },
    { name: 'audit-extravagantdocs-structure.js', ...runAudit('audit-extravagantdocs-structure.js', targetBookIds) },
  ];

  if (targetBookIds.some((bookId) => /^grammar-bridge-/.test(bookId))) {
    audits.push({
      name: 'audit-grammar-bridge-taxonomy.js',
      ...runAudit(
        'audit-grammar-bridge-taxonomy.js',
        targetBookIds.filter((bookId) => /^grammar-bridge-vol[12](?:-xd)?$/.test(bookId)).map((bookId) => bookId.replace(/-xd$/, ''))
      ),
    });
  }

  const failedAudits = audits.filter((audit) => audit.status !== 'pass').length;
  const failedBooks = books.filter((book) => book.status !== 'pass').length;
  const report = {
    generatedAt: new Date().toISOString(),
    build,
    books,
    audits,
    summary: {
      passed: books.length - failedBooks,
      failed: failedBooks,
      auditFailures: failedAudits,
    },
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(REPORT_MD, renderMarkdown(report), 'utf8');

  console.log(`Validated ${books.length} extravagantdocs book(s)`);
  console.log(`JSON: ${REPORT_JSON}`);
  console.log(`Markdown: ${REPORT_MD}`);
  audits.forEach((audit) => console.log(`- ${audit.name}: ${audit.status}`));

  if (failedBooks > 0 || failedAudits > 0) {
    process.exitCode = 1;
  }
}

main();
