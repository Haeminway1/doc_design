# PDF 안전 스타일 치환 매핑표

> **목적**: Puppeteer HTML→PDF 변환 시 렌더링 깨짐을 방지하기 위한 CSS 치환 가이드
> **적용 대상**: `02_textbooks/source/` 전체 17개 교재
> **참조**: `06_reference/PDF_DESIGN_GUIDE.md`

---

## 1. 위험 스타일 → 안전 대체 매핑

### A. 그라데이션 (Gradient)

| 위험 스타일 | 안전 대체 | 비고 |
|-----------|----------|------|
| `linear-gradient(135deg, #3498DB, #2C3E50)` | `background-color: #345C85;` | 중간값 솔리드 |
| `linear-gradient(to right, #A, #B)` | `background-color: #midpoint;` | 두 색의 중간값 |
| `radial-gradient(...)` | `background-color: #center-color;` | 중심색 사용 |

**현재 위반 파일:**
- `[편입영어]문법_advanced.html` — `.chapter-header` 에 `linear-gradient(135deg, #3498DB, #2C3E50)`
- `[편입영어]논리_basic.html` — 여러 곳에서 gradient 사용

**대체 방법:**
```css
/* ❌ 위험 */
.chapter-header {
    background: linear-gradient(135deg, #3498DB, #2C3E50);
}

/* ✅ 안전 — 솔리드 */
.chapter-header {
    background-color: #2F6E99 !important;
}

/* ✅ 안전 — 이미지 대체 (고급) */
.chapter-header {
    background-image: url('../../05_assets/backgrounds/header-gradient.png') !important;
    background-size: cover !important;
}
```

---

### B. 투명도 (rgba / opacity)

| 위험 스타일 | 안전 대체 | 비고 |
|-----------|----------|------|
| `rgba(0,0,0,0.9)` | `#1A1A1A` | 90% 불투명 → 근사 솔리드 |
| `rgba(0,0,0,0.5)` | `#808080` | 50% 불투명 → 흰배경 기준 중간값 |
| `rgba(0,0,0,0.1)` | `#E6E6E6` | 10% 불투명 → 흰배경 기준 |
| `rgba(255,255,255,0.85)` | `#F2F2F2` | 흰색 85% → 근사값 |
| `rgba(46,24,71,0.5)` | `#978BA3` | 독해 Basic 오버레이 |
| `opacity: 0.8` | 제거 또는 솔리드 색상 | 요소 전체 투명도 |

**변환 공식 (흰색 배경 기준):**
```
결과색 = 원래색 × alpha + 255 × (1 - alpha)

예: rgba(0,0,0,0.1)
  R = 0 × 0.1 + 255 × 0.9 = 230 → #E6E6E6
```

**현재 위반 파일:**
- 문법 Bridge (2-2~2-9): `backdrop-filter: blur()`, `rgba()` 표지
- 독해 Basic: `rgba(46,24,71,0.5)` 오버레이
- 독해 Bridge: `rgba()` 투명도
- 구문독해: `rgba()` 배경
- 보카: `rgba(255,255,255,0.85)` 텍스트 영역

---

### C. 그림자 (Shadows)

| 위험 스타일 | 안전 대체 | 비고 |
|-----------|----------|------|
| `box-shadow: 0 4px 12px rgba(0,0,0,0.1)` | `border: 1px solid #E0E0E0;` | 경계선으로 대체 |
| `box-shadow: 0 6px 20px ...` | `border: 1px solid #D0D0D0;` | 더 진한 경계선 |
| `text-shadow: 1px 1px 2px ...` | `font-weight: 600; color: #적절한색;` | 굵기+색상으로 대체 |
| `box-shadow: inset ...` | `border: 1px solid #색상;` | 내부 테두리 |

**현재 위반 파일:**
- 문법 Bridge: `text-shadow`, `box-shadow`
- 문법 Advanced: `box-shadow: 0 4px 12px`
- 구문독해: `text-shadow`, `box-shadow`
- 보카: `text-shadow`

---

### D. 필터 (Filters)

| 위험 스타일 | 안전 대체 | 비고 |
|-----------|----------|------|
| `backdrop-filter: blur(10px)` | `background-color: #솔리드;` | 블러 제거, 솔리드 배경 |
| `filter: saturate(0.8)` | 원본 색상 직접 조정 | 독해 Bridge |
| `filter: brightness(...)` | 밝기 조정된 색상 직접 사용 | |

---

### E. 인터랙션 (Interaction)

| 위험 스타일 | 안전 대체 | 비고 |
|-----------|----------|------|
| `:hover { ... }` | 제거 | PDF에서 무의미 |
| `transition: ...` | 제거 | PDF에서 무의미 |
| `cursor: pointer` | 제거 | PDF에서 무의미 |
| `animation: ...` | 제거 | PDF에서 무의미 |

---

## 2. 교재별 위반 심각도 매트릭스

| 교재 | gradient | rgba | shadow | filter | hover | 심각도 |
|------|----------|------|--------|--------|-------|--------|
| 문법 Bridge (2-2~2-9) | - | ⚠️ | ⚠️ | ⚠️ blur | - | **높음** |
| 문법 Advanced | ❌ | ⚠️ | ⚠️ | - | - | **높음** |
| 독해 Basic | - | ❌ | ⚠️ | - | - | **중간** |
| 독해 Bridge | - | ⚠️ | - | ⚠️ sat | - | **낮음** |
| 독해 Intermediate | - | - | - | - | - | **안전** |
| 구문독해 | - | ⚠️ | ⚠️ | - | - | **중간** |
| 보카 | - | ⚠️ | ⚠️ | - | - | **중간** |
| 논리 | ❌❌ | ⚠️ | - | - | ❌ ✅수정됨 | **치명적** |

---

## 3. Print 미디어 쿼리 필수 규칙

모든 교재 HTML에 아래 `@media print` 블록을 포함해야 합니다:

```css
@media print {
    /* 그림자 전면 제거 */
    * {
        box-shadow: none !important;
        text-shadow: none !important;
    }

    /* 배경색 강제 인쇄 */
    body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* 페이지 설정 */
    .page {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
    }

    .page:last-of-type {
        page-break-after: auto !important;
    }

    /* 인터랙션 요소 제거 */
    *:hover { /* 모든 hover 효과 무효화 */ }

    /* 디버그/개발 패널 숨김 */
    .debug-panel,
    #system-info {
        display: none !important;
    }
}
```

---

## 4. Puppeteer PDF 생성 시 추가 주의사항

### 페이지 분리 제어
```css
/* 박스/테이블이 페이지에 걸쳐 잘리지 않도록 */
.component-box,
.problem,
.passage,
.word-entry,
.explanation,
table {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

/* 제목 다음 바로 페이지 넘김 방지 */
h1, h2, h3, h4 {
    page-break-after: avoid !important;
    break-after: avoid !important;
}
```

### 단위 표준
```
✅ 허용: pt, mm, cm, px (정수만)
⚠️ 주의: em, rem (계산 결과에 따라 달라짐)
❌ 금지: vw, vh, vmin, vmax (뷰포트 기반 — PDF에서 불안정)
```

### 색상 표준
```
✅ 허용: #RRGGBB, #RGB, rgb(r,g,b), 색상 키워드
❌ 금지: rgba(), hsla(), transparent, currentColor (불안정)
```

---

## 5. 마이그레이션 체크리스트

각 교재 HTML 마이그레이션 시 아래 항목을 확인:

- [ ] `linear-gradient` 검색 → 솔리드 대체
- [ ] `rgba` 검색 → 불투명 hex 대체
- [ ] `text-shadow` 검색 → font-weight/color 대체
- [ ] `box-shadow` 검색 → border 대체
- [ ] `backdrop-filter` 검색 → background-color 대체
- [ ] `filter:` 검색 → 직접 색상 조정
- [ ] `:hover` 검색 → 제거
- [ ] `transition` 검색 → 제거
- [ ] `cursor: pointer` 검색 → 제거
- [ ] `opacity` 검색 → 솔리드 대체
- [ ] `vw`/`vh` 검색 → mm/pt 대체
- [ ] `@media print` 블록 존재 확인
- [ ] `-webkit-print-color-adjust: exact` 존재 확인
