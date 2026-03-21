'use strict';

const fs = require('fs');
const path = require('path');
const { generateTemplate } = require('./lib/shade-generator');
const { parsePalettes } = require('./lib/palette-parser');

const SYSTEM_DIR = path.join(__dirname, '..', '03_system', 'extravagantdocs', 'templates');
const PALETTE_MD = path.join(__dirname, '..', '.claude', 'skills', 'vera-palette-library.md');

function kebabCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function main() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      flags[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  let primary, secondary, accent, name;

  if (flags.palette) {
    const paletteId = parseInt(flags.palette, 10);
    if (isNaN(paletteId) || paletteId < 1 || paletteId > 100) {
      console.error('Error: --palette must be 1-100');
      process.exit(1);
    }
    const palettes = parsePalettes(PALETTE_MD);
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) {
      console.error(`Error: Palette ${paletteId} not found`);
      process.exit(1);
    }
    primary = palette.primary;
    secondary = palette.secondary;
    accent = palette.accent;
    name = kebabCase(palette.name);
    console.log(`Palette ${paletteId}: ${palette.name}`);
    console.log(`  Primary: ${primary}  Secondary: ${secondary}  Accent: ${accent}`);
  } else if (flags.primary && flags.secondary && flags.accent && flags.name) {
    primary = flags.primary;
    secondary = flags.secondary;
    accent = flags.accent;
    name = kebabCase(flags.name);
  } else {
    console.error('Usage:');
    console.error('  node generate-template.js --palette <1-100>');
    console.error('  node generate-template.js --primary "#HEX" --secondary "#HEX" --accent "#HEX" --name "template-name"');
    process.exit(1);
  }

  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  if (!hexRegex.test(primary) || !hexRegex.test(secondary) || !hexRegex.test(accent)) {
    console.error('Error: All colors must be 6-digit hex (#RRGGBB)');
    process.exit(1);
  }

  const result = generateTemplate({ primary, secondary, accent, name });

  const outDir = path.join(SYSTEM_DIR, name);
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'tokens.css'), result.tokensCSS);
  fs.writeFileSync(path.join(outDir, `${name}.css`), result.templateCSS);

  console.log(`Template generated: ${outDir}`);
  console.log(`  tokens.css (${result.tokensCSS.split('\n').length} lines)`);
  console.log(`  ${name}.css (${result.templateCSS.split('\n').length} lines)`);
}

main();
