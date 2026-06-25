/**
 * Tests for buildSpine — pure tree⊕heading flattening.
 */

import { buildSpine } from '../src/services/spineService.js';
import { parseUnits } from '../src/services/parseUnits.js';
import { getProfile } from '../src/services/formatProfiles.js';

const SCREENPLAY = getProfile('script');

// A readUnits that parses injected text keyed by node path.
const makeReader = (textByPath) => (node) =>
  parseUnits(textByPath[node.path] || '', SCREENPLAY);

describe('buildSpine()', () => {
  test('orders by tree order, then heading order within each file', () => {
    const cfg = {
      structure: {
        tree: [
          { type: 'group', title: 'Act I', order: 1, children: [
            { type: 'file', path: 'b.md', order: 2 },
            { type: 'file', path: 'a.md', order: 1 },
          ] },
          { type: 'file', path: 'c.md', order: 2 },
        ],
      },
    };
    const text = {
      'a.md': '# A1\n# A2',
      'b.md': '# B1',
      'c.md': '# C1',
    };
    const spine = buildSpine(cfg, SCREENPLAY, makeReader(text));
    expect(spine.map((u) => u.title)).toEqual(['A1', 'A2', 'B1', 'C1']);
    expect(spine.map((u) => u.file)).toEqual(['a.md', 'a.md', 'b.md', 'c.md']);
  });

  test('a file with no unit headings becomes one synthetic Unit', () => {
    const cfg = { structure: { tree: [{ type: 'file', path: 'prose.md', title: 'Prose', order: 1, status: 'draft' }] } };
    const spine = buildSpine(cfg, SCREENPLAY, () => []);
    expect(spine).toHaveLength(1);
    expect(spine[0]).toMatchObject({ title: 'Prose', file: 'prose.md', synthetic: true, status: 'draft' });
  });

  test('propagates file-level status onto every Unit in the file', () => {
    const cfg = { structure: { tree: [{ type: 'file', path: 'a.md', order: 1, status: 'final' }] } };
    const spine = buildSpine(cfg, SCREENPLAY, makeReader({ 'a.md': '# One\n# Two' }));
    expect(spine.map((u) => u.status)).toEqual(['final', 'final']);
  });

  test('legacy completed flag maps to final status', () => {
    const cfg = { structure: { tree: [{ type: 'file', path: 'a.md', order: 1, completed: true }] } };
    const spine = buildSpine(cfg, SCREENPLAY, () => []);
    expect(spine[0].status).toBe('final');
  });

  test('skips canvas and unknown node types', () => {
    const cfg = { structure: { tree: [
      { type: 'canvas', path: 'Beat Board.canvas', order: 1 },
      { type: 'file', path: 'a.md', order: 2 },
    ] } };
    const spine = buildSpine(cfg, SCREENPLAY, makeReader({ 'a.md': '# A' }));
    expect(spine.map((u) => u.file)).toEqual(['a.md']);
  });

  test('empty tree yields empty spine', () => {
    expect(buildSpine({}, SCREENPLAY, () => [])).toEqual([]);
  });
});
