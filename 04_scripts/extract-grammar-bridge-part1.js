#!/usr/bin/env node
/**
 * extract-grammar-bridge-part1.js — 문법 Bridge Part 1 원본 HTML 추출
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part1.html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'grammar', 'bridge');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'grammar', 'bridge');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

[DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

console.log('📘 Extracting: 문법 Bridge Part 1');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html);

// --- 1. Extract problems ---
const problems = [];

$('div.problem-block').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.problem-number').first().text().trim();
  const number = parseInt(numText, 10);
  if (isNaN(number)) return;

  // Stem: problem-passage or problem-text
  const passageHtml = $el.find('.problem-passage').html() || $el.find('.problem-text').html() || '';
  const stem = passageHtml.replace(/\s+/g, ' ').trim();

  const instruction = $el.find('.problem-question').text().trim() || '';

  const choices = [];
  $el.find('.problem-choices li').each((j, li) => {
    let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
    choices.push(text);
  });

  let type = 'fill-in-blank';
  if (instruction.toLowerCase().includes('incorrect') || instruction.includes('틀린') || instruction.includes('어법에 맞지')) {
    type = 'error-identification';
  } else if (instruction.includes('올바른') || instruction.includes('옳은')) {
    type = 'correct-usage';
  } else if (instruction.includes('가까운') || instruction.includes('의미')) {
    type = 'paraphrase';
  }

  const $choicesUl = $el.find('.problem-choices');
  const styleAttr = $choicesUl.attr('style') || '';
  const choiceLayout = styleAttr.includes('1fr') ? 'single-column' : 'default';

  const problem = {
    id: `grammar-bridge-ch01-${number}`,
    number,
    type,
    instruction: instruction || '다음 빈칸에 들어갈 가장 적절한 것은?',
    choices,
  };
  if (stem) problem.stem = stem;
  if (choiceLayout === 'single-column') problem.choiceLayout = 'single-column';

  problems.push(problem);
});

console.log(`  📝 Problems: ${problems.length}`);

// --- 2. Extract answers ---
const answers = {};

$('div.quick-answer-item').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.num').text().trim().replace('.', '');
  const ansText = $el.find('.ans').text().trim();
  const number = parseInt(numText, 10);
  if (!isNaN(number) && ansText) {
    answers[number] = { answer: CIRCLED[ansText] || ansText, explanation: '' };
  }
});

$('div.explanation-block').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.problem-number').text().trim();
  const number = parseInt(numText, 10);
  if (isNaN(number)) return;

  const explanation = $el.find('.explanation-content').text().trim().replace(/^해설:\s*/, '');
  const ansSpan = $el.find('.correct-answer').text().trim();
  const ansMatch = ansSpan.match(/[①②③④⑤]/);

  if (answers[number]) {
    answers[number].explanation = explanation;
  } else {
    answers[number] = { answer: ansMatch ? CIRCLED[ansMatch[0]] : '', explanation };
  }
});

// Merge answers
for (const p of problems) {
  if (answers[p.number]) {
    p.answer = answers[p.number].answer;
    p.explanation = answers[p.number].explanation;
  }
}
console.log(`  ✅ Answers: ${Object.keys(answers).length}`);

// --- 3. Extract content pages ---
const contentPages = [];

$('div.page').each((i, el) => {
  const $el = $(el);
  if ($el.hasClass('no-header-footer')) return;
  if ($el.hasClass('cover-page')) return;
  if ($el.hasClass('part-intro-page')) return;
  if ($el.hasClass('answer-key-section')) return;
  if ($el.find('.problem-block').length > 0) return;
  if ($el.find('.quick-answer-grid').length > 0) return;
  if ($el.find('.explanation-block').length > 0) return;
  if ($el.find('.toc-header, .toc-main-title').length > 0) return;

  const $content = $el.find('.page-content');
  if ($content.length === 0) return;
  const contentHtml = $content.html();
  if (!contentHtml || contentHtml.trim().length < 100) return;

  const hasContent = $content.find('.section-title, .tip-box, .grammar-table, .comparison-table, .part-header, .key-concept-box, .concept-box, .chapter-header').length > 0;
  if (!hasContent) return;

  contentPages.push(contentHtml.trim());
});

console.log(`  📄 Content pages: ${contentPages.length}`);

// --- 4. Write output ---
const problemsData = {
  bookId: 'grammar-bridge-ch01',
  chapter: 'ch01',
  title: '문장의 기본 구조',
  problems,
};
fs.writeFileSync(path.join(DATA_DIR, 'ch01-problems.json'), JSON.stringify(problemsData, null, 2), 'utf8');

for (let i = 0; i < contentPages.length; i++) {
  fs.writeFileSync(
    path.join(CONTENT_DIR, `ch01-content-${String(i + 1).padStart(2, '0')}.html`),
    contentPages[i], 'utf8'
  );
}

// YAML manifest
let pages = '';
for (let i = 1; i <= contentPages.length; i++) {
  pages += `  - type: content\n    src: grammar/bridge/ch01-content-${String(i).padStart(2, '0')}.html\n`;
}
pages += `  - type: problems\n    src: grammar/bridge/ch01-problems.json\n    layout: two-per-page\n`;
pages += `  - type: answer-grid\n    src: grammar/bridge/ch01-problems.json\n`;
pages += `  - type: explanations\n    src: grammar/bridge/ch01-problems.json\n    layout: compact\n`;

const yaml = `# grammar-bridge-ch01 — 문법 Bridge Part 1: 문장의 기본 구조
book:
  title: "문법 Bridge - 문장의 기본 구조"
  author: "Vera's Flavor"
  template: ocean-blue
  series: grammar-bridge
  part: 1

pages:
${pages}`;

fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, 'grammar-bridge-ch01.yaml'), yaml, 'utf8');
console.log(`  💾 Files written`);
console.log('  ✅ Done: 문법 Bridge Part 1');
