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
  let page = pages.find(p => p.url().includes('business.kakao.com'));
  
  if (!page) {
    page = await browser.newPage();
    await page.goto(`https://business.kakao.com/${CONFIG.profileId}/chats`, { waitUntil: 'networkidle2' });
  }

  if (!page.url().includes('/chats')) {
    await page.goto(`https://business.kakao.com/${CONFIG.profileId}/chats`, { waitUntil: 'networkidle2' });
  }

  console.log('📋 학생 목록 추출 중...');
  await page.waitForSelector('[role="grid"] [role="row"] li a.link_chat', { timeout: 15000 });
  await sleep(2000);

  const students = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="grid"] [role="row"] > li');
    const result = [];

    items.forEach(li => {
      const nameEl = li.querySelector('strong.tit_info span.txt_name') || li.querySelector('strong span');
      if (!nameEl) return;

      const fullName = nameEl.textContent.trim();
      const cleanName = fullName.replace(/\(.*$/, '').trim();

      if (fullName.startsWith('x') || cleanName === '김해민') return;

      const linkEl = li.querySelector('a.link_chat');
      let chatId = null;

      if (linkEl) {
        const fiberKey = Object.keys(linkEl).find(k => k.startsWith('__reactFiber$'));
        if (fiberKey) {
          let fiber = linkEl[fiberKey];
          for (let i = 0; i < 20 && fiber; i++) {
            const props = fiber.memoizedProps || fiber.pendingProps;
            if (props?.chat && typeof props.chat.get === 'function') {
              chatId = props.chat.get('id');
              break;
            }
            fiber = fiber.return;
          }
        }
      }

      if (chatId) {
        result.push({ fullName, cleanName, chatId });
      }
    });

    return result;
  });

  console.log(`✅ ${students.length}명 발견`);
  if (students.length === 0) {
    console.log('❌ 학생을 찾을 수 없습니다.');
    await browser.disconnect();
    return;
  }

  students.forEach(s => console.log(`   - ${s.cleanName} (${s.chatId})`));

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  console.log('\n💬 채팅 수집 시작\n');

  for (const student of students) {
    try {
      console.log(`📥 ${student.cleanName}...`);
      
      const logs = await page.evaluate(async (profileId, chatId) => {
        const res = await fetch(`/api/profiles/${profileId}/chats/${chatId}/chatlogs?count=200`, {
          headers: { 'accept': 'application/json' }
        });
        return await res.json();
      }, CONFIG.profileId, student.chatId);

      const filePath = path.join(CONFIG.outputDir, `${student.cleanName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
      
      console.log(`   ✅ ${logs.chats?.length || 0}개 메시지`);
      await sleep(300);
      
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}`);
    }
  }

  console.log('\n🎉 완료!');
  console.log(`📁 ${CONFIG.outputDir}`);
  await browser.disconnect();
})();
