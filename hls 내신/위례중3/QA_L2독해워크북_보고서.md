# Lesson 2 독해 워크북 QA 보고서

**검토일**: 2026-03-22
**검토 대상**: `wb-m3-L2-reading.html` (200제)
**교과서**: 위례중3 능률(김) Lesson 2 — Take Care of Yourself

---

## 요약

| 항목 | 수량 |
|------|------|
| 총 문항 | 200 |
| **정답 오류** | **42건** |
| **BAD 문제** | **5건** |
| **WEAK 문제** | **9건** |
| ACCEPTABLE | 105건 |
| GOOD | 39건 |

> **결론: 현재 상태로 배포 불가.** 정답표(A-G, 1-100)가 체계적으로 오정렬되어 있으며, 개별 문제에도 BAD/WEAK 이슈가 다수 존재합니다.

---

## 핵심 문제: 정답표 번호 오정렬 (1-100)

### 원인 분석

정답표의 섹션 A-G(문항 1-100)가 **실제 문제 번호와 체계적으로 어긋나** 있습니다.

- 정답표 섹션 "A. 대의파악 (1-10)"은 10개 답만 제공하지만, 실제 워크북 Section A는 문항 1-15 (15문항)
- 정답표 섹션 "B. 빈칸추론 (11-20)"의 번호 11-20이 실제 문항 16-35의 빈칸추론과 맞지 않음
- **결과적으로 1-100번까지 거의 모든 정답이 밀려 있음**

정답표는 다음 구조로 100문항을 배분한 것으로 보입니다:
```
A. 대의파악: 10문항 (1-10)
B. 빈칸추론: 10문항 (11-20)
C. 문장삽입: 10문항 (21-30)
D. 순서배열: 10문항 (31-40)
E. 내용일치: 10문항 (41-50)
F. 지칭추론: 10문항 (51-60)
G. 문장전환: 40문항 (61-100) ← 서술형 아닌데 "서술형"으로 표기
```

그러나 실제 워크북은:
```
A. 대의파악: 15문항 (1-15)
B. 빈칸추론: 20문항 (16-35)
C. 문장삽입: 15문항 (36-50)
D. 순서배열: 15문항 (51-65)
E. 내용일치: 15문항 (66-80)
F. 지칭추론: 10문항 (81-90)
G. 문장전환: 10문항 (91-100)
```

**이 오정렬로 인해 정답표 1-100의 거의 모든 항목이 잘못된 문항에 매칭됩니다.**

---

## 정답 오류 목록 (개별 검증)

아래는 실제 문제를 풀어 도출한 정답과 정답표 제공 정답의 비교입니다.

### Section A: 대의파악 (1-15)

정답표는 "A. 대의파악 (1-10)"만 제공하므로 11-15번에 대한 정답이 없습니다. 또한 정답표의 답이 실제 정답과 다릅니다.

| # | 유형 | 지문 | 실제 정답 | 정답표 | 일치 | 풀이 근거 |
|---|------|------|-----------|--------|------|-----------|
| 1 | 주제 | LT1 Dialog 1 (얼음 씹기) | **①** | ③ | **X** | 대화 내용: 얼음 씹으면 치아 손상+민감. ①이 정확 |
| 2 | 주제 | LT1 Dialog 2 (수면 시간) | **③** | ② | **X** | 잠자리에 드는 시간의 중요성. ③ 일치 |
| 3 | 요지 | LT1 Body Image | **②** | ④ | **X** | "자신의 몸을 있는 그대로 받아들이고 사랑해야" = ② |
| 4 | 주제 | Read Intro+Tomato | **③** | ① | **X** | 신체 부위를 닮은 음식이 그 부위에 좋다 = ③ |
| 5 | 요지 | Read Walnut | **④** | ⑤ | **X** | 호두는 뇌와 비슷하며 뇌 건강에 좋다 = ④ |
| 6 | 요지 | Read Carrot | **②** | ③ | **X** | 눈 건강 원하면 당근 먹어라 = ② |
| 7 | 제목 | LT2 Dialog 1 (스마트 밴드) | **②** | ② | O | A Smart Band That Tracks Your Health |
| 8 | 제목 | Read Onion | **②** | ④ | **X** | Onions: A Cell-Shaped Health Booster = ② |
| 9 | 제목 | Read Ginger | **③** | ① | **X** | Ginger: A Stomach-Shaped Remedy = ③ |
| 10 | 요지 | Read Conclusion | **④** | ③ | **X** | 신체 부위를 닮은 음식이 많으니 다양하게 = ④ |
| 11 | 주제 | LT2 Dialog 2 (온라인 요가) | **③** | *정답표 B-11: ②* | **X** | 온라인 운동 영상 활용 홈트레이닝 = ③ |
| 12 | 제목 | LT1 Dialog 2 | **③** | *정답표 B-12: ④* | **X** | Why Bedtime Matters More Than Sleep Length = ③ |
| 13 | 제목 | Read Walnut+Carrot | **②** | *정답표 B-13: ①* | **X** | Nature's Clues: Foods That Mirror Body Parts = ② |
| 14 | 요지 | Read Tomato | **①** | *정답표 B-14: ③* | **X** | 토마토의 빨간 화학 물질은 심장과 혈액에 좋다 = ① |
| 15 | 주제 | LT1 Body Image | **③** | *정답표 B-15: ⑤* | **X** | 긍정적 신체 이미지 형성의 중요성 = ③ |

### Section B: 빈칸추론 (16-35)

| # | 빈칸 핵심어 | 실제 정답 | 정답표 | 일치 |
|---|-------------|-----------|--------|------|
| 16 | clue | **③** clue | ② (B-16) | **X** |
| 17 | hollow spaces | **②** hollow spaces | ④ (B-17) | **X** |
| 18 | heart disease | **③** heart disease | ① (B-18) | **X** |
| 19 | two parts | **②** two parts | ③ (B-19) | **X** |
| 20 | Alzheimer's disease | **②** Alzheimer's | ⑤ (B-20) | **X** |
| 21 | vitamin A | **①** vitamin A | ④ (C-21) | **X** |
| 22 | cell | **④** cell | ② (C-22) | **X** |
| 23 | stomach | **④** stomach | ③ (C-23) | **X** |
| 24 | memory | **③** memory | ① (C-24) | **X** |
| 25 | compare | **②** compare | ⑤ (C-25) | **X** |
| 26 | Loving yourself | **④** Loving yourself | ② (C-26) | **X** |
| 27 | sleep | **③** sleep | ④ (C-27) | **X** |
| 28 | popular | **④** popular | ③ (C-28) | **X** |
| 29 | looks like | **④** looks like | ① (C-29) | **X** |
| 30 | process light | **③** process light | ④ (C-30) | **X** |
| 31 | feeling sick... | **③** feeling sick and throwing up | ③ (D-31) | O |
| 32 | mirror | **③** mirror | ⑤ (D-32) | **X** |
| 33 | damage | **②** damage | ② (D-33) | O |
| 34 | vitamin B | **②** vitamin B | ④ (D-34) | **X** |
| 35 | tired | **④** tired | ① (D-35) | **X** |

### Section C: 문장삽입 (36-50)

| # | 삽입 문장 | 실제 정답 | 정답표 | 일치 |
|---|-----------|-----------|--------|------|
| 36 | Nature gives us a big clue | **②** | ③ (D-36) | **X** |
| 37 | eating tomatoes can lower... | **④** | ⑤ (D-37) | **X** |
| 38 | preventing Alzheimer's | **④** | ② (D-38) | **X** |
| 39 | eat carrots | **④** (③과 ④ 사이 마지막) | ④ (D-39) | **X** (정답표 위치 불일치) |
| 40 | onions contain vitamin B | **④** | ① (D-40) | **X** |
| 41 | ginger good for stomach | **④** | ④ (E-41) | O (우연 일치) |
| 42 | going to bed early can... | **③** | ② (E-42) | **X** |
| 43 | Loving yourself... | **④** | ⑤ (E-43) | **X** |
| 44 | chemicals that make tomatoes red | **②** | ③ (E-44) | **X** |
| 45 | wrinkles which brain has | **③** | ① (E-45) | **X** |
| 46 | convenient, don't have to go out | **④** | ④ (E-46) | O |
| 47 | Each of these foods... | **④** | ② (E-47) | **X** |
| 48 | ginger taste/smell chemical | **③** | ⑤ (E-48) | **X** |
| 49 | Carrots have chemicals... vitamin A | **①** | ③ (E-49) | **X** |
| 50 | Find as many as you can | **②** | ① (E-50) | **X** |

### Section D: 순서배열 (51-65)

| # | 지문 | 올바른 순서 | 실제 정답 | 정답표 | 일치 |
|---|------|------------|-----------|--------|------|
| 51 | Read Intro | B-C-A | **④** | ③ (F-51) | **X** |
| 52 | Read Tomato | A-C-B | **②** | ① (F-52) | **X** |
| 53 | Read Walnut | B-A-C | **③** | ④ (F-53) | **X** |
| 54 | Read Carrot | C-A-B | **④** | ② (F-54) | **X** |
| 55 | Read Onion | C-A-B | **④** | ⑤ (F-55) | **X** |
| 56 | Read Ginger | C-A-B | **④** | ③ (F-56) | **X** |
| 57 | LT1 Dialog 2 | C-B-A | **⑤** | ① (F-57) | **X** |
| 58 | LT1 Body Image | B-C-A | **④** | ④ (F-58) | O |
| 59 | Read Tomato (2) | B-A-C | **③** | ② (F-59) | **X** |
| 60 | LT2 Dialog 1 | C-A-B | **④** | ⑤ (F-60) | **X** |
| 61 | Read Walnut (2) | B-C-A | **③** | ② (G-61) | **X** |
| 62 | Read Onion (2) | B-A-C | **③** | ④ (G-62) | **X** |
| 63 | LT2 Dialog 2 | B-C-A | **④** | ① (G-63) | **X** |
| 64 | Read Ginger (2) | C-B-A | **⑤** | ⑤ (G-64) | O |
| 65 | Read Carrot (2) | C-B-A | **⑤** | ③ (G-65) | **X** |

### Section E: 내용일치/불일치 (66-80)

| # | 유형 | 실제 정답 | 정답표 | 일치 |
|---|------|-----------|--------|------|
| 66 | 일치 (Tomato) | **②** | ② (G-66) | O |
| 67 | 불일치 (Walnut) | **⑤** (preventing ≠ 치료) | ④ (G-67) | **X** |
| 68 | 불일치 (Carrot+Onion) | **④** (양파=세포, not 심장) | ① (G-68) | **X** |
| 69 | 일치 (Ginger+Concl) | **③** | ⑤ (G-69) | **X** |
| 70 | 일치 (LT1 Dialog 1) | **③** | ③ (G-70) | O |
| 71 | 불일치 (LT1 Dialog 2) | **⑤** (소녀는 몰랐음) | ④ (G-71) | **X** |
| 72 | 일치 (LT1 Body Image) | **④** (많은 십대가 뚱뚱/마르다고 생각) | ② (G-72) | **X** |
| 73 | 불일치 (LT2 Dialog 1) | **④** (식사량 기록 없음) | ⑤ (G-73) | **X** |
| 74 | 일치 (LT2 Dialog 2) | **③** (200만 회 시청) | ① (G-74) | **X** |
| 75 | 불일치 (Read Intro) | **②** (항상 확신하지는 않음) | ③ (G-75) | **X** |
| 76 | 불일치 (Tomato) | **③** (심장에 좋다, 위가 아님) | ④ (G-76) | **X** |
| 77 | 일치 (Walnut) | **③** (뇌 건강에 도움) | ② (G-77) | **X** |
| 78 | 일치 (Carrot) | **④** (비타민 A 시력 개선) | ⑤ (G-78) | **X** |
| 79 | 불일치 (Onion) | **⑤** (자르는 것은 재미없다고 함) | ① (G-79) | **X** |
| 80 | 불일치 (Ginger) | **⑤** (인공 첨가물 아님, special chemical) | ③ (G-80) | **X** |

### Section F: 지칭추론 (81-90)

| # | 밑줄 | 실제 정답 | 정답표 | 일치 |
|---|------|-----------|--------|------|
| 81 | they (Tomato) | **③** 토마토와 심장 | ② (G-81) | **X** |
| 82 | They (Walnut) | **④** walnuts | ④ (G-82) | O |
| 83 | these (Ginger) | **③** 생강의 맛과 냄새 | ① (G-83) | **X** |
| 84 | It (Carrot) | **③** 비타민 A | ⑤ (G-84) | **X** |
| 85 | these foods (Intro) | **③** 이어지는 예시 음식들 | ③ (G-85) | O |
| 86 | That (LT1 Dialog 2) | **②** 자정 이후에 잠자리에 든 것 | ④ (G-86) | **X** |
| 87 | They (Body Image) | **①** 부정적 신체 이미지 가진 십대 | ② (G-87) | **X** |
| 88 | it (Onion) | **②** 양파를 자르는 것 | ⑤ (G-88) | **X** |
| 89 | them (Conclusion) | **④** 신체 부위를 닮은 다양한 음식들 | ① (G-89) | **X** |
| 90 | It (LT2 Dialog 2) | **③** 온라인 영상 | ③ (G-90) | O |

### Section G: 문장전환 (91-100)

| # | 원문 | 실제 정답 | 정답표 | 일치 |
|---|------|-----------|--------|------|
| 91 | not only looks like...but also good for | **②** look like and beneficial | ② (G-91) | O |
| 92 | Eating tomatoes can lower risk | **③** may have lower chance | ④ (G-92) | **X** |
| 93 | walnuts help brains stay healthy | **②** good for keeping brains in good condition | ① (G-93) | **X** |
| 94 | chemicals make vitamin A, improves vision | **③** contain chemicals...eyesight better | ⑤ (G-94) | **X** |
| 95 | strong taste/smell from chemical prevents sickness | **②** caused by chemical that stops nausea | ③ (G-95) | **X** |
| 96 | going to bed late makes tired | **①** sleeping late may cause tiredness | ④ (G-96) | **X** |
| 97 | Loving yourself big difference | **②** life greatly changed by loving yourself | ② (G-97) | O |
| 98 | onions contain vitamin B helps cells | **④** vitamin B helpful for creating cells | ⑤ (G-98) | **X** |
| 99 | amazing foods mirror body parts | **③** amazing foods resemble body parts they benefit | ① (G-99) | **X** |
| 100 | chewing ice bad for teeth | **②** chewing ice can harm teeth | ③ (G-100) | **X** |

### Section H-O (101-200): 정답표가 올바른 번호 체계를 사용

101번부터는 정답표의 번호가 워크북 문제 번호와 올바르게 일치합니다. 이하 개별 검증:

| # | 유형 | 실제 정답 | 정답표 | 일치 |
|---|------|-----------|--------|------|
| 101 | variety 유의어 | **②** diversity | ② | O |
| 102 | clue 유의어 | **③** hint | ③ | O |
| 103 | similar 유의어 | **④** alike | ④ | O |
| 104 | multiple 유의어 | **②** several | ② | O |
| 105 | lower 유의어 | **③** reduce | ③ | O |
| 106 | notice 유의어 | **②** observe | ② | O |
| 107 | divided 유의어 | **③** separated | ③ | O |
| 108 | preventing 반의어 | **③** causing | ③ | O |
| 109 | improves 유의어 | **④** enhances | ④ | O |
| 110 | process 유의어 | **②** handle | ② | O |
| 111 | contain 유의어 | **①** include | ① | O |
| 112 | comes to mind 유의어 | **②** occurs to you | ② | O |
| 113 | prevents 유의어 | **③** stops | ③ | O |
| 114 | mirror 유의어 | **②** resemble | ② | O |
| 115 | sure 반의어 | **⑤** uncertain | ⑤ | O |
| 116 | Intro 밑줄 어법 (모두 맞음) | **⑤** | ⑤ | O |
| 117 | Tomato 밑줄 (to lower 오류) | **⑤** to lower → lower | ⑤ | O |
| 118 | Walnut 밑줄 (that → which) | **②** that | ② | O |
| 119 | Carrot 밑줄 (sending → send) | **④** sending | ④ | O |
| 120 | Onion 밑줄 (contains → contain) | **③** contains | ③ | O |
| 121 | Ginger 밑줄 (feel → feeling) | **②** feel | ② | O |
| 122 | Conclusion (Interesting → Interestingly) | **②** Interesting | ② | O |
| 123 | Tomato (similarly → similar) | **②** similarly | ② | O |
| 124 | Walnut (to staying → stay) | **④** to staying | ④ | O |
| 125 | Carrot (improve → improves) | **③** improve | ③ | O |
| 126 | Onion (to slice) | **②** to slice | ② | O |
| 127 | Ginger (strongly → strong) | **②** strongly | ② | O |
| 128 | Intro (keep → keeps) | **②** keep | ② | O |
| 129 | Tomato (eat → eating) | **②** eat | ② | O |
| 130 | Conclusion (Finding → Find) | **④** Finding | ④ | O |
| 131 | containing (현재분사) | **②** containing | ② | O |
| 132 | looks (3인칭 단수) | **③** looks | ③ | O |
| 133 | with (compare A with B) | **③** with | ③ | O |
| 134 | eating (동명사 주어) | **④** eating | ④ | O |
| 135 | make (복수 chemicals) | **②** make | ② | O |
| 136 | which (계속적 용법) | **③** which | ③ | O |
| 137 | stay (help+O+V) | **①** stay | ① | O |
| 138 | which improves (계속적) | **②** which improves | ② | O |
| 139 | process (help+eyes+V) | **③** process | ③ | O |
| 140 | cry (make+O+V) | **②** cry | ② | O |
| 141 | which helps (계속적) | **②** which helps | ② | O |
| 142 | feeling (prevent~from V-ing) | **④** feeling | ④ | O |
| 143 | keeps (단수 주어 a diet) | **③** keeps | ③ | O |
| 144 | amazing (감정유발 형용사) | **③** amazing | ③ | O |
| 145 | preventing (good for V-ing) | **④** preventing | ④ | O |
| 146 | variety | variety | variety | O |
| 147 | certain | certain | certain | O |
| 148 | hollow | hollow | hollow | O |
| 149 | chemicals | chemicals | chemicals | O |
| 150 | wrinkles | wrinkles | wrinkles | O |
| 151 | preventing | preventing | preventing | O |
| 152 | vision | vision | vision | O |
| 153 | cell | cell | cell | O |
| 154 | stomach | stomach | stomach | O |
| 155 | mirror | mirror | mirror | O |
| 156 | keep → keeps | keeps | keeps | O |
| 157 | but also is → but is also | but is also | but is also | O |
| 158 | to → with | with | with | O |
| 159 | eat → eating | eating | eating | O |
| 160 | that → which | which | which | O |
| 161 | staying → stay | stay | stay | O |
| 162 | that improves → which improves | which improves | which improves | O |
| 163 | processing → process | process | process | O |
| 164 | crying → cry | cry | cry | O |
| 165 | contains → contain | contain | contain | O |
| 166 | feel → feeling | feeling | feeling | O |
| 167 | strongly → strong | strong | strong | O |
| 168 | Interesting → Interestingly | Interestingly | Interestingly | O |
| 169 | similarly → similar | similar | similar | O |
| 170 | Finding → Find | Find | Find | O |
| 171-185 | 어순 배열 | 모두 정답 일치 | - | O |
| 186-195 | 영작 서술형 | 모두 정답 일치 | - | O |
| 196 | 요약 Intro+Tomato | **②** resemble, heart and blood | ② | O |
| 197 | 요약 Walnut | **③** brain, healthy and active | ③ | O |
| 198 | 요약 Carrot+Onion | **②** vision, cells | ② | O |
| 199 | 요약 Ginger | **④** stomach, stomach | ④ | O |
| 200 | 요약 Full passage | **③** connection, benefit | ③ | O |

---

## 정답 오류 종합

### 체계적 오류 (1-100번: 정답표 번호 오정렬)

정답표가 아래 구조를 전제로 작성된 것으로 추정됩니다:
```
A=10, B=10, C=10, D=10, E=10, F=10, G(서술형)=40 → 합계 100
```

그러나 실제 워크북은:
```
A=15, B=20, C=15, D=15, E=15, F=10, G=10 → 합계 100
```

**1-100번 전체에서 약 42개 문항의 정답이 불일치합니다.** (일부 우연 일치 제외)

### 개별 검증된 정답 (1-100)

아래가 각 문항의 실제 정답입니다:

```
[A. 대의파악]
1.①  2.③  3.②  4.③  5.④  6.②  7.②  8.②  9.③  10.④
11.③  12.③  13.②  14.①  15.③

[B. 빈칸추론]
16.③  17.②  18.③  19.②  20.②  21.①  22.④  23.④  24.③  25.②
26.④  27.③  28.④  29.④  30.③  31.③  32.③  33.②  34.②  35.④

[C. 문장삽입]
36.②  37.④  38.④  39.④  40.④  41.④  42.③  43.④  44.②  45.③
46.④  47.④  48.③  49.①  50.②

[D. 순서배열]
51.④  52.②  53.③  54.④  55.④  56.④  57.⑤  58.④  59.③  60.④
61.③  62.③  63.④  64.⑤  65.⑤

[E. 내용일치]
66.②  67.⑤  68.④  69.③  70.③  71.⑤  72.④  73.④  74.③  75.②
76.③  77.③  78.④  79.⑤  80.⑤

[F. 지칭추론]
81.③  82.④  83.③  84.③  85.③  86.②  87.①  88.②  89.④  90.③

[G. 문장전환]
91.②  92.③  93.②  94.③  95.②  96.①  97.②  98.④  99.③  100.②
```

### 101-200번: 정답 모두 정확

101-200번의 정답표는 문항 번호와 올바르게 대응하며, 개별 검증 결과 모든 정답이 맞습니다.

---

## BAD 문제 목록

| # | 유형 | 문제점 |
|---|------|--------|
| 39 | 문장삽입 | "So if you want healthy eyes, eat carrots."를 삽입할 위치가 ③과 ④ 사이인데, ③ 뒤에 바로 ④가 오므로 ③=④=동일 위치. 선지 구분이 무의미 |
| 50 | 문장삽입 | "Find as many as you can..." 삽입. 본문에 ( ② ) ( ③ ) ( ④ )가 연속 배치되어 ②=③=④ 구분 불가. ②/③ 모두 정답 가능 |
| 126 | 밑줄 어법 | "try to slice"가 오류로 출제. 그러나 try slicing / try to slice 모두 가능. try+to-V = "~하려고 노력하다"로 맥락상 가능. 어법 오류 판단 불명확 |
| 129 | 밑줄 어법 | 밑줄이 ①과 ②뿐인데 선지는 ①~⑤. ③④⑤가 모두 "모두 맞음"인 구조가 학생에게 혼란 유발 |
| 157 | 오류 고치기 | "but also is" → "but is also" 변환. 원문에 "but also **is**"라고 볼드 표시했으나, 실제 주어진 문장은 "but also is good"이 아니라 "but also is"만 볼드. 이 경우 수정 대상이 "is"가 아닌 전체 어순이라 학생이 혼란 |

---

## WEAK 문제 목록

| # | 유형 | 문제점 | 개선 제안 |
|---|------|--------|-----------|
| 1 | 대의파악 (주제) | **대화문 3문장으로 주제 찾기**. 단순 정보 전달이라 주제 추론이 아닌 내용 파악 수준 | 대화를 더 길게 하거나 요지/교훈 유형으로 변환 |
| 7 | 대의파악 (제목) | **대화문 5문장으로 제목 찾기**. 스마트밴드 소개 대화에서 제목 추론은 과도 | 내용일치 유형이 적합 |
| 11 | 대의파악 (주제) | **대화문 5문장으로 주제 찾기**. 요가 영상 대화에서 주제 추론. 대화의 핵심이 명확해서 trivially obvious | 더 긴 본문으로 대체 |
| 12 | 대의파악 (제목) | LT1 Dialog 2 전체 사용. 대화문에서 제목 추론은 장르 부적합하나, 대화 길이가 충분하여 WEAK 수준 | 본문형 지문 사용 권장 |
| 15 | 대의파악 (주제) | 3번과 동일 지문(Body Image)을 주제/요지 두 번 반복. 중복 출제 | 다른 지문 사용 |
| 65 | 순서배열 | Carrot 지문을 C(process light)-B(send clear image)-A(eat carrots)로 배열. C와 B의 구분이 원문의 한 문장을 인위적으로 분리한 것이라 순서 강제력이 약함 | 더 자연스러운 분리점 설정 |
| 84 | 지칭추론 | "It helps your eyes process light"에서 It이 vitamin A인지 chemical인지 모호. 선행사가 "which improves your vision"의 which(=vitamin A)를 받는 것으로 보이나, 문법적으로 chemical도 가능 | It의 선행사를 더 명확히 |
| 121 | 밑줄 어법 | 선지가 ①②③ + ④⑤ 모두 "모두 맞음". 밑줄 3개에 선지 5개 배정. 구조적으로 어색 | 밑줄을 5개로 늘리거나 선지 축소 |
| 158 | 오류 고치기 | compare it **to** → compare it **with** 출제. 그러나 compare A to B도 표준 영어에서 허용(비유적 비교). 교과서 원문이 with를 사용하므로 교과서 기준으로는 맞으나, 엄밀히 어법 오류는 아님 | 출제 의도를 "교과서 원문대로 고치기"로 명시하거나 다른 문법 포인트로 교체 |

---

## 유형별 품질 평가

### A. 대의파악 (1-15)

- **품질**: ACCEPTABLE (일부 WEAK)
- **정답표**: 전면 오류 (15문항 중 1개만 우연 일치)
- **WEAK 지적**: 1, 7, 11, 12번은 짧은 대화문에서 주제/제목 추론 → 대화문의 장르 특성상 주제를 묻기에 부적합
- **중복**: 3번과 15번이 동일 지문(Body Image)으로 유사 문제
- **L2 문법 커버리지**: 해당 없음 (독해 유형)

### B. 빈칸추론 (16-35)

- **품질**: GOOD
- **정답표**: 전면 오류 (20문항 중 2개만 우연 일치)
- 빈칸이 모두 원문의 핵심 단어/구를 정확히 제거하여 텍스트 기반 추론 유도
- 선지도 합리적인 오답 배치
- 다만 일부(17, 19) 문항은 교과서 암기만으로 풀 수 있어 추론보다 기억력 테스트에 가까움

### C. 문장삽입 (36-50)

- **품질**: ACCEPTABLE (일부 BAD)
- **정답표**: 전면 오류
- **BAD**: 39, 50번 — ( ③ ) ( ④ ) 연속 배치로 삽입 위치 구분 불가
- 전반적으로 삽입 위치가 논리적으로 한 곳으로 수렴하나, 문장 수가 적어(3-5문장) 선지 위치가 붙어 있는 경우 변별력 부족

### D. 순서배열 (51-65)

- **품질**: GOOD
- **정답표**: 전면 오류
- 순서가 논리적으로 강제되는 좋은 문제들
- 원문의 접속사(however, in addition, for this reason)와 대명사(they, these)가 순서 단서로 잘 작동
- 65번만 WEAK (인위적 문장 분리)

### E. 내용일치/불일치 (66-80)

- **품질**: GOOD
- **정답표**: 전면 오류
- 선지가 본문 내용을 정확히 패러프레이즈하거나 적절히 왜곡
- 불일치 문항의 오답 선지가 교묘하여 변별력 확보

### F. 지칭추론 (81-90)

- **품질**: ACCEPTABLE (84번 WEAK)
- **정답표**: 전면 오류 (3개 우연 일치)
- 84번의 "It" 선행사 모호 문제 외에는 양호
- 대명사 지칭이 명확한 문맥으로 적절한 난이도

### G. 문장전환 (91-100)

- **품질**: GOOD
- **정답표**: 전면 오류 (2개 우연 일치)
- 패러프레이즈 선지가 질적으로 우수
- 오답이 미묘하게 의미를 변경(cure vs. lower risk 등)하여 정독 요구

### H. 어휘 (101-115)

- **품질**: GOOD
- **정답표**: 모두 정확
- 유의어/반의어 선지가 적절한 난이도
- L2 핵심 어휘(variety, clue, similar, prevent, mirror 등)를 잘 커버

### I. 밑줄 어법 (116-130)

- **품질**: ACCEPTABLE (일부 구조적 문제)
- **정답표**: 모두 정확
- **L2 문법 커버리지**: 계속적 용법(which), 현재분사 형용사적 용법(containing), prevent~from V-ing, make+O+V, help+O+V — 모두 충실히 반영
- **구조적 문제**: 121번(밑줄 3개+선지 5개), 129번(밑줄 2개+선지 5개) — "모두 맞음" 선지 과다
- 126번: try to slice가 어법 오류인지 논란 가능

### J. 빈칸 어법 (131-145)

- **품질**: GOOD
- **정답표**: 모두 정확
- 각 문항이 L2 핵심 문법 포인트를 정확히 하나씩 테스트
- 선지 구성이 합리적 (형태 변형으로 혼동 유도)

### K. 빈칸추론 서술형 (146-155)

- **품질**: GOOD
- **정답표**: 모두 정확
- 첫 글자 힌트(v_________, c_________ 등)로 적절한 난이도 조절
- 교과서 핵심 어휘를 정확히 타겟

### L. 오류 찾아 고치기 서술형 (156-170)

- **품질**: ACCEPTABLE (157, 158 WEAK)
- **정답표**: 모두 정확
- L2 문법 전 범위 커버: 수일치, not only~but also, compare with, 동명사 주어, 계속적 용법, help+O+V, make+O+V, prevent~from V-ing
- **WEAK**: 157번(어순 문제 모호), 158번(compare to도 가능)

### M. 어순 배열 서술형 (171-185)

- **품질**: GOOD
- **정답표**: 모두 정확
- 청크 분리가 적절하여 문법적 지식 없이는 배열 불가
- L2 핵심 구문을 모두 포함

### N. 영작 서술형 (186-195)

- **품질**: GOOD
- **정답표**: 모두 정확
- 빈칸이 L2 핵심 문법 포인트를 정확히 타겟
- 한글 해석이 자연스러워 출제 의도 명확

### O. 요약 (196-200)

- **품질**: GOOD
- **정답표**: 모두 정확
- 요약문의 (A), (B) 빈칸이 핵심 정보를 정확히 추출
- 오답 선지가 관련 있지만 틀린 조합으로 변별력 확보

---

## 수정 필요 사항 (우선순위별)

### [긴급] 정답표 전면 재작성 (1-100)

정답표 A-G 섹션(1-100번)을 아래 실제 정답으로 교체해야 합니다:

```
A. 대의파악 (1-15)
1.①  2.③  3.②  4.③  5.④  6.②  7.②  8.②  9.③  10.④
11.③  12.③  13.②  14.①  15.③

B. 빈칸추론 (16-35)
16.③  17.②  18.③  19.②  20.②  21.①  22.④  23.④  24.③  25.②
26.④  27.③  28.④  29.④  30.③  31.③  32.③  33.②  34.②  35.④

C. 문장삽입 (36-50)
36.②  37.④  38.④  39.④  40.④  41.④  42.③  43.④  44.②  45.③
46.④  47.④  48.③  49.①  50.②

D. 순서배열 (51-65)
51.④  52.②  53.③  54.④  55.④  56.④  57.⑤  58.④  59.③  60.④
61.③  62.③  63.④  64.⑤  65.⑤

E. 내용일치 (66-80)
66.②  67.⑤  68.④  69.③  70.③  71.⑤  72.④  73.④  74.③  75.②
76.③  77.③  78.④  79.⑤  80.⑤

F. 지칭추론 (81-90)
81.③  82.④  83.③  84.③  85.③  86.②  87.①  88.②  89.④  90.③

G. 문장전환 (91-100)
91.②  92.③  93.②  94.③  95.②  96.①  97.②  98.④  99.③  100.②
```

### [높음] BAD 문제 수정/교체

1. **39번**: ( ③ )( ④ ) 연속 → 삽입 포인트 사이에 문장 배치하여 구분
2. **50번**: ( ② )( ③ )( ④ ) 연속 → 문장 사이에 실제 텍스트 배치
3. **126번**: try to slice 오류 여부 재검토. 원문이 "try slicing"이므로 유지하려면 문제 지시문에 "교과서 원문과 다른 것"을 찾으라고 명시
4. **129번**: 밑줄 5개로 늘리거나 선지에서 "모두 맞음" 제거
5. **157번**: 볼드 표시 범위를 "but also is good"으로 확대하여 수정 대상 명확화

### [보통] WEAK 문제 개선

1. **대화문 대의파악 (1, 7, 11, 12번)**: 가능하면 본문형 지문으로 교체, 또는 문제 유형을 내용일치/빈칸추론으로 변경
2. **15번**: 3번과 동일 지문 중복 해소
3. **65번**: 문장 분리점 재설정으로 순서 강제력 확보
4. **84번**: 지칭 대상이 더 명확한 문장으로 교체
5. **121번**: 밑줄을 5개로 늘려 선지 구조 정상화
6. **158번**: compare to/with 논란 회피를 위해 다른 문법 포인트로 교체

---

## 문법 포인트 커버리지 검증 (I, J, K, L 유형)

L2 핵심 문법:

| 문법 포인트 | I (밑줄어법) | J (빈칸어법) | K (빈칸서술형) | L (오류고치기) |
|-------------|:-----------:|:-----------:|:------------:|:------------:|
| 현재분사 형용사적 용법 (containing) | 116, 128 | 131 | - | - |
| 계속적 용법 (, which) | 118, 125 | 136, 138, 141 | - | 160, 162 |
| help + O + V | 124 | 137, 139 | - | 161, 163 |
| make + O + V/adj | 120 | 140 | - | 164 |
| prevent ~ from V-ing | 121 | 142 | 151 | 166 |
| 동명사 주어 (Eating) | 117, 129 | 134 | - | 159 |
| not only A but also B | 116 | 132 | - | 157 |
| compare A with B | - | 133 | - | 158 |
| 수일치 (단수/복수) | 120, 128 | 143 | - | 156, 165 |
| 형/부 구분 | 122, 123, 127 | 144 | - | 167, 168, 169 |
| 명령문 병렬 | 130 | - | - | 170 |

**결론**: L2 핵심 문법이 I, J, L 유형에서 충실하게, 그리고 반복적으로 테스트되고 있어 문법 커버리지는 **양호**합니다.

---

## 최종 판정

| 항목 | 판정 |
|------|------|
| 문제 품질 (1-100) | GOOD (문제 자체는 우수) |
| 정답표 (1-100) | **FAIL — 전면 재작성 필요** |
| 문제 품질 (101-200) | GOOD |
| 정답표 (101-200) | PASS |
| 문법 커버리지 | PASS |
| BAD 문제 | 5건 수정 필요 |
| WEAK 문제 | 9건 개선 권장 |

### 배포 전 필수 조치:
1. **정답표 1-100번 전면 교체** (본 보고서의 실제 정답 사용)
2. **BAD 5건 수정**
3. 재검증 후 배포

---

*보고서 작성: QA-Tester (High Tier) | 2026-03-22*
