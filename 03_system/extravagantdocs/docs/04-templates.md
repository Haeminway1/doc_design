# Templates Contract

Templates provide controlled identity to a document family.

## Current Templates

- `exam-paper`
- `grammar-bridge`

## Template Authority

Templates may own:

- display typography choices
- accent palette within the approved token family
- template-level emphasis rules
- cover personality
- specimen-specific cosmetic polish

Templates may not own:

- `@page` definitions
- core page geometry
- renderer-only fixes
- arbitrary legacy overrides that belong in a bridge

## Grammar Bridge Template Notes

The `grammar-bridge` template is the first serious specimen-derived template.

Its current identity:

- premium editorial textbook tone
- navy / gold / black / white core palette
- bright, controlled inline emphasis
- strong cover image with elegant title treatment
- serious exam / study hierarchy rather than casual workbook styling

## Exam Paper Template Notes

The `exam-paper` template is currently the reusable default for structured workbook migrations.

Its current role:

- chapter opener + problem-set books with minimal legacy HTML
- syntax or drill-oriented products that are more workbook than editorial textbook
- first-pass migration target when no bridge is needed

Current specimen using this path:

- `syntax-basic-xd`
- `reading-basic-xd`
- `vocab-basic-xd`
- `syntax-bridge-xd`
- `reading-bridge-xd`
- `reading-intermediate-xd`
- `logic-basic-xd`
- `grammar-basic-xd`
- `grammar-advanced-xd`

This means `exam-paper` is currently the default migration target for every non-`grammar-bridge` textbook family in the repository.

## Template Extraction Rule

When a specimen-specific choice proves reusable, move it out of the bridge and into the template or component layer.

If it is only a temporary selector patch for legacy markup, keep it in the bridge.
