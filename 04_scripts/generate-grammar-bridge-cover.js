#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, '05_assets', 'backgrounds', 'grammar-bridge-ch02-cover.png');

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const client = new OpenAI({ apiKey });

  const prompt = [
    'Create a premium editorial textbook cover background for a Korean transfer-English grammar book.',
    'Portrait composition, refined and luxurious, not gloomy, not cyberpunk.',
    'Use a sophisticated palette of deep navy, muted black, warm gold, and soft ivory light.',
    'Centerpiece: a tall luminous geometric monolith or doorway reflected on dark water at dusk.',
    'Minimal composition with generous negative space for title overlay in the middle-left area.',
    'Elegant high-end publishing mood, similar to art-book or fashion editorial covers.',
    'No visible text, no letters, no logos, no watermark, no UI, no extra frames.',
    'Keep the page itself bright enough to support luxury print design, with controlled highlights and subtle atmospheric glow.',
    'The image should feel modern, restrained, and polished.'
  ].join(' ');

  const result = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1536',
    quality: 'high'
  });

  const imageBase64 = result.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error('No image data returned from OpenAI image generation');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, Buffer.from(imageBase64, 'base64'));
  console.log(`Saved cover image: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
