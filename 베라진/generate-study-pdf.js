const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = 'file://' + path.resolve(__dirname, '학습분석_결과.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  await page.pdf({
    path: path.resolve(__dirname, '학습분석_결과.pdf'),
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
  console.log('PDF generated: 학습분석_결과.pdf');
})();
