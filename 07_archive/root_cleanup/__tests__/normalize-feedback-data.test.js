/**
 * normalize-feedback-data.test.js — TDD RED→GREEN
 *
 * Agent3가 생성하는 다양한 형식의 feedback-data.json을
 * generate-feedback-from-json.js가 기대하는 표준 형식으로 정규화
 */

const { normalizeFeedbackData } = require('../04_scripts/normalize-feedback-data');

describe('normalizeFeedbackData', () => {
  // ── explanation: object → HTML string ──
  describe('explanation 정규화', () => {
    test('객체 형식 explanation → 5단계 HTML 문자열로 변환', () => {
      const data = {
        student: '정재영', date: '260302', subject: '독해',
        textbook: 'reading/bridge', range: '75-1~74-3',
        summary: { totalQ: 15, wrongQ: 2, correctRate: '87%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: '76-2', selected: null, correct: 'B', type: '세부 내용 파악',
          question: 'What is a keystone species?',
          explanation: {
            step1_summary: '【한줄요약】 핵심종 정의',
            step2_interpretation: '【전체해석】 리와일딩은...',
            step3_keywords: {
              positive_direction: ['keystone — 핵심종'],
              negative_direction: ['NOT abundant — 아님'],
            },
            step4_structure: [
              { sentence: 'A core principle...', function: '핵심 개념 도입' },
            ],
            step5_choices: {
              answer: { choice: 'B', text: 'significant impact', reason: '정답 이유' },
              wrongChoices: [
                { choice: 'A', text: 'most abundant', reason: '오답 이유' },
              ],
            },
          },
        }],
      };

      const result = normalizeFeedbackData(data);
      const expl = result.wrongAnswers[0].explanation;

      // HTML 문자열이어야 함
      expect(typeof expl).toBe('string');
      // 5단계 내용 포함
      expect(expl).toContain('한줄 요약');
      expect(expl).toContain('핵심종 정의');
      expect(expl).toContain('keystone');
      expect(expl).toContain('핵심 개념 도입');
      expect(expl).toContain('significant impact');
      // CSS 클래스 사용
      expect(expl).toContain('concept-box');
      expect(expl).toContain('grammar-block');
      expect(expl).toContain('answer-box');
      expect(expl).toContain('warning-box');
    });

    test('이미 HTML 문자열인 explanation → 그대로 유지', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q',
          explanation: '<div class="concept-box">이미 HTML</div>',
        }],
      };

      const result = normalizeFeedbackData(data);
      expect(result.wrongAnswers[0].explanation).toBe('<div class="concept-box">이미 HTML</div>');
    });
  });

  // ── studentAnalysis: string → object ──
  describe('studentAnalysis 정규화', () => {
    test('문자열 studentAnalysis → {whyChosen, errorPattern, focusPoint} 객체로 변환', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
          studentAnalysis: '학생이 정의 문장을 찾지 못했다. paraphrase 인식 부족.',
        }],
      };

      const result = normalizeFeedbackData(data);
      const sa = result.wrongAnswers[0].studentAnalysis;
      expect(typeof sa).toBe('object');
      expect(sa.whyChosen).toBeTruthy();
      expect(typeof sa.whyChosen).toBe('string');
    });

    test('이미 객체인 studentAnalysis → 그대로 유지', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
          studentAnalysis: { whyChosen: 'a', errorPattern: 'b', focusPoint: 'c' },
        }],
      };

      const result = normalizeFeedbackData(data);
      expect(result.wrongAnswers[0].studentAnalysis).toEqual({ whyChosen: 'a', errorPattern: 'b', focusPoint: 'c' });
    });
  });

  // ── weakAreas: string[] → object[] ──
  describe('weakAreas 정규화', () => {
    test('문자열 배열 → 객체 배열로 변환', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: {
          totalQ: 5, wrongQ: 1, correctRate: '80%',
          goodPoints: 'g', badPoints: 'b', priority: 'p',
          weakAreas: ['세부 내용 파악', '핵심어 paraphrase'],
        },
        wrongAnswers: [],
      };

      const result = normalizeFeedbackData(data);
      const wa = result.summary.weakAreas;
      expect(wa[0]).toEqual(expect.objectContaining({
        area: '세부 내용 파악',
        count: expect.any(Number),
        severity: expect.any(String),
        note: expect.any(String),
      }));
    });
  });

  // ── goodPoints/badPoints/priority: array → string ──
  describe('summary 필드 정규화', () => {
    test('배열 → 문자열로 join', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: {
          totalQ: 5, wrongQ: 1, correctRate: 86.7,
          goodPoints: ['잘한점1', '잘한점2'],
          badPoints: ['아쉬운점1', '아쉬운점2'],
          priority: ['우선1', '우선2'],
        },
        wrongAnswers: [],
      };

      const result = normalizeFeedbackData(data);
      expect(typeof result.summary.goodPoints).toBe('string');
      expect(result.summary.goodPoints).toContain('잘한점1');
      expect(typeof result.summary.badPoints).toBe('string');
      expect(typeof result.summary.priority).toBe('string');
    });

    test('correctRate 숫자 → 문자열 %', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: {
          totalQ: 15, wrongQ: 2, correctRate: 86.7,
          goodPoints: 'g', badPoints: 'b', priority: 'p',
        },
        wrongAnswers: [],
      };

      const result = normalizeFeedbackData(data);
      expect(result.summary.correctRate).toBe('87%');
    });
  });

  // ── answer-label / warning-label 가독성 ──
  describe('answer-box / warning-box 라벨', () => {
    test('answer-box에 answer-label 클래스 포함', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q',
          explanation: {
            step5_choices: {
              answer: { choice: 'B', text: 'correct text', reason: 'reason' },
              wrongChoices: [{ choice: 'A', text: 'wrong text', reason: 'wrong reason' }],
            },
          },
        }],
      };

      const result = normalizeFeedbackData(data);
      const expl = result.wrongAnswers[0].explanation;
      expect(expl).toContain('answer-label');
      expect(expl).toContain('정답 B');
      expect(expl).toContain('오답 A');
    });
  });

  // ── studentAnalysis 문장 분배 ──
  describe('studentAnalysis 문장 분배', () => {
    test('3문장 이상 → 3필드 분배', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
          studentAnalysis: '학생이 부분 정보만 매칭했다. 반전 함정에 빠졌다. 선지 전체를 꼼꼼히 읽어야 한다.',
        }],
      };

      const result = normalizeFeedbackData(data);
      const sa = result.wrongAnswers[0].studentAnalysis;
      expect(sa.whyChosen).toBe('학생이 부분 정보만 매칭했다.');
      expect(sa.errorPattern).toBe('반전 함정에 빠졌다.');
      expect(sa.focusPoint).toContain('선지 전체를');
    });

    test('2문장 → whyChosen + errorPattern', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
          studentAnalysis: '핵심어를 놓쳤다. paraphrase 인식 부족이다.',
        }],
      };

      const result = normalizeFeedbackData(data);
      const sa = result.wrongAnswers[0].studentAnalysis;
      expect(sa.whyChosen).toBe('핵심어를 놓쳤다.');
      expect(sa.errorPattern).toBe('paraphrase 인식 부족이다.');
      expect(sa.focusPoint).toBe('');
    });

    test('1문장 → whyChosen에만', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: '③', correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
          studentAnalysis: '단순 실수',
        }],
      };

      const result = normalizeFeedbackData(data);
      const sa = result.wrongAnswers[0].studentAnalysis;
      expect(sa.whyChosen).toBe('단순 실수');
      expect(sa.errorPattern).toBe('');
      expect(sa.focusPoint).toBe('');
    });
  });

  // ── selected: null → '미선택' ──
  describe('selected 정규화', () => {
    test('null → "미선택"', () => {
      const data = {
        student: 'test', date: '260301', subject: '독해',
        textbook: 't', range: '1~5',
        summary: { totalQ: 5, wrongQ: 1, correctRate: '80%', goodPoints: 'g', badPoints: 'b', priority: 'p' },
        wrongAnswers: [{
          q: 1, selected: null, correct: '②', type: 't',
          question: 'q', explanation: '<p>html</p>',
        }],
      };

      const result = normalizeFeedbackData(data);
      expect(result.wrongAnswers[0].selected).toBe('미선택');
    });
  });
});
