# 2025년 교재/설명서 특화 폰트 & 디자인 가이드

> **인쇄물(A4 교재) 제작을 위한 실전 폰트 선택 및 타이포그래피 완벽 가이드**
> 
> 핵심: **정보 밀도·가독성·구조화·일관성·전문성**

---

## 📚 교재/설명서 디자인의 핵심 원칙

### 일반 웹페이지 vs 교재의 차이

| 특성 | 일반 웹페이지 | 교재/설명서 |
|------|---------------|-------------|
| **목적** | 경험, 전환 | **정보 전달** |
| **정보 밀도** | 50-60% | **70-80%** |
| **본문 크기** | 16-18px | **9-10pt** |
| **행간** | 1.6-1.8 | **1.4-1.5** |
| **폰트 수** | 1-2개 | **2-3개** (한글/영문/코드) |
| **여백** | 넉넉함 | **최적화** (정보 우선) |
| **구조화** | 선택적 | **필수** (박스, 표, 리스트) |

---

## 1) 2025 교재용 폰트 트렌드

### A. 교재에 적합한 폰트 특성

**가독성 최우선:**
- 장시간 독서에 피로 없는 폰트
- 작은 크기(9-10pt)에서도 명확한 글자 형태
- 숫자/기호 구별 명확 (1lI, 0O 등)

**정보 밀도 확보:**
- 컴팩트한 자폭(width)
- 적절한 x-height (소문자 높이)
- 행간 1.4-1.5에서도 읽기 편한 형태

**전문성 표현:**
- 깔끔하고 중립적인 느낌
- 과도한 개성보다 신뢰감
- 인쇄 시 번짐 없는 명료한 획

### B. 세리프 vs 산세리프 (교재 관점)

**산세리프 (추천 ⭐⭐⭐)**
- 장점: 작은 크기 가독성 우수, 현대적, 화면/인쇄 호환
- 용도: 본문, 제목, 캡션 모두 가능
- 교재 표준: **본문 9pt 산세리프**

**세리프 (선택적)**
- 장점: 긴 문장 독서 편안함, 전통적/권위적
- 단점: 작은 크기에서 세리프 뭉개짐 가능
- 용도: 제목, 인용구 (본문은 신중히)

**교재 권장 조합:**
- 🥇 **산세리프(제목) + 산세리프(본문)** - 가장 안전
- 🥈 **세리프(제목) + 산세리프(본문)** - 차별화
- 🥉 **산세리프 단일** - 일관성

---

## 2) Google Fonts - 교재 추천 폰트 (즉시 사용 가능)

> ✅ 모두 **무료·상업적 사용 가능·Google Fonts에서 제공**

### 한글 폰트

#### **Noto Sans KR** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 최상급 (9pt에서도 명확)
- **특징**: Google+Adobe 공동 개발, 전 세계 언어 지원
- **용도**: 모든 교재에 안전하게 사용
- **굵기**: 400 (본문), 500-600 (강조), 700 (제목)

#### **IBM Plex Sans KR** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 최상급
- **특징**: IBM 기업용 폰트, 기술 문서에 최적
- **용도**: IT/기술/과학 교재
- **굵기**: 400 (본문), 500 (부제목), 600 (소제목), 700 (제목)

#### **Black Han Sans** ⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap" rel="stylesheet">
```
- **특징**: 강렬한 고딕, 굵기 1종만 제공
- **용도**: 제목 전용 (본문 부적합)
- **조합**: 본문은 Noto Sans KR 사용

#### **Nanum Gothic** ⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet">
```
- **가독성**: 양호 (단, 9pt에서는 약간 좁음)
- **특징**: 한국형 고딕, 친근한 느낌
- **용도**: 교육/학습 교재

#### **Noto Serif KR** ⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
- **특징**: 명조체, 전통적/권위적
- **용도**: 법률/역사/인문학 교재 제목
- **주의**: 본문은 10pt 이상 권장

### 영문 폰트

#### **Inter** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```
- **가독성**: 최상급
- **특징**: UI/화면 최적화, 가변 폰트 지원
- **용도**: 모든 교재 영문 부분
- **특별 기능**: 숫자 타뷸러(표에서 정렬 편함)

#### **Roboto** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```
- **가독성**: 최상급
- **특징**: Google 안드로이드 기본 폰트
- **용도**: IT/기술 교재
- **장점**: 전 세계 가장 많이 사용되는 폰트

#### **Source Sans Pro** ⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 우수
- **특징**: Adobe 오픈소스, 전문적 느낌
- **용도**: 학술/연구 교재

#### **Open Sans** ⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 우수
- **특징**: 중립적, 무난함
- **용도**: 범용 교재

#### **Montserrat** ⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```
- **특징**: 기하학적, 모던함
- **용도**: 제목 전용 (본문에는 부적합)
- **장점**: 강렬한 인상

### 코드/모노스페이스 폰트

#### **JetBrains Mono** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 최상급 (코드용)
- **특징**: 개발자용 설계, 리가처 지원
- **용도**: 코드 블록, 기술 문서
- **장점**: 1lI, 0O 명확히 구분

#### **Fira Code** ⭐⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 최상급
- **특징**: Mozilla 개발, 리가처 풍부
- **용도**: 프로그래밍 교재

#### **Source Code Pro** ⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
```
- **가독성**: 우수
- **특징**: Adobe 오픈소스
- **용도**: 범용 코드 폰트

#### **Roboto Mono** ⭐⭐⭐⭐
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```
- **가독성**: 우수
- **특징**: Roboto 모노스페이스 버전
- **용도**: 명령어, 파일명

---

## 3) 교재별 완벽 폰트 조합 레시피

### 📘 IT/프로그래밍 교재
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
:root {
    /* 한글 본문 */
    --font-kr: 'IBM Plex Sans KR', sans-serif;
    /* 영문 본문 */
    --font-en: 'Roboto', sans-serif;
    /* 코드 */
    --font-code: 'JetBrains Mono', monospace;
}

body { 
    font-family: var(--font-kr);
    font-size: 9pt;
    line-height: 1.45;
}

.eng-text { font-family: var(--font-en); }
code, .code-block { font-family: var(--font-code); font-size: 8pt; }
```

### 📗 과학/수학 교재
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Source+Sans+3:wght@400;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
:root {
    --font-kr: 'Noto Sans KR', sans-serif;
    --font-en: 'Source Sans 3', sans-serif;
    --font-mono: 'Roboto Mono', monospace;
}
```

### 📕 비즈니스/경영 교재
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
:root {
    --font-kr: 'Noto Sans KR', sans-serif;
    --font-en: 'Inter', sans-serif;
}

h1, h2 { font-weight: 700; }
h3 { font-weight: 600; }
body { font-weight: 400; }
```

### 📙 법률/행정 교재
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&family=Noto+Sans+KR:wght@400;500&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
```

```css
:root {
    /* 제목: 명조 */
    --font-heading: 'Noto Serif KR', serif;
    /* 본문: 고딕 */
    --font-body: 'Noto Sans KR', sans-serif;
    --font-en: 'Source Sans 3', sans-serif;
}

h1, h2, h3 { font-family: var(--font-heading); }
body { font-family: var(--font-body); }
```

### 📒 디자인/예술 교재
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Montserrat:wght@600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

```css
:root {
    --font-kr: 'Noto Sans KR', sans-serif;
    /* 제목: 강렬한 산세리프 */
    --font-heading: 'Montserrat', sans-serif;
    --font-en: 'Inter', sans-serif;
}

h1, h2 { font-family: var(--font-heading); letter-spacing: 0.02em; }
body { font-family: var(--font-kr); }
```

### 📔 교육/학습 교재
```html
<link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
:root {
    --font-kr: 'Nanum Gothic', sans-serif;
    --font-en: 'Open Sans', sans-serif;
}

/* 친근하고 읽기 편한 조합 */
body { 
    font-family: var(--font-kr);
    font-size: 10pt;  /* 교육용은 약간 크게 */
    line-height: 1.5;
}
```

---

## 4) 교재 특화 타이포그래피 규격

### 본문 (Body Text)

**절대 규칙:**
```css
body {
    font-size: 9pt;           /* 9-10pt만 사용 (11pt 금지) */
    line-height: 1.45;        /* 1.4-1.5 범위 */
    letter-spacing: -0.02em;  /* 한글 최적화 */
    color: #1a1a1a;           /* 진한 검정 */
    word-break: keep-all;     /* 한글 단어 단위 줄바꿈 */
}
```

**영문 본문:**
```css
.eng-text {
    font-family: 'Inter', 'Roboto', sans-serif;
    letter-spacing: 0;        /* 영문은 자간 조정 불필요 */
}
```

### 제목 크기 체계

```css
/* H1 - 챕터/대제목 */
h1 {
    font-size: 16pt;          /* 14-18pt 범위 */
    font-weight: 700;
    line-height: 1.25;
    margin-bottom: 3mm;
    letter-spacing: -0.03em;  /* 큰 글씨는 자간 축소 */
}

/* H2 - 섹션 제목 */
h2 {
    font-size: 13pt;          /* 12-14pt 범위 */
    font-weight: 600;
    line-height: 1.3;
    margin: 5mm 0 2mm 0;
    border-bottom: 1pt solid #e0e0e0;  /* 구분선 */
    padding-bottom: 1mm;
}

/* H3 - 소제목 */
h3 {
    font-size: 11pt;          /* 10-12pt 범위 */
    font-weight: 600;
    line-height: 1.35;
    margin: 4mm 0 1.5mm 0;
}

/* H4 - 세부 항목 */
h4 {
    font-size: 10pt;          /* 본문과 동일하거나 약간 크게 */
    font-weight: 600;
    margin: 3mm 0 1mm 0;
}
```

### 특수 요소

**강조 (Bold/Strong):**
```css
strong, .bold {
    font-weight: 600;         /* 700은 너무 굵음 */
}
```

**이탤릭:**
```css
em, .italic {
    font-style: italic;
    font-weight: 400;         /* 이탤릭 자체가 강조 */
}
```

**캡션/주석:**
```css
.caption, figcaption {
    font-size: 8pt;           /* 본문보다 1pt 작게 */
    color: #666;
    font-style: italic;
    margin-top: 1mm;
}
```

**작은 텍스트:**
```css
.small-text {
    font-size: 8pt;
    line-height: 1.4;
}
```

---

## 5) 교재 필수 요소 디자인

### 정보 박스 (Info Box)

#### 기본 구조
```css
.info-box {
    padding: 6pt 8pt;
    margin: 3mm 0;
    border-radius: 2pt;
    font-size: 9pt;
    line-height: 1.4;
    break-inside: avoid;
    page-break-inside: avoid;
}

.info-box-title {
    font-weight: 600;
    margin-bottom: 3pt;
    display: flex;
    align-items: center;
    gap: 4pt;
}

.info-box-content {
    margin: 0;
}
```

#### 팁 박스 (💡 Tip)
```css
.tip-box {
    background: #e8f5e9;      /* 연한 초록 */
    border-left: 3pt solid #4caf50;  /* 진한 초록 */
}
```

```html
<div class="info-box tip-box">
    <div class="info-box-title">💡 핵심 포인트</div>
    <p class="info-box-content">중요한 개념이나 팁을 강조합니다.</p>
</div>
```

#### 주의 박스 (⚠️ Warning)
```css
.warning-box {
    background: #fff3e0;      /* 연한 주황 */
    border-left: 3pt solid #ff9800;  /* 진한 주황 */
}
```

#### 예제 박스 (📝 Example)
```css
.example-box {
    background: #e3f2fd;      /* 연한 파랑 */
    border-left: 3pt solid #2196f3;  /* 진한 파랑 */
}
```

#### 중요 박스 (❗ Important)
```css
.important-box {
    background: #ffebee;      /* 연한 빨강 */
    border-left: 3pt solid #f44336;  /* 진한 빨강 */
}
```

#### 참고 박스 (📚 Note)
```css
.note-box {
    background: #f3e5f5;      /* 연한 보라 */
    border-left: 3pt solid #9c27b0;  /* 진한 보라 */
}
```

### 코드 블록 (Code Block)

```css
.code-block {
    background: #f5f5f5;
    border: 0.5pt solid #e0e0e0;
    border-radius: 2pt;
    padding: 5pt 6pt;
    margin: 3mm 0;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 8pt;
    line-height: 1.4;
    overflow-x: auto;
    break-inside: avoid;
    page-break-inside: avoid;
}

/* 언어 라벨 */
.code-block::before {
    content: attr(data-lang);
    display: block;
    font-size: 7pt;
    color: #666;
    margin-bottom: 3pt;
    text-transform: uppercase;
}
```

```html
<div class="code-block" data-lang="python">
def hello_world():
    print("Hello, World!")
</div>
```

**인라인 코드:**
```css
code {
    background: #f5f5f5;
    padding: 1pt 3pt;
    border-radius: 2pt;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    color: #d63031;
}
```

### 표 (Table)

```css
table {
    width: 100%;
    border-collapse: collapse;
    margin: 3mm 0;
    font-size: 8.5pt;
    break-inside: avoid;
}

/* 헤더 */
thead th {
    background: #f0f0f0;
    padding: 4pt 6pt;
    text-align: left;
    font-weight: 600;
    border: 0.5pt solid #ccc;
    color: #2a2a2a;
}

/* 셀 */
tbody td {
    padding: 3pt 6pt;
    border: 0.5pt solid #e0e0e0;
    vertical-align: top;
}

/* 짝수 행 구분 */
tbody tr:nth-child(even) {
    background: #fafafa;
}

/* 강조 행 */
tbody tr.highlight {
    background: #fff9e6;
}

/* 숫자 정렬 */
.number-col {
    text-align: right;
    font-family: 'Roboto Mono', monospace;
}
```

### 리스트 (Lists)

```css
/* 순서 없는 리스트 */
ul {
    margin-left: 4mm;
    margin-bottom: 2mm;
    list-style-type: disc;
}

ul ul {
    list-style-type: circle;
    margin-left: 4mm;
}

/* 순서 있는 리스트 */
ol {
    margin-left: 4mm;
    margin-bottom: 2mm;
}

ol ol {
    margin-left: 4mm;
    list-style-type: lower-alpha;
}

/* 리스트 아이템 */
li {
    margin-bottom: 1mm;
    line-height: 1.4;
}

/* 체크리스트 */
.checklist {
    list-style: none;
    margin-left: 0;
}

.checklist li::before {
    content: "☐ ";
    color: #666;
    font-weight: bold;
}

.checklist li.checked::before {
    content: "☑ ";
    color: #4caf50;
}
```

### 인용구 (Blockquote)

```css
blockquote {
    margin: 4mm 0;
    padding: 6pt 8pt 6pt 12pt;
    border-left: 3pt solid #bdbdbd;
    background: #fafafa;
    font-style: italic;
    color: #4a4a4a;
}

blockquote p {
    margin-bottom: 1mm;
}

blockquote cite {
    display: block;
    text-align: right;
    font-size: 8pt;
    color: #757575;
    margin-top: 2mm;
    font-style: normal;
}
```

---

## 6) 2단 레이아웃 (Two-Column)

### 기본 2단 구성

```css
.two-column {
    column-count: 2;
    column-gap: 5mm;
    column-rule: 0.5pt solid #e0e0e0;  /* 구분선 (선택적) */
}

/* 2단 분할 방지 */
.two-column .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
}

/* 제목은 2단 전체 너비 */
.two-column h2,
.two-column h3 {
    column-span: all;
}
```

### 사용 예시

```html
<div class="two-column">
    <div class="no-break">
        <h4>왼쪽 내용</h4>
        <ul>
            <li>항목 1</li>
            <li>항목 2</li>
        </ul>
    </div>
    
    <div class="no-break">
        <h4>오른쪽 내용</h4>
        <ul>
            <li>항목 1</li>
            <li>항목 2</li>
        </ul>
    </div>
</div>
```

---

## 7) 색상 팔레트 (교재 특화)

### 중립적/전문적 (기본 추천)

```css
:root {
    /* 배경 */
    --bg-white: #ffffff;
    --bg-light: #f5f5f5;
    --bg-lighter: #fafafa;
    
    /* 텍스트 */
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --text-muted: #757575;
    
    /* 경계 */
    --border-light: #e0e0e0;
    --border-dark: #bdbdbd;
    
    /* 강조 (1가지만 선택) */
    --accent: #2196f3;        /* 파랑 - IT/기술 */
    /* --accent: #4caf50; */   /* 초록 - 환경/교육 */
    /* --accent: #ff9800; */   /* 주황 - 경고/주의 */
    /* --accent: #9c27b0; */   /* 보라 - 크리에이티브 */
}
```

### IT/기술 교재

```css
:root {
    --accent-primary: #2196f3;    /* 파랑 */
    --accent-secondary: #00bcd4;  /* 시안 */
    --tip-color: #4caf50;         /* 초록 */
    --warning-color: #ff9800;     /* 주황 */
    --error-color: #f44336;       /* 빨강 */
}
```

### 비즈니스/경영 교재

```css
:root {
    --accent-primary: #0B3558;    /* 네이비 */
    --accent-secondary: #1976d2;  /* 파랑 */
    --gold-accent: #ffa726;       /* 골드 */
}
```

### 교육/학습 교재

```css
:root {
    --accent-primary: #ff9800;    /* 주황 */
    --accent-secondary: #4caf50;  /* 초록 */
    --fun-color: #e91e63;         /* 핑크 */
}
```

---

## 8) 아이콘 & 이모지 활용

### 이모지 사용 원칙

```css
.emoji {
    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    font-size: 1.2em;
    vertical-align: -0.1em;
}
```

### 교재 필수 이모지

| 용도 | 이모지 | 설명 |
|------|--------|------|
| 팁 | 💡 | 핵심 포인트, 좋은 아이디어 |
| 주의 | ⚠️ | 경고, 주의사항 |
| 중요 | ❗ | 반드시 알아야 할 내용 |
| 예제 | 📝 | 실습, 예시 코드 |
| 참고 | 📚 | 추가 자료, 링크 |
| 질문 | ❓ | 연습 문제, 퀴즈 |
| 체크 | ✅ | 완료, 정답, 권장사항 |
| 금지 | ❌ | 하지 말아야 할 것 |
| 정보 | ℹ️ | 일반 정보 |
| 설정 | ⚙️ | 설정, 구성 |

---

## 9) 실전 체크리스트

### 폰트 설정 체크

- [ ] Google Fonts 링크 2-3개 추가
- [ ] 한글 폰트 (Noto Sans KR / IBM Plex Sans KR)
- [ ] 영문 폰트 (Inter / Roboto)
- [ ] 코드 폰트 (JetBrains Mono / Fira Code)
- [ ] 본문 9-10pt 설정
- [ ] 행간 1.4-1.5 설정
- [ ] 자간 -0.02em (한글)

### 타이포그래피 체크

- [ ] H1: 16pt, H2: 13pt, H3: 11pt
- [ ] 제목 줄바꿈 방지 설정
- [ ] 단락 간격 2mm
- [ ] 본문 양쪽 정렬
- [ ] 한글 단어 단위 줄바꿈

### 교재 요소 체크

- [ ] 정보 박스 3종 이상 (팁, 주의, 예제)
- [ ] 코드 블록 스타일 정의
- [ ] 표 디자인 완성
- [ ] 2단 레이아웃 (필요 시)
- [ ] 체크리스트 스타일

### 색상 체크

- [ ] 팔레트 2-3색만 사용
- [ ] 본문 대비율 4.5:1 이상
- [ ] 정보 박스 배경색 일관성
- [ ] 강조색 과용 금지

### 인쇄 체크

- [ ] A4 크기 강제 (@page)
- [ ] 여백 15mm 설정
- [ ] 페이지 밀도 70-80%
- [ ] 페이지 나눔 제어
- [ ] 시험 인쇄 확인

---

## 10) 완전한 템플릿 (복사 후 즉시 사용)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>교재 제목</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        @page { size: A4; margin: 0; }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            /* 폰트 */
            --font-kr: 'IBM Plex Sans KR', sans-serif;
            --font-en: 'Inter', sans-serif;
            --font-code: 'JetBrains Mono', monospace;
            
            /* 색상 */
            --text: #1a1a1a;
            --text-muted: #757575;
            --border: #e0e0e0;
            --accent: #2196f3;
        }
        
        body {
            font-family: var(--font-kr);
            font-size: 9pt;
            line-height: 1.45;
            color: var(--text);
            letter-spacing: -0.02em;
            word-break: keep-all;
        }
        
        .page {
            width: 210mm;
            height: 297mm;
            padding: 15mm;
            background: white;
            page-break-after: always;
        }
        
        h1 { font-size: 16pt; font-weight: 700; margin-bottom: 3mm; }
        h2 { font-size: 13pt; font-weight: 600; margin: 5mm 0 2mm; border-bottom: 1pt solid var(--border); padding-bottom: 1mm; }
        h3 { font-size: 11pt; font-weight: 600; margin: 4mm 0 1.5mm; }
        
        p { margin-bottom: 2mm; text-align: justify; }
        
        .tip-box {
            background: #e8f5e9;
            border-left: 3pt solid #4caf50;
            padding: 6pt 8pt;
            margin: 3mm 0;
        }
        
        .code-block {
            background: #f5f5f5;
            border: 0.5pt solid var(--border);
            padding: 5pt 6pt;
            margin: 3mm 0;
            font-family: var(--font-code);
            font-size: 8pt;
            line-height: 1.4;
        }
        
        code {
            background: #f5f5f5;
            padding: 1pt 3pt;
            font-family: var(--font-code);
            font-size: 8.5pt;
        }
        
        @media print {
            body { background: white; }
            .page { margin: 0; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="page">
        <h1>교재 제목</h1>
        
        <h2>1. 섹션 제목</h2>
        <p>본문 내용입니다.</p>
        
        <div class="tip-box">
            💡 <strong>팁:</strong> 중요한 정보
        </div>
        
        <h3>1.1 하위 섹션</h3>
        <p>설명 내용입니다.</p>
        
        <div class="code-block">
const hello = "world";
console.log(hello);
        </div>
    </div>
</body>
</html>
```

---

## 📌 최종 요약

### 교재 폰트 선택 3원칙

1. **가독성 최우선** - 9pt에서도 명확한 폰트
2. **Google Fonts 활용** - 무료·상업적 사용 가능
3. **2-3개 조합** - 한글 + 영문 + 코드

### 권장 조합 TOP 3

🥇 **IBM Plex Sans KR + Inter + JetBrains Mono**
   → IT/기술 교재 최적

🥈 **Noto Sans KR + Roboto + Fira Code**
   → 범용 교재 안전

🥉 **Noto Sans KR + Source Sans 3 + Source Code Pro**
   → 학술/연구 교재

### 절대 금지 사항

- ❌ 본문 11pt 이상 사용
- ❌ 폰트 4개 이상 혼용
- ❌ 코드에 일반 폰트 사용
- ❌ 행간 1.6 이상 (정보 밀도 저하)
- ❌ 과도한 장식 폰트

---

> 이 가이드의 모든 폰트는 **Google Fonts에서 무료로 제공**되며, **상업적 사용이 가능**합니다.

## 추가 세련된 디자인 폰트 조합

1. CHABUL + RULINGPEN
2. FIRST + VESSALONA
3. VIANA + CURRENT
4. CARGING SOFT + PRETTY DAHLIA

---

## 11) 편입영어 교재 전용 폰트 표준

> **이 섹션은 `02_textbooks/` 교재 시스템에 적용되는 확정 사항입니다.**

### 확정 폰트 스택

| 역할 | 폰트 | 굵기 | 용도 |
|------|------|------|------|
| **한글 본문** | Noto Sans KR | 400/500/700 | 전 교재 본문, 해설, UI |
| **영문 본문** | Inter | 400/500/600/700 | 영문 지문, 선택지, 해설 내 영단어 |
| **영문 악센트** | Playfair Display | 400/700 | 문법 시리즈 표지/섹션 제목 (장식용) |

### 폐기 대상 (마이그레이션 시 교체)

| 폰트 | 현재 사용처 | 교체 방안 |
|------|-----------|----------|
| **Merriweather** | 독해 Bridge에서만 사용 | → Inter로 통일 |
| **Noto Serif KR** | 구문독해 제목에서만 사용 | → 유지 여부 결정 필요 (earth-tone 전용 가능) |

### 폰트 로딩 표준 (전 교재 공통)

```html
<!-- 표준 폰트 로딩 — 모든 교재 HTML <head>에 포함 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
```

**금지사항:**
- ❌ `@import url(...)` 방식 사용 금지 (렌더링 차단 유발)
- ❌ 교재별로 다른 폰트 조합 사용 금지
- ❌ 표준 외 폰트 추가 금지 (성능 저하)

### 교재별 CSS 변수 표준

```css
:root {
    /* 폰트 패밀리 */
    --font-kr: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    --font-en: 'Inter', sans-serif;
    --font-accent: 'Playfair Display', serif;  /* 문법 시리즈 전용 */

    /* 본문 */
    --font-size-body: 10pt;        /* 확정: 전 교재 통일 */
    --line-height-body: 1.5;       /* 확정: 전 교재 통일 */
    --letter-spacing-kr: -0.02em;  /* 한글 자간 */
    --letter-spacing-en: 0;        /* 영문 자간 */

    /* 제목 체계 */
    --font-size-h1: 16pt;
    --font-size-h2: 13pt;
    --font-size-h3: 11pt;
    --font-size-h4: 10pt;

    /* 특수 요소 */
    --font-size-passage: 9.5pt;    /* 영문 지문 */
    --line-height-passage: 1.6;    /* 영문 지문 */
    --font-size-choice: 9.5pt;     /* 선택지 */
    --font-size-caption: 8pt;      /* 캡션, 출처 */
    --font-size-header: 8.5pt;     /* 페이지 헤더 */
    --font-size-footer: 7.5pt;     /* 페이지 푸터 */
    --font-size-cover-title: 36pt; /* 표지 제목 */
    --font-size-cover-sub: 18pt;   /* 표지 부제 */
}
```

### 현재 교재별 폰트 불일치 현황 (마이그레이션 시 수정)

| 교재 | 현재 폰트 | 현재 크기 | 현재 행간 | 현재 단위 | 문제점 |
|------|----------|----------|----------|----------|--------|
| 문법 Bridge (2-2~2-9) | Noto Sans KR + Inter + Playfair | 11pt | 1.8 | pt | 행간 과다 |
| 문법 Advanced | Noto Sans KR + Inter | 12.5px | 1.7 | **px** ⚠️ | 단위 비표준 |
| 독해 Basic | Noto Sans KR + Inter | 10pt | 1.7 | pt | 행간 과다 |
| 독해 Bridge | Noto Sans KR + **Merriweather** ⚠️ | 미설정 | 미설정 | - | 비표준 폰트 |
| 독해 Intermediate | Noto Sans KR + Inter | 미설정 | 1.4 | - | 크기 미설정 |
| 구문독해 | Noto Sans KR + **Serif** ⚠️ | 10pt | 1.7 | pt | 폰트 로딩 없음 |
| 보카 | Noto Sans KR + Inter | 미설정 | 1.6 | - | 크기 미설정 |
| 논리 | Noto Sans KR + Inter | 미설정 | 1.65 | - | 크기/행간 미설정 |
