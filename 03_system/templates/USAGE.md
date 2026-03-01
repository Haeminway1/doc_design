# 템플릿 사용 가이드

## 빠른 시작

### 1. 기존 교재에 템플릿 적용하기

HTML 파일의 `<head>` 섹션에 다음 순서로 CSS를 추가합니다:

```html
<!-- Step 1: 베이스 레이어 -->
<link rel="stylesheet" href="../../03_system/base/reset.css">
<link rel="stylesheet" href="../../03_system/base/page-layout.css">
<link rel="stylesheet" href="../../03_system/base/print.css">

<!-- Step 2: 컴포넌트 레이어 (선택) -->
<link rel="stylesheet" href="../../03_system/components/boxes.css">
<link rel="stylesheet" href="../../03_system/components/tables.css">
<link rel="stylesheet" href="../../03_system/components/passages.css">

<!-- Step 3: 템플릿 레이어 (교재에 맞는 것 선택) -->
<link rel="stylesheet" href="../../03_system/templates/ocean-blue/ocean-blue.css">
```

### 2. vera-core.css 사용 (간편한 방법)

`vera-core.css`는 base + utilities를 하나로 합친 파일입니다:

```html
<!-- Step 1: Core (base + utilities 통합) -->
<link rel="stylesheet" href="../../03_system/vera-core.css">

<!-- Step 2: 컴포넌트 (선택) -->
<link rel="stylesheet" href="../../03_system/components/boxes.css">

<!-- Step 3: 템플릿 -->
<link rel="stylesheet" href="../../03_system/templates/ocean-blue/ocean-blue.css">
```

## 교재별 템플릿 선택 가이드

| 교재 | 템플릿 | CSS 경로 |
|------|--------|----------|
| 문법 Bridge Part 1/2 | ocean-blue | `templates/ocean-blue/ocean-blue.css` |
| 문법 Advanced | ocean-blue | `templates/ocean-blue/ocean-blue.css` |
| 독해 Basic | royal-purple | `templates/royal-purple/royal-purple.css` |
| 독해 Bridge | earth-tone | `templates/earth-tone/earth-tone.css` |
| 독해 Intermediate | sky-academic | `templates/sky-academic/sky-academic.css` |
| 보카 Basic | sky-academic | `templates/sky-academic/sky-academic.css` |
| 구문독해 Bridge | mint-sky | `templates/mint-sky/mint-sky.css` |
| 논리 Basic | logic-blue | `templates/logic-blue/logic-blue.css` |

## 새 교재 만들기

### 방법 1: 기존 템플릿 사용

1. `02_textbooks/source/`에 새 HTML 파일 생성
2. 위의 CSS 링크 구조 복사
3. 교재 성격에 맞는 템플릿 선택하여 적용
4. 내용 작성

### 방법 2: 새 템플릿 만들기

1. `_template-starter/` 폴더를 복사하여 새 이름으로 생성:
   ```bash
   cp -r 03_system/templates/_template-starter/ 03_system/templates/my-new-template/
   ```

2. `_manifest.json` 수정:
   ```json
   {
     "id": "my-new-template",
     "name": "My New Template",
     "description": "설명",
     "palette": {
       "primary": "#2563EB",
       "primaryLight": "#EFF6FF",
       "secondary": "#F59E0B"
     }
   }
   ```

3. `tokens.css` 수정 - 색상과 폰트 커스터마이징

4. `cover.css` 수정 - 표지 스타일 선택 (4가지 중 1개)

5. CSS 파일명 변경:
   ```bash
   mv template-starter.css my-new-template.css
   ```

6. 새 템플릿 import 수정:
   ```css
   /* my-new-template.css */
   @import url('tokens.css');
   @import url('cover.css');
   ```

## HTML 구조 예시

### 표지 페이지 (Border-Frame 스타일)

```html
<div class="page cover-page no-header-footer">
    <div class="cover-frame">
        <h1 class="cover-main-title">편입영어 문법</h1>
        <div class="cover-accent-line"></div>
        <p class="cover-subtitle">Bridge 편 Part 1</p>
        <p class="cover-brand">Vera's Flavor</p>
    </div>
</div>
```

### 표지 페이지 (Full-Bleed 스타일)

```html
<div class="page cover-page no-header-footer">
    <div class="cover-content">
        <h1 class="cover-main-title">편입영어 독해</h1>
        <div class="cover-accent-line"></div>
        <p class="cover-subtitle">Intermediate 편</p>
        <p class="cover-brand">Vera's Flavor</p>
    </div>
</div>
```

### 일반 콘텐츠 페이지

```html
<div class="page">
    <div class="page-header">
        <span>Chapter 1. 문법 기초</span>
        <span>Vera's Flavor</span>
    </div>
    
    <div class="page-content">
        <h2>동사의 시제</h2>
        
        <div class="concept-box">
            <h3>핵심 개념</h3>
            <p>현재완료는 과거의 동작이 현재까지 영향을 미칠 때 사용합니다.</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>시제</th>
                    <th>형태</th>
                    <th>예문</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>현재완료</td>
                    <td>have/has + p.p</td>
                    <td>I have studied English for 5 years.</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="page-footer">
        <!-- 자동 페이지 번호 -->
    </div>
</div>
```

## 컴포넌트 사용

### 박스 컴포넌트

```html
<div class="concept-box">개념 설명</div>
<div class="example-box">예제</div>
<div class="tip-box">팁</div>
<div class="warning-box">주의사항</div>
```

### 하이라이트

```html
<p>This is a <span class="highlight-key">key term</span>.</p>
<p>중요한 <span class="highlight-bg">배경지식</span>입니다.</p>
<p><span class="highlight-eng">important</span> 단어</p>
```

### 테이블

```html
<table>
    <thead>
        <tr><th>제목1</th><th>제목2</th></tr>
    </thead>
    <tbody>
        <tr><td>내용1</td><td>내용2</td></tr>
    </tbody>
</table>
```

## PDF 생성

Puppeteer를 사용하여 HTML을 PDF로 변환:

```javascript
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
await browser.close();
```

## 주의사항

### PDF 안전 규칙
- ✅ 사용: solid colors, borders, background-color, font-weight
- ❌ 금지: gradient, box-shadow, text-shadow, rgba, backdrop-filter

### !important 사용
템플릿의 모든 스타일은 `!important`를 사용하여 강제 적용합니다.

### 페이지 번호
`.page-footer::after`에 자동으로 페이지 번호가 생성됩니다.

### 표지 페이지
표지는 `.no-header-footer` 클래스를 추가하여 헤더/푸터를 숨깁니다.

## 문제 해결

### Q: 색상이 PDF에서 제대로 나오지 않아요
A: `!important`를 추가하고, `-webkit-print-color-adjust: exact`와 `color-adjust: exact`를 확인하세요.

### Q: 페이지 구분이 이상해요
A: `.page` 클래스가 올바르게 적용되었는지, `page-break-after: always`가 있는지 확인하세요.

### Q: 표지에 페이지 번호가 나와요
A: 표지 페이지에 `.no-header-footer` 클래스를 추가하세요.

### Q: 폰트가 로드되지 않아요
A: Google Fonts 링크가 `<head>`에 있는지 확인하고, PDF 생성 시 `waitUntil: 'networkidle0'` 옵션을 사용하세요.

## 추가 리소스

- `README.md` - 템플릿 시스템 개요
- `TEMPLATE_INDEX.json` - 교재-템플릿 매핑
- `06_reference/guideline/guideline.md` - 디자인 총칙
- `06_reference/PDF_DESIGN_GUIDE.md` - PDF 변환 상세 가이드

---

**Vera's Document Studio**
