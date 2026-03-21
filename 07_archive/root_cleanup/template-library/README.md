# template-library — 피드백지 템플릿 렌더링 시스템

Handlebars 기반 피드백지 템플릿 렌더링 시스템. 과목별 해설 형식에 맞는 템플릿을 JSON 데이터로 채워 HTML을 생성한다.

---

## 디렉토리 구조

```
template-library/
├── render.js                    ← CLI 렌더러 (진입점)
├── README.md
│
├── templates/                   ← 과목별 메인 템플릿
│   ├── feedback-reading.hbs     ← 독해 전용 (5단계 분석)
│   ├── feedback-grammar.hbs     ← 문법 (테마 단위)
│   ├── feedback-syntax.hbs      ← 구문독해
│   └── feedback-logic.hbs       ← 논리
│
├── partials/                    ← 재사용 컴포넌트
│   ├── header.hbs               ← 학생정보 + 학습요약
│   ├── problem-card.hbs         ← 틀린 문제 카드
│   ├── reading-passage.hbs      ← 독해 5단계 분석
│   ├── grammar-rule.hbs         ← 문법 규칙 박스
│   ├── wrong-analysis.hbs       ← 오답분석 + 학생답분석
│   ├── summary.hbs              ← 체크리스트 + 격려
│   └── footer.hbs               ← 날짜 푸터
│
├── css/
│   └── feedback.css             ← 파스텔 하늘색 디자인 시스템
│
└── examples/
    ├── reading-sample.json      ← 독해 입력 예시
    ├── grammar-sample.json      ← 문법 입력 예시
    └── syntax-sample.json       ← 구문독해 입력 예시
```

---

## 사용법

### render.js CLI

```bash
node template-library/render.js \
  --data 00_tutoring/오수민/output/260218/data.json \
  --template feedback-reading \
  --out 00_tutoring/오수민/output/260218/피드백지_260218.html

# 미리보기 (브라우저에서 바로 열기)
node template-library/render.js \
  --data data.json \
  --template feedback-grammar \
  --preview
```

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--data` | 입력 JSON 경로 | 필수 |
| `--template` | 템플릿 이름 (확장자 제외) | 필수 |
| `--out` | 출력 HTML 경로 | `./output.html` |
| `--preview` | 렌더링 후 브라우저 자동 오픈 | false |

---

## 입력 JSON 스키마

```json
{
  "student": {
    "name": "오수민",
    "date": "260218",
    "subject": "reading",
    "range": "영어영역 모의고사 Q19-20"
  },
  "summary": {
    "well_done": ["지문 흐름을 잘 파악함", "어휘 수준 양호"],
    "needs_work": ["빈칸 추론 시 전체 맥락 확인 필요", "선지 소거법 연습"]
  },
  "problems": [
    {
      "id": "Q19",
      "type": "reading",
      "number": 19,
      "student_answer": "③",
      "correct_answer": "①",
      "passage": { ... },
      "wrong_analysis": { ... }
    }
  ]
}
```

### 주요 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `student.name` | string | 학생 이름 |
| `student.date` | string | `YYMMDD` 형식 날짜 |
| `student.subject` | string | `reading` / `grammar` / `syntax` / `logic` |
| `student.range` | string | 학습 범위 (예: "문법 4강 4형식/5형식") |
| `summary.well_done` | string[] | 잘한 점 목록 |
| `summary.needs_work` | string[] | 아쉬운 점 목록 |
| `problems` | Problem[] | 틀린 문제 배열 |

---

## 과목별 템플릿 차이점

### feedback-reading.hbs — 독해

- **변형문제 없음**: 독해는 해설만 제공한다
- 각 문제마다 `reading-passage` 파셜을 사용해 **5단계 분석** 적용
- 본문(passage.text)에 `text-align: justify` 강제 적용
- 선지 분석은 전체 선지를 ✅/❌로 모두 표시

**5단계 구조**:
1. 한줄 요약
2. 전체 해석 (의역 중심)
3. 핵심 키워드 (핵심표현 / 정답 방향 / 반대 방향)
4. 구조 및 방향성 (POSITIVE/NEGATIVE 배지 + 구조 유형)
5. 선지 분석 (전 선지)

---

### feedback-grammar.hbs — 문법

- **테마 단위 묶음 해설**: 개별 문제가 아닌 공통 개념 중심
- 순서: 핵심 개념 → 판별법/비교표 → 예문 → 주의사항
- `grammar-rule` 파셜로 concept-box, grammar-block, tip-box, warning-box 렌더링
- **연습문제 20개** 자동 포함 (문제/정답 분리 페이지)

---

### feedback-syntax.hbs — 구문독해

- 문법 템플릿과 구조 유사하지만 `passage-box` 컴포넌트 사용
- 구문 분석 표시를 위한 `/` 슬래시 구분 지원
- 직독직해 영역 별도 렌더링

---

### feedback-logic.hbs — 논리

- 기본 구조 (논리 유형별 상세 형식은 추후 정의)
- `problem-card` 파셜 사용

---

## Partials 상세

### header.hbs
학습 요약 첫 페이지. 표지/목차 없이 바로 학습 내용 시작.

```
{{ student.name }} | {{ student.date }} | {{ student.range }}
잘한 점 / 아쉬운 점 요약 박스
```

### problem-card.hbs
틀린 문제 번호, 유형, 학생 답 vs 정답 표시 카드.

### reading-passage.hbs
독해 5단계 분석 전체를 렌더링하는 핵심 파셜.

```hbs
{{> reading-passage passage=problem.passage steps=problem.steps}}
```

### grammar-rule.hbs
문법/구문독해용 개념 설명 박스.

```hbs
{{> grammar-rule theme=theme concept=concept examples=examples}}
```

### wrong-analysis.hbs
오답분석 + 학생 답 분석 tip-box.

```hbs
{{> wrong-analysis
    student_answer=problem.student_answer
    reason=problem.wrong_analysis.reason
    pattern=problem.wrong_analysis.pattern
    tip=problem.wrong_analysis.tip}}
```

### summary.hbs
마지막 페이지. 다음 학습 체크리스트 + 격려 메시지.

### footer.hbs
페이지 하단 날짜 + "Vera's Document Studio" 서명.

---

## CSS 디자인 시스템

### 파스텔 하늘색 팔레트

```css
--color-primary:      #4A90D9;   /* 주요 제목 */
--color-primary-light:#E8F4FD;   /* 배경 틴트 */
--color-accent:       #87CEEB;   /* 파스텔 강조 */
--color-accent-dark:  #1E3A8A;   /* 핵심 용어 */
--color-secondary:    #F59E0B;   /* 포인트 강조 */
--color-concept-bg:   #F0F9FF;
--color-concept-border: #0EA5E9;
--color-example-bg:   #F7FEE7;
--color-example-border: #22C55E;
--color-warning-bg:   #FEF3C7;
--color-warning-border: #F59E0B;
```

> **금지**: `#1e3a5f`, `#2b6cb0`, `#3182ce` 사용 불가. 반드시 파스텔 팔레트 사용.

### 주요 컴포넌트 CSS 클래스

| 클래스 | 용도 |
|--------|------|
| `.concept-box` | 개념 설명 박스 (파란 테두리) |
| `.grammar-block` | 문법 규칙 박스 |
| `.tip-box` | 팁/학생답분석 박스 (노란 테두리) |
| `.warning-box` | 주의 박스 (주황 테두리) |
| `.passage-box` | 독해/구문 지문 박스 |
| `.highlight-key` | 핵심 용어 인라인 강조 |
| `.highlight-bg` | 배경색 강조 |
| `.highlight-eng` | 영어 표현 강조 |
| `.badge-positive` | POSITIVE 방향 배지 |
| `.badge-negative` | NEGATIVE 방향 배지 |

### 강조 규칙 (엄격 준수)

- 페이지당 강조 10개 이하
- 단락당 강조 2개 이하
- 문장당 강조 1개 이하
- 강조 없는 단락 60% 이상

---

## 예제: 독해 최소 JSON → HTML 생성

```json
{
  "student": {
    "name": "오수민",
    "date": "260218",
    "subject": "reading",
    "range": "영어영역 모의고사 Q19-20"
  },
  "summary": {
    "well_done": ["지문 흐름 파악 양호"],
    "needs_work": ["빈칸 추론 시 전체 맥락 확인"]
  },
  "problems": [
    {
      "id": "Q19",
      "type": "reading",
      "number": 19,
      "student_answer": "③",
      "correct_answer": "①",
      "steps": {
        "one_line": "숭고함은 압도적 자연 앞에서 느끼는 두려움과 경이가 공존하는 감정이다.",
        "translation": "...",
        "keywords": {
          "core": ["sublime", "awe", "overwhelm"],
          "positive": ["vastness", "grandeur"],
          "negative": ["fear", "smallness"]
        },
        "structure": {
          "type": "대조",
          "direction": "POSITIVE",
          "analysis": "..."
        },
        "options": [
          { "number": "①", "correct": true, "reason": "..." },
          { "number": "②", "correct": false, "reason": "..." }
        ]
      },
      "wrong_analysis": {
        "reason": "③번은 '두려움'만 강조해 선택했으나 지문은 경이와 공존을 말함",
        "pattern": "부분 정보 매칭",
        "tip": "빈칸 앞뒤 문장을 반드시 포함해 전체 흐름 확인"
      }
    }
  ]
}
```

```bash
node template-library/render.js \
  --data examples/reading-sample.json \
  --template feedback-reading \
  --out output.html \
  --preview
```

출력: `output.html` (브라우저 자동 오픈)

PDF 변환:
```bash
node 04_scripts/generate-study-pdf.js --input output.html --out 피드백지_260218.pdf
```
