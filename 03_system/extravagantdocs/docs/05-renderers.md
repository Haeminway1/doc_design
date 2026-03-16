# Renderer Contract

Renderer behavior must be explicit because document rendering is not a single-target problem.

## Supported Renderer Modes

### 1. `runtime`

Purpose:

- fast browser preview
- fixed-page shell review
- specimen tuning before final paged export

Owned by:

- `04_scripts/build-textbook.js`
- runtime CSS embedded by that build path

Characteristics:

- fixed page boxes
- JS pagination in preview mode
- strong height / overflow contracts

Use for:

- layout iteration
- fast visual approval checks

Do not use `runtime` output as the source to be transformed into the final paged build.

### 2. `paged-native`

Purpose:

- true paged.js review path
- PDF-bound specimen validation
- margin box and running header validation

Owned by:

- `04_scripts/build-textbook.js --renderer paged-native`
- `../adapters/paged-native.css`
- `04_scripts/generate-textbook-pdf-paged.js`

Characteristics:

- flow-first paged output
- named cover page support
- running header strings
- explicit paged section wrappers
- frontmatter artifacts such as cover, chapter opener, and TOC must isolate as standalone pages in paged output
- legacy sections may preserve one-section-per-page contracts during migration
- bare legacy fragments without `.page` wrappers must still render through a paged-native contract, never runtime `.page` fallback
- some legacy fragments are flow-friendly and should stay flow-friendly in paged-native even if the rest of the book uses fixed artifacts
- volume-scale books may render through chunked paged export instead of one monolithic paged session
- raw legacy TOC pages must not keep old `.page-number` markup in paged-native, because paged counters own final page numbering
- when a legacy TOC already exposes semantic structure (`toc-header`, `toc-part-title`, `toc-item`, `page-num`), prefer upgrading it into system TOC markup at build time instead of styling the raw fragment forever
- semantic legacy TOC fragments may arrive either as a full `.page` shell or as a bare body fragment
- wrapper-less semantic TOC fragments must still upgrade correctly in paged-native; do not assume `.page-content` exists
- legacy inline gradients must be sanitized to solid fallback colors during build so paged review stays PDF-safe even before family-specific restyling

Use for:

- final pagination review
- bottom-cut verification
- before expanding a specimen to more chapters
- canonical HTML review for `grammar-bridge` volume builds

### 3. PDF export

Current export path:

- Puppeteer loads the `paged-native` HTML
- paged.js completes pagination in-browser
- PDF is captured after `window.__TEXTBOOK_READY__`

## Chunked Paged Export

`Bridge Grammar Vol. 1` and `Vol. 2` are large enough that a single paged.js session is not the stable contract.

For those volumes:

- `04_scripts/build-textbook.js --renderer paged-native` still builds the canonical paged-native HTML
- `04_scripts/generate-textbook-pdf-paged.js` extracts render artifacts from that HTML
- the exporter renders multiple paged chunks instead of one full-document paged run
- chunk PDFs are merged after render
- final page numbers are re-applied after merge

Chunk boundaries must follow document semantics, not arbitrary page counts. The current `grammar-bridge` rule is:

- frontmatter
- one chunk per chapter
- endmatter opener
- answer/explanation endmatter in paired chunks

This is now the canonical production path for full-volume `grammar-bridge` exports.

For `grammar-bridge-vol1-xd` and `grammar-bridge-vol2-xd`:

- canonical review HTML: `bookId.html` -> paged-native output
- auxiliary fast preview HTML: `bookId-runtime.html` -> runtime output
- explicit paged-native artifact: `bookId-paged-native.html`

## Explicit Non-Contract

The old idea of:

- build runtime fixed-page HTML
- transform it into another paged HTML
- hope paged.js reinterprets it safely

is no longer canonical for `extravagantdocs`.

That path caused:

- cover background loss
- merged or broken legacy pages
- content truncation
- answer / explanation section collisions

## Guardrails

- Renderer fixes belong in adapters or build paths, not templates
- If `paged-native` breaks page boundaries, inspect section contracts before changing page CSS
- If cover or TOC content appears on the same physical page as body content, first verify that the frontmatter artifact has its own paged break contract
- If runtime and paged-native differ, document the reason explicitly in an ADR or specimen note
- If a full-volume paged export becomes unstable, prefer semantic chunking before weakening fixed-page contracts
