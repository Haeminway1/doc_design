#!/usr/bin/env node
/**
 * generate-feedback-html.js
 * 피드백지 마크다운 → HTML 변환 (후처리 방식)
 *
 * Usage: node 04_scripts/generate-feedback-html.js <학생이름> <YYMMDD>
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const studentName = process.argv[2];
const dateStr = process.argv[3];
if (!studentName || !dateStr) {
  console.error('Usage: node generate-feedback-html.js <학생이름> <YYMMDD>');
  process.exit(1);
}

const baseDir = path.resolve(__dirname, '..');
const mdPath = path.join(baseDir, '00_tutoring', studentName, 'output', dateStr, `피드백지_${dateStr}.md`);
const templatePath = path.join(baseDir, '03_system/templates/피드백지_template.html');
const outputPath = path.join(baseDir, '00_tutoring', studentName, 'output', dateStr, `피드백지_${dateStr}.html`);

if (!fs.existsSync(mdPath)) { console.error(`파일 없음: ${mdPath}`); process.exit(1); }
if (!fs.existsSync(templatePath)) { console.error(`파일 없음: ${templatePath}`); process.exit(1); }

// Extract CSS from template
const templateHtml = fs.readFileSync(templatePath, 'utf-8');
const cssMatch = templateHtml.match(/<style>([\s\S]*?)<\/style>/);
const templateCSS = cssMatch ? cssMatch[1] : '';

// Read markdown & extract metadata
const mdContent = fs.readFileSync(mdPath, 'utf-8');
let reportDate = '', reportStudent = '', reportSubject = '', reportTextbook = '', reportRange = '';
for (const line of mdContent.split('\n').slice(0, 10)) {
  if (line.startsWith('**날짜**:')) reportDate = line.replace('**날짜**:', '').trim();
  if (line.startsWith('**학생**:')) reportStudent = line.replace('**학생**:', '').trim();
  if (line.startsWith('**분야**:')) reportSubject = line.replace('**분야**:', '').trim();
  if (line.startsWith('**교재**:')) reportTextbook = line.replace('**교재**:', '').trim();
  if (line.startsWith('**범위**:')) reportRange = line.replace('**범위**:', '').trim();
}

// Use marked with defaults — no custom renderers
marked.setOptions({ gfm: true, breaks: false });
let html = marked.parse(mdContent);

// ============ POST-PROCESSING ============

// 1. Tables: add avoid-break
html = html.replace(/<table>/g, '<table class="avoid-break">');

// 2. Remove the h1 title (we use report-header instead)
html = html.replace(/<h1[^>]*>학습 진단 리포트<\/h1>/, '');

// 3. Section headers for h2
const sectionMap = {
  '틀린 문제 리스트': ['Section 1', '틀린 문제 리스트'],
  '해설 파트': ['Section 2', '해설 파트'],
  '복습 체크리스트': ['Section 3', '복습 체크리스트'],
  '연습문제': ['Section 4', '연습문제'],
};
for (const [title, [num, label]] of Object.entries(sectionMap)) {
  const re = new RegExp(`<h2[^>]*>${title}</h2>`);
  html = html.replace(re, `<div class="page-break-before section-header"><span class="section-num">${num}</span>${label}</div>`);
}

// 4. Theme h3 headers → h2 with page break
html = html.replace(/<h3[^>]*>(테마 [A-E]:[\s\S]*?)<\/h3>/g,
  '<h2 style="page-break-before:always;">$1</h2>');

// 5. Practice Part headers → section-header with page break (연습/복습/구별 등)
html = html.replace(/<h3[^>]*>(Part [A-E]\.[^<]*(?:연습|복습|구별)[^<]*)<\/h3>/g,
  '<div class="page-break-before section-header"><span class="section-num">연습</span>$1</div>');

// 6. Answer key headers → page break + styled h3
html = html.replace(/<h3[^>]*>(Part [A-E]\.\s[^<]*정답[^<]*)<\/h3>/g,
  '<h3 class="page-break-before" style="color:#4A90C4; margin-bottom:12px;">$1</h3>');

// 7. 학습 요약 → diagnosis-card
html = html.replace(/<h2[^>]*>학습 요약<\/h2>/, '<div class="diagnosis-card"><h3>학습 요약</h3>');
// Close diagnosis-card before Section 1
html = html.replace(
  /(<div class="page-break-before section-header"><span class="section-num">Section 1)/,
  '</div>\n$1'
);

// 8. 학습 우선순위 → priority-order
html = html.replace(
  /<p><strong>학습 우선순위<\/strong>:([\s\S]*?)<\/p>/,
  '<div class="priority-order"><strong>학습 우선순위:</strong>$1</div>'
);

// 9. Blockquotes → tip-box / warning-box / concept-box
html = html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, inner) => {
  const text = inner.trim();
  if (text.includes('학생 답 분석') || text.includes('왜 이 답을 골랐을까') || text.includes('왜 틀렸을까')) {
    // Remove the leading label line
    const cleaned = text.replace(/<p>\s*<strong>학생 답 분석[^<]*<\/strong>\s*<\/p>/, '');
    // Wrap remaining <p> lines nicely
    return `<div class="tip-box"><span class="tip-label">학생 답 분석</span>${cleaned}</div>`;
  }
  if (text.includes('반복 오류 경고')) {
    const cleaned = text.replace(/<p>\s*<strong>반복 오류 경고<\/strong>:\s*/, '<p>');
    return `<div class="warning-box"><span class="warning-label">반복 오류 경고</span>${cleaned}</div>`;
  }
  if (text.includes('판별법')) {
    const cleaned = text.replace(/<strong>(핵심 )?판별법<\/strong>:\s*/, '');
    return `<div class="tip-box"><span class="tip-label">판별 팁</span>${cleaned}</div>`;
  }
  return `<div class="concept-box">${text}</div>`;
});

// 10. Code blocks → grammar-block (marked outputs <pre><code>)
html = html.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
  '<div class="grammar-block">$1</div>');

// 11. Checklist items: [ ] → checkbox
html = html.replace(/<li>\s*\[ \]\s*([\s\S]*?)<\/li>/g,
  '<div class="checklist-item"><span class="checkbox"></span><span>$1</span></div>');
html = html.replace(/<li>\s*\[x\]\s*([\s\S]*?)<\/li>/g,
  '<div class="checklist-item"><span class="checkbox" style="background:#38a169;"></span><span>$1</span></div>');

// 12. Checklist group headers (h3 inside checklist section)
const checklistTopics = ['감탄문', '의문사 의문문', '1형식', '2형식', '3\\/4\\/5형식'];
for (const topic of checklistTopics) {
  const re = new RegExp(`<h3[^>]*>(${topic}[^<]*)<\\/h3>`);
  html = html.replace(re, '<div class="checklist-group-title">$1</div>');
}

// 13. Style practice problem numbers with spacing
html = html.replace(
  /<p><strong>(\d+)\.<\/strong>\s*([\s\S]*?)<\/p>/g,
  '<p style="line-height:2.2; font-size:10pt;"><strong>$1.</strong> $2</p>'
);

// 14. hr → section-divider
html = html.replace(/<hr>/g, '<hr class="section-divider">');

// 15. Remove <hr> immediately before page-break elements (prevents blank pages)
html = html.replace(/<hr class="section-divider">\s*(<div class="page-break-before|<h2 style="page-break-before|<h3 class="page-break-before)/g, '$1');

// 16. Remove Section 2 "해설 파트" standalone header (themes already have page breaks)
html = html.replace(
  /<div class="page-break-before section-header"><span class="section-num">Section 2<\/span>해설 파트<\/div>\s*/,
  ''
);

// 17. Remove Section 4 "연습문제" standalone header (Parts already have page breaks)
html = html.replace(
  /<div class="page-break-before section-header"><span class="section-num">Section 4<\/span>연습문제<\/div>\s*/,
  ''
);

// 18. Convert remaining markdown **bold** inside <li> elements
html = html.replace(/<li>([\s\S]*?)<\/li>/g, (match, inner) => {
  const fixed = inner.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return `<li>${fixed}</li>`;
});

// 19. Remove metadata block (날짜/학생/분야/교재/범위 lines)
html = html.replace(/<p><strong>날짜<\/strong>:[\s\S]*?<\/p>/g, '');
html = html.replace(/<p><strong>학생<\/strong>:[\s\S]*?<\/p>/g, '');
html = html.replace(/<p><strong>분야<\/strong>:[\s\S]*?<\/p>/g, '');
html = html.replace(/<p><strong>교재<\/strong>:[\s\S]*?<\/p>/g, '');
html = html.replace(/<p><strong>범위<\/strong>:[\s\S]*?<\/p>/g, '');

// Build final
const finalHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>학습 피드백지 — ${reportStudent} ${dateStr}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>${templateCSS}</style>
</head>
<body>

<div class="report-header">
  <div class="report-date">${reportDate}</div>
  <h1 class="report-title" style="border:none; margin-bottom:6px;">학습 피드백지</h1>
  <div class="report-subtitle">${reportSubject}</div>
  <div class="report-meta">
    <span><strong>학생</strong> ${reportStudent}</span>
    <span><strong>교재</strong> ${reportTextbook}</span>
    <span><strong>범위</strong> ${reportRange}</span>
  </div>
</div>

${html}

<hr class="section-divider">
<p style="text-align:center; color:#a0aec0; font-size:9pt; margin-top:30px;">
  피드백지 작성 완료 — ${reportDate}
</p>
</body>
</html>`;

fs.writeFileSync(outputPath, finalHtml, 'utf-8');
console.log(`✅ HTML 생성 완료: ${outputPath} (${(Buffer.byteLength(finalHtml) / 1024).toFixed(1)} KB)`);
