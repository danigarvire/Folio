import { PROJECT_TYPES } from '../constants/index.js';

export class StatsService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  countWords(text) {
    if (!text) return 0;

    // Remove frontmatter — handle files with or without trailing newline after closing ---
    let content = text;
    const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*(\n|$)/;
    content = content.replace(frontmatterRegex, '');

    content = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\_\_([^_]+)\_\_/g, '$1')
      .replace(/\_([^_]+)\_/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^>\s+/gm, '');

    const parts = content.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
    return parts.length;
  }

  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  buildStatsOverrideSets(configTree) {
    const excludedPaths = new Set();
    const includedPaths = new Set();

    const traverse = (nodes, parentExcluded = false, parentIncluded = false) => {
      for (const node of nodes) {
        const isExcluded = parentExcluded || node.exclude;
        const isIncluded = parentIncluded || node.include;

        if (node.type !== 'group') {
          if (isExcluded) excludedPaths.add(node.path);
          if (isIncluded) includedPaths.add(node.path);
        }

        if (node.children) traverse(node.children, isExcluded, isIncluded);
      }
    };

    traverse(configTree || []);
    return { excludedPaths, includedPaths };
  }

  collectMarkdownFiles(folder) {
    const files = [];

    const collect = (item) => {
      if (item.children) {
        for (const child of item.children) collect(child);
      } else if (item.extension === 'md') {
        files.push(item);
      }
    };

    collect(folder);
    return files;
  }

  getStatsRulesForProjectType(projectType) {
    const builtInTypes = new Set(Object.values(PROJECT_TYPES));
    if (!builtInTypes.has(projectType)) {
      return { includeAllByDefault: true, includePrefixes: [] };
    }

    switch (projectType) {
      case PROJECT_TYPES.SCRIPT:
      case PROJECT_TYPES.FILM:
        return { includeAllByDefault: true, includePrefixes: ['scene'] };
      case PROJECT_TYPES.ESSAY:
        return { includeAllByDefault: true, includePrefixes: ['manuscript'] };
      case PROJECT_TYPES.BOOK:
      default:
        // FIX: Changed from includeAllByDefault: false to true.
        // The previous default (false, include only files starting with "chapter") silently
        // excluded files like "Prologue.md", "Part One.md", etc. from word count.
        // Users can still explicitly exclude files via the context menu override system.
        return { includeAllByDefault: true, includePrefixes: [] };
    }
  }

  shouldCountFileForStats(file, bookPath, projectType, rules, overrides) {
    const rel = file.path.replace(bookPath + '/', '');

    // Always exclude misc folder
    if (rel.startsWith('misc/')) return false;

    if (overrides?.excludedPaths?.has(rel)) return false;
    if (overrides?.includedPaths?.has(rel)) return true;

    if (rules?.includeAllByDefault) return true;

    const name = (file.basename || '').toLowerCase();
    const prefixes = rules?.includePrefixes || [];
    return prefixes.some(prefix => name.startsWith(prefix));
  }

  filterFilesByProjectType(files, bookPath, projectType, overrides) {
    const rules = this.getStatsRulesForProjectType(projectType);
    return files.filter(f => this.shouldCountFileForStats(f, bookPath, projectType, rules, overrides));
  }

  async computeAndSaveStatsForBook(book) {
    try {
      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;

      let cfg = (await this.configService.loadBookConfig(book)) || {};
      const projectType = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
      const overrides = this.buildStatsOverrideSets(cfg.structure?.tree || []);

      const allMdFiles = this.collectMarkdownFiles(folder);
      const mdFiles = this.filterFilesByProjectType(allMdFiles, book.path, projectType, overrides);

      const perChapter = {};
      let total = 0;

      for (const f of mdFiles) {
        try {
          const content = await this.app.vault.read(f);
          const wc = this.countWords(content);
          perChapter[f.path.replace(book.path + '/', '')] = wc;
          total += wc;
        } catch (e) {
          // ignore individual read errors
        }
      }

      cfg.basic = cfg.basic || { title: book.name };
      cfg.stats = cfg.stats || {};

      const today = this.getTodayKey();
      cfg.stats.daily_words = cfg.stats.daily_words || {};

      // FIX: Daily word tracking via snapshot, not cumulative delta.
      //
      // Previous approach: delta = total - previousTotal; daily_words[today] += delta
      // Problem: repeated saves accumulate deltas on top of each other, inflating daily stats.
      //
      // New approach: store today's opening snapshot (words at start of day).
      // daily_words[today] = total - snapshot_words_today
      // This is always an accurate "words written today" regardless of how many times we save.
      cfg.stats.daily_snapshots = cfg.stats.daily_snapshots || {};
      if (!cfg.stats.daily_snapshots[today]) {
        // First compute of the day: record yesterday's total as today's opening snapshot.
        // Use the stored total_words from the previous save as the snapshot baseline.
        const previousTotal = Number(cfg.stats.total_words || 0);
        cfg.stats.daily_snapshots[today] = previousTotal;
      }

      const todaySnapshot = cfg.stats.daily_snapshots[today];
      const wordsToday = Math.max(0, total - todaySnapshot);
      cfg.stats.daily_words[today] = wordsToday;

      // Writing days = number of days where words written > 0
      cfg.stats.writing_days = Object.values(cfg.stats.daily_words).filter(v => v > 0).length;

      // Daily average over days with actual writing
      const writtenDays = Object.values(cfg.stats.daily_words).filter(v => v > 0);
      const sumDaily = writtenDays.reduce((a, b) => a + b, 0);
      cfg.stats.average_daily_words = writtenDays.length > 0
        ? Math.round(sumDaily / writtenDays.length)
        : 0;

      cfg.stats.total_words = total;
      cfg.stats.per_chapter = perChapter;
      cfg.stats.last_writing_date = today;
      cfg.stats.last_modified = new Date().toISOString();

      const target = (cfg.stats.target_total_words && Number(cfg.stats.target_total_words)) || 0;
      cfg.stats.progress_by_words = target > 0
        ? Math.round((total / target) * 10000) / 100
        : 0;

      const totalCh = Object.keys(perChapter).length;
      const doneCh = Object.values(perChapter).filter(n => n > 0).length;
      cfg.stats.progress_by_chapter = {
        completed: doneCh,
        total: totalCh,
        percent: totalCh > 0 ? Math.round((doneCh / totalCh) * 10000) / 100 : 0,
      };

      await this.configService.saveBookConfig(book, { stats: cfg.stats });
      return cfg.stats;
    } catch (e) {
      console.warn('computeAndSaveStatsForBook failed', e);
      return null;
    }
  }

  async syncChapterStatsBaseline(book) {
    try {
      let cfg = (await this.configService.loadBookConfig(book)) || {};
      cfg.stats = cfg.stats || {};
      cfg.stats.per_chapter = cfg.stats.per_chapter || {};

      const projectType = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
      const overrides = this.buildStatsOverrideSets(cfg.structure?.tree || []);

      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;

      const allMdFiles = this.collectMarkdownFiles(folder);
      const mdFiles = this.filterFilesByProjectType(allMdFiles, book.path, projectType, overrides);

      const currentPaths = new Set(mdFiles.map(f => f.path.replace(book.path + '/', '')));

      for (const relPath of currentPaths) {
        if (!(relPath in cfg.stats.per_chapter)) {
          cfg.stats.per_chapter[relPath] = 0;
        }
      }

      for (const storedPath of Object.keys(cfg.stats.per_chapter)) {
        if (!currentPaths.has(storedPath)) {
          delete cfg.stats.per_chapter[storedPath];
        }
      }

      cfg.stats.last_modified = new Date().toISOString();
      await this.configService.saveBookConfig(book, cfg);
    } catch (e) {
      console.warn('syncChapterStatsBaseline failed', e);
    }
  }
}
