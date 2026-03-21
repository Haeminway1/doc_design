#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function runStep(label, command, args) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function main() {
  runStep('Extract design assets', 'node', ['04_scripts/extract-design.js']);
  runStep('Extract reading books', 'node', ['04_scripts/extract-reading.js', 'all']);
  runStep('Extract grammar advanced', 'node', ['04_scripts/extract-grammar-advanced.js']);
  runStep('Extract grammar bridge ch01', 'node', ['04_scripts/extract-grammar-bridge-part1.js']);
  runStep('Extract grammar bridge ch02-ch09', 'node', ['04_scripts/extract-grammar-bridge.js', 'all']);
  runStep('Extract grammar bridge ch10-ch11', 'node', ['04_scripts/extract-grammar-bridge-part2.js']);
  runStep('Extract logic basic', 'node', ['04_scripts/extract-logic-basic.js']);
  runStep('Extract syntax bridge', 'node', ['04_scripts/extract-syntax-bridge.js']);
  runStep('Extract vocab basic', 'node', ['04_scripts/extract-vocab-basic.js']);

  const syntaxBasicPdf = path.join(ROOT, "Vera's Flavor 편입영어_ 구문독해 Basic.pdf");
  if (fs.existsSync(syntaxBasicPdf)) {
    runStep('Extract syntax basic', 'node', ['04_scripts/extract-syntax-basic.js']);
  } else {
    console.warn(`\n== Extract syntax basic ==`);
    console.warn(`Skipped: missing PDF ${syntaxBasicPdf}`);
  }

  // Migration step removed — manifests already migrated
  runStep('Validate textbook data', 'node', ['04_scripts/validate-textbook-data.js']);
}

main();
