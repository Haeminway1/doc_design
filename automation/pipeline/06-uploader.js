'use strict';

const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');
const driveClient = require('../utils/drive-client');

const log = makeLogger('06-uploader');

async function upload(filePath, studentName, { dryRun = false } = {}) {
  const folderId = config.STUDENT_DRIVE_FOLDERS[studentName];
  if (!folderId) {
    throw new Error(`No drive folder configured for student: ${studentName}`);
  }

  log.info(`Uploading ${path.basename(filePath)} for ${studentName}`);
  log.info(`Student drive folder: ${folderId}`);

  // Find 피드백자료 subfolder
  let subfolder = driveClient.findSubfolder(folderId, config.FEEDBACK_SUBFOLDER_NAMES);

  if (dryRun) {
    log.info(`[DRY-RUN] Would ${subfolder ? 'upload to' : 'create 피드백자료 and upload to'} folder: ${folderId}`);
    log.info(`[DRY-RUN] File: ${filePath}`);
    return { dryRun: true, folderId, subfolder: subfolder || null };
  }

  // Create subfolder if not found
  if (!subfolder) {
    log.info('Creating 피드백자료 subfolder...');
    const newId = driveClient.createFolder('피드백자료', folderId);
    subfolder = { id: newId, name: '피드백자료' };
  }

  log.info(`Uploading to subfolder: ${subfolder.name} (${subfolder.id})`);
  const uploadedId = driveClient.upload(filePath, subfolder.id);
  log.info(`Uploaded successfully. Drive ID: ${uploadedId}`);

  return {
    uploadedId,
    subfolderId: subfolder.id,
    subfolderName: subfolder.name,
    filePath,
    studentName,
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/06-uploader.js --file [path] --student [이름] [--dry-run]

Options:
  --file path      업로드할 파일 경로 (필수)
  --student 이름   학생 이름 (필수)
  --dry-run        업로드하지 않고 출력만
  --help           도움말
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');

  const fileIdx = args.indexOf('--file');
  const filePath = fileIdx !== -1 ? args[fileIdx + 1] : null;

  const studentIdx = args.indexOf('--student');
  const studentName = studentIdx !== -1 ? args[studentIdx + 1] : null;

  if (!filePath || !studentName) {
    console.error('Error: --file and --student are required');
    process.exit(1);
  }

  upload(filePath, studentName, { dryRun })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { upload };
