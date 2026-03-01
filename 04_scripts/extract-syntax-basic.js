#!/usr/bin/env node
/**
 * extract-syntax-basic.js — 구문독해 Basic PDF → JSON 데이터 추출
 *
 * PDF: "Vera's Flavor 편입영어_ 구문독해 Basic.pdf" (117 pages, 590 problems)
 *
 * Output:
 *   02_textbooks/data/syntax/basic/unit01~19-problems.json  (19 files, 10 problems each)
 *   02_textbooks/data/syntax/basic/review-week1~4-problems.json (4 files, 100 problems each)
 *   02_textbooks/books/syntax-basic.yaml
 *
 * Usage: node 04_scripts/extract-syntax-basic.js
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = path.resolve(__dirname, '..');
const PDF_PATH = path.join(ROOT, "Vera's Flavor 편입영어_ 구문독해 Basic.pdf");
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'syntax', 'basic');
const BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');

[DATA_DIR, BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Unit Definitions ────────────────────────────────────────────────────────
const UNITS = [
  { num: 1, title: '1형식 문장 (S + V)', part: 'I', week: 1,
    instruction: '다음 문장에서 주어(S)와 동사(V)를 찾아 표시하고, 우리말로 해석해 보세요.' },
  { num: 2, title: '2형식 문장 (S + V + C)', part: 'I', week: 1,
    instruction: '다음 문장에서 주어(S), 동사(V), 보어(C)를 찾아 표시하고, 우리말로 해석해 보세요.' },
  { num: 3, title: '3형식 문장 (S + V + O)', part: 'I', week: 1,
    instruction: '다음 문장에서 주어(S), 동사(V), 목적어(O)를 찾아 표시하고, 우리말로 해석해 보세요.' },
  { num: 4, title: '4형식과 5형식', part: 'I', week: 1,
    instruction: '다음 문장이 4형식인지 5형식인지 밝히고, 문장 성분을 표시한 후 해석해 보세요.' },
  { num: 5, title: '1주차 총정리 (1~5형식)', part: 'I', week: 1,
    instruction: '다음 문장의 형식을 밝히고, 각 문장 성분(S, V, O, C, IO, DO, OC)을 표시한 후 해석하시오.' },
  { num: 6, title: '전치사구 걷어내기', part: 'II', week: 2,
    instruction: '다음 문장에서 전치사구를 모두 찾아 괄호로 묶고, 문장의 뼈대(S, V, O, C)를 분석한 후 해석해 보세요.' },
  { num: 7, title: '부사 걷어내기', part: 'II', week: 2,
    instruction: '다음 문장에서 부사(구)를 모두 찾아 괄호로 묶고, 문장의 뼈대를 분석한 후 해석해 보세요.' },
  { num: 8, title: '괄호치기 종합 연습', part: 'II', week: 2,
    instruction: '다음 문장에서 모든 수식어(전치사구, 부사)를 괄호로 묶고, 남은 뼈대를 분석한 후 해석해 보세요.' },
  { num: 9, title: '2주차 총정리 (수식어 통합)', part: 'II', week: 2,
    instruction: '다음 문장에서 수식어를 괄호로 묶고, 뼈대의 형식을 밝힌 후 전체 문장을 해석해 보세요.' },
  { num: 10, title: 'to부정사 & 동명사 (명사 역할)', part: 'III', week: 3,
    instruction: '다음 문장에서 명사 역할을 하는 to부정사 또는 동명사구를 찾아 [ ]로 묶고, 그 역할을 (S, O, C)로 표시한 후 해석해 보세요.' },
  { num: 11, title: 'to부정사 (형용사/부사 역할)', part: 'III', week: 3,
    instruction: '다음 문장에서 형용사/부사 역할을 하는 to부정사구를 찾아 [ ]로 묶고, 그 역할을 (형용사/부사)로 표시한 후 해석해 보세요.' },
  { num: 12, title: '분사 (현재분사/과거분사)', part: 'III', week: 3,
    instruction: '다음 문장에서 분사(구)를 찾아 [ ]로 묶고, 현재분사인지 과거분사인지 표시한 후 해석해 보세요.' },
  { num: 13, title: '분사구문', part: 'III', week: 3,
    instruction: '다음 문장에서 분사구문을 찾아 [ ]로 묶고, 문맥에 맞게 자연스럽게 해석해 보세요.' },
  { num: 14, title: '3주차 총정리 (준동사 구별)', part: 'III', week: 3,
    instruction: '다음 문장에서 준동사구를 찾아 [ ]로 묶고, 그 역할(명사적/형용사적/부사적)을 구별한 후 해석해 보세요.' },
  { num: 15, title: '[중간 점검] 1~3주차 누적 복습', part: 'IV', week: 4,
    instruction: '1~3주차 내용을 총동원하여 다음 문장을 분석하고 해석해 보세요.' },
  { num: 16, title: '관계대명사절 (형용사절)', part: 'IV', week: 4,
    instruction: '다음 문장에서 관계대명사절을 찾아 [ ]로 묶고, 우리말로 해석해 보세요.' },
  { num: 17, title: '명사절 (that, what, if/whether)', part: 'IV', week: 4,
    instruction: '다음 문장에서 명사절을 찾아 [ ]로 묶고, 접속사의 종류를 확인한 후 해석해 보세요.' },
  { num: 18, title: '부사절 (시간, 이유, 조건, 양보)', part: 'IV', week: 4,
    instruction: '다음 문장에서 부사절을 찾아 [ ]로 묶고, 우리말로 해석해 보세요.' },
  { num: 19, title: '[최종 실전] 모든 절이 담긴 문장 완벽 분석', part: 'IV', week: 4,
    instruction: '최종 보스 문장입니다. 모든 지식을 동원하여 문장을 분석하고 해석해 보세요.' },
];

const REVIEWS = [
  { week: 1, title: '[1주차 마무리] 1~5형식 총정리 실전 훈련 (100문제)', part: 'I',
    instruction: '다음 문장의 형식을 밝히고, 문장 성분(S, V, O, C)을 표시한 후 해석해 보세요.' },
  { week: 2, title: '[2주차 마무리] 뼈대와 수식어 완벽 분리 실전 훈련 (100문제)', part: 'II',
    instruction: '다음 문장에서 수식어를 괄호로 묶고, 뼈대를 분석한 후 해석해 보세요.' },
  { week: 3, title: '[3주차 마무리] 준동사 역할 구별 마스터 (100문제)', part: 'III',
    instruction: '다음 문장에서 준동사구를 찾아 [ ]로 묶고, 역할을 구별한 후 해석해 보세요.' },
  { week: 4, title: '[4주차 마무리] 최종 실전! 복합 문장 완벽 분석 (100문제)', part: 'IV',
    instruction: '다음 문장에서 절/구 덩어리를 묶어 구조를 파악하고, 핵심 뼈대를 찾아 해석해 보세요.' },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📘 Extracting: 구문독해 Basic');

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF 파일 없음: ${PDF_PATH}`);
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(PDF_PATH);
  const pdf = await pdfParse(dataBuffer);
  console.log(`  📄 PDF pages: ${pdf.numpages}, text: ${pdf.text.length} chars`);

  const lines = pdf.text.split('\n');

  // ─── 1. Extract Unit Exercises (10 per unit) ─────────────────────────────
  // Pattern: "N강 연습 문제" ... problems ... next section
  const unitProblems = {};
  const unitAnswers = {};

  for (const u of UNITS) {
    unitProblems[u.num] = extractUnitExercise(lines, u.num);
    unitAnswers[u.num] = extractUnitAnswer(lines, u.num);
  }

  // ─── 2. Extract Review Problems (100 per week) ───────────────────────────
  const reviewProblems = {};
  const reviewAnswers = {};

  for (const r of REVIEWS) {
    reviewProblems[r.week] = extractReviewProblems(lines, r.week);
    reviewAnswers[r.week] = extractReviewAnswers(lines, r.week);
  }

  // ─── 3. Write Unit JSON Files ────────────────────────────────────────────
  let totalProblems = 0;

  for (const u of UNITS) {
    const problems = unitProblems[u.num];
    const answers = unitAnswers[u.num];
    const unitId = `unit${String(u.num).padStart(2, '0')}`;

    const merged = problems.map((p, idx) => {
      const ans = answers[idx] || { analysis: '', translation: '' };
      return {
        id: `syntax-basic-${unitId}-${p.number}`,
        number: p.number,
        type: 'sentence-analysis',
        stem: p.stem,
        answer: {
          analysis: ans.analysis || '',
          pattern: ans.pattern || '',
          translation: ans.translation || '',
          notes: ans.notes || '',
        },
      };
    });

    const outData = {
      bookId: `syntax-basic-${unitId}`,
      unit: u.num,
      title: u.title,
      part: u.part,
      week: u.week,
      type: 'sentence-analysis',
      instruction: u.instruction,
      problems: merged,
    };

    const outPath = path.join(DATA_DIR, `${unitId}-problems.json`);
    fs.writeFileSync(outPath, JSON.stringify(outData, null, 2), 'utf-8');
    totalProblems += merged.length;
    console.log(`  📖 ${unitId}: ${problems.length} problems, ${answers.length} answers`);
  }

  // ─── 4. Write Review JSON Files ──────────────────────────────────────────
  for (const r of REVIEWS) {
    const problems = reviewProblems[r.week];
    const answers = reviewAnswers[r.week];

    const merged = problems.map((p, idx) => {
      // Match by number first, fall back to index
      const ans = answers.find(a => a.number === p.number) || answers[idx] || { analysis: '', translation: '' };
      return {
        id: `syntax-basic-review-week${r.week}-${p.number}`,
        number: p.number,
        type: 'sentence-analysis',
        stem: p.stem,
        answer: {
          analysis: ans.analysis || '',
          pattern: ans.pattern || '',
          translation: ans.translation || '',
          notes: ans.notes || '',
        },
      };
    });

    const outData = {
      bookId: `syntax-basic-review-week${r.week}`,
      week: r.week,
      title: r.title,
      part: r.part,
      type: 'sentence-analysis',
      instruction: r.instruction,
      problems: merged,
    };

    const outPath = path.join(DATA_DIR, `review-week${r.week}-problems.json`);
    fs.writeFileSync(outPath, JSON.stringify(outData, null, 2), 'utf-8');
    totalProblems += merged.length;
    console.log(`  📝 Review Week ${r.week}: ${problems.length} problems, ${answers.length} answers`);
  }

  // ─── 5. Write YAML Manifest ──────────────────────────────────────────────
  const yamlLines = [
    '# syntax-basic — 구문독해 Basic',
    'id: syntax-basic',
    'title: "Vera\'s Flavor 구문독해 BASIC"',
    'subject: syntax',
    'level: basic',
    'author: "Vera\'s Flavor"',
    'template: mint-sky',
    '',
    'parts:',
    '  - id: I',
    '    title: "1주차 - 문장의 기본 뼈대 세우기"',
    '    units: [1, 2, 3, 4, 5]',
    '    review: week1',
    '  - id: II',
    '    title: "2주차 - 수식어 걷어내기"',
    '    units: [6, 7, 8, 9]',
    '    review: week2',
    '  - id: III',
    '    title: "3주차 - 준동사 파헤치기"',
    '    units: [10, 11, 12, 13, 14]',
    '    review: week3',
    '  - id: IV',
    '    title: "4주차 - 절 정복하기"',
    '    units: [15, 16, 17, 18, 19, 20]',
    '    review: week4',
    '',
    'data:',
  ];
  for (const u of UNITS) {
    const unitId = `unit${String(u.num).padStart(2, '0')}`;
    yamlLines.push(`  - type: problems`);
    yamlLines.push(`    src: syntax/basic/${unitId}-problems.json`);
  }
  for (const r of REVIEWS) {
    yamlLines.push(`  - type: problems`);
    yamlLines.push(`    src: syntax/basic/review-week${r.week}-problems.json`);
  }

  fs.writeFileSync(path.join(BOOKS_DIR, 'syntax-basic.yaml'), yamlLines.join('\n') + '\n', 'utf-8');
  console.log(`  💾 YAML manifest: syntax-basic.yaml`);

  // ─── 6. Validation Summary ───────────────────────────────────────────────
  console.log(`\n  📊 Summary:`);
  console.log(`     Unit files:     ${UNITS.length}`);
  console.log(`     Review files:   ${REVIEWS.length}`);
  console.log(`     Total files:    ${UNITS.length + REVIEWS.length}`);
  console.log(`     Total problems: ${totalProblems}`);

  let warnings = 0;
  for (const u of UNITS) {
    if (unitProblems[u.num].length !== 10) {
      console.warn(`  ⚠️  Unit ${u.num}: expected 10, got ${unitProblems[u.num].length} problems`);
      warnings++;
    }
    if (unitAnswers[u.num].length < unitProblems[u.num].length) {
      console.warn(`  ⚠️  Unit ${u.num}: ${unitAnswers[u.num].length} answers < ${unitProblems[u.num].length} problems`);
      warnings++;
    }
  }
  for (const r of REVIEWS) {
    if (reviewProblems[r.week].length !== 100) {
      console.warn(`  ⚠️  Review Week ${r.week}: expected 100, got ${reviewProblems[r.week].length} problems`);
      warnings++;
    }
    if (reviewAnswers[r.week].length < reviewProblems[r.week].length) {
      console.warn(`  ⚠️  Review Week ${r.week}: ${reviewAnswers[r.week].length} answers < ${reviewProblems[r.week].length} problems`);
      warnings++;
    }
  }

  if (warnings === 0) {
    console.log(`\n  ✅ All validations passed!`);
  } else {
    console.log(`\n  ⚠️  ${warnings} warnings — some data may need manual review`);
  }

  console.log('  ✅ Done: 구문독해 Basic\n');
}

// ─── Extraction Helpers ──────────────────────────────────────────────────────

/**
 * Find line index matching pattern
 */
function findLine(lines, pattern, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].trim().match(pattern)) return i;
  }
  return -1;
}

/**
 * Extract unit exercise problems (10 per unit)
 * Text format: "N강 연습 문제\n instruction \n 1.stem \n 2.stem ..."
 */
function extractUnitExercise(lines, unitNum) {
  const headerPattern = new RegExp(`^${unitNum}강\\s*연습\\s*문제$`);
  const headerIdx = findLine(lines, headerPattern);
  if (headerIdx === -1) {
    console.warn(`  ⚠️  Unit ${unitNum} exercise header not found`);
    return [];
  }

  // Find the end: next "강" header, answer header, or page marker
  const endPattern = new RegExp(`^(${unitNum}강\\s*연습\\s*문제\\s*정답|\\d+강|Vera's Flavor)`);
  let endIdx = lines.length;
  for (let i = headerIdx + 1; i < Math.min(headerIdx + 50, lines.length); i++) {
    if (lines[i].trim().match(endPattern)) {
      endIdx = i;
      break;
    }
  }

  const problems = [];
  for (let i = headerIdx + 1; i < endIdx; i++) {
    const line = lines[i].trim();
    // Match "N.sentence" or "N. sentence"
    const m = line.match(/^(\d+)\.\s*(.+)/);
    if (m) {
      const num = parseInt(m[1]);
      let stem = m[2].trim();
      // Check if next line is continuation (no number prefix, not empty, not a page number)
      if (i + 1 < endIdx) {
        const next = lines[i + 1].trim();
        if (next.length > 3 && !next.match(/^\d+\./) && !next.match(/^\d+$/) && !next.match(/^Vera/) && !next.match(/^다음/)) {
          stem += ' ' + next;
          i++;
        }
      }
      if (num >= 1 && num <= 10) {
        problems.push({ number: num, stem });
      }
    }
  }

  return problems;
}

/**
 * Extract unit answer data
 *
 * Two formats discovered:
 * - Units 1-9 (two-line): English analysis line, then Korean translation line
 *   e.g. "The baby(S) is sleeping(V)." → next line "아기가 자고 있다."
 * - Units 10+ (slash-separated): "English analysis / Korean translation" on one line
 *   e.g. "[To exercise regularly](S) is good for your health. / 규칙적으로 운동하는 것은 건강에 좋다."
 *   Some wrap to next line when long.
 */
function extractUnitAnswer(lines, unitNum) {
  const headerPattern = new RegExp(`^${unitNum}강\\s*연습\\s*문제\\s*정답$`);
  const headerIdx = findLine(lines, headerPattern);
  if (headerIdx === -1) {
    console.warn(`  ⚠️  Unit ${unitNum} answer header not found`);
    return [];
  }

  // Find end: next section header
  let endIdx = lines.length;
  for (let i = headerIdx + 1; i < Math.min(headerIdx + 80, lines.length); i++) {
    const line = lines[i].trim();
    if ((line.match(/^\d+강\s/) && !line.includes('정답')) ||
        line.match(/^\d+주차/) ||
        (line.match(/^Vera's Flavor/) && !line.includes('정답'))) {
      endIdx = i;
      break;
    }
  }

  // Collect all content lines between header and end
  const contentLines = [];
  for (let i = headerIdx + 1; i < endIdx; i++) {
    const line = lines[i].trim();
    if (!line || line.match(/^\d+$/) || line.match(/^Vera's Flavor/)) continue;
    contentLines.push(line);
  }

  // Detect format: if any content line contains " / ", use slash mode
  const hasSlash = contentLines.some(l => l.includes(' / '));

  const answers = [];

  if (hasSlash) {
    // --- Slash-separated format (units 10+) ---
    // Join wrapped lines first: if a line doesn't contain " / " and the previous
    // accumulated buffer doesn't have " / " yet, it's a continuation
    let buffer = '';
    for (const line of contentLines) {
      if (buffer && buffer.includes(' / ')) {
        // Previous buffer is complete, parse it
        const slashIdx = buffer.indexOf(' / ');
        const analysis = buffer.substring(0, slashIdx).trim();
        const translation = buffer.substring(slashIdx + 3).trim();
        answers.push(parseUnitAnswer(analysis, translation));
        buffer = line;
      } else {
        buffer += (buffer ? ' ' : '') + line;
      }
    }
    // Handle last buffer
    if (buffer) {
      if (buffer.includes(' / ')) {
        const slashIdx = buffer.indexOf(' / ');
        const analysis = buffer.substring(0, slashIdx).trim();
        const translation = buffer.substring(slashIdx + 3).trim();
        answers.push(parseUnitAnswer(analysis, translation));
      } else if (buffer.trim()) {
        answers.push(parseUnitAnswer(buffer.trim(), ''));
      }
    }
  } else {
    // --- Two-line format (units 1-9) ---
    // Lines alternate: English analysis line, then Korean translation line
    // Analysis lines contain (S), (V), (O), (C), (IO), (DO), (OC) markers
    // Some start with pattern tags: (4형식), [1형식], etc.
    // Some start with (Honestly) or (In the morning) — prepositional/adverb opener
    let currentAnalysis = null;
    for (const line of contentLines) {
      // Analysis line: contains structural markers like (S), (V), (O), (C)
      const hasMarkers = /\([SVOC]\)|\(IO\)|\(DO\)|\(OC\)/.test(line);
      // Korean line: starts with Korean character OR starts with ( followed by Korean
      // e.g. "(파란 셔츠를 입은) 그 남자는..." or "아기가 자고 있다."
      const isKorean = /^[\uAC00-\uD7AF]/.test(line) ||
        (/^\([\uAC00-\uD7AF]/.test(line) && !hasMarkers);
      // Skip non-content lines
      const isSkip = /^[\d]+$/.test(line) || /학습 완료/.test(line);

      if (isSkip) continue;

      if (hasMarkers) {
        // If we had an unpaired analysis, save it without translation
        if (currentAnalysis !== null) {
          answers.push(parseUnitAnswer(currentAnalysis, ''));
        }
        currentAnalysis = line;
      } else if (isKorean && currentAnalysis !== null) {
        // This is the translation for the current analysis
        answers.push(parseUnitAnswer(currentAnalysis, line));
        currentAnalysis = null;
      } else if (isKorean && currentAnalysis === null) {
        // Orphan Korean line — might be continuation of previous translation
        if (answers.length > 0) {
          answers[answers.length - 1].translation += ' ' + line;
        }
      } else if (currentAnalysis !== null) {
        // Continuation of analysis line
        currentAnalysis += ' ' + line;
      }
    }
    // Handle trailing unpaired analysis
    if (currentAnalysis !== null) {
      answers.push(parseUnitAnswer(currentAnalysis, ''));
    }
  }

  return answers.slice(0, 10); // max 10 answers per unit
}

/**
 * Parse a unit answer into structured data
 */
function parseUnitAnswer(analysis, translation) {
  // Extract pattern tag from analysis: [1형식], [명사적], etc.
  let pattern = '';

  // Extract pattern tag at start: [1형식], (4형식), [명사적], (부사절), etc.
  const bracketPattern = analysis.match(/^\[([^\]]+)\]\s*/);
  const parenPattern = analysis.match(/^\(([^)]+)\)\s*/);
  if (bracketPattern && /[가-힣]/.test(bracketPattern[1])) {
    // Korean pattern in brackets: [1형식], [명사적-주어], etc.
    pattern = bracketPattern[1];
    analysis = analysis.substring(bracketPattern[0].length);
  } else if (parenPattern && /[가-힣]/.test(parenPattern[1])) {
    // Korean pattern in parens: (4형식), (부사절), etc.
    pattern = parenPattern[1];
    analysis = analysis.substring(parenPattern[0].length);
  }

  // Check for pattern in "/ translation" style (some units use this)
  if (!translation && analysis.includes(' / ')) {
    const parts = analysis.split(' / ');
    analysis = parts[0].trim();
    translation = parts.slice(1).join(' / ').trim();
  }

  // Extract notes (asterisk comments)
  let notes = '';
  const notesMatch = analysis.match(/\(\*[^)]*\)/g);
  if (notesMatch) {
    notes = notesMatch.map(n => n.replace(/^\(\*\s*/, '').replace(/\s*\)$/, '')).join('; ');
  }

  return { analysis: analysis.trim(), pattern, translation: translation.trim(), notes };
}

/**
 * Extract review problems (100 per week)
 * Format: Part headers with "N.\nstem" across two lines
 */
function extractReviewProblems(lines, week) {
  // Find the review intro
  const introPattern = new RegExp(`\\[${week}주차\\s*마무리\\].*\\(100문제\\)`);
  const introIdx = findLine(lines, introPattern);
  if (introIdx === -1) {
    console.warn(`  ⚠️  Review Week ${week} intro not found`);
    return [];
  }

  // Find the answer section
  const ansPattern = new RegExp(`\\[${week}주차\\s*마무리\\]\\s*정답`);
  let ansIdx = findLine(lines, ansPattern, introIdx + 1);
  if (ansIdx === -1) ansIdx = lines.length;

  const problems = [];
  let currentNum = null;

  for (let i = introIdx + 1; i < ansIdx; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip headers and page markers
    if (line.match(/^Part\s+\d/) || line.match(/^Vera's Flavor/) ||
        line.match(/학습 안내/) || line.match(/문제 해결/) ||
        line.match(/목표:/) || line.match(/권장 시간/) ||
        line.match(/^\d+$/) && parseInt(line) > 100) continue;
    if (line.includes('주차 마무리') && !line.match(/^\d+\./)) continue;
    if (line.match(/^다음 문장/)) continue;

    // Match "N." at start of line (problem number)
    const numMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      if (num >= 1 && num <= 100) {
        const rest = numMatch[2].trim();
        // Skip Korean instruction lines (e.g. "1. 주어(S)와 동사(V) 찾기: ...")
        // Real problems have English sentences; instructions start with Korean
        if (rest.length > 5 && /^[\uAC00-\uD7AF]/.test(rest)) {
          continue; // Korean instruction, not a problem
        }
        if (rest.length > 5 && /^[A-Z]/.test(rest)) {
          // Number and English stem on same line
          problems.push({ number: num, stem: rest });
          currentNum = null;
        } else if (rest.length <= 5 || !rest) {
          // Number only, stem on next line
          currentNum = num;
        }
      }
      continue;
    }

    // Bare number on its own line
    const bareNum = line.match(/^(\d+)$/);
    if (bareNum) {
      const num = parseInt(bareNum[1]);
      if (num >= 1 && num <= 100) {
        currentNum = num;
      }
      continue;
    }

    // If we have a pending number and this is the stem
    if (currentNum !== null && line.length > 5 && /[A-Z]/.test(line[0])) {
      let stem = line;
      // Check for continuation on next line
      if (i + 1 < ansIdx) {
        const next = lines[i + 1].trim();
        if (next.length > 3 && !next.match(/^\d+[\.\s]?$/) && !next.match(/^Part/) &&
            !next.match(/^Vera/) && /^[a-z]/.test(next)) {
          stem += ' ' + next;
          i++;
        }
      }
      problems.push({ number: currentNum, stem });
      currentNum = null;
      continue;
    }

    // Continuation of previous problem stem
    if (problems.length > 0 && !currentNum && line.length > 3 &&
        /^[a-z]/.test(line) && !line.match(/^\d/)) {
      problems[problems.length - 1].stem += ' ' + line;
    }
  }

  return problems;
}

/**
 * Extract review answers
 * Week 1-2: "N. [형식] Analysis(S) verb(V)... / Translation"
 * Week 3: "N. [역할-구체] Translation"  (Korean-only with role tags)
 * Week 4: "N. Translation (clause types)" (Korean-only with clause annotations)
 */
function extractReviewAnswers(lines, week) {
  const ansPattern = new RegExp(`\\[${week}주차\\s*마무리\\]\\s*정답`);
  // Skip TOC (first ~50 lines) by starting search from line 100+
  const ansIdx = findLine(lines, ansPattern, 100);
  if (ansIdx === -1) {
    console.warn(`  ⚠️  Review Week ${week} answers not found`);
    return [];
  }

  // Find end of answers section
  let endIdx = lines.length;
  for (let i = ansIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    // End markers: next week's intro, unit header, or end of file
    if ((line.match(/주차 마무리\].*100문제/) && !line.includes(`${week}주차`)) ||
        line.match(/^\d+강($|\s)/) ||
        (line.match(/^\[완강\]/) || line.includes('4주간의 여정'))) {
      endIdx = i;
      break;
    }
  }

  const answers = [];
  let currentAnswer = null;

  if (week <= 2) {
    // Week 1-2: "N. [형식] Analysis / Translation" on single lines
    for (let i = ansIdx + 1; i < endIdx; i++) {
      const line = lines[i].trim();
      if (!line || line.match(/^Vera's Flavor/) || line.match(/^Part/) || line.match(/^※/)) continue;
      if (line.match(/^\d+$/) && parseInt(line) <= 120) continue; // page numbers

      const m = line.match(/^(\d+)\.\s*(.+)/);
      if (m) {
        if (currentAnswer) answers.push(currentAnswer);
        const num = parseInt(m[1]);
        const raw = m[2].trim();
        currentAnswer = parseReviewAnswer12(num, raw);
      } else if (currentAnswer && line.length > 3) {
        // Skip standalone page numbers in continuations
        if (line.match(/^\d+$/) && parseInt(line) <= 120) continue;
        // Continuation — strip trailing page numbers
        const cleanLine = line.replace(/\s+\d{1,3}$/, '').trim();
        const extended = currentAnswer._raw + ' ' + cleanLine;
        const reparsed = parseReviewAnswer12(currentAnswer.number, extended);
        currentAnswer = reparsed;
      }
    }
    if (currentAnswer) answers.push(currentAnswer);
  } else {
    // Week 3-4: "N. [역할] Korean text" or "N. Korean text (clause type)"
    for (let i = ansIdx + 1; i < endIdx; i++) {
      const line = lines[i].trim();
      if (!line || line.match(/^Vera's Flavor/) || line.match(/^Part/) || line.match(/^※/) ||
          line.match(/^정답 및 해설$/)) continue;
      if (line.match(/^\d+$/) && parseInt(line) > 100) continue;

      const m = line.match(/^(\d+)\.\s*(.+)/);
      if (m) {
        if (currentAnswer) answers.push(currentAnswer);
        const num = parseInt(m[1]);
        currentAnswer = { number: num, _raw: m[2].trim() };
      } else if (currentAnswer && line.length > 1) {
        // Skip standalone page numbers (1-120)
        if (line.match(/^\d+$/) && parseInt(line) <= 120) continue;
        currentAnswer._raw += ' ' + line;
      }
    }
    if (currentAnswer) answers.push(currentAnswer);

    // Parse week 3-4 answers — strip trailing page numbers from _raw
    answers.forEach((a, idx) => {
      // Remove trailing page numbers (e.g. " 89" at end)
      a._raw = a._raw.replace(/\s+\d{1,3}$/, '').trim();
      const parsed = parseReviewAnswer34(a.number, a._raw, week);
      answers[idx] = parsed;
    });
  }

  // Clean up _raw
  answers.forEach(a => delete a._raw);

  // Cap at 100 answers and filter valid numbers only
  return answers.filter(a => a.number >= 1 && a.number <= 100).slice(0, 100);
}

/**
 * Parse week 1-2 review answer: "N. [형식] Analysis(S) verb(V)... / Translation"
 */
function parseReviewAnswer12(num, raw) {
  let pattern = '';
  let analysis = raw;
  let translation = '';
  let notes = '';

  // Extract [형식] pattern
  const patMatch = raw.match(/^\[([^\]]+)\]\s*/);
  if (patMatch) {
    pattern = patMatch[1];
    analysis = raw.substring(patMatch[0].length);
  }

  // Split by " / " for translation
  const slashIdx = analysis.indexOf(' / ');
  if (slashIdx > 0) {
    translation = analysis.substring(slashIdx + 3).trim();
    analysis = analysis.substring(0, slashIdx).trim();
  }

  // Extract notes
  const notesMatch = analysis.match(/\(\*[^)]*\*?\)/g);
  if (notesMatch) {
    notes = notesMatch.map(n => n.replace(/^\(\*\s*/, '').replace(/\s*\*?\)$/, '')).join('; ');
    analysis = analysis.replace(/\(\*[^)]*\*?\)/g, '').trim();
  }

  return { number: num, analysis, pattern, translation, notes, _raw: raw };
}

/**
 * Parse week 3-4 review answer: Korean-only with role/clause annotations
 * Week 3: "[역할-구체] Korean text"
 * Week 4: "Korean text. (clause types)"
 */
function parseReviewAnswer34(num, raw, week) {
  let pattern = '';
  let translation = raw;
  let analysis = '';
  let notes = '';

  if (week === 3) {
    // Extract [역할-구체] at the start
    const roleMatch = raw.match(/^\[([^\]]+)\]\s*/);
    if (roleMatch) {
      pattern = roleMatch[1];
      translation = raw.substring(roleMatch[0].length).trim();
    }
  } else if (week === 4) {
    // Extract (clause types) at the end
    const clauseMatch = raw.match(/\(([^)]*절[^)]*)\)\s*$/);
    if (clauseMatch) {
      pattern = clauseMatch[1];
      translation = raw.substring(0, raw.lastIndexOf('(' + clauseMatch[1])).trim();
    }
  }

  // Extract notes
  const notesMatch = raw.match(/\(\*[^)]*\*?\)/g);
  if (notesMatch) {
    notes = notesMatch.map(n => n.replace(/^\(\*\s*/, '').replace(/\s*\*?\)$/, '')).join('; ');
  }

  return { number: num, analysis, pattern, translation, notes };
}

// ─── Run ─────────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
