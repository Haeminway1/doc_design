#!/usr/bin/env node

/**
 * 카카오비즈니스 채팅 이미지 자동 다운로드 스크립트 v3
 *
 * 사용법:
 *   node 04_scripts/download-kakao-images.js [옵션]
 *
 * 옵션:
 *   --days N          : 최근 N일 이미지 (기본 2 = 어제+오늘)
 *   --student 이름    : 특정 학생만 처리 (예: 정재영)
 *   --date YYMMDD     : 특정 날짜만 처리 (예: 260219)
 *   --port N          : CDP 포트 (기본 47304, 환경변수 CDP_PORT도 지원)
 *
 * 예시:
 *   node 04_scripts/download-kakao-images.js                    # 전체 학생, 최근 2일
 *   node 04_scripts/download-kakao-images.js --days 3           # 전체 학생, 최근 3일
 *   node 04_scripts/download-kakao-images.js --student 정재영   # 정재영만, 최근 2일
 *   node 04_scripts/download-kakao-images.js --date 260220      # 전체 학생, 2월 20일만
 *   node 04_scripts/download-kakao-images.js --student 조근영 --date 260219
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── CLI 인자 파싱 ──
const args = process.argv.slice(2);

function getArg(name, defaultVal = null) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : defaultVal;
}

const daysArg  = parseInt(getArg('--days', '2'), 10);
const studentArg = getArg('--student');      // 특정 학생 이름 (선택)
const dateArg  = getArg('--date');           // 특정 날짜 YYMMDD (선택)
const portArg  = getArg('--port') || process.env.CDP_PORT || '47304';
const cdpPort  = parseInt(portArg, 10);

// ── 설정 ──
const CONFIG = {
  profileId: '_xjYlxan',
  baseDir: path.join(__dirname, '..', '00_tutoring'),
  cdpUrl: `http://127.0.0.1:${cdpPort}`,
  chatListUrl: 'https://business.kakao.com/_xjYlxan/chats',

  // 제외할 학생 (이탈/x 표시 + 조교)
  excludedStudents: [
    'x유연우', 'x박민교', 'x하나윤', 'x임소희', 'x강예슬',
    'x정민혁', 'x양지수', 'x이연율', '김의진', '김해민(조교)',
  ],

  days: daysArg,
};

// ── 유틸리티 ──

/** Date → YYMMDD */
function formatDate(date) {
  const y = date.getFullYear().toString().slice(2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** YYMMDD → Date */
function parseYYMMDD(str) {
  if (!str || str.length !== 6) return null;
  const y = 2000 + parseInt(str.slice(0, 2), 10);
  const m = parseInt(str.slice(2, 4), 10) - 1;
  const d = parseInt(str.slice(4, 6), 10);
  return new Date(y, m, d, 0, 0, 0, 0);
}

/** "김지환(26.02.09)" → "김지환" */
function cleanStudentName(fullName) {
  return fullName.replace(/\(.*$/, '').trim();
}

/** 기준 cutoff 타임스탬프 계산 */
function calcCutoff() {
  if (dateArg) {
    // 특정 날짜: 해당 날짜 자정 ~ 다음날 자정
    const d = parseYYMMDD(dateArg);
    if (!d) throw new Error(`--date 형식 오류: ${dateArg} (예: 260219)`);
    return { from: d.getTime(), to: d.getTime() + 86400000 };
  }
  // N일 전 자정 ~ 지금
  const from = new Date();
  from.setDate(from.getDate() - (CONFIG.days - 1));
  from.setHours(0, 0, 0, 0);
  return { from: from.getTime(), to: Date.now() + 86400000 };
}

/** MIME → 확장자 */
function mimeToExt(mime) {
  if (!mime) return '.jpg';
  if (mime.includes('png'))  return '.png';
  if (mime.includes('webp')) return '.webp';
  return '.jpg';
}

/** 이미지 다운로드 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
      stream.on('error', (err) => { try { fs.unlinkSync(filepath); } catch (_) {} reject(err); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/** 폴더 생성 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  📁 폴더 생성: ${dirPath}`);
  }
  return dirPath;
}

// ── 학생 목록 추출 (브라우저 API 방식 - DOM 의존 없음) ──
async function fetchStudentList(page) {
  // 카카오 비즈니스 내부 API로 채팅방 목록 조회
  // 여러 엔드포인트 시도
  const result = await page.evaluate(async (profileId) => {
    const endpoints = [
      `/api/profiles/${profileId}/chats?size=200&status=active`,
      `/api/profiles/${profileId}/chats?size=200`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          return { ok: true, items: data.items, endpoint: url };
        }
      } catch (_) {}
    }
    return { ok: false };
  }, CONFIG.profileId);

  return result;
}

// ── 학생 목록 추출 (DOM + React fiber 방식 - fallback) ──
async function extractStudentsFromDOM(page) {
  return page.evaluate((excluded) => {
    // 여러 selector 시도
    const selectors = [
      '[role="grid"] [role="row"] li',
      '[role="grid"] li',
      '.chat_list_wrap li',
      'li[data-chatid]',
    ];

    let items = [];
    for (const sel of selectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) { items = Array.from(found); break; }
    }

    const result = [];

    items.forEach(li => {
      // 이름 추출 (다양한 selector 시도)
      const nameEl =
        li.querySelector('strong.tit_info span.txt_name') ||
        li.querySelector('[class*="name"]') ||
        li.querySelector('strong') ||
        li.querySelector('[role="heading"]');

      if (!nameEl) return;

      // 뱃지 숫자 등 불필요한 텍스트 제거
      const rawName = Array.from(nameEl.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !n.classList.contains('badge')))
        .map(n => n.textContent)
        .join('').trim();

      if (!rawName) return;
      const fullName = rawName.trim();
      const cleanName = fullName.replace(/\(.*$/, '').trim();

      // 제외 필터
      if (!cleanName) return;
      if (fullName.startsWith('x')) return;
      if (excluded.some(ex => {
        const exClean = ex.replace(/\(.*$/, '').trim();
        return fullName.includes(ex) || cleanName === exClean;
      })) return;

      // React fiber에서 chatId 추출
      let chatId = null;
      const fiberCandidates = [li, li.querySelector('a'), li.querySelector('[data-chatid]')].filter(Boolean);

      for (const el of fiberCandidates) {
        // data 속성에서 직접 시도
        if (el.dataset?.chatid) { chatId = el.dataset.chatid; break; }

        // React fiber 탐색
        const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        if (fiberKey) {
          let fiber = el[fiberKey];
          for (let i = 0; i < 40 && fiber; i++) {
            const props = fiber.memoizedProps || fiber.pendingProps;
            if (props) {
              // chat 객체 (Map or plain object)
              if (props.chat) {
                chatId = typeof props.chat.get === 'function'
                  ? props.chat.get('id')
                  : props.chat.id || props.chat.chatId;
                if (chatId) break;
              }
              // chatId 직접
              if (props.chatId || props.chatid) {
                chatId = props.chatId || props.chatid;
                break;
              }
            }
            fiber = fiber.return;
          }
        }
        if (chatId) break;
      }

      if (chatId) {
        result.push({ fullName, cleanName, chatId: String(chatId) });
      }
    });

    return result;
  }, CONFIG.excludedStudents);
}

// ── 메인 ──
async function main() {
  console.log('🚀 카카오비즈니스 이미지 다운로드 v3\n');

  // 날짜 범위 계산
  const { from: cutoffFrom, to: cutoffTo } = calcCutoff();
  if (dateArg) {
    console.log(`📅 대상 날짜: ${dateArg} (${new Date(cutoffFrom).toLocaleDateString('ko-KR')})`);
  } else {
    console.log(`📅 최근 ${CONFIG.days}일 이미지 대상`);
    console.log(`⏰ 기준: ${new Date(cutoffFrom).toLocaleString('ko-KR')} 이후`);
  }
  if (studentArg) console.log(`👤 대상 학생: ${studentArg}`);
  console.log(`🔌 CDP 포트: ${cdpPort}\n`);

  // 브라우저 연결
  console.log('🔗 브라우저 연결 중...');
  const browser = await puppeteer.connect({
    browserURL: CONFIG.cdpUrl,
    defaultViewport: null,
  });

  const pages = await browser.pages();

  // 카카오비즈니스 페이지 찾기 or 새탭
  let page = pages.find(p => p.url().includes('business.kakao.com') && !p.url().includes('/login'))
    || pages.find(p => p.url().includes('business.kakao.com'));

  if (!page) {
    page = await browser.newPage();
  }

  // 채팅 목록 페이지로 이동 (필요시)
  const currentUrl = page.url();
  if (!currentUrl.includes('business.kakao.com') || currentUrl.includes('/login')) {
    console.log('  📍 카카오비즈니스 로그인 필요 — 자동 이동...');
    await page.goto(CONFIG.chatListUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);
  } else if (!currentUrl.endsWith('/chats')) {
    console.log('  📍 채팅 목록으로 이동...');
    await page.goto(CONFIG.chatListUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
  }

  console.log('✅ 브라우저 연결 완료\n');

  // 채팅 목록 로딩 대기
  console.log('📋 채팅 목록 로딩 중...');
  try {
    await page.waitForSelector('[role="grid"]', { timeout: 20000 });
  } catch (_) {
    console.log('  ⚠️  grid 로딩 타임아웃, 계속 진행...');
  }
  await sleep(2500);

  // 학생 목록 추출 (DOM + React fiber)
  let students = await extractStudentsFromDOM(page);

  // 재시도 (필요시)
  if (students.length === 0) {
    console.log('  🔄 학생 목록 재시도 중...');
    await sleep(3000);
    students = await extractStudentsFromDOM(page);
  }

  console.log(`✅ 활성 학생: ${students.length}명\n`);
  students.forEach((s, i) => console.log(`  ${i + 1}. ${s.fullName} (chat: ${s.chatId})`));
  console.log('');

  if (students.length === 0) {
    console.log('⚠️  학생이 0명입니다. 페이지를 확인해주세요.');
    console.log('   - https://business.kakao.com/_xjYlxan/chats 가 열려 있는지 확인');
    console.log('   - 로그인 상태 확인');
    return;
  }

  // 특정 학생 필터
  const targetStudents = studentArg
    ? students.filter(s => s.cleanName.includes(studentArg) || s.fullName.includes(studentArg))
    : students;

  if (studentArg && targetStudents.length === 0) {
    console.log(`⚠️  "${studentArg}" 학생을 찾을 수 없습니다.`);
    console.log(`   전체 학생 목록: ${students.map(s => s.cleanName).join(', ')}`);
    return;
  }

  // 각 학생 처리
  let totalDownloaded = 0;

  for (const student of targetStudents) {
    console.log(`\n👤 ${student.fullName}`);

    try {
      // Chatlog API 호출
      const chatlogs = await page.evaluate(async (profileId, chatId) => {
        const res = await fetch(
          `/api/profiles/${profileId}/chats/${chatId}/chatlogs?size=200`,
          { credentials: 'include' }
        );
        if (!res.ok) return { error: `API ${res.status}` };
        return res.json();
      }, CONFIG.profileId, student.chatId);

      if (chatlogs.error) {
        console.log(`  ❌ API 오류: ${chatlogs.error}`);
        continue;
      }

      if (!chatlogs.items || chatlogs.items.length === 0) {
        console.log('  📭 메시지 없음');
        continue;
      }

      // 이미지 메시지 필터링
      // type 2 = 단일 사진, type 27 = 이미지 묶음
      // 학생이 보낸 것만 (teacher = profileId 제외)
      const imageMessages = chatlogs.items.filter(msg => {
        if (msg.type !== 2 && msg.type !== 27) return false;
        if (msg.author_id === `_${CONFIG.profileId}` || msg.author_id === CONFIG.profileId) return false;
        if (msg.send_at < cutoffFrom || msg.send_at >= cutoffTo) return false;
        return true;
      });

      if (imageMessages.length === 0) {
        const label = dateArg ? dateArg : `최근 ${CONFIG.days}일`;
        console.log(`  📷 ${label} 이미지 없음`);
        continue;
      }

      // URL 수집
      const imageUrls = [];
      for (const msg of imageMessages) {
        const att = msg.attachment || {};
        const sendDate = new Date(msg.send_at);
        const dateStr = formatDate(sendDate);
        const msgId = msg.id; // 메시지 고유 ID

        if (msg.type === 2) {
          const url = att.secureUrl;
          const ext = mimeToExt(att.mt);
          if (url) imageUrls.push({ 
            url, ext, dateStr, 
            w: att.w, h: att.h, size: att.s,
            msgId, idx: 0 
          });
        } else if (msg.type === 27) {
          const urls = att.secureImageUrls || [];
          const mimeTypes = att.mtl || [];
          urls.forEach((url, idx) => {
            if (url) imageUrls.push({
              url, ext: mimeToExt(mimeTypes[idx]), dateStr,
              w: (att.wl || [])[idx], h: (att.hl || [])[idx], size: (att.sl || [])[idx],
              msgId, idx
            });
          });
        }
      }

      console.log(`  📷 이미지 ${imageUrls.length}개 발견 (${imageMessages.length}개 메시지)`);
      if (imageUrls.length === 0) continue;

      // 날짜별 그룹
      const byDate = {};
      for (const img of imageUrls) {
        if (!byDate[img.dateStr]) byDate[img.dateStr] = [];
        byDate[img.dateStr].push(img);
      }

      let studentDownloaded = 0;

      for (const [dateStr, imgs] of Object.entries(byDate)) {
        const folderPath = ensureDir(
          path.join(CONFIG.baseDir, student.cleanName, 'input', dateStr)
        );

        // URL 매니페스트 로드 (중복 방지)
        const manifestPath = path.join(folderPath, '.manifest.json');
        let manifest = {};
        try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) {}

        // 기존 파일 수 확인 (이어서 번호 매기기)
        const existingCount = fs.readdirSync(folderPath)
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
        let seq = existingCount;

        for (const img of imgs) {
          // 메시지 ID 기반 중복 체크 (URL은 변동 가능하므로 사용 X)
          // 구버전 manifest(URL 키) 호환성 유지: URL 키가 있으면 건너뜀
          const uniqueKey = `${img.msgId}_${img.idx}`;
          
          if (manifest[uniqueKey]) {
            // console.log(`  ⏭️  중복 (MsgID): ${manifest[uniqueKey]}`);
            continue;
          }
          if (manifest[img.url]) {
             // console.log(`  ⏭️  중복 (URL): ${manifest[img.url]}`);
             // 새 키 포맷으로 마이그레이션
             manifest[uniqueKey] = manifest[img.url];
             continue; 
          }

          seq++;
          const filename = `${student.cleanName}_${dateStr}_${String(seq).padStart(2, '0')}${img.ext}`;
          const filepath = path.join(folderPath, filename);

          // 파일 시스템 체크 (매니페스트 누락 대비)
          if (fs.existsSync(filepath)) {
            // console.log(`  ⏭️  파일 존재: ${filename}`);
            manifest[uniqueKey] = filename;
            manifest[img.url] = filename; // 구버전 호환용
            continue;
          }

          try {
            await downloadImage(img.url, filepath);
            const stat = fs.statSync(filepath);
            if (stat.size === 0) {
              fs.unlinkSync(filepath);
              console.log(`  ❌ 빈 파일 삭제: ${filename}`);
              seq--;
            } else {
              const sizeKB = Math.round(stat.size / 1024);
              const dim = img.w && img.h ? ` ${img.w}x${img.h}` : '';
              console.log(`  ✅ ${filename} (${sizeKB}KB${dim})`);
              studentDownloaded++;
              
              // 매니페스트 업데이트
              manifest[uniqueKey] = filename;
              manifest[img.url] = filename; // URL도 일단 저장 (혹시 모를 호환성)
              fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            }
          } catch (err) {
            console.log(`  ❌ 다운로드 실패: ${filename} - ${err.message}`);
            seq--;
          }
        }

        // 최종 매니페스트 저장
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      }

      totalDownloaded += studentDownloaded;
      console.log(`  📊 ${studentDownloaded}/${imageUrls.length}개 다운로드`);

    } catch (err) {
      console.log(`  ❌ 오류: ${err.message}`);
    }
  }

  console.log(`\n\n✅ 완료! 총 ${totalDownloaded}개 이미지 다운로드`);
  console.log(`📁 저장 위치: ${CONFIG.baseDir}/\n`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ 치명적 오류:', err);
    process.exit(1);
  });
}
