const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// 새 구조: print-bundle/input, print-bundle/output
const projectRoot = path.resolve(__dirname, '..');
const INPUT_DIR = path.resolve(projectRoot, '01_print-bundle', 'input');
const OUTPUT_DIR = path.resolve(projectRoot, '01_print-bundle', 'output');

(async () => {
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log('print-bundle/input/ 폴더에 이미지가 없습니다.');
    process.exit(1);
  }

  console.log(`이미지 ${files.length}개 발견:`, files);

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const ext = path.extname(file).toLowerCase();
    let img;
    if (ext === '.png') {
      const pngBuffer = fs.readFileSync(filePath);
      img = await pdfDoc.embedPng(pngBuffer);
    } else {
      const jpgBuffer = await sharp(filePath)
        .jpeg({ quality: 100 })
        .toBuffer();
      img = await pdfDoc.embedJpg(jpgBuffer);
    }
    const { width: imgW, height: imgH } = img;

    const scale = Math.min(A4_WIDTH / imgW, A4_HEIGHT / imgH);
    const scaledW = imgW * scale;
    const scaledH = imgH * scale;

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    const x = (A4_WIDTH - scaledW) / 2;
    const y = (A4_HEIGHT - scaledH) / 2;
    page.drawImage(img, { x, y, width: scaledW, height: scaledH });
  }

  // 파일명: 현재 날짜+시간
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const outputPath = path.join(OUTPUT_DIR, `프린트_${stamp}.pdf`);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF 생성 완료: ${outputPath} (${(pdfBytes.length / 1024).toFixed(0)} KB, ${files.length}페이지)`);
})();
