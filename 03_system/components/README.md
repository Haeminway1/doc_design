# 교재 컴포넌트 라이브러리

편입영어 교재 제작을 위한 8가지 핵심 컴포넌트 CSS입니다.

## 📦 컴포넌트 목록

### 1. `cover.css` — 표지 페이지
- **용도**: 교재 표지 디자인
- **변형**: 4가지 (border-frame, overlay, minimal, full-bleed)
- **주요 클래스**:
  - `.cover-page` - 기본 컨테이너
  - `.cover-brand` - 브랜드명
  - `.cover-main-title` - 메인 제목
  - `.cover-edition` - 에디션/부제
  - `.cover-author` - 저자 (하단 고정)

### 2. `toc.css` — 목차
- **용도**: 교재 목차 (Table of Contents)
- **변형**: 1열 / 2열 레이아웃
- **주요 클래스**:
  - `.toc-title` - 목차 제목
  - `.toc-list` - 목차 리스트
  - `.toc-item` - 각 항목
  - `.toc-item-dots` - 점선 리더
  - `.toc-list--two-columns` - 2단 레이아웃

### 3. `section-title.css` — 섹션/챕터 제목
- **용도**: 교재 내 섹션, 챕터, 파트 제목
- **변형**: 3가지 (boxed, centered, left-bar)
- **주요 클래스**:
  - `.chapter-title` - 챕터 제목 (가장 큰)
  - `.section-title` - 섹션 제목
  - `.subsection-title` - 서브섹션 제목
  - `.section-number` - 번호
  - `.section-subtitle` - 부제

### 4. `problem.css` — 문제 블록
- **용도**: 문법/독해/논리 문제 표시
- **변형**: 컴팩트 / 표준
- **주요 클래스**:
  - `.problem` - 문제 컨테이너
  - `.problem-number` - 문제 번호 (원형/사각)
  - `.problem-type-badge` - 유형 뱃지
  - `.problem-stem` - 지문/문장
  - `.problem-choices` - 선택지 (2열 기본)
  - `.problem-choices--single-column` - 1열 선택지
  - `.problem--compact` - 컴팩트 문제

### 5. `explanation.css` — 정답 해설
- **용도**: 문제 정답 및 해설
- **변형**: 컴팩트 / 표준
- **주요 클래스**:
  - `.explanation` - 해설 컨테이너
  - `.answer-badge` - 정답 뱃지
  - `.explanation-body` - 해설 본문
  - `.explanation-example` - 해설 내 예문
  - `.explanation--compact` - 컴팩트 해설

### 6. `answer-grid.css` — 정답표
- **용도**: 문제집 정답 그리드
- **변형**: 10열 / 5열 / 3열 / 인라인
- **주요 클래스**:
  - `.answer-grid` - 정답표 컨테이너
  - `.answer-grid-table` - 그리드 (10열 기본)
  - `.answer-grid-table--5-columns` - 5열
  - `.answer-grid-table--3-columns` - 3열
  - `.answer-grid--inline` - 인라인 정답표
  - `.answer-grid--compact` - 컴팩트 정답표

### 7. `concept-box.css` — 개념 정의 박스
- **용도**: 핵심 개념, 정의, 공식 설명
- **변형**: 4가지 (기본, example, warning, error)
- **주요 클래스**:
  - `.concept-box` - 개념 박스 (파란 계열)
  - `.concept-box-title` - 제목
  - `.concept-box-content` - 내용
  - `.concept-formula` - 공식/패턴
  - `.concept-box--example` - 예제 박스 (초록)
  - `.concept-box--warning` - 주의 박스 (노랑)
  - `.concept-box--error` - 오류 박스 (빨강)

### 8. `tip-box.css` — Vera's Tip 박스
- **용도**: 학습 팁, 암기 요령, 주의사항
- **변형**: 3가지 (warning, memo, strategy)
- **주요 클래스**:
  - `.tip-box` - 팁 박스
  - `.tip-box-title` - "Vera's Flavor Tip" 제목
  - `.tip-subtitle` - 소제목
  - `.tip-content` - 내용
  - `.tip-checklist` - 체크리스트
  - `.tip-steps` - 단계별 리스트
  - `.tip-box--warning` - 경고 팁
  - `.tip-box--memo` - 암기 팁
  - `.tip-box--strategy` - 실전 팁

## 🎨 디자인 원칙

### PDF 안전성
- ✅ **솔리드 컬러만 사용** (gradient, box-shadow, text-shadow 금지)
- ✅ **`!important` 적용** (Puppeteer 렌더링 강제)
- ✅ **`break-inside: avoid`** (페이지 분할 방지)

### CSS 변수 사용
모든 색상과 간격은 `/03_system/base/page-layout.css`의 CSS 변수 사용:
- 색상: `var(--color-*)`
- 간격: `var(--space-*)`
- 폰트 크기: `var(--text-*)`
- 행간: `var(--leading-*)`

### BEM-like 네이밍
```
.component              (블록)
.component-element      (요소)
.component--modifier    (변형)
```

## 📁 사용법

### 방법 1: 전체 임포트
```html
<link rel="stylesheet" href="03_system/base/page-layout.css">
<link rel="stylesheet" href="03_system/components/index.css">
```

### 방법 2: 개별 컴포넌트 선택
```html
<link rel="stylesheet" href="03_system/base/page-layout.css">
<link rel="stylesheet" href="03_system/components/problem.css">
<link rel="stylesheet" href="03_system/components/explanation.css">
```

## 🔗 관련 파일
- **디자인 토큰**: `/03_system/base/page-layout.css`
- **기본 CSS**: `/03_system/base/reset.css`, `print.css`, `utilities.css`
- **템플릿**: `/03_system/templates/` (ocean-blue, royal-purple 등)
- **가이드라인**: `/06_reference/guideline/guideline.md`

## 📝 마크업 예시

### 문제 + 해설
```html
<div class="problem" data-id="1">
  <div class="problem-header">
    <span class="problem-number">1</span>
    <span class="problem-type-badge">문법</span>
  </div>
  <div class="problem-stem eng-text">
    She _____ to the library every day.
  </div>
  <ol class="problem-choices">
    <li>go</li>
    <li>goes</li>
    <li>going</li>
    <li>gone</li>
  </ol>
</div>

<div class="explanation" data-problem-id="1">
  <div class="explanation-header">
    <span class="problem-number">1</span>
    <span class="answer-badge">②</span>
  </div>
  <div class="explanation-body">
    <p>주어가 3인칭 단수(She)이고 every day로 습관적 행위를 나타내므로
    현재시제 3인칭 단수형 <strong>goes</strong>가 정답입니다.</p>
  </div>
</div>
```

### 개념 박스 + 팁 박스
```html
<div class="concept-box">
  <div class="concept-box-title">현재완료 시제</div>
  <div class="concept-box-content">
    <div class="concept-formula">have/has + p.p.</div>
    <p>과거부터 현재까지 이어지는 동작이나 상태를 나타냅니다.</p>
  </div>
</div>

<div class="tip-box">
  <div class="tip-box-title">Vera's Flavor Tip</div>
  <div class="tip-subtitle">현재완료 시제 판별법</div>
  <div class="tip-content">
    <ul class="tip-checklist">
      <li>since, for와 함께 사용</li>
      <li>already, yet, just 확인</li>
      <li>have been to (경험) vs have gone to (완료)</li>
    </ul>
  </div>
</div>
```

## 🎯 다음 단계
1. ✅ 8개 컴포넌트 CSS 작성 완료
2. ⏳ 템플릿별 색상 테마 작성 (`03_system/templates/`)
3. ⏳ 기존 교재 17개 마이그레이션 (`02_textbooks/source/` → 컴포넌트 기반)
4. ⏳ 빌드 스크립트 작성 (데이터 + 컴포넌트 → HTML/PDF)

---

**제작**: Vera's Document Studio
**버전**: 1.0.0
**갱신**: 2026-02-16
