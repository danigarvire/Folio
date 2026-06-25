/**
 * Tests for the pure reorder primitives (no Obsidian API).
 */

import {
  moveUnitWithinText,
  removeUnitFromText,
  insertBlockBeforeUnit,
} from '../src/services/reorder.js';
import { parseUnits } from '../src/services/parseUnits.js';
import { getProfile } from '../src/services/formatProfiles.js';

const P = getProfile('script');
const u = (text, title) => parseUnits(text, P).find((x) => x.title === title);
const titles = (text) => parseUnits(text, P).map((x) => x.title);
// True when no two heading lines are directly adjacent (i.e. always separated).
const headingsNeverGlued = (text) => {
  const lines = text.split('\n');
  return !lines.some((l, i) => i > 0 && /^#/.test(l) && /^#/.test(lines[i - 1]));
};

const DOC = '# A\nbody a\n# B\nbody b\n# C\nbody c';

describe('moveUnitWithinText()', () => {
  test('moves a Unit backward (C before A)', () => {
    const out = moveUnitWithinText(DOC, u(DOC, 'C'), u(DOC, 'A'));
    expect(titles(out)).toEqual(['C', 'A', 'B']);
    expect(out).toContain('body c'); // body travelled with the heading
  });

  test('moves a Unit forward (A before C)', () => {
    const out = moveUnitWithinText(DOC, u(DOC, 'A'), u(DOC, 'C'));
    expect(titles(out)).toEqual(['B', 'A', 'C']);
  });

  test('moves a Unit to the end (beforeUnit null)', () => {
    const out = moveUnitWithinText(DOC, u(DOC, 'A'), null);
    expect(titles(out)).toEqual(['B', 'C', 'A']);
  });

  test('normalises separators: exactly one blank line, no glued headings', () => {
    const out = moveUnitWithinText(DOC, u(DOC, 'C'), u(DOC, 'A'));
    expect(headingsNeverGlued(out)).toBe(true);
    expect(out).not.toMatch(/\n\n\n/);   // never more than one blank line
  });

  test('the block id travels with the Unit', () => {
    const doc = '# A\nbody a\n# B\nbody b ^foliokeep';
    const out = moveUnitWithinText(doc, u(doc, 'B'), u(doc, 'A'));
    expect(titles(out)).toEqual(['B', 'A']);
    expect(parseUnits(out, P).find((x) => x.title === 'B').id).toBe('foliokeep');
  });

  test('idempotent-ish: moving A before B (its current next) is a no-op order', () => {
    const out = moveUnitWithinText(DOC, u(DOC, 'A'), u(DOC, 'B'));
    expect(titles(out)).toEqual(['A', 'B', 'C']);
  });

  test('act grouper lines stay put — act membership is positional', () => {
    const doc = '##### ACT ONE\n# A\n# B\n##### ACT TWO\n# C';
    // Move C (in ACT TWO) to before A (in ACT ONE): C should now read under ACT ONE.
    const out = moveUnitWithinText(doc, u(doc, 'C'), u(doc, 'A'));
    const reparsed = parseUnits(out, P);
    expect(reparsed.map((x) => x.title)).toEqual(['C', 'A', 'B']);
    expect(reparsed.find((x) => x.title === 'C').groups).toEqual([{ role: 'act', text: 'ACT ONE' }]);
    // both act headings still present
    expect(out).toContain('ACT ONE');
    expect(out).toContain('ACT TWO');
  });
});

describe('cross-file move (remove + insert)', () => {
  test('removeUnitFromText pulls the block out, leaving the rest valid', () => {
    const x = '# A\nbody a\n# B\nbody b';
    const { text, block } = removeUnitFromText(x, u(x, 'B'));
    expect(titles(text)).toEqual(['A']);
    expect(block).toEqual(['# B', 'body b']);
  });

  test('insertBlockBeforeUnit drops the block in before the target', () => {
    const y = '# C\nbody c';
    const out = insertBlockBeforeUnit(y, ['# B', 'body b'], u(y, 'C'));
    expect(titles(out)).toEqual(['B', 'C']);
  });

  test('round-trip: B moves from file X to before C in file Y', () => {
    const x = '# A\nbody a\n# B\nbody b';
    const y = '# C\nbody c';
    const { text: newX, block } = removeUnitFromText(x, u(x, 'B'));
    const newY = insertBlockBeforeUnit(y, block, u(y, 'C'));
    expect(titles(newX)).toEqual(['A']);
    expect(titles(newY)).toEqual(['B', 'C']);
  });
});
