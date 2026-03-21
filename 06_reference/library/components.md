# 🧩 HTML/CSS Component Library for A4 Documents

> **Purpose**: Ready-to-use, copy-paste HTML components optimized for the A4 `basic_structure.html` template.
> **Usage**: AI should select appropriate components based on the content type.

---

## 1. Concept & Definition Boxes

### A. Standard Concept Box (Blue)
*Best for: Defining terms, introducing new concepts.*

```html
<div class="component-box concept-box">
    <div class="box-header">
        <span class="icon">📘</span>
        <span class="title">Concept: [Concept Name]</span>
    </div>
    <div class="box-content">
        <p><strong>Definition:</strong> [Clear definition of the concept]</p>
        <p class="mt-2">[Additional explanation or context]</p>
    </div>
</div>
```

### B. Key Takeaway Box (Green)
*Best for: Summarizing main points, "Remember this".*

```html
<div class="component-box key-box">
    <div class="box-header">
        <span class="icon">🔑</span>
        <span class="title">Key Takeaway</span>
    </div>
    <div class="box-content">
        <ul>
            <li>[Key point 1]</li>
            <li>[Key point 2]</li>
        </ul>
    </div>
</div>
```

### C. Warning/Caution Box (Orange)
*Best for: Common mistakes, warnings, "Watch out".*

```html
<div class="component-box warning-box">
    <div class="box-header">
        <span class="icon">⚠️</span>
        <span class="title">Caution</span>
    </div>
    <div class="box-content">
        <p>[Warning message or description of common pitfall]</p>
    </div>
</div>
```

---

## 2. Q&A and Examples

### A. Q&A Block
*Best for: FAQs, self-check questions.*

```html
<div class="qa-block">
    <div class="question">
        <span class="q-mark">Q.</span>
        <span class="q-text">[Question text goes here?]</span>
    </div>
    <div class="answer">
        <span class="a-mark">A.</span>
        <span class="a-text">[Answer text goes here. Keep it concise.]</span>
    </div>
</div>
```

### B. Example Code/Text Block
*Best for: Showing examples, especially for language or code.*

```html
<div class="example-block">
    <div class="example-label">Example</div>
    <div class="example-content">
        <p class="example-item">❌ [Incorrect Example]</p>
        <p class="example-item">✅ <strong>[Correct Example]</strong></p>
        <p class="explanation">👉 [Brief explanation of why]</p>
    </div>
</div>
```

---

## 3. Comparison Tables

### A. Simple Comparison (VS)
*Best for: Comparing two items.*

```html
<table class="comparison-table">
    <thead>
        <tr>
            <th class="col-a">[Item A]</th>
            <th class="col-b">[Item B]</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>[Feature of A]</td>
            <td>[Feature of B]</td>
        </tr>
        <tr>
            <td>[Feature of A]</td>
            <td>[Feature of B]</td>
        </tr>
    </tbody>
</table>
```

---

## 4. 편입영어 교재 전용 컴포넌트

> **아래 컴포넌트는 `02_textbooks/` 교재 시스템 전용입니다.**
> 마이그레이션 시 `03_system/components/` 에 개별 CSS 파일로 분리됩니다.

### A. 문제 블록 (Problem)
*Best for: 편입영어 객관식/주관식 문제.*

```html
<div class="problem">
    <div class="problem-header">
        <span class="problem-number">01</span>
        <span class="problem-type">문법</span>
    </div>
    <div class="problem-text">
        <p>다음 빈칸에 들어갈 가장 적절한 것을 고르시오.</p>
        <p class="eng-text">The committee _______ the proposal after a lengthy discussion.</p>
    </div>
    <ul class="problem-choices">
        <li>① approved</li>
        <li>② approving</li>
        <li>③ to approve</li>
        <li>④ approve</li>
    </ul>
</div>
```

**통일 매핑 (현재 → 표준):**
| 교재 | 현재 클래스 | 표준 클래스 |
|------|-----------|-----------|
| 문법 Bridge | `.problem-block > .problem-meta` | `.problem > .problem-header` |
| 독해 전체 | `.question-block > .question-number` | `.problem > .problem-header > .problem-number` |
| 논리 | `.problem > .problem-number` (p태그) | `.problem > .problem-header > .problem-number` (span) |
| 구문독해 | `.exercise-section > ol` (CSS counter) | `.problem > .problem-header > .problem-number` |

### B. 선택지 (Problem Choices)

```html
<ul class="problem-choices">
    <li>① option text</li>
    <li>② option text</li>
    <li>③ option text</li>
    <li>④ option text</li>
</ul>
```

**통일 매핑:**
| 교재 | 현재 클래스 | 표준 클래스 |
|------|-----------|-----------|
| 문법 Bridge | `.problem-choices > li > .choice-number` | `.problem-choices > li` |
| 독해 Basic | `.question-choices > li` | `.problem-choices > li` |
| 독해 Bridge | `.options-list > li` | `.problem-choices > li` |
| 논리 | `.choices > li` | `.problem-choices > li` |

### C. 독해 지문 (Passage)
*Best for: 영어 지문 + 해석 + 어휘.*

```html
<div class="passage">
    <div class="passage-header">
        <span class="passage-number">Passage 1</span>
        <span class="passage-source">2024 한양대</span>
    </div>
    <div class="passage-text eng-text">
        <p>The rapid advancement of artificial intelligence has prompted...</p>
    </div>
    <div class="vocab-section">
        <div class="vocab-list">
            <span class="vocab-item"><strong>prompt</strong> 촉발하다</span>
            <span class="vocab-item"><strong>advancement</strong> 발전</span>
        </div>
    </div>
</div>
```

### D. 단어 엔트리 (Word Entry — 보카 전용)
*Best for: 보카 교재의 개별 단어 항목.*

```html
<div class="word-entry" data-word="abundant">
    <div class="word-header">
        <span class="word-number">01</span>
        <span class="word-title eng-text">abundant</span>
        <span class="word-phonetic">[əbʌ́ndənt]</span>
        <span class="word-pos">adj.</span>
    </div>
    <div class="word-body">
        <p class="word-meaning">풍부한, 많은</p>
        <p class="word-example eng-text">Water is abundant in this region.</p>
        <p class="word-synonyms">= plentiful, ample, copious</p>
    </div>
</div>
```

### E. 해설 블록 (Explanation)
*Best for: 정답 해설, 오답 분석.*

```html
<div class="explanation">
    <div class="explanation-header">
        <span class="answer-badge">정답: ①</span>
        <span class="difficulty">★★☆</span>
    </div>
    <div class="explanation-body">
        <p>주어 'The committee'는 단수 취급하므로 단수 동사가 필요합니다.</p>
        <div class="wrong-analysis">
            <p>② approving — 동명사/현재분사로 주동사 역할 불가</p>
            <p>③ to approve — to부정사는 이 문맥에서 부적절</p>
        </div>
    </div>
</div>
```

### F. 정답 그리드 (Answer Grid)
*Best for: 챕터 끝 정답 일람표.*

```html
<div class="answer-grid">
    <div class="answer-grid-header">정답표</div>
    <div class="answer-grid-body">
        <span class="answer-item"><strong>1</strong> ①</span>
        <span class="answer-item"><strong>2</strong> ③</span>
        <span class="answer-item"><strong>3</strong> ②</span>
        <span class="answer-item"><strong>4</strong> ④</span>
    </div>
</div>
```

### G. 문법 규칙 박스 (Rule Box)
*Best for: 핵심 문법 공식, 판별법.*

```html
<div class="component-box rule-box">
    <div class="box-header">
        <span class="icon">📐</span>
        <span class="title">Rule: 주어-동사 수일치</span>
    </div>
    <div class="box-content">
        <p><strong>공식:</strong> 주어(S) + 동사(V) → 수 일치 필수</p>
        <p class="mt-2">집합명사(committee, family 등)는 단수 취급</p>
    </div>
</div>
```

### H. 함정/주의 박스 (Trap Box)
*Best for: 자주 틀리는 포인트, 출제 함정.*

```html
<div class="component-box trap-box">
    <div class="box-header">
        <span class="icon">🪤</span>
        <span class="title">Trap: 혼동 주의</span>
    </div>
    <div class="box-content">
        <p><strong>rise vs raise:</strong> rise는 자동사(스스로 오르다), raise는 타동사(올리다)</p>
    </div>
</div>
```

### I. Vera's Tip 박스 (Tip Box)
*Best for: 학습 팁, 암기법, 추가 설명.*

```html
<div class="component-box tip-box">
    <div class="box-header">
        <span class="icon">💡</span>
        <span class="title">Vera's Tip</span>
    </div>
    <div class="box-content">
        <p>이 패턴은 매년 2-3문제 이상 출제됩니다. 반드시 암기하세요!</p>
    </div>
</div>
```

### J. 표지 (Cover Page)
*Best for: 교재 첫 페이지.*

```html
<div class="page cover-page">
    <div class="cover-brand eng-text">vera's flavor</div>
    <div class="cover-content">
        <p class="cover-edition eng-text">Bridge Edition</p>
        <h1 class="cover-main-title">편입영어 문법</h1>
        <p class="cover-subtitle">Chapter 2: 동사의 시제</p>
    </div>
    <div class="cover-author">
        <span class="author-name">Vera Park</span>
    </div>
</div>
```

**표지 스타일 4종:**
| 스타일 | 특징 | 사용 교재 |
|--------|------|----------|
| `cover--border-frame` | 테두리+글래스모피즘 | 문법 Bridge |
| `cover--overlay` | 배경 이미지+오버레이 | 독해 Basic, 보카 |
| `cover--minimal` | 텍스트 중심+심플 | 구문독해 |
| `cover--full-bleed` | 전면 배경 | 문법 Advanced |

### K. 파트/유닛 시작 페이지 (Part Opener)
*Best for: 구문독해 Part, 보카 Day 시작 페이지.*

```html
<div class="page part-opener">
    <div class="part-number">Part 1</div>
    <div class="part-title">주어와 동사 찾기</div>
    <div class="part-subtitle">문장의 뼈대를 파악하는 핵심 기술</div>
</div>
```

### L. 단계별 학습 (Step Section — 논리 전용)
*Best for: 논리 교재의 단계별 학습 흐름.*

```html
<div class="step-section">
    <div class="step-header">
        <span class="step-number">Step 1</span>
        <span class="step-title">논리 연결어 파악</span>
    </div>
    <div class="step-content">
        <p>지문에서 however, therefore, moreover 등의 연결어를 먼저 찾으세요.</p>
    </div>
</div>
```

### M. 논리 패턴 박스 (Pattern Box — 논리 전용)
*Best for: 논리 연결어 패턴 정리.*

```html
<div class="pattern-box">
    <div class="pattern-title">인과 관계 패턴</div>
    <div class="connectors">
        <span class="connector">therefore</span>
        <span class="connector">consequently</span>
        <span class="connector">as a result</span>
        <span class="connector">hence</span>
    </div>
</div>
```

---

## 5. 컴포넌트 우선순위 (마이그레이션 Tier)

| Tier | 컴포넌트 | 파일명 | 사용 범위 |
|------|---------|--------|----------|
| **Tier 1** (전 교재 공통) | problem, problem-choices, explanation, answer-grid, cover, highlight, section-title, page-header, page-footer, toc | `components/*.css` | 전체 17개 |
| **Tier 2** (과목별 핵심) | concept-box, tip-box, warning-box, rule-box, trap-box, comparison-table, passage, word-entry, example-block | `components/*.css` | 과목별 |
| **Tier 3** (특수) | part-opener, day-title, step-section, pattern-box | `components/*.css` | 1-2개 교재 |

---

## 6. CSS Styles (Add to `basic_structure.html` if missing)

```css
/* Component Box Styles */
.component-box {
    border-radius: 4px;
    margin-bottom: 4mm;
    border: 1px solid transparent;
    overflow: hidden;
    break-inside: avoid;
}

.box-header {
    padding: 2mm 3mm;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 2mm;
    font-size: 10pt;
}

.box-content {
    padding: 3mm;
    font-size: 9.5pt;
}

/* Concept Box (Blue) */
.concept-box { border-color: #BFDBFE; }
.concept-box .box-header { background-color: #EFF6FF; color: #1E40AF; }
.concept-box .box-content { background-color: #F9FAFB; }

/* Key Box (Green) */
.key-box { border-color: #BBF7D0; }
.key-box .box-header { background-color: #F0FDF4; color: #166534; }
.key-box .box-content { background-color: #F9FAFB; }

/* Warning Box (Orange) */
.warning-box { border-color: #FED7AA; }
.warning-box .box-header { background-color: #FFF7ED; color: #9A3412; }
.warning-box .box-content { background-color: #FFFAF0; }

/* Q&A Block */
.qa-block {
    margin-bottom: 4mm;
    padding: 3mm;
    background-color: #F8F9FA;
    border-left: 3px solid #4B5563;
    break-inside: avoid;
}
.question { font-weight: 700; color: #111827; margin-bottom: 1mm; }
.q-mark { color: #DC2626; margin-right: 1mm; }
.a-mark { color: #059669; margin-right: 1mm; }

/* Example Block */
.example-block {
    margin-bottom: 4mm;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    break-inside: avoid;
}
.example-label {
    background-color: #F3F4F6;
    padding: 1mm 3mm;
    font-size: 8pt;
    font-weight: 700;
    color: #6B7280;
    text-transform: uppercase;
}
.example-content { padding: 3mm; }
.example-item { margin-bottom: 1mm; }
.explanation { font-size: 9pt; color: #6B7280; margin-top: 2mm; }

/* Comparison Table */
.comparison-table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
.comparison-table th { background-color: #F3F4F6; padding: 2mm; border: 1px solid #E5E7EB; }
.comparison-table td { padding: 2mm; border: 1px solid #E5E7EB; vertical-align: top; }
.col-a { color: #1E40AF; }
.col-b { color: #9A3412; }
```
