# 교재 빌드 워크플로우

## 빌드 명령어

```bash
# 단일 교재 HTML 빌드
node 04_scripts/assemble.js --book grammar-bridge-ch02

# 전체 교재 HTML 빌드
node 04_scripts/assemble.js --book all

# 단일 PDF 생성
node 04_scripts/generate-textbook-pdf.js grammar-bridge-ch02

# 전체 PDF 생성
node 04_scripts/generate-textbook-pdf.js all
```

## 빌드 파이프라인

```
1. extract-*.js    원본 HTML → JSON(data) + HTML(content) + YAML(books)
2. assemble.js     YAML 매니페스트 → output/html_src/*.html
3. generate-textbook-pdf.js  html_src → Puppeteer → output/pdf/*.pdf
                                       + output/html/*.html (정적 스냅샷)
```

## 매니페스트 구조 (YAML)

```yaml
version: 2
book:
  id: grammar-bridge-ch02
  title: 문법 Bridge - 가정법
  shortTitle: 문법 Bridge
  author: Vera's Flavor
  brand: Vera's Flavor
  subject: grammar          # grammar | reading | syntax | logic | vocab
  level: bridge             # basic | bridge | intermediate | advanced
  theme: sky-academic       # 03_system/templates/ 하위 테마명
pages:
  - kind: cover
  - kind: legacy-page       # HTML fragment 삽입
    source: { path: grammar/bridge/ch02-content-01.html }
  - kind: problem-set       # JSON → 문제 렌더링
    layout: compact
    source: { path: grammar/bridge/ch02-problems.json }
  - kind: answer-grid       # 정답표
    source: { path: grammar/bridge/ch02-problems.json }
  - kind: explanations      # 해설
    source: { path: grammar/bridge/ch02-problems.json }
```

**페이지 kind 종류**: cover, toc, legacy-page, content, problem-set, answer-grid, explanations, passages, vocabulary

## 교재 목록 (22개 YAML)

| 과목 | 레벨 | ID | 테마 |
|---|---|---|---|
| 문법 | Bridge | grammar-bridge-ch01 ~ ch11, vol1, vol2 | sky-academic |
| 문법 | Basic | grammar-basic | - |
| 문법 | Advanced | grammar-advanced | - |
| 독해 | Basic/Bridge/Intermediate | reading-basic, reading-bridge, reading-intermediate | - |
| 구문독해 | Basic/Bridge | syntax-basic, syntax-bridge | - |
| 논리 | Basic | logic-basic | - |
| 어휘 | Basic | vocab-basic | - |

## 추출 스크립트 (04_scripts/)

| 스크립트 | 대상 | 산출물 |
|---|---|---|
| extract-grammar-bridge.js | ch02-09 (8개) | 400 problems |
| extract-grammar-bridge-part1.js | ch01 | 500 problems, 130 content pages |
| extract-grammar-bridge-part2.js | ch10-11 | 50 problems, 6 content pages |
| extract-grammar-advanced.js | Advanced | 100 problems, 22 chapters |
| extract-reading.js [basic/bridge/intermediate] | 독해 3종 | 1561 passages |
| extract-syntax-bridge.js | 구문독해 Bridge | 10 units, 644 problems |
| extract-syntax-basic.js | 구문독해 Basic | 19 units, 590 problems |
| extract-logic-basic.js | 논리 Basic | 118 problems |
| extract-vocab-basic.js | 보카 Basic | 70 days, ~3500 words |

## PDF 생성 세부

- Puppeteer `headless: 'new'`, `preferCSSPageSize: true`, 마진 0 (CSS가 관리)
- `window.__TEXTBOOK_READY__ === true` 대기 후 PDF 캡처
- `window.__TEXTBOOK_PAGINATION_ERRORS__` 배열 확인 → 에러 시 중단
- syntax-basic은 별도 `preview-syntax-basic.js` 경유

## 프린트 묶음 (유틸리티)

```bash
# 01_print-bundle/input/ 에 이미지 넣고 실행
node 04_scripts/images-to-pdf.js
```
- 트리거: "프린트 묶어줘", "PDF로 만들어"
- pdf-lib + sharp 사용 (Puppeteer 아님)
- 출력: `01_print-bundle/output/프린트_YYYYMMDDHHMMSS.pdf`
