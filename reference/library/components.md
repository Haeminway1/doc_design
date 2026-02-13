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

## 4. CSS Styles (Add to `basic_structure.html` if missing)

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
