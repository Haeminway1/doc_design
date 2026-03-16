# Foundation Contract

Foundation is the lowest stable layer in `extravagantdocs`.

It owns decisions that must remain consistent across templates, specimens, and renderers.

## Authoritative Files

- `../foundation/tokens.css`
- `../foundation/reset.css`
- `../foundation/typography.css`
- `../foundation/print.css`

## Owns

- A4 dimensions
- structural page margin tokens
- spacing scale
- type scale
- core palette
- print-safe defaults
- reset and color-adjust behavior

## Does Not Own

- named template look-and-feel
- renderer-only overrides
- subject-specific components
- specimen-specific layout hacks

## Unit Rules

- Use print units for structural values: `mm`, `pt`, `cm`
- Use `px` only when a browser-only preview detail has no PDF impact
- Structural spacing authority remains in `foundation/tokens.css`

## Palette Rules

Current base palette direction:

- paper: white
- canvas: neutral gray for screen preview only
- ink: near-black
- brand accent: navy / gold family
- highlight colors: restricted inline emphasis only

Highlight rules:

- Highlights are inline emphasis, not panel fills
- Use underline-style emphasis based on the `verajin` reference behavior
- Do not flood explanation pages with multiple loud fills

## Typography Rules

- Body text must optimize for print legibility before display character
- Display serif use is template-scoped and should not leak into body defaults
- Running headers, problem bodies, options, and explanation text must keep a clear size hierarchy

## Non-Negotiables

- Page itself is white
- PDF-facing styles remain solid-color-first
- Emoji markers are prohibited
- Structural tokens change only through Foundation, never ad hoc in components or templates
