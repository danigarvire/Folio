/**
 * Tests for the unit parser (pure, no Obsidian API).
 */

import { parseHeadings, parseUnits, unitsFromHeadings, parseBlockId, ensureUnitIds, extractBeats } from '../src/services/parseUnits.js';
import { getProfile } from '../src/services/formatProfiles.js';

const SCREENPLAY = getProfile('script');
const NOVEL = getProfile('book');
const ESSAY = getProfile('essay');

describe('parseHeadings()', () => {
  test('extracts level + text + line', () => {
    expect(parseHeadings('# A\n\n## B')).toEqual([
      { level: 1, text: 'A', line: 0 },
      { level: 2, text: 'B', line: 2 },
    ]);
  });

  test('ignores # inside fenced code blocks', () => {
    const md = '# Real\n\n```\n# not a heading\n```\n\n# Also real';
    expect(parseHeadings(md).map((h) => h.text)).toEqual(['Real', 'Also real']);
  });

  test('empty / null input yields no headings', () => {
    expect(parseHeadings('')).toEqual([]);
    expect(parseHeadings(null)).toEqual([]);
  });
});

describe('parseUnits() — screenplay with inverted act nesting', () => {
  const md = [
    '##### ACT ONE',          // 0  grouper (level 5, groups above scene)
    '',                       // 1
    '# INT. ROOM - DAY',      // 2  unit
    '## ALICE',               // 3  body
    'Hello.',                 // 4  body
    '# EXT. FIELD - DAY',     // 5  unit
    'Wind.',                  // 6  body
    '##### ACT TWO',          // 7  grouper
    '# INT. CAR - NIGHT',     // 8  unit
  ].join('\n');

  const units = parseUnits(md, SCREENPLAY);

  test('finds the three scenes as units', () => {
    expect(units.map((u) => u.title)).toEqual([
      'INT. ROOM - DAY', 'EXT. FIELD - DAY', 'INT. CAR - NIGHT',
    ]);
  });

  test('assigns each scene to the preceding act group', () => {
    expect(units[0].groups).toEqual([{ role: 'act', text: 'ACT ONE' }]);
    expect(units[1].groups).toEqual([{ role: 'act', text: 'ACT ONE' }]);
    expect(units[2].groups).toEqual([{ role: 'act', text: 'ACT TWO' }]);
  });

  test('spans cover body and stop at the next boundary', () => {
    expect(units[0]).toMatchObject({ startLine: 2, endLine: 5 }); // up to next scene
    expect(units[1]).toMatchObject({ startLine: 5, endLine: 7 }); // up to ACT TWO grouper
    expect(units[2]).toMatchObject({ startLine: 8, endLine: 9 }); // to EOF
  });
});

describe('parseUnits() — novel part > chapter > scene', () => {
  const md = [
    '# Part One',        // 0 grouper tier 0
    '## Chapter 1',      // 1 grouper tier 1
    '### Arrival',       // 2 unit
    'text',              // 3
    '### Departure',     // 4 unit
    '## Chapter 2',      // 5 grouper tier 1 (pops Chapter 1, keeps Part One)
    '### Return',        // 6 unit
  ].join('\n');

  const units = parseUnits(md, NOVEL);

  test('finds scene units nested under part + chapter', () => {
    expect(units.map((u) => u.title)).toEqual(['Arrival', 'Departure', 'Return']);
    expect(units[0].groups).toEqual([
      { role: 'part', text: 'Part One' },
      { role: 'chapter', text: 'Chapter 1' },
    ]);
    expect(units[2].groups).toEqual([
      { role: 'part', text: 'Part One' },
      { role: 'chapter', text: 'Chapter 2' },
    ]);
  });
});

describe('parseUnits() — essay (no groupers)', () => {
  test('sections are units; title and subsections are not boundaries', () => {
    const md = '# My Essay\n## Intro\nbody\n### aside\n## Body\nmore';
    const units = parseUnits(md, ESSAY);
    expect(units.map((u) => u.title)).toEqual(['Intro', 'Body']);
    expect(units[0].groups).toEqual([]);
    expect(units[0]).toMatchObject({ startLine: 1, endLine: 4 }); // includes subsection body
  });
});

describe('edge cases', () => {
  test('file with no unit-role headings yields no units', () => {
    expect(parseUnits('Just prose, no headings.', SCREENPLAY)).toEqual([]);
  });

  test('parseBlockId reads a trailing folio block id', () => {
    expect(parseBlockId('Una silla vacía. ^folioab12cd')).toBe('folioab12cd');
    expect(parseBlockId('text ^folio7a3c   ')).toBe('folio7a3c');
    expect(parseBlockId('^folioColumnZero')).toBe('folioColumnZero'); // detected even malformed, to avoid double-assign
    expect(parseBlockId('text ^otherid')).toBeNull();                 // only folio-prefixed ids
    expect(parseBlockId(null)).toBeNull();
  });

  test('parseUnits attaches an existing id from a body block id', () => {
    const md = '# INT. ROOM - DAY\nA man enters. ^folioabc123\n# EXT. FIELD - DAY\nWind.';
    const units = parseUnits(md, SCREENPLAY);
    expect(units[0].id).toBe('folioabc123');
    expect(units[1].id).toBeNull();
  });

  test('unitsFromHeadings is the shared core (cache path)', () => {
    const headings = [
      { level: 5, text: 'ACT ONE', line: 0 },
      { level: 1, text: 'INT. ROOM', line: 1 },
    ];
    const units = unitsFromHeadings(headings, 5, SCREENPLAY);
    expect(units).toEqual([
      { role: 'scene', title: 'INT. ROOM', startLine: 1, endLine: 5, groups: [{ role: 'act', text: 'ACT ONE' }] },
    ]);
  });
});

describe('beats ([!beat] callout)', () => {
  const doc = [
    '# INT. ROOM - DAY',
    '> [!beat]- Beats',
    '> - Llega Alice',
    '> - Descubre la carta',
    'Action line.',
    '# EXT. FIELD - DAY',
    'No beats here.',
  ].join('\n');

  test('extracts beat list items per Unit, in order', () => {
    const units = parseUnits(doc, SCREENPLAY);
    expect(units[0].beats).toEqual(['Llega Alice', 'Descubre la carta']);
    expect(units[1].beats).toEqual([]);
  });

  test('beats stop at the end of the callout block', () => {
    const lines = doc.split('\n');
    expect(extractBeats(lines, { startLine: 0, endLine: 5 })).toEqual(['Llega Alice', 'Descubre la carta']);
  });

  test('a callout with no list items yields no beats', () => {
    const units = parseUnits('# A\n> [!beat]\n> just prose', SCREENPLAY);
    expect(units[0].beats).toEqual([]);
  });
});

describe('ensureUnitIds()', () => {
  let counter;
  const genId = () => `folio${counter++}`;
  beforeEach(() => { counter = 0; });

  test('appends a block id to the first body line of every Unit lacking one', () => {
    const md = '# A\nbody a\n# B\nbody b';
    const { text, assignedCount, assigned } = ensureUnitIds(md, SCREENPLAY, genId);
    expect(assignedCount).toBe(2);
    expect(assigned).toEqual([{ title: 'A', id: 'folio0' }, { title: 'B', id: 'folio1' }]);
    expect(text).toBe('# A\nbody a ^folio0\n# B\nbody b ^folio1');
  });

  test('skips a Unit with no anchorable body line', () => {
    const md = '# A\n# B\nbody b'; // A is heading-then-heading
    const { assigned } = ensureUnitIds(md, SCREENPLAY, genId);
    expect(assigned).toEqual([{ title: 'B', id: 'folio0' }]); // only B gets one
  });

  test('anchors on the first non-heading body line, skipping transitions', () => {
    const md = '# A\n#### CUT TO:\nReal action here.';
    const { text } = ensureUnitIds(md, SCREENPLAY, genId);
    expect(text).toBe('# A\n#### CUT TO:\nReal action here. ^folio0');
  });

  test('is idempotent — a second pass assigns nothing and returns text unchanged', () => {
    const once = ensureUnitIds('# A\nbody a\n# B\nbody b', SCREENPLAY, genId).text;
    counter = 100;
    const twice = ensureUnitIds(once, SCREENPLAY, genId);
    expect(twice.assignedCount).toBe(0);
    expect(twice.text).toBe(once);
  });

  test('only fills the gaps, preserving existing ids', () => {
    const md = '# A\nbody a ^foliokeep\n# B\nbody b';
    const { assigned } = ensureUnitIds(md, SCREENPLAY, genId);
    expect(assigned).toEqual([{ title: 'B', id: 'folio0' }]);
  });

  test('parsing the result yields the assigned ids in document order', () => {
    const { text } = ensureUnitIds('# A\nbody a\n# B\nbody b', SCREENPLAY, genId);
    expect(parseUnits(text, SCREENPLAY).map((u) => u.id)).toEqual(['folio0', 'folio1']);
  });
});
