# 편입영어 교재 디자인 템플릿 시스템

편입영어 교재별로 사용하는 시각적 테마 템플릿 6종 + 스타터 킷.

## 레이어 구조

```
Layer 0: base/           ← 공통 기반 (reset, page-layout, print)
Layer 1: components/     ← 컴포넌트 구조 (boxes, tables, passages)
Layer 2: templates/      ← 시각적 개성 (이 디렉토리)
```

각 템플릿은 Layer 0, Layer 1 위에 색상/폰트/모양을 오버라이드합니다.

## 템플릿 목록

### 1. ocean-blue (문법 시리즈)
- **사용 교재**: 문법 Bridge Part 1/2, 문법 Advanced
- **컬러**: 딥블루(#345C85) + 베이지(#F2C994)
- **특징**: 샤프한 모서리, 보더 프레임 표지, Playfair Display
- **표지 스타일**: border-frame

### 2. royal-purple (독해 Basic)
- **사용 교재**: 독해 Basic
- **컬러**: 보라(#9B59B6) + 골드(#F1C40F)
- **특징**: 라운드 모서리(8px), 컬러 밑줄 헤더
- **표지 스타일**: overlay (솔리드 배경)

### 3. earth-tone (독해 Bridge)
- **사용 교재**: 독해 Bridge
- **컬러**: 차콜(#4B5358, Pantone 2025) + 민트그레이(#A2B2A4)
- **특징**: 샤프한 모서리, 점선 헤더, Merriweather 영문 폰트
- **표지 스타일**: minimal

### 4. sky-academic (독해 Intermediate + 보카)
- **사용 교재**: 독해 Intermediate, 보카 Basic
- **컬러**: 스카이블루(#0284C7) + 앰버(#FBBF24)
- **특징**: 라운드 모서리(6px), 짝수행 배경, 대형 타이틀
- **표지 스타일**: full-bleed

### 5. mint-sky (구문독해 Bridge)
- **사용 교재**: 구문독해 Bridge
- **컬러**: 민트스카이(#63B3ED) + 민트(#81E6D9)
- **특징**: 구문 분석 하이라이트, Noto Serif KR, 라운드 모서리(6px)
- **표지 스타일**: minimal

### 6. logic-blue (논리 Basic)
- **사용 교재**: 논리 Basic
- **컬러**: 블루600(#2563EB) + 에메랄드(#10B981)
- **특징**: step-section 전용 스타일, 라운드 모서리(8px)
- **표지 스타일**: border-frame

### 7. _template-starter (스타터 킷)
- **용도**: 새 템플릿 제작 시 복사해서 사용
- **특징**: 모든 토큰이 주석으로 설명됨, 4가지 표지 스타일 예시 포함

## 파일 구조

각 템플릿 디렉토리는 다음 4개 파일로 구성됩니다:

```
{template-name}/
├── _manifest.json      ← 메타 정보 (이름, 설명, 색상, 사용 교재 목록)
├── tokens.css          ← 색상/폰트/간격 토큰 오버라이드
├── cover.css           ← 표지 스타일 오버라이드
└── {template-name}.css ← 통합 import (tokens + cover)
```

## 사용 방법

### HTML에서 템플릿 적용

```html
<link rel="stylesheet" href="../../03_system/base/reset.css">
<link rel="stylesheet" href="../../03_system/base/page-layout.css">
<link rel="stylesheet" href="../../03_system/components/boxes.css">
<link rel="stylesheet" href="../../03_system/components/tables.css">
<!-- 여기에 템플릿 적용 -->
<link rel="stylesheet" href="../../03_system/templates/ocean-blue/ocean-blue.css">
```

또는 `vera-core.css`를 사용할 경우:

```html
<link rel="stylesheet" href="../../03_system/vera-core.css">
<!-- 여기에 템플릿만 추가 -->
<link rel="stylesheet" href="../../03_system/templates/ocean-blue/ocean-blue.css">
```

### 새 템플릿 만들기

1. `_template-starter/` 디렉토리를 복사하여 새 이름으로 생성
2. `_manifest.json` 수정 (id, name, description, palette 등)
3. `tokens.css` 수정 (색상, 폰트, 모서리 등)
4. `cover.css` 수정 (4가지 표지 스타일 중 선택하여 커스터마이징)
5. CSS 파일명을 템플릿 이름과 동일하게 변경

## PDF 안전 규칙 (필수)

템플릿 제작 시 반드시 준수해야 하는 Puppeteer PDF 렌더링 규칙:

- ✅ **사용 가능**: solid colors, borders, background-color, font-weight
- ❌ **사용 금지**: gradient, box-shadow, text-shadow, rgba (opacity), backdrop-filter

모든 스타일은 `!important`를 사용하여 강제 적용합니다.

## 표지 스타일 4종

### 1. border-frame
- 보더 프레임 박스 안에 제목
- 사용: ocean-blue, logic-blue
- 특징: 클래식하고 정돈된 느낌

### 2. overlay
- 배경 이미지 위에 솔리드 컬러 오버레이
- 사용: royal-purple
- 특징: 우아하고 임팩트 있는 느낌

### 3. minimal
- 단순한 보더 박스
- 사용: earth-tone, mint-sky
- 특징: 깔끔하고 학구적인 느낌

### 4. full-bleed
- 전체 배경 + 대형 타이틀
- 사용: sky-academic
- 특징: 현대적이고 시원한 느낌

## 토큰 시스템

모든 템플릿은 `base/page-layout.css`의 `:root` 변수를 오버라이드합니다.

주요 토큰 카테고리:
- **Accent Colors**: primary, light, dark, secondary
- **Semantic Colors**: concept, example, warning, error
- **Typography**: font families, sizes, line-height
- **Shape & Borders**: radius, border-style
- **Spacing**: page padding, margins

## 관련 문서

- `06_reference/guideline/guideline.md` - 디자인 총칙
- `06_reference/PDF_DESIGN_GUIDE.md` - PDF 변환 가이드
- `03_system/base/page-layout.css` - 기본 토큰 정의

---

**Vera's Document Studio**
Last Updated: 2026-02-16
