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
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');

[DATA_DIR, CONTENT_DIR, BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

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

// --- 2. Extract problems ---
const problems = [];

$('div.problem').each((i, el) => {
  const $el = $(el);

  // Get problem number
  const numText = $el.find('.problem-number').text().trim();
  const numMatch = numText.match(/(\d+)/);
  if (!numMatch) return;
  const number = parseInt(numMatch[1]);

  // Get problem text (English passage)
  const stemEl = $el.find('.problem-text');
  let stem = '';
  if (stemEl.length > 0) {
    stem = stemEl.html()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Get instruction
  const instructionEl = $el.find('.problem-instruction, .problem-question');
  let instruction = instructionEl.text().trim() || '';

  // Get choices
  const choices = [];
  $el.find('.problem-choices li, .choices li').each((j, li) => {
    let text = $(li).text().trim();
    text = text.replace(/^[①②③④⑤]\s*/, '');
    choices.push(text);
  });

  // Determine type based on instruction
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

  const problem = {
    id: `logic-basic-${number}`,
    number,
    type,
    stem,
  };
  if (instruction) problem.instruction = instruction;
  if (choices.length > 0) problem.choices = choices;

  problems.push(problem);
});

console.log(`  📝 Problems: ${problems.length}`);

// --- 3. Extract answers ---
$('div.answer-block').each((i, el) => {
  const $el = $(el);
  const ansNumText = $el.find('.ans-num').text().trim();
  const numMatch = ansNumText.match(/(\d+)/);
  if (!numMatch) return;
  const number = parseInt(numMatch[1]);

  // Parse answer number (e.g., "001. 정답 ②")
  const ansMatch = ansNumText.match(/정답\s*([①②③④⑤])/);
  const answer = ansMatch ? CIRCLED[ansMatch[1]] : '';

  // Get explanation
  const explEl = $el.find('.ans-explanation, .ans-text');
  const explanation = explEl.text().trim() || '';

  const prob = problems.find(p => p.number === number);
  if (prob) {
    prob.answer = answer;
    if (explanation) prob.explanation = explanation;
  }
});

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

// --- 6. Extract content pages (non-problem, non-answer, non-vocab-only) ---
const contentPages = [];
currentChapter = 1;

$('div.page').each((i, el) => {
  const $el = $(el);

  // Track chapter
  const chHeader = $el.find('.chapter-header .chapter-number').text().trim();
  const chMatch = chHeader.match(/(\d+)/);
  if (chMatch) currentChapter = parseInt(chMatch[1]);

  // Skip special pages
  if ($el.hasClass('cover-page')) return;
  if ($el.hasClass('answer-section')) return;
  if ($el.find('.toc-main-title').length > 0) return;
  if ($el.find('.cover-content').length > 0) return;

  // Check for content markers (section titles, note boxes, etc.)
  const $content = $el.find('.page-content');
  if ($content.length === 0) return;

  const hasSection = $content.find('.section-title, .note-box, .chapter-header').length > 0;
  const hasVocabOnly = $content.find('.vocabulary-section').length > 0 && !hasSection;
  const hasProblems = $content.find('.problem').length > 0;

  // We want pages that have content explanations (sections, notes, etc.)
  // but not pure problem pages or pure vocab pages
  if (hasSection && !hasProblems) {
    contentPages.push({
      chapter: currentChapter,
      html: $content.html().trim(),
    });
  }
});

console.log(`  📄 Content pages: ${contentPages.length}`);

// --- 7. Write output files ---

// Per-chapter problem JSON
for (const ch of uniqueChapters) {
  const nums = chapterProblems[ch.number] || [];
  const chProbs = problems.filter(p => nums.includes(p.number));
  if (chProbs.length === 0) continue;

  const data = {
    bookId: `logic-basic-ch${String(ch.number).padStart(2, '0')}`,
    chapter: `ch${String(ch.number).padStart(2, '0')}`,
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

// Content HTML
const chapterContentMap = {};
for (const cp of contentPages) {
  if (!chapterContentMap[cp.chapter]) chapterContentMap[cp.chapter] = [];
  chapterContentMap[cp.chapter].push(cp.html);
}

for (const [chNum, pages] of Object.entries(chapterContentMap)) {
  for (let i = 0; i < pages.length; i++) {
    const outPath = path.join(CONTENT_DIR, `ch${String(chNum).padStart(2, '0')}-content-${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(outPath, pages[i], 'utf8');
  }
}
console.log(`  💾 Content HTML files written`);

// YAML manifest
const yamlPages = [];
for (const ch of uniqueChapters) {
  const chId = `ch${String(ch.number).padStart(2, '0')}`;
  const contentCount = (chapterContentMap[ch.number] || []).length;

  for (let i = 1; i <= contentCount; i++) {
    yamlPages.push(`  - type: content\n    src: logic/basic/${chId}-content-${String(i).padStart(2, '0')}.html`);
  }

  const chNums = chapterProblems[ch.number] || [];
  if (chNums.length > 0) {
    yamlPages.push(`  - type: problems\n    src: logic/basic/${chId}-problems.json\n    layout: two-per-page`);
  }
}

if (vocabulary.length > 0) {
  yamlPages.push(`  - type: vocabulary\n    src: logic/basic/vocabulary.json`);
}

yamlPages.push(`  - type: answer-grid\n    src: logic/basic/ch01-problems.json`);

const yaml = `# logic-basic — 논리 Basic
book:
  title: "편입영어 논리 Basic 편"
  author: "Vera's Flavor"
  template: logic-blue
  series: logic-basic

pages:
${yamlPages.join('\n')}
`;

fs.writeFileSync(path.join(BOOKS_DIR, 'logic-basic.yaml'), yaml, 'utf8');
console.log(`  💾 Manifest written`);
console.log('  ✅ Done: 논리 Basic');
