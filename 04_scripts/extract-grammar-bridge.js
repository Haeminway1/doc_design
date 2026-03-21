#!/usr/bin/env node
/**
 * extract-grammar-bridge.js — 문법 Bridge 원본 HTML에서 데이터 추출
 *
 * Usage:
 *   node 04_scripts/extract-grammar-bridge.js 2-2
 *   node 04_scripts/extract-grammar-bridge.js all
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, '02_textbooks', 'source');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'grammar', 'bridge');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'grammar', 'bridge');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

// Chapter mapping: file → chapter info
const CHAPTER_MAP = {
  '2-2': { chapter: 'ch02', title: '가정법 (Conditional Mood)', partNum: 2, numStart: 51, numEnd: 100 },
  '2-3': { chapter: 'ch03', title: '준동사', partNum: 3, numStart: 101, numEnd: 150 },
  '2-4': { chapter: 'ch04', title: '관계사', partNum: 4, numStart: 151, numEnd: 200 },
  '2-5': { chapter: 'ch05', title: '접속사', partNum: 5, numStart: 201, numEnd: 250 },
  '2-6': { chapter: 'ch06', title: '비교구문', partNum: 6, numStart: 251, numEnd: 300 },
  '2-7': { chapter: 'ch07', title: '특수구문', partNum: 7, numStart: 301, numEnd: 350 },
  '2-8': { chapter: 'ch08', title: '명사와 관사', partNum: 8, numStart: 351, numEnd: 400 },
  '2-9': { chapter: 'ch09', title: '형용사와 부사', partNum: 9, numStart: 401, numEnd: 450 },
};

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Usage: node extract-grammar-bridge.js <fileId|all>');
  process.exit(1);
}

// Ensure directories exist
[DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

if (fileArg === 'all') {
  for (const id of Object.keys(CHAPTER_MAP)) {
    extractFile(id);
  }
} else {
  extractFile(fileArg);
}

function extractFile(fileId) {
  const info = CHAPTER_MAP[fileId];
  if (!info) {
    console.error(`Unknown file: ${fileId}`);
    return;
  }

  const htmlPath = path.join(SOURCE_DIR, `${fileId}.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`Source not found: ${htmlPath}`);
    return;
  }

  console.log(`\n📘 Extracting: ${fileId} → ${info.chapter}`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  // 1. Extract problems
  const problems = extractProblems($, info);
  console.log(`  📝 Problems: ${problems.length}`);

  // 2. Extract answers & explanations
  const answers = extractAnswers($);
  console.log(`  ✅ Answers: ${Object.keys(answers).length}`);

  // 3. Merge answers into problems
  for (const p of problems) {
    if (answers[p.number]) {
      p.answer = answers[p.number].answer;
      p.explanation = answers[p.number].explanation;
    }
  }

  // 4. Extract content pages (non-problem, non-answer pages)
  const contentPages = extractContentPages($, info);
  console.log(`  📄 Content pages: ${contentPages.length}`);

  // 5. Write problems JSON
  const problemsData = {
    bookId: `grammar-bridge-${info.chapter}`,
    chapter: info.chapter,
    title: info.title,
    problems
  };
  const problemsPath = path.join(DATA_DIR, `${info.chapter}-problems.json`);
  fs.writeFileSync(problemsPath, JSON.stringify(problemsData, null, 2), 'utf8');
  console.log(`  💾 ${problemsPath}`);

  // 6. Write content HTML files
  for (let i = 0; i < contentPages.length; i++) {
    const contentPath = path.join(CONTENT_DIR, `${info.chapter}-content-${String(i + 1).padStart(2, '0')}.html`);
    fs.writeFileSync(contentPath, contentPages[i], 'utf8');
  }
  if (contentPages.length > 0) {
    console.log(`  💾 Content files: ${contentPages.length}`);
  }

  // 7. Write YAML manifest
  const yaml = generateManifest(info, problems.length, contentPages.length);
  const yamlPath = path.join(LEGACY_BOOKS_DIR, `grammar-bridge-${info.chapter}.yaml`);
  fs.writeFileSync(yamlPath, yaml, 'utf8');
  console.log(`  💾 ${yamlPath}`);

  console.log(`  ✅ Done: ${fileId}`);
}

function extractProblems($, info) {
  const problems = [];

  $('div.problem-block').each((i, el) => {
    const $el = $(el);
    const numText = $el.find('.problem-number').first().text().trim();
    const number = parseInt(numText, 10);
    if (isNaN(number)) return;

    // Determine problem type
    const stemHtml = $el.find('.problem-text').html();
    const stem = stemHtml ? cleanHtml(stemHtml.trim()) : '';

    const instruction = $el.find('.problem-question').text().trim() || '';

    // Extract choices
    const choices = [];
    $el.find('.problem-choices li').each((j, li) => {
      let choiceText = $(li).text().trim();
      // Remove circled number prefix
      choiceText = choiceText.replace(/^[①②③④⑤]\s*/, '');
      choices.push(choiceText);
    });

    // Determine type
    let type = 'fill-in-blank';
    if (instruction.includes('어법상 올바른') || instruction.includes('어법상 옳은')) {
      type = 'correct-usage';
    } else if (instruction.includes('가장 가까운')) {
      type = 'paraphrase';
    } else if (instruction.includes('가정법으로 바꿀')) {
      type = 'transformation';
    } else if (instruction.includes('도치')) {
      type = 'inversion';
    } else if (instruction.includes('밑줄') || instruction.includes('어법에 맞지 않는') || instruction.includes('틀린')) {
      type = 'error-identification';
    }

    // Determine choice layout
    const $choices = $el.find('.problem-choices');
    const styleAttr = $choices.attr('style') || '';
    const choiceLayout = styleAttr.includes('1fr') ? 'single-column' : 'default';

    const problem = {
      id: `grammar-bridge-${info.chapter}-${number}`,
      number,
      type,
      instruction: instruction || '다음 빈칸에 들어갈 가장 적절한 것은?',
      choices,
    };
    if (stem) problem.stem = stem;
    if (choiceLayout === 'single-column') problem.choiceLayout = 'single-column';

    problems.push(problem);
  });

  return problems;
}

function extractAnswers($) {
  const answers = {};

  // Quick answer grid
  $('div.quick-answer-item').each((i, el) => {
    const $el = $(el);
    const numText = $el.find('.num').text().trim().replace('.', '');
    const ansText = $el.find('.ans').text().trim();
    const number = parseInt(numText, 10);
    if (!isNaN(number) && ansText) {
      answers[number] = { answer: CIRCLED[ansText] || ansText, explanation: '' };
    }
  });

  // Detailed explanations
  $('div.explanation-block').each((i, el) => {
    const $el = $(el);
    const numText = $el.find('.problem-number').text().trim();
    const number = parseInt(numText, 10);
    if (isNaN(number)) return;

    const explanation = $el.find('.explanation-content').text().trim()
      .replace(/^해설:\s*/, '');

    if (answers[number]) {
      answers[number].explanation = explanation;
    } else {
      // Try to get answer from correct-answer span
      const ansSpan = $el.find('.correct-answer').text().trim();
      const ansMatch = ansSpan.match(/[①②③④⑤]/);
      answers[number] = {
        answer: ansMatch ? CIRCLED[ansMatch[0]] : '',
        explanation,
      };
    }
  });

  return answers;
}

function extractContentPages($, info) {
  const contentPages = [];

  $('div.page').each((i, el) => {
    const $el = $(el);

    // Skip cover, TOC, problem, and answer pages
    if ($el.hasClass('no-header-footer')) return;
    if ($el.hasClass('cover-page')) return;
    if ($el.hasClass('part-intro-page')) return;
    if ($el.hasClass('answer-key-section')) return;

    // Check if this is a problem page (has problem-blocks)
    if ($el.find('.problem-block').length > 0) return;

    // Check if this page has content (grammar tables, concept explanations, tips)
    const $content = $el.find('.page-content');
    if ($content.length === 0) return;

    const contentHtml = $content.html();
    if (!contentHtml || contentHtml.trim().length < 50) return;

    // Check for meaningful content markers
    const hasContent = $content.find('.section-title, .tip-box, .grammar-table, .comparison-table, .part-header, .key-concept-box, .concept-box').length > 0;
    if (!hasContent) return;

    // Strip inline styles that are page-specific
    contentPages.push(contentHtml.trim());
  });

  return contentPages;
}

function generateManifest(info, problemCount, contentCount) {
  let pages = '';

  // Content pages
  for (let i = 1; i <= contentCount; i++) {
    pages += `  - type: content\n    src: grammar/bridge/${info.chapter}-content-${String(i).padStart(2, '0')}.html\n`;
  }

  // Problems page
  pages += `  - type: problems\n    src: grammar/bridge/${info.chapter}-problems.json\n    layout: two-per-page\n`;

  // Answer grid
  pages += `  - type: answer-grid\n    src: grammar/bridge/${info.chapter}-problems.json\n`;

  // Explanations
  pages += `  - type: explanations\n    src: grammar/bridge/${info.chapter}-problems.json\n    layout: compact\n`;

  return `# grammar-bridge-${info.chapter} — 문법 Bridge ${info.title}
book:
  title: "문법 Bridge - ${info.title}"
  author: "Vera's Flavor"
  template: ocean-blue
  series: grammar-bridge
  part: ${info.partNum}

pages:
${pages}`;
}

function cleanHtml(html) {
  return html
    .replace(/<span class="choice-number">.*?<\/span>\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
