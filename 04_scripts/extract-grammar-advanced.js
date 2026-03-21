#!/usr/bin/env node
/**
 * extract-grammar-advanced.js — 문법 Advanced 원본 HTML에서 데이터 추출
 *
 * Usage:
 *   node 04_scripts/extract-grammar-advanced.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]문법_advanced.html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'grammar', 'advanced');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'grammar', 'advanced');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

[DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };
const LETTER_TO_NUM = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

console.log('📘 Extracting: 문법 Advanced');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html);

// --- 1. Extract chapter structure from TOC ---
const chapters = [];
$('.toc-item').each((i, el) => {
  const text = $(el).find('.title').text().trim();
  const match = text.match(/Chapter\s+(\d+):\s*(.+)/);
  if (match) {
    chapters.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
    });
  }
});
console.log(`  📋 Chapters found: ${chapters.length}`);

// --- 2. Extract problems ---
const problems = [];

$('div.problem-block').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.problem-number').first().text().trim();
  // Format: [1], [2], etc.
  const numMatch = numText.match(/\[(\d+)\]/);
  if (!numMatch) return;
  const number = parseInt(numMatch[1]);

  const stemHtml = $el.find('.problem-text').html() || '';
  // Remove the problem-number span from stem
  const stem = stemHtml
    .replace(/<span class="problem-number">.*?<\/span>\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract choices if any
  const choices = [];
  $el.find('.problem-choices li').each((j, li) => {
    let text = $(li).text().trim();
    text = text.replace(/^\([A-E]\)\s*/, '');
    choices.push(text);
  });

  // Determine type
  let type = 'error-identification'; // default for Advanced (many are error-finding)
  if (choices.length > 0) {
    type = 'fill-in-blank';
  }
  // Check for circled numbers in stem (① ② ③ ④ pattern = underline error)
  if (stem.match(/[①②③④⑤]/) && choices.length === 0) {
    type = 'error-identification';
  }

  const problem = {
    id: `grammar-advanced-${number}`,
    number,
    type,
    stem,
  };
  if (choices.length > 0) {
    problem.choices = choices;
    problem.instruction = '다음 빈칸에 들어갈 가장 적절한 것은?';
  } else {
    problem.instruction = '다음 문장에서 어법상 틀린 부분을 찾아 고치시오.';
  }

  problems.push(problem);
});

console.log(`  📝 Problems: ${problems.length}`);

// --- 3. Extract answers ---
$('li.answer-item').each((i, el) => {
  const $el = $(el);
  const numText = $el.find('.answer-number').text().trim();
  const numMatch = numText.match(/\[(\d+)\]/);
  if (!numMatch) return;
  const number = parseInt(numMatch[1]);

  const explText = $el.find('.answer-explanation').text().trim();

  // Parse answer
  let answer = '';
  const ansMatch = explText.match(/Answer:\s*\(([A-E])\)/);
  const fixMatch = explText.match(/Fix:\s*(.+)/);

  if (ansMatch) {
    const letter = ansMatch[1];
    // Convert letter to number for fill-in-blank problems (has choices)
    const prob = problems.find(p => p.number === number);
    if (prob && prob.choices && prob.choices.length > 0) {
      answer = LETTER_TO_NUM[letter] || letter;
    } else {
      answer = letter;
    }
  } else if (fixMatch) {
    answer = fixMatch[1];
  }

  const explanation = explText
    .replace(/^(Fix|Answer):\s*/, '')
    .trim();

  // Find and update the problem
  const prob = problems.find(p => p.number === number);
  if (prob) {
    prob.answer = answer;
    prob.explanation = explanation;
  }
});

console.log(`  ✅ Answers merged`);

// --- 4. Group problems by chapter ---
// Determine chapter boundaries (25 problems per chapter roughly)
const chapterProblems = {};
for (const ch of chapters) {
  chapterProblems[ch.number] = [];
}

// Assign problems to chapters based on page context
// Read chapter headers near problems
const pageChapterMap = {};
$('div.page').each((i, el) => {
  const $el = $(el);
  const headerText = $el.find('.page-header span').map((j, s) => $(s).text()).get().join(' ');
  const chMatch = headerText.match(/Chapter\s+(\d+)/);
  if (chMatch) {
    const chNum = parseInt(chMatch[1]);
    // Find problems in this page
    $el.find('.problem-block').each((j, pb) => {
      const numText = $(pb).find('.problem-number').first().text().trim();
      const numMatch = numText.match(/\[(\d+)\]/);
      if (numMatch) {
        pageChapterMap[parseInt(numMatch[1])] = chNum;
      }
    });
  }
});

// Assign problems to chapters
for (const p of problems) {
  const chNum = pageChapterMap[p.number];
  if (chNum && chapterProblems[chNum]) {
    chapterProblems[chNum].push(p);
  } else {
    // Fallback: estimate chapter based on problem number
    const estCh = Math.min(Math.ceil(p.number / 50), chapters.length);
    if (chapterProblems[estCh]) {
      chapterProblems[estCh].push(p);
    }
  }
}

// --- 5. Extract content pages ---
const contentPages = [];
let currentChapter = 0;

$('div.page').each((i, el) => {
  const $el = $(el);

  // Track current chapter
  const headerText = $el.find('.page-header span').map((j, s) => $(s).text()).get().join(' ');
  const chMatch = headerText.match(/Chapter\s+(\d+)/);
  if (chMatch) currentChapter = parseInt(chMatch[1]);

  // Skip non-content pages
  if ($el.hasClass('no-header-footer')) return;
  if ($el.hasClass('cover-page-modern')) return;
  if ($el.find('.toc-header').length > 0) return;
  if ($el.find('.part-title-page').length > 0) return;
  if ($el.find('.problem-block').length > 0) return;
  if ($el.find('.answer-key-header').length > 0) return;
  if ($el.find('.answer-list').length > 0) return;

  const $content = $el.find('.page-content');
  if ($content.length === 0) return;

  const contentHtml = $content.html();
  if (!contentHtml || contentHtml.trim().length < 100) return;

  // Must have meaningful content
  const hasContent = $content.find('.section-title, .key-concept-box, .example-block, .chapter-header').length > 0;
  if (!hasContent) return;

  contentPages.push({
    chapter: currentChapter,
    html: contentHtml.trim(),
  });
});

console.log(`  📄 Content pages: ${contentPages.length}`);

// --- 6. Write output files ---

// Per-chapter problem JSON
for (const ch of chapters) {
  const chProblems = chapterProblems[ch.number] || [];
  if (chProblems.length === 0) continue;

  const data = {
    bookId: `grammar-advanced-ch${String(ch.number).padStart(2, '0')}`,
    chapter: `ch${String(ch.number).padStart(2, '0')}`,
    title: ch.title,
    problems: chProblems,
  };
  const outPath = path.join(DATA_DIR, `ch${String(ch.number).padStart(2, '0')}-problems.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
}
console.log(`  💾 Problem JSON files written`);

// Per-chapter content HTML
const chapterContent = {};
for (const cp of contentPages) {
  if (!chapterContent[cp.chapter]) chapterContent[cp.chapter] = [];
  chapterContent[cp.chapter].push(cp.html);
}

for (const [chNum, pages] of Object.entries(chapterContent)) {
  for (let i = 0; i < pages.length; i++) {
    const outPath = path.join(CONTENT_DIR, `ch${String(chNum).padStart(2, '0')}-content-${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(outPath, pages[i], 'utf8');
  }
}
console.log(`  💾 Content HTML files written`);

// YAML manifest — skip if already exists (manually curated manifests take precedence)
const manifestPath = path.join(LEGACY_BOOKS_DIR, 'grammar-advanced.yaml');
if (fs.existsSync(manifestPath)) {
  console.log(`  ⏭️  Manifest already exists, skipping (data-only extraction)`);
  console.log(`     To regenerate manifest, delete ${manifestPath} first`);
} else {
  const yamlPages = [];
  for (const ch of chapters) {
    const chId = `ch${String(ch.number).padStart(2, '0')}`;
    const contentCount = (chapterContent[ch.number] || []).length;

    for (let i = 1; i <= contentCount; i++) {
      yamlPages.push(`  - type: content\n    src: grammar/advanced/${chId}-content-${String(i).padStart(2, '0')}.html`);
    }

    if ((chapterProblems[ch.number] || []).length > 0) {
      yamlPages.push(`  - type: problems\n    src: grammar/advanced/${chId}-problems.json\n    layout: three-per-page`);
    }
  }

  yamlPages.push(`  - type: answer-grid\n    src: grammar/advanced/ch01-problems.json`);

  const yaml = `# grammar-advanced — 문법 Advanced
book:
  title: "편입영어 문법 Advanced 편"
  author: "Vera's Flavor"
  template: ocean-blue
  series: grammar-advanced

pages:
${yamlPages.join('\n')}
`;
  fs.writeFileSync(manifestPath, yaml, 'utf8');
  console.log(`  💾 Legacy manifest written (first-time generation)`);
}
console.log('  ✅ Done: 문법 Advanced');
