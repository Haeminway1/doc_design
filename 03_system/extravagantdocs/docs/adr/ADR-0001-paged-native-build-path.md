# ADR-0001: Adopt A Native `paged-native` Build Path

## Status

Accepted

## Date

2026-03-10

## Context

`extravagantdocs` originally inherited a runtime preview architecture that built fixed A4 page boxes first and then attempted to hand the result to `paged.js`.

That approach created recurring failures for the `grammar-bridge-ch02-xd` specimen:

- cover image loss from CSS priority conflicts
- merged or broken legacy explanation pages
- content truncation from fixed-height overflow rules leaking into paged output
- quick answer and detailed explanation section collisions

## Decision

For `extravagantdocs`, paged export should be built through a native paged path:

- `build-textbook.js --renderer paged-native`
- `adapters/paged-native.css`
- `generate-textbook-pdf-paged.js` consumes the native paged HTML directly

The runtime fixed-page preview remains valid, but it is no longer the canonical input for paged export.

## Consequences

Positive:

- renderer boundaries are clearer
- `@page` logic and running header behavior are easier to reason about
- paged.js receives flow-first markup instead of a second-hand transformed shell

Tradeoffs:

- two renderer contracts must now be maintained explicitly
- specimen docs must record where runtime and paged-native behavior intentionally differ
- legacy fixed pages need a temporary preservation rule during migration

## Follow-Up

- Keep `legacy-page` sections isolated in paged-native until they are rebuilt as native components
- Document every renderer-specific exception in `05-renderers.md` or a later ADR
