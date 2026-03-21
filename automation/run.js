'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const config = require('./config');
const { makeLogger } = require('./utils/logger');

const log = makeLogger('run');

// ─── Safety Gate ────────────────────────────────────────────────────────────

function confirmLive() {
  return new Promise((resolve) => {
    console.log('\n' + '='.repeat(60));
    console.log('  ⚠️   LIVE MODE 경고  ⚠️');
    console.log('='.repeat(60));
    console.log('  실제 카카오톡 메시지 전송 및 Google Drive 업로드가');
    console.log('  실행됩니다. 이 작업은 되돌릴 수 없습니다.');
    console.log('='.repeat(60));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n  계속하려면 "LIVE"를 입력하세요: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'LIVE');
    });
  });
}

// ─── State Helpers ───────────────────────────────────────────────────────────

function loadFeedbackState() {
  const p = path.join(config.STATE_DIR, 'feedback-state.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return { processed: {} }; }
}

function saveFeedbackState(state) {
  const p = path.join(config.STATE_DIR, 'feedback-state.json');
  fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf8');
}

function loadReplyState() {
  const p = path.join(config.STATE_DIR, 'reply-state.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return { lastRead: {} }; }
}

function saveReplyState(state) {
  const p = path.join(config.STATE_DIR, 'reply-state.json');
  fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf8');
}

// ─── Task: feedback ──────────────────────────────────────────────────────────

async function runFeedback(opts) {
  const { dryRun, student, date } = opts;

  const { poll } = require('./pipeline/01-poller');
  const { classify } = require('./pipeline/02-classifier');
  const { extract } = require('./pipeline/03-extractor');
  const { generateFeedback } = require('./pipeline/04-feedback-generator');
  const { render } = require('./pipeline/05-renderer');
  const { upload } = require('./pipeline/06-uploader');

  log.info(`[feedback] dryRun=${dryRun} student=${student || 'all'} date=${date || 'any'}`);

  // Step 1: Poll for new images
  const newImages = poll({ student, dryRun: false }); // always scan, dryRun controls downstream
  if (newImages.length === 0) {
    log.info('No new images to process.');
    return;
  }

  // Filter by date if specified
  const filtered = date ? newImages.filter(img => img.date === date) : newImages;
  log.info(`Processing ${filtered.length} image(s)`);

  // Step 2: Classify each image
  const feedbackWorthy = [];
  for (const img of filtered) {
    log.info(`Classifying: ${img.key}`);
    const classification = await classify(img.fullPath, { dryRun });
    log.info(`  -> ${classification.category} (confidence: ${classification.confidence})`);
    if (classification.passes) {
      feedbackWorthy.push({ ...img, classification });
    }
  }

  if (feedbackWorthy.length === 0) {
    log.info('No FEEDBACK_WORTHY images found.');
    return;
  }

  // Step 3: Group by student + date
  const groups = {};
  for (const img of feedbackWorthy) {
    const key = `${img.student}::${img.date}`;
    if (!groups[key]) groups[key] = { student: img.student, date: img.date, images: [] };
    groups[key].images.push(img);
  }

  const feedbackState = loadFeedbackState();

  for (const [groupKey, group] of Object.entries(groups)) {
    log.info(`Processing group: ${group.student} / ${group.date} (${group.images.length} images)`);

    // Step 3: Extract from each image, merge results
    const allProblems = [];
    const allUncertain = [];

    for (const img of group.images) {
      log.info(`  Extracting: ${img.filename}`);
      const extracted = await extract(img.fullPath, { dryRun });
      allProblems.push(...extracted.problems);
      allUncertain.push(...extracted.uncertain);
    }

    log.info(`  Extracted ${allProblems.length} problems, ${allUncertain.length} uncertain`);

    // Step 4: Generate feedback
    log.info(`  Generating feedback...`);
    const feedbackData = await generateFeedback(
      { problems: allProblems, uncertain: allUncertain },
      { dryRun }
    );

    // Step 5: Render HTML + PDF
    log.info(`  Rendering...`);
    const rendered = await render(feedbackData, group.student, group.date, { dryRun });
    log.info(`  HTML: ${rendered.htmlPath}`);
    if (rendered.pdfPath) log.info(`  PDF:  ${rendered.pdfPath}`);

    // Step 6: Upload PDF
    if (rendered.pdfPath && !dryRun) {
      log.info(`  Uploading to Drive...`);
      const uploadResult = await upload(rendered.pdfPath, group.student, { dryRun });
      log.info(`  Uploaded: ${JSON.stringify(uploadResult)}`);
    } else if (dryRun) {
      log.info(`  [DRY-RUN] Would upload ${rendered.pdfPath || 'PDF (not generated in dry-run)'}`);
    }

    // Update state
    if (!dryRun) {
      for (const img of group.images) {
        feedbackState.processed[img.key] = {
          processedAt: new Date().toISOString(),
          htmlPath: rendered.htmlPath,
          pdfPath: rendered.pdfPath,
        };
      }
      saveFeedbackState(feedbackState);
    }
  }

  log.info('[feedback] Done.');
}

// ─── Task: reply ─────────────────────────────────────────────────────────────

async function runReply(opts) {
  const { dryRun, student } = opts;

  const { classify } = require('./auto-reply/classifier');
  const { generateReply } = require('./auto-reply/vera-responder');
  const { send } = require('./auto-reply/sender');
  const kakaoClient = require('./utils/kakao-client');

  log.info(`[reply] dryRun=${dryRun} student=${student || 'all'}`);

  let messages;
  try {
    await kakaoClient.connect();
    if (student) {
      const raw = await kakaoClient.getChatMessages(student);
      messages = raw.map(m => ({ ...m, student }));
    } else {
      const students = await kakaoClient.getStudentList();
      messages = [];
      for (const s of students) {
        const raw = await kakaoClient.getChatMessages(s);
        messages.push(...raw.map(m => ({ ...m, student: s })));
      }
    }
  } catch (err) {
    log.error(`Kakao connection failed: ${err.message}`);
    log.warn('Reply task aborted (cannot connect to Kakao).');
    return;
  }

  const replyState = loadReplyState();

  for (const msg of messages) {
    const classification = classify(msg);
    log.info(`[${msg.student}] "${(msg.text || '').substring(0, 30)}" -> ${classification.category} (${classification.matchedRule})`);

    if (classification.category === 'ALWAYS_REPLY') {
      const reply = await generateReply(msg.text, msg.student, { matchedRule: classification.matchedRule });
      await send(msg.student, reply, { dryRun });
    } else if (classification.category === 'ASK_HAEMIN') {
      log.warn(`[ASK_HAEMIN] ${msg.student}: "${msg.text}" — 해민님께 에스컬레이션 필요`);
    } else {
      log.info(`[LOG_ONLY] ${msg.student}: logged, no reply sent`);
    }

    // Update last-read state
    if (!dryRun) {
      replyState.lastRead[msg.student] = { at: new Date().toISOString(), lastText: msg.text };
      saveReplyState(replyState);
    }
  }

  try { await kakaoClient.disconnect(); } catch {}
  log.info('[reply] Done.');
}

// ─── Task: report ─────────────────────────────────────────────────────────────

function runReport(opts) {
  const { date } = opts;
  const { generateReport } = require('./auto-reply/reporter');
  const report = generateReport(date);
  console.log('\n' + report);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Usage: node automation/run.js [options]

Options:
  --dry-run        기본값. 실제 전송/업로드 없이 시뮬레이션
  --live           실제 실행 (경고 후 확인 필요)
  --task           feedback | reply | report  (필수)
  --student 이름   특정 학생만 처리
  --date YYMMDD    특정 날짜만 처리

Tasks:
  feedback   새 이미지 감지 → 분류 → 추출 → 피드백 생성 → HTML/PDF → Drive 업로드
  reply      카카오톡 새 메시지 → 분류 → 베라쌤 응답 → 전송
  report     오늘의 자동화 요약 보고 생성

Examples:
  node automation/run.js --task feedback --dry-run
  node automation/run.js --task feedback --student 김예은 --dry-run
  node automation/run.js --task reply --dry-run
  node automation/run.js --task report
  node automation/run.js --task feedback --live   # ⚠️ 실제 실행
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const isLive = args.includes('--live');
  const dryRun = !isLive;

  const taskIdx = args.indexOf('--task');
  const task = taskIdx !== -1 ? args[taskIdx + 1] : null;

  const studentIdx = args.indexOf('--student');
  const student = studentIdx !== -1 ? args[studentIdx + 1] : null;

  const dateIdx = args.indexOf('--date');
  const date = dateIdx !== -1 ? args[dateIdx + 1] : null;

  if (!task || !['feedback', 'reply', 'report'].includes(task)) {
    console.error('Error: --task must be one of: feedback, reply, report');
    printHelp();
    process.exit(1);
  }

  if (isLive) {
    const confirmed = await confirmLive();
    if (!confirmed) {
      console.log('\n취소되었습니다. (--dry-run 모드로 다시 실행하세요)');
      process.exit(0);
    }
    console.log('\nLIVE 모드로 실행합니다...\n');
  } else {
    log.info('DRY-RUN 모드 (실제 전송/업로드 없음). --live 플래그로 실제 실행 가능.');
  }

  const opts = { dryRun, student, date };

  try {
    if (task === 'feedback') await runFeedback(opts);
    else if (task === 'reply') await runReply(opts);
    else if (task === 'report') runReport(opts);
  } catch (err) {
    log.error(`Task "${task}" failed: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();
