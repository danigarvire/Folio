/*****************************************************************
 * Novelist — main.js
 * JS PURO · BASELINE ESTABLE
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

const VIEW_TYPE = "novelist-view";

/* ===============================================================
 * PLUGIN
 * =============================================================== */

module.exports = class NovelistPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.booksIndex = [];
    this.activeBook = null;
    // singleton leaf holder — ensure only one NovelistView exists
    this.novelistLeaf = null;
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
    // NOTE: migration was run previously; comment out automatic re-run to avoid accidental overwrites
    // try {
    //   await this.migrateBookJsonToConfig();
    // } catch (e) {
    //   console.warn('book.json migration failed', e);
    // }
    // UI state: remember expanded folder paths and currently active file
    this.expandedFolders = new Set();
    this.activeFilePath = null;

    this.registerView(
      VIEW_TYPE,
      (leaf) => new NovelistView(leaf, this)
    );

    this.addRibbonIcon("book-open", "Open Novelist", () => {
      this.activateView();
    });

    this.addSettingTab(new NovelistSettingTab(this.app, this));


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

  // Minimal chapter context menu (Open in new tab/pane, Mark complete, Exclude, Create copy, Rename, Delete)
  openChapterContextMenu(evt, file) {
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

      // Mark as complete
      menu.addItem((it) =>
        it.setTitle("Mark as complete").setIcon("check").onClick(() => {
          this.markChapterComplete(file);
        })
      );

      // Exclude from stats
      menu.addItem((it) =>
        it.setTitle("Exclude from stats").setIcon("eye-off").onClick(() => {
          this.excludeFromStats(file);
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

  openVolumeMenu(evt, folder, isRoot = false) {
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

      // New file (create Chapter N.md automatically)
      menu.addItem((it) =>
        it.setTitle(isRoot ? "New root file" : "New file").setIcon("file-plus").onClick(async () => {
          try {
            await this.createNextChapterFile(folder);
            await this.refresh();
            this.rerenderViews();
          } catch (e) {
            console.error(e);
          }
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
  

  /* Reusable activator: always reuse the same leaf (singleton view) */
  async activateView() {
    if (this.novelistLeaf) {
      try {
        this.app.workspace.revealLeaf(this.novelistLeaf);
        return;
      } catch {
        // fallback to creating a new leaf if reveal fails
        this.novelistLeaf = null;
      }
    }

    const leaf = this.app.workspace.getLeaf(false);
    await leaf.setViewState({
      type: VIEW_TYPE,
      active: true,
    });
    this.novelistLeaf = leaf;
  }

  async refresh() {
    // DO NOT create or activate views here — only rescan and re-render existing ones
    await this.scanBooks();
    // use centralized rerender to clear and render views safely
    this.rerenderViews();
  }

  async ensureBasePath() {
    const base = this.settings.basePath || "projects";
    if (!(await this.app.vault.adapter.exists(base))) {
      await this.app.vault.createFolder(base);
    }
  }

  /* ===============================================================
   * SCAN BOOKS (filesystem source of truth)
   * =============================================================== */

  async scanBooks() {
    const basePath = this.settings.basePath || "projects";
    const base = this.app.vault.getAbstractFileByPath(basePath);
    if (!(base instanceof TFolder)) return;

    this.booksIndex = [];

    // avoid duplicates in case the vault returns repeated entries
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

      // Cleanup legacy misc/metadata folder if present (remove stale legacy files)
      try {
        const legacyMetaPath = `${bookFolder.path}/misc/metadata`;
        const legacyMetaAf = this.app.vault.getAbstractFileByPath(legacyMetaPath);
        if (legacyMetaAf) {
          await this.app.vault.delete(legacyMetaAf, true);
          try {
            if (this.settings && this.settings.verboseLogs) console.debug('Removed legacy metadata folder', legacyMetaPath);
          } catch {}
        }
      } catch (e) {
        // ignore cleanup failures
      }

      for (const child of bookFolder.children) {

        /* IGNORE misc folder */
        if (child instanceof TFolder && child.name === "misc") {
          continue;
        }

        /* VOLUMES */
        if (child instanceof TFolder) {
          const volume = {
            name: child.name,
            path: child.path,
            chapters: [],
            collapsed: false,
            // no alternate display name — keep model minimal
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

      // Attempt to load configured cover from misc/book-config.json (if present)
      try {
        const cfg = (await this.loadBookConfig({ path: book.path })) || {};
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

      this.booksIndex.push(book);
    }

    // Sort books alphabetically for consistent ordering
    this.booksIndex.sort((a, b) => a.name.localeCompare(b.name));

    if (!this.activeBook && this.booksIndex.length > 0) {
      this.activeBook = this.booksIndex[0];
    }

    /* ===============================================================
       ACTIVE BOOK RECONCILIATION
    =============================================================== */

    this.activeBook =
      this.booksIndex.find(
        (b) => b.path === this.activeBook?.path
      ) ?? this.booksIndex[0] ?? null;
  }

  /* ===============================================================
   * CREATE METHODS
   * =============================================================== */

  async createBook(name) {
    if (!name) return;
    const path = `${this.settings.basePath}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;

    // Book root
    await this.app.vault.createFolder(path);

    // misc structure
    const miscPath = `${path}/misc`;
    const coverPath = `${miscPath}/cover`;

    await this.app.vault.createFolder(miscPath);
    await this.app.vault.createFolder(coverPath);
    // Create canonical book config file inside misc folder (book-config.json)
    try {
      const bookConfigPath = `${path}/misc/book-config.json`;
      const now = new Date().toISOString();
          const defaultConfig = {
        basic: {
          title: name,
          author: [],
          subtitle: "",
          desc: "",
          uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2,10)}`,
          created_at: now,
        },
        structure: {
          tree: [
            { id: 'preface', title: 'Preface', type: 'file', path: 'Preface.md', order: 1, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'outline', title: 'Outline', type: 'file', path: 'Outline.md', order: 2, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'moodboard', title: 'Moodboard', type: 'canvas', path: 'Moodboard.canvas', order: 3, default_status: 'draft', created_at: now, last_modified: now },
            { id: 'volume1', title: 'Volume 1', type: 'group', path: 'Volume 1', order: 4, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'afterword', title: 'Afterword', type: 'file', path: 'Afterword.md', order: 5, default_status: 'draft', created_at: now, last_modified: now }
          ]
        },
        stats: {
          total_words: 0,
          target_total_words: 0,
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

    // Ensure canonical base structure (Preface, Outline, Afterword, misc folders)
    const bookFolder = this.app.vault.getAbstractFileByPath(path);
    if (bookFolder instanceof TFolder) {
      await this.ensureBookBaseStructure(bookFolder);
    }

    // Do not refresh or set activeBook here — leave it to the caller to perform a single refresh
    // and set the active book after any additional structural creation is complete.
  }

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
    // Ensure canonical book-config.json exists inside the book's misc folder for existing books
    try {
      const bmPath = `${bookFolder.path}/misc/book-config.json`;
      if (!vault.getAbstractFileByPath(bmPath)) {
        const now = new Date().toISOString();
        const defaultConfig = {
          basic: { title: bookFolder.name, author: [], subtitle: "", desc: "", uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2,10)}`, created_at: now },
          structure: { tree: [] },
          stats: { total_words: 0, target_total_words: 0, progress_by_words: 0, progress_by_chapter: 0, daily_words: {}, writing_days: 0, average_daily_words: 0, last_writing_date: now, last_modified: now },
          export: { default_format: 'pdf', template: 'default', include_cover: true }
        };
        await vault.create(bmPath, JSON.stringify(defaultConfig, null, 2));
      }
    } catch (e) {
      console.warn('ensureBookBaseStructure: failed to create book-config.json in misc', e);
    }
  }

  async createVolume(book, name) {
    if (!name) return;
    const path = `${book.path}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;

    await this.app.vault.createFolder(path);
    // Intentionally do not refresh here; caller should refresh once after batch ops
  }

  async createChapter(volume, name) {
    if (!name) return;
    const path = `${volume.path}/${name}.md`;
    if (await this.app.vault.adapter.exists(path)) return;

    await this.app.vault.create(path, "");
    // Intentionally do not refresh here; caller should refresh once after batch ops
    try {
      const book = this.booksIndex.find((b) => path.startsWith(b.path));
      if (book) await this.syncChapterStatsBaseline(book);
    } catch (e) {
      console.warn('syncChapterStatsBaseline (createChapter) failed', e);
    }
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

  // Delete a folder and all its children recursively using Vault API
  async deleteFolderRecursive(path) {
    try {
      const af = this.app.vault.getAbstractFileByPath(path);
      if (!af) return;
      if (af instanceof TFile) {
        await this.app.vault.delete(af);
        return;
      }
      // Prefer vault.delete with recursive flag to remove folder and contents.
      try {
        if (typeof this.app.vault.delete === 'function') {
          await this.app.vault.delete(af, true);
          return;
        }
      } catch (e) {
        // If recursive delete not supported or failed, fall back to manual removal
        console.warn('vault.delete recursive attempt failed, falling back', e);
      }

      // directory: delete children first (fallback)
      if (af.children && af.children.length > 0) {
        const children = Array.from(af.children);
        for (const c of children) {
          if (c instanceof TFile) {
            try { await this.app.vault.delete(c); } catch (e) { console.warn('delete child file failed', c.path, e); }
          } else {
            await this.deleteFolderRecursive(c.path);
          }
        }
      }

      // now remove the folder itself
      try {
        await this.app.vault.delete(af);
      } catch (e) {
        // fallback to adapter rmdir if vault.delete fails
        try {
          if (this.app.vault.adapter && typeof this.app.vault.adapter.rmdir === 'function') {
            await this.app.vault.adapter.rmdir(path);
          }
        } catch (e2) {
          console.warn('deleteFolderRecursive: failed to remove folder', path, e2);
        }
      }
      // Wait for folder to disappear from vault index to avoid race with refresh
      try {
        const maxRetries = 20;
        let retries = maxRetries;
        while (retries-- > 0) {
          const test = this.plugin ? this.app.vault.getAbstractFileByPath(path) : this.app.vault.getAbstractFileByPath(path);
          if (!test) break;
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch (e) {
        // ignore polling errors
      }
    } catch (e) {
      console.warn('deleteFolderRecursive failed', path, e);
    }
  }

  async markChapterComplete(file) {
    try {
      const af = this.app.vault.getAbstractFileByPath(file.path) || file;
      if (!(af instanceof TFile)) return;
      const content = await this.app.vault.read(af);
      // simple frontmatter toggle: set completed: true
      if (content.startsWith("---")) {
        const end = content.indexOf("---", 3);
        if (end !== -1) {
          const fmRaw = content.slice(3, end).trim();
          const rest = content.slice(end + 3);
          const lines = fmRaw.split('\n').filter(Boolean);
          const map = {};
          lines.forEach((l) => {
            const [k, ...r] = l.split(":");
            map[k.trim()] = r.join(":").trim();
          });
          map.completed = "true";
          const newFm = Object.entries(map).map(([k, v]) => `${k}: ${v}`).join('\n');
          const newContent = `---\n${newFm}\n---\n${rest}`;
          await this.app.vault.modify(af, newContent);
        } else {
          await this.app.vault.append(af, "\n\ncompleted: true\n");
        }
      } else {
        const newContent = `---\ncompleted: true\n---\n\n${content}`;
        await this.app.vault.modify(af, newContent);
      }
      
      // Also update book-config.json tree structure
      try {
        const book = this.booksIndex.find((b) => file.path.startsWith(b.path));
        if (book) {
          const cfg = (await this.loadBookConfig(book)) || {};
          if (cfg.structure && cfg.structure.tree) {
            const relativePath = file.path.replace(book.path + '/', '');
            const updateNode = (nodes) => {
              for (const node of nodes) {
                if (node.path === relativePath) {
                  node.completed = true;
                  node.last_modified = new Date().toISOString();
                  return true;
                }
                if (node.children && updateNode(node.children)) return true;
              }
              return false;
            };
            if (updateNode(cfg.structure.tree)) {
              await this.saveBookConfig(book, cfg);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to update book-config.json for completed status', e);
      }
      
      await this.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async excludeFromStats(file) {
    try {
      const af = this.app.vault.getAbstractFileByPath(file.path) || file;
      if (!(af instanceof TFile)) return;
      const content = await this.app.vault.read(af);
      if (content.startsWith("---")) {
        const end = content.indexOf("---", 3);
        if (end !== -1) {
          const fmRaw = content.slice(3, end).trim();
          const rest = content.slice(end + 3);
          const lines = fmRaw.split('\n').filter(Boolean);
          const map = {};
          lines.forEach((l) => {
            const [k, ...r] = l.split(":");
            map[k.trim()] = r.join(":").trim();
          });
          map.exclude_from_stats = "true";
          const newFm = Object.entries(map).map(([k, v]) => `${k}: ${v}`).join('\n');
          const newContent = `---\n${newFm}\n---\n${rest}`;
          await this.app.vault.modify(af, newContent);
        } else {
          await this.app.vault.append(af, "\n\nexclude_from_stats: true\n");
        }
      } else {
        const newContent = `---\nexclude_from_stats: true\n---\n\n${content}`;
        await this.app.vault.modify(af, newContent);
      }
      
      // Also update book-config.json tree structure
      try {
        const book = this.booksIndex.find((b) => file.path.startsWith(b.path));
        if (book) {
          const cfg = (await this.loadBookConfig(book)) || {};
          if (cfg.structure && cfg.structure.tree) {
            const relativePath = file.path.replace(book.path + '/', '');
            const updateNode = (nodes) => {
              for (const node of nodes) {
                if (node.path === relativePath) {
                  node.exclude = true;
                  node.last_modified = new Date().toISOString();
                  return true;
                }
                if (node.children && updateNode(node.children)) return true;
              }
              return false;
            };
            if (updateNode(cfg.structure.tree)) {
              await this.saveBookConfig(book, cfg);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to update book-config.json for exclude status', e);
      }
      
      await this.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async promptRename(defaultValue) {
    return new Promise((resolve) => {
      class _PromptModal extends Modal {
        constructor(app, opts) {
          super(app);
          this.title = opts.title;
          this.placeholder = opts.placeholder;
          this.cta = opts.cta || "Rename";
          this.defaultValue = opts.defaultValue || "";
          this._resolve = opts.resolve;
        }

        onOpen() {
          const { contentEl } = this;
          contentEl.empty();
          contentEl.createEl("h2", { text: this.title || "Rename" });

          const input = contentEl.createEl("input", {
            type: "text",
            placeholder: this.placeholder || "New name",
          });
          input.value = this.defaultValue;

          const actions = contentEl.createDiv({ cls: "modal-button-container" });
          const cancelBtn = actions.createEl("button", { text: "Cancel" });
          const confirmBtn = actions.createEl("button", { text: this.cta, cls: "mod-cta" });

          cancelBtn.onclick = () => {
            this._resolve(null);
            this.close();
          };

          confirmBtn.onclick = () => {
            const v = input.value.trim();
            this._resolve(v || null);
            this.close();
          };

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmBtn.click();
            } else if (e.key === "Escape") {
              this._resolve(null);
              this.close();
            }
          });

          input.focus();
        }

        onClose() {
          // ensure resolution if closed otherwise
          try {
            this._resolve(null);
          } catch {}
        }
      }

      const modal = new _PromptModal(this.app, {
        title: "Rename",
        placeholder: "New name",
        defaultValue,
        resolve,
      });
      modal.open();
    });
  }

  async loadSettings() {
    this.settings = Object.assign(
      { basePath: "projects", verboseLogs: false },
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async readBookMetadata(book) {
    // Legacy per-book metadata files under `misc/metadata/` were removed.
    // Keep this function for compatibility but return null so callers rely
    // on `misc/book-config.json` as the canonical source of metadata.
    return null;
  }

  // Load simple book meta (legacy) from book.json at root or from book-config.json
  async loadBookMeta(book) {
    try {
      // Prefer canonical misc/book-config.json and always return a safe shape
      const cfg = (await this.loadBookConfig(book)) || {};
      if (!cfg || !cfg.basic) {
        return {
          title: book.name,
          subtitle: "",
          author: "",
          description: "",
          targetWordCount: 0,
        };
      }

      return {
        title: cfg.basic.title || book.name,
        subtitle: cfg.basic.subtitle || "",
        author: Array.isArray(cfg.basic.author)
          ? cfg.basic.author.join(', ')
          : cfg.basic.author || "",
        description: cfg.basic.desc || cfg.basic.description || "",
        targetWordCount: cfg.stats?.target_total_words || 0,
      };
    } catch (e) {
      console.warn('loadBookMeta failed', e);
      return {
        title: book.name,
        subtitle: "",
        author: "",
        description: "",
        targetWordCount: 0,
      };
    }
  }

  // Save simple book meta (legacy) to book.json at root
  async saveBookMeta(book, meta) {
    try {
      // Prefer writing into misc/book-config.json to keep all canonical config in one place.
      try {
        let cfg = {};
        if (this.loadBookConfig) cfg = (await this.loadBookConfig(book)) || {};
        cfg.basic = cfg.basic || {};
        // map simple meta fields into the full config
        if (meta && typeof meta === 'object') {
          if (meta.title) cfg.basic.title = meta.title;
          if (meta.subtitle) cfg.basic.subtitle = meta.subtitle;
          if (meta.author) {
            // accept string or array
            cfg.basic.author = Array.isArray(meta.author) ? meta.author : String(meta.author).split(',').map(s => s.trim()).filter(Boolean);
          }
          if (meta.description) cfg.basic.desc = meta.description;
          // target mapping (legacy key may be targetWordCount)
          const targ = meta.targetWordCount || meta.target || 0;
          if (targ) {
            cfg.stats = cfg.stats || {};
            cfg.stats.target_total_words = Number(targ) || cfg.stats.target_total_words || 0;
          }
        }
        if (this.saveBookConfig) {
          await this.saveBookConfig(book, cfg);
          return true;
        }
      } catch (e) {
        console.warn('saveBookMeta -> saveBookConfig failed, falling back to book.json', e);
      }

      // Fallback: write legacy book.json (only if saveBookConfig unavailable or failed)
      const filePath = `${book.path}/book.json`;
      const f = this.app.vault.getAbstractFileByPath(filePath);
      const content = JSON.stringify(meta || {}, null, 2);
      if (!f) {
        await this.app.vault.create(filePath, content);
      } else {
        await this.app.vault.modify(f, content);
      }
      return true;
    } catch (e) {
      console.warn('saveBookMeta failed', e);
      return false;
    }
  }

  // Migrate legacy book.json into misc/book-config.json for all scanned books.
  // This will merge simple metadata into `cfg.basic` and `cfg.stats.target_total_words`.
  async migrateBookJsonToConfig() {
    try {
      if (!Array.isArray(this.booksIndex) || this.booksIndex.length === 0) return;
      for (const book of this.booksIndex) {
        try {
          const legacyPath = `${book.path}/book.json`;
          const legacyFile = this.app.vault.getAbstractFileByPath(legacyPath);
          if (!legacyFile) continue;

          const raw = await this.app.vault.read(legacyFile);
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
          if (!parsed) continue;

          // load existing config if present
          let cfg = {};
          try { cfg = (await this.loadBookConfig(book)) || {}; } catch (e) { cfg = {}; }
          cfg.basic = cfg.basic || {};
          cfg.stats = cfg.stats || {};

          // map fields from parsed into config (do not overwrite existing values unless empty)
          if (parsed.title && !cfg.basic.title) cfg.basic.title = parsed.title;
          if (parsed.subtitle && !cfg.basic.subtitle) cfg.basic.subtitle = parsed.subtitle;
          if (parsed.author && (!cfg.basic.author || cfg.basic.author.length === 0)) {
            cfg.basic.author = Array.isArray(parsed.author) ? parsed.author : String(parsed.author).split(',').map(s=>s.trim()).filter(Boolean);
          }
          if (parsed.description && !cfg.basic.desc) cfg.basic.desc = parsed.description;
          const targ = parsed.targetWordCount || parsed.target || parsed.target_total_words || 0;
          if (targ && !cfg.stats.target_total_words) cfg.stats.target_total_words = Number(targ) || cfg.stats.target_total_words || 0;

          // persist merged config
          await this.saveBookConfig(book, cfg);
          // verify fields migrated and remove legacy file to avoid confusion
          try {
            const shouldDelete = Boolean(parsed && (parsed.title || parsed.subtitle || parsed.author || parsed.description || parsed.targetWordCount || parsed.target || parsed.target_total_words));
            if (shouldDelete) {
              try {
                await this.app.vault.delete(legacyFile);
                console.log(`Novelist: migrated and removed legacy ${legacyPath}`);
              } catch (e) {
                console.warn(`Novelist: migrated but failed to remove ${legacyPath}`, e);
              }
            } else {
              console.log(`Novelist: migrated ${legacyPath} -> misc/book-config.json (nothing to delete)`);
            }
          } catch (e) {
            console.warn('Novelist: post-migration cleanup failed', e);
          }
        } catch (e) {
          console.warn('migration per-book failed', book && book.path, e);
        }
      }
    } catch (e) {
      console.warn('migrateBookJsonToConfig failed', e);
    }
  }

    // Load full book config from book-config.json inside misc (preferred)
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

    // Save full book config to book-config.json inside misc
  async saveBookConfig(book, config) {
    try {
      const filePath = `${book.path}/misc/book-config.json`;
      const miscDir = `${book.path}/misc`;
      try {
        const existingMisc = this.app.vault.getAbstractFileByPath(miscDir);
        if (!existingMisc) {
          await this.app.vault.createFolder(miscDir);
        }
      } catch (e) {
        // ignore folder create errors; create will fail later if necessary
      }
      const f = this.app.vault.getAbstractFileByPath(filePath);
      // If an existing config exists, merge shallowly to avoid erasing other sections
      let finalCfg = config || {};
      if (f) {
        try {
          const existingRaw = await this.app.vault.read(f);
          const existing = JSON.parse(existingRaw || '{}');
          // Deep-merge with preference for non-empty values from `config`.
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
        try { if (this.settings && this.settings.verboseLogs) console.debug('Novelist.saveBookConfig writing', book.path, { basic: finalCfg.basic, stats: { target_total_words: finalCfg.stats && finalCfg.stats.target_total_words } }); } catch {}
        await this.app.vault.modify(f, content);
      } else {
        const content = JSON.stringify(finalCfg || {}, null, 2);
        try { if (this.settings && this.settings.verboseLogs) console.debug('Novelist.saveBookConfig creating', filePath, { basic: finalCfg.basic, stats: { target_total_words: finalCfg.stats && finalCfg.stats.target_total_words } }); } catch {}
        await this.app.vault.create(filePath, content);
      }
      return true;
    } catch (e) {
      console.warn('saveBookConfig failed', e);
      return false;
    }
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
      try {
        if (view && typeof view.clearView === "function") {
          view.clearView();
        }
      } catch (e) {
        console.warn("clearView failed", e);
      }
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

  // Update only the stats block in existing Novelist views to avoid full re-renders
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
    const parts = text.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
    return parts.length;
  }

  _getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // Compute basic stats for a book and persist into book-config.json.stats
  async computeAndSaveStatsForBook(book) {
    try {
      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;
      const mdFiles = this._collectMarkdownFiles(folder).filter((f) => {
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
          const wc = this._countWords(content);
          perChapter[f.path.replace(book.path + '/', '')] = wc;
          total += wc;
        } catch (e) {
          // ignore individual read errors
        }
      }

      // load or create config
      let cfg = {};
      if (this.loadBookConfig) cfg = (await this.loadBookConfig(book)) || {};
      // Ensure basic exists so stats-only saves don't create configs without basic metadata
      cfg.basic = cfg.basic || { title: book.name };
      cfg.stats = cfg.stats || {};

      // Daily tracking: update daily_words, writing_days and average_daily_words
      const today = this._getTodayKey();
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
      cfg.stats.average_daily_words = cfg.stats.writing_days > 0 ? Math.round(sumDaily / cfg.stats.writing_days) : 0;

      // Persist main stats
      cfg.stats.total_words = total;
      cfg.stats.per_chapter = perChapter;
      cfg.stats.last_writing_date = today;
      cfg.stats.last_modified = new Date().toISOString();
      // progress by words relative to target_total_words if present
      const target = (cfg.stats.target_total_words && Number(cfg.stats.target_total_words)) || 0;
      cfg.stats.progress_by_words = target > 0 ? Math.round((total / target) * 10000) / 100 : 0; // percent with 2 decimals
      // progress by chapter: fraction of chapters with >0 words
      const totalCh = Object.keys(perChapter).length;
      const doneCh = Object.values(perChapter).filter((n) => n > 0).length;
      cfg.stats.progress_by_chapter = {
        completed: doneCh,
        total: totalCh,
        percent: totalCh > 0 ? Math.round((doneCh / totalCh) * 10000) / 100 : 0,
      };

      if (this.saveBookConfig) await this.saveBookConfig(book, { stats: cfg.stats });
      // update just the stats block in views to avoid flicker while typing
      await this.updateStatsInViews(book);
    } catch (e) {
      console.warn('computeAndSaveStatsForBook failed', e);
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
      let cfg = {};
      if (this.loadBookConfig) cfg = (await this.loadBookConfig(book)) || {};
      cfg.stats = cfg.stats || {};
      cfg.stats.per_chapter = cfg.stats.per_chapter || {};

      const folder = this.app.vault.getAbstractFileByPath(book.path);
      if (!folder) return;

      const mdFiles = this._collectMarkdownFiles(folder).filter((f) => {
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
      if (this.saveBookConfig) await this.saveBookConfig(book, cfg);
    } catch (e) {
      console.warn('syncChapterStatsBaseline failed', e);
    }
  }

  /* ===============================================================
   * TREE MANAGEMENT HELPERS (Book-Smith pattern)
   * =============================================================== */

  // Generate unique node ID
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Build tree from filesystem (sync tree structure with actual files/folders)
  async buildTreeFromFilesystem(bookFolder) {
    try {
      const cfg = (await this.loadBookConfig({ path: bookFolder.path })) || {};
      const existingTree = cfg?.structure?.tree || [];
      const existingMap = new Map();
      
      // Map existing nodes by path for quick lookup
      const mapNodes = (nodes) => {
        for (const node of nodes) {
          existingMap.set(node.path, node);
          if (node.children) mapNodes(node.children);
        }
      };
      mapNodes(existingTree);

      const buildNode = (item, order) => {
        const relativePath = item.path.replace(bookFolder.path + '/', '');
        const existing = existingMap.get(relativePath);
        
        if (item instanceof TFile) {
          return {
            id: existing?.id || this.generateNodeId(),
            title: existing?.title || item.basename,
            type: item.extension === 'canvas' ? 'canvas' : 'file',
            path: relativePath,
            order: existing?.order ?? order,
            exclude: existing?.exclude || false,
            completed: existing?.completed || false,
            created_at: existing?.created_at || new Date().toISOString(),
            last_modified: new Date().toISOString()
          };
        } else if (item instanceof TFolder) {
          const folderChildren = (item.children || [])
            .filter(child => !(child instanceof TFolder && child.name === 'misc'));
          
          // Sort by existing order if available, otherwise alphabetically
          const childNodes = folderChildren.map(child => buildNode(child, 0));
          childNodes.sort((a, b) => {
            // If both have order, use it; otherwise alphabetically
            if (a.order && b.order) return a.order - b.order;
            return a.title.localeCompare(b.title);
          });
          // Reassign sequential order numbers
          childNodes.forEach((node, idx) => node.order = idx + 1);
          
          const children = childNodes;
          
          return {
            id: existing?.id || this.generateNodeId(),
            title: existing?.title || item.name,
            type: 'group',
            path: relativePath,
            order: existing?.order ?? order,
            is_expanded: existing?.is_expanded ?? false,
            created_at: existing?.created_at || new Date().toISOString(),
            last_modified: new Date().toISOString(),
            children
          };
        }
      };

      const tree = [];
      const fsChildren = (bookFolder.children || [])
        .filter(child => !(child instanceof TFolder && child.name === 'misc'));
      
      // Build nodes first
      const nodes = fsChildren.map(child => buildNode(child, 0));
      
      // Sort by existing order if available, otherwise alphabetically
      nodes.sort((a, b) => {
        if (a.order && b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
      });
      
      // Reassign sequential order numbers
      nodes.forEach((node, idx) => {
        node.order = idx + 1;
        tree.push(node);
      });

      console.log('Built tree from filesystem:', tree);
      return tree;
    } catch (e) {
      console.warn('buildTreeFromFilesystem failed', e);
      return [];
    }
  }

  // Reorder tree nodes after drag and drop
  async reorderTreeNodes(book, draggedNodeId, targetNodeId, position) {
    try {
      const cfg = (await this.loadBookConfig(book)) || {};
      if (!cfg.structure) cfg.structure = {};
      if (!cfg.structure.tree) cfg.structure.tree = [];

      const tree = cfg.structure.tree;
      
      // Find nodes recursively
      const findNode = (nodes, id, parent = null) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            return { node: nodes[i], parent, index: i, siblings: nodes };
          }
          if (nodes[i].children) {
            const result = findNode(nodes[i].children, id, nodes[i]);
            if (result) return result;
          }
        }
        return null;
      };

      const draggedInfo = findNode(tree, draggedNodeId);
      const targetInfo = findNode(tree, targetNodeId);

      if (!draggedInfo || !targetInfo) {
        console.warn('Could not find nodes for reorder', { draggedNodeId, targetNodeId });
        return false;
      }

      // Remove dragged node from its current position
      draggedInfo.siblings.splice(draggedInfo.index, 1);

      // Insert at new position
      if (position === 'inside' && targetInfo.node.type === 'group') {
        // Moving INTO a folder
        const oldPath = `${book.path}/${draggedInfo.node.path}`;
        const fileName = draggedInfo.node.path.split('/').pop();
        const newPath = `${targetInfo.node.path}/${fileName}`;
        
        try {
          const fileToMove = this.app.vault.getAbstractFileByPath(oldPath);
          if (fileToMove) {
            await this.app.fileManager.renameFile(fileToMove, `${book.path}/${newPath}`);
            draggedInfo.node.path = newPath;
          }
        } catch (e) {
          console.warn('Failed to move file in vault:', e);
          return false;
        }
        
        // Add to target's children
        if (!targetInfo.node.children) targetInfo.node.children = [];
        targetInfo.node.children.push(draggedInfo.node);
      } else {
        // Moving BEFORE or AFTER (might be changing parent level)
        // Check if moving from inside a folder to a different level
        const draggedWasNested = draggedInfo.node.path.includes('/');
        const targetIsNested = targetInfo.node.path.includes('/');
        const draggedParentPath = draggedInfo.node.path.split('/').slice(0, -1).join('/');
        const targetParentPath = targetInfo.node.path.split('/').slice(0, -1).join('/');
        
        // If parent paths differ, we need to physically move the file
        if (draggedParentPath !== targetParentPath) {
          const oldPath = `${book.path}/${draggedInfo.node.path}`;
          const fileName = draggedInfo.node.path.split('/').pop();
          const newPath = targetParentPath ? `${targetParentPath}/${fileName}` : fileName;
          
          try {
            const fileToMove = this.app.vault.getAbstractFileByPath(oldPath);
            if (fileToMove) {
              await this.app.fileManager.renameFile(fileToMove, `${book.path}/${newPath}`);
              draggedInfo.node.path = newPath;
            }
          } catch (e) {
            console.warn('Failed to move file to new level:', e);
            return false;
          }
        }
        
        // Find target's new index after removal (in case it shifted)
        const newTargetIndex = targetInfo.siblings.findIndex(n => n.id === targetNodeId);
        if (newTargetIndex === -1) return false;

        const insertIndex = position === 'before' ? newTargetIndex : newTargetIndex + 1;
        targetInfo.siblings.splice(insertIndex, 0, draggedInfo.node);
      }

      // Reorder all nodes
      const reorderNodes = (nodes) => {
        nodes.forEach((node, idx) => {
          node.order = idx + 1;
          node.last_modified = new Date().toISOString();
          if (node.children) reorderNodes(node.children);
        });
      };
      reorderNodes(tree);

      // Save updated tree
      await this.saveBookConfig(book, cfg);
      return true;
    } catch (e) {
      console.warn('reorderTreeNodes failed', e);
      return false;
    }
  }
};

/* ===============================================================
 * VIEW
 * =============================================================== */

class NovelistView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this._isRendering = false;
    this._renderCounter = 0;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Novelist";
  }

  getIcon() {
    return "book-open";
  }

  async onOpen() {
    this.render();
  }

  onClose() {
    // clear plugin singleton reference to avoid multiple active views
    if (this.plugin && this.plugin.novelistLeaf === this.leaf) {
      this.plugin.novelistLeaf = null;
    }
  }

  clearView() {
    try {
      this.contentEl.empty();
    } catch {}
    // reset rendering guard so a fresh render can proceed
    this._isRendering = false;
  }

  // Render a filesystem-backed editorial tree for a book folder (Obsidian-safe)
  // Now with Book-Smith style drag & drop support
  async renderBookTree(container, bookFolder) {
    container.empty();

    const folder =
      bookFolder instanceof TFolder
        ? bookFolder
        : this.plugin.app.vault.getAbstractFileByPath(
            bookFolder?.path || bookFolder
          );

    if (!(folder instanceof TFolder)) {
      console.error("Invalid book folder", bookFolder);
      return;
    }

    const book = this.plugin.activeBook;
    if (!book) return;

    // Always sync tree from filesystem to pick up new/deleted files
    // while preserving existing order and metadata (Book-Smith pattern)
    let configTree = [];
    let useConfigTree = false;
    
    try {
      // Build/sync tree from filesystem (merges with existing config)
      configTree = await this.plugin.buildTreeFromFilesystem(folder);
      
      if (configTree.length > 0) {
        // Save the synced tree
        const cfg = (await this.plugin.loadBookConfig(book)) || {};
        if (!cfg.structure) cfg.structure = {};
        cfg.structure.tree = configTree;
        await this.plugin.saveBookConfig(book, cfg);
        useConfigTree = true;
      }
    } catch (e) {
      console.warn('Failed to build/sync tree from filesystem', e);
    }

    // Drag and drop state
    let draggedElement = null;
    let draggedNodeId = null;

    // Helper to setup drag events
    const setupDragEvents = (element, nodeId, nodeType) => {
      element.setAttribute('draggable', 'true');
      
      element.addEventListener('dragstart', (e) => {
        draggedElement = element;
        draggedNodeId = nodeId;
        element.classList.add('novelist-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', nodeId);
      });

      element.addEventListener('dragend', (e) => {
        element.classList.remove('novelist-dragging');
        document.querySelectorAll('.novelist-dragover, .novelist-dragover-before, .novelist-dragover-after, .novelist-dragover-inside')
          .forEach(el => el.classList.remove('novelist-dragover', 'novelist-dragover-before', 'novelist-dragover-after', 'novelist-dragover-inside'));
        draggedElement = null;
        draggedNodeId = null;
      });

      element.addEventListener('dragover', (e) => {
        if (!draggedElement || draggedElement === element) return;
        e.preventDefault();
        e.stopPropagation();
        
        const rect = element.getBoundingClientRect();
        const mouseY = e.clientY;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        element.classList.remove('novelist-dragover-before', 'novelist-dragover-after', 'novelist-dragover-inside');
        
        if (nodeType === 'group') {
          // Use quarters instead of thirds for better "after" zone when expanded
          const topQuarter = elementTop + elementHeight / 4;
          const bottomHalf = elementTop + elementHeight / 2;
          
          if (mouseY < topQuarter) {
            element.classList.add('novelist-dragover-before');
            e.dataTransfer.dropEffect = 'move';
          } else if (mouseY > bottomHalf) {
            element.classList.add('novelist-dragover-after');
            e.dataTransfer.dropEffect = 'move';
          } else {
            element.classList.add('novelist-dragover-inside');
            e.dataTransfer.dropEffect = 'move';
          }
        } else {
          const middle = elementTop + elementHeight / 2;
          if (mouseY < middle) {
            element.classList.add('novelist-dragover-before');
          } else {
            element.classList.add('novelist-dragover-after');
          }
          e.dataTransfer.dropEffect = 'move';
        }
      });

      element.addEventListener('dragleave', (e) => {
        element.classList.remove('novelist-dragover-before', 'novelist-dragover-after', 'novelist-dragover-inside');
      });

      element.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedNodeId || draggedElement === element) return;
        
        const rect = element.getBoundingClientRect();
        const mouseY = e.clientY;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        let position = 'after';
        
        if (nodeType === 'group') {
          // Use quarters instead of thirds for better "after" zone detection
          const topQuarter = elementTop + elementHeight / 4;
          const bottomHalf = elementTop + elementHeight / 2;
          
          if (mouseY < topQuarter) {
            position = 'before';
          } else if (mouseY > bottomHalf) {
            position = 'after';
          } else {
            position = 'inside';
          }
        } else {
          const middle = elementTop + elementHeight / 2;
          position = mouseY < middle ? 'before' : 'after';
        }
        
        const success = await this.plugin.reorderTreeNodes(book, draggedNodeId, nodeId, position);
        if (success) {
          this.plugin.rerenderViews();
        }
        
        element.classList.remove('novelist-dragover-before', 'novelist-dragover-after', 'novelist-dragover-inside');
      });
    };

    // Render tree from config structure (Book-Smith pattern)
    const renderNodeFromConfig = (node, parentContainer) => {
      // Get the actual file/folder from vault
      const fullPath = `${book.path}/${node.path}`;
      const vaultItem = this.plugin.app.vault.getAbstractFileByPath(fullPath);
      
      // Skip if file/folder doesn't exist in vault
      if (!vaultItem) {
        console.warn('Vault item not found:', fullPath, 'for node:', node);
        return;
      }

      if (node.type === 'group') {
        // Render folder
        const folderRow = parentContainer.createDiv("novelist-tree-folder tree-item is-folder");
        folderRow.dataset.path = fullPath;
        folderRow.dataset.nodeId = node.id;
        
        const collapse = folderRow.createSpan({ cls: "novelist-tree-toggle" });
        collapse.classList.toggle("is-open", this.plugin.expandedFolders.has(fullPath));
        
        const folderIcon = folderRow.createSpan({ cls: "novelist-tree-icon folder-icon" });
        try { 
          setIcon(folderIcon, this.plugin.expandedFolders.has(fullPath) ? "folder-open" : "folder"); 
          setIcon(collapse, this.plugin.expandedFolders.has(fullPath) ? "chevron-down" : "chevron-right"); 
        } catch {}
        
        const titleSpan = folderRow.createSpan({ text: node.title, cls: "novelist-tree-label" });

        setupDragEvents(folderRow, node.id, 'group');

        try {
          folderRow.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
            this.plugin.openVolumeMenu(evt, vaultItem);
          });
        } catch {}

        const childrenEl = parentContainer.createDiv("novelist-tree-children");
        childrenEl.classList.toggle("is-open", this.plugin.expandedFolders.has(fullPath));
        if (!this.plugin.expandedFolders.has(fullPath)) childrenEl.style.display = "none";
        
        collapse.onclick = (e) => {
          e.stopPropagation();
          const isHidden = childrenEl.style.display === "none";
          childrenEl.style.display = isHidden ? "" : "none";
          collapse.classList.toggle("is-open", isHidden);
          childrenEl.classList.toggle("is-open", isHidden);
          if (isHidden) this.plugin.expandedFolders.add(fullPath);
          else this.plugin.expandedFolders.delete(fullPath);
          try { 
            setIcon(folderIcon, isHidden ? "folder-open" : "folder"); 
            setIcon(collapse, isHidden ? "chevron-down" : "chevron-right"); 
          } catch {}
        };

        // Render children
        if (node.children && node.children.length > 0) {
          const sortedChildren = [...node.children].sort((a, b) => a.order - b.order);
          sortedChildren.forEach(child => renderNodeFromConfig(child, childrenEl));
        }
      } else {
        // Render file (file or canvas)
        const fileRow = parentContainer.createDiv("novelist-tree-file tree-item is-file");
        fileRow.dataset.path = fullPath;
        fileRow.dataset.nodeId = node.id;
        
        const icon = fileRow.createSpan({ cls: "novelist-tree-icon" });
        try { 
          setIcon(icon, node.type === 'canvas' ? 'layout-dashboard' : 'file'); 
        } catch {}
        
        const label = fileRow.createSpan({ text: node.title, cls: "novelist-tree-label" });
        
        if (node.exclude) {
          label.classList.add('exclude-from-stats');
        }
        if (node.completed) {
          label.classList.add('is-done');
        }
        
        fileRow.onclick = (e) => {
          e.stopPropagation();
          this.plugin.app.workspace.openLinkText(fullPath, "", false);
        };
        
        setupDragEvents(fileRow, node.id, 'file');
        
        try {
          fileRow.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
            this.plugin.openChapterContextMenu(evt, vaultItem);
          });
        } catch {}
      }
    };

    // Render the tree
    if (useConfigTree && configTree.length > 0) {
      console.log('Rendering tree with', configTree.length, 'root nodes');
      const sortedTree = [...configTree].sort((a, b) => a.order - b.order);
      sortedTree.forEach(node => renderNodeFromConfig(node, container));
    } else {
      console.warn('No config tree to render, useConfigTree:', useConfigTree, 'length:', configTree.length);
    }

    // Allow right-click on empty tree area
    try {
      container.addEventListener('contextmenu', (evt) => {
        try {
          if (evt.target && evt.target.closest && evt.target.closest('.tree-item')) return;
          evt.preventDefault();
          this.plugin.openVolumeMenu(evt, folder, true);
        } catch (e) {}
      });
    } catch {}
  }

  async renderStats(container, book) {
    try {
      if (!book || !this.plugin.loadBookConfig) return;
      let cfg = {};
      try {
        cfg = (await this.plugin.loadBookConfig(book)) || {};
      } catch (e) {
        // ignore load errors
      }
      try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('Novelist.renderStats loaded cfg', book && book.path, { basic: cfg.basic, stats: cfg.stats }); } catch {}
      const stats = cfg.stats || {};
      if (!stats) return;

      const pad = (n) => (typeof n === 'number' ? n : 0);
      const formatTarget = (n) => {
        if (!n) return '—';
        const num = Number(n) || 0;
        if (num >= 1000) {
          const k = num / 1000;
          return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
        }
        return String(num);
      };

      // derive values with safe fallbacks
      const todayKey = new Date().toISOString().slice(0, 10);
      const dailyWords = stats.daily_words || {};
      const todayCount = pad(dailyWords[todayKey]) || 0;
      const totalWords = pad(stats.total_words) || 0;
      const targetWords = pad(stats.target_total_words) || 0;
      const completionPct = typeof stats.progress_by_words !== 'undefined' && stats.progress_by_words !== null
        ? Number(stats.progress_by_words)
        : (targetWords > 0 ? Math.round((totalWords / targetWords) * 10000) / 100 : 0);
      const writingDays = typeof stats.writing_days === 'number' ? stats.writing_days : (stats.daily_words ? Object.keys(stats.daily_words).length : 0);
      const dailyAvg = typeof stats.average_daily_words === 'number' ? stats.average_daily_words : (writingDays > 0 ? Math.round(totalWords / writingDays) : 0);

      // clear and render rows
      container.empty();
      const row = (iconName, label, value, extra) => {
        const r = container.createDiv("novelist-stat-row");
        const left = r.createDiv({ cls: 'novelist-stat-left' });
        const iconSpan = left.createSpan({ cls: 'novelist-stat-icon' });
        try { if (Array.isArray(iconName)) {
          // composite: create multiple small icons
          iconName.forEach((n, i) => {
            const s = iconSpan.createSpan({ cls: `novelist-stat-icon-part part-${i}` });
            try { setIcon(s, n); } catch {}
          });
        } else {
          try { setIcon(iconSpan, iconName); } catch {}
        }} catch {}
        left.createSpan({ text: label, cls: "novelist-stat-label" });
        r.createSpan({ text: value, cls: "novelist-stat-value" });
        if (extra && typeof extra === 'function') extra(r);
      };

      row('pencil', 'Today', `${todayCount} words`);
      // Total words: format as "X / Y" where Y may be 20.0K
      row('file', 'Total words', `${totalWords} / ${formatTarget(targetWords)}`);
      row('target', 'Completion', `${(Math.round(completionPct * 100) / 100).toFixed(2)}%`);
      row('clock', 'Writing days', `${writingDays} days`);
      // use lucide calendar-clock for daily average
      row('calendar-clock', 'Daily average', `${dailyAvg} words`);
    } catch (e) {
      console.warn('renderStats failed', e);
    }
  }

  async render() {
    // start a new render; use a token so any previous async render can abort
    const token = ++this._renderCounter;
    if (this._isRendering) return;
    this._isRendering = true;

    try {
      const el = this.contentEl;
      el.empty();
      el.addClass("novelist-view");

      /* TOP BAR */
      const topBar = el.createDiv("novelist-topbar");
      const newBtn = topBar.createEl("button", { cls: "novelist-top-btn" });
      const newIcon = newBtn.createSpan({ cls: "novelist-top-icon" });
      try { setIcon(newIcon, 'edit'); } catch {}
      newBtn.createSpan({ text: "New", cls: "novelist-top-label" });

      const switchBtn = topBar.createEl("button", { cls: "novelist-top-btn" });
      const switchIcon = switchBtn.createSpan({ cls: "novelist-top-icon" });
      try { setIcon(switchIcon, "repeat"); } catch {}
      switchBtn.createSpan({ text: "Switch", cls: "novelist-top-label" });

      const manageBtn = topBar.createEl("button", { cls: "novelist-top-btn" });
      const manageIcon = manageBtn.createSpan({ cls: "novelist-top-icon" });
      try { setIcon(manageIcon, "library"); } catch {}
      manageBtn.createSpan({ text: "Manage", cls: "novelist-top-label" });
      const helpBtn = topBar.createEl("button", { cls: "novelist-help-btn" });
      const helpIcon = helpBtn.createSpan({ cls: "novelist-help-icon" });
      try { setIcon(helpIcon, "help"); } catch {}

      newBtn.onclick = () => {
        new NewBookModal(this.plugin).open();
      };

      switchBtn.onclick = () => {
        new SwitchBookModal(this.plugin).open();
      };

      manageBtn.onclick = () => {
        new ManageBooksModal(this.plugin).open();
      };

      helpBtn.onclick = () => {
        new HelpModal(this.plugin).open();
      };

      /* SINGLE ACTIVE BOOK ONLY */
      const book = this.plugin.activeBook;
      if (!book) {
        // Render a neutral Novelist header when no active book exists (no CTA).
        const headerEl = el.createDiv("novelist-book-header");
        const coverCol = headerEl.createDiv("novelist-book-cover-col");
        const coverEl = coverCol.createDiv("novelist-book-cover");
        coverEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
        // ensure placeholder styling is applied when no cover image exists
        try { coverEl.addClass && coverEl.addClass('novelist-book-cover-placeholder'); } catch {}
        const titleBlock = headerEl.createDiv("novelist-book-title-block");
        titleBlock.createEl("div", { cls: "novelist-book-title", text: "No active book" });
        titleBlock.createEl("div", { cls: "novelist-book-subtitle", text: "(Select or create a book)" });

        // metadata placeholder (empty)
        const metaBlock = el.createDiv("novelist-book-meta novelist-book-info");
        const authorRow = metaBlock.createDiv('novelist-meta-row');
        authorRow.createEl('div', { text: 'Author', cls: 'novelist-meta-label' });
        authorRow.createEl('div', { text: '—', cls: 'novelist-meta-value' });
        const descRow = metaBlock.createDiv('novelist-meta-row');
        descRow.createEl('div', { text: 'Description', cls: 'novelist-meta-label' });
        descRow.createEl('div', { text: '—', cls: 'novelist-meta-value novelist-meta-desc' });

        // empty structure area
        const structureEl = el.createDiv("novelist-structure");
        structureEl.createEl('p', { text: '(No book selected)' });

        // minimal stats placeholder so the header area doesn't look empty
        try {
          const statsEl = el.createDiv('novelist-stats');
          const makeRow = (label, value) => {
            const r = statsEl.createDiv('novelist-stat-row');
            const left = r.createDiv({ cls: 'novelist-stat-left' });
            left.createSpan({ cls: 'novelist-stat-icon' });
            left.createSpan({ text: label, cls: 'novelist-stat-label' });
            r.createSpan({ text: value, cls: 'novelist-stat-value' });
          };
          makeRow('Today', '—');
          makeRow('Total words', '— / —');
          makeRow('Completion', '—');
          makeRow('Writing days', '—');
          makeRow('Daily average', '—');
        } catch (e) { /* ignore */ }

        return;
      }

      // If the book folder was removed from disk, render a neutral header
      // rather than a CTA. The main view stays read-only and neutral.
      const bookFolderCheck = this.plugin.app.vault.getAbstractFileByPath(book.path);
      if (!bookFolderCheck || !(bookFolderCheck instanceof TFolder)) {
        const headerEl = el.createDiv("novelist-book-header");
        const coverCol = headerEl.createDiv("novelist-book-cover-col");
        const coverEl = coverCol.createDiv("novelist-book-cover");
        coverEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
        try { coverEl.addClass && coverEl.addClass('novelist-book-cover-placeholder'); } catch {}
        const titleBlock = headerEl.createDiv("novelist-book-title-block");
        titleBlock.createEl("div", { cls: "novelist-book-title", text: "No active book" });
        titleBlock.createEl("div", { cls: "novelist-book-subtitle", text: "(Book folder missing)" });

        // metadata placeholder (empty)
        const metaBlock = el.createDiv("novelist-book-meta novelist-book-info");
        const authorRow = metaBlock.createDiv('novelist-meta-row');
        authorRow.createEl('div', { text: 'Author', cls: 'novelist-meta-label' });
        authorRow.createEl('div', { text: '—', cls: 'novelist-meta-value' });
        const descRow = metaBlock.createDiv('novelist-meta-row');
        descRow.createEl('div', { text: 'Description', cls: 'novelist-meta-label' });
        descRow.createEl('div', { text: '—', cls: 'novelist-meta-value novelist-meta-desc' });

        // empty structure area
        const structureEl = el.createDiv("novelist-structure");
        structureEl.createEl('p', { text: '(Book folder missing on disk)' });

        // minimal stats placeholder for missing-folder state
        try {
          const statsEl = el.createDiv('novelist-stats');
          const makeRow = (label, value) => {
            const r = statsEl.createDiv('novelist-stat-row');
            const left = r.createDiv({ cls: 'novelist-stat-left' });
            left.createSpan({ cls: 'novelist-stat-icon' });
            left.createSpan({ text: label, cls: 'novelist-stat-label' });
            r.createSpan({ text: value, cls: 'novelist-stat-value' });
          };
          makeRow('Today', '—');
          makeRow('Total words', '— / —');
          makeRow('Completion', '—');
          makeRow('Writing days', '—');
          makeRow('Daily average', '—');
        } catch (e) { /* ignore */ }

        return;
      }


      /* READ METADATA (authoritative) */
      let metadata = {};
      try {
        if (this.plugin.loadBookMeta) metadata = (await this.plugin.loadBookMeta(book)) || {};
      } catch (e) {
        metadata = {};
      }
      if (this._renderCounter !== token) return;

      // BOOK HEADER — new visual structure (cover left, meta right)
      const headerEl = el.createDiv("novelist-book-header");

      const coverCol = headerEl.createDiv("novelist-book-cover-col");
      const coverEl = coverCol.createDiv("novelist-book-cover");

      const coverPath = book.cover
        ? this.plugin.app.vault.getResourcePath(book.cover)
        : null;
      if (coverPath) {
        coverEl.style.backgroundImage = `url("${coverPath}")`;
      }

      // Title block inside header (cover left, title/subtitle right)
      const titleBlock = headerEl.createDiv("novelist-book-title-block");
      titleBlock.createEl("div", {
        cls: "novelist-book-title",
        text: (metadata && metadata.title) || book.name || "Untitled book",
      });

      const subtitleText = (metadata && metadata.subtitle) || "";
      if (subtitleText) {
        titleBlock.createEl("div", {
          cls: "novelist-book-subtitle",
          text: subtitleText,
        });
      }

      // Separate metadata block (author + description) placed below the header
      const metaBlock = el.createDiv("novelist-book-meta novelist-book-info");
      // Use authoritative metadata (loadBookMeta maps config -> simple shape)
      const authorVal = (metadata && metadata.author) || "";
      const descVal = (metadata && metadata.description) || "";

      // Author row (non-editable)
      const authorRow = metaBlock.createDiv('novelist-meta-row');
      authorRow.createEl('div', { text: 'Author', cls: 'novelist-meta-label' });
      authorRow.createEl('div', { text: authorVal || '—', cls: 'novelist-meta-value' });

      // Description row (non-editable)
      const descRow = metaBlock.createDiv('novelist-meta-row');
      descRow.createEl('div', { text: 'Description', cls: 'novelist-meta-label' });
      descRow.createEl('div', { text: descVal || '—', cls: 'novelist-meta-value novelist-meta-desc' });

      

      /* STRUCTURE (VOLUMES & CHAPTERS) — render from filesystem (editorial order) */
      const structureEl = el.createDiv("novelist-structure");

      const bookFolder = this.plugin.app.vault.getAbstractFileByPath(book.path);
      if (this._renderCounter !== token) return;
      if (bookFolder instanceof TFolder) {
        await this.renderBookTree(structureEl, bookFolder);
      } else {
        // fallback to in-memory model if filesystem folder missing
        structureEl.createEl("p", { text: "(No folder found on disk)" });
      }

      // (stats compute will be run right before rendering the stats element)

      // Right-click on empty tree zone: show generic tree menu (New file / New volume)
      try {
        structureEl.addEventListener('contextmenu', (evt) => {
          try {
            // if the click was on a specific tree item, let its handler manage the menu
            const item = evt.target && evt.target.closest && evt.target.closest('.tree-item');
            if (item) return; // ignore — files/volumes have their own context menus
            evt.preventDefault();
            const menu = new Menu(this.plugin.app);

            // New root canvas (ask for name)
            menu.addItem((it) =>
              it.setTitle('New root canvas').setIcon('layout-dashboard').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root canvas',
                  placeholder: 'Canvas name (without .canvas)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const raw = (value || '').trim();
                      if (!raw) return;
                      const base = raw.endsWith('.canvas') ? raw.slice(0, -7) : raw;
                      let name = `${base}.canvas`;
                      let i = 1;
                      while (this.plugin.app.vault.getAbstractFileByPath(`${book.path}/${name}`)) {
                        name = `${base} ${i}.canvas`;
                        i += 1;
                      }
                      await this.plugin.app.vault.create(`${book.path}/${name}`, '');
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            // New root file (book root)
            menu.addItem((it) =>
              it.setTitle('New root file').setIcon('file-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root file',
                  placeholder: 'File name (without .md)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      const fileName = name.endsWith('.md') ? name : `${name}.md`;
                      const path = `${book.path}/${fileName}`;
                      if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
                        await this.plugin.app.vault.create(path, '');
                      }
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            // (Only root file/volume allowed from empty tree context)

            menu.addItem((it) =>
              it.setTitle('New volume').setIcon('folder-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New volume',
                  placeholder: 'Volume name',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      await this.plugin.createVolume(book, name);
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.showAtMouseEvent(evt);
          } catch (e) {
            console.error(e);
          }
        });
      } catch (e) {
        // ignore if adding listener fails
      }

      // Fixed-height stats block (reserve real space for stats)
      // Create or reuse a single stats container attached to this view
      try {
        if (!this.statsEl || !this.statsEl.parentElement) {
          this.statsEl = el.createDiv("novelist-stats");
        }
      } catch (e) {
        // fallback: create a local stats element
        try { this.statsEl = el.createDiv("novelist-stats"); } catch {}
      }

      // Render stats into the single stats element (stats are updated by file events)
      if (this.statsEl) await this.renderStats(this.statsEl, book);

      // Also allow right-clicking the stats block (it overlays the lower area)
      try {
        if (this.statsEl) this.statsEl.addEventListener('contextmenu', (evt) => {
          try {
            evt.preventDefault();
            const row = evt.target && evt.target.closest && evt.target.closest('.novelist-stat-row');
            if (row) return;

            const menu = new Menu(this.plugin.app);
            // New root canvas (ask for name)
            menu.addItem((it) =>
              it.setTitle('New root canvas').setIcon('layout-dashboard').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root canvas',
                  placeholder: 'Canvas name (without .canvas)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const raw = (value || '').trim();
                      if (!raw) return;
                      const base = raw.endsWith('.canvas') ? raw.slice(0, -7) : raw;
                      let name = `${base}.canvas`;
                      let i = 1;
                      while (this.plugin.app.vault.getAbstractFileByPath(`${book.path}/${name}`)) {
                        name = `${base} ${i}.canvas`;
                        i += 1;
                      }
                      await this.plugin.app.vault.create(`${book.path}/${name}`, '');
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.addItem((it) =>
              it.setTitle('New root file').setIcon('file-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root file',
                  placeholder: 'File name (without .md)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      const fileName = name.endsWith('.md') ? name : `${name}.md`;
                      const path = `${book.path}/${fileName}`;
                      if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
                        await this.plugin.app.vault.create(path, '');
                      }
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.addItem((it) =>
              it.setTitle('New volume').setIcon('folder-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New volume',
                  placeholder: 'Volume name',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      await this.plugin.createVolume(book, name);
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.showAtMouseEvent(evt);
          } catch (e) {
            console.error(e);
          }
        });
      } catch (e) {
        // ignore
      }
    } finally {
      if (this._renderCounter === token) {
        this._isRendering = false;
      }
    }

  }

  }

/* ===============================================================
 * SETTINGS
 * =============================================================== */


class NovelistSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const el = this.containerEl;
    el.empty();

    el.createEl("h2", { text: "Novelist Settings" });

    new Setting(el)
      .setName("Books base path")
      .setDesc("Folder where all books are stored")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.basePath)
          .onChange(async (value) => {
            this.plugin.settings.basePath =
              value.trim() || "projects";
            await this.plugin.saveSettings();
            await this.plugin.refresh();
          })
      );
  }
}

/* ===============================================================
   MODALS
=============================================================== */

class NewBookModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Create new book" });

    const makeDivider = () => contentEl.createDiv({ cls: 'novelist-modal-divider' });

    // Template row
    makeDivider();
    const tplRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const tplLeft = tplRow.createDiv({ cls: 'novelist-modal-left' });
    tplLeft.createEl('div', { text: 'Template', cls: 'novelist-modal-row-title' });
    tplLeft.createEl('div', { text: 'Please select a book template', cls: 'novelist-modal-row-sub' });
    const tplRight = tplRow.createDiv({ cls: 'novelist-modal-right' });
    const tplSelect = tplRight.createEl('select', { cls: 'novelist-template-select' });
    tplSelect.createEl('option', { text: 'default', value: 'default' });

    // Cover row
    makeDivider();
    const coverRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'novelist-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'novelist-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select cover image (optional)', cls: 'novelist-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'novelist-modal-right' });
    const coverBtn = coverRight.createEl('button', { text: 'Select Image' });
    // store selected cover in the modal instance
    this._selectedCover = null;
    coverBtn.onclick = () => {
      // create a hidden file input to open Finder
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const ab = ev.target.result; // ArrayBuffer
            this._selectedCover = { name: file.name, data: ab };
            coverBtn.textContent = 'Select Image';
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          console.warn('cover selection failed', err);
        }
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };

    // Title
    makeDivider();
    const titleRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'novelist-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'novelist-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter book title', cls: 'novelist-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'novelist-modal-right' });
    // responsive field width (max 320px or 60% of modal)
    const fieldWidth = 'min(320px, 60%)';
    const titleInput = titleRight.createEl('input', { type: 'text', placeholder: 'Book title', cls: 'novelist-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}

    // Subtitle
    makeDivider();
    const subRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'novelist-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'novelist-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'novelist-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'novelist-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', placeholder: 'Subtitle', cls: 'novelist-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}

    // Target word count (input is in 1k units: e.g., 20 => 20,000)
    makeDivider();
    const targetRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'novelist-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'novelist-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'novelist-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'novelist-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', placeholder: 'e.g., 20 (20k) or 20000', cls: 'novelist-modal-input' });
    try { targetInput.style.width = fieldWidth; } catch {}

    // Author
    makeDivider();
    const authorRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'novelist-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'novelist-modal-row-title' });
    authorLeft.createEl('div', { text: 'Enter author names, separate multiple authors with commas', cls: 'novelist-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'novelist-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', placeholder: 'Author', cls: 'novelist-modal-input' });
    try { authorInput.style.width = fieldWidth; } catch {}

    // Description
    makeDivider();
    const descRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'novelist-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'novelist-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'novelist-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'novelist-modal-right' });
    const descInput = descRight.createEl('textarea', { placeholder: 'Book description', cls: 'novelist-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; } catch {}

    // Bottom divider + actions
    makeDivider();
    const actions = contentEl.createDiv({ cls: 'novelist-modal-actions' });
    const createBtn = actions.createEl('button', { text: 'Create', cls: 'mod-cta novelist-modal-create' });

    createBtn.onclick = async () => {
      const title = titleInput.value.trim();
      if (!title) return;
      // capture fields before closing the modal (closing may remove DOM inputs)
      const subtitleVal = subtitleInput.value.trim();
      const authorVal = authorInput.value.trim();
      const descVal = descInput.value.trim();
      const targetValRaw = targetInput.value;
      const targetValNum = parseFloat(targetValRaw) || 0;
      this.close();
      // create book folder and base files (createBook should NOT refresh)
      await this.plugin.createBook(title);
      // normalize base path to match createBook's behavior
      const basePath = (this.plugin.settings && this.plugin.settings.basePath) ? String(this.plugin.settings.basePath).replace(/\/+/g, '/') : 'projects';
      const bookPath = `${basePath}/${title}`.replace(/\/+/g, "/");
      try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('NewBookModal.create captured', { title, subtitleVal, authorVal, descVal, targetValNum, bookPath }); } catch {}
      await this.plugin.waitForFolderSync(bookPath);
      // Ensure the plugin rescans the vault so the new book appears in booksIndex
      await this.plugin.refresh();
      const book = this.plugin.booksIndex.find((b) => b.path === bookPath) || this.plugin.booksIndex.find((b) => b.name === title);
      if (book) {
        // Persist initial metadata ASAP so subsequent stats saves won't overwrite it
        try {
          let cfg = {};
          if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(book)) || {};
          cfg.basic = cfg.basic || {};
          cfg.basic.title = title;
          cfg.basic.subtitle = subtitleVal || '';
          cfg.basic.author = authorVal ? authorVal.split(',').map(s=>s.trim()).filter(Boolean) : (cfg.basic.author || []);
          cfg.basic.desc = descVal || '';
          cfg.basic.created_at = cfg.basic.created_at || new Date().toISOString();
          cfg.stats = cfg.stats || {};
          const targ = targetValNum || 0;
          if (targ > 0) {
            cfg.stats.target_total_words = targ >= 1000 ? Math.round(targ) : Math.round(targ * 1000);
          } else {
            cfg.stats.target_total_words = cfg.stats.target_total_words || 0;
          }
          if (this._selectedCover && this._selectedCover.name && this._selectedCover.data) {
            try {
              const destName = `${Date.now()}-${this._selectedCover.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
              const destPath = `${book.path}/misc/cover/${destName}`;
              if (this.plugin.app.vault.adapter && typeof this.plugin.app.vault.adapter.writeBinary === 'function') {
                const uint8 = new Uint8Array(this._selectedCover.data);
                await this.plugin.app.vault.adapter.writeBinary(destPath, uint8);
              } else {
                const blob = new Blob([this._selectedCover.data]);
                const arrayBuf = await blob.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuf);
                try { await this.plugin.app.vault.create(destPath, uint8); } catch (e) { console.warn('fallback cover write failed', e); }
              }
              cfg.basic.cover = `misc/cover/${destName}`;
            } catch (e) {
              console.warn('saving selected cover failed', e);
            }
          }
          if (this.plugin.saveBookConfig) {
            await this.plugin.saveBookConfig(book, cfg);
            try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('NewBookModal saved initial config for', book.path, { basic: cfg.basic }); } catch {}
          }
        } catch (e) {
          console.warn(e);
        }

        // create initial volume/chapter after metadata persisted
        await this.plugin.createVolume(book, "Volume 1");
        await this.plugin.createChapter({ path: `${book.path}/Volume 1` }, "Chapter 1");

        // set active book and persist
        this.plugin.activeBook = book;
        try {
          this.plugin.settings = this.plugin.settings || {};
          this.plugin.settings.lastActiveBookPath = book.path;
          await this.plugin.saveSettings();
        } catch (e) {
          console.warn('failed to persist lastActiveBookPath', e);
        }
        }
        await this.plugin.refresh();
      this.plugin.rerenderViews();
    };

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        createBtn.click();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    titleInput.focus();
  }
}

class SwitchBookModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Switch book" });

    const search = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search books...",
      cls: 'novelist-manage-search'
    });

    const list = contentEl.createDiv({ cls: 'novelist-manage-list' });

    const formatTarget = (n) => {
      if (!n) return '—';
      const num = Number(n) || 0;
      if (num >= 1000) {
        const k = num / 1000;
        return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
      }
      return String(num);
    };

    const renderList = async (filter) => {
      list.empty();
      const seen = new Set();
      for (const book of this.plugin.booksIndex) {
        if (!book || !book.path) continue;
        if (seen.has(book.path)) continue;
        seen.add(book.path);

        // load config once per book
        let cfg = {};
        try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch {}

        const subtitle = cfg?.basic?.subtitle || '';
        const authors = Array.isArray(cfg?.basic?.author) ? cfg.basic.author.join(', ') : (cfg?.basic?.author || '');
        const desc = cfg?.basic?.desc || cfg?.basic?.description || '';
        const totalWords = cfg?.stats?.total_words || 0;
        const targetWords = Number(cfg?.stats?.target_total_words || cfg?.basic?.targetWordCount || 0) || 0;
        let displayTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : (book.name || '');

        const q = filter ? String(filter).trim().toLowerCase() : '';
        if (q) {
          const fields = [displayTitle || book.name || '', subtitle || '', authors || '', desc || ''];
          const matches = fields.some((f) => {
            const s = String(f).toLowerCase();
            if (s.startsWith(q)) return true;
            return s.split(/\s+/).some((w) => w.startsWith(q));
          });
          if (!matches) continue;
        }

        // Compact horizontal row for switch modal (no cover)
        const row = list.createDiv({ cls: 'novelist-switch-book-row' });
        const leftCol = row.createDiv({ cls: 'novelist-switch-left' });
        const rightCol = row.createDiv({ cls: 'novelist-switch-right' });

        // Title + subtitle inline
        const titleRow = leftCol.createDiv({ cls: 'novelist-switch-title-row' });
        titleRow.createSpan({ text: displayTitle || book.name || 'Untitled', cls: 'novelist-switch-title' });
        if (subtitle) {
          titleRow.createSpan({ text: ' - ', cls: 'novelist-switch-dash' });
          titleRow.createSpan({ text: subtitle, cls: 'novelist-switch-subtitle' });
        }

        // compute progress and last modified
        const progressPct = (targetWords > 0) ? Math.round((Number(totalWords) / Number(targetWords)) * 100) : '—';
        let lastMod = '—';
        try {
          const lm = cfg?.stats?.last_modified || cfg?.stats?.lastModified || '';
          if (lm) lastMod = (new Date(lm)).toLocaleString();
        } catch {}

        leftCol.createDiv({ text: `Author: ${authors || '—'} | Progress: ${progressPct}% | Words: ${formatTarget(totalWords)}`, cls: 'novelist-switch-meta' });
        leftCol.createDiv({ text: `Last modified: ${lastMod}`, cls: 'novelist-switch-meta-second' });

        // Select button on the right
        const selectBtn = rightCol.createEl('button', { text: 'Select', cls: 'mod-cta' });
        selectBtn.onclick = () => {
          this.plugin.activeBook = book;
          this.plugin.rerenderViews();
          this.close();
        };
        // clicking the row also selects for convenience
        row.onclick = () => selectBtn.click();
      }
    };

    search.addEventListener('input', (e) => {
      renderList(e.target.value);
    });

    // initial render
    await renderList('');
  }
}

class ManageBooksModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Manage books" });
    const search = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search books...",
      cls: 'novelist-manage-search'
    });
    // import button intentionally omitted — search field serves as primary control

    const list = contentEl.createDiv({ cls: 'novelist-manage-list' });

    // helper to format large targets (e.g., 20000 -> 20K or 20.5K)
    const formatTarget = (n) => {
      if (!n) return '—';
      const num = Number(n) || 0;
      if (num >= 1000) {
        const k = num / 1000;
        return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
      }
      return String(num);
    };

    // render list with optional filter
    const renderList = async (filter) => {
      list.empty();
      const seen = new Set();
      for (const book of this.plugin.booksIndex) {
        if (!book || !book.path) continue;
        if (seen.has(book.path)) continue;
        seen.add(book.path);

        // load config once per book
        let cfg = {};
        try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch {}

        const subtitle = cfg?.basic?.subtitle || '';
        const authors = Array.isArray(cfg?.basic?.author) ? cfg.basic.author.join(', ') : (cfg?.basic?.author || '');
        const desc = cfg?.basic?.desc || cfg?.basic?.description || '';
        const totalWords = cfg?.stats?.total_words || 0;
        const targetWords = Number(cfg?.stats?.target_total_words || cfg?.basic?.targetWordCount || 0) || 0;
        // prefer configured title when present
        const displayTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : (book.name || '');

        const q = filter ? String(filter).trim().toLowerCase() : '';
        if (q) {
          const fields = [displayTitle || book.name || '', subtitle || '', authors || '', desc || ''];
          const matches = fields.some((f) => {
            const s = String(f).toLowerCase();
            if (s.startsWith(q)) return true;
            return s.split(/\s+/).some((w) => w.startsWith(q));
          });
          if (!matches) continue;
        }

        const card = list.createDiv({ cls: 'novelist-manage-card' });
        const left = card.createDiv({ cls: 'novelist-manage-left' });
        const right = card.createDiv({ cls: 'novelist-manage-right' });

        // cover (left)
        const coverWrap = left.createDiv({ cls: 'novelist-manage-cover' });
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (coverFile instanceof TFile) {
            const url = this.plugin.app.vault.getResourcePath(coverFile);
            coverWrap.style.backgroundImage = `url("${url}")`;
          }
        } catch {}
        // placeholder when no cover exists
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (!(coverFile instanceof TFile)) {
            coverWrap.addClass('novelist-manage-cover-placeholder');
            try { coverWrap.createSpan({ text: 'TBD', cls: 'novelist-manage-cover-txt' }); } catch { coverWrap.textContent = 'TBD'; }
          }
        } catch {}

        // Title row: use configured title when available; actions live at right of title
        const titleRow = right.createDiv({ cls: 'novelist-manage-title-row' });
        titleRow.createDiv({ text: displayTitle || book.name || 'Untitled', cls: 'novelist-manage-title' });
        const actions = titleRow.createDiv({ cls: 'novelist-manage-actions' });
        const deleteBtn = actions.createEl('button', { text: 'Delete', cls: 'mod-danger' });
        const editBtn = actions.createEl('button', { text: 'Edit' });

        // Metadata grid: labels on left, values on right (Author / Description / Progress)
        const metaGrid = right.createDiv({ cls: 'novelist-manage-meta-grid' });
        const labelsCol = metaGrid.createDiv({ cls: 'novelist-manage-labels' });
        const valuesCol = metaGrid.createDiv({ cls: 'novelist-manage-values' });

        labelsCol.createEl('div', { text: 'Author', cls: 'novelist-manage-label' });
        valuesCol.createEl('div', { text: authors || '—', cls: 'novelist-manage-author' });

        labelsCol.createEl('div', { text: 'Description', cls: 'novelist-manage-label' });
        const short = desc ? (desc.length > 160 ? desc.slice(0, 157) + '…' : desc) : '—';
        valuesCol.createEl('div', { text: short, cls: 'novelist-manage-desc' });

        labelsCol.createEl('div', { text: 'Progress', cls: 'novelist-manage-label' });
        valuesCol.createEl('div', { text: `${totalWords} / ${formatTarget(targetWords)}`, cls: 'novelist-manage-progress' });

        deleteBtn.onclick = async () => {
          const self = this;
          const modal = new ConfirmModal(this.plugin.app, {
            title: `Delete ${book.name}`,
            message: `Delete book "${book.name}" and all its files? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: async () => {
              try {
                await self.plugin.deleteFolderRecursive(book.path);
              } catch (e) { console.warn('delete book failed', e); }
              await self.plugin.refresh();
              self.close();
            },
          });
          modal.open();
        };

        editBtn.onclick = () => {
          new EditBookModal(this.plugin, book).open();
        };
      }

      // show placeholder when no items match filter
      if (!list.children || list.children.length === 0) {
        const empty = list.createDiv({ cls: 'novelist-manage-empty' });
        empty.createEl('div', { text: 'No books found' });
      }
    };

    // wire search
    search.addEventListener('input', (e) => {
      renderList(e.target.value);
    });

    // handle external updates so the list refreshes while the modal is open
    this._onBookUpdated = (ev) => {
      try { renderList(search.value); } catch {}
    };
    document.addEventListener('novelist:book-updated', this._onBookUpdated);

    // initial render
    await renderList('');
  }

  onClose() {
    try { document.removeEventListener('novelist:book-updated', this._onBookUpdated); } catch {}
  }
}

class EditBookModal extends Modal {
  constructor(plugin, book) {
    super(plugin.app);
    this.plugin = plugin;
    this.book = book;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Edit book" });

    // Prefer loading the full book-config.json, fall back to legacy meta/frontmatter
    let meta = {};
    let cfg = {};
    try {
      if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(this.book)) || {};
    } catch {}

    if (cfg && cfg.basic) {
      meta.title = cfg.basic.title || this.book.name || "";
      meta.subtitle = cfg.basic.subtitle || "";
      meta.author = Array.isArray(cfg.basic.author) ? cfg.basic.author.join(', ') : (cfg.basic.author || "");
      meta.description = cfg.basic.desc || cfg.basic.description || "";
    } else {
      try {
        if (this.plugin.loadBookMeta) meta = (await this.plugin.loadBookMeta(this.book)) || {};
      } catch {}
      try {
        if (!meta || Object.keys(meta).length === 0) {
          const fm = await this.plugin.readBookMetadata(this.book);
          if (fm) meta = Object.assign({}, meta, fm);
        }
      } catch {}
    }

    // unify field sizing for better readability (responsive and narrower)
    const fieldWidth = 'min(320px, 60%)';

    // Cover selector — prefill if config has cover
    let selectedCover = null;
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const coverRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'novelist-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'novelist-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select image (optional)', cls: 'novelist-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'novelist-modal-right' });
    const coverBtn = coverRight.createEl('button', { text: 'Select Image' });
    try {
      const existingCover = cfg?.basic?.cover || '';
      if (existingCover) {
        // keep the button text constant; we still prefill selectedCover
        const baseName = existingCover.split('/').pop();
        selectedCover = { name: baseName, data: null };
      }
    } catch {}
    coverBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const ab = ev.target.result;
            selectedCover = { name: file.name, data: ab };
            coverBtn.textContent = 'Select Image';
          };
          reader.readAsArrayBuffer(file);
        } catch (err) { console.warn('cover selection failed', err); }
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };

    // Title row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const titleRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'novelist-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'novelist-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter book title', cls: 'novelist-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'novelist-modal-right' });
    const titleInput = titleRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}
    titleInput.value = meta.title || this.book.name || '';

    // Subtitle row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const subRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'novelist-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'novelist-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'novelist-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'novelist-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}
    subtitleInput.value = meta.subtitle || '';

    // Author row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const authorRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'novelist-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'novelist-modal-row-title' });
    authorLeft.createEl('div', { text: 'Enter author names, separate multiple authors with commas', cls: 'novelist-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'novelist-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { authorInput.style.width = fieldWidth; } catch {}
    authorInput.value = meta.author || '';

    // Description row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const descRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'novelist-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'novelist-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'novelist-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'novelist-modal-right' });
    const descInput = descRight.createEl('textarea', { cls: 'novelist-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; descInput.style.maxWidth = '100%'; } catch {}
    descInput.value = meta.description || '';

    // Target row (1k units)
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const targetRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'novelist-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'novelist-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'novelist-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'novelist-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', cls: 'novelist-modal-input', placeholder: 'e.g., 20 (20k) or 20000' });
    // detect existing target keys and present a human-friendly value (match NewBook modal scale in 1k)
    const existingTarget = cfg?.basic?.targetWordCount ?? cfg?.stats?.target_total_words ?? cfg?.stats?.targetWordCount ?? '';
    try {
      const num = Number(existingTarget) || 0;
      if (num >= 1000) {
        targetInput.value = String(num / 1000);
      } else {
        targetInput.value = existingTarget || '';
      }
    } catch {
      targetInput.value = existingTarget || '';
    }
    try { targetInput.style.width = fieldWidth; } catch {}

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const cancelBtn = actions.createEl("button", { text: "Cancel" });
    const saveBtn = actions.createEl("button", { text: "Save", cls: "mod-cta" });

    cancelBtn.onclick = () => this.close();

    saveBtn.onclick = async () => {
      const out = Object.assign({}, meta || {});
      out.title = titleInput.value.trim();
      out.subtitle = (typeof subtitleInput !== 'undefined') ? subtitleInput.value.trim() : '';
      out.author = authorInput.value.trim();
      out.description = descInput.value.trim();
      const targetRaw = targetInput.value.trim();
      const targNum = parseFloat(targetRaw) || 0;

      // Persist editorial metadata to legacy book.json (editorial/data layer)
      try {
        if (this.plugin.saveBookMeta) {
          const metaToSave = {
            title: out.title,
            subtitle: out.subtitle || '',
            author: out.author || '',
            description: out.description || '',
            targetWordCount: targNum,
          };
          await this.plugin.saveBookMeta(this.book, metaToSave);
        }
      } catch (e) {
        console.warn('saveBookMeta failed', e);
      }

      // Persist to book-config.json inside misc (map simple fields into the full config)
      let cfg = {};
      try {
        if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(this.book)) || {};
        cfg.basic = cfg.basic || {};
        cfg.stats = cfg.stats || {};

        cfg.basic.title = out.title || cfg.basic.title || this.book.name;
        cfg.basic.subtitle = out.subtitle || cfg.basic.subtitle || '';
        // store authors as array
        cfg.basic.author = out.author ? out.author.split(',').map((s) => s.trim()).filter(Boolean) : (cfg.basic.author || []);
        cfg.basic.desc = out.description || cfg.basic.desc || '';

        // Normalize target to the canonical `stats.target_total_words`.
        // Treat inputs <1000 as '1k' units (e.g., 20 => 20,000). Inputs >=1000 are raw word counts.
        let normalizedTarget = 0;
        if (targNum > 0) {
          if (targNum >= 1000) normalizedTarget = Math.round(targNum);
          else normalizedTarget = Math.round(targNum * 1000);
        }
        cfg.stats = cfg.stats || {};
        cfg.stats.target_total_words = normalizedTarget;

        // ensure baseline modification time for stats
        cfg.stats.last_modified = new Date().toISOString();

        // handle selected cover (copy into misc/cover and reference)
        if (selectedCover && selectedCover.name && selectedCover.data) {
          try {
            const destName = `${Date.now()}-${selectedCover.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destPath = `${this.book.path}/misc/cover/${destName}`;
            if (this.plugin.app.vault.adapter && typeof this.plugin.app.vault.adapter.writeBinary === 'function') {
              const uint8 = new Uint8Array(selectedCover.data);
              await this.plugin.app.vault.adapter.writeBinary(destPath, uint8);
            } else {
              const blob = new Blob([selectedCover.data]);
              const arrayBuf = await blob.arrayBuffer();
              const uint8 = new Uint8Array(arrayBuf);
              try { await this.plugin.app.vault.create(destPath, uint8); } catch (e) { console.warn('fallback cover write failed', e); }
            }
            cfg.basic = cfg.basic || {};
            cfg.basic.cover = `misc/cover/${destName}`;
          } catch (e) { console.warn('saving selected cover failed', e); }
        }

        if (this.plugin.saveBookConfig) await this.plugin.saveBookConfig(this.book, cfg);
      } catch (e) { console.warn(e); }

      // Update in-memory book title last so UI lists (Switch / Manage) reflect
      // the new title after all other fields have been migrated to disk.
      let newTitle;
      try {
        newTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : out.title || this.book.name;
        // update the modal's book instance
        try { this.book.name = newTitle; } catch {}
        // update entry in plugin.booksIndex
        if (Array.isArray(this.plugin.booksIndex)) {
          const idx = this.plugin.booksIndex.findIndex((b) => b && b.path === this.book.path);
          if (idx !== -1) this.plugin.booksIndex[idx].name = newTitle;
        }
        // update activeBook if it's the same book
        try { if (this.plugin.activeBook && this.plugin.activeBook.path === this.book.path) this.plugin.activeBook.name = newTitle; } catch {}
      } catch (err) { console.warn('updating in-memory book title failed', err); }

      // Attempt to rename the underlying folder to match the new title.
      try {
        const oldPath = this.book.path;
        const parentParts = String(oldPath).split('/').slice(0, -1);
        const parent = parentParts.join('/');
        // sanitize folder name for filesystem
        const safeName = String(newTitle || '').replace(/[\\/\:\*\?"<>\|]/g, '_').trim();
        const newPath = parent ? `${parent}/${safeName}` : safeName;
        if (safeName && newPath !== oldPath) {
          const existing = this.plugin.app.vault.getAbstractFileByPath(newPath);
          if (!existing) {
            const folderAf = this.plugin.app.vault.getAbstractFileByPath(oldPath);
            if (folderAf) {
              // Temporarily suppress known ENOENT unhandled rejections that can
              // occur inside Obsidian's internal link-update/read pipeline while
              // a folder is being renamed. We only suppress errors that reference
              // the old path to avoid hiding unrelated issues.
              const onUnhandledRej = (ev) => {
                try {
                  const r = ev && ev.reason;
                  if (!r) return;
                  // Node/Electron may surface an Error-like object with `code` and `message`
                  if (r && r.code === 'ENOENT' && typeof r.message === 'string' && r.message.includes(oldPath)) {
                    try { ev.preventDefault && ev.preventDefault(); } catch {}
                  }
                } catch {}
              };
              try {
                if (typeof window !== 'undefined' && window && window.addEventListener) {
                  window.addEventListener('unhandledrejection', onUnhandledRej);
                }

                try {
                  // Prefer FileManager.renameFile when available for better integration
                  if (this.plugin.app.fileManager && typeof this.plugin.app.fileManager.renameFile === 'function') {
                    await this.plugin.app.fileManager.renameFile(folderAf, newPath);
                  } else {
                    await this.plugin.app.vault.rename(folderAf, newPath);
                  }
                } finally {
                  // Small stabilization delay to allow Obsidian's background tasks
                  // (link updates, watchers) to settle before we touch in-memory state.
                  try { await new Promise((r) => setTimeout(r, 250)); } catch {}
                }

                // Wait briefly for the vault to surface the new folder (some backends are async)
                try { await this.plugin.waitForFolderSync(newPath, 40); } catch {}

                // verify new folder is visible before updating in-memory structures
                const checkAf = this.plugin.app.vault.getAbstractFileByPath(newPath);
                if (checkAf) {
                  try { this.book.path = newPath; } catch {}
                  if (Array.isArray(this.plugin.booksIndex)) {
                    const idx2 = this.plugin.booksIndex.findIndex((b) => b && b.path === oldPath);
                    if (idx2 !== -1) {
                      this.plugin.booksIndex[idx2].path = newPath;
                      this.plugin.booksIndex[idx2].name = newTitle;
                    }
                  }
                  if (this.plugin.activeBook && this.plugin.activeBook.path === oldPath) {
                    this.plugin.activeBook.path = newPath;
                    this.plugin.activeBook.name = newTitle;
                    try {
                      this.plugin.settings = this.plugin.settings || {};
                      this.plugin.settings.lastActiveBookPath = newPath;
                      await this.plugin.saveSettings();
                    } catch (e) {}
                  }
                } else {
                  console.warn('rename succeeded but new folder not visible yet', newPath);
                }
              } catch (e) {
                console.warn('folder rename failed', e);
              } finally {
                try { if (typeof window !== 'undefined' && window && window.removeEventListener) window.removeEventListener('unhandledrejection', onUnhandledRej); } catch {}
              }
            }
          } else {
            console.warn('target folder already exists, skipping rename', newPath);
          }
        }
      } catch (e) {
        console.warn('rename attempt failed', e);
      }

      // Notify other modals/views that the book updated so ManageBooks can refresh in-place
      try { document.dispatchEvent(new CustomEvent('novelist:book-updated', { detail: { path: this.book.path } })); } catch {}
      // Also refresh views
      await this.plugin.refresh();
      this.plugin.rerenderViews();
      this.close();
    };
  }
}

class HelpModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Help" });
    contentEl.createEl("p", { text: "TBD" });
  }
}

class TextInputModal extends Modal {
  constructor(app, { title, placeholder, cta, onSubmit }) {
    super(app);
    this.title = title;
    this.placeholder = placeholder;
    this.cta = cta;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: this.title });

    const input = contentEl.createEl("input", {
      type: "text",
      placeholder: this.placeholder,
    });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = actions.createEl("button", {
      text: "Cancel",
    });

    const confirmBtn = actions.createEl("button", {
      text: this.cta,
      cls: "mod-cta",
    });

    cancelBtn.onclick = () => this.close();

    confirmBtn.onclick = () => {
      const value = input.value.trim();
      if (!value) return;

      this.onSubmit(value);
      this.close();
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        confirmBtn.click();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    input.focus();
  }
}

class ConfirmModal extends Modal {
  constructor(app, { title, message, confirmText, onConfirm }) {
    super(app);
    this.title = title;
    this.message = message;
    this.confirmText = confirmText || "Confirm";
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = actions.createEl("button", { text: "Cancel" });
    const confirmBtn = actions.createEl("button", {
      text: this.confirmText,
      cls: "mod-warning",
    });

    cancelBtn.onclick = () => this.close();
    confirmBtn.onclick = async () => {
      await this.onConfirm();
      this.close();
    };
  }
}
