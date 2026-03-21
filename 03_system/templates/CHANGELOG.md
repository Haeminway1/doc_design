# 템플릿 시스템 변경 이력

## [1.0.0] - 2026-02-16

### 추가 (Added)
- ✅ **6개 템플릿 세트 생성 완료**
  - `ocean-blue`: 문법 시리즈 (Bridge + Advanced)
  - `royal-purple`: 독해 Basic
  - `earth-tone`: 독해 Bridge
  - `sky-academic`: 독해 Intermediate + 보카
  - `mint-sky`: 구문독해 Bridge
  - `logic-blue`: 논리 Basic

- ✅ **스타터 킷 생성**
  - `_template-starter`: 새 템플릿 제작용
  - 모든 토큰 주석 설명 포함
  - 4가지 표지 스타일 예시 포함

- ✅ **템플릿 파일 구조**
  - `_manifest.json`: 메타 정보
  - `tokens.css`: 디자인 토큰 오버라이드
  - `cover.css`: 표지 스타일
  - `{template-name}.css`: 통합 import

- ✅ **문서화**
  - `README.md`: 템플릿 시스템 개요
  - `USAGE.md`: 사용 가이드
  - `TEMPLATE_INDEX.json`: 교재-템플릿 매핑
  - `CHANGELOG.md`: 변경 이력

### 특징 (Features)
- PDF 안전 규칙 준수 (gradient, shadow 제거, 솔리드 색상만 사용)
- 모든 스타일에 `!important` 적용
- 4가지 표지 스타일 지원 (border-frame, overlay, minimal, full-bleed)
- 토큰 기반 커스터마이징 시스템
- 교재별 특수 컴포넌트 지원 (구문 분석 하이라이트, 논리 step-section 등)

### 기술 상세 (Technical)
- Layer 2 (Templates) 레이어 완성
- base/page-layout.css의 :root 변수 오버라이드 방식
- Puppeteer PDF 렌더링 최적화

### 다음 단계 (Next Steps)
- [ ] 실제 교재 HTML 파일에 템플릿 적용
- [ ] 컴포넌트 레이어 (Layer 1) 완성
- [ ] PDF 빌드 스크립트 통합
- [ ] 템플릿 미리보기 생성 도구

---

## 템플릿별 상세

### ocean-blue
- 메인: #345C85 (딥블루)
- 보조: #F2C94 (베이지)
- 폰트: Playfair Display (accent)
- 특징: 샤프한 모서리, 보더 프레임 표지
- 사용: 문법 Bridge/Advanced, 2-2 ~ 2-9

### royal-purple
- 메인: #9B59B6 (보라)
- 보조: #F1C40F (골드)
- 특징: 라운드 모서리 8px, 컬러 밑줄
- 사용: 독해 Basic

### earth-tone
- 메인: #4B5358 (차콜, Pantone 2025)
- 보조: #A2B2A4 (민트그레이)
- 폰트: Merriweather (영문)
- 특징: 샤프한 모서리, 점선 헤더
- 사용: 독해 Bridge

### sky-academic
- 메인: #0284C7 (스카이600)
- 보조: #FBBF24 (앰버)
- 특징: 라운드 모서리 6px, 짝수행 배경, Full-bleed 표지
- 사용: 독해 Intermediate, 보카 Basic

### mint-sky
- 메인: #63B3ED (민트스카이)
- 보조: #81E6D9 (민트)
- 폰트: Noto Serif KR (accent)
- 특징: 구문 분석 하이라이트 4색, 라운드 모서리 6px
- 사용: 구문독해 Bridge

### logic-blue
- 메인: #2563EB (블루600)
- 보조: #10B981 (에메랄드)
- 특징: step-section 전용 스타일, 논리 라벨, 라운드 모서리 8px
- 사용: 논리 Basic

---

## 버전 관리

버전 형식: MAJOR.MINOR.PATCH

- MAJOR: 레이어 구조 변경, 호환성 깨짐
- MINOR: 새 템플릿 추가, 기능 추가
- PATCH: 버그 수정, 색상 미세 조정

---

**Maintained by**: Vera's Document Studio
**Last Updated**: 2026-02-16
