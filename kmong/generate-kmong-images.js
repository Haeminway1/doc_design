#!/usr/bin/env node
/**
 * generate-kmong-images.js
 * 크몽 서비스 등록용 이미지 전체 생성
 * - main-01.png (652x488): AI 배경 + 텍스트 오버레이
 * - main-02.png (652x488): 포트폴리오 6장 그리드
 * - detail-01.png (860x520): 서비스 소개
 * - detail-02.png (860x1100): 포트폴리오 쇼케이스
 * - detail-03.png (860x540): 패키지 비교표
 * - detail-04.png (860x280): 작업 프로세스
 * - detail-05.png (860x440): FAQ
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname);
const PORTFOLIO = path.join(ROOT, 'portfolio');
const OUTPUT = path.join(ROOT, 'images');
const API_KEY = process.env.GEMINI_API_KEY;

// Fonts & Colors
const FONT = `'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;
const FONT_EN = `'Inter', 'Helvetica Neue', sans-serif`;
const NAVY = '#1B2838';
const GOLD = '#C8A96E';
const LIGHT = '#F8F9FA';
const WHITE = '#FFFFFF';
const DARK = '#1E2430';
const SUB = '#5A6B7F';

function esc(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function resizePage(file, w, h, pos = 'top', blurSigma = 0) {
  let pipeline = sharp(path.join(PORTFOLIO, file))
    .resize(w, h, { fit: 'cover', position: pos });
  if (blurSigma > 0) pipeline = pipeline.blur(blurSigma);
  return pipeline.png().toBuffer();
}

// ─── Gemini / Imagen API ─────────────────────────────────

async function generateImageGemini(prompt) {
  const model = 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    })
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  for (const part of data.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return Buffer.from(part.inlineData.data, 'base64');
  }
  throw new Error('No image in Gemini response');
}

async function generateImageImagen(prompt) {
  const model = 'imagen-4.0-generate-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '4:3' }
    })
  });
  if (!res.ok) throw new Error(`Imagen ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const pred = data.predictions?.[0];
  if (pred?.bytesBase64Encoded) return Buffer.from(pred.bytesBase64Encoded, 'base64');
  throw new Error('No image in Imagen response');
}

async function generateAIImage(prompt) {
  // Try Imagen first (higher quality), fallback to Gemini
  for (const [name, fn] of [['imagen-4.0', generateImageImagen], ['gemini-2.5-flash', generateImageGemini]]) {
    try {
      console.log(`  Trying ${name}...`);
      const buf = await fn(prompt);
      console.log(`  ✓ Generated with ${name}`);
      return buf;
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message.slice(0, 120)}`);
    }
  }
  throw new Error('All image generation models failed');
}

// ─── Main 1: Hero Thumbnail (652x488) ────────────────────

async function generateMain01() {
  console.log('\n[1/7] main-01.png — Hero thumbnail');

  const W = 652, H = 488;

  const bgPrompt = `A flat-lay photograph of premium English textbooks and workbooks spread on a clean white marble desk. Include: an open A4 workbook showing neatly formatted English grammar questions with multiple choice answers, a closed textbook with a sleek navy cover, colored sticky tabs, a mechanical pencil, and a small succulent plant. Top-down camera angle. Soft natural window light from the left. Shallow depth of field. Professional product photography style. Korean academy aesthetic. No text visible. Aspect ratio 4:3.`;

  const bgRaw = await generateAIImage(bgPrompt);
  const bg = await sharp(bgRaw).resize(W, H, { fit: 'cover' }).png().toBuffer();

  // Right panel overlay + text
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <rect x="${W * 0.48}" y="0" width="${W * 0.52}" height="${H}" fill="rgba(27,40,56,0.88)"/>
    <text x="${W*0.53}" y="120" font-size="38" font-weight="800" fill="${WHITE}">영어 교재</text>
    <text x="${W*0.53}" y="168" font-size="38" font-weight="800" fill="${WHITE}">디자인·편집</text>
    <rect x="${W*0.53}" y="185" width="80" height="3" fill="${GOLD}"/>
    <text x="${W*0.53}" y="225" font-size="16" fill="#D0DAE8">내지 1p  5,000원~</text>
    <text x="${W*0.53}" y="252" font-size="16" fill="#D0DAE8">표지 1종  30,000원~</text>
    <text x="${W*0.53}" y="279" font-size="16" fill="#D0DAE8">풀패키지  150,000원~</text>
    <rect x="${W*0.53}" y="305" width="210" height="38" rx="19" fill="${GOLD}"/>
    <text x="${W*0.53+18}" y="330" font-size="16" font-weight="700" fill="${DARK}">영어를 아는 전문 제작자</text>
    <text x="${W*0.53}" y="390" font-size="13" fill="#8899AA">문법 · 독해 · 어휘 · 구문 · 모의고사</text>
    <text x="${W*0.53}" y="414" font-size="13" fill="#8899AA">내신 · 수능 · 편입 교재 전문</text>
  </svg>`;

  await sharp(bg)
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
    .png().toFile(path.join(OUTPUT, 'main-01.png'));
  console.log('  ✓ Saved main-01.png');
}

// ─── Main 2: Portfolio Grid (652x488) ────────────────────

async function generateMain02() {
  console.log('\n[2/7] main-02.png — Portfolio grid');

  const W = 652, H = 488;
  const barH = 48;
  const gap = 6;
  const cols = 3, rows = 2;
  const cellW = Math.floor((W - gap * (cols + 1)) / cols);
  const cellH = Math.floor((H - barH - gap * (rows + 1)) / rows);

  const pages = [
    'bridge-vol2_p70.png',   // table
    'bridge-vol1_p89.png',   // X/✓ examples
    'verajin_p03.png',       // TOC
    'bridge-vol2_p47.png',   // Part heading
    'bridge-vol1_p59.png',   // 공략법
    'verajin_p04.png',       // TOC + Answer Key
  ];

  const bg = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 240, g: 241, b: 243, alpha: 1 } } }).png().toBuffer();
  const composites = [];

  for (let i = 0; i < pages.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gap + col * (cellW + gap);
    const y = gap + row * (cellH + gap);
    // Add white border effect
    const borderSvg = `<svg width="${cellW+4}" height="${cellH+4}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${cellW+4}" height="${cellH+4}" rx="4" fill="white"/>
    </svg>`;
    composites.push({ input: Buffer.from(borderSvg), left: x - 2, top: y - 2 });
    composites.push({ input: await resizePage(pages[i], cellW, cellH, 'top', 1.5), left: x, top: y });
  }

  const barSvg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <rect y="${H - barH}" width="${W}" height="${barH}" fill="rgba(27,40,56,0.90)"/>
    <text x="${W/2}" y="${H - 14}" font-size="18" font-weight="700" fill="${WHITE}" text-anchor="middle">실제 작업물 포트폴리오</text>
  </svg>`;
  composites.push({ input: Buffer.from(barSvg), left: 0, top: 0 });

  await sharp(bg).composite(composites).png().toFile(path.join(OUTPUT, 'main-02.png'));
  console.log('  ✓ Saved main-02.png');
}

// ─── Detail 1: Service Intro (860x520) ───────────────────

async function generateDetail01() {
  console.log('\n[3/7] detail-01.png — Service intro');

  const W = 860, H = 520;
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <!-- Header -->
    <rect width="${W}" height="120" fill="${NAVY}"/>
    <text x="40" y="52" font-size="28" font-weight="800" fill="${WHITE}">영어를 이해하는 교재 제작자</text>
    <text x="40" y="88" font-size="16" fill="#B0C4DE">문항 구조를 아는 사람이 만드는 학원형 교재 디자인</text>

    <!-- Target customers -->
    <rect y="120" width="${W}" height="200" fill="${WHITE}"/>
    <text x="40" y="164" font-size="20" font-weight="700" fill="${DARK}">이런 분께 맞습니다</text>
    <rect x="40" y="174" width="60" height="3" fill="${GOLD}"/>
    <text x="62" y="208" font-size="15" fill="${SUB}">✓  영어 강의는 자신 있는데 교재 결과물이 아쉬운 강사님</text>
    <text x="62" y="238" font-size="15" fill="${SUB}">✓  내신 변형, 수능/편입 모의를 학원 브랜드형으로 만들고 싶은 분</text>
    <text x="62" y="268" font-size="15" fill="${SUB}">✓  원고는 있는데 가독성과 완성도를 올리고 싶은 분</text>
    <text x="62" y="298" font-size="15" fill="${SUB}">✓  표지부터 내지, 정답·해설, PDF까지 한 번에 맡기고 싶은 분</text>

    <!-- Differentiators -->
    <rect y="320" width="${W}" height="200" fill="${LIGHT}"/>
    <text x="40" y="362" font-size="20" font-weight="700" fill="${DARK}">다른 서비스와 다른 점</text>
    <rect x="40" y="372" width="60" height="3" fill="${GOLD}"/>

    <!-- 3 cards -->
    <rect x="40" y="395" width="240" height="90" rx="12" fill="${WHITE}" stroke="#E8ECF0" stroke-width="1"/>
    <text x="160" y="433" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">영어 전공자가</text>
    <text x="160" y="458" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">직접 편집</text>

    <rect x="310" y="395" width="240" height="90" rx="12" fill="${WHITE}" stroke="#E8ECF0" stroke-width="1"/>
    <text x="430" y="433" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">인쇄 최적화</text>
    <text x="430" y="458" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">PDF 납품</text>

    <rect x="580" y="395" width="240" height="90" rx="12" fill="${WHITE}" stroke="#E8ECF0" stroke-width="1"/>
    <text x="700" y="433" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">빠른 납기</text>
    <text x="700" y="458" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">3일~</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUTPUT, 'detail-01.png'));
  console.log('  ✓ Saved detail-01.png');
}

// ─── Detail 2: Portfolio Showcase (860x1100) ─────────────

async function generateDetail02() {
  console.log('\n[4/7] detail-02.png — Portfolio showcase');

  const W = 860, H = 1100;
  const headerH = 70;
  const sectionH = Math.floor((H - headerH) / 3);
  const coverW = 190, coverH = 268;
  const innerW = 155, innerH = 219;

  const books = [
    { name: '예시 1 — 편입영어 문법', sub: '문법 교재 (176p)', cover: 'bridge-vol1_p01.png', pages: ['bridge-vol1_p89.png', 'bridge-vol1_p59.png'] },
    { name: '예시 2 — 편입영어 문법', sub: '문법 교재 (138p)', cover: 'bridge-vol2_p01.png', pages: ['bridge-vol2_p47.png', 'bridge-vol2_p70.png'] },
    { name: '예시 3 — 구문독해', sub: '구문독해 교재 (263p)', cover: 'verajin_p01.png', pages: ['verajin_p03.png', 'verajin_p04.png'] },
  ];

  // Background SVG
  const bgParts = books.map((b, i) => {
    const y = headerH + i * sectionH;
    const bg = i % 2 === 0 ? WHITE : LIGHT;
    return `
      <rect x="0" y="${y}" width="${W}" height="${sectionH}" fill="${bg}"/>
      <text x="280" y="${y + 32}" font-size="20" font-weight="700" fill="${NAVY}">${esc(b.name)}</text>
      <text x="280" y="${y + 56}" font-size="14" fill="${SUB}">${esc(b.sub)}</text>
      <rect x="280" y="${y + 64}" width="50" height="2" fill="${GOLD}"/>`;
  }).join('');

  const bgSvg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <rect width="${W}" height="${headerH}" fill="${NAVY}"/>
    <text x="${W/2}" y="45" font-size="26" font-weight="800" fill="${WHITE}" text-anchor="middle">실제 작업물</text>
    ${bgParts}
  </svg>`;

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const composites = [];

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const baseY = headerH + i * sectionH + 30;

    // Shadow effect for cover
    const shadowSvg = `<svg width="${coverW+8}" height="${coverH+8}" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="${coverW}" height="${coverH}" rx="4" fill="rgba(0,0,0,0.15)"/>
    </svg>`;
    composites.push({ input: Buffer.from(shadowSvg), left: 48, top: baseY + 2 });
    composites.push({ input: await resizePage(b.cover, coverW, coverH, 'centre', 8), left: 50, top: baseY });

    // Inner pages
    for (let j = 0; j < b.pages.length; j++) {
      const x = 280 + j * (innerW + 16);
      const y = baseY + 80;
      const pageShadow = `<svg width="${innerW+6}" height="${innerH+6}" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="${innerW}" height="${innerH}" rx="3" fill="rgba(0,0,0,0.12)"/>
      </svg>`;
      composites.push({ input: Buffer.from(pageShadow), left: x, top: y });
      composites.push({ input: await resizePage(b.pages[j], innerW, innerH, 'top', 1.5), left: x + 1, top: y - 1 });
    }
  }

  await sharp(bg).composite(composites).png().toFile(path.join(OUTPUT, 'detail-02.png'));
  console.log('  ✓ Saved detail-02.png');
}

// ─── Detail 3: Package Comparison (860x540) ──────────────

async function generateDetail03() {
  console.log('\n[5/7] detail-03.png — Package comparison');

  const W = 860, H = 540;
  const cardW = 240, cardH = 360;
  const gap = 30;
  const startX = (W - (cardW * 3 + gap * 2)) / 2;

  const pkgs = [
    { name: 'STANDARD', price: '5,000원', unit: '내지 1p 편집', items: ['텍스트 기반 내지 편집', '문항/선지 구조 정리', 'A4 인쇄용 PDF', '수정 2회 · 납기 3일'], bg: WHITE, border: '#E0E4E8', badge: null },
    { name: 'DELUXE', price: '30,000원', unit: '표지 1종 디자인', items: ['앞표지 + 뒤표지', '로고 배치 · 시안 2종', '인쇄용 + 웹용 PDF', '수정 3회 · 납기 5일'], bg: '#F0F6FF', border: '#B8D0F0', badge: '인기' },
    { name: 'PREMIUM', price: '150,000원', unit: '풀패키지 (20p)', items: ['표지 1종 (앞/뒤)', '내지 템플릿 시스템', '목차 + 정답·해설 구성', '수정 3회 · 납기 7일'], bg: NAVY, border: GOLD, badge: 'BEST', dark: true },
  ];

  const cards = pkgs.map((p, i) => {
    const x = startX + i * (cardW + gap);
    const y = 100;
    const textColor = p.dark ? WHITE : DARK;
    const subColor = p.dark ? '#A0B8D0' : SUB;
    const priceColor = p.dark ? GOLD : NAVY;

    let badge = '';
    if (p.badge) {
      badge = `
        <rect x="${x + cardW - 70}" y="${y - 14}" width="70" height="28" rx="14" fill="${GOLD}"/>
        <text x="${x + cardW - 35}" y="${y + 5}" font-size="13" font-weight="700" fill="${DARK}" text-anchor="middle">${p.badge}</text>`;
    }

    const items = p.items.map((item, j) =>
      `<text x="${x + 24}" y="${y + 210 + j * 30}" font-size="14" fill="${subColor}">· ${esc(item)}</text>`
    ).join('');

    return `
      <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="16" fill="${p.bg}" stroke="${p.border}" stroke-width="2"/>
      ${badge}
      <text x="${x + 24}" y="${y + 42}" font-size="18" font-weight="800" fill="${textColor}">${p.name}</text>
      <text x="${x + 24}" y="${y + 86}" font-size="32" font-weight="800" fill="${priceColor}">${p.price}</text>
      <text x="${x + 24}" y="${y + 115}" font-size="14" fill="${subColor}">${esc(p.unit)}</text>
      <rect x="${x + 24}" y="${y + 130}" width="${cardW - 48}" height="1" fill="${p.dark ? 'rgba(255,255,255,0.15)' : '#E8ECF0'}"/>
      ${items}`;
  }).join('');

  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <rect width="${W}" height="${H}" fill="${LIGHT}"/>
    <text x="${W/2}" y="45" font-size="26" font-weight="800" fill="${NAVY}" text-anchor="middle">패키지 안내</text>
    <text x="${W/2}" y="72" font-size="14" fill="${SUB}" text-anchor="middle">시험지 편집부터 브랜드형 교재 패키지까지</text>
    ${cards}
    <text x="${W/2}" y="${H - 30}" font-size="13" fill="${SUB}" text-anchor="middle">추가 페이지 p당 4,000원  ·  24p 이상 대량 작업 시 단가 조율 가능</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUTPUT, 'detail-03.png'));
  console.log('  ✓ Saved detail-03.png');
}

// ─── Detail 4: Process Flow (860x280) ────────────────────

async function generateDetail04() {
  console.log('\n[6/7] detail-04.png — Process flow');

  const W = 860, H = 280;
  const steps = [
    { num: '01', title: '상담', desc: '분량/일정/스타일' },
    { num: '02', title: '원고 수령', desc: 'HWP/Word/PDF' },
    { num: '03', title: '시안 제작', desc: '핵심 페이지 샘플' },
    { num: '04', title: '수정', desc: '피드백 반영' },
    { num: '05', title: 'PDF 납품', desc: '인쇄용+웹용' },
  ];

  const stepW = 130;
  const totalW = steps.length * stepW + (steps.length - 1) * 30;
  const startX = (W - totalW) / 2;

  const stepsHtml = steps.map((s, i) => {
    const cx = startX + i * (stepW + 30) + stepW / 2;
    const cy = 130;
    const arrow = i < steps.length - 1
      ? `<line x1="${cx + stepW/2 + 4}" y1="${cy}" x2="${cx + stepW/2 + 26}" y2="${cy}" stroke="${GOLD}" stroke-width="2" marker-end="url(#arrowhead)"/>`
      : '';
    return `
      <rect x="${cx - stepW/2}" y="${cy - 40}" width="${stepW}" height="80" rx="12" fill="${WHITE}" stroke="#E0E4E8" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy - 55}" r="16" fill="${NAVY}"/>
      <text x="${cx}" y="${cy - 50}" font-size="12" font-weight="700" fill="${WHITE}" text-anchor="middle">${s.num}</text>
      <text x="${cx}" y="${cy + 2}" font-size="16" font-weight="700" fill="${NAVY}" text-anchor="middle">${esc(s.title)}</text>
      <text x="${cx}" y="${cy + 24}" font-size="12" fill="${SUB}" text-anchor="middle">${esc(s.desc)}</text>
      ${arrow}`;
  }).join('');

  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="${GOLD}"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" fill="${LIGHT}"/>
    <text x="${W/2}" y="42" font-size="24" font-weight="800" fill="${NAVY}" text-anchor="middle">진행 순서</text>
    <text x="${W/2}" y="66" font-size="14" fill="${SUB}" text-anchor="middle">상담부터 최종 PDF 납품까지 평균 3~7일</text>
    ${stepsHtml}
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUTPUT, 'detail-04.png'));
  console.log('  ✓ Saved detail-04.png');
}

// ─── Detail 5: FAQ (860x440) ─────────────────────────────

async function generateDetail05() {
  console.log('\n[7/7] detail-05.png — FAQ');

  const W = 860, H = 440;
  const faqs = [
    { q: '표지만 따로 의뢰할 수 있나요?', a: '네, DELUXE 패키지로 표지만 주문 가능합니다.' },
    { q: '내지 1p만도 가능한가요?', a: '가능합니다. STANDARD 패키지(5,000원)로 신청해주세요.' },
    { q: '급한 일정도 가능한가요?', a: '가능 여부를 먼저 확인 후 안내드립니다. 긴급 작업은 추가 비용이 발생할 수 있습니다.' },
    { q: '24p 이상 대량 작업도 가능한가요?', a: '가능합니다. 분량이 많으면 p당 단가를 조율해드립니다.' },
  ];

  const itemH = 72;
  const startY = 90;

  const items = faqs.map((f, i) => {
    const y = startY + i * (itemH + 10);
    return `
      <rect x="30" y="${y}" width="${W - 60}" height="${itemH}" rx="10" fill="${WHITE}" stroke="#E8ECF0" stroke-width="1"/>
      <text x="56" y="${y + 28}" font-size="15" font-weight="700" fill="${NAVY}">Q.  ${esc(f.q)}</text>
      <text x="56" y="${y + 54}" font-size="14" fill="${SUB}">A.  ${esc(f.a)}</text>`;
  }).join('');

  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:${FONT}}</style>
    <rect width="${W}" height="${H}" fill="${LIGHT}"/>
    <text x="${W/2}" y="42" font-size="24" font-weight="800" fill="${NAVY}" text-anchor="middle">자주 묻는 질문</text>
    <text x="${W/2}" y="66" font-size="14" fill="${SUB}" text-anchor="middle">궁금한 점은 편하게 문의해주세요</text>
    ${items}
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUTPUT, 'detail-05.png'));
  console.log('  ✓ Saved detail-05.png');
}

// ─── Run ─────────────────────────────────────────────────

const GENERATORS = {
  'main-01': generateMain01,
  'main-02': generateMain02,
  'detail-01': generateDetail01,
  'detail-02': generateDetail02,
  'detail-03': generateDetail03,
  'detail-04': generateDetail04,
  'detail-05': generateDetail05,
};

async function main() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  console.log('=== Kmong Image Generator ===');
  console.log(`Output: ${OUTPUT}\n`);

  const only = process.argv.slice(2);
  const targets = only.length > 0 ? only : Object.keys(GENERATORS);

  if (targets.includes('main-01') && !API_KEY) {
    console.log('⚠ Skipping main-01 (GEMINI_API_KEY not set)');
  }

  for (const key of targets) {
    if (key === 'main-01' && !API_KEY) continue;
    const fn = GENERATORS[key];
    if (!fn) { console.error(`Unknown target: ${key}`); continue; }
    await fn();
  }

  console.log(`\n=== Done! ${targets.length} images generated ===`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
