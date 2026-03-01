#!/usr/bin/env node
/**
 * validate-feedback.js
 * feedback-data.json을 교재 데이터와 대조하여 오류를 검출
 *
 * Usage:
 *   node 04_scripts/validate-feedback.js <학생이름> <YYMMDD>
 *
 * 검증 항목:
 *   1. 문제번호가 교재 데이터에 존재하는지 (가짜 문제 검출)
 *   2. correct 필드가 교재 정답과 일치하는지
 *   3. choices가 교재 선지와 일치하는지
 *   4. summary 통계가 실제 wrongAnswers 개수와 맞는지
 *   5. 중복 문제번호 검출
 *   6. 필수 필드 누락 검출
 *   7. selected ≠ correct 확인 (정답을 오답으로 넣은 경우)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, '02_textbooks', 'data');

// ─── CLI Args ───────────────────────────────────────────────────────────────
const studentName = process.argv[2];
const dateStr = process.argv[3];

if (!studentName || !dateStr) {
  console.error('Usage: node 04_scripts/validate-feedback.js <학생이름> <YYMMDD>');
  process.exit(1);
}

const jsonPath = path.join(projectRoot, '00_tutoring', studentName, 'input', dateStr, 'feedback-data.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ 파일 없음: ${jsonPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`\n🔍 검증 시작: ${studentName} ${dateStr}`);
console.log(`   과목: ${data.subject}, 교재: ${data.textbook}`);
console.log(`   범위: ${data.range}`);
console.log('');

const circled = ['①', '②', '③', '④', '⑤'];
let errors = [];
let warnings = [];

// ─── 1. Summary 통계 검증 ──────────────────────────────────────────────────
const actualWrong = (data.wrongAnswers || []).length;
if (data.summary) {
  if (data.summary.wrongQ !== actualWrong) {
    errors.push(`[STAT] summary.wrongQ=${data.summary.wrongQ} ≠ 실제 wrongAnswers 개수=${actualWrong}`);
  }
  if (data.summary.totalQ && data.summary.wrongQ !== undefined) {
    const expectedRate = Math.round((1 - data.summary.wrongQ / data.summary.totalQ) * 100);
    const actualRate = parseInt(data.summary.correctRate);
    if (Math.abs(expectedRate - actualRate) > 1) {
      warnings.push(`[STAT] correctRate 계산 불일치: 표기=${data.summary.correctRate}, 계산값=${expectedRate}%`);
    }
  }
}

// ─── 2. 중복 문제번호 검출 ──────────────────────────────────────────────────
const qNumbers = (data.wrongAnswers || []).map(w => w.q);
const dupes = qNumbers.filter((q, i) => qNumbers.indexOf(q) !== i);
if (dupes.length > 0) {
  errors.push(`[DUPE] 중복 문제번호: ${[...new Set(dupes)].join(', ')}`);
}

// ─── 3. 필수 필드 검증 ─────────────────────────────────────────────────────
(data.wrongAnswers || []).forEach((wa, idx) => {
  const prefix = `wrongAnswers[${idx}] Q${wa.q}`;
  if (!wa.q && wa.q !== 0) errors.push(`[FIELD] ${prefix}: q 필드 누락`);
  if (!wa.selected) errors.push(`[FIELD] ${prefix}: selected 필드 누락`);
  if (!wa.correct) errors.push(`[FIELD] ${prefix}: correct 필드 누락`);
  if (!wa.explanation) warnings.push(`[FIELD] ${prefix}: explanation 필드 누락`);
  if (!wa.studentAnalysis) warnings.push(`[FIELD] ${prefix}: studentAnalysis 필드 누락`);

  // selected === correct 이면 오답이 아님
  if (wa.selected && wa.correct && wa.selected === wa.correct) {
    errors.push(`[LOGIC] ${prefix}: selected(${wa.selected}) === correct(${wa.correct}) — 정답인데 오답 목록에 있음!`);
  }
});

// ─── 4. 교재 데이터 대조 ────────────────────────────────────────────────────
if (data.textbookDataHint) {
  const hints = Array.isArray(data.textbookDataHint) ? data.textbookDataHint : [data.textbookDataHint];

  hints.forEach(hint => {
    const problemsPath = path.join(dataDir, ...hint.split('/')) + '-problems.json';
    const passagesPath = path.join(dataDir, ...hint.split('/')) + '-passages.json';

    let tbProblems = null; // Map<number, problem>
    let tbPassages = null; // Map<string, question>

    if (fs.existsSync(problemsPath)) {
      const raw = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));
      tbProblems = new Map();
      (raw.problems || []).forEach(p => {
        const num = typeof p.number === 'string' ? parseInt(p.number) : p.number;
        tbProblems.set(num, p);
      });
      console.log(`📖 교재 데이터 로드: ${path.relative(projectRoot, problemsPath)} (${tbProblems.size}문제)`);
    }

    if (fs.existsSync(passagesPath)) {
      const raw = JSON.parse(fs.readFileSync(passagesPath, 'utf-8'));
      tbPassages = new Map();
      (raw.passages || []).forEach(p => {
        (p.questions || []).forEach(q => {
          const qNum = q.number || `${p.number}-?`;
          tbPassages.set(String(qNum), { ...q, passageNumber: p.number, passageTitle: p.title });
        });
      });
      console.log(`📖 교재 데이터 로드: ${path.relative(projectRoot, passagesPath)} (${tbPassages.size}문제)`);
    }

    // Cross-reference each wrong answer
    (data.wrongAnswers || []).forEach((wa, idx) => {
      const prefix = `Q${wa.q}`;

      // Check against problems data
      if (tbProblems) {
        const qNum = typeof wa.q === 'string' ? parseInt(wa.q) : wa.q;
        const tbP = tbProblems.get(qNum);

        if (!tbP) {
          // Check if q might be within range of this hint
          const allNums = [...tbProblems.keys()];
          const min = Math.min(...allNums);
          const max = Math.max(...allNums);
          if (qNum >= min - 10 && qNum <= max + 10) {
            errors.push(`[EXIST] ${prefix}: 교재(${hint})에 Q${qNum} 없음! (범위: Q${min}~Q${max}) — 가짜 문제 의심`);
          }
        } else {
          // Verify correct answer
          const tbAns = typeof tbP.answer === 'number' ? tbP.answer : parseInt(tbP.answer);
          const tbAnsCircle = circled[tbAns - 1];

          if (wa.correct !== tbAnsCircle) {
            errors.push(`[ANSWER] ${prefix}: feedback 정답=${wa.correct}, 교재 정답=${tbAnsCircle} — 정답 불일치!`);
          }

          // Verify choices (if provided)
          if (wa.choices && wa.choices.length > 0 && tbP.choices && tbP.choices.length > 0) {
            // Strip circled numbers for comparison
            const stripCircle = s => s.replace(/^[①②③④⑤]\s*/, '').trim();
            const fbChoices = wa.choices.map(stripCircle);
            const tbChoices = tbP.choices.map(c => c.trim());

            let mismatch = false;
            fbChoices.forEach((fc, i) => {
              if (i < tbChoices.length && fc !== tbChoices[i]) {
                // Allow partial match (first 20 chars)
                if (fc.substring(0, 20) !== tbChoices[i].substring(0, 20)) {
                  mismatch = true;
                }
              }
            });
            if (mismatch) {
              warnings.push(`[CHOICE] ${prefix}: 선지가 교재와 다름 — 확인 필요`);
            }
          }
        }
      }

      // Check against passages data
      if (tbPassages) {
        const qKey = String(wa.q);
        const tbQ = tbPassages.get(qKey);

        if (!tbQ) {
          // Try numeric match
          const numKey = typeof wa.q === 'number' ? wa.q : parseInt(wa.q);
          let found = false;
          for (const [k, v] of tbPassages) {
            if (String(k) === String(numKey) || k.startsWith(numKey + '-')) {
              found = true;
              break;
            }
          }
          if (!found) {
            const allKeys = [...tbPassages.keys()].slice(0, 10);
            warnings.push(`[EXIST] ${prefix}: 교재(${hint}) 지문 데이터에서 Q${wa.q} 매칭 안 됨 (샘플: ${allKeys.join(', ')})`);
          }
        } else {
          // Verify answer if available
          const tbAns = tbQ.answer || tbQ.correctAnswer;
          if (tbAns) {
            const tbAnsCircle = typeof tbAns === 'number' ? circled[tbAns - 1] : tbAns;
            if (wa.correct !== tbAnsCircle) {
              errors.push(`[ANSWER] ${prefix}: feedback 정답=${wa.correct}, 교재 정답=${tbAnsCircle}`);
            }
          }
        }
      }
    });
  });
} else {
  warnings.push('[HINT] textbookDataHint 미설정 — 교재 데이터 대조 불가');
}

// ─── 5. conceptQuestions 검증 ───────────────────────────────────────────────
if (data.conceptQuestions) {
  data.conceptQuestions.forEach((cq, idx) => {
    const prefix = `conceptQuestions[${idx}] "${(cq.title || '').substring(0, 20)}"`;
    if (!cq.practiceProblems || cq.practiceProblems.length === 0) {
      warnings.push(`[CONCEPT] ${prefix}: 연습문제 없음`);
    } else if (cq.practiceProblems.length < 15) {
      warnings.push(`[CONCEPT] ${prefix}: 연습문제 ${cq.practiceProblems.length}개 (권장 20개)`);
    }
    // Check practice problems have answers
    (cq.practiceProblems || []).forEach((pp, pi) => {
      if (!pp.answer) errors.push(`[CONCEPT] ${prefix} 연습${pi + 1}: answer 누락`);
    });
  });
}

// ─── Report ─────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 검증 통과! 오류 없음.');
} else {
  if (errors.length > 0) {
    console.log(`\n❌ 오류 ${errors.length}개 (반드시 수정):`);
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  경고 ${warnings.length}개 (확인 권장):`);
    warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  }
}

console.log('\n' + '='.repeat(60));

// Exit code: 1 if errors, 0 if only warnings or clean
if (errors.length > 0) {
  console.log(`\n🛑 ${errors.length}개 오류 발견 — HTML 생성 전에 수정하세요.`);
  process.exit(1);
} else {
  console.log(`\n✅ 검증 완료 (경고 ${warnings.length}개). HTML 생성 가능.`);
  process.exit(0);
}
