const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const studentName = process.argv[2];
const dateStr = process.argv[3];

if (!studentName) {
  console.error('Usage: node 04_scripts/generate-study-pdf.js <학생이름> [YYMMDD]');
  console.error('Example: node 04_scripts/generate-study-pdf.js 김종호 260219');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');

let htmlAbsPath, pdfAbsPath;

if (dateStr) {
  // 날짜별 경로: 00_tutoring/{학생이름}/output/{YYMMDD}/피드백지_{YYMMDD}.html
  const dateDir = path.resolve(projectRoot, '00_tutoring', studentName, 'output', dateStr);
  htmlAbsPath = path.resolve(dateDir, `피드백지_${dateStr}.html`);
  pdfAbsPath = path.resolve(dateDir, `피드백지_${dateStr}.pdf`);
} else {
  // 레거시 경로 (날짜 없이)
  const studentDir = path.resolve(projectRoot, '00_tutoring', studentName, 'output');
  htmlAbsPath = path.resolve(studentDir, '학습분석_결과.html');
  pdfAbsPath = path.resolve(studentDir, '학습분석_결과.pdf');
}

if (!fs.existsSync(htmlAbsPath)) {
  console.error(`HTML 파일 없음: ${htmlAbsPath}`);
  process.exit(1);
}

const htmlUrl = 'file://' + htmlAbsPath;

(async () => {
  console.log(`[${studentName}] PDF 생성 시작...`);
  console.log(`  HTML: ${htmlAbsPath}`);
  console.log(`  PDF:  ${pdfAbsPath}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.CHROME_PATH || undefined,
      pipe: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    await page.goto(htmlUrl, { waitUntil: 'networkidle0', timeout: 120000 });

    await page.pdf({
      path: pdfAbsPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    console.log(`[${studentName}] PDF 생성 완료: ${pdfAbsPath}`);
  } catch (err) {
    console.error(`[${studentName}] PDF 생성 실패:`, err.message);
    process.exit(1);
  }
})();
