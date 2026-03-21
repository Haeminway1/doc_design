#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const chatDir = path.join(__dirname, '..', 'student_chats');
const vaultDir = path.join(os.homedir(), 'Library/CloudStorage/OneDrive-개인/문서/obsidian sync/복돌이/베라/학생');

const files = fs.readdirSync(chatDir).filter(f => f.endsWith('.json'));

console.log(`📁 ${files.length}명 학생 분석 중...\n`);

const results = {};

files.forEach(file => {
  const name = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(chatDir, file), 'utf-8'));
  const items = data.items || [];
  
  if (items.length === 0) {
    results[name] = { messages: 0, summary: '메시지 없음' };
    return;
  }
  
  // 최근 10개 메시지 분석
  const recent = items.slice(0, 10);
  
  let studentMessages = [];
  let teacherMessages = [];
  
  recent.forEach(msg => {
    const date = new Date(msg.send_at);
    const dateStr = `${date.getMonth()+1}/${date.getDate()}`;
    const text = msg.message || (msg.attachments?.[0] ? '(이미지/파일)' : '');
    
    if (msg.sender_type === 1) {
      // 선생님 메시지
      teacherMessages.push({ date: dateStr, text: text.substring(0, 100) });
    } else {
      // 학생 메시지
      studentMessages.push({ date: dateStr, text: text.substring(0, 100) });
    }
  });
  
  results[name] = {
    messages: items.length,
    studentMessages: studentMessages.slice(0, 3),
    teacherMessages: teacherMessages.slice(0, 3),
    lastDate: recent[0] ? new Date(recent[0].send_at).toLocaleDateString('ko-KR') : null,
  };
});

console.log(JSON.stringify(results, null, 2));
console.log('\n🎉 분석 완료!');
