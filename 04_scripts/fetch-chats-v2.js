#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CONFIG = {
  profileId: '_xjYlxan',
  cdpUrl: 'http://127.0.0.1:18800',
  outputDir: path.join(__dirname, '..', 'student_chats'),
};

(async () => {
  console.log('🚀 연결 중...');
  
  const browser = await puppeteer.connect({ browserURL: CONFIG.cdpUrl });
  const pages = await browser.pages();
  const page = pages[0];

  await page.goto(`https://business.kakao.com/${CONFIG.profileId}/chats`, { waitUntil: 'networkidle2' });
  await sleep(2000);

  console.log('📋 학생 목록 & chatId 추출...');

  const students = await page.evaluate(() => {
    const list = [];
    const rows = document.querySelectorAll('[role="row"]');
    
    rows.forEach(row => {
      try {
        const strongEl = row.querySelector('strong');
        if (!strongEl) return;
        
        const fullName = strongEl.textContent.trim();
        const name = fullName.split('(')[0].trim();
        
        if (name.startsWith('x') || name === '김해민') return;
        
        // React fiber 탐색
        const fiberKey = Object.keys(row).find(k => k.startsWith('__reactFiber'));
        if (!fiberKey) return;
        
        let fiber = row[fiberKey];
        let chatId = null;
        
        // 부모 fiber 탐색
        let depth = 0;
        while (fiber && depth < 20) {
          if (fiber.memoizedProps?.chatId) {
            chatId = fiber.memoizedProps.chatId;
            break;
          }
          fiber = fiber.return;
          depth++;
        }
        
        if (chatId) {
          list.push({ name, chatId, fullName });
        }
      } catch (e) {}
    });
    
    return list;
  });

  console.log(`✅ ${students.length}명 발견`);
  if (students.length === 0) {
    console.log('❌ 학생을 찾을 수 없습니다. 페이지를 확인하세요.');
    await browser.disconnect();
    return;
  }

  students.forEach(s => console.log(`   - ${s.name} (ID: ${s.chatId})`));

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  console.log('\n💬 채팅 수집 시작\n');

  for (const student of students) {
    try {
      console.log(`📥 ${student.name}...`);
      
      const logs = await page.evaluate(async (profileId, chatId) => {
        const res = await fetch(`/api/profiles/${profileId}/chats/${chatId}/chatlogs?count=200`, {
          headers: { 'accept': 'application/json' }
        });
        return await res.json();
      }, CONFIG.profileId, student.chatId);

      const filePath = path.join(CONFIG.outputDir, `${student.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
      
      console.log(`   ✅ ${logs.chats?.length || 0}개 메시지`);
      await sleep(300);
      
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}`);
    }
  }

  console.log('\n🎉 완료!');
  await browser.disconnect();
})();
