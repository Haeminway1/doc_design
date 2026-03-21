# extravagantdocs

`extravagantdocs` is the next document-first design system namespace for this repository.

It is introduced in parallel with the existing `vera-core.css` stack so current textbook builds remain stable while the new page-first architecture is established.

## Layer Order

1. `foundation/`
2. `page-system/`
3. `components/`
4. `templates/`
5. `adapters/`

## Current Scope

Phase 1 focuses on reusable document primitives:

- print-safe tokens
- page box and running region rules
- break-control utilities
- paged.js adapter overrides
- a small set of core content components
- one starter template for visual review

## Entry Points

- `extravagantdocs.css` - base bundle for browser preview and print
- `templates/exam-paper/exam-paper.css` - first template skin
- `adapters/pagedjs.css` - paged.js adapter overrides
- `ARCHITECTURE_SSOT.md` - single source of truth for ownership and migration rules
- `docs/00-overview.md` - documentation architecture index
- `docs/05-renderers.md` - renderer contract baseline
- `docs/09-render-parity.md` - runtime vs paged review parity rules
- `docs/06-content-model.md` - HTML/JSON/YAML source contract
- `docs/07-terminology.md` - canonical editorial/source vocabulary
- `docs/08-integrity-rules.md` - anti-drift validation rules
- `docs/specimens/grammar-bridge-ch02.md` - first live specimen record

## Preview

Open `examples/exam-paper-preview.html` in a browser to inspect the first visual checkpoint.

## Docs Discipline

`extravagantdocs` now uses a dedicated docs architecture under `docs/`.

Code changes that alter:

- layer ownership
- page rules
- renderer behavior
- review truth between runtime and paged-native
- specimen behavior

must update the matching docs file in the same patch.
