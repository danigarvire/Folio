/**
 * Book Service - Handles book management (create, scan, delete)
 */

import { TFile, TFolder } from 'obsidian';
import { BOOK_STRUCTURE_FILES } from '../constants/index.js';

export class BookService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  /**
   * Scan for all books in the base path
   */
  async scanBooks(basePath) {
    const base = this.app.vault.getAbstractFileByPath(basePath);
    if (!(base instanceof TFolder)) return [];

    const booksIndex = [];
    const seenPaths = new Set();

    for (const bookFolder of base.children) {
      if (!bookFolder || !bookFolder.path) continue;
      if (seenPaths.has(bookFolder.path)) continue;
      seenPaths.add(bookFolder.path);
      if (!(bookFolder instanceof TFolder)) continue;

      const book = {
        name: bookFolder.name,
        path: bookFolder.path,
        cover: null,
        volumes: [],
      };

      // Cleanup legacy misc/metadata folder if present
      try {
        const legacyMetaPath = `${bookFolder.path}/misc/metadata`;
        const legacyMetaAf = this.app.vault.getAbstractFileByPath(legacyMetaPath);
        if (legacyMetaAf) {
          await this.app.vault.delete(legacyMetaAf, true);
        }
      } catch (e) {
        // ignore cleanup failures
      }

      for (const child of bookFolder.children) {
        // Ignore misc folder
        if (child instanceof TFolder && child.name === "misc") {
          continue;
        }

        // Collect volumes
        if (child instanceof TFolder) {
          const volume = {
            name: child.name,
            path: child.path,
            chapters: [],
            collapsed: false,
          };

          for (const f of child.children) {
            if (f instanceof TFile && f.extension === "md") {
              volume.chapters.push({
                name: f.basename,
                path: f.path,
              });
            }
          }

          book.volumes.push(volume);
        }
      }

      // Attempt to load configured cover
      try {
        const cfg = (await this.configService.loadBookConfig({ path: book.path })) || {};
        const coverRel = cfg?.basic?.cover;
        if (coverRel) {
          const coverPath = `${book.path}/${coverRel}`;
          const coverFile = this.app.vault.getAbstractFileByPath(coverPath);
          if (coverFile instanceof TFile) {
            book.cover = coverFile;
          }
        } else {
          // fallback: if misc/cover has any file, pick the first one
          const coverFolderPath = `${book.path}/misc/cover`;
          const cf = this.app.vault.getAbstractFileByPath(coverFolderPath);
          if (cf && cf.children && cf.children.length > 0) {
            const first = cf.children.find((c) => c instanceof TFile);
            if (first) book.cover = first;
          }
        }
      } catch (e) {
        // ignore cover load failures
      }

      booksIndex.push(book);
    }

    // Sort books alphabetically
    booksIndex.sort((a, b) => a.name.localeCompare(b.name));
    return booksIndex;
  }

  /**
   * Create a new book with default structure
   */
  async createBook(basePath, name) {
    if (!name) return;
    const path = `${basePath}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;

    // Create book root folder
    await this.app.vault.createFolder(path);

    // Create misc structure
    const miscPath = `${path}/misc`;
    const coverPath = `${miscPath}/cover`;

    await this.app.vault.createFolder(miscPath);
    await this.app.vault.createFolder(coverPath);

    // Create canonical book config file
    try {
      const bookConfigPath = `${path}/misc/book-config.json`;
      const now = new Date().toISOString();
      const defaultConfig = {
        basic: {
          title: name,
          author: [],
          subtitle: "",
          desc: "",
          uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`,
          created_at: now,
        },
        structure: {
          tree: [
            { id: 'preface', title: 'Preface', type: 'file', path: 'Preface.md', order: 1, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'moodboard', title: 'Moodboard', type: 'canvas', path: 'Moodboard.canvas', order: 2, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'volume1', title: 'Volume 1', type: 'group', path: 'Volume 1', order: 3, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'outline', title: 'Outline', type: 'file', path: 'Outline.md', order: 4, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'afterword', title: 'Afterword', type: 'file', path: 'Afterword.md', order: 5, default_status: 'draft', created_at: now, last_modified: now }
          ]
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
          last_modified: now
        },
        export: {
          default_format: 'pdf',
          template: 'default',
          include_cover: true
        }
      };
      
      if (!this.app.vault.getAbstractFileByPath(bookConfigPath)) {
        await this.app.vault.create(bookConfigPath, JSON.stringify(defaultConfig, null, 2));
      }
    } catch (e) {
      console.warn('createBook: failed to create book-config.json in misc', e);
    }

    // Ensure base structure
    const bookFolder = this.app.vault.getAbstractFileByPath(path);
    if (bookFolder instanceof TFolder) {
      await this.ensureBookBaseStructure(bookFolder);
    }
  }

  /**
   * Ensure book has basic structure (Preface, Outline, etc.)
   */
  async ensureBookBaseStructure(bookFolder) {
    const vault = this.app.vault;
    const filesToCreate = ["Preface.md", "Outline.md", "Moodboard.canvas", "Afterword.md"];

    for (const file of filesToCreate) {
      const filePath = `${bookFolder.path}/${file}`;
      if (!vault.getAbstractFileByPath(filePath)) {
        await vault.create(filePath, "");
      }
    }

    const miscPath = `${bookFolder.path}/misc`;
    const coverPath = `${miscPath}/cover`;

    if (!vault.getAbstractFileByPath(miscPath)) {
      await vault.createFolder(miscPath);
    }

    if (!vault.getAbstractFileByPath(coverPath)) {
      await vault.createFolder(coverPath);
    }

    // Ensure canonical book-config.json exists
    try {
      const bmPath = `${bookFolder.path}/misc/book-config.json`;
      if (!vault.getAbstractFileByPath(bmPath)) {
        const now = new Date().toISOString();
        const defaultConfig = {
          basic: {
            title: bookFolder.name,
            author: [],
            subtitle: "",
            desc: "",
            uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`,
            created_at: now
          },
          structure: { tree: [] },
          stats: {
            total_words: 0,
            target_total_words: 10000,
            progress_by_words: 0,
            progress_by_chapter: 0,
            daily_words: {},
            writing_days: 0,
            average_daily_words: 0,
            last_writing_date: now,
            last_modified: now
          },
          export: {
            default_format: 'pdf',
            template: 'default',
            include_cover: true
          }
        };
        await vault.create(bmPath, JSON.stringify(defaultConfig, null, 2));
      }
    } catch (e) {
      console.warn('ensureBookBaseStructure: failed to create book-config.json in misc', e);
    }
  }

  /**
   * Create a new volume (folder) in a book
   */
  async createVolume(book, name) {
    if (!name) return;
    const path = `${book.path}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;
    await this.app.vault.createFolder(path);
  }

  /**
   * Create a new chapter (markdown file) in a volume
   */
  async createChapter(volume, name) {
    if (!name) return;
    const path = `${volume.path}/${name}.md`;
    if (await this.app.vault.adapter.exists(path)) return;
    await this.app.vault.create(path, "");
  }

  /**
   * Check if a file is a volume folder
   */
  isVolumeFolder(file, booksIndex) {
    try {
      return booksIndex.some((b) =>
        b.volumes.some((v) => v.path === file.path)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a file is a chapter file
   */
  isChapterFile(file, booksIndex) {
    try {
      return booksIndex.some((b) =>
        b.volumes.some((v) =>
          v.chapters.some((c) => c.path === file.path)
        )
      );
    } catch {
      return false;
    }
  }
}
