# Textbook System SSOT v2

이 문서는 `02_textbooks` 교재 시스템의 단일 진실 원천(SSOT)이다.
앞으로 교재 HTML/PDF 생성, 신규 교재 추가, 디자인 변경, 마이그레이션은 이 문서를 기준으로 판단한다.

## 목표

1. 현재 보유한 교재 데이터를 안정적으로 HTML/PDF로 렌더링한다.
2. 디자인 변경은 테마 교체와 토큰 수정만으로 처리한다.
3. 신규 교재는 자유 HTML이 아니라 표준 스키마와 컴포넌트로 제작한다.
4. 렌더링 실패는 보정이 아니라 빌드 실패로 처리한다.

## 비협상 원칙

1. 구조와 디자인을 분리한다.
2. 데이터와 프레젠테이션을 분리한다.
3. DOM 계약은 공통 컴포넌트가 소유한다.
4. 모든 교재는 첫 페이지에 표지가 있어야 한다.
5. 모든 본문 페이지는 기본 content inset을 가진다.
6. 페이지네이션은 실제 렌더 높이 기준으로 수행한다.
7. overflow가 발생한 PDF는 성공으로 간주하지 않는다.
8. 새 교재는 인라인 스타일을 금지한다.
9. 새 교재는 책별 임의 CSS를 금지한다.

## 시스템 레이어

### Layer 0. Base

- 위치: `03_system/base/`
- 책임: reset, page size, print rules, typography tokens, header/footer primitives

### Layer 1. Components

- 위치: `03_system/components/`
- 책임: 문제, 지문, 정답표, 해설, 개념 박스, 표지, 목차 등 공통 DOM 계약

### Layer 2. Templates

- 위치: `03_system/templates/`
- 책임: 색상, 폰트, radius, cover variant, tone
- 제한: 컴포넌트 DOM 구조를 바꾸지 않는다

### Layer 3. Book Specs

- 위치: `02_textbooks/books/`
- 책임: 책 메타데이터, 페이지 구성, 데이터 소스 선언

### Layer 4. Content/Data

- 위치:
  - `02_textbooks/data/` 정규화된 문제/지문/어휘 데이터
  - `02_textbooks/content_v2/` 블록 문서 기반 학습 콘텐츠
- 제한: 자유 페이지 HTML 금지

### Layer 5. Build Pipeline

- 위치: `04_scripts/build-textbook-v2.js`, `04_scripts/generate-textbook-pdf-v2.js`
- 책임: validate, render, paginate, export

## 디렉터리 규격

```text
02_textbooks/
  books/                    # 운영 중인 v2 매니페스트
  books_legacy/             # 레거시 원본 보관
  content_v2/               # v2 블록 문서
  data/                     # 정규화된 원천 데이터
  output_v2/
    html_src/
    html/
    pdf/
  schemas/
    book-manifest.v2.schema.json
    content-document.v2.schema.json
```

## 승인된 페이지 종류

아래 page kind 외의 새 타입은 금지한다.

1. `cover`
2. `toc`
3. `chapter-opener`
4. `content`
5. `problem-set`
6. `passage-set`
7. `vocabulary-set`
8. `answer-grid`
9. `explanations`
10. `legacy-page`

`legacy-page`는 과도기 호환용이다.
새 교재에서는 사용할 수 없다.

## 승인된 콘텐츠 블록 종류

`content_v2` 문서는 아래 블록만 사용한다.

1. `chapter-title`
2. `section-title`
3. `subsection-title`
4. `paragraph`
5. `markdown`
6. `list`
7. `table`
8. `concept-box`
9. `tip-box`
10. `example-block`
11. `html`

`html` 블록은 과도기적 escape hatch다.
새 문서는 가급적 사용하지 않는다.

## 공통 DOM 계약

새 렌더러는 아래 컴포넌트 클래스만 출력한다.

- 표지: `.cover-page`, `.cover-brand`, `.cover-main-title`, `.cover-edition`, `.cover-author`
- 목차: `.toc`, `.toc-title`, `.toc-list`, `.toc-item`
- 챕터/섹션: `.chapter-title`, `.section-title`, `.subsection-title`, `.section-number`
- 문제: `.problem`, `.problem-header`, `.problem-number`, `.problem-type-badge`, `.problem-stem`, `.problem-instruction`, `.problem-choices`
- 지문: `.passage`, `.passage-header`, `.passage-number`, `.passage-title`, `.passage-body`, `.passage-vocab`
- 어휘: `.word-entry`, `.word-header`, `.word-title`, `.word-pronunciation`, `.word-pos`, `.word-body`, `.word-meaning`, `.word-example`, `.word-related`
- 정답표: `.answer-grid`, `.answer-grid-table`, `.answer-grid-item`
- 해설: `.explanation`, `.explanation-header`, `.answer-badge`, `.explanation-body`
- 개념: `.concept-box`, `.concept-box-title`, `.concept-box-content`
- 팁: `.tip-box`, `.tip-box-title`, `.tip-subtitle`, `.tip-content`
- 예시: `.example-block`, `.example-block-title`, `.example-sentence`, `.example-analysis`
- 문법표: `.grammar-table`

## 페이지네이션 규칙

1. 페이지는 A4 고정 프레임을 가진다.
2. 페이지 분할은 브라우저 런타임에서 실제 렌더 높이 기준으로 수행한다.
3. `per-page = 3` 같은 고정 개수 페이지네이션은 금지한다.
4. overflow가 발생한 페이지는 `page--runtime-overflow`로 표시하고 빌드 실패로 본다.
5. 푸터 숨김, margin 축소, 폰트 강제 축소 같은 후처리 보정은 금지한다.

## PDF 생성 규칙

1. PDF는 Chromium 기반 렌더러로 생성한다.
2. `window.__TEXTBOOK_READY__ === true`를 기다린 뒤 PDF를 생성한다.
3. `window.__TEXTBOOK_PAGINATION_ERRORS__`가 비어 있지 않으면 PDF 생성 실패 처리한다.
4. `printBackground: true`와 `preferCSSPageSize: true`를 사용한다.

## 디자인 변경 규칙

디자인 변경은 아래 범위만 허용한다.

- template 교체
- template의 `tokens.css` 수정
- cover variant 변경
- 공통 컴포넌트 variant 선택

디자인 변경 시 금지되는 항목:

- book별 자유 CSS 추가
- assemble 단계 전역 `!important` 오버라이드
- content 파일 내부 인라인 스타일
- 컴포넌트 DOM 구조 변경

## 현재 교재의 테마 수용 전략

현재 교재별 개성은 "책별 CSS"가 아니라 "템플릿 + variant"로 수용한다.

| 현재 교재 | v2 템플릿 | 상태 |
|---|---|---|
| grammar-advanced | `ocean-blue` | 기존 템플릿 사용 |
| grammar-bridge-* | `ocean-blue` | 기존 템플릿 사용 |
| grammar-basic | `grammar-teal` | 신규 템플릿 추출 필요 |
| reading-basic | `royal-purple` | 기존 템플릿 사용 |
| reading-bridge | `earth-tone` | 기존 템플릿 사용 |
| reading-intermediate | `sky-academic` | 기존 템플릿 사용 |
| vocab-basic | `sky-academic` | 기존 템플릿 사용 |
| syntax-bridge | `mint-sky` | 기존 템플릿 사용 |
| syntax-basic | `mint-sky` 또는 별도 추출 | 판단 필요 |
| logic-basic | `logic-blue` | 기존 템플릿 사용 |

`grammar-basic`은 현재 틸 계열 디자인이 distinct하므로 별도 템플릿으로 분리하는 것이 맞다.

## 마이그레이션 규칙

### 허용

- 기존 `content/*.html`을 `legacy-page`로 임시 수용
- 기존 `data/*.json`을 `problem-set`, `passage-set`으로 즉시 수용
- 기존 `vocabulary/*.json`을 `vocabulary-set`으로 즉시 수용
- 기존 디자인을 템플릿 토큰으로 재추출

### 금지

- 신규 교재를 `legacy-page`로 시작
- 기존 `assemble.js`에 예외 CSS를 누적
- DOM mismatch를 fallback CSS로 덮기

## 빌드 수용 기준

빌드는 아래 조건을 모두 만족해야 성공이다.

1. 매니페스트 validation 통과
2. source file existence 통과
3. 렌더링 완료
4. 런타임 페이지네이션 완료
5. overflow page 0
6. PDF 생성 성공

## 운영 규칙

1. 신규 작업은 v2만 허용한다.
2. 레거시 `assemble.js`는 유지하되 동결한다.
3. 레거시 교재는 순차적으로 `books_legacy/`에서 `books/`로 이전한다.
4. v2 전환 전까지 `legacy-page`는 명시적으로만 허용한다.

## 이번 개편의 구현 범위

이번 변경에서 아래를 추가한다.

1. SSOT 문서
2. v2 스키마
3. v2 디렉터리 구조
4. v2 빌더
5. v2 PDF 생성기
6. `reading-bridge` 샘플 v2 매니페스트
7. 레거시→v2 매니페스트 마이그레이션 도구

이후 단계에서 아래를 진행한다.

1. `grammar-basic` 전용 템플릿 추출
2. `content_v2` 실제 마이그레이션
3. 전체 교재 `books/` 이전
