#!/usr/bin/env node

/**
 * 채팅방 진입 방법 디버그
 * - href 추출 + page.goto() 방식
 * - Puppeteer page.click() 방식
 * - 채팅방 내부 DOM 구조 확인
 */

const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debug() {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:18800',
    defaultViewport: null,
  });

  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('business.kakao.com'));

  if (!page) {
    page = await browser.newPage();
  }
  // 항상 채팅 목록으로 강제 이동
  await page.goto('https://business.kakao.com/_xjYlxan/chats', { waitUntil: 'networkidle2' });

  await page.waitForSelector('[role="grid"] [role="row"] li a.link_chat', { timeout: 15000 });
  await sleep(2000);

  // ── 1. 첫 번째 활성 학생의 href 추출 ──
  console.log('═══ 채팅 링크 href 추출 ═══\n');

  const linkInfo = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="grid"] [role="row"] > li');
    const results = [];
    for (const li of items) {
      const nameEl = li.querySelector('strong.tit_info span.txt_name');
      const linkEl = li.querySelector('a.link_chat');
      if (!nameEl || !linkEl) continue;
      const name = nameEl.textContent.trim();
      if (name.startsWith('x')) continue;
      results.push({
        name,
        href: linkEl.getAttribute('href'),
        fullHref: linkEl.href,
        onclick: linkEl.getAttribute('onclick') || null,
        dataAttrs: Array.from(linkEl.attributes)
          .filter(a => a.name.startsWith('data-'))
          .map(a => `${a.name}=${a.value?.slice(0, 50)}`),
      });
      if (results.length >= 3) break;
    }
    return results;
  });

  linkInfo.forEach((info, i) => {
    console.log(`  ${i + 1}. ${info.name}`);
    console.log(`     href: ${info.href}`);
    console.log(`     fullHref: ${info.fullHref}`);
    console.log(`     onclick: ${info.onclick}`);
    console.log(`     data-*: ${info.dataAttrs.join(', ') || 'none'}`);
  });

  if (linkInfo.length === 0) {
    console.log('학생 링크를 찾을 수 없음');
    return;
  }

  // ── 2. page.click()으로 채팅방 진입 시도 ──
  console.log('\n═══ page.click()으로 채팅방 진입 ═══\n');

  const targetName = linkInfo[0].name;
  console.log(`대상: ${targetName}`);

  // 해당 학생의 li 인덱스 파악
  const targetIndex = await page.evaluate((name) => {
    const items = document.querySelectorAll('[role="grid"] [role="row"] > li');
    for (let i = 0; i < items.length; i++) {
      const nameEl = items[i].querySelector('strong.tit_info span.txt_name');
      if (nameEl && nameEl.textContent.trim() === name) return i;
    }
    return -1;
  }, targetName);

  console.log(`li 인덱스: ${targetIndex}`);

  if (targetIndex >= 0) {
    // page.click()으로 직접 클릭 (Puppeteer가 마우스 이벤트 시뮬레이션)
    const selector = `[role="grid"] [role="row"] > li:nth-child(${targetIndex + 1}) a.link_chat`;
    console.log(`클릭 셀렉터: ${selector}`);

    try {
      await page.click(selector);
      console.log('클릭 성공! 로딩 대기 중 (5초)...');
      await sleep(5000);
    } catch (err) {
      console.log(`클릭 실패: ${err.message}`);
      // 대안: href로 직접 이동
      if (linkInfo[0].fullHref) {
        console.log(`대안: page.goto(${linkInfo[0].fullHref})`);
        await page.goto(linkInfo[0].fullHref, { waitUntil: 'networkidle2' });
        await sleep(3000);
      }
    }
  }

  console.log(`현재 URL: ${page.url()}`);

  // ── 3. 채팅방 진입 확인 ──
  console.log('\n═══ 채팅방 내부 확인 ═══\n');

  // 페이지 전체 구조 확인 (채팅방이 로드되었는지)
  const pageState = await page.evaluate(() => {
    const result = {};

    // 채팅방 관련 가능한 셀렉터들
    const chatSelectors = {
      'area_chat': '.area_chat',
      'wrap_chat': '.wrap_chat',
      'chat_detail': '[class*="detail"]',
      'msg_list': '[class*="msg_list"], [class*="msglist"]',
      'message_wrap': '[class*="message"]',
      'talk_area': '[class*="talk"]',
      'content_chat': '[class*="content"]',
      'scroll_chat': '[class*="scroll"]',
      'log': '[class*="log"]',
    };

    for (const [key, sel] of Object.entries(chatSelectors)) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        result[key] = {
          count: els.length,
          sample: Array.from(els).slice(0, 2).map(el => ({
            tag: el.tagName?.toLowerCase(),
            class: el.className?.toString()?.slice(0, 80),
            childCount: el.children?.length || 0,
          })),
        };
      }
    }

    // 현재 페이지의 큰 구조
    const main = document.querySelector('[role="main"]');
    if (main) {
      result._mainStructure = Array.from(main.querySelectorAll('*'))
        .filter(el => el.children.length > 5 || (el.className?.toString() || '').length > 10)
        .slice(0, 20)
        .map(el => ({
          tag: el.tagName?.toLowerCase(),
          class: el.className?.toString()?.slice(0, 80),
          childCount: el.children?.length,
          depth: (() => { let d = 0; let p = el; while (p = p.parentElement) d++; return d; })(),
        }));
    }

    return result;
  });

  console.log(JSON.stringify(pageState, null, 2));

  // ── 4. 모든 img 태그 다시 확인 ──
  console.log('\n═══ 현재 페이지 img 태그 ═══\n');

  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src?.slice(0, 150),
      w: img.naturalWidth,
      h: img.naturalHeight,
      role: img.getAttribute('role'),
      parentClass: img.parentElement?.className?.toString()?.slice(0, 60),
    }));
  });

  // 프로필 제외한 이미지만 필터
  const nonProfile = allImgs.filter(img => img.role !== 'presentation');
  console.log(`전체 img: ${allImgs.length}개, 비프로필: ${nonProfile.length}개`);
  nonProfile.forEach((img, i) => {
    console.log(`  ${i + 1}. [${img.w}x${img.h}] parent="${img.parentClass}"`);
    console.log(`     ${img.src}`);
  });

  if (nonProfile.length === 0) {
    console.log('  (비프로필 이미지 없음 - 채팅방이 열리지 않았을 수 있음)');
  }

  // ── 5. iframe 재확인 ──
  console.log('\n═══ iframe 재확인 ═══');
  const frames = page.frames();
  console.log(`프레임 수: ${frames.length}`);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    console.log(`  ${i}. ${f.url().slice(0, 120)}`);
    if (f !== page.mainFrame()) {
      try {
        const imgCount = await f.evaluate(() => document.querySelectorAll('img').length);
        console.log(`     -> img 태그: ${imgCount}개`);
      } catch { console.log('     -> (접근 불가)'); }
    }
  }

  console.log('\n═══ 디버그 완료 ═══');
}

debug().catch(console.error);
