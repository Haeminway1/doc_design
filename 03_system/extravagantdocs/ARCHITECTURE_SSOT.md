# extravagantdocs Architecture SSOT

This document is the single source of truth for the `extravagantdocs` library namespace inside this repository.

Its role is to define ownership, authority, and non-negotiable rules for the library.

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

Library entrypoints:

- `03_system/extravagantdocs/extravagantdocs.css`
- `03_system/extravagantdocs/templates/exam-paper/exam-paper.css`
- `03_system/extravagantdocs/templates/grammar-bridge/grammar-bridge.css`
- `03_system/extravagantdocs/adapters/paged-native.css`

Current status:

- First approved specimen family: `grammar-bridge`
- First approved renderer direction: `paged-native`
- Legacy bridge still active: `bridges/grammar-bridge.css`
- Current migrated coverage: 22 `-xd` books across `grammar`, `syntax`, `reading`, `logic`, and `vocab`

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

- `components/page-shell.css`
- `components/cover.css`
- `components/section.css`
- `components/toc.css`
- `components/paragraph.css`
- `components/problem.css`
- `components/explanation.css`
- `components/answer-grid.css`
- `components/example-list.css`
- `components/callout.css`
- `components/tip-box.css`
- `components/qa-card.css`
- `components/formula-card.css`
- `components/table.css`
- `components/grammar-table.css`
- `components/question-block.css`
- `components/word-entry.css`

Rules:

- Components may consume tokens and page utilities.
- Components must remain template-agnostic.
- Components must be print-safe by default.

### Templates own

- controlled visual variation
- token overrides for a document family
- cosmetic emphasis that does not redefine page primitives

Files (수동 작성):

- `templates/exam-paper/` — 시험지 스타일 (수동 작성)
- `templates/grammar-bridge/` — 문법 브릿지 시리즈 (수동 작성)

Files (토큰 파이프라인 생성 — `generate-template.js`):

- `templates/ocean-blue/`, `templates/sky-academic/`, `templates/earth-tone/`
- `templates/grammar-teal/`, `templates/logic-blue/`, `templates/mint-sky/`
- `templates/royal-purple/`, `templates/navy-gold/`
- `templates/amber-guild/`, `templates/carbon-linen/`, `templates/coral-dispatch/`
- `templates/folio-black/`, `templates/garnet-hall/`, `templates/graphite-gilt/`
- `templates/olive-manuscript/`, `templates/prussian-ink/`, `templates/samsung-midnight/`
- `templates/sapphire-codex/`, `templates/sky-academic/`, `templates/thistle-annotation/`

총 21개 템플릿. 신규 템플릿은 `node 04_scripts/generate-template.js --palette <1-100>`으로 생성.

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

- `adapters/paged-native.css` — Puppeteer PDF 렌더링 (주력)
- `adapters/browser-print.css` — 브라우저 인쇄 미리보기
- `adapters/pagedjs.css` — paged.js 폴리필 (레거시, 비활성)

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

- `extravagantdocs` is the primary system for XD manifests; `vera-core.css` handles legacy manifests via `assemble.js`.
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
- any known visual mismatch between them must be recorded in `docs/incidents/`
- any discovered production regression must be recorded in `docs/incidents/`

Forbidden:

- silently relying on runtime CSS inside paged-native
- silently reusing template hacks to solve renderer drift
- changing renderer geometry without updating parity documentation
- highlight colors are restricted to the `verajin` passage palette: blue `#BBDEFB`, red `#FFCDD2`, green `#C8E6C9`
- highlight usage is for inline emphasis only, not for full explanation panel fills or loud block backgrounds

If a style looks good on screen but threatens deterministic PDF output, PDF safety wins.

## 7. Token Authority

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

## 8. Page Geometry Authority

Authoritative page shell source is:

- `page-system/page-box.css`

That file owns:

- `.xd-page`
- `.xd-page__sheet`
- `.xd-page__header`
- `.xd-page__body`
- `.xd-page__footer`

No other layer may redefine those selectors except render adapters, and only to neutralize them for renderer needs.

## 9. Renderer Authority

Authoritative paged.js source is:

- `adapters/paged-native.css`

That file alone owns:

- `@page`
- `@page :left`
- `@page :right`
- named page rules for `xd-cover`
- margin box content

If paged.js behavior needs to change, do not patch component or template files first.
Change the adapter or the page-system contract.

## 10. Naming Rules

Namespace prefix:

- `.xd-`

Naming intent:

- `xd-page*` for page primitives
- `xd-section*`, `xd-table*`, `xd-callout*`, `xd-question*` for components
- `xd-template-*` for template scope classes

Do not introduce unprefixed classes in the new library unless they are external renderer hooks.

## 11. Terminology

Key terms and their canonical meanings:

- **Volume** — the publishable book unit (e.g. `grammar-bridge-vol1`). Top-level editorial product. May contain multiple chapters.
- **Chapter** — learner-facing major instructional unit inside a volume. Editorial numbering; what the student sees. Must not be inferred from source bundle IDs.
- **Part** — editorial subdivision label inside a volume. Display taxonomy only; do not assume `part === chapter`. Legacy `Part N` labels in Bridge Grammar are deprecated; canonical display term is `Chapter N`.
- **Source Bundle** — internal extracted content family used by the build pipeline (e.g. `ch01`, `ch02`). Implementation identifiers only; never shown to end users as editorial numbers.
- **Page Kind** — rendering role declared in YAML (e.g. `cover`, `legacy-page`, `problem-set`, `answer-grid`, `explanations`). Controls rendering behavior; does not define editorial hierarchy.

Keep these three layers separate: editorial identity (volume/chapter/part) — source identity (bundle IDs) — rendering identity (page kinds and templates). If a change crosses layers, document it explicitly.

## 12. Integrity Rules

Core rule: never rely on one field to mean both editorial numbering and source identity.

Bridge Grammar reality — `grammar-bridge-vol2` displays `Chapter 12–20` but source bundles underneath are `ch02–ch10`. Valid as long as it is explicit. Dangerous when code assumes the numbers match.

Good practice:

- store editorial identity in manifests and visible labels
- treat source bundle IDs as internal implementation data
- validate volume-to-source mappings with an audit script (`node 04_scripts/audit-grammar-bridge-taxonomy.js`)
- document unusual mappings instead of normalizing them silently
- normalize legacy `Part` labels to `Chapter` labels at the manifest boundary, not by guesswork in downstream UI

Bad practice:

- infer chapter numbers from `chNN` source IDs
- rename source bundles just to look cleaner without tracing downstream effects
- mix display labels and source IDs in one field

Minimum validation before approving a new volume or migration: verify volume label, displayed chapter/part labels, source bundle mapping, problem JSON source for each chapter opener, and that the mapping is written down.

## 13. Approval Gate

A mandatory visual approval checkpoint is required before migration continues:

1. Build the non-breaking scaffold.
2. Produce a visual preview.
3. Ask for approval.
4. Only then begin wider component migration or build-pipeline integration.

No automatic production switch is allowed before that checkpoint.

## 14. Change Discipline

Whenever one of the following changes, update this file in the same patch:

- layer ownership
- token authority
- renderer authority
- migration rule
- naming convention
- approval workflow
- terminology or integrity rules

If code and this file disagree, this file is the review baseline and the mismatch must be resolved immediately.

## 15. Supporting Docs

Remaining documentation lives under `03_system/extravagantdocs/docs/`:

- `changelog.md` — human-readable library evolution log
- `specimens/grammar-bridge-ch02.md` — reference specimen
- `checklists/review-gate.md` — mandatory visual approval gate
- `adr/ADR-0001-paged-native-build-path.md` — paged-native architecture decision
- `incidents/` — postmortems for renderer drift and production regressions
