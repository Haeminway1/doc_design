const { parsePalettes } = require('../palette-parser');
const path = require('path');

describe('palette-parser', () => {
  let palettes;

  beforeAll(() => {
    const mdPath = path.resolve(__dirname, '../../../.claude/skills/vera-palette-library.md');
    palettes = parsePalettes(mdPath);
  });

  test('parses 100 palettes', () => {
    expect(palettes.length).toBe(100);
  });

  test('each palette has required fields', () => {
    palettes.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('primary');
      expect(p).toHaveProperty('secondary');
      expect(p).toHaveProperty('accent');
    });
  });

  test('all colors are valid hex', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    palettes.forEach(p => {
      expect(p.primary).toMatch(hexRegex);
      expect(p.secondary).toMatch(hexRegex);
      expect(p.accent).toMatch(hexRegex);
    });
  });

  test('palette IDs are sequential 1-100', () => {
    palettes.forEach((p, i) => {
      expect(p.id).toBe(i + 1);
    });
  });

  test('known palette values match', () => {
    const p1 = palettes[0];
    expect(p1.name).toBe('Aged Manuscript');
    expect(p1.primary).toBe('#3F0D0C');
    expect(p1.secondary).toBe('#8D6F57');
    expect(p1.accent).toBe('#D9C4A9');
  });
});
