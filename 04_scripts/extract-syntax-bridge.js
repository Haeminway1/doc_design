#!/usr/bin/env node
/**
 * extract-syntax-bridge.js — 구문독해 Bridge 원본 HTML 추출
 *
 * Structure: PART I-V → UNIT 01-10 → TP 01-34
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]구문독해_bridge (1).html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'syntax', 'bridge');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'syntax', 'bridge');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');

[DATA_DIR, CONTENT_DIR, BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// Unit definitions (from HTML structure)
const UNITS = [
  { num: 1, title: '문장 구조 (STRUCTURE)', part: 'I' },
  { num: 2, title: '준동사 (VERBALS)', part: 'I' },
  { num: 3, title: '관계사 (RELATIVES)', part: 'II' },
  { num: 4, title: '관계사, 접속사와 전치사', part: 'II' },
  { num: 5, title: '중요 형용사와 부사', part: 'III' },
  { num: 6, title: '명사와 대명사', part: 'III' },
  { num: 7, title: '중요 동사 (VERBS)', part: 'III' },
  { num: 8, title: '일치 (AGREEMENT)', part: 'IV' },
  { num: 9, title: '태 (VOICE)', part: 'IV' },
  { num: 10, title: '시제, 법과 조동사', part: 'IV' },
];

console.log('📘 Extracting: 구문독해 Bridge');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html);

// --- 1. Track unit boundaries per page ---
let currentUnit = 0;
let currentPart = '';
const pageUnits = []; // maps page index → unit number

$('div.page').each((i, el) => {
  const $el = $(el);

  // Check for PART opener
  const partTitle = $el.find('.part-title').text().trim();
  if (partTitle.match(/PART\s+[IVX]+/)) {
    currentPart = partTitle.replace('PART', '').trim();
  }

  // Check for UNIT header: <header class="unit-header"><h1>UNIT 01: ...</h1></header>
  const unitH1 = $el.find('.unit-header h1').first().text().trim();
  const unitMatch = unitH1.match(/UNIT\s+(\d+)/i);
  if (unitMatch) {
    const unitNum = parseInt(unitMatch[1]);
    // Skip "정리" pages (PART summary)
    if (!unitH1.includes('정리')) {
      currentUnit = unitNum;
    }
  }

  pageUnits.push({ unit: currentUnit, part: currentPart });
});

console.log(`  📋 Units detected: ${new Set(pageUnits.filter(p => p.unit > 0).map(p => p.unit)).size}`);

// --- 2. Extract content pages per unit ---
const unitContent = {}; // unit → [html, ...]
let totalContent = 0;

$('div.page').each((i, el) => {
  const $el = $(el);
  const { unit } = pageUnits[i];
  if (unit === 0) return;

  // Skip non-content pages
  if ($el.hasClass('no-header-footer')) return;
  if ($el.hasClass('cover-page')) return;
  if ($el.find('.toc-header, .toc-main-title').length > 0) return;

  // Skip answer/explanation pages
  const h2Text = $el.find('h2').text();
  if (h2Text.includes('정답') || h2Text.includes('해설')) return;
  if ($el.find('.answer-section, .answer-grid, .mock-test-answers').length > 0) return;

  // Skip 정리 and 실전 TEST summary pages
  const unitH1 = $el.find('.unit-header h1').first().text().trim();
  if (unitH1.includes('정리')) return;

  // Get page content
  const $content = $el.find('.page-content');
  if ($content.length === 0) return;
  const contentHtml = $content.html();
  if (!contentHtml || contentHtml.trim().length < 50) return;

  if (!unitContent[unit]) unitContent[unit] = [];
  unitContent[unit].push(contentHtml.trim());
  totalContent++;
});

console.log(`  📄 Content pages: ${totalContent}`);

// --- 3. Extract exercise problems per unit (from exercise-section) ---
const unitProblems = {}; // unit → [problem, ...]
let totalProblems = 0;
let currentExUnit = 0;

$('div.page').each((i, el) => {
  const $el = $(el);
  const { unit } = pageUnits[i];
  if (unit > 0) currentExUnit = unit;

  // Look for exercise sections with problems
  $el.find('section.exercise-section').each((j, section) => {
    const $section = $(section);
    const h3 = $section.find('h3').first().text().trim();

    // Extract problems from ordered lists
    $section.find('ol > li').each((k, li) => {
      const $li = $(li);
      const $ol = $li.parent('ol');
      const startNum = parseInt($ol.attr('start') || '1', 10);
      const problemNum = startNum + k;

      const problemHtml = $li.html();
      if (!problemHtml || problemHtml.trim().length < 10) return;

      // Extract inline choices from <span class="choice">
      const choices = [];
      $li.find('.choice').each((m, ch) => {
        choices.push($(ch).text().trim());
      });

      if (!unitProblems[currentExUnit]) unitProblems[currentExUnit] = [];
      unitProblems[currentExUnit].push({
        id: `syntax-bridge-unit${String(currentExUnit).padStart(2, '0')}-${problemNum}`,
        number: problemNum,
        type: choices.length > 0 ? 'fill-in-blank' : 'open-ended',
        instruction: h3 || '다음 문제를 풀어보세요.',
        stem: problemHtml.replace(/<div[^>]*class="spacer[^"]*"[^>]*><\/div>/g, '').replace(/\s+/g, ' ').trim(),
        choices: choices.length > 0 ? choices : undefined,
      });
      totalProblems++;
    });
  });
});

console.log(`  📝 Problems: ${totalProblems}`);

// --- 4. Extract answers from answer-section ---
const answers = {}; // "PART-problemNum" → answer text
$('section.answer-section').each((i, section) => {
  const $section = $(section);
  const h2 = $section.find('h2').first().text().trim();

  $section.find('.answer-block ol > li').each((j, li) => {
    const $ol = $(li).parent('ol');
    const startNum = parseInt($ol.attr('start') || '1', 10);
    const problemNum = startNum + j;
    const answerText = $(li).text().trim();
    answers[`${problemNum}`] = answerText;
  });
});

console.log(`  ✅ Answers: ${Object.keys(answers).length}`);

// --- 5. Write output files ---
// Clean old content files
const oldFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.startsWith('unit'));
oldFiles.forEach(f => fs.unlinkSync(path.join(CONTENT_DIR, f)));

const yamlPages = [];

for (const u of UNITS) {
  const unitId = `unit${String(u.num).padStart(2, '0')}`;
  const pages = unitContent[u.num] || [];
  const problems = unitProblems[u.num] || [];

  // Write content HTML files
  for (let i = 0; i < pages.length; i++) {
    const outPath = path.join(CONTENT_DIR, `${unitId}-content-${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(outPath, pages[i], 'utf8');
    yamlPages.push(`  - type: content\n    src: syntax/bridge/${unitId}-content-${String(i + 1).padStart(2, '0')}.html`);
  }

  // Write problems JSON if any
  if (problems.length > 0) {
    const data = {
      bookId: `syntax-bridge-${unitId}`,
      unit: u.num,
      title: u.title,
      part: u.part,
      problems,
    };
    const dataPath = path.join(DATA_DIR, `${unitId}-problems.json`);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    yamlPages.push(`  - type: problems\n    src: syntax/bridge/${unitId}-problems.json\n    layout: two-per-page`);
  }

  console.log(`  📖 ${unitId}: ${pages.length} pages, ${problems.length} problems`);
}

// Write YAML manifest
const yamlStr = `# syntax-bridge — 구문독해 Bridge
book:
  title: "편입영어 구문독해 Bridge 편"
  author: "Vera's Flavor"
  template: mint-sky
  series: syntax-bridge

pages:
${yamlPages.join('\n')}
`;

fs.writeFileSync(path.join(BOOKS_DIR, 'syntax-bridge.yaml'), yamlStr, 'utf8');
console.log(`  💾 Manifest written`);
console.log('  ✅ Done: 구문독해 Bridge');
