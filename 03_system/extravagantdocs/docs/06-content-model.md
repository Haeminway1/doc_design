# Content Model Contract

`extravagantdocs` does not replace the repository's content model.

For textbook assembly, the current contract remains:

- explanation and theory content live as HTML fragments
- problems, answers, and explanations for questions live as structured JSON
- YAML manifests compose those sources into a book

## Canonical Source Split

### 1. HTML content fragments

Used for:

- theory pages
- explanation pages
- structural legacy pages
- legacy cover and TOC fragments when they exist as source content

Bridge Grammar examples:

- `02_textbooks/content/grammar/bridge/ch02-content-01.html`
- `02_textbooks/content/grammar/bridge/ch03-content-01.html`
- `02_textbooks/content/grammar/bridge/vol1-cover.html`
- `02_textbooks/content/grammar/bridge/vol2-toc.html`

### 2. JSON problem data

Used for:

- problem sets
- quick answers
- detailed explanations attached to problems

Bridge Grammar examples:

- `02_textbooks/data/grammar/bridge/ch02-problems.json`
- `02_textbooks/data/grammar/bridge/ch10-problems.json`

### 3. YAML manifests

Used for:

- sequencing pages
- deciding page kinds
- choosing source paths
- selecting style system, template, and bridge
- enabling or disabling opt-in layout rules per book

Bridge Grammar examples:

- `02_textbooks/books/grammar-bridge-vol1.yaml`
- `02_textbooks/books/grammar-bridge-vol1-xd.yaml`
- `02_textbooks/books/grammar-bridge-vol2.yaml`
- `02_textbooks/books/grammar-bridge-vol2-xd.yaml`

## Bridge Grammar Volume Canonicalization

For `grammar-bridge-vol1-xd` and `grammar-bridge-vol2-xd`, the library now applies an additional non-destructive editorial normalization layer at build time:

- the generated `extravagantdocs` cover is the only canonical cover page
- legacy `vol1-cover.html` / `vol2-cover.html` fragments are treated as source references, not emitted pages
- legacy `vol1-toc.html` / `vol2-toc.html` fragments are parsed and re-emitted as a generated `Contents` page
- per-chapter `problem-set` pages remain inline after each chapter's explanation content
- `answer-grid` and `explanations` pages are moved to end matter and grouped after the main chapters
- `Vera's Flavor Tip` tip-only fragments may be emitted as inline paged notes instead of standalone pages in `paged-native`

This means the volume manifests remain source declarations, while the `xd` volume builds apply a canonical editorial layout policy on top.

## Layout Rule Toggles

Editorial layout overrides that should not apply to every book belong in manifest-level `book.layoutRules`.

Current example:

```yaml
book:
  layoutRules:
    startSubsectionOnNewPage: true
```

Meaning:

- when a chapter subsection changes, the next subsection starts on a new page instead of being packed into remaining space
- the rule is opt-in per book
- the rule affects paged-native rendering and chunked PDF export

Another current example:

```yaml
book:
  layoutRules:
    insertExplanationOpener: true
    explanationOpenerTitle: 상세 해설
    explanationOpenerSubtitle: Answer & Analysis
```

Meaning:

- explanation-heavy books can opt into a generated opener page immediately after the cover
- the rule is useful when the source begins directly with dense answer / explanation pages
- the opener is editorially generated and does not replace source content

Another reusable example:

```yaml
book:
  layoutRules:
    problemColumns: 2
```

Meaning:

- short drill-style problem pages can opt into a two-column problem layout
- the rule is opt-in per book, not a template default
- this is intended for books whose problem stems are short enough to gain scan speed without harming readability

## Why This Split Still Matters

- HTML content remains flexible for editorial explanation pages
- JSON problem data remains reusable across problem, answer-grid, and explanation renderers
- manifest composition remains the control plane for book assembly

## Current Bridge Grammar Volume Mapping

Current repository mapping is:

- `grammar-bridge-vol1`
  - editorial structure labeled as `Chapter 1` through `Chapter 11`
  - content and problem source currently derived from `ch01-*`
- `grammar-bridge-vol2`
  - editorial structure labeled as Chapter 12-20
  - content and problem source currently derived from `ch02-*` through `ch10-*`

This looks unusual, but it reflects how the current source extraction pipeline materialized the data in this repository.

### Exact Mapping Table

#### `grammar-bridge-vol1`

| Editorial label | Display title | Source bundle |
|---|---|---|
| Chapter 1 | 동사 | `ch01` |
| Chapter 2 | 시제 | `ch01` |
| Chapter 3 | 수동태 | `ch01` |
| Chapter 4 | 조동사 | `ch01` |
| Chapter 5 | 접속사 | `ch01` |
| Chapter 6 | 접속부사 | `ch01` |
| Chapter 7 | 전치사 | `ch01` |
| Chapter 8 | 관계사 | `ch01` |
| Chapter 9 | 분사 | `ch01` |
| Chapter 10 | 부정사 | `ch01` |
| Chapter 11 | 동명사 | `ch01` |

Source discrepancy note:

- the original legacy source HTML [`[편입영어]문법_bridge_part1.html`](/Users/haemin/projects/doc_design/07_archive/textbooks_legacy/source/[편입영어]문법_bridge_part1.html) does not contain the `151-200` problem block
- the missing `Chapter 4 조동사` problem range was recovered from [`grammar-bridge-ch04.html`](/Users/haemin/projects/doc_design/07_archive/textbooks_legacy/output_v1/html/grammar-bridge-ch04.html) and merged back into [`ch01-problems.json`](/Users/haemin/projects/doc_design/02_textbooks/data/grammar/bridge/ch01-problems.json)

#### `grammar-bridge-vol2`

| Editorial label | Display title | Source bundle |
|---|---|---|
| Chapter 12 | 가정법 | `ch02` |
| Chapter 13 | 준동사 | `ch03` |
| Chapter 14 | 관계사 | `ch04` |
| Chapter 15 | 접속사 | `ch05` |
| Chapter 16 | 비교구문 | `ch06` |
| Chapter 17 | 특수구문 | `ch07` |
| Chapter 18 | 명사와 관사 | `ch08` |
| Chapter 19 | 형용사와 부사 | `ch09` |
| Chapter 20 | 의문사 | `ch10` |

## Rule For Library Work

The library may change presentation and page contracts, but it must not silently collapse this source split.

If a future migration replaces HTML fragments or JSON problem payloads, that change must be documented explicitly here and in an ADR.
