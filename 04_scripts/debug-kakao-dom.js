#!/usr/bin/env node

/**
 * 카카오비즈니스 채팅 DOM 구조 탐색 디버그 스크립트
 * - [role="grid"] 하위 실제 DOM 트리를 덤프
 * - 채팅 항목의 실제 셀렉터를 파악
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
    await page.goto('https://business.kakao.com/_xjYlxan/chats', { waitUntil: 'networkidle2' });
  } else {
    await page.reload({ waitUntil: 'networkidle2' });
  }

  console.log('현재 URL:', page.url());
  console.log('Grid 로딩 대기 중...');

  // 여러 셀렉터 시도
  const selectors = [
    '[role="grid"]',
    '[role="list"]',
    '[role="listbox"]',
    '[class*="chat"]',
    '[class*="list"]',
    '[class*="conversation"]',
  ];

  for (const sel of selectors) {
    const found = await page.$(sel);
    console.log(`  ${sel}: ${found ? 'FOUND' : 'NOT FOUND'}`);
  }

  // Grid 대기
  try {
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
  } catch {
    console.log('WARNING: [role="grid"] 타임아웃. 다른 셀렉터 탐색...');
  }

  await sleep(5000); // SPA 렌더링 충분히 대기

  // ── 1단계: Grid 하위 DOM 트리 덤프 ──
  console.log('\n═══ DOM 트리 덤프 ═══\n');

  const domTree = await page.evaluate(() => {
    function dumpElement(el, depth = 0, maxDepth = 6) {
      if (depth > maxDepth) return null;
      const tag = el.tagName?.toLowerCase() || '?';
      const role = el.getAttribute?.('role') || '';
      const cls = el.className?.toString()?.slice(0, 80) || '';
      const childCount = el.children?.length || 0;
      const text = el.childNodes?.length === 1 && el.childNodes[0].nodeType === 3
        ? el.childNodes[0].textContent?.trim().slice(0, 50) : '';

      const info = {
        tag,
        role: role || undefined,
        class: cls || undefined,
        text: text || undefined,
        childCount,
      };

      if (childCount > 0 && depth < maxDepth) {
        // 너무 많으면 처음 5개 + 마지막 1개만
        const children = Array.from(el.children);
        const sample = children.length > 6
          ? [...children.slice(0, 5), children[children.length - 1]]
          : children;
        info.children = sample.map(c => dumpElement(c, depth + 1, maxDepth));
        if (children.length > 6) {
          info._totalChildren = children.length;
          info._showing = `first 5 + last 1 of ${children.length}`;
        }
      }

      return info;
    }

    const grid = document.querySelector('[role="grid"]');
    if (!grid) return { error: 'No [role="grid"] found' };
    return dumpElement(grid, 0, 6);
  });

  console.log(JSON.stringify(domTree, null, 2));

  // ── 2단계: Row 하위 요소 직접 탐색 ──
  console.log('\n═══ Row 내부 구조 ═══\n');

  const rowInfo = await page.evaluate(() => {
    const grid = document.querySelector('[role="grid"]');
    if (!grid) return { error: 'No grid' };

    const row = grid.querySelector('[role="row"]');
    if (!row) return { error: 'No row in grid' };

    const children = Array.from(row.children);
    return {
      rowTag: row.tagName,
      rowRole: row.getAttribute('role'),
      rowClass: row.className?.toString()?.slice(0, 100),
      directChildCount: children.length,
      childSample: children.slice(0, 10).map((child, i) => {
        const tag = child.tagName?.toLowerCase();
        const role = child.getAttribute('role');
        const cls = child.className?.toString()?.slice(0, 80);
        const ariaLabel = child.getAttribute('aria-label');
        const dataAttrs = Array.from(child.attributes || [])
          .filter(a => a.name.startsWith('data-'))
          .map(a => `${a.name}=${a.value?.slice(0, 30)}`);

        // 이름 후보 텍스트
        const strongText = child.querySelector('strong')?.textContent?.trim();
        const firstText = child.textContent?.trim()?.slice(0, 100);

        return {
          index: i,
          tag,
          role: role || undefined,
          class: cls || undefined,
          ariaLabel: ariaLabel || undefined,
          dataAttrs: dataAttrs.length ? dataAttrs : undefined,
          strongText: strongText || undefined,
          textPreview: firstText || undefined,
        };
      }),
    };
  });

  console.log(JSON.stringify(rowInfo, null, 2));

  // ── 3단계: 학생 이름 포함 요소 직접 검색 ──
  console.log('\n═══ 학생 이름 검색 (strong 태그) ═══\n');

  const nameSearch = await page.evaluate(() => {
    // 페이지 전체에서 strong 태그 검색
    const allStrongs = document.querySelectorAll('strong');
    const results = [];

    allStrongs.forEach((el, i) => {
      const text = el.textContent?.trim();
      if (!text || text.length > 30) return; // 이름은 30자 이하

      // 부모 체인 추적
      const parents = [];
      let p = el.parentElement;
      for (let d = 0; d < 5 && p; d++) {
        parents.push({
          tag: p.tagName?.toLowerCase(),
          role: p.getAttribute('role') || undefined,
          class: p.className?.toString()?.slice(0, 60) || undefined,
        });
        p = p.parentElement;
      }

      results.push({
        text,
        parents,
      });
    });

    return results;
  });

  console.log(`strong 태그 ${nameSearch.length}개 발견:`);
  nameSearch.forEach((item, i) => {
    console.log(`  ${i + 1}. "${item.text}"`);
    console.log(`     부모체인: ${item.parents.map(p => `${p.tag}${p.role ? `[role="${p.role}"]` : ''}${p.class ? `.${p.class.split(' ')[0]}` : ''}`).join(' > ')}`);
  });

  // ── 4단계: iframe 확인 ──
  console.log('\n═══ iframe 확인 ═══\n');
  const frames = page.frames();
  console.log(`프레임 수: ${frames.length}`);
  frames.forEach((f, i) => {
    console.log(`  ${i}. ${f.url().slice(0, 100)}`);
  });

  // iframe 내부에 grid가 있는지 확인
  for (const frame of frames) {
    if (frame === page.mainFrame()) continue;
    try {
      const hasGrid = await frame.evaluate(() => {
        return !!document.querySelector('[role="grid"]');
      });
      if (hasGrid) {
        console.log(`\n  *** iframe에서 grid 발견! URL: ${frame.url()}`);
      }
    } catch {
      // cross-origin frame
    }
  }

  // ── 5단계: Shadow DOM 확인 ──
  console.log('\n═══ Shadow DOM 확인 ═══\n');

  const shadowCheck = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const shadowHosts = [];
    allElements.forEach(el => {
      if (el.shadowRoot) {
        shadowHosts.push({
          tag: el.tagName?.toLowerCase(),
          class: el.className?.toString()?.slice(0, 60),
          shadowChildCount: el.shadowRoot.children?.length || 0,
        });
      }
    });
    return shadowHosts;
  });

  if (shadowCheck.length > 0) {
    console.log(`Shadow DOM 호스트 ${shadowCheck.length}개 발견:`);
    shadowCheck.forEach((h, i) => console.log(`  ${i + 1}. <${h.tag}> class="${h.class}" (shadow children: ${h.shadowChildCount})`));
  } else {
    console.log('Shadow DOM 없음');
  }

  console.log('\n═══ 디버그 완료 ═══');
  console.log('브라우저 세션 유지 중...');
}

debug().catch(console.error);
