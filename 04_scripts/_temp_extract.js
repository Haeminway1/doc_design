const fs = require('fs');
const path = require('path');
const dataDir = '/Users/haemin/projects/doc_design/02_textbooks/data';

// 1. Grammar Bridge ch01-04 answers
console.log('========== GRAMMAR BRIDGE 정답 ==========\n');
for (let ch = 1; ch <= 10; ch++) {
  const chStr = ch < 10 ? '0' + ch : '' + ch;
  const f = path.join(dataDir, 'grammar/bridge/ch' + chStr + '-problems.json');
  if (!fs.existsSync(f)) continue;
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`=== ${d.title} (ch${chStr}, ${d.problems.length}문제) ===`);
  d.problems.forEach(p => {
    const c = ['①','②','③','④','⑤'];
    const a = typeof p.answer === 'number' ? p.answer : parseInt(p.answer);
    const choiceText = (p.choices && p.choices[a-1]) || '';
    console.log(`Q${p.number}: ${c[a-1]} (${choiceText.substring(0,50)})`);
  });
  console.log('');
}

// 2. Reading Bridge Part01 passages 61-65
console.log('\n========== READING BRIDGE PART01 (P61-65) ==========\n');
const rb1 = JSON.parse(fs.readFileSync(path.join(dataDir, 'reading/bridge/part01-passages.json'), 'utf8'));
[61,62,63,64,65].forEach(n => {
  const p = rb1.passages.find(x => x.number == n);
  if (!p) { console.log(`P${n}: NOT FOUND`); return; }
  console.log(`=== P${n}: ${p.title || ''} ===`);
  if (p.questions) p.questions.forEach(q => {
    console.log(`  ${q.number}: ${q.text.substring(0,80)}`);
    if (q.choices) q.choices.forEach((c, i) => console.log(`    ${i+1}. ${c.substring(0,60)}`));
  });
  console.log('');
});

// 3. Reading Bridge Part02 passages 41-60
console.log('\n========== READING BRIDGE PART02 (P41-60) ==========\n');
const rb2 = JSON.parse(fs.readFileSync(path.join(dataDir, 'reading/bridge/part02-passages.json'), 'utf8'));
console.log(`Total passages: ${rb2.passages.length}`);
[41,42,43,44,45,46,47,48,49,50,53,54,55,56,57,58,59,60].forEach(n => {
  const p = rb2.passages.find(x => x.number == n);
  if (!p) { console.log(`P${n}: NOT FOUND`); return; }
  console.log(`P${n}: ${(p.title||'').substring(0,50)} (${(p.questions||[]).length} questions)`);
});
