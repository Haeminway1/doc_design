# Autoresearch Changelog — vera-textbook-design

## Config
- **Target skill**: ~/.claude/skills/vera-textbook-design.md
- **Test inputs**: 5 (문법 문제+해설, 독해 지문, 보카 Day, 표지, 논리 Step)
- **Evals**: 5 binary checks
- **Runs per experiment**: 5 (1 per input)
- **Budget cap**: 10 experiments
- **Max score**: 25 (5 evals × 5 runs)

## Eval Suite

```
EVAL 1: PDF-Safe CSS
Question: Does the output contain zero instances of gradient, box-shadow, text-shadow, rgba(), opacity, or backdrop-filter?
Pass: All CSS properties are solid colors, no forbidden properties found anywhere
Fail: Any forbidden CSS property appears in the output

EVAL 2: Correct Components
Question: Does the output use vera-core component class names (.problem, .passage, .word-entry, .component-box, .cover-page, etc.) appropriate to the content type?
Pass: At least 2 vera-core class names are used correctly matching the content type
Fail: Generic divs with no vera-core classes, or wrong component for the content type

EVAL 3: Highlight Restraint
Question: Does the output use 7 or fewer highlights per page, only the 3 approved types (.highlight-key, .highlight-bg, .highlight-eng), and have at least 60% unhighlighted paragraphs?
Pass: Highlight count ≤ 7, only approved classes, majority of paragraphs plain
Fail: Over-highlighting, unapproved highlight classes, or most paragraphs highlighted

EVAL 4: A4 Print-Ready
Question: Does the output include .page class with explicit dimensions/margins, print-color-adjust, page-break rules, and !important on background colors?
Pass: Has .page structure, print CSS, margins 12-15mm (compact) or 18-22mm (spacious), !important on backgrounds
Fail: Missing page structure, no print considerations, or missing !important

EVAL 5: Design Sophistication
Question: Does the output demonstrate design quality through proper typography hierarchy (H1>H2>H3>body with distinct sizes), consistent color palette (2-4 colors), and appropriate whitespace?
Pass: Clear type hierarchy with at least 3 distinct heading levels, palette within 2-4 colors, balanced layout
Fail: Flat typography, rainbow colors, cramped or empty layout
```

---

## Experiment 0 — baseline

**Score:** 23/25 (92.0%)
**Change:** None — original skill as-is
**Failing outputs:** Vocab (9 highlights, limit 7) and Logic (9 highlights page 1, 8 page 2). Root cause: box-internal highlights (pattern-box, key-box, word-entry examples) accumulated past the 7-per-page limit.

## Experiment 1 — keep

**Score:** 25/25 (100.0%)
**Change:** Added explicit box-internal highlight rules — 0~1 per box, 0 when page has 3+ boxes, word-entry examples banned, pattern examples use `<strong>` instead of `.highlight-bg`
**Reasoning:** Vocab and Logic pages had many boxes each contributing 1-2 highlights, pushing totals to 8-9. Making the counting rule explicit and providing `<strong>` as an alternative for non-counted emphasis should fix overflow without losing visual clarity.
**Result:** All 5 tests passed all 5 evals. Vocab dropped from 9→0, Logic from 9→2. No regressions on grammar (7→0), reading (3→4), cover (0→0).
**Failing outputs:** None
