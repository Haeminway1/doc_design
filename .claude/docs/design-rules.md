# 디자인 규칙

## CSS 3-Layer 아키텍처

```
Layer 0: Base     → 03_system/base/          (reset, page-layout, print, utilities)
Layer 1: Components → 03_system/components/  (20종, 전 교재 공통)
Layer 2: Templates  → 03_system/templates/   (교재별 시각 개성)

통합 import: 03_system/vera-core.css (base + components)
템플릿은 HTML에서 별도 <link>로 로드
```

### 템플릿 목록 (8종)
ocean-blue, royal-purple, earth-tone, sky-academic, mint-sky, logic-blue, grammar-teal, _template-starter

### 컴포넌트 목록 (20종)
**구조**: cover, toc, section-title, problem, explanation, answer-grid
**과목별**: concept-box, tip-box, warning-box, rule-box, comparison-table, grammar-table, passage, word-entry, example-block
**특수**: part-opener, day-title, step-section, pattern-box

---

## PDF 안전 CSS 규칙

### 금지 (Puppeteer에서 깨짐)
- `linear-gradient()` → 검은 사각형
- `box-shadow` → 예측 불가 아티팩트
- `text-shadow` → 텍스트 뒤 검은 박스
- `rgba()` / `opacity` → 색 번짐
- `backdrop-filter: blur()` → PDF 전체 공백 (치명적)
- `background-blend-mode` → 렌더링 실패

### 필수
- 솔리드 컬러만 사용 (`#3a8fa3`, `#ffffff`)
- `!important`로 렌더링 강제
- `print-color-adjust: exact` + `-webkit-print-color-adjust: exact`
- `page-break-inside: avoid` + `break-inside: avoid` (둘 다 명시)

### 페이지 분리
```css
.page { page-break-after: always !important; }
.page:last-child { page-break-after: avoid !important; }
h1, h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }
```

### A4 규격
- 210mm x 297mm
- 본문 9-10pt, 행간 1.3-1.4
- 여백 12-15mm (교재), 15mm 13mm (피드백지)

---

## 색상 팔레트 (교재용)

```css
--color-accent-dark:      #1E3A8A   /* 제목, 핵심 용어 */
--color-accent-secondary: #F59E0B   /* 강조 */
--color-concept-bg:       #F0F9FF   /* 개념 박스 배경 */
--color-concept-border:   #0EA5E9   /* 개념 박스 테두리 */
--color-example-bg:       #F7FEE7   /* 예제 박스 배경 */
--color-example-border:   #22C55E   /* 예제 박스 테두리 */
--color-warning-bg:       #FEF3C7   /* 주의 박스 배경 */
--color-warning-border:   #F59E0B   /* 주의 박스 테두리 */
```

---

## 강조 규칙

- 페이지당 강조 10개 이하
- 단락당 강조 2개 이하
- 문장당 강조 1개 이하
- 강조 없는 단락 60% 이상
- 3종만 사용: `.highlight-key`, `.highlight-bg`, `.highlight-eng`

---

## paged.js 가이드

### 개요
paged.js는 CSS Paged Media 폴리필. Puppeteer 앞에서 HTML을 인쇄용 페이지로 분할한다.

```
HTML → paged.js (pagination) → Puppeteer page.pdf() → PDF
```

### 적용 대상
- **교재 (200-500p)**: 적용 — running header/footer, 자동 페이지번호, 홀짝 마진
- **짧은 문서 (<20p)**: 불필요 — Puppeteer만으로 충분

### CSS Paged Media 기능 (paged.js로 사용 가능)

```css
@page {
  size: A4;
  margin: 20mm 15mm 25mm 15mm;

  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-size: 9pt;
    color: #718096;
  }

  @top-left {
    content: string(book-title);
    font-size: 8pt;
    color: #a0aec0;
  }
}

/* 홀짝 페이지 마진 */
@page :left  { margin-left: 20mm; margin-right: 15mm; }
@page :right { margin-left: 15mm; margin-right: 20mm; }

/* 챕터 시작은 오른쪽 페이지 */
.chapter { break-before: right; }

/* running header에 챕터 제목 등록 */
h2.chapter-title { string-set: book-title content(); }

/* named page */
@page cover { margin: 0; }
.cover-page { page: cover; }
```

### 통합 방법 (generate-textbook-pdf.js)

```js
// paged.js pagination 완료 대기
await page.waitForFunction(
  () => window.PagedPolyfill && window.PagedPolyfill.ready,
  { timeout: 120000 }
);

// PDF 캡처 (마진 0 — paged.js가 관리)
await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
```

### 주의사항
- paged.js + Puppeteer 금지 CSS는 동일 (gradient, shadow 등)
- 대형 교재(500p+)는 메모리 사용량 증가 — `--max-old-space-size=4096` 권장
- `window.__TEXTBOOK_READY__` 시그널은 paged.js 로드 전에 발화해야 함
- orphans/widows가 paged.js에서는 실제로 동작함 (Puppeteer 단독에서는 무시됨)

### 마이그레이션 단계
1. **Phase 1**: 교재 1개(grammar-bridge-ch02)에 POC 적용, 기존 PDF와 비교
2. **Phase 2**: 전체 교재 적용, vera-core.css에 paged.js @page 규칙 추가
3. **Phase 3**: running header/footer, 자동 목차 등 고급 기능 활용

---

## 참조 문서

- `06_reference/PDF_DESIGN_GUIDE.md` — Puppeteer 렌더링 주의사항 전체
- `06_reference/guideline/guideline.md` — A4 인쇄용 HTML 디자인 총칙 v2.1
- `06_reference/guideline/basic_structure.html` — 기본 HTML 구조
- `06_reference/library/components.md` — 컴포넌트 라이브러리
- `06_reference/library/highlight_guideline.md` — 하이라이트 가이드
