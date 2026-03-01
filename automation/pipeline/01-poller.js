'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');

const log = makeLogger('01-poller');

const IMAGE_EXTS = new Set(['.jpeg', '.jpg', '.png', '.webp']);

function loadState() {
  const statePath = path.join(config.STATE_DIR, 'feedback-state.json');
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return { processed: {} };
  }
}

function saveState(state) {
  const statePath = path.join(config.STATE_DIR, 'feedback-state.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

function scanStudentDir(studentName) {
  const inputDir = path.join(config.TUTORING_DIR, studentName, 'input');
  if (!fs.existsSync(inputDir)) return [];

  const results = [];
  const dateDirs = fs.readdirSync(inputDir);

  for (const dateDir of dateDirs) {
    const datePath = path.join(inputDir, dateDir);
    const stat = fs.statSync(datePath);
    if (!stat.isDirectory()) continue;

    const files = fs.readdirSync(datePath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;

      results.push({
        student: studentName,
        date: dateDir,
        filename: file,
        fullPath: path.join(datePath, file),
      });
    }
  }

  return results;
}

function getStudents(filterStudent) {
  if (filterStudent) return [filterStudent];
  if (!fs.existsSync(config.TUTORING_DIR)) return [];
  return fs.readdirSync(config.TUTORING_DIR).filter(name => {
    const stat = fs.statSync(path.join(config.TUTORING_DIR, name));
    return stat.isDirectory();
  });
}

function poll({ student, dryRun } = {}) {
  const state = loadState();
  const students = getStudents(student);
  const newImages = [];

  for (const s of students) {
    const images = scanStudentDir(s);
    for (const img of images) {
      const key = `${img.student}/${img.date}/${img.filename}`;
      if (state.processed[key]) {
        log.debug(`Already processed: ${key}`);
        continue;
      }
      newImages.push({ ...img, key });
    }
  }

  log.info(`Found ${newImages.length} new image(s) to process`);

  if (dryRun) {
    for (const img of newImages) {
      log.info(`[DRY-RUN] Would process: ${img.key}`);
    }
  }

  return newImages;
}

function markProcessed(imageKeys) {
  const state = loadState();
  for (const key of imageKeys) {
    state.processed[key] = { processedAt: new Date().toISOString() };
  }
  saveState(state);
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/01-poller.js [--student 이름] [--dry-run]

Options:
  --student 이름   특정 학생만 스캔
  --dry-run        처리하지 않고 출력만
  --help           도움말
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const studentIdx = args.indexOf('--student');
  const student = studentIdx !== -1 ? args[studentIdx + 1] : null;

  const images = poll({ student, dryRun });
  console.log(JSON.stringify(images, null, 2));
}

module.exports = { poll, markProcessed };
