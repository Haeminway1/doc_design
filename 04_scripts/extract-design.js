#!/usr/bin/env node
/**
 * extract-design.js — 원본 소스 HTML에서 디자인 에셋 추출
 *
 * 각 교재 소스의 고유 CSS + 구조 페이지(표지, 목차, 파트 인트로)를 추출하여
 * assemble.js가 원본 디자인으로 빌드할 수 있게 함.
 *
 * Usage:
 *   node 04_scripts/extract-design.js
 *
 * Output:
 *   02_textbooks/styles/{seriesId}.css        — 원본 CSS (9개)
 *   02_textbooks/content/{cat}/{sub}/cover.html  — 표지 페이지
 *   02_textbooks/content/{cat}/{sub}/toc.html    — 목차 페이지
 *   02_textbooks/content/{cat}/{sub}/part-N-intro.html — 파트 인트로
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, '02_textbooks', 'source');
const STYLES_DIR = path.join(ROOT, '02_textbooks', 'styles');
const CONTENT_DIR = path.join(ROOT, '02_textbooks', 'content');

// ─── Source → Series Mapping (9 unique sources) ─────────
const SOURCE_MAP = [
  { file: '[편입영어]문법_bridge_part1.html',    seriesId: 'grammar-bridge-part1' },
  { file: '[편입영어]문법_bridge_part2.html',    seriesId: 'grammar-bridge-part2' },
  { file: '[편입영어]문법_advanced.html',        seriesId: 'grammar-advanced' },
  { file: '[편입영어]독해_basic편.html',          seriesId: 'reading-basic' },
  { file: '[편입영어]독해_bridge.html',           seriesId: 'reading-bridge' },
  { file: '[편입영어]독해_intermediate.html',     seriesId: 'reading-intermediate' },
  { file: '[편입영어]보카_basic(1-70).html',      seriesId: 'vocab-basic' },
  { file: '[편입영어]구문독해_bridge (1).html',   seriesId: 'syntax-bridge' },
  { file: '[편입영어]논리_basic.html',            seriesId: 'logic-basic' },
];

/**
 * Derive structural page output directory from seriesId.
 * 'grammar-bridge-part1' → 'grammar/bridge-part1'
 * 'reading-basic'        → 'reading/basic'
 */
function getStructuralDir(seriesId) {
  const idx = seriesId.indexOf('-');
  return seriesId.substring(0, idx) + '/' + seriesId.substring(idx + 1);
}

/**
 * Remap background-image URLs for output HTML context.
 * Output HTML lives at 02_textbooks/output/html/{book}.html
 * Backgrounds at 05_assets/backgrounds/
 */
function remapBackgroundUrls(css) {
  return css.replace(
    /url\(\s*['"]?((?:\.\.\/)*background\/([^'")\s]+))['"]?\s*\)/g,
    (match, fullPath, filename) => {
      return `url('../../../05_assets/backgrounds/${filename}')`;
    }
  );
}

function extractDesign(entry) {
  const { file, seriesId } = entry;
  const srcPath = path.join(SOURCE_DIR, file);

  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  Source not found: ${file}`);
    return { css: false, cover: 0, toc: 0, partIntro: 0 };
  }

  console.log(`\n📎 ${seriesId} ← ${file}`);

  const html = fs.readFileSync(srcPath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // ─── 1. CSS Extraction ───────────────────────────────
  let css = '';
  $('style').each((i, el) => {
    const content = $(el).html();
    if (content && content.trim()) {
      css += `/* --- style block ${i + 1} --- */\n${content}\n\n`;
    }
  });

  css = remapBackgroundUrls(css);

  fs.mkdirSync(STYLES_DIR, { recursive: true });
  const cssPath = path.join(STYLES_DIR, `${seriesId}.css`);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log(`  ✅ CSS → styles/${seriesId}.css (${(css.length / 1024).toFixed(1)}KB)`);

  // ─── 2. Structural Pages Extraction ──────────────────
  const structDir = getStructuralDir(seriesId);
  const outDir = path.join(CONTENT_DIR, structDir);
  fs.mkdirSync(outDir, { recursive: true });

  let coverCount = 0;
  let tocCount = 0;
  let partIntroCount = 0;

  $('div.page, div[class*="page"]').each((i, el) => {
    const $page = $(el);
    const classes = $page.attr('class') || '';

    // Must have 'page' in class list
    if (!classes.split(/\s+/).includes('page') &&
        !classes.includes('cover-page') &&
        !classes.includes('part-intro-page') &&
        !classes.includes('part-divider-page') &&
        !classes.includes('toc-page')) {
      return;
    }

    // Cover page (cover-page or cover-page-modern)
    if (/cover-page/.test(classes)) {
      coverCount++;
      const suffix = coverCount > 1 ? `-${coverCount}` : '';
      const outFile = path.join(outDir, `cover${suffix}.html`);
      fs.writeFileSync(outFile, $.html(el).trim() + '\n', 'utf8');
      return;
    }

    // TOC page (has class toc-page OR contains .toc-header element)
    if (classes.includes('toc-page') || $page.find('.toc-header').length > 0) {
      tocCount++;
      const suffix = tocCount > 1 ? `-${tocCount}` : '';
      const outFile = path.join(outDir, `toc${suffix}.html`);
      fs.writeFileSync(outFile, $.html(el).trim() + '\n', 'utf8');
      return;
    }

    // Part intro / Part divider page
    if (classes.includes('part-intro-page') || classes.includes('part-divider-page')) {
      partIntroCount++;
      const outFile = path.join(outDir, `part-${partIntroCount}-intro.html`);
      fs.writeFileSync(outFile, $.html(el).trim() + '\n', 'utf8');
      return;
    }
  });

  console.log(`  📄 Cover: ${coverCount}, TOC: ${tocCount}, Part intros: ${partIntroCount}`);
  return { css: true, cover: coverCount, toc: tocCount, partIntro: partIntroCount };
}

// ─── Main ───────────────────────────────────────────────
console.log('🎨 Extract Design Assets from Source HTML');
console.log('═'.repeat(50));

const stats = { total: 0, css: 0, covers: 0, tocs: 0, intros: 0 };

for (const entry of SOURCE_MAP) {
  const result = extractDesign(entry);
  stats.total++;
  if (result.css) stats.css++;
  stats.covers += result.cover;
  stats.tocs += result.toc;
  stats.intros += result.partIntro;
}

console.log('\n' + '═'.repeat(50));
console.log(`✨ Done! ${stats.css}/${stats.total} CSS, ${stats.covers} covers, ${stats.tocs} TOCs, ${stats.intros} part intros`);
