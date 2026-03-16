# extravagantdocs Docs Overview

This directory is the documentation architecture for `extravagantdocs`.

It exists to prevent the library direction from drifting while the team moves from the legacy `vera-core.css` stack to a page-first document framework.

## Reading Order

1. `00-overview.md`
2. `../ARCHITECTURE_SSOT.md`
3. `01-foundation.md`
4. `02-page-system.md`
5. `03-components.md`
6. `04-templates.md`
7. `05-renderers.md`
8. `06-content-model.md`
9. `07-terminology.md`
10. `08-integrity-rules.md`
11. `09-render-parity.md`
12. `10-migration-playbook.md`
13. `11-validation-automation.md`
14. `12-migration-catalog.md`
15. `specimens/grammar-bridge-ch02.md`
16. `specimens/syntax-basic.md`
17. `checklists/review-gate.md`
18. `adr/ADR-0001-paged-native-build-path.md`
19. `incidents/`

## Document Roles

- `../ARCHITECTURE_SSOT.md`
  - Ownership, authority, and non-negotiable rules.
- `01-foundation.md`
  - Tokens, units, typography, and palette contract.
- `02-page-system.md`
  - Page geometry, margins, running headers, and break rules.
- `03-components.md`
  - Reusable document blocks and their print-safe constraints.
- `04-templates.md`
  - Template-level visual identity and template do/don't rules.
- `05-renderers.md`
  - Runtime preview, `paged-native`, and PDF renderer contracts.
- `06-content-model.md`
  - HTML fragment / JSON data / YAML manifest composition contract.
- `07-terminology.md`
  - Canonical meanings for volume, chapter, part, section, and source bundle.
- `08-integrity-rules.md`
  - Rules that keep editorial numbering and source IDs from drifting into each other.
- `09-render-parity.md`
  - Rules for keeping runtime HTML and paged PDF behavior aligned enough for review and production.
- `10-migration-playbook.md`
  - Repeatable migration order for turning an existing textbook into an `extravagantdocs` book.
- `11-validation-automation.md`
  - Script-owned validation scope and the canonical validator entrypoints.
- `12-migration-catalog.md`
  - Inventory of all current `-xd` books, their template path, and bridge usage.
- `specimens/grammar-bridge-ch02.md`
  - The first reference specimen used to extract reusable rules.
- `specimens/syntax-basic.md`
  - The first structured non-bridge workbook specimen.
- `checklists/review-gate.md`
  - Mandatory visual approval gate before broader rollout.
- `changelog.md`
  - Human-readable library evolution log.
- `adr/`
  - Architecture decisions that must survive personnel or context changes.
- `incidents/`
  - Short postmortems for renderer drift, regressions, and production-facing failures.

## Current Status

- Library namespace: `03_system/extravagantdocs/`
- First approved specimen family: `grammar-bridge`
- First clean workbook migration path: `syntax-basic-xd`
- First approved renderer direction: `paged-native`
- Legacy bridge still active: `bridges/grammar-bridge.css`
- Current migrated coverage: 22 `-xd` books across `grammar`, `syntax`, `reading`, `logic`, and `vocab`

## Working Rule

If code changes one of these, the matching doc must change in the same patch:

- layer ownership
- token contract
- page contract
- renderer contract
- runtime vs paged parity assumptions
- specimen scope
- approval gate
- known incidents or regressions

If implementation and docs disagree, docs are the review baseline until the mismatch is resolved.
