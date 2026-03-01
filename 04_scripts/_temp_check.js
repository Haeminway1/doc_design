const fs = require('fs');

// 1. Reading bridge part01 P61-65
console.log('=== READING BRIDGE PART01 P61-65 ===');
const rb1 = JSON.parse(fs.readFileSync('02_textbooks/data/reading/bridge/part01-passages.json','utf8'));
[61,62,63,64,65].forEach(n => {
  const p = rb1.passages.find(x => x.number == n);
  if (!p) { console.log('P'+n+': NOT FOUND'); return; }
  console.log('P'+n+': ' + (p.title||'').substring(0,60));
  console.log('  passage length:', (p.passage||p.text||'').length);
  if (p.questions) p.questions.forEach(q => {
    console.log('  Q'+q.number+': ' + (q.text||q.question||'').substring(0,60));
    console.log('    choices:', (q.choices||[]).length, 'answer:', q.answer||q.correctAnswer||'NONE');
  });
});

// 2. Reading bridge part02 P41-60
console.log('\n=== READING BRIDGE PART02 P41-60 ===');
const f2 = '02_textbooks/data/reading/bridge/part02-passages.json';
if (!fs.existsSync(f2)) { console.log('part02 NOT FOUND'); } else {
  const rb2 = JSON.parse(fs.readFileSync(f2,'utf8'));
  console.log('Total passages:', rb2.passages.length);
  for(let n=41; n<=60; n++) {
    const p = rb2.passages.find(x => x.number == n || Number(x.number) == n);
    if (!p) { console.log('P'+n+': NOT FOUND'); continue; }
    const qs = p.questions||[];
    const hasAns = qs.length > 0 && (qs[0].answer || qs[0].correctAnswer);
    console.log('P'+n+': '+(p.title||'').substring(0,50)+' (Qs:'+qs.length+', hasAnswer:'+!!hasAns+')');
  }
}

// 3. Grammar ch01 answers Q1-500 full dump (for cross-reference)
console.log('\n=== GRAMMAR CH01 FULL ANSWERS ===');
const g1 = JSON.parse(fs.readFileSync('02_textbooks/data/grammar/bridge/ch01-problems.json','utf8'));
const circled = ['①','②','③','④','⑤'];
g1.problems.forEach(p => {
  const a = typeof p.answer === 'number' ? p.answer : parseInt(p.answer);
  process.stdout.write('Q'+p.number+':'+circled[a-1]+' ');
  if (p.number % 20 === 0) process.stdout.write('\n');
});
console.log('');
