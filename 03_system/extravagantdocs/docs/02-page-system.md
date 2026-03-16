# Page System Contract

The Page System makes `extravagantdocs` a document framework rather than a web UI kit.

## Authoritative Files

- `../page-system/page-box.css`
- `../page-system/running.css`
- `../page-system/breaks.css`
- `../page-system/preview.css`

## Owns

- page shell geometry
- page header/body/footer zones
- running header markers
- page break utilities
- preview canvas vs paper behavior

## Canonical Geometry

- Paper is A4
- Paper surface is white
- Screen preview may use a gray outer canvas to expose page boundaries
- Running header must have visible breathing room above content
- Footer must reserve defensive space for page number and bottom cuts

## Core Contracts

- `.xd-page*` selectors define the fixed page shell contract
- `.xd-paged-*` selectors define paged-native section contracts
- `keep-with-next`, `keep-together`, and break-avoid rules belong here before they belong in any template

## Spacing Rules

- Header content and first body heading must never visually collide
- Sparse pages should preserve top alignment while distributing remaining vertical space between major blocks and the final trailing space
- Intra-item spacing and inter-item spacing are separate concerns and must both be explicit

## Break Rules

- Section headings should not orphan at the page bottom
- Captions should not separate from their owner block
- Answer grids and explanation cards should stay intact when feasible
- `legacy-page` blocks may preserve one-page contracts during migration

## Migration Rule

If a page layout problem can be solved at the page-system level, do not patch it first in a template or bridge.
