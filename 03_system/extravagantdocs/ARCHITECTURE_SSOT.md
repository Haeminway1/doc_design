# extravagantdocs Architecture SSOT

This document is the single source of truth for the `extravagantdocs` library namespace inside this repository.

Its role is to prevent drift while the project runs a parallel migration from the legacy `vera-core.css` stack.

## 1. Identity

`extravagantdocs` is a document-first framework, not a generic web UI kit.

Its architectural order is fixed:

1. Foundation
2. Page System
3. Components
4. Templates
5. Render Adapters

Anything that violates this order is considered architecture drift.

Compatibility bridges are allowed during migration, but they are not a sixth architecture layer.
They are temporary shims that map legacy markup to the new system.

## 2. Repository Scope

Canonical root:

- `03_system/extravagantdocs/`

Temporary compatibility root:

- `03_system/extravagantdocs/bridges/`

Phase 1 library entrypoints:

- `03_system/extravagantdocs/extravagantdocs.css`
- `03_system/extravagantdocs/templates/exam-paper/exam-paper.css`
- `03_system/extravagantdocs/templates/grammar-bridge/grammar-bridge.css`
- `03_system/extravagantdocs/adapters/pagedjs.css`

Phase 1 preview checkpoint:

- `03_system/extravagantdocs/examples/exam-paper-preview.html`

## 3. Ownership By Layer

### Foundation owns

- page size tokens
- margin tokens
- typography tokens
- spacing tokens
- color tokens
- print-safe global defaults
- reset behavior

Files:

- `foundation/tokens.css`
- `foundation/reset.css`
- `foundation/typography.css`
- `foundation/print.css`

Rules:

- Foundation may define tokens and neutral global defaults.
- Foundation must not define document-type-specific visuals.
- Foundation must not contain paged.js-only logic.

### Page System owns

- page box contract
- sheet/header/body/footer shell
- break utilities
- running header/footer source markers
- screen preview vs print shell behavior

Files:

- `page-system/page-box.css`
- `page-system/running.css`
- `page-system/breaks.css`
- `page-system/preview.css`

Rules:

- Page System is page-first and layout-contract-first.
- Page System must not own subject-specific component styling.
- Page System must remain valid without any template.

### Components own

- reusable content blocks
- table behavior
- callouts
- cover structure
- question blocks

Files:

- `components/section.css`
- `components/table.css`
- `components/callout.css`
- `components/cover.css`
- `components/question-block.css`

Rules:

- Components may consume tokens and page utilities.
- Components must remain template-agnostic.
- Components must be print-safe by default.

### Templates own

- controlled visual variation
- token overrides for a document family
- cosmetic emphasis that does not redefine page primitives

Files:

- `templates/exam-paper/tokens.css`
- `templates/exam-paper/exam-paper.css`

Rules:

- Templates may override color, font, and emphasis tokens.
- Templates must not redefine `@page`.
- Templates must not redefine `.xd-page` geometry.
- Templates must not encode renderer-specific behavior.

### Render Adapters own

- renderer-specific overrides
- paged.js margin boxes
- browser print normalization

Files:

- `adapters/pagedjs.css`
- `adapters/browser-print.css`

Rules:

- Renderer logic only belongs here.
- `@page` margin box content for paged.js belongs here.
- Adapter files must not become a dumping ground for template fixes.
- Runtime and paged-native parity assumptions must be recorded in docs before or with code changes.

### Bridges own

- temporary legacy markup mapping
- selector aliases from existing textbook HTML to `extravagantdocs` tokens
- migration-only compatibility work

Files:

- `bridges/grammar-bridge.css`

Rules:

- Bridges are temporary and must stay explicitly scoped.
- Bridges may style legacy classes, but they must consume `extravagantdocs` tokens.
- Bridges must not redefine template identity or renderer behavior.
- Once a specimen is fully migrated to native `xd-*` markup, its bridge should shrink or disappear.

## 4. Contract Between Legacy And New Stack

Current status:

- `03_system/vera-core.css` remains the production default.
- `03_system/extravagantdocs/` is introduced in parallel.
- No existing textbook manifest is migrated automatically in Phase 1.
- Opt-in manifests may use `book.styleSystem`, `book.styleTemplate`, and `book.styleBridge`.

Migration rule:

- New work for `extravagantdocs` goes into the new namespace first.
- Legacy fixes remain in legacy files unless they are part of a planned migration.
- Do not mix `vera-core.css` imports into `extravagantdocs.css`.
- Do not copy paged.js overrides back into legacy base files unless explicitly approved.

## 5. Print-Safe Non-Negotiables

The following remain prohibited in the new library for PDF-facing styles:

- `linear-gradient(...)`
- `box-shadow`
- `text-shadow`
- `rgba(...)`
- `opacity`
- `backdrop-filter`
- `background-blend-mode`
- legacy emoji markers in headings or component labels

Required defaults:

- solid colors only
- `!important` on PDF-critical declarations
- `break-inside: avoid` and `page-break-inside: avoid` together where cohesion matters
- explicit print color adjustment
- inline highlights may only use underline-style `linear-gradient(transparent XX%, color XX%)`

## 6. Renderer Parity Rule

`runtime` preview and `paged-native` PDF do not need identical implementation, but they must have an explicit documented relationship.

Required:

- `runtime` may own preview-only pagination helpers
- `paged-native` may own paged.js-only named pages and margin boxes
- any known visual mismatch between them must be recorded in `docs/09-render-parity.md`
- any discovered production regression must be recorded in `docs/incidents/`

Forbidden:

- silently relying on runtime CSS inside paged-native
- silently reusing template hacks to solve renderer drift
- changing renderer geometry without updating parity documentation
- highlight colors are restricted to the `verajin` passage palette: blue `#BBDEFB`, red `#FFCDD2`, green `#C8E6C9`
- highlight usage is for inline emphasis only, not for full explanation panel fills or loud block backgrounds

If a style looks good on screen but threatens deterministic PDF output, PDF safety wins.

## 6. Token Authority

Authoritative token source for `extravagantdocs` is:

- `foundation/tokens.css`

Template token overrides are allowed only for:

- accent colors
- display typography choices
- non-structural emphasis

Template token overrides are not allowed for:

- A4 dimensions
- default page margins
- core break utilities
- renderer rules

If structural tokens need to change, change `foundation/tokens.css` first and document the reason here.

## 7. Page Geometry Authority

Authoritative page shell source is:

- `page-system/page-box.css`

That file owns:

- `.xd-page`
- `.xd-page__sheet`
- `.xd-page__header`
- `.xd-page__body`
- `.xd-page__footer`

No other layer may redefine those selectors except render adapters, and only to neutralize them for renderer needs.

## 8. Renderer Authority

Authoritative paged.js source is:

- `adapters/pagedjs.css`

That file alone owns:

- `@page`
- `@page :left`
- `@page :right`
- named page rules for `xd-cover`
- margin box content

If paged.js behavior needs to change, do not patch component or template files first.
Change the adapter or the page-system contract.

## 9. Naming Rules

Namespace prefix:

- `.xd-`

Naming intent:

- `xd-page*` for page primitives
- `xd-section*`, `xd-table*`, `xd-callout*`, `xd-question*` for components
- `xd-template-*` for template scope classes

Do not introduce unprefixed classes in the new library unless they are external renderer hooks.

## 10. Approval Gates

The user requested a mandatory visual approval checkpoint before migration continues.

That means:

1. Build the non-breaking scaffold.
2. Produce a visual preview.
3. Ask for approval.
4. Only then begin wider component migration or build-pipeline integration.

No automatic production switch is allowed before that checkpoint.

## 11. Planned Next Steps After Visual Approval

1. Review the preview and correct spacing, typography, and page rhythm.
2. Add the next reusable core components needed by real textbook pages.
3. Add a non-breaking build hook so a book can opt into `extravagantdocs`.
4. Migrate one template-backed textbook page as the first live specimen.

## 12. Change Discipline

Whenever one of the following changes, update this file in the same patch:

- layer ownership
- token authority
- renderer authority
- migration rule
- naming convention
- approval workflow

If code and this file disagree, this file is the review baseline and the mismatch must be resolved immediately.

## 13. Documentation Architecture

This file is not the whole documentation system.

Supporting docs now live under:

- `03_system/extravagantdocs/docs/00-overview.md`
- `03_system/extravagantdocs/docs/01-foundation.md`
- `03_system/extravagantdocs/docs/02-page-system.md`
- `03_system/extravagantdocs/docs/03-components.md`
- `03_system/extravagantdocs/docs/04-templates.md`
- `03_system/extravagantdocs/docs/05-renderers.md`
- `03_system/extravagantdocs/docs/06-content-model.md`
- `03_system/extravagantdocs/docs/07-terminology.md`
- `03_system/extravagantdocs/docs/08-integrity-rules.md`
- `03_system/extravagantdocs/docs/specimens/grammar-bridge-ch02.md`
- `03_system/extravagantdocs/docs/checklists/review-gate.md`
- `03_system/extravagantdocs/docs/changelog.md`
- `03_system/extravagantdocs/docs/adr/ADR-0001-paged-native-build-path.md`

Documentation authority is split this way:

- This file defines ownership and non-negotiables
- `docs/05-renderers.md` defines renderer contracts
- specimen files define what one approved example is teaching the library
- ADR files define durable architecture decisions

If a renderer or build-path decision changes, update the matching doc as well as this file when ownership or authority is affected.
