# Vera's Document Studio

편입영어 교재를 제작하는 HTML/PDF 빌드 파이프라인.

## 폴더 구조

```
doc_design/
├── 02_textbooks/         # 교재 데이터 + 빌드 산출물
│   ├── source/           #   원본 HTML 17개
│   ├── data/             #   정형 데이터 JSON (problems, passages, vocab)
│   ├── content/          #   자유 콘텐츠 HTML fragments
│   ├── books/            #   매니페스트 YAML (22개)
│   └── output/           #   html_src/ → html/ → pdf/
├── 03_system/            # 디자인 시스템
│   ├── base/             #   reset, page-layout, print, utilities
│   ├── components/       #   20종 컴포넌트 CSS
│   ├── templates/        #   8종 시각 테마 (ocean-blue, sky-academic 등)
│   └── vera-core.css     #   통합 import
├── 04_scripts/           # 빌드 스크립트
│   ├── assemble.js       #   YAML → 최종 HTML 조립
│   ├── generate-textbook-pdf.js  # HTML → PDF (Puppeteer)
│   └── extract-*.js      #   원본 HTML → JSON/fragments 추출 (11종)
├── 05_assets/            # 폰트, 배경이미지
├── 06_reference/         # 가이드라인 (읽기 전용)
└── 01_print-bundle/      # 이미지 → A4 PDF (유틸리티)
```

## 빌드 파이프라인

```
Source HTML → extract-*.js → JSON + HTML fragments + YAML manifest
                                      ↓
                                assemble.js --book <id|all>
                                      ↓
                              output/html_src/*.html
                                      ↓
                          generate-textbook-pdf.js <id|all>
                                      ↓
                              output/pdf/*.pdf
```

## 핵심 규칙

1. **PDF 안전 CSS만 사용** — gradient, box-shadow, text-shadow, rgba, opacity, backdrop-filter 금지. 솔리드 컬러 + `!important`. 상세: `.claude/docs/design-rules.md`
2. **3-Layer CSS 구조 준수** — Base(공통) → Components(재사용) → Templates(시각 개성). 컴포넌트 추가 시 `vera-core.css`에 import 등록.
3. **매니페스트 기반 조립** — 교재 구성은 YAML(`02_textbooks/books/`)로 선언. 페이지 종류: cover, legacy-page, problem-set, answer-grid, explanations, toc, content, passages, vocabulary.

## 상세 문서

| 문서 | 내용 |
|---|---|
| `.claude/docs/workflow-textbook.md` | 빌드 명령어, 매니페스트 구조, 추출 스크립트 목록 |
| `.claude/docs/design-rules.md` | CSS 규칙, 색상 팔레트, 강조 규칙, paged.js 가이드 |
| `06_reference/PDF_DESIGN_GUIDE.md` | Puppeteer PDF 렌더링 주의사항 |
| `06_reference/guideline/guideline.md` | A4 인쇄용 HTML 디자인 총칙 |
| `06_reference/library/components.md` | 컴포넌트 라이브러리 |

## 기술 스택

- Node.js + Puppeteer (HTML → PDF)
- Node.js + sharp + pdf-lib (이미지 → PDF)
- paged.js (CSS Paged Media polyfill — 교재 pagination)
- 폰트: Noto Sans KR, Inter, Playfair Display
