'use strict';

const { makeLogger } = require('../utils/logger');

const log = makeLogger('vera-responder');

const VERA_SYSTEM_PROMPT = `당신은 편입영어 과외 선생님 베라쌤입니다.
학생들과 카카오톡으로 소통하는 따뜻하고 친근한 선생님입니다.

## 말투 규칙 (엄격히 준수)
### 절대 금지 표현:
- ":" ";" "—" "–" 기호 사용 금지
- "①②③" 같은 원문자 금지
- "물론입니다" "정답입니다" "말씀하신" 금지
- 딱딱하거나 격식체 표현 금지
- 긴 설명 금지 (메시지는 짧고 간결하게)

### 반드시 사용:
- "^^" "ㅎㅎ" "~" "!" 자주 사용
- 이모지 적극 사용 (💕 ✨ 🔥 👍 🙌 😊 ❤️)
- 문장 최대 3줄 이하
- 칭찬과 격려 중심
- 자연스러운 구어체

## 응답 유형별 가이드
- 인사: 밝고 따뜻하게 인사, 공부 응원
- 완료: 칭찬 + 구체적 격려
- 단어질문: 간결하게 뜻 설명 + 예시
- 문법확인: 맞으면 칭찬, 틀리면 부드럽게 교정
- 업로드: 확인했다고 + 검토하겠다고

## 중요
- 한 번의 응답은 카카오톡 메시지 1-3개 분량
- 학생 이름은 "-야" "-아" 로 부름 (예: "예은아")
- 절대 "저는" "제가" 쓰지 말고 자연스럽게`;

/**
 * Generate a 베라쌤 style reply.
 * @param {string} message - Student's message
 * @param {string} studentName - Student's name
 * @param {object} context - Additional context (optional)
 * @returns {Promise<string>}
 */
async function generateReply(message, studentName, context = {}) {
  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch {
    throw new Error('@anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.warn('ANTHROPIC_API_KEY not set — returning fallback reply');
    return getFallbackReply(message, studentName);
  }

  const client = new Anthropic.default({ apiKey });

  // Build name form (애-야/아 ending)
  const nameCall = studentName ? formatNameCall(studentName) : '학생';

  const userPrompt = `학생 이름: ${studentName} (${nameCall}라고 불러주세요)
학생 메시지: "${message}"
${context.matchedRule ? `메시지 유형: ${context.matchedRule}` : ''}

베라쌤 스타일로 짧고 따뜻하게 답장해주세요. 문장 최대 3줄.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 256,
      system: VERA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const reply = response.content[0].text.trim();
    log.info(`Reply generated for ${studentName}: ${reply.substring(0, 40)}...`);
    return reply;
  } catch (err) {
    log.error(`Reply generation failed: ${err.message}`);
    return getFallbackReply(message, studentName);
  }
}

function formatNameCall(name) {
  // Simple heuristic: if last character has batchim (받침), use -아; else use -야
  const lastChar = name[name.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const hasBatchim = (code - 0xAC00) % 28 !== 0;
    return name + (hasBatchim ? '아' : '야');
  }
  return name;
}

function getFallbackReply(message, studentName) {
  const nameCall = formatNameCall(studentName);
  return `${nameCall}~ 메시지 잘 받았어요! ✨ 잠시 후 답장할게요 ^^`;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/auto-reply/vera-responder.js --message "텍스트" --student 이름

Options:
  --message 텍스트   학생 메시지 (필수)
  --student 이름     학생 이름 (필수)
  --help             도움말
`);
    process.exit(0);
  }

  const msgIdx = args.indexOf('--message');
  const message = msgIdx !== -1 ? args[msgIdx + 1] : '';

  const studentIdx = args.indexOf('--student');
  const studentName = studentIdx !== -1 ? args[studentIdx + 1] : '학생';

  generateReply(message, studentName)
    .then(reply => {
      console.log(reply);
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { generateReply };
