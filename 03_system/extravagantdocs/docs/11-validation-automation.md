# Validation Automation

This file defines what should be validated by script before asking AI or a human reviewer to interpret the output.

## Principle

If a failure can be checked deterministically, it should live in a script.

AI and human review should focus on:

- visual hierarchy
- pedagogical clarity
- design taste
- tradeoff decisions

Scripts should own:

- source existence
- manifest integrity
- output existence
- source-to-output traceability
- render structure sanity
- volume taxonomy consistency
- renderer-path correctness for `extravagantdocs`

## Current Validation Scripts

### 1. `validate-textbook-data.js`

Checks:

- missing sources
- empty JSON arrays
- missing problem numbers
- missing answers or explanations
- basic source/extraction coverage warnings

Targeted run:

```bash
node 04_scripts/validate-textbook-data.js <bookId> [...]
```

### 2. `audit-textbook-source-trace.js`

Checks:

- whether output artifacts can still be traced back to source assets
- whether extracted marker text survives into final output
- whether expected data assets are present
- whether `extravagantdocs` books are being audited against the correct `html_src` / paged PDF paths

Special handling:

- normalized `grammar-bridge` builds intentionally skip exact source marker matching
- shared-source `grammar-bridge` chapter books only use volume-level source marker checks

Targeted run:

```bash
node 04_scripts/audit-textbook-source-trace.js <bookId> [...]
```

### 3. `audit-render-integrity.js`

Checks:

- output HTML existence
- overflow markers in rendered HTML
- bad problem/answer ordering
- reading passage cluster integrity

Targeted run:

```bash
node 04_scripts/audit-render-integrity.js <bookId> [...]
```

### 4. `audit-grammar-bridge-taxonomy.js`

Checks:

- chapter-to-source-bundle consistency
- chapter-to-problem-bundle consistency
- missing problem bundles

Targeted run:

```bash
node 04_scripts/audit-grammar-bridge-taxonomy.js grammar-bridge-vol1 grammar-bridge-vol2
```

### 5. `validate-extravagantdocs-migration.js`

This is the orchestration entrypoint for new `extravagantdocs` migrations.

Checks:

- `extravagantdocs` manifest contract
- required paged-native outputs
- allowed `layoutRules`
- targeted audit script execution

Command:

```bash
node 04_scripts/validate-extravagantdocs-migration.js --build <bookId> [...]
```

Generated reports:

- `02_textbooks/reports/extravagantdocs-migration-validation.json`
- `02_textbooks/reports/extravagantdocs-migration-validation.md`
- `02_textbooks/reports/textbook-data-validation.json`
- `02_textbooks/reports/textbook-source-trace-audit.json`
- `02_textbooks/reports/textbook-render-integrity.json`

### 6. `audit-pdf-page-anomalies.js`

Checks:

- suspicious blank interior pages in paged PDFs
- pages that contain only running headers, running footers, or almost no body text

Targeted run:

```bash
node 04_scripts/audit-pdf-page-anomalies.js <bookId> [...]
```

Current use:

- QA sweep tool for paged output
- representative hard blocker detector for legacy-heavy paged migrations
- still not part of the universal hard migration gate, because heuristics should be calibrated book-family by book-family

Calibration notes:

- quick-answer grids can extract as dense numeric / choice-token pages in `pdftotext`
- the detector now treats high-density numeric/choice token pages as content-bearing so they do not get flagged as false blank pages
- keep this heuristic in sync with actual answer-grid designs when a family-specific answer layout changes
- when a TOC looks visually blank, inspect one rendered page image before assuming a renderer blank-page regression; wrapper-less semantic TOC fragments can fail at the parser layer while still passing broad PDF existence checks
- when this audit runs immediately after paged PDF generation, `pdftotext` can briefly race the writer and emit transient trailer/xref/empty-stream errors; the script now retries those specific errors automatically instead of requiring a second manual run
- when a blank page appears at a fixed-legacy -> flow-legacy boundary, inspect whether running-header marker nodes are emitted as sibling blocks before the flow section; that boundary can create a real blank interstitial page even if both neighboring content sections look valid in HTML

### 7. `audit-extravagantdocs-structure.js`

Checks:

- cover existence for books that expect a cover
- TOC existence for books that expect a TOC
- chapter opener counts by variant (`default`, `practice`, `endmatter`)
- quick-answer and detailed-explanation section presence when the manifest expects them
- basic frontmatter/endmatter order sanity in paged-native HTML

Targeted run:

```bash
node 04_scripts/audit-extravagantdocs-structure.js <bookId> [...]
```

Current use:

- detects structural drift that broad render-integrity checks can miss
- especially useful for migrated books that mix generated frontmatter with legacy fragments

Calibration notes:

- this audit intentionally checks presence and minimum order, not full visual correctness
- fixed and flow artifacts still need human review for density, hierarchy, and tone
- grammar-bridge style endmatter openers can contain both `빠른 정답` and `상세 해설` in the opener copy, so section ordering must be inferred from section markers, not raw string search

Current representative gate:

- run it at minimum on one structured book and one legacy-heavy book in the target family
- for `exam-paper`, the current representative books are:
  - `grammar-basic-xd`
  - `syntax-bridge-xd`

Known lessons from calibration:

- bare legacy fragments can create false renderer confidence if they silently fall back to runtime `.page` markup
- long legacy detailed-answer pages may need a paged flow contract instead of a fixed one-page contract
- numeric-heavy answer grids can create audit false positives if the detector only trusts long text lines

## When AI Should Still Be Used

AI should still help when the issue is not deterministic:

- whether a cover feels on-brand
- whether a hierarchy reads clearly
- whether a highlight treatment is tasteful
- whether a dense page feels teachable
- whether two possible layout rules are worth standardizing

## Working Rule

Before broad migration of another textbook family:

1. add deterministic checks to scripts first
2. document the script in this file
3. only then rely on AI or human review for the remaining subjective layer
