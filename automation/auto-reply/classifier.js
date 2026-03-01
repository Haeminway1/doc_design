'use strict';

const { makeLogger } = require('../utils/logger');

const log = makeLogger('reply-classifier');

const RULES = {
  ALWAYS_REPLY: [
    { name: '인사', pattern: /안녕|굿모닝|잘\s*자|안녕히|좋은\s*(아침|저녁|하루)/ },
    { name: '완료', pattern: /끝났|다\s*했|완료|오늘\s*공부/ },
    { name: '업로드', pattern: /사진\s*올|이미지\s*올|올렸/ },
    { name: '단어', pattern: /뭐예요|뜻이|무슨\s*뜻/ },
    { name: '문법확인', pattern: /맞아요|이렇게\s*쓰면|맞는\s*표현/ },
  ],
  ASK_HAEMIN: [
    { name: '일정', pattern: /못\s*할|빠질|결석|안\s*될|날짜\s*변경|시간\s*변경/ },
    { name: '어려움', pattern: /너무\s*어렵|못\s*하겠|포기|따라가기\s*힘/ },
    { name: '교재', pattern: /교재\s*바꿔|방향\s*변경|다른\s*교재/ },
    { name: '비용', pattern: /수강료|환불|비용|결제/ },
  ],
  LOG_ONLY: [
    { name: '단순확인', pattern: /^(ㅇㅋ|넵|네|ㅇ|ㅎ|ㄱㄱ|ok|ㅇㅇ)$/i },
  ],
};

/**
 * Classify a message.
 * @param {object} message - { text: string, isImage: boolean }
 * @returns {{ category: string, matchedRule: string|null, confidence: number }}
 */
function classify(message) {
  const text = (message.text || '').trim();
  const isImage = message.isImage || false;

  // Image-only message (no text)
  if (isImage && !text) {
    return { category: 'LOG_ONLY', matchedRule: '사진만', confidence: 1.0 };
  }

  // Check ALWAYS_REPLY rules first
  for (const rule of RULES.ALWAYS_REPLY) {
    if (rule.pattern.test(text)) {
      return { category: 'ALWAYS_REPLY', matchedRule: rule.name, confidence: 0.9 };
    }
  }

  // Check ASK_HAEMIN rules
  for (const rule of RULES.ASK_HAEMIN) {
    if (rule.pattern.test(text)) {
      return { category: 'ASK_HAEMIN', matchedRule: rule.name, confidence: 0.85 };
    }
  }

  // Check LOG_ONLY rules
  for (const rule of RULES.LOG_ONLY) {
    if (rule.pattern.test(text)) {
      return { category: 'LOG_ONLY', matchedRule: rule.name, confidence: 1.0 };
    }
  }

  // Default: log only for unclassified
  return { category: 'LOG_ONLY', matchedRule: '미분류', confidence: 0.5 };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/auto-reply/classifier.js [--text "메시지"] [--image]

Options:
  --text 메시지   분류할 텍스트
  --image         이미지 포함 여부
  --help          도움말
`);
    process.exit(0);
  }

  const textIdx = args.indexOf('--text');
  const text = textIdx !== -1 ? args[textIdx + 1] : '';
  const isImage = args.includes('--image');

  const result = classify({ text, isImage });
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { classify };
