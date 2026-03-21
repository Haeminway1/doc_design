#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'kmong_launch', 'flagship-service.json');
const OUTPUT_DIR = path.join(ROOT, '05_assets', 'kmong');
const WIDTH = 1280;
const HEIGHT = 960;

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function wrapText(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
    }
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSlideOverlay(slide, service) {
  const titleLines = wrapText(slide.title, 16);
  const subtitleLines = wrapText(slide.subtitle, 34);
  const heroTags = service.heroHighlights;
  const titleY = 245;
  const subtitleY = titleY + (titleLines.length * 90) + 40;

  const tags = heroTags
    .map((item, index) => {
      const x = 96 + ((index % 2) * 336);
      const y = 610 + (Math.floor(index / 2) * 86);
      return `
        <rect x="${x}" y="${y}" width="320" height="54" rx="27" fill="rgba(17, 33, 67, 0.84)" />
        <text x="${x + 20}" y="${y + 34}" font-size="24" font-weight="700" fill="#F7F2E8">${escapeXml(item)}</text>
      `;
    })
    .join('');

  const titleSvg = titleLines
    .map((line, index) => {
      const y = titleY + (index * 90);
      return `<text x="96" y="${y}" font-size="72" font-weight="800" fill="#0F1E3D">${escapeXml(line)}</text>`;
    })
    .join('');

  const subtitleSvg = subtitleLines
    .map((line, index) => {
      const y = subtitleY + (index * 42);
      return `<text x="100" y="${y}" font-size="30" font-weight="500" fill="#32476D">${escapeXml(line)}</text>`;
    })
    .join('');

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text {
          font-family: "Apple SD Gothic Neo", "Nanum Gothic", sans-serif;
        }
      </style>
      <defs>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.92)" />
          <stop offset="100%" stop-color="rgba(247,242,232,0.82)" />
        </linearGradient>
      </defs>
      <rect x="56" y="56" width="760" height="848" rx="38" fill="url(#panel)" stroke="rgba(255,255,255,0.9)" stroke-width="2" />
      <rect x="96" y="110" width="148" height="12" rx="6" fill="#D2A74D" />
      ${titleSvg}
      ${subtitleSvg}
      <rect x="96" y="${subtitleY + (subtitleLines.length * 42) + 26}" width="360" height="54" rx="27" fill="#D2A74D" />
      <text x="122" y="${subtitleY + (subtitleLines.length * 42) + 61}" font-size="26" font-weight="800" fill="#1E2430">${escapeXml(slide.accent)}</text>
      ${tags}
      <rect x="96" y="96" width="1088" height="768" rx="48" fill="none" stroke="rgba(255,255,255,0.26)" stroke-width="1.5" />
    </svg>
  `);
}

function buildPackageOverlay(service) {
  const cards = service.packages
    .map((pkg, index) => {
      const x = 92 + (index * 364);
      const summaryLines = wrapText(pkg.summary, 14)
        .slice(0, 2)
        .map((line, lineIndex) => `
          <text x="${x + 28}" y="${438 + (lineIndex * 30)}" font-size="18" font-weight="600" fill="#32476D">${escapeXml(line)}</text>
        `)
        .join('');
      return `
        <rect x="${x}" y="270" width="332" height="420" rx="28" fill="rgba(255,255,255,0.93)" />
        <text x="${x + 28}" y="330" font-size="34" font-weight="800" fill="#112143">${escapeXml(pkg.name)}</text>
        <text x="${x + 28}" y="392" font-size="50" font-weight="800" fill="#D2A74D">${escapeXml(`${(pkg.priceKrw / 10000).toFixed(pkg.priceKrw % 10000 === 0 ? 0 : 1)}만`)}</text>
        ${summaryLines}
        <text x="${x + 28}" y="512" font-size="22" font-weight="500" fill="#23324F">작업일 ${pkg.turnaroundDays}일</text>
        <text x="${x + 28}" y="548" font-size="22" font-weight="500" fill="#23324F">수정 ${pkg.revisionCount}회</text>
      `;
    })
    .join('');

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text {
          font-family: "Apple SD Gothic Neo", "Nanum Gothic", sans-serif;
        }
      </style>
      <rect x="56" y="56" width="1168" height="848" rx="40" fill="rgba(11,23,48,0.56)" />
      <text x="92" y="150" font-size="60" font-weight="800" fill="#F7F2E8">패키지 구성</text>
      <text x="96" y="206" font-size="28" font-weight="500" fill="#D9E1F1">시험지 편집부터 브랜드형 교재 패키지까지 단계별로 제안합니다</text>
      ${cards}
    </svg>
  `);
}

async function generateBackground(client, prompt, filename) {
  const result = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1536x1024',
    quality: 'high'
  });

  const imageBase64 = result.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error(`No image data returned for ${filename}`);
  }

  return Buffer.from(imageBase64, 'base64');
}

async function buildSlides() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const service = loadConfig();
  const client = new OpenAI({ apiKey });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const slide of service.thumbnailSlides) {
    const background = await generateBackground(client, slide.backgroundPrompt, slide.filename);
    const bgPath = path.join(OUTPUT_DIR, `bg-${slide.filename}`);
    const outPath = path.join(OUTPUT_DIR, slide.filename);
    fs.writeFileSync(bgPath, background);

    const overlay = slide.filename === 'slide-04-package.png'
      ? buildPackageOverlay(service)
      : buildSlideOverlay(slide, service);

    await sharp(background)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .composite([
        {
          input: Buffer.from(`
            <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="rgba(8,15,34,0.18)" />
                  <stop offset="100%" stop-color="rgba(247,242,232,0.06)" />
                </linearGradient>
              </defs>
              <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)" />
            </svg>
          `),
          left: 0,
          top: 0
        },
        {
          input: overlay,
          left: 0,
          top: 0
        }
      ])
      .png()
      .toFile(outPath);

    console.log(`Saved ${outPath}`);
  }
}

buildSlides().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
