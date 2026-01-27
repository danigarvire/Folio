/**
 * Config Service - Handles book configuration loading and saving
 */

import { DEFAULT_BOOK_CONFIG } from '../constants/index.js';

export class ConfigService {
  constructor(app) {
    this.app = app;
  }

  /**
   * Load full book config from book-config.json inside misc folder
   */
  async loadBookConfig(book) {
    try {
      const filePath = `${book.path}/misc/book-config.json`;
      const f = this.app.vault.getAbstractFileByPath(filePath);
      if (!f) return null;
      const content = await this.app.vault.read(f);
      return JSON.parse(content);
    } catch (e) {
      // Missing file is expected during deletes; only warn for unexpected errors
      if (!e || e.code === 'ENOENT') return null;
      console.warn('loadBookConfig failed', e);
      return null;
    }
  }

  /**
   * Save full book config to book-config.json inside misc folder
   * Performs intelligent merge with existing config to avoid data loss
   */
  async saveBookConfig(book, config) {
    try {
      const filePath = `${book.path}/misc/book-config.json`;
      const miscDir = `${book.path}/misc`;
      
      // Ensure misc folder exists
      try {
        const existingMisc = this.app.vault.getAbstractFileByPath(miscDir);
        if (!existingMisc) {
          await this.app.vault.createFolder(miscDir);
        }
      } catch (e) {
        // ignore folder create errors; create will fail later if necessary
      }
      
      const f = this.app.vault.getAbstractFileByPath(filePath);
      let finalCfg = config || {};
      
      // If an existing config exists, merge shallowly to avoid erasing other sections
      if (f) {
        try {
          const existingRaw = await this.app.vault.read(f);
          const existing = JSON.parse(existingRaw || '{}');
          
          // Deep-merge with preference for non-empty values from `config`
          const mergeObjects = (base, incoming) => {
            const out = Object.assign({}, base || {});
            if (!incoming) return out;
            
            for (const k of Object.keys(incoming)) {
              const v = incoming[k];
              if (v === undefined || v === null) continue;
              
              // arrays: prefer incoming if non-empty
              if (Array.isArray(v)) {
                if (v.length > 0) out[k] = v;
                // else keep base
              } else if (typeof v === 'object') {
                out[k] = mergeObjects(base ? base[k] : undefined, v);
              } else {
                // primitives: avoid overwriting existing non-empty strings with empty incoming strings
                if (typeof v === 'string') {
                  if (v === '' && base && typeof base[k] === 'string' && base[k].trim() !== '') {
                    out[k] = base[k];
                  } else {
                    out[k] = v;
                  }
                } else {
                  out[k] = v;
                }
              }
            }
            return out;
          };

          const merged = Object.assign({}, existing || {});
          // merge top-level basic and stats carefully
          merged.basic = mergeObjects(existing.basic, finalCfg.basic);
          merged.stats = mergeObjects(existing.stats, finalCfg.stats);
          
          // copy any other top-level keys from finalCfg
          for (const k of Object.keys(finalCfg)) {
            if (k !== 'basic' && k !== 'stats') merged[k] = finalCfg[k];
          }

          finalCfg = merged;
        } catch (e) {
          // if parsing existing failed, fall back to writing provided config
          finalCfg = config || {};
        }
        
        const content = JSON.stringify(finalCfg || {}, null, 2);
        await this.app.vault.modify(f, content);
      } else {
        const content = JSON.stringify(finalCfg || {}, null, 2);
        await this.app.vault.create(filePath, content);
      }
      
      return true;
    } catch (e) {
      console.warn('saveBookConfig failed', e);
      return false;
    }
  }

  /**
   * Load book metadata (simplified view of config)
   */
  async loadBookMeta(book) {
    try {
      const cfg = await this.loadBookConfig(book);
      if (!cfg) return null;
      
      return {
        title: cfg.basic?.title || '',
        author: cfg.basic?.author || [],
        subtitle: cfg.basic?.subtitle || '',
        description: cfg.basic?.desc || '',
        uuid: cfg.basic?.uuid || '',
        created_at: cfg.basic?.created_at || new Date().toISOString(),
        target_words: cfg.stats?.target_total_words || 0,
        projectType: cfg.basic?.projectType || 'book',
      };
    } catch (e) {
      console.warn('loadBookMeta failed', e);
      return null;
    }
  }

  /**
   * Create a new book config with default structure
   */
  createDefaultConfig(title, author) {
    const uuid = this.generateUUID();
    const now = new Date().toISOString();
    
    return {
      basic: {
        title: title || '',
        author: author ? [author] : [],
        subtitle: '',
        desc: '',
        uuid,
        created_at: now,
      },
      structure: {
        tree: [],
      },
      stats: {
        total_words: 0,
        target_total_words: 10000,
        progress_by_words: 0,
        progress_by_chapter: 0,
        daily_words: {},
        writing_days: 0,
        average_daily_words: 0,
        last_writing_date: now,
        last_modified: now,
        per_chapter: {},
      },
      export: {
        default_format: 'pdf',
        template: 'default',
        include_cover: true,
      },
    };
  }

  /**
   * Generate a simple UUID
   */
  generateUUID() {
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }
}
