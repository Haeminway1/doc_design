#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const chatDir = path.join(__dirname, '..', 'student_chats');
const vaultDir = path.expandTilde('~/Library/CloudStorage/OneDrive-개인/문서/obsidian sync/복돌이/베라/학생');

const files = fs.readdirSync(chatDir).filter(f => f.endsWith('.json'));

console.log(`📁 ${files.length}명 학생 데이터 처리 중...\n`);

files.forEach(file => {
  const name = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(chatDir, file), 'utf-8'));
  const items = data.items || [];
  
  if (items.length === 0) {
    console.log(`⚠️  ${name}: 메시지 없음`);
    return;
  }
  
  console.log(`✅ ${name}: ${items.length}개 메시지`);
  
  // 최근 3개 메시지만 요약
  const recent = items.slice(0, Math.min(5, items.length));
  
  let summary = recent.map(msg => {
    const date = new Date(msg.send_at);
    const dateStr = `${date.getMonth()+1}/${date.getDate()}`;
    const sender = msg.sender_type === 1 ? '베라쌤' : name;
    const text = msg.message || (msg.attachments?.[0]?.name || '(이미지/파일)');
    return `- ${dateStr} ${sender}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`;
  }).join('\n');
  
  console.log(`   최근 메시지:\n${summary}\n`);
});

console.log('🎉 파싱 완료!');
