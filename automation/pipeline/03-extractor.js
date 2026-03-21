'use strict';

const path = require('path');
const config = require('../config');
const { makeLogger } = require('../utils/logger');
const { extractProblems } = require('../utils/vision');

const log = makeLogger('03-extractor');

async function extract(imagePath, { dryRun = false } = {}) {
  if (!imagePath) throw new Error('--image path is required');

  log.info(`Extracting problems from: ${imagePath}`);

  // Stage 1: rough scan
  let rawResult;
  try {
    rawResult = await extractProblems(imagePath, 'openai');
  } catch (err) {
    log.warn(`OpenAI extraction failed, trying Anthropic: ${err.message}`);
    try {
      rawResult = await extractProblems(imagePath, 'anthropic');
    } catch (err2) {
      log.error(`All extraction attempts failed: ${err2.message}`);
      return {
        problems: [],
        uncertain: [],
        metadata: { totalExtracted: 0, filtered: 0, flagged: 0, error: err2.message },
      };
    }
  }

  const threshold = config.EXTRACTION_CONFIDENCE_THRESHOLD;

  // Stage 2: confidence filter
  const confident = [];
  const uncertain = [...(rawResult.uncertain || [])];

  for (const problem of (rawResult.problems || [])) {
    if ((problem.confidence || 0) >= threshold) {
      confident.push(problem);
    } else {
      uncertain.push({ number: problem.number, reason: `Low confidence: ${problem.confidence}`, original: problem });
    }
  }

  // Stage 3: flag uncertain items
  const flagged = uncertain.map(u => ({
    ...u,
    needsHumanReview: true,
    flaggedAt: new Date().toISOString(),
  }));

  const metadata = {
    totalExtracted: (rawResult.problems || []).length,
    filtered: confident.length,
    flagged: flagged.length,
    dryRun: dryRun || undefined,
  };

  log.info(`Extracted: ${metadata.totalExtracted} total, ${metadata.filtered} confident, ${metadata.flagged} flagged`);

  return { problems: confident, uncertain: flagged, metadata };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node automation/pipeline/03-extractor.js --image [path] [--dry-run]

Options:
  --image path   추출할 이미지 경로 (필수)
  --dry-run      표시만 하고 저장하지 않음
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

  extract(imagePath, { dryRun })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log.error(err.message);
      process.exit(1);
    });
}

module.exports = { extract };
