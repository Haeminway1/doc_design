const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');

const studentName = process.argv[2];
if (!studentName) {
  console.error('Usage: node generate-study-pdf.js <학생이름>');
  console.error('Example: node generate-study-pdf.js 김종호');
  process.exit(1);
}

// Convert WSL path to Windows path for Chrome
function toWinPath(wslPath) {
  try {
    return execSync(`wslpath -w "${wslPath}"`).toString().trim();
  } catch {
    return wslPath;
  }
}

const studentDir = path.resolve(__dirname, '..', studentName);
const htmlAbsPath = path.resolve(studentDir, '학습분석_결과.html');
const pdfAbsPath = path.resolve(studentDir, '학습분석_결과.pdf');

// For Windows Chrome, use Windows-style file:// URL
const htmlWinPath = toWinPath(htmlAbsPath);
const htmlUrl = 'file:///' + htmlWinPath.replace(/\\/g, '/');
const pdfWinPath = toWinPath(pdfAbsPath);

(async () => {
  console.log(`[${studentName}] PDF 생성 시작...`);
  console.log(`  HTML: ${htmlUrl}`);
  console.log(`  PDF:  ${pdfWinPath}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.CHROME_PATH || '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
      pipe: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();

    await page.goto(htmlUrl, { waitUntil: 'networkidle0', timeout: 120000 });

    await page.pdf({
      path: pdfAbsPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '20mm',
        left: '14mm',
        right: '14mm'
      }
    });

    await browser.close();
    console.log(`[${studentName}] PDF 생성 완료: ${pdfAbsPath}`);
  } catch (err) {
    console.error(`[${studentName}] PDF 생성 실패:`, err.message);
    process.exit(1);
  }
})();
