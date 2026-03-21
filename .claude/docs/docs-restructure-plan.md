# Documentation Restructure Plan

**Created:** 2026-03-21
**Status:** DRAFT
**Complexity:** MEDIUM
**Scope:** ~15 files to create/update, ~5 files to clean up

---

## 1. Problem Statement

프로젝트에 50개 .md 파일(~19,170줄)이 있지만 핵심 문서가 부재:
- 루트 README 없음 → 새 사람이 프로젝트를 이해할 진입점 부재
- 주력 빌드 스크립트(`build-textbook.js`) 문서화 0%
- workflow 문서가 레거시 파이프라인만 설명, XD 파이프라인 미반영
- 스크립트 30+개에 대한 인덱스/안내서 부재
- 깨진 참조 다수 (AGENTS.md, books/README.md)

## 2. Goal

신규 진입자가 30분 내에 프로젝트 구조를 파악하고, 교재 빌드를 실행할 수 있는 수준의 문서 체계 구축.

---

## 3. Phased Implementation

### Phase A: 핵심 진입점 (루트 문서)

**A.1. 루트 README.md 작성**
- 프로젝트 소개 (한줄: 편입영어 교재 제작 HTML/PDF 파이프라인)
- 폴더 구조 개요 (tree 형태)
- Quick Start: 교재 빌드 3단계 (build → pdf → 확인)
- 주요 명령어 표 (build-textbook, assemble, generate-template, generate-textbook-pdf)
- 디자인 시스템 요약 (vera-core vs extravagantdocs)
- 기여 가이드 (CSS 규칙, 매니페스트 작성법)
- 상세 문서 링크 테이블

**A.2. AGENTS.md 수정**
- `.Codex/` → `.claude/` 경로 수정
- CLAUDE.md와 불필요한 중복 제거

**A.3. 루트 정리**
- `new_report.md` (빈 파일) 삭제
- `올림포스_영어독해_전체_영어지문.md` → `02_textbooks/content/reading/olympos/`로 이동
- `2025-3월-고1-영어-문제데이터_*.md` → `02_textbooks/data/`로 이동

---

### Phase B: 빌드 파이프라인 문서화

**B.1. `04_scripts/README.md` 작성**
- 스크립트 목록 + 한줄 설명 테이블
- 빌드 파이프라인 다이어그램 (Source → Extract → Build → PDF)
- 카테고리별 분류: 빌드, 추출, 생성, 검증, 유틸리티
- 각 스크립트의 CLI 사용법 요약

**B.2. `workflow-textbook.md` 업데이트**
- XD 파이프라인 추가 (`build-textbook.js --book <id>`)
- 레거시 vs XD 분기 명확화
- `generate-template.js` 토큰 파이프라인 설명 추가
- 빌드 검증 명령어 추가

**B.3. `build-textbook.js` 파일 헤더 JSDoc 추가**
- 모듈 설명, 주요 함수 목록
- 핵심 함수 5개에 JSDoc: `resolveStyles`, `renderPage`, `sanitizeLegacyPalette`, `extractLegacyPagePayload`, `buildBook`
- CLI 사용법 (`--book`, `--renderer`, `--skip-pdf`)

---

### Phase C: 데이터 포맷 문서화

**C.1. 매니페스트 스키마 복원**
- `07_archive/` 의 `book-manifest.v2.schema.json` → `02_textbooks/schemas/`로 복사
- `books/README.md`의 깨진 경로 수정
- XD 매니페스트 필드 (`styleSystem`, `styleTemplate`, `styleBridge`) 문서 추가

**C.2. JSON 데이터 포맷 문서**
- `02_textbooks/data/README.md` 작성
- problems.json, passages.json, vocab.json 스키마 설명
- 예제 JSON snippet 포함

---

### Phase D: 디자인 시스템 보완

**D.1. `extravagantdocs/README.md` 확장**
- 현재 56줄 → ~150줄 목표
- 5-Layer 아키텍처 시각 다이어그램
- 컴포넌트 17개 목록 + 한줄 설명
- 템플릿 21개 미리보기 (이름 + 컬러 코드)
- 신규 컴포넌트 추가 절차
- 신규 템플릿 생성 절차 (`generate-template.js`)

**D.2. 06_reference/README.md (인덱스) 작성**
- 참고문서 목록 + 한줄 설명
- 용도별 분류: 디자인 가이드, PDF 렌더링, 폰트, 컴포넌트

---

### Phase E: 개발 이력 기록

**E.1. 루트 CHANGELOG.md 작성**
- 최근 개발 이력을 역순으로 기록
- 형식: `## [날짜] 제목` + bullet points
- 2026-03-21: extravagantdocs 오버홀 (Phase 0-5)
- 이전 커밋에서 역추적하여 주요 마일스톤 기록

**E.2. 개발 의사결정 기록 (ADR 보완)**
- ADR-0002: bridge-refresh.css 제거 결정
- ADR-0003: chroma.js 기반 토큰 파이프라인 선택 (vs Style Dictionary)
- ADR-0004: 5-Layer CSS 아키텍처 확정

---

## 4. Priority Order

```
Phase A (핵심 진입점)     — 즉시 실행 가능, 가장 큰 impact
  ↓
Phase B (빌드 파이프라인) — 실무에 직접적 도움
  ↓
Phase E (개발 이력)       — 기억이 신선할 때 기록
  ↓
Phase C (데이터 포맷)     — 데이터 작업 시 필요
  ↓
Phase D (디자인 시스템)   — 이미 ARCHITECTURE_SSOT.md가 있어 상대적 여유
```

## 5. Acceptance Criteria

| # | 기준 |
|---|------|
| 1 | 루트 README.md가 프로젝트 설명 + Quick Start + 명령어 표 포함 |
| 2 | `04_scripts/README.md`에 모든 스크립트 목록 + CLI 사용법 |
| 3 | `workflow-textbook.md`에 XD 파이프라인이 primary로 기재 |
| 4 | `build-textbook.js` 핵심 함수 5개에 JSDoc |
| 5 | 깨진 참조 0개 (AGENTS.md, books/README.md) |
| 6 | 루트의 불필요 .md 파일 정리 완료 |
| 7 | CHANGELOG.md에 최근 3개월 개발 이력 기록 |

---

## 6. Estimated Effort

| Phase | 작업량 | 파일 수 |
|-------|--------|---------|
| A: 핵심 진입점 | 낮음 | 3-4 |
| B: 빌드 파이프라인 | 중간 | 3 |
| C: 데이터 포맷 | 낮음 | 3 |
| D: 디자인 시스템 | 낮음 | 2 |
| E: 개발 이력 | 중간 | 4 |
| **Total** | | **~15 files** |
