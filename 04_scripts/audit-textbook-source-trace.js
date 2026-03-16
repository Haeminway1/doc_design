#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { loadManifest, usesExtravagantDocs } = require('./build-textbook.js');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data');
const OUTPUT_HTML_DIR = path.join(ROOT, '02_textbooks', 'output', 'html');
const OUTPUT_HTML_SRC_DIR = path.join(ROOT, '02_textbooks', 'output', 'html_src');
const OUTPUT_PDF_DIR = path.join(ROOT, '02_textbooks', 'output', 'pdf');
const SOURCE_FALLBACK_DIRS = [
  path.join(ROOT, '02_textbooks', 'source'),
  path.join(ROOT, '07_archive', 'textbooks_legacy', 'source'),
];
const REPORTS_DIR = path.join(ROOT, '02_textbooks', 'reports');
const REPORT_JSON = path.join(REPORTS_DIR, 'textbook-source-trace-audit.json');
const REPORT_MD = path.join(REPORTS_DIR, 'textbook-source-trace-audit.md');

const SOURCE_MAP = {
  'grammar-advanced': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_advanced.html') },
  'grammar-basic': { mode: 'pdf', path: path.join(ROOT, '02_textbooks', 'source', "vera's flavor 편입영어 문법 basic편(개선) (1).pdf") },
  'grammar-bridge-ch01': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch02': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch03': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch04': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch05': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch06': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch07': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch08': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch09': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-ch10': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part2.html') },
  'grammar-bridge-ch11': { mode: 'shared-split-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part2.html') },
  'grammar-bridge-vol1': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html') },
  'grammar-bridge-vol2': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part2.html') },
  'logic-basic': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]논리_basic.html') },
  'reading-basic': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]독해_basic편.html') },
  'reading-bridge': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]독해_bridge.html') },
  'reading-intermediate': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]독해_intermediate.html') },
  'syntax-basic': { mode: 'pdf', path: path.join(ROOT, '07_archive', 'root_cleanup', "Vera's Flavor 편입영어_ 구문독해 Basic.pdf") },
  'syntax-bridge': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]구문독해_bridge (1).html') },
  'vocab-basic': { mode: 'full-html', path: path.join(ROOT, '02_textbooks', 'source', '[편입영어]보카_basic(1-70).html') },
};

function canonicalBookId(bookId) {
  return String(bookId || '').replace(/-xd$/, '');
}

function isNormalizedSourceComparisonBook(manifest) {
  const book = manifest.book || {};
  if (!usesExtravagantDocs(book)) return false;
  if (book.styleBridge === 'grammar-bridge') return true;
  return false;
}

function resolveAuditOutputPaths(manifest) {
  const bookId = manifest.book.id;
  const isXdPaged = usesExtravagantDocs(manifest.book);
  return {
    htmlPath: isXdPaged
      ? path.join(OUTPUT_HTML_SRC_DIR, `${bookId}.html`)
      : path.join(OUTPUT_HTML_DIR, `${bookId}.html`),
    pdfPath: isXdPaged
      ? path.join(OUTPUT_PDF_DIR, `${bookId}-paged.pdf`)
      : path.join(OUTPUT_PDF_DIR, `${bookId}.pdf`),
  };
}

function resolveSourcePath(sourceConfig) {
  if (!sourceConfig) return null;
  if (fs.existsSync(sourceConfig.path)) {
    return sourceConfig.path;
  }
  const base = path.basename(sourceConfig.path);
  for (const dir of SOURCE_FALLBACK_DIRS) {
    const candidate = path.join(dir, base);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return sourceConfig.path;
}

const MARKER_SELECTORS = [
  '.section-title',
  '.chapter-title',
  '.content-title',
  '.unit-title',
  '.page-title',
  '.pattern-title',
  '.vocab-word',
];

const IGNORED_MARKERS = new Set([
  'CONTENTS',
  '정답과 해설',
]);

const IGNORED_MARKER_PATTERNS = [
  /^vera'?s flavor$/i,
  /^a word from vera$/i,
  /^vera'?s secret flavor$/i,
  /^answers?(&|and)?explanations?$/i,
  /^table of contents$/i,
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactText(text) {
  return normalizeText(text)
    .toLowerCase()
    .replace(/\s+/g, '');
}

function unique(values) {
  return [...new Set(values)];
}

function extractMarkersFromHtml(html, limit = 3) {
  const $ = cheerio.load(html);
  const markers = [];

  for (const selector of MARKER_SELECTORS) {
    $(selector).each((_, el) => {
      const text = normalizeText($(el).text());
      if (!text) return;
      if (text.length < 5 || text.length > 120) return;
      if (IGNORED_MARKERS.has(text)) return;
      if (/^\d+$/.test(text)) return;
      if (IGNORED_MARKER_PATTERNS.some((pattern) => pattern.test(text))) return;
      markers.push(text);
    });
  }

  return unique(markers).slice(0, limit);
}

function sourceStatsForHtml(html) {
  const $ = cheerio.load(html);
  const problemBlocks = $('div.problem').length;
  const numberedProblemBlocks = $('div.problem .problem-number').filter((_, el) => {
    return /\d/.test($(el).text());
  }).length;

  return {
    pageCount: $('div.page').length || null,
    problemBlocks,
    numberedProblemBlocks,
    unnumberedProblemBlocks: problemBlocks - numberedProblemBlocks,
    answerSections: $('div.answer-section').length || 0,
    sectionTitles: $('.section-title').length || 0,
  };
}

function resolveManifestSource(relPath) {
  const contentPath = path.join(CONTENT_DIR, relPath);
  if (fs.existsSync(contentPath)) return contentPath;
  const dataPath = path.join(DATA_DIR, relPath);
  if (fs.existsSync(dataPath)) return dataPath;
  return null;
}

function analyzeJsonAsset(filePath) {
  const data = readJson(filePath);

  if (Array.isArray(data.problems)) {
    const problems = data.problems;
    return {
      kind: 'problems',
      count: problems.length,
      answers: problems.filter((item) => item.answer !== undefined && item.answer !== '').length,
      explanations: problems.filter((item) => item.explanation).length,
      sampleIds: problems.slice(0, 2).map((item) => item.id || item.number).filter(Boolean),
    };
  }

  if (Array.isArray(data.passages)) {
    const passages = data.passages;
    const questions = passages.flatMap((item) => Array.isArray(item.questions) ? item.questions : []);
    return {
      kind: 'passages',
      count: passages.length,
      questions: questions.length,
      answers: questions.filter((item) => item.answer !== undefined && item.answer !== '').length,
      explanations: questions.filter((item) => item.explanation).length,
      sampleIds: passages.slice(0, 2).map((item) => item.id || item.number || item.title).filter(Boolean),
    };
  }

  if (Array.isArray(data.words)) {
    return {
      kind: 'words',
      count: data.words.length,
      sampleIds: data.words.slice(0, 3).map((item) => item.word).filter(Boolean),
    };
  }

  return {
    kind: 'json',
    count: null,
    sampleIds: [],
  };
}

function summarizePageKinds(pages) {
  const counts = {};
  for (const page of pages) {
    counts[page.kind] = (counts[page.kind] || 0) + 1;
  }
  return counts;
}

function sampleExtractedHtmlMarker(pages, outputHtml) {
  const outputText = compactText(cheerio.load(outputHtml).text());
  for (const page of pages) {
    if (!page.source?.path || !page.source.path.endsWith('.html')) continue;
    const filePath = resolveManifestSource(page.source.path);
    if (!filePath) continue;
    const html = fs.readFileSync(filePath, 'utf8');
    const markers = extractMarkersFromHtml(html, 1);
    if (markers.length === 0) continue;
    return {
      sourcePath: page.source.path,
      marker: markers[0],
      foundInOutput: outputText.includes(compactText(markers[0])),
    };
  }
  return null;
}

function analyzeBook(bookFile) {
  const manifestPath = path.join(BOOKS_DIR, bookFile);
  const manifest = loadManifest(manifestPath);
  const bookId = manifest.book.id;
  const normalizedSourceComparison = isNormalizedSourceComparisonBook(manifest);
  const pages = manifest.pages || [];
  const { htmlPath: outputHtmlPath, pdfPath: outputPdfPath } = resolveAuditOutputPaths(manifest);
  const outputHtml = fs.existsSync(outputHtmlPath) ? fs.readFileSync(outputHtmlPath, 'utf8') : '';
  const outputText = outputHtml ? compactText(cheerio.load(outputHtml).text()) : '';
  const sourceConfig = SOURCE_MAP[canonicalBookId(bookId)] || null;

  const pageKinds = summarizePageKinds(pages);
  const resolvedAssets = pages
    .map((page) => page.source?.path)
    .filter(Boolean)
    .map((relPath) => ({ relPath, filePath: resolveManifestSource(relPath) }));

  const missingAssets = resolvedAssets.filter((item) => !item.filePath).map((item) => item.relPath);
  const jsonAssets = resolvedAssets.filter((item) => item.filePath && item.filePath.endsWith('.json'));
  const htmlAssets = resolvedAssets.filter((item) => item.filePath && item.filePath.endsWith('.html'));

  const jsonAssetSummary = jsonAssets.slice(0, 4).map((item) => ({
    path: item.relPath,
    ...analyzeJsonAsset(item.filePath),
  }));

  const extractedHtmlMarker = normalizedSourceComparison
    ? null
    : (outputHtml ? sampleExtractedHtmlMarker(pages, outputHtml) : null);

  let sourceAudit = null;
  if (sourceConfig) {
    const resolvedSourcePath = resolveSourcePath(sourceConfig);
    const exists = fs.existsSync(sourceConfig.path);
    sourceAudit = {
      mode: sourceConfig.mode,
      path: path.relative(ROOT, resolvedSourcePath),
      exists: fs.existsSync(resolvedSourcePath),
    };

    if (sourceAudit.exists && sourceConfig.mode.endsWith('html')) {
      const sourceHtml = fs.readFileSync(resolvedSourcePath, 'utf8');
      sourceAudit.stats = sourceStatsForHtml(sourceHtml);
    }

    if (sourceAudit.exists && sourceConfig.mode === 'full-html' && outputHtml && !normalizedSourceComparison) {
      const sourceHtml = fs.readFileSync(resolvedSourcePath, 'utf8');
      const markers = extractMarkersFromHtml(sourceHtml, 3);
      sourceAudit.markers = markers.map((marker) => ({
        text: marker,
        foundInOutput: outputText.includes(compactText(marker)),
      }));
    }
  }

  const checks = {
    manifestExists: fs.existsSync(manifestPath),
    outputHtmlExists: fs.existsSync(outputHtmlPath),
    outputPdfExists: fs.existsSync(outputPdfPath),
    manifestSourcesResolved: missingAssets.length === 0,
    extractedHtmlMarkerPreserved: extractedHtmlMarker ? extractedHtmlMarker.foundInOutput : true,
    sourceMarkersPreserved: sourceAudit?.markers ? sourceAudit.markers.every((item) => item.foundInOutput) : true,
    sourceExists: sourceAudit ? sourceAudit.exists : null,
  };

  const failures = [];
  for (const [key, value] of Object.entries(checks)) {
    if (value === false) failures.push(key);
  }

  return {
    bookId,
    manifest: path.relative(ROOT, manifestPath),
    pageCount: pages.length,
    pageKinds,
    output: {
      html: path.relative(ROOT, outputHtmlPath),
      pdf: path.relative(ROOT, outputPdfPath),
    },
    sourceAudit,
    extractedHtmlMarker,
    jsonAssetSummary,
    missingAssets,
    checks,
    status: failures.length === 0 ? 'pass' : 'fail',
    failures,
    notes: buildNotes(bookId, sourceAudit, normalizedSourceComparison),
  };
}

function buildNotes(bookId, sourceAudit, normalizedSourceComparison) {
  const notes = [];

  if (!sourceAudit) {
    notes.push('원본 source 매핑 미정');
    return notes;
  }

  if (sourceAudit.mode === 'pdf') {
    notes.push('PDF 원본이라 source 표본 문구 보존 검사는 생략');
  }

  if (sourceAudit.mode === 'shared-split-html') {
    notes.push('여러 교재가 하나의 HTML source를 공유하므로 source 표본 문구 검사는 volume 단위에서만 수행');
  }

  if (normalizedSourceComparison) {
    notes.push('extravagantdocs 정규화 렌더를 사용하므로 source marker exact-match 검사는 생략');
  }

  if (bookId === 'logic-basic' && sourceAudit.stats) {
    notes.push(`source problem block ${sourceAudit.stats.problemBlocks}개 중 번호 없는 설명용 example block ${sourceAudit.stats.unnumberedProblemBlocks}개 포함`);
  }

  return notes;
}

function renderMarkdown(results) {
  const total = results.length;
  const passed = results.filter((item) => item.status === 'pass').length;
  const failed = total - passed;

  const lines = [];
  lines.push('# Textbook Source Trace Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`- Books: ${total}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed}`);
  lines.push('');

  for (const result of results) {
    lines.push(`## ${result.bookId}`);
    lines.push('');
    lines.push(`- Status: ${result.status}`);
    lines.push(`- Manifest: ${result.manifest}`);
    lines.push(`- Page count: ${result.pageCount}`);
    lines.push(`- Page kinds: ${Object.entries(result.pageKinds).map(([key, value]) => `${key}=${value}`).join(', ')}`);
    lines.push(`- Output HTML: ${result.output.html}`);
    lines.push(`- Output PDF: ${result.output.pdf}`);

    if (result.sourceAudit) {
      lines.push(`- Source: ${result.sourceAudit.path} (${result.sourceAudit.mode})`);
      lines.push(`- Source exists: ${result.sourceAudit.exists}`);
      if (result.sourceAudit.stats) {
        lines.push(`- Source stats: pages=${result.sourceAudit.stats.pageCount}, problems=${result.sourceAudit.stats.problemBlocks}, numberedProblems=${result.sourceAudit.stats.numberedProblemBlocks}, unnumberedProblems=${result.sourceAudit.stats.unnumberedProblemBlocks}, answerSections=${result.sourceAudit.stats.answerSections}`);
      }
      if (result.sourceAudit.markers?.length) {
        lines.push(`- Source marker checks: ${result.sourceAudit.markers.map((item) => `${item.foundInOutput ? 'PASS' : 'FAIL'} "${item.text}"`).join(' | ')}`);
      }
    }

    if (result.extractedHtmlMarker) {
      lines.push(`- Extracted HTML marker: ${result.extractedHtmlMarker.foundInOutput ? 'PASS' : 'FAIL'} "${result.extractedHtmlMarker.marker}" from ${result.extractedHtmlMarker.sourcePath}`);
    }

    if (result.jsonAssetSummary.length) {
      for (const asset of result.jsonAssetSummary) {
        const detail = [`type=${asset.kind}`];
        if (asset.count !== null) detail.push(`count=${asset.count}`);
        if (asset.questions !== undefined) detail.push(`questions=${asset.questions}`);
        if (asset.answers !== undefined) detail.push(`answers=${asset.answers}`);
        if (asset.explanations !== undefined) detail.push(`explanations=${asset.explanations}`);
        if (asset.sampleIds.length) detail.push(`samples=${asset.sampleIds.join(', ')}`);
        lines.push(`- Data asset: ${asset.path} (${detail.join(', ')})`);
      }
    }

    if (result.missingAssets.length) {
      lines.push(`- Missing assets: ${result.missingAssets.join(', ')}`);
    }

    if (result.notes.length) {
      for (const note of result.notes) {
        lines.push(`- Note: ${note}`);
      }
    }

    lines.push(`- Checks: ${Object.entries(result.checks).map(([key, value]) => `${key}=${value}`).join(', ')}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const requestedBookIds = process.argv.slice(2).filter(Boolean);
  const bookFiles = fs.readdirSync(BOOKS_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .filter((name) => requestedBookIds.length === 0 || requestedBookIds.includes(path.basename(name, '.yaml')))
    .sort();
  const results = bookFiles.map(analyzeBook);
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
