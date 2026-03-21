const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// HTML 파일들을 올바르게 병합
function mergeHtmlFiles() {
  // proposal.html에서 head와 body 시작 부분 추출
  let mainHtml = fs.readFileSync('proposal.html', 'utf8');

  // </body></html> 제거
  mainHtml = mainHtml.replace(/<\/body>\s*<\/html>\s*$/i, '');
  // 주석 제거
  mainHtml = mainHtml.replace(/<!--.*?-->/gs, '');

  // part2, part3, part4에서 body 내용만 추출
  const parts = ['proposal-part2.html', 'proposal-part3.html', 'proposal-part4.html'];

  for (const partFile of parts) {
    let partHtml = fs.readFileSync(partFile, 'utf8');

    // body 태그 사이의 내용만 추출
    const bodyMatch = partHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      mainHtml += '\n' + bodyMatch[1];
    } else {
      // body 태그가 없으면 주석과 html/head 관련 태그만 제거
      partHtml = partHtml.replace(/<!DOCTYPE[^>]*>/gi, '');
      partHtml = partHtml.replace(/<html[^>]*>/gi, '');
      partHtml = partHtml.replace(/<\/html>/gi, '');
      partHtml = partHtml.replace(/<head>[\s\S]*<\/head>/gi, '');
      partHtml = partHtml.replace(/<body[^>]*>/gi, '');
      partHtml = partHtml.replace(/<\/body>/gi, '');
      partHtml = partHtml.replace(/<!--.*?-->/gs, '');
      mainHtml += '\n' + partHtml;
    }
  }

  // 닫는 태그 추가
  mainHtml += '\n</body>\n</html>';

  fs.writeFileSync('proposal-full.html', mainHtml);
  console.log('HTML files merged successfully!');
}

(async () => {
  // HTML 병합
  mergeHtmlFiles();

  // PDF 생성
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = 'file://' + path.resolve(__dirname, 'proposal-full.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  await page.pdf({
    path: '제안서_v3_최종_디자인.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      bottom: '22mm',
      left: '16mm',
      right: '16mm'
    }
  });

  await browser.close();
  console.log('PDF generated successfully!');
})();
