# A4 인쇄용 HTML 디자인 가이드 완전판 (v2.1)
## 모던·심플·세련 + 교재/설명서 컴팩트 디자인

> **2025년 최신 기준** | 출력 전용(정적) HTML | 다목적 활용 가능  
> 교재·문제집·유인물·팜플렛·전단지·리포트·제안서·설명서

---

## 📖 이 가이드 사용 방법

### 👤 당신에게 맞는 디자인 방향 찾기

```
START
  ↓
용도가 무엇인가요?
  ├─ 교재/설명서/매뉴얼 → 섹션 13 "컴팩트 디자인" 먼저 읽기
  ├─ 홍보/전단/포스터 → 섹션 2 "색상" + 섹션 7 "용도별 톤" 집중
  ├─ 기업 제안서/리포트 → 섹션 1-6 기본편 + 섹션 12 "규격 준수"
  └─ 범용 템플릿 제작 → 전체 순서대로 읽기
```

### 📚 섹션 구성

| 섹션 | 내용 | 필수 여부 |
|------|------|-----------|
| **1-6** | 기본 원칙 (색상, 타이포, 레이아웃) | ⭐⭐⭐ 모두 필수 |
| **7** | 용도·대상별 톤 조절 | ⭐⭐ 용도 확정 후 |
| **8-9** | 출력 유의사항 & 체크리스트 | ⭐⭐⭐ 최종 검수 필수 |
| **10** | HTML/CSS 스타터 코드 | ⭐⭐ 코딩 시작 전 |
| **11** | 흔한 함정 & 예방 팁 | ⭐ 문제 발생 시 참조 |
| **12** | A4 강제 규격 (PDF 최적화) | ⭐⭐⭐ PDF 변환 필수 |
| **13** | 교재/설명서 컴팩트 디자인 | ⭐⭐⭐ 교재 제작 시 필수 |

---

## 목차

1. [핵심 철학](#1-핵심-철학)
2. [색상 (팔레트·대비·톤)](#2-색상-팔레트대비톤)
3. [타이포그래피 (글꼴·크기·행간·정렬)](#3-타이포그래피-글꼴크기행간정렬)
4. [레이아웃 (그리드·여백·정렬·흐름)](#4-레이아웃-그리드여백정렬흐름)
5. [이미지·아이콘·도표](#5-이미지아이콘도표)
6. [구성 요소별 가이드](#6-구성-요소별-가이드)
> **모든 디자인의 출발점**

### 4대 원칙

#### 1️⃣ 미니멀리즘
- 불필요한 장식 제거
- 정보 전달에 집중
- "덜어낼수록 강해진다"

#### 2️⃣ 일관성
- 색·폰트·간격·정렬·아이콘 스타일을 전 페이지 통일
- 템플릿화된 구성 요소 반복 사용
- 예측 가능한 구조로 독자 피로 감소

#### 3️⃣ 위계 (Hierarchy)
- 타이포·크기·굵기·색·여백으로 중요도 표현
- H1 > H2 > H3 > 본문 > 캡션 명확히 구분
- 시선의 흐름을 설계

#### 4️⃣ 여백 (Whitespace)
- 가독성의 핵심
- 고급스러움과 집중도 향상
- "비울 곳은 과감히 비우기"

---

## 2) 색상 (팔레트·대비·톤)

### 원칙

#### 팔레트 최소화
- **기본(Neutral) 1–2색 + 포인트 1색 = 총 2–3색**
- 더 많은 색 = 산만함

#### Neutral 기반
- 배경: `#FFFFFF`, `#F7F8FA`, `#F2F4F7`, `#FAFAFA`
- 본문: `#1F2937`, `#111827`, `#374151`
- 보조: `#667085`, `#9CA3AF`

#### 포인트 컬러는 절제적으로
- 제목·하이라이트·아이콘·그래프 강조만
- 과도한 사용은 강조 효과 희석

#### 충분한 대비
- 본문 텍스트: **WCAG AA 이상** (4.5:1)
- 제목: AAA 권장 (7:1)

### 피해야 할 것

❌ 밝은 무지개 그라데이션 배경  
❌ 이모티콘 사용. 절대 사용해선 안돼.  
❌ 목적 없는 둥근 상자 남발  
❌ 네온/형광 색감  
❌ 저대비 (회색 위 회색)  

### 추천 조합 예시

| 용도 | Neutral | 포인트 | 보조 |
|------|---------|--------|------|
| **친근·교육** | `#FFFFFF` | Teal `#1AA5A5` 또는 Orange `#F2994A` | Gray `#667085` |
| **차분·고급** | `#FAFAFA` | Navy `#0B3558` + Gold `#C8A24D` | Warm Gray `#667085` |
| **밝고 명료** | `#FFFFFF` | Cobalt Blue `#2F6FED` | Slate Gray `#475467` |
| **교재·설명서** | `#FFFFFF` | Deep Blue `#1E3A8A` | Neutral Gray `#4B5563` |

---

## 3) 타이포그래피 (글꼴·크기·행간·정렬)

### 글꼴 선택

#### 산세리프 (Sans-serif) ⭐ 추천
- **장점**: 가독성 우수, 모던, 화면/인쇄 호환
- **용도**: 제목 + 본문 모두 가능
- **예시**: Noto Sans KR, Pretendard, Inter, Roboto

#### 세리프 (Serif)
- **장점**: 긴 문장 독서 편안함, 전통적/권위적
- **단점**: 작은 크기에서 세리프 뭉개짐 가능
- **용도**: 제목, 인용구 (본문은 신중히)
- **예시**: Noto Serif KR, Georgia

#### 혼용 규칙
- **폰트 패밀리는 1–2개로 제한**
- 변주는 굵기(Weight)로: 400/500/600/700
- 제목=산세리프, 본문=세리프 가능 (역은 비추천)

### 크기 체계 (인쇄 기준)

#### 일반 문서
| 요소 | 크기 | 굵기 |
|------|------|------|
| H1 | 28–36px (21-27pt) | 700 |
| H2 | 22–28px (16.5-21pt) | 700 |
| H3 | 18–22px (13.5-16.5pt) | 600 |
| 본문 | 12–14px (9-10.5pt) | 400 |
| 캡션/주석 | 10–12px (7.5-9pt) | 400 |

#### 교재/설명서 (컴팩트)
| 요소 | 크기 | 굵기 |
|------|------|------|
| H1 | 20–24px (15-18pt) | 700 |
| H2 | 16–18px (12-13.5pt) | 600 |
| H3 | 14–16px (10.5-12pt) | 600 |
| 본문 | 9–10px (6.75-7.5pt) | 400 |
| 캡션 | 8–9px (6-6.75pt) | 400 |

### 행간·자간

#### 일반 문서
- 본문: `line-height: 1.4–1.6`
- 제목: `line-height: 1.2–1.35`
- 한 줄 폭: 50–70자

#### 교재/설명서 (컴팩트)
- 본문: `line-height: 1.3–1.4`
- 제목: `line-height: 1.15–1.25`
- 자간: `-0.01em` (미세 조정)

### 정렬

✅ **본문**: 좌측 정렬 (긴 문단 중앙정렬 금지)  
✅ **제목**: 좌측 또는 중앙 (일관성 유지)  
✅ **단락 간격**: 8-12pt로 그룹화  

---

## 4) 레이아웃 (그리드·여백·정렬·흐름)

### 페이지 설정

#### A4 규격
- **크기**: 210×297mm

#### 여백 옵션 (두 가지 스타일 선택 가능)

**옵션 1: 여유로운 디자인 (권장 - 기본값)**
- 상·하: 18–22mm
- 좌·우: 15–20mm
- **용도**: 일반 문서, 리포트, 제안서, 교육 자료
- **특징**: 가독성 최우선, 여백 충분, 호흡감 있는 레이아웃

**옵션 2: 컴팩트 디자인**
- 상·하: 12–15mm
- 좌·우: 12–15mm
- **용도**: 교재, 매뉴얼, 설명서, 정보 밀도가 높은 문서
- **특징**: 정보 밀도 최대화, 공간 효율적, 구조화 강화

**사용 가이드 (중요! 반드시 준수):**

**여유로운 디자인 적용 키워드:**
- "여유롭게", "여유롭게 디자인", "넓은 여백", "여백을 충분히", "넓게", "공간을 충분히", "spacious", "여유 공간"
- 위 키워드가 프롬프트에 포함되면 **반드시** `.spacious-design` 클래스를 사용하거나 여유로운 스타일 적용
- CSS 변수: `--page-margin: 20mm`, `--fs-body: 12pt`, `--lh-body: 1.6`, `p { margin-bottom: 6mm }`

**컴팩트 디자인 적용 키워드:**
- "컴팩트하게", "컴팩트 디자인", "정보 밀도 높게", "여백 최소화", "밀도 높게", "compact", "정보 밀도"
- 위 키워드가 프롬프트에 포함되면 **반드시** `.compact-design` 클래스를 사용하거나 컴팩트 스타일 적용
- CSS 변수: `--page-margin: 12mm`, `--fs-body: 9pt`, `--lh-body: 1.35`, `p { margin-bottom: 3mm }`

**명시 없으면:** 옵션 1(여유로운 디자인)을 기본값으로 사용

**HTML 적용 예시:**
```html
<!-- 여유로운 디자인 -->
<div class="page spacious-design">
  <!-- 또는 기본 .page (기본값이 여유로운 디자인) -->
</div>

<!-- 컴팩트 디자인 -->
<div class="page compact-design">
</div>
```

### 그리드

#### 일반 문서
- **2컬럼 그리드** (교육·리포트)
- 칼럼 간격(거터): 6–10mm

#### 교재/설명서
- **2-3컬럼 그리드** (정보 밀도 최대화)
- 칼럼 간격: 5–7mm
- 사이드바 활용 (주석, 용어 설명)

### 여백 전략

#### 일반 원칙
- 텍스트·이미지·상자 주위 **패딩/마진 충분히**
- "비울 곳은 과감히 비우기"

#### 컴팩트 원칙
- 여백 축소하되 **숨 쉴 공간 확보**
- 구분선, 음영으로 구역 분리
- 정보 밀도 70-80% 유지

### 시선 흐름

- **단면물**: Z-패턴 (좌상 → 우하)
- **다면물**: 표준 템플릿 + 변주
- **교재**: F-패턴 (좌→우, 상→하 반복)

---

## 5) 이미지·아이콘·도표

### 이미지

#### 품질 기준
- **300dpi 이상** 고해상도
- 저화질 이미지 절대 금지

#### 사용 원칙
- 내용과 **직접 관련**된 이미지만
- 장식성 최소화
- 풀블리드 시 대비 확보
- 주변 여백 + 캡션 필수

### 아이콘/일러스트

#### 스타일 통일
- 선형(Line) 또는 면형(Filled) 중 **한 가지만**
- 크기·스트로크 굵기 일관
- 팔레트 내 색상만 사용

#### 교재용 아이콘
- 개념 설명: 추상 아이콘
- 단계 표시: 번호 아이콘
- 주의/팁: 시스템 아이콘

### 표/그래프

#### 스타일
- **평면(Flat) 디자인**
- 3D·그림자·과장 효과 금지
- 헤더/구분선만 얇게

#### 색상
- 포인트 데이터만 강조
- 나머지는 저채도 톤
- 교재: 흑백 인쇄 고려 (패턴 활용)

---

## 6) 구성 요소별 가이드

### (1) 표지

#### 기본 원칙
- **요소 최소화**: 제목·부제·로고 (최대 5개)
- **여백 분배**: 상단 쏠림 방지
- **큰 제목 + 넓은 여백 + 상징 이미지 1개**

#### 레이아웃 코드
```css
/* ✅ 올바른 표지 레이아웃 */
.page.no-header-footer .page-content {
    display: flex;
    flex-direction: column;
    justify-content: center;  /* 중앙 정렬 */
    align-items: center;
    min-height: 100%;
    padding: 20mm;
}

/* ✅ 상단 정렬도 가능 (여백 충분히) */
.page.no-header-footer .page-content {
    justify-content: flex-start;
    padding-top: 40mm;  /* 최소 30mm 이상 */
    padding-bottom: 40mm;
}

/* ❌ 피해야 할 방식 */
.page.no-header-footer .page-content {
    justify-content: flex-start;
    padding-top: 5mm;  /* 상단 쏠림 */
}
```

#### 여백 가이드
- **상단 정렬**: 상단 여백 최소 30-40mm
- **중앙 정렬**: `justify-content: center`
- **균형 배치**: 상·하 여백 균등

### (2) 목차 (TOC)

#### 구조
- 단계별 **들여쓰기 + 크기 차이**
- 페이지 번호 우측 정렬
- 점선 리더 선택적 사용

#### 스타일 통일
- 본문 헤딩과 톤·폰트 일치
- 계층 구조 명확히

### (3) 본문

#### 스타일 정의
- H1–H3, 본문, 리스트, 캡션 **일관 적용**
- 긴 텍스트: 단락 분할 + 소제목 + 리스트
- 이미지·도표: 관련 문장 근처 + 캡션

#### 헤더-본문 간격
```css
/* ✅ 올바른 간격 */
.page-header {
    margin-bottom: 6mm;  /* 5-8mm 권장 */
}

/* ❌ 과도한 공백 */
.page-header {
    margin-bottom: 15mm;  /* 너무 큼 */
}
```

#### 간격 가이드
- 일반 페이지: 5-8mm
- 목차 페이지: 6-10mm
- 최대 허용: 10mm 이하

### (4) 박스/퀴즈/콜아웃

#### 일관 템플릿
- 배경색/테두리/아이콘/패딩 통일
- 배경: 팔레트의 옅은 보조색
- 테두리: 1px 얇게 또는 생략

#### 모서리 스타일
- 각진 또는 둥근 **한 가지만**
- 문서 전체와 통일

### (5) 연락처/CTA

#### 원칙
- 작지만 가독성 유지
- 아이콘+텍스트 간격 일정
- CTA: 짧고 명료 (굵기/색 강조)

---

## 7) 텍스트 강조 기능 (절제와 선택)

> **핵심 철학**: "Less is More" - 평범함이 기본, 강조는 예외

### 🎯 가장 중요한 원칙

**강조는 예외적으로 사용합니다. 모든 것을 강조하면 아무것도 강조되지 않습니다.**

---

### 🚫 절대 금지 사항

❌ **한 문장에 3개 이상 강조 금지**  
❌ **연속된 2개 문장에 모두 강조 금지** (최소 1개 문장은 강조 없이)  
❌ **단락 전체를 강조 금지** (단락당 최대 1-2개 요소만)  
❌ **장식 목적의 강조 금지** (의미 없는 강조는 삭제)  
❌ **모든 영어 단어 강조 금지** (핵심 용어만 선택적으로)  

---

### 📊 강조 사용 빈도 기준 (엄격히 준수)

#### 단락(Paragraph) 기준
- ✅ **권장**: 단락 1개당 강조 **0-2개**
- ⚠️ **최대**: 단락 1개당 강조 **3개**
- ❌ **금지**: 단락 1개당 강조 **4개 이상**

#### 페이지(A4) 기준
- ✅ **권장**: 페이지 1개당 강조 **3-7개**
- ⚠️ **최대**: 페이지 1개당 강조 **10개**
- ❌ **금지**: 페이지 1개당 강조 **15개 이상**

#### 문장 기준
- ✅ **이상적**: 문장 1개당 강조 **0-1개**
- ⚠️ **허용**: 문장 1개당 강조 **2개** (예외적으로만)
- ❌ **금지**: 문장 1개당 강조 **3개 이상**

---

### 🎨 강조 스타일 (간소화 - 3종만 사용)

#### 1️⃣ 색상 강조 (가장 절제적)
```css
.highlight-key {
    color: #1E3A8A;  /* Deep Blue */
    font-weight: 600;
}
```
- **용도**: 핵심 용어, 정답 (문장당 최대 1개)
- **예시**: "부동사는 <span class="highlight-key">동사와 전치사의 결합</span>입니다."

#### 2️⃣ 배경 강조 (제한적 사용)
```css
.highlight-bg {
    background: #FEF3C7;
    color: #92400E;
    padding: 2px 4px;
    border-radius: 2px;
}
```
- **용도**: 정답 설명, 핵심 개념 (단락당 최대 1개)
- **예시**: "따라서 정답은 <span class="highlight-bg">routinely</span>입니다."

#### 3️⃣ 영문 강조 (매우 선택적)
```css
.highlight-eng {
    color: #0EA5E9;
    font-weight: 500;
}
```
- **용도**: 중요한 영어 용어만 (모든 영어 단어가 아님!)
- **예시**: "이는 <span class="highlight-eng">phrasal verb</span>의 특징입니다."

---

### 📋 언제 강조할 것인가? (선택 기준)

#### ✅ 강조해야 하는 경우 (매우 제한적)

1. **정답/핵심 답안** (문제 풀이에서)
   - 예: "정답은 <span class="highlight-key">routinely</span>입니다."

2. **새로운 핵심 용어 첫 등장** (페이지당 1-2회)
   - 예: "<span class="highlight-key">부동사(Phrasal Verb)</span>는..."

3. **중요한 문법 규칙/공식** (섹션당 1회)
   - 예: "대명사는 <span class="highlight-key">반드시 동사와 부사 사이</span>에 위치합니다."

#### ❌ 강조하지 말아야 하는 경우

1. **일반적인 설명 문장** → 강조 없음
   - 나쁜 예: "부동사는 <span>동사</span>와 <span>전치사</span>가 결합하여 <span>새로운 의미</span>를 만듭니다."
   - 좋은 예: "부동사는 동사와 전치사가 결합하여 새로운 의미를 만듭니다."

2. **모든 영어 단어** → 선택적 강조만
   - 나쁜 예: "<span>verb</span>, <span>adverb</span>, <span>preposition</span>"
   - 좋은 예: "verb, adverb, preposition"

3. **이미 강조한 내용 반복** → 두 번째부터는 강조 제거
   - 나쁜 예: (같은 단락에서) "부동사는... <span>부동사는</span>... <span>부동사는</span>..."
   - 좋은 예: "<span>부동사</span>는... 부동사는... 부동사는..."

4. **예시 문장 전체** → 강조 없거나 최소한만
   - 나쁜 예: "<span>I'll</span> <span>pick you up</span> <span>at 7</span>."
   - 좋은 예: "I'll pick you up at 7."

5. **접속사, 조사, 관사** → 절대 강조 금지
   - 나쁜 예: "동사<span>와</span> 전치사<span>가</span>..."
   - 좋은 예: "동사와 전치사가..."

---

### 🔥 실전 예시: 강조 사용 전후 비교

#### ❌ 나쁜 예 (과도한 강조)

```html
<p>
    <span class="highlight-key">부동사(Phrasal Verbs)</span>는 
    <span class="highlight-concept">동사(verb)</span>와 
    <span class="highlight-concept">부사(adverb)</span> 또는 
    <span class="highlight-concept">전치사(preposition)</span>가 결합하여 
    <span class="highlight-strong">새로운 의미</span>를 형성하는 동사 구를 의미합니다. 
    예를 들어, <span class="highlight-english">'look'</span>은 '보다'라는 의미이지만, 
    <span class="highlight-english">'look up'</span>은 '찾아보다' 또는 '존경하다'라는 
    <span class="highlight-strong">완전히 다른 의미</span>를 가집니다.
</p>
```
**문제점:**
- 한 단락에 8개 강조 (과도함)
- 일반 용어까지 모두 강조
- 시각적으로 산만함

#### ✅ 좋은 예 (절제된 강조)

```html
<p>
    <span class="highlight-key">부동사(Phrasal Verbs)</span>는 동사(verb)와 
    부사(adverb) 또는 전치사(preposition)가 결합하여 새로운 의미를 형성하는 
    동사 구를 의미합니다. 예를 들어, 'look'은 '보다'라는 의미이지만, 
    'look up'은 '찾아보다' 또는 '존경하다'라는 완전히 다른 의미를 가집니다.
</p>
```
**개선점:**
- 단락에 1개만 강조 (핵심 용어 첫 등장)
- 나머지는 평범한 텍스트
- 가독성 확보

---

### 📝 단락별 강조 패턴 (권장)

#### 패턴 1: 강조 없는 단락 (60-70%)
```html
<p>
    부동사는 일상 회화와 비즈니스 영어에서 매우 빈번하게 사용됩니다. 
    원어민들은 복잡한 단어 대신 부동사를 사용하여 더 자연스럽고 
    간결하게 의사를 표현하는 경향이 있습니다.
</p>
```
**특징:** 강조 0개 (일반 설명은 강조 불필요)

#### 패턴 2: 최소 강조 단락 (20-30%)
```html
<p>
    분리 가능한 부동사는 동사와 부사 사이에 목적어가 들어갈 수 있습니다. 
    하지만 목적어가 <span class="highlight-key">대명사일 경우 반드시 
    동사와 부사 사이에 위치</span>해야 합니다.
</p>
```
**특징:** 강조 1개 (핵심 규칙만)

#### 패턴 3: 선택적 강조 단락 (5-10%)
```html
<p>
    정답은 <span class="highlight-bg">'routinely'</span>입니다. 
    이는 '일상적으로, 정기적으로'라는 의미로, organize와 함께 사용되어 
    정기적인 활동을 나타냅니다.
</p>
```
**특징:** 강조 1개만 (정답만, 다른 설명은 평범하게)

---

### 🎯 실전 적용 규칙 (체크리스트)

#### 작성 후 반드시 확인

- [ ] **전체 강조 개수 세기**: 페이지당 10개 이하?
- [ ] **한 문장 점검**: 3개 이상 강조 있는 문장 있나?
- [ ] **연속성 확인**: 3개 연속 문장에 모두 강조 있나?
- [ ] **강조 없는 단락**: 최소 60% 이상 확보했나?
- [ ] **목적 확인**: 모든 강조가 진짜 필요한가?

#### 수정 기준

1. **강조 개수가 많으면**
   - 절반 이상 삭제
   - 정말 핵심만 남기기

2. **한 문장에 3개 이상이면**
   - 1개만 남기고 나머지 삭제
   - 또는 문장 분리

3. **모든 단락에 강조가 있으면**
   - 60% 이상 단락에서 강조 완전 제거
   - 일반 설명은 강조 불필요

---

### 🚨 흔한 실수와 해결책

#### 실수 1: "중요해 보이려고" 모든 것 강조
- ❌ 나쁜 사고: "이 내용 다 중요하니까 다 강조해야지"
- ✅ 올바른 사고: "진짜 핵심 1-2개만 강조하면 오히려 더 돋보인다"

#### 실수 2: 영어 단어 무조건 강조
- ❌ 나쁜 습관: 모든 영어 단어에 `.highlight-eng` 적용
- ✅ 올바른 습관: 처음 나오는 핵심 용어 1-2개만 강조

#### 실수 3: 박스 안에서도 과도한 강조
- ❌ 나쁜 예: 박스 + 내부 텍스트 4개 강조
- ✅ 좋은 예: 박스 자체가 강조이므로 내부는 0-1개만

#### 실수 4: 정의 설명에 과도한 강조
- ❌ 나쁜 예: 정의 박스 내에서 용어·개념·설명 모두 강조
- ✅ 좋은 예: 정의 박스는 배경색만으로 충분, 내부는 평범하게

---

### 📐 강조 밀도 계산 (자가 진단)

#### 계산 공식
```
강조 밀도 = (강조 개수 / 전체 문장 수) × 100

✅ 이상적: 10-20%
⚠️ 주의: 30-40%
❌ 위험: 50% 이상
```

#### 예시
- 전체 문장 20개, 강조 4개 → **20%** (이상적)
- 전체 문장 20개, 강조 8개 → **40%** (과도함, 절반 삭제 필요)
- 전체 문장 20개, 강조 12개 → **60%** (심각함, 80% 삭제 필요)

---

### 🎓 최종 원칙 (암기 필수)

#### 3대 원칙

1. **평범함이 기본, 강조는 예외**
   - 기본값: 강조 없음
   - 특별한 이유가 있을 때만 강조

2. **강조의 강조는 강조가 아니다**
   - 모든 것을 강조하면 아무것도 강조되지 않음
   - 선택과 집중

3. **덜어낼수록 강력해진다**
   - 강조를 줄일수록 남은 강조의 효과는 배가됨
   - "Less is More"

---

### 📊 권장 비율 요약

| 요소 | 강조 있음 | 강조 없음 |
|------|----------|----------|
| **단락** | 30-40% | 60-70% |
| **문장** | 10-20% | 80-90% |
| **영어 단어** | 5-10% | 90-95% |
| **개념 용어** | 10-15% | 85-90% |

---

## 8) 용도·대상별 톤 조절 (Versatile)

| 대상/용도 | 톤 & 팔레트 | 타이포 | 구성 포인트 |
|-----------|-------------|--------|-------------|
| **교육(고교/대학)** | 밝은 Neutral + 톤다운 포인트 (Teal/Orange) | 산세리프 중심, 가독 최우선 | 예제·정의 박스·아이콘 소량, 2컬럼 본문 |
| **교재/설명서** | 화이트 + Deep Blue + Neutral Gray | 산세리프 컴팩트, 9-10pt 본문 | 높은 정보 밀도, 구조화 강화, 표·리스트 |
| **홍보/전단** | 명도 대비 큰 조합 (화이트+딥블루/블랙) | 굵은 헤드라인 + 간결 본문 | 헤드라인·핵심 포인트·CTA만, 여백 확대 |
| **기업/제안서** | 화이트/워밍레이 + 네이비/골드 포인트 | 산세리프 (필요 시 본문 세리프) | 대칭·정렬·여백, 그래프 모노톤, 간결 |

---

## 9) 출력·제작 유의 (인쇄 최적화)

### 페이지 설정
- `@page A4`
- 프린터 여백 고려한 **안전 여백** 확보

### 색상
- **CMYK 인쇄 시** 어두운 배경 금지
- 얇은 연색 텍스트 금지

### 선 & 텍스트
- 작은 텍스트·얇은 선 **번짐 방지**
- 선 0.5pt 이상 권장

### 웹 UI 흔적 제거
- 링크 색/밑줄 제거
- `@media print` 스타일 적용

### 이미지 포맷
- 사진: JPEG (고품질, 80-90%)
- 그래픽: PNG/SVG

### 최종 점검
- **시험 인쇄**로 대비·크기·여백 확인

---

## 10) 체크리스트 (빠른 검수용)

### 색상
- [ ] 팔레트 2–3색 이내
- [ ] 포인트 색 절제 사용
- [ ] 텍스트 대비 충분 (AA 이상)

### 폰트
- [ ] 폰트 패밀리 1–2개
- [ ] 굵기로 위계 표현
- [ ] 본문 12–14px (일반) / 9-10pt (교재)
- [ ] 행간 1.4–1.6 (일반) / 1.3-1.4 (교재)

### 텍스트 강조 (신규 추가)
- [ ] 페이지당 강조 10개 이하
- [ ] 단락당 강조 2개 이하
- [ ] 문장당 강조 1개 이하
- [ ] 강조 없는 단락 60% 이상

### 레이아웃
- [ ] A4 여백 확보 (일반 15–22mm / 교재 12-15mm)
- [ ] 2–3컬럼 그리드 적용
- [ ] 요소 정렬선 일치

### 이미지/도표
- [ ] 300dpi 고해상도
- [ ] 장식성 최소
- [ ] 평면 그래프, 필요선만

### 구성 요소
- [ ] 표지 요소 3–5개 이하
- [ ] TOC 들여쓰기·페이지번호 정렬
- [ ] 박스 템플릿 일관

### 출력
- [ ] 시험 인쇄로 색·가독 확인
- [ ] 얇은 선/작은 글씨 번짐 점검
- [ ] PDF 변환 시 A4 규격 준수

---

## 11) HTML/CSS 스타터 (A4 인쇄용, 정적)

### 기본 템플릿

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>인쇄용 A4 템플릿</title>
<style>
/* ========= Design Tokens ========= */
:root{
  /* Color */
  --bg: #FFFFFF;
  --ink: #1F2937;
  --muted: #667085;
  --line: #E5E7EB;
  --accent: #1AA5A5;
  --accent-weak: #E6F5F5;
  
  /* Typography */
  --f-sans: "Pretendard","Noto Sans KR",system-ui,Arial,sans-serif;
  --fs-body: 12.5pt;
  --fs-small: 10.5pt;
  --lh-body: 1.5;
  
  /* Layout - 여유로운 디자인 (기본값) */
  --page-margin-top: 20mm;
  --page-margin-right: 16mm;
  --page-margin-bottom: 20mm;
  --page-margin-left: 16mm;
  --column-gap: 8mm;
  
  /* Highlight Colors - 절제적 사용 */
  --highlight-key: #1E3A8A;
  --highlight-bg: #FEF3C7;
  --highlight-bg-text: #92400E;
  --highlight-eng: #0EA5E9;
}

/* 컴팩트 디자인 옵션 */
.compact-design {
  --page-margin-top: 12mm;
  --page-margin-right: 12mm;
  --page-margin-bottom: 12mm;
  --page-margin-left: 12mm;
  --column-gap: 6mm;
  --fs-body: 9pt;
  --fs-small: 8pt;
  --lh-body: 1.35;
}

/* ========= Print Setup ========= */
@page {
  size: A4;
  margin: 0;
}
@media print {
  a { color: inherit; text-decoration: none; }
}

/* ========= Base ========= */
html,body { 
  background: var(--bg); 
  color: var(--ink); 
}
body{
  font-family: var(--f-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  padding: var(--page-margin-top) var(--page-margin-right)
           var(--page-margin-bottom) var(--page-margin-left);
}

h1,h2,h3{ line-height: 1.25; margin: 0 0 8pt; }
h1{ font-size: 26pt; font-weight: 700; }
h2{ font-size: 20pt; font-weight: 700; margin-top: 12pt; }
h3{ font-size: 16pt; font-weight: 600; margin-top: 10pt; }

p{ margin: 0 0 8pt; color: var(--ink); }
.small{ font-size: var(--fs-small); color: var(--muted); }

/* ========= Highlight Styles (절제적 사용) ========= */
.highlight-key {
  color: var(--highlight-key);
  font-weight: 600;
}

.highlight-bg {
  background: var(--highlight-bg);
  color: var(--highlight-bg-text);
  padding: 2px 4px;
  border-radius: 2px;
}

.highlight-eng {
  color: var(--highlight-eng);
  font-weight: 500;
}

/* ========= Grid ========= */
.page{ display: grid; grid-template-columns: 1fr; gap: 10pt; }
.two-col{
  column-count: 2;
  column-gap: var(--column-gap);
}

/* ========= Rules ========= */
.hr{ height: 1px; background: var(--line); margin: 10pt 0; }

/* ========= Callout ========= */
.callout{
  background: var(--accent-weak);
  border: 1px solid #D5EEEE;
  padding: 10pt;
  border-radius: 10px;
  break-inside: avoid;
}
.callout .title{
  font-weight: 600; 
  color: var(--accent); 
  margin-bottom: 6pt;
}

/* ========= Figure ========= */
figure{ margin: 0 0 8pt; break-inside: avoid; }
figcaption{ 
  font-size: var(--fs-small); 
  color: var(--muted); 
  margin-top: 4pt; 
}

/* ========= TOC ========= */
.toc h2{ margin-bottom: 6pt; }
.toc ol{ margin: 0; padding-left: 0; list-style: none; }
.toc li{
  display: grid; 
  grid-template-columns: 1fr auto; 
  align-items: baseline;
  gap: 8pt; 
  padding: 3pt 0; 
  border-bottom: 1px dotted var(--line);
}
.toc .lvl1{ font-weight: 600; }
.toc .lvl2{ padding-left: 8pt; color: var(--muted); }

/* ========= Footer ========= */
.footer{
  margin-top: 16pt; 
  padding-top: 8pt; 
  border-top: 1px solid var(--line);
  font-size: var(--fs-small); 
  color: var(--muted);
}
</style>
</head>
<body>

<!-- Cover -->
<section class="page" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 100vh;">
  <p class="small" style="margin-bottom: 12mm;">OFFICIAL DOCUMENT</p>
  <h1 style="margin-bottom: 8mm;">모던 A4 인쇄물 가이드</h1>
  <p class="small" style="margin-bottom: 12mm;">부제목 혹은 짧은 카피</p>
  <div class="hr" style="width: 60px; margin-bottom: 12mm;"></div>
  <p class="small">작성자 정보</p>
</section>

<!-- TOC -->
<section class="page toc">
  <h2>Contents</h2>
  <ol>
    <li><span class="lvl1">1. 색상 원칙</span><span>2</span></li>
    <li><span class="lvl1">2. 타이포그래피</span><span>3</span></li>
    <li><span class="lvl2">2.1 본문과 제목</span><span>3</span></li>
    <li><span class="lvl1">3. 레이아웃</span><span>4</span></li>
  </ol>
</section>

<!-- Body (Two Columns) -->
<section class="page two-col">
  <h2>1. 색상 원칙</h2>
  <p>팔레트는 2–3색 내에서 구성합니다...</p>

  <h2>2. 타이포그래피</h2>
  <p>가독성과 위계를 위해 폰트를 선택합니다...</p>

  <div class="callout">
    <div class="title">핵심 요약</div>
    <p>중요한 내용을 강조하는 박스입니다.</p>
  </div>

  <h2>3. 레이아웃</h2>
  <p>A4 용지에 맞춰 그리드를 설계합니다...</p>

  <figure>
    <img src="example.jpg" alt="예시 이미지" style="width:100%; height:auto;" />
    <figcaption>그림 1. 관련 이미지 캡션</figcaption>
  </figure>
</section>

<!-- Footer -->
<section class="page footer">
  문의: 02-1234-5678 · hello@example.com · example.com
</section>

</body>
</html>
```

### 강조 사용 예시 (절제적)

```html
<!-- ✅ 올바른 강조 사용 (단락당 1개) -->
<p>
    <span class="highlight-key">부동사(Phrasal Verbs)</span>는 동사와 
    전치사가 결합하여 새로운 의미를 형성하는 동사 구입니다.
</p>

<p>
    정답은 <span class="highlight-bg">routinely</span>입니다. 
    이는 '일상적으로'라는 의미를 나타냅니다.
</p>

<p>
    이는 <span class="highlight-eng">phrasal verb</span>의 특징입니다.
</p>

<!-- ❌ 과도한 강조 (피해야 함) -->
<p>
    <span>부동사</span>는 <span>동사</span>와 <span>전치사</span>가 
    결합하여 <span>새로운 의미</span>를 형성합니다.
</p>
```

---

## 12) 흔한 함정 & 예방 팁

| 함정 | 증상 | 해결 |
|------|------|------|
| **너무 많은 색** | 산만함, 저가 인상 | 팔레트 2–3색, 포인트만 강조 |
| **폰트 남발** | 일관성 없음 | 패밀리 1–2개, 굵기·크기 변주 |
| **정렬선 불일치** | 지저분함 | 그리드/가이드에 스냅 |
| **과밀** | 답답함, 가독성 저하 | 여백 확대, 정보 요약 |
| **저해상도 이미지** | 흐릿함 | 300dpi 원본 사용 |
| **둥근 상자 남발** | 값싸 보임 | 목적·템플릿화·일관성 |
| **웹 UI 흔적** | 출력물스럽지 않음 | 링크 색/밑줄 제거 |
| **과도한 강조** | 산만함, 강조 효과 없음 | 페이지당 10개 이하, 단락당 2개 이하 |

---

## 13) A4 강제 규격 준수 (PDF 변환 최적화)

> **중요**: PDF 변환 시 페이지 넘침·잘림 방지

### A. 페이지 높이 강제 제한

```css
/* ❌ 잘못된 방식 */
.page {
    min-height: 297mm;  /* 내용 많으면 늘어남 */
}

/* ✅ 올바른 방식 */
.page {
    width: 210mm;
    height: 297mm;  /* 고정 높이 */
    overflow: hidden;
    page-break-after: always;
}
```

### B. 안전 여백 계산

```css
.page {
    width: 210mm;
    height: 297mm;
    padding: 20mm 18mm 20mm 18mm;
    /* 실제 콘텐츠: 174mm × 257mm */
}

.page-content {
    max-height: 217mm; /* 257mm - 40mm(헤더+푸터) */
    overflow: hidden;
}
```

### C. 페이지당 내용량 제한

**최대 허용 요소:**
- 제목 1개 + 본문 3-4문단 + 테이블 1개 + 이미지 1개
- **또는** 제목 1개 + 본문 6-8문단 (이미지 없이)
- **또는** 제목 1개 + 큰 테이블 1개 + 설명 2문단

### D. 테이블 크기 제한

```css
table {
    max-height: 120mm;
    overflow: hidden;
}
/* 행 수: 최대 15행 (헤더 포함) */
/* 열 수: 최대 6개 권장 */
```

### E. 이미지/그래프 크기 제한

```css
.chart-container, figure {
    max-height: 100mm;
    max-width: 174mm;
}

svg {
    width: 100%;
    max-height: 80mm;
    viewBox: "0 0 400 200";
}
```

### F. 텍스트 줄 수 제한

```css
.text-content {
    max-height: 180mm;
    overflow: hidden;
}

p {
    max-height: 25mm;  /* 약 6-7줄 */
    overflow: hidden;
}
```

### G. 멀티 페이지 설계 원칙

| 페이지 | 구성 |
|--------|------|
| **1 (표지)** | 제목 + 부제 + 로고 + 설명 2-3줄 (최대 5개 요소) |
| **2-N (내용)** | 단일 주제, 70% 사용 + 30% 여백 |

### H. PDF 변환 필수 CSS

```css
@page {
    size: A4 portrait;
    margin: 0;
}

@media print {
    .page {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always;
        height: 297mm !important;
        max-height: 297mm !important;
    }
    
    .page:last-child {
        page-break-after: avoid;
    }
    
    .page-content {
        overflow: hidden !important;
        max-height: 217mm !important;
    }
}
```

### I. 콘텐츠 분할 가이드

**자동 분할 규칙:**
1. 테이블: 10행 초과 → 분할
2. 그래프: 2개 이상 → 분할
3. 텍스트: 8문단 초과 → 분할
4. 이미지: 60mm 초과 → 단독 페이지

### J. 오류 방지 체크리스트

**설계:**
- [ ] 페이지당 주요 요소 3개 이하
- [ ] 각 요소 최대 크기 계산
- [ ] 여백 30% 이상 확보

**코딩:**
- [ ] `height: 297mm` (min-height 금지)
- [ ] `overflow: hidden`
- [ ] `max-height` 설정
- [ ] `page-break-*` 활용

**검증:**
- [ ] 브라우저 인쇄 미리보기
- [ ] PDF 저장하여 A4 확인
- [ ] 개발자 도구로 297mm 측정

---

## 14) 교재/설명서 컴팩트 디자인 (정보 밀도 최적화)

> **교재·매뉴얼·설명서·기술 문서 전용 가이드**  
> 목표: **많은 정보를 명확하고 체계적으로 전달**

---

### 📊 일반 문서 vs 교재/설명서 비교

| 특성 | 일반 웹/문서 | 교재/설명서 |
|------|--------------|-------------|
| **목적** | 경험, 전환 | **정보 전달** |
| **정보 밀도** | 50-60% | **70-80%** |
| **본문 크기** | 12-14px | **9-10pt** |
| **행간** | 1.6-1.8 | **1.3-1.4** |
| **폰트 수** | 1-2개 | **2-3개** (한글/영문/코드) |
| **여백** | 넉넉함 | **최적화** (정보 우선) |
| **구조화** | 선택적 | **필수** (박스, 표, 리스트) |
| **강조 사용** | 자유 | **엄격히 제한** (과도한 강조 금지) |

---

### 1️⃣ 폰트 선택 전략

#### A. 교재용 폰트 필수 조건

✅ **작은 크기(9-10pt)에서 명확**  
✅ **장시간 독서 피로 없음**  
✅ **숫자/기호 구별 명확** (1lI, 0O)  
✅ **컴팩트한 자폭** (정보 밀도 확보)  
✅ **인쇄 시 번짐 없음**  

#### B. 세리프 vs 산세리프 (교재 관점)

**산세리프 ⭐⭐⭐ 강력 추천**
- **장점**: 작은 크기 가독성 최상, 현대적, 화면/인쇄 호환
- **용도**: 본문 + 제목 모두
- **교재 표준**: 9pt 산세리프

**세리프 (선택적)**
- **장점**: 긴 문장 독서 편안, 전통적
- **단점**: 작은 크기에서 세리프 뭉개짐
- **용도**: 제목, 인용구만

**교재 권장 조합:**
1. 🥇 **산세리프(제목) + 산세리프(본문)** - 가장 안전
2. 🥈 **세리프(제목) + 산세리프(본문)** - 차별화
3. 🥉 **산세리프 단일** - 일관성

---

### 2️⃣ 타이포그래피 최적화

#### A. 크기 체계 (교재 전용)

| 요소 | 크기 (px) | 크기 (pt) | 굵기 | 행간 |
|------|-----------|-----------|------|------|
| **H1 (챕터)** | 20-24px | 15-18pt | 700 | 1.2 |
| **H2 (섹션)** | 16-18px | 12-13.5pt | 600 | 1.25 |
| **H3 (소제목)** | 14-16px | 10.5-12pt | 600 | 1.25 |
| **본문** | 9-10px | 6.75-7.5pt | 400 | 1.3-1.4 |
| **캡션/주석** | 8-9px | 6-6.75pt | 400 | 1.3 |
| **코드** | 8.5-9.5px | 6.4-7.1pt | 400 | 1.35 |

#### B. 행간 & 자간 최적화

**행간 (line-height)**
- 본문: `1.3-1.4` (정보 밀도 확보)
- 제목: `1.15-1.25` (컴팩트)
- 코드: `1.35` (가독성)

**자간 (letter-spacing)**
- 본문: `-0.01em` (미세 조정)
- 제목: `0` (기본값)
- 코드: `0` (고정폭)

**단어 간격 (word-spacing)**
- 본문: `0.02em` (미세 확장)

---

### 3️⃣ 레이아웃 최적화

#### A. 여백 축소 (컴팩트 모드)

**일반 vs 교재**
| 항목 | 일반 문서 | 교재 |
|------|-----------|------|
| 상·하 여백 | 18-22mm | **12-15mm** |
| 좌·우 여백 | 15-20mm | **12-15mm** |
| 칼럼 간격 | 6-10mm | **5-7mm** |
| 단락 간격 | 8-12pt | **4-6pt** |

#### B. 그리드 전략

**2-3컬럼 레이아웃**
```css
.textbook-content {
    column-count: 2;
    column-gap: 6mm;
    column-rule: 1px solid #E5E7EB;
}

/* 3컬럼 (고급) */
.dense-layout {
    column-count: 3;
    column-gap: 5mm;
}
```

**사이드바 활용**
```css
.page-with-sidebar {
    display: grid;
    grid-template-columns: 1fr 50mm;
    gap: 5mm;
}

.sidebar {
    font-size: 8pt;
    color: #667085;
    /* 용어 설명, 주석, 팁 */
}
```

---

### 4️⃣ 교재용 강조 전략 (엄격한 제한)

> **교재는 정보 밀도가 높으므로 강조는 더욱 절제적으로 사용해야 합니다.**

#### 교재 전용 강조 규칙

**페이지당 강조 제한:**
- ✅ **권장**: 페이지 1개당 강조 **3-5개**
- ⚠️ **최대**: 페이지 1개당 강조 **7개**
- ❌ **금지**: 페이지 1개당 강조 **10개 이상**

**단락당 강조 제한:**
- ✅ **권장**: 단락 1개당 강조 **0-1개**
- ⚠️ **최대**: 단락 1개당 강조 **2개**
- ❌ **금지**: 단락 1개당 강조 **3개 이상**

**강조 우선순위 (교재용):**
1. 새로운 핵심 용어 첫 등장 (페이지당 1-2회)
2. 중요한 문법 규칙/공식 (섹션당 1회)
3. 정답/핵심 답안 (문제 풀이 시)
4. 그 외는 강조 없음

---

### 5️⃣ 교재 전용 HTML/CSS 템플릿

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>교재 템플릿 - 컴팩트 디자인</title>
<style>
/* ========= Design Tokens (교재 최적화) ========= */
:root{
  /* Color - 학습 최적화 */
  --bg: #FFFFFF;
  --ink: #1F2937;
  --muted: #667085;
  --line: #E5E7EB;
  --accent-blue: #1E3A8A;
  --accent-orange: #F97316;
  --concept-bg: #F0F9FF;
  --concept-border: #0EA5E9;
  --example-bg: #F7FEE7;
  --example-border: #22C55E;
  --warning-bg: #FEF3C7;
  --warning-border: #F59E0B;
  
  /* Typography - 컴팩트 */
  --f-sans: "Pretendard","Noto Sans KR",system-ui,sans-serif;
  --f-code: "Fira Code","Consolas",monospace;
  --fs-body: 9pt;
  --fs-small: 8pt;
  --fs-tiny: 7pt;
  --lh-body: 1.35;
  
  /* Layout - 여백 축소 */
  --page-margin: 12mm;
  --column-gap: 6mm;
  --para-gap: 4pt;
  
  /* Highlight - 절제적 사용 */
  --highlight-key: #1E3A8A;
  --highlight-bg: #FEF3C7;
  --highlight-bg-text: #92400E;
  --highlight-eng: #0EA5E9;
}

/* ========= Print Setup ========= */
@page {
  size: A4;
  margin: 0;
}

@media print {
  a { color: inherit; text-decoration: none; }
  .no-print { display: none; }
}

/* ========= Base ========= */
html,body { 
  background: var(--bg); 
  color: var(--ink);
  margin: 0;
  padding: 0;
}

body{
  font-family: var(--f-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ========= Page Structure ========= */
.page {
  width: 210mm;
  min-height: 297mm;
  padding: var(--page-margin);
  box-sizing: border-box;
  page-break-after: always;
  position: relative;
}

.page:last-child {
  page-break-after: avoid;
}

/* ========= Header & Footer ========= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 3mm;
  margin-bottom: 4mm;
  border-bottom: 1px solid var(--line);
  font-size: var(--fs-small);
  color: var(--muted);
}

.page-footer {
  position: absolute;
  bottom: var(--page-margin);
  left: var(--page-margin);
  right: var(--page-margin);
  padding-top: 3mm;
  border-top: 1px solid var(--line);
  font-size: var(--fs-tiny);
  color: var(--muted);
  text-align: center;
}

/* ========= Typography ========= */
h1,h2,h3,h4 { 
  font-weight: 700;
  margin: 8pt 0 4pt;
  line-height: 1.2;
  color: var(--accent-blue);
}

h1 { font-size: 18pt; counter-reset: section; }
h2 { font-size: 13pt; counter-reset: subsection; }
h3 { font-size: 11pt; }
h4 { font-size: 10pt; font-weight: 600; }

p { 
  margin: 0 0 var(--para-gap);
  text-align: justify;
}

strong { font-weight: 600; color: var(--ink); }
em { font-style: normal; color: var(--accent-orange); font-weight: 500; }

/* ========= Highlight Styles (매우 절제적) ========= */
.highlight-key {
  color: var(--highlight-key);
  font-weight: 600;
}

.highlight-bg {
  background: var(--highlight-bg);
  color: var(--highlight-bg-text);
  padding: 2px 4px;
  border-radius: 2px;
}

.highlight-eng {
  color: var(--highlight-eng);
  font-weight: 500;
}

/* ========= Code ========= */
code {
  font-family: var(--f-code);
  font-size: 8.5pt;
  background: #F9FAFB;
  padding: 1pt 3pt;
  border-radius: 2px;
}

pre {
  font-family: var(--f-code);
  font-size: 8pt;
  line-height: 1.4;
  background: #1F2937;
  color: #F9FAFB;
  padding: 6pt;
  border-radius: 4px;
  overflow-x: auto;
  margin: 6pt 0;
}

/* ========= Lists ========= */
ul, ol {
  margin: 3pt 0 3pt 10pt;
  padding: 0;
}

li {
  margin-bottom: 2pt;
}

/* ========= Tables ========= */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-small);
  margin: 6pt 0;
}

th {
  background: #F9FAFB;
  font-weight: 600;
  padding: 3pt 5pt;
  border: 1px solid var(--line);
  text-align: left;
}

td {
  padding: 3pt 5pt;
  border: 1px solid var(--line);
}

tbody tr:nth-child(even) {
  background: #FAFBFC;
}

/* ========= Box Components ========= */
.definition {
  background: var(--concept-bg);
  border-left: 3px solid var(--concept-border);
  padding: 6pt;
  margin: 6pt 0;
  break-inside: avoid;
}

.definition .title {
  font-weight: 600;
  color: var(--concept-border);
  margin-bottom: 3pt;
}

.example {
  background: var(--example-bg);
  border-left: 3px solid var(--example-border);
  padding: 6pt;
  margin: 6pt 0;
  break-inside: avoid;
}

.example .title {
  font-weight: 600;
  color: var(--example-border);
  margin-bottom: 3pt;
}

.warning {
  background: var(--warning-bg);
  border-left: 3px solid var(--warning-border);
  padding: 6pt;
  margin: 6pt 0;
  break-inside: avoid;
}

.warning .title {
  font-weight: 600;
  color: var(--warning-border);
  margin-bottom: 3pt;
}

/* ========= Two Column Layout ========= */
.two-col {
  column-count: 2;
  column-gap: var(--column-gap);
  column-rule: 1px solid var(--line);
}

/* ========= Figures ========= */
figure {
  margin: 6pt 0;
  break-inside: avoid;
}

figcaption {
  font-size: var(--fs-small);
  color: var(--muted);
  margin-top: 3pt;
  font-style: italic;
}

/* ========= Sidebar Layout ========= */
.with-sidebar {
  display: grid;
  grid-template-columns: 1fr 45mm;
  gap: 5mm;
}

.sidebar {
  font-size: var(--fs-tiny);
  color: var(--muted);
  padding: 4pt;
  background: #F9FAFB;
  border-radius: 3px;
}

.sidebar h4 {
  font-size: var(--fs-small);
  margin-top: 0;
}
</style>
</head>
<body>

<!-- Cover Page -->
<div class="page" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
  <h1 style="font-size: 28pt; margin-bottom: 8mm; color: var(--accent-blue);">
    파이썬 프로그래밍 기초
  </h1>
  <p style="font-size: 14pt; color: var(--muted); margin-bottom: 15mm;">
    초보자를 위한 완벽 가이드
  </p>
  <div style="width: 60px; height: 2px; background: var(--accent-orange); margin-bottom: 15mm;"></div>
  <p style="font-size: 11pt; color: var(--muted);">
    저자: 홍길동<br>
    버전 1.0 | 2025년 1월
  </p>
</div>

<!-- Content Page -->
<div class="page">
  <div class="page-header">
    <span class="chapter">Chapter 1. 파이썬 소개</span>
    <span class="page-number">1</span>
  </div>
  
  <div class="two-col">
    <h2>1.1 파이썬이란?</h2>
    <p>
      파이썬(Python)은 1991년 귀도 반 로섬이 개발한 프로그래밍 언어입니다. 
      간결하고 읽기 쉬운 문법으로 초보자도 쉽게 배울 수 있으며, 
      동시에 강력한 기능을 제공합니다.
    </p>

    <div class="definition">
      <div class="title">💡 개념 정의</div>
      <p>
        <span class="highlight-key">고급 언어(High-level Language)</span>는 
        사람이 이해하기 쉬운 문법으로 작성된 프로그래밍 언어입니다.
      </p>
    </div>

    <h3>1.1.1 파이썬의 특징</h3>
    <ul>
      <li>간결한 문법: 불필요한 기호가 적어 읽기 쉽습니다.</li>
      <li>풍부한 라이브러리: 다양한 작업을 위한 도구가 준비되어 있습니다.</li>
      <li>크로스 플랫폼: Windows, Mac, Linux 모두에서 실행됩니다.</li>
      <li>오픈소스: 무료로 사용 가능하며 커뮤니티가 활발합니다.</li>
    </ul>

    <div class="example">
      <div class="title">📝 예제 1-1: Hello World</div>
      <pre>print("Hello, World!")</pre>
      <p>이 한 줄로 화면에 메시지를 출력할 수 있습니다.</p>
    </div>
  </div>

  <div class="page-footer">
    © 2025 파이썬 교육 센터 | 무단 복제 금지
  </div>
</div>

</body>
</html>
```

---

### 6️⃣ 교재 제작 체크리스트

#### 설계 단계
- [ ] 타겟 독자 명확히 (초급/중급/고급)
- [ ] 학습 목표 구체화
- [ ] 정보 계층 구조 설계
- [ ] 챕터·섹션 번호 체계 확정

#### 디자인 단계
- [ ] 폰트 조합 결정 (한글/영문/코드)
- [ ] 색상 팔레트 확정 (2-4색)
- [ ] 박스 템플릿 디자인 (정의/예제/경고/팁)
- [ ] 표·리스트 스타일 통일

#### 제작 단계
- [ ] 본문 크기 9-10pt 적용
- [ ] 행간 1.3-1.4 유지
- [ ] 여백 12-15mm 설정
- [ ] 2-3컬럼 레이아웃 구현

#### 강조 사용 (엄격한 제한)
- [ ] 페이지당 강조 7개 이하
- [ ] 단락당 강조 1개 이하
- [ ] 강조 없는 단락 60% 이상
- [ ] 모든 강조에 명확한 목적 있음

#### 검수 단계
- [ ] 작은 크기(9pt)에서 가독성 확인
- [ ] 흑백 인쇄 테스트
- [ ] 페이지당 정보량 적정성 점검
- [ ] 일관성 검토 (폰트, 색상, 간격)
- [ ] 강조 개수 재확인 및 축소

---

### 7️⃣ 교재 vs 일반 문서 최종 비교표

| 항목 | 일반 문서 | 교재/설명서 | 차이점 |
|------|-----------|-------------|--------|
| **폰트 크기** | 12-14px | **9-10pt** | 30% 축소 |
| **행간** | 1.6 | **1.35** | 15% 축소 |
| **여백** | 18-22mm | **12-15mm** | 30% 축소 |
| **칼럼** | 1-2개 | **2-3개** | 정보 밀도 증가 |
| **박스 사용** | 선택적 | **필수** | 구조화 강화 |
| **색상** | 2-3색 | **2-4색** | 학습 보조 |
| **구조화** | 중간 | **높음** | 스캔 용이 |
| **정보 밀도** | 50-60% | **70-80%** | 40% 증가 |
| **강조 빈도** | 자유 | **엄격 제한** | 페이지당 3-7개 |

---

## 결론

이 가이드는 **모던·심플**한 기본기를 토대로, **대상과 용도에 맞춘 미세 조정**으로 언제든 세련된 인쇄물을 만들 수 있도록 설계되었습니다.

**5대 핵심 원칙:**
1. 팔레트 최소화
2. 폰트 절제
3. 정돈된 그리드
4. 충분한 여백
5. **목적 있는 강조 (절제와 선택)**

**추가로:**
- A4 강제 규격 준수로 PDF 변환 완벽 대응
- 교재/설명서용 컴팩트 디자인으로 정보 밀도 최적화
- **과도한 강조 방지로 가독성 극대화**

이 원칙들만 지켜도 **결과물의 완성도와 신뢰도가 극적으로 향상**됩니다.

---

**문서 버전:** 2.1 (2025년 1월)  
**최종 수정:** 텍스트 강조 가이드라인 개선 (과도한 강조 방지 강화)  
**페이지 수:** 55+ 페이지 분량

---

## 15) 🆕 콘텐츠 넘침 방지 및 자동 감지

### 🚨 문제 상황
A4는 높이가 **297mm**로 고정되어 있습니다. 내용이 너무 많으면:
1. 페이지 밖으로 텍스트가 잘려 나감 (인쇄 불가)
2. 다음 페이지로 넘어가면서 레이아웃이 깨짐

### ✅ 해결책 1: 자동 감지 스크립트 활용
`basic_structure.html`에는 **Overflow Detection** 기능이 내장되어 있습니다.
- 문서를 브라우저에서 열었을 때, 내용이 A4 높이를 초과하면 해당 페이지 테두리가 **빨간색**으로 변합니다.
- **개발자 도구(F12) > Console**에 경고 메시지가 출력됩니다.
- 이 신호를 확인하면 내용을 다음 페이지로 분할하거나 줄여야 합니다.

### ✅ 해결책 2: 페이지 분할 전략
- **긴 텍스트**: 적절한 지점에서 `</div><div class="page">`로 페이지를 수동 분할하세요.
- **이미지/표**: 페이지 하단에 걸칠 경우, 차라리 다음 페이지 상단으로 이동시키세요.
- **여백 확보**: 하단 20mm는 "안전 구역"으로 남겨두세요. 꽉 채우려 하지 마세요.

---

## 16) 🆕 컴포넌트 라이브러리 활용

> `backend/src/library/components.md` 파일을 참조하여 미리 정의된 디자인 요소를 사용하세요.

### 🧩 주요 컴포넌트 (복사해서 사용)

#### 1. 개념 정의 박스 (Concept Box)
- **용도**: 새로운 용어 정의, 핵심 개념 설명
- **특징**: 파란색 테마, 아이콘 포함

#### 2. 핵심 요약 박스 (Key Takeaway)
- **용도**: 챕터 마무리 요약, 암기할 내용
- **특징**: 초록색 테마, 리스트 형태

#### 3. 주의 사항 박스 (Warning Box)
- **용도**: 자주 틀리는 문제, 함정 경고
- **특징**: 주황색/빨간색 테마, 경고 아이콘

#### 4. 비교 테이블 (Comparison Table)
- **용도**: 두 가지 개념 비교 (VS)
- **특징**: 좌우 대칭형 디자인

### 💡 사용 팁
- 직접 CSS를 작성하지 말고, 라이브러리의 HTML 구조와 클래스를 그대로 사용하세요.
- 일관된 디자인을 유지하는 가장 쉬운 방법입니다.