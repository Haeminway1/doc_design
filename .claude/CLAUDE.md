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
│   ├── components/       #   vera-core 컴포넌트 CSS
│   ├── templates/        #   vera-core 시각 테마
│   ├── vera-core.css     #   vera-core 통합 import (레거시 매니페스트용)
│   └── extravagantdocs/  #   XD 디자인 시스템 (주력)
│       ├── foundation/   #     토큰, 리셋, 타이포, 프린트
│       ├── page-system/  #     페이지 박스, 러닝헤더, 브레이크
│       ├── components/   #     17종 컴포넌트 (.xd- prefix)
│       ├── templates/    #     21종 시각 테마 (토큰 파이프라인 생성)
│       ├── adapters/     #     paged-native, browser-print
│       └── bridges/      #     레거시 마크업 호환 (임시)
├── 04_scripts/           # 빌드 스크립트
│   ├── build-textbook.js #   XD YAML → 최종 HTML 조립 (주력)
│   ├── assemble.js       #   레거시 YAML → HTML 조립
│   ├── generate-template.js  # 팔레트 → XD 템플릿 생성
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
                        XD 매니페스트 (*-xd.yaml):   build-textbook.js --book <id>
                        레거시 매니페스트:             assemble.js --book <id|all>
                                      ↓
                              output/html_src/*.html
                                      ↓
                          generate-textbook-pdf.js <id|all>
                                      ↓
                              output/pdf/*.pdf

팔레트 → 템플릿:  generate-template.js --palette <1-100>
```

## 핵심 규칙

1. **PDF 안전 CSS만 사용** — gradient, box-shadow, text-shadow, rgba, opacity, backdrop-filter 금지. 솔리드 컬러만. 상세: `.claude/docs/design-rules.md`
2. **5-Layer CSS 구조 준수 (XD)** — Foundation → Page System → Components → Templates → Adapters. 컴포넌트는 `.xd-` prefix, `extravagantdocs.css`에 import 등록.
3. **매니페스트 기반 조립** — 교재 구성은 YAML(`02_textbooks/books/`)로 선언. XD 매니페스트는 `styleSystem: extravagantdocs` + `styleTemplate` 필수.

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
