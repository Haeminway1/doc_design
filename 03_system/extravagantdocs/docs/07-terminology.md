# Terminology Contract

This file defines the canonical vocabulary for textbook structure.

Its job is to stop `volume`, `chapter`, `part`, `section`, and source bundle IDs from being mixed together.

## Canonical Terms

### Volume

Meaning:

- the publishable book unit
- example: `grammar-bridge-vol1`, `grammar-bridge-vol2`

Rules:

- a volume may contain multiple chapters
- a volume is the top-level editorial product unit in manifests

### Chapter

Meaning:

- the learner-facing major instructional unit inside a volume
- examples: `Chapter 12`, `Chapter 13`

Rules:

- chapter numbering is editorial numbering
- chapter numbering is what the student sees
- chapter numbering must not be inferred from a source bundle ID alone

### Part

Meaning:

- an editorial subdivision label used inside a volume
- examples from `vol1`: `Part 1` through `Part 11`

Rules:

- `Part` is display taxonomy, not source taxonomy
- a part may function like a chapter in one series and like a section group in another
- do not assume `part === chapter`

For `Bridge Grammar`, legacy `Part N` labels are treated as deprecated editorial residue.
Canonical display terminology for that series is now `Chapter N`.

### Section

Meaning:

- the content block subdivision inside a chapter or part
- examples: explanation page groups, FAQ groups, theory subsections

Rules:

- sections are content hierarchy, not book identity
- section labels should not be used as data bundle IDs

### Source Bundle

Meaning:

- the internal extracted content/data family used by the build pipeline
- examples: `ch01`, `ch02`, ... `ch10`

Rules:

- source bundle IDs are implementation identifiers
- source bundle IDs may not match editorial chapter numbering
- source bundle IDs must never be shown to end users as if they were editorial chapter numbers

### Page Kind

Meaning:

- the rendering role declared in YAML
- examples: `cover`, `legacy-page`, `problem-set`, `answer-grid`, `explanations`

Rules:

- page kind controls rendering behavior
- page kind does not define editorial hierarchy by itself

## Working Distinction

Keep these three layers separate:

1. editorial identity
   - volume, chapter, part, section
2. source identity
   - source bundle IDs like `ch01`
3. rendering identity
   - page kinds and template / renderer decisions

If a change crosses these layers, document it explicitly instead of assuming they are interchangeable.
