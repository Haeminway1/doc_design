'use strict';

const fs = require('fs');
const path = require('path');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LEVEL_LABELS = { debug: 'DEBUG', info: 'INFO ', warn: 'WARN ', error: 'ERROR' };

let logFile = null;
let currentLevel = 'info';

function setLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = level;
}

function setLogFile(filePath) {
  logFile = filePath;
}

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function write(level, module, message, extra) {
  if (LEVELS[level] < LEVELS[currentLevel]) return;

  const label = LEVEL_LABELS[level] || level.toUpperCase();
  const mod = module ? `[${module}]` : '';
  const extraStr = extra !== undefined ? ' ' + JSON.stringify(extra) : '';
  const line = `[${formatTimestamp()}] [${label}] ${mod} ${message}${extraStr}`;

  console.log(line);

  if (logFile) {
    try {
      fs.appendFileSync(logFile, line + '\n', 'utf8');
    } catch (e) {
      // ignore log file write errors
    }
  }
}

function makeLogger(module) {
  return {
    debug: (msg, extra) => write('debug', module, msg, extra),
    info:  (msg, extra) => write('info',  module, msg, extra),
    warn:  (msg, extra) => write('warn',  module, msg, extra),
    error: (msg, extra) => write('error', module, msg, extra),
  };
}

module.exports = {
  makeLogger,
  setLevel,
  setLogFile,
  debug: (mod, msg, extra) => write('debug', mod, msg, extra),
  info:  (mod, msg, extra) => write('info',  mod, msg, extra),
  warn:  (mod, msg, extra) => write('warn',  mod, msg, extra),
  error: (mod, msg, extra) => write('error', mod, msg, extra),
};
