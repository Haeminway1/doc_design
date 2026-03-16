# 크몽 서비스 1 등록용 이미지 제작 스펙

> 서비스: "영어 교재 내지/표지 편집 디자인 학원 교재 전문 제작"
> gig ID: 751510

---

## A. 메인 이미지 (최소 1장, 최대 4장)

| 항목 | 스펙 |
|---|---|
| 사이즈 | **652×488px** (정확히) |
| 형식 | PNG 또는 JPG |
| 용도 | 크몽 검색 결과 + 서비스 상단 대표 이미지 |

### 메인 1 — 대표 썸네일 (필수)

**콘셉트:** 교재 디자인 전문 서비스임을 한눈에 보여주는 대표 이미지

**로컬 Claude Code 작업 지시:**
```
포트폴리오 이미지들을 활용해서 652×488px 메인 썸네일을 만들어줘.

레이아웃:
- 배경: 진한 네이비(#1B2838) 또는 깔끔한 화이트
- 왼쪽 60%: 포트폴리오 이미지 3장을 살짝 겹쳐서 부채꼴 배치 (bridge-vol1_p01.png, verajin_p01.png, bridge-vol2_p01.png)
- 오른쪽 40%: 텍스트 영역

텍스트:
- 메인: "영어 교재 디자인" (볼드, 화이트 또는 네이비, 20pt급)
- 서브: "내지 · 표지 · 편집" (14pt급)
- 가격: "내지 1p 5,000원~" (작은 뱃지 스타일)
- 하단 태그: "문항 구조를 아는 전문 제작자"

포트폴리오 이미지 경로:
- /path/to/doc_design/kmong/portfolio/bridge-vol1_p01.png (2479×3508)
- /path/to/doc_design/kmong/portfolio/verajin_p01.png (2483×3508)
- /path/to/doc_design/kmong/portfolio/bridge-vol2_p01.png (2479×3508)

Node.js + sharp 또는 Python + Pillow로 생성.
출력: kmong/images/main-01.png (652×488)
```

### 메인 2 — 포트폴리오 그리드 (권장)

**로컬 Claude Code 작업 지시:**
```
포트폴리오 이미지 6장을 2×3 그리드로 배치한 652×488px 이미지를 만들어줘.

사용 이미지:
- bridge-vol1_p02.png, bridge-vol1_p03.png
- bridge-vol2_p02.png, bridge-vol2_p03.png
- verajin_p02.png, verajin_p03.png

각 셀: 약 326×163px (여백 포함)
셀 간 간격: 4px, 배경: #F5F5F5
각 이미지는 중앙 crop하여 셀에 맞춤
하단에 반투명 오버레이 바: "실제 작업물 포트폴리오" 텍스트

출력: kmong/images/main-02.png (652×488)
```

---

## B. 상세 이미지 (최소 3장, 최대 9장)

| 항목 | 스펙 |
|---|---|
| 사이즈 | 가로 **652~2000px**, 세로 **3000px 이하** |
| 형식 | PNG, JPG, GIF |
| 용도 | 서비스 페이지 스크롤 시 보이는 상세 설명 |
| 권장 | 가로 **860px** 고정, 세로 자유 (크몽 상세페이지 최적) |

### 상세 1 — 서비스 소개 (필수)

**로컬 Claude Code 작업 지시:**
```
860px 너비의 서비스 소개 상세 이미지를 만들어줘.

구성 (위→아래):
1. 상단 헤더 (높이 120px)
   - 배경: #1B2838 (네이비)
   - 텍스트: "영어를 이해하는 교재 제작자" (화이트, 볼드 24pt)
   - 서브: "문항 구조를 아는 사람이 만드는 학원형 교재 디자인" (14pt)

2. 타겟 고객 섹션 (높이 200px)
   - 배경: 화이트
   - 타이틀: "이런 분께 맞습니다" (볼드)
   - 4개 항목 (아이콘 + 텍스트 가로 배치):
     ✅ 학원 자체교재를 처음 만드시는 원장님
     ✅ 기존 교재 디자인이 마음에 안 드시는 분
     ✅ HWP/Word 원고를 인쇄용으로 변환하고 싶은 분
     ✅ 표지만 따로 의뢰하고 싶은 분

3. 차별화 포인트 (높이 160px)
   - 배경: #F8F9FA
   - 3열 구성:
     [영어 전공자] | [인쇄 최적화 PDF] | [빠른 납기 3일~]

폰트: Noto Sans KR (일반), Inter (영어)
출력: kmong/images/detail-01.png (860×약480px)
```

### 상세 2 — 포트폴리오 샘플 (필수)

**로컬 Claude Code 작업 지시:**
```
860px 너비의 포트폴리오 상세 이미지를 만들어줘.

구성:
1. 섹션 헤더: "실제 작업물" (네이비 배경, 화이트 텍스트)

2. 교재별 섹션 3개 (각 300px 높이):
   a) "Bridge Vol.1" — bridge-vol1_p01.png(표지) + p02, p03 내지 미리보기
   b) "Bridge Vol.2" — bridge-vol2_p01.png(표지) + p02, p03 내지 미리보기
   c) "Verajin" — verajin_p01.png(표지) + p02, p03 내지 미리보기

   각 교재: 왼쪽에 표지(큰 사이즈), 오른쪽에 내지 2장(작은 사이즈, 살짝 겹침)
   하단에 교재명 + 간략 설명

포트폴리오 경로: kmong/portfolio/ 아래 파일들
출력: kmong/images/detail-02.png (860×약1000px)
```

### 상세 3 — 패키지 가격 비교표 (필수)

**로컬 Claude Code 작업 지시:**
```
860px 너비의 패키지 비교 상세 이미지를 만들어줘.

구성:
1. 헤더: "패키지 안내" (네이비 배경)

2. 3열 비교 카드 (가로 균등 분할):

   [STANDARD]          [DELUXE]            [PREMIUM]
   5,000원             30,000원            150,000원
   ─────────          ─────────           ─────────
   내지 1p 편집        표지 1종 디자인      풀패키지 (20p)
   문항/선지 정리      앞뒤표지 디자인      표지+내지+목차+해설
   A4 인쇄 PDF        시안 2종 제안        스타일가이드 포함
   수정 2회           수정 3회             수정 3회
   납기 3일           납기 5일             납기 7일

   STANDARD: 밝은 회색 배경
   DELUXE: 하늘색 배경, "인기" 뱃지
   PREMIUM: 네이비 배경 + 골드 테두리, "BEST" 뱃지

3. 하단 안내: "추가 p당 4,000원 / 24p 이상 단가 조율 가능"

출력: kmong/images/detail-03.png (860×약500px)
```

### 상세 4 — 작업 프로세스 (권장)

**로컬 Claude Code 작업 지시:**
```
860px 너비의 작업 프로세스 이미지를 만들어줘.

구성:
1. 헤더: "진행 순서"

2. 5단계 가로 플로우:
   [상담] → [원고 수령] → [시안 제작] → [수정] → [PDF 납품]

   각 단계: 원형 아이콘 + 단계명 + 설명 1줄
   ① 상담: 분량/일정/스타일 협의
   ② 원고 수령: HWP/Word/PDF 형태
   ③ 시안 제작: 1~2페이지 샘플
   ④ 수정: 패키지별 수정 횟수
   ⑤ 납품: 인쇄용 PDF + 웹용 파일

   화살표로 연결, 파스텔 컬러 아이콘

출력: kmong/images/detail-04.png (860×약250px)
```

### 상세 5 — FAQ (권장)

**로컬 Claude Code 작업 지시:**
```
860px 너비의 FAQ 이미지를 만들어줘.

구성:
1. 헤더: "자주 묻는 질문"

2. Q&A 4개 (아코디언 스타일 디자인):
   Q. 표지만 따로 의뢰할 수 있나요?
   A. 네, DELUXE 패키지로 표지만 주문 가능합니다.

   Q. 내지 1p만도 가능한가요?
   A. 가능합니다. STANDARD 패키지(5,000원)로 신청해주세요.

   Q. 급한 일정도 가능한가요?
   A. 가능 여부를 먼저 확인 후 안내드립니다. 긴급 작업은 추가 비용이 발생할 수 있습니다.

   Q. 24p 이상 대량 작업도 가능한가요?
   A. 가능합니다. 분량이 많으면 p당 단가를 조율해드립니다.

배경: 밝은 회색, Q는 볼드 네이비, A는 일반 텍스트
출력: kmong/images/detail-05.png (860×약400px)
```

---

## C. Gemini + nanobanana2 썸네일 생성 프롬프트

메인 썸네일을 AI 이미지 생성으로 만들 경우 아래 프롬프트를 사용하세요.

### 프롬프트 1 — 메인 썸네일 배경

```
A flat-lay photograph of premium English textbooks and workbooks spread on a clean white marble desk. Include: an open A4 workbook showing neatly formatted English grammar questions with multiple choice answers, a closed textbook with a sleek navy cover, colored sticky tabs, a mechanical pencil, and a small succulent plant. Top-down camera angle. Soft natural window light from the left. Shallow depth of field. Professional product photography style. Korean academy aesthetic. No visible text on covers — leave blank space on the right side for text overlay. Aspect ratio 4:3, size 1304x976.
```

> 생성 후 652×488로 리사이즈하고, 오른쪽 빈 공간에 텍스트 오버레이 추가:
> - "영어 교재 디자인"
> - "내지 5,000원~ | 표지 30,000원~"
> - "문항 구조를 아는 전문 제작자"

### 프롬프트 2 — Before/After 배경

```
A split-screen comparison image on white background. Left side: a messy, poorly formatted A4 English test paper with cramped text, inconsistent spacing, amateur layout, slightly wrinkled paper, harsh lighting. Right side: the same content beautifully redesigned — clean typography, proper spacing, structured question numbering, professional header, crisp premium look. A subtle diagonal line divides the two halves. 4:3 ratio, 1304x976 pixels.
```

> 생성 후 652×488로 리사이즈, "BEFORE / AFTER" 텍스트 오버레이

### 프롬프트 3 — 패키지 인포그래픽 배경

```
A clean modern infographic background with three vertical columns on soft ivory cream base. Left column has light blue header bar, center column navy header bar, right column gold header bar. Minimal geometric decoration, thin elegant dividing lines. Premium editorial design feel. Plenty of white space for text overlay. No text in image. 4:3 ratio, 1304x976 pixels.
```

> 생성 후 652×488로 리사이즈, 3열 패키지 정보 텍스트 오버레이

---

## D. 요약: 최소 필요 이미지

| 구분 | 파일명 | 사이즈 | 필수여부 |
|---|---|---|---|
| 메인 1 | main-01.png | 652×488 | **필수** |
| 메인 2 | main-02.png | 652×488 | 권장 |
| 상세 1 | detail-01.png | 860×~480 | **필수** |
| 상세 2 | detail-02.png | 860×~1000 | **필수** |
| 상세 3 | detail-03.png | 860×~500 | **필수** |
| 상세 4 | detail-04.png | 860×~250 | 권장 |
| 상세 5 | detail-05.png | 860×~400 | 권장 |

**최소 등록 가능: 메인 1장 + 상세 3장 = 총 4장**
**권장: 메인 2장 + 상세 5장 = 총 7장**
