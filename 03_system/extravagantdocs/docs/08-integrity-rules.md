# Integrity Rules

This file defines the minimum data-discipline rules that keep textbook structure coherent.

## Core Rule

Never rely on one field to mean both editorial numbering and source identity.

## Required Distinctions

- Editorial numbering:
  - what the learner sees
  - examples: `Vol. 2`, `Chapter 12`
- Source bundle ID:
  - what extraction and assembly use internally
  - examples: `ch02`, `ch03`
- Rendering role:
  - how the content is laid out
  - examples: `legacy-page`, `problem-set`, `explanations`

## Current Bridge Grammar Reality

Current repository data already proves why this matters:

- `grammar-bridge-vol2` displays `Chapter 12` through `Chapter 20`
- but the source bundles underneath are `ch02` through `ch10`

That is valid as long as it is explicit.
It becomes dangerous only when code or humans assume those numbers should match.

## Good Practice

- store editorial identity in manifests and visible labels
- treat source bundle IDs as internal implementation data
- validate volume-to-source mappings with an audit script
- document unusual mappings instead of normalizing them silently
- normalize legacy `Part` labels to canonical `Chapter` labels at the manifest or renderer boundary, not by guesswork in downstream UI

## Bad Practice

- infer chapter numbers from `chNN` source IDs
- rename source bundles just to look cleaner without tracing downstream effects
- mix display labels and source IDs in one field

## Minimum Validation Habit

Before approving a new volume or migration:

1. verify volume label
2. verify displayed chapter or part labels
3. verify source bundle mapping
4. verify problem JSON source for each chapter opener
5. verify the mapping is written down in docs

## Current Audit Entry Point

Use:

- `node 04_scripts/audit-grammar-bridge-taxonomy.js`

to print the current `Bridge Grammar` editorial-to-source mapping and detect obvious drift.
