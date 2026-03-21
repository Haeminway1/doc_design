#!/usr/bin/env node
/**
 * render.js — 피드백지 렌더링 엔진 v1.0
 * Usage: node template-library/render.js --data <json> --template <reading|grammar|logic|syntax> --out <output.html> [--preview]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Dependency check — graceful error if handlebars not installed
// ---------------------------------------------------------------------------
let Handlebars;
try {
  Handlebars = require('handlebars');
} catch (e) {
  console.error('[render.js] Handlebars is not installed.');
  console.error('Run: npm install handlebars');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const LIB_DIR       = path.resolve(__dirname);
const TEMPLATES_DIR = path.join(LIB_DIR, 'templates');
const PARTIALS_DIR  = path.join(LIB_DIR, 'partials');
const STYLES_PATH   = path.join(LIB_DIR, 'styles', 'feedback-core.css');
const SCHEMA_PATH   = path.join(LIB_DIR, 'schema.json');

// ---------------------------------------------------------------------------
// Category → template name mapping
// ---------------------------------------------------------------------------
const CATEGORY_TEMPLATE_MAP = {
  '독해':    'feedback-reading',
  '문법':    'feedback-grammar',
  '구문독해': 'feedback-syntax',
  '논리':    'feedback-logic',
  reading:  'feedback-reading',
  grammar:  'feedback-grammar',
  syntax:   'feedback-syntax',
  logic:    'feedback-logic',
};

// ---------------------------------------------------------------------------
// CLI argument parser
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--preview') { args.preview = true; continue; }
    if (arg === '--help' || arg === '-h') { args.help = true; continue; }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      args[key] = argv[i + 1] || '';
      i++;
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------
function printUsage() {
  console.log(`
피드백지 렌더링 엔진 v1.0

Usage:
  node template-library/render.js \\
    --data <path/to/data.json> \\
    --template <reading|grammar|logic|syntax> \\
    --out <path/to/output.html> \\
    [--preview]

Options:
  --data      입력 JSON 파일 경로 (필수)
  --out       출력 HTML 파일 경로 (필수)
  --template  템플릿 유형: reading | grammar | logic | syntax
              (생략 시 meta.types[0]에서 자동 감지)
  --preview   출력 후 기본 브라우저에서 열기
  --help      도움말 표시

Examples:
  node template-library/render.js --data data.json --out output.html
  node template-library/render.js --data data.json --template grammar --out 피드백지.html --preview
`);
}

// ---------------------------------------------------------------------------
// Simple JSON Schema validator (subset — required fields only)
// ---------------------------------------------------------------------------
function validateData(data, schema) {
  const errors = [];

  function checkRequired(obj, schemaDef, path) {
    if (!schemaDef || !schemaDef.required) return;
    for (const key of schemaDef.required) {
      if (obj[key] === undefined || obj[key] === null) {
        errors.push(`Missing required field: ${path}.${key}`);
      }
    }
    // Recurse into object properties
    if (schemaDef.properties) {
      for (const [k, v] of Object.entries(schemaDef.properties)) {
        if (obj[k] !== undefined && v.type === 'object') {
          checkRequired(obj[k], v, `${path}.${k}`);
        }
      }
    }
  }

  checkRequired(data, schema, 'root');
  return errors;
}

// ---------------------------------------------------------------------------
// Register Handlebars helpers
// ---------------------------------------------------------------------------
function registerHelpers() {
  // Equality check
  Handlebars.registerHelper('eq', (a, b) => a === b);

  // Index + 1 for 1-based choice numbering
  Handlebars.registerHelper('index_plus_1', function(options) {
    return (options.data.index + 1);
  });

  // Direction badge class
  Handlebars.registerHelper('directionClass', (direction) => {
    if (!direction) return 'direction-neutral';
    const d = direction.toUpperCase();
    if (d.includes('NEGATIVE') && d.includes('POSITIVE')) return 'direction-neutral';
    if (d.startsWith('POSITIVE')) return 'direction-positive';
    if (d.startsWith('NEGATIVE')) return 'direction-negative';
    return 'direction-neutral';
  });

  // Safe HTML (triple-stache already handles this, but explicit helper)
  Handlebars.registerHelper('safeHtml', (str) => new Handlebars.SafeString(str || ''));

  // Severity class from string
  Handlebars.registerHelper('severityClass', (sev) => {
    const map = { high: 'severity-high', mid: 'severity-mid', low: 'severity-low' };
    return map[sev] || 'severity-low';
  });

  // Format date YYYY-MM-DD → YYYY년 MM월 DD일
  Handlebars.registerHelper('formatDate', (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}년 ${m}월 ${d}일`;
  });

  // Comma join array
  Handlebars.registerHelper('join', (arr, sep) => {
    if (!Array.isArray(arr)) return '';
    return arr.join(typeof sep === 'string' ? sep : ', ');
  });

  // Check if array has length > 0
  Handlebars.registerHelper('hasItems', (arr) => Array.isArray(arr) && arr.length > 0);
}

// ---------------------------------------------------------------------------
// Register partials from disk
// ---------------------------------------------------------------------------
function registerPartials() {
  const partialFiles = fs.readdirSync(PARTIALS_DIR).filter(f => f.endsWith('.hbs'));
  for (const file of partialFiles) {
    const name = path.basename(file, '.hbs');
    const src  = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
    Handlebars.registerPartial(name, src);
  }
  return partialFiles.length;
}

// ---------------------------------------------------------------------------
// Detect template from data
// ---------------------------------------------------------------------------
function detectTemplate(data) {
  if (!data.meta || !Array.isArray(data.meta.types) || data.meta.types.length === 0) {
    return null;
  }
  const firstType = data.meta.types[0];
  return CATEGORY_TEMPLATE_MAP[firstType] || null;
}

// ---------------------------------------------------------------------------
// Load and compile template
// ---------------------------------------------------------------------------
function loadTemplate(templateName) {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${filePath}\nAvailable templates: feedback-reading, feedback-grammar, feedback-logic, feedback-syntax`);
  }
  const src = fs.readFileSync(filePath, 'utf8');
  return Handlebars.compile(src);
}

// ---------------------------------------------------------------------------
// Open in browser (cross-platform)
// ---------------------------------------------------------------------------
function openInBrowser(filePath) {
  const { exec } = require('child_process');
  const absPath = path.resolve(filePath);
  const url = `file://${absPath}`;
  const cmd = process.platform === 'darwin' ? `open "${url}"`
            : process.platform === 'win32'  ? `start "" "${url}"`
            : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.warn('[render.js] Could not open browser:', err.message);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  // Validate required args
  if (!args.data) {
    console.error('[render.js] Error: --data is required.');
    printUsage();
    process.exit(1);
  }
  if (!args.out) {
    console.error('[render.js] Error: --out is required.');
    printUsage();
    process.exit(1);
  }

  // 1. Load data
  const dataPath = path.resolve(args.data);
  if (!fs.existsSync(dataPath)) {
    console.error(`[render.js] Data file not found: ${dataPath}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.error(`[render.js] Failed to parse JSON: ${e.message}`);
    process.exit(1);
  }

  // 2. Validate against schema
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (e) {
    console.warn('[render.js] Could not load schema.json — skipping validation.');
  }

  if (schema) {
    const errors = validateData(data, schema);
    if (errors.length > 0) {
      console.error('[render.js] Schema validation errors:');
      for (const err of errors) console.error(`  - ${err}`);
      console.error('Fix the JSON and retry.');
      process.exit(1);
    }
  }

  // 3. Determine template
  let templateName = args.template
    ? (CATEGORY_TEMPLATE_MAP[args.template] || `feedback-${args.template}`)
    : detectTemplate(data);

  if (!templateName) {
    console.error('[render.js] Could not detect template. Provide --template reading|grammar|logic|syntax.');
    process.exit(1);
  }

  // 4. Load CSS
  let css = '';
  try {
    css = fs.readFileSync(STYLES_PATH, 'utf8');
  } catch (e) {
    console.warn('[render.js] Could not load feedback-core.css — HTML will have no styles.');
  }

  // 5. Register Handlebars helpers and partials
  registerHelpers();
  const partialsCount = registerPartials();

  // 6. Compile and render
  let template;
  try {
    template = loadTemplate(templateName);
  } catch (e) {
    console.error(`[render.js] ${e.message}`);
    process.exit(1);
  }

  let html;
  try {
    html = template({ ...data, css });
  } catch (e) {
    console.error(`[render.js] Template rendering failed: ${e.message}`);
    process.exit(1);
  }

  // 7. Write output
  const outPath = path.resolve(args.out);
  const outDir  = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`[render.js] Done.`);
  console.log(`  Template : ${templateName}`);
  console.log(`  Partials : ${partialsCount} loaded`);
  console.log(`  Output   : ${outPath}`);

  // 8. Preview
  if (args.preview) {
    openInBrowser(outPath);
    console.log(`  Preview  : opening in browser...`);
  }
}

main().catch(e => {
  console.error('[render.js] Unexpected error:', e.message);
  process.exit(1);
});
