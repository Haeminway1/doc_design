#!/usr/bin/env node
/**
 * generate-feedback-from-json.js
 * JSON 데이터 → 피드백지 HTML 생성 스크립트
 *
 * Usage: node 04_scripts/generate-feedback-from-json.js <학생이름> <YYMMDD>
 *
 * Input:  00_tutoring/<학생이름>/input/<YYMMDD>/feedback-data.json
 * Output: 00_tutoring/<학생이름>/output/<YYMMDD>/<학생이름>_피드백지_<YYMMDD>_<과목>.html
 */

const fs = require('fs');
const path = require('path');

// ─── CLI Args ───────────────────────────────────────────────────────────────
const studentName = process.argv[2];
const dateStr = process.argv[3];

if (!studentName || !dateStr) {
  console.error('Usage: node 04_scripts/generate-feedback-from-json.js <학생이름> <YYMMDD>');
  console.error('Example: node 04_scripts/generate-feedback-from-json.js 최여진 260221');
  process.exit(1);
}

// ─── Paths ──────────────────────────────────────────────────────────────────
const projectRoot = path.resolve(__dirname, '..');
const inputDir = path.join(projectRoot, '00_tutoring', studentName, 'input', dateStr);
const outputDir = path.join(projectRoot, '00_tutoring', studentName, 'output', dateStr);
const jsonPath = path.join(inputDir, 'feedback-data.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`JSON 파일 없음: ${jsonPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

// ─── Read Data ──────────────────────────────────────────────────────────────
const { normalizeFeedbackData } = require('./normalize-feedback-data');
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const data = normalizeFeedbackData(rawData);
console.log(`[${studentName}] JSON 로드 + 정규화 완료: ${data.wrongAnswers.length}개 오답`);

// ─── Output filename: 학생이름_피드백지_날짜_과목.html ─────────────────────
const subject = data.subject || '';
const htmlPath = path.join(outputDir, `${studentName}_피드백지_${dateStr}_${subject}.html`);

// ─── Textbook Data Enrichment ────────────────────────────────────────────────
if (data.textbookDataHint) {
  const hints = Array.isArray(data.textbookDataHint) ? data.textbookDataHint : [data.textbookDataHint];
  hints.forEach(hint => {
    // Try -passages.json first, then -problems.json
    const basePath = path.join(projectRoot, '02_textbooks', 'data', ...hint.split('/'));
    const tbPassagesPath = basePath + '-passages.json';
    const tbProblemsPath = basePath + '-problems.json';

    if (fs.existsSync(tbPassagesPath)) {
      const tbData = JSON.parse(fs.readFileSync(tbPassagesPath, 'utf-8'));
      console.log(`[${studentName}] 교재 데이터 로드: ${tbPassagesPath} (${tbData.passages.length}개 지문)`);
      data.wrongAnswers.forEach(wa => {
        const passage = tbData.passages.find(p => p.number === wa.q || p.number === String(wa.q) || Number(p.number) === wa.q);
        if (passage) {
          if (passage.text) wa.passage = passage.text;
          if (passage.questions && passage.questions.length > 0) {
            const q = passage.questions.find(qq => Number(qq.number) === wa.q) || passage.questions[0];
            if (q.text) wa.question = q.text;
            if (q.choices && q.choices.length > 0) wa.choices = q.choices;
          }
          console.log(`  → ${wa.q}번: 교재 데이터로 보강 완료`);
        }
      });
    } else if (fs.existsSync(tbProblemsPath)) {
      const tbData = JSON.parse(fs.readFileSync(tbProblemsPath, 'utf-8'));
      const count = tbData.problems ? tbData.problems.length : 0;
      console.log(`[${studentName}] 교재 데이터 로드: ${tbProblemsPath} (${count}개 문제)`);
    } else {
      console.warn(`[${studentName}] 교재 데이터 없음: ${hint}`);
    }
  });
}

// ─── Utilities ──────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(yymmdd) {
  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  return `20${yy}. ${mm}. ${dd}`;
}

const CIRCLE_NUMS = ['①', '②', '③', '④', '⑤'];

function toCircleChoiceToken(value) {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  const circle = raw.match(/[①②③④⑤]/);
  if (circle) return circle[0];
  const num = raw.match(/(^|[^0-9])([1-5])([^0-9]|$)/);
  if (num) return CIRCLE_NUMS[Number(num[2]) - 1] || raw;
  return raw;
}

function normalizeChoiceToken(value) {
  const circle = toCircleChoiceToken(value);
  if (circle) return circle;
  return value == null ? '' : String(value).trim();
}

function stripLeadingChoiceToken(text) {
  return String(text)
    .replace(/^\s*(?:[①②③④⑤⑥⑦⑧⑨⑩ⓐⓑⓒⓓⓔ]|\(?\d+\)?[.)]?)\s*/, '')
    .trim();
}

function classifyQuestionDomain(wa) {
  const type = String(wa?.type || '').toLowerCase();
  const qtext = String(wa?.question || '').toLowerCase();
  const readingHints = ['독해', '함축', '주제', '제목', '빈칸', '순서', '삽입', '요약', '지문', '의미'];
  const grammarHints = ['문법', '어법', '구문', '수동태', '시제', '분사', '준동사', '동명사', 'to부정사', '관계사'];

  // 우선순위: 문제 "유형(type)"을 질문 문장(question)보다 신뢰
  const typeHasGrammar = grammarHints.some(k => type.includes(k));
  const typeHasReading = readingHints.some(k => type.includes(k));
  if (typeHasGrammar && !typeHasReading) return 'grammar';
  if (typeHasReading && !typeHasGrammar) return 'reading';
  if (typeHasGrammar && typeHasReading) return 'grammar';

  const questionHasGrammar = grammarHints.some(k => qtext.includes(k));
  const questionHasReading = readingHints.some(k => qtext.includes(k));
  if (questionHasGrammar && !questionHasReading) return 'grammar';
  if (questionHasReading && !questionHasGrammar) return 'reading';
  if (questionHasGrammar && questionHasReading) return 'grammar';

  return 'other';
}

/**
 * explanation 텍스트 마커 → HTML 변환
 *
 * 입력 형식 (Agent 3 출력):
 *   1. 한줄요약 (concept-box): 내용...
 *   2. 전체해석 (grammar-block): 내용...
 *   3. 핵심키워드 테이블: Positive - ...; Negative - ...
 *   4. 구조 및 방향성 (tip-box): 내용...
 *   5. 선지분석: answer-box (②): 내용... warning-box (①): 내용...
 *
 * 출력: 각 마커를 해당 CSS 클래스의 <div>로 래핑
 */
function parseExplanationToHtml(text) {
  if (!text) return '';
  const raw = String(text).replace(/\r\n/g, '\n').trim();
  if (!raw) return '';
  // 이미 HTML 태그가 있으면 그대로 반환
  if (/<div\s+class=/.test(raw)) return raw;

  let html = '';
  const numberedSections = raw.match(/(?:^|\n)\s*[1-5]\.\s*[\s\S]*?(?=(?:\n\s*[1-5]\.\s*)|$)/g);
  const sections = numberedSections && numberedSections.length > 0
    ? numberedSections
    : raw.split(/\n{2,}/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // 1. 한줄요약 (concept-box):
    if (/^\d+\.\s*한줄\s*요약(?:\s*\(concept-box\))?\s*[:：-]/i.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*한줄\s*요약(?:\s*\(concept-box\))?\s*[:：-]\s*/i, '');
      html += `\n<div class="concept-box"><span class="concept-label">한줄 요약</span>\n<p>${esc(content)}</p>\n</div>`;
      continue;
    }

    // 2. 전체해석 (grammar-block):
    if (/^\d+\.\s*전체\s*해석(?:\s*\(grammar-block\))?\s*[:：-]/i.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*전체\s*해석(?:\s*\(grammar-block\))?\s*[:：-]\s*/i, '');
      html += `\n<div class="grammar-block">${esc(content)}</div>`;
      continue;
    }

    // 3. 핵심키워드 테이블:
    if (/^\d+\.\s*핵심\s*키워드\s*테이블\s*[:：]/i.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*핵심\s*키워드\s*테이블\s*[:：]\s*/i, '');
      let positive = '';
      let negative = '';
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      const row = lines.find(l => l.startsWith('|') && !/^\|\s*[-:]/.test(l) && !/positive/i.test(l));
      if (row) {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        positive = cells[0] || '';
        negative = cells[1] || '';
      } else {
        const posMatch = content.match(/Positive\s*[-–—:：]\s*([^;\n]*)/i);
        const negMatch = content.match(/Negative\s*[-–—:：]\s*(.*)/i);
        positive = posMatch ? posMatch[1].trim().replace(/[.;]$/, '') : '';
        negative = negMatch ? negMatch[1].trim().replace(/[.;]$/, '') : '';
      }
      html += `\n<div class="tip-box" style="page-break-inside:avoid;">`;
      html += `\n  <span class="tip-label">핵심 키워드</span>`;
      if (positive) html += `\n  <p><strong style="color:#2f855a;">Positive:</strong> ${esc(positive)}</p>`;
      if (negative) html += `\n  <p><strong style="color:#e53e3e;">Negative:</strong> ${esc(negative)}</p>`;
      if (!positive && !negative) html += `\n  <p>${esc(content)}</p>`;
      html += `\n</div>`;
      continue;
    }

    // 4. 구조 및 방향성 (tip-box):
    if (/^\d+\.\s*구조\s*(및|&)\s*방향성(?:\s*\(tip-box\))?\s*[:：]/i.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*구조\s*(및|&)\s*방향성(?:\s*\(tip-box\))?\s*[:：]\s*/i, '');
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      const rows = lines
        .filter(l => l.startsWith('|'))
        .map(l => l.split('|').map(c => c.trim()).filter(Boolean))
        .filter(cells =>
          cells.length >= 2 &&
          !cells.every(c => /^[-:]+$/.test(c)) &&
          !/문장|기능|방향성/.test(cells.join(' '))
        );
      html += `\n<div class="tip-box" style="page-break-inside:avoid;">`;
      html += `\n  <span class="tip-label">구조 및 방향성</span>`;
      if (rows.length > 0) {
        html += `\n  <table><thead><tr><th>문장</th><th>기능</th><th>방향성</th></tr></thead><tbody>`;
        for (const cells of rows) {
          html += `\n    <tr><td>${esc(cells[0] || '')}</td><td>${esc(cells[1] || '')}</td><td>${esc(cells[2] || '')}</td></tr>`;
        }
        html += `\n  </tbody></table>`;
      } else {
        const sentences = content.split(/\.\s+(?=[가-힣A-Z])/).filter(Boolean);
        for (const s of sentences) {
          const clean = s.trim().replace(/\.$/, '');
          if (clean) html += `\n  <p>${esc(clean)}.</p>`;
        }
      }
      html += `\n</div>`;
      continue;
    }

    // 5. 선지분석: answer-box / warning-box 혼합
    if (/^\d+\.\s*선지\s*분석\s*[:：]/i.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*선지\s*분석\s*[:：]\s*/i, '');
      const boxRegex = /(answer-box|warning-box)\s*\(([^)]*)\)\s*[:：-]\s*([\s\S]*?)(?=(?:answer-box|warning-box)\s*\(|$)/gi;
      let found = false;
      let m;
      while ((m = boxRegex.exec(content)) !== null) {
        found = true;
        const kind = m[1].toLowerCase();
        const label = toCircleChoiceToken(m[2]) || m[2].trim();
        const body = m[3].trim().replace(/\s+/g, ' ');
        if (kind === 'answer-box') {
          html += `\n<div class="answer-box"><span class="answer-label">정답 ${esc(label)}</span>\n<p>${esc(body)}</p>\n</div>`;
        } else {
          html += `\n<div class="warning-box"><span class="warning-label">오답 ${esc(label)}</span>\n<p>${esc(body)}</p>\n</div>`;
        }
      }
      if (!found) html += `\n<p>${esc(content)}</p>`;
      continue;
    }

    // 기타: 일반 단락
    html += `\n<p>${esc(trimmed).replace(/\n/g, '<br>')}</p>`;
  }

  return html || `<p>${esc(raw).replace(/\n/g, '<br>')}</p>`;
}

function severityBadge(level) {
  const map = {
    high: '<span class="severity-high">높음</span>',
    mid: '<span class="severity-mid">보통</span>',
    low: '<span class="severity-low">낮음</span>'
  };
  return map[level] || map.mid;
}

// ─── CSS (피드백지_template.html에서 복사) ────────────────────────────────────
function getCSS() {
  return `
  /* =============================================================
     피드백지 공통 CSS v2.0 — Teal & Warm 팔레트
     Primary Dark: #2c6975 | Primary Light: #68b2a0
     Accent Blue: #1a6fc4 | Red: #e53e3e | Green: #2f855a
     ============================================================= */

  /* ===== RESET & BASE ===== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    font-size: 9.5pt;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 400;
    font-size: 9.5pt;
    line-height: 1.65;
    color: #1a202c;
    background: #f7fafa !important;
    orphans: 3; widows: 3;
  }

  @page { size: A4; margin: 15mm 13mm; }

  /* ===== PAGE BREAK ===== */
  .page-break-after { page-break-after: always !important; }
  .page-break-before { page-break-before: always !important; }
  .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
  h1, h2, h3, h4 { page-break-after: avoid !important; }
  table, .concept-box, .tip-box, .warning-box, .answer-box, .grammar-block,
  .problem-card, .diagnosis-card {
    page-break-inside: avoid !important; break-inside: avoid !important;
  }

  /* ===== HEADINGS ===== */
  h1 {
    font-size: 18pt; font-weight: 700; color: #2c6975 !important;
    margin: 16px 0 8px 0; padding-bottom: 5px;
    border-bottom: 2.5px solid #2c6975; line-height: 1.3;
  }
  h2 {
    font-size: 14pt; font-weight: 700; color: #2c6975 !important;
    margin: 14px 0 8px 0; padding-bottom: 3px;
    border-bottom: 1.5px solid #d0e4df; line-height: 1.3;
  }
  h3 {
    font-size: 12pt; font-weight: 700; color: #2d3748 !important;
    margin: 12px 0 6px 0; line-height: 1.4;
  }
  h4 {
    font-size: 10pt; font-weight: 700; color: #4a5568 !important;
    margin: 8px 0 5px 0; line-height: 1.4;
  }
  p { margin-bottom: 6px; }
  strong { font-weight: 700; }
  hr { border: none; border-top: 1px solid #d0e4df; margin: 16px 0; }

  /* ===== TABLES ===== */
  table {
    width: 100%; border-collapse: collapse;
    margin: 10px 0 12px 0; font-size: 8.5pt; line-height: 1.55;
  }
  thead th {
    background-color: #68b2a0 !important; color: #fff !important;
    font-weight: 700; padding: 6px 8px; text-align: left;
    border: 1px solid #5aa090; font-size: 8.5pt;
  }
  tbody td {
    padding: 5px 8px; border: 1px solid #d0e4df; vertical-align: top;
  }
  tbody tr:nth-child(odd) { background-color: #fff !important; }
  tbody tr:nth-child(even) { background-color: #f0f7f5 !important; }
  tbody td:first-child { font-weight: 500; }

  .result-correct { color: #2f855a !important; font-weight: 700; }
  .result-wrong { color: #e53e3e !important; font-weight: 700; }

  /* ===== REPORT HEADER (첫 페이지) ===== */
  .report-header { margin-bottom: 14px; }
  .report-date { font-size: 9.5pt; color: #718096 !important; font-weight: 400; margin-bottom: 3px; }
  .report-title {
    font-size: 20pt; font-weight: 700; color: #2c6975 !important;
    margin-bottom: 5px; line-height: 1.2; border: none; padding: 0;
  }
  .report-subtitle { font-size: 11pt; font-weight: 400; color: #4a5568 !important; margin-bottom: 2px; }
  .report-meta { font-size: 8.5pt; color: #718096 !important; line-height: 1.8; margin-top: 6px; }
  .report-meta span { display: inline-block; margin-right: 14px; }

  /* ===== SECTION HEADER BAR ===== */
  .section-header {
    background-color: #2c6975 !important; color: #fff !important;
    padding: 10px 20px; margin: 16px -13mm 12px -13mm;
    padding-left: 16mm; padding-right: 13mm;
    font-size: 14pt; font-weight: 700; line-height: 1.3;
  }
  .section-header .section-num {
    font-size: 11pt; font-weight: 300; display: block;
    margin-bottom: 1px; color: #9fcfc2 !important;
  }

  /* ===== SEVERITY BADGES ===== */
  .severity-high {
    display: inline-block; background-color: #e53e3e !important; color: #fff !important;
    font-size: 7.5pt; font-weight: 700; padding: 1px 8px; border-radius: 10px;
  }
  .severity-mid {
    display: inline-block; background-color: #ed8936 !important; color: #fff !important;
    font-size: 7.5pt; font-weight: 700; padding: 1px 8px; border-radius: 10px;
  }
  .severity-low {
    display: inline-block; background-color: #2f855a !important; color: #fff !important;
    font-size: 7.5pt; font-weight: 700; padding: 1px 8px; border-radius: 10px;
  }

  /* ===== DIAGNOSIS CARD (학습 요약) ===== */
  .diagnosis-card {
    border: 1.5px solid #a8cec5; border-radius: 16px;
    padding: 12px 16px; margin: 12px 0; background-color: #fff !important;
  }
  .diagnosis-card h3 { margin-top: 0; color: #2c6975 !important; font-size: 11pt; }
  .priority-order {
    background-color: #eaf3f0 !important; border-left: 3px solid #68b2a0;
    padding: 8px 14px; margin: 10px 0; font-size: 9.5pt; border-radius: 0 12px 12px 0;
  }

  /* ===== QUESTION BOX ===== */
  .question-box {
    background-color: #f0f7f5 !important; border-left: 3px solid #68b2a0;
    padding: 8px 12px; margin: 6px 0; font-size: 9.5pt; line-height: 1.65;
    border-radius: 0 12px 12px 0;
  }
  .question-box p { margin: 0; }

  /* ===== ANSWER BOX ===== */
  .answer-box {
    background-color: #f0fff4 !important; border-left: 3px solid #2f855a;
    padding: 6px 12px; margin: 6px 0; font-weight: 500;
    border-radius: 0 12px 12px 0;
  }

  /* ===== GRAMMAR BLOCK ===== */
  .grammar-block {
    background-color: #f0f4f3 !important; border: 1px solid #d0e4df;
    padding: 10px 14px; margin: 10px 0; border-radius: 12px;
    font-size: 8.5pt; line-height: 1.75; white-space: pre-wrap;
    page-break-inside: avoid !important; break-inside: avoid !important;
  }

  /* ===== TIP BOX ===== */
  .tip-box {
    background-color: #fffaf0 !important; border-left: 3px solid #ed8936;
    padding: 8px 14px; margin: 10px 0; border-radius: 0 12px 12px 0;
    page-break-inside: avoid !important; break-inside: avoid !important;
  }
  .tip-box .tip-label {
    font-weight: 700; color: #c05621 !important; font-size: 8.5pt;
    display: block; margin-bottom: 3px;
  }

  /* ===== WARNING BOX ===== */
  .warning-box {
    background-color: #fff5f5 !important; border-left: 3px solid #e53e3e;
    padding: 8px 14px; margin: 10px 0; border-radius: 0 12px 12px 0;
    page-break-inside: avoid !important; break-inside: avoid !important;
  }
  .warning-box .warning-label {
    font-weight: 700; color: #e53e3e !important; font-size: 8.5pt;
    display: block; margin-bottom: 3px;
  }

  /* ===== ANSWER LABEL ===== */
  .answer-box .answer-label {
    font-weight: 700; color: #2f855a !important; font-size: 8.5pt;
    display: block; margin-bottom: 3px;
  }

  /* ===== CONCEPT BOX ===== */
  .concept-box {
    background-color: #eaf3f0 !important; border: 1px solid #68b2a0;
    padding: 10px 14px; margin: 10px 0; border-radius: 12px;
    page-break-inside: avoid !important; break-inside: avoid !important;
  }
  .concept-box .concept-label {
    font-weight: 700; color: #2c6975 !important; font-size: 8.5pt;
    display: block; margin-bottom: 4px;
  }

  /* ===== PROBLEM CARD ===== */
  .problem-card {
    border: 1px solid #d0e4df; border-radius: 14px;
    padding: 12px 16px; margin: 10px 0;
    page-break-inside: avoid !important; break-inside: avoid !important;
    background-color: #fff !important;
  }
  .problem-header {
    display: flex; align-items: center; margin-bottom: 10px; gap: 10px;
  }
  .problem-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    background-color: #68b2a0 !important; color: #fff !important;
    font-weight: 700; font-size: 11pt; flex-shrink: 0;
  }
  .problem-title {
    font-size: 10pt; font-weight: 700; color: #2d3748 !important;
  }
  .problem-source {
    font-size: 7.5pt; color: #718096 !important; font-weight: 400;
    display: block; margin-top: 1px;
  }

  /* ===== HIGHLIGHT ===== */
  .hl-key { color: #2c6975 !important; font-weight: 700; }
  .hl-wrong { color: #e53e3e !important; font-weight: 700; text-decoration: line-through; }
  .hl-correct { color: #2f855a !important; font-weight: 700; }
  .hl-blue { color: #1a6fc4 !important; font-weight: 700; }

  /* ===== FLOWCHART ===== */
  .flowchart { margin: 12px 0; page-break-inside: avoid !important; }
  .flow-step {
    background-color: #eaf3f0 !important; border: 1px solid #a8cec5;
    border-radius: 12px; padding: 8px 14px; margin-bottom: 3px; font-size: 9pt;
  }
  .flow-step .step-label { font-weight: 700; color: #2c6975 !important; margin-right: 8px; }
  .flow-step .step-sub {
    padding-left: 20px; font-size: 8.5pt; color: #4a5568 !important;
    margin-top: 3px; line-height: 1.65;
  }
  .flow-arrow { text-align: center; font-size: 13pt; color: #68b2a0 !important; line-height: 1.2; margin: 2px 0; }

  /* ===== CHECKLIST ===== */
  .checklist-group { margin-bottom: 12px; page-break-inside: avoid !important; }
  .checklist-group-title {
    font-size: 10pt; font-weight: 700; color: #2c6975 !important;
    margin-bottom: 6px; padding: 3px 0; border-bottom: 1px solid #d0e4df;
  }
  .checklist-item {
    display: flex; align-items: flex-start; gap: 6px;
    padding: 3px 0; font-size: 9pt; line-height: 1.55;
  }
  .checkbox {
    display: inline-block; width: 13px; height: 13px; min-width: 13px;
    border: 1.5px solid #a0aec0; border-radius: 3px; margin-top: 2px;
  }

  /* ===== SECTION DIVIDER ===== */
  .section-divider { border: none; border-top: 1.5px solid #d0e4df; margin: 16px 0; }

  /* ===== VARIANT CHOICES ===== */
  .variant-choices { padding-left: 18px; font-size: 8.5pt; line-height: 1.75; margin: 3px 0; }

  /* ===== GROUP ROW ===== */
  .group-row td {
    background-color: #eaf3f0 !important; font-weight: 700;
    color: #2c6975 !important; border-bottom: 2px solid #68b2a0;
  }

  /* ===== COMPARE TABLE ===== */
  .compare-table thead th:nth-child(2) { background-color: #5aa090 !important; }
  .compare-table thead th:nth-child(3) { background-color: #2f855a !important; }

  /* ===== EXPRESSION TABLE ===== */
  .expression-table td:first-child { white-space: nowrap; font-weight: 700; }

  /* ===== MARKER ===== */
  .marker-o { color: #2f855a !important; font-weight: 700; }
  .marker-x { color: #e53e3e !important; font-weight: 700; }

  /* ===== PASSAGE BLOCK (독해 지문) ===== */
  .passage-block {
    background-color: #f7fafa !important; border: 1px solid #d0e4df;
    border-left: 3px solid #68b2a0;
    padding: 12px 16px; margin: 10px 0; border-radius: 0 12px 12px 0;
    font-size: 9pt; line-height: 1.85;
    text-align: justify !important;
    page-break-inside: avoid !important; break-inside: avoid !important;
  }

  /* Allow long passages to break across pages */
  .passage-block--long {
    page-break-inside: auto !important; break-inside: auto !important;
  }

  /* Legacy .page container fallback (pre-v2 feedback HTMLs) */
  .page {
    min-height: 297mm;
    height: auto;
    overflow: visible;
  }
  .page-content {
    overflow: visible;
  }

  /* ===== CHOICES LIST ===== */
  .choices-list {
    margin: 8px 0; font-size: 9pt; line-height: 1.85;
  }
  .choices-list .choice-item { padding: 1px 0; }
  .choice-correct { color: #2f855a !important; font-weight: 700; }
  .choice-wrong { color: #e53e3e !important; font-weight: 700; text-decoration: line-through; }

  /* ===== PRINT OPTIMIZATION ===== */
  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #fff !important; }
    .section-header { margin-left: -13mm; margin-right: -13mm; padding-left: 16mm; padding-right: 13mm; }
  }
`;
}

// ─── HTML Builders ──────────────────────────────────────────────────────────

function buildReportHeader(d) {
  return `
<div class="report-header">
  <div class="report-date">${formatDate(d.date)}</div>
  <h1 class="report-title" style="border:none; margin-bottom:6px;">학습 피드백지</h1>
  <div class="report-subtitle">${esc(d.subject)} — ${esc(d.textbook)}</div>
  <div class="report-meta">
    <span><strong>학생</strong> ${esc(d.student)}</span>
    <span><strong>교재</strong> ${esc(d.textbook)}</span>
    <span><strong>범위</strong> ${esc(d.range)}</span>
  </div>
</div>`;
}

function buildDiagnosisCard(d) {
  if (!d) return '';
  const s = d.summary;

  // 취약 영역 테이블
  let weakTable = '';
  if (s && s.weakAreas && s.weakAreas.length > 0) {
    weakTable = `
  <table>
    <thead>
      <tr><th>취약 영역</th><th style="width:60px;">문제 수</th><th style="width:70px;">심각도</th><th>핵심</th></tr>
    </thead>
    <tbody>
      ${s.weakAreas.map(w => `
      <tr>
        <td><strong>${esc(w.area)}</strong></td>
        <td>${w.count}문제</td>
        <td>${severityBadge(w.severity)}</td>
        <td>${esc(w.note)}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
  }

  return `
<div class="diagnosis-card">
  <h3>학습 요약</h3>
  <p style="font-size:10pt; margin-bottom:8px;">
    전체 ${s.totalQ}문제 중 오답 <strong>${s.wrongQ}문제</strong> (정답률 약 ${esc(s.correctRate)})
  </p>
  <p style="font-size:9.5pt; margin-bottom:4px;">
    <strong style="color:#38a169;">잘한 점:</strong> ${esc(s.goodPoints)}
  </p>
  <p style="font-size:9.5pt; margin-bottom:12px;">
    <strong style="color:#e53e3e;">아쉬운 점:</strong> ${esc(s.badPoints)}
  </p>
  ${weakTable}
</div>

<div class="priority-order">
  <strong>학습 우선순위:</strong> ${esc(s.priority)}
</div>`;
}

function buildWrongAnswersList(d) {
  let html = `
<div class="page-break-before section-header">
  <span class="section-num">Section 1</span>
  틀린 문제 리스트
</div>`;

  d.wrongAnswers.forEach((wa, i) => {
    const selectedLabel = normalizeChoiceToken(wa.selected);
    const correctLabel = normalizeChoiceToken(wa.correct);
    html += `
<div class="problem-card">
  <div class="problem-header">
    <div class="problem-badge">${i + 1}</div>
    <div>
      <div class="problem-title">${esc(wa.type)}</div>
      <span class="problem-source">${wa.q}번</span>
    </div>
  </div>
  <div class="question-box">
    <p>${esc(wa.question)}</p>
  </div>
  <div style="margin:8px 0; font-size:9.5pt;">
    <span class="hl-wrong">학생 답: ${esc(selectedLabel || wa.selected)}</span> &rarr;
    <span class="hl-correct">정답: ${esc(correctLabel || wa.correct)}</span>
  </div>
</div>`;
  });

  return html;
}

function buildExplanations(d) {
  let html = `
<div class="page-break-before section-header">
  <span class="section-num">Section 2</span>
  해설 파트
</div>`;

  let prevDomain = null;
  d.wrongAnswers.forEach((wa, i) => {
    const domain = classifyQuestionDomain(wa);
    // 각 문제 해설은 새 페이지에서 시작
    if (i > 0) {
      html += `\n<div class="page-break-before"></div>`;
    }
    if (domain !== prevDomain && domain !== 'other') {
      const title = domain === 'reading' ? '독해 해설' : '문법/구문 해설';
      html += `\n<h3 style="margin:0 0 10px 0; color:#2c6975;">${title}</h3>`;
      prevDomain = domain;
    }
    // 소제목
    html += `\n<h2>${wa.q}번 — ${esc(wa.type)}</h2>`;

    // 독해 지문 표시
    if (wa.passage) {
      // Allow safe inline HTML tags (<u>, <b>, <i>, <strong>, <em>, <s>, <br>)
      const safePassage = String(wa.passage)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/&lt;(\/?)([ubis]|br|strong|em)&gt;/gi, '<$1$2>');
      html += `
<div class="${wa.passage && wa.passage.length > 1500 ? 'passage-block passage-block--long' : 'passage-block'}">${safePassage}</div>`;
    }

    // 질문 + 선지
    html += `
<div class="question-box" style="margin-top:12px;">
  <p><strong>${esc(wa.question)}</strong></p>
</div>`;

    if (wa.choices && wa.choices.length > 0) {
      html += `<div class="choices-list">`;
      const normalizedCorrect = normalizeChoiceToken(wa.correct);
      const normalizedSelected = normalizeChoiceToken(wa.selected);
      wa.choices.forEach((c, j) => {
        const num = CIRCLE_NUMS[j] || `(${j + 1})`;
        const isCorrect = normalizedCorrect === num;
        const isSelected = normalizedSelected === num;
        let cls = '';
        if (isCorrect) cls = ' class="choice-correct"';
        else if (isSelected) cls = ' class="choice-wrong"';
        // Strip leading circle number if choice text already contains one
        const choiceText = stripLeadingChoiceToken(c);
        html += `\n  <div class="choice-item"${cls}>${num} ${esc(choiceText)}</div>`;
      });
      html += `\n</div>`;
    }

    // 해설 HTML (5단계 분석 등 — 텍스트 마커를 HTML 컴포넌트로 변환)
    html += parseExplanationToHtml(wa.explanation);

    // 학생 답 분석
    if (wa.studentAnalysis) {
      const sa = wa.studentAnalysis;
      html += `
<div class="tip-box" style="page-break-inside:avoid;">
  <span class="tip-label">학생 답 분석</span>
  <p><strong>어디서 막혔을까:</strong> ${esc(sa.whyChosen)}</p>
  <p><strong>오류 패턴:</strong> ${esc(sa.errorPattern)}</p>
  <p><strong>집중 포인트:</strong> ${esc(sa.focusPoint)}</p>
</div>`;
    }

  });

  return html;
}

function buildStarredCorrect(d) {
  if (!d.starredCorrect || d.starredCorrect.length === 0) return '';

  let html = `
<div class="page-break-before section-header">
  <span class="section-num">참고</span>
  별표 문항 (정답이지만 주의 필요)
</div>`;

  d.starredCorrect.forEach(sc => {
    html += `
<div class="problem-card">
  <div class="problem-header">
    <div class="problem-badge" style="background-color:#ed8936 !important;">★</div>
    <div>
      <div class="problem-title">${sc.q}번</div>
      <span class="problem-source">선택: ${esc(sc.selected)}</span>
    </div>
  </div>
  <div class="tip-box">
    <span class="tip-label">참고</span>
    <p>${esc(sc.note)}</p>
  </div>
</div>`;
  });

  return html;
}

function buildGrammarTopics(d) {
  if (!d.grammarTopics || d.grammarTopics.length === 0) return '';

  let html = `
<div class="page-break-before section-header">
  <span class="section-num">보충</span>
  문법 보충 설명
</div>`;

  d.grammarTopics.forEach(gt => {
    html += `
<div class="concept-box">
  <span class="concept-label">${esc(gt.title)}</span>
  ${gt.content}
</div>`;
  });

  return html;
}

function buildConceptQuestions(d) {
  if (!d.conceptQuestions || d.conceptQuestions.length === 0) return '';

  let html = `
<div class="page-break-before section-header">
  <span class="section-num">개념 보충</span>
  개념 보충 학습
</div>`;

  d.conceptQuestions.forEach((cq, idx) => {
    html += `\n<h2>${idx + 1}. ${esc(cq.title)}</h2>`;

    // 개념 설명 (HTML 직접 삽입)
    if (cq.explanation) html += `\n${cq.explanation}`;

    // 핵심 예시
    if (cq.examples && cq.examples.length > 0) {
      html += `\n<div class="grammar-block">`;
      cq.examples.forEach(ex => { html += `${esc(ex)}\n`; });
      html += `</div>`;
    }

    // 예문 연습
    if (cq.exampleSentences && cq.exampleSentences.length > 0) {
      html += `\n<h4>예문 연습</h4>`;
      html += `\n<div class="grammar-block">`;
      cq.exampleSentences.forEach((es, i) => { html += `${i + 1}. ${esc(es)}\n`; });
      html += `</div>`;
    }

    // 헷갈리는 포인트 (HTML 직접 삽입)
    if (cq.confusionPoints) html += `\n${cq.confusionPoints}`;

    // 연습문제 (문제만 — 정답 분리)
    if (cq.practiceProblems && cq.practiceProblems.length > 0) {
      html += `
<div class="page-break-before section-header">
  <span class="section-num">연습 ${idx + 1}</span>
  ${esc(cq.title)} 연습문제 (${cq.practiceProblems.length}문제)
</div>`;

      cq.practiceProblems.forEach((pp, i) => {
        html += `\n<p style="line-height:2.0; font-size:9.5pt; margin-bottom:2px;"><strong>${i + 1}.</strong> ${esc(pp.sentence)}</p>`;
        if (pp.choices && pp.choices.length > 0) {
          html += `<div class="variant-choices">`;
          pp.choices.forEach(c => { html += `${esc(c)}&nbsp;&nbsp;&nbsp;`; });
          html += `</div>`;
        }
      });

      // 정답 및 해설 (별도 페이지)
      html += `
<div class="page-break-before">
  <h3>연습 ${idx + 1}. ${esc(cq.title)} 정답 및 해설</h3>
  <table>
    <thead><tr><th style="width:30px;">#</th><th style="width:80px;">정답</th><th>해설</th></tr></thead>
    <tbody>`;
      cq.practiceProblems.forEach((pp, i) => {
        html += `\n      <tr><td>${i + 1}</td><td>${esc(pp.answer)}</td><td>${esc(pp.explanation)}</td></tr>`;
      });
      html += `
    </tbody>
  </table>
</div>`;
    }
  });

  return html;
}

function buildFooter(d) {
  return `
<hr class="section-divider">
<p style="text-align: center; color: #a0aec0; font-size: 9pt; margin-top: 30px;">
  피드백지 작성 완료 — ${formatDate(d.date)}
</p>`;
}

// ─── Assemble ───────────────────────────────────────────────────────────────
const fullHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>학습 피드백지 — ${data.student} ${data.date}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
${getCSS()}
</style>
</head>
<body>
${buildReportHeader(data)}
${buildDiagnosisCard(data)}
${buildWrongAnswersList(data)}
${buildExplanations(data)}
${buildStarredCorrect(data)}
${buildGrammarTopics(data)}
${buildConceptQuestions(data)}
${buildFooter(data)}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHTML, 'utf-8');
console.log(`[${studentName}] HTML 생성 완료: ${htmlPath}`);
