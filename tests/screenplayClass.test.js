/**
 * Tests for screenplay-class assignment on file creation.
 *
 * Regression guard: script/film manuscript files must get the md-screenplay
 * class even when they aren't named "Scene N" (e.g. "Screenplay", "Episode 1"),
 * by virtue of living inside the draft. Prose types never get it; the explicit
 * user toggle always forces it.
 */

import { BookService } from '../src/services/bookService.js';
import { PROJECT_TYPES, DEFAULT_SETTINGS } from '../src/constants/index.js';

const svc = new BookService(null, null);

// Find a node (by title) anywhere in a template structure.
function findNode(nodes, title) {
  for (const n of nodes || []) {
    if (n.title === title) return n;
    const r = findNode(n.children, title);
    if (r) return r;
  }
  return null;
}
const tmpl = (id) => DEFAULT_SETTINGS.projectTemplates.find((t) => t.id === id).structure;

describe('default templates carry the screenplay flag', () => {
  test('Film marks its single-file draft as screenplay', () => {
    expect(findNode(tmpl('film'), 'Screenplay').screenplay).toBe(true);
  });
  test('TV marks the draft folder as screenplay (episodes inherit)', () => {
    expect(findNode(tmpl('script'), 'Draft 1').screenplay).toBe(true);
  });
  test('Book and Essay do NOT mark the manuscript as screenplay', () => {
    expect(findNode(tmpl('book'), 'Chapter 1').screenplay).toBeUndefined();
    expect(findNode(tmpl('essay'), 'Manuscript').screenplay).toBeUndefined();
  });
});

describe('shouldUseScreenplayClass()', () => {
  test('script/film manuscript files in the draft are screenplay, regardless of name', () => {
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.FILM, 'Screenplay', true)).toBe(true);
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.SCRIPT, 'Episode 1', true)).toBe(true);
  });

  test('legacy "Scene N" titles still qualify even outside a draft', () => {
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.FILM, 'Scene 1', false)).toBe(true);
  });

  test('script/film reference files outside the draft are NOT screenplay', () => {
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.SCRIPT, 'Logline & Synopsis', false)).toBe(false);
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.FILM, 'Character 1', false)).toBe(false);
  });

  test('prose types are never screenplay, even inside the draft', () => {
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.BOOK, 'Chapter 1', true)).toBe(false);
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.ESSAY, 'Manuscript', true)).toBe(false);
  });

  test('the explicit user toggle forces screenplay on, even for a Book', () => {
    expect(svc.shouldUseScreenplayClass(PROJECT_TYPES.BOOK, 'Notes', false, true)).toBe(true);
  });

  test('buildFrontmatter emits the md-screenplay cssclass when screenplay', () => {
    const fm = svc.buildFrontmatter({ projectType: PROJECT_TYPES.FILM, screenplay: true });
    expect(fm).toContain('cssclasses:');
    expect(fm).toContain('- md-screenplay');
    expect(fm).toContain('projectType: film');
  });
});
