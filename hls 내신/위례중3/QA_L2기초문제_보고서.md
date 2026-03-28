# QA Report: L2 기초 문제 200제 Workbook

**파일**: `wb-m3-L2-basic.html`
**정답지**: `wb-m3-L2-basic-answers.html`
**검수일**: 2026-03-22
**검수 수준**: COMPREHENSIVE (High-Tier)

---

## 1. 요약

| 항목 | 결과 |
|------|------|
| 총 문제 수 | 200 |
| 힌트 누출 | 0건 (PASS) |
| 정답 오류 | 3건 (FAIL) |
| BAD 문제 (오류/모호) | 4건 |
| WEAK 문제 (너무 쉬움) | 12건 |
| 정답표 정렬 | PASS -- 섹션 레이블 및 번호 범위 모두 일치 |

**종합 판정: 수정 후 배포 가능 (CONDITIONAL PASS)**

수정 필수 사항 3건, 검토 권장 사항 4건 존재.

---

## 2. 힌트 누출 검사

### Section B (문맥 오류 찾기, 51-80 / 151-160)

**요구 사항**: 오류 단어에 bold(`<b>`) 처리가 되어 있으면 안 됨.
**결과**: PASS -- 51-80번 및 151-160번 모든 지문에서 오류 단어가 일반 텍스트(plain text)로 처리됨. `<b>` 태그 없음 확인.

### Section C (어법 오류 찾기, 81-110 / 161-170)

**요구 사항**: 오류 문장에 underline(`<u>`) 처리가 되어 있으면 안 됨.
**결과**: PASS -- 전체 파일에서 `<u>` 태그 0건. 오류 문장은 `<b>(번호)</b>`로만 표시되어 있으며 문장 자체에 밑줄 없음.

### Section A (이항 선택형)

정답 선택지에 대한 시각적 차별화 없음 (모두 동일한 bold 괄호 처리). PASS.

### Section E (본문 빈칸)

힌트가 초성 형태(`a v_______`)로 적절히 가려져 있음. PASS.

---

## 3. 정답 오류

### 3-1. [CRITICAL] #58: chance -> risk 정답이 부정확

- **문제 지문 (57-58)**: "...eating tomatoes can lower your **chance** of heart disease."
- **정답표**: `chance -> risk`
- **판단**: 원문은 "lower your **risk** of heart disease"이므로 `chance -> risk`는 맞음. 그러나 "lower your chance of heart disease"도 영어에서 자연스러운 표현이다. "chance"는 "가능성/확률"로 의미가 통하며, `lower one's chance of ~`은 실제로 사용되는 콜로케이션이다.
- **등급**: **BAD** -- 원문 대조 시 `risk`가 정답이 맞지만, 학생 입장에서 `chance`도 문맥상 자연스러워 논란 가능. "chance"를 좀 더 명백한 반의어(예: `increase`)로 변경하거나, 지시문에 "원문과 다른 단어"임을 명시할 것을 권장.

### 3-2. [CRITICAL] #85: 정답 설명 보완 필요

- **문제 (85)**: "Researchers say that the chemicals **making** tomatoes red **is** good for your heart and blood."
- **정답표**: `is -> are (the chemicals가 주어이므로 복수동사)`
- **판단**: 이 문장에는 오류가 **2개** 있다 -- (a) `making`은 원문의 `that make`에서 바뀐 것, (b) `is -> are`. 정답표는 `is -> are`만 요구하지만, `making`도 원문과 다르다.
- **등급**: **BAD** -- 오류가 2개인 문장에서 1개만 요구하면 혼동 유발. 지문에서 `making`을 원문대로 `that make`으로 복원하거나, 정답에 두 오류를 모두 명시할 것.

### 3-3. [WARNING] #94: 정답 설명의 문법 분석 부정확

- **문제 (94)**: "It helps your eyes to process light and **sending** a clear image to the brain."
- **정답표**: `sending -> send (help + O + process ... and send: 병렬 구조 V원형)`
- **판단**: 정답 `sending -> send` 자체는 맞음. 그러나 설명에서 "help + O + V원형"이라 하면서 지문에 `to process`가 들어있는 모순이 있다. `help + O + to V`도 허용되는 구문이므로 `to process`는 오류가 아님. 병렬 구조상 `to process ... and send`로 맞추는 것이 정확.
- **등급**: **WARN** -- 정답은 맞으나 설명이 `help + O + V원형`만 허용하는 것처럼 오독 가능. "help + O + (to) V에서 to process와 병렬로 send"라고 수정 권장.

---

## 4. BAD 문제 (오류/모호)

| # | 유형 | 문제 내용 | 사유 |
|---|------|----------|------|
| 58 | B 문맥 | `chance -> risk` | `chance`도 문맥상 자연스러움. 반의어가 아닌 유의어 교체라 학생이 오류로 인식하기 어려움. |
| 85 | C 어법 | `making` + `is` 이중 오류 | 한 문장에 오류 2개인데 1개만 정답 처리. 혼란 유발. |
| 94 | C 어법 | `to process ... and sending` | 정답 설명이 "help + O + V원형"이라 하면서 `to process`를 무시. 설명 모순. |
| 160 | B보충 | `causes -> prevents` | 지문: "causes you **from** feeling sick". `causes ... from`은 문맥 오류인 동시에 어법 오류(`cause`는 `from`과 안 씀). 문맥 오류 유형에 어법 오류가 혼재. |

---

## 5. WEAK 문제 (너무 쉬움/뻔함)

중3 기초 수준을 감안해도 다음 문제들은 선택지의 오답이 지나치게 비문법적이어서 변별력이 낮다.

| # | 유형 | 선택지 | 사유 |
|---|------|--------|------|
| 3 | A | healthy / healthily | `keeps our bodies healthily`가 직관적으로 부자연스러워 맹목 선택 가능 |
| 11 | A | have / has | `They both has`는 어떤 수준에서도 즉시 탈락 |
| 13 | A | red / redly | `redly`는 실존 단어가 아님 -- 사실상 답 1개 |
| 30 | A | healthy / healthily | #3과 동일 패턴 반복 |
| 33 | A | is / are | `Cutting onions are`는 명백히 비문 |
| 34 | A | cry / to cry | `makes you to cry`는 초급에서도 즉시 탈락 |
| 39 | A | let's / letting | `letting move on`은 비문. 변별력 없음 |
| 41 | A | strong / strongly | `strongly taste`는 불가능한 조합 |
| 44 | A | feeling / feel | #43과 거의 동일 문법 포인트 연속 출제 |
| 45 | A | throwing / to throw | #44와 연속 동일 구문 -- 3연속 prevent from V-ing |
| 143 | A보충 | is / are | `Each ... are`는 명백히 비문 |
| 148 | A보충 | Eating / Eat | `Eat a variety of foods is`는 명백히 비문 |

**의견**: 기초 문제로서 쉬운 문항 배치는 적절하나, 동일 문법 포인트의 연속 출제(#43-44-45)는 학습 효과를 저해할 수 있음. 문항 배치 순서 조정 권장.

---

## 6. 유형별 평가

### A. 이항 선택형 (1-50, 141-150) -- 60문항

**구성 분석**:
- that/what 구별: 12문항 (1, 5, 10, 12, 15, 21, 26, 36, 40, 42, 46, 47 + 141)
- which/that 구별: 5문항 (20, 27, 37, 145)
- 형용사/부사: 7문항 (3, 18, 23, 30, 41, 50, 149)
- 수일치: 6문항 (4, 8, 11, 16, 25, 33, 143)
- 동명사/분사: 5문항 (2, 14, 19, 32, 142, 148)
- help + V원형: 4문항 (22, 28, 29, 146)
- make + V원형: 3문항 (34, 38, 144)
- prevent from V-ing: 3문항 (43, 44, 45, 147)
- 명령문 원형: 5문항 (6, 9, 17, 31, 48, 150)
- 기타: 4문항 (7, 35, 39, 49)

**판정**: PASS
- 정답 전부 정확.
- that/what 문항이 12개로 편중됨. 다양한 문법 포인트 분산이 개선되면 좋겠으나, "기초 문제"로서 본문 핵심 문법 반복은 의도적인 것으로 판단.
- #43, #44, #45가 모두 `prevent from V-ing`로 3연속 출제 -- 중복감이 강함.

### B. 문맥 오류 찾기 (51-80, 151-160) -- 30문항

**구성 분석**:
- 반의어 교체(unhealthy/healthy, bad/good 등): 대부분
- 유의어 교체(chance/risk, enjoyable/fun): 2문항

**판정**: CONDITIONAL PASS
- #58 (`chance -> risk`) 문제는 수정 필요.
- 나머지는 반의어 교체가 명확하여 학생이 오류를 식별하기 용이.
- #72 (`enjoyable -> fun`)는 유의어 교체로 오히려 적절한 난이도. 좋은 문제.
- #79 (`differ from -> mirror`)도 본문 핵심 동사를 정확히 파악해야 하므로 좋은 문제.

### C. 어법 오류 찾기 (81-110, 161-170) -- 30문항

**구성 분석**:
- 계속적 용법 that -> which: 8문항 (82, 88, 91, 97, 103, 106, 168 + 추가)
- 수일치: 4문항 (81, 85, 93, 95, 102, 162, 170)
- help + V원형: 3문항 (89, 92, 94, 167)
- make + V원형: 2문항 (96, 169)
- prevent from V-ing: 3문항 (90, 99, 107)
- 전치사: 3문항 (86, 87, 101, 108)
- 접속사 that/what: 3문항 (161, 165)
- 기타: 4문항 (83, 84, 98, 100, 104, 105, 109, 110, 163, 164, 166)

**판정**: CONDITIONAL PASS
- #85: `making` + `is` 이중 오류 문제 수정 필요.
- #94: 설명 보완 필요.
- 계속적 용법 `, that -> , which` 문항이 8개로 지나치게 편중됨. 학생에게 "that이 보이면 which로" 단순 패턴 학습 유발 가능. 2-3개로 줄이고 다른 문법 포인트(예: 분사 구문, 비교급, 관계부사 등)로 대체 권장.

### D. 키워드 영작 (111-140, 171-180) -- 30문항

**판정**: PASS
- 본문 전문(30문장)에 대한 키워드 영작으로 빈칸 수와 키워드 수가 적절히 대응.
- 모범 답안(전문)도 정답표에 포함되어 있어 채점 기준 명확.
- 빈칸(`_______`) 개수가 모범 답안의 단어 수와 대응하는지 spot-check 완료 -- 전부 일치.

### E. 본문 빈칸 채우기 (181-200) -- 20문항

**판정**: PASS
- 힌트의 초성이 정답과 일치하는지 확인 완료.
- 181: `a v_______ of` -> "a variety of" -- MATCH
- 182: `are g_______ f_______` -> "are good for" -- MATCH
- 183-200: 전부 MATCH.
- 본문의 핵심 표현(look similar, hollow spaces, In addition, lower your risk, is divided into, preventing, process light, send a clear image, healthy eyes, make new healthy cells, comes to mind, prevents you from, For this reason, good for, are good for, Find as many as, a variety)을 골고루 출제.

---

## 7. 정답표 정렬 검사

| 정답표 섹션 | 범위 | 실제 문제 범위 | 일치 |
|------------|------|---------------|------|
| A. 이항 선택형 | 1-50 | 1-50 | O |
| B. 문맥 오류 찾기 | 51-80 | 51-80 | O |
| C. 어법 오류 찾기 | 81-110 | 81-110 | O |
| D. 키워드 영작 | 111-140 | 111-140 | O |
| D. 키워드 영작 모범답안 | 111-140 | -- | O |
| A 보충 | 141-150 | 141-150 | O |
| B 보충 | 151-160 | 151-160 | O |
| C 보충 | 161-170 | 161-170 | O |
| D 보충 | 171-180 | 171-180 | O |
| D 보충 모범답안 | 171-180 | -- | O |
| E. 본문 빈칸 | 181-200 | 181-200 | O |

모든 섹션 레이블, 번호 범위, 문항 수가 정확히 일치함.

---

## 8. 수정 지시 사항

### 필수 수정 (MUST FIX)

1. **#85 이중 오류 해소**: 지문 "the chemicals **making** tomatoes red **is** good"에서 `making`을 원문의 `that make`으로 복원. 이렇게 하면 오류가 `is -> are` 1개로 명확해짐.

2. **#58 모호성 해소**: 지문의 `chance`를 좀 더 명백한 반의어로 교체 (예: `increase your risk` -> `lower your risk`처럼, `raise`를 사용) 하거나, 해당 문항을 다른 단어 교체로 변경.

3. **#94 설명 수정**: 정답 설명을 `sending -> send (to process와 병렬 구조: help + O + to process ... and send)` 형태로 수정.

### 권장 수정 (SHOULD FIX)

4. **#160 유형 순수성**: `causes ... from`은 문맥 오류(의미)와 어법 오류(문법)가 혼재. 문맥 오류 유형 취지에 맞게 `causes -> prevents`만 바꾸면 나머지 문장(`prevents you from feeling sick`)이 문법적으로도 맞도록 지문 조정 권장.

5. **that/what, ,that->,which 편중 완화**: A섹션 that/what 12문항, C섹션 계속적 용법 8문항은 과도한 편중. 일부를 다른 문법 포인트로 대체 권장.

6. **#43-44-45 연속 중복**: `prevent from V-ing` 3연속은 중복. 최소 1문항을 다른 위치로 이동하거나 다른 문법 포인트로 교체 권장.

---

## 9. 최종 판정

**CONDITIONAL PASS -- 필수 수정 3건 반영 후 배포 가능**

힌트 누출 0건, 정답표 정렬 완벽, 대부분의 문항 품질 양호. 필수 수정 3건(#58 모호성, #85 이중 오류, #94 설명 오류)만 해소하면 학생 배포 가능 수준.
