/*****************************************************************
 * Novelist — main.js
 * MODULAR ARCHITECTURE - Services Integrated
 *****************************************************************/

const {
  Plugin,
  PluginSettingTab,
  Setting,
  ItemView,
  TFile,
  TFolder,
  Modal,
  Menu,
  setIcon,
} = require("obsidian");

// Import services
import { ConfigService } from './services/configService.js';
import { TreeService } from './services/treeService.js';
import { StatsService } from './services/statsService.js';
import { BookService } from './services/bookService.js';
import { VIEW_TYPE, WRITER_TOOLS_VIEW_TYPE, DEFAULT_SETTINGS } from './constants/index.js';

// Import views
import { FolioView } from './views/folioView.js';
import { WriterToolsView } from './views/writerToolsView.js';
import { FolioSettingTab } from './views/folioSettingTab.js';

// Import modals
import { NewBookModal } from './modals/newBookModal.js';
import { SwitchBookModal } from './modals/switchBookModal.js';
import { ManageBooksModal } from './modals/manageBooksModal.js';
import { EditBookModal } from './modals/editBookModal.js';
import { HelpModal } from './modals/helpModal.js';
import { TextInputModal } from './modals/textInputModal.js';
import { ConfirmModal } from './modals/confirmModal.js';

/* ===============================================================
 * PLUGIN
 * =============================================================== */

module.exports = class FolioPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    // Initialize services
    this.configService = new ConfigService(this.app);
    this.treeService = new TreeService(this.app, this.configService);
    this.statsService = new StatsService(this.app, this.configService);
    this.bookService = new BookService(this.app, this.configService);

    this.booksIndex = [];
    this.activeBook = null;
    // singleton leaf holder — ensure only one FolioView exists
    this.folioLeaf = null;
    // track active editor file for UI sync
    this.activeFile = null;

    await this.ensureBasePath();
    await this.scanBooks();
    // restore previously active book if saved in settings
    try {
      if (this.settings && this.settings.lastActiveBookPath) {
        const byPath = this.booksIndex.find((b) => b.path === this.settings.lastActiveBookPath);
        if (byPath) this.activeBook = byPath;
      }
    } catch {}
    
    // UI state: remember expanded folder paths and currently active file
    this.expandedFolders = new Set();
    this.activeFilePath = null;

    this.registerView(
      VIEW_TYPE,
      (leaf) => new FolioView(leaf, this)
    );

    this.registerView(
      WRITER_TOOLS_VIEW_TYPE,
      (leaf) => new WriterToolsView(leaf, this)
    );

    this.addRibbonIcon("book", "Open Folio", () => {
      this.activateFolio();
    });

    this.addSettingTab(new FolioSettingTab(this.app, this));


    /* LIVE SYNC */
    this.registerEvent(
      this.app.vault.on("create", () => this.refresh())
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.refresh())
    );
    this.registerEvent(
      this.app.vault.on("rename", async () => {
        const activePath = this.activeBook?.path;
        await this.refresh();
        if (activePath) {
          const book = this.booksIndex.find((b) => b.path === activePath);
          if (book) {
            this.activeBook = book;
            try {
              await this.syncChapterStatsBaseline(book);
            } catch (e) {
              console.warn('syncChapterStatsBaseline (rename) failed', e);
            }
          }
        }
      })
    );

    // update stats when markdown files are modified
    this._statsDebounceTimers = {};
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        try {
          this.onFileModified(file);
        } catch (e) {
          console.warn('onFileModified handler failed', e);
        }
      })
    );
    // also listen to editor changes so stats update without an explicit save
    try {
      this.registerEvent(
        this.app.workspace.on('editor-change', (editor, view) => {
          try {
            const f = view?.file;
            if (f) this.onFileModified(f);
          } catch (e) {
            console.warn('editor-change handler failed', e);
          }
        })
      );
    } catch (e) {
      // older Obsidian builds may not emit editor-change; ignore safely
    }

    // update activeFile on leaf change — update active state in views without full rerender
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        const af = this.app.workspace.getActiveFile();
        this.activeFilePath = af ? af.path : null;
        try {
          this.updateActiveFileInViews();
        } catch (e) {
          this.rerenderViews();
        }
      })
    );

    // Context menus for volumes/chapters are built inline in the view
  }

  // Minimal chapter context menu (Open in new tab/pane, Exclude toggle, Create copy, Rename, Delete)
  openChapterContextMenu(evt, file, node = null) {
    try {
      evt.preventDefault?.();
      const menu = new Menu(this.app);

      // Open in new tab
      menu.addItem((it) =>
        it.setTitle("Open in new tab").setIcon("file").onClick(() => {
          (async () => {
            try {
              const leaf = this.app.workspace.getLeaf("tab");
              if (leaf && typeof leaf.openFile === "function") {
                await leaf.openFile(file);
              }
            } catch (e) {
              try {
                const leaf = this.app.workspace.getLeaf(true);
                if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
              } catch (e2) {
                console.warn(e2);
              }
            }
          })();
        })
      );

      // Open in new pane
      menu.addItem((it) =>
        it.setTitle("Open in new pane").setIcon("split").onClick(() => {
          (async () => {
            try {
              const leaf = this.app.workspace.getLeaf("split");
              if (leaf && typeof leaf.openFile === "function") {
                await leaf.openFile(file);
              }
            } catch (e) {
              try {
                const leaf = this.app.workspace.getLeaf(true);
                if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
              } catch (e2) {
                console.warn(e2);
              }
            }
          })();
        })
      );

      menu.addSeparator();

      // Exclude from stats toggle - show current state
      const isExcluded = node?.exclude || false;
      menu.addItem((it) =>
        it.setTitle(isExcluded ? "Include in stats" : "Exclude from stats")
          .setIcon(isExcluded ? "eye" : "eye-off")
          .onClick(() => {
            this.toggleExcludeFromStats(file, !isExcluded);
          })
      );

      menu.addSeparator();

      // Create copy
      menu.addItem((it) =>
        it.setTitle("Create copy").setIcon("copy").onClick(() => {
          try {
            this.app.fileManager.duplicateFile(file);
          } catch (e) {
            console.error(e);
          }
        })
      );

      // Rename
      menu.addItem((it) =>
        it.setTitle("Rename").setIcon("pencil").onClick(() => {
          try {
            this.app.fileManager.promptForFileRename(file);
          } catch (e) {
            console.warn(e);
          }
        })
      );

      // Delete
      menu.addItem((it) =>
        it.setTitle("Delete").setIcon("trash").onClick(async () => {
          try {
            await this.app.vault.delete(file, file instanceof TFolder);
            await this.refresh();
            this.rerenderViews();
          } catch (e) {
            console.error(e);
          }
        })
      );

      menu.showAtMouseEvent(evt);
    } catch (e) {
      console.error(e);
    }
  }

  openVolumeMenu(evt, folder, isRoot = false, node = null) {
    try {
      evt.preventDefault?.();
      const menu = new Menu(this.app);

      // New canvas
      menu.addItem((it) =>
        it.setTitle(isRoot ? "New root canvas" : "New canvas").setIcon("layout-dashboard").onClick(async () => {
          try {
            const folderObj =
              folder instanceof TFolder
                ? folder
                : this.app.vault.getAbstractFileByPath(folder?.path || folder);
            if (!(folderObj instanceof TFolder)) return;
            // choose a non-colliding filename
            let base = 'Canvas';
            let name = `${base}.canvas`;
            let i = 1;
            while (this.app.vault.getAbstractFileByPath(`${folderObj.path}/${name}`)) {
              i += 1;
              name = `${base} ${i}.canvas`;
            }
            await this.app.vault.create(`${folderObj.path}/${name}`, '');
            await this.refresh();
            this.rerenderViews();
          } catch (e) {
            console.error(e);
          }
        })
      );

      // New file (ask for name)
      menu.addItem((it) =>
        it.setTitle(isRoot ? "New root file" : "New file").setIcon("file-plus").onClick(() => {
          const modal = new TextInputModal(this.app, {
            title: "New file",
            placeholder: "File name",
            cta: "Create",
            onSubmit: async (value) => {
              const name = (value || "").trim();
              if (!name) return;
              try {
                const fileName = name.endsWith('.md') ? name : `${name}.md`;
                const dest = `${folder.path}/${fileName}`;
                if (!this.app.vault.getAbstractFileByPath(dest)) {
                  await this.app.vault.create(dest, "");
                  const book = this.booksIndex.find((b) => dest.startsWith(b.path));
                  if (book) await this.syncChapterStatsBaseline(book);
                }
                await this.refresh();
                this.rerenderViews();
              } catch (e) {
                console.error(e);
              }
            },
          });
          modal.open();
        })
      );

      // New folder (ask for name)
      menu.addItem((it) =>
        it.setTitle(isRoot ? "New volume" : "New folder").setIcon("folder-plus").onClick(() => {
          const modal = new TextInputModal(this.app, {
            title: "New folder",
            placeholder: "Folder name",
            cta: "Create",
            onSubmit: async (value) => {
              const name = (value || "").trim();
              if (!name) return;
              try {
                const dest = `${folder.path}/${name}`;
                if (!this.app.vault.getAbstractFileByPath(dest)) {
                  await this.app.vault.createFolder(dest);
                }
                await this.refresh();
                this.rerenderViews();
              } catch (e) {
                console.error(e);
              }
            },
          });
          modal.open();
        })
      );

      menu.addSeparator();

      // Exclude from stats toggle (only for non-root folders)
      if (!isRoot && node) {
        const isExcluded = node.exclude || false;
        menu.addItem((it) =>
          it.setTitle(isExcluded ? "Include in stats" : "Exclude from stats")
            .setIcon(isExcluded ? "eye" : "eye-off")
            .onClick(() => {
              this.toggleExcludeFromStats(folder, !isExcluded);
            })
        );
      }

      // Create copy
      menu.addItem((it) =>
        it.setTitle("Create copy").setIcon("copy").onClick(() => {
          try {
            this.createCopy(folder.path);
          } catch (e) {
            console.error(e);
          }
        })
      );

      menu.addSeparator();

      // Rename
      menu.addItem((it) =>
        it.setTitle("Rename").setIcon("pencil").onClick(() => {
          try {
            this.app.fileManager.promptForFileRename(folder);
          } catch (e) {
            console.warn(e);
          }
        })
      );

      // Delete
      menu.addItem((it) =>
        it.setTitle("Delete").setIcon("trash").onClick(async () => {
          try {
            await this.app.vault.delete(folder, folder instanceof TFolder);
            await this.refresh();
            this.rerenderViews();
          } catch (e) {
            console.error(e);
          }
        })
      );

      menu.showAtMouseEvent(evt);
    } catch (e) {
      console.error(e);
    }
  }

  // Helper: open a file in the current leaf
  openFile(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file && file instanceof TFile) {
      this.app.workspace.openLinkText(file.path, "", false);
    }
  }

  // Helper: open file in a new tab (open in new leaf)
  openFileInNewTab(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file && file instanceof TFile) {
      try {
        this.app.workspace.openLinkText(file.path, "", true);
      } catch {
        // fallback: create a new leaf and open
        const leaf = this.app.workspace.getLeaf(true);
        leaf.openFile(file);
      }
    }
  }

  // Helper: open file in a new split/pane
  openFileInNewPane(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file && file instanceof TFile) {
      try {
        const leaf = this.app.workspace.getLeaf(true);
        leaf.openFile(file);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  renamePath(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) {
      try {
        this.app.fileManager.promptForFileRename(file);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  async deletePath(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) return;
    try {
      await this.app.vault.delete(file, file instanceof TFolder);
      await this.refresh();
      this.rerenderViews();
    } catch (e) {
      console.error(e);
    }
  }

  createCopy(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) return;
    try {
      if (file instanceof TFile) {
        this.app.fileManager.duplicateFile(file);
      } else if (file instanceof TFolder) {
        // naive folder copy: create a sibling folder with " Copy" suffix and copy files
        const parentPath = file.path.split("/").slice(0, -1).join("/") || "";
        const baseName = `${file.name} Copy`;
        let destPath = `${parentPath}/${baseName}`.replace(/\/+/g, "/");
        let i = 1;
        while (this.app.vault.getAbstractFileByPath(destPath)) {
          destPath = `${parentPath}/${baseName} ${i}`;
          i++;
        }
        const createFolderAndCopy = async (src, dest) => {
          await this.app.vault.createFolder(dest);
          const folder = this.app.vault.getAbstractFileByPath(src);
          if (!(folder instanceof TFolder)) return;
          for (const child of folder.children) {
            const childDest = `${dest}/${child.name}`;
            if (child instanceof TFile) {
              const content = await this.app.vault.read(child);
              await this.app.vault.create(childDest, content);
            } else if (child instanceof TFolder) {
              await createFolderAndCopy(child.path, childDest);
            }
          }
        };
        createFolderAndCopy(file.path, destPath).then(async () => {
          await this.refresh();
          this.rerenderViews();
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async createNextChapterFile(folder) {
    try {
      const folderObj =
        folder instanceof TFolder
          ? folder
          : this.app.vault.getAbstractFileByPath(folder?.path || folder);
      if (!(folderObj instanceof TFolder)) return;

      const existing = (folderObj.children ?? [])
        .filter((c) => c instanceof TFile && c.extension === "md")
        .map((f) => f.basename);

      let max = 0;
      for (const name of existing) {
        const match = name.match(/^Chapter (\d+)$/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n)) max = Math.max(max, n);
        }
      }

      const next = max + 1;
      const fileName = `Chapter ${next}.md`;
      const path = `${folderObj.path}/${fileName}`;
      if (this.app.vault.getAbstractFileByPath(path)) return;
      await this.app.vault.create(path, "");
      try {
        const book = this.booksIndex.find((b) => path.startsWith(b.path));
        if (book) await this.syncChapterStatsBaseline(book);
      } catch (e) {
        console.warn('syncChapterStatsBaseline (createNextChapterFile) failed', e);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Helper: create sub-volume (folder) under a given folder path via modal
  createSubVolume(parentFolderPath) {
    const modal = new TextInputModal(this.app, {
      title: "New folder",
      placeholder: "Folder name",
      cta: "Create",
      onSubmit: async (value) => {
        if (!value) return;
        const folderObj = { path: parentFolderPath };
        await this.createVolume(folderObj, value);
        await this.refresh();
        this.rerenderViews();
      },
    });
    modal.open();
  }
  

  /* Activate both views: Folio (left) + Writer Tools (right) */
  async activateFolio() {
    // Open Folio View on the left
    await this.activateView();
    
    // Open Writer Tools on the right
    await this.openWriterTools();
  }

  /* Reusable activator: always reuse the same leaf (singleton view) */
  async activateView() {
    const { workspace } = this.app;
    
    // Check if already open
    const existing = workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      this.folioLeaf = existing[0];
      return;
    }

    // Open in left sidebar
    const leftLeaf = workspace.getLeftLeaf(false);
    await leftLeaf.setViewState({
      type: VIEW_TYPE,
      active: true,
    });
    this.folioLeaf = leftLeaf;
    workspace.revealLeaf(leftLeaf);
  }

  /* Open Writer Tools in right sidebar */
  async openWriterTools() {
    const { workspace } = this.app;
    
    // Check if already open
    const existing = workspace.getLeavesOfType(WRITER_TOOLS_VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }

    // Open in right sidebar
    const rightLeaf = workspace.getRightLeaf(false);
    await rightLeaf.setViewState({
      type: WRITER_TOOLS_VIEW_TYPE,
      active: true
    });
    
    workspace.revealLeaf(rightLeaf);
  }

  async refresh() {
    // DO NOT create or activate views here — only rescan and re-render existing ones
    await this.scanBooks();
    // use centralized rerender to clear and render views safely
    this.rerenderViews();
  }

  // Normalize basePath - remove leading/trailing slashes and multiple slashes
  getBasePath() {
    let base = this.settings.basePath || "projects";
    // Remove leading/trailing slashes and normalize multiple slashes
    base = base.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    return base || "projects";
  }

  async ensureBasePath() {
    const base = this.getBasePath();
    if (!(await this.app.vault.adapter.exists(base))) {
      await this.app.vault.createFolder(base);
    }
  }

  /* ===============================================================
   * SCAN BOOKS (filesystem source of truth)
   * =============================================================== */

  async scanBooks() {
    const basePath = this.getBasePath();
    this.booksIndex = await this.bookService.scanBooks(basePath);
    
    if (!this.activeBook && this.booksIndex.length > 0) {
      this.activeBook = this.booksIndex[0];
    }

    this.activeBook =
      this.booksIndex.find(
        (b) => b.path === this.activeBook?.path
      ) ?? this.booksIndex[0] ?? null;
  }

  /* ===============================================================
   * CREATE METHODS
   * =============================================================== */

  async createBook(name, projectType = 'book') {
    const basePath = this.getBasePath();
    return this.bookService.createBook(basePath, name, projectType);
  }

  async ensureBookBaseStructure(bookFolder) {
    return this.bookService.ensureBookBaseStructure(bookFolder);
  }

  async createVolume(book, name) {
    return this.bookService.createVolume(book, name);
  }

  async createChapter(volume, name, projectType = 'book') {
    const result = await this.bookService.createChapter(volume, name, projectType);
    try {
      const book = this.booksIndex.find((b) => `${volume.path}/${name}.md`.startsWith(b.path));
      if (book) await this.syncChapterStatsBaseline(book);
    } catch (e) {
      console.warn('syncChapterStatsBaseline (createChapter) failed', e);
    }
    return result;
  }

  /* Helpers for native file-menu integration */
  isVolumeFolder(file) {
    try {
      return this.booksIndex.some((b) =>
        b.volumes.some((v) => v.path === file.path)
      );
    } catch {
      return false;
    }
  }

  isChapterFile(file) {
    try {
      return this.booksIndex.some((b) =>
        b.volumes.some((v) =>
          v.chapters.some((c) => c.path === file.path)
        )
      );
    } catch {
      return false;
    }
  }

  async deleteVolume(folder) {
    const af = this.app.vault.getAbstractFileByPath(folder.path) || folder;
    await this.app.vault.delete(af, true);
    await this.refresh();
  }

  async deleteChapter(file) {
    const af = this.app.vault.getAbstractFileByPath(file.path) || file;
    await this.app.vault.delete(af);
    await this.refresh();
    try {
      const book = this.booksIndex.find((b) => file.path.startsWith(b.path));
      if (book) await this.syncChapterStatsBaseline(book);
    } catch (e) {
      console.warn('syncChapterStatsBaseline (deleteChapter) failed', e);
    }
  }

  // Move a folder and all its children to trash
  async deleteFolderRecursive(path) {
    try {
      const af = this.app.vault.getAbstractFileByPath(path);
      if (!af) return;
      // Use vault.trash to move to system trash (true = use system trash)
      await this.app.vault.trash(af, true);
    } catch (e) {
      console.warn('deleteFolderRecursive (trash) failed', path, e);
    }
  }

  async toggleExcludeFromStats(file, exclude) {
    const book = this.booksIndex.find((b) => file.path.startsWith(b.path));
    if (!book) {
      console.warn('Could not find book for file:', file.path);
      return;
    }
    await this.treeService.toggleExcludeFromStats(book, file, exclude);
    await this.refresh();
    this.rerenderViews();
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // Delegate to ConfigService
  async loadBookConfig(book) {
    return this.configService.loadBookConfig(book);
  }

  // Delegate to ConfigService
  async saveBookConfig(book, config) {
    return this.configService.saveBookConfig(book, config);
  }

  // Delegate to ConfigService
  async loadBookMeta(book) {
    return this.configService.loadBookMeta(book);
  }

  async waitForFolderSync(path, retries = 20) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    while (retries-- > 0) {
      const folder = this.app.vault.getAbstractFileByPath(path);
      if (folder && folder.children && folder.children.length > 0) return;
      await delay(50);
    }
    // fallthrough: timed out, but continue (caller will refresh)
  }

  rerenderViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      // Don't call clearView() before render() - render() already calls el.empty()
      // and clearView() resets the _isRendering guard which can cause double-rendering
      try {
        if (view && typeof view.render === "function") {
          view.render();
        }
      } catch (e) {
        console.warn("render failed", e);
      }
    }
  }

  updateActiveFileInViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      try {
        if (!view || !view.contentEl) continue;
        const root = view.contentEl;
        const items = root.querySelectorAll('.tree-item');
        items.forEach((el) => {
          try {
            const p = el.getAttribute('data-path');
            if (p && p === this.activeFilePath) el.classList.add('is-active');
            else el.classList.remove('is-active');
          } catch {}
        });
      } catch (e) {
        console.warn('updateActiveFileInViews failed', e);
      }
    }
  }

  // Update only the stats block in existing Folio views to avoid full re-renders
  async updateStatsInViews(book) {
    try {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
      for (const leaf of leaves) {
        const view = leaf.view;
        try {
          if (!view || !view.statsEl) continue;
          // Only update views showing the same book to avoid cross-book rendering
          if (!book || !view.plugin || !view.plugin.activeBook) continue;
          if (view.plugin.activeBook.path !== book.path) continue;
          if (typeof view.renderStats === 'function') {
            await view.renderStats(view.statsEl, book);
          }
        } catch (e) {
          // ignore individual view update errors
        }
      }
    } catch (e) {
      console.warn('updateStatsInViews failed', e);
    }
  }

  // Handle modified files — debounce per-book to avoid excessive work
  async onFileModified(file) {
    try {
      if (!file || !file.path) return;
      // Only care about markdown files
      if (file.extension !== 'md' && !file.path.endsWith('.md')) return;
      // find owning book
      const book = this.booksIndex.find((b) => file.path === b.path || file.path.startsWith(b.path + '/'));
      if (!book) return;

      // debounce
      const key = book.path;
      if (this._statsDebounceTimers[key]) clearTimeout(this._statsDebounceTimers[key]);
      this._statsDebounceTimers[key] = setTimeout(() => {
        this.computeAndSaveStatsForBook(book).catch((e) => console.warn('computeAndSaveStatsForBook failed', e));
        delete this._statsDebounceTimers[key];
      }, 400);
    } catch (e) {
      console.warn('onFileModified error', e);
    }
  }

  // Walk folder recursively to collect markdown TFile objects
  _collectMarkdownFiles(folder) {
    const out = [];
    if (!folder || !folder.children) return out;
    for (const c of folder.children) {
      if (c instanceof TFile && c.name && c.name.toLowerCase().endsWith('.md')) out.push(c);
      else if (c.children) {
        out.push(...this._collectMarkdownFiles(c));
      }
    }
    return out;
  }

  // Count words in text
  _countWords(text) {
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

  _getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // Delegate to StatsService
  async computeAndSaveStatsForBook(book) {
    const stats = await this.statsService.computeAndSaveStatsForBook(book);
    if (stats) {
      await this.updateStatsInViews(book);
    }
    return stats;
  }

  // Delegate to StatsService
  async syncChapterStatsBaseline(book) {
    return this.statsService.syncChapterStatsBaseline(book);
  }

  /* ===============================================================
   * TREE MANAGEMENT HELPERS (Book-Smith pattern)
   * =============================================================== */

  // Generate unique node ID
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async buildTreeFromFilesystem(bookFolder) {
    return this.treeService.buildTreeFromFilesystem(bookFolder);
  }

  async reorderTreeNodes(book, draggedNodeId, targetNodeId, position) {
    return this.treeService.reorderTreeNodes(book, draggedNodeId, targetNodeId, position);
  }
};

/* ===============================================================
 * END OF MAIN.JS
=============================================================== */

