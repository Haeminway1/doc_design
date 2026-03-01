# automation — 베라쌤 학생 관리 자동화 시스템

피드백지 자동 생성, 카카오톡 자동 응답, 일일 보고 생성을 담당하는 파이프라인 모음.

> **기본값: 비활성화 상태.** 모든 스크립트는 `--dry-run`이 기본 동작이며, 실제 외부 API 호출 및 파일 전송은 `--live` 모드에서만 실행된다.

---

## 아키텍처

```
[피드백지 생성 파이프라인]

카카오톡 사진
    │
    ▼
01-poller.js          새 이미지 감지 (00_tutoring/{학생}/input/)
    │
    ▼
02-classifier.js      Vision AI 분류
    │                 FEEDBACK_WORTHY / STUDY_PROOF / VOCAB_TEST / OTHER
    ▼
03-extractor.js       GPT-4o 문제 추출 (틀린 문제 + 별표 문제)
    │
    ▼
04-feedback-generator.js   Claude 피드백 생성 (과목별 해설 + 학생답분석)
    │
    ▼
05-renderer.js        Handlebars → HTML → PDF (template-library 사용)
    │
    ▼
06-uploader.js        구글 드라이브 업로드
    │
    ▼
구글 드라이브 / 학생 공유 폴더


[자동응답 파이프라인]

카카오톡 메시지
    │
    ▼
02-classifier.js      메시지 분류
    │                 ALWAYS_REPLY / ASK_HAEMIN / LOG_ONLY
    ▼
vera-responder.js     베라쌤 페르소나로 응답 생성 (Claude)
    │
    ▼
sender.js             카카오톡 발송
    │
    ▼
카카오톡
```

---

## 안전 장치 (중요)

### ACTIVE 플래그

`automation/config.js`의 `ACTIVE` 값이 **기본값 `false`**이다. 이 값이 `false`인 한 어떤 외부 전송도 일어나지 않는다.

```js
// config.js
module.exports = {
  ACTIVE: false,   // ← 해민님이 직접 true로 변경해야 활성화됨
  DRY_RUN_DEFAULT: true,
  ...
};
```

### --dry-run이 기본 동작

`--live` 플래그 없이 실행하면 항상 dry-run이다. dry-run에서는:
- 모든 파이프라인 로직이 정상 실행됨
- 파일 생성, JSON 저장은 수행됨
- **외부 전송 없음**: 카카오톡 발송, 구글 드라이브 업로드 스킵
- 콘솔에 `[DRY-RUN]` 접두어로 스킵된 작업 출력

### --live 모드 확인 절차

`--live` 플래그를 사용하면 스크립트가 중단하고 확인을 요청한다:

```
실제 외부 API를 호출합니다. 계속하려면 'LIVE'를 입력하세요:
> LIVE
```

`LIVE`를 정확히 입력해야만 진행된다. 오타 입력 시 중단.

### API 키 미설정 시 Graceful Degradation

환경변수가 없으면 해당 단계를 건너뛰고 경고만 출력한다:

```
[WARN] OPENAI_API_KEY 미설정 → 03-extractor.js 스킵, 이전 결과 재사용
[WARN] ANTHROPIC_API_KEY 미설정 → 04-feedback-generator.js 스킵
```

파이프라인 전체가 중단되지 않는다.

---

## 설정

`automation/config.js` 주요 설정값:

```js
module.exports = {
  // 활성화 여부 (기본 false — 해민님이 직접 변경)
  ACTIVE: false,

  // 감시 경로
  INPUT_BASE: '00_tutoring',          // 학생 사진 베이스 경로
  OUTPUT_BASE: '00_tutoring',         // 피드백지 출력 베이스 경로

  // 분류 임계값
  CLASSIFIER: {
    FEEDBACK_WORTHY_THRESHOLD: 0.7,   // 피드백 생성 기준 신뢰도
    BATCH_COOLDOWN_MS: 5000,          // 이미지 배치 대기 시간
  },

  // 피드백 생성
  FEEDBACK: {
    MODEL: 'claude-opus-4-6',         // 피드백 생성 모델
    MAX_PROBLEMS_PER_RUN: 10,         // 회당 최대 처리 문제 수
  },

  // 자동응답
  AUTO_REPLY: {
    PERSONA: 'vera',                  // 베라쌤 페르소나
    MAX_RESPONSE_LENGTH: 200,         // 응답 최대 글자수
    ALWAYS_REPLY_KEYWORDS: [          // 무조건 응답하는 키워드
      '숙제', '언제', '다음 수업', '질문'
    ],
  },

  // 보고
  REPORT: {
    SCHEDULE: '0 22 * * *',          // 매일 밤 10시 (cron)
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL,
  },
};
```

---

## 환경변수

`.env` 파일 또는 쉘 환경에 설정:

```bash
# Claude (피드백 생성, 자동응답)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI GPT-4o (문제 추출, 이미지 분류)
OPENAI_API_KEY=sk-...

# 구글 드라이브 업로드 (선택)
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
GOOGLE_DRIVE_FOLDER_ID=1ABC...

# 디스코드 보고
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

미설정 항목은 해당 단계가 스킵되며 파이프라인은 계속된다.

---

## 사용법

### 피드백 파이프라인 (전체)

```bash
# dry-run (기본) — 특정 학생, 특정 날짜
node automation/run.js --dry-run --task feedback --student 오수민 --date 260218

# dry-run — 모든 미처리 학생
node automation/run.js --dry-run --task feedback

# 실제 실행 (LIVE 확인 필요)
node automation/run.js --live --task feedback --student 오수민 --date 260218
```

### 자동응답 파이프라인

```bash
# dry-run — 새 메시지 확인 및 응답 시뮬레이션
node automation/run.js --dry-run --task reply

# 실제 발송
node automation/run.js --live --task reply
```

### 일일 보고

```bash
# dry-run — 보고 내용 콘솔 출력
node automation/run.js --dry-run --task report

# 실제 디스코드 전송
node automation/run.js --live --task report
```

### 각 파이프라인 스크립트 독립 실행

개별 단계만 실행하거나 디버깅할 때:

```bash
# 새 이미지 감지만
node automation/01-poller.js --student 오수민 --date 260218

# 분류만 (이미 감지된 이미지 대상)
node automation/02-classifier.js --input 00_tutoring/오수민/input/260218/

# 문제 추출만
node automation/03-extractor.js --classified output/classified.json

# 피드백 생성만
node automation/04-feedback-generator.js --problems output/problems.json --student 오수민

# HTML/PDF 렌더링만
node automation/05-renderer.js --data output/feedback.json --student 오수민 --date 260218

# 드라이브 업로드만
node automation/06-uploader.js --pdf output/피드백지_260218.pdf --student 오수민
```

---

## 파이프라인 상세

### 01-poller.js — 새 이미지 감지

`00_tutoring/{학생}/input/YYMMDD/` 폴더를 감시해 처리되지 않은 이미지를 탐지한다.

- 처리 완료 여부: `.processed` 마커 파일로 추적
- 지원 포맷: `*.jpeg`, `*.jpg`, `*.png`
- 출력: `automation/state/{학생}_{날짜}_images.json`

```bash
node automation/01-poller.js --all          # 모든 학생 전체 스캔
node automation/01-poller.js --student 조근영
```

---

### 02-classifier.js — Vision AI 분류

각 이미지를 GPT-4o Vision으로 분류한다.

| 분류 | 설명 |
|------|------|
| `FEEDBACK_WORTHY` | 틀린 문제 사진 → 피드백 생성 대상 |
| `STUDY_PROOF` | 공부 인증 사진 (문제집 펼친 사진 등) |
| `VOCAB_TEST` | 단어시험지 |
| `OTHER` | 분류 불가 / 무관한 사진 |

메시지 분류 (자동응답용):

| 분류 | 처리 |
|------|------|
| `ALWAYS_REPLY` | 베라쌤이 즉시 응답 |
| `ASK_HAEMIN` | 해민에게 디스코드 알림 후 대기 |
| `LOG_ONLY` | 기록만 하고 무응답 |

---

### 03-extractor.js — 문제 추출

`FEEDBACK_WORTHY`로 분류된 이미지에서 GPT-4o로 틀린 문제를 추출한다.

- **별표 친 문제** 및 **체크/X 표시된 문제** 자동 인식
- 추출 결과를 표로 정리해 `automation/state/{학생}_{날짜}_problems.json` 저장
- 디스코드로 해민에게 확인 요청 (ACTIVE: true일 때)

출력 형식:
```json
{
  "student": "오수민",
  "date": "260218",
  "problems": [
    { "number": 19, "subject": "reading", "location": "Q19", "note": "별표" },
    { "number": 20, "subject": "reading", "location": "Q20" }
  ]
}
```

---

### 04-feedback-generator.js — 피드백 생성

Claude (claude-opus-4-6)로 과목별 해설을 생성한다.

**과목 자동 감지 → 형식 분기:**

- `reading` → 지문별 5단계 분석 (변형문제 없음)
- `grammar` → 테마 단위 묶음 해설 + 연습문제 20개
- `syntax` → 구문독해 형식 (passage-box) + 연습문제 20개
- `logic` → 기본 해설 구조

모든 과목 공통: 틀린 문제마다 **학생 답 분석** (tip-box) 포함.

출력: `00_tutoring/{학생}/output/{날짜}/피드백지_{날짜}.md`

---

### 05-renderer.js — HTML/PDF 렌더링

`template-library/render.js`를 호출해 Handlebars 템플릿으로 HTML을 생성하고, Puppeteer로 PDF를 변환한다.

```
피드백지_{날짜}.md → (파싱) → feedback.json
                                   ↓
                    template-library/render.js
                                   ↓
                    00_tutoring/{학생}/output/{날짜}/피드백지_{날짜}.html
                                   ↓
                    04_scripts/generate-study-pdf.js
                                   ↓
                    00_tutoring/{학생}/output/{날짜}/피드백지_{날짜}.pdf
```

PDF 핵심 규칙:
- 솔리드 컬러 (gradient, box-shadow 금지)
- A4: 210mm × 297mm
- `page-break-inside: avoid` 테이블/박스에 적용

---

### 06-uploader.js — 구글 드라이브 업로드

생성된 PDF를 학생별 구글 드라이브 공유 폴더에 업로드한다.

- 서비스 계정 인증 (`GOOGLE_SERVICE_ACCOUNT_JSON`)
- 학생별 폴더 자동 생성 (없으면 신규 생성)
- 업로드 완료 후 공유 링크 디스코드 전송
- `GOOGLE_DRIVE_FOLDER_ID` 미설정 시 스킵

---

## 자동응답 시스템

### 분류 규칙

| 규칙 | 조건 | 처리 |
|------|------|------|
| `ALWAYS_REPLY` | 숙제, 언제, 다음 수업, 질문, 감사 | 베라쌤이 즉시 응답 |
| `ASK_HAEMIN` | 수업 일정 변경, 비용, 환불 | 해민에게 디스코드 알림 |
| `LOG_ONLY` | 단순 이모지, 확인 메시지, 분류 불가 | 기록만 |

### 베라쌤 페르소나 규칙

Claude가 응답을 생성할 때 적용되는 규칙:

- 따뜻하고 격려하는 톤. 학생 이름 호칭.
- 응답 최대 200자. 길면 핵심만.
- 이모지 1-2개 허용 (과도한 사용 금지)
- 수업 관련 구체적 일정/금액은 절대 확정 발언 안 함 → "해민 선생님께 확인해볼게요 :)" 로 전환
- 공부 인증 사진에는 칭찬 + 간단한 응원 메시지

---

## 일일 보고 생성

매일 밤 10시 (설정 가능) 다음 내용을 디스코드로 전송:

```
[일일 보고] 2026-02-18

학생별 현황:
- 오수민: 피드백지 생성 완료 ✅ (Q19-20, 2문제)
- 조근영: 처리 대기 중 ⏳ (사진 13장 미분류)
- 김예은: 수정 필요 ⚠️

총 처리: 2건 완료 / 1건 대기 / 1건 수정
```

```bash
# 보고 내용 미리보기
node automation/run.js --dry-run --task report

# 수동 즉시 전송
node automation/run.js --live --task report --now
```

---

## 활성화 방법

1. `automation/config.js` 열기
2. `ACTIVE: false` → `ACTIVE: true` 로 변경
3. `.env` 파일에 필요한 API 키 설정
4. dry-run으로 동작 확인:
   ```bash
   node automation/run.js --dry-run --task feedback --student 테스트학생
   ```
5. 문제 없으면 `--live` 모드로 실행:
   ```bash
   node automation/run.js --live --task feedback --student 테스트학생
   ```

> 새 학생 추가는 `00_tutoring/{학생이름}/input/YYMMDD/` 폴더 생성 후 사진을 넣으면 poller가 자동 감지한다.
