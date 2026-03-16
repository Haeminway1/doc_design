# Incident: Grammar Bridge Runtime/PDF Drift

Date:

- 2026-03-10

Affected specimen:

- `grammar-bridge-vol1-xd`
- `grammar-bridge-vol2-xd`

Affected renderers:

- `runtime`
- `paged-native`

## Symptoms

- HTML review looked acceptable while PDF showed drift
- paged PDF sometimes lost or shifted content
- TOC and chapter opener rendering did not always match runtime intent
- full-volume paged export became unstable before chunked rendering was introduced

## Root Cause

This was not a single bug.

It was a stack of renderer-contract mistakes:

1. `runtime` and `paged-native` had different geometry models
   - `runtime` relied on fixed height and hidden overflow
   - `paged-native` relied on `@page`, named pages, and renderer-driven breaking
2. shared template and bridge CSS styled both renderers
   - fixes for one renderer could accidentally leak into the other
3. fixed artifacts and flow artifacts were mixed without a clear production rule
   - cover / opener / legacy pages behaved differently from problem and endmatter flows
4. there was no explicit parity document or incident log
   - the same class of mistake could recur without being recorded
5. fixed pages in paged-native temporarily lost the runtime shell padding contract
   - TOC and legacy explanation pages could visually stretch too far toward the right edge
6. `grammar-bridge` legacy explanation pages were more stable as paged sections than as forced fixed pages
   - when forced into fixed-page artifacts, paged output could show blank spill pages and misplaced lower rules
7. practice openers rendered as fixed artifacts inside chapter chunks were still eligible to land at the bottom of the previous explanation page
   - the renderer needed chunk-level separation, not just CSS `break-before`

## Fix

- Introduced chunked paged export for full-volume `grammar-bridge`
- Kept fixed artifacts fixed in paged-native
- Rendered long books as semantic chunks instead of one unstable paged session
- Re-applied continuous page numbering after chunk merge
- Restored fixed-page inner padding in the paged-native adapter for TOC and legacy pages
- Returned `grammar-bridge` legacy explanation pages to the paged section contract in paged-native
- Replaced paged-native chapter opener artifacts with dedicated paged opener sections
- Split `practice` openers into their own paged chunks so they always render as standalone pages
- Added renderer parity documentation
- Added incident logging as a required doc practice

## Prevention Rule

- Never assume HTML parity implies PDF parity
- Every renderer change must update:
  - `docs/05-renderers.md`
  - `docs/09-render-parity.md`
- Every user-facing renderer regression must create an `incidents/` note
- Compare both outputs at these anchors:
  - cover
  - TOC
  - chapter opener
  - practice opener
  - first problem page
  - endmatter
