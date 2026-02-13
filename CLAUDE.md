# 학생 문제풀이 보충학습 자료 생성 프로젝트

## 프로젝트 개요
학생이 틀리거나 별표 친 문제를 분석하여 추가 해설 및 변형 복습 문제를 생성하는 과외 보조 도구.

## 워크플로우 (반드시 순서대로 진행)

### Step 1: 문제 식별
- 학생이 보낸 사진(jpeg)에서 **틀린 문제**와 **별표 친 문제**를 식별
- 식별 결과를 표로 정리하여 **사용자 확인을 받고** 다음 단계로 진행
- 표 형식: `| # | 위치 | 문제 내용 | 핵심 포인트 |`

### Step 2: 해설 작성
- 각 문제에 대한 상세 해설 작성
- 유관 문법/개념 추가 설명 (이해하기 쉽게)
- 필요시 비교표, 판별법, 암기 팁 포함

### Step 3: 변형문제 생성
- 각 문제당 **기본 5개** 변형문제 생성
- 난이도: 원본과 동일 ~ 약간 상위
- 각 변형문제에 정답 및 간단 해설 포함
- **마크다운(.md)으로 저장** → `베라진/{학생이름}/학습분석_결과.md`
- 사용자 확인 후 승인하면 Step 4로

### Step 4: HTML + PDF 출력
- 마크다운 내용을 기반으로 HTML 생성 → `베라진/{학생이름}/학습분석_결과.html`
- Puppeteer로 PDF 변환: `node 베라진/scripts/generate-study-pdf.js {학생이름}`
- 출력: `베라진/{학생이름}/학습분석_결과.pdf`

### "알아서 진행해" 모드
- 사용자가 "알아서 진행해"라는 워딩을 사용할 경우, **중간 승인 없이 Step 1 ~ Step 4 최종까지 직행**

## 폴더 구조

```
베라진/
├── scripts/
│   └── generate-study-pdf.js     # 공용 PDF 생성 스크립트 (node generate-study-pdf.js <학생이름>)
├── 김종호/
│   ├── KakaoTalk_Photo_*.jpeg    # 문제 사진
│   ├── 학습분석_결과.md           # 해설 + 변형문제
│   ├── 학습분석_결과.html         # PDF용 HTML
│   └── 학습분석_결과.pdf          # 최종 출력물
├── 조근영/
│   ├── KakaoTalk_Photo_*.jpeg    # 문제 사진 (13장)
│   ├── 학습분석_결과.md           # (생성 예정)
│   ├── 학습분석_결과.html         # (생성 예정)
│   └── 학습분석_결과.pdf          # (생성 예정)
└── {새학생}/                      # 학생 추가 시 동일 구조
```

## 디자인 가이드라인

### 참조 파일
- **디자인 총칙**: `reference/guideline/guideline.md` (A4 인쇄용 HTML 디자인 가이드 v2.1)
- **PDF 변환 가이드**: `docs/PDF_DESIGN_GUIDE.md` (Puppeteer 관련 주의사항)
- **컴포넌트 라이브러리**: `reference/library/components.md`
- **하이라이트 가이드**: `reference/library/highlight_guideline.md`
- **기본 HTML 구조**: `reference/guideline/basic_structure.html`

### PDF 생성 핵심 규칙 (Puppeteer)
- 솔리드 컬러 사용 (gradient, box-shadow, text-shadow, rgba, opacity 금지)
- `!important`로 렌더링 강제
- `page-break-inside: avoid`로 테이블/박스 분리 방지
- A4 규격: 210mm x 297mm
- 교재/컴팩트 디자인 적용 (본문 9-10pt, 행간 1.3-1.4, 여백 12-15mm)

### 강조 규칙 (엄격히 준수)
- 페이지당 강조 10개 이하
- 단락당 강조 2개 이하
- 문장당 강조 1개 이하
- 강조 없는 단락 60% 이상
- 3종만 사용: `.highlight-key`, `.highlight-bg`, `.highlight-eng`

### 색상 팔레트
```
--accent-blue: #1E3A8A (제목, 핵심 용어)
--accent-orange: #F97316 (강조)
--concept-bg: #F0F9FF / --concept-border: #0EA5E9 (개념 박스)
--example-bg: #F7FEE7 / --example-border: #22C55E (예제 박스)
--warning-bg: #FEF3C7 / --warning-border: #F59E0B (주의 박스)
```

## 학생 목록

### 김종호 (완료)
- 폴더: `베라진/김종호/`
- 내용: 동명사/현재분사, 사역동사, 감각동사, 1형식/2형식, 분사구문, 전치사 to + -ing
- 상태: 완료 (md, html, pdf 생성됨)

### 조근영 (진행 중)
- 폴더: `베라진/조근영/`
- 사진: 13장 (KakaoTalk_Photo_2026-02-13-12-41-*.jpeg)
- 내용: Chapter 2 동사의 시제 (현재/과거/미래/완료 시제)
- 상태: Step 1 진행 중

## 프린트 묶음 (이미지 → A4 PDF 변환)

### 사용법
1. `프린트묶음/INPUT/` 폴더에 이미지 파일(png, jpg, jpeg, webp)을 넣는다
2. "프린트 묶어줘" 또는 "PDF로 만들어줘" 라고 말한다
3. `프린트묶음/OUTPUT/` 에 PDF가 생성된다

### 트리거 키워드
사용자가 아래 워딩을 사용하면 프린트묶음 기능을 실행:
- "프린트 묶어줘", "프린트 해줘", "PDF로 만들어", "묶어줘", "프린트묶음 해줘"

### 실행 방법
```bash
node 프린트묶음/scripts/images-to-pdf.js
```

### 동작 규칙
- INPUT 폴더의 이미지를 **파일명 순서대로** A4 PDF에 배치
- 각 이미지는 A4에 비율 유지하며 중앙 배치
- 출력 파일명: `프린트_YYYYMMDDHHMMSS.pdf` (타임스탬프)
- 지원 포맷: PNG, JPG, JPEG, WEBP

### 폴더 구조
```
프린트묶음/
├── INPUT/          # 여기에 이미지를 넣는다
├── OUTPUT/         # 여기에 PDF가 생성된다
└── scripts/
    └── images-to-pdf.js
```

---

## 기술 스택
- Node.js + Puppeteer (PDF 생성)
- Node.js + sharp + pdf-lib (이미지 → PDF 변환)
- HTML/CSS (A4 인쇄용 정적 페이지)
- 폰트: Pretendard, Noto Sans KR
