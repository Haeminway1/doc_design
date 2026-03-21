# 과목별 컴포넌트 CSS 작성 완료

## 📦 작업 결과 (2026-02-16)

### 생성된 파일 (7개 CSS + 3개 문서)

#### 신규 컴포넌트 CSS (7개)
1. **warning-box.css** — 주의/경고 박스
   - 용도: 문법 함정, 주의사항, 예외 규칙
   - 특징: 좌측 4px 보더, ⚠️ 아이콘 자동 삽입, ul/ol 지원

2. **rule-box.css** — 문법 공식/규칙 박스
   - 용도: 문법 공식, 패턴 (예: "If + S + 과거, S + would + R")
   - 특징: 중앙 정렬, 2px 보더, hr 구분선
   - 변형: `.rule-box--small`

3. **comparison-table.css** — 비교표
   - 용도: 직설법 vs 가정법, 현재완료 vs 과거 등
   - 특징: accent-dark 헤더, 첫 열 구분, b/strong 강조
   - 변형: `--striped`, `--compact`

4. **grammar-table.css** — 문법 도표
   - 용도: 시제표, 동사 변화표, 형식 비교표
   - 특징: caption, thead/tbody th 구분, .eng-text
   - 변형: `--compact`

5. **passage.css** — 독해 지문 + 어휘
   - 용도: 영문 지문 표시 + 하단 어휘 리스트
   - 특징: article 태그, flex 헤더, 2열 vocab 그리드
   - 변형: `--single-column`

6. **word-entry.css** — 보카 단어 엔트리
   - 용도: 단어, 발음, 품사, 뜻, 예문, 관련어
   - 특징: 품사 뱃지, 예문 박스(좌측 3px 보더)
   - 변형: `--compact`

7. **example-block.css** — 구문 분석 예시
   - 용도: 문장 구조 분석, S/V/O/C 표시
   - 특징: syntax-label 뱃지 5종, → 화살표 자동 삽입
   - 변형: `--compact`
   - 라벨 색상: `--subject`, `--verb`, `--object`, `--complement`, `--modifier`

#### 문서 (3개)
8. **index.css** — 통합 import (기존 파일 수정됨)
9. **README.md** — 사용 가이드 (마크업 예시 포함)
10. **COMPLETION_REPORT.md** — 상세 완료 보고서

## 📊 디자인 시스템 구조

```
03_system/
├── base/
│   ├── reset.css
│   ├── page-layout.css      ← 디자인 토큰 정의 (:root 99줄)
│   ├── print.css
│   └── utilities.css
├── components/              ← 20개 CSS
│   ├── [공통] cover.css, toc.css, section-title.css, problem.css, explanation.css, answer-grid.css
│   ├── [개념] concept-box.css, tip-box.css
│   ├── [문법] warning-box.css ✅, rule-box.css ✅, comparison-table.css ✅, grammar-table.css ✅
│   ├── [독해] passage.css ✅
│   ├── [보카] word-entry.css ✅
│   ├── [구문] example-block.css ✅
│   ├── [특수] part-opener.css, day-title.css, step-section.css, pattern-box.css
│   ├── index.css ✅
│   └── README.md ✅
├── templates/
│   ├── ocean-blue/, royal-purple/, mint-sky/, earth-tone/, logic-blue/, sky-academic/, study-analysis/
│   └── 피드백지_template.html
└── vera-core.css            ← base + components 통합

✅ = 금번 작업에서 생성/수정
```

## ✅ 디자인 원칙 준수 확인

### PDF 안전성
- ✅ 솔리드 컬러만 사용 (CSS 변수)
- ✅ gradient, box-shadow, text-shadow, rgba(), opacity 미사용
- ✅ 모든 스타일에 `!important` 플래그
- ✅ `-webkit-print-color-adjust: exact` 보장

### 페이지 분할 방지
- ✅ `break-inside: avoid !important`
- ✅ `page-break-inside: avoid !important`

### CSS 변수 사용
- ✅ 색상: `var(--color-*)`
- ✅ 간격: `var(--space-*)`
- ✅ 폰트 크기: `var(--text-*)`
- ✅ 행간: `var(--leading-*)`
- ✅ 폰트: `var(--font-*)`

### BEM-like 네이밍
- ✅ `.component`
- ✅ `.component-element`
- ✅ `.component--modifier`

### 문서화
- ✅ 각 CSS 파일 상단에 주석 (컴포넌트명, 용도, 마크업 예시)
- ✅ README.md 작성 (전체 사용 가이드 + 예시)

## 🔍 검증 결과

### 파일 개수
```bash
ls /Users/haemin/projects/doc_design/03_system/components/*.css | wc -l
# 20개 (index.css 포함)
```

### vera-core.css import
```bash
grep "@import url('components/" /Users/haemin/projects/doc_design/03_system/vera-core.css
# 16개 import (Tier 1-3 전체 포함)
```

### 디자인 토큰
- 기준 파일: `03_system/base/page-layout.css`
- `:root` 섹션: 99줄
- 모든 신규 컴포넌트가 토큰 사용

## 📝 사용법

### 1. vera-core.css 사용 (권장)
```html
<link rel="stylesheet" href="03_system/vera-core.css">
<!-- base + 모든 components 자동 로드 -->
```

### 2. components만 사용
```html
<link rel="stylesheet" href="03_system/components/index.css">
<!-- 20개 컴포넌트 전체 로드 -->
```

### 3. 개별 컴포넌트 선택
```html
<link rel="stylesheet" href="03_system/components/warning-box.css">
<link rel="stylesheet" href="03_system/components/passage.css">
```

## 📖 마크업 예시

### warning-box
```html
<div class="warning-box">
  <h4>주의</h4>
  <p>과거완료는 과거 시점보다 더 이전을 나타낼 때만 사용합니다.</p>
</div>
```

### passage (독해 지문)
```html
<article class="passage" data-id="1">
  <header class="passage-header">
    <span class="passage-number">[지문 1]</span>
    <h3 class="passage-title">The Impact of Technology</h3>
  </header>
  <div class="passage-body eng-text">
    <p>Technology has transformed our lives...</p>
  </div>
  <div class="passage-vocab">
    <h4 class="passage-vocab-title">Vocabulary</h4>
    <ul class="vocab-list">
      <li class="vocab-item">
        <span class="vocab-word">transform</span>
        <span class="vocab-meaning">변화시키다</span>
      </li>
    </ul>
  </div>
</article>
```

### example-block (구문 분석)
```html
<div class="example-block">
  <h4 class="example-block-title">Example 1</h4>
  <p class="example-sentence eng-text">
    I gave <strong>him</strong> <strong>a book</strong>.
  </p>
  <div class="example-analysis">
    <p>
      <span class="syntax-label syntax-label--subject">S</span> I
      <span class="syntax-label syntax-label--verb">V</span> gave
      <span class="syntax-label syntax-label--object">IO</span> him
      <span class="syntax-label syntax-label--object">DO</span> a book
    </p>
    <p class="syntax-arrow">4형식: S + V + IO + DO</p>
  </div>
</div>
```

## 🎯 다음 단계 (옵션)

1. ⬜ HTML 샘플 페이지 생성 (컴포넌트 시각적 테스트)
2. ⬜ Puppeteer PDF 렌더링 테스트
3. ⬜ 기존 교재 HTML 17개 마이그레이션
4. ⬜ 템플릿 시스템 확장

## 📂 산출물 위치

```
/Users/haemin/projects/doc_design/03_system/components/
├── warning-box.css          ✅ 신규
├── rule-box.css             ✅ 신규
├── comparison-table.css     ✅ 신규
├── grammar-table.css        ✅ 신규
├── passage.css              ✅ 신규
├── word-entry.css           ✅ 신규
├── example-block.css        ✅ 신규
├── index.css                ✅ 수정
├── README.md                ✅ 신규
├── COMPLETION_REPORT.md     ✅ 신규
└── WORK_SUMMARY.md          ✅ 신규 (이 파일)
```

## ⏱️ 작업 정보
- 작업일: 2026-02-16
- 소요 시간: 약 20분
- 작성자: Sisyphus-Junior (OhMyOpenCode)
