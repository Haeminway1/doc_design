# Specimen: grammar-bridge-ch02

`grammar-bridge-ch02-xd` is the first reference specimen for `extravagantdocs`.

It is not just a sample output. It is the working specimen from which reusable rules are extracted.

## Canonical Inputs

- Manifest: `../../../../02_textbooks/books/grammar-bridge-ch02-xd.yaml`
- Build script: `../../../../04_scripts/build-textbook.js`
- Paged PDF script: `../../../../04_scripts/generate-textbook-pdf-paged.js`
- Template: `../../templates/grammar-bridge/grammar-bridge.css`
- Bridge: `../../bridges/grammar-bridge.css`

## What This Specimen Covers

- generated cover image workflow
- front explanation pages
- list-heavy grammar explanation pages
- FAQ presentation
- problem set hierarchy
- quick answers
- detailed explanations
- paged-native export

## Rules Extracted From This Specimen

- cover image and title treatment can belong to the template
- legacy explanation pages may need one-page contracts during migration
- problem number markers need a stable cross-template pattern
- inline highlight language should stay restrained and reference `verajin`
- quick answer grids must optimize scan speed, not raw compression
- explanation pages need stronger bottom safety than browser preview suggests

## Current Approval State

Approved direction:

- cover direction
- palette family
- general page rhythm
- `paged-native` as the future paged path

Still specimen-specific:

- grammar-bridge selector bridge
- some FAQ/list spacing patches
- formula panel styling that may later become a generic component

## Promotion Rule

When another chapter of `Bridge Grammar` can reuse a rule from this specimen without bridge-only selectors, promote that rule upward:

1. bridge -> template
2. template -> component
3. component -> page-system or foundation only if truly structural
