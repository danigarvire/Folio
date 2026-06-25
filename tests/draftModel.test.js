/**
 * Tests for the pure draft model.
 */

import { findDrafts, draftNodeForFile, draftChoices, resolveCurrentDraft, isPathInDraft, draftShelfNode } from '../src/services/draftModel.js';

const tree = [
  { type: 'group', title: 'Preface', path: 'Preface', children: [{ type: 'file', path: 'Preface/intro.md' }] },
  { type: 'group', title: 'Volume 1', path: 'Volume 1', draft: true, children: [
    { type: 'file', path: 'Volume 1/Chapter 1.md' },
    { type: 'file', path: 'Volume 1/Chapter 2.md' },
  ] },
  { type: 'group', title: 'Graveyard', path: 'Graveyard', children: [{ type: 'file', path: 'Graveyard/cut.md' }] },
  { type: 'file', path: 'loose.md' },
];

describe('findDrafts()', () => {
  test('returns only folders flagged draft:true', () => {
    expect(findDrafts(tree).map((d) => d.path)).toEqual(['Volume 1']);
  });
});

describe('draftNodeForFile()', () => {
  test('a file inside a flagged draft → that draft', () => {
    expect(draftNodeForFile(tree, 'Volume 1/Chapter 1.md').path).toBe('Volume 1');
  });
  test('when drafts are flagged, a file outside them → null (e.g. front matter)', () => {
    expect(draftNodeForFile(tree, 'Preface/intro.md')).toBeNull();
    expect(draftNodeForFile(tree, 'Graveyard/cut.md')).toBeNull();
  });
  test('with NO drafts flagged, falls back to the file\'s top-level folder (legacy)', () => {
    const legacy = [
      { type: 'group', path: 'Volume 1', children: [{ type: 'file', path: 'Volume 1/Chapter 1.md' }] },
      { type: 'group', path: 'Preface', children: [{ type: 'file', path: 'Preface/intro.md' }] },
    ];
    expect(draftNodeForFile(legacy, 'Volume 1/Chapter 1.md').path).toBe('Volume 1');
    expect(draftNodeForFile(legacy, 'Preface/intro.md').path).toBe('Preface');
  });
  test('a flagged FILE draft (e.g. essay Manuscript) matches itself', () => {
    const t = [{ type: 'file', path: 'Manuscript.md', draft: true }, { type: 'file', path: 'Outline.md' }];
    expect(draftNodeForFile(t, 'Manuscript.md').path).toBe('Manuscript.md');
    expect(draftNodeForFile(t, 'Outline.md')).toBeNull(); // outside the draft
  });
  test('prefers the deepest flagged ancestor', () => {
    const nested = [
      { type: 'group', path: 'Book', draft: true, children: [
        { type: 'group', path: 'Book/Part 2', draft: true, children: [{ type: 'file', path: 'Book/Part 2/c.md' }] },
      ] },
    ];
    expect(draftNodeForFile(nested, 'Book/Part 2/c.md').path).toBe('Book/Part 2');
  });
});

describe('resolveCurrentDraft()', () => {
  const multi = [
    { type: 'group', title: 'Drafts', path: 'Drafts', shelf: true, children: [
      { type: 'group', title: 'Draft 1', path: 'Drafts/Draft 1', draft: true, children: [] },
      { type: 'group', title: 'Draft 2', path: 'Drafts/Draft 2', draft: true, children: [] },
    ] },
  ];
  test('returns the draft at currentDraftPath when it exists', () => {
    expect(resolveCurrentDraft(multi, 'Drafts/Draft 2').path).toBe('Drafts/Draft 2');
  });
  test('falls back to the first flagged draft when the pointer is stale/empty', () => {
    expect(resolveCurrentDraft(multi, 'Drafts/Gone').path).toBe('Drafts/Draft 1');
    expect(resolveCurrentDraft(multi, null).path).toBe('Drafts/Draft 1');
  });
  test('returns null for a project with no flagged drafts', () => {
    expect(resolveCurrentDraft([{ type: 'group', path: 'X', children: [] }], null)).toBeNull();
  });
});

describe('isPathInDraft()', () => {
  const d = { type: 'group', path: 'Drafts/Draft 1' };
  test('matches files inside the draft and the node itself', () => {
    expect(isPathInDraft(d, 'Drafts/Draft 1/Chapter 1.md')).toBe(true);
    expect(isPathInDraft(d, 'Drafts/Draft 1')).toBe(true);
  });
  test('rejects files outside / sibling-prefixed paths', () => {
    expect(isPathInDraft(d, 'Drafts/Draft 10/x.md')).toBe(false);
    expect(isPathInDraft(d, 'Outline.md')).toBe(false);
    expect(isPathInDraft(null, 'x')).toBe(false);
  });
});

describe('draftShelfNode()', () => {
  test('finds a folder flagged shelf:true', () => {
    const t = [{ type: 'group', title: 'Manuscripts', path: 'Manuscripts', shelf: true, children: [] }];
    expect(draftShelfNode(t).path).toBe('Manuscripts');
  });
  test('falls back to a folder literally named "Drafts"', () => {
    const t = [{ type: 'group', title: 'Drafts', path: 'Drafts', children: [] }];
    expect(draftShelfNode(t).path).toBe('Drafts');
  });
  test('returns null when neither exists', () => {
    expect(draftShelfNode([{ type: 'group', title: 'Notes', path: 'Notes', children: [] }])).toBeNull();
  });
});

describe('draftChoices()', () => {
  test('lists flagged drafts when present', () => {
    expect(draftChoices(tree).map((d) => d.path)).toEqual(['Volume 1']);
  });
  test('falls back to top-level folders when none flagged', () => {
    const t = [
      { type: 'group', title: 'A', path: 'A', children: [] },
      { type: 'group', title: 'B', path: 'B', children: [] },
      { type: 'file', path: 'x.md' },
    ];
    expect(draftChoices(t).map((d) => d.name)).toEqual(['A', 'B']);
  });
});
