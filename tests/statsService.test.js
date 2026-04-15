/**
 * Tests for StatsService
 *
 * StatsService.countWords() is a pure function — no Obsidian API needed.
 * The daily-snapshot accounting is tested with a minimal configService mock.
 */

import { StatsService } from '../src/services/statsService.js';

// ---------------------------------------------------------------------------
// Minimal stubs (no Obsidian imports required)
// ---------------------------------------------------------------------------

function makeConfigService(initialCfg = {}) {
  let stored = JSON.parse(JSON.stringify(initialCfg));
  return {
    async loadBookConfig() { return JSON.parse(JSON.stringify(stored)); },
    async saveBookConfig(_book, cfg) { stored = JSON.parse(JSON.stringify(cfg)); },
    getStored() { return stored; }
  };
}

function makeApp(files = {}) {
  return {
    vault: {
      getAbstractFileByPath(path) {
        if (files[path]) return files[path];
        return null;
      },
      async read(file) { return file._content || ''; }
    }
  };
}

// ---------------------------------------------------------------------------
// countWords
// ---------------------------------------------------------------------------

describe('StatsService.countWords()', () => {
  let svc;
  beforeEach(() => {
    svc = new StatsService(makeApp(), makeConfigService());
  });

  test('returns 0 for empty/null input', () => {
    expect(svc.countWords('')).toBe(0);
    expect(svc.countWords(null)).toBe(0);
    expect(svc.countWords(undefined)).toBe(0);
  });

  test('counts plain words', () => {
    expect(svc.countWords('one two three')).toBe(3);
  });

  test('strips YAML frontmatter before counting', () => {
    const text = '---\ntitle: My Novel\nprojectType: book\n---\n\nHello world.';
    expect(svc.countWords(text)).toBe(2);
  });

  test('strips frontmatter without trailing newline', () => {
    const text = '---\ntitle: Test\n---\nHello world again.';
    expect(svc.countWords(text)).toBe(3);
  });

  test('strips markdown heading markers, keeps heading text', () => {
    // "# " is stripped, leaving "Chapter One" + "The story begins." = 5 words
    expect(svc.countWords('# Chapter One\n\nThe story begins.')).toBe(5);
    // "## " stripped → "Section Two" + "Some text." = 4 words
    expect(svc.countWords('## Section Two\nSome text.')).toBe(4);
  });

  test('strips bold/italic markers, keeps content words', () => {
    // "**bold**" → "bold", "*italic*" → "italic" → "bold and italic words" = 4
    expect(svc.countWords('**bold** and *italic* words')).toBe(4);
    // "__also bold__" → "also bold", "_also italic_" → "also italic" → 5 words
    expect(svc.countWords('__also bold__ and _also italic_')).toBe(5);
  });

  test('strips markdown links, keeping link text', () => {
    // "[click here](url)" → "click here" → "click here to read" = 4 words
    expect(svc.countWords('[click here](https://example.com) to read')).toBe(4);
  });

  test('strips fenced code blocks entirely', () => {
    // code block removed, "Before." + "After." remain = 2 words
    expect(svc.countWords('Before.\n```\nconst x = 1;\n```\nAfter.')).toBe(2);
  });

  test('strips inline code backticks, keeps code text', () => {
    // "`npm install`" → "npm install" → "Use npm install to install." = 5 words
    expect(svc.countWords('Use `npm install` to install.')).toBe(5);
  });

  test('strips list markers, keeps list item text', () => {
    expect(svc.countWords('- item one\n- item two\n- item three')).toBe(6);
    expect(svc.countWords('1. first\n2. second')).toBe(2);
  });

  test('strips blockquote markers, keeps quoted text', () => {
    // "> " stripped → "Quoted text here." = 3 words
    expect(svc.countWords('> Quoted text here.')).toBe(3);
  });

  test('does not double-count words across multiple paragraphs', () => {
    const text = 'Para one.\n\nPara two.\n\nPara three.';
    expect(svc.countWords(text)).toBe(6);
  });

  test('handles file with only frontmatter', () => {
    expect(svc.countWords('---\ntitle: Empty\n---\n')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getStatsRulesForProjectType
// ---------------------------------------------------------------------------

describe('StatsService.getStatsRulesForProjectType()', () => {
  let svc;
  beforeEach(() => { svc = new StatsService(makeApp(), makeConfigService()); });

  test('book returns includeAllByDefault: true', () => {
    const rules = svc.getStatsRulesForProjectType('book');
    expect(rules.includeAllByDefault).toBe(true);
    expect(rules.includePrefixes).toEqual([]);
  });

  test('script returns includeAllByDefault: true with scene prefix', () => {
    const rules = svc.getStatsRulesForProjectType('script');
    expect(rules.includeAllByDefault).toBe(true);
    expect(rules.includePrefixes).toContain('scene');
  });

  test('film returns includeAllByDefault: true with scene prefix', () => {
    const rules = svc.getStatsRulesForProjectType('film');
    expect(rules.includeAllByDefault).toBe(true);
  });

  test('essay returns includeAllByDefault: true with manuscript prefix', () => {
    const rules = svc.getStatsRulesForProjectType('essay');
    expect(rules.includeAllByDefault).toBe(true);
    expect(rules.includePrefixes).toContain('manuscript');
  });

  test('unknown type returns includeAllByDefault: true', () => {
    const rules = svc.getStatsRulesForProjectType('unknown_custom_type');
    expect(rules.includeAllByDefault).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// shouldCountFileForStats
// ---------------------------------------------------------------------------

describe('StatsService.shouldCountFileForStats()', () => {
  let svc;
  beforeEach(() => { svc = new StatsService(makeApp(), makeConfigService()); });

  const makeFile = (path, basename) => ({ path, basename });

  test('misc/ files are always excluded', () => {
    const file = makeFile('projects/MyBook/misc/project-config.json', 'project-config');
    const rules = svc.getStatsRulesForProjectType('book');
    expect(svc.shouldCountFileForStats(file, 'projects/MyBook', 'book', rules, {})).toBe(false);
  });

  test('excludedPaths override wins over includeAllByDefault', () => {
    const file = makeFile('projects/MyBook/Outline.md', 'Outline');
    const overrides = {
      excludedPaths: new Set(['Outline.md']),
      includedPaths: new Set()
    };
    const rules = { includeAllByDefault: true, includePrefixes: [] };
    expect(svc.shouldCountFileForStats(file, 'projects/MyBook', 'book', rules, overrides)).toBe(false);
  });

  test('includedPaths override wins even when includeAllByDefault is false', () => {
    const file = makeFile('projects/MyBook/Prologue.md', 'Prologue');
    const overrides = {
      excludedPaths: new Set(),
      includedPaths: new Set(['Prologue.md'])
    };
    const rules = { includeAllByDefault: false, includePrefixes: [] };
    expect(svc.shouldCountFileForStats(file, 'projects/MyBook', 'book', rules, overrides)).toBe(true);
  });

  test('book includeAllByDefault includes files like Prologue.md', () => {
    const file = makeFile('projects/MyBook/Prologue.md', 'Prologue');
    const rules = svc.getStatsRulesForProjectType('book');
    expect(svc.shouldCountFileForStats(file, 'projects/MyBook', 'book', rules, { excludedPaths: new Set(), includedPaths: new Set() })).toBe(true);
  });

  test('book includeAllByDefault includes Volume subfolder files', () => {
    const file = makeFile('projects/MyBook/Volume 1/Chapter 1.md', 'Chapter 1');
    const rules = svc.getStatsRulesForProjectType('book');
    expect(svc.shouldCountFileForStats(file, 'projects/MyBook', 'book', rules, { excludedPaths: new Set(), includedPaths: new Set() })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildStatsOverrideSets
// ---------------------------------------------------------------------------

describe('StatsService.buildStatsOverrideSets()', () => {
  let svc;
  beforeEach(() => { svc = new StatsService(makeApp(), makeConfigService()); });

  test('empty tree returns empty sets', () => {
    const { excludedPaths, includedPaths } = svc.buildStatsOverrideSets([]);
    expect(excludedPaths.size).toBe(0);
    expect(includedPaths.size).toBe(0);
  });

  test('excluded file node appears in excludedPaths', () => {
    const tree = [{ id: 'n1', type: 'file', path: 'Chapter 1.md', exclude: true }];
    const { excludedPaths } = svc.buildStatsOverrideSets(tree);
    expect(excludedPaths.has('Chapter 1.md')).toBe(true);
  });

  test('included file node appears in includedPaths', () => {
    const tree = [{ id: 'n1', type: 'file', path: 'Prologue.md', include: true }];
    const { includedPaths } = svc.buildStatsOverrideSets(tree);
    expect(includedPaths.has('Prologue.md')).toBe(true);
  });

  test('parent exclusion propagates to children', () => {
    const tree = [{
      id: 'g1', type: 'group', path: 'Volume 1', exclude: true,
      children: [
        { id: 'c1', type: 'file', path: 'Volume 1/Chapter 1.md' },
        { id: 'c2', type: 'file', path: 'Volume 1/Chapter 2.md' }
      ]
    }];
    const { excludedPaths } = svc.buildStatsOverrideSets(tree);
    expect(excludedPaths.has('Volume 1/Chapter 1.md')).toBe(true);
    expect(excludedPaths.has('Volume 1/Chapter 2.md')).toBe(true);
  });

  test('group nodes themselves are not added to override sets', () => {
    const tree = [{ id: 'g1', type: 'group', path: 'Volume 1', exclude: true, children: [] }];
    const { excludedPaths } = svc.buildStatsOverrideSets(tree);
    expect(excludedPaths.has('Volume 1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeAndSaveStatsForBook — daily snapshot accounting
// ---------------------------------------------------------------------------

describe('StatsService.computeAndSaveStatsForBook() — daily snapshot', () => {
  const BOOK = { path: 'projects/TestBook', name: 'TestBook' };
  const TODAY = new Date().toISOString().slice(0, 10);

  function makeBookFile(relPath, content) {
    const path = `${BOOK.path}/${relPath}`;
    return { path, basename: relPath.replace(/\.md$/, '').split('/').pop(), extension: 'md', _content: content, children: undefined };
  }

  function makeFolder(path, children) {
    return { path, children };
  }

  test('first compute of day sets snapshot to previous total and records daily words', async () => {
    const chapter = makeBookFile('Chapter 1.md', 'Hello world. One two three.');
    const miscFolder = makeFolder('projects/TestBook/misc', []);
    const bookFolder = makeFolder('projects/TestBook', [chapter, miscFolder]);

    const files = {
      'projects/TestBook': bookFolder,
      'projects/TestBook/Chapter 1.md': chapter,
    };
    const initialCfg = {
      basic: { projectType: 'book' },
      stats: { total_words: 100, daily_words: {}, daily_snapshots: {} },
      structure: { tree: [] }
    };
    const configService = makeConfigService(initialCfg);
    const app = makeApp(files);
    // Override to return the folder when asked for book path
    app.vault.getAbstractFileByPath = (path) => files[path] || null;

    const svc = new StatsService(app, configService);
    const stats = await svc.computeAndSaveStatsForBook(BOOK);

    expect(stats).not.toBeNull();
    // Snapshot should be the prior total (100)
    expect(stats.daily_snapshots[TODAY]).toBe(100);
    // daily_words = current_total - snapshot
    expect(stats.daily_words[TODAY]).toBe(Math.max(0, stats.total_words - 100));
  });

  test('repeated saves on same day do not inflate daily word count', async () => {
    const chapter = makeBookFile('Chapter 1.md', 'One two three four five.');
    const miscFolder = makeFolder('projects/TestBook/misc', []);
    const bookFolder = makeFolder('projects/TestBook', [chapter, miscFolder]);

    const files = {
      'projects/TestBook': bookFolder,
      'projects/TestBook/Chapter 1.md': chapter,
    };
    // Simulate state after first save: snapshot already set, previous daily_words = 2
    const priorTotal = 3; // snapshot baseline
    const initialCfg = {
      basic: { projectType: 'book' },
      stats: {
        total_words: 5,
        daily_words: { [TODAY]: 2 },
        daily_snapshots: { [TODAY]: priorTotal }
      },
      structure: { tree: [] }
    };
    const configService = makeConfigService(initialCfg);
    const app = makeApp(files);
    app.vault.getAbstractFileByPath = (path) => files[path] || null;

    const svc = new StatsService(app, configService);
    await svc.computeAndSaveStatsForBook(BOOK);
    await svc.computeAndSaveStatsForBook(BOOK);
    const final = await svc.computeAndSaveStatsForBook(BOOK);

    // daily_words should be stable: current_total - snapshot, not accumulating
    expect(final.daily_words[TODAY]).toBe(final.total_words - priorTotal);
    // And never negative
    expect(final.daily_words[TODAY]).toBeGreaterThanOrEqual(0);
  });

  test('total_words is sum of all counted files', async () => {
    const ch1 = makeBookFile('Chapter 1.md', 'one two three');          // 3 words
    const ch2 = makeBookFile('Chapter 2.md', 'four five six seven');    // 4 words
    const miscFolder = makeFolder('projects/TestBook/misc', []);
    const bookFolder = makeFolder('projects/TestBook', [ch1, ch2, miscFolder]);

    const files = {
      'projects/TestBook': bookFolder,
      'projects/TestBook/Chapter 1.md': ch1,
      'projects/TestBook/Chapter 2.md': ch2,
    };
    const initialCfg = {
      basic: { projectType: 'book' },
      stats: { total_words: 0, daily_words: {}, daily_snapshots: {} },
      structure: { tree: [] }
    };
    const configService = makeConfigService(initialCfg);
    const app = makeApp(files);
    app.vault.getAbstractFileByPath = (path) => files[path] || null;

    const svc = new StatsService(app, configService);
    const stats = await svc.computeAndSaveStatsForBook(BOOK);

    expect(stats.total_words).toBe(7);
  });

  test('misc/ files are excluded from total_words', async () => {
    const chapter = makeBookFile('Chapter 1.md', 'one two three');
    const configFile = { path: 'projects/TestBook/misc/project-config.json', basename: 'project-config', extension: 'json', _content: '{}', children: undefined };
    const miscFolder = makeFolder('projects/TestBook/misc', [configFile]);
    const bookFolder = makeFolder('projects/TestBook', [chapter, miscFolder]);

    const files = {
      'projects/TestBook': bookFolder,
      'projects/TestBook/Chapter 1.md': chapter,
    };
    const initialCfg = { basic: { projectType: 'book' }, stats: {}, structure: { tree: [] } };
    const configService = makeConfigService(initialCfg);
    const app = makeApp(files);
    app.vault.getAbstractFileByPath = (path) => files[path] || null;

    const svc = new StatsService(app, configService);
    const stats = await svc.computeAndSaveStatsForBook(BOOK);

    // config file (json, not md) should not be counted
    expect(stats.total_words).toBe(3);
  });
});
