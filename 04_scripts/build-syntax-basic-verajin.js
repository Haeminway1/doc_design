#!/usr/bin/env node
/**
 * build-syntax-basic-verajin.js
 *
 * Reads all syntax-basic JSON data (unit01-19 + review-week1-4)
 * and generates a standalone HTML textbook using the verajin design system.
 *
 * Also extracts educational content from the legacy syntax-basic.html
 * and inserts it before the problems for each unit.
 *
 * Usage:  node 04_scripts/build-syntax-basic-verajin.js
 * Output: 02_textbooks/output/html/syntax-basic-verajin.html
 */

const fs = require('fs');
const path = require('path');

// ─── Paths ───
const DATA_DIR = path.resolve(__dirname, '../02_textbooks/data/syntax/basic');
const OUTPUT_DIR = path.resolve(__dirname, '../02_textbooks/output/html');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'syntax-basic-verajin.html');
const LEGACY_HTML = path.resolve(__dirname, '../07_archive/textbooks_legacy/output_v1/html/syntax-basic.html');

// ─── Part definitions ───
const PARTS = [
  {
    number: 'I',
    title: '1주차 — 문장의 기본 뼈대 세우기',
    subtitle: 'Building the Skeleton of Sentences',
    units: [1, 2, 3, 4, 5],
    reviewWeek: 1,
  },
  {
    number: 'II',
    title: '2주차 — 수식어 걷어내기',
    subtitle: 'Stripping Away Modifiers',
    units: [6, 7, 8, 9],
    reviewWeek: 2,
  },
  {
    number: 'III',
    title: '3주차 — 준동사 파헤치기',
    subtitle: 'Mastering Verbals',
    units: [10, 11, 12, 13, 14],
    reviewWeek: 3,
  },
  {
    number: 'IV',
    title: '4주차 — 절 정복하기',
    subtitle: 'Conquering Clauses',
    units: [15, 16, 17, 18, 19],
    reviewWeek: 4,
  },
];

// ─── Load data ───
function loadUnit(unitNum) {
  const file = path.join(DATA_DIR, `unit${String(unitNum).padStart(2, '0')}-problems.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadReview(weekNum) {
  const file = path.join(DATA_DIR, `review-week${weekNum}-problems.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ─── HTML helpers ───
function esc(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function padNum(n) {
  return String(n).padStart(2, '0');
}

// ─── Page numbering: compute page offsets ───
// cover=1, toc=1, partOpener=1 each, unit=1 each (10 problems), review= ceil(100/15)
function computePageMap(parts) {
  let page = 1; // cover
  const map = {};
  page++; // toc
  page++; // toc page 2 (we have a lot of content)

  for (const part of parts) {
    page++; // part opener
    for (const uNum of part.units) {
      map[`unit${padNum(uNum)}`] = page;
      page++; // content page(s)
      page++; // problems page
    }
    map[`review-week${part.reviewWeek}`] = page;
    page += Math.ceil(100 / 15); // review pages
  }

  map['answers'] = page;
  return map;
}

// ─── Color-code analysis text for answer section ───
function colorizeAnalysis(text) {
  if (!text) return '';
  let html = esc(text);
  // Color S/V/O/C/IO/DO/OC markers
  html = html.replace(/\(S\)/g, '<span class="mark-s">(S)</span>');
  html = html.replace(/\(V\)/g, '<span class="mark-v">(V)</span>');
  html = html.replace(/\(O\)/g, '<span class="mark-o">(O)</span>');
  html = html.replace(/\(C\)/g, '<span class="mark-c">(C)</span>');
  html = html.replace(/\(IO\)/g, '<span class="mark-io">(IO)</span>');
  html = html.replace(/\(DO\)/g, '<span class="mark-do">(DO)</span>');
  html = html.replace(/\(OC\)/g, '<span class="mark-oc">(OC)</span>');
  // Bracket notation for clauses
  html = html.replace(/\[명사절\]/g, '<span class="clause-tag clause-noun">[명사절]</span>');
  html = html.replace(/\[형용사절\]/g, '<span class="clause-tag clause-adj">[형용사절]</span>');
  html = html.replace(/\[부사절\]/g, '<span class="clause-tag clause-adv">[부사절]</span>');
  return html;
}

// ═══════════════════════════════════════════════════════════
// LEGACY CONTENT EXTRACTION
// ═══════════════════════════════════════════════════════════

/**
 * Extract educational content from the legacy syntax-basic.html.
 * The legacy file has 43 </header> sections. Odd sections (1-based: 1,3,5,...,37)
 * contain explanation content for units 1-19. Even sections contain practice problems.
 * Sections 39-43 are review/closing content (no extraction needed).
 *
 * Returns: { 1: "html...", 2: "html...", ..., 19: "html..." }
 */
function extractLegacyContent() {
  const contentByUnit = {};

  if (!fs.existsSync(LEGACY_HTML)) {
    console.log('  [WARN] Legacy HTML not found at: ' + LEGACY_HTML);
    console.log('  [WARN] Skipping content extraction.');
    return contentByUnit;
  }

  const legacyHtml = fs.readFileSync(LEGACY_HTML, 'utf8');
  const sections = legacyHtml.split('</header>');
  // sections[0] = everything before first </header> (CSS, cover, etc.)
  // sections[1] = unit 1 content (odd, 1-based)
  // sections[2] = unit 1 problems (even)
  // sections[3] = unit 2 content
  // ...
  // sections[37] = unit 19 content
  // sections[38] = unit 19 problems
  // sections[39+] = review/closing

  for (let unitNum = 1; unitNum <= 19; unitNum++) {
    const sectionIdx = (unitNum * 2) - 1; // unit 1 -> idx 1, unit 2 -> idx 3, ...
    if (sectionIdx >= sections.length) {
      console.log(`  [WARN] No legacy section found for unit ${unitNum}`);
      continue;
    }

    const rawSection = sections[sectionIdx];

    // Extract content: everything before the page-footer closing structure.
    // Pattern: the content HTML ends, then </div> (close page-content), then <div class="page-footer">
    const pageFooterIdx = rawSection.indexOf('<div class="page-footer">');
    if (pageFooterIdx === -1) {
      console.log(`  [WARN] No page-footer found in legacy section for unit ${unitNum}`);
      continue;
    }

    // Find the second-to-last </div> before page-footer (the one that closes the last content element)
    const beforeFooter = rawSection.substring(0, pageFooterIdx);
    const lastCloseDiv = beforeFooter.lastIndexOf('</div>');
    const secondLastCloseDiv = beforeFooter.lastIndexOf('</div>', lastCloseDiv - 1);

    if (secondLastCloseDiv === -1) {
      console.log(`  [WARN] Could not find content boundary for unit ${unitNum}`);
      continue;
    }

    const rawContent = rawSection.substring(0, secondLastCloseDiv + 6); // +6 for '</div>'
    if (rawContent.trim().length === 0) {
      continue;
    }

    const transformed = transformLegacyContent(rawContent);
    if (transformed.trim().length > 0) {
      contentByUnit[unitNum] = transformed;
    }
  }

  return contentByUnit;
}

/**
 * Transform legacy HTML content to verajin design system.
 * - Strip all inline style attributes
 * - Convert class names to verajin equivalents
 * - Clean up structure
 */
function transformLegacyContent(html) {
  let result = html;

  // ── PASS 1: Detect analysis lines BEFORE stripping styles ──
  result = result.replace(
    /<p\s+style="[^"]*font-family:'Inter',monospace[^"]*">/g,
    '<p class="analysis-line">'
  );

  // ── PASS 2: Convert class-based elements ──
  result = result.replace(/class="concept-box avoid-break"/g, 'class="concept-box"');
  result = result.replace(/class="rule-box avoid-break"/g, 'class="tip-box"');
  result = result.replace(/class="rule-box"/g, 'class="tip-box"');
  result = result.replace(/class="example-analysis avoid-break"/g, 'class="example-box"');
  result = result.replace(/class="example-analysis"/g, 'class="example-box"');

  // <span class="label"> -> <div class="label-title"> (fix nesting: move outside <p>)
  result = result.replace(/<p[^>]*><span class="label">(.*?)<\/span><\/p>/g, '<div class="label-title">$1</div>');
  result = result.replace(/<span class="label">(.*?)<\/span>/g, '</p><div class="label-title">$1</div><p class="body-text">');

  // <p class="process"> -> <p class="translation">
  result = result.replace(/class="process"/g, 'class="translation"');

  // ── PASS 3: Strip ALL remaining inline style attributes ──
  result = result.replace(/\s+style="[^"]*"/g, '');

  // ── PASS 4: Bare <p> tags (no class) -> body-text ──
  result = result.replace(/<p>(?!<\/p>)/g, '<p class="body-text">');

  // ── PASS 4.5: Detect "분석:" prefix body-text as analysis-line ──
  result = result.replace(
    /<p class="body-text">(분석:\s*)/g,
    '<p class="analysis-line">$1'
  );

  // ── PASS 4.6: Detect arrow-based analysis lines (→ ...수식, → 보어 역할 등) ──
  result = result.replace(
    /<p class="body-text">([^<]*(?:→[^<]*(?:수식|역할|구조|분석|묶음))[^<]*)<\/p>/g,
    '<p class="analysis-line">$1</p>'
  );

  // ── PASS 5: Translation prefix ──
  result = result.replace(/<p class="translation">(해석:\s*)/g, '<p class="translation">');

  // ── PASS 6: Tip-box title extraction ──
  result = result.replace(
    /(<div class="tip-box">)\s*<p class="body-text">(💡[^<]*)<\/p>/g,
    '$1<div class="tip-title">$2</div>'
  );

  // ── PASS 7: Fix <p><div> nesting (invalid HTML) ──
  result = result.replace(/<p class="body-text"><div class="label-title">/g, '<div class="label-title">');
  result = result.replace(/<\/div><\/p>/g, '</div>');

  // ── PASS 8: Clean up empty paragraphs ──
  result = result.replace(/<p class="body-text"><\/p>/g, '');

  // ── PASS 9: Add S/V/O/C color markers in analysis lines ──
  result = result.replace(/(<p class="analysis-line">)(.*?)(<\/p>)/g, (match, open, inner, close) => {
    let colored = inner;
    colored = colored.replace(/\(S\)/g, '<span class="mark-s">(S)</span>');
    colored = colored.replace(/\(V\)/g, '<span class="mark-v">(V)</span>');
    colored = colored.replace(/\(O\)/g, '<span class="mark-o">(O)</span>');
    colored = colored.replace(/\(C\)/g, '<span class="mark-c">(C)</span>');
    colored = colored.replace(/\(IO\)/g, '<span class="mark-s">(IO)</span>');
    colored = colored.replace(/\(DO\)/g, '<span class="mark-o">(DO)</span>');
    colored = colored.replace(/\(OC\)/g, '<span class="mark-c">(OC)</span>');
    return open + colored + close;
  });

  // ── PASS 10: Wrap example sentence groups in example-item ──
  result = result.replace(
    /(<p class="body-text">)([A-Z][^<]*\.<\/p>\s*<p class="analysis-line">)/g,
    '<div class="example-item">$1$2'
  );
  result = result.replace(
    /(<p class="translation">[^<]*<\/p>)(\s*(?:<div class="example-item">|<\/div>|$))/g,
    '$1</div>$2'
  );

  // ── PASS 11: verajin-style keyword highlighting in body text ──
  // Apply gradient-underline highlights to grammar terms in body-text and concept-box
  result = result.replace(/(<p class="body-text">)(.*?)(<\/p>)/g, (match, open, inner, close) => {
    let highlighted = inner;
    highlighted = applyKeywordHighlights(highlighted);
    return open + highlighted + close;
  });
  // Also in concept-box, tip-box, and example-box content
  const boxTypes = ['concept-box', 'tip-box', 'example-box'];
  for (const boxType of boxTypes) {
    const boxRegex = new RegExp(`(<div class="${boxType}">)([\\s\\S]*?)(</div>)`, 'g');
    result = result.replace(boxRegex, (match, open, inner, close) => {
      let highlighted = inner;
      highlighted = highlighted.replace(/(<p[^>]*>)(.*?)(<\/p>)/g, (m, pOpen, pInner, pClose) => {
        // Skip analysis-lines and already-highlighted content
        if (pOpen.includes('analysis-line')) return m;
        if (pInner.includes('class="kw-')) return m;
        return pOpen + applyKeywordHighlights(pInner) + pClose;
      });
      return open + highlighted + close;
    });
  }

  return result;
}

/**
 * Apply verajin-style gradient-underline keyword highlights.
 * - kw-term (blue): 주어(S), 동사(V), 목적어(O), 보어(C), 수식어 등 핵심 문법 용어
 * - kw-grammar (green): 문형 패턴 (1형식, 2형식, S+V, S+V+C 등)
 * - kw-contrast (red): 대조/주의 키워드 (주의, 하지만, 반드시, 절대 등)
 * - kw-example (yellow): 해석 힌트 (~을/를, ~이다, ~하다 등)
 */
/**
 * Process text segments only (between HTML tags) with a transform function.
 * This prevents regex matches from crossing or nesting inside existing tags.
 */
function processTextSegments(html, fn) {
  const parts = html.split(/(<[^>]*>)/);
  let kwDepth = 0;
  return parts.map(part => {
    if (part.startsWith('<')) {
      if (/^<span class="kw-/.test(part)) kwDepth++;
      if (part === '</span>' && kwDepth > 0) kwDepth--;
      return part;
    }
    // Skip text inside existing kw-* spans to prevent double-nesting
    if (kwDepth > 0 || !part.trim()) return part;
    return fn(part);
  }).join('');
}

function applyKeywordHighlights(text) {
  // Skip if already highlighted (prevents double-application from box pass)
  if (text.includes('class="kw-')) return text;

  let result = text;

  // ════════════════════════════════════════════════════════
  // Phase 1: Compound patterns (parenthesized terms, N형식, S+V)
  // Applied to full text first, then Phase 2 operates on text segments only
  // ════════════════════════════════════════════════════════

  // 1a. Parenthesized terms (longest first to avoid partial matches)
  const parenTerms = [
    [/주어\(Subject,?\s*S\)/g, '주어(Subject, S)'],
    [/동사\(Verb,?\s*V\)/g, '동사(Verb, V)'],
    [/목적어\(Object,?\s*O\)/g, '목적어(Object, O)'],
    [/보어\(Complement,?\s*C\)/g, '보어(Complement, C)'],
    [/간접목적어\(IO\)/g, '간접목적어(IO)'],
    [/직접목적어\(DO\)/g, '직접목적어(DO)'],
    [/목적격보어\(OC\)/g, '목적격보어(OC)'],
    [/서술어\(V\)/g, '서술어(V)'],
    [/주어\(S\)/g, '주어(S)'],
    [/동사\(V\)/g, '동사(V)'],
    [/목적어\(O\)/g, '목적어(O)'],
    [/보어\(C\)/g, '보어(C)'],
  ];
  for (const [pat, display] of parenTerms) {
    result = result.replace(pat, `<span class="kw-term">${display}</span>`);
  }

  // 1b. N형식 patterns
  result = result.replace(/([1-5]형식)/g, '<span class="kw-grammar">$1</span>');

  // 1c. S+V+... patterns
  result = result.replace(/(S\s*\+\s*V(?:\s*\+\s*(?:C|O|IO|DO|OC))*)/g, '<span class="kw-grammar">$1</span>');

  // 1d. Grammar structure notations
  result = result.replace(/(to\s*\+\s*동사원형)/g, '<span class="kw-grammar">$1</span>');
  result = result.replace(/(동사원형\s*\+\s*-ing)/g, '<span class="kw-grammar">$1</span>');

  // 1e. Quoted contrast words
  result = result.replace(/'(뼈대|장식품|핵심|꾸밈|수식|덩어리)'/g, '\'<span class="kw-contrast">$1</span>\'');

  // 1f. Quoted grammar patterns — '~하는 것', '~하기' etc.
  // Must run in Phase 1 so Phase 2 text-segment processing skips their contents
  result = result.replace(/'(~[^']{1,12})'/g, '\'<span class="kw-grammar">$1</span>\'');

  // ════════════════════════════════════════════════════════
  // Phase 2: Text-segment-only processing
  // Operates ONLY on plain text between HTML tags to avoid nesting
  // ════════════════════════════════════════════════════════
  result = processTextSegments(result, (segment) => {
    let s = segment;

    // ── kw-term: Standalone grammar terms (blue underline) ──
    const terms = [
      // Longest first to prevent partial matches
      '목적격보어', '주격보어', '간접목적어', '직접목적어',
      '종속접속사', '등위접속사', '관계대명사', '관계부사',
      '원형부정사', '사역동사', '지각동사',
      '의문사절', 'whether절', 'that절',
      '분사구문', '현재분사', '과거분사',
      'to부정사', '전치사구',
      '형용사절', '형용사구',
      '명사절', '부사절', '주절', '종속절',
      '능동태', '수동태',
      '가목적어', '가주어', '진주어', '선행사',
      '준동사', '동명사', '수식어', '접속사',
      '자동사', '타동사', '서술어',
      '형용사', '부사구',
      '주어', '동사', '목적어', '보어',
      '능동', '수동', '부사',
    ];
    const termPat = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    s = s.replace(new RegExp(`(${termPat})`, 'g'), '<span class="kw-term">$1</span>');

    // ── kw-grammar: Structure patterns (green underline) ──
    s = s.replace(/(?<![a-zA-Z])(SV|SVO|SVC|SVOO|SVOC)(?![a-zA-Z])/g, '<span class="kw-grammar">$1</span>');
    s = s.replace(/(p\.p\.)/g, '<span class="kw-grammar">$1</span>');

    // ── kw-contrast: Warning markers (red underline) ──
    s = s.replace(/(주의!|※|반드시|절대|중요:)/g, '<span class="kw-contrast">$1</span>');

    // ── kw-example: Translation hints (yellow underline) ──
    s = s.replace(/(~[은는이가을를의에서와과하로]+[다]?)/g, '<span class="kw-example">$1</span>');

    return s;
  });

  return result;
}

// ─── CSS ───
function generateCSS() {
  return `
/* ═══════════════════════════════════════════════════════════ */
/* verajin Syntax Basic Textbook — Standalone CSS              */
/* Colors: Navy #1B2A4A  Gold #C5A55A  Text #2D2D2D           */
/* ═══════════════════════════════════════════════════════════ */

@page {
  size: A4;
  margin: 22mm 18mm 20mm 18mm;
  @bottom-center {
    content: "\\2014  " counter(page) "  \\2014";
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 8pt;
    color: #999;
  }
}
@page :first { @bottom-center { content: none; } }

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 10pt;
  line-height: 1.7;
  color: #2D2D2D;
  background: #fff;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* ═══════ COVER ═══════ */
.cover {
  page-break-after: always;
  text-align: center;
  padding-top: 50mm;
  min-height: 297mm;
  position: relative;
}
.cover .brand {
  font-family: 'Playfair Display', 'Noto Serif KR', Georgia, serif;
  font-size: 36pt;
  font-weight: 700;
  color: #1B2A4A;
  letter-spacing: 4px;
  text-transform: lowercase;
}
.cover .gold-line {
  width: 120px;
  height: 2px;
  background: #C5A55A;
  margin: 16px auto;
}
.cover .gold-line-wide {
  width: 200px;
  height: 1px;
  background: #C5A55A;
  margin: 12px auto;
}
.cover .main-title {
  font-size: 24pt;
  font-weight: 800;
  color: #1B2A4A;
  margin: 10px 0 2px;
  letter-spacing: 1px;
}
.cover .sub {
  font-size: 12pt;
  color: #888;
  font-weight: 300;
  margin: 4px 0;
  letter-spacing: 0.5px;
}
.cover .part-label {
  display: inline-block;
  background: #1B2A4A;
  color: #fff;
  padding: 5px 20px;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 16px 0 10px;
}
.cover .chapter-subtitle {
  font-size: 14pt;
  color: #1B2A4A;
  font-weight: 700;
  margin: 6px 0;
}
.cover .edition {
  font-size: 11pt;
  font-weight: 700;
  color: #C5A55A;
  margin-top: 28px;
  letter-spacing: 2px;
}
.cover .slogan {
  font-size: 10pt;
  color: #999;
  font-weight: 300;
  margin-top: 4px;
  font-style: italic;
}
.cover .author-name {
  margin-top: 24px;
  font-size: 13pt;
  color: #1B2A4A;
  font-weight: 700;
  border: 2px solid #C5A55A;
  display: inline-block;
  padding: 6px 28px;
  letter-spacing: 1px;
}
.cover .footer-brand {
  position: absolute;
  bottom: 20mm;
  left: 0;
  right: 0;
  font-size: 8pt;
  color: #C5A55A;
  letter-spacing: 1px;
}

/* ═══════ PAGE BREAK ═══════ */
.page-break { page-break-before: always; }

/* ═══════ TOC ═══════ */
.toc-title {
  font-family: 'Playfair Display', 'Noto Serif KR', Georgia, serif;
  font-size: 20pt;
  font-weight: 800;
  color: #1B2A4A;
  margin-bottom: 3mm;
  border-bottom: 2px solid #C5A55A;
  padding-bottom: 3mm;
  letter-spacing: 2px;
}
.toc-part-banner {
  background: #1B2A4A;
  color: #fff;
  padding: 3mm 5mm;
  font-size: 10.5pt;
  font-weight: 700;
  margin: 5mm 0 2mm;
  letter-spacing: 0.5px;
}
.toc-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.8mm 0 1.8mm 4mm;
  border-bottom: 0.5px dotted #ddd;
  font-size: 9.5pt;
}
.toc-item .toc-label { color: #2D2D2D; }
.toc-item .toc-label b { color: #1B2A4A; }
.toc-item .toc-page {
  color: #C5A55A;
  font-weight: 700;
  min-width: 28px;
  text-align: right;
  font-size: 9pt;
}
.toc-review {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.8mm 0 1.8mm 4mm;
  border-bottom: 0.5px dotted #ddd;
  font-size: 9pt;
  color: #666;
  font-style: italic;
}
.toc-review .toc-page {
  color: #C5A55A;
  font-weight: 700;
  min-width: 28px;
  text-align: right;
  font-size: 9pt;
  font-style: normal;
}

/* ═══════ PART OPENER ═══════ */
.part-opener {
  page-break-after: always;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250mm;
  text-align: center;
}
.part-opener .part-number {
  font-family: 'Playfair Display', 'Noto Serif KR', Georgia, serif;
  font-size: 48pt;
  font-weight: 700;
  color: #1B2A4A;
  letter-spacing: 4px;
  margin-bottom: 4mm;
}
.part-opener .part-title {
  font-size: 16pt;
  font-weight: 700;
  color: #1B2A4A;
  margin-bottom: 2mm;
}
.part-opener .part-subtitle {
  font-size: 11pt;
  color: #888;
  font-weight: 300;
  font-style: italic;
  margin-bottom: 8mm;
}
.part-opener .part-gold-line {
  width: 80px;
  height: 2px;
  background: #C5A55A;
  margin: 6mm auto;
}
.part-opener .part-units {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 10pt;
  color: #555;
  line-height: 2;
}
.part-opener .part-units li::before {
  content: "\\25B8  ";
  color: #C5A55A;
}

/* ═══════ SECTION TITLES ═══════ */
.section-title {
  margin-top: 3mm;
  padding-top: 3mm;
  border-top: 2.5px solid #1B2A4A;
  font-size: 14pt;
  font-weight: 800;
  color: #1B2A4A;
  margin-bottom: 2mm;
  padding-bottom: 3mm;
  border-bottom: 1px solid #C5A55A;
  letter-spacing: 0.3px;
}

/* ═══════ INSTRUCTION BOX (tip-box style) ═══════ */
.instruction-box {
  background: #F1F8E9;
  border-left: 3px solid #33691E;
  padding: 3mm 4mm;
  margin: 3mm 0 5mm;
  font-size: 9pt;
  color: #33691E;
  line-height: 1.6;
}
.instruction-box .inst-label {
  font-weight: 700;
  font-size: 9.5pt;
  margin-bottom: 1mm;
}

/* ═══════ EDUCATIONAL CONTENT (from legacy) ═══════ */
.unit-content {
  margin: 5mm 0 8mm;
  padding: 0 2mm;
}

/* ── Concept Box: 핵심 개념 (남색 상단 바 + 연보라 배경) ── */
.concept-box {
  background: #F0F1FA;
  border-radius: 0 0 6px 6px;
  padding: 5mm 6mm 4mm;
  margin: 5mm 0;
  font-size: 9.5pt;
  line-height: 1.8;
  page-break-inside: avoid;
  position: relative;
  border-top: 3.5px solid #1B2A4A;
}
.concept-box::before {
  content: "\\25A0  핵심 개념";
  display: block;
  font-weight: 800;
  font-size: 9pt;
  color: #1B2A4A;
  letter-spacing: 0.5px;
  margin-bottom: 3mm;
  padding-bottom: 2mm;
  border-bottom: 1px solid #C5C8E6;
}

/* ── Tip Box: Vera's Secret Flavor (초록 좌측 바) ── */
.tip-box {
  background: #F4FAF0;
  border-left: 4px solid #4CAF50;
  border-radius: 0 6px 6px 0;
  padding: 4mm 5mm 3mm;
  margin: 5mm 0;
  font-size: 9pt;
  line-height: 1.75;
  page-break-inside: avoid;
  color: #2E5A2E;
}
.tip-box .tip-title {
  font-weight: 800;
  font-size: 9pt;
  color: #2E7D32;
  margin-bottom: 2mm;
}

/* ── Body Text: 본문 ── */
.body-text {
  font-size: 10pt;
  line-height: 1.75;
  text-align: justify;
  margin-bottom: 1.5mm;
  color: #2D2D2D;
  word-break: keep-all;
}
.unit-content > .body-text:first-child {
  margin-top: 2mm;
}

/* ── Key Term: 핵심 용어 강조 ── */
.body-text strong, .concept-box strong {
  color: #1B2A4A;
  font-weight: 700;
}

/* ── verajin-style Gradient Underline Highlights ── */
.kw-term {
  background: linear-gradient(transparent 55%, #BBDEFB 55%);
  font-weight: bold;
  color: #1B2A4A;
}
.kw-grammar {
  background: linear-gradient(transparent 55%, #C8E6C9 55%);
  font-weight: bold;
  color: #2E7D32;
}
.kw-contrast {
  background: linear-gradient(transparent 55%, #FFCDD2 55%);
  font-weight: bold;
  color: #C62828;
}
.kw-example {
  background: linear-gradient(transparent 55%, #FFF9C4 55%);
  font-weight: 600;
  color: #6D4C00;
}

/* ── Example Box: 예제 분석 (금색 상단 바 + 아이보리 배경) ── */
.example-box {
  background: #FDFCF8;
  border-top: 3.5px solid #C5A55A;
  border-radius: 0 0 6px 6px;
  padding: 5mm 6mm 4mm;
  margin: 5mm 0;
  font-size: 9.5pt;
  line-height: 1.8;
  page-break-inside: avoid;
}
.example-box .label-title {
  font-weight: 800;
  color: #9A7B2D;
  font-size: 9pt;
  letter-spacing: 0.5px;
  margin-bottom: 3mm;
  padding-bottom: 2mm;
  border-bottom: 1px solid #E8DFC8;
}

/* ── Example Item: 각 예제 블록 ── */
.example-item {
  margin: 3mm 0;
  padding: 2mm 3mm;
  border-left: 2px solid #E0D5B8;
  margin-left: 1mm;
}

/* ── Analysis Line: 구조 분석 라인 ── */
.analysis-line {
  font-family: 'Noto Serif KR', Georgia, serif;
  color: #1B2A4A;
  font-size: 10pt;
  font-weight: 600;
  margin: 1mm 0;
  letter-spacing: 0.2px;
}

/* ── S/V/O/C inline markers in analysis ── */
.analysis-line .mark-s { color: #1565C0; font-weight: 800; text-decoration: underline; text-decoration-color: #90CAF9; }
.analysis-line .mark-v { color: #C62828; font-weight: 800; }
.analysis-line .mark-o { color: #2E7D32; font-weight: 800; }
.analysis-line .mark-c { color: #6A1B9A; font-weight: 800; }

/* ── Translation: 해석 ── */
.translation {
  color: #666;
  font-size: 9pt;
  margin-bottom: 3mm;
  padding-left: 4mm;
  border-left: 2px solid #E0E0E0;
  margin-left: 2mm;
  font-style: italic;
}

/* ── Subsection Header ── */
.subsection {
  font-weight: 800;
  color: #2C5F8A;
  font-size: 10.5pt;
  margin: 5mm 0 2mm;
  padding-bottom: 1mm;
}
.subsection::before {
  content: "\\25A0 ";
  color: #1B2A4A;
}

/* ── Content Separator ── */
.content-separator {
  height: 1px;
  background: linear-gradient(to right, transparent, #C5A55A, transparent);
  margin: 6mm 15mm;
}

/* ── Label Title (generic) ── */
.label-title {
  font-weight: 800;
  color: #1B2A4A;
  font-size: 10pt;
  margin: 4mm 0 2mm;
}

/* ═══════ PROBLEM AREA ═══════ */
.problem-item {
  margin: 4mm 0;
  padding: 3mm 0;
  page-break-inside: avoid;
}
.problem-item + .problem-item {
  border-top: 0.5px solid #e8e8e8;
}
.problem-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 2mm;
}
.problem-num-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: #1B2A4A;
  color: #fff;
  font-size: 8.5pt;
  font-weight: 700;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 1px;
}
.problem-sentence {
  font-family: 'Noto Serif KR', Georgia, serif;
  font-size: 10.5pt;
  line-height: 1.85;
  color: #333;
  flex: 1;
}
.answer-lines {
  margin: 2mm 0 1mm 32px;
}
.answer-lines .dot-line {
  border-bottom: 1px dotted #bbb;
  height: 7mm;
  margin-bottom: 0.5mm;
}

/* ═══════ REVIEW SECTION DIVIDER ═══════ */
.review-page-divider {
  text-align: center;
  font-size: 8pt;
  color: #999;
  margin: 3mm 0 2mm;
  border-top: 0.5px solid #ddd;
  padding-top: 2mm;
}

/* ═══════ ANSWER SECTION ═══════ */
.answer-section-opener {
  page-break-before: always;
  text-align: center;
  padding-top: 80mm;
  min-height: 250mm;
}
.answer-section-opener .opener-label {
  font-family: 'Playfair Display', 'Noto Serif KR', Georgia, serif;
  font-size: 14pt;
  color: #C5A55A;
  letter-spacing: 3px;
  font-weight: 400;
}
.answer-section-opener .opener-title {
  font-size: 26pt;
  font-weight: 800;
  color: #1B2A4A;
  margin: 6mm 0 4mm;
  letter-spacing: 1px;
}
.answer-section-opener .opener-gold-line {
  width: 100px;
  height: 2px;
  background: #C5A55A;
  margin: 8mm auto;
}
.answer-section-opener .opener-desc {
  font-size: 10pt;
  color: #888;
}

.answer-unit-header {
  margin-top: 5mm;
  padding: 3mm 5mm;
  background: #1B2A4A;
  color: #fff;
  font-size: 11pt;
  font-weight: 700;
  letter-spacing: 0.3px;
  page-break-after: avoid;
}

.answer-block {
  margin: 2.5mm 0;
  padding: 3mm 4mm;
  page-break-inside: avoid;
  border-bottom: 0.5px solid #eee;
}
.answer-block:nth-child(even) {
  background: #FAFAF7;
}
.answer-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 1.5mm;
}
.answer-num-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  background: #1B2A4A;
  color: #fff;
  font-size: 8pt;
  font-weight: 700;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 1px;
}
.answer-sentence {
  font-family: 'Noto Serif KR', Georgia, serif;
  font-size: 9.5pt;
  line-height: 1.7;
  color: #555;
  flex: 1;
}
.answer-analysis {
  margin: 1.5mm 0 1mm 30px;
  font-family: 'Noto Serif KR', Georgia, serif;
  font-size: 9.5pt;
  line-height: 1.75;
  color: #1B2A4A;
  font-weight: 500;
}
.answer-pattern {
  display: inline-block;
  margin-left: 30px;
  margin-bottom: 1mm;
  padding: 1px 8px;
  background: #E8EAF6;
  color: #1B2A4A;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.answer-translation {
  margin: 1mm 0 0 30px;
  font-size: 9pt;
  line-height: 1.6;
  color: #555;
}
.answer-translation::before {
  content: "\\21D2  ";
  color: #C5A55A;
  font-weight: 700;
}
.answer-notes {
  margin: 1mm 0 0 30px;
  font-size: 8.5pt;
  color: #888;
  font-style: italic;
}
.answer-notes::before {
  content: "\\2605  ";
  color: #C5A55A;
}

/* ═══════ ANALYSIS MARKERS (S/V/O/C color-coded) ═══════ */
.mark-s {
  color: #1565C0;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #1565C0;
  text-underline-offset: 2px;
}
.mark-v {
  color: #C62828;
  font-weight: 700;
}
.mark-o {
  color: #2E7D32;
  font-weight: 600;
}
.mark-c {
  color: #6A1B9A;
  font-weight: 600;
}
.mark-io {
  color: #00838F;
  font-weight: 600;
}
.mark-do {
  color: #2E7D32;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: #2E7D32;
  text-underline-offset: 2px;
}
.mark-oc {
  color: #6A1B9A;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #6A1B9A;
  text-underline-offset: 2px;
}
.clause-tag {
  font-size: 7.5pt;
  font-weight: 700;
  padding: 1px 4px;
  margin: 0 2px;
  letter-spacing: 0.3px;
}
.clause-noun {
  background: #E3F2FD;
  color: #1565C0;
}
.clause-adj {
  background: #F3E5F5;
  color: #6A1B9A;
}
.clause-adv {
  background: #FFF3E0;
  color: #E65100;
}

/* ═══════ ANSWER LEGEND ═══════ */
.answer-legend {
  margin: 3mm 0 5mm;
  padding: 3mm 5mm;
  background: #FAFAF7;
  border: 1px solid #e0ddd5;
  font-size: 8.5pt;
  line-height: 2;
  page-break-inside: avoid;
}
.answer-legend .legend-title {
  font-weight: 700;
  color: #1B2A4A;
  font-size: 9pt;
  margin-bottom: 1mm;
}

/* ═══════ UTILITIES ═══════ */
.spacer { height: 6mm; }
.spacer-sm { height: 3mm; }
`;
}

// ─── Build cover page ───
function buildCover() {
  return `
<div class="cover">
  <div class="brand">verajin</div>
  <div class="gold-line"></div>
  <div class="main-title">구문독해 Basic</div>
  <div class="sub">Syntax Reading Basic</div>
  <div style="height: 6mm;"></div>
  <div class="part-label">UNIT 1 &#8211; 19</div>
  <div style="height: 4mm;"></div>
  <div class="chapter-subtitle">문장의 뼈대를 읽는 힘</div>
  <div style="height: 16mm;"></div>
  <div class="gold-line-wide"></div>
  <div class="edition">2026 EDITION</div>
  <div class="slogan">구문독해에 맛을 더하다</div>
  <div style="height: 8mm;"></div>
  <div class="author-name">Vera's Flavor</div>
  <div class="footer-brand">verajin &nbsp;|&nbsp; Vera's Flavor 구문독해 Basic &nbsp;|&nbsp; 2026 EDITION</div>
</div>
`;
}

// ─── Build TOC ───
function buildTOC(parts, allUnits, allReviews, pageMap) {
  let html = `
<div class="toc-title">CONTENTS</div>
`;

  for (const part of parts) {
    html += `<div class="toc-part-banner">PART ${part.number} &nbsp;&mdash;&nbsp; ${esc(part.title)}</div>\n`;
    for (const uNum of part.units) {
      const data = allUnits[uNum];
      const pg = pageMap[`unit${padNum(uNum)}`] || '';
      html += `<div class="toc-item">
  <span class="toc-label"><b>Unit ${padNum(uNum)}</b> &nbsp; ${esc(data.title)}</span>
  <span class="toc-page">${pg}</span>
</div>\n`;
    }
    // review
    const reviewData = allReviews[part.reviewWeek];
    const rpg = pageMap[`review-week${part.reviewWeek}`] || '';
    html += `<div class="toc-review">
  <span>${esc(reviewData.title)}</span>
  <span class="toc-page">${rpg}</span>
</div>\n`;
  }

  // Answer key
  html += `
<div style="margin-top: 6mm;"></div>
<div class="toc-part-banner" style="background: #C5A55A;">정답 및 해설 &nbsp;&mdash;&nbsp; Answer Key</div>
<div class="toc-item">
  <span class="toc-label"><b>Unit 01 ~ 19</b> + Review Week 1 ~ 4 전체 정답 및 해설</span>
  <span class="toc-page">${pageMap['answers'] || ''}</span>
</div>
`;

  // Page break after TOC
  html += `<div class="page-break"></div>\n`;

  return html;
}

// ─── Build part opener ───
function buildPartOpener(part, allUnits) {
  let unitList = '';
  for (const uNum of part.units) {
    const data = allUnits[uNum];
    unitList += `  <li>Unit ${padNum(uNum)} &mdash; ${esc(data.title)}</li>\n`;
  }

  return `
<div class="part-opener">
  <div class="part-number">PART ${part.number}</div>
  <div class="part-title">${esc(part.title)}</div>
  <div class="part-subtitle">${esc(part.subtitle)}</div>
  <div class="part-gold-line"></div>
  <ul class="part-units">
${unitList}    <li style="font-style: italic; color: #999;">+ ${part.number === 'I' ? '1' : part.number === 'II' ? '2' : part.number === 'III' ? '3' : '4'}주차 마무리 실전 훈련 (100문제)</li>
  </ul>
</div>
`;
}

// ─── Build unit page (content + problems) ───
function buildUnitPage(data, contentHtml) {
  const unitLabel = data.unit ? `Unit ${padNum(data.unit)}` : data.title;
  const titleText = data.unit ? `Unit ${padNum(data.unit)} &middot; ${esc(data.title)}` : esc(data.title);

  let html = `
<div class="page-break"></div>
<div class="section-title">${titleText}</div>
<div class="instruction-box">
  <div class="inst-label">Instructions</div>
  ${esc(data.instruction)}
</div>
`;

  // Insert educational content from legacy HTML (if available)
  if (contentHtml) {
    html += `<div class="unit-content">
${contentHtml}
</div>
`;
    // Page break between content and problems
    html += `<div class="page-break"></div>\n`;
    // Re-show section title for problems page
    html += `<div class="section-title">${titleText} &mdash; 연습 문제</div>\n`;
  }

  for (const p of data.problems) {
    html += `
<div class="problem-item">
  <div class="problem-head">
    <span class="problem-num-circle">${p.number}</span>
    <span class="problem-sentence">${esc(p.stem)}</span>
  </div>
  <div class="answer-lines">
    <div class="dot-line"></div>
    <div class="dot-line"></div>
    <div class="dot-line"></div>
  </div>
</div>
`;
  }

  return html;
}

// ─── Build review pages (100 problems with page breaks every ~15) ───
function buildReviewPages(data) {
  const PROBLEMS_PER_PAGE = 15;
  const problems = data.problems;
  const totalPages = Math.ceil(problems.length / PROBLEMS_PER_PAGE);

  let html = `
<div class="page-break"></div>
<div class="section-title">${esc(data.title)}</div>
<div class="instruction-box">
  <div class="inst-label">Instructions</div>
  ${esc(data.instruction)}
</div>
`;

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];

    // Page break every PROBLEMS_PER_PAGE (except first batch)
    if (i > 0 && i % PROBLEMS_PER_PAGE === 0) {
      html += `<div class="page-break"></div>\n`;
    }

    html += `
<div class="problem-item">
  <div class="problem-head">
    <span class="problem-num-circle">${p.number}</span>
    <span class="problem-sentence">${esc(p.stem)}</span>
  </div>
  <div class="answer-lines">
    <div class="dot-line"></div>
    <div class="dot-line"></div>
    <div class="dot-line"></div>
  </div>
</div>
`;
  }

  return html;
}

// ─── Build answer key section ───
function buildAnswerSection(allUnits, allReviews, parts) {
  // Section opener
  let html = `
<div class="answer-section-opener">
  <div class="opener-label">ANSWER KEY</div>
  <div class="opener-title">정답 및 해설</div>
  <div class="opener-gold-line"></div>
  <div class="opener-desc">Unit 01 ~ 19 + Review Week 1 ~ 4 &nbsp;&mdash;&nbsp; 전체 590문제</div>
</div>
`;

  // Legend page
  html += `
<div class="page-break"></div>
<div class="section-title">분석 기호 안내</div>
<div class="answer-legend">
  <div class="legend-title">문장 성분 표시</div>
  <span class="mark-s">(S)</span> 주어 &nbsp;&nbsp;
  <span class="mark-v">(V)</span> 동사 &nbsp;&nbsp;
  <span class="mark-o">(O)</span> 목적어 &nbsp;&nbsp;
  <span class="mark-c">(C)</span> 보어 &nbsp;&nbsp;
  <span class="mark-io">(IO)</span> 간접목적어 &nbsp;&nbsp;
  <span class="mark-do">(DO)</span> 직접목적어 &nbsp;&nbsp;
  <span class="mark-oc">(OC)</span> 목적격보어
  <div style="margin-top: 2mm;"></div>
  <div class="legend-title">절 표시</div>
  <span class="clause-tag clause-noun">[명사절]</span> &nbsp;
  <span class="clause-tag clause-adj">[형용사절]</span> &nbsp;
  <span class="clause-tag clause-adv">[부사절]</span>
  <div style="margin-top: 2mm;"></div>
  <div class="legend-title">기타 표시</div>
  ( ) 수식어(전치사구, 부사) &nbsp;&nbsp; [ ] 준동사구/절 묶음
</div>
<div class="spacer"></div>
`;

  for (const part of parts) {
    // Units
    for (const uNum of part.units) {
      const data = allUnits[uNum];
      html += buildAnswerUnit(`Unit ${padNum(uNum)} &mdash; ${esc(data.title)}`, data.problems);
    }
    // Review
    const reviewData = allReviews[part.reviewWeek];
    html += buildAnswerUnit(esc(reviewData.title), reviewData.problems);
  }

  return html;
}

function buildAnswerUnit(headerText, problems) {
  let html = `
<div class="page-break"></div>
<div class="answer-unit-header">${headerText}</div>
`;

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const a = p.answer || {};

    // For long review sections, insert page breaks
    if (i > 0 && i % 12 === 0) {
      html += `<div class="page-break"></div>\n`;
      html += `<div class="answer-unit-header" style="background:#2C3E6B;">${headerText} (continued)</div>\n`;
    }

    html += `<div class="answer-block">
  <div class="answer-head">
    <span class="answer-num-circle">${p.number}</span>
    <span class="answer-sentence">${esc(p.stem)}</span>
  </div>`;

    if (a.analysis) {
      html += `\n  <div class="answer-analysis">${colorizeAnalysis(a.analysis)}</div>`;
    }

    if (a.pattern) {
      html += `\n  <div class="answer-pattern">${esc(a.pattern)}</div>`;
    }

    if (a.translation) {
      html += `\n  <div class="answer-translation">${esc(a.translation)}</div>`;
    }

    if (a.notes) {
      html += `\n  <div class="answer-notes">${esc(a.notes)}</div>`;
    }

    html += `\n</div>\n`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
function main() {
  console.log('=== build-syntax-basic-verajin.js ===');
  console.log(`Data dir: ${DATA_DIR}`);
  console.log(`Output:   ${OUTPUT_FILE}`);
  console.log('');

  // Load all data
  const allUnits = {};
  const allReviews = {};
  let totalProblems = 0;

  for (let u = 1; u <= 19; u++) {
    const data = loadUnit(u);
    allUnits[u] = data;
    totalProblems += data.problems.length;
    console.log(`  Loaded unit${padNum(u)}: "${data.title}" (${data.problems.length} problems)`);
  }

  for (let w = 1; w <= 4; w++) {
    const data = loadReview(w);
    allReviews[w] = data;
    totalProblems += data.problems.length;
    console.log(`  Loaded review-week${w}: "${data.title}" (${data.problems.length} problems)`);
  }

  console.log(`\n  Total: ${totalProblems} problems across 19 units + 4 reviews`);

  // Extract legacy content
  console.log('\n--- Legacy Content Extraction ---');
  const contentByUnit = extractLegacyContent();
  const unitsWithContent = Object.keys(contentByUnit).map(Number).sort((a, b) => a - b);
  console.log(`  Units with content extracted: ${unitsWithContent.length}/19`);
  for (const u of unitsWithContent) {
    const charCount = contentByUnit[u].length;
    console.log(`    Unit ${padNum(u)}: ${charCount} chars`);
  }
  const unitsWithout = [];
  for (let u = 1; u <= 19; u++) {
    if (!contentByUnit[u]) unitsWithout.push(u);
  }
  if (unitsWithout.length > 0) {
    console.log(`  Units without content: ${unitsWithout.map(u => padNum(u)).join(', ')}`);
  }

  // Compute page map (approximate)
  const pageMap = computePageMap(PARTS);

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>verajin \u2014 \uAD6C\uBB38\uB3C5\uD574 Basic (Syntax Reading Basic)</title>
<style>
${generateCSS()}
</style>
</head>
<body>
`;

  // Cover
  html += buildCover();

  // TOC
  html += buildTOC(PARTS, allUnits, allReviews, pageMap);

  // Parts with units and reviews
  for (const part of PARTS) {
    // Part opener
    html += buildPartOpener(part, allUnits);

    // Unit pages (with content)
    for (const uNum of part.units) {
      html += buildUnitPage(allUnits[uNum], contentByUnit[uNum] || null);
    }

    // Review
    html += buildReviewPages(allReviews[part.reviewWeek]);
  }

  // Answer key
  html += buildAnswerSection(allUnits, allReviews, PARTS);

  html += `
</body>
</html>`;

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');

  const sizeKB = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`\n--- Output ---`);
  console.log(`  File: ${OUTPUT_FILE}`);
  console.log(`  Size: ${sizeKB} KB`);
  console.log(`  Content inserted: ${unitsWithContent.length}/19 units`);

  // Verify no header-bar or footer-line in output
  const headerBarCount = (html.match(/class="header-bar"/g) || []).length;
  const footerLineCount = (html.match(/class="footer-line"/g) || []).length;
  console.log(`  header-bar elements: ${headerBarCount} (should be 0)`);
  console.log(`  footer-line elements: ${footerLineCount} (should be 0)`);

  console.log('\n=== Done ===');
}

main();
