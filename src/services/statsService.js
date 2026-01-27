/**
 * Stats Service - Handles word count statistics and progress tracking
 */

export class StatsService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  /**
   * Count words in text
   */
  countWords(text) {
    if (!text) return 0;
    
    // Remove frontmatter (content between --- and ---)
    let content = text;
    const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
    content = content.replace(frontmatterRegex, '');
    
    // Remove markdown syntax
    content = content
      .replace(/^#{1,6}\s+/gm, '')        // Remove headers (# ## ### etc)
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italic *text*
      .replace(/\_\_([^_]+)\_\_/g, '$1')  // Remove bold __text__
      .replace(/\_([^_]+)\_/g, '$1')      // Remove italic _text_
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url)
      .replace(/```[\s\S]*?```/g, '')     // Remove code blocks
      .replace(/`([^`]+)`/g, '$1')        // Remove inline code `text`
      .replace(/^\s*[-*+]\s+/gm, '')      // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '')      // Remove numbered list markers
      .replace(/^>\s+/gm, '');            // Remove blockquote markers
    
    const parts = content.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
    return parts.length;
  }

  /**
   * Get today's date key (YYYY-MM-DD)
   */
  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Collect all markdown files recursively from a folder
   */
  collectMarkdownFiles(folder) {
    const files = [];
    
    const collect = (item) => {
      if (item.children) {
        for (const child of item.children) {
          collect(child);
        }
      } else if (item.extension === 'md') {
        files.push(item);
      }
    };
    
    collect(folder);
    return files;
  }

  /**
   * Compute basic stats for a book and persist into book-config.json.stats
   */
  async computeAndSaveStatsForBook(book) {
    try {
      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;
      
      const mdFiles = this.collectMarkdownFiles(folder).filter((f) => {
        const rel = f.path.replace(book.path + '/', '');
        // exclude misc folder and only include files that live inside a volume (i.e., have a subfolder)
        if (rel.startsWith('misc/')) return false;
        const parts = rel.split('/');
        // require files to be inside at least one subfolder (volumes/subfolders)
        if (parts.length < 2) return false;
        return true;
      });
      
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

      // load or create config
      let cfg = (await this.configService.loadBookConfig(book)) || {};
      
      // Ensure basic exists so stats-only saves don't create configs without basic metadata
      cfg.basic = cfg.basic || { title: book.name };
      cfg.stats = cfg.stats || {};

      // Daily tracking: update daily_words, writing_days and average_daily_words
      const today = this.getTodayKey();
      cfg.stats.daily_words = cfg.stats.daily_words || {};

      const previousTotal = Number(cfg.stats.total_words || 0);
      const delta = Math.max(0, total - previousTotal);

      if (delta > 0) {
        cfg.stats.daily_words[today] = (cfg.stats.daily_words[today] || 0) + delta;
      }

      // Writing days = number of days with >0 words
      cfg.stats.writing_days = Object.keys(cfg.stats.daily_words).length;

      // Daily average (ONLY days written)
      const sumDaily = Object.values(cfg.stats.daily_words).reduce((a, b) => a + b, 0);
      cfg.stats.average_daily_words = cfg.stats.writing_days > 0 
        ? Math.round(sumDaily / cfg.stats.writing_days) 
        : 0;

      // Persist main stats
      cfg.stats.total_words = total;
      cfg.stats.per_chapter = perChapter;
      cfg.stats.last_writing_date = today;
      cfg.stats.last_modified = new Date().toISOString();
      
      // progress by words relative to target_total_words if present
      const target = (cfg.stats.target_total_words && Number(cfg.stats.target_total_words)) || 0;
      cfg.stats.progress_by_words = target > 0 
        ? Math.round((total / target) * 10000) / 100 
        : 0; // percent with 2 decimals
      
      // progress by chapter: fraction of chapters with >0 words
      const totalCh = Object.keys(perChapter).length;
      const doneCh = Object.values(perChapter).filter((n) => n > 0).length;
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

  /**
   * Sync chapter structure into stats baseline.
   * - Adds missing chapters with 0 words
   * - Removes deleted chapters from stats
   * DOES NOT recompute stats.
   */
  async syncChapterStatsBaseline(book) {
    try {
      let cfg = (await this.configService.loadBookConfig(book)) || {};
      cfg.stats = cfg.stats || {};
      cfg.stats.per_chapter = cfg.stats.per_chapter || {};

      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;

      const mdFiles = this.collectMarkdownFiles(folder).filter((f) => {
        const rel = f.path.replace(book.path + '/', '');
        if (rel.startsWith('misc/')) return false;
        const parts = rel.split('/');
        // only include chapter files that live inside a volume (or subfolder)
        if (parts.length < 2) return false;
        return true;
      });
      
      const currentPaths = new Set(mdFiles.map((f) => f.path.replace(book.path + '/', '')));

      // add new chapters at 0
      for (const relPath of currentPaths) {
        if (!(relPath in cfg.stats.per_chapter)) {
          cfg.stats.per_chapter[relPath] = 0;
        }
      }

      // remove deleted chapters
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
