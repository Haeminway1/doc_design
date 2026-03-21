#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_HTML = path.join(ROOT, '07_archive', 'textbooks_legacy', 'output_v1', 'html', 'grammar-bridge-ch04.html');
const TARGET_JSON = path.join(ROOT, '02_textbooks', 'data', 'grammar', 'bridge', 'ch01-problems.json');
const RANGE_START = 151;
const RANGE_END = 200;

function normalizeChoice(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function htmlOrText($, $node) {
  const html = ($node.html() || '').trim();
  return html || $node.text().trim();
}

function extractRecoveredProblems() {
  const html = fs.readFileSync(SOURCE_HTML, 'utf8');
  const $ = cheerio.load(html);
  const answerMap = new Map();
  const explanationMap = new Map();

  $('.answer-grid-item').each((_, el) => {
    const number = parseInt($(el).find('.answer-grid-number').text().trim(), 10);
    const rawAnswer = $(el).find('.answer-grid-answer').text().trim();
    const answer = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 }[rawAnswer] || rawAnswer;
    if (!Number.isNaN(number) && number >= RANGE_START && number <= RANGE_END) {
      answerMap.set(number, answer);
    }
  });

  $('.explanation').each((_, el) => {
    const number = parseInt($(el).find('.problem-number').first().text().trim(), 10);
    if (Number.isNaN(number) || number < RANGE_START || number > RANGE_END) {
      return;
    }
    const explanationHtml = ($(el).find('.explanation-body').html() || '').trim();
    explanationMap.set(number, explanationHtml.replace(/\n\s+/g, '\n').trim());
  });

  const problems = [];
  $('.problem').each((_, el) => {
    const $problem = $(el);
    const number = parseInt($problem.find('.problem-number').first().text().trim(), 10);
    if (Number.isNaN(number) || number < RANGE_START || number > RANGE_END) {
      return;
    }

    const stemHtml = htmlOrText($, $problem.find('.problem-stem').first());
    const choices = $problem.find('.problem-choices li').map((__, li) => normalizeChoice($(li).text())).get();
    const choiceClass = $problem.find('.problem-choices').first().attr('class') || '';

    const problem = {
      id: `grammar-bridge-ch01-${number}`,
      number,
      type: 'fill-in-blank',
      instruction: $problem.find('.problem-instruction').first().text().trim() || '다음 빈칸에 들어갈 가장 적절한 것은?',
      choices,
      answer: answerMap.get(number),
      explanation: explanationMap.get(number) || '',
    };

    if (stemHtml) {
      problem.stem = stemHtml;
    }
    if (/\bproblem-choices--single-column\b/.test(choiceClass)) {
      problem.choiceLayout = 'single-column';
    }

    problems.push(problem);
  });

  if (problems.length !== RANGE_END - RANGE_START + 1) {
    throw new Error(`Recovered ${problems.length} problems, expected ${RANGE_END - RANGE_START + 1}`);
  }

  return problems.sort((a, b) => a.number - b.number);
}

function main() {
  const recovered = extractRecoveredProblems();
  const target = JSON.parse(fs.readFileSync(TARGET_JSON, 'utf8'));
  const byNumber = new Map((target.problems || []).map((problem) => [problem.number, problem]));

  recovered.forEach((problem) => {
    byNumber.set(problem.number, problem);
  });

  target.problems = [...byNumber.values()].sort((a, b) => a.number - b.number);
  fs.writeFileSync(TARGET_JSON, `${JSON.stringify(target, null, 2)}\n`, 'utf8');

  console.log(`Recovered ${recovered.length} problems into ${TARGET_JSON}`);
  console.log(`Problem count is now ${target.problems.length}`);
}

main();
