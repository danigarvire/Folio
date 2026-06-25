/**
 * Tests for the shared screenplay parser (pure, no Obsidian API).
 */

import { parseScreenplayElements, stripFrontmatter } from '../src/services/screenplayParser.js';

describe('stripFrontmatter()', () => {
  test('removes a leading YAML block', () => {
    const md = `---\nprojectType: script\n---\n\n# INT. ROOM - DAY`;
    expect(stripFrontmatter(md).trim()).toBe('# INT. ROOM - DAY');
  });
});

describe('parseScreenplayElements()', () => {
  test('classifies each heading level', () => {
    expect(parseScreenplayElements('# INT. HOUSE - DAY')[0]).toEqual({ type: 'scene', text: 'INT. HOUSE - DAY' });
    expect(parseScreenplayElements('## bob')[0]).toEqual({ type: 'character', text: 'BOB' });
    expect(parseScreenplayElements('### softly')[0]).toEqual({ type: 'parenthetical', text: '(softly)' });
    expect(parseScreenplayElements('#### cut to:')[0]).toEqual({ type: 'transition', text: 'CUT TO:' });
    expect(parseScreenplayElements('##### Act One')[0]).toEqual({ type: 'section', text: 'Act One' });
  });

  test('infers dialogue after a character cue', () => {
    const els = parseScreenplayElements('## ALICE\nHello there.');
    expect(els).toEqual([
      { type: 'character', text: 'ALICE' },
      { type: 'dialogue', text: 'Hello there.' },
    ]);
  });

  test('strips a trailing folio block id from body text (export stays clean)', () => {
    const els = parseScreenplayElements('# INT. ROOM - DAY\nA man enters. ^folioab12cd');
    expect(els).toEqual([
      { type: 'scene', text: 'INT. ROOM - DAY' },
      { type: 'action', text: 'A man enters.' },
    ]);
  });

  test('infers dialogue after a parenthetical', () => {
    const els = parseScreenplayElements('## ALICE\n### beat\nGo on.');
    expect(els.map(e => e.type)).toEqual(['character', 'parenthetical', 'dialogue']);
  });

  test('a blank line ends the dialogue block', () => {
    const els = parseScreenplayElements('## ALICE\nHi.\n\nShe leaves.');
    expect(els).toEqual([
      { type: 'character', text: 'ALICE' },
      { type: 'dialogue', text: 'Hi.' },
      { type: 'action', text: 'She leaves.' },
    ]);
  });

  test('plain text with no preceding character is action', () => {
    expect(parseScreenplayElements('The door creaks open.')[0]).toEqual({ type: 'action', text: 'The door creaks open.' });
  });

  test('a scene heading resets dialogue context', () => {
    const els = parseScreenplayElements('## ALICE\nHi.\n# EXT. PARK - DAY\nBirds sing.');
    expect(els.map(e => e.type)).toEqual(['character', 'dialogue', 'scene', 'action']);
  });
});
