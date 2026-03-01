'use strict';

const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');
const { classifyImage } = require('../utils/vision');

const log = makeLogger('02-classifier');

async function classify(imagePath, { dryRun = false } = {}) {
  if (!imagePath) throw new Error('--image path is required');

  log.info(`Classifying: ${imagePath}`);

  let result;
  try {
    result = await classifyImage(imagePath, 'anthropic');
  } catch (err) {
    log.error(`Classification failed: ${err.message}`);
    result = { category: 'OTHER', confidence: 0, questionType: null, error: err.message };
  }

  if (dryRun) {
    result._dryRun = true;
  }

  const passes = result.category === 'FEEDBACK_WORTHY'
    && result.confidence >= config.EXTRACTION_CONFIDENCE_THRESHOLD;

  return { ...result, passes };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/02-classifier.js --image [path] [--dry-run]

Options:
  --image path   분류할 이미지 경로 (필수)
  --dry-run      분류하되 dry-run 표시
  --help         도움말
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const imgIdx = args.indexOf('--image');
  const imagePath = imgIdx !== -1 ? args[imgIdx + 1] : null;

  if (!imagePath) {
    console.error('Error: --image path is required');
    process.exit(1);
  }

  classify(imagePath, { dryRun })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { classify };
