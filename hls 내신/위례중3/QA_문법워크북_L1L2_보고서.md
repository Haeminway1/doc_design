# QA 보고서: 위례중3 문법 워크북 (Lesson 1 & Lesson 2)

**검수일**: 2026-03-22
**검수자**: QA Specialist (High-Tier Comprehensive Audit)
**대상 파일**:
- `wb-m3-L1-grammar.html` (Lesson 1 문법 워크북, 200문항)
- `wb-m3-L2-grammar.html` (Lesson 2 문법 워크북, 200문항)
- `wb-m3-L1-grammar-answers.html` (L1 정답표)
- `wb-m3-L2-grammar-answers.html` (L2 정답표)

---

## Lesson 1 요약

| 섹션 | 워크북 번호 범위 | 문항 수 | 유형 |
|------|-----------------|---------|------|
| A. 빈칸 어법 | 1-25 | 25 | 객관식 |
| B. 밑줄 어법 | 26-45 | 20 | 객관식 |
| C. 어법 판단 | 46-60 | 15 | 객관식 |
| D. (A)(B) 조합 | 61-70 | 10 | 객관식 |
| E. 올바른 문장 고르기 | 71-80 | 10 | 객관식 |
| F. 대화문 어법 | 81-90 | 10 | 객관식 |
| G. 문장 전환 | 91-100 | 10 | 객관식 |
| H. 오류 찾아 고치기 | 101-120 | 20 | 서술형 |
| I. 오류 3개 찾아 고치기 | 121-130 | 10 | 서술형 |
| J. 형태 변환 | 131-145 | 15 | 서술형 |
| K. 어순 배열 | 146-160 | 15 | 서술형 |
| L. 우리말 영작 | 161-175 | 15 | 서술형 |
| M. 문장 합치기 | 176-190 | 15 | 서술형 |
| N. 빈칸 어법 | 191-200 | 10 | 객관식 |
| **합계** | | **200** | |

**문법 포인트**: 현재완료진행형(have been V-ing), 관계대명사 what, suggest/recommend + V-ing, help + O + V원형, 동명사 주어 + 단수동사, 지각동사 see + O + V원형, try + V-ing vs to V, get used to + V-ing, for vs since

---

## Lesson 1 이슈

### CRITICAL-L1-01: 정답표 번호가 워크북 문항 번호와 불일치

**심각도: CRITICAL (전면 수정 필요)**

정답표(내장 + 별도 파일 모두)의 섹션 번호가 워크북 실제 문항 번호와 완전히 어긋남.

| 섹션 | 정답표 번호 범위 | 워크북 실제 번호 | 차이 |
|------|-----------------|-----------------|------|
| A. 빈칸 어법 | 1-20 (20문항) | 1-25 (25문항) | 정답표 5문항 부족 |
| B. 밑줄 어법 | 21-35 (15문항) | 26-45 (20문항) | 번호 5 차이 + 5문항 부족 |
| C. 어법 판단 | 36-50 (15문항) | 46-60 (15문항) | 번호 10 차이 |
| D. 문장 전환 | 51-60 (10문항) | 61-70 (10문항) | 섹션 유형 불일치 (D=조합 vs D=전환) |
| E. (A)(B) 조합 | 61-75 (15문항) | 71-80 (10문항) | 섹션 유형 불일치 |
| F. 대화문 어법 | 76-85 (10문항) | 81-90 (10문항) | 번호 5 차이 |
| G. 올바른 문장 | 86-100 (15문항) | 91-100 (10문항) | 섹션 유형 불일치 |
| H-N | 101-200 | 101-200 | 번호 일치 |

**핵심 문제**:
1. 정답표 A섹션은 20문항이지만 워크북 A섹션은 25문항 -- 정답 5개 누락
2. B섹션부터 G섹션까지 번호가 5~10씩 밀려 있음
3. D-G섹션은 섹션 유형명 자체가 불일치 (정답표의 D=문장 전환이지만 워크북의 D=(A)(B) 조합)
4. H섹션(101번)부터는 번호가 일치함

### CRITICAL-L1-02: 정답표의 객관식 답 번호가 실제 정답과 불일치

**심각도: CRITICAL (정답 전면 재생성 필요)**

A섹션 25문항을 전수 풀이한 결과, 정답표의 답 번호가 실제 정답과 대부분 불일치.

| 문항 | 정답표 답 | 실제 정답 | 판정 |
|------|----------|----------|------|
| Q1 (has been ___ write) | ② | ③ writing | WRONG |
| Q2 (___ I learned) | ③ | ④ What | WRONG |
| Q3 (suggests ___) | ④ | ② watching | WRONG |
| Q4 (help you ___) | ⑤ | ⑤ learn | OK |
| Q5 (___ languages ___ your brain) | ④ | ① Practicing-makes | WRONG |
| Q6 (has been ___ watch) | ⑤ | ③ watching | WRONG |
| Q7 (didn't understand ___) | ① | ② what | WRONG |
| Q8 (___ know Owen since) | ① | ④ have known | WRONG |
| Q9 (recommends ___) | ④ | ① watching | WRONG |
| Q10 (see band ___ on stage) | ⑤ | ⑤ perform | OK |
| Q11 (try ___) | ② | ② watching | OK |
| Q12 (get used to ___) | ③ | ④ hearing | WRONG |
| Q13 (have been ___ translate) | ② | ③ translating | WRONG |
| Q14 (is ___ Inho thinks) | ③ | ⑤ what | WRONG |
| Q15 (Why don't you ___) | ④ | ① try | WRONG |
| Q16 (___ 2024) | ① | ④ since | WRONG |
| Q17 (___ belong to) | ② | ② has belonged | OK |
| Q18 (help you ___) | ⑤ | ③ get used to | WRONG |
| Q19 (Doing these things ___) | ② | ⑤ is | WRONG |
| Q20 (Find ___) | ③ | ① what | WRONG |

**결과: 20문항 중 4문항만 일치 (정답률 20%)** -- 정답표가 사실상 사용 불가 수준.

> 추정 원인: 정답표가 이전 버전의 보기 순서 또는 다른 보기 세트로부터 생성된 후, 문제의 보기가 재생성/재배열되었으나 정답표가 업데이트되지 않음.

### MODERATE-L1-03: Q108 (try to eat → try eating) 논란 가능성

**심각도: MODERATE**

Q108 문장: "Why don't you try to eat Korean food? It's really delicious."
정답: try to eat → try eating (시험 삼아 해 보다)

"Why don't you try to eat"에서 try to eat가 "노력하다"가 아니라 "시험삼아 먹어보다"로 해석되어야 하므로 try eating이 맞다는 것이 출제 의도이나, 문맥상 "try to eat" (먹어보려고 노력하다)도 자연스러운 해석이 가능. 시험에서 이의 제기 가능성 있음.

### MODERATE-L1-04: Q116 (try to push → try pushing) 논란 가능성

**심각도: MODERATE**

Q116 문장: "If the door doesn't open, try to push it harder."
정답: try to push → try pushing

"시험 삼아 밀어보다" 의미이므로 try pushing이 맞지만, "더 세게 밀어보려고 노력하다"로도 해석 가능. 단, 문맥이 "문이 안 열리면"이므로 "방법을 바꿔서 시도해보다"가 더 자연스러워 try pushing이 적절.

### WEAK-L1-05: B섹션 밑줄 범위 문제 (Q40)

**심각도: WEAK**

Q40: "③singing Korean songs help" 전체가 하나의 밑줄로 처리됨. 실제 오류는 "help"이 단수동사 "helps"가 되어야 하는 것인데, 밑줄이 주어구+동사 전체를 포함하여 오류 지점이 불명확. 다만 ③ 전체로 보면 "singing Korean songs help"를 "singing Korean songs helps"로 바꾸면 되므로 답 자체는 성립.

### INFO-L1-06: 문항 품질 전반 양호

문법 포인트 배분이 고르고, 같은 문법 사항을 다양한 유형(빈칸, 밑줄, 판단, 전환, 서술형)으로 반복 출제하여 학습 효과가 높음. 서술형 문항(H-N)의 난이도 배분도 적절. 힌트 유출(볼드, 밑줄 등으로 답 노출)은 발견되지 않음.

---

## Lesson 2 요약

| 섹션 | 워크북 번호 범위 | 문항 수 | 유형 |
|------|-----------------|---------|------|
| A. 빈칸 어법 | 1-25 | 25 | 객관식 |
| B. 밑줄 어법 | 26-45 | 20 | 객관식 |
| C. 어법 판단 | 46-60 | 15 | 객관식 |
| D. (A)(B) 조합 | 61-70 | 10 | 객관식 |
| E. 올바른 문장 고르기 | 71-80 | 10 | 객관식 |
| F. 대화문 어법 | 81-90 | 10 | 객관식 |
| G. 문장 전환 | 91-100 | 10 | 객관식 |
| H. 오류 찾아 고치기 | 101-120 | 20 | 서술형 |
| I. 오류 3개 찾아 고치기 | 121-130 | 10 | 서술형 |
| J. 형태 변환 | 131-145 | 15 | 서술형 |
| K. 어순 배열 | 146-160 | 15 | 서술형 |
| L. 우리말 영작 | 161-175 | 15 | 서술형 |
| M. 문장 합치기 | 176-190 | 15 | 서술형 |
| N. 빈칸 어법 | 191-200 | 10 | 객관식 |
| **합계** | | **200** | |

**문법 포인트**: 관계대명사 which 계속적 용법, 현재분사 형용사적 용법, prevent~from V-ing, make+O+V원형/adj, help+O+V원형, 동명사 주어+단수동사, not only A but also B, compare A with B, be divided into, be good for, -ing/-ed 감정형용사

---

## Lesson 2 이슈

### CRITICAL-L2-01: 정답표의 객관식 답 번호가 실제 정답과 불일치

**심각도: CRITICAL (정답 전면 재생성 필요)**

L2도 L1과 동일한 문제 발생. A섹션 첫 10문항 전수 풀이 결과:

| 문항 | 정답표 답 | 실제 정답 | 판정 |
|------|----------|----------|------|
| Q1 (lycopene, ___ is good) | ③ who | ⑤ which | WRONG |
| Q2 (A diet ___ a variety) | ④ contained | ① containing | WRONG |
| Q3 (prevent you ___ getting) | ④ of | ② from | WRONG |
| Q4 (make teeth too ___) | ③ sensing | ④ sensitive | WRONG |
| Q5 (ate tomatoes, ___ lowered) | ② what | ③ which | WRONG |
| Q6 (the ___ baby) | ② slept | ① sleeping | WRONG |
| Q7 (help you ___ eyesight) | ③ improves | ⑤ improve | WRONG |
| Q8 (___ yoga is good) | ③ To practicing | ④ Practicing | WRONG |
| Q9 (have wrinkles, ___ brain has) | ④ that | ② which | WRONG |
| Q10 (compare it ___ heart) | ③ with | ③ with | OK |

**결과: 10문항 중 1문항만 일치 (정답률 10%)** -- L1보다 더 심각.

### CRITICAL-L2-02: 정답표 섹션 번호 정렬은 정상

**심각도: INFO (L1과 다름)**

L2의 정답표는 워크북 섹션 구조와 정확히 일치함:
- 정답표 A: 1-25, 워크북 A: 1-25 -- 일치
- 정답표 B: 26-45, 워크북 B: 26-45 -- 일치
- 이하 전 섹션 일치

따라서 L2의 문제는 **번호 매핑이 아니라 답 번호(보기 번호) 자체가 틀림**.

### CRITICAL-L2-03: B섹션(밑줄 어법) 26-35번 답이 대부분 ②로 편중

**심각도: CRITICAL (출제 품질)**

정답표 B섹션 26-35번: ② ② ② ① ② ② ② ② ② ②

10문항 중 9문항의 답이 ②. 이는 실제 정답이 아닌 답표 생성 오류의 증거이기도 하지만, 만약 이것이 실제 정답이라면 심각한 답 편중 문제.

실제 검증 (일부):
- Q26: "②that" (계속적 용법에 that 불가) → 답 ② -- 우연히 맞을 수 있음
- Q27: "②to" (prevent from인데 to 사용) → 답 ② -- 역시 우연히 맞을 수 있음
- Q28: "②to feel" (make+O+to V 불가) → 답 ② -- 맞음

B섹션 26-35번은 실제로 대부분 ②번 위치에 오류를 배치한 것으로 보이며, 이 자체가 **답 위치 편향 문제**. 학생이 "잘 모르면 ②" 전략을 쓸 수 있음.

### MODERATE-L2-04: Q24 문법 포인트 불일치

**심각도: MODERATE**

Q24: "Loving yourself can make a big _______ in your life."
선택지: ① differ ② difference ③ differently ④ different ⑤ differing
HTML 주석: `<!-- 24 — make + O + V원형 -->`

이 문제는 사실 "make + O + V원형" 유형이 아니라 "make a big difference" (고정 표현, 어휘 문제). 정답은 ② difference (명사). 주석의 문법 카테고리가 잘못 표기됨. 문제 자체는 성립하지만, 해당 레슨의 핵심 문법(make+O+V/adj)과 무관한 어휘 문제.

### MODERATE-L2-05: Q110 (compare A to → compare A with) 논란 가능성

**심각도: MODERATE**

Q110: "Scientists compared the shape of a walnut to the shape of a human brain."
정답: to → with (compare A with B)

그러나 "compare A to B" (A를 B에 비유하다)도 표준 영어에서 허용되는 구문. "compare A with B"는 비교, "compare A to B"는 비유로 구분하는 것이 전통적이지만, 현대 영어에서는 혼용. 중학교 시험 수준에서는 "compare A with B"만 정답으로 인정하는 것이 관행이므로 출제 의도는 이해하나, 엄밀히는 논란 가능.

### MODERATE-L2-06: G섹션(문장 전환) 91-100번 답 편중

**심각도: MODERATE**

정답표: 91.① 92.① 93.① 94.② 95.② 96.① 97.① 98.① 99.① 100.①

10문항 중 8문항이 ①. 검증 결과:
- Q91: ", which lowered..." = "and it lowered..." → ① 맞음
- Q92: "containing" = "which contains" → ② (관계대명사절). 그런데 선택지 ①이 "A diet contained..."인데 키는 ①. WRONG -- 정답은 ②.
- Q94: make+O+V → be made to V → ② 맞음

답 편중이 실제 정답 분포인지 답표 오류인지 구분이 어려우나, Q92에서 이미 오류가 확인되므로 답표 자체의 신뢰성이 낮음.

### INFO-L2-07: 힌트 유출 없음

밑줄, 볼드, 이탤릭 등으로 답이 노출되는 시각적 힌트 유출은 발견되지 않음.

### INFO-L2-08: 서술형 섹션(H-N) 정답 품질

서술형 문항(H: 오류 고치기, I: 오류 3개 고치기, J: 형태 변환, K: 어순 배열, L: 우리말 영작, M: 문장 합치기)의 정답 해설은 전반적으로 정확하고 상세함. 특히:
- H섹션: 오류 지적 + 올바른 형태 + 문법 설명 포함 -- 양호
- I섹션: 3개 오류 모두 정확하게 식별 -- 양호
- K섹션: 어순 배열 정답 문장이 문법적으로 정확 -- 양호
- M섹션: 문장 합치기 which 계속적 용법 활용이 정확 -- 양호

서술형 정답은 답 "번호"가 아니라 "텍스트"이므로 객관식과 달리 보기 순서 불일치 문제가 없음.

---

## 종합 평가

### 공통 CRITICAL 이슈

| # | 이슈 | L1 | L2 | 영향 범위 |
|---|------|----|----|----------|
| 1 | **객관식 정답 번호 전면 불일치** | 정답률 20% | 정답률 10% | A-G섹션 전체 (각 90문항) |
| 2 | **L1 정답표 섹션 번호 체계 불일치** | 5-10 오프셋 | 해당 없음 | A-G섹션 |
| 3 | **L2 B섹션 답 편중 (②)** | 해당 없음 | 9/10 = ② | 10문항 |

### 영향도 분석

- **객관식 섹션 (A-G, N)**: L1 100문항 + L2 100문항 = **200문항의 정답표가 사용 불가**
- **서술형 섹션 (H-M)**: L1 90문항 + L2 90문항 = **180문항의 정답은 정상** (텍스트 기반이므로)
- **전체 400문항 중 200문항(50%)의 정답표가 신뢰 불가**

### 추정 원인

정답표가 워크북의 **이전 버전**(보기 순서 또는 보기 내용이 다른 버전)에서 생성된 후, 워크북의 객관식 보기가 재생성/재배열되었으나 정답표가 업데이트되지 않은 것으로 추정. 근거:
1. 서술형 정답(텍스트)은 정확하지만 객관식 정답(번호)만 틀림
2. 정답 번호가 랜덤하게 틀리는 것이 아니라 체계적으로 어긋남
3. L1의 경우 섹션 번호 체계 자체도 이전 버전의 구조를 반영

### 필수 수정 사항

1. **[BLOCKER] L1+L2 객관식 정답표 전면 재생성**: 워크북 최종 HTML의 실제 보기 순서에 기반하여 A-G, N 섹션의 정답 번호를 다시 산출해야 함
2. **[BLOCKER] L1 정답표 섹션 번호 체계를 워크북과 일치시킴**: A(1-25), B(26-45), C(46-60), D(61-70), E(71-80), F(81-90), G(91-100)
3. **[HIGH] L2 B섹션 답 위치 분산**: 오류 위치를 ① ~ ⑤에 고르게 배치하도록 문항 재설계
4. **[MEDIUM] L1 Q108, Q116 try to V 문항 문맥 보강**: "시험 삼아 해보다" 의미가 더 명확하도록 문맥 단서 추가
5. **[LOW] L2 Q24 문법 카테고리 주석 수정**: make+O+V → 어휘(collocations)

### 종합 판정

**NOT READY FOR PRODUCTION**

정답표의 객관식 답 번호가 실제 문제와 매칭되지 않아 학생 자기채점이 불가능하며, 이 상태로 배포 시 학습 혼란과 신뢰도 손상이 발생함. 서술형 파트는 양호하나, 전체 문항의 50%에 해당하는 객관식 정답표가 사용 불가 상태이므로 배포 차단(BLOCKER) 판정.

**문제 품질 자체는 양호** -- 문법 포인트 커버리지가 넓고, 같은 문법을 다양한 유형으로 반복하는 설계가 좋으며, 난이도 배분도 적절함. 정답표만 재생성하면 즉시 사용 가능한 수준.
