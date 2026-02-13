# 제안서 PDF 디자인 가이드

> 마크다운 문서를 세련된 PDF로 변환하는 과정에서의 디자인 결정, 발생한 문제점 및 해결 방법 정리

## 1. 개요

### 1.1 목표
- 마크다운 제안서(`제안서_v3_최종.md`)를 전문적인 PDF로 변환
- A4 규격 준수, 깔끔한 레이아웃, 시각적 다이어그램 적용
- ASCII 아트를 시각적 요소로 대체
- 클릭 가능한 참고자료 링크 제공

### 1.2 사용 기술
| 기술 | 용도 |
|------|------|
| HTML/CSS | 레이아웃 및 스타일링 |
| Node.js | PDF 생성 스크립트 |
| Puppeteer | HTML → PDF 변환 |
| Noto Sans KR | 한글 폰트 |

---

## 2. 파일 구조

```
doc_design/
├── 제안서_v3_최종.md          # 원본 마크다운
├── 제안서_v3_최종_디자인.pdf  # 최종 PDF 출력
├── proposal.html              # 섹션 1-2 (커버, 목차, 제안개요, 현황분석)
├── proposal-part2.html        # 섹션 3-4 (Part 1, Part 2 상세)
├── proposal-part3.html        # 섹션 5-8 (ROI, 비용, 권리구조)
├── proposal-part4.html        # 섹션 9-12 (일정, FAQ, 다음단계, 참고자료)
├── proposal-full.html         # 병합된 전체 HTML
├── generate-pdf.js            # PDF 생성 스크립트
└── docs/
    └── PDF_DESIGN_GUIDE.md    # 본 문서
```

---

## 3. 디자인 결정

### 3.1 레이아웃
- **A4 규격**: `@page { size: A4; margin: 18mm 16mm 22mm 16mm; }`
- **표지**: 전체 페이지 사용, 중앙 정렬
- **목차**: 별도 페이지, 섹션 1부터 새 페이지 시작

### 3.2 색상 팔레트
```css
/* 주요 색상 */
--primary: #1e3a5f;      /* 네이비 - 헤더, 표지 */
--secondary: #2b6cb0;    /* 파란색 - h2, 링크 */
--accent: #3182ce;       /* 밝은 파란색 - 테이블 헤더 */
--success: #48bb78;      /* 녹색 - 긍정적 옵션 */
--danger: #fc8181;       /* 빨간색 - 경고, 한계 */
--text: #1a202c;         /* 본문 텍스트 */
--bg-light: #f7fafc;     /* 밝은 배경 */
```

### 3.3 시각적 요소
| 요소 | 용도 |
|------|------|
| `.diagram-box` | 다이어그램 컨테이너 |
| `.two-col` + `.card` | 2열 카드 비교 레이아웃 |
| `.timeline` | 개발 일정 타임라인 |
| `.flow-diagram` | 단계별 흐름도 |
| `.system-arch` | 시스템 아키텍처 다이어그램 |
| `.option-card` | 옵션 비교 카드 |

---

## 4. 발생한 문제점 및 해결 방법

### 4.1 HTML 파일 병합 실패

**문제**: `sed` 명령으로 HTML 파일 병합 시 `</body></html>` 태그가 중복되어 2.2 섹션 이후 내용 누락

**원인**:
```bash
# 잘못된 방식 - sed가 body 태그를 제대로 처리하지 못함
sed '1,/<\/head>/d; s/<body>//; ...' proposal-part2.html >> proposal-full.html
```

**해결**: Node.js 스크립트로 정규식 기반 병합 로직 구현
```javascript
// generate-pdf.js
function mergeHtmlFiles() {
  let mainHtml = fs.readFileSync('proposal.html', 'utf8');
  mainHtml = mainHtml.replace(/<\/body>\s*<\/html>\s*$/i, '');
  
  for (const partFile of parts) {
    let partHtml = fs.readFileSync(partFile, 'utf8');
    const bodyMatch = partHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      mainHtml += '\n' + bodyMatch[1];
    }
  }
  mainHtml += '\n</body>\n</html>';
}
```

---

### 4.2 목차와 1. 제안개요가 같은 페이지에 표시

**문제**: 목차 다음에 바로 1. 제안 개요가 나와서 레이아웃이 어색함

**해결**: 목차 `</div>` 이후 page-break 추가
```html
  </div>  <!-- 목차 끝 -->
</div>

<!-- 1. 제안 개요 -->
<div class="page-break"></div>
<div class="content">
  <section>
    <h1>1. 제안 개요</h1>
```

---

### 4.3 헤더가 페이지 하단에서 끊김

**문제**: h2 헤더가 페이지 맨 아래에 나오고 내용은 다음 페이지에 표시

**해결**: CSS `page-break-after: avoid` 적용
```css
h1 { page-break-after: avoid; }
h2 { page-break-inside: avoid; page-break-after: avoid; }
h3 { page-break-inside: avoid; page-break-after: avoid; }
```

---

### 4.4 표지 텍스트가 잘 보이지 않음

**문제**: 표지의 흰색 텍스트가 PDF에서 제대로 렌더링되지 않음

**원인**: `opacity` 속성과 암묵적 색상 상속 문제

**해결**: 명시적 색상과 `!important` 적용
```css
/* Before */
.cover { color: white; }
.cover .subtitle { opacity: 0.9; }

/* After */
.cover { color: #ffffff !important; }
.cover .subtitle { color: #ffffff !important; }
.cover .meta { color: #eeeeee !important; }
```

---

### 4.5 검은색/회색 선택 박스 렌더링 문제 ⭐ (가장 까다로운 문제)

**문제**: PDF에서 특정 박스들에 마치 드래그로 선택한 것처럼 검은색/회색 사각형이 나타남

**영향 받은 요소**:
- 표지 요소
- 1.2 핵심 제안 요약 박스
- 5.2, 5.3 박스
- 7.4 옵션 B 박스

**원인**: Puppeteer PDF 렌더링에서 특정 CSS 속성들이 제대로 처리되지 않음
- `linear-gradient()`
- `box-shadow`
- `text-shadow`
- `rgba()` 투명도
- `opacity`

**해결**: 모든 문제 속성을 솔리드 컬러로 교체

```css
/* Before - 렌더링 문제 발생 */
th { background: linear-gradient(180deg, #3182ce, #2b6cb0); }
.diagram-box { background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); }
.card { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.cover h1 { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4); }
.service { background: rgba(255, 255, 255, 0.1); }
.backend p { opacity: 0.9; }

/* After - 솔리드 컬러로 교체 */
th { background: #3182ce !important; }
.diagram-box { background: #f7fafc !important; }
.card { border: 2px solid #e2e8f0; }  /* box-shadow 제거 */
.cover h1 { /* text-shadow 제거 */ }
.service { background: #2d3748 !important; }
.backend p { color: #dddddd; }
```

**핵심 교훈**: Puppeteer PDF 변환 시 **그라데이션, 그림자, 투명도 사용 피하기**

---

### 4.6 CSS 문법 오류

**문제**: 멀티 리플레이스 중 닫는 중괄호 `}` 누락으로 CSS 파싱 에러

**해결**: 린트 에러 확인 후 누락된 중괄호 추가
```css
/* Before - } 누락 */
.cover .logo {
  border: 3px solid #ffffff;
  /* 링크 스타일 */  <-- 여기서 } 없이 다음 규칙 시작
  a { ... }

/* After */
.cover .logo {
  border: 3px solid #ffffff;
}

/* 링크 스타일 */
a { ... }
```

---

## 5. 베스트 프랙티스 (Puppeteer PDF 변환)

### ✅ 권장
- 솔리드 컬러 사용 (`#ffffff`, `#3182ce`)
- `!important`로 렌더링 강제
- 명시적 색상 지정 (상속에 의존하지 않기)
- `page-break-inside: avoid`로 테이블/박스 분리 방지
- `page-break-after: avoid`로 헤더-내용 분리 방지

### ❌ 피해야 할 것
- `linear-gradient()` - 렌더링 아티팩트 발생
- `box-shadow` - 검은 박스로 나타날 수 있음
- `text-shadow` - 제대로 렌더링 안 됨
- `rgba()` 투명도 - 예측 불가능한 결과
- `opacity` - 색상이 이상하게 보일 수 있음

---

## 6. PDF 생성 명령어

```bash
# PDF 생성
node generate-pdf.js

# 결과 확인
ls -la 제안서_v3_최종_디자인.pdf
open 제안서_v3_최종_디자인.pdf
```

---

## 7. 참고

- **Puppeteer 공식 문서**: https://pptr.dev/
- **CSS Paged Media**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_paged_media
- **A4 규격**: 210mm x 297mm

---

*작성일: 2026-02-09*
*작성자: Claude (Antigravity)*
