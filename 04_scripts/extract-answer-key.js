#!/usr/bin/env node
/**
 * extract-answer-key.js
 * 교재 데이터에서 정답 키를 추출하여 AI 에이전트에게 제공
 *
 * Usage:
 *   node 04_scripts/extract-answer-key.js --hint grammar/bridge/ch01 --range 1-20
 *   node 04_scripts/extract-answer-key.js --hint grammar/bridge/ch01 --range 1-20,41-60
 *   node 04_scripts/extract-answer-key.js --hint reading/bridge/part01 --range 61-65
 *   node 04_scripts/extract-answer-key.js --hint syntax/bridge/unit04 --range 1-30
 *
 * Output: 터미널에 정답 테이블 출력 + optional --out 파일 저장
 *
 * 목적: AI 에이전트가 이미지 분석 전에 정답 키를 확보하여
 *       "학생이 뭘 골랐는지"만 이미지에서 읽으면 되도록 함
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, '02_textbooks', 'data');

// ─── Parse Args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf('--' + name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const hint = getArg('hint');
const rangeStr = getArg('range');
const outFile = getArg('out');

if (!hint) {
  console.error('Usage: node extract-answer-key.js --hint <textbook-data-hint> [--range 1-20] [--out answer-key.json]');
  console.error('');
  console.error('Available hints:');
  console.error('  grammar/bridge/ch01~ch10   (problems.json — answer as number)');
  console.error('  grammar/advanced/ch01~ch04');
  console.error('  reading/bridge/part01~part06  (passages.json — may lack answers)');
  console.error('  reading/basic/part01~part06');
  console.error('  reading/intermediate/part01~part10');
  console.error('  syntax/bridge/unit01~unit10   (problems.json — binary choices)');
  console.error('  logic/basic/ch01~ch06');
  process.exit(1);
}

// ─── Parse Range ────────────────────────────────────────────────────────────
function parseRange(str) {
  if (!str) return null; // no filter = all
  const numbers = new Set();
  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) numbers.add(i);
    } else {
      numbers.add(Number(part));
    }
  });
  return numbers;
}

const rangeSet = parseRange(rangeStr);

// ─── Detect Data Type ───────────────────────────────────────────────────────
const circled = ['①', '②', '③', '④', '⑤'];

// Try problems file first, then passages
const problemsPath = path.join(dataDir, ...hint.split('/')) + '-problems.json';
const passagesPath = path.join(dataDir, ...hint.split('/')) + '-passages.json';

let dataType = null; // 'problems' | 'passages'
let dataFile = null;

if (fs.existsSync(problemsPath)) {
  dataType = 'problems';
  dataFile = problemsPath;
} else if (fs.existsSync(passagesPath)) {
  dataType = 'passages';
  dataFile = passagesPath;
} else {
  console.error(`데이터 파일 없음:`);
  console.error(`  ${problemsPath}`);
  console.error(`  ${passagesPath}`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
console.log(`\n📖 교재: ${rawData.title || rawData.bookId}`);
console.log(`📁 파일: ${path.relative(projectRoot, dataFile)}`);

// ─── Extract Answer Key ─────────────────────────────────────────────────────
const answerKey = [];

if (dataType === 'problems') {
  const problems = rawData.problems || [];
  const isSentenceAnalysis = rawData.type === 'sentence-analysis' ||
    (problems[0] && typeof problems[0].answer === 'object' && problems[0].answer !== null);
  console.log(`📊 총 문제 수: ${problems.length}`);
  if (isSentenceAnalysis) console.log(`📝 유형: 주관식 (구조 분석 + 해석)`);
  console.log('');

  if (isSentenceAnalysis) {
    // sentence-analysis type: answer is { analysis, pattern, translation }
    problems.forEach(p => {
      const num = typeof p.number === 'string' ? parseInt(p.number) : p.number;
      if (rangeSet && !rangeSet.has(num)) return;

      const ans = p.answer || {};
      answerKey.push({
        q: num,
        correct: ans.pattern || '—',
        analysis: ans.analysis || '',
        translation: ans.translation || '',
        stem: (p.stem || '').substring(0, 80),
        type: p.type || 'sentence-analysis',
      });
    });

    // Print table for sentence-analysis
    console.log('┌──────┬────────────────┬──────────────────────────────────────┐');
    console.log('│  Q#  │  형식/역할     │  해석                                │');
    console.log('├──────┼────────────────┼──────────────────────────────────────┤');
    answerKey.forEach(a => {
      const qStr = String(a.q).padStart(4);
      const patStr = a.correct.padEnd(14).substring(0, 14);
      const transStr = a.translation.padEnd(36).substring(0, 36);
      console.log(`│ ${qStr} │ ${patStr} │ ${transStr} │`);
    });
    console.log('└──────┴────────────────┴──────────────────────────────────────┘');
  } else {
    // Mixed type: fill-in-blank (numeric answer) + error-identification (string answer)
    problems.forEach(p => {
      const num = typeof p.number === 'string' ? parseInt(p.number) : p.number;
      if (rangeSet && !rangeSet.has(num)) return;

      const isErrorId = p.type === 'error-identification' || typeof p.answer === 'string';

      if (isErrorId) {
        // Error-identification: answer is a free-text correction string
        answerKey.push({
          q: num,
          correct: p.answer || '—',
          correctIndex: null,
          choiceText: '',
          choices: [],
          stem: (p.stem || '').substring(0, 80),
          type: p.type || 'error-identification',
          isErrorId: true,
        });
      } else {
        // Numeric answer (fill-in-blank, multiple choice)
        const ans = typeof p.answer === 'number' ? p.answer : parseInt(p.answer);
        const ansCircle = circled[ans - 1] || `(${ans})`;
        const choiceText = (p.choices && p.choices[ans - 1]) || '';

        answerKey.push({
          q: num,
          correct: ansCircle,
          correctIndex: ans,
          choiceText: choiceText.substring(0, 60),
          choices: (p.choices || []).map((c, i) => `${circled[i]} ${c.substring(0, 50)}`),
          stem: (p.stem || '').substring(0, 80),
          type: p.type || '',
          isErrorId: false,
        });
      }
    });

    // Print table — error-id rows get a wider answer column
    const hasErrorId = answerKey.some(a => a.isErrorId);
    if (hasErrorId) {
      console.log('┌──────┬──────────┬──────────────────────────────────────────┐');
      console.log('│  Q#  │  유형    │  정답                                    │');
      console.log('├──────┼──────────┼──────────────────────────────────────────┤');
      answerKey.forEach(a => {
        const qStr = String(a.q).padStart(4);
        if (a.isErrorId) {
          const typeStr = '어법교정  '.substring(0, 8);
          const ansStr = a.correct.padEnd(40).substring(0, 40);
          console.log(`│ ${qStr} │ ${typeStr} │  ${ansStr}│`);
        } else {
          const typeStr = '객관식    '.substring(0, 8);
          const ansStr = `${a.correct} ${a.choiceText}`.padEnd(40).substring(0, 40);
          console.log(`│ ${qStr} │ ${typeStr} │  ${ansStr}│`);
        }
      });
      console.log('└──────┴──────────┴──────────────────────────────────────────┘');
    } else {
      console.log('┌──────┬────────┬──────────────────────────────────────────────┐');
      console.log('│  Q#  │  정답  │  정답 선지 내용                              │');
      console.log('├──────┼────────┼──────────────────────────────────────────────┤');
      answerKey.forEach(a => {
        const qStr = String(a.q).padStart(4);
        const choiceStr = a.choiceText.padEnd(44).substring(0, 44);
        console.log(`│ ${qStr} │   ${a.correct}   │  ${choiceStr}│`);
      });
      console.log('└──────┴────────┴──────────────────────────────────────────────┘');
    }
  }

} else if (dataType === 'passages') {
  const passages = rawData.passages || [];
  console.log(`📊 총 지문 수: ${passages.length}`);

  let hasAnswers = false;
  let noAnswerCount = 0;

  passages.forEach(p => {
    const pNum = typeof p.number === 'string' ? parseInt(p.number) : p.number;
    if (rangeSet && !rangeSet.has(pNum)) return;

    const questions = p.questions || [];
    questions.forEach(q => {
      const ans = q.answer || q.correctAnswer;
      if (ans) hasAnswers = true;
      else noAnswerCount++;

      const ansDisplay = ans
        ? (typeof ans === 'number' ? circled[ans - 1] : ans)
        : '⚠️ 없음';

      answerKey.push({
        q: q.number || `${pNum}-?`,
        passageNum: pNum,
        passageTitle: (p.title || '').substring(0, 30),
        correct: ansDisplay,
        questionText: (q.text || '').substring(0, 60),
        choices: (q.choices || []).map((c, i) => `${circled[i]} ${c.substring(0, 50)}`),
        hasAnswer: !!ans,
      });
    });
  });

  if (noAnswerCount > 0) {
    console.log(`\n⚠️  ${noAnswerCount}개 문제에 정답 데이터 없음! AI가 지문에서 직접 판단해야 함.`);
  }
  if (hasAnswers) {
    console.log(`✅ 정답 데이터 있는 문제 존재`);
  }

  console.log('');
  console.log('┌──────────┬────────┬──────────────────────────────────────────┐');
  console.log('│  Q#      │  정답  │  질문 내용                                │');
  console.log('├──────────┼────────┼──────────────────────────────────────────┤');
  answerKey.forEach(a => {
    const qStr = String(a.q).padEnd(8);
    const qText = a.questionText.padEnd(40).substring(0, 40);
    const correctStr = String(a.correct).padEnd(6);
    console.log(`│ ${qStr} │ ${correctStr}│  ${qText}│`);
  });
  console.log('└──────────┴────────┴──────────────────────────────────────────┘');
}

console.log(`\n총 ${answerKey.length}개 문제 추출됨`);

// ─── Save to File ───────────────────────────────────────────────────────────
if (outFile) {
  const outPath = path.resolve(outFile);
  fs.writeFileSync(outPath, JSON.stringify(answerKey, null, 2), 'utf-8');
  console.log(`\n💾 저장됨: ${outPath}`);
}

// ─── Generate AI Prompt Template ────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('📋 AI 에이전트용 오답 추출 템플릿:');
console.log('='.repeat(70));
console.log('');
console.log('아래 표의 "학생답" 열만 이미지에서 채우세요.');
console.log('정답은 이미 교재 데이터에서 확인됨. O/X는 자동 판정됩니다.');
console.log('');

if (dataType === 'problems' && answerKey[0] && answerKey[0].analysis !== undefined) {
  // Sentence-analysis format: show analysis + translation per question
  console.log('주관식 문제입니다. 학생의 구조 분석과 해석을 확인하세요.');
  console.log('');
  answerKey.forEach(a => {
    console.log(`Q${a.q}: [${a.correct}]`);
    console.log(`  정답 분석: ${a.analysis.substring(0, 80)}`);
    console.log(`  정답 해석: ${a.translation.substring(0, 80)}`);
    console.log('');
  });
} else if (dataType === 'problems') {
  const hasErrorId = answerKey.some(a => a.isErrorId);

  if (hasErrorId) {
    // Mixed format: error-id shown as text, fill-in-blank shown as circled number
    console.log('※ 어법교정(주관식): 틀린 부분 고쳐쓰기. 객관식: 번호 선택.');
    console.log('');
    answerKey.forEach(a => {
      if (a.isErrorId) {
        console.log(`Q${String(a.q).padStart(2)} [어법교정] 정답: ${a.correct}`);
        console.log(`   학생답: _______________________________________________`);
      } else {
        console.log(`Q${String(a.q).padStart(2)} [객관식]  정답: ${a.correct} (${a.choiceText})`);
        console.log(`   학생답: ___`);
      }
      console.log('');
    });
  } else {
    // Compact format for grammar/syntax (numeric answers only)
    const perLine = 10;
    for (let i = 0; i < answerKey.length; i += perLine) {
      const batch = answerKey.slice(i, i + perLine);
      const qLine = batch.map(a => `Q${String(a.q).padStart(3)}`).join(' | ');
      const aLine = batch.map(a => ` ${a.correct}  `).join(' | ');
      const sLine = batch.map(() => ' ___  ').join(' | ');
      console.log(qLine);
      console.log('정답: ' + aLine);
      console.log('학생: ' + sLine);
      console.log('');
    }
  }
} else {
  answerKey.forEach(a => {
    console.log(`Q${a.q}: 정답=${a.correct}, 학생답=___`);
  });
}
