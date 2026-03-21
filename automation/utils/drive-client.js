'use strict';

const { execSync } = require('child_process');
const { makeLogger } = require('./logger');

const log = makeLogger('drive-client');

/**
 * Run a gog CLI command and return stdout as string.
 */
function gogRun(args) {
  const cmd = `gog drive ${args}`;
  log.debug(`Running: ${cmd}`);
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return output.trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : '';
    throw new Error(`gog command failed: ${cmd}\n${stderr || err.message}`);
  }
}

function parseDriveId(output) {
  try {
    const parsed = JSON.parse(output);
    return (
      parsed?.id ||
      parsed?.fileId ||
      parsed?.folderId ||
      parsed?.file?.id ||
      parsed?.folder?.id ||
      null
    );
  } catch (_) {
    return null;
  }
}

/**
 * List files/folders in a Drive folder.
 * Returns array of { id, name, mimeType }
 */
function listFolder(folderId) {
  try {
    const output = gogRun(`ls --json --parent="${folderId}"`);
    const parsed = JSON.parse(output);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.files)) return parsed.files;
    return [];
  } catch (err) {
    log.warn(`listFolder failed for ${folderId}: ${err.message}`);
    return [];
  }
}

/**
 * Upload a local file to a Drive folder.
 * Returns the uploaded file's Drive ID.
 */
function upload(filePath, parentId) {
  const output = gogRun(`upload "${filePath}" --parent="${parentId}" --json`);
  const id = parseDriveId(output);
  if (!id) {
    throw new Error(`upload 응답에서 파일 ID 추출 실패: ${output.slice(0, 200)}`);
  }
  return id;
}

/**
 * Create a folder inside a parent Drive folder.
 * Returns the new folder's Drive ID.
 */
function createFolder(name, parentId) {
  const output = gogRun(`mkdir "${name}" --parent="${parentId}" --json`);
  const id = parseDriveId(output);
  if (!id) {
    throw new Error(`mkdir 응답에서 폴더 ID 추출 실패: ${output.slice(0, 200)}`);
  }
  return id;
}

/**
 * Find a subfolder by one of several candidate names inside a parent.
 * Returns { id, name } if found, null otherwise.
 */
function findSubfolder(parentId, names) {
  const items = listFolder(parentId);
  const FOLDER_MIME = 'application/vnd.google-apps.folder';
  for (const item of items) {
    if (item.mimeType === FOLDER_MIME && names.includes(item.name)) {
      return { id: item.id, name: item.name };
    }
  }
  return null;
}

/**
 * Find or create a subfolder by name inside a parent.
 * Returns folder ID.
 */
function ensureSubfolder(parentId, name) {
  const found = findSubfolder(parentId, [name]);
  if (found) return found.id;
  log.info(`Creating subfolder "${name}" in ${parentId}`);
  return createFolder(name, parentId);
}

module.exports = { listFolder, upload, createFolder, findSubfolder, ensureSubfolder };
