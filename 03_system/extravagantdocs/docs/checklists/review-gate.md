# Review Gate Checklist

This checklist is mandatory before expanding a specimen or switching a wider build path.

## Visual Approval Gate

- Page itself is white
- Outer preview canvas, if used, is visually separate from paper
- Cover image and title treatment render correctly
- Running header has enough space from the first content line
- Footer and bottom cut safety look stable
- Sparse pages distribute remaining space intentionally
- Lists and nested bullets indent correctly
- Main question stem is larger than options
- Number markers use the approved black-circle pattern
- Quick answer grid is easy to scan
- Explanation pages are readable and not color-noisy

## Architecture Gate

- Layer ownership still matches `../ARCHITECTURE_SSOT.md`
- New fixes did not move renderer logic into templates
- New fixes did not move template cosmetics into Foundation
- Bridge-only selectors remain in bridges
- Renderer changes are documented in `05-renderers.md` or an ADR

## Automation Gate

- `node 04_scripts/validate-extravagantdocs-migration.js --build <bookId>` has been run
- `validate-textbook-data.js` passes for the target book
- `audit-textbook-source-trace.js` passes for the target book
- `audit-render-integrity.js` passes for the target book
- `audit-extravagantdocs-structure.js` passes for the target book
- book-specific taxonomy audits pass when relevant
- representative `audit-pdf-page-anomalies.js` checks pass for the target family when paged output is in scope

## Documentation Gate

- Specimen doc updated if specimen behavior changed
- Changelog updated for meaningful visible changes
- ADR added when a build-path or renderer decision changed
- `09-render-parity.md` updated when runtime and paged behavior differ in a new way
- An incident note added under `incidents/` when a user-facing renderer regression was discovered
- The incident note must record:
  - symptom
  - affected renderer(s)
  - root cause
  - fix
  - prevention rule

No broader rollout should start until these checks are explicitly satisfied.
