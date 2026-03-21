# books

`books/`는 현재 운영 중인 v2 교재 매니페스트만 저장한다.

## 규칙

1. 파일명은 `{bookId}.yaml`
2. 스키마는 `../schemas/book-manifest.v2.schema.json`
3. 새 교재는 반드시 v2로 시작한다
4. `legacy-page`는 기존 교재 마이그레이션 시에만 허용한다
5. 레거시 원본은 `../books_legacy/`에만 보관한다
6. 레거시 매니페스트 초안 생성은 `node 04_scripts/migrate-textbook-manifest-v2.js --book <id|all>`로 수행한다

## 샘플

- `reading-bridge.yaml`
