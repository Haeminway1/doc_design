# Migration Catalog

This file tracks which textbooks already have a non-destructive `extravagantdocs` migration path.

It is the quickest way to answer:

- which books are already migrated
- which template path they use
- whether they need a bridge
- which validator path should be run

## Current Migration Coverage

### `grammar-bridge` family

- `grammar-bridge-ch01-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch02-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch03-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch04-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch05-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch06-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch07-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch08-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch09-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch10-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-ch11-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-vol1-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`
- `grammar-bridge-vol2-xd`
  - template: `grammar-bridge`
  - bridge: `grammar-bridge`
  - review renderer: `paged-native`

### `exam-paper` family

- `syntax-basic-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `syntax-bridge-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `reading-basic-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `reading-bridge-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `reading-intermediate-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `vocab-basic-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `logic-basic-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `grammar-basic-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`
- `grammar-advanced-xd`
  - template: `exam-paper`
  - bridge: none
  - review renderer: `paged-native`

## Reusable Pattern Summary

- Use `grammar-bridge` only when the book truly depends on normalized editorial reconstruction over irregular legacy grammar pages.
- Use `exam-paper` first for structured workbooks and direct manifest migrations, including mixed `legacy-page + problem-set` books that do not need a custom bridge.
- Keep `-xd` manifests non-destructive.
- Keep `paged-native` as the review truth for every migrated book.
- Current repository migration count: 22 `-xd` books.

## Migration Command Pattern

Build review HTML:

```bash
node 04_scripts/build-textbook.js --book <bookId>-xd --renderer paged-native
```

Build runtime preview:

```bash
node 04_scripts/build-textbook.js --book <bookId>-xd --renderer runtime
```

Build PDF:

```bash
node 04_scripts/generate-textbook-pdf-paged.js <bookId>-xd
```

Run validator:

```bash
node 04_scripts/validate-extravagantdocs-migration.js <bookId>-xd
```
