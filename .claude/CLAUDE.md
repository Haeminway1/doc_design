# Vera's Document Studio

## 프로젝트 개요
편입영어 과외 운영에 필요한 모든 문서를 생산하는 통합 도구.
- **교재 제작**: 편입영어 교재 HTML/PDF (문법, 독해, 보카, 논리, 구문독해)
- **학습분석**: 학생이 틀린 문제 사진 → 해설 + 변형문제 생성
- **프린트 묶음**: 이미지 → A4 PDF 변환

---

## 폴더 구조

```
doc_design/
├── 00_tutoring/                 ← 👩‍🏫 학생 학습분석 (가장 자주 사용)
│   ├── {학생이름}/
│   │   ├── input/
│   │   │   └── YYMMDD/         ← 날짜별 사진 원본 (*.jpeg)
│   │   └── output/
│   │       └── YYMMDD/         ← 날짜별 산출물 (md, html, pdf)
│   └── ...
│
├── 01_print-bundle/             ← 🖨️ 프린트 묶음
│   ├── input/                   ← 이미지 넣는 곳
│   └── output/                  ← PDF 출력
│
├── 02_textbooks/                ← 📚 편입영어 교재
│   ├── source/                  ← 원본 HTML 17개 (마이그레이션 대기)
│   ├── schemas/                 ← JSON Schema (마이그레이션 시 추가)
│   ├── data/                    ← 정형 데이터 JSON (마이그레이션 시 추가)
│   ├── content/                 ← 자유 콘텐츠 HTML (마이그레이션 시 추가)
│   ├── books/                   ← 교재 매니페스트 YAML (마이그레이션 시 추가)
│   └── output/                  ← 빌드 산출물 (html/, pdf/)
│
├── 03_system/                   ← 🎨 공유 디자인 시스템
│   ├── base/                    ← 공통 CSS (reset, page-layout, print, utilities)
│   ├── components/              ← 컴포넌트 CSS (교재 마이그레이션 시 추가)
│   ├── templates/               ← 교재 템플릿 세트 (ocean-blue, royal-purple 등)
│   └── vera-core.css            ← 통합 import
│
├── 04_scripts/                  ← 🔧 공유 빌드 스크립트
│   ├── generate-feedback-from-json.js  ← ⭐ 핵심: feedback-data.json → HTML 생성
│   ├── generate-study-pdf.js    ← HTML → PDF 변환 (Puppeteer)
│   ├── extract-answer-key.js    ← 🔑 교재 데이터에서 정답 키 추출 (Step 2.5)
│   ├── validate-feedback.js     ← ✅ feedback-data.json 검증 (Step 3.5)
│   ├── feedback-schema.json     ← feedback-data.json 스키마 정의
│   ├── download-kakao-images.js ← 카톡채널 이미지 자동 다운로드
│   └── images-to-pdf.js         ← 이미지→PDF (프린트 묶음용)
│
├── 05_assets/                   ← 🖼️ 공유 에셋 (배경이미지, 폰트)
│
├── 06_reference/                ← 📋 가이드라인 문서 (읽기 전용)
│   ├── guideline/               ← 디자인 총칙, 기본 HTML 구조
│   ├── library/                 ← 컴포넌트 라이브러리, 하이라이트 가이드
│   ├── PDF_DESIGN_GUIDE.md      ← Puppeteer 주의사항
│   └── 편입영어_교재_리팩토링_분석보고서.md
│
├── 07_archive/                  ← 📦 보관함
└── package.json
```

---

## 워크플로우 1: 학습분석 (학생 피드백지 생성) ⭐ 2026-02-21 전면 개편

> **핵심 철학**: AI(Claude Code)는 JSON 콘텐츠(해설/데이터)만 생성. 디자인/HTML/CSS는 스크립트가 자동 조합. Claude Code가 HTML 짜는 것 절대 금지.

### 실행 방법 (Claude Code)
```bash
cd ~/projects/doc_design && claude --dangerously-skip-permissions --strict-mcp-config --mcp-config ./doc-design-mcp.json
```
- `--dangerously-skip-permissions`: 승인 창 없이 자동 진행 (필수, 없으면 타임아웃)
- `--strict-mcp-config`: stitch/chrome-devtools MCP 제외 (patternProperties 에러 방지)

---

### Step 1: 이미지 수집
```bash
node 04_scripts/download-kakao-images.js --student 학생명 --date YYMMDD
```
→ `00_tutoring/학생명/input/YYMMDD/` 에 저장

---

### Step 2: 정답 키 추출 (스크립트, 자동)
```bash
node 04_scripts/extract-answer-key.js --hint grammar/bridge/ch01 --range 1-20
```
- 교재 데이터(`02_textbooks/data/`)에서 정답 + 선지를 미리 추출
- AI가 정답을 추측하는 것을 원천 차단
- 독해 교재는 정답 데이터가 없을 수 있음 → `⚠️ 없음` 표시됨

**사용 가능한 hint 목록:**
| hint | 교재 | 데이터 유형 |
|------|------|-------------|
| `grammar/bridge/ch01~ch10` | 문법 Bridge | problems (정답 있음) |
| `grammar/advanced/ch01~ch04` | 문법 Advanced | problems (정답 있음) |
| `syntax/bridge/unit01~unit10` | 구문독해 Bridge | problems (정답 있음) |
| `syntax/basic/unit01~unit19` | 구문독해 Basic | problems (주관식, 구조분석+해석) |
| `syntax/basic/review-week1~week4` | 구문독해 Basic 마무리 | problems (주관식, 100문제씩) |
| `logic/basic/ch01~ch06` | 논리 Basic | problems (정답 있음) |
| `reading/bridge/part01~part06` | 독해 Bridge | passages (정답 없을 수 있음) |
| `reading/basic/part01~part06` | 독해 Basic | passages (정답 없을 수 있음) |
| `reading/intermediate/part01~part10` | 독해 Intermediate | passages (정답 없을 수 있음) |

---

### Step 3: 이미지 분석 (복돌이 sub-agent) — 분리된 역할
복돌이가 sub-agent 띄워서 이미지 분류 + **학생 답만** 추출:
- **FEEDBACK**: 학생 답안이 표시된 객관식 문제풀이지
- **EXCLUDE**: 단어테스트, 문법노트, 스케줄표 등

**핵심 원칙 (정확도 100% 달성을 위한 분리):**
1. **AI는 "학생이 뭘 골랐는지"만 읽는다** — 이미지에서 동그라미/체크/밑줄 표시 확인
2. **정답은 Step 2의 교재 데이터에서 가져온다** — AI가 정답을 추측하지 않음
3. **문제번호는 이미지에 보이는 실제 번호를 사용** — 임의 순차 번호(1,2,3...) 절대 금지
4. **존재하지 않는 문제 생성 금지** — 이미지에서 확인 안 되면 포함하지 않음

**출력 형식 (O/X 테이블):**
```
| Q#  | 학생답 | 정답(교재) | O/X |
|-----|--------|-----------|-----|
| Q1  | ③     | ④         | X   |
| Q2  | ①     | ①         | O   |
```
- 해민이가 최종 O/X 테이블 확인 & 보정 후 Step 4으로

**별표 포착**: 학생이 **설명서 부분에 별표** 친 경우 → `conceptQuestions` 항목으로 별도 포착

---

### Step 4: feedback-data.json 생성 (Claude Code)
확인된 오답 목록 기반으로 JSON 작성 + 스크립트 실행까지 한번에

**파일 위치**: `00_tutoring/학생명/input/YYMMDD/feedback-data.json`

**스키마**: `04_scripts/feedback-schema.json` 반드시 참조

**주요 필드**:
```json
{
  "student": "학생명",
  "date": "YYMMDD",
  "subject": "독해|문법|어휘|구문독해|논리",
  "textbook": "교재명",
  "range": "문제 범위",
  "textbookDataHint": "reading/intermediate/part07",
  "summary": {
    "totalQ": 20, "wrongQ": 3, "correctRate": "85%",
    "goodPoints": "...", "badPoints": "...", "priority": "...",
    "weakAreas": [{ "area": "...", "count": 1, "severity": "high|mid|low", "note": "..." }]
  },
  "wrongAnswers": [{
    "q": 258, "selected": "③", "correct": "②", "type": "문장 기능 파악",
    "passage": "지문 원문",
    "question": "질문",
    "choices": ["①...", "②...", "③...", "④...", "⑤..."],
    "explanation": "해설 HTML (concept-box, grammar-block, tip-box, answer-box, warning-box 활용)",
    "studentAnalysis": {
      "whyChosen": "오답 선택 이유 추측",
      "errorPattern": "사고 오류 패턴",
      "focusPoint": "집중 포인트"
    }
  }],
  "starredCorrect": [{ "q": "4-3", "selected": "④", "note": "정답이지만 별표" }],
  "conceptQuestions": [{
    "title": "개념명 (예: to부정사 형용사 용법)",
    "explanation": "개념 설명 HTML",
    "examples": ["예시 문장"],
    "exampleSentences": ["예문"],
    "confusionPoints": "헷갈리는 포인트 HTML",
    "practiceProblems": [
      { "sentence": "빈칸 문장", "choices": ["①...", "②..."], "answer": "②", "explanation": "해설" }
    ]
  }],
  "grammarTopics": [{ "title": "보충 주제", "content": "보충 HTML" }]
}
```

**교재 데이터 우선 활용**: `textbookDataHint` 지정 시 `02_textbooks/data/{hint}-passages.json`에서 지문/선지/정답 자동 조회 (이미지보다 더 정확)
- 교재 데이터 경로: `02_textbooks/data/reading/intermediate/part07-passages.json` 등
- 구조 파악 후 q 번호로 passage, choices, answer 조회

**해설 형식 (과목별)**:

#### 독해 해설 — 5단계 구조 (엄수)
1. **한줄 요약** (concept-box)
2. **전체 해석** (grammar-block, 양쪽 정렬)
3. **핵심 키워드 테이블** (Positive/Negative 방향)
4. **구조 및 방향성** (tip-box, 문장별 기능 분석표)
5. **선지 분석**: answer-box (정답) + warning-box × (오답 수)개

#### 문법/구문독해 해설
- 테마 단위로 묶기 (concept → 판별법/비교표 → 예문 → 주의사항)

#### conceptQuestions (설명서 별표 부분)
- 개념 설명 + 예시/예문 + 헷갈리는 포인트 + **연습문제 20개**

---

### Step 5: feedback-data.json 검증 (스크립트, 자동) ⭐ NEW
```bash
node 04_scripts/validate-feedback.js 학생명 YYMMDD
```
**검증 항목:**
- ❌ 문제번호가 교재에 없음 → 가짜 문제 검출
- ❌ correct 필드가 교재 정답과 불일치 → AI 정답 추측 오류
- ❌ selected === correct → 정답인데 오답 목록에 포함
- ❌ 중복 문제번호
- ⚠️ 선지 불일치, 필수 필드 누락, correctRate 계산 오류

**exit code 1이면 HTML 생성 금지** — 오류 수정 후 재검증

---

### Step 6: HTML 생성 (스크립트, 수초)
```bash
node 04_scripts/generate-feedback-from-json.js 학생명 YYMMDD
```
→ `00_tutoring/학생명/output/YYMMDD/피드백지_YYMMDD.html`

---

### Step 7: PDF 변환 (스크립트, 수초)
```bash
node 04_scripts/generate-study-pdf.js 학생명 YYMMDD
```
→ `00_tutoring/학생명/output/YYMMDD/피드백지_YYMMDD.pdf`

---

### Step 8: 구글 드라이브 업로드
```bash
gog drive upload 파일경로.pdf --parent 폴더ID --name 피드백지_YYMMDD.pdf --no-input
```
폴더 찾기: `gog drive search "학생명 학생" --json` → 피드백/피드백지 서브폴더 ID 확인

---

### 트래킹
`00_tutoring/tracking.json` — 학생별 날짜, 오답, 제작상태, PDF경로, 드라이브 업로드 여부 기록
- 출력: `00_tutoring/{학생이름}/output/YYMMDD/피드백지_YYMMDD.pdf`
- **피드백지 템플릿 필수 사용**: `03_system/templates/피드백지_template.html`의 CSS 복사
- **피드백지 가이드라인 준수**: `06_reference/guideline/feedback_guideline.md`
- **일관성 원칙**: 같은 학생 내에서는 항상 동일한 디자인 적용 (학생별로는 달라도 무방)

### 피드백지 핵심 규칙 (절대 준수)
- **표지 금지**: 어떤 경우에도 표지 페이지를 만들지 않는다
- **목차 금지**: 목차를 포함하지 않는다
- **첫 페이지 = 학습 요약**: 날짜, 학생명, 범위, 잘한 점/아쉬운 점 요약
- **"전문 추출" 금지**: "문제 리스트"로 표현
- **변형문제 20개씩**: 각 테마별 연습문제는 20개
- **문제/정답 분리**: 연습문제와 정답은 별도 페이지
- **파스텔 하늘색**: #1e3a5f, #2b6cb0, #3182ce 사용 금지 → 파스텔 하늘색 팔레트 사용
- **과목별 해설 형식 엄격 구분**: 문법은 문법, 구문독해는 구문독해, 독해는 독해, 논리는 논리 파트로 분리. 독해를 문법처럼 해설하거나, 문법을 독해처럼 해설하지 않는다
- **독해 해설 = 지문별 분석**: 독해 문제는 "추론 전략" 같은 추상적 설명 금지. 반드시 지문별 5단계 분석 (한줄요약→해석→핵심키워드→구조→선지분석)
- **문제별 페이지 분리**: 해설 파트에서 각 문제 해설은 반드시 새 페이지에서 시작. 스크립트(`generate-feedback-from-json.js`)가 자동 처리하므로 JSON에서는 신경 안 써도 됨

### "알아서 진행해" 모드
- **해민이 복돌이에게** "알아서 진행해" 명령 시, **중간 승인(Step 1, Step 3) 없이 Step 7까지 직행**
- 단, **Step 2(정답 키 추출)와 Step 5(validate-feedback.js)는 항상 실행** — 생략 불가
- validate 통과 실패 시 자동 수정 후 재검증 (최대 3회)

### 새 학생 추가 시
```bash
TODAY=$(date +%y%m%d)
mkdir -p 00_tutoring/{학생이름}/input/$TODAY
mkdir -p 00_tutoring/{학생이름}/output/$TODAY
# 사진을 00_tutoring/{학생이름}/input/$TODAY/ 에 넣기
```

---

## 워크플로우 2: 프린트 묶음 (이미지 → A4 PDF)

### 트리거 키워드
사용자가 아래 워딩을 사용하면 프린트묶음 기능을 실행:
- "프린트 묶어줘", "프린트 해줘", "PDF로 만들어", "묶어줘", "프린트묶음 해줘"

### 사용법
1. `01_print-bundle/input/` 폴더에 이미지 파일(png, jpg, jpeg, webp)을 넣는다
2. "프린트 묶어줘" 라고 말한다
3. `01_print-bundle/output/` 에 PDF가 생성된다

### 실행 방법
```bash
node 04_scripts/images-to-pdf.js
```

### 동작 규칙
- input 폴더의 이미지를 **파일명 순서대로** A4 PDF에 배치
- 각 이미지는 A4에 비율 유지하며 중앙 배치
- 출력 파일명: `프린트_YYYYMMDDHHMMSS.pdf` (타임스탬프)
- 지원 포맷: PNG, JPG, JPEG, WEBP

---

## 워크플로우 3: 편입영어 교재 (마이그레이션 대기)

현재 `02_textbooks/source/`에 원본 HTML 17개 파일이 보관되어 있음.
마이그레이션 계획은 `06_reference/편입영어_교재_리팩토링_분석보고서.md` 참조.

---

## 디자인 가이드라인

### 참조 파일 (피드백지 제작 시 반드시 참조)
- **피드백지 가이드라인**: `06_reference/guideline/feedback_guideline.md` (구조, 색상, 규칙 총정리)
- **피드백지 템플릿**: `03_system/templates/피드백지_template.html` (CSS + HTML 구조 레퍼런스)
- **디자인 총칙**: `06_reference/guideline/guideline.md` (A4 인쇄용 HTML 디자인 가이드 v2.1)
- **기본 HTML 구조**: `06_reference/guideline/basic_structure.html`
- **컴포넌트 라이브러리**: `06_reference/library/components.md`
- **하이라이트 가이드**: `06_reference/library/highlight_guideline.md`
- **PDF 변환 가이드**: `06_reference/PDF_DESIGN_GUIDE.md` (Puppeteer 관련 주의사항)
- **디자인 시스템 CSS**: `03_system/vera-core.css` (base + utilities)

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

#### 교재용 (assemble.js 빌드)
```
--color-accent-dark: #1E3A8A (제목, 핵심 용어)
--color-accent-secondary: #F59E0B (강조)
--color-concept-bg: #F0F9FF / --color-concept-border: #0EA5E9 (개념 박스)
--color-example-bg: #F7FEE7 / --color-example-border: #22C55E (예제 박스)
--color-warning-bg: #FEF3C7 / --color-warning-border: #F59E0B (주의 박스)
```

#### 피드백지용 (generate-feedback-from-json.js, 피드백지_template.html) — 2026-02-21 확정
```
Primary:        #3a8fa3  (밝은 청록 — 헤더, 타이틀, 주요 강조)
Primary Light:  #79c4b0  (연한 민트 — 서브 헤더, 배지)
Primary BG:     #eef8f6  (아주 연한 민트 — 카드 배경)

Accent Blue:    #4a9fd4  (하늘색 — 팁박스, 정보 강조)
Accent Red:     #d9706b  (부드러운 코랄 레드 — 오답, 경고)
Accent Green:   #52b389  (밝은 민트 그린 — 정답, 성공)

Text:           #2d3748 / Muted: #718096
Background:     #f7fafa
```
- answer-box: `#52b389` border + `#edfaf5` 배경
- warning-box: `#d9706b` border + `#fdf0ef` 배경
- tip-box: `#4a9fd4` border + 연한 하늘 배경
- concept-box: `#3a8fa3` border + `#eef8f6` 배경
- 디자인 미리보기: `03_system/templates/design-preview.html`

---

## 학생 목록

### 김종호 (완료)
- 폴더: `00_tutoring/김종호/`
- 내용: 동명사/현재분사, 사역동사, 감각동사, 1형식/2형식, 분사구문, 전치사 to + -ing
- 상태: 완료 (md, html, pdf 생성됨)

### 조근영 (진행 중)
- 폴더: `00_tutoring/조근영/`
- 사진: 13장 (input/ 폴더)
- 내용: Chapter 2 동사의 시제 (현재/과거/미래/완료 시제)
- 상태: Step 1 진행 중

### 오수민 (완료)
- 폴더: `00_tutoring/오수민/`
- 사진: 3장 (input/260218/)
- 내용: 영어영역 모의고사 — 어법(Q1-2), 어휘(Q3-4), 독해(Q19-20)
- 오답: 4문제 (Q1 분사/본동사, Q3 문맥어휘-나비효과, Q19 빈칸추론-숭고, Q20 순서배열-사피어워프)
- 상태: 완료 (html, pdf 생성됨)

### 김예은 (수정 필요)
- 폴더: `00_tutoring/김예은/`
- 사진: 25장 (input/260214/)
- 내용: 구문독해 4강 (4형식/5형식) + 독해 PART 1 지문 27, 40-60
- 오답: 구문독해 1문제 (4형식/5형식 혼동) + 독해 4문제 (지문 42-3, 48-3, 53-3, 27-3)
- 상태: md 작성됨, 독해 해설 형식 수정 필요 (문법식→지문별 분석으로)

---

## 기술 스택
- Node.js + Puppeteer (HTML → PDF 생성)
- Node.js + sharp + pdf-lib (이미지 → PDF 변환)
- HTML/CSS (A4 인쇄용 정적 페이지)
- 폰트: Noto Sans KR, Inter, Playfair Display

# currentDate
Today's date is 2026-02-21.
