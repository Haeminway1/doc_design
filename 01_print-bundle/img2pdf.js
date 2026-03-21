const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function main() {
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  console.log(`Found ${files.length} images:`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  const pdf = await PDFDocument.create();

  for (const file of files) {
    const imgPath = path.join(INPUT_DIR, file);
    const metadata = await sharp(imgPath).metadata();
    console.log(`Processing: ${file} (${metadata.width}x${metadata.height})`);

    const jpgBuffer = await sharp(imgPath)
      .jpeg({ quality: 95 })
      .toBuffer();

    const img = await pdf.embedJpg(jpgBuffer);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0, y: 0,
      width: img.width, height: img.height,
    });
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, 'output.pdf');
  const pdfBytes = await pdf.save();
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`\nDone! ${files.length} pages -> ${outPath} (${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
