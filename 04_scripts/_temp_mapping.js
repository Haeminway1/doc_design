const fs = require('fs');
const d = JSON.parse(fs.readFileSync('02_textbooks/data/grammar/bridge/ch01-problems.json','utf8'));
const c = ['①','②','③','④','⑤'];

// Check stems at exercise boundaries to map exercise sections
[21,22,41,42,61,62,81,82].forEach(n => {
  const p = d.problems.find(x => x.number === n);
  if (!p) { console.log('Q'+n+': NOT FOUND'); return; }
  const a = typeof p.answer==='number' ? p.answer : parseInt(p.answer);
  console.log('Q'+n+': '+c[a-1]+' '+((p.choices||[])[a-1]||'').substring(0,25)+' | '+(p.stem||'').substring(0,60));
});
