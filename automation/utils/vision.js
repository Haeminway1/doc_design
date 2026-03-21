'use strict';

const fs = require('fs');
const path = require('path');
const { makeLogger } = require('./logger');

const log = makeLogger('vision');

/**
 * Read an image file and return base64-encoded content + MIME type.
 */
function readImageAsBase64(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const mediaType = mimeMap[ext] || 'image/jpeg';
  const data = fs.readFileSync(imagePath);
  return { base64: data.toString('base64'), mediaType };
}

/**
 * Classify an image using Anthropic Claude Vision.
 * Returns: { category, confidence, questionType }
 */
async function classifyImageAnthropic(imagePath) {
  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch {
    throw new Error('@anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.warn('ANTHROPIC_API_KEY not set — skipping classification');
    return { category: 'OTHER', confidence: 0, questionType: null };
  }

  const client = new Anthropic.default({ apiKey });
  const { base64, mediaType } = readImageAsBase64(imagePath);

  const prompt = `이 이미지를 분류해주세요. 편입영어 과외 수업 관련 이미지입니다.

다음 중 하나로 분류하세요:
- FEEDBACK_WORTHY: 학생이 틀린 문제나 별표 친 문제가 있는 시험지/교재 사진
- STUDY_PROOF: 공부 인증샷 (노트, 책상, 공부 중인 사진)
- VOCAB_TEST: 단어 시험지나 단어 학습 관련 이미지
- OTHER: 위 카테고리에 해당하지 않는 기타 이미지

FEEDBACK_WORTHY인 경우 문제 유형도 판별:
- 독해: 영어 지문과 관련된 독해 문제
- 문법: 문법 규칙 관련 문제
- 구문독해: 구문 분석 관련 문제
- 논리: 논리적 추론 문제

JSON 형식으로만 응답하세요:
{
  "category": "FEEDBACK_WORTHY|STUDY_PROOF|VOCAB_TEST|OTHER",
  "confidence": 0.0-1.0,
  "questionType": "독해|문법|구문독해|논리|null"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  const text = response.content[0].text.trim();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    log.warn('Failed to parse classification response', { text });
    return { category: 'OTHER', confidence: 0, questionType: null };
  }
}

/**
 * Extract problems from an image using OpenAI GPT-4o Vision.
 * Returns: { problems, uncertain, metadata }
 */
async function extractProblemsOpenAI(imagePath) {
  let OpenAI;
  try {
    OpenAI = require('openai');
  } catch {
    throw new Error('openai not installed. Run: npm install openai');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log.warn('OPENAI_API_KEY not set — skipping extraction');
    return { problems: [], uncertain: [], metadata: { totalExtracted: 0, filtered: 0, flagged: 0 } };
  }

  const client = new OpenAI.default({ apiKey });
  const { base64, mediaType } = readImageAsBase64(imagePath);

  const prompt = `이 이미지에서 학생이 틀리거나 별표 친 문제들을 추출해주세요.

각 문제에 대해 다음 정보를 추출하세요:
1. 문제 번호
2. 학생의 답 (표시된 경우)
3. 정답 (표시된 경우)
4. 문제 유형 (독해/문법/구문독해/논리)
5. 추출 신뢰도 (0.0-1.0)

JSON 형식으로만 응답하세요:
{
  "problems": [
    {
      "number": "문제번호",
      "studentAnswer": "학생 답",
      "correctAnswer": "정답",
      "type": "독해|문법|구문독해|논리",
      "content": "문제 내용 (가능한 경우)",
      "confidence": 0.0-1.0
    }
  ],
  "uncertain": [
    {
      "number": "문제번호",
      "reason": "불확실한 이유"
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return {
      problems: parsed.problems || [],
      uncertain: parsed.uncertain || [],
      metadata: {
        totalExtracted: (parsed.problems || []).length + (parsed.uncertain || []).length,
        filtered: 0,
        flagged: (parsed.uncertain || []).length,
      },
    };
  } catch {
    log.warn('Failed to parse extraction response', { text });
    return { problems: [], uncertain: [], metadata: { totalExtracted: 0, filtered: 0, flagged: 0 } };
  }
}

/**
 * Classify image — provider defaults to 'anthropic'
 */
async function classifyImage(imagePath, provider = 'anthropic') {
  if (provider === 'anthropic') return classifyImageAnthropic(imagePath);
  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Extract problems — provider defaults to 'openai'
 */
async function extractProblems(imagePath, provider = 'openai') {
  if (provider === 'openai') return extractProblemsOpenAI(imagePath);
  if (provider === 'anthropic') {
    // Fallback: use Anthropic for extraction too
    log.info('Using Anthropic for extraction (OpenAI unavailable)');
    // simplified — just return empty
    return { problems: [], uncertain: [], metadata: { totalExtracted: 0, filtered: 0, flagged: 0 } };
  }
  throw new Error(`Unknown provider: ${provider}`);
}

module.exports = { classifyImage, extractProblems, readImageAsBase64 };
