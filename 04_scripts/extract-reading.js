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
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

const CIRCLED = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

function romanToInt(value) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  const input = String(value || '').toUpperCase();
  let total = 0;
  let prev = 0;
  for (let i = input.length - 1; i >= 0; i -= 1) {
    const current = map[input[i]] || 0;
    if (current < prev) total -= current;
    else total += current;
    prev = current;
  }
  return total || NaN;
}

function normalizePartKey(value) {
  const text = String(value || '').trim();
  if (!text) return '1';
  if (/^\d+$/.test(text)) return String(Number(text));
  const roman = romanToInt(text);
  return Number.isNaN(roman) ? text : String(roman);
}

function sortPartKeys(keys) {
  return [...keys].sort((a, b) => {
    const aNum = Number(normalizePartKey(a));
    const bNum = Number(normalizePartKey(b));
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
    return String(a).localeCompare(String(b), 'en');
  });
}

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
  [DATA_DIR, CONTENT_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (/^content-\d+\.html$/i.test(file)) {
      fs.unlinkSync(path.join(CONTENT_DIR, file));
    }
  }

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
    const part = normalizePartKey(p.part || '1');
    p.part = part;
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
  for (const part of sortPartKeys(Object.keys(partMap))) {
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
  fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, `${config.bookId}.yaml`), yaml, 'utf8');
  console.log(`  💾 Legacy manifest written`);
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
      // First try inside passage-block (legacy format)
      $pb.find('.vocab-item, .passage-vocab-item').each((k, vi) => {
        const word = $(vi).find('.vocab-word, .word').text().trim();
        const meaning = $(vi).find('.vocab-meaning, .meaning').text().trim();
        if (word) vocabulary.push({ word, meaning });
      });
      // If not found, check sibling .vocab-section (Basic format)
      if (vocabulary.length === 0) {
        const $vocabSection = $pb.next('.vocab-section');
        if ($vocabSection.length > 0) {
          $vocabSection.find('.vocab-list li').each((k, li) => {
            const $li = $(li);
            const wordText = $li.find('.eng-word').text().trim().replace(/:$/, '');
            const meaningText = $li.find('span').not('.eng-word').text().trim();
            if (wordText) vocabulary.push({ word: wordText, meaning: meaningText });
          });
        }
      }

      const passage = {
        id: `${config.bookId}-p${passageNum}`,
        number: passageNum,
        title,
        text: passageText,
        part: currentPart,
        questions: [],
      };
      if (vocabulary.length > 0) passage.vocabulary = vocabulary;

      if (String(currentPart) === '4' && passage.questions.length === 0) {
        const givenSentence = $pb.find('.veras-tip-box p.eng-text').last().text().trim();
        passage.questions.push({
          id: `${config.bookId}-q${currentPart}-${passageNum}`,
          number: String(passageNum),
          text: givenSentence
            ? `주어진 문장이 들어갈 가장 적절한 위치는? ${givenSentence}`
            : '주어진 문장이 들어갈 가장 적절한 위치는?',
          type: 'sentence-insertion',
          choices: ['①', '②', '③', '④', '⑤'],
        });
      }

      // Extract numberless questions (Parts 5, 6):
      // Inside passage-block (Part 6 빈칸추론) or sibling questions-section (Part 5 순서배열)
      const $innerQs = $pb.find('.questions-section .question-block');
      const $siblingQs = $pb.nextAll('.questions-section').first().find('.question-block');
      $innerQs.add($siblingQs).each((k, qb) => {
        const $qb = $(qb);
        // Skip if has question-number (handled by main question loop)
        if ($qb.find('.question-number').length > 0) return;

        const qText = $qb.find('p').first().text().trim();
        const choices = [];
        $qb.find('.question-choices li, ul li, ol li').each((l, li) => {
          let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
          choices.push(text);
        });

        if (choices.length > 0) {
          passage.questions.push({
            id: `${config.bookId}-q${currentPart}-${passageNum}`,
            number: String(passageNum),
            text: qText,
            type: 'reading-comprehension',
            choices,
          });
        }
      });

      passages.push(passage);
    });

    // Questions
    $el.find('.question-block').each((j, qb) => {
      const $qb = $(qb);
      const qNumText = $qb.find('.question-number').text().trim() || $qb.find('p').first().text().trim();

      // Try X-Y format first (Part 1: "1-1.", "1-2.", "1-3.")
      const qMatch = qNumText.match(/(\d+)-(\d+)/);
      if (qMatch) {
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
        return;
      }

      // Fallback: single number format (Parts 2-6: "1.", "2.", ...)
      const singleMatch = qNumText.match(/^(\d+)\./);
      if (singleMatch) {
        const qNum = parseInt(singleMatch[1]);
        // Match passage by number AND part (numbers reset per part)
        const passage = passages.find(p => p.number === qNum && p.part === currentPart);
        if (!passage) return;

        const qText = $qb.find('p').first().text().trim().replace(/^\d+\.\s*/, '');
        const choices = [];
        $qb.find('.question-choices li, ul li, ol li').each((k, li) => {
          let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
          choices.push(text);
        });

        passage.questions.push({
          id: `${config.bookId}-q${currentPart}-${qNum}`,
          number: String(qNum),
          text: qText,
          type: 'reading-comprehension',
          choices,
        });
      }
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
      if (qMatch) {
        const passageNum = parseInt(qMatch[1]);
        const qNum = parseInt(qMatch[2]);
        const qText = qMatch[3].trim();

        const passage = passages.find((p) => p.number === passageNum);
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
        return;
      }

      const singleMatch = qTextFull.match(/(\d+)\.\s*(.*)/);
      if (!singleMatch) return;

      const passageNum = parseInt(singleMatch[1]);
      const qText = singleMatch[2].trim();
      const passage = passages.find((p) => p.number === passageNum);
      if (!passage) return;

      const choices = [];
      $qb.find('.options-list li, ol li, ul li').each((k, li) => {
        let text = $(li).text().trim().replace(/^[①②③④⑤]\s*/, '');
        choices.push(text);
      });

      passage.questions.push({
        id: `${config.bookId}-q${passageNum}`,
        number: String(passageNum),
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
    if ($el.hasClass('answer-key-page')) return;
    if ($el.find('.passage-block, .passage-container, .problem-container').length > 0) return;
    if ($el.find('.question-block, .questions-container').length > 0) return;
    if ($el.find('.answer-block, .answer-item, .quick-answer-grid, .answer-section, .answer-key-block, .answer-key-list, .answer-key-grid').length > 0) return;
    if ($el.find('.toc-header, .toc-main-title').length > 0) return;

    const $content = $el.find('.page-content');
    if ($content.length === 0) return;
    const contentHtml = $content.html();
    if (!contentHtml || contentHtml.trim().length < 100) return;
    if (/정답\s*및\s*해설/.test($content.text())) return;

    contentPages.push(contentHtml.trim());
  });
  return contentPages;
}

// ────────────────────────────────────────────────────────────────
// Answer extraction (handles multiple formats)
// ────────────────────────────────────────────────────────────────
function extractAnswers($, passages, config) {
  function findQuestion(numText) {
    const pairMatch = String(numText).match(/(\d+)-(\d+)/);
    if (pairMatch) {
      const passage = passages.find((item) => item.number === parseInt(pairMatch[1], 10));
      if (!passage) return null;
      const question = passage.questions.find((item) => item.number === `${pairMatch[1]}-${pairMatch[2]}`);
      return question ? { passage, question } : null;
    }

    const singleMatch = String(numText).match(/(\d+)/);
    if (!singleMatch) return null;
    const singleNum = String(parseInt(singleMatch[1], 10));
    const directPassage = passages.find((item) => item.number === parseInt(singleNum, 10));
    if (directPassage && directPassage.questions[0] && !directPassage.questions[0].answer) {
      return { passage: directPassage, question: directPassage.questions[0] };
    }

    const sequentialPassage = passages.find((item) => (
      item.questions &&
      item.questions[0] &&
      String(item.questions[0].number) === singleNum &&
      !item.questions[0].answer
    ));
    if (!sequentialPassage || !sequentialPassage.questions[0]) return null;
    return { passage: sequentialPassage, question: sequentialPassage.questions[0] };
  }

  function normalizeAnswer(text) {
    if (!text) return '';
    const circled = text.match(/[①②③④⑤]/);
    if (circled) return CIRCLED[circled[0]];
    const numeric = text.match(/\(?(\d+)\)?/);
    if (numeric) return parseInt(numeric[1], 10);
    return text.trim();
  }

  // Format: "1-1. 정답 ②" or "[001] 정답: ④"
  $('div.page').each((i, el) => {
    const $el = $(el);

    // answer-block pattern
    $el.find('.answer-block, .answer-item, .answer-key-list li').each((j, ab) => {
      const $ab = $(ab);
      const text = $ab.text().trim();
      const explicitNum = $ab.find('.ans-num, .answer-num, .num').text().trim();
      const explicitAnswer = $ab.find('.answer-correct, .ans').text().trim();
      const explicitExplanation = $ab.find('.ans-explanation, .answer-explanation').text().trim();

      if (explicitNum) {
        const found = findQuestion(explicitNum);
        if (found) {
          if (explicitAnswer || explicitNum) found.question.answer = normalizeAnswer(explicitAnswer || explicitNum);
          if (explicitExplanation) found.question.explanation = explicitExplanation;
        }
      }

      // Pattern 1: "1-1. 정답 ②"
      const m1 = text.match(/(\d+)-(\d+)[\.\s]*정답\s*([①②③④⑤])/);
      if (m1) {
        const found = findQuestion(`${m1[1]}-${m1[2]}`);
        if (found) {
          found.question.answer = CIRCLED[m1[3]];
        }
        return;
      }

      // Pattern 2: "[001] 정답: ④" or "001. 정답 (4)"
      const m2 = text.match(/\[?(\d+)\]?[\.\s]*정답[:\s]*([①②③④⑤]|\(\d+\))/);
      if (m2) {
        const found = findQuestion(m2[1]);
        if (found) {
          found.question.answer = normalizeAnswer(m2[2]);
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
        const found = findQuestion(`${m1[1]}-${m1[2]}`);
        if (found) {
          found.question.answer = normalizeAnswer(ansText);
        }
        return;
      }

      // Pattern: "001." → single problem
      const m2 = numText.match(/(\d+)/);
      if (m2 && ansText) {
        const found = findQuestion(m2[1]);
        if (found) {
          found.question.answer = normalizeAnswer(ansText);
        }
      }
    });
  });
}
