# Incident: exam-paper blank interstitial pages

## Symptom

Some `exam-paper` migrations render suspicious blank interior pages in paged PDF output.

Confirmed examples:

- `grammar-basic-xd`
- `syntax-bridge-xd`

The pages are not intentionally blank cover/opener pages.
They appear between real content pages and break reading flow.

## Affected Renderers

- `paged-native` PDF

## Final Root Cause

The issue had two separate causes inside the `paged-native` path.

1. bare legacy fragments without a `.page` wrapper were falling back to runtime-style `.page.page--fixed.legacy-page` markup during paged-native build
2. fixed paged legacy artifacts were carrying an oversized one-page contract into paged.js
   - `break-after: page` on every fixed artifact amplified the problem
   - `min-height: 297mm` plus page padding made some artifacts taller than the actual page box

That combination created empty interstitial pages between otherwise valid content.

One more subclass remained after the first fix:

- `detailed-answer-section` legacy pages in `syntax-bridge-xd`

Those answer pages are structurally flow-friendly, but they were still being forced into one-page fixed artifacts. A long explanation page would slightly overflow, and paged.js would allocate a trailing blank page for the invisible remainder.

The final stable fix was:

1. route bare legacy fragments to paged-native legacy artifacts instead of runtime `.page` shells
2. remove the extra fixed-artifact `break-after`
3. remove the oversized fixed height contract from paged fixed legacy artifacts
4. treat `detailed-answer-section` legacy fragments as paged flow sections instead of fixed one-page artifacts

One last subclass remained after those fixes:

- `grammar-basic-xd` still had a blank page at the `CH 6` boundary between a fixed legacy page and the next dense theory page

That final page was caused by a boundary artifact, not by the theory content itself:

- the dense next page was correctly eligible for paged flow
- but paged running-header marker nodes were still emitted as sibling blocks before the flow section
- the sequence `fixed legacy -> running marker siblings -> flow legacy` was enough for paged.js to allocate a blank interstitial page

The final edge-case fix was:

5. allow dense bare legacy fragments to route through the paged flow heuristic even without a `.page` wrapper
6. move running-header marker nodes for flow sections inside the section as a hidden lead, so the section boundary stays single-piece for paged layout

Representative validation after the fix:

- `grammar-basic-xd` -> pass
- `syntax-bridge-xd` -> pass
- `reading-intermediate-xd` -> pass after routing `explanation-problem` legacy fragments through paged flow

One more QA finding surfaced after the blank-page fix:

- `grammar-bridge-ch01-xd` answer-grid pages were initially flagged as suspicious blanks by the anomaly detector

That turned out to be an audit false positive, not a renderer failure. The pages were valid quick-answer grids, but `pdftotext` extracted them mostly as short numeric and choice tokens. The detector was updated to recognize high-density numeric/choice pages as content-bearing.

Another nearby QA finding looked similar at first but was a different class of problem:

- `grammar-basic-xd` TOC pages rendered as title-only pages

That was not a paged.js blank-page regression. The semantic TOC upgrader was only reading children from `.page-content`, while the `grammar-basic` TOC source was a wrapper-less fragment with semantic `toc-*` classes directly under the body. The fix was to let the upgrader parse either `.page-content` or the bare body fragment, so semantic legacy TOCs upgrade consistently regardless of wrapper shape.

## What Was Fixed In The Same QA Pass

- generic `exam-paper` paged cover visibility improved
- cover/title treatment now appears clearly in paged PDF for books such as `reading-basic-xd` and `vocab-basic-xd`
- a deterministic anomaly detector was added so this regression is script-detectable
- the anomaly detector was calibrated so answer-grid pages are not misclassified as blank

## Detection Rule

Use:

```bash
node 04_scripts/audit-pdf-page-anomalies.js <bookId> [...]
```

This script flags suspicious interior pages that contain only headers/footers or almost no body content.

## Prevention Rule

- do not treat a full migration as visually done just because manifest/data/render-integrity audits pass
- run `audit-pdf-page-anomalies.js` on paged outputs during QA sweeps
- if a legacy fragment has no `.page` wrapper, never let paged-native fall back to runtime `.page` markup
- if a legacy fragment is semantically flow-friendly, prefer a paged section contract over a forced fixed-page artifact
- if a paged flow section needs running-header metadata, keep the marker nodes inside the section instead of emitting them as siblings ahead of the section boundary
- before broadening `exam-paper` rollout, verify representative legacy-heavy books such as `grammar-basic-xd` and `syntax-bridge-xd`
- when the anomaly detector flags numeric-heavy pages, inspect at least one sample page image before treating it as a renderer regression
- when a semantic TOC looks blank, verify whether the issue is parser coverage for wrapper-less fragments before changing paged layout CSS
