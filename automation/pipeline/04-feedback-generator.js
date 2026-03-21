'use strict';

const fs = require('fs');
const path = require('path');
const { makeLogger } = require('../utils/logger');

const log = makeLogger('04-feedback-generator');

const SYSTEM_PROMPT = `당신은 편입영어 전문 과외 선생님 베라쌤입니다.
학생이 틀린 문제를 분석하고 상세한 피드백을 작성합니다.

## 과목별 해설 형식

### 문법 / 구문독해
- 테마 단위로 묶어서 설명 (예: "4형식 vs 5형식", "관계대명사 vs 관계부사")
- 핵심 개념 → 판별법/비교표 → 예문 → 주의사항 순서
- concept-box, grammar-block, tip-box, warning-box 활용

### 독해 (지문별 5단계)
1. 한줄 요약: 지문 핵심 주제 1-2문장
2. 전체 해석 (Full Translation): 지문 전체 한국어 번역 (의역 중심)
3. 핵심 키워드: 핵심 표현 + 정답 방향(Positive) + 반대 방향(Negative)
4. 구조 및 방향성: POSITIVE/NEGATIVE 배지 + 구조 분석표
5. 선지 분석: 모든 선지 ✅/❌ (근거·해석·포인트)

### 학생 답 분석 (공통)
- 오답 선택 이유 추측
- 사고 오류 패턴 (반전 함정, 개념 혼동, 부분 정보 매칭 등)
- 집중 포인트 (유사 문제 전략)

## 출력 형식
완전한 JSON 구조로 출력하세요.`;

async function generateFeedback(data, { dryRun = false } = {}) {
  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch {
    throw new Error('@anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.warn('ANTHROPIC_API_KEY not set — returning mock feedback');
    return buildMockFeedback(data);
  }

  const client = new Anthropic.default({ apiKey });

  const problems = Array.isArray(data) ? data : (data.problems || []);
  log.info(`Generating feedback for ${problems.length} problem(s)`);

  const userPrompt = `다음 문제들에 대한 피드백을 생성해주세요:

${JSON.stringify(problems, null, 2)}

아래 JSON 구조로 완전하게 작성하세요:
{
  "meta": {
    "types": ["독해", "문법", "구문독해", "논리"] // 실제 포함된 유형만
  },
  "analysis": {
    "weakPoints": ["약점 목록"],
    "strongPoints": ["강점 목록"],
    "encouragement": "격려 메시지",
    "nextFocus": "다음 수업 집중 포인트"
  },
  "subjects": {
    "독해": {
      "problems": [
        {
          "number": "문제번호",
          "summary": "한줄 요약",
          "fullTranslation": "전체 해석",
          "keywords": {
            "core": ["핵심 표현"],
            "positive": ["정답 방향 표현"],
            "negative": ["반대 방향 표현"]
          },
          "structure": {
            "direction": "POSITIVE|NEGATIVE",
            "type": "비교-대조|원인-결과|시간순|문제-해결",
            "analysis": "구조 설명"
          },
          "choices": [
            { "number": 1, "correct": true, "reason": "근거", "translation": "해석", "point": "포인트" }
          ],
          "studentAnalysis": {
            "studentAnswer": "학생 선택",
            "whyChosen": "오답 선택 이유 추측",
            "errorPattern": "사고 오류 패턴",
            "focusPoint": "집중 포인트"
          }
        }
      ]
    },
    "문법": {
      "themes": [
        {
          "title": "테마명",
          "concept": "핵심 개념",
          "rules": ["규칙 1", "규칙 2"],
          "comparison": { "headers": ["구분", "A", "B"], "rows": [] },
          "examples": ["예문 1"],
          "warnings": ["주의사항"],
          "problems": [
            {
              "number": "문제번호",
              "explanation": "해설",
              "studentAnalysis": {
                "studentAnswer": "학생 선택",
                "whyChosen": "오답 선택 이유",
                "errorPattern": "사고 오류 패턴",
                "focusPoint": "집중 포인트"
              }
            }
          ]
        }
      ]
    },
    "구문독해": {
      "themes": []
    },
    "논리": {
      "themes": []
    }
  },
  "practiceProblems": {
    "문법": { "problems": [], "answers": [] },
    "구문독해": { "problems": [], "answers": [] },
    "논리": { "problems": [], "answers": [] }
  }
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    if (dryRun) {
      parsed._dryRun = true;
    }

    log.info('Feedback generated successfully');
    return parsed;
  } catch (err) {
    log.error(`Feedback generation failed: ${err.message}`);
    throw err;
  }
}

function buildMockFeedback(data) {
  return {
    _mock: true,
    meta: { types: ['문법'] },
    analysis: {
      weakPoints: ['API 키 미설정으로 인한 mock 응답'],
      strongPoints: [],
      encouragement: 'ANTHROPIC_API_KEY를 설정하면 실제 피드백이 생성됩니다.',
      nextFocus: '',
    },
    subjects: {},
    practiceProblems: {},
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/04-feedback-generator.js --data [json|path] [--dry-run]

Options:
  --data json|path   추출된 JSON 데이터 또는 JSON 파일 경로 (필수)
  --dry-run          dry-run 표시
  --help             도움말
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const dataIdx = args.indexOf('--data');
  const dataArg = dataIdx !== -1 ? args[dataIdx + 1] : null;

  if (!dataArg) {
    console.error('Error: --data is required');
    process.exit(1);
  }

  let data;
  try {
    if (dataArg.endsWith('.json') && fs.existsSync(dataArg)) {
      data = JSON.parse(fs.readFileSync(dataArg, 'utf8'));
    } else {
      data = JSON.parse(dataArg);
    }
  } catch (err) {
    console.error('Error: could not parse --data as JSON:', err.message);
    process.exit(1);
  }

  generateFeedback(data, { dryRun })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { generateFeedback };
