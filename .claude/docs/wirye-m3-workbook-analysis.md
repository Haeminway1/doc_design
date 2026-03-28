# 위례중3 (Wirye-M3) 워크북 구조 분석
## 올림포스 워크북 템플릿으로 사용할 참고자료

작성일: 2026-03-25  
분석 대상: 위례중학교 3학년 능률(김) 교재 기반 워크북  
목표: 올림포스 신규 워크북 구조 설계

---

## 1. YAML 매니페스트 구조

### 1.1 기본 구조 (version 2)

```yaml
version: 2
book:
  id: wb-m3-L1-basic                    # 고유 식별자: wb-{단계}-L{레슨}-{타입}
  title: "위례중3 Lesson 1 기초 문제"      # 풀네임
  shortTitle: 능률(김) 중3 L1 기초 문제   # 짧은 제목
  author: Haemin English
  brand: Haemin English
  style: ne-textbook                    # 스타일 시스템 (ne-textbook = Nuri English)
  subject: grammar                      # 과목: grammar | reading
  level: basic                          # 수준: basic (중3 기초)

pages:
  - type: content
    src: school/wirye-m3-ne/{filename}.html
    pageClass: cover-page no-header-footer  # cover-page만 적용
  - type: content
    src: school/wirye-m3-ne/{filename}.html
    # pageClass 없으면 기본 스타일 적용
```

### 1.2 워크북 타입별 매니페스트 패턴

| 타입 | 파일명 | 페이지 수 | 구성 |
|------|--------|---------|------|
| **기초 문제** | wb-m3-L{N}-basic.yaml | 5페이지 | cover + exam4u-01 + exam4u-02 + supplement + answers |
| **문법 워크북** | wb-m3-L{N}-grammar.yaml | 4페이지 | cover + grammar-01 + grammar-02 + answers |
| **독해 워크북** | wb-m3-L{N}-reading.yaml | 4페이지 | cover + read-01 + read-02 + answers |

### 1.3 메니페스트 파일 위치

**위치:** `/mnt/d/projects/doc_design/02_textbooks/books/`

**파일명 규칙:**
- `wb-m3-L1-basic.yaml`
- `wb-m3-L1-grammar.yaml`
- `wb-m3-L1-reading.yaml`
- `wb-m3-L2-basic.yaml`
- `wb-m3-L2-grammar.yaml`
- `wb-m3-L2-reading.yaml`

---

## 2. HTML 콘텐츠 구조

### 2.1 커버 페이지 (Cover Page)

**파일 예시:** `wb-m3-L1-basic-cover.html`

```html
<div class="cover-top-section">
  <div class="cover-brand eng-text">HAEMIN ENGLISH</div>
</div>

<div class="cover-center-section">
  <div class="cover-accent-line"></div>
  <div class="cover-main-title eng-text">WORKBOOK</div>
  <div class="cover-subtitle">Lesson 1 기초 문제</div>
  <div class="cover-accent-line"></div>
  <div class="cover-chapter-info">A Life Full of Experiences · 200제</div>
</div>

<div class="cover-bottom-section">
  <div class="cover-edition">위례중 3학년 · 2026</div>
</div>
```

**구성 요소:**
1. **cover-top-section**: 브랜드명 (HAEMIN ENGLISH)
2. **cover-center-section**: 메인 정보
   - cover-main-title: "WORKBOOK" (고정)
   - cover-subtitle: 레슨 정보 (예: "Lesson 1 기초 문제")
   - cover-chapter-info: 교재명 + 문제 수 (예: "A Life Full of Experiences · 200제")
3. **cover-bottom-section**: 에디션 정보 (학년 · 연도)

**CSS 클래스:**
- `pageClass: cover-page no-header-footer` (메니페스트에 지정)

---

### 2.2 기초 문제 워크북 (Exam4u 스타일)

**파일 구조:** `wb-m3-L1-exam4u-01.html` / `wb-m3-L1-exam4u-02.html`

#### 구성 요소:

**1. 문제 유형별 섹션 (chapter-header)**

```html
<div class="chapter-header first-in-page">
  <span class="chapter-number">A</span>
  <span>이항 선택형</span>
</div>
```

**2. 각 문제 (passage-block 구조)**

```html
<div class="passage-block">
  <div class="passage-label">
    <span class="passage-badge eng-text">1</span>
    <small>어법 선택</small>
  </div>
  
  <div class="question-box">
    <p><b>Q.</b> 괄호 안에서 어법상 쓰임이 바른 것을 고르시오.</p>
    <div class="answer-choices">
      <p class="eng-text">① written</p>
      <p class="eng-text">② wrote</p>
      <!-- ... 5개 선택지 -->
    </div>
  </div>
</div>
```

#### 기초 문제 구성 (1-200 항목):

```
Part A: 이항 선택형 (1-50)
  - 문법 선택지 비교: have been V-ing vs to V, suggest + V-ing vs V원형 등
  - 형식: 괄호 [A / B], 5선택지 없음

Part B: 문맥 오류 찾기 (51-80)
  - 의미상 맞지 않는 단어 찾기
  - 예: "worsen" → "improve", "avoid" → "find"
  - 형식: 오류 번호 + (원문 → 수정어)

Part C: 어법 오류 찾기 (81-110)
  - 문법적 오류 식별
  - 예: "student learns" → "students learn" (수일치)
  - 형식: 오류 번호 + 오류 설명

Part D: 키워드 영작 (111-140)
  - 문장 전체를 영어로 제시
  - 학생이 한글 번역 또는 공백 채우기

Part E: 본문 빈칸 채우기 (141-160)
  - 원문에서 추출한 문장의 빈칸 채우기
  - (1) (2) 형식으로 여러 빈칸 가능
```

**exam4u-01.html vs exam4u-02.html:**
- exam4u-01: A(50) + B(30) = 80문제
- exam4u-02: 거울 구성 또는 추가 유형

---

### 2.3 문법 워크북 (Grammar)

**파일 구조:** `wb-m3-L1-grammar-01.html` / `wb-m3-L1-grammar-02.html`

#### 문법 문제 구성 (1-200 항목):

```
Part A: 빈칸 어법 (1-25)
  - 5지선다 객관식
  - 형식: passage-block + passage-badge(1-25) + 5선택지

Part B: 밑줄 어법 (26-45)
  - 밑줄 친 부분의 어법 판단 5선택지

Part C: 어법 판단 (46-60)
  - 맞다 틀렸다 판단

Part D: (A)(B) 조합 (61-70)
  - 두 부분을 각각 선택하여 조합

Part E: 올바른 문장 고르기 (71-80)
  - 4-5개 문장 제시, 문법적으로 올바른 것 선택

Part F: 대화문 어법 (81-90)
  - 대화 상황에서의 어법 선택

Part G: 문장 전환 (91-100)
  - 같은 의미로 표현 변환

Part H: 오류 찾아 고치기 (101-120)
  - 1문장 내 오류 1개 식별 후 수정

Part I: 오류 3개 찾아 고치기 (121-130)
  - 길이 긴 문장/단락 내 3개 오류 식별

Part J: 형태 변환 (131-145)
  - 주어진 동사의 올바른 형태 제시

Part K: 어순 배열 (146-160)
  - 흩어진 단어를 올바른 순서로 배열

Part L: 우리말 영작 (161-175)
  - 한글 문장을 영어로 번역

Part M: 문장 합치기 (176-190)
  - 두 문장을 관계대명사 등으로 합치기

Part N: 빈칸 어법 객관식 (191-200)
  - Part A 형식의 추가 문제
```

**특징:**
- 매우 다양한 문제 유형 (14가지)
- Part A-N으로 체계화
- 각 part별 문제 수 범위 지정
- 동일 문법 개념의 다각도 연습

---

### 2.4 독해 워크북 (Reading)

**파일 구조:** `wb-m3-L1-read-01.html` / `wb-m3-L1-read-02.html`

#### 독해 문제 구성 (1-100+ 항목):

```
Part A: 대의파악 (1-15)
  - 주제 (5개)
  - 요지 (5개)
  - 제목 (5개)
  
  형식:
  <div class="passage-block">
    <div class="passage-label">
      <span class="passage-badge eng-text">01</span>
      <small>주제</small>
    </div>
    <div class="passage-body">
      <p class="eng-text">[지문 텍스트]</p>
    </div>
    <div class="question-box">
      <p><b>Q.</b> [한글 질문]</p>
      <div class="answer-choices">
        <p>① [한글 선택지]</p>
        <!-- ... 5개 -->
      </div>
    </div>
  </div>

Part B: 빈칸추론 (16-35)
  - 문맥에서 빈칸 추론
  - 5지선다
  - 형식: passage-body 내 밑줄 표시 [_________]

Part C: (이후 파트는 추가 유형)
  - 어순 배열
  - 문장 삽입
  - 대응 관계
  등
```

**특징:**
- 실제 교과서 지문 활용
- Part A의 주제/요지/제목 분리
- 한글 선택지로 이해도 평가
- 지문은 relatively long (3-5문장)

---

### 2.5 정답 페이지 (Answer Key)

**파일 예시:** `wb-m3-L1-basic-answers.html`

#### 구조:

```html
<div class="chapter-header first-in-page">
  <span class="chapter-number">정답</span>
  <span>Lesson 1 기초 문제 워크북 정답표</span>
</div>

<!-- A. 이항 선택형 (1-50) -->
<div class="explanation-card">
  <div class="explanation-section summary-section">
    <div class="explanation-label">A. 이항 선택형 (1-50)</div>
    <table class="grammar-table compact-table">
      <tbody>
        <tr>
          <td>1. because of</td>
          <td>2. them</td>
          <!-- ... 50개 정답 -->
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- B. 문맥 오류 찾기 (51-80) -->
<div class="explanation-card">
  <div class="explanation-section analysis-section">
    <div class="explanation-label">B. 문맥 오류 찾기 (51-80)</div>
    <table class="grammar-table compact-table">
      <tbody>
        <tr>
          <td style="width:35px;">51.</td>
          <td class="eng-text">(1) boring → interesting (2) avoid → meet</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ... 계속 -->
```

#### 정답 섹션 구성:

**1. summary-section**: 간단한 정답 (1-2단어)
```html
<div class="explanation-label">A. 이항 선택형 (1-50)</div>
<table class="grammar-table compact-table">
  <!-- 5개씩 행으로 배열 -->
</table>
```

**2. analysis-section**: 상세 설명 (문법 규칙, 오류 수정)
```html
<div class="explanation-label">C. 어법 오류 찾기 (81-110)</div>
<table class="grammar-table compact-table">
  <tr>
    <td>101.</td>
    <td class="eng-text">have been knowing → have known (know는 상태동사로 진행형 불가)</td>
  </tr>
</table>
```

**부분 수정 시 표기:**
```
(1) requirement → requirements (가산명사 복수형)
(2) ways studying → ways to study (to부정사 형용사적 용법)
```

---

## 3. 문제 유형 분류 및 수량

### 3.1 기초 문제 워크북 (200제)

| 섹션 | 유형 | 수량 | 형식 |
|------|------|-----|------|
| A | 이항 선택형 | 50 | [선택지A / 선택지B] |
| B | 문맥 오류 찾기 | 30 | (1) 오류1 → 수정1 (2) 오류2 → 수정2 |
| C | 어법 오류 찾기 | 30 | (1) 오류 설명 |
| D | 키워드 영작 | 30 | 완전한 문장 제시 |
| E | 본문 빈칸 채우기 | 20 | (1) (2) 멀티플 빈칸 |
| A 보충 | 이항 선택형 | 10 | [선택지A / 선택지B] |
| B 보충 | 문맥 오류 찾기 | 10 | (1) (2) |
| C 보충 | 어법 오류 찾기 | 10 | 2개 오류 |
| D 보충 | 키워드 영작 | 10 | 문장 제시 |
| E | 본문 빈칸 채우기 | 20 | (1) (2) |

**총계:** 200제

### 3.2 문법 워크북 (200제)

| 섹션 | 유형 | 수량 | 형식 |
|------|------|-----|------|
| A | 빈칸 어법 | 25 | 5지선다 |
| B | 밑줄 어법 | 20 | 5지선다 |
| C | 어법 판단 | 15 | 5지선다 |
| D | (A)(B) 조합 | 10 | 이중 선택 |
| E | 올바른 문장 고르기 | 10 | 5지선다 |
| F | 대화문 어법 | 10 | 5지선다 |
| G | 문장 전환 | 10 | 5지선다 |
| H | 오류 찾아 고치기 | 20 | 1오류/문장 |
| I | 오류 3개 찾아 고치기 | 10 | 3오류/문장 |
| J | 형태 변환 | 15 | 빈칸 채우기 |
| K | 어순 배열 | 15 | 올바른 순서 작성 |
| L | 우리말 영작 | 15 | 한글→영어 번역 |
| M | 문장 합치기 | 15 | 관계대명사 등 사용 |
| N | 빈칸 어법 객관식 | 10 | 5지선다 |

**총계:** 200제

### 3.3 독해 워크북 (100제 + α)

| 섹션 | 유형 | 수량 |
|------|------|-----|
| A | 주제 | 5 |
| A | 요지 | 5 |
| A | 제목 | 5 |
| B | 빈칸추론 | 20 |
| C | 문장삽입/배열 | 15+ |
| D | 대응/상세 | 15+ |
| ... | 기타 | ... |

**특징:**
- 파트별로 유연하게 확장 가능
- 문제 수는 상대적으로 자유로움

---

## 4. 콘텐츠 파일 명명 규칙

### 4.1 파일명 패턴

```
wb-m3-L{레슨}-{타입}-{번호}.html

예시:
- wb-m3-L1-basic-cover.html          (커버)
- wb-m3-L1-exam4u-01.html            (기초 파트1)
- wb-m3-L1-exam4u-02.html            (기초 파트2)
- wb-m3-L1-basic-supplement.html     (기초 보충)
- wb-m3-L1-basic-answers.html        (기초 정답)
- wb-m3-L1-grammar-cover.html        (문법 커버)
- wb-m3-L1-grammar-01.html           (문법 파트1)
- wb-m3-L1-grammar-02.html           (문법 파트2)
- wb-m3-L1-grammar-answers.html      (문법 정답)
- wb-m3-L1-read-cover.html           (독해 커버)
- wb-m3-L1-read-01.html              (독해 파트1)
- wb-m3-L1-read-02.html              (독해 파트2)
- wb-m3-L1-read-answers.html         (독해 정답)
```

### 4.2 타입 약자

| 약자 | 의미 | 설명 |
|------|------|------|
| cover | 커버 페이지 | 제목, 브랜드, 에디션 |
| exam4u | 기초 문제 | 객관식 + 오류찾기 혼합 |
| basic-supplement | 보충 문제 | exam4u의 추가 연습 |
| answers | 정답 및 해설 | 정답표 + 상세 분석 |
| grammar | 문법 워크북 | 14가지 문법 문제 유형 |
| read | 독해 워크북 | 지문 기반 읽기 이해 |

---

## 5. CSS 클래스 및 HTML 구조

### 5.1 주요 CSS 클래스

```css
/* 커버 페이지 */
.cover-page
.no-header-footer
.cover-top-section
.cover-center-section
.cover-bottom-section
.cover-brand, .cover-main-title, .cover-subtitle
.cover-chapter-info, .cover-edition
.cover-accent-line

/* 컨텐츠 구조 */
.chapter-header
.chapter-number
.first-in-page

.passage-block
.passage-label
.passage-badge
.passage-body

.question-box
.answer-choices

/* 정답 테이블 */
.explanation-card
.explanation-section
.summary-section, .analysis-section
.explanation-label
.grammar-table
.compact-table

/* 텍스트 스타일 */
.eng-text (영어 폰트)
```

### 5.2 HTML 구조 패턴

**문제 블록:**
```html
<div class="passage-block">
  <div class="passage-label">
    <span class="passage-badge eng-text">1</span>
    <small>문제 유형</small>
  </div>
  <div class="passage-body">
    <!-- 지문/문맥 -->
  </div>
  <div class="question-box">
    <p><b>Q.</b> 질문</p>
    <div class="answer-choices">
      <!-- 5개 선택지 -->
    </div>
  </div>
</div>
```

**테이블 (정답):**
```html
<div class="explanation-card">
  <div class="explanation-section summary-section">
    <div class="explanation-label">A. 섹션명 (범위)</div>
    <table class="grammar-table compact-table">
      <tbody>
        <tr>
          <td>1.</td><td>정답1</td>
          <td>2.</td><td>정답2</td>
          <!-- 5개씩 -->
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 6. 페이지 분량 및 레이아웃

### 6.1 페이지 수 분포

**기초 문제 워크북:**
- 커버: 1페이지
- exam4u-01: ~2-3페이지 (80문제)
- exam4u-02: ~2-3페이지 (80문제)
- basic-supplement: ~1페이지 (40문제)
- 정답: ~1-2페이지

**총 약 7-10페이지**

**문법 워크북:**
- 커버: 1페이지
- grammar-01: ~3-4페이지 (100문제)
- grammar-02: ~3-4페이지 (100문제)
- 정답: ~2-3페이지

**총 약 9-12페이지**

**독해 워크북:**
- 커버: 1페이지
- read-01: ~2-3페이지 (50-60문제)
- read-02: ~2-3페이지 (40-50문제)
- 정답: ~1-2페이지

**총 약 6-9페이지**

### 6.2 문제당 높이 추정

| 문제 유형 | 높이 |
|---------|------|
| 이항 선택형 (1줄 지문) | 60-80px |
| 문맥 오류 (2-3줄 지문) | 100-120px |
| 어법 오류 (단문 + 설명) | 80-100px |
| 영작 (완전한 문장) | 40-50px |
| 제목/요지 (5선택지) | 100-120px |
| 정답 테이블 (5개/행) | 40-50px |

---

## 7. 레슨별 테마 및 콘텐츠

### 7.1 Lesson 1: "A Life Full of Experiences"

**주제:** 언어 학습의 다양한 방법과 동기 부여

**등장 인물:**
- Owen, Julie, Rohan, Inho (스페인어 학습자)
- Lori, Aishah, Brandon, Marisa (한국어/K-pop 애호가)

**주요 문법:**
- 현재완료진행형 (have been V-ing)
- 관계대명사 what vs that vs which
- suggest/recommend + V-ing
- try + V-ing vs try + to V
- help + O + V원형
- get used to + V-ing

**문제 구성:**
- 기초: 200제 (객관식 + 오류찾기 + 영작)
- 문법: 200제 (14가지 문제유형)
- 독해: 80-100제

### 7.2 Lesson 2: "Take Care of Yourself"

**주제:** 건강과 영양 (음식과 신체 부위의 연관성)

**주요 개념:**
- 토마토 ↔ 심장
- 호두 ↔ 뇌
- 당근 ↔ 눈
- 음식의 건강 효능

**주요 문법:**
- that vs what (명사절)
- that vs which (제한/계속적)
- 현재분사 vs 과거분사
- 주어-동사 수일치
- 형용사 vs 부사
- help + O + V vs V-ing
- make + O + 형용사
- prevent from V-ing

**문제 구성:** 기초/문법/독해 동일

---

## 8. 통합 워크북 구성 예시

만약 세 가지 워크북을 통합하면:

```yaml
version: 2
book:
  id: wb-m3-L1-complete
  title: "위례중3 Lesson 1 완성 워크북"
  shortTitle: 능률(김) 중3 L1 완성
  
pages:
  # 섹션 1: 기초 문제
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-basic-cover.html
    pageClass: cover-page no-header-footer
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-exam4u-01.html
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-exam4u-02.html
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-basic-supplement.html
  
  # 섹션 2: 문법 워크북
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-grammar-cover.html
    pageClass: cover-page no-header-footer
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-grammar-01.html
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-grammar-02.html
  
  # 섹션 3: 독해 워크북
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-read-cover.html
    pageClass: cover-page no-header-footer
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-read-01.html
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-read-02.html
  
  # 정답 (통합)
  - type: content
    src: school/wirye-m3-ne/wb-m3-L1-combined-answers.html
```

---

## 9. 올림포스 워크북 적용 가이드

### 9.1 구조 재사용 가능 요소

✅ **그대로 차용 가능:**
1. YAML 매니페스트 구조 (version 2)
2. 커버 페이지 레이아웃 (section 3개)
3. passage-block 기본 구조
4. question-box + answer-choices 구조
5. explanation-card 정답 구조
6. 문법 문제 유형 분류 (Part A-N)
7. 정답 테이블 포맷
8. CSS 클래스 시스템

✅ **수정 필요:**
1. 브랜드명 (HAEMIN ENGLISH → OLYMPOS)
2. 레슨 번호/제목 (위례중 Lesson → Olympos 커리큘럼)
3. 문제 콘텐츠 (교재 지문 → 올림포스 지문)
4. 문법 개념 (중3 기초 → Olympos 수준별)
5. 정답 수량 (필요에 따라 조정)

### 9.2 메니페스트 구조 예시 (Olympos)

```yaml
version: 2
book:
  id: wb-olympos-L1-basic
  title: "올림포스 Level 1 기초 문제"
  shortTitle: Olympos L1 기초
  author: Haemin English
  brand: Olympos
  style: ne-textbook
  subject: grammar
  level: basic

pages:
  - type: content
    src: school/olympos/wb-olympos-L1-basic-cover.html
    pageClass: cover-page no-header-footer
  - type: content
    src: school/olympos/wb-olympos-L1-exam4u-01.html
  - type: content
    src: school/olympos/wb-olympos-L1-exam4u-02.html
  - type: content
    src: school/olympos/wb-olympos-L1-basic-answers.html
```

---

## 10. 체크리스트

### 새 워크북 생성 시:

- [ ] YAML 매니페스트 작성
- [ ] 콘텐츠 HTML 파일 생성 (파일명 규칙 준수)
- [ ] 커버 페이지 3섹션 구성 (top/center/bottom)
- [ ] 문제별 passage-block 구조 적용
- [ ] 각 파트별 chapter-header 삽입
- [ ] 정답 페이지 explanation-card 구조
- [ ] CSS 클래스 (eng-text, summary-section 등) 적용
- [ ] 페이지 분량 확인 (약 7-12페이지)
- [ ] 메니페스트 pages 배열 순서 확인
- [ ] 파일명 중복 확인

---

**문서 완성:** 2026-03-25  
**대상:** Olympos 워크북 신규 개발팀

