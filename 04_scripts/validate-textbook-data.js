#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { loadManifest } = require('./build-textbook.js');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content');
const SOURCE_DIRS = [
  path.join(ROOT, '02_textbooks', 'source'),
  path.join(ROOT, '07_archive', 'textbooks_legacy', 'source'),
];
const REPORT_DIR = path.join(ROOT, '02_textbooks', 'reports');

const SOURCE_MAP = {
  'grammar-advanced': '[편입영어]문법_advanced.html',
  'logic-basic': '[편입영어]논리_basic.html',
  'reading-basic': '[편입영어]독해_basic편.html',
  'reading-bridge': '[편입영어]독해_bridge.html',
  'reading-intermediate': '[편입영어]독해_intermediate.html',
  'syntax-bridge': '[편입영어]구문독해_bridge (1).html',
  'vocab-basic': '[편입영어]보카_basic(1-70).html',
};

function canonicalBookId(bookId) {
  return String(bookId || '').replace(/-xd$/, '');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function resolveSourceFile(sourceFile) {
  for (const dir of SOURCE_DIRS) {
    const absPath = path.join(dir, sourceFile);
    if (fileExists(absPath)) {
      return absPath;
    }
  }
  return path.join(SOURCE_DIRS[0], sourceFile);
}

function analyzeSource(bookId) {
  const sourceFile = SOURCE_MAP[canonicalBookId(bookId)];
  if (!sourceFile) return null;

  const sourcePath = resolveSourceFile(sourceFile);
  if (!fileExists(sourcePath)) {
    return {
      sourceFile,
      sourcePath,
      errors: [`Source file missing: ${sourcePath}`],
    };
  }

  const $ = cheerio.load(fs.readFileSync(sourcePath, 'utf8'));
  const pages = $('div.page');
  const stats = {
    sourceFile,
    sourcePath,
    totalPages: pages.length,
    coverPages: 0,
    tocPages: 0,
    answerPages: 0,
    problemPages: 0,
    contentPages: 0,
    mixedPages: 0,
    vocabOnlyPages: 0,
  };

  pages.each((_, el) => {
    const $page = $(el);
    const hasContent = $page.find('.page-content').length > 0;
    const isCover = $page.hasClass('cover-page') || $page.find('.cover-content').length > 0;
    const isToc = $page.find('.toc-main-title, .toc-header').length > 0;
    const hasAnswer = $page.hasClass('answer-section') ||
      $page.find('.answer-section, .answer-block, .answer-item, .quick-answer-grid, .answer-grid').length > 0;
    const hasProblem = $page.find(
      '.problem, .problem-block, .problem-container, .passage-block, .passage-container, .question-block, .questions-container, section.exercise-section'
    ).length > 0;
    const hasMarkers = $page.find(
      '.section-title, .chapter-header, .step-header, .note-box, .pattern-box, .unit-header, .part-title'
    ).length > 0;
    const hasVocab = $page.find('.vocabulary-section, .word-entry, .vocab-box').length > 0;

    if (isCover) stats.coverPages += 1;
    if (isToc) stats.tocPages += 1;
    if (hasAnswer) stats.answerPages += 1;
    if (hasProblem) stats.problemPages += 1;
    if (hasContent && !isCover && !isToc && !hasAnswer) stats.contentPages += 1;
    if (hasContent && hasMarkers && hasProblem && !hasAnswer) stats.mixedPages += 1;
    if (hasContent && hasVocab && !hasProblem && !hasAnswer && !hasMarkers) stats.vocabOnlyPages += 1;
  });

  return stats;
}

function validateProblemData(filePath, kind, issues, warnings, coverage) {
  const data = readJson(filePath);
  const problems = Array.isArray(data.problems) ? data.problems : [];

  if (!Array.isArray(data.problems)) {
    issues.push(`${kind}: problems array missing in ${path.relative(ROOT, filePath)}`);
    return;
  }

  if (!problems.length) {
    issues.push(`${kind}: empty problems array in ${path.relative(ROOT, filePath)}`);
    return;
  }

  const missingNumbers = problems.filter((problem) => problem.number === undefined || problem.number === null).length;
  const missingAnswers = problems.filter((problem) => !problem.answer).length;
  const missingExplanations = problems.filter((problem) => !problem.explanation).length;
  const missingStem = problems.filter((problem) => (
    !problem.stem &&
    !problem.text &&
    (!Array.isArray(problem.choices) || problem.choices.length === 0)
  )).length;

  coverage.problemTotal += problems.length;
  coverage.problemAnswers += (problems.length - missingAnswers);
  coverage.problemExplanations += (problems.length - missingExplanations);

  if (missingNumbers) issues.push(`${kind}: ${missingNumbers} problems missing number in ${path.relative(ROOT, filePath)}`);
  if (missingStem && kind === 'problem-set') warnings.push(`${kind}: ${missingStem} problems missing stem/text in ${path.relative(ROOT, filePath)}`);
  if (kind === 'answer-grid' && missingAnswers === problems.length) {
    issues.push(`${kind}: all answers missing in ${path.relative(ROOT, filePath)}`);
  }
  if (kind === 'explanations' && missingExplanations === problems.length) {
    issues.push(`${kind}: all explanations missing in ${path.relative(ROOT, filePath)}`);
  }
}

function validatePassageData(filePath, issues, warnings, coverage) {
  const data = readJson(filePath);
  const passages = Array.isArray(data.passages) ? data.passages : [];

  if (!Array.isArray(data.passages)) {
    issues.push(`passage-set: passages array missing in ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (!passages.length) {
    issues.push(`passage-set: empty passages array in ${path.relative(ROOT, filePath)}`);
    return;
  }

  let questionCount = 0;
  let missingAnswers = 0;
  for (const passage of passages) {
    const questions = Array.isArray(passage.questions) ? passage.questions : [];
    questionCount += questions.length;
    missingAnswers += questions.filter((question) => !question.answer).length;
  }

  coverage.passageQuestions += questionCount;
  coverage.passageAnswers += (questionCount - missingAnswers);

  if (!questionCount) {
    issues.push(`passage-set: no questions found in ${path.relative(ROOT, filePath)}`);
  } else if (missingAnswers === questionCount) {
    warnings.push(`passage-set: all question answers missing in ${path.relative(ROOT, filePath)}`);
  }
}

function validateVocabularyData(filePath, issues) {
  const data = readJson(filePath);
  const words = Array.isArray(data.words) ? data.words : [];
  if (!Array.isArray(data.words)) {
    issues.push(`vocabulary-set: words array missing in ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (!words.length) {
    issues.push(`vocabulary-set: empty words array in ${path.relative(ROOT, filePath)}`);
  }
}

function validateManifest(bookId) {
  const manifestPath = path.join(BOOKS_DIR, `${bookId}.yaml`);
  const manifest = loadManifest(manifestPath);
  const issues = new Set();
  const warnings = new Set();
  const sourceStats = analyzeSource(bookId);
  const coverage = {
    legacyAnswerPages: 0,
    passageQuestions: 0,
    passageAnswers: 0,
    problemTotal: 0,
    problemAnswers: 0,
    problemExplanations: 0,
  };
  const pageCounts = {
    legacyPage: 0,
    problemSet: 0,
    passageSet: 0,
    vocabularySet: 0,
    answerGrid: 0,
    explanations: 0,
  };

  for (const page of manifest.pages || []) {
    if (!page || typeof page !== 'object') {
      issues.push(`Invalid page entry in ${path.relative(ROOT, manifestPath)}`);
      continue;
    }

    const relPath = page.source && page.source.path ? page.source.path : null;
    let absPath = null;

    switch (page.kind) {
      case 'legacy-page':
        pageCounts.legacyPage += 1;
        absPath = relPath ? path.join(CONTENT_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`legacy-page source missing: ${relPath || '(empty path)'}`);
          break;
        }
        const html = fs.readFileSync(absPath, 'utf8');
        if (!html.trim()) {
          issues.add(`legacy-page source empty: ${relPath}`);
        }
        if (/정답과 해설|answer-section|answer-item|answer-key-title|answer-key-list/.test(html)) {
          coverage.legacyAnswerPages += 1;
        }
        break;
      case 'problem-set':
        pageCounts.problemSet += 1;
        absPath = relPath ? path.join(DATA_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`problem-set source missing: ${relPath || '(empty path)'}`);
          break;
        }
        validateProblemData(absPath, 'problem-set', issues, warnings, coverage);
        break;
      case 'answer-grid':
        pageCounts.answerGrid += 1;
        absPath = relPath ? path.join(DATA_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`answer-grid source missing: ${relPath || '(empty path)'}`);
          break;
        }
        validateProblemData(absPath, 'answer-grid', issues, warnings, coverage);
        break;
      case 'explanations':
        pageCounts.explanations += 1;
        absPath = relPath ? path.join(DATA_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`explanations source missing: ${relPath || '(empty path)'}`);
          break;
        }
        validateProblemData(absPath, 'explanations', issues, warnings, coverage);
        break;
      case 'passage-set':
        pageCounts.passageSet += 1;
        absPath = relPath ? path.join(DATA_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`passage-set source missing: ${relPath || '(empty path)'}`);
          break;
        }
        validatePassageData(absPath, issues, warnings, coverage);
        break;
      case 'vocabulary-set':
        pageCounts.vocabularySet += 1;
        absPath = relPath ? path.join(DATA_DIR, relPath) : null;
        if (!absPath || !fileExists(absPath)) {
          issues.add(`vocabulary-set source missing: ${relPath || '(empty path)'}`);
          break;
        }
        validateVocabularyData(absPath, issues);
        break;
      default:
        break;
    }
  }

  if (sourceStats && sourceStats.errors) {
    sourceStats.errors.forEach((error) => issues.add(error));
  }

  if (sourceStats && !sourceStats.errors) {
    const hasStructuredAnswerPages = pageCounts.answerGrid > 0 || pageCounts.explanations > 0;
    const hasEmbeddedAnswerData = coverage.legacyAnswerPages > 0 || coverage.passageAnswers > 0 || coverage.problemAnswers > 0 || coverage.problemExplanations > 0;

    if (sourceStats.answerPages > 0 && !hasStructuredAnswerPages && !hasEmbeddedAnswerData) {
      warnings.add(`source has ${sourceStats.answerPages} answer/explanation pages but extracted answer data is empty`);
    }
    if (sourceStats.mixedPages > 0 && pageCounts.legacyPage < sourceStats.mixedPages) {
      warnings.add(`source has ${sourceStats.mixedPages} mixed instructional pages; current extraction may be lossy`);
    }
  }

  return {
    bookId,
    manifestPath,
    pageCounts,
    source: sourceStats,
    issues: Array.from(issues),
    warnings: Array.from(warnings),
  };
}

function toMarkdown(report) {
  const lines = [
    '# Textbook Data Validation',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  for (const book of report.books) {
    lines.push(`## ${book.bookId}`);
    lines.push('');
    lines.push(`- Issues: ${book.issues.length}`);
    lines.push(`- Warnings: ${book.warnings.length}`);
    lines.push(`- Manifest: ${path.relative(ROOT, book.manifestPath)}`);
    if (book.source && !book.source.errors) {
      lines.push(`- Source pages: ${book.source.totalPages}`);
      lines.push(`- Source mixed pages: ${book.source.mixedPages}`);
      lines.push(`- Source answer pages: ${book.source.answerPages}`);
    }
    if (book.issues.length) {
      lines.push('');
      lines.push('### Issues');
      for (const issue of book.issues) lines.push(`- ${issue}`);
    }
    if (book.warnings.length) {
      lines.push('');
      lines.push('### Warnings');
      for (const warning of book.warnings) lines.push(`- ${warning}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const requestedBookIds = process.argv.slice(2).filter(Boolean);
  const allBookIds = fs.readdirSync(BOOKS_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .filter((name) => name !== 'README.md')
    .map((name) => path.basename(name, '.yaml'))
    .sort();
  const bookIds = requestedBookIds.length ? allBookIds.filter((bookId) => requestedBookIds.includes(bookId)) : allBookIds;

  const books = bookIds.map(validateManifest);
  const issueCount = books.reduce((sum, book) => sum + book.issues.length, 0);
  const warningCount = books.reduce((sum, book) => sum + book.warnings.length, 0);
  const report = {
    generatedAt: new Date().toISOString(),
    issueCount,
    warningCount,
    books,
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'textbook-data-validation.json');
  const mdPath = path.join(REPORT_DIR, 'textbook-data-validation.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(mdPath, toMarkdown(report), 'utf8');

  console.log(`Validated ${books.length} books`);
  console.log(`Issues: ${issueCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);

  if (issueCount > 0) {
    process.exitCode = 1;
  }
}

main();
