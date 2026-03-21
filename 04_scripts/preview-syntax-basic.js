#!/usr/bin/env node
/**
 * preview-syntax-basic.js — 구문독해 Basic 전체 교재 PDF
 *
 * syntax-bridge.html의 디자인 시스템을 그대로 사용.
 * PDF에서 강의 해설 추출 + JSON 데이터(문제/정답) 결합
 * → 커버 → 파트 구분 → [해설 → 문제 → 정답] × 19강 → 마무리(100문제×4)
 *
 * Usage: node 04_scripts/preview-syntax-basic.js
 * Output: 02_textbooks/output/html/syntax-basic.html & pdf/syntax-basic.pdf
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const PDF_PATH = path.join(ROOT, "Vera's Flavor 편입영어_ 구문독해 Basic.pdf");
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'syntax', 'basic');
const OUT_HTML = path.join(ROOT, '02_textbooks', 'output', 'html');
const OUT_PDF = path.join(ROOT, '02_textbooks', 'output', 'pdf');

fs.mkdirSync(OUT_HTML, { recursive: true });
fs.mkdirSync(OUT_PDF, { recursive: true });

// ─── Unit/Review Metadata ────────────────────────────────────────────────────
const UNITS_META = [
  { num: 1, part: 'I', week: 1, title: '1형식 문장 (S + V)' },
  { num: 2, part: 'I', week: 1, title: '2형식 문장 (S + V + C)' },
  { num: 3, part: 'I', week: 1, title: '3형식 문장 (S + V + O)' },
  { num: 4, part: 'I', week: 1, title: '4형식 문장 (S + V + IO + DO)' },
  { num: 5, part: 'I', week: 1, title: '5형식 문장 (S + V + O + OC)' },
  { num: 6, part: 'II', week: 2, title: '전치사구' },
  { num: 7, part: 'II', week: 2, title: '부사' },
  { num: 8, part: 'II', week: 2, title: '수식어 걷어내기 실전' },
  { num: 9, part: 'II', week: 2, title: '수식어 종합' },
  { num: 10, part: 'III', week: 3, title: 'to부정사 (명사적 용법)' },
  { num: 11, part: 'III', week: 3, title: 'to부정사 (형용사/부사적 용법)' },
  { num: 12, part: 'III', week: 3, title: '동명사' },
  { num: 13, part: 'III', week: 3, title: '분사 (현재분사/과거분사)' },
  { num: 14, part: 'III', week: 3, title: '준동사 종합' },
  { num: 15, part: 'IV', week: 4, title: '형용사절 (관계대명사)' },
  { num: 16, part: 'IV', week: 4, title: '형용사절 (관계부사)' },
  { num: 17, part: 'IV', week: 4, title: '명사절' },
  { num: 18, part: 'IV', week: 4, title: '부사절' },
  { num: 19, part: 'IV', week: 4, title: '절 종합' },
  { num: 20, part: 'IV', week: 4, title: '[완강] 학습 로드맵' },
];

const PART_TITLES = {
  'I': '1주차 — 문장의 기본 뼈대 세우기',
  'II': '2주차 — 수식어 걷어내기',
  'III': '3주차 — 준동사 파헤치기',
  'IV': '4주차 — 절 정복하기',
};

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📘 Generating: 구문독해 Basic Preview (syntax-bridge design)');

  // 1. Extract text from PDF
  const buf = fs.readFileSync(PDF_PATH);
  const pdf = await pdfParse(buf);
  const lines = pdf.text.split('\n');
  console.log(`  📄 PDF: ${lines.length} lines`);

  // 2. Map section boundaries
  const unitBounds = [];
  for (let u = 1; u <= 20; u++) {
    let lectStart = -1, exStart = -1, ansStart = -1;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t === u + '강' && lectStart === -1) lectStart = i;
      if (t === u + '강 연습 문제' && exStart === -1) exStart = i;
      if (t === u + '강 연습 문제 정답' && ansStart === -1) ansStart = i;
    }
    unitBounds.push({ unit: u, lectStart, exStart, ansStart });
  }

  // 3. Load JSON data
  const unitData = [];
  for (let i = 1; i <= 19; i++) {
    const f = `unit${String(i).padStart(2, '0')}-problems.json`;
    unitData.push(JSON.parse(fs.readFileSync(path.join(DATA_DIR, f))));
  }
  const reviewData = [];
  for (let w = 1; w <= 4; w++) {
    reviewData.push(JSON.parse(fs.readFileSync(path.join(DATA_DIR, `review-week${w}-problems.json`))));
  }

  // 4. Extract lecture content per unit
  function extractLecture(unitNum) {
    const b = unitBounds[unitNum - 1];
    if (b.lectStart === -1) return { title: '', sections: [] };
    const end = b.exStart > 0 ? b.exStart : (unitBounds[unitNum] ? unitBounds[unitNum].lectStart : lines.length);

    const rawLines = [];
    for (let i = b.lectStart + 1; i < end; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (/^\d+$/.test(line) && parseInt(line) < 200) continue; // page numbers
      if (/^Vera's Flavor/.test(line)) continue;
      if (/^구문독해\s*BASIC/.test(line)) continue;
      rawLines.push(line);
    }

    // Parse into structured sections
    const title = rawLines.length > 0 ? rawLines[0] : '';
    const sections = [];
    let currentSection = { type: 'content', lines: [] };

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Section headers
      if (/^예제$/.test(line)) {
        if (currentSection.lines.length) sections.push(currentSection);
        currentSection = { type: 'example', lines: [] };
        continue;
      }
      if (/^Vera's Secret Flavor/.test(line)) {
        if (currentSection.lines.length) sections.push(currentSection);
        currentSection = { type: 'tip', lines: [] };
        continue;
      }
      currentSection.lines.push(line);
    }
    if (currentSection.lines.length) sections.push(currentSection);

    return { title, sections };
  }

  // 5. Build HTML
  let html = buildHead();

  // ── Cover Page ──
  html += `
<div class="page no-header-footer cover-page">
  <div class="cover-main-content">
    <h1 class="cover-title">Vera's Flavor</h1>
    <p class="cover-subtitle">편입영어 구문독해 Basic 편</p>
  </div>
  <div class="cover-author">
    <p>verajin ACADEMY</p>
  </div>
</div>`;

  // ── Per-unit pages ──
  let currentPart = '';
  for (let u = 1; u <= 19; u++) {
    const meta = UNITS_META[u - 1];
    const data = unitData[u - 1];
    const lect = extractLecture(u);

    // ── Part divider page ──
    if (meta.part !== currentPart) {
      currentPart = meta.part;
      html += `
<div class="page no-header-footer">
  <div class="page-content">
    <div class="part-opener">
      <div class="part-title">PART ${meta.part}</div>
      <div class="part-subtitle">${PART_TITLES[meta.part]}</div>
    </div>
  </div>
</div>`;
    }

    // ── Lecture page(s) ──
    html += pageOpen(`${u}강 ${esc(data.title)}`);
    html += `
    <header class="unit-header">
      <h1>${u}강: ${esc(data.title)}</h1>
      <p style="font-size:9pt;color:var(--color-muted);margin-top:0.3rem;">PART ${meta.part} · ${meta.week}주차</p>
    </header>`;

    for (const sec of lect.sections) {
      if (sec.type === 'example') {
        html += `<div class="example-analysis avoid-break">`;
        html += `<p><span class="label">예제 분석</span></p>`;
        for (const line of sec.lines) {
          if (/\(S\)|\(V\)|\(O\)|\(C\)|\(IO\)|\(DO\)|\(OC\)/.test(line)) {
            html += `<p style="font-family:'Inter',monospace;color:var(--color-primary);font-size:9.5pt;">${esc(line)}</p>`;
          } else if (/^해석[:：]/.test(line) || /^역할[:：]/.test(line)) {
            html += `<p class="process">${esc(line)}</p>`;
          } else {
            html += `<p>${esc(line)}</p>`;
          }
        }
        html += `</div>`;
      } else if (sec.type === 'tip') {
        html += `<div class="rule-box avoid-break">`;
        html += `<p>💡 Vera's Secret Flavor</p>`;
        for (const line of sec.lines) {
          html += `<p style="font-size:9.5pt;font-weight:400;text-align:left;">${esc(line)}</p>`;
        }
        html += `</div>`;
      } else {
        // content
        for (const line of sec.lines) {
          if (/\(S\)|\(V\)|\(O\)|\(C\)/.test(line)) {
            html += `<div class="concept-box avoid-break"><p>${esc(line)}</p></div>`;
          } else {
            html += `<p style="text-align:justify;">${esc(line)}</p>`;
          }
        }
      }
    }
    html += pageClose();

    // ── Exercise page (problems only, no answers) ──
    html += pageOpen(`${u}강 연습 문제`);
    html += `
    <header class="unit-header">
      <h1>${u}강 연습 문제</h1>
    </header>
    <div class="concept-box" style="margin-bottom:1.5rem;">
      <p><strong>지시문:</strong> ${esc(data.instruction)}</p>
    </div>
    <section class="exercise-section">
      <h3>연습 문제</h3>
      <ol>`;
    for (const p of data.problems) {
      html += `
        <li>${esc(p.stem)}</li>
        <div class="spacer-lg"></div>`;
    }
    html += `
      </ol>
    </section>`;
    html += pageClose();

    // ── Answer page (detailed) ──
    html += pageOpen(`${u}강 정답 및 해설`);
    html += `
    <section class="detailed-answer-section">
      <h2>${u}강 | 연습 문제 정답</h2>`;
    for (const p of data.problems) {
      const a = p.answer;
      const num = String(p.number).padStart(2, '0');
      const patLabel = a.pattern ? ` <span class="answer-text">${esc(a.pattern)}</span>` : '';
      html += `
      <div class="detailed-answer-item">
        <div class="detailed-answer-header">
          <div class="detailed-answer-number">${num}</div>
          <div class="answer-label">구조 분석${patLabel}</div>
        </div>
        <div class="answer-detail-block">`;
      if (a.analysis) {
        html += `
          <div class="answer-explanation">
            <h4>구조 분석</h4>
            <p>${esc(a.analysis)}</p>
          </div>
          <div class="spacer-sm"></div>`;
      }
      html += `
          <div class="answer-translation">
            <h4>문장 해석</h4>
            <p>${esc(a.translation)}</p>
          </div>
        </div>
      </div>`;
    }
    html += `
    </section>`;
    html += pageClose();
  }

  // ── Unit 20 (완강) ──
  const lect20 = extractLecture(20);
  if (lect20.sections.length > 0) {
    html += pageOpen('20강 완강');
    html += `
    <header class="unit-header">
      <h1>20강: [완강] 학습 로드맵</h1>
    </header>`;
    for (const sec of lect20.sections) {
      for (const line of sec.lines) {
        html += `<p style="text-align:justify;">${esc(line)}</p>`;
      }
    }
    html += pageClose();
  }

  // ── Review sections ──
  for (let w = 0; w < 4; w++) {
    const r = reviewData[w];
    const weekNum = w + 1;
    const partLabel = ['I', 'II', 'III', 'IV'][w];

    // ── Part divider for review ──
    html += `
<div class="page no-header-footer">
  <div class="page-content">
    <div class="part-opener">
      <div class="part-title">${weekNum}주차 마무리</div>
      <div class="part-subtitle">${esc(r.title)}</div>
    </div>
  </div>
</div>`;

    // ── Review problems (multiple pages, 15 per page) ──
    const PROBLEMS_PER_PAGE = 15;
    const previewCount = Math.min(r.problems.length, 30); // show first 30
    const previewProblems = r.problems.slice(0, previewCount);

    for (let pg = 0; pg < Math.ceil(previewCount / PROBLEMS_PER_PAGE); pg++) {
      const slice = previewProblems.slice(pg * PROBLEMS_PER_PAGE, (pg + 1) * PROBLEMS_PER_PAGE);
      html += pageOpen(`${weekNum}주차 마무리 (${pg + 1})`);
      if (pg === 0) {
        html += `
      <header class="unit-header">
        <h1>${esc(r.title)}</h1>
        <p style="font-size:9pt;color:var(--color-muted);margin-top:0.3rem;">${esc(r.instruction)}</p>
      </header>
      <p style="font-size:8pt;color:var(--color-muted);margin-bottom:1rem;">* 100문제 중 처음 30문제만 표시</p>`;
      }
      html += `
      <section class="exercise-section">
        <ol>`;
      for (const p of slice) {
        html += `
          <li>${esc(p.stem)}</li>
          <div class="spacer-md"></div>`;
      }
      html += `
        </ol>
      </section>`;
      html += pageClose();
    }

    // ── Review answers (compact grid) ──
    html += pageOpen(`${weekNum}주차 마무리 정답`);
    html += `
    <section class="answer-section">
      <h2>${weekNum}주차 마무리 | 정답</h2>
      <p style="font-size:8pt;color:var(--color-muted);margin-bottom:1rem;">* 처음 30문제 정답만 표시</p>
      <div class="answer-grid">`;

    // Split into 3 columns
    const cols = [[], [], []];
    for (let i = 0; i < previewCount; i++) {
      cols[i % 3].push(previewProblems[i]);
    }

    for (let c = 0; c < 3; c++) {
      html += `
        <div class="answer-block">
          <h4>Q${cols[c].length > 0 ? cols[c][0].number : ''}~${cols[c].length > 0 ? cols[c][cols[c].length - 1].number : ''}</h4>
          <ol>`;
      for (const p of cols[c]) {
        const a = p.answer;
        const trans = a.translation || '';
        html += `<li>${esc(trans.substring(0, 40))}${trans.length > 40 ? '…' : ''}</li>`;
      }
      html += `
          </ol>
        </div>`;
    }
    html += `
      </div>
    </section>`;
    html += pageClose();
  }

  html += `\n</body>\n</html>`;

  // 6. Write HTML
  const htmlPath = path.join(OUT_HTML, 'syntax-basic-preview.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`  📄 HTML: ${htmlPath} (${(html.length / 1024).toFixed(0)}KB)`);

  // 7. Generate PDF
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  const pdfPath = path.join(OUT_PDF, 'syntax-basic-preview.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
  });
  await browser.close();
  console.log(`  📕 PDF: ${pdfPath}`);
  console.log('  ✅ Done');
}

// ─── Page wrappers ───────────────────────────────────────────────────────────
function pageOpen(headerLabel) {
  return `
<div class="page">
  <div class="page-header">
    <span class="eng-text">Vera's Flavor</span>
    <span>편입영어 구문독해 Basic 편</span>
  </div>
  <div class="page-content">`;
}

function pageClose() {
  return `
  </div>
  <div class="page-footer"></div>
</div>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── CSS (syntax-bridge.html 디자인 시스템 복제) ─────────────────────────────
function buildHead() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>편입영어 구문독해 Basic 편</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* =================================================================== */
    /* 1. A4 규격 구현 (syntax-bridge.html 동일) */
    /* =================================================================== */
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: 'Noto Sans KR', sans-serif;
      background: #f2f2f0;
      counter-reset: page;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      overflow: visible;
      margin: 20mm auto;
      padding: 20mm 20mm 25mm 20mm;
      background: white;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    .page-content {
      flex-grow: 1;
    }

    .page-footer {
      text-align: center;
      font-size: 9pt;
      color: #111111;
      padding-top: 10mm;
    }

    .page-footer::after {
      counter-increment: page;
      content: counter(page);
    }

    .no-header-footer .page-footer {
      display: none;
    }

    .no-header-footer {
      padding: 0;
    }

    @media print {
      body { background: white; }
      .page { margin: 0; box-shadow: none; min-height: 297mm; height: auto; overflow: visible; }
    }

    p, li, div { orphans: 3; widows: 3; }

    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    h1, h2, h3, h4, h5, h6 {
      break-after: avoid;
      page-break-after: avoid;
    }

    table, figure, blockquote {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* =================================================================== */
    /* 2. 디자인 시스템 (Theme: Mint/Sky Blue, Rounded) */
    /* =================================================================== */
    :root {
      --font-main: 'Noto Sans KR', sans-serif;
      --font-serif: 'Noto Serif KR', serif;

      --color-primary: #111111;
      --color-secondary: #111111;
      --color-heading: #111111;
      --color-text: #111111;
      --color-muted: #111111;
      --color-border: #ddd6c8;
      --color-bg-light: #faf8f2;
      --color-star: #f4e3a0;
      --color-red: #c84c4c;

      --radius-sm: 4px;
      --radius-md: 8px;
      --radius-lg: 12px;

      --measure: 65ch;
      --leading: 1.7;
      --body-size: 10pt;
    }

    body {
      font-size: var(--body-size);
      line-height: var(--leading);
      color: var(--color-text);
    }

    body * {
      color: #111111;
    }

    /* =================================================================== */
    /* 3. 컴포넌트 디자인 */
    /* =================================================================== */

    /* 표지 페이지 */
    .cover-page {
      display: flex;
      flex-direction: column;
      text-align: center;
      background: #faf8f2;
    }

    .cover-main-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .cover-title {
      font-family: var(--font-serif);
      font-size: 28pt;
      font-weight: 700;
      color: var(--color-heading);
      margin-bottom: 0.5rem;
    }

    .cover-subtitle {
      font-size: 18pt;
      color: var(--color-muted);
      margin-bottom: 3rem;
    }

    .cover-author {
      flex-shrink: 0;
      padding-bottom: 2rem;
      font-size: 12pt;
      color: var(--color-muted);
    }

    /* 페이지 헤더 */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: var(--color-muted);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .eng-text {
      font-family: 'Inter', sans-serif;
      font-style: normal;
    }

    /* 파트 구분 페이지 */
    .part-opener {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
    }

    .part-title {
      font-size: 20pt;
      color: var(--color-muted);
      font-weight: 400;
      margin-bottom: 0.5rem;
    }

    .part-subtitle {
      font-family: var(--font-serif);
      font-size: 32pt;
      color: var(--color-heading);
      font-weight: 700;
      display: inline-block;
      position: relative;
      padding-bottom: 1.5rem;
    }

    .part-subtitle::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
      width: 80px;
      height: 4px;
      background-color: var(--color-primary);
      border-radius: 2px;
    }

    /* 유닛 헤더 */
    .unit-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .unit-header h1 {
      font-family: var(--font-serif);
      font-size: 22pt;
      color: var(--color-heading);
      margin: 0;
    }

    /* 핵심 개념 박스 */
    .concept-box {
      background-color: var(--color-bg-light);
      border: 1px solid var(--color-border);
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      border-radius: var(--radius-md);
    }

    .concept-box p {
      margin: 0;
      max-width: 100%;
    }

    .concept-box strong {
      color: var(--color-heading);
    }

    /* 예제 및 분석 */
    .example-analysis {
      margin: 1.5rem 0;
      padding: 1.2rem;
      border-left: 4px solid var(--color-secondary);
      background-color: #fff;
    }

    .example-analysis p {
      margin-bottom: 0.5em;
      max-width: 100%;
    }

    .example-analysis .label {
      font-weight: 700;
      color: var(--color-heading);
    }

    .example-analysis .process {
      font-size: 9.5pt;
      color: var(--color-muted);
      padding-left: 1em;
    }

    .example-analysis .answer {
      font-weight: 700;
      color: var(--color-primary);
    }

    /* 테이블 */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 9.5pt;
    }

    thead { display: table-header-group; }

    th, td {
      border: 1px solid var(--color-border);
      padding: 0.6rem;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: var(--color-bg-light);
      font-weight: 700;
    }

    /* 핵심 공식/함정 박스 */
    .rule-box, .trap-box {
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      border: 1px solid var(--color-primary);
      background-color: #fff;
      border-radius: var(--radius-md);
      text-align: center;
    }

    .rule-box p {
      font-weight: 700;
      font-size: 11pt;
      color: var(--color-heading);
      margin: 0;
    }

    .trap-box {
      border-color: var(--color-red);
    }

    .trap-box h4 {
      color: var(--color-red);
      margin: 0 0 0.5rem 0;
    }

    .trap-box p {
      font-size: 9.5pt;
      margin: 0;
    }

    /* 연습 문제 */
    .exercise-section {
      margin-top: 1rem;
    }

    .exercise-section h3 {
      font-family: var(--font-serif);
      font-size: 14pt;
      color: var(--color-heading);
      border-bottom: 2px solid var(--color-secondary);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .exercise-section ol {
      list-style-type: none;
      padding-left: 0;
      counter-reset: exercise-counter;
    }

    .exercise-section ol li {
      counter-increment: exercise-counter;
      margin-bottom: 1.2rem;
      padding-left: 2.5em;
      position: relative;
      font-family: 'Inter', 'Noto Sans KR', sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
    }

    .exercise-section ol li::before {
      content: counter(exercise-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 1.8em;
      height: 1.8em;
      line-height: 1.8em;
      text-align: center;
      font-weight: 700;
      color: var(--color-primary);
      background-color: var(--color-bg-light);
      border: 1px solid var(--color-border);
      border-radius: 50%;
    }

    /* 수직 여백 */
    .spacer { display: block; width: 100%; margin: 0; padding: 0; font-size: 0; line-height: 0; }
    .spacer-sm { height: calc(var(--leading) * 0.5em); }
    .spacer-md { height: calc(var(--leading) * 1em); }
    .spacer-lg { height: calc(var(--leading) * 2em); }
    .spacer-xl { height: calc(var(--leading) * 3em); }

    /* 정답 섹션 (v4 - Grid) */
    .answer-section h2 {
      font-family: var(--font-serif);
      color: var(--color-heading);
      margin-top: 0;
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .answer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.5rem;
    }

    .answer-block {
      break-inside: avoid;
      background-color: var(--color-bg-light);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .answer-block h4 {
      font-size: 11pt;
      color: var(--color-heading);
      margin: 0;
      padding: 0.75rem 1rem;
      background-color: #fff;
      border-bottom: 1px solid var(--color-border);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }

    .answer-block ol {
      list-style: none;
      padding: 1rem;
      font-size: 9pt;
      counter-reset: answer-item-counter;
    }

    .answer-block li {
      padding-left: 2em;
      position: relative;
      counter-increment: answer-item-counter;
      margin-bottom: 0.4rem;
    }

    .answer-block li::before {
      content: counter(answer-item-counter, decimal-leading-zero);
      position: absolute;
      left: 0;
      font-weight: 700;
      color: var(--color-muted);
      font-size: 9pt;
    }

    /* 상세 해설 페이지 */
    .detailed-answer-section h2 {
      font-family: var(--font-serif);
      font-size: 18pt;
      color: var(--color-heading);
      margin-bottom: 1.5rem;
      padding-bottom: 0.8rem;
      border-bottom: 2px solid var(--color-primary);
    }

    .detailed-answer-item {
      padding: 1.5rem 0;
      border-top: 1px solid var(--color-border);
    }

    .detailed-answer-item:first-of-type {
      border-top: none;
      padding-top: 0;
    }

    .detailed-answer-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.2rem;
    }

    .detailed-answer-number {
      font-family: var(--font-serif);
      font-size: 22pt;
      color: var(--color-heading);
      line-height: 1;
      flex-shrink: 0;
    }

    .answer-label {
      display: flex;
      align-items: center;
      font-size: 12pt;
      font-weight: 700;
    }

    .answer-label::before {
      content: '✔';
      color: var(--color-secondary);
      font-size: 14pt;
      margin-right: 0.75rem;
    }

    .answer-text {
      background-color: #eef7ff;
      color: #111111;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-family: 'D2Coding', 'Courier New', monospace;
      margin-left: 0.5rem;
    }

    .answer-detail-block {
      margin-top: 1rem;
      padding-left: 3.2rem;
    }

    .answer-detail-block h4 {
      display: flex;
      align-items: center;
      font-size: 10pt;
      font-weight: 700;
      color: var(--color-muted);
      margin-bottom: 0.5rem;
    }

    .answer-detail-block h4::before {
      font-size: 14pt;
      line-height: 1;
      margin-right: 0.5rem;
      color: var(--color-muted);
    }

    .answer-translation h4::before {
      content: '"';
      font-style: italic;
    }

    .answer-explanation h4::before {
      content: '🔍';
    }

    .answer-translation p {
      font-size: 9.5pt;
      color: var(--color-muted);
      font-style: italic;
      line-height: 1.6;
    }

    .answer-explanation p {
      font-size: 10pt;
      line-height: 1.8;
    }

    .answer-explanation strong {
      font-weight: 700;
      color: var(--color-heading);
      background-color: #f4e3a0;
      padding: 1px 4px;
      border-radius: var(--radius-sm);
    }

    /* 기타 유틸리티 */
    hr {
      border: 0;
      border-top: 1px solid var(--color-border);
      margin: 2rem 0;
    }

    code {
      font-family: 'D2Coding', 'Courier New', monospace;
      background-color: #ddd6c8;
      padding: 2px 5px;
      border-radius: var(--radius-sm);
      font-size: 9.5pt;
    }

    .choice {
      font-weight: bold;
      background-color: #f4e3a0;
      padding: 1px 5px;
      border-radius: var(--radius-sm);
    }

    /* 양쪽 정렬 전역 적용 */
    .problem-text, .content-paragraph, .page-content p {
      text-align: justify !important;
    }

    /* 문제 3등분 균일 배치 */
    .problem-block {
      min-height: 80mm;
      box-sizing: border-box;
      break-inside: avoid;
    }
  </style>
</head>
<body>
`;
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
