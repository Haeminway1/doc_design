# Runtime vs Paged Parity

This document exists to stop the same renderer drift from recurring.

`runtime` and `paged-native` serve different purposes, but they must not diverge accidentally.

## Canonical Meanings

- `runtime`
  - fast browser review
  - fixed page shell
  - strong height and overflow contracts
- `paged-native`
  - paged.js review and PDF path
  - named pages and `@page` margins
  - true page breaking by the renderer

## What Must Match

- chapter order
- chapter/problem/endmatter order
- page background and paper/canvas separation
- cover asset usage
- chapter opener semantics
- TOC membership
- presence of quick answers and detailed explanations

These are product-level contracts, not optional visual similarities.

## What May Differ

- exact page count
- exact line wraps
- exact page break positions inside long flow content
- running header/footer implementation details

These differences are acceptable only if content is not lost and hierarchy still reads correctly.

## Current Known Risk Areas

### 1. Geometry Contract Split

`runtime` uses fixed page boxes and hidden overflow.

Source:

- `04_scripts/build-textbook.js`

Risk:

- content that fits in runtime can still shift in paged-native because paged-native uses `@page` margins, named pages, and renderer-driven breaking.

### 2. Shared Template / Bridge CSS

The same template and bridge layers currently style both renderers.

Sources:

- `03_system/extravagantdocs/templates/grammar-bridge/grammar-bridge.css`
- `03_system/extravagantdocs/bridges/grammar-bridge.css`

Risk:

- a rule added for runtime can leak into paged-native
- a rule added for paged-native can make runtime look correct for the wrong reason

### 3. Mixed Fixed and Flow Artifacts

`grammar-bridge` mixes:

- fixed cover / TOC / chapter opener / migrated legacy pages
- flow problem sets
- flow endmatter

Risk:

- if the fixed/flow boundary is unclear, paged-native can show clipping, drift, or wrong spacing

## Current Production Rule For Bridge Grammar

- HTML review path:
  - canonical review HTML uses `paged-native`
  - runtime survives only as an auxiliary fast preview
- Full-volume PDF path:
  - `paged-native` via chunked export

Do not use runtime HTML as the source artifact for final PDF.
Do not treat runtime HTML as the approval truth for `grammar-bridge` volumes.

## Mandatory Checks When Renderer Code Changes

1. Compare runtime HTML and paged PDF for:
   - cover
   - TOC
   - first chapter opener
   - first problem page
   - final quick-answer pages
   - final detailed explanation pages
2. If any mismatch is intentional, record it here.
3. If any mismatch is a bug, add an incident note.

## Current Intentional Differences

- Paged PDF uses chunked rendering for `grammar-bridge` volumes.
- Runtime preview does not use chunked rendering and exists only as `bookId-runtime.html`.
- Paged PDF owns final page numbering after chunk merge.
