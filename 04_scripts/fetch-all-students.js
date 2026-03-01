#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CONFIG = {
  profileId: '_xjYlxan',
  cdpUrl: 'http://127.0.0.1:18800',
  apiBase: 'https://business.kakao.com',
  outputDir: path.join(__dirname, '..', 'student_chats'),
};

(async () => {
  console.log('🚀 카카오비즈니스 연결 중...');
  
  const browser = await puppeteer.connect({
    browserURL: CONFIG.cdpUrl,
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();

  await page.goto(`https://business.kakao.com/${CONFIG.profileId}/chats`, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  await sleep(3000);

  console.log('📋 학생 목록 추출 중...');

  // chatId 추출을 위한 React fiber 탐색
  const students = await page.evaluate(() => {
    const list = [];
    
    // ChatListItem 찾기
    const findReactFiber = (dom) => {
      const key = Object.keys(dom).find(key => key.startsWith('__reactFiber'));
      return dom[key];
    };

    const items = document.querySelectorAll('[class*="chat_item"]');
    
    items.forEach(item => {
      try {
        const nameEl = item.querySelector('strong');
        const name = nameEl ? nameEl.textContent.trim().split(/\s/)[0] : null;
        
        if (!name || name.startsWith('x') || name === '김해민(조교)') return;
        
        // React fiber에서 chatId 추출
        const fiber = findReactFiber(item);
        let chatId = null;
        
        if (fiber && fiber.return) {
          let current = fiber;
          while (current && !chatId) {
            if (current.memoizedProps?.chatId) {
              chatId = current.memoizedProps.chatId;
            }
            current = current.return;
          }
        }
        
        if (chatId) {
          list.push({ name, chatId });
        }
      } catch (e) {
        console.error('Error processing item:', e);
      }
    });
    
    return list;
  });

  console.log(`✅ ${students.length}명 학생 발견:`);
  students.forEach(s => console.log(`   - ${s.name} (${s.chatId})`));

  // 출력 폴더 생성
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  console.log('\n💬 채팅 내역 수집 시작...\n');

  for (const student of students) {
    try {
      console.log(`📥 ${student.name} 채팅 로그 가져오는 중...`);
      
      // API 직접 호출
      const response = await page.evaluate(async (profileId, chatId) => {
        const url = `/api/profiles/${profileId}/chats/${chatId}/chatlogs?count=100`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
          }
        });
        return await res.json();
      }, CONFIG.profileId, student.chatId);

      // JSON으로 저장
      const outputPath = path.join(CONFIG.outputDir, `${student.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(response, null, 2), 'utf-8');
      
      console.log(`   ✅ ${student.name} 완료 (${response.chats?.length || 0}개 메시지)`);
      
      await sleep(500);
      
    } catch (error) {
      console.error(`   ❌ ${student.name} 실패:`, error.message);
    }
  }

  console.log('\n🎉 전체 수집 완료!');
  console.log(`📁 저장 위치: ${CONFIG.outputDir}`);

  await browser.disconnect();
})();
