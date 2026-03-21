'use strict';

const path = require('path');
const { generateShadeScale, mapToSemanticTokens, generateTemplate } = require('../shade-generator');

const HEX6_REGEX = /^#[0-9a-fA-F]{6}$/;

// All --xd-color-* tokens from grammar-bridge/tokens.css (canonical set)
const REQUIRED_TOKENS = [
  '--xd-color-paper',
  '--xd-color-screen',
  '--xd-color-ink',
  '--xd-color-ink-soft',
  '--xd-color-muted',
  '--xd-color-line',
  '--xd-color-line-strong',
  '--xd-color-accent',
  '--xd-color-accent-strong',
  '--xd-color-accent-soft',
  '--xd-color-secondary',
  '--xd-color-callout-note-bg',
  '--xd-color-callout-note-line',
  '--xd-color-callout-warn-bg',
  '--xd-color-callout-warn-line',
  '--xd-color-table-head-bg',
  '--xd-color-table-band',
];

describe('generateShadeScale', () => {
  test('returns exactly 9 shades', () => {
    const shades = generateShadeScale('#2c5f8a');
    expect(shades).toHaveLength(9);
  });

  test('each shade is a valid 6-digit hex string', () => {
    const shades = generateShadeScale('#2c5f8a');
    shades.forEach(s => {
      expect(s).toMatch(HEX6_REGEX);
    });
  });

  test('shade at index 4 (middle) is close to the input color', () => {
    const input = '#2c5f8a';
    const shades = generateShadeScale(input);
    // The middle shade should be within a reasonable distance of the input
    const chroma = require('chroma-js');
    const distance = chroma.distance(shades[4], input, 'lab');
    expect(distance).toBeLessThan(20);
  });

  test('shades go from light to dark', () => {
    const chroma = require('chroma-js');
    const shades = generateShadeScale('#2c5f8a');
    // First shade should be lighter (higher luminance) than last
    const firstL = chroma(shades[0]).luminance();
    const lastL = chroma(shades[8]).luminance();
    expect(firstL).toBeGreaterThan(lastL);
  });
});

describe('mapToSemanticTokens', () => {
  let tokens;

  beforeAll(() => {
    tokens = mapToSemanticTokens('#2c5f8a', '#c5a55a', '#a06040');
  });

  test('returns all required --xd-color-* tokens', () => {
    REQUIRED_TOKENS.forEach(name => {
      expect(tokens).toHaveProperty(name);
    });
  });

  test('all token values are solid 6-digit hex', () => {
    Object.values(tokens).forEach(val => {
      expect(val).toMatch(HEX6_REGEX);
    });
  });

  test('--xd-color-accent maps to accent shade[5]', () => {
    const accentShades = generateShadeScale('#a06040');
    expect(tokens['--xd-color-accent']).toBe(accentShades[5]);
  });

  test('--xd-color-accent-soft maps to accent shade[1]', () => {
    const accentShades = generateShadeScale('#a06040');
    expect(tokens['--xd-color-accent-soft']).toBe(accentShades[1]);
  });

  test('--xd-color-accent-strong maps to accent shade[7]', () => {
    const accentShades = generateShadeScale('#a06040');
    expect(tokens['--xd-color-accent-strong']).toBe(accentShades[7]);
  });
});

describe('generateTemplate', () => {
  let result;

  beforeAll(() => {
    result = generateTemplate({
      primary: '#2c5f8a',
      secondary: '#c5a55a',
      accent: '#2c5f8a',
      name: 'test-template',
    });
  });

  test('returns object with tokensCSS, templateCSS, and name', () => {
    expect(result).toHaveProperty('tokensCSS');
    expect(result).toHaveProperty('templateCSS');
    expect(result).toHaveProperty('name');
    expect(typeof result.tokensCSS).toBe('string');
    expect(typeof result.templateCSS).toBe('string');
    expect(typeof result.name).toBe('string');
  });

  test('tokensCSS contains all required --xd-* token variables', () => {
    REQUIRED_TOKENS.forEach(token => {
      expect(result.tokensCSS).toContain(token);
    });
  });

  test('all color values in tokensCSS are solid 6-digit hex', () => {
    // Extract values from --xd-color-*: #hex; declarations
    const valueMatches = result.tokensCSS.match(/--xd-color-[\w-]+:\s*([^;]+);/g) || [];
    expect(valueMatches.length).toBeGreaterThan(0);
    valueMatches.forEach(match => {
      const value = match.replace(/--xd-color-[\w-]+:\s*/, '').replace(/;$/, '').trim();
      expect(value).toMatch(HEX6_REGEX);
    });
  });

  test('no rgba() in output', () => {
    expect(result.tokensCSS).not.toMatch(/rgba\s*\(/i);
    expect(result.templateCSS).not.toMatch(/rgba\s*\(/i);
  });

  test('no linear-gradient() in output', () => {
    expect(result.tokensCSS).not.toMatch(/linear-gradient\s*\(/i);
    expect(result.templateCSS).not.toMatch(/linear-gradient\s*\(/i);
  });

  test('no box-shadow (except none) in output', () => {
    // Match box-shadow that is NOT followed by "none"
    const combined = result.tokensCSS + result.templateCSS;
    const boxShadowMatches = combined.match(/box-shadow\s*:\s*(?!none)[^;]+/gi) || [];
    expect(boxShadowMatches).toHaveLength(0);
  });

  test('no text-shadow in output', () => {
    expect(result.tokensCSS).not.toMatch(/text-shadow\s*:/i);
    expect(result.templateCSS).not.toMatch(/text-shadow\s*:/i);
  });

  test('no opacity in output', () => {
    expect(result.tokensCSS).not.toMatch(/\bopacity\s*:/i);
    expect(result.templateCSS).not.toMatch(/\bopacity\s*:/i);
  });

  test('templateCSS imports tokens.css', () => {
    expect(result.templateCSS).toContain("@import url('tokens.css')");
  });
});
