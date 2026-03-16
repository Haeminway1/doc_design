#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const BOOKS = [
  path.join(ROOT, '02_textbooks', 'books', 'grammar-bridge-vol1.yaml'),
  path.join(ROOT, '02_textbooks', 'books', 'grammar-bridge-vol2.yaml'),
];

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function extractRows(manifest) {
  const rows = [];
  let current = null;

  for (const page of manifest.pages || []) {
    if (page.kind === 'chapter-opener') {
      current = {
        title: page.title || '',
        subtitle: page.subtitle || '',
        content: new Set(),
        problems: new Set(),
      };
      rows.push(current);
      continue;
    }

    const sourcePath = page.source && page.source.path;
    const match = sourcePath && sourcePath.match(/grammar\/bridge\/(ch\d{2})-(content|problems)/);
    if (!current || !match) continue;

    if (match[2] === 'content') current.content.add(match[1]);
    if (match[2] === 'problems') current.problems.add(match[1]);
  }

  return rows.map((row) => ({
    title: row.title,
    subtitle: row.subtitle,
    contentBundles: [...row.content],
    problemBundles: [...row.problems],
  }));
}

function normalizeSubtitle(filePath, subtitle) {
  const text = String(subtitle || '').trim();
  const match = text.match(/^Part\s+(\d+)$/i);
  if (!match) return text;
  const n = Number(match[1]);
  if (path.basename(filePath) === 'grammar-bridge-vol1.yaml') {
    return `Chapter ${n}`;
  }
  if (path.basename(filePath) === 'grammar-bridge-vol2.yaml') {
    return `Chapter ${n + 10}`;
  }
  return text;
}

function auditManifest(filePath) {
  const manifest = loadYaml(filePath);
  const rows = extractRows(manifest);
  const warnings = [];

  rows.forEach((row) => {
    if (row.contentBundles.length > 1) {
      warnings.push(`[mixed-content] ${row.subtitle} ${row.title}: ${row.contentBundles.join(', ')}`);
    }
    if (row.problemBundles.length > 1) {
      warnings.push(`[mixed-problems] ${row.subtitle} ${row.title}: ${row.problemBundles.join(', ')}`);
    }
    if (row.problemBundles.length && row.contentBundles.length && row.problemBundles[0] !== row.contentBundles[0]) {
      warnings.push(`[bundle-mismatch] ${row.subtitle} ${row.title}: content=${row.contentBundles[0]} problems=${row.problemBundles[0]}`);
    }
    if (!row.problemBundles.length) {
      warnings.push(`[no-problems] ${row.subtitle} ${row.title}: no problem bundle mapped`);
    }
  });

  console.log(`\n== ${path.basename(filePath)} ==`);
  rows.forEach((row) => {
    console.log(
      `${normalizeSubtitle(filePath, row.subtitle).padEnd(10)} | ${row.title.padEnd(12)} | content=${(row.contentBundles.join(',') || '-').padEnd(6)} | problems=${row.problemBundles.join(',') || '-'}`
    );
  });

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((warning) => console.log(`- ${warning}`));
  } else {
    console.log('\nWarnings: none');
  }
}

function main() {
  const requested = process.argv.slice(2).filter(Boolean);
  const targets = requested.length
    ? BOOKS.filter((filePath) => {
        const base = path.basename(filePath);
        const bookId = base.replace(/\.yaml$/, '');
        return requested.includes(base) || requested.includes(bookId);
      })
    : BOOKS;

  targets.forEach(auditManifest);
}

main();
