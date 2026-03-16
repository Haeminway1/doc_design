# Migration Playbook

This file explains how to migrate an existing textbook into `extravagantdocs` in a way that stays reusable.

## Goal

The goal is not just to restyle one book.

The goal is to produce:

- a valid `extravagantdocs` manifest
- a reusable template or bridge rule
- a script-validated migration path
- a specimen-backed document trail

## Recommended Migration Order

1. confirm the source contract
2. create a non-destructive `-xd` manifest
3. choose the template and bridge
4. decide which layout rules are opt-in
5. build the paged-native review HTML
6. run script validation
7. do visual approval only after scripts pass
8. document what became reusable

## Current Default Decision

For new migrations in this repository:

- start with `exam-paper`
- only introduce a bridge if legacy markup truly blocks reuse
- reserve `grammar-bridge` for books that need normalized editorial reconstruction

Use `12-migration-catalog.md` before creating a new template so we do not fork identity prematurely.

## Step 1. Confirm The Source Contract

Before touching the design system, verify:

- theory or explanation pages are coming from HTML fragments
- problems, answers, and explanations are coming from JSON
- the book composition is declared in YAML

If the source split changes, update `06-content-model.md` in the same patch.

## Step 2. Create A Non-Destructive `-xd` Manifest

Do not overwrite the legacy manifest first.

Create an `-xd` manifest that extends the original book and adds the `extravagantdocs` fields.

Example:

```yaml
extends: grammar-bridge-vol1.yaml
book:
  id: grammar-bridge-vol1-xd
  styleSystem: extravagantdocs
  styleTemplate: grammar-bridge
  styleBridge: grammar-bridge
  reviewRenderer: paged-native
  layoutRules:
    startSubsectionOnNewPage: true
```

## Step 3. Decide What Layer Owns The Change

Use this rule every time:

- Foundation: tokens, spacing scales, page margins, renderer-safe defaults
- Page System: page breaks, running headers, top/bottom rules, page contracts
- Components: reusable document blocks
- Templates: template identity and template-specific emphasis
- Bridges: legacy markup glue only

If a fix is only needed because legacy HTML is irregular, it stays in the bridge until it proves reusable.

Problem rendering exception:

- if a book renders questions inside passage clusters, those questions must still use the same `problem--xd` component contract as standalone problem sets
- do not let passage-set questions depend on family-specific bridge CSS
- reusable spacing, gutter, marker, and choice-list styling belongs in the shared template layer

Renderer exception:

- if a legacy fragment has no `.page` wrapper, this is not a template concern
- it belongs to the paged renderer contract
- do not let paged-native silently fall back to runtime `.page` markup

## Step 4. Prefer Opt-In Layout Rules Over Hidden Template Logic

If a behavior should not affect every book, put it in `book.layoutRules`.

Current example:

- `startSubsectionOnNewPage`
  - forces the next subsection to start on a fresh page instead of filling leftover space
- `insertExplanationOpener`
  - inserts a generated opener after the cover for explanation-heavy books
  - useful when the source starts immediately with dense 해설 / 정답 content
- `explanationOpenerTitle` / `explanationOpenerSubtitle`
  - lets the manifest tune the generated opener copy without forking the template
- `problemColumns`
  - allows short drill-style problem books to opt into a two-column problem layout
  - use it only when stems are short enough that denser scanability helps more than it hurts readability
- `passage-set` question styling
  - should not need its own layout rule
  - if passage questions look different from standalone question blocks, fix the shared template or renderer contract instead of adding a book-only patch

This is important because migration rules are often editorial, not universal.

## Step 5. Build The Review Output

For `extravagantdocs`, the canonical review target is paged-native HTML.

Build command:

```bash
node 04_scripts/build-textbook.js --book <bookId> --renderer paged-native
```

Optional PDF:

```bash
node 04_scripts/generate-textbook-pdf-paged.js <bookId>
```

Special note for legacy-heavy books:

- inspect whether the book contains one-page editorial fragments or flow-friendly answer/explanation fragments
- not every legacy fragment should be forced into the same paged contract
- `detailed-answer-section` is a current example of a legacy fragment that behaves better as a paged flow section than as a fixed one-page artifact
- legacy TOC fragments need extra care:
  - if they are emitted as raw legacy HTML in paged-native, they can merge with adjacent pages
  - promote the first `.page` wrapper to a paged fixed TOC contract
  - strip old legacy `.page-number` markup so paged-native owns final page numbering
  - if the legacy TOC already has semantic classes for title / section / item / page number, upgrade it into the system TOC component during build instead of carrying the raw fragment forward
  - some books expose semantic TOC markup without a `.page` or `.page-content` wrapper; the upgrader must parse the body fragment itself instead of assuming fixed shell markup
- if legacy fragments ship with inline gradients, sanitize them to deterministic solid colors during build before doing family-level design polish
- cover artifacts should always end with an explicit page break in paged-native so the first body section cannot share the same physical page

## Step 6. Run Script Validation Before Visual Review

Use the migration validator first:

```bash
node 04_scripts/validate-extravagantdocs-migration.js --build <bookId>
```

This validator orchestrates:

- manifest validation
- source trace audit
- render integrity audit
- extravagantdocs structure audit
- textbook data validation
- grammar-bridge taxonomy audit when relevant

For repository-wide confidence after multiple migrations:

```bash
node 04_scripts/validate-extravagantdocs-migration.js
```

## Step 7. Visual Review Comes After Scripts

Human review should focus on things scripts do not understand well:

- typographic rhythm
- hierarchy clarity
- visual tone
- scanability
- pedagogical readability
- brand fit

Use `checklists/review-gate.md`.

## Step 8. Promote Or Record

After a migration patch:

- if a rule is reusable, move it upward into template or component docs
- if it is specimen-only, record it in the specimen doc
- if it is a renderer-path change, update `05-renderers.md`
- if it caused a regression, add an incident note
- if it adds a new migrated book, update `12-migration-catalog.md`

## Exit Criteria

A migration is ready for broader rollout only when:

- the `-xd` manifest validates
- paged-native review HTML exists
- required audits pass
- the review gate is satisfied
- docs were updated in the same patch
