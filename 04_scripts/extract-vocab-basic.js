#!/usr/bin/env node
/**
 * extract-vocab-basic.js — 보카 Basic 원본 HTML 추출
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, '02_textbooks', 'source', '[편입영어]보카_basic(1-70).html');
const DATA_DIR = path.join(ROOT, '02_textbooks', 'data', 'vocab', 'basic');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');

[DATA_DIR, LEGACY_BOOKS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

console.log('📘 Extracting: 보카 Basic');

const html = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(html, { decodeEntities: true });

// --- 1. Extract days and words ---
const days = [];
let currentDay = null;

$('div.page').each((i, el) => {
  const $el = $(el);

  // Check for day title page
  if ($el.hasClass('day-title-page')) {
    const dayNum = parseInt($el.attr('data-day') || $el.find('.day-number').text().replace(/\D/g, ''));
    const theme = $el.find('.day-theme').text().trim() || $el.attr('data-theme') || '';
    currentDay = { day: dayNum, theme, words: [] };
    days.push(currentDay);
    return;
  }

  // Check for day content (data-day attribute on page)
  const dataDayAttr = $el.attr('data-day');
  if (dataDayAttr) {
    const dayNum = parseInt(dataDayAttr);
    if (!currentDay || currentDay.day !== dayNum) {
      currentDay = days.find(d => d.day === dayNum);
      if (!currentDay) {
        currentDay = { day: dayNum, theme: '', words: [] };
        days.push(currentDay);
      }
    }
  }

  // Extract word entries from this page
  $el.find('.word-entry').each((j, we) => {
    const $we = $(we);
    const word = ($we.attr('data-word') || $we.find('.word-title').text().trim()).trim();
    if (!word) return;

    const pronunciation = $we.find('.word-pronunciation').text().trim();
    const partOfSpeech = $we.find('.part-of-speech').text().trim();
    const meaning = $we.find('.word-def p').text().trim();

    // Example
    const exEng = $we.find('.ex-eng').text().trim().replace(/^[•·]\s*/, '');
    const exKor = $we.find('.ex-kor').text().trim();

    const wordEntry = {
      word,
      pronunciation: pronunciation || undefined,
      partOfSpeech: partOfSpeech || 'n.',
      meaning,
    };

    if (exEng || exKor) {
      wordEntry.example = { en: exEng || '', ko: exKor || '' };
    }

    if (currentDay) {
      currentDay.words.push(wordEntry);
    }
  });
});

// Stats
const totalWords = days.reduce((sum, d) => sum + d.words.length, 0);
console.log(`  📅 Days: ${days.length}`);
console.log(`  📚 Words: ${totalWords}`);

// --- 2. Write per-day JSON files ---
for (const day of days) {
  if (day.words.length === 0) continue;
  const data = {
    bookId: 'vocab-basic',
    day: day.day,
    theme: day.theme,
    words: day.words,
  };
  const outPath = path.join(DATA_DIR, `day${String(day.day).padStart(2, '0')}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
}
console.log(`  💾 Day JSON files written`);

// --- 3. Write YAML manifest ---
const yamlPages = [];
for (const day of days) {
  if (day.words.length === 0) continue;
  yamlPages.push(`  - type: vocabulary\n    src: vocab/basic/day${String(day.day).padStart(2, '0')}.json`);
}

const yaml = `# vocab-basic — 보카 Basic (DAY 1-70)
book:
  title: "VOCA 365: 기출 어휘 완전 정복 Basic"
  author: "Vera's Flavor"
  template: sky-academic
  series: vocab-basic

pages:
${yamlPages.join('\n')}
`;

fs.writeFileSync(path.join(LEGACY_BOOKS_DIR, 'vocab-basic.yaml'), yaml, 'utf8');
console.log(`  💾 Legacy manifest written`);
console.log('  ✅ Done: 보카 Basic');
