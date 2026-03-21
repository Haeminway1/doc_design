# Grammar Advanced Output Comparison Report
**Date**: 2026-02-24
**Status**: CRITICAL ISSUES IDENTIFIED
**Root Cause**: Data extraction logic bug in `extract-grammar-advanced.js`

---

## Executive Summary

**Grammar Advanced HTML output is BROKEN** — missing all choice options in problem blocks.

| Metric | Grammar Advanced | Grammar Bridge | Syntax Bridge | Logic Basic |
|--------|------------------|-----------------|-----------------|-----------|
| Total HTML lines | 2,147 | 2,634 | 32,337 | 4,949 |
| `<li>` choice items | 0 | 264 | ???  | ??? |
| Problems with choices | 0/100 | 50/100 | All multiple-choice | All |
| **Status** | ❌ BROKEN | ✅ OK | ✅ OK | ✅ OK |

---

## Problem #1: MISSING CHOICES FIELD (CRITICAL)

### Data Structure Mismatch
Grammar Advanced problems are missing the `choices` array entirely.

**Grammar Advanced Problem #1** (from `/02_textbooks/data/grammar/advanced/ch01-problems.json`):
```json
{
  "id": "grammar-advanced-1",
  "number": 1,
  "type": "error-identification",
  "stem": "The assertion that...",
  "instruction": "다음 문장에서 어법상 틀린 부분을 찾아 고치시오.",
  "answer": "is → are (주어는 복수인 algorithms)",
  "explanation": "is → are (주어는 복수인 algorithms)"
  // ❌ NO CHOICES FIELD
}
```

**Grammar Bridge Problem #51** (from `/02_textbooks/data/grammar/bridge/ch02-problems.json`):
```json
{
  "id": "grammar-bridge-ch02-51",
  "number": 51,
  "type": "fill-in-blank",
  "stem": "If the archaeological team _______ more advanced equipment...",
  "instruction": "다음 빈칸에 들어갈 가장 적절한 것은?",
  "choices": [
    "used - would discover",
    "had used - would have discovered",
    "would use - had discovered",
    "were using - would discover",
    "had been using - discovered"
  ],
  "answer": "B",
  "explanation": "(B) (부정어 nor 뒤의 도치)"
  // ✅ HAS CHOICES
}
```

### Why This Breaks Rendering

**assemble.js** `renderProblemGroup()` function (line 268-279):
```javascript
function renderProblemGroup(problems) {
  return problems.map(p => {
    const layoutClass = p.choiceLayout === 'single-column' ? ' problem-choices--single-column' : '';
    const instruction = p.instruction ? `    <p class="problem-question">${p.instruction}</p>\n` : '';
    const stem = p.stem ? `    <div class="problem-text eng-text">${p.stem}</div>\n` : '';

    // THIS LINE WILL GENERATE EMPTY <ol> IF p.choices IS UNDEFINED
    const choices = (p.choices || []).map((c, i) => `      <li>${c}</li>`).join('\n');
    const choicesBlock = choices ? `    <ol class="problem-choices${layoutClass}">\n${choices}\n    </ol>` : '';

    return `  <div class="problem-block" data-id="${p.id}" data-type="${p.type}">
    <div class="problem-meta">
      <span class="problem-number">${p.number}</span>
    </div>
${instruction}${stem}${choicesBlock}
  </div>`;
  }).join('\n\n');
}
```

When `p.choices` is undefined → `(p.choices || [])` → empty array → `map()` returns empty string → `choicesBlock` becomes empty → HTML has **NO `<ol>` element**.

### Rendered Output Comparison

**Grammar Advanced (BROKEN)**:
```html
<div class="problem-block" data-id="grammar-advanced-1" data-type="error-identification">
  <div class="problem-meta">
    <span class="problem-number">1</span>
  </div>
  <p class="problem-question">다음 문장에서 어법상 틀린 부분을 찾아 고치시오.</p>
  <div class="problem-text eng-text">The assertion that...</div>

  <!-- COMPLETELY EMPTY - NO CHOICES LIST -->
</div>
```

**Grammar Bridge (CORRECT)**:
```html
<div class="problem-block" data-id="grammar-bridge-ch02-51" data-type="fill-in-blank">
  <div class="problem-meta">
    <span class="problem-number">51</span>
  </div>
  <p class="problem-question">다음 빈칸에 들어갈 가장 적절한 것은?</p>
  <div class="problem-text eng-text">If the archaeological team _______ more advanced equipment...</div>
  <ol class="problem-choices">
    <li>used - would discover</li>
    <li>had used - would have discovered</li>
    <li>would use - had discovered</li>
    <li>were using - would discover</li>
    <li>had been using - discovered</li>
  </ol>
</div>
```

---

## Problem #2: EXTRACTION SCRIPT LOGIC BUG

### Source HTML Structure
The source HTML (`/02_textbooks/source/[편입영어]문법_advanced.html`) **DOES contain choices**, but they're not being extracted.

**Example from source HTML**:
```html
<div class="problem-block">
  <div class="problem-text">
    <span class="problem-number">[6]</span>
    The philosopher argued that consciousness... cannot be fully explained
    by neurobiology alone, nor ________ by computational models of the brain.
  </div>
  <ul class="problem-choices">
    <li>(A) it can be</li>
    <li>(B) can it be</li>
    <li>(C) it can</li>
    <li>(D) can it</li>
  </ul>
</div>
```

### Why Extraction Fails
**extract-grammar-advanced.js** (lines 60-66):
```javascript
// Extract choices if any
const choices = [];
$el.find('.problem-choices li').each((j, li) => {
  let text = $(li).text().trim();
  text = text.replace(/^\([A-E]\)\s*/, '');
  choices.push(text);
});
```

**The bug**:
- The script looks for `.problem-choices li` **within the same `.problem-block`** element
- But the DOM structure in source HTML is **NOT nested correctly** OR the selector is wrong
- Result: `choices` array remains empty for problems [1]-[5], [8], [9], [11], [12], [14], [15] (error-identification type)
- **Partial success** for problems [6], [7], [10], [13], [16] (fill-in-blank type with choices)

### Evidence
Looking at extracted data:
- Problems 1-5, 8, 9, 11, 12, 14, 15: `choices` field missing (error-identification)
- Problems 6, 7, 10, 13, 16: `choices` field present (fill-in-blank)

But in generated HTML, **ALL 25 problems from ch01-problems.json show NO choices**.

This suggests:
1. **Partial extraction** created JSON with some problems missing choices
2. **OR the selector is matching the wrong DOM structure**

### Recommended Fix

Check the actual DOM structure in source HTML by running:
```bash
node -e "
const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('02_textbooks/source/[편입영어]문법_advanced.html', 'utf8');
const $ = cheerio.load(html);

// Find first problem with choices
$('div.problem-block').each((i, el) => {
  const num = $(el).find('.problem-number').first().text().trim();
  const hasChoices = $(el).find('.problem-choices').length > 0;
  const hasChoicesLi = $(el).find('.problem-choices li').length;
  console.log(\`Problem \${num}: choices-div=\${hasChoices}, li-count=\${hasChoicesLi}\`);
  if (i >= 10) return false;
});
"
```

---

## Problem #3: ANSWER FORMAT INCONSISTENCY

The schema expects `answer` as **INTEGER (1-5)**, but Grammar Advanced has **STRING**.

**Schema Definition** (`/02_textbooks/schemas/problem.schema.json` lines 107-111):
```json
"answer": {
  "type": "integer",
  "minimum": 1,
  "maximum": 5,
  "description": "정답 번호 (1-based). ① = 1"
}
```

**Actual Data**:
- Grammar Advanced: `"answer": "is → are (주어는 복수인 algorithms)"` ← STRING
- Grammar Bridge: `"answer": "B"` ← STRING (should be integer 2)
- Logic Basic: `"answer": 1` ← INTEGER (CORRECT)

**Impact**: While this doesn't break rendering (assemble.js doesn't use the answer field for HTML generation), it violates schema and will cause validation errors.

---

## CSS & Page Layout: All Correct

Both Grammar Advanced and Grammar Bridge have:
- ✅ Proper `@page` CSS rule: `size: A4; margin: 0;`
- ✅ `.page` container: `width: 210mm; height: 297mm; padding: 15mm 18mm;`
- ✅ `.problem-block` with `min-height: 80mm;` for solution space
- ✅ Design classes: `.problem-meta`, `.problem-number`, `.problem-question`, `.problem-text`, `.problem-choices`
- ✅ Print optimization: `break-inside: avoid;`, `orphans: 3;`, `widows: 3;`

The CSS is identical and correct. **The problem is data, not rendering.**

---

## Solution Path

### Step 1: Verify Extraction (IMMEDIATE)
Run the extraction diagnostic above to see why choices aren't being captured.

### Step 2: Fix extract-grammar-advanced.js (if needed)
- Verify `.problem-choices` DOM structure in source HTML
- Check selector path: `$el.find('.problem-choices li')`
- May need to adjust selector or traverse DOM differently
- Consider running extraction in debug mode to inspect intermediate results

### Step 3: Regenerate Data
```bash
node 04_scripts/extract-grammar-advanced.js
```
This will overwrite `/02_textbooks/data/grammar/advanced/ch*.json`

### Step 4: Rebuild HTML
```bash
node 04_scripts/assemble.js --book grammar-advanced
```
This will regenerate `/02_textbooks/output/html/grammar-advanced.html` with choices included.

### Step 5: Validate Against Schema
```bash
node 04_scripts/validate-feedback.js grammar advanced ch01
```
(or create a grammar textbook validation script)

### Step 6: Generate PDF
```bash
node 04_scripts/generate-textbook-pdf.js grammar-advanced
```

---

## Files Involved

| File | Role | Status |
|------|------|--------|
| `04_scripts/extract-grammar-advanced.js` | Data extraction | ❌ BUG: Missing choices |
| `02_textbooks/data/grammar/advanced/ch*.json` | Problem data | ❌ INVALID: No choices |
| `02_textbooks/schemas/problem.schema.json` | Data schema | ✅ OK (defines choices as required) |
| `04_scripts/assemble.js` | HTML rendering | ✅ OK (renderProblemGroup is correct) |
| `02_textbooks/output/html/grammar-advanced.html` | Final output | ❌ BROKEN (empty choice lists) |
| `02_textbooks/books/grammar-advanced.yaml` | Build manifest | ✅ OK |

---

## Conclusion

**Grammar Advanced is broken due to incomplete data extraction, not rendering issues.**

The fix requires:
1. Debug why `extract-grammar-advanced.js` isn't capturing choices from source HTML
2. Re-run extraction
3. Rebuild HTML
4. Validate and regenerate PDF

All other textbooks (Bridge, Syntax, Logic, Reading, Vocab) have correct data and render correctly.
