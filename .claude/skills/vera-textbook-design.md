---
name: vera-textbook-design
description: Vera's Document Studio 교재 디자인 스킬. 사용자 요청을 정확하고 세련된 A4 PDF-ready HTML/CSS로 변환한다. 편입영어 교재, 설명서, 유인물 등 인쇄용 문서 제작에 특화.
user_invocable: true
---

# Vera Textbook Design Skill

사용자의 교재/문서 디자인 요청을 **정확하고 정교하고 세련된** A4 PDF-ready HTML/CSS로 변환한다.

## Core Job

사용자가 교재 콘텐츠나 디자인을 요청하면:
1. 요청을 분석하여 필요한 컴포넌트와 레이아웃을 결정
2. PDF-safe CSS 규칙을 준수하는 HTML/CSS 생성
3. vera-core 디자인 시스템의 컴포넌트와 토큰을 활용
4. A4 규격에 맞는 완성도 높은 결과물 산출

## 1. PDF-Safe CSS — 절대 규칙

### 금지 (Puppeteer에서 깨짐)
- `linear-gradient()` → 검은 사각형
- `box-shadow` → 예측 불가 아티팩트
- `text-shadow` → 텍스트 뒤 검은 박스
- `rgba()` / `opacity` → 색 번짐
- `backdrop-filter: blur()` → PDF 전체 공백 (치명적)
- `background-blend-mode` → 렌더링 실패

### 필수
- 솔리드 컬러만 (`#3a8fa3`, `#ffffff`)
- `!important`로 렌더링 강제
- `print-color-adjust: exact` + `-webkit-print-color-adjust: exact`
- `page-break-inside: avoid` + `break-inside: avoid` (둘 다)
- `page-break-after: always` (`.page`), `page-break-after: avoid` (`.page:last-child`)
- 제목(`h1-h3`)에 `page-break-after: avoid; break-after: avoid`

## 2. Design Tokens — 과목별 프리미엄 팔레트

**핵심 철학:** 적은 색, 강한 위계, 깊은 베이스 + 따뜻한 라이트 뉴트럴 + 하나의 보석/메탈릭 포인트. 순백(#FFFFFF) 대신 따뜻한 오프화이트 배경 사용.

### 과목별 팔레트 (4색 체계: Base / Accent / Mid / Background)

**Grammar — "Structured Authority" (정밀, 권위, 차분)**
```css
--base: #1C1F24;        /* 딥 차콜 — 제목, 규칙 */
--accent: #C79C5A;      /* 웜 브래스 골드 — 섹션 구분, 핵심 마커 */
--mid: #3A4452;         /* 스틸 슬레이트 — 소제목, 테두리 */
--bg: #F2EEE7;          /* 웜 오프화이트 — 페이지 배경 */
```

**Reading — "Intellectual Inviting" (깊이, 차분, 몰입)**
```css
--base: #0E2A3A;        /* 딥 잉크 네이비 — 주요 텍스트 */
--accent: #B08A57;      /* 앤티크 골드탄 — 지문 번호, 포인트 */
--mid: #7FA6A8;         /* 뮤트 틸 — 보조 하이라이트 */
--bg: #F1EFE8;          /* 크림 — 긴 독해용 눈 편한 배경 */
```

**Vocabulary — "Memorable Warm" (따뜻한 에너지, 기억 자극)**
```css
--base: #4A0E16;        /* 딥 가넷 — 단어 헤더 */
--accent: #C3A14A;      /* 앤티크 골드 — 어원, 루트 표시 */
--mid: #D7B9A6;         /* 웜 로즈샌드 — 정의 박스 */
--bg: #F4ECE6;          /* 페일 크림 — 배경 */
```

**Logic — "Caviar & Cream" (정밀, 분석적, 고급)**
```css
--base: #0F0F10;        /* 니어 블랙 — 논증 구조, 넘버링 */
--accent: #A88F5A;      /* 웜 골드카키 — 논리 연결어 마커 */
--mid: #2A2A2D;         /* 다크 차콜 — 보조 구조 */
--bg: #F4F1EB;          /* 웜 화이트 — 본문 영역 */
```

**Cover — "Gilded Noir" (프리미엄, 소장가치)**
```css
--base: #0B0B0F;        /* 니어 블랙 — 풀블리드 배경 */
--accent: #D4AF37;      /* 클래식 골드 */
--mid: #3B3A40;         /* 다크 그래파이트 — 부제, 출판사 */
--text: #F5F0E6;        /* 웜 크림 — 제목 텍스트 */
```

### 공통 토큰
```css
--ink: #1F2937;         /* 기본 본문 텍스트 */
--muted: #667085;       /* 보조 텍스트 */
--line: #E5E7EB;        /* 구분선 */

/* Typography — 컴팩트 교재 */
--f-sans: "Noto Sans KR", "Inter", system-ui, sans-serif;
--f-eng: "Inter", system-ui, sans-serif;
--f-display: "Playfair Display", "Cormorant Garamond", serif;
--fs-body: 9pt;    --lh-body: 1.35;
--fs-small: 8pt;   --fs-tiny: 7pt;

/* Layout */
--page-margin: 13mm;
--column-gap: 6mm;
--para-gap: 4pt;
--border-radius: 6px;   /* 박스 라운딩 — 4~8px, 너무 각지지도 둥글지도 않게 */
```

여유로운 디자인 요청 시 (`--page-margin: 20mm`, `--fs-body: 12.5pt`, `--lh-body: 1.5`).

## 3. 3-Layer CSS Architecture

```
Layer 0: Base       → reset, page-layout, print, utilities
Layer 1: Components → 20종 컴포넌트 (전 교재 공통)
Layer 2: Templates  → 시각 테마 (교재별 개성)
```

통합: `vera-core.css` (base + components). 템플릿은 HTML에서 별도 `<link>`.

**템플릿 8종**: ocean-blue, royal-purple, earth-tone, sky-academic, mint-sky, logic-blue, grammar-teal, _template-starter

## 4. Component Library (20종)

### 구조 컴포넌트

**Cover (표지)**
```html
<div class="page cover-page">
  <div class="cover-brand eng-text">vera's flavor</div>
  <div class="cover-content">
    <p class="cover-edition eng-text">Bridge Edition</p>
    <h1 class="cover-main-title">편입영어 문법</h1>
    <p class="cover-subtitle">Chapter 2: 동사의 시제</p>
  </div>
  <div class="cover-author"><span class="author-name">Vera Park</span></div>
</div>
```
표지 4종: `cover--border-frame`, `cover--overlay`, `cover--minimal`, `cover--full-bleed`

**Problem (문제 블록)**
```html
<div class="problem">
  <div class="problem-header">
    <span class="problem-number">01</span>
    <span class="problem-type">문법</span>
  </div>
  <div class="problem-text">
    <p>다음 빈칸에 들어갈 가장 적절한 것을 고르시오.</p>
    <p class="eng-text">The committee _______ the proposal after a lengthy discussion.</p>
  </div>
  <ul class="problem-choices">
    <li>① approved</li>
    <li>② approving</li>
    <li>③ to approve</li>
    <li>④ approve</li>
  </ul>
</div>
```

**Explanation (해설)**
```html
<div class="explanation">
  <div class="explanation-header">
    <span class="answer-badge">정답: ①</span>
    <span class="difficulty">★★☆</span>
  </div>
  <div class="explanation-body">
    <p>주어 'The committee'는 단수 취급하므로 단수 동사가 필요합니다.</p>
    <div class="wrong-analysis">
      <p>② approving — 동명사/현재분사로 주동사 역할 불가</p>
    </div>
  </div>
</div>
```

**Answer Grid (정답표)**
```html
<div class="answer-grid">
  <div class="answer-grid-header">정답표</div>
  <div class="answer-grid-body">
    <span class="answer-item"><strong>1</strong> ①</span>
    <span class="answer-item"><strong>2</strong> ③</span>
  </div>
</div>
```

### 박스 컴포넌트

**공통 구조** — `.component-box` + 종류별 클래스
```html
<div class="component-box {type}-box">
  <div class="box-header">
    <span class="icon">{icon}</span>
    <span class="title">{title}</span>
  </div>
  <div class="box-content">{content}</div>
</div>
```

| 종류 | 클래스 | 아이콘 | 용도 |
|------|--------|--------|------|
| Concept | `concept-box` | 📘 | 용어 정의, 개념 소개 |
| Key | `key-box` | 🔑 | 핵심 요약, 암기 포인트 |
| Warning | `warning-box` | ⚠️ | 자주 틀리는 포인트, 주의 |
| Rule | `rule-box` | 📐 | 문법 공식, 판별법 |
| Trap | `trap-box` | 🪤 | 출제 함정, 혼동 주의 |
| Tip | `tip-box` | 💡 | 학습 팁, 암기법 (Vera's Tip) |

### 과목별 컴포넌트

**Passage (독해 지문)**
```html
<div class="passage">
  <div class="passage-header">
    <span class="passage-number">Passage 1</span>
    <span class="passage-source">2024 한양대</span>
  </div>
  <div class="passage-text eng-text"><p>...</p></div>
  <div class="vocab-section">
    <div class="vocab-list">
      <span class="vocab-item"><strong>prompt</strong> 촉발하다</span>
    </div>
  </div>
</div>
```

**Word Entry (보카)**
```html
<div class="word-entry" data-word="abundant">
  <div class="word-header">
    <span class="word-number">01</span>
    <span class="word-title eng-text">abundant</span>
    <span class="word-phonetic">[əbʌ́ndənt]</span>
    <span class="word-pos">adj.</span>
  </div>
  <div class="word-body">
    <p class="word-meaning">풍부한, 많은</p>
    <p class="word-example eng-text">Water is abundant in this region.</p>
    <p class="word-synonyms">= plentiful, ample, copious</p>
  </div>
</div>
```

**기타**: `part-opener`, `day-title`, `step-section`, `pattern-box`, `comparison-table`, `grammar-table`, `example-block`, `toc`, `section-title`

## 5. Highlight Rules — 절제가 핵심

**3종만 사용:**
- `.highlight-key` — 핵심 용어 (color: #1E3A8A, font-weight: 600)
- `.highlight-bg` — 정답/핵심 개념 (background: #FEF3C7)
- `.highlight-eng` — 중요 영어 용어 (color: #0EA5E9)

**엄격한 제한 (반드시 생성 후 세서 확인):**
- 페이지당 강조 **총 7개 이하** (교재) — 박스·패턴박스·키박스 내부 포함 합산
- 단락당 강조 0~2개
- 문장당 강조 0~1개
- 강조 없는 단락 60% 이상
- 연속 2문장 모두 강조 금지

**박스 내부 하이라이트 규칙 (가장 흔한 초과 원인):**
- component-box / pattern-box / key-box 내부: **0~1개만** (박스 자체가 이미 시각적 강조)
- 한 페이지에 박스가 3개 이상이면: 박스 내부 하이라이트를 전부 0개로 — 텍스트만으로 설명
- 예시 문장 속 연결어/핵심어: `.highlight-bg` 대신 **bold(`<strong>`)로 대체** (하이라이트 카운트에서 제외됨)
- 보카 word-entry 예문: 하이라이트 사용 금지 — 단어 자체가 `.word-title`로 이미 강조됨

**금지:**
- 모든 영어 단어 강조
- 접속사/조사/관사 강조
- 이미 강조한 용어 반복 강조
- 예시 문장 전체 강조
- 장식 목적 강조
- word-entry 예문 속 해당 단어 하이라이트 (`.word-title`이 이미 강조)

## 6. Typography

### 교재 (컴팩트)
| 요소 | 크기 | 굵기 | 행간 |
|------|------|------|------|
| H1 (챕터) | 18pt | 700 | 1.2 |
| H2 (섹션) | 13pt | 700 | 1.25 |
| H3 (소제목) | 11pt | 600 | 1.25 |
| 지시문 (문제 설명) | 9pt | 400 | 1.35 |
| 본문 (영문 지문/문장) | 9pt | 400 | 1.45 |
| 선지 | 8.5pt | 400 | 1.3 |
| 캡션 | 8pt | 400 | 1.3 |

### 일반 문서 (여유)
| 요소 | 크기 | 굵기 | 행간 |
|------|------|------|------|
| H1 | 26pt | 700 | 1.25 |
| H2 | 20pt | 700 | 1.25 |
| 본문 | 12.5pt | 400 | 1.5 |

**폰트**: Noto Sans KR (한글) + Inter (영문) + Playfair Display / Cormorant Garamond (표지/장식)

### 절대 규칙
- **본문·해설 양쪽 정렬 필수** (`text-align: justify`) — 좌측 정렬 금지
- **영문 본문 이탤릭 절대 금지** — `font-style: italic` 사용 불가 (영문 지문, 예문 포함)
- **크기 위계 엄수**: 지시문(9pt) ≥ 본문(9pt) > 선지(8.5pt). 선지가 본문보다 크면 절대 안 됨
- **제목은 좌측 또는 중앙** (문서 내 일관성 유지)

## 7. Layout

### A4 규격
- 210mm × 297mm
- 교재 여백: 12~15mm / 일반 여백: 18~22mm
- 2~3컬럼 (교재), 1~2컬럼 (일반)

### 페이지 구조
```html
<div class="page">
  <div class="page-header">
    <span class="chapter">Chapter 1. 제목</span>
    <span class="page-number">1</span>
  </div>
  <div class="page-content">
    <!-- 콘텐츠 -->
  </div>
  <div class="page-footer">© Vera's Flavor</div>
</div>
```

### 콘텐츠 용량 제한
- 페이지당: 제목 1 + 본문 3~4문단 + 테이블 1 + 이미지 1
- 정보 밀도 70~80% (교재), 50~60% (일반)
- 하단 20mm는 안전 구역

## 8. 문제/선지 레이아웃 규칙

### 문제-해설 분리
- 문제와 해설은 **반드시 별도 페이지**로 분리 — 같은 페이지에 문제+해설 혼합 금지
- Page 1: 문제 + 정답표, Page 2: 해설

### 선지 레이아웃 (중요!)
- **선지가 긴 문장** (10단어 이상) → **1열** 세로 나열 (`grid-template-columns: 1fr`)
- **선지가 짧은 구/단어** (10단어 미만) → **2열** (`grid-template-columns: 1fr 1fr`)
- **선지가 단어 1개** → **가로 나열** (`display: flex; gap: 12pt`)

### 콘텐츠 정확성 (절대 규칙)
- **선지 중복 절대 금지** — 4개 선지가 모두 서로 다른 내용이어야 함
- 억지 구분 설명("문맥 차이 있음" 등) 금지 — 선지가 같으면 문제 자체를 다시 작성
- 정답이 명확히 하나여야 함 — 모호한 문제 출제 금지

### 프리미엄 색상 시스템

과목별 팔레트는 Section 2에 정의됨. 박스 색상은 과목 팔레트의 accent/mid를 활용:

| 박스 유형 | 배경 | 테두리(좌) | 텍스트 |
|----------|------|-----------|--------|
| concept-box | `--bg` 보다 살짝 어둡게 | `--accent` 3px | `--base` |
| key-box | `--accent`의 10% 밝기 | `--accent` 3px | `--base` |
| warning-box | 따뜻한 톤 (#FEF3C7) | `--accent` 3px | `--base` |
| rule-box | `--mid`의 90% 밝기 | `--mid` 3px | `--base` |

### 디자인 세련도 규칙
- **border-radius: 4~8px** — 너무 각지지도(0px) 둥글지도(16px+) 않게
- **순백(#FFFFFF) 배경 금지** — 오프화이트/크림 사용 (눈 피로 감소)
- **섹션 간 여백 충분히** — 최소 24~32px top/bottom
- **3색 이내 유지** — 한 섹션에 3색 초과 금지

## 9. Quality Checklist

생성 완료 후 반드시 검증:

### PDF 안전성
- [ ] gradient, shadow, rgba, opacity, backdrop-filter 없음
- [ ] 모든 배경색에 `!important`
- [ ] `print-color-adjust: exact` 적용
- [ ] `break-inside: avoid` on 박스/테이블

### 타이포그래피
- [ ] 폰트 1~2개
- [ ] 크기 위계 명확 (H1 > H2 > H3 > 본문)
- [ ] 행간 교재 1.35 / 일반 1.5

### 강조
- [ ] 페이지당 강조 ≤ 7 (교재) / ≤ 10 (일반)
- [ ] 단락당 강조 ≤ 2
- [ ] 강조 없는 단락 ≥ 60%
- [ ] `.highlight-key`, `.highlight-bg`, `.highlight-eng` 3종만 사용

### 레이아웃
- [ ] A4 규격 (210mm × 297mm)
- [ ] 여백 교재 12~15mm / 일반 18~22mm
- [ ] 페이지당 요소 3개 이하
- [ ] `page-break-after: always` on `.page`

### 색상
- [ ] 팔레트 2~4색
- [ ] WCAG AA 대비 (4.5:1+)
- [ ] 솔리드 컬러만

### 컴포넌트
- [ ] vera-core 클래스명 사용
- [ ] 박스 템플릿 일관
- [ ] 표지 요소 5개 이하

## 10. 디자인 원칙

### 4대 원칙
1. **미니멀리즘** — 불필요한 장식 제거, 정보 전달 집중
2. **일관성** — 색·폰트·간격·정렬 전 페이지 통일
3. **위계** — 타이포·크기·굵기·색·여백으로 중요도 표현
4. **여백** — 비울 곳은 과감히 비우기

### 피해야 할 것
- 이모티콘 남용 (박스 아이콘 외 사용 금지)
- 네온/형광 색감, 순수 파란(#0000FF), 순수 빨강(#FF0000)
- 목적 없는 둥근 상자 남발 (border-radius 16px+ 금지)
- 밝은 무지개 그라데이션
- 과밀 (정보 밀도 80% 초과)
- 폰트 3개 이상
- **순백(#FFFFFF) 배경** — 항상 오프화이트/크림 사용
- **영문 이탤릭** — font-style: italic 사용 절대 금지
- **선지가 본문보다 큰 글씨** — 크기 위계 위반
- **선지 중복** — 동일 선지 2개 이상 절대 금지
- **문제+해설 같은 페이지** — 반드시 분리

### 시선 흐름
- 교재: F-패턴 (좌→우, 상→하 반복)
- 단면물: Z-패턴 (좌상→우하)

## 11. Process

사용자 요청을 받으면:

1. **분석** — 문서 유형 (교재/유인물/제안서), 디자인 톤 (컴팩트/여유), 필요 컴포넌트 파악
2. **설계** — 페이지 수, 레이아웃 (1~3컬럼), 색상 팔레트, 템플릿 선택
3. **생성** — PDF-safe HTML/CSS 작성, vera-core 컴포넌트 활용
4. **검증** — Quality Checklist 전 항목 확인
5. **전달** — 완성된 HTML + 필요시 빌드 명령어 안내

doc_design 프로젝트에서 작업 중이면 기존 `03_system/` 디자인 시스템과 `02_textbooks/` 데이터를 활용한다.
다른 프로젝트면 자체 완결형 HTML(인라인 CSS)을 생성한다.

## 12. YAML Manifest (교재 빌드용)

doc_design 프로젝트에서 교재를 빌드할 때:

```yaml
version: 2
book:
  id: grammar-bridge-ch02
  title: 문법 Bridge - 가정법
  shortTitle: 문법 Bridge
  author: Vera's Flavor
  brand: Vera's Flavor
  subject: grammar    # grammar | reading | syntax | logic | vocab
  level: bridge       # basic | bridge | intermediate | advanced
  theme: sky-academic  # 03_system/templates/ 하위 테마명
pages:
  - kind: cover
  - kind: legacy-page
    source: { path: grammar/bridge/ch02-content-01.html }
  - kind: problem-set
    layout: compact
    source: { path: grammar/bridge/ch02-problems.json }
  - kind: answer-grid
    source: { path: grammar/bridge/ch02-problems.json }
  - kind: explanations
    source: { path: grammar/bridge/ch02-problems.json }
```

페이지 kind: `cover`, `toc`, `legacy-page`, `content`, `problem-set`, `answer-grid`, `explanations`, `passages`, `vocabulary`

## 13. paged.js (대형 교재 전용)

200페이지 이상 교재에서 사용:
- running header/footer, 자동 페이지번호, 홀짝 마진
- `@page`, `@page :left/:right`, `string-set`, `counter(page)`
- `.chapter { break-before: right; }` — 챕터는 오른쪽 페이지 시작
- Puppeteer 마진 0 (paged.js가 관리)
