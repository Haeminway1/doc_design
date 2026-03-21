'use strict';

const chroma = require('chroma-js');

/**
 * Generate a 9-step shade scale from light to dark for a given hex color.
 * Uses LAB color space for perceptually uniform steps.
 *
 * @param {string} hex - 6-digit hex color (e.g. '#2c5f8a')
 * @returns {string[]} 9 hex colors from lightest to darkest
 */
function generateShadeScale(hex) {
  const colors = chroma
    .scale(['#ffffff', hex, '#000000'])
    .mode('lab')
    .colors(11);
  // Drop endpoints (#fff, #000) — not useful as variable palette steps
  return colors.slice(1, 10);
}

/**
 * Map three base colors to the full set of --xd-color-* semantic tokens.
 * Token structure matches grammar-bridge/tokens.css (canonical).
 *
 * Shade indices (0=lightest, 8=darkest):
 *   [0] very light  [1] light  [2] soft  [3] medium-light
 *   [4] medium      [5] base   [6] strong [7] deep  [8] very dark
 *
 * @param {string} primary   - primary hex color
 * @param {string} secondary - secondary hex color
 * @param {string} accent    - accent hex color (often same as primary)
 * @returns {Object<string, string>} token name → hex value
 */
function mapToSemanticTokens(primary, secondary, accent) {
  const cache = {};
  const scale = (hex) => cache[hex] || (cache[hex] = generateShadeScale(hex));
  const p = scale(primary);
  const s = scale(secondary);
  const a = scale(accent);

  return {
    '--xd-color-paper':            '#ffffff',
    '--xd-color-screen':           p[1],
    '--xd-color-ink':              p[8],
    '--xd-color-ink-soft':         p[6],
    '--xd-color-muted':            p[4],
    '--xd-color-line':             s[2],
    '--xd-color-line-strong':      s[4],

    '--xd-color-accent':           a[5],
    '--xd-color-accent-strong':    a[7],
    '--xd-color-accent-soft':      a[1],
    '--xd-color-secondary':        s[5],

    '--xd-color-callout-note-bg':  a[1],
    '--xd-color-callout-note-line': s[5],
    '--xd-color-callout-warn-bg':  s[1],
    '--xd-color-callout-warn-line': s[6],
    '--xd-color-table-head-bg':    a[7],
    '--xd-color-table-band':       p[0],
  };
}

/**
 * Generate a complete template (tokens CSS + template CSS) from palette colors.
 *
 * @param {{ primary: string, secondary: string, accent: string, name: string }} opts
 * @returns {{ tokensCSS: string, templateCSS: string, name: string }}
 */
function generateTemplate({ primary, secondary, accent, name }) {
  const tokens = mapToSemanticTokens(primary, secondary, accent);

  const lines = Object.entries(tokens).map(
    ([k, v]) => `  ${k}: ${v};`
  );
  const tokensCSS = `:root {\n${lines.join('\n')}\n}\n`;

  const templateCSS = `/* ${name} — extend with template-specific overrides below */\n@import url('tokens.css');\n`;

  return { tokensCSS, templateCSS, name };
}

module.exports = { generateShadeScale, mapToSemanticTokens, generateTemplate };
