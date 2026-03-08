#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const LEGACY_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books_legacy');
const V2_BOOKS_DIR = path.join(ROOT, '02_textbooks', 'books');
const STYLES_DIR = path.join(ROOT, '02_textbooks', 'styles');

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function inferSubject(bookId, manifest) {
  if (manifest.subject) return manifest.subject;
  if (bookId.startsWith('grammar-')) return 'grammar';
  if (bookId.startsWith('reading-')) return 'reading';
  if (bookId.startsWith('syntax-')) return 'syntax';
  if (bookId.startsWith('logic-')) return 'logic';
  if (bookId.startsWith('vocab-')) return 'vocabulary';
  return 'grammar';
}

function inferLevel(bookId, manifest) {
  const source = `${bookId} ${manifest.level || ''} ${manifest.title || ''}`.toLowerCase();
  if (source.includes('advanced')) return 'advanced';
  if (source.includes('intermediate')) return 'intermediate';
  if (source.includes('bridge') || source.includes('vol1') || source.includes('vol2')) return 'bridge';
  return 'basic';
}

function inferTheme(bookId, manifest) {
  const style = manifest.book?.style || manifest.style || '';
  const template = manifest.book?.template || manifest.template || '';
  const key = style || template || bookId;

  if (key.includes('reading-basic') || key.includes('royal-purple')) return 'royal-purple';
  if (key.includes('reading-bridge')) return 'earth-tone';
  if (key.includes('reading-intermediate')) return 'sky-academic';
  if (key.includes('syntax')) return 'mint-sky';
  if (key.includes('logic')) return 'logic-blue';
  if (key.includes('vocab')) return 'sky-academic';
  if (key.includes('grammar-basic')) return 'grammar-teal';
  if (key.includes('grammar-advanced')) return 'ocean-blue';
  if (key.includes('grammar-bridge')) return 'ocean-blue';
  return 'sky-academic';
}

function inferLegacyStyle(bookId, manifest) {
  const explicit = manifest.book?.style || manifest.style;
  if (explicit) return explicit;
  if (fs.existsSync(path.join(STYLES_DIR, `${bookId}.css`))) return bookId;
  if (bookId === 'grammar-bridge-vol1') return 'grammar-bridge-part1';
  if (bookId === 'grammar-bridge-vol2') return 'grammar-bridge-part2';
  const chapterMatch = bookId.match(/^grammar-bridge-ch(\d{2})$/);
  if (chapterMatch) {
    return Number(chapterMatch[1]) <= 5 ? 'grammar-bridge-part1' : 'grammar-bridge-part2';
  }
  return '';
}

function inferShortTitle(title, subject, level) {
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const subjectMap = {
    grammar: '문법',
    reading: '독해',
    syntax: '구문독해',
    logic: '논리',
    vocabulary: 'VOCA'
  };
  return `${subjectMap[subject] || subject} ${levelLabel}`;
}

function mapLayout(layout) {
  if (!layout) return 'default';
  if (layout === 'single-column') return 'single-column';
  if (layout === 'compact') return 'compact';
  if (layout.includes('per-page')) return 'compact';
  return 'default';
}

function buildBookMeta(bookId, manifest) {
  const title = manifest.book?.title || manifest.title || bookId;
  const author = manifest.book?.author || manifest.author || "Vera's Flavor";
  const subject = inferSubject(bookId, manifest);
  const level = inferLevel(bookId, manifest);
  const theme = inferTheme(bookId, manifest);

  return {
    id: bookId,
    title,
    shortTitle: inferShortTitle(title, subject, level),
    author,
    brand: "Vera's Flavor",
    legacyStyle: inferLegacyStyle(bookId, manifest) || undefined,
    subject,
    level,
    theme
  };
}

function pageIdFromPath(src, fallbackPrefix) {
  return `${fallbackPrefix || 'page'}-${path.basename(src, path.extname(src))}`.replace(/[^a-zA-Z0-9-_]+/g, '-');
}

function mapLegacyPage(page, index) {
  switch (page.type) {
    case 'structural':
      return {
        kind: 'legacy-page',
        id: pageIdFromPath(page.src, `structural-${index + 1}`),
        source: { path: page.src }
      };
    case 'content':
      return {
        kind: 'legacy-page',
        id: pageIdFromPath(page.src, `content-${index + 1}`),
        source: { path: page.src }
      };
    case 'problems':
      return {
        kind: 'problem-set',
        id: pageIdFromPath(page.src, `problems-${index + 1}`),
        layout: mapLayout(page.layout),
        range: page.range,
        source: { path: page.src }
      };
    case 'passages':
      return {
        kind: 'passage-set',
        id: pageIdFromPath(page.src, `passages-${index + 1}`),
        source: { path: page.src }
      };
    case 'vocabulary':
      return {
        kind: 'vocabulary-set',
        id: pageIdFromPath(page.src, `vocabulary-${index + 1}`),
        layout: 'compact',
        source: { path: page.src }
      };
    case 'answer-grid':
      return {
        kind: 'answer-grid',
        id: pageIdFromPath(page.src, `answers-${index + 1}`),
        range: page.range,
        source: { path: page.src }
      };
    case 'explanations':
      return {
        kind: 'explanations',
        id: pageIdFromPath(page.src, `explanations-${index + 1}`),
        layout: mapLayout(page.layout),
        range: page.range,
        source: { path: page.src }
      };
    case 'chapter-divider':
      return {
        kind: 'chapter-opener',
        id: `chapter-${index + 1}`,
        title: page.title || page.chapter || `Chapter ${index + 1}`,
        subtitle: page.chapter || page.subtitle || ''
      };
    default:
      throw new Error(`Unsupported legacy page type: ${page.type}`);
  }
}

function isCoverLikePage(page) {
  if (!page || typeof page !== 'object') return false;
  if (page.kind === 'cover') return true;
  if (page.kind !== 'legacy-page' || !page.source || !page.source.path) return false;
  return /(^|\/)cover(?:[-_a-z0-9]*)?\.html$/i.test(page.source.path);
}

function ensureCoverPage(pages) {
  const normalizedPages = Array.isArray(pages) ? [...pages] : [];
  if (!normalizedPages.length || !isCoverLikePage(normalizedPages[0])) {
    normalizedPages.unshift({ kind: 'cover', id: 'auto-cover' });
  }
  return normalizedPages;
}

function mapStandardManifest(bookId, manifest) {
  const pages = ensureCoverPage((manifest.pages || []).map((page, index) => mapLegacyPage(page, index)));
  return {
    version: 2,
    book: buildBookMeta(bookId, manifest),
    pages
  };
}

function toTwoDigit(value) {
  return String(value).padStart(2, '0');
}

function buildSyntaxBasicPages(manifest) {
  const dataEntries = Array.isArray(manifest.data) ? manifest.data : [];
  const lookup = new Map(
    dataEntries.map((entry) => {
      const key = path.basename(entry.src, '.json');
      return [key, entry];
    })
  );

  const pages = [];
  (manifest.parts || []).forEach((part, partIndex) => {
    pages.push({
      kind: 'chapter-opener',
      id: `part-${partIndex + 1}`,
      title: part.title,
      subtitle: `Part ${part.id}`
    });

    (part.units || []).forEach((unit) => {
      const key = `unit${toTwoDigit(unit)}-problems`;
      const entry = lookup.get(key);
      if (!entry) {
        console.warn(`  ⚠️  Missing syntax-basic data entry for ${key}; skipped`);
        return;
      }
      pages.push({
        kind: 'problem-set',
        id: `unit-${toTwoDigit(unit)}`,
        title: `Unit ${toTwoDigit(unit)}`,
        layout: 'compact',
        source: { path: entry.src }
      });
    });

    if (part.review) {
      const key = `review-${part.review}-problems`;
      const entry = lookup.get(key);
      if (!entry) {
        console.warn(`  ⚠️  Missing syntax-basic review entry for ${key}; skipped`);
        return;
      }
      pages.push({
        kind: 'problem-set',
        id: part.review,
        title: `${part.title} Review`,
        layout: 'compact',
        source: { path: entry.src }
      });
    }
  });

  return pages;
}

function mapSyntaxBasicManifest(bookId, manifest) {
  return {
    version: 2,
    book: buildBookMeta(bookId, manifest),
    pages: ensureCoverPage(buildSyntaxBasicPages(manifest))
  };
}

function migrateBook(bookId, force = false) {
  const legacyPath = path.join(LEGACY_BOOKS_DIR, `${bookId}.yaml`);
  if (!fs.existsSync(legacyPath)) {
    throw new Error(`Legacy manifest not found: ${legacyPath}`);
  }

  const outputPath = path.join(V2_BOOKS_DIR, `${bookId}.yaml`);
  if (fs.existsSync(outputPath) && !force) {
    console.log(`  ⏭️  Skip existing v2 manifest: ${outputPath}`);
    return;
  }

  const manifest = readYaml(legacyPath);
  let migrated;
  if (bookId === 'syntax-basic' && !manifest.book) {
    migrated = mapSyntaxBasicManifest(bookId, manifest);
  } else {
    migrated = mapStandardManifest(bookId, manifest);
  }

  fs.mkdirSync(V2_BOOKS_DIR, { recursive: true });
  fs.writeFileSync(outputPath, yaml.dump(migrated, { noRefs: true, lineWidth: -1 }), 'utf8');
  console.log(`  ✅ v2 manifest: ${outputPath}`);
}

function main() {
  const args = process.argv.slice(2);
  const bookFlag = args.indexOf('--book');
  const force = args.includes('--force');
  if (bookFlag === -1 || !args[bookFlag + 1]) {
    console.error('Usage: node 04_scripts/migrate-textbook-manifest-v2.js --book <bookId|all> [--force]');
    process.exit(1);
  }

  const bookArg = args[bookFlag + 1];
  if (bookArg === 'all') {
    const bookIds = fs.readdirSync(LEGACY_BOOKS_DIR)
      .filter((file) => file.endsWith('.yaml'))
      .map((file) => file.replace(/\.yaml$/, ''))
      .sort();

    bookIds.forEach((bookId) => {
      console.log(`\n🧭 Migrating: ${bookId}`);
      migrateBook(bookId, force);
    });
    return;
  }

  console.log(`\n🧭 Migrating: ${bookArg}`);
  migrateBook(bookArg, force);
}

main();
