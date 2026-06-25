/**
 * Tests for the outline model (pure).
 */

import { normalizeOutline, beatsInLane, addBeat, updateBeat, removeBeat, moveBeat, addLane, renameLane, removeLane, paginate, DEFAULT_LANES, readDraftOutline, writeDraftOutline } from '../src/services/outlineModel.js';

describe('per-draft outline storage', () => {
  test('readDraftOutline returns the per-draft entry when present', () => {
    const cfg = { drafts: { 'Drafts/Draft 1': { lanes: [{ id: 'l', name: 'L' }], beats: [{ id: 'b', lane: 0, title: 'X' }], zoom: 200 } } };
    const o = readDraftOutline(cfg, 'Drafts/Draft 1');
    expect(o.beats.map((b) => b.title)).toEqual(['X']);
    expect(o.zoom).toBe(200);
  });
  test('readDraftOutline adopts the legacy global cfg.outline when no per-draft entry', () => {
    const cfg = { outline: { lanes: DEFAULT_LANES, beats: [{ id: 'g', lane: 0, title: 'Legacy' }] } };
    expect(readDraftOutline(cfg, 'Drafts/Draft 1').beats[0].title).toBe('Legacy');
  });
  test('readDraftOutline returns defaults for a fresh draft', () => {
    expect(readDraftOutline({}, 'Drafts/Draft 1').beats).toEqual([]);
  });
  test('writeDraftOutline stores under the draft key and clears the legacy global', () => {
    const cfg = { outline: { beats: [{ id: 'g', lane: 0, title: 'Legacy' }] } };
    const next = writeDraftOutline(cfg, 'Drafts/Draft 1', { beats: [{ id: 'n', lane: 0, title: 'New' }] });
    expect(next.outline).toBeUndefined();
    expect(next.drafts['Drafts/Draft 1'].beats[0].title).toBe('New');
  });
  test('writeDraftOutline keeps other drafts untouched', () => {
    const cfg = { drafts: { A: { beats: [{ id: 'a', lane: 0, title: 'A' }] } } };
    const next = writeDraftOutline(cfg, 'B', { beats: [{ id: 'b', lane: 0, title: 'B' }] });
    expect(next.drafts.A.beats[0].title).toBe('A');
    expect(next.drafts.B.beats[0].title).toBe('B');
  });
});

describe('normalizeOutline()', () => {
  test('fills default lanes, empty beats, and default zoom', () => {
    const o = normalizeOutline(undefined);
    expect(o.lanes).toEqual(DEFAULT_LANES);
    expect(o.beats).toEqual([]);
    expect(o.zoom).toBe(120);
  });
  test('clamps an out-of-range zoom', () => {
    expect(normalizeOutline({ zoom: 5 }).zoom).toBe(40);
    expect(normalizeOutline({ zoom: 9999 }).zoom).toBe(600);
    expect(normalizeOutline({ zoom: 200 }).zoom).toBe(200);
  });
  test('keeps provided lanes/beats (copied)', () => {
    const src = { lanes: [{ id: 'x', name: 'A' }], beats: [{ id: 'b1', lane: 0, title: 'T' }] };
    const o = normalizeOutline(src);
    expect(o.lanes).toEqual([{ id: 'x', name: 'A' }]);
    expect(o.beats[0]).not.toBe(src.beats[0]); // copy, not reference
  });
});

describe('addBeat() / beatsInLane()', () => {
  test('appends to a lane with an incrementing order', () => {
    let o = normalizeOutline(undefined);
    o = addBeat(o, { id: 'a', title: 'First Day', lane: 0 });
    o = addBeat(o, { id: 'b', title: 'Second Day', lane: 0 });
    o = addBeat(o, { id: 'c', title: 'Subplot', lane: 1 });
    expect(beatsInLane(o, 0).map((b) => b.title)).toEqual(['First Day', 'Second Day']);
    expect(beatsInLane(o, 0).map((b) => b.order)).toEqual([0, 1]);
    expect(beatsInLane(o, 1).map((b) => b.title)).toEqual(['Subplot']);
  });
  test('beats default to lane 0 and carry color/goal', () => {
    let o = normalizeOutline(undefined);
    o = addBeat(o, { id: 'a', title: 'X', color: '#e0a23b', goal: '1-2' });
    expect(beatsInLane(o, 0)[0]).toMatchObject({ color: '#e0a23b', goal: '1-2', lane: 0 });
  });
});

describe('updateBeat / removeBeat / moveBeat', () => {
  const seed = () => {
    let o = normalizeOutline(undefined);
    o = addBeat(o, { id: 'a', title: 'A', lane: 0 });
    o = addBeat(o, { id: 'b', title: 'B', lane: 0 });
    o = addBeat(o, { id: 'c', title: 'C', lane: 0 });
    return o;
  };

  test('updateBeat merges a patch', () => {
    const o = updateBeat(seed(), 'b', { title: 'B2', color: '#4a8fe0' });
    expect(beatsInLane(o, 0).find((x) => x.id === 'b')).toMatchObject({ title: 'B2', color: '#4a8fe0' });
  });

  test('removeBeat drops it and renumbers the lane', () => {
    const o = removeBeat(seed(), 'b');
    expect(beatsInLane(o, 0).map((x) => x.id)).toEqual(['a', 'c']);
    expect(beatsInLane(o, 0).map((x) => x.order)).toEqual([0, 1]);
  });

  test('moveBeat reorders within a lane', () => {
    const o = moveBeat(seed(), 'c', 0, 0); // C to front
    expect(beatsInLane(o, 0).map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });

  test('moveBeat moves across lanes and renumbers both', () => {
    const o = moveBeat(seed(), 'a', 1, 0); // A from lane 0 to lane 1
    expect(beatsInLane(o, 0).map((x) => x.id)).toEqual(['b', 'c']);
    expect(beatsInLane(o, 0).map((x) => x.order)).toEqual([0, 1]);
    expect(beatsInLane(o, 1).map((x) => x.id)).toEqual(['a']);
  });
});

describe('lanes', () => {
  test('addLane appends a lane', () => {
    const o = addLane(normalizeOutline(undefined), 'B-story');
    expect(o.lanes.map((l) => l.name)).toEqual(['Outline 1', 'Outline 2', 'B-story']);
  });
  test('renameLane renames by index', () => {
    const o = renameLane(normalizeOutline(undefined), 1, 'Subplot');
    expect(o.lanes[1].name).toBe('Subplot');
  });
  test('removeLane drops the lane, its beats, and shifts higher lanes down', () => {
    let o = normalizeOutline(undefined); // lanes 0,1
    o = addLane(o, 'Third'); // lane 2
    o = addBeat(o, { id: 'a', title: 'A', lane: 0 });
    o = addBeat(o, { id: 'b', title: 'B', lane: 1 });
    o = addBeat(o, { id: 'c', title: 'C', lane: 2 });
    o = removeLane(o, 1); // drop lane 1 (B), lane 2 (C) shifts to 1
    expect(o.lanes.map((l) => l.name)).toEqual(['Outline 1', 'Third']);
    expect(o.beats.find((x) => x.id === 'b')).toBeUndefined();
    expect(o.beats.find((x) => x.id === 'c').lane).toBe(1);
  });
  test('removeLane keeps at least one lane', () => {
    let o = { lanes: [{ id: 'x', name: 'Only' }], beats: [] };
    o = removeLane(o, 0);
    expect(o.lanes).toHaveLength(1);
  });
});

describe('addBeat positioning', () => {
  test('a new beat starts after the lane\'s last beat', () => {
    let o = normalizeOutline(undefined);
    o = addBeat(o, { id: 'a', title: 'A', lane: 0, span: 2 }); // pages 0–2
    o = addBeat(o, { id: 'b', title: 'B', lane: 0 });          // should start at 2
    expect(beatsInLane(o, 0).find((x) => x.id === 'a')).toMatchObject({ start: 0, span: 2 });
    expect(beatsInLane(o, 0).find((x) => x.id === 'b')).toMatchObject({ start: 2, span: 1 });
  });
});

describe('paginate()', () => {
  test('positions scenes by cumulative WORD count and computes pages', () => {
    const spine = [
      { title: 'A', file: 's.md', startLine: 0, endLine: 30, words: 100, status: 'draft' },
      { title: 'B', file: 's.md', startLine: 30, endLine: 90, words: 200 },
    ];
    const { scenes, total, pages } = paginate(spine, 100);
    expect(scenes[0]).toMatchObject({ title: 'A', length: 100, start: 0 });
    expect(scenes[1]).toMatchObject({ title: 'B', length: 200, start: 100 });
    expect(total).toBe(300);
    expect(pages).toBe(3); // ceil(300/100)
  });
  test('falls back to line span when a unit has no word count', () => {
    const { scenes } = paginate([{ title: 'A', startLine: 0, endLine: 40 }], 280);
    expect(scenes[0].length).toBe(40);
  });
  test('empty spine yields one page, no scenes', () => {
    expect(paginate([], 280)).toMatchObject({ scenes: [], total: 1, pages: 1 });
  });
});
