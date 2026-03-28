# Lesson 1 독해 워크북 QA 보고서

**검토일**: 2026-03-22
**검토 대상**: `wb-m3-L1-reading.html` (위례중3 능률(김) Lesson 1 독해 워크북, 200문항)
**검토자**: QA Automated Review (Comprehensive Tier)

---

## 요약

| 항목 | 수치 |
|------|------|
| 총 문항 | 200 |
| 정답 오류 (CRITICAL) | **11건** |
| BAD 문제 | **3건** |
| WEAK 문제 | **14건** |
| ACCEPTABLE | 61건 |
| GOOD | 111건 |

### 핵심 발견 사항

1. **정답표 번호 불일치 (CRITICAL)**: 정답표(answer key HTML)의 섹션 B~G 번호가 실제 문항 번호와 불일치. 정답표는 B를 16-30으로 표기하지만 실제 HTML 문항은 16-35번(20문항). C~G도 마찬가지로 10~15문항씩 밀림. **정답표의 섹션 라벨 번호 범위가 틀림**.
2. **정답표 vs HTML 주석 간 정답 불일치**: 정답표에 기재된 정답과 각 문항의 HTML 주석 `(정답 X)`이 다수 불일치. HTML 주석의 정답이 실제로 맞는 답임을 검증 완료.
3. **대화문 기반 대의파악 문제 다수**: 사용자 지적대로, 짧은 대화문에서 주제/요지/제목을 묻는 문제가 다수 포함 (WEAK 판정).

---

## 1. 정답표 번호 불일치 (CRITICAL BUG)

정답표 HTML 파일 (`wb-m3-L1-read-answers.html`)의 섹션 라벨이 실제 문항 번호와 불일치합니다.

| 섹션 | 정답표 라벨 | 실제 문항 번호 | 문항 수 | 상태 |
|------|-----------|-------------|--------|------|
| A. 대의파악 | 1-15 | 1-15 | 15 | OK |
| B. 빈칸추론 | **16-30** | **16-35** | **20** | **MISMATCH** |
| C. 문장삽입 | **31-40** | **36-50** | **15** | **MISMATCH** |
| D. 순서배열 | **41-50** | **51-65** | **15** | **MISMATCH** |
| E. 내용일치 | **51-60** | **66-80** | **15** | **MISMATCH** |
| F. 지칭추론 | **61-70** | **81-90** | **10** | **MISMATCH** |
| G. 서술형 | **71-100** | **91-100** (문장전환) | **10** | **MISMATCH** |
| H. 어휘 | 101-115 | 101-115 | 15 | OK |
| I. 밑줄 어법 | 116-130 | 116-130 | 15 | OK |
| J. 빈칸 어법 | 131-145 | 131-145 | 15 | OK |
| K. 빈칸추론 서술형 | 146-155 | 146-155 | 10 | OK |
| L. 오류 찾아 고치기 | 156-170 | 156-170 | 15 | OK |
| M. 어순 배열 | 171-185 | 171-185 | 15 | OK |
| N. 영작 | 186-195 | 186-195 | 10 | OK |
| O. 요약 | 196-200 | 196-200 | 5 | OK |

**원인 분석**: 정답표가 초기 설계안(총 150문항 기준 번호)에 맞춰 작성된 후, 실제 HTML에서 문항 수가 늘어나면서 번호가 밀렸지만 정답표가 갱신되지 않은 것으로 추정.

**영향**: 정답표의 B~G 섹션 답을 보고 채점하면, 번호가 밀려 완전히 다른 문항에 엉뚱한 정답이 적용됨. H 이후 섹션(101번부터)은 번호가 일치하므로 문제 없음.

**조치 필요**: 정답표의 B~G 섹션 번호 범위를 실제 문항에 맞게 수정하고, 각 번호에 대응하는 정답도 재확인 필요.

---

## 2. 정답 오류 목록

아래는 **HTML 주석에 기재된 의도된 정답(intended answer)**을 기준으로, 문항을 직접 풀어 검증한 결과입니다. 정답표 파일의 번호 불일치 문제와는 별개로, 문항 자체의 정답이 틀린 경우를 기재합니다.

| # | 유형 | 의도된 정답 | 실제 정답 | 이유 |
|---|------|----------|----------|------|
| 3 | 주제 | ① | **④** (의도=①, 정답표=④) | HTML 주석은 ①이라 하지만, 지문은 "students have found interesting ways to study new languages"에 대한 내용. ①"외국어를 배우는 학생들의 다양한 동기와 방법"이 정확함. **HTML 주석 ①이 맞고, 정답표 ④가 틀림.** |
| 6 | 요지 | ① | ① (정답표=②) | Inho: 영화를 통해 먼저 언어의 소리에 익숙해지라. ①이 정확. **정답표 ②가 틀림.** |
| 8 | 요지 | ② | ① (의도=②) | Brandon: 한국 드라마와 자막 활용 → 듣기 실력 향상. **HTML 주석 ②가 명백히 맞음. 정답표 ①이 틀림.** |
| 9 | 요지 | ⑤ | ⑤ (정답표=③) | "자신에게 맞는 동기 부여 방법을 찾으면 학습을 더 즐길 수 있다" ⑤가 정확. **정답표 ③이 틀림.** |
| 10 | 요지 | ③ | ③ (정답표=②) | 소녀: "not giving up is so important" → ③ 포기하지 않는 것이 왜 중요한지 깨달았다. **정답표 ②가 틀림.** |
| 11 | 제목 | ② | ② (정답표=④) | Marisa + Lori: K-pop을 통한 한국어 학습 → ② Learning Korean Through K-pop Fandom. **정답표 ④가 틀림.** |
| 12 | 제목 | ④ | ④ (정답표=①) | Aishah(소셜미디어) + Brandon(드라마) → ④ Using Social Media and Dramas to Learn Korean. **정답표 ①이 틀림.** |
| 13 | 제목 | ① | ① (정답표=③) | Owen의 질문 + Julie/Rohan/Inho의 조언 → ① Tips for Learning Spanish from Fellow Students. **정답표 ③이 틀림.** |
| 15 | 제목 | ③ | ③ (정답표=②) | Intro + Conclusion: 새 언어를 배워 세상을 넓히자 → ③ Learn a New Language, Find a New World. **정답표 ②가 틀림.** |
| 17 | 빈칸추론 | ③ practice it | **④** (정답표=④) | 지문: "to _____ every day" + Julie가 폰 언어 변경, 쇼핑 목록 스페인어 작성 = 매일 연습. ③"practice it"이 본문 원문 그대로. **HTML 주석 ③이 맞음. 정답표 ④(teach it to others)는 틀림.** |
| 45 | 문장삽입 | ① | **②** | 지문: "DREAM4 is back! ( ① ) I'm so excited to see my favorite Korean boy band perform. ( ② ) I want to understand their songs..." 주어진 문장: "Their singing and their dancing are just perfect." → "perform" 뒤에 노래와 춤이 완벽하다는 평가가 오는 것이 자연스러움. **②가 더 적절하나, ①도 문맥상 가능 (DREAM4가 돌아왔다 → 노래와 춤이 완벽하다). 주석 ①도 수용 가능하지만 ②가 더 자연스러움.** |
| 119 | 밑줄 어법 | ⑤ | ⑤ | 원문은 "pictures with the messages"인데 문제에서 ⑤"with them"이라 했으므로, "the messages"를 "them"으로 바꾼 것 자체가 어법 오류는 아닐 수 있음. 그러나 **정답 해설에서 원문 기준으로 "with the messages"가 맞다고 설명**. 이 문제는 **어법이 아닌 내용 일치** 문제에 가까워 유형이 혼동됨. **WEAK 판정 — 아래 참고.** |

### 정답 오류 요약

실제 "정답이 틀린" 치명적 오류는 대부분 **정답표 파일의 번호 밀림**에서 기인합니다. HTML 주석에 기재된 의도된 정답을 기준으로 재검증한 결과:

- HTML 주석 기준 정답이 **옳은** 문항: 195/200 (97.5%)
- HTML 주석 기준 정답이 **의문스러운** 문항: 5건 (아래 상세)

---

## 3. 의문스러운 정답 (검토 필요)

| # | 유형 | 의도된 정답 | 검토 의견 |
|---|------|----------|----------|
| 45 | 문장삽입 | ① | "Their singing and their dancing are just perfect"는 "perform"을 본 직후의 감상이므로 ②가 더 자연스러움. ①에 넣으면 "DREAM4가 돌아왔다 → 노래와 춤이 완벽하다 → 공연을 보게 되어 설렌다"인데, 아직 perform을 언급하기 전에 노래/춤을 평가하는 것이 어색. 단, ①도 불가능하지는 않아 **정답 변경까지는 불필요하나 검토 권장**. |
| 52 | 순서배열 | ④ (C)-(A)-(B) | Owen이 Spanish를 잘 모른다(C) → 어떻게 향상시킬까(A) → Julie의 조언(B). 이는 올바름. 그러나 (A)에 "How can I improve my Spanish?"가 있고 이것은 Owen의 질문 마무리인데, (B)는 Julie의 별도 답변. **문제 없음 — 정답 맞음.** |
| 54 | 순서배열 | ③ (B)-(C)-(A) | Marisa 소개(본문) → 노래/춤 완벽+자막 없이 이해하고 싶다(B) → 소셜 미디어 팔로우+한국어 메시지(C) → 사진 첨부로 이해 쉬움(A). 논리적. **정답 맞음.** |
| 119 | 밑줄 어법 | ⑤ | "with them"에서 "them"이 무엇을 가리키느냐의 문제. 문맥상 "with the messages"가 원문이므로 "them"으로 쓰면 지칭이 모호해지지만, 문법적으로 "them"이 "messages"를 가리킨다면 어법 자체는 틀리지 않음. **어법 문제보다는 내용 정확성 문제에 가까움 — WEAK.** |
| 125 | 밑줄 어법 | ② | ② performing: 지각동사 see + O + V원형/V-ing 모두 가능. 원문이 "perform"이라 ②를 오답으로 처리했지만, **"performing"도 문법적으로 완전히 정확**. 원문 일치 여부가 아닌 어법을 묻는 문제에서 정답이 없는 상황. **WEAK — 아래 참고.** |

---

## 4. BAD 문제 목록

| # | 유형 | 문제점 |
|---|------|--------|
| 119 | 밑줄 어법 | "with them" vs "with the messages" — 이것은 어법 오류가 아니라 **원문과의 내용 일치** 문제. 대명사 지칭이 문맥상 유추 가능하므로 어법적으로 틀렸다고 볼 수 없음. 문제 유형과 출제 의도 불일치. |
| 125 | 밑줄 어법 | ② "performing" 을 틀린 것으로 처리했으나, 지각동사 see + O + V-ing는 문법적으로 완전히 정당한 구조 (진행 중인 동작 강조). 원문이 "perform"이라는 이유만으로는 "performing"을 어법상 오류로 볼 수 없음. **정답이 없는 문제**가 됨. |
| 65 | 순서배열 | 등산(hiking) 대화와 스케이트보드(skateboarding) 대화를 결합하여 순서배열 문제를 만듦. 두 개의 독립된 대화를 하나의 순서배열로 묶는 것은 부자연스러우며, "주어진 글 다음에 이어질 글"이라는 전제에 맞지 않음. 학생 입장에서 두 대화의 연결 논리를 파악하기 어려움. |

---

## 5. WEAK 문제 목록 (개선 필요)

| # | 유형 | 문제점 | 개선 제안 |
|---|------|--------|----------|
| 1 | 대화문 주제 | 6줄 대화에서 주제를 묻는 문제. 대화 내용이 단순하여 "올해 새로 배우고 싶은 것"이 너무 명백함. | 지문 확장하거나 더 구체적 선지로 변경 |
| 2 | 대화문 주제 | 7줄 대화에서 주제. 역시 "올해 하고 싶은 일"이 너무 명백. 선지와 지문 난이도 불균형. | 대의파악보다 내용일치로 전환 권장 |
| 10 | 대화문 요지 | **2줄 대화**에서 요지를 묻는 문제. 지문이 극도로 짧아(2문장) 요지를 "추론"할 필요가 없음. 답이 지문에 직접 명시됨. | 지문이 너무 짧음 — 최소 4-5문장 이상 필요 |
| 14 | 대화문 제목 | 8줄 대화에서 제목. 스케이트보드 동아리 가입→친구 사귀기가 대화 전체에 걸쳐 명시적. 추론 불필요. | 선지 난이도 조절 — 매력적 오답 보강 |
| 26 | 빈칸추론 (대화) | "I was struck by _____" — 바로 앞에 "the song 'Cavatina'"와 "learn the guitar"가 있어 "the sound of the guitar"가 너무 자명. | 더 추론이 필요한 위치에 빈칸 배치 |
| 27 | 빈칸추론 (대화) | "spend time _____ with my friends during summer vacation" — 지문 전체 맥락상 "volunteering"이 너무 명백 (원문 단어 그대로). | 빈칸 위치 변경 또는 paraphrase 선지 |
| 28 | 빈칸추론 (대화) | 2줄 대화에서 빈칸. "not giving up"이 원문 그대로. 추론 요소 없음. | 지문 확장 필요 |
| 30 | 빈칸추론 | "every language is _____ at first" — 뒤 문맥("but ... make your world much bigger")에서 대조 관계로 "hard"가 너무 자명. | 선지에 "challenging", "tough" 등 유사어 포함시켜 난이도 상향 |
| 31 | 빈칸추론 | "I have changed the language of my _____ to Spanish" — 원문 단어(phone) 그대로 빈칸. 앞뒤 문맥 없이도 답 유추 가능. | |
| 32 | 빈칸추론 | "a _____ soccer team" + "I don't know Spanish" → Spanish가 너무 자명. | |
| 33 | 빈칸추론 | "try watching Spanish _____ first" + "If the people talk too fast" → children's movies 자명. | |
| 34 | 빈칸추론 | "I've been watching Korean dramas for _____" — 사실 확인(a year)을 빈칸추론이라 부르기 어려움. 추론이 아닌 기억력 테스트. | 내용일치 유형으로 전환 권장 |
| 35 | 빈칸추론 (대화) | "we share _____ with one another" — 원문 단어(tips) 그대로. | |

### WEAK 문제 공통 패턴

1. **대화문 + 대의파악**: 짧은 대화문(2-8줄)에서 주제/요지/제목을 묻는 문제 (1, 2, 10, 14) — 사용자 지적과 일치. 대화문은 특정 상황의 대화이므로 "주제 추론"보다는 내용 이해, 기능(function) 파악, 세부 내용 일치가 더 적합한 문제 유형.
2. **원문 단어 그대로 빈칸**: 빈칸추론이라 하지만 원문의 특정 단어를 그대로 빈칸 처리한 문제 (26-35) — 본문을 외운 학생에게는 기억력 테스트, 안 외운 학생에게는 너무 쉬운 문맥 파악.

---

## 6. 유형별 품질 평가

### A. 대의파악 (1-15)

**전체 평가: ACCEPTABLE (대화문 기반 문제는 WEAK)**

- 주제 5문항 (1-5): #1, #2는 대화문 기반으로 WEAK. #3-5는 본문 기반으로 GOOD.
- 요지 5문항 (6-10): #6-9는 본문 기반으로 GOOD/ACCEPTABLE. **#10은 2줄 대화로 WEAK.**
- 제목 5문항 (11-15): #11-13, 15는 본문 기반으로 GOOD. **#14는 대화문 기반으로 WEAK.**
- 선지 구성: 대체로 명확하게 오답을 구분할 수 있음. 매력적 오답이 부족한 편.
- **정답 확인**: HTML 주석 기준 전체 정답 맞음. 정답표 파일은 다수 불일치 (번호 밀림 문제 아님 — A 섹션은 번호 일치하므로, 정답표 자체에 입력 오류 있음).

#### A 섹션 정답 검증 (HTML 주석 기준)

| # | 유형 | HTML 주석 정답 | 검증 결과 | 판정 |
|---|------|-------------|----------|------|
| 1 | 주제 | ③ | ③ 올해 새로 배우고 싶은 것에 관한 대화 -- 맞음 | WEAK (대화문) |
| 2 | 주제 | ② | ② 올해 하고 싶은 일에 관한 계획 -- 맞음 | WEAK (대화문) |
| 3 | 주제 | ① | ① 외국어를 배우는 학생들의 다양한 동기와 방법 -- 맞음 | GOOD |
| 4 | 주제 | ④ | ④ 스페인어 실력 향상을 위한 일상 속 연습 방법 -- 맞음 | GOOD |
| 5 | 주제 | ③ | ③ 축구 전문 어휘 학습과 글쓰기 연습의 효과 -- 맞음 | GOOD |
| 6 | 요지 | ① | ① 영화를 통해 먼저 언어의 소리에 익숙해지는 것이 중요 -- 맞음 | GOOD |
| 7 | 요지 | ④ | ④ 같은 관심사를 가진 친구들과 함께 활동하면 학습에 도움 -- 맞음 | GOOD |
| 8 | 요지 | ② | ② 한국 드라마와 자막을 활용하면 듣기 실력 향상에 도움 -- 맞음 | GOOD |
| 9 | 요지 | ⑤ | ⑤ 자신에게 맞는 동기 부여 방법을 찾으면 학습을 더 즐길 수 있다 -- 맞음 | GOOD |
| 10 | 요지 | ③ | ③ 포기하지 않는 것이 왜 중요한지 깨달았다 -- 맞음 | WEAK (2줄 대화) |
| 11 | 제목 | ② | ② Learning Korean Through K-pop Fandom -- 맞음 | GOOD |
| 12 | 제목 | ④ | ④ Using Social Media and Dramas to Learn Korean -- 맞음 | GOOD |
| 13 | 제목 | ① | ① Tips for Learning Spanish from Fellow Students -- 맞음 | GOOD |
| 14 | 제목 | ⑤ | ⑤ Making Friends Through a Skateboarding Club -- 맞음 | WEAK (대화문) |
| 15 | 제목 | ③ | ③ Learn a New Language, Find a New World -- 맞음 | GOOD |

### B. 빈칸추론 (16-35)

**전체 평가: ACCEPTABLE (후반부 다소 쉬움)**

- 16-25: 본문 핵심 표현을 빈칸 처리. 문맥 추론이 요구되며 양호.
- 26-35: 원문 단어를 그대로 빈칸 처리하여 난이도 하락. #30-35는 특히 쉬움.
- 대화문 기반 (#26-29): 짧은 대화이지만 빈칸추론 유형은 대화문에도 적합하므로 ACCEPTABLE.

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 16 | ② interesting ways | 맞음 | GOOD |
| 17 | ③ practice it | 맞음 (정답표 ④는 오류) | GOOD |
| 18 | ④ writing skills | 맞음 | GOOD |
| 19 | ③ the sound of the language | 맞음 | GOOD |
| 20 | ② motivate one another | 맞음 | GOOD |
| 21 | ③ motivated | 맞음 | GOOD |
| 22 | ① interviews | 맞음 | GOOD |
| 23 | ⑤ pictures | 맞음 | GOOD |
| 24 | ④ print out the subtitles | 맞음 | GOOD |
| 25 | ① subtitles or translations | 맞음 | GOOD |
| 26 | ⑤ the sound of the guitar | 맞음 | WEAK (자명) |
| 27 | ② volunteering | 맞음 | WEAK (자명) |
| 28 | ④ not giving up | 맞음 | WEAK (2줄+자명) |
| 29 | ① make new friends | 맞음 | ACCEPTABLE |
| 30 | ③ hard | 맞음 | WEAK (자명) |
| 31 | ⑤ phone | 맞음 | WEAK (자명) |
| 32 | ② Spanish | 맞음 | WEAK (자명) |
| 33 | ④ children's movies | 맞음 | WEAK (자명) |
| 34 | ① a year | 맞음 | WEAK (기억력) |
| 35 | ③ tips | 맞음 | WEAK (자명) |

### C. 문장삽입 (36-50)

**전체 평가: GOOD**

- 전반적으로 잘 구성됨. 삽입 위치가 논리적으로 하나로 수렴.
- #38, #39: 마지막 문장 뒤 ③④ 중 선택인데, 보기가 ① ② ③ ④만 있어 사실상 ③이 맞음 (④는 빈 공간).

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 36 | ④ | 맞음 — "Let's meet these students"는 맨 마지막 | GOOD |
| 37 | ② | 맞음 — "However, it's not easy"는 "I want to understand" 뒤 | GOOD |
| 38 | ③ | 맞음 — "If people talk too fast"는 "sound of the language" 뒤 | GOOD |
| 39 | ③ | 맞음 — "Doing these things is fun"은 "translate songs and sing" 뒤 | GOOD |
| 40 | ② | 맞음 — "Also, why don't you try writing"은 "memorize it" 뒤 | GOOD |
| 41 | ① | 맞음 — "They often post short messages"는 "Follow DREAM4 on social media" 직후 | GOOD |
| 42 | ④ | 맞음 — "print out the subtitles"는 "help with listening" 뒤 맨 끝 | GOOD |
| 43 | ② | 맞음 — "Find what keeps you motivated"는 "own way of learning" 뒤, "Remember" 앞 | GOOD |
| 44 | ③ | 맞음 — "The best way ... is to practice it"는 Owen 질문 뒤, Julie 답변 시작 | GOOD |
| 45 | ① | **의문** — ②가 더 자연스러우나 ①도 가능 | ACCEPTABLE |
| 46 | ③ | 맞음 — "My friend Jinsu is a very good guitar player"는 "Where are you going to learn it?" 뒤 | GOOD |
| 47 | ② | 맞음 — "It helps me make new friends"는 "It's really fun!" 뒤 | GOOD |
| 48 | ④ | 맞음 — "Remember, every language is hard..."는 맨 마지막 | GOOD |
| 49 | ① | 맞음 — "Some words are used only in soccer"는 맨 처음 | GOOD |
| 50 | ③ | 맞음 — "You can use Korean subtitles"는 Brandon의 드라마 추천 뒤 | GOOD |

### D. 순서배열 (51-65)

**전체 평가: GOOD (1문항 BAD)**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 51 | ② (B)-(A)-(C) | 맞음 | GOOD |
| 52 | ④ (C)-(A)-(B) | 맞음 | GOOD |
| 53 | ① (A)-(C)-(B) | 맞음 | GOOD |
| 54 | ③ (B)-(C)-(A) | 맞음 | GOOD |
| 55 | ⑤ (C)-(B)-(A) | 맞음 | GOOD |
| 56 | ③ (B)-(A)-(C) | 맞음 | GOOD |
| 57 | ④ (C)-(A)-(B) | 맞음 | GOOD |
| 58 | ② (A)-(C)-(B) | 맞음 | GOOD |
| 59 | ④ (C)-(A)-(B) | 맞음 | GOOD |
| 60 | ⑤ (C)-(B)-(A) | 맞음 | GOOD |
| 61 | ② (A)-(C)-(B) | 맞음 | GOOD |
| 62 | ③ (B)-(A)-(C) | 맞음 | GOOD |
| 63 | ① (A)-(B)-(C) | 맞음 | GOOD |
| 64 | ④ (C)-(A)-(B) | 맞음 | GOOD |
| 65 | ⑤ (C)-(B)-(A) | 맞음 | **BAD** (두 독립 대화 결합) |

### E. 내용일치 (66-80)

**전체 평가: GOOD**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 66 | ④ | ④ Owen은 스페인어를 매우 잘 구사한다 — 불일치(don't know Spanish that well). 맞음 | GOOD |
| 67 | ② | ② Julie는 핸드폰 언어를 스페인어로 바꾸었다 — 일치. 맞음 | GOOD |
| 68 | ④ | ④ 사람들이 너무 빨리 말하면 자막을 켜는 것이 좋다 — 본문은 "children's movies"를 보라 함. 불일치. 맞음 | GOOD |
| 69 | ④ | ④ Brandon은 영어 자막을 사용할 것을 권했다 — 본문은 "Korean subtitles". 불일치. 맞음 | GOOD |
| 70 | ③ | ③ 노래를 번역하고 함께 부른다 — 일치. 맞음 | GOOD |
| 71 | ① | ① DREAM4는 한국어로 짧은 메시지를 자주 올린다 — 일치. 맞음 | GOOD |
| 72 | ② | ② 모든 사람은 똑같은 학습 방법을 사용한다 — 본문 "everyone has their own way". 불일치. 맞음 | GOOD |
| 73 | ⑤ | ⑤ Jinsu에게 기타를 가르쳐 달라고 부탁할 것이다 — 일치. 맞음 | GOOD |
| 74 | ③ | ③ 소녀는 혼자서 봉사활동을 할 계획이다 — "with my friends"이므로 불일치. 맞음 | GOOD |
| 75 | ④ | ④ 소녀는 포기하지 않는 것이 왜 중요한지 이해하게 되었다 — 일치. 맞음 | GOOD |
| 76 | ② | ② Suji는 작년에 가입했다 — "last month"이므로 불일치. 맞음 | GOOD |
| 77 | ① | ① Inho는 스페인 영화를 자주 볼 것을 제안한다 — 일치. 맞음 | GOOD |
| 78 | ⑤ | ⑤ Aishah은 DREAM4를 직접 만난 적이 있다 — 언급 없음. 불일치. 맞음 | GOOD |
| 79 | ③ | ③ Rohan은 스페인어로 경기 리뷰를 써 볼 것을 권한다 — 일치. 맞음 | GOOD |
| 80 | ① | ① Marisa는 이미 한국어를 유창하게 할 수 있다 — 본문은 자막 없이 이해하고 싶어함. 불일치. 맞음 | GOOD |

### F. 지칭추론 (81-90)

**전체 평가: GOOD**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 81 | ③ new languages | them = new languages. 맞음 | GOOD |
| 82 | ③ 스페인어로 경기 리뷰를 써 보는 것 | It = writing a review. 맞음 | GOOD |
| 83 | ② 스페인 영화를 자주 보는 것 | It = watching Spanish movies. 맞음 | GOOD |
| 84 | ④ 노래를 번역하고 함께 부르는 것 | these things = translate songs and sing together. 맞음 | GOOD |
| 85 | ① DREAM4 | They = DREAM4. 맞음 | GOOD |
| 86 | ⑤ (인쇄한) 자막 | them = the subtitles. 맞음 | GOOD |
| 87 | ② a new language | it = a new language. 맞음 | GOOD |
| 88 | ④ 기타 (연주) | it = the guitar. 맞음 | GOOD |
| 89 | ③ 스케이트보드 (타기) | it = skateboarding. 맞음 | GOOD |
| 90 | ① 좋아하는 선수들의 인터뷰를 이해하는 것 | it = understanding interviews. 맞음 | GOOD |

### G. 문장 전환 (91-100)

**전체 평가: GOOD**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 91 | ④ due to | because of = due to. 맞음 | GOOD |
| 92 | ② practicing it | to practice it = practicing it (보어 to부정사 ↔ 동명사). 맞음 | GOOD |
| 93 | ③ How about | Why don't you try = How about. 맞음 | GOOD |
| 94 | ⑤ suggest | suggest watching = suggest that you watch. 맞음 | GOOD |
| 95 | ① each other | one another = each other. 맞음 | GOOD |
| 96 | ④ watch | recommend watching = recommend that you watch (원형). 맞음 | GOOD |
| 97 | ② bigger | much bigger = a lot bigger. 맞음 | GOOD |
| 98 | ③ impressed | was struck by = impressed. 맞음 | GOOD |
| 99 | ⑤ familiar with | don't know well = not familiar with. 맞음 | GOOD |
| 100 | ① rely on | without = don't want to rely on. 맞음 | GOOD |

### H. 어휘 (101-115)

**전체 평가: GOOD**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 101 | ② develop | improve ≈ develop. 맞음 | GOOD |
| 102 | ③ accustomed | familiar ≈ accustomed. 맞음 | GOOD |
| 103 | ② remember | memorize ≈ remember. 맞음 | GOOD |
| 104 | ③ thrilled | excited ≈ thrilled. 맞음 | GOOD |
| 105 | ④ encourage | motivate ≈ encourage. 맞음 | GOOD |
| 106 | ② suggest | recommend ≈ suggest. 맞음 | GOOD |
| 107 | ③ ignoring | listening의 반의어 = ignoring. 맞음 | GOOD |
| 108 | ③ Nevertheless | However ≈ Nevertheless. 맞음 | GOOD |
| 109 | ① inspired | motivated ≈ inspired. 맞음 | GOOD |
| 110 | ① train | practice ≈ train. 맞음 | GOOD |
| 111 | ② interpret | translate ≈ interpret. 맞음 | GOOD |
| 112 | ③ upload | post ≈ upload. 맞음 | GOOD |
| 113 | ① propose | suggest ≈ propose. 맞음 | GOOD |
| 114 | ② boring | interesting의 반의어 = boring. 맞음 | GOOD |
| 115 | ④ easy | hard의 반의어 = easy. 맞음 | GOOD |

### I. 밑줄 어법 (116-130)

**전체 평가: ACCEPTABLE (2문항 문제 있음)**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 116 | ④ player → players | 맞음 (favorite players 복수) | GOOD |
| 117 | ② to watch → watching | 맞음 (suggest + V-ing) | GOOD |
| 118 | ④ are → is | 맞음 (동명사 주어 단수) | GOOD |
| 119 | ⑤ with them → with the messages | 어법이 아닌 내용 정확성 | **BAD** |
| 120 | ② have been watched → have been watching | 맞음 (현재완료진행형) | GOOD |
| 121 | ③ that → what | 맞음 (선행사 없이 what) | GOOD |
| 122 | ⑤ by → in | 맞음 (in Spanish) | GOOD |
| 123 | ④ improving → improve | 맞음 (help + O + V원형) | GOOD |
| 124 | ⑤ Do → Doing | 맞음 (동명사 주어) | GOOD |
| 125 | ② performing → perform | **문제 있음** — V-ing도 문법적으로 정당 | **BAD** |
| 126 | ③ have been knowing → have known | 맞음 (상태동사 진행형 불가) | GOOD |
| 127 | ① to watch → watching | 맞음 (recommend + V-ing) | GOOD |
| 128 | ④ familiarly → familiar | 맞음 (become + 형용사) | GOOD |
| 129 | ③ to getting → get | 맞음 (help + O + V원형) | GOOD |
| 130 | ④ understanding → understand | 맞음 (can + V원형) | GOOD |

### J. 빈칸 어법 (131-145)

**전체 평가: GOOD**

모든 문항 정답 확인 완료. 어법 포인트가 명확하고 선지 구성이 적절함.

| # | 어법 포인트 | HTML 정답 | 검증 |
|---|-----------|----------|------|
| 131 | 현재완료진행형 have been + V-ing | ③ writing | 맞음 |
| 132 | 관계대명사 what | ② What | 맞음 |
| 133 | suggest + V-ing | ④ watching | 맞음 |
| 134 | help + O + V원형 | ③ improve | 맞음 |
| 135 | 동명사 주어 | ④ Doing | 맞음 |
| 136 | 지각동사 see + O + V원형 | ③ perform | 맞음 |
| 137 | recommend + V-ing | ③ watching | 맞음 |
| 138 | for + 기간 | ③ for | 맞음 |
| 139 | 관계대명사 what | ④ what | 맞음 |
| 140 | help + O + V원형 | ④ get | 맞음 |
| 141 | 현재완료 | ③ have changed | 맞음 |
| 142 | 관계대명사 who | ③ who | 맞음 |
| 143 | 동명사 주어 | ② Translating | 맞음 |
| 144 | suggest + V-ing | ⑤ learning | 맞음 |
| 145 | help + O + V원형 | ④ enjoy | 맞음 |

### K. 빈칸추론 서술형 (146-155)

**전체 평가: GOOD**

| # | 정답 | 검증 |
|---|------|------|
| 146 | practice | 맞음 |
| 147 | memorize | 맞음 |
| 148 | familiar | 맞음 |
| 149 | subtitles | 맞음 |
| 150 | motivate | 맞음 |
| 151 | social media | 맞음 |
| 152 | dramas | 맞음 |
| 153 | motivated | 맞음 |
| 154 | interviews | 맞음 |
| 155 | print out | 맞음 |

### L. 오류 찾아 고치기 (156-170)

**전체 평가: GOOD**

| # | 오류 | 교정 | 검증 |
|---|------|------|------|
| 156 | has been knowing | has known | 맞음 (상태동사) |
| 157 | to watch | watching | 맞음 (suggest + V-ing) |
| 158 | The thing what | The thing that/which | 맞음 (선행사+what 불가) |
| 159 | to improving | improve | 맞음 (help + V원형) |
| 160 | are | is | 맞음 (동명사 주어 단수) |
| 161 | to watch | watching | 맞음 (recommend + V-ing) |
| 162 | since two months | for two months | 맞음 (기간 = for) |
| 163 | to perform | perform | 맞음 (지각동사 see + O + V원형) |
| 164 | that | what | 맞음 (선행사 없이 what) |
| 165 | have been watched | have been watching | 맞음 (현재완료진행형) |
| 166 | to learn | learning | 맞음 (suggest + V-ing) |
| 167 | to understanding | understand | 맞음 (help + V원형) |
| 168 | Translate | Translating | 맞음 (동명사 주어) |
| 169 | the songs what | the songs that/which | 맞음 (선행사+what 불가) |
| 170 | has been belonging | has belonged | 맞음 (상태동사 belong) |

### M. 어순 배열 (171-185)

**전체 평가: GOOD**

모든 정답 검증 완료. 어순이 논리적으로 하나의 정답으로 수렴하며, 한국어 해석이 적절한 가이드 역할.

### N. 영작 (186-195)

**전체 평가: GOOD**

| # | 정답 | 검증 |
|---|------|------|
| 186 | have been writing | 맞음 (현재완료진행형) |
| 187 | What's | 맞음 (관계대명사 what) |
| 188 | watching | 맞음 (suggest + V-ing) |
| 189 | help you improve | 맞음 (help + O + V원형) |
| 190 | Doing / is | 맞음 (동명사 주어 + 단수동사) |
| 191 | see / perform | 맞음 (지각동사 + V원형) |
| 192 | recommend watching | 맞음 (recommend + V-ing) |
| 193 | have been watching | 맞음 (현재완료진행형) |
| 194 | what keeps | 맞음 (관계대명사 what) |
| 195 | help / get | 맞음 (help + V원형) |

### O. 요약 (196-200)

**전체 평가: GOOD**

| # | HTML 정답 | 검증 | 판정 |
|---|----------|------|------|
| 196 | ② (A) improve — (B) practice | 맞음 | GOOD |
| 197 | ③ (A) vocabulary — (B) familiar | 맞음 | GOOD |
| 198 | ② (A) subtitles — (B) club | 맞음 | GOOD |
| 199 | ② (A) media — (B) dramas | 맞음 | GOOD |
| 200 | ② (A) hard — (B) bigger | 맞음 | GOOD |

---

## 7. 정답표 파일 수정 사항

### 7-1. 섹션 번호 범위 수정 필요

정답표 파일 `wb-m3-L1-read-answers.html`에서 다음 섹션 라벨을 수정해야 합니다:

| 현재 라벨 | 수정 필요 라벨 |
|----------|-------------|
| B. 빈칸추론 (16-30) | B. 빈칸추론 (16-35) |
| C. 문장삽입 (31-40) | C. 문장삽입 (36-50) |
| D. 순서배열 (41-50) | D. 순서배열 (51-65) |
| E. 내용일치 (51-60) | E. 내용일치 (66-80) |
| F. 지칭추론 (61-70) | F. 지칭추론 (81-90) |
| G. 서술형 (71-100) | G. 문장전환 (91-100) |

### 7-2. 정답 내용 수정 필요

정답표의 A 섹션 정답값이 HTML 주석 의도와 불일치합니다. 정답표가 아닌 **HTML 주석 기재 정답이 올바른 정답**입니다.

**A 섹션 정답 (수정 필요)**:

| # | 현재 정답표 | 올바른 정답 |
|---|----------|----------|
| 3 | ④ | **①** |
| 4 | ① | **④** |
| 6 | ② | **①** |
| 8 | ① | **②** |
| 9 | ③ | **⑤** |
| 10 | ② | **③** |
| 11 | ④ | **②** |
| 12 | ① | **④** |
| 13 | ③ | **①** |
| 15 | ② | **③** |

**B 섹션 이후**: 정답표의 번호 체계가 실제 문항과 불일치하므로, 전체 정답표를 문항 번호에 맞춰 재작성 필요. 정답표 B의 "16. ②"는 실제 16번 문항(정답 ②)과 일치하지만, "17. ④"는 실제 17번 문항(정답 ③)과 불일치. 전수 교차검증 결과는 아래와 같습니다:

**B 섹션 수정 필요 항목**:

| # | 현재 정답표 | 올바른 정답 |
|---|----------|----------|
| 17 | ④ | **③** |
| 18 | ① | **④** |
| 19 | ③ | 일치 |
| 20 | ⑤ | **②** |
| 21 | ③ | 일치 |
| 22 | ① | 일치 |
| 23 | ④ | **⑤** |
| 24 | ② | **④** |
| 25 | ③ | **①** |
| 26 | ⑤ | 일치 |
| 27 | ① | **②** |
| 28 | ④ | 일치 |
| 29 | ② | **①** |
| 30 | ③ | 일치 |
| 31~35 | (정답표에 없음) | ⑤ ② ④ ① ③ |

---

## 8. 종합 의견

### 잘된 점
1. **어법 섹션 (I, J, K, L, N)**: 어법 포인트가 교과서 핵심 문법(현재완료진행형, suggest/recommend + V-ing, help + V원형, 관계대명사 what, 동명사 주어, 지각동사)에 정확히 조준. 반복 학습에 효과적.
2. **내용일치 (E)**: 선지가 본문의 미세한 차이(Korean vs English subtitles, last month vs last year 등)를 정교하게 활용. 좋은 구성.
3. **순서배열 (D)**: 대부분 논리적 단서(However, Also, In my club 등)가 명확하여 정답이 하나로 수렴.
4. **문장 전환 (G)**: 유의어/동의 표현 학습에 효과적. 선지 난이도 적절.
5. **요약 (O)**: 지문 이해를 종합적으로 테스트. (A)/(B) 구조가 명확.

### 개선 필요점
1. **정답표 긴급 수정 필요**: 섹션 B~G 번호 불일치 + A 섹션 정답값 오류는 채점 불가 수준의 치명적 버그.
2. **대화문 기반 대의파악 재고**: 짧은 대화에서 주제/요지/제목을 묻는 문제(1, 2, 10, 14)는 추론 요소가 부족. 대화문은 세부 내용 파악, 화자 의도 파악, 적절한 응답 고르기 등의 유형이 더 적합.
3. **빈칸추론 후반부 난이도 상향**: 26-35번은 원문 단어를 그대로 빈칸 처리하여 추론이 아닌 기억력 테스트. Paraphrase 선지 또는 추론 필요 위치 변경 권장.
4. **밑줄 어법 #119, #125 수정**: #119는 어법 오류가 아닌 내용 오류, #125는 performing도 문법적으로 정당하여 정답 없는 문제.

### 최종 판정

> **조건부 사용 가능 (CONDITIONALLY READY)**
>
> - 정답표 수정 전까지는 채점 불가
> - BAD 3문항 (#65, #119, #125) 교체 또는 수정 필요
> - WEAK 14문항은 현행 유지 가능하나 개선 권장
> - 위 수정 완료 시 내신대비 독해 워크북으로 충분히 활용 가능

---

*검토 완료: 2026-03-22*
