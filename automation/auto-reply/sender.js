'use strict';

const readline = require('readline');
const { makeLogger } = require('../utils/logger');
const kakaoClient = require('../utils/kakao-client');

const log = makeLogger('sender');

/**
 * Prompt user for confirmation (live mode safety gate).
 */
function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Send a message to a student.
 * @param {string} studentName
 * @param {string} text
 * @param {object} options
 * @returns {Promise<{ sent: boolean, dryRun: boolean }>}
 */
async function send(studentName, text, { dryRun = true } = {}) {
  if (!studentName || !text) {
    throw new Error('studentName and text are required');
  }

  if (dryRun) {
    log.info(`[DRY-RUN] Would send to ${studentName}:`);
    log.info(`[DRY-RUN] "${text}"`);
    return { sent: false, dryRun: true, studentName, text };
  }

  log.warn(`LIVE MODE: About to send message to ${studentName}`);
  log.warn(`Message: "${text}"`);

  await kakaoClient.sendMessage(studentName, text);
  log.info(`Message sent to ${studentName}`);

  return { sent: true, dryRun: false, studentName, text };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/auto-reply/sender.js --student 이름 --message "텍스트" [--live]

Options:
  --student 이름    학생 이름 (필수)
  --message 텍스트  전송할 메시지 (필수)
  --live            실제 전송 (기본: dry-run)
  --help            도움말

⚠️  --live 없이는 실제 메시지가 전송되지 않습니다.
`);
    process.exit(0);
  }

  const isLive = args.includes('--live');
  const dryRun = !isLive;

  const studentIdx = args.indexOf('--student');
  const studentName = studentIdx !== -1 ? args[studentIdx + 1] : null;

  const msgIdx = args.indexOf('--message');
  const text = msgIdx !== -1 ? args[msgIdx + 1] : null;

  if (!studentName || !text) {
    console.error('Error: --student and --message are required');
    process.exit(1);
  }

  (async () => {
    if (isLive) {
      console.log('\n⚠️  경고: LIVE 모드로 실제 카카오톡 메시지가 전송됩니다!');
      console.log(`   학생: ${studentName}`);
      console.log(`   메시지: "${text}"`);
      const answer = await confirm('\n계속하시겠습니까? (yes/no): ');
      if (answer !== 'yes' && answer !== 'y') {
        console.log('취소되었습니다.');
        process.exit(0);
      }
    }

    const result = await send(studentName, text, { dryRun });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })().catch(err => {
    log.error(err.message);
    process.exit(1);
  });
}

module.exports = { send };
