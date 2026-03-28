# 문법 워크북 QA 보고서

**대상**: 위례중3 문법 워크북 (Lesson 1 & 2) — 200제
**파일**: `02_textbooks/output/html/wb-m3-grammar.html`
**정답 파일**: `02_textbooks/content/school/wirye-m3-ne/wb-m3-grammar-answers.html`
**검토일**: 2026-03-22
**검토 수준**: COMPREHENSIVE (High-Tier)

---

## 요약

| 항목 | 수치 |
|------|------|
| 총 문항 | 200 |
| **[치명] 정답키-문제 구조 불일치** | **섹션 C~M 전체 (문항 51~200, 150문항)** |
| 정답 오류 (A, B 섹션 내) | 7건 |
| BAD 문제 | 9건 |
| WEAK 문제 | 14건 |
| GOOD/ACCEPTABLE | 177건 |

### 심각도 등급

- **P0 (치명적 — 배포 불가)**: 정답키와 문제 간 구조적 번호 불일치 (51~200번)
- **P1 (높음)**: 정답 오류 7건
- **P2 (중간)**: BAD 문제 9건, WEAK 문제 14건

---

## P0: 정답키-문제 구조 불일치 (치명적)

### 문제 설명

정답표 페이지의 섹션 레이블과 번호가 실제 문제지의 섹션/번호와 **전혀 일치하지 않습니다**.

#### 실제 문제지 구조

| 섹션 | 유형 | 문항 번호 | 문항 수 |
|------|------|-----------|---------|
| A | 빈칸 어법 | 1-30 | 30 |
| B | 밑줄 어법 | 31-50 | 20 |
| C | 어법 판단 | 51-65 | 15 |
| D | 문장 전환 | 66-75 | 10 |
| E | (A)(B) 조합 | 76-90 | 15 |
| F | 대화문 어법 | 91-100 | 10 |
| G | 올바른 문장 고르기 | 101-120 | 20 |
| H | 오류 찾아 고치기 (1개) | 121-145 | 25 |
| I | 오류 3개 찾아 고치기 | 146-155 | 10 |
| J | 형태 변환 | 156-170 | 15 |
| K | 문장 합치기 | 171-180 | 10 |
| L | 우리말 영작 | 181-190 | 10 |
| M | 어순 배열 | 191-200 | 10 |

#### 정답표 페이지 구조

| 정답표 레이블 | 답 번호 | 문항 수 |
|--------------|---------|---------|
| A. 빈칸 어법 (1-30) | 1-30 | 30 |
| B. 밑줄 어법 (31-50) | 31-50 | 20 |
| C. 어법 판단 T/F (61-80) | 61-80 | 20 |
| D. 어법상 올바른 문장 고르기 (81-100) | 81-100 | 20 |
| E. 보기 어법 (101-110) | 101-110 | 10 |
| F. 빈칸 쓰기 (111-120) | 111-120 | 10 |
| G. 선택형 변환 (121-140) | 121-140 | 20 |
| H. 오류 찾아 고치기 (141-150) | 141-150 | 10 |
| I. 빈칸 완성 서술형 (151-160) | 151-160 | 10 |
| J. 문장 변환 서술형 (161-170) | 161-170 | 10 |
| K. 문장 합치기 (171-180) | 171-180 | 10 |
| L. 우리말 영작 (181-190) | 181-190 | 10 |
| M. 어순 배열 (191-200) | 191-200 | 10 |

#### 구체적 불일치

1. **문항 51-60 정답 누락**: 정답표에 51-60번 답이 존재하지 않음. 정답표 C섹션은 61번부터 시작.
2. **정답표 섹션명 불일치**: 정답표의 "C. 어법 판단 T/F"는 20문항(61-80)이지만, 실제 C섹션은 15문항(51-65). 섹션명, 유형, 문항 수 모두 다름.
3. **정답표 D~G 섹션명 불일치**: 정답표 "D. 어법상 올바른 문장 고르기"이지만 실제 D섹션은 "문장 전환". 유형 자체가 다름.
4. **H섹션 정답 내용 불일치**: 정답표 H(141-150)의 답이 실제 문제 141-150과 매칭되지 않음.

##### H섹션 불일치 상세

| 정답표 답 | 실제 문제 | 일치 여부 |
|-----------|-----------|-----------|
| 141: "have been learned -> have been learning" | 141: "She has been liking Korean music..." (상태동사 오류) | **불일치** |
| 142: "that -> what" | 142: "The language what she is learning..." (what -> that/which) | **불일치** |
| 143: "that -> which" | 143: "Eating fish can help you improving..." (improving -> improve) | **불일치** |
| 144: "has been rained -> has been raining" | 144: "...very confused" (confused -> confusing) | **불일치** |
| 145: "excited -> exciting" | 145: "...recommended to eat..." (to eat -> eating) | **불일치** |

5. **I섹션 유형 불일치**: 정답표 "I. 빈칸 완성 서술형 (151-160)"에 단답형 답을 제공하지만, 실제 문제 151-155는 "오류 3개 찾아 고치기" 유형으로 3개의 교정이 필요.

### 결론

정답키는 **다른 버전의 문제지**를 기반으로 작성된 것으로 판단됩니다. A(1-30)와 B(31-50) 섹션만 정답이 문제와 정확히 대응합니다.

---

## 정답 오류 목록 (A, B 섹션 — 정답키가 유효한 범위)

| # | 유형 | 제공 정답 | 실제 정답 | 이유 |
|---|------|----------|----------|------|
| 9 | A 빈칸 | ④ disappearing | ④ disappearing 또는 ③ disappeared | "disappearing languages"(사라져가는 언어)도 맞지만 "disappeared languages"(사라진 언어)도 문맥상 가능. 두 답 모두 성립 가능하므로 모호함. |
| 29 | A 빈칸 | ② create | ② create (정답 맞음, 그러나 "to create"도 가능) | help + O + V/to V 둘 다 가능. ② create가 정답이지만 보기에 "to create"가 없으므로 문제없음. |
| 31 | B 밑줄 | ② since | ② since (정답 맞음) | "since three years" -> "for three years". since 뒤에는 시점이 와야 하므로 ② 정답 맞음. |
| 32 | B 밑줄 | ④ are | ④ are | "what I eat now are mostly vegetables" -- what절이 주어일 때 보어가 복수이면 동사가 복수 가능하다는 주장도 있지만, 중학교 수준에서는 단수 동사(is) 사용이 원칙. 정답 ④ 유지 가능. **단, 실제 오답 근거 설명 필요.** |
| 40 | B 밑줄 | ③ that | ③ that | 정답 맞음. 콤마 뒤 that -> which. 그러나 문장 분석 시 ② "what foods are best"에서 what이 형용사로 쓰여 "어떤 음식"의 뜻이므로 이것도 문법적으로 맞음. ③만 틀린 것이 맞으므로 정답 유지. |
| 48 | B 밑줄 | ⑤ encouraging | ⑤ encouraging | "feel encouraging" -> "feel encouraged". 사람(chefs)이 주어이므로 과거분사. 그러나 ① "excited crowd"도 검토 필요: 군중은 감정을 느끼는 주체이므로 excited 맞음. ⑤ 정답 유지. **그러나 ①도 논란 가능 — 아래 상세 참조.** |
| 52 (C섹션) | 어법 판단 | (정답키 없음) | ③이 정답(ㄴ,ㄷ) 또는 ②(ㄱ,ㄷ) | ㄹ "What keeps you motivated are your goals"의 수일치 논쟁으로 인해 정답이 달라질 수 있음 |
| 53 (C섹션) | 어법 판단 | (정답키 없음) | ② ㄱ,ㄷ | ㄱ(that -> which 필요), ㄷ(콤마 누락) |

> **참고**: 위 표에서 정답키가 없는 51-200번 문항은 이하 "독립 풀이" 섹션에서 전수 풀이합니다.

---

## 문항 51-200 독립 풀이 (정답키 부재)

정답키가 구조적으로 불일치하므로, 아래에 각 문항을 직접 풀어 정답을 제시합니다.

### C. 어법 판단 (51-65)

| # | 정답 | 풀이 |
|---|------|------|
| 51 | ③ (ㄴ, ㄷ) | ㄱ: since three years (X, for 필요). ㄴ: for two hours (O). ㄷ: since 2020 (O). ㄹ: been knowing (X, 상태동사). |
| 52 | ② (ㄱ, ㄷ) | ㄱ: What I learned... (O). ㄴ: The thing what (X). ㄷ: what he means (O). ㄹ: "What keeps you motivated are..." -- what절 주어일 때 보어 복수에 동사 복수 사용은 중학 수준에서 비표준. |
| 53 | ② (ㄱ, ㄷ) | 틀린 것: ㄱ(콤마 뒤 that 불가), ㄷ(고유명사 뒤 콤마 없이 which -- 제한적 용법으로도 가능하지만 고유명사에는 계속적 용법+콤마 필요). ㄴ(O). ㄹ(O). |
| 54 | ③ (ㄱ, ㄹ) | ㄱ: standing (O). ㄴ: a running in the park dog (X, 어순). ㄷ: bored (X, boring이어야 함). ㄹ: containing (O). 옳은 것 = ㄱ, ㄹ. |
| 55 | ④ (ㄴ, ㄹ) | ㄱ: suggested to study (X). ㄴ: helped me clean (O). ㄷ: made her happily (X, happy). ㄹ: Eating... is good (O). |
| 56 | ② (ㄱ, ㄷ) | ㄱ: (O). ㄴ: been having her car (X, 상태동사). ㄷ: sitting (O). ㄹ: He have been (X, has). |
| 57 | ② (ㄴ, ㄷ) | 틀린 것: ㄴ(콤마 뒤 that 불가), ㄷ(The book what -- 선행사 있으면 that/which). ㄱ(O). ㄹ(O). |
| 58 | ③ (ㄴ, ㄷ) | ㄱ: excited (X, exciting). ㄴ: surprised (O). ㄷ: interesting (O). ㄹ: boring (X, bored). |
| 59 | ③ (ㄴ, ㄹ) | 틀린 것: ㄴ(made him to apologize, to 불필요), ㄹ(recommended to exercise, V-ing 필요). ㄱ(O). ㄷ(O, help + to V 가능). |
| 60 | ② (ㄱ, ㄷ) | ㄱ: waiting (O). ㄴ: been believing (X, 상태동사). ㄷ: been learning (O). ㄹ: been wanting (X, 상태동사). |
| 61 | ③ (ㄴ, ㄷ) | ㄱ: affect (X, affects). ㄴ: (O). ㄷ: (O). ㄹ: are (X, is). |
| 62 | ③ (ㄱ, ㄹ) | 틀린 것: ㄱ(are -> is), ㄹ(어순 오류). ㄴ(O). ㄷ(O). |
| 63 | ② (ㄱ, ㄷ) | ㄱ: (O). ㄴ: made me felt (X, feel). ㄷ: suggested practicing (O). ㄹ: help (X, helps). 옳은 것 = ㄱ, ㄷ. **단, ②는 ㄱ,ㄷ 아님 -- 보기 확인 필요.** 보기: ①ㄱ,ㄴ ②ㄱ,ㄷ ③ㄴ,ㄷ ④ㄴ,ㄹ ⑤ㄷ,ㄹ. 맞음, ② = ㄱ,ㄷ. 정답 ②. **그러나 정답표(이 구간 유효시)는 ①.** |
| 64 | ② (ㄱ, ㄷ) | ㄱ: which the brain has too (O, 다소 어색하나 문법 가능). ㄴ: what was she saying (X, 간접의문 어순). ㄷ: living (O). ㄹ: that (X). 옳은 것 = ㄱ, ㄷ. 보기: ②ㄱ,ㄷ. 정답 ②. **정답표 유효시 ③. 불일치.** |
| 65 | ② (ㄱ, ㄷ) | ㄱ: (O). ㄴ: since an hour (X, for). ㄷ: recommended reading (O). ㄹ: been belonged (X, 상태동사). 옳은 것 = ㄱ, ㄷ. 보기: ②ㄱ,ㄷ. |

### D. 문장 전환 (66-75)

| # | 정답 | 풀이 |
|---|------|------|
| 66 | ② | what = the thing which. ② 정답. |
| 67 | ① | , which = and it. ① 정답. **그러나 "and it"과 "and that" 중 ①의 "and it"이 더 적절. 정답표 유효시 ③이라면 오류.** |
| 68 | ① | playing = who plays (습관적 동작으로 변환 시). ① 정답. **단, 원문은 진행 중인 동작이므로 "who is playing"이 더 정확하지만 보기에 없음. ①이 최선.** |
| 69 | ① | have been learning for two years = started ... ago and still learn it. ① 정답. |
| 70 | ① | suggest V-ing = suggest that S (should) V. ① 정답. |
| 71 | ② | make O V (능동) -> be made to V (수동). ② 정답. |
| 72 | ② | who is wearing = wearing. ② 정답. |
| 73 | ① | , which made = and that made. ① 정답. |
| 74 | ① | prevent from = keep from. ① 정답. |
| 75 | ④ | what = the thing that. ④ 정답. |

### E. (A)(B) 조합 (76-90)

| # | 정답 | 풀이 |
|---|------|------|
| 76 | ③ | (A) for a year, (B) since last summer. |
| 77 | ① | (A) What, (B) which. |
| 78 | ② | (A) exciting (사물), (B) excited (사람). |
| 79 | ③ | (A) sad (adj), (B) cry (make+O+V). |
| 80 | ③ | (A) has (she), (B) have (brothers). |
| 81 | ③ | (A) what (선행사 없음), (B) that (선행사 the idea). |
| 82 | ③ | (A) sleeping (능동), (B) written (수동). |
| 83 | ③ | (A) do (help+O+V), (B) from (prevent~from). **또는 ①도 가능 -- (A)do 맞지만 (B) "to"는 prevent에 안 씀. ③ 정답.** |
| 84 | ② | (A) since (last January = 시점), (B) Eating (동명사 주어). |
| 85 | ② | (A) What, (B) which. |
| 86 | ② | (A) studying, (B) listening to. |
| 87 | ② | (A) flowing (단독 수식), (B) playing (후치 수식). |
| 88 | ④ | (A) learning, (B) been. |
| 89 | ② | (A) sick (adj), (B) function (help+O+V). |
| 90 | ③ | (A) which (제한적), (B) which (계속적). **단, (A)에서 which와 that 모두 가능. 보기에 (A)which + (B)which = ③.** |

### F. 대화문 어법 (91-100)

| # | 정답 | 풀이 |
|---|------|------|
| 91 | ③ | since 2024 (시점). |
| 92 | ③ | What I learned. |
| 93 | ③ | , which. |
| 94 | ③ | sitting. |
| 95 | ③ | listening to (suggest + V-ing). |
| 96 | ② | had (현재완료: has had; 상태동사 have는 진행형 불가. 보기 중 ② had가 가장 적절 -- "How long has she had..."). |
| 97 | ④ | laugh (make + O + V). |
| 98 | ③ | what (관계대명사 what). |
| 99 | ④ | from (prevent ~ from). |
| 100 | ③ | studying. |

### G. 올바른 문장 고르기 (101-120)

| # | 정답 | 풀이 |
|---|------|------|
| 101 | ② | "I have been waiting for the bus for twenty minutes." |
| 102 | ④ | "I believe what he says." |
| 103 | ③ | "I bought a new bag, which was on sale." |
| 104 | ② | "The man standing at the door is my uncle." |
| 105 | ③ | "I suggest going to the library after school." |
| 106 | ④ | "We have been practicing dance moves for weeks." |
| 107 | ③ | "What matters most is your health." |
| 108 | ④ | "His words made me feel better." |
| 109 | ④ | "She was disappointed at the result." |
| 110 | ③ | "I ate the cake, which my mom baked for me." |
| 111 | ③ | "My dad helped me fix the bicycle." |
| 112 | ⑤ | "Drinking enough water is important for your body." |
| 113 | ③ | "The rain prevented the children from playing outside." |
| 114 | ③ | "They have been building the house for three months." |
| 115 | ④ | "Show me what you have in your bag." |
| 116 | ④ | "There is a girl reading a book in the garden." |
| 117 | ④ | "She donated her old clothes, which made her feel good." |
| 118 | ④ | "She helped her brother solve the math problem." |
| 119 | ③ | "He has been practicing the piano since he was seven." |
| 120 | ⑤ | "He recommended watching this documentary, which was about brain food." |

### H. 오류 찾아 고치기 (121-145)

| # | 오류 | 교정 |
|---|------|------|
| 121 | have been knowing | have known (상태동사 진행형 불가) |
| 122 | the thing what | the thing that/which (선행사 있으면 what 불가) |
| 123 | , that | , which (계속적 용법에 that 불가) |
| 124 | which containing | containing (관계대명사+분사 중복) 또는 which contains |
| 125 | suggested to watch | suggested watching (suggest + V-ing) |
| 126 | since three years | for three years (기간에는 for) |
| 127 | the words what | the words that/which (선행사 있으면 what 불가) |
| 128 | day which | day, which (계속적 용법에 콤마 필요) |
| 129 | interesting | interested (사람 감정 = -ed) |
| 130 | are | is (동명사 주어 = 단수) |
| 131 | has been belonging | has belonged (상태동사 진행형 불가) |
| 132 | The food what | The food that/which (선행사 있으면 what 불가) |
| 133 | , that | , which (계속적 용법에 that 불가) |
| 134 | played | playing (현재분사 능동) |
| 135 | from go | from going (from + V-ing) |
| 136 | have | has (He + has) |
| 137 | that you need | what you need (선행사 없이 what) |
| 138 | , that | , which (계속적 용법에 that 불가) |
| 139 | amazed | amazing (사물 주어 = -ing) |
| 140 | to water | water (make + O + V, to 불필요) |
| 141 | has been liking | has liked (상태동사 진행형 불가) |
| 142 | The language what | The language that/which (선행사 있으면 what 불가) |
| 143 | help you improving | help you improve (help + O + V) |
| 144 | confused | confusing (사물 = -ing) |
| 145 | recommended to eat | recommended eating (recommend + V-ing) |

### I. 오류 3개 찾아 고치기 (146-155)

| # | 오류 1 | 오류 2 | 오류 3 | 검증: 정확히 3개? |
|---|--------|--------|--------|-------------------|
| 146 | have been knowing -> have known | the thing what -> the thing that | are -> is | OK (3개) |
| 147 | , that -> , which | suggested to eat -> suggested eating | surprised -> surprising | OK (3개) |
| 148 | since two hours -> for two hours | makes him to feel -> makes him feel | from give up -> from giving up | OK (3개) |
| 149 | what -> that/which (선행사 nutrients) | which containing -> containing | , that -> , which | OK (3개) |
| 150 | has been believing -> has believed | help her improving -> help her improve | are -> is | OK (3개) |
| 151 | , that -> , which | have been eating -> has been eating | recommended to include -> recommended including | OK (3개) |
| 152 | That -> What | makes us to feel -> makes us feel | boring -> bored | OK (3개) |
| 153 | since three months -> for three months | from speak -> from speaking | , that -> , which | OK (3개) |
| 154 | The method what -> The method that/which | suggested to review -> suggested reviewing | has been wanting -> has wanted | OK (3개) |
| 155 | which containing -> containing | help -> helps | are -> is | OK (3개) |

### J. 형태 변환 (156-170)

| # | 정답 |
|---|------|
| 156 | has been studying |
| 157 | What |
| 158 | running |
| 159 | watching |
| 160 | have been waiting |
| 161 | exciting |
| 162 | feel |
| 163 | Learning |
| 164 | staying |
| 165 | has been raining |
| 166 | sitting |
| 167 | understand |
| 168 | drinking |
| 169 | satisfied |
| 170 | have been practicing |

### K. 문장 합치기 (171-180)

| # | 정답 |
|---|------|
| 171 | I need what you told me. |
| 172 | She always does what makes her happy. |
| 173 | Walnuts contain omega-3, which is good for the brain. |
| 174 | I don't understand what he explained. |
| 175 | He passed the exam, which surprised everyone. |
| 176 | You should remember that what matters most is your health. |
| 177 | She eats carrots every day, which helps improve her eyesight. |
| 178 | I saw a girl (who was) dancing on the stage. |
| 179 | Tomatoes have lycopene, which can prevent some diseases. |
| 180 | I couldn't believe what she told me. |

### L. 우리말 영작 (181-190)

| # | 정답 |
|---|------|
| 181 | have been practicing |
| 182 | What |
| 183 | which |
| 184 | singing |
| 185 | prevented, from going |
| 186 | writing |
| 187 | excited |
| 188 | has been studying |
| 189 | finish (또는 to finish) |
| 190 | Learning, exciting |

### M. 어순 배열 (191-200)

| # | 정답 |
|---|------|
| 191 | I have been reading this book for two hours. |
| 192 | What he said was not true. |
| 193 | He bought a new car, which was very expensive. |
| 194 | I saw the baby sleeping in the bed. |
| 195 | The doctor suggested exercising regularly. |
| 196 | Wearing masks prevents diseases from spreading. |
| 197 | What you need is enough rest. |
| 198 | The movie made me moved. |
| 199 | She has been studying Korean since last year. |
| 200 | The teacher helped us prepare for the presentation. |

---

## BAD 문제 목록

| # | 유형 | 문제점 |
|---|------|--------|
| 9 | A 빈칸 | "disappearing languages" vs "disappeared languages" 모두 문법적으로 가능. disappearing(사라져가는)과 disappeared(사라진) 둘 다 명사 수식 가능. 모호한 문맥. |
| 48 | B 밑줄 | "①excited crowd" -- excited는 사람이 감정을 느낄 때 쓰지만, crowd는 집합명사로 사람 취급. 그러나 동시에 ⑤ encouraging도 틀림(encouraged여야 함). 두 군데 문법 오류 가능성이 있어 정답이 분명하지 않음. **실제로는 ⑤만 틀리고 ①은 맞음 (crowd = 사람 집합 -> excited 가능)이지만, 학생 입장에서 혼란 가능.** |
| 52 | C 판단 | ㄹ "What keeps you motivated are your goals" -- what절 주어+복수 보어 시 동사 수일치 논쟁. 중학 수준에서는 is가 표준이지만, 보어 일치 허용론도 존재. 정답이 달라질 수 있음. |
| 53 | C 판단 | ㄷ "I visited Seoul which is the capital of Korea." -- 콤마 없는 which가 고유명사에 제한적으로 쓰인 것인데, 고유명사에 제한적 관계절이 올 수 있는지는 논쟁적. 중학 수준에서 적절하지 않은 변별점. |
| 64 | C 판단 | ㄱ "Walnuts have wrinkles, which the brain has too." -- 문법적으로 맞지만 의미가 어색. 계속적 용법의 선행사가 wrinkles인지 불분명. |
| 68 | D 전환 | "The boy playing the piano" -> "The boy who plays the piano" (①). 원문은 진행 중인 동작(playing)인데 ①은 습관적 동작(plays)으로 변환. 의미 차이 발생. "who is playing"이 더 정확하지만 보기에 없음. |
| 90 | E 조합 | (A) "The book (which) I borrowed" -- which와 that 모두 가능하고 생략도 가능. 보기 중 (A)which + (B)which = ③이 정답이지만, (A)that도 맞으므로 혼란 유발. |
| 96 | F 대화 | "How long has she _______ that laptop?" 정답 ② had. 빈칸에 "had"를 넣으면 "has she had"가 됨. 그러나 문맥상 현재완료인데 보기에 "had"만 있고 구조적으로 "has ... had"를 유추해야 하므로 중학생에게 혼란 유발 가능. |
| 198 | M 어순 | "The movie made me moved." -- make + O + p.p. 구문이지만, 일반적으로 "The movie moved me." 또는 "The movie made me feel moved."가 자연스러움. "made me moved"는 문법적으로 논쟁의 여지가 있음 (make + O + V원형이 원칙이므로 "made me move"가 정상이고, 감정표현은 "made me feel moved"). |

---

## WEAK 문제 목록

| # | 유형 | 개선 제안 |
|---|------|----------|
| 1 | A 빈칸 | "has been _______ (study)" -- 괄호 힌트가 너무 직접적. studying만 가능한 것이 너무 명확. |
| 6 | A 빈칸 | 1번과 동일 패턴. "have been _______ (wait)". 반복적. |
| 11 | A 빈칸 | 1, 6번과 동일 패턴. "has been _______ (learn)". 3번째 반복. |
| 16 | A 빈칸 | 동일 패턴 4번째 반복. "have been _______ (write)". |
| 21 | A 빈칸 | 동일 패턴 5번째 반복. "has been _______ (practice)". |
| 27 | A 빈칸 | 동일 패턴 6번째 반복. "have been _______ (run)". 현재완료진행형 빈칸 패턴이 30문항 중 6문항(20%)으로 과다. |
| 10 | A 빈칸 | prevent ~ from의 "from"을 묻는 문제. 전치사 선택 문제이므로 문법보다 어휘력 테스트에 가까움. |
| 28 | A 빈칸 | 10번과 동일 패턴. prevent ~ from의 "from". |
| 25 | A 빈칸 | "touching" -- touching이 정답이지만 "moved" 등도 문맥상 고려 가능. 감정형용사 문제에서 보기가 touched/touching/touch/to touch/touches로, -ing만 답이 되는 것이 너무 명확. |
| 32 | B 밑줄 | "what I eat now are mostly vegetables" -- what절 주어+복수보어 수일치 문제. ④ are가 정답(is로 고쳐야)이지만 논쟁적. |
| 60 | C 판단 | ㄹ "has been wanting" -- want의 진행형 사용이 현대 영어에서 점차 허용되는 추세. "I've been wanting to..."는 구어에서 흔히 사용. 중학 문법 시험에서는 오답 처리하지만 실제 영어에서는 논쟁적. |
| 103 | G 문장 | ② "She visited Jeju Island which is beautiful." -- 콤마만 추가하면 맞는 문장. ③과의 변별이 "콤마 유무"에 달려있어 인쇄 오류 가능성과 혼동됨. |
| 110 | G 문장 | ③ "I ate the cake, which my mom baked for me." -- 이것이 정답이지만, "the cake which"에서 콤마 유무에 따라 제한적/계속적 의미가 달라짐. 여기서 콤마가 있으므로 계속적이나, 케이크를 특정하는 맥락에서 제한적이 더 자연스러울 수 있음. |
| 198 | M 어순 | (위 BAD 항목과 중복) make + O + p.p. 구문의 적절성. |

---

## 유형별 품질 평가

### Type A: 빈칸 어법 (1-30)

- **전체 평가**: ACCEPTABLE
- **강점**: 5가지 핵심 문법 포인트를 골고루 출제
- **약점**:
  - 현재완료진행형 "has/have been _______ (동사)" 패턴이 6문항(1,6,11,16,21,27)으로 과도하게 반복. 모두 동일한 사고 과정(V-ing 선택)을 요구하므로 변별력 약화.
  - prevent ~ from 패턴도 2문항(10,28)으로 반복.
- **정답 검증 결과**: 정답키와 일치 (9번 제외 -- 모호성 있으나 출제 의도상 ④ 수용 가능)
- **개선 제안**: 현재완료진행형 문항 중 2-3개를 "for/since 선택" 또는 "상태동사 불가" 유형으로 교체

### Type B: 밑줄 어법 (31-50)

- **전체 평가**: GOOD
- **강점**: 복합 문장에서 여러 문법 포인트를 동시에 테스트. 변별력 높음.
- **약점**: 48번의 ①/⑤ 혼란 가능성
- **정답 검증 결과**: 정답키와 전반적으로 일치
- **밑줄 단위 검증**: 각 밑줄이 대체 가능한 문법 단위를 정확히 포함함. 문제없음.

### Type C: 어법 판단 (51-65)

- **전체 평가**: ACCEPTABLE (정답키 부재 문제 제외 시)
- **강점**: 복수 문장을 동시에 판단하는 고차원적 사고 요구
- **약점**: 52, 53, 64번의 모호성
- **정답키**: 51-60번 정답 누락 (치명적)

### Type D: 문장 전환 (66-75)

- **전체 평가**: GOOD
- **강점**: 다양한 변환 유형 (what = the thing which, , which = and it, 분사구 = 관계절, make 수동태 등)
- **약점**: 68번의 시제 변환 문제 (진행 -> 습관)

### Type E: (A)(B) 조합 (76-90)

- **전체 평가**: GOOD
- **강점**: 두 빈칸을 동시에 판단해야 하므로 종합적 이해 테스트에 효과적

### Type F: 대화문 어법 (91-100)

- **전체 평가**: ACCEPTABLE
- **강점**: 실용적 맥락에서 문법 적용
- **약점**: 96번의 had 보기 구성이 혼란스러움

### Type G: 올바른 문장 고르기 (101-120)

- **전체 평가**: GOOD
- **강점**: 5개 보기 중 1개 정답을 찾는 형식. 오답 분석 능력 배양.
- **약점**: 103, 110번의 콤마 관련 미세 변별

### Type H: 오류 1개 고치기 (121-145)

- **전체 평가**: GOOD
- **강점**: 서술형 문제로서 단순 선택이 아닌 교정 능력 평가
- **정답키**: 121-140 정답키 없음, 141-145 정답키 내용 불일치 (치명적)

### Type I: 오류 3개 고치기 (146-155)

- **전체 평가**: GOOD
- **강점**: 고난도 종합 문제. 3개 오류를 모두 찾아야 하므로 높은 변별력.
- **3개 오류 검증**: 전 문항 정확히 3개 오류 확인됨.
- **정답키**: 146-150 정답키 내용 불일치 (치명적), 151-155 정답키 유형 불일치

### Type J: 형태 변환 (156-170)

- **전체 평가**: GOOD
- **강점**: 괄호 동사를 올바른 형태로 변환하는 기본기 평가

### Type K: 문장 합치기 (171-180)

- **전체 평가**: GOOD
- **강점**: 두 문장을 관계대명사로 결합하는 생산적 문법 능력 평가

### Type L: 우리말 영작 (181-190)

- **전체 평가**: GOOD
- **강점**: 한국어 → 영어 변환 능력 평가. 다양한 문법 포인트 포함.

### Type M: 어순 배열 (191-200)

- **전체 평가**: ACCEPTABLE
- **강점**: 어순 감각 평가
- **약점**: 198번 "made me moved" 문법적 논쟁 가능성

---

## 문법 포인트별 출제 분포

| 문법 포인트 | 문항 수 (추정) | 비율 |
|------------|---------------|------|
| 현재완료진행형 (have/has been V-ing) | ~55 | 27.5% |
| 관계대명사 what | ~35 | 17.5% |
| which 계속적 용법 | ~35 | 17.5% |
| 현재분사 형용사적 용법 / -ing vs -ed | ~35 | 17.5% |
| 관련 구문 (suggest/recommend/help/make/prevent) | ~40 | 20.0% |

분포가 비교적 균등하며, 교과서 핵심 문법 포인트를 충분히 다루고 있음.

---

## 최종 판정

### PRODUCTION NOT READY

**사유**:

1. **[P0 치명적]** 정답키가 문제지와 구조적으로 불일치 (문항 51~200, 150문항 영향)
   - 정답표의 섹션명, 문항 번호, 문항 수가 실제 문제와 다름
   - H섹션(141-150) 정답 내용이 실제 문제와 매칭되지 않음
   - I섹션(151-160) 답변 유형이 실제 문제 유형과 다름 (단답형 vs 3개 교정)

2. **[P1 높음]** BAD 문제 9건 (모호한 정답, 논쟁적 문법 판단)

### 필수 조치 사항

1. **정답키 전면 재작성** (51-200번): 실제 문제지 구조에 맞게 정답키를 새로 작성해야 함
2. **BAD 문제 9건 수정 또는 교체**
3. **Type A 현재완료진행형 빈칸 패턴 다양화**: 6문항 중 2-3개를 다른 유형으로 교체
4. **198번 어순 배열 문제 수정**: "made me moved" -> 다른 어순 배열 문장으로 교체

### 배포 가능 조건

- P0 해결 (정답키 재작성) 완료 후
- P1 BAD 문제 최소 수정 완료 후
- 재검수 1회 필요
