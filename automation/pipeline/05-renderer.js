'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');

const log = makeLogger('05-renderer');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildHtmlFromData(data, studentName, dateStr) {
  const types = (data.meta && data.meta.types) || [];
  const analysis = data.analysis || {};
  const subjects = data.subjects || {};

  // Attempt to load template if available
  const templatePath = path.join(config.PROJECT_ROOT, '03_system', 'templates', '피드백지_template.html');
  let templateCSS = '';
  if (fs.existsSync(templatePath)) {
    const raw = fs.readFileSync(templatePath, 'utf8');
    const styleMatch = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) templateCSS = styleMatch[1];
  }

  // Also try vera-core.css
  const coreCSSPath = path.join(config.PROJECT_ROOT, '03_system', 'vera-core.css');
  let coreCSS = '';
  if (fs.existsSync(coreCSSPath)) {
    coreCSS = `<link rel="stylesheet" href="${coreCSSPath}">`;
  }

  // Format date YYMMDD → YY.MM.DD
  const formattedDate = dateStr.length === 6
    ? `20${dateStr.slice(0,2)}.${dateStr.slice(2,4)}.${dateStr.slice(4,6)}`
    : dateStr;

  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${studentName} 피드백지 ${formattedDate}</title>
${coreCSS}
<style>
${templateCSS}
body { font-family: 'Noto Sans KR', sans-serif; margin: 0; padding: 0; }
.page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm; box-sizing: border-box; }
.summary-box { border: 2px solid #7ECAF5; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #F0F9FF; }
.summary-title { font-size: 18pt; font-weight: bold; color: #1E3A8A; margin-bottom: 8px; }
.summary-meta { font-size: 10pt; color: #555; margin-bottom: 12px; }
.weak-strong { display: flex; gap: 16px; }
.weak, .strong { flex: 1; padding: 8px; border-radius: 6px; font-size: 9pt; }
.weak { background: #FEF3C7; border-left: 4px solid #F59E0B; }
.strong { background: #F0FFF4; border-left: 4px solid #22C55E; }
.encouragement { margin-top: 10px; font-size: 10pt; color: #374151; font-style: italic; }
.subject-section { margin-bottom: 28px; }
.subject-title { font-size: 14pt; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #7ECAF5; padding-bottom: 4px; margin-bottom: 16px; }
.problem-block { margin-bottom: 20px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 6px; }
.problem-number { font-size: 11pt; font-weight: bold; color: #1E3A8A; margin-bottom: 8px; }
.step-label { font-size: 9pt; font-weight: bold; color: #0EA5E9; text-transform: uppercase; margin-top: 10px; margin-bottom: 4px; }
.translation { text-align: justify; font-size: 9.5pt; line-height: 1.6; }
.keyword-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6px; }
.keyword-table th { background: #E0F2FE; color: #1E3A8A; padding: 4px 8px; text-align: left; }
.keyword-table td { padding: 4px 8px; border-bottom: 1px solid #E5E7EB; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: bold; margin-right: 4px; }
.badge-positive { background: #D1FAE5; color: #065F46; }
.badge-negative { background: #FEE2E2; color: #991B1B; }
.choice-item { margin: 4px 0; font-size: 9pt; padding: 4px 8px; border-radius: 4px; }
.choice-correct { background: #D1FAE5; }
.choice-wrong { background: #FEE2E2; }
.student-analysis { background: #FFFBEB; border: 1px solid #F59E0B; border-radius: 6px; padding: 10px; margin-top: 10px; font-size: 9pt; }
.student-analysis-title { font-weight: bold; color: #92400E; margin-bottom: 6px; }
.grammar-theme { margin-bottom: 24px; padding: 14px; background: #F8FAFC; border-radius: 8px; border-left: 4px solid #7ECAF5; }
.theme-title { font-size: 12pt; font-weight: bold; color: #1E3A8A; margin-bottom: 10px; }
.concept-box { background: #F0F9FF; border: 1px solid #0EA5E9; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 9pt; }
.comparison-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 8px 0; }
.comparison-table th { background: #E0F2FE; color: #1E3A8A; padding: 4px 8px; }
.comparison-table td { padding: 4px 8px; border: 1px solid #E5E7EB; }
.warning-box { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 8px; font-size: 9pt; margin-top: 6px; }
@media print {
  .page { margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
</head>
<body>
<div class="page">

<!-- 학습 요약 -->
<div class="summary-box">
  <div class="summary-title">${studentName} 학습 피드백</div>
  <div class="summary-meta">날짜: ${formattedDate} &nbsp;|&nbsp; 과목: ${types.join(', ') || '미분류'}</div>
  <div class="weak-strong">
    <div class="weak"><strong>아쉬운 점</strong><br>${(analysis.weakPoints || []).join('<br>') || '-'}</div>
    <div class="strong"><strong>잘한 점</strong><br>${(analysis.strongPoints || []).join('<br>') || '-'}</div>
  </div>
  <div class="encouragement">${analysis.encouragement || ''}</div>
  ${analysis.nextFocus ? `<div style="margin-top:8px;font-size:9pt;"><strong>다음 집중 포인트:</strong> ${analysis.nextFocus}</div>` : ''}
</div>
`;

  // Render 독해
  if (subjects['독해'] && subjects['독해'].problems && subjects['독해'].problems.length) {
    html += `<div class="subject-section">
<div class="subject-title">독해 해설</div>
`;
    for (const prob of subjects['독해'].problems) {
      html += renderReadingProblem(prob);
    }
    html += `</div>\n`;
  }

  // Render 문법
  if (subjects['문법'] && subjects['문법'].themes && subjects['문법'].themes.length) {
    html += `<div class="subject-section">
<div class="subject-title">문법 해설</div>
`;
    for (const theme of subjects['문법'].themes) {
      html += renderGrammarTheme(theme);
    }
    html += `</div>\n`;
  }

  // Render 구문독해
  if (subjects['구문독해'] && subjects['구문독해'].themes && subjects['구문독해'].themes.length) {
    html += `<div class="subject-section">
<div class="subject-title">구문독해 해설</div>
`;
    for (const theme of subjects['구문독해'].themes) {
      html += renderGrammarTheme(theme);
    }
    html += `</div>\n`;
  }

  // Render practice problems
  const practice = data.practiceProblems || {};
  for (const [subj, pdata] of Object.entries(practice)) {
    if (!pdata.problems || !pdata.problems.length) continue;
    html += `<div class="subject-section" style="page-break-before:always;">
<div class="subject-title">${subj} 연습문제</div>
${(pdata.problems || []).map((p, i) => `<div class="problem-block"><div class="problem-number">Q${i+1}</div><div>${typeof p === 'string' ? p : JSON.stringify(p)}</div></div>`).join('')}
</div>
<div class="subject-section" style="page-break-before:always;">
<div class="subject-title">${subj} 정답 및 해설</div>
${(pdata.answers || []).map((a, i) => `<div class="problem-block"><div class="problem-number">Q${i+1} 정답</div><div>${typeof a === 'string' ? a : JSON.stringify(a)}</div></div>`).join('')}
</div>
`;
  }

  html += `</div>
</body>
</html>`;

  return html;
}

function renderReadingProblem(prob) {
  const keywords = prob.keywords || {};
  const structure = prob.structure || {};
  const choices = prob.choices || [];
  const sa = prob.studentAnalysis || {};

  return `<div class="problem-block">
  <div class="problem-number">문제 ${prob.number || '?'}</div>

  <div class="step-label">1. 한줄 요약</div>
  <div>${prob.summary || '-'}</div>

  <div class="step-label">2. 전체 해석</div>
  <div class="translation">${prob.fullTranslation || '-'}</div>

  <div class="step-label">3. 핵심 키워드</div>
  <table class="keyword-table">
    <thead><tr><th>구분</th><th>표현 및 키워드</th></tr></thead>
    <tbody>
      <tr><td>핵심 키워드</td><td>${(keywords.core || []).join(', ') || '-'}</td></tr>
      <tr><td>정답 방향 (Positive)</td><td>${(keywords.positive || []).join(', ') || '-'}</td></tr>
      <tr><td>반대 방향 (Negative)</td><td>${(keywords.negative || []).join(', ') || '-'}</td></tr>
    </tbody>
  </table>

  <div class="step-label">4. 구조 및 방향성</div>
  <div>
    <span class="badge ${structure.direction === 'POSITIVE' ? 'badge-positive' : 'badge-negative'}">${structure.direction || '?'}</span>
    <span style="font-size:9pt;">${structure.type || ''}</span>
  </div>
  <div style="font-size:9pt;margin-top:4px;">${structure.analysis || '-'}</div>

  <div class="step-label">5. 선지 분석</div>
  ${choices.map(c => `<div class="choice-item ${c.correct ? 'choice-correct' : 'choice-wrong'}">
    ${c.correct ? '✅' : '❌'} <strong>①${c.number || ''}</strong> ${c.reason || ''}<br>
    <span style="color:#555;">${c.translation || ''}</span>
    ${c.point ? `<span style="color:#1E3A8A;"> ▶ ${c.point}</span>` : ''}
  </div>`).join('')}

  ${sa.studentAnswer ? `<div class="student-analysis">
    <div class="student-analysis-title">학생 답 분석 (학생 선택: ${sa.studentAnswer})</div>
    <div><strong>오답 선택 이유:</strong> ${sa.whyChosen || '-'}</div>
    <div><strong>사고 오류 패턴:</strong> ${sa.errorPattern || '-'}</div>
    <div><strong>집중 포인트:</strong> ${sa.focusPoint || '-'}</div>
  </div>` : ''}
</div>
`;
}

function renderGrammarTheme(theme) {
  const comparison = theme.comparison || {};
  const hasComparison = comparison.headers && comparison.headers.length && comparison.rows && comparison.rows.length;

  return `<div class="grammar-theme">
  <div class="theme-title">${theme.title || '테마'}</div>
  ${theme.concept ? `<div class="concept-box">${theme.concept}</div>` : ''}
  ${(theme.rules || []).length ? `<ul style="font-size:9pt;">${theme.rules.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
  ${hasComparison ? `<table class="comparison-table">
    <thead><tr>${comparison.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${comparison.rows.map(row => `<tr>${(Array.isArray(row) ? row : [row]).map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>` : ''}
  ${(theme.examples || []).length ? `<div style="font-size:9pt;margin-top:8px;"><strong>예문:</strong><br>${theme.examples.join('<br>')}</div>` : ''}
  ${(theme.warnings || []).length ? `<div class="warning-box"><strong>주의:</strong> ${theme.warnings.join(' / ')}</div>` : ''}
  ${(theme.problems || []).map(p => `<div class="problem-block">
    <div class="problem-number">문제 ${p.number || '?'}</div>
    <div style="font-size:9pt;">${p.explanation || '-'}</div>
    ${p.studentAnalysis && p.studentAnalysis.studentAnswer ? `<div class="student-analysis">
      <div class="student-analysis-title">학생 답 분석 (학생 선택: ${p.studentAnalysis.studentAnswer})</div>
      <div><strong>오답 이유:</strong> ${p.studentAnalysis.whyChosen || '-'}</div>
      <div><strong>오류 패턴:</strong> ${p.studentAnalysis.errorPattern || '-'}</div>
      <div><strong>집중 포인트:</strong> ${p.studentAnalysis.focusPoint || '-'}</div>
    </div>` : ''}
  </div>`).join('')}
</div>
`;
}

async function render(data, studentName, dateStr, { dryRun = false } = {}) {
  const outputDir = path.join(config.TUTORING_DIR, studentName, 'output', dateStr);
  ensureDir(outputDir);

  const htmlPath = path.join(outputDir, `피드백지_${dateStr}.html`);
  const pdfPath = path.join(outputDir, `피드백지_${dateStr}.pdf`);

  const html = buildHtmlFromData(data, studentName, dateStr);
  fs.writeFileSync(htmlPath, html, 'utf8');
  log.info(`HTML written: ${htmlPath}`);

  if (dryRun) {
    log.info('[DRY-RUN] Skipping PDF generation');
    return { htmlPath, pdfPath: null, dryRun: true };
  }

  // PDF via Puppeteer connected to existing Chrome
  let puppeteer;
  try {
    puppeteer = require('puppeteer-core');
  } catch {
    log.warn('puppeteer-core not installed — skipping PDF generation');
    return { htmlPath, pdfPath: null };
  }

  const http = require('http');
  let wsEndpoint;
  try {
    wsEndpoint = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${config.CHROME_CDP_PORT}/json/version`, (res) => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data).webSocketDebuggerUrl); }
          catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
  } catch (err) {
    log.warn(`Chrome CDP not available on port ${config.CHROME_CDP_PORT}: ${err.message}`);
    return { htmlPath, pdfPath: null };
  }

  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
    await page.close();
    log.info(`PDF written: ${pdfPath}`);
  } finally {
    await browser.disconnect();
  }

  return { htmlPath, pdfPath };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/05-renderer.js --data [json|path] --student [이름] [--date YYMMDD] [--dry-run]

Options:
  --data json|path   피드백 JSON 또는 JSON 파일 경로 (필수)
  --student 이름     학생 이름 (필수)
  --date YYMMDD      날짜 (기본: 오늘)
  --dry-run          HTML만 생성, PDF 건너뜀
  --help             도움말
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');

  const dataIdx = args.indexOf('--data');
  const dataArg = dataIdx !== -1 ? args[dataIdx + 1] : null;

  const studentIdx = args.indexOf('--student');
  const studentName = studentIdx !== -1 ? args[studentIdx + 1] : null;

  const dateIdx = args.indexOf('--date');
  const dateStr = dateIdx !== -1 ? args[dateIdx + 1] : new Date().toISOString().slice(2,8).replace(/-/g,'');

  if (!dataArg || !studentName) {
    console.error('Error: --data and --student are required');
    process.exit(1);
  }

  const fs2 = require('fs');
  let data;
  try {
    if (dataArg.endsWith('.json') && fs2.existsSync(dataArg)) {
      data = JSON.parse(fs2.readFileSync(dataArg, 'utf8'));
    } else {
      data = JSON.parse(dataArg);
    }
  } catch (err) {
    console.error('Error: could not parse --data:', err.message);
    process.exit(1);
  }

  render(data, studentName, dateStr, { dryRun })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { render };
