# Components Contract

Components are reusable document blocks that remain valid across templates.

## Current Component Files

- `../components/section.css`
- `../components/table.css`
- `../components/callout.css`
- `../components/cover.css`
- `../components/question-block.css`

## Current Native-Like Blocks In Use

- cover
- section shell
- question block
- answer grid
- explanation block
- formula card
- FAQ card
- comparison / grammar table

Some of these are still realized through the `grammar-bridge` bridge and should later become fully native `xd-*` blocks.

## Component Rules

- Components consume Foundation and Page System, never redefine them
- Components must remain printable without renderer-specific hacks
- Components must expose hierarchy clearly through spacing, numbering, and type contrast

## Problem Block Rules

- Main prompt text must be larger than options
- Number marker uses a black filled circle with white text
- Options must be indented relative to the main stem
- Problem separation should rely on numbering gutter, indentation, and vertical rhythm together

## Explanation Rules

- Explanation pages keep the navy / gold / black / white base system
- Highlights are supportive, not dominant
- Explanation numbering uses the same black circle marker family
- Two-column layouts are allowed only where bottom-cut safety remains acceptable

## Table Rules

- Header cells may use navy background with white text
- Tables must prioritize clarity over density theater
- Do not stretch cells just to fake balance
- Rebuild the table pattern if the content reads better as cards or formula panels

## FAQ And List Rules

- Nested list content must indent clearly under its parent item
- Internal line height and paragraph spacing must be intentionally loose enough for study readability
- Strategic line breaks are encouraged when they improve scanning
