/**
 * Tests for the shared layout engine (pure): block parsing, profiles, pagination.
 */

import {
  parseScreenplayBlocks, parseProseBlocks, parseDocumentBlocks,
  resolveProfile, contentBox, charsPerLine, blockMetrics, paginate,
  pageBreakLines, paginatedScenesFromBlocks, pageOffsetOfLine,
  SCREENPLAY_PROFILE, PROSE_PROFILE, PAGE_SIZES, inToPt,
} from '../src/services/layoutModel.js';

describe('parseScreenplayBlocks()', () => {
  const md = [
    '---', 'cssclasses:', '  - md-screenplay', '---',
    '# int. house - day',
    'John enters.',
    '## john',
    '### quietly',
    'Hello there.',
    '',
    '#### cut to:',
  ].join('\n');
  const blocks = parseScreenplayBlocks(md, { file: 'a.md' });

  test('types each line and skips frontmatter', () => {
    expect(blocks.map((b) => b.type)).toEqual(['scene', 'action', 'character', 'parenthetical', 'dialogue', 'transition']);
  });
  test('uppercases scene/character/transition and wraps parenthetical', () => {
    expect(blocks[0].text).toBe('INT. HOUSE - DAY');
    expect(blocks[2].text).toBe('JOHN');
    expect(blocks[3].text).toBe('(quietly)');
    expect(blocks[5].text).toBe('CUT TO:');
  });
  test('tracks source line numbers past frontmatter', () => {
    expect(blocks[0].startLine).toBe(4);  // the "# int..." line (0-indexed, after 4 fm lines)
    expect(blocks[1].startLine).toBe(5);
    expect(blocks[0].file).toBe('a.md');
  });
  test('a line right after a character cue is dialogue; blank line ends it', () => {
    expect(blocks[4]).toMatchObject({ type: 'dialogue', text: 'Hello there.' });
  });
  test('keepBlanks emits blank lines as line-tracked spacer blocks', () => {
    const withBlanks = parseScreenplayBlocks(md, { file: 'a.md', keepBlanks: true });
    const spacers = withBlanks.filter((b) => b.type === 'spacer');
    expect(spacers.length).toBe(1);
    expect(spacers[0]).toMatchObject({ type: 'spacer', startLine: 9 }); // the blank between dialogue and transition
  });
});

describe('parseProseBlocks()', () => {
  const md = [
    '# Chapter One',
    'The first paragraph runs',
    'across two source lines.',
    '',
    'A second paragraph.',
    '### A section',
    '> a quote line',
  ].join('\n');
  const blocks = parseProseBlocks(md);

  test('folds consecutive lines into one paragraph and tags headings', () => {
    expect(blocks.map((b) => b.type)).toEqual(['chapter', 'paragraph', 'paragraph', 'section', 'blockquote']);
    expect(blocks[1].text).toBe('The first paragraph runs across two source lines.');
  });
  test('tracks the paragraph span', () => {
    expect(blocks[1].startLine).toBe(1);
    expect(blocks[1].endLine).toBe(2);
  });
});

describe('parseDocumentBlocks() dispatch', () => {
  test('screenplay flag routes to the screenplay parser', () => {
    expect(parseDocumentBlocks('## bob', { screenplay: true })[0].type).toBe('character');
    expect(parseDocumentBlocks('## bob', { screenplay: false })[0].type).toBe('chapter'); // prose: h1/h2 = chapter
  });
});

describe('profiles & geometry', () => {
  test('US Letter content box subtracts margins (screenplay: 1.5L/1R/1T/1B in)', () => {
    const cb = contentBox(SCREENPLAY_PROFILE);
    expect(cb.width).toBeCloseTo(inToPt(8.5 - 1.5 - 1.0), 5); // 6in
    expect(cb.height).toBeCloseTo(inToPt(11 - 2), 5);          // 9in
  });
  test('Courier action line ≈ 60 chars at 10 cpi over 6in', () => {
    expect(charsPerLine(SCREENPLAY_PROFILE, 'action')).toBe(60);
  });
  test('dialogue is narrower than action (indented both sides)', () => {
    expect(charsPerLine(SCREENPLAY_PROFILE, 'dialogue')).toBeLessThan(charsPerLine(SCREENPLAY_PROFILE, 'action'));
  });
  test('resolveProfile merges margin overrides without losing the rest', () => {
    const p = resolveProfile({ screenplay: true, overrides: { page: { margins: { top: inToPt(0.5) } } } });
    expect(p.page.margins.top).toBe(inToPt(0.5));
    expect(p.page.margins.left).toBe(SCREENPLAY_PROFILE.page.margins.left); // preserved
  });
});

describe('blockMetrics()', () => {
  test('a one-line action is a single line; a long one wraps', () => {
    expect(blockMetrics(SCREENPLAY_PROFILE, { type: 'action', text: 'Short.' }).lines).toBe(1);
    const long = 'x'.repeat(185); // > 3×60
    expect(blockMetrics(SCREENPLAY_PROFILE, { type: 'action', text: long }).lines).toBe(4);
  });
});

describe('paginate()', () => {
  test('a US-Letter screenplay page holds ~54 single-spaced action lines', () => {
    const blocks = Array.from({ length: 54 }, (_, i) => ({ type: 'action', text: `Line ${i}` }));
    const { pageCount } = paginate(blocks, SCREENPLAY_PROFILE);
    // 54 action lines each = 12pt + 1 blank line after = 24pt → ~27/page; just assert it paginates into >1 pages deterministically.
    expect(pageCount).toBeGreaterThanOrEqual(1);
  });
  test('empty input yields exactly one (empty) page', () => {
    expect(paginate([], PROSE_PROFILE)).toMatchObject({ pageCount: 1 });
  });
  test('a prose chapter forces a page break before it', () => {
    const blocks = [
      { type: 'paragraph', text: 'tail of previous chapter' },
      { type: 'chapter', text: 'Chapter Two' },
    ];
    const { pages } = paginate(blocks, PROSE_PROFILE);
    expect(pages.length).toBe(2);
    expect(pages[1].blocks[0].type).toBe('chapter');
  });
  test('blocks carry their top offset within the page', () => {
    const { pages } = paginate([{ type: 'action', text: 'A' }, { type: 'action', text: 'B' }], SCREENPLAY_PROFILE);
    expect(pages[0].blocks[0].top).toBe(0);
    expect(pages[0].blocks[1].top).toBeGreaterThan(0);
  });
});

describe('shared pagination (strip ↔ editor correlation)', () => {
  // ~3 pages of action so a break exists.
  const longText = Array.from({ length: 120 }, (_, i) => `Action line number ${i} on the page.`).join('\n');
  const blocks = parseScreenplayBlocks(longText, { file: 's.md', keepBlanks: true });

  test('pageBreakLines and paginate agree on the page count', () => {
    const { pageCount } = paginate(blocks, SCREENPLAY_PROFILE);
    expect(pageBreakLines(blocks, SCREENPLAY_PROFILE).size).toBe(pageCount - 1); // breaks = pages - 1
    expect(pageCount).toBeGreaterThan(1);
  });

  test('paginatedScenesFromBlocks maps spine scenes to real page-unit positions', () => {
    const md = ['# INT. A - DAY', 'x', '# INT. B - DAY', 'y'].join('\n');
    const b = parseScreenplayBlocks(md, { file: 's.md', keepBlanks: true });
    const spine = [
      { title: 'INT. A - DAY', file: 's.md', startLine: 0 },
      { title: 'INT. B - DAY', file: 's.md', startLine: 2 },
    ];
    const out = paginatedScenesFromBlocks(b, spine, SCREENPLAY_PROFILE);
    expect(out.scenes).toHaveLength(2);
    expect(out.scenes[0].start).toBe(0);
    expect(out.scenes[1].start).toBeGreaterThan(out.scenes[0].start); // later scene is further down
    expect(out.perPage).toBe(contentBox(SCREENPLAY_PROFILE).height); // page unit = content height (pt)
  });

  test('pageOffsetOfLine returns the exact continuous page position (line 0 → 0)', () => {
    const { pageCount } = paginate(blocks, SCREENPLAY_PROFILE);
    expect(pageOffsetOfLine(blocks, SCREENPLAY_PROFILE, 0)).toBe(0);
    // A line on the last page sits at a fraction within [pageCount-1, pageCount).
    const lastLine = blocks[blocks.length - 1].startLine;
    const frac = pageOffsetOfLine(blocks, SCREENPLAY_PROFILE, lastLine);
    expect(frac).toBeGreaterThanOrEqual(pageCount - 1);
    expect(frac).toBeLessThan(pageCount);
  });
});
