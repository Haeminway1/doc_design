/**
 * normalize-feedback-data.js
 *
 * Agent3가 생성한 feedback-data.json을 generate-feedback-from-json.js가
 * 기대하는 표준 형식으로 정규화.
 *
 * 처리 항목:
 *  - wrongAnswers 필드 alias 통합 (q/questionNo/questionNum 등)
 *  - explanation 객체/문자열 변형 대응
 *  - studentAnalysis 변형 대응
 *  - 독해 핵심 분석 필드(summary/fullInterpretation/keywords/...) 보존
 *  - summary/weakAreas 타입 정규화
 */

'use strict';

const CIRCLED = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstNonEmpty(values, fallback = '') {
  for (const v of values) {
    if (v == null) continue;
    if (typeof v === 'string') {
      const t = v.trim();
      if (t) return t;
      continue;
    }
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue;
    return v;
  }
  return fallback;
}

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }
  return String(value)
    .split(/\n|;|,/)
    .map(v => v.trim())
    .filter(Boolean);
}

function stripMarkerPrefix(text) {
  return String(text || '')
    .replace(/^[📌📖]\s*/g, '')
    .replace(/^\[(한줄요약|전체 ?해석)\]\s*/i, '')
    .replace(/^【(한줄요약|전체해석)】\s*/i, '')
    .trim();
}

function extractChoiceLabel(raw) {
  if (raw == null) return '';
  const text = String(raw).trim();
  const circled = text.match(/[①②③④⑤⑥⑦⑧⑨⑩]/);
  if (circled) return circled[0];
  const num = text.match(/(?:^|[^0-9])([1-9]|10)(?:[^0-9]|$)/);
  if (num) {
    const n = Number(num[1]);
    if (n >= 1 && n <= 10) return CIRCLED[n];
  }
  return text;
}

function normalizeKeywords(raw) {
  if (!raw) return { positive: [], negative: [] };
  if (typeof raw === 'string') {
    return {
      positive: toList(raw),
      negative: [],
    };
  }

  return {
    positive: toList(
      firstNonEmpty([raw.positive, raw.positive_direction, raw.core, raw.pos], [])
    ),
    negative: toList(
      firstNonEmpty([raw.negative, raw.negative_direction, raw.neg, raw.traps], [])
    ),
  };
}

function normalizeStudentAnalysis(sa) {
  if (!sa) {
    return {
      whyChosen: '',
      errorPattern: '',
      focusPoint: '',
    };
  }

  if (typeof sa === 'string') {
    const sentences = sa.split(/(?<=[.다.])\s+/).filter(s => s.trim());
    if (sentences.length >= 3) {
      return {
        whyChosen: sentences[0],
        errorPattern: sentences[1],
        focusPoint: sentences.slice(2).join(' '),
      };
    }
    if (sentences.length === 2) {
      return {
        whyChosen: sentences[0],
        errorPattern: sentences[1],
        focusPoint: '',
      };
    }
    return {
      whyChosen: sa.trim(),
      errorPattern: '',
      focusPoint: '',
    };
  }

  return {
    whyChosen: firstNonEmpty([sa.whyChosen, sa.whereBlocked, sa.reason, sa.why], ''),
    errorPattern: firstNonEmpty([sa.errorPattern, sa.mistakePattern, sa.pattern], ''),
    focusPoint: firstNonEmpty([sa.focusPoint, sa.focus, sa.keyPoint], ''),
  };
}

function normalizeStructureRows(step4) {
  if (!step4) return { description: '', rows: [] };
  if (Array.isArray(step4)) {
    return { description: '', rows: step4 };
  }
  if (typeof step4 === 'string') {
    return { description: step4.trim(), rows: [] };
  }
  const rows = Array.isArray(step4.table)
    ? step4.table
    : Array.isArray(step4.rows)
    ? step4.rows
    : [];
  return {
    description: firstNonEmpty([step4.description, step4.text], ''),
    rows,
  };
}

function normalizeChoiceAnalysis(step5) {
  if (!step5) return { answer: null, wrongs: [] };
  if (typeof step5 === 'string') return { answer: null, wrongs: [] };

  const answerSrc = step5.answer || step5.correct || null;
  const answer = answerSrc ? {
    label: extractChoiceLabel(firstNonEmpty([answerSrc.choice, answerSrc.label], '')),
    text: firstNonEmpty([answerSrc.text, answerSrc.statement], ''),
    reason: firstNonEmpty([answerSrc.reason, answerSrc.explanation], ''),
  } : null;

  const wrongSrc = Array.isArray(step5.wrongChoices)
    ? step5.wrongChoices
    : Array.isArray(step5.warnings)
    ? step5.warnings
    : [];

  const wrongs = wrongSrc.map(w => ({
    label: extractChoiceLabel(firstNonEmpty([w.choice, w.label], '')),
    text: firstNonEmpty([w.text, w.statement], ''),
    reason: firstNonEmpty([w.reason, w.explanation, w.function], ''),
  }));

  return { answer, wrongs };
}

function extractExplanationFields(expl) {
  if (!expl || typeof expl !== 'object' || Array.isArray(expl)) {
    return {
      summary: '',
      fullInterpretation: '',
      keywords: { positive: [], negative: [] },
      directionAnalysis: '',
      optionAnalysis: '',
      correctExplanation: '',
      wrongExplanation: '',
    };
  }

  const step4 = normalizeStructureRows(firstNonEmpty([expl.step4_structure, expl.directionAnalysis], null));
  const step5 = normalizeChoiceAnalysis(firstNonEmpty([expl.step5_choices, expl.optionAnalysis], null));
  const wrongExplanation = step5.wrongs
    .map(w => `${w.label ? `${w.label} ` : ''}${w.reason || w.text}`.trim())
    .filter(Boolean)
    .join('\n');
  const optionLines = [];
  if (step5.answer && (step5.answer.reason || step5.answer.text)) {
    optionLines.push(`정답 ${step5.answer.label || ''}: ${step5.answer.reason || step5.answer.text}`.trim());
  }
  for (const w of step5.wrongs) {
    optionLines.push(`오답 ${w.label || ''}: ${w.reason || w.text}`.trim());
  }

  return {
    summary: stripMarkerPrefix(firstNonEmpty([expl.step1_summary, expl.summary, expl.oneLineSummary], '')),
    fullInterpretation: stripMarkerPrefix(firstNonEmpty([expl.step2_interpretation, expl.fullInterpretation, expl.fullTranslation], '')),
    keywords: normalizeKeywords(firstNonEmpty([expl.step3_keywords, expl.keywords], null)),
    directionAnalysis: firstNonEmpty([step4.description, expl.directionAnalysis], ''),
    optionAnalysis: optionLines.join('\n'),
    correctExplanation: step5.answer ? firstNonEmpty([step5.answer.reason, step5.answer.text], '') : '',
    wrongExplanation,
  };
}

function buildExplanationObjectFromFields(wa) {
  const warnings = toList(wa.wrongExplanation).map((line, idx) => ({
    choice: String(idx + 1),
    text: '',
    reason: line,
  }));

  return {
    step1_summary: wa.summary || '',
    step2_interpretation: wa.fullInterpretation || '',
    step3_keywords: normalizeKeywords(wa.keywords),
    step4_structure: {
      description: wa.directionAnalysis || '',
      table: [],
    },
    step5_choices: {
      answer: {
        choice: extractChoiceLabel(wa.correct),
        text: '',
        reason: wa.correctExplanation || '',
      },
      warnings,
    },
  };
}

/**
 * explanation 객체 → 5단계 HTML 문자열
 */
function explanationToHtml(expl) {
  if (typeof expl === 'string') return expl;
  if (!expl || typeof expl !== 'object') return '';

  const summary = stripMarkerPrefix(firstNonEmpty([expl.step1_summary, expl.summary, expl.oneLineSummary], ''));
  const fullInterpretation = stripMarkerPrefix(firstNonEmpty([expl.step2_interpretation, expl.fullInterpretation, expl.fullTranslation], ''));
  const keywords = normalizeKeywords(firstNonEmpty([expl.step3_keywords, expl.keywords], null));
  const step4 = normalizeStructureRows(firstNonEmpty([expl.step4_structure, expl.directionAnalysis], null));
  const step5 = normalizeChoiceAnalysis(firstNonEmpty([expl.step5_choices, expl.optionAnalysis], null));

  let html = '';

  if (summary) {
    html += `\n<div class="concept-box">
  <span class="concept-label">한줄 요약</span>
  <p>${esc(summary)}</p>
</div>`;
  }

  if (fullInterpretation) {
    html += `\n<div class="grammar-block" style="text-align:justify;">${esc(fullInterpretation)}</div>`;
  }

  if (keywords.positive.length > 0 || keywords.negative.length > 0) {
    html += `\n<h4>핵심 키워드</h4>\n<table>\n<thead><tr><th>Positive (지문 방향)</th><th>Negative (반대/함정)</th></tr></thead>\n<tbody><tr>`;
    html += `<td>${keywords.positive.map(p => `${esc(p)}<br>`).join('')}</td>`;
    html += `<td>${keywords.negative.map(n => `${esc(n)}<br>`).join('')}</td>`;
    html += `</tr></tbody></table>`;
  }

  if (step4.description || step4.rows.length > 0) {
    html += `\n<div class="tip-box">
  <span class="tip-label">구조 및 방향성</span>`;
    if (step4.description) {
      html += `\n  <p>${esc(step4.description)}</p>`;
    }
    if (step4.rows.length > 0) {
      html += `\n  <table>
    <thead><tr><th>문장</th><th>기능</th></tr></thead>
    <tbody>`;
      for (const row of step4.rows) {
        const sentence = firstNonEmpty([row.sentence, row.text], '');
        const fn = firstNonEmpty([row.function, row.role, row.direction], '');
        html += `\n      <tr><td style="font-size:8.5pt;">${esc(sentence)}</td><td>${esc(fn)}</td></tr>`;
      }
      html += `\n    </tbody>
  </table>`;
    }
    html += `\n</div>`;
  }

  if (step5.answer) {
    html += `\n<div class="answer-box">
  <span class="answer-label">정답 ${esc(step5.answer.label || '')}</span>
  <p>${esc(step5.answer.text || '')}</p>
  <p style="font-size:8.5pt; color:#2d3748;">${esc(step5.answer.reason || '')}</p>
</div>`;
  }

  for (const wrong of step5.wrongs) {
    html += `\n<div class="warning-box">
  <span class="warning-label">오답 ${esc(wrong.label || '')}</span>
  <p>${esc(wrong.text || '')}</p>
  <p style="font-size:8.5pt;">${esc(wrong.reason || '')}</p>
</div>`;
  }

  return html;
}

function normalizeWrongAnswerRow(raw, idx) {
  const wa = { ...(raw || {}) };

  wa.q = firstNonEmpty([wa.q, wa.questionNo, wa.questionNum, wa.number, wa.no], idx + 1);
  wa.selected = firstNonEmpty([wa.selected, wa.studentAnswer, wa.student_choice, wa.studentChoice], '미선택');
  wa.correct = firstNonEmpty([wa.correct, wa.correctAnswer, wa.answer, wa.rightAnswer], '');
  wa.type = firstNonEmpty([wa.type, wa.questionType, wa.problemType, wa.category], '유형 미상');
  wa.question = firstNonEmpty([wa.question, wa.questionText, wa.prompt, wa.stem, wa.problem], '문제 원문 정보 없음');
  wa.choices = Array.isArray(wa.choices) ? wa.choices : (Array.isArray(wa.options) ? wa.options : wa.choices);

  const extracted = extractExplanationFields(wa.explanation);
  wa.summary = firstNonEmpty([wa.summary, wa.oneLineSummary, extracted.summary], '');
  wa.fullInterpretation = firstNonEmpty([wa.fullInterpretation, wa.fullTranslation, extracted.fullInterpretation], '');
  wa.keywords = normalizeKeywords(firstNonEmpty([wa.keywords, extracted.keywords], null));
  wa.directionAnalysis = firstNonEmpty([wa.directionAnalysis, extracted.directionAnalysis], '');
  wa.optionAnalysis = firstNonEmpty([wa.optionAnalysis, extracted.optionAnalysis], '');
  wa.correctExplanation = firstNonEmpty([wa.correctExplanation, extracted.correctExplanation], '');
  wa.wrongExplanation = firstNonEmpty([wa.wrongExplanation, extracted.wrongExplanation], '');

  const analysis = normalizeStudentAnalysis(
    wa.studentAnalysis || {
      whyChosen: wa.whyChosen,
      errorPattern: wa.errorPattern || wa.mistakePattern,
      focusPoint: wa.focusPoint || wa.keyPoint,
    }
  );
  if (!analysis.whyChosen) {
    analysis.whyChosen = '선지 근거를 끝까지 비교하는 과정에서 확신이 부족했을 가능성이 있습니다.';
  }
  if (!analysis.errorPattern) {
    analysis.errorPattern = '핵심 조건 대비 근거 매칭이 충분하지 않은 패턴이 보입니다.';
  }
  if (!analysis.focusPoint) {
    analysis.focusPoint = '문제의 핵심 조건에 밑줄을 긋고, 각 선지가 조건을 충족하는지 1:1로 점검하세요.';
  }
  wa.studentAnalysis = analysis;
  wa.whyChosen = analysis.whyChosen;
  wa.mistakePattern = analysis.errorPattern;
  wa.focusPoint = analysis.focusPoint;

  if (wa.selected === null || wa.selected === undefined || String(wa.selected).trim() === '') {
    wa.selected = '미선택';
  }

  if (!wa.summary) {
    wa.summary = `${wa.type} 문항에서 정답 근거를 명확히 찾는 연습이 필요합니다.`;
  }
  if (!wa.correctExplanation) {
    wa.correctExplanation = `정답은 ${wa.correct}이며, 문제의 핵심 조건과 가장 일치합니다.`;
  }
  if (!wa.wrongExplanation) {
    wa.wrongExplanation = '선택한 답은 핵심 조건 일부만 반영했거나 지문 근거와 직접 대응하지 않습니다.';
  }

  if (!wa.explanation) {
    wa.explanation = buildExplanationObjectFromFields(wa);
  }
  wa.explanation = explanationToHtml(wa.explanation);
  if (!String(wa.explanation || '').trim()) {
    wa.explanation = explanationToHtml(buildExplanationObjectFromFields(wa));
  }

  return wa;
}

/**
 * weakAreas 문자열 배열 → 객체 배열
 */
function normalizeWeakAreas(areas) {
  if (!areas || !Array.isArray(areas) || areas.length === 0) return areas;
  if (typeof areas[0] === 'object' && areas[0].area) return areas;

  return areas.map(a => ({
    area: String(a),
    count: 1,
    severity: 'mid',
    note: '',
  }));
}

/**
 * 배열 → 쉼표 join 문자열
 */
function arrayToString(val) {
  if (Array.isArray(val)) return val.join(',');
  return val;
}

/**
 * correctRate 숫자 → 문자열 %
 */
function normalizeCorrectRate(rate) {
  if (typeof rate === 'number') return `${Math.round(rate)}%`;
  if (typeof rate === 'string' && rate && !rate.includes('%')) return `${rate}%`;
  return rate;
}

/**
 * 메인 정규화 함수
 */
function normalizeFeedbackData(data) {
  const d = JSON.parse(JSON.stringify(data || {})); // deep clone

  // summary 정규화
  if (!d.summary) d.summary = {};
  d.summary.goodPoints = arrayToString(d.summary.goodPoints || '');
  d.summary.badPoints = arrayToString(d.summary.badPoints || '');
  d.summary.priority = arrayToString(d.summary.priority || '');
  d.summary.correctRate = normalizeCorrectRate(d.summary.correctRate || '');
  if (d.summary.weakAreas) {
    d.summary.weakAreas = normalizeWeakAreas(d.summary.weakAreas);
  }

  // wrongAnswers 정규화
  if (!Array.isArray(d.wrongAnswers)) d.wrongAnswers = [];
  d.wrongAnswers = d.wrongAnswers.map((wa, idx) => normalizeWrongAnswerRow(wa, idx));

  return d;
}

module.exports = {
  normalizeFeedbackData,
  explanationToHtml,
  normalizeStudentAnalysis,
  normalizeWeakAreas,
  normalizeWrongAnswerRow,
};
