# Changelog

Vera's Document Studio 개발 이력. 역순 (최신 → 과거).

---

## 2026-03-21 — Extravagantdocs 디자인 시스템 오버홀

대규모 리팩토링: vera-core/extravagantdocs 이중 시스템 문제를 해결하고, extravagantdocs를 주력 디자인 시스템으로 확립.

### Phase 0: Safety Net
- 3개 대표 교재 (grammar-bridge-ch02-xd, reading-basic-xd, logic-basic-xd) 기준 PDF 캡처
- CSS 메트릭 스냅샷 (파일별 !important 수, 하드코딩 색상 수)
- 인라인 스타일 감사: 1367개 HTML 중 97개 파일에 555개 인라인 색상 발견
- `sanitizeLegacyPalette` regex 매핑 분석: 30개 패턴 중 11개만 실제 활성

### Phase 1: 컴포넌트 추출
- `bridges/grammar-bridge.css` 637→65줄 (컴포넌트 CSS 분리)
- `templates/exam-paper.css` 430→396줄
- `templates/grammar-bridge.css` 382→348줄
- `adapters/paged-native.css` 625→522줄
- 17개 독립 컴포넌트 CSS 파일 생성 (page-shell, cover, section, toc, paragraph, problem, explanation, answer-grid, example-list, callout, tip-box, qa-card, formula-card, table, grammar-table, question-block, word-entry)
- `.xd-gb-faq-card` → `.xd-qa-card`, `.xd-gb-formula-card` → `.xd-formula-card` 프로모션
- `.word-entry` → `.xd-word-entry` 네이밍 통일

### Phase 2: bridge-refresh.css 제거
- `bridge-refresh.css` (843줄, 386개 !important) 삭제
- `sanitizeLegacyPalette`: 색상 리매핑 regex 제거, !important 스트리핑 제거 → PDF-safety 변환만 유지
- 중복 gradient 핸들러 통합 (silent data loss 잠재 버그 수정)
- `navy-gold` 대체 템플릿 생성 (vera-core 경로)
- `utilities.css` 하드코딩 색상 3개 → 토큰 폴백 변환
- `border-radius` regex 2개 → 1개로 통합 (100px+ 처리 추가)
- `extractLegacyPagePayload` 이중 sanitize 호출 제거

### Phase 3: 토큰 파이프라인
- `chroma-js` 설치 (LAB 색공간 shade 생성)
- `palette-parser.js`: 100개 팔레트 마크다운 파서 (기존)
- `shade-generator.js`: 9단계 shade scale + 17개 시맨틱 토큰 매핑 (TDD: 18 tests)
- `generate-template.js` CLI: `--palette <1-100>` 또는 `--primary/--secondary/--accent/--name`
- vera-core 8개 템플릿 → extravagantdocs 형식 변환
- 10개 쇼케이스 템플릿 배치 생성 (총 21개 템플릿)

### Phase 4: 빌드 파이프라인 검증
- `resolveStyles()` 5-Layer 순서 확인 (foundation→page-system→components→template→adapter→bridge)
- body class injection 확인 (style-system-*, style-template-*, renderer-paged-native)
- 매니페스트 스키마 검증 확인 (styleTemplate 필수)

### Phase 5: 문서 통합
- extravagantdocs docs 14개 파일 삭제/병합
- ARCHITECTURE_SSOT.md 업데이트 (17개 컴포넌트, 어댑터 이름 수정, Phase 1 참조 제거)
- CLAUDE.md 업데이트 (XD 폴더 구조, 이중 파이프라인, 5-Layer 규칙)
- docs-to-code 비율: 0.85:1 → 0.29:1

### 의사결정 기록
- **bridge-refresh.css 제거**: 843줄이 모든 vera-core 템플릿을 override하여 토큰 시스템 무력화. navy-gold 템플릿으로 대체.
- **Style Dictionary 미사용**: chroma-js 직접 사용이 더 단순. 토큰은 20개 미만이라 빌드 도구 불필요.
- **sanitizeLegacyPalette 보존**: inline style audit 결과 logic/basic 콘텐츠에 실제 palette target 색상이 존재. 함수는 PDF-safety 목적으로 유지.
- **컴포넌트 17개 (목표 20+ 미달)**: day-title, step-section, section-title은 XD 콘텐츠에서 아직 사용되지 않아 보류.

---

## 2026-03-20 — Vera Textbook Design 스킬 + 팔레트 라이브러리

- `vera-textbook-design.md` 스킬 작성 (467줄, 교재 디자인 전체 워크플로우)
- `vera-palette-library.md`: 100개 명명된 팔레트 (primary/secondary/accent hex)
- `autoresearch` 스킬로 디자인 품질 A/B 테스트 (baseline + 2개 실험)

---

## 2026-03-18 — 위례고 고1 내신대비 교재

- 능률(오) 영어 Lesson 01-02 교재 + 문제은행 + 워크북
- `generate-workbook.js` 워크북 빌더 스크립트
- 올림포스 교재 추가 컨텐츠

---

## 2026-03-17 — 올림포스 교재

- 올림포스 영어독해 Unit 1-5 교재 빌드
- 해설 + 문제 + 워크북 페이지 구성

---

## 2026-03-16 — 교재 시스템 대규모 확장

- 올림포스 영어독해 Unit 1 분석서 교재 생성
- 2025 3월 고1 영어 모의고사 데이터 추출
- 교재 개편: 다양한 시리즈 지원 체계 구축
- js-yaml, puppeteer-core 의존성 추가
- PDF 출력물 git 트래킹 추가

---

## 2026-03-09 — 디자인 시스템 통일

- syntax-basic verajin 교재 빌드 스크립트
- 전체 유닛 디자인 통일 (page-footer width 정렬 오류 수정)
- legacy palette 정리 + output 트래킹 해제
- 프로젝트 구조 정리

---

## 2026-03-01 — 프로젝트 초기 구축

- 교재 output 트래킹 시작
- 오수민 피드백지 해설 수정
- 기본 프로젝트 구조 확립

---

## 2026-02-13 — Initial Commit

- 프로젝트 초기화
- 기본 빌드 파이프라인 설정
