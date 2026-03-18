#!/usr/bin/env node
/**
 * generate-workbook.js — Bank JSON → 워크북 HTML fragments + YAML
 *
 * Usage:
 *   node 04_scripts/generate-workbook.js --banks ne1-intro,ne1-ch1 --id wb-sample --title "능률 L1 워크북 샘플"
 *   node 04_scripts/generate-workbook.js --banks all --id wb-ne1-full --title "능률 L1 워크북"
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const BANK_DIR = path.join(ROOT, '02_textbooks', 'data', 'school', 'wirye-g1', 'bank');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content', 'school', 'wirye-g1-ne');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');

const CIRCLED = ['', '①', '②', '③', '④', '⑤'];

// ─── Problem type sections ─────────────────────────────────
const SECTIONS = [
  { key: 'main-idea', letter: 'A', label: '대의파악', sub: '글의 목적 · 요지 · 주제 · 제목' },
  { key: 'implication', letter: 'B', label: '함축의미추론', sub: '밑줄 친 부분의 의미' },
  { key: 'blank-inference', letter: 'C', label: '빈칸추론', sub: '빈칸에 들어갈 말' },
  { key: 'sentence-insertion', letter: 'D', label: '문장삽입', sub: '주어진 문장의 위치' },
  { key: 'sentence-ordering', letter: 'E', label: '순서배열', sub: '글의 순서' },
  { key: 'content-match', letter: 'F', label: '내용일치/불일치', sub: '글의 내용 파악' },
  { key: 'summary', letter: 'G', label: '요약문 완성', sub: '빈칸 (A), (B)' },
  { key: 'reference', letter: 'H', label: '지칭·어조 추론', sub: '가리키는 대상' },
  { key: 'underline-grammar', letter: 'I', label: '수능형 어법', sub: '어법상 틀린 것' },
  { key: 'usage-distinction', letter: 'J', label: '용법 구분', sub: '쓰임이 다른 것' },
  { key: 'error-correction', letter: 'K', label: '오류 찾아 고치기', sub: '서술형' },
  { key: 'word-ordering', letter: 'L', label: '어순 배열', sub: '서술형' },
  { key: 'blank-grammar', letter: 'M', label: '빈칸 어법', sub: '적절한 형태' },
];

// ─── Parse args ─────────────────────────────────────────────
const args = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('--')) args[arg.slice(2)] = arr[i + 1];
});

const bankNames = (args.banks || 'all').split(',');
const bookId = args.id || 'wb-sample';
const bookTitle = args.title || '워크북 샘플';
const maxPerSection = parseInt(args.max || '0') || 0; // 0 = all

// ─── Load banks ─────────────────────────────────────────────
let allProblems = [];
const bankFiles = fs.readdirSync(BANK_DIR).filter(f => f.endsWith('-bank.json'));

bankFiles.forEach(file => {
  const bankName = file.replace('-bank.json', '');
  if (bankNames[0] !== 'all' && !bankNames.includes(bankName)) return;

  const bank = JSON.parse(fs.readFileSync(path.join(BANK_DIR, file), 'utf8'));
  const src = bank.source;
  bank.problems.filter(p => p.id).forEach(p => {
    p._source = `${src.textbook.toUpperCase()} ${src.unit} · ${src.title}`;
    p._bankFile = bankName;
    allProblems.push(p);
  });
});

console.log(`📦 Loaded ${allProblems.length} problems from ${bankFiles.length} banks`);

// ─── Group by type ──────────────────────────────────────────
const grouped = {};
SECTIONS.forEach(s => { grouped[s.key] = []; });
allProblems.forEach(p => {
  if (grouped[p.type]) grouped[p.type].push(p);
});

// ─── Generate HTML fragments ────────────────────────────────
const outputDir = path.join(CONTENT_DIR);
fs.mkdirSync(outputDir, { recursive: true });

const pages = [];
let globalNum = 1;

// Cover
const coverHtml = `<div class="cover-top-section">
  <div class="cover-brand eng-text">HAEMIN ENGLISH</div>
</div>
<div class="cover-center-section">
  <div class="cover-accent-line"></div>
  <div class="cover-main-title eng-text">WORKBOOK</div>
  <div class="cover-subtitle">${bookTitle}</div>
  <div class="cover-accent-line"></div>
  <div class="cover-chapter-info">위례고 고1 내신대비 · 변형 문제</div>
</div>
<div class="cover-bottom-section">
  <div class="cover-edition">Haemin English · 2026</div>
</div>`;
fs.writeFileSync(path.join(outputDir, `${bookId}-cover.html`), coverHtml);
pages.push({ type: 'content', src: `school/wirye-g1-ne/${bookId}-cover.html`, pageClass: 'cover-page no-header-footer' });

// Compact style
const compactCss = `<style>
/* Workbook compact overrides */
.passage-block { margin-bottom: 14px !important; padding: 10px 12px !important; }
.passage-body { padding: 6px 10px !important; line-height: 1.55 !important; font-size: 9.5pt !important; }
.passage-body p { margin-bottom: 3px !important; text-align: justify !important; }
.question-box { margin-top: 6px !important; padding: 6px 10px !important; }
.question-box p { margin-bottom: 2px !important; }
.answer-choices p { margin: 1px 0 !important; font-size: 9pt !important; }
.chapter-header { margin-bottom: 12px !important; padding-bottom: 6px !important; }
.section-title { margin: 12px 0 8px 0 !important; }
.passage-label { margin-bottom: 4px !important; }
.page-content { min-height: auto !important; }
/* 서술형 답안란 */
.answer-line { border-bottom: 1px solid #D1D5DB !important; height: 28px !important; margin: 6px 0 !important; }
.answer-area { border: 1px solid #D1D5DB !important; border-radius: 4px !important; min-height: 40px !important; padding: 6px 10px !important; margin: 6px 0 !important; }
/* 어순배열 칩 */
.word-chips { display: flex !important; flex-wrap: wrap !important; gap: 5px !important; margin: 6px 0 !important; }
.word-chip { font-family: 'Inter', sans-serif !important; font-size: 9pt !important; padding: 3px 8px !important; background-color: #F0F9FF !important; border: 1px solid #BAE6FD !important; border-radius: 4px !important; color: #0369A1 !important; font-weight: 500 !important; }
/* 순서배열 청크 */
.ordering-chunk { font-family: 'Inter', sans-serif !important; font-size: 9pt !important; padding: 5px 10px !important; background-color: #FFFBEB !important; border: 1px solid #FDE68A !important; border-radius: 4px !important; margin: 4px 0 !important; line-height: 1.5 !important; }
.ordering-chunk b { color: #D97706 !important; }
/* 주어진 문장 */
.given-box { font-family: 'Inter', sans-serif !important; font-size: 9pt !important; padding: 6px 10px !important; background-color: #FEF3C7 !important; border: 1px solid #FDE68A !important; border-radius: 4px !important; margin-bottom: 6px !important; line-height: 1.5 !important; font-weight: 500 !important; color: #92400E !important; }
/* 요약문 템플릿 */
.summary-box { font-family: 'Inter', sans-serif !important; font-size: 9pt !important; padding: 6px 10px !important; background-color: #F0F9FF !important; border: 1px solid #BAE6FD !important; border-radius: 4px !important; margin: 6px 0 !important; line-height: 1.6 !important; color: #0369A1 !important; }
</style>`;
fs.writeFileSync(path.join(outputDir, `${bookId}-compact.html`), compactCss);
pages.push({ type: 'content', src: `school/wirye-g1-ne/${bookId}-compact.html`, pageClass: 'no-header-footer' });

// ─── Render each section ────────────────────────────────────
const answerRows = [];

SECTIONS.forEach(section => {
  let problems = grouped[section.key];
  if (problems.length === 0) return;
  if (maxPerSection > 0) problems = problems.slice(0, maxPerSection);

  let html = `<div class="chapter-header first-in-page">
  <span class="chapter-number">${section.letter}</span>
  <span>${section.label}</span>
</div>\n`;

  problems.forEach(p => {
    const num = String(globalNum).padStart(2, '0');
    html += renderProblem(p, num, section);
    answerRows.push({ section: section.letter + '. ' + section.label, num, answer: formatAnswer(p) });
    globalNum++;
  });

  // Split into pages (~3-4 problems per page for readability)
  const pageSize = (section.key === 'error-correction' || section.key === 'word-ordering') ? 5 : 3;
  const chunks = chunkArray(problems, pageSize);

  // Write as single file per section (CSS page-break handles pagination)
  const fileName = `${bookId}-${section.key}.html`;
  fs.writeFileSync(path.join(outputDir, fileName), html);
  pages.push({ type: 'content', src: `school/wirye-g1-ne/${fileName}` });
});

// ─── Answer page ────────────────────────────────────────────
let ansHtml = `<div class="chapter-header first-in-page">
  <span class="chapter-number">ANSWERS</span>
  <span>빠른 정답</span>
</div>
<table class="grammar-table" style="max-width: 500px;">
  <thead><tr><th>유형</th><th>번호</th><th>정답</th></tr></thead>
  <tbody>\n`;

let prevSection = '';
answerRows.forEach(row => {
  const sectionCell = row.section !== prevSection
    ? `<td rowspan="${answerRows.filter(r => r.section === row.section).length}">${row.section}</td>` : '';
  ansHtml += `    <tr>${sectionCell}<td>${row.num}</td><td>${row.answer}</td></tr>\n`;
  prevSection = row.section;
});
ansHtml += `  </tbody>\n</table>`;

const ansFileName = `${bookId}-answers.html`;
fs.writeFileSync(path.join(outputDir, ansFileName), ansHtml);
pages.push({ type: 'content', src: `school/wirye-g1-ne/${ansFileName}` });

// ─── YAML manifest ──────────────────────────────────────────
const manifest = {
  version: 2,
  book: {
    id: bookId,
    title: bookTitle,
    shortTitle: bookTitle,
    author: 'Haemin English',
    brand: 'Haemin English',
    style: 'ne-textbook',
    subject: 'reading',
    level: 'basic',
  },
  pages: pages,
};
const yamlStr = yaml.dump(manifest, { lineWidth: 120 });
fs.writeFileSync(path.join(BOOKS_DIR, `${bookId}.yaml`), yamlStr);

console.log(`✅ Generated ${globalNum - 1} problems across ${SECTIONS.filter(s => grouped[s.key].length > 0).length} sections`);
console.log(`📄 YAML: ${path.join(BOOKS_DIR, bookId + '.yaml')}`);
console.log(`📄 Files: ${pages.length} content fragments`);

// ─── Renderers ──────────────────────────────────────────────
function renderProblem(p, num, section) {
  const srcLabel = p._source || '';
  let html = '';

  switch (p.type) {
    case 'main-idea':
    case 'implication':
    case 'blank-inference':
    case 'content-match':
    case 'reference':
    case 'tone-mood':
      html = renderPassageWithChoices(p, num, srcLabel);
      break;
    case 'sentence-insertion':
      html = renderSentenceInsertion(p, num, srcLabel);
      break;
    case 'sentence-ordering':
      html = renderSentenceOrdering(p, num, srcLabel);
      break;
    case 'summary':
      html = renderSummary(p, num, srcLabel);
      break;
    case 'underline-grammar':
    case 'usage-distinction':
    case 'blank-grammar':
      html = renderGrammarWithChoices(p, num, srcLabel);
      break;
    case 'error-correction':
      html = renderErrorCorrection(p, num, srcLabel);
      break;
    case 'word-ordering':
      html = renderWordOrdering(p, num, srcLabel);
      break;
    default:
      html = renderPassageWithChoices(p, num, srcLabel);
  }
  return html;
}

function renderPassageWithChoices(p, num, srcLabel) {
  const choicesHtml = (p.choices || []).map((c, i) =>
    `      <p class="eng-text">${CIRCLED[i + 1]} ${c}</p>`
  ).join('\n');

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  ${p.passage ? `<div class="passage-body"><p class="eng-text">${p.passage}</p></div>` : ''}
  ${p.stem ? `<div class="passage-body"><p class="eng-text">${p.stem}</p></div>` : ''}
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    <div class="answer-choices">
${choicesHtml}
    </div>
  </div>
</div>\n`;
}

function renderSentenceInsertion(p, num, srcLabel) {
  const choicesHtml = (p.choices || []).map((c, i) =>
    `      <p>${CIRCLED[i + 1]} ${c}</p>`
  ).join('\n');

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  <div class="given-box">${p.givenSentence || ''}</div>
  <div class="passage-body"><p class="eng-text">${p.passage || ''}</p></div>
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    ${p.choices ? `<div class="answer-choices">\n${choicesHtml}\n    </div>` : ''}
  </div>
</div>\n`;
}

function renderSentenceOrdering(p, num, srcLabel) {
  let chunksHtml = '';
  if (p.chunks) {
    chunksHtml = Object.entries(p.chunks).map(([k, v]) =>
      `    <div class="ordering-chunk"><b>(${k})</b> ${v}</div>`
    ).join('\n');
  }
  const choicesHtml = (p.choices || []).map((c, i) =>
    `      <p>${CIRCLED[i + 1]} ${c}</p>`
  ).join('\n');

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  ${p.givenStart ? `<div class="passage-body"><p class="eng-text">${p.givenStart}</p></div>` : ''}
${chunksHtml}
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    <div class="answer-choices">
${choicesHtml}
    </div>
  </div>
</div>\n`;
}

function renderSummary(p, num, srcLabel) {
  const choicesHtml = (p.choices || []).map((c, i) =>
    `      <p class="eng-text">${CIRCLED[i + 1]} ${c}</p>`
  ).join('\n');

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  <div class="passage-body"><p class="eng-text">${p.passage || ''}</p></div>
  ${p.summaryTemplate ? `<div class="summary-box">${p.summaryTemplate}</div>` : ''}
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    <div class="answer-choices">
${choicesHtml}
    </div>
  </div>
</div>\n`;
}

function renderGrammarWithChoices(p, num, srcLabel) {
  const text = p.passage || p.stem || '';
  // usage-distinction: choices are full sentences, single-column with more space
  const isUsageDist = p.type === 'usage-distinction';
  const choicesHtml = (p.choices || []).map((c, i) =>
    `      <p class="eng-text"${isUsageDist ? ' style="margin-bottom:4px !important; line-height:1.6 !important;"' : ''}>${CIRCLED[i + 1]} ${c}</p>`
  ).join('\n');

  // If no passage/stem (e.g. usage-distinction), show choices directly
  const passageBlock = text
    ? `  <div class="passage-body"><p class="eng-text">${text}</p></div>`
    : '';

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
${passageBlock}
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    <div class="answer-choices">
${choicesHtml}
    </div>
  </div>
</div>\n`;
}

function renderErrorCorrection(p, num, srcLabel) {
  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  <div class="question-box" style="padding: 10px 14px !important;">
    <p><b>Q.</b> ${p.instruction}</p>
    <p class="eng-text" style="margin: 6px 0 !important; line-height: 1.8 !important; font-size: 10pt !important;">${p.stem || ''}</p>
    <p style="margin-top: 6px !important; font-size: 9pt !important; color: #6B7280 !important;">→ <span style="display: inline-block; border-bottom: 1px solid #9CA3AF; min-width: 200px;">&nbsp;</span></p>
  </div>
</div>\n`;
}

function renderWordOrdering(p, num, srcLabel) {
  const chipsHtml = (p.words || []).map(w =>
    `    <span class="word-chip">${w}</span>`
  ).join('\n');

  return `
<div class="passage-block">
  <div class="passage-label"><span class="passage-badge eng-text">${num}</span> <small>${srcLabel}</small></div>
  <div class="question-box">
    <p><b>Q.</b> ${p.instruction}</p>
    <p class="eng-text" style="margin: 8px 0 4px 0 !important; padding: 8px 12px !important; background-color: #F8FAFC !important; border-left: 3px solid #BAE6FD !important; border-radius: 0 4px 4px 0 !important; line-height: 1.7 !important;">${p.stem || ''}</p>
    <div class="word-chips">
${chipsHtml}
    </div>
    <div class="answer-line"></div>
  </div>
</div>\n`;
}

function formatAnswer(p) {
  if (typeof p.answer === 'number') return CIRCLED[p.answer] || String(p.answer);
  return String(p.answer || '');
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
