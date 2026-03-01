#!/usr/bin/env node
/**
 * extract-reading.js — 독해 Basic/Bridge/Intermediate 원본 HTML 추출
 * 각 파일의 서로 다른 HTML 구조를 모두 처리
 *
 * Usage:
 *   node 04_scripts/extract-reading.js basic|bridge|intermediate|all
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const DATA_BASE = path.join(ROOT, '02_textbooks', 'data', 'reading');
const CONTENT_BASE = path.join(ROOT, '02_textbooks', 'content', 'reading');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

const CONFIGS = {
  basic: {
    source: '[편입영어]독해_basic편.html',
    bookId: 'reading-basic',
    title: '편입영어 독해 Basic 편',
    template: 'royal-purple',
    format: 'basic',
  },
  bridge: {
    source: '[편입영어]독해_bridge.html',
    bookId: 'reading-bridge',
    title: '편입영어 독해 Bridge 편',
    template: 'earth-tone',
    format: 'bridge',
  },
  intermediate: {
    source: '[편입영어]독해_intermediate.html',
    bookId: 'reading-intermediate',
    title: '편입영어 독해 Intermediate 편',
    template: 'sky-academic',
    format: 'intermediate',
  },
};

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node extract-reading.js <basic|bridge|intermediate|all>');
  process.exit(1);
}

if (arg === 'all') {
  for (const key of Object.keys(CONFIGS)) extractReading(key);
} else {
  extractReading(arg);
}

function extractReading(level) {
  const config = CONFIGS[level];
  if (!config) { console.error(`Unknown: ${level}`); return; }

  const sourcePath = path.join(ROOT, '02_textbooks', 'source', config.source);
  if (!fs.existsSync(sourcePath)) { console.error(`Not found: ${sourcePath}`); return; }

  const DATA_DIR = path.join(DATA_BASE, level);
  const CONTENT_DIR = path.join(CONTENT_BASE, level);
  [DATA_DIR, CONTENT_DIR, BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

  console.log(`\n📘 Extracting: 독해 ${level}`);

  const html = fs.readFileSync(sourcePath, 'utf8');
  const $ = cheerio.load(html);

  let passages, contentPages;

  switch (config.format) {
    case 'basic':
      ({ passages, contentPages } = extractBasic($, config));
      break;
    case 'bridge':
      ({ passages, contentPages } = extractBridge($, config));
      break;
    case 'intermediate':
      ({ passages, contentPages } = extractIntermediate($, config));
      break;
  }

  console.log(`  📖 Passages: ${passages.length}`);
  const totalQ = passages.reduce((s, p) => s + (p.questions ? p.questions.length : 0), 0);
  console.log(`  ❓ Questions: ${totalQ}`);

  // Extract answers (common patterns)
  extractAnswers($, passages, config);
  console.log(`  ✅ Answers merged`);

  // Group by part
  const partMap = {};
  for (const p of passages) {
    const part = p.part || '1';
    if (!partMap[part]) partMap[part] = [];
    partMap[part].push(p);
  }

  // Write per-part JSON
  for (const [part, list] of Object.entries(partMap)) {
    const data = { bookId: config.bookId, part, passages: list };
    const outPath = path.join(DATA_DIR, `part${String(part).padStart(2, '0')}-passages.json`);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  }
  console.log(`  💾 Passage JSON: ${Object.keys(partMap).length} parts`);

  // Write content HTML
  for (let i = 0; i < contentPages.length; i++) {
    fs.writeFileSync(
      path.join(CONTENT_DIR, `content-${String(i + 1).padStart(2, '0')}.html`),
      contentPages[i], 'utf8'
    );
  }
  console.log(`  📄 Content pages: ${contentPages.length}`);

  // YAML manifest
  const yamlPages = [];
  for (let i = 1; i <= contentPages.length; i++) {
    yamlPages.push(`  - type: content\n    src: reading/${level}/content-${String(i).padStart(2, '0')}.html`);
  }
  for (const part of Object.keys(partMap).sort()) {
    yamlPages.push(`  - type: passages\n    src: reading/${level}/part${String(part).padStart(2, '0')}-passages.json`);
  }

  const yaml = `# ${config.bookId} — ${config.title}
book:
  title: "${config.title}"
  author: "Vera's Flavor"
  template: ${config.template}
  series: ${config.bookId}

pages:
${yamlPages.join('\n')}
`;
  fs.writeFileSync(path.join(BOOKS_DIR, `${config.bookId}.yaml`), yaml, 'utf8');
  console.log(`  💾 Manifest written`);
  console.log(`  ✅ Done: 독해 ${level}`);
}

// ────────────────────────────────────────────────────────────────
// FORMAT: Basic — passage-block + questions-section
// ────────────────────────────────────────────────────────────────
function extractBasic($, config) {
  const passages = [];
  let currentPart = '';

  $('div.page').each((i, el) => {
    const $el = $(el);
    const headerText = $el.find('.page-header span').map((j, s) => $(s).text()).get().join(' ');
    const partMatch = headerText.match(/Part\s*(\d+|[IVX]+)/i);
    if (partMatch) currentPart = partMatch[1];

    $el.find('.passage-block').each((j, pb) => {
      const $pb = $(pb);
      const numText = $pb.find('.passage-number').text().trim();
      const numMatch = numText.match(/(\d+)/);
      const passageNum = numMatch ? parseInt(numMatch[1]) : passages.length + 1;
      const title = $pb.find('.passage-title').text().trim();
      const passageText = $pb.find('.passage-text').text().trim();

      const vocabulary = [];
      $pb.find('.vocab-item, .passage-vocab-item').each((k, vi) => {
        const word = $(vi).find('.vocab-word, .word').text().trim();
        const meaning = $(vi).find('.vocab-meaning, .meaning').text().trim();
        if (word) vocabulary.push({ word, meaning });
      });

      const passage = {
        id: `${config.bookId}-p${passageNum}`,
        number: passageNum,
        title,
        text: passageText,
        part: currentPart,
        questions: [],
      };
      if (vocabulary.length > 0) passage.vocabulary = vocabulary;
      passages.push(passage);
    });

    // Questions
    $el.find('.question-block').each((j, qb) => {
      const $qb = $(qb);
      const qNumText = $qb.find('.question-number').text().trim() || $qb.find('p').first().text().trim();
      const qMatch = qNumText.match(/(\d+)-(\d+)/);
      if (!qMatch) return;

      const passageNum = parseInt(qMatch[1]);
      const qNum = parseInt(qMatch[2]);
      const passage = passages.find(p => p.number === passageNum);
      if (!passage) return;

      const qText = $qb.find('p').first().text().trim().replace(/^\d+-\d+\.\s*/, '');
      const choices = [];
      $qb.find('.question-choices li, ul li, ol li').each((k, li) => {
        let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
        choices.push(text);
      });

      passage.questions.push({
        id: `${config.bookId}-q${passageNum}-${qNum}`,
        number: `${passageNum}-${qNum}`,
        text: qText,
        type: 'reading-comprehension',
        choices,
      });
    });
  });

  const contentPages = extractContentPagesGeneric($);
  return { passages, contentPages };
}

// ────────────────────────────────────────────────────────────────
// FORMAT: Bridge — passage-container + questions-container
// ────────────────────────────────────────────────────────────────
function extractBridge($, config) {
  const passages = [];
  let currentPart = '';

  $('div.page').each((i, el) => {
    const $el = $(el);

    // Track part from header
    const headerText = ($el.find('.problem-page-header .batch-info').text() ||
      $el.find('.page-header span').map((j, s) => $(s).text()).get().join(' ')).trim();
    const partMatch = headerText.match(/part\s*(\d+)/i);
    if (partMatch) currentPart = partMatch[1];

    // Find passage containers
    $el.find('.passage-container').each((j, pc) => {
      const $pc = $(pc);
      const numText = $pc.find('.passage-number').text().trim();
      const numMatch = numText.match(/(\d+)/);
      const passageNum = numMatch ? parseInt(numMatch[1]) : passages.length + 1;
      const passageText = $pc.find('.passage-text').text().trim();

      const passage = {
        id: `${config.bookId}-p${passageNum}`,
        number: passageNum,
        title: '',
        text: passageText,
        part: currentPart,
        questions: [],
      };

      // Vocabulary from vocab-box (sibling of passage-container)
      const $vocabBox = $pc.next('.vocab-box');
      if ($vocabBox.length > 0) {
        const vocabText = $vocabBox.find('p').text().trim();
        const vocabPairs = vocabText.split(/\s{2,}/).filter(Boolean);
        const vocabulary = [];
        for (const pair of vocabPairs) {
          const match = pair.match(/^(.+?)\s+(.+)/);
          if (match) vocabulary.push({ word: match[1].trim(), meaning: match[2].trim() });
        }
        if (vocabulary.length > 0) passage.vocabulary = vocabulary;
      }

      passages.push(passage);
    });

    // Questions from questions-container
    $el.find('.questions-container .question-block, .question-block').each((j, qb) => {
      const $qb = $(qb);
      const qTextFull = $qb.find('.question-text').text().trim() || $qb.find('p').first().text().trim();
      const qMatch = qTextFull.match(/(\d+)-(\d+)\.\s*(.*)/);
      if (!qMatch) return;

      const passageNum = parseInt(qMatch[1]);
      const qNum = parseInt(qMatch[2]);
      const qText = qMatch[3].trim();

      const passage = passages.find(p => p.number === passageNum);
      if (!passage) return;

      const choices = [];
      $qb.find('.options-list li, ol li, ul li').each((k, li) => {
        let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
        choices.push(text);
      });

      passage.questions.push({
        id: `${config.bookId}-q${passageNum}-${qNum}`,
        number: `${passageNum}-${qNum}`,
        text: qText,
        type: 'reading-comprehension',
        choices,
      });
    });
  });

  const contentPages = extractContentPagesGeneric($);
  return { passages, contentPages };
}

// ────────────────────────────────────────────────────────────────
// FORMAT: Intermediate — problem-container + passage + question + choices
// ────────────────────────────────────────────────────────────────
function extractIntermediate($, config) {
  const passages = [];
  let currentPart = '';

  $('div.page').each((i, el) => {
    const $el = $(el);

    // Track part from chapter-header or page-header
    const chHeader = $el.find('.chapter-header').text().trim();
    const chMatch = chHeader.match(/Part\s*(\d+)/i);
    if (chMatch) currentPart = chMatch[1];

    const headerText = $el.find('.page-header span').map((j, s) => $(s).text()).get().join(' ');
    const hMatch = headerText.match(/Part\s*(\d+)/i);
    if (hMatch) currentPart = hMatch[1];

    // Find problem containers (each = 1 passage + 1 question)
    $el.find('.problem-container').each((j, pc) => {
      const $pc = $(pc);
      const numText = $pc.find('.problem-number').text().trim();
      const numMatch = numText.match(/(\d+)/);
      if (!numMatch) return;
      const problemNum = parseInt(numMatch[1]);

      const passageText = $pc.find('.passage').text().trim();
      const questionText = $pc.find('.question').text().trim();

      const choices = [];
      $pc.find('.choices li').each((k, li) => {
        let text = $(li).text().trim().replace(/^\(\d+\)\s*/, '');
        choices.push(text);
      });

      const passage = {
        id: `${config.bookId}-p${problemNum}`,
        number: problemNum,
        title: '',
        text: passageText,
        part: currentPart,
        questions: [{
          id: `${config.bookId}-q${problemNum}`,
          number: String(problemNum),
          text: questionText,
          type: 'reading-comprehension',
          choices,
        }],
      };

      passages.push(passage);
    });
  });

  // Content pages (non-problem pages)
  const contentPages = [];
  $('div.page').each((i, el) => {
    const $el = $(el);
    if ($el.find('.problem-container').length > 0) return;
    if ($el.find('.answer-section, .answer-block, .answer-grid').length > 0) return;
    if ($el.hasClass('no-header-footer')) return;

    const $content = $el.find('.page-content');
    if ($content.length === 0) return;
    const contentHtml = $content.html();
    if (!contentHtml || contentHtml.trim().length < 100) return;

    // Skip TOC and cover-like pages
    if ($content.find('.toc-header, .toc-main-title, .cover-content').length > 0) return;

    contentPages.push(contentHtml.trim());
  });

  return { passages, contentPages };
}

// ────────────────────────────────────────────────────────────────
// Generic content page extraction
// ────────────────────────────────────────────────────────────────
function extractContentPagesGeneric($) {
  const contentPages = [];
  $('div.page').each((i, el) => {
    const $el = $(el);
    if ($el.hasClass('no-header-footer')) return;
    if ($el.hasClass('cover-page')) return;
    if ($el.find('.passage-block, .passage-container, .problem-container').length > 0) return;
    if ($el.find('.question-block, .questions-container').length > 0) return;
    if ($el.find('.answer-block, .answer-item, .quick-answer-grid, .answer-section').length > 0) return;
    if ($el.find('.toc-header, .toc-main-title').length > 0) return;

    const $content = $el.find('.page-content');
    if ($content.length === 0) return;
    const contentHtml = $content.html();
    if (!contentHtml || contentHtml.trim().length < 100) return;

    contentPages.push(contentHtml.trim());
  });
  return contentPages;
}

// ────────────────────────────────────────────────────────────────
// Answer extraction (handles multiple formats)
// ────────────────────────────────────────────────────────────────
function extractAnswers($, passages, config) {
  // Format: "1-1. 정답 ②" or "[001] 정답: ④"
  $('div.page').each((i, el) => {
    const $el = $(el);

    // answer-block pattern
    $el.find('.answer-block, .answer-item').each((j, ab) => {
      const text = $(ab).text().trim();

      // Pattern 1: "1-1. 정답 ②"
      const m1 = text.match(/(\d+)-(\d+)[\.\s]*정답\s*([①②③④⑤])/);
      if (m1) {
        const p = passages.find(x => x.number === parseInt(m1[1]));
        if (p) {
          const q = p.questions.find(x => x.number === `${m1[1]}-${m1[2]}`);
          if (q) q.answer = CIRCLED[m1[3]];
        }
        return;
      }

      // Pattern 2: "[001] 정답: ④" or "001. 정답 (4)"
      const m2 = text.match(/\[?(\d+)\]?[\.\s]*정답[:\s]*([①②③④⑤]|\(\d+\))/);
      if (m2) {
        const num = parseInt(m2[1]);
        const p = passages.find(x => x.number === num);
        if (p && p.questions[0]) {
          const ans = m2[2].match(/[①②③④⑤]/) ? CIRCLED[m2[2]] : parseInt(m2[2].replace(/[()]/g, ''));
          p.questions[0].answer = ans;
        }
      }
    });

    // Quick answer grid
    $el.find('.quick-answer-item, .answer-grid-item').each((j, qa) => {
      const $qa = $(qa);
      const numText = $qa.find('.num').text().trim();
      const ansText = $qa.find('.ans').text().trim();

      // Pattern: "1-1." → passage 1, question 1
      const m1 = numText.match(/(\d+)-(\d+)/);
      if (m1 && ansText) {
        const p = passages.find(x => x.number === parseInt(m1[1]));
        if (p) {
          const q = p.questions.find(x => x.number === `${m1[1]}-${m1[2]}`);
          if (q) q.answer = CIRCLED[ansText] || parseInt(ansText) || ansText;
        }
        return;
      }

      // Pattern: "001." → single problem
      const m2 = numText.match(/(\d+)/);
      if (m2 && ansText) {
        const num = parseInt(m2[1]);
        const p = passages.find(x => x.number === num);
        if (p && p.questions[0]) {
          p.questions[0].answer = CIRCLED[ansText] || parseInt(ansText) || ansText;
        }
      }
    });
  });
}
