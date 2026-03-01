'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');

const log = makeLogger('reporter');

/**
 * Generate a daily summary report in Discord markdown format.
 * @param {string} date - YYMMDD format (default: today)
 * @returns {string} Discord-formatted report
 */
function generateReport(date) {
  const dateStr = date || getTodayStr();
  const formattedDate = `20${dateStr.slice(0,2)}.${dateStr.slice(2,4)}.${dateStr.slice(4,6)}`;

  // Load states
  const feedbackState = loadJson(path.join(config.STATE_DIR, 'feedback-state.json')) || { processed: {} };
  const replyState = loadJson(path.join(config.STATE_DIR, 'reply-state.json')) || { lastRead: {} };

  // Find today's processed feedback items
  const todayFeedbacks = [];
  for (const [key, val] of Object.entries(feedbackState.processed || {})) {
    if (val.processedAt && val.processedAt.startsWith(`20${dateStr.slice(0,2)}-${dateStr.slice(2,4)}-${dateStr.slice(4,6)}`)) {
      todayFeedbacks.push(key);
    }
  }

  // Scan for output files generated today
  const generatedFiles = scanGeneratedFiles(dateStr);

  // Build report
  const lines = [
    `## 📊 베라쌤 자동화 일일 보고 — ${formattedDate}`,
    '',
    '### 🤖 자동응답 내역',
    todayFeedbacks.length > 0
      ? todayFeedbacks.map(k => `- ✅ ${k}`).join('\n')
      : '- 오늘 자동응답 내역 없음',
    '',
    '### 📄 생성된 피드백지',
    generatedFiles.length > 0
      ? generatedFiles.map(f => `- 📝 ${f}`).join('\n')
      : '- 오늘 생성된 피드백지 없음',
    '',
    '### ⚠️ 에스컬레이션 필요',
    '- (일정 변경, 결석, 어려움 호소 등 해민님 확인 필요 항목)',
    '',
    '### 📌 미처리 항목',
    '- (처리되지 않은 사진, 미확인 메시지 등)',
    '',
    `*자동 생성: ${new Date().toISOString()}*`,
  ];

  return lines.join('\n');
}

function getTodayStr() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function scanGeneratedFiles(dateStr) {
  const results = [];
  const tutoringDir = config.TUTORING_DIR;

  if (!fs.existsSync(tutoringDir)) return results;

  const students = fs.readdirSync(tutoringDir);
  for (const student of students) {
    const outputDir = path.join(tutoringDir, student, 'output', dateStr);
    if (!fs.existsSync(outputDir)) continue;

    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      if (file.endsWith('.pdf') || file.endsWith('.html')) {
        results.push(`${student}/${dateStr}/${file}`);
      }
    }
  }

  return results;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/auto-reply/reporter.js [--date YYMMDD]

Options:
  --date YYMMDD   날짜 (기본: 오늘)
  --help          도움말
`);
    process.exit(0);
  }

  const dateIdx = args.indexOf('--date');
  const date = dateIdx !== -1 ? args[dateIdx + 1] : null;

  const report = generateReport(date);
  console.log(report);
}

module.exports = { generateReport };
