/**
 * Tests for ReorderService.applyMove — dispatch + I/O, with an in-memory vault
 * and no open editors (the editor.transaction path needs the real app and is
 * verified manually in-app; see the Phase 4 notes).
 */

import { ReorderService } from '../src/services/reorderService.js';
import { SpineService } from '../src/services/spineService.js';
import { parseUnits } from '../src/services/parseUnits.js';
import { getProfile } from '../src/services/formatProfiles.js';

const P = getProfile('script');
const book = { path: 'proj' };

function buildEnv(files, tree) {
  const app = {
    vault: {
      getAbstractFileByPath: (p) => (p in files ? { path: p, extension: p.endsWith('.md') ? 'md' : '' } : null),
      read: async (f) => files[f.path],
      modify: async (f, t) => { files[f.path] = t; },
    },
    workspace: { getLeavesOfType: () => [] }, // no open editors
    metadataCache: { getFileCache: () => ({}) },
  };
  const spineService = new SpineService(app);
  const treeCalls = [];
  const treeService = { reorderTreeNodes: async (...args) => { treeCalls.push(args); return true; } };
  const reorder = new ReorderService(app, spineService, treeService);
  const cfg = { basic: { projectType: 'script' }, structure: { tree } };
  return { reorder, cfg, files, treeCalls };
}

const titlesOf = (text) => parseUnits(text, P).map((u) => u.title);
const idsOf = (text) => parseUnits(text, P).map((u) => u.id);

describe('ReorderService.applyMove()', () => {
  test('within-file: moves B before A and preserves ids', async () => {
    const { reorder, cfg, files } = buildEnv(
      { 'proj/a.md': '# A\nbody a ^folioa1\n# B\nbody b ^folioa2' },
      [{ type: 'file', path: 'a.md', id: 'node-a', order: 1 }],
    );
    const res = await reorder.applyMove(book, cfg, P, 'folioa2', 'folioa1');
    expect(res).toEqual({ ok: true, kind: 'within-file' });
    expect(titlesOf(files['proj/a.md'])).toEqual(['B', 'A']);
    expect(idsOf(files['proj/a.md'])).toEqual(['folioa2', 'folioa1']);
  });

  test('cross-file: moves a sub-file Unit into another file', async () => {
    const { reorder, cfg, files } = buildEnv(
      {
        'proj/a.md': '# A\nbody a ^folioa1\n# B\nbody b ^folioa2',
        'proj/c.md': '# C\nbody c ^folioc1',
      },
      [
        { type: 'file', path: 'a.md', id: 'node-a', order: 1 },
        { type: 'file', path: 'c.md', id: 'node-c', order: 2 },
      ],
    );
    const res = await reorder.applyMove(book, cfg, P, 'folioa2', 'folioc1');
    expect(res).toEqual({ ok: true, kind: 'cross-file' });
    expect(titlesOf(files['proj/a.md'])).toEqual(['A']);     // B left a.md
    expect(titlesOf(files['proj/c.md'])).toEqual(['B', 'C']); // B landed before C
    expect(idsOf(files['proj/c.md'])).toEqual(['folioa2', 'folioc1']); // id travelled
  });

  test('tree: reordering two whole-file Units delegates to reorderTreeNodes (no prose touched)', async () => {
    const before = {
      'proj/a.md': '# A\nbody a ^folioa1',
      'proj/c.md': '# C\nbody c ^folioc1',
    };
    const { reorder, cfg, files, treeCalls } = buildEnv(
      { ...before },
      [
        { type: 'file', path: 'a.md', id: 'node-a', order: 1 },
        { type: 'file', path: 'c.md', id: 'node-c', order: 2 },
      ],
    );
    const res = await reorder.applyMove(book, cfg, P, 'folioc1', 'folioa1');
    expect(res).toEqual({ ok: true, kind: 'tree' });
    expect(treeCalls).toEqual([[book, 'node-c', 'node-a', 'before']]);
    expect(files).toEqual(before); // prose untouched
  });

  test('applyMoveByIndex: assigns ids on the fly and reorders by Spine position', async () => {
    const { reorder, cfg, files } = buildEnv(
      { 'proj/a.md': '# A\nbody a\n# B\nbody b' }, // no ids yet
      [{ type: 'file', path: 'a.md', id: 'node-a', order: 1 }],
    );
    const res = await reorder.applyMoveByIndex(book, cfg, P, 1, 0); // move B before A
    expect(res.ok).toBe(true);
    expect(titlesOf(files['proj/a.md'])).toEqual(['B', 'A']);
    expect(idsOf(files['proj/a.md']).every(Boolean)).toBe(true); // ids were assigned
  });

  test('applyMoveByIndex: beforeIndex null moves to the end', async () => {
    const { reorder, cfg, files } = buildEnv(
      { 'proj/a.md': '# A\nbody a\n# B\nbody b' },
      [{ type: 'file', path: 'a.md', id: 'node-a', order: 1 }],
    );
    await reorder.applyMoveByIndex(book, cfg, P, 0, null); // move A to end
    expect(titlesOf(files['proj/a.md'])).toEqual(['B', 'A']);
  });

  test('no-op when from === before', async () => {
    const { reorder, cfg } = buildEnv({ 'proj/a.md': '# A' }, [{ type: 'file', path: 'a.md', id: 'n', order: 1 }]);
    expect(await reorder.applyMove(book, cfg, P, 'x', 'x')).toEqual({ ok: true, kind: 'noop' });
  });

  test('reports from-not-found for an unknown id', async () => {
    const { reorder, cfg } = buildEnv(
      { 'proj/a.md': '# A\nbody a ^folioa1' },
      [{ type: 'file', path: 'a.md', id: 'n', order: 1 }],
    );
    expect(await reorder.applyMove(book, cfg, P, 'nope', null)).toEqual({ ok: false, reason: 'from-not-found' });
  });
});
