# Specimen: syntax-basic

`syntax-basic-xd` is the first clean non-bridge workbook specimen for `extravagantdocs`.

It matters because this book does not depend on a legacy selector bridge for its main content flow.

## Canonical Inputs

- Manifest: `../../../../02_textbooks/books/syntax-basic-xd.yaml`
- Build script: `../../../../04_scripts/build-textbook.js`
- Paged PDF script: `../../../../04_scripts/generate-textbook-pdf-paged.js`
- Template: `../../templates/exam-paper/exam-paper.css`

## What This Specimen Covers

- non-destructive `-xd` migration for a structured JSON-first book
- cover page through the generic `extravagantdocs` cover renderer
- chapter opener flow without a legacy bridge
- compact problem-set rendering across many units
- paged-native review path with no legacy explanation fragments

## Rules Extracted From This Specimen

- books with clean `cover + chapter-opener + problem-set` structure can migrate without a template bridge
- the `exam-paper` template is reusable for workbook-style syntax products
- migration should start from the simplest structured books before legacy-heavy books
- script validation is strong enough to gate this class of migration before visual review

## Current Approval State

Approved direction:

- `-xd` manifest strategy for structured syntax books
- `paged-native` review path
- validator-first migration gate

Still provisional:

- whether `exam-paper` remains the long-term workbook template name
- whether syntax workbooks need their own dedicated cover identity later

## Promotion Rule

If more syntax or reading workbooks can reuse this path without a bridge:

1. keep the migration rule in `10-migration-playbook.md`
2. keep the validator gate in `11-validation-automation.md`
3. only create a new template when the visual identity, not the structure, truly differs

This promotion has now happened in practice.

Sibling migrations using the same path:

- `syntax-bridge-xd`
- `reading-basic-xd`
- `reading-bridge-xd`
- `reading-intermediate-xd`
- `vocab-basic-xd`
- `logic-basic-xd`
- `grammar-basic-xd`
- `grammar-advanced-xd`
