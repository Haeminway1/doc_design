# QA 보고서: L1 기초 문제 워크북

- 파일: `02_textbooks/output/html/wb-m3-L1-basic.html`
- 정답지: `02_textbooks/content/school/wirye-m3-ne/wb-m3-L1-basic-answers.html`
- 검수일: 2026-03-22
- 검수 수준: COMPREHENSIVE (전 문항 풀이 + 정답 대조 + 힌트 누출 + 문제 품질)

---

## 1. 요약

| 항목 | 결과 |
|------|------|
| 전체 문항 수 | 200 (A:50 + B:30 + C:30 + D:30 + E:20 + 보충 40) |
| 정답 오류 | **심각 -- Section A 정답키 Q10부터 전면 불일치** |
| 힌트 누출 | Section B/C 지시문-본문 불일치 (아래 상세) |
| BAD 문제 | 7건 |
| WEAK 문제 | 12건 |
| 판정 | **NOT READY -- 정답키 전면 재작성 필수** |

---

## 2. 힌트 누출 검사

### 2-1. Section B (문맥 오류 찾기, Q51-80 / Q151-160)

**지시문-본문 불일치 (CRITICAL)**

지시문: "다음 글의 **굵은 글씨** 부분 중 문맥상 어색한 것을 2개 찾아..."
본문 실제: passage-body 내부에 `<b>` 태그가 **전혀 없음**. 모든 텍스트가 일반체(plain text).

- 지시문이 "굵은 글씨 부분 중에서 고르라"고 하지만, 정작 본문에 굵은 글씨 후보가 표시되어 있지 않아 학생이 어디를 봐야 하는지 알 수 없음.
- **해결 방안**: (A) 오류 후보 단어들을 `<b>` 태그로 감싸서 표시, 또는 (B) 지시문에서 "굵은 글씨" 삭제하고 "문맥상 어색한 것"으로 변경.

**볼드 힌트 누출은 없음**: 오류 단어에만 볼드가 걸려 정답을 노출하는 현상은 발생하지 않음 (애초에 볼드가 전혀 없으므로).

### 2-2. Section C (어법 오류 찾기, Q81-110 / Q161-170)

**지시문-본문 불일치 (CRITICAL)**

지시문: "다음 글의 **밑줄 친 문장** 중 어법상 어색한 것을 2개 찾아..."
본문 실제: passage-body 내부에 `<u>`, `text-decoration: underline` 등 밑줄 서식이 **전혀 없음**.

- 지시문이 "밑줄 친 문장 중에서 고르라"고 하지만, 밑줄이 없어 학생이 오류 후보 문장을 식별할 수 없음.
- **해결 방안**: (A) 각 문장에 밑줄 서식 추가, 또는 (B) 지시문에서 "밑줄 친 문장" 삭제하고 "어법상 어색한 것"으로 변경.

**밑줄 힌트 누출은 없음**: 오류 문장에만 밑줄이 걸려 정답을 노출하는 현상은 없음.

### 2-3. Section A / 보충 A (이항 선택형)

힌트 누출 **없음**. 모든 선택지가 `<b>[옵션A / 옵션B]</b>` 형식으로 균일하게 볼드 처리됨. 정답 쪽에만 특별한 서식이 적용된 경우 없음.

### 2-4. Section D / E (영작 / 빈칸 채우기)

힌트 누출 **없음**. 빈칸과 키워드 박스가 정상 표시됨.

---

## 3. 정답 오류

### 3-1. Section A 정답키 -- 전면 불일치 (CRITICAL)

**Q1-Q9**: 정답키와 문제가 정확히 일치함. 이상 없음.

**Q10부터 Q50**: 정답키가 문제와 **체계적으로 어긋남**. 정답키의 값 자체는 본문 원문 기준으로는 올바른 어법 답이지만, 실제 문제 번호와 매칭되지 않음. 아래 전체 대조표 참조.

| Q# | 문제 선택지 | 올바른 정답 | 정답키 기재값 | 판정 |
|----|-----------|------------|-------------|------|
| 1 | [because / because of] | because of | because of | OK |
| 2 | [it / them] | them | them | OK |
| 3 | [found / finding] | found | found | OK |
| 4 | [interesting / interested] | interesting | interesting | OK |
| 5 | [meet / meeting] | meet | meet | OK |
| 6 | [Spain / Spanish] | Spanish | Spanish | OK |
| 7 | [to understand / understanding] | to understand | to understand | OK |
| 8 | [because / because of] | because | because | OK |
| 9 | [well / good] | well | that well | OK (문맥 포함) |
| **10** | **[to learn / learning]** | **to learn** | **to practice** | **WRONG** |
| **11** | **[to practice / practicing]** | **to practice** | **have changed** | **WRONG** |
| **12** | **[have changed / have been changing]** | **have changed** | **writing** | **WRONG** |
| **13** | **[have written / have been writing]** | **have been writing** | **used** | **WRONG** |
| **14** | **[are used / use]** | **are used** | **memorize** | **WRONG** |
| **15** | **[Learn / Learning]** | **Learn** | **try writing** | **WRONG** |
| **16** | **try [writing / to write]** | **writing** | **improve** | **WRONG** |
| **17** | **[improve / to improving]** | **improve** | **What's** | **WRONG** |
| **18** | **[What's / That's]** | **What's** | **familiar** | **WRONG** |
| **19** | **[familiar / familiarly]** | **familiar** | **watching** | **WRONG** |
| **20** | **[watching / to watch]** | **watching** | **get used to** | **WRONG** |
| **21** | **[get / getting] used to** | **get** | **try watching** | **WRONG** |
| **22** | **[fast / fastly]** | **fast** | **excited** | **WRONG** |
| **23** | **try [watching / to watch]** | **watching** | **without** | **WRONG** |
| **24** | **[excited / exciting]** | **excited** | **perfect** | **WRONG** |
| **25** | **[perform / performing]** | **perform** | **interested** | **WRONG** |
| **26** | **[are / is]** | **are** | **start** | **WRONG** |
| **27** | **[without / with]** | **without** | **one another** | **WRONG** |
| **28** | **[who / which]** | **who** | **Doing** | **WRONG** |
| **29** | **[interested / interesting]** | **interested** | **interested** | OK (우연 일치) |
| **30** | **[one another / ourselves]** | **one another** | **one another** | OK (우연 일치) |
| **31** | **[sing / singing]** | **sing** | **sing** | OK (우연 일치) |
| **32** | **[Doing / Do]** | **Doing** | **Doing** | OK (우연 일치) |
| **33** | **[is / are]** | **is** | **is** | OK |
| **34** | **[really / real]** | **really** | **really** | OK |
| **35** | **[Follow / Following]** | **Follow** | **Follow** | OK |
| **36** | **[how / what]** | **how** | **how** | OK |
| **37** | **[easily / easy]** | **easily** | **easily** | OK |
| **38** | **[watching / to watch]** | **watching** | **watching** | OK |
| **39** | **[been watching / watched]** | **been watching** | **been watching** | OK |
| **40** | **[really / real]** | **really** | **really** | OK |
| **41** | **[listening / listen]** | **listening** | **listening** | OK |
| **42** | **[to print / printing]** | **to print** | **to print** | OK |
| **43** | **[are / is]** | **are** | **hundreds** | **WRONG** |
| **44** | **[their / its]** | **their** | **motivated** | **WRONG** |
| **45** | **[learning / learn]** | **learning** | **enjoy** | **WRONG** |
| **46** | **[what / that]** | **what** | **hard** | **WRONG** |
| **47** | **[motivated / motivating]** | **motivated** | **at first** | **WRONG** |
| **48** | **[Remember / Remembering]** | **Remember** | **Remember** | OK (우연 일치) |
| **49** | **[bigger / more big]** | **bigger** | **bigger** | OK (우연 일치) |
| **50** | **[make / makes]** | **make** | **make** | OK |

**분석**: 정답키는 Q10의 답("to learn")이 누락되면서 Q10부터 1칸씩 밀림. Q29-Q35 부근에서 우연히 재정렬되지만, Q43부터 다시 밀림 발생. 정답키는 교재 원문 핵심어를 순서대로 나열한 것으로 보이며, 실제 문제 번호와 동기화되지 않았음.

**영향 범위**: Section A 50문항 중 **약 20문항의 정답이 틀림** (Q10-Q28, Q43-Q47).

### 3-2. Section B/C/D/E 정답키

Section B (Q51-80), C (Q81-110), D (Q111-140), E (Q181-200): 정답키 내용을 문제와 대조한 결과, **내용 자체는 올바름**. 번호 매칭도 정상. Section A만 문제.

### 3-3. 보충 섹션 정답키 (Q141-180)

보충 A (Q141-150), 보충 B (Q151-160), 보충 C (Q161-170), 보충 D (Q171-180): 정답키 내용 정상. 번호 매칭 정상.

### 3-4. Section C 정답키 세부 검증

| Q# | 문제 내 오류 | 정답키 교정 | 판정 |
|----|------------|-----------|------|
| 81 | "Many student learns" + "because school" | student learns -> students learn, because school -> because of school | OK (but 정답키에 #82 번호가 별도로 있어 혼란) |
| 83-84 | "favorite player" + "is practicing" | player -> players, practicing -> to practice | OK |
| 85-86 | "try to write" + "familiarly" | to write -> writing, familiarly -> familiar | OK |
| 87-89 | "that good" + "been wrote" + "Learning...and memorize" | good -> well, wrote -> writing, Learning -> Learn | OK |
| 90-91 | "That's" + "getting" | That's -> What's, getting -> get | OK |
| 92-93 | "exciting" + "singing" | exciting -> excited, singing -> sing | OK |
| 94-95 | "are do" + "to watch" | are do -> are doing, to watch -> watching | OK |
| 96-98 | "is" + "starting" + "Do" | is -> are, starting -> start, Do -> Doing | OK |
| 99-100 | "since a year" + "printing" | since -> for, printing -> to print out | OK |
| 101-102 | "have" + "much more bigger" | have -> has, much more bigger -> much bigger | OK |
| 103-105 | "because school" + "that good" + "have been changing" | because -> because of, good -> well, have been changing -> have changed | OK |
| 106-107 | "improving" + "to watch" | improving -> improve, to watch -> watching | OK |
| 108-110 | "do these things are" + "more easy" + "to watch/been watched" | do...are -> doing...is, easy -> easily, to watch -> watching + been watched -> been watching | OK |

---

## 4. BAD 문제 (오류/모호)

### BAD-1. Q11 -- 모호한 선택지
- 문제: `The best way to learn a new language is [to practice / practicing] it every day.`
- 이슈: "The best way ... is to practice" (to부정사 보어)가 정답이지만, "The best way ... is practicing"도 문법적으로 완전히 틀린 것은 아님 (동명사 보어). 중학교 수준에서는 혼란 유발 가능.
- 판정: **BAD** (모호)

### BAD-2. Q25 -- 두 선택지 모두 가능
- 문제: `I'm so excited to see my favorite Korean boy band [perform / performing].`
- 이슈: "see + 목적어 + V원형(지각동사)" = perform이 정답이지만, "see + 목적어 + V-ing"도 문법적으로 성립 (진행 중인 동작 강조). 정답키는 "perform"이어야 하나, 정답키 해당 번호(#25)에는 "interested"가 기재되어 이중 오류.
- 판정: **BAD** (모호 + 정답키 오류)

### BAD-3. Q54 -- 정답키 표기 혼란
- 문제: `I'm a small fan... my least favorite players...`
- 정답키: `(1) small -> big (2) least -> (삭제, 원문에 없음) favorite`
- 이슈: "(삭제, 원문에 없음)"이라는 설명이 정답키에 포함되어 있어, "least favorite"에서 "least"를 삭제하고 "favorite"만 남기라는 의미인데, 학생 입장에서 정답 작성 방법이 불명확.
- 판정: **BAD** (정답 표기 모호)

### BAD-4. Q63 -- 오류 단어 선정 모호
- 문제: `I'm so disappointed to see... I want to understand their songs without subtitles or originals though.`
- 정답키: `(1) ignore -> understand (2) bored -> excited`
- 이슈: 실제 문제 텍스트에는 "disappointed"와 "originals"가 오류인데, 정답키에는 "ignore"와 "bored"가 나옴. **정답키가 다른 버전의 문제를 참조**한 것으로 보임.
- 판정: **BAD** (정답키-문제 불일치)

### BAD-5. Q64 -- 정답키 불일치
- 문제: `You should find friends... we discourage one another... Doing these things is boring...`
- 정답키: `(1) enemies -> friends (2) discourage -> motivate`
- 이슈: 실제 문제에는 "enemies"가 없음 ("friends"가 이미 올바르게 사용됨). 오류는 "discourage"와 "boring"인데 정답키는 "enemies"를 참조. **정답키가 다른 버전의 문제와 매칭**.
- 판정: **BAD** (정답키-문제 불일치)

### BAD-6. Q65 -- 정답키 불일치
- 문제: `You should find enemies... sing alone.`
- 정답키: `(1) boring -> fun (2) worsens -> improves`
- 이슈: 실제 문제에는 "boring"과 "worsens"가 없음. "enemies"와 "alone"이 오류. **정답키가 다른 버전의 문제를 참조**.
- 판정: **BAD** (정답키-문제 불일치)

### BAD-7. Q66-68 -- 정답키 불일치 패턴
- Q66 문제에는 "worsens"와 "rarely"가 오류인데, 정답키는 "never -> often"과 "confuse -> understand"를 참조.
- Q67 문제에는 "long"과 "difficultly"가 오류인데, 정답키는 "rarely -> often"과 "difficulty -> easily"를 참조.
- Q68 문제에는 "Unfollow"와 "misunderstand"가 오류인데, 정답키는 "boring -> interesting"과 "ignore -> read"를 참조.
- 판정: **BAD** (3건 모두 정답키가 다른 문제 세트를 참조)

---

## 5. WEAK 문제 (너무 쉬움/뻔함)

### Section A 이항 선택형

| Q# | 문제 | 이유 |
|----|------|------|
| 3 | have [found / finding] | "have + p.p."는 기초 중의 기초. 오답 "finding"이 비문법적으로 너무 명백 |
| 5 | Let's [meet / meeting] | "Let's + V원형"은 초등 수준 문법 |
| 31 | translate songs and [sing / singing] | 병렬 구조가 너무 명백 (translate and sing) |
| 33 | Doing these things [is / are] | 동명사 주어 단수 취급은 기본 |
| 34 | [really / real] improves | 부사/형용사 구분이 너무 명백 |
| 37 | more [easily / easy] | "more + 부사" 패턴이 뻔함 |
| 40 | they're [really / real] interesting | Q34와 동일 패턴 반복 |
| 41 | help with [listening / listen] | 전치사 뒤 동명사는 기본 |
| 45 | way of [learning / learn] | 전치사 뒤 동명사 -- Q41과 동일 패턴 |
| 49 | much [bigger / more big] | 비교급 형태가 너무 기본적 |
| 50 | can [make / makes] | 조동사 뒤 원형은 초등 수준 |
| 142 | Learn... and [memorize / memorizing] | 병렬 구조가 Q31과 동일 패턴 |

---

## 6. 유형별 평가

### A. 이항 선택형 (Q1-50, 보충 Q141-150)

| 항목 | 평가 |
|------|------|
| 문제 품질 | 중상. 본문 기반 핵심 어법 포인트를 체계적으로 출제. 다만 같은 문장에서 위치만 바꾼 반복 출제가 다수 (Q10/Q11, Q24/Q25, Q33/Q34, Q46/Q47 등) |
| 난이도 분포 | 하~중. 중3 기초 수준에 적합하나 WEAK 문제가 12건으로 많은 편 |
| 정답키 | **CRITICAL -- Q10부터 약 20문항 정답 불일치. 전면 재작성 필요** |
| 개선 제안 | (1) 정답키를 문제와 1:1 재매핑 (2) WEAK 문제 일부를 더 변별력 있는 문항으로 교체 (3) 같은 문장 반복 줄이기 |

### B. 문맥 오류 찾기 (Q51-80, 보충 Q151-160)

| 항목 | 평가 |
|------|------|
| 문제 품질 | 중. 원문 대비 반의어/부적절어 삽입 방식이 일관됨 |
| 난이도 분포 | 중. 오류가 대부분 명백한 반의어여서 문맥 추론보다는 어휘력 테스트에 가까움 |
| 힌트 누출 | 볼드 힌트 누출은 없으나, **지시문에 "굵은 글씨"를 언급하면서 본문에 볼드가 없는 불일치가 심각** |
| 정답키 | Q51-62까지는 문제-답 매칭 정상. **Q63-Q68 구간에서 정답키가 다른 버전의 문제를 참조**하는 불일치 발견 (BAD-5~7). Q69-80, Q151-160은 정상 |
| 개선 제안 | (1) 지시문의 "굵은 글씨" 삭제 또는 본문에 볼드 후보어 추가 (2) Q63-Q68 정답키 재작성 (3) Q75-Q77은 3개 찾기로 난이도 변형 -- 좋은 시도 |

### C. 어법 오류 찾기 (Q81-110, 보충 Q161-170)

| 항목 | 평가 |
|------|------|
| 문제 품질 | 상. 다양한 어법 포인트(수일치, 시제, 준동사, 비교급, 병렬)를 종합적으로 출제 |
| 난이도 분포 | 중상. 복수 오류를 한 지문에서 찾아야 하므로 변별력 있음 |
| 힌트 누출 | 밑줄 힌트 누출은 없으나, **지시문에 "밑줄 친 문장"을 언급하면서 본문에 밑줄이 없는 불일치가 심각** |
| 정답키 | 내용 정상. 번호 매칭 정상. 설명이 상세하여 자기 채점에 도움됨 |
| 개선 제안 | (1) 지시문의 "밑줄 친 문장" 삭제 또는 본문에 밑줄 추가 (2) Q87-89, Q96-98 등 3개 찾기 문항은 난이도 조절에 효과적 |

### D. 키워드 영작 (Q111-140, 보충 Q171-180)

| 항목 | 평가 |
|------|------|
| 문제 품질 | 상. 키워드 힌트 + 빈칸 조합이 적절. 본문 핵심 문장을 고르게 출제 |
| 정답키 | 내용 정상. 정답 문장이 원문과 일치 |
| 개선 제안 | 특이사항 없음 |

### E. 본문 빈칸 채우기 (Q181-200)

| 항목 | 평가 |
|------|------|
| 문제 품질 | 중상. 핵심 표현 위주로 빈칸 배치가 적절 |
| 정답키 | 내용 정상 |
| 개선 제안 | 특이사항 없음 |

---

## 7. 필수 수정 사항 (배포 전)

### CRITICAL (반드시 수정)

1. **Section A 정답키 전면 재작성**: Q10부터 Q50까지 정답키를 실제 문제 번호에 맞게 재매핑. 현재 약 20문항의 정답이 틀림.
2. **Section B 지시문 수정**: "굵은 글씨 부분 중"을 삭제하거나, 본문 passage-body에 후보 단어 볼드 처리 추가.
3. **Section C 지시문 수정**: "밑줄 친 문장 중"을 삭제하거나, 본문 passage-body에 문장 밑줄 처리 추가.
4. **Section B Q63-Q68 정답키 재작성**: 현재 정답키가 실제 문제 텍스트와 불일치.

### HIGH (강력 권고)

5. **Q54 정답 표기 개선**: "(삭제, 원문에 없음)"이라는 애매한 설명 대신 명확한 교정문 제시.
6. **Q25 모호성 해소**: [perform / performing] 선택지에서 "see + O + V원형" 의도를 명확히 하거나, 오답 선택지를 "to perform" 등으로 변경.

### MEDIUM (개선 권고)

7. WEAK 문제 12건 중 일부를 변별력 있는 문항으로 교체 검토.
8. Section A에서 같은 문장의 위치만 바꾼 반복 출제 축소 (Q10/11, Q24/25, Q33/34 등).

---

## 8. 올바른 정답 (Section A Q1-50)

참고용으로 독립 풀이 결과 기재:

| Q# | 정답 | Q# | 정답 | Q# | 정답 | Q# | 정답 | Q# | 정답 |
|----|------|----|------|----|------|----|------|----|------|
| 1 | because of | 11 | to practice | 21 | get | 31 | sing | 41 | listening |
| 2 | them | 12 | have changed | 22 | fast | 32 | Doing | 42 | to print |
| 3 | found | 13 | have been writing | 23 | watching | 33 | is | 43 | are |
| 4 | interesting | 14 | are used | 24 | excited | 34 | really | 44 | their |
| 5 | meet | 15 | Learn | 25 | perform | 35 | Follow | 45 | learning |
| 6 | Spanish | 16 | writing | 26 | are | 36 | how | 46 | what |
| 7 | to understand | 17 | improve | 27 | without | 37 | easily | 47 | motivated |
| 8 | because | 18 | What's | 28 | who | 38 | watching | 48 | Remember |
| 9 | well | 19 | familiar | 29 | interested | 39 | been watching | 49 | bigger |
| 10 | to learn | 20 | watching | 30 | one another | 40 | really | 50 | make |
