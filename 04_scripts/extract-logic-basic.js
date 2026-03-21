#!/usr/bin/env node
/**
 * extract-logic-basic.js — 논리 Basic 원본 HTML에서 데이터 추출
 *
 * Usage:
 *   node 04_scripts/extract-logic-basic.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]논리_basic.html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'logic', 'basic');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'logic', 'basic');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

[DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

console.log('📘 Extracting: 논리 Basic');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html);

// --- 1. Extract chapter structure ---
const chapters = [];
$('.chapter-header').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.chapter-number').text().trim();
  const numMatch = numText.match(/(\d+)/);
  const titleParts = $el.contents().filter((j, n) => n.nodeType === 3 || (n.nodeType === 1 && !$(n).hasClass('chapter-number'))).text().trim();

  if (numMatch) {
    chapters.push({
      number: parseInt(numMatch[1]),
      title: titleParts || `${numMatch[1]}강`,
    });
  }
});

// Deduplicate chapters
const uniqueChapters = [];
const seen = new Set();
for (const ch of chapters) {
  if (!seen.has(ch.number)) {
    seen.add(ch.number);
    uniqueChapters.push(ch);
  }
}
console.log(`  📋 Chapters found: ${uniqueChapters.length}`);

// --- 2. Extract problems and answers with chapter scope ---
const problems = [];
const problemIndex = new Map();
let currentChapterForProblems = 1;

$('div.page').each((i, pageEl) => {
  const $page = $(pageEl);

  const chHeader = $page.find('.chapter-header .chapter-number').text().trim();
  const chMatch = chHeader.match(/(\d+)/);
  if (chMatch) currentChapterForProblems = parseInt(chMatch[1], 10);

  $page.find('div.problem').each((j, el) => {
    const $el = $(el);

    const numText = $el.find('.problem-number').text().trim();
    const numMatch = numText.match(/(\d+)/);
    if (!numMatch) return;
    const number = parseInt(numMatch[1], 10);

    let stem = '';
    const stemEl = $el.find('.problem-text');
    if (stemEl.length > 0) {
      stem = stemEl.html()
        .replace(/\s+/g, ' ')
        .trim();
    }

    const instructionEl = $el.find('.problem-instruction, .problem-question');
    const instruction = instructionEl.text().trim() || '';

    const choices = [];
    $el.find('.problem-choices li, .choices li').each((k, li) => {
      let text = $(li).text().trim();
      text = text.replace(/^[①②③④⑤]\s*/, '');
      choices.push(text);
    });

    let type = 'reading-comprehension';
    if (instruction.includes('빈칸') || instruction.includes('blank')) {
      type = 'fill-in-blank';
    } else if (instruction.includes('제목') || instruction.includes('title')) {
      type = 'title-selection';
    } else if (instruction.includes('요지') || instruction.includes('주제') || instruction.includes('main idea')) {
      type = 'main-idea';
    } else if (instruction.includes('순서') || instruction.includes('order')) {
      type = 'sentence-ordering';
    } else if (instruction.includes('삽입') || instruction.includes('insert')) {
      type = 'sentence-insertion';
    }

    const chapterKey = `ch${String(currentChapterForProblems).padStart(2, '0')}`;
    const problem = {
      id: `logic-basic-${chapterKey}-${number}`,
      chapter: chapterKey,
      number,
      type,
      stem,
    };
    if (instruction) problem.instruction = instruction;
    if (choices.length > 0) problem.choices = choices;

    problems.push(problem);
    problemIndex.set(`${chapterKey}:${number}`, problem);
  });

  $page.find('div.answer-block').each((j, el) => {
    const $el = $(el);
    const ansNumText = $el.find('.ans-num').first().text().trim();
    const numMatch = ansNumText.match(/(\d+)/);
    if (!numMatch) return;
    const number = parseInt(numMatch[1], 10);
    const ansMatch = ansNumText.match(/정답\s*([①②③④⑤])/);
    const answer = ansMatch ? CIRCLED[ansMatch[1]] : '';
    const explanation = $el.find('.ans-explanation, .ans-text').text().trim() || '';
    const chapterKey = `ch${String(currentChapterForProblems).padStart(2, '0')}`;
    const prob = problemIndex.get(`${chapterKey}:${number}`);
    if (!prob) return;
    if (answer !== '') prob.answer = answer;
    if (explanation) prob.explanation = explanation;
  });
});

console.log(`  📝 Problems: ${problems.length}`);
console.log(`  ✅ Answers merged`);

// --- 4. Extract vocabulary sections ---
const vocabulary = [];

$('div.vocabulary-section').each((i, el) => {
  const $el = $(el);
  const wordText = $el.find('.vocab-word').text().trim();
  const wordMatch = wordText.match(/^(.+?)\s*[:：]\s*(.+)/);

  if (!wordMatch) return;

  const word = wordMatch[1].trim();
  const meaning = wordMatch[2].trim();

  // Core image
  const coreImage = $el.find('.core-image').text().replace(/\[핵심 이미지[^]]*\]\s*/g, '').trim();

  // English definition
  const definition = $el.find('.definition .eng-text').text().trim();

  // Examples
  const examples = [];
  $el.find('.example-list li').each((j, li) => {
    const en = $(li).find('.eng-text').text().trim() || $(li).text().trim();
    examples.push(en);
  });

  // Translations
  const translations = [];
  $el.find('.translation-list li').each((j, li) => {
    translations.push($(li).text().trim());
  });

  vocabulary.push({
    word,
    meaning,
    coreImage: coreImage || undefined,
    definition: definition || undefined,
    examples: examples.map((en, j) => ({
      en,
      ko: translations[j] || '',
    })),
  });
});

console.log(`  📚 Vocabulary: ${vocabulary.length}`);

// --- 5. Assign problems to chapters ---
const chapterProblems = {};
let currentChapter = 1;

$('div.page').each((i, el) => {
  const $el = $(el);

  // Track chapter changes
  const chHeader = $el.find('.chapter-header .chapter-number').text().trim();
  const chMatch = chHeader.match(/(\d+)/);
  if (chMatch) currentChapter = parseInt(chMatch[1]);

  // Find problems in this page
  $el.find('div.problem').each((j, pb) => {
    const numText = $(pb).find('.problem-number').text().trim();
    const numMatch = numText.match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      if (!chapterProblems[currentChapter]) chapterProblems[currentChapter] = [];
      chapterProblems[currentChapter].push(num);
    }
  });
});

// --- 6. Write output files ---

// Per-chapter problem JSON
for (const ch of uniqueChapters) {
  const chapterKey = `ch${String(ch.number).padStart(2, '0')}`;
  const chProbs = problems.filter(p => p.chapter === chapterKey);
  if (chProbs.length === 0) continue;

  const data = {
    bookId: `logic-basic-${chapterKey}`,
    chapter: chapterKey,
    title: ch.title,
    problems: chProbs,
  };

  const outPath = path.join(DATA_DIR, `ch${String(ch.number).padStart(2, '0')}-problems.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
}
console.log(`  💾 Problem JSON files written`);

// Vocabulary JSON
if (vocabulary.length > 0) {
  const vocabData = {
    bookId: 'logic-basic',
    words: vocabulary,
  };
  fs.writeFileSync(path.join(DATA_DIR, 'vocabulary.json'), JSON.stringify(vocabData, null, 2), 'utf8');
  console.log(`  💾 Vocabulary JSON written`);
}

// Preserve full source pages for rendering. logic-basic has mixed pages where
// unit explanations, vocabulary, and problems coexist, so source-page
// preservation is the only lossless extraction mode for this book.
const yamlPages = [];
let tocCount = 0;
$('div.page').each((i, el) => {
  const $page = $(el);
  const pageIndex = String(i + 1).padStart(3, '0');
  const isCover = $page.hasClass('cover-page') || $page.find('.cover-content').length > 0;
  const isToc = $page.find('.toc-main-title, .toc-header').length > 0;
  let fileName = `page-${pageIndex}.html`;
  let type = 'content';

  if (isCover) {
    fileName = 'cover.html';
    type = 'structural';
  } else if (isToc) {
    tocCount += 1;
    fileName = tocCount === 1 ? 'toc.html' : `toc-${String(tocCount).padStart(2, '0')}.html`;
    type = 'structural';
  }

  fs.writeFileSync(path.join(CONTENT_DIR, fileName), $.html($page), 'utf8');
  yamlPages.push(`  - type: ${type}\n    src: logic/basic/${fileName}`);
});

console.log(`  💾 Full-page HTML files written`);

const yaml = `# logic-basic — 논리 Basic
book:
  title: "편입영어 논리 Basic 편"
  author: "Vera's Flavor"
  template: logic-blue
  series: logic-basic

pages:
${yamlPages.join('\n')}
`;

fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, 'logic-basic.yaml'), yaml, 'utf8');
console.log(`  💾 Legacy manifest written`);
console.log('  ✅ Done: 논리 Basic');
