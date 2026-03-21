# Components 전체 목록

## 생성 완료된 컴포넌트 (17개)

### Base Components (공통 구조)
1. `cover.css` — 표지 페이지
2. `toc.css` — 목차
3. `section-title.css` — 섹션 제목
4. `problem.css` — 문제 블록
5. `explanation.css` — 해설 블록
6. `answer-grid.css` — 정답표

### Grammar Components (문법 교재)
7. `warning-box.css` — 주의/경고 박스 ✅ 2026-02-16
8. `rule-box.css` — 문법 공식/규칙 박스 ✅ 2026-02-16
9. `comparison-table.css` — 비교표 ✅ 2026-02-16
10. `grammar-table.css` — 문법 도표 ✅ 2026-02-16

### Reading Components (독해 교재)
11. `passage.css` — 독해 지문 + 어휘 ✅ 2026-02-16

### Vocabulary Components (보카 교재)
12. `word-entry.css` — 단어 엔트리 ✅ 2026-02-16

### Syntax Components (구문독해 교재)
13. `example-block.css` — 구문 분석 예시 ✅ 2026-02-16

### Special Components (특수)
14. `part-opener.css` — 파트 오프닝
15. `day-title.css` — Day 제목
16. `step-section.css` — Step 섹션
17. `pattern-box.css` — 패턴 박스

### Utility
18. `index.css` — 통합 import ✅ 2026-02-16
19. `README.md` — 사용 가이드 ✅ 2026-02-16

## 누락된 컴포넌트 (vera-core.css에서 참조하나 파일 없음)

### Tier 2 (과목별 핵심)
- `concept-box.css` — 개념 박스
- `tip-box.css` — 팁 박스

### Tier 3 (특수)
- 모두 존재함

## 다음 작업

1. ✅ 과목별 컴포넌트 7종 생성 완료
2. ⬜ 누락된 base 컴포넌트 생성 (`concept-box.css`, `tip-box.css`)
3. ⬜ 기존 컴포넌트 검증 (`cover.css`, `toc.css` 등)
4. ⬜ HTML 샘플 페이지 생성 (컴포넌트 시각적 테스트)
5. ⬜ Puppeteer PDF 렌더링 테스트

## 디자인 시스템 구조

```
03_system/
├── base/
│   ├── reset.css
│   ├── page-layout.css (디자인 토큰 정의)
│   ├── print.css
│   └── utilities.css
├── components/
│   ├── index.css (통합 import)
│   ├── README.md (사용 가이드)
│   ├── [17개 컴포넌트 CSS]
│   └── COMPONENTS_INDEX.md (이 파일)
├── templates/
│   ├── ocean-blue/
│   ├── royal-purple/
│   └── ... (교재별 시각 테마)
└── vera-core.css (base + components 통합)
```
