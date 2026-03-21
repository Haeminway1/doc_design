'use strict';

const fs = require('fs');

/**
 * Parse vera-palette-library.md and return array of 100 palette objects.
 * Each row format: | \d+ | Name | `#HEX` | `#HEX` | `#HEX` |
 *
 * @param {string} mdPath - absolute path to vera-palette-library.md
 * @returns {{ id: number, name: string, primary: string, secondary: string, accent: string }[]}
 */
function parsePalettes(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;

  // Match data rows: | number | Name | `#HEX` | `#HEX` | `#HEX` |
  const rowRegex = /^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|/gm;

  const palettes = [];
  let match;

  while ((match = rowRegex.exec(content)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2].trim();
    const primary = match[3];
    const secondary = match[4];
    const accent = match[5];

    if (!hexRegex.test(primary) || !hexRegex.test(secondary) || !hexRegex.test(accent)) {
      throw new Error(`Invalid hex color in palette ${id} (${name})`);
    }

    palettes.push({ id, name, primary, secondary, accent });
  }

  return palettes;
}

module.exports = { parsePalettes };
