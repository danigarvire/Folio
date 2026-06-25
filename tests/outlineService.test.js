/**
 * Tests for OutlineService pure helpers (no Obsidian API).
 */

import { buildOutlineLine, parseOutlineSceneLinks, sceneLinkKey } from '../src/services/outlineService.js';

describe('buildOutlineLine()', () => {
  test('links to a scene heading', () => {
    expect(buildOutlineLine('Script', 'INT. CONSERVATORIO - DÍA'))
      .toBe('- [[Script#INT. CONSERVATORIO - DÍA]]');
  });
  test('links to a whole file when no heading', () => {
    expect(buildOutlineLine('Outline', null)).toBe('- [[Outline]]');
  });
});

describe('parseOutlineSceneLinks()', () => {
  test('extracts file + heading from links, in order', () => {
    const text = [
      '# Outline',
      '',
      '- [[CALEIDOSCOPIO_v01#INT. CONSERVATORIO - DÍA]]   #draft',
      '- [[CALEIDOSCOPIO_v01#EXT. CAMPO DE ESPIGAS - DÍA]]',
      '- [[Notes]]',
    ].join('\n');
    const links = parseOutlineSceneLinks(text);
    expect(links).toHaveLength(3);
    expect(links[0]).toMatchObject({ file: 'CALEIDOSCOPIO_v01', heading: 'INT. CONSERVATORIO - DÍA' });
    expect(links[1].heading).toBe('EXT. CAMPO DE ESPIGAS - DÍA');
    expect(links[2]).toMatchObject({ file: 'Notes', heading: null });
  });

  test('handles aliased links', () => {
    const links = parseOutlineSceneLinks('- [[Script#INT. BAR - NIGHT|The bar]]');
    expect(links[0]).toMatchObject({ file: 'Script', heading: 'INT. BAR - NIGHT' });
  });

  test('returns empty for no links', () => {
    expect(parseOutlineSceneLinks('just some text')).toEqual([]);
    expect(parseOutlineSceneLinks('')).toEqual([]);
  });
});

describe('sceneLinkKey()', () => {
  test('is case/space-insensitive and stable', () => {
    expect(sceneLinkKey('Script', 'INT. X - DAY')).toBe(sceneLinkKey(' script ', ' int. x - day '));
  });
  test('distinguishes different scenes', () => {
    expect(sceneLinkKey('Script', 'INT. A')).not.toBe(sceneLinkKey('Script', 'INT. B'));
  });
});
