#!/usr/bin/env node
/**
 * extract-grammar-bridge-part2.js — 문법 Bridge Part 2 원본 HTML 추출
 *
 * Structure:
 * - Part 1 (의문사): ch10 - intro → content → 54 problems → answers
 * - Part 2 (가정법): ch11 - intro → 2 content pages only (no problems)
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_bridge_part2.html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'grammar', 'bridge');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'grammar', 'bridge');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

[DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

console.log('📘 Extracting: 문법 Bridge Part 2 HTML');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html);

// =============================================================================
// Part 1: 의문사 (Interrogatives) - ch10
// =============================================================================

console.log('\n=== Part 1: 의문사 (ch10) ===');

// --- 1. Extract Part 1 problems ---
const part1Problems = [];

$('div.problem-block').each((i, el) => {
  const $el = $(el);

  // Check if this problem is in Part 1 section by looking at nearest page header
  const $page = $el.closest('.page');
  const headerText = $page.find('.page-header span').last().text().trim();
  if (!headerText.includes('Part 1')) return;

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
    id: `grammar-bridge-ch10-${number}`,
    number,
    type,
    instruction: instruction || '다음 빈칸에 들어갈 가장 적절한 것은?',
    choices,
  };
  if (stem) problem.stem = stem;
  if (choiceLayout === 'single-column') problem.choiceLayout = 'single-column';

  part1Problems.push(problem);
});

console.log(`  📝 Problems: ${part1Problems.length}`);

// --- 2. Extract Part 1 answers ---
const part1Answers = {};

$('div.quick-answer-item').each((i, el) => {
  const $el = $(el);
  const $page = $el.closest('.page');
  const headerText = $page.find('.page-header span').last().text().trim();
  if (!headerText.includes('Part 1')) return;

  const numText = $el.find('.num').text().trim().replace('.', '');
  const ansText = $el.find('.ans').text().trim();
  const number = parseInt(numText, 10);
  if (!isNaN(number) && ansText) {
    part1Answers[number] = { answer: CIRCLED[ansText] || ansText, explanation: '' };
  }
});

$('div.explanation-block').each((i, el) => {
  const $el = $(el);
  const $page = $el.closest('.page');
  const headerText = $page.find('.page-header span').last().text().trim();
  if (!headerText.includes('Part 1')) return;

  const numText = $el.find('.problem-number').text().trim();
  const number = parseInt(numText, 10);
  if (isNaN(number)) return;

  const explanation = $el.find('.explanation-content').text().trim().replace(/^해설:\s*/, '');
  const ansSpan = $el.find('.correct-answer').text().trim();
  const ansMatch = ansSpan.match(/[①②③④⑤]/);

  if (part1Answers[number]) {
    part1Answers[number].explanation = explanation;
  } else {
    part1Answers[number] = { answer: ansMatch ? CIRCLED[ansMatch[0]] : '', explanation };
  }
});

// Merge Part 1 answers
for (const p of part1Problems) {
  if (part1Answers[p.number]) {
    p.answer = part1Answers[p.number].answer;
    p.explanation = part1Answers[p.number].explanation;
  }
}
console.log(`  ✅ Answers: ${Object.keys(part1Answers).length}`);

// --- 3. Extract Part 1 content pages ---
const part1ContentPages = [];

$('div.page').each((i, el) => {
  const $el = $(el);

  // Check if this is a Part 1 content page
  const headerText = $el.find('.page-header span').last().text().trim();
  const partHeader = $el.find('.part-header span').last().text().trim();
  if (!headerText.includes('Part 1: 의문사') && !partHeader.includes('의문사')) return;

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

  part1ContentPages.push(contentHtml.trim());
});

console.log(`  📄 Content pages: ${part1ContentPages.length}`);

// --- 4. Write Part 1 output (ch10) ---
const part1Data = {
  bookId: 'grammar-bridge-ch10',
  chapter: 'ch10',
  title: '의문사 (Interrogatives)',
  problems: part1Problems,
};
fs.writeFileSync(path.join(DATA_DIR, 'ch10-problems.json'), JSON.stringify(part1Data, null, 2), 'utf8');

for (let i = 0; i < part1ContentPages.length; i++) {
  fs.writeFileSync(
    path.join(CONTENT_DIR, `ch10-content-${String(i + 1).padStart(2, '0')}.html`),
    part1ContentPages[i], 'utf8'
  );
}

// YAML manifest for ch10
let part1Pages = '';
for (let i = 1; i <= part1ContentPages.length; i++) {
  part1Pages += `  - type: content\n    src: grammar/bridge/ch10-content-${String(i).padStart(2, '0')}.html\n`;
}
part1Pages += `  - type: problems\n    src: grammar/bridge/ch10-problems.json\n    layout: two-per-page\n`;
part1Pages += `  - type: answer-grid\n    src: grammar/bridge/ch10-problems.json\n`;
part1Pages += `  - type: explanations\n    src: grammar/bridge/ch10-problems.json\n    layout: compact\n`;

const part1Yaml = `# grammar-bridge-ch10 — 문법 Bridge Part 1: 의문사
book:
  title: "문법 Bridge - 의문사 (Interrogatives)"
  author: "Vera's Flavor"
  template: ocean-blue
  series: grammar-bridge
  part: 1

pages:
${part1Pages}`;

fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, 'grammar-bridge-ch10.yaml'), part1Yaml, 'utf8');
console.log(`  💾 Files written: ch10-problems.json, ${part1ContentPages.length} content files, grammar-bridge-ch10.yaml`);

// =============================================================================
// Part 2: 가정법 (Conditional Mood) - ch11
// =============================================================================

console.log('\n=== Part 2: 가정법 (ch11) ===');

// --- 1. Extract Part 2 content pages (NO PROBLEMS) ---
const part2ContentPages = [];

$('div.page').each((i, el) => {
  const $el = $(el);

  // Check if this is a Part 2 content page
  const headerText = $el.find('.page-header span').last().text().trim();
  const partHeader = $el.find('.part-header span').last().text().trim();

  // Part 2 pages either have "Part 2: 가정법" in header or "가정법" in part-header
  if (!headerText.includes('Part 2: 가정법') && !partHeader.includes('가정법')) return;

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

  part2ContentPages.push(contentHtml.trim());
});

console.log(`  📄 Content pages: ${part2ContentPages.length}`);
console.log(`  ℹ️  No problems in Part 2 (content only)`);

// --- 2. Write Part 2 output (ch11) ---
for (let i = 0; i < part2ContentPages.length; i++) {
  fs.writeFileSync(
    path.join(CONTENT_DIR, `ch11-content-${String(i + 1).padStart(2, '0')}.html`),
    part2ContentPages[i], 'utf8'
  );
}

// YAML manifest for ch11 (no problems section)
let part2Pages = '';
for (let i = 1; i <= part2ContentPages.length; i++) {
  part2Pages += `  - type: content\n    src: grammar/bridge/ch11-content-${String(i).padStart(2, '0')}.html\n`;
}

const part2Yaml = `# grammar-bridge-ch11 — 문법 Bridge Part 2: 가정법
book:
  title: "문법 Bridge - 가정법 (Conditional Mood)"
  author: "Vera's Flavor"
  template: ocean-blue
  series: grammar-bridge
  part: 2

pages:
${part2Pages}`;

fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, 'grammar-bridge-ch11.yaml'), part2Yaml, 'utf8');
console.log(`  💾 Files written: ${part2ContentPages.length} content files, grammar-bridge-ch11.yaml`);

console.log('\n✅ Done: 문법 Bridge Part 2 HTML extraction complete');
console.log(`   ch10 (의문사): ${part1Problems.length} problems, ${part1ContentPages.length} content pages`);
console.log(`   ch11 (가정법): ${part2ContentPages.length} content pages (no problems)`);
