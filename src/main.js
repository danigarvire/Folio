/*****************************************************************
 * Folio — main.js
 *****************************************************************/

import {
  Plugin,
  PluginSettingTab,
  Setting,
  ItemView,
  Notice,
  TFile,
  TFolder,
  Modal,
  Menu,
  setIcon,
} from "obsidian";

import { ConfigService } from './services/configService.js';
import { TreeService } from './services/treeService.js';
import { StatsService } from './services/statsService.js';
import { BookService } from './services/bookService.js';
import { PdfExportService } from './services/pdfExportService.js';
import { VIEW_TYPE, WRITER_TOOLS_VIEW_TYPE, DEFAULT_SETTINGS, PROJECT_TYPES } from './constants/index.js';
import { SCREENPLAY_SNIPPET_CSS } from './constants/screenplaySnippet.js';

import { FolioView } from './views/folioView.js';
import { WriterToolsView } from './views/writerToolsView.js';
import { FolioSettingTab } from './views/folioSettingTab.js';

import { NewBookModal } from './modals/newBookModal.js';
import { SwitchBookModal } from './modals/switchBookModal.js';
import { ManageBooksModal } from './modals/manageBooksModal.js';
import { EditBookModal } from './modals/editBookModal.js';
import { HelpModal } from './modals/helpModal.js';
import { TextInputModal } from './modals/textInputModal.js';
import { ConfirmModal } from './modals/confirmModal.js';

export default class FolioPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.configService = new ConfigService(this.app);
    this.treeService = new TreeService(this.app, this.configService);
    this.statsService = new StatsService(this.app, this.configService);
    this.bookService = new BookService(this.app, this.configService);
    this.pdfExportService = new PdfExportService(this.app, this.configService);
    this.screenplayStyleEl = null;

    this.booksIndex = [];
    this.activeBook = null;
    this.folioLeaf = null;
    this.activeFile = null;

    await this.ensureBasePath();
    this.injectScreenplaySnippetCss();
    await this.scanBooks();

    try {
      if (this.settings && this.settings.lastActiveBookPath) {
        const byPath = this.booksIndex.find(b => b.path === this.settings.lastActiveBookPath);
        if (byPath) this.activeBook = byPath;
      }
    } catch {}

    this.expandedFolders = new Set();
    this.activeFilePath = null;

    this.registerView(VIEW_TYPE, (leaf) => new FolioView(leaf, this));
    this.registerView(WRITER_TOOLS_VIEW_TYPE, (leaf) => new WriterToolsView(leaf, this));

    this.addRibbonIcon("book", "Open Folio", () => this.activateFolio());
    this.addCommand({
      id: "open-focus-mode",
      name: "Open Focus Mode",
      callback: () => this.openFocusMode(),
    });
    this.addSettingTab(new FolioSettingTab(this.app, this));

    /* LIVE SYNC — debounce create/delete to avoid cascading rescans during
       bulk operations (e.g. creating a new project with 15 template files) */
    this._vaultChangeDebounceTimer = null;
    const debouncedRefresh = () => {
      if (this._vaultChangeDebounceTimer) clearTimeout(this._vaultChangeDebounceTimer);
      this._vaultChangeDebounceTimer = setTimeout(() => {
        this.refresh();
        this._vaultChangeDebounceTimer = null;
      }, 200);
    };

    this.registerEvent(this.app.vault.on("create", () => debouncedRefresh()));
    this.registerEvent(this.app.vault.on("delete", () => debouncedRefresh()));

    this.registerEvent(
      this.app.vault.on("rename", async () => {
        const activePath = this.activeBook?.path;
        await this.refresh();
        if (activePath) {
          const book = this.booksIndex.find(b => b.path === activePath);
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

    try {
      this.registerEvent(
        this.app.workspace.on('editor-change', (editor, view) => {
          try {
            const f = view?.file;
            if (f) this.onFileModified(f);
            if (editor && typeof editor.getValue === "function") {
              const text = editor.getValue();
              const leaves = this.app.workspace.getLeavesOfType(WRITER_TOOLS_VIEW_TYPE);
              for (const leaf of leaves) {
                const wtView = leaf.view;
                if (wtView && typeof wtView.updateFocusSessionWordsFromEditor === "function") {
                  wtView.updateFocusSessionWordsFromEditor(text, f);
                }
              }
            }
          } catch (e) {
            console.warn('editor-change handler failed', e);
          }
        })
      );
    } catch (e) {
      // older Obsidian builds may not emit editor-change
    }

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
  }

  async openChapterContextMenu(evt, file, node = null) {
    try {
      evt.preventDefault?.();
      const menu = new Menu(this.app);
      let shouldCount = !(node?.exclude);
      try {
        const book = this.booksIndex.find(b => file.path.startsWith(b.path));
        if (book) {
          const cfg = (await this.loadBookConfig(book)) || {};
          const projectType = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
          const overrides = this.statsService.buildStatsOverrideSets(cfg.structure?.tree || []);
          const rules = this.statsService.getStatsRulesForProjectType(projectType);
          shouldCount = this.statsService.shouldCountFileForStats(file, book.path, projectType, rules, overrides);
        }
      } catch (e) {
        console.warn('Failed to load stats inclusion state', e);
      }

      menu.addItem(it =>
        it.setTitle("Open in new tab").setIcon("file").onClick(() => {
          (async () => {
            try {
              const leaf = this.app.workspace.getLeaf("tab");
              if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
            } catch (e) {
              try {
                const leaf = this.app.workspace.getLeaf(true);
                if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
              } catch (e2) { console.warn(e2); }
            }
          })();
        })
      );

      menu.addItem(it =>
        it.setTitle("Open in new pane").setIcon("split").onClick(() => {
          (async () => {
            try {
              const leaf = this.app.workspace.getLeaf("split");
              if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
            } catch (e) {
              try {
                const leaf = this.app.workspace.getLeaf(true);
                if (leaf && typeof leaf.openFile === "function") await leaf.openFile(file);
              } catch (e2) { console.warn(e2); }
            }
          })();
        })
      );

      menu.addSeparator();

      menu.addItem(it =>
        it.setTitle(shouldCount ? "Exclude from stats" : "Include in stats")
          .setIcon(shouldCount ? "eye-off" : "eye")
          .onClick(() => this.setStatsOverride(file, shouldCount ? "exclude" : "include"))
      );

      menu.addSeparator();

      menu.addItem(it =>
        it.setTitle("Create copy").setIcon("copy").onClick(() => {
          try {
            this.app.fileManager.duplicateFile(file);
          } catch (e) { console.error(e); }
        })
      );

      menu.addItem(it =>
        it.setTitle("Rename").setIcon("pencil").onClick(() => {
          try {
            this.app.fileManager.promptForFileRename(file);
          } catch (e) { console.warn(e); }
        })
      );

      menu.addItem(it =>
        it.setTitle("Delete").setIcon("trash").onClick(() => {
          const name = file instanceof TFolder ? `folder "${file.name}"` : `"${file.name}"`;
          new ConfirmModal(this.app, {
            title: "Delete",
            message: `Delete ${name}? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
              try {
                await this.app.vault.delete(file, file instanceof TFolder);
                await this.refresh();
                this.rerenderViews();
              } catch (e) { console.error(e); }
            }
          }).open();
        })
      );

      menu.showAtMouseEvent(evt);
    } catch (e) { console.error(e); }
  }

  openVolumeMenu(evt, folder, isRoot = false, node = null) {
    try {
      evt.preventDefault?.();
      const menu = new Menu(this.app);

      menu.addItem(it =>
        it.setTitle(isRoot ? "New root canvas" : "New canvas").setIcon("layout-dashboard").onClick(async () => {
          try {
            const folderObj = folder instanceof TFolder
              ? folder
              : this.app.vault.getAbstractFileByPath(folder?.path || folder);
            if (!(folderObj instanceof TFolder)) return;
            let base = 'Canvas';
            let name = `${base}.canvas`;
            let i = 1;
            while (this.app.vault.getAbstractFileByPath(`${folderObj.path}/${name}`)) {
              name = `${base} ${++i}.canvas`;
            }
            await this.app.vault.create(`${folderObj.path}/${name}`, '');
            await this.refresh();
            this.rerenderViews();
          } catch (e) { console.error(e); }
        })
      );

      menu.addItem(it =>
        it.setTitle(isRoot ? "New root file" : "New file").setIcon("file-plus").onClick(() => {
          const modal = new TextInputModal(this.app, {
            title: "New file",
            placeholder: "File name",
            cta: "Create",
            toggleLabel: "Screenplay formatting",
            toggleKey: "screenplay",
            onSubmit: async (value, opts = {}) => {
              const name = (value || "").trim();
              if (!name) return;
              try {
                const fileName = name.endsWith('.md') ? name : `${name}.md`;
                const dest = `${folder.path}/${fileName}`;
                if (!this.app.vault.getAbstractFileByPath(dest)) {
                  const frontmatter = await this.getNewFileFrontmatter(dest, fileName, !!opts.screenplay);
                  await this.app.vault.create(dest, frontmatter);
                  const book = this.booksIndex.find(b => dest.startsWith(b.path));
                  if (book) await this.syncChapterStatsBaseline(book);
                }
                await this.refresh();
                this.rerenderViews();
              } catch (e) { console.error(e); }
            },
          });
          modal.open();
        })
      );

      menu.addItem(it =>
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
              } catch (e) { console.error(e); }
            },
          });
          modal.open();
        })
      );

      menu.addSeparator();

      if (!isRoot && node) {
        const isExcluded = node.exclude || false;
        menu.addItem(it =>
          it.setTitle(isExcluded ? "Include in stats" : "Exclude from stats")
            .setIcon(isExcluded ? "eye" : "eye-off")
            .onClick(() => this.toggleExcludeFromStats(folder, !isExcluded))
        );
      }

      menu.addItem(it =>
        it.setTitle("Create copy").setIcon("copy").onClick(() => {
          try {
            this.createCopy(folder.path);
          } catch (e) { console.error(e); }
        })
      );

      menu.addSeparator();

      menu.addItem(it =>
        it.setTitle("Rename").setIcon("pencil").onClick(() => {
          try {
            this.app.fileManager.promptForFileRename(folder);
          } catch (e) { console.warn(e); }
        })
      );

      menu.addItem(it =>
        it.setTitle("Delete").setIcon("trash").onClick(() => {
          new ConfirmModal(this.app, {
            title: "Delete folder",
            message: `Delete folder "${folder.name}" and all its contents? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
              try {
                await this.app.vault.delete(folder, folder instanceof TFolder);
                await this.refresh();
                this.rerenderViews();
              } catch (e) { console.error(e); }
            }
          }).open();
        })
      );

      menu.showAtMouseEvent(evt);
    } catch (e) { console.error(e); }
  }

  openFile(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file && file instanceof TFile) {
      this.app.workspace.openLinkText(file.path, "", false);
    }
  }

  openFileInNewTab(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file && file instanceof TFile) {
      try {
        this.app.workspace.openLinkText(file.path, "", true);
      } catch {
        const leaf = this.app.workspace.getLeaf(true);
        leaf.openFile(file);
      }
    }
  }

  openFileInNewPane(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file && file instanceof TFile) {
      try {
        const leaf = this.app.workspace.getLeaf(true);
        leaf.openFile(file);
      } catch (e) { console.warn(e); }
    }
  }

  renamePath(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file) {
      try {
        this.app.fileManager.promptForFileRename(file);
      } catch (e) { console.warn(e); }
    }
  }

  async deletePath(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file) return;
    try {
      await this.app.vault.delete(file, file instanceof TFolder);
      await this.refresh();
      this.rerenderViews();
    } catch (e) { console.error(e); }
  }

  // FIX: Made async and properly awaited the inner async call to catch errors correctly.
  async createCopy(filePath) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file) return;
    try {
      if (file instanceof TFile) {
        this.app.fileManager.duplicateFile(file);
      } else if (file instanceof TFolder) {
        const parentPath = file.path.split("/").slice(0, -1).join("/") || "";
        const baseName = `${file.name} Copy`;
        let destPath = `${parentPath}/${baseName}`.replace(/\/+/g, "/");
        let i = 1;
        while (this.app.vault.getAbstractFileByPath(destPath)) {
          destPath = `${parentPath}/${baseName} ${i++}`;
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

        // FIX: Properly awaited so errors are catchable in the outer try/catch
        await createFolderAndCopy(file.path, destPath);
        await this.refresh();
        this.rerenderViews();
      }
    } catch (e) { console.error(e); }
  }

  async createNextChapterFile(folder) {
    try {
      const folderObj = folder instanceof TFolder
        ? folder
        : this.app.vault.getAbstractFileByPath(folder?.path || folder);
      if (!(folderObj instanceof TFolder)) return;

      const existing = (folderObj.children ?? [])
        .filter(c => c instanceof TFile && c.extension === "md")
        .map(f => f.basename);

      let max = 0;
      for (const name of existing) {
        const match = name.match(/^Chapter (\d+)$/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n)) max = Math.max(max, n);
        }
      }

      const fileName = `Chapter ${max + 1}.md`;
      const filePath = `${folderObj.path}/${fileName}`;
      if (this.app.vault.getAbstractFileByPath(filePath)) return;
      await this.app.vault.create(filePath, "");
      try {
        const book = this.booksIndex.find(b => filePath.startsWith(b.path));
        if (book) await this.syncChapterStatsBaseline(book);
      } catch (e) {
        console.warn('syncChapterStatsBaseline (createNextChapterFile) failed', e);
      }
    } catch (e) { console.error(e); }
  }

  createSubVolume(parentFolderPath) {
    const modal = new TextInputModal(this.app, {
      title: "New folder",
      placeholder: "Folder name",
      cta: "Create",
      onSubmit: async (value) => {
        if (!value) return;
        await this.createVolume({ path: parentFolderPath }, value);
        await this.refresh();
        this.rerenderViews();
      },
    });
    modal.open();
  }

  async activateFolio() {
    await this.activateView();
    await this.openWriterTools();
  }

  async openFocusMode() {
    const leaf = await this.openWriterTools();
    const view = leaf?.view;
    if (view && typeof view.showFocusMode === "function") {
      view.showFocusMode();
    } else {
      new Notice("Open Writer Tools, then choose Focus Mode.");
    }
  }

  async activateView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      this.folioLeaf = existing[0];
      return;
    }
    const leftLeaf = workspace.getLeftLeaf(false);
    if (!leftLeaf) {
      console.warn('Folio: could not obtain a left sidebar leaf');
      return;
    }
    await leftLeaf.setViewState({ type: VIEW_TYPE, active: true });
    this.folioLeaf = leftLeaf;
    workspace.revealLeaf(leftLeaf);
  }

  async openWriterTools() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(WRITER_TOOLS_VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return existing[0];
    }
    const rightLeaf = workspace.getRightLeaf(false);
    if (!rightLeaf) {
      console.warn('Folio: could not obtain a right sidebar leaf');
      return null;
    }
    await rightLeaf.setViewState({ type: WRITER_TOOLS_VIEW_TYPE, active: true });
    workspace.revealLeaf(rightLeaf);
    return rightLeaf;
  }

  async refresh() {
    await this.scanBooks();
    this.rerenderViews();
  }

  getBasePath() {
    let base = this.settings.basePath || "projects";
    base = base.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    return base || "projects";
  }

  loadScreenplaySnippetCss() {
    // Try to load from the bundled constant first, then fall back to filesystem
    // All fs operations are wrapped safely — failure is non-fatal
    try {
      // Use dynamic require only if available (desktop), wrapped in try/catch
      const requireFn = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : null;
      if (requireFn) {
        const fs = requireFn("fs");
        const path = requireFn("path");
        const basePath = this.app.vault.adapter?.getBasePath?.();
        const candidates = [
          this.manifest?.dir ? path.join(this.manifest.dir, "assets", "third-party", "pro-screenwriting", "PRO Screenwriting Snippet.css") : null,
          basePath ? path.join(basePath, ".obsidian", "snippets", "PRO Screenwriting Snippet.css") : null
        ].filter(Boolean);
        for (const snippetPath of candidates) {
          if (fs.existsSync(snippetPath)) {
            return fs.readFileSync(snippetPath, "utf8");
          }
        }
      }
    } catch (error) {
      // fs/path unavailable (mobile) or snippet not found — fall through to bundled CSS
    }
    return SCREENPLAY_SNIPPET_CSS || "";
  }

  injectScreenplaySnippetCss() {
    if (typeof document === "undefined") return;
    if (this.screenplayStyleEl && this.screenplayStyleEl.isConnected) return;
    const css = this.loadScreenplaySnippetCss();
    if (!css) return;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-folio-screenplay", "true");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    this.screenplayStyleEl = styleEl;
    document.body.classList.add("h-syntax", "syntax");
    this.register(() => styleEl.remove());
    this.register(() => document.body.classList.remove("h-syntax", "syntax"));
  }

  async ensureBasePath() {
    const base = this.getBasePath();
    if (!(await this.app.vault.adapter.exists(base))) {
      await this.app.vault.createFolder(base);
    }
  }

  async scanBooks() {
    const basePath = this.getBasePath();
    this.booksIndex = await this.bookService.scanBooks(basePath);

    if (!this.activeBook && this.booksIndex.length > 0) {
      this.activeBook = this.booksIndex[0];
    }

    this.activeBook =
      this.booksIndex.find(b => b.path === this.activeBook?.path)
      ?? this.booksIndex[0]
      ?? null;
  }

  async createBook(name, projectType = 'book', templateStructure = null) {
    const basePath = this.getBasePath();
    await this.bookService.createBook(basePath, name, projectType, templateStructure);

    await this.scanBooks();
    const expectedPath = `${basePath}/${name}`.replace(/\/+/g, "/");
    const createdBook =
      this.booksIndex.find(b => b.path === expectedPath)
      ?? this.booksIndex.find(b => b.name === name)
      ?? null;

    if (createdBook) {
      this.activeBook = createdBook;
      this.settings = this.settings || {};
      this.settings.lastActiveBookPath = createdBook.path;
      await this.saveSettings();
    }

    return createdBook;
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
      const book = this.booksIndex.find(b => `${volume.path}/${name}.md`.startsWith(b.path));
      if (book) await this.syncChapterStatsBaseline(book);
    } catch (e) {
      console.warn('syncChapterStatsBaseline (createChapter) failed', e);
    }
    return result;
  }

  isVolumeFolder(file) {
    try {
      return this.booksIndex.some(b => b.volumes.some(v => v.path === file.path));
    } catch { return false; }
  }

  isChapterFile(file) {
    try {
      return this.booksIndex.some(b => b.volumes.some(v => v.chapters.some(c => c.path === file.path)));
    } catch { return false; }
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
      const book = this.booksIndex.find(b => file.path.startsWith(b.path));
      if (book) await this.syncChapterStatsBaseline(book);
    } catch (e) {
      console.warn('syncChapterStatsBaseline (deleteChapter) failed', e);
    }
  }

  async deleteFolderRecursive(filePath) {
    try {
      const af = this.app.vault.getAbstractFileByPath(filePath);
      if (!af) return;
      await this.app.vault.trash(af, true);
    } catch (e) {
      console.warn('deleteFolderRecursive (trash) failed', filePath, e);
    }
  }

  async toggleExcludeFromStats(file, exclude) {
    const book = this.booksIndex.find(b => file.path.startsWith(b.path));
    if (!book) { console.warn('Could not find book for file:', file.path); return; }
    await this.treeService.toggleExcludeFromStats(book, file, exclude);
    await this.computeAndSaveStatsForBook(book);
    await this.refresh();
    this.rerenderViews();
  }

  async setStatsOverride(file, action) {
    const book = this.booksIndex.find(b => file.path.startsWith(b.path));
    if (!book) { console.warn('Could not find book for file:', file.path); return; }
    if (action === 'include') {
      await this.treeService.setStatsOverride(book, file, { include: true, exclude: false });
    } else if (action === 'exclude') {
      await this.treeService.setStatsOverride(book, file, { include: false, exclude: true });
    }
    await this.computeAndSaveStatsForBook(book);
    await this.refresh();
    this.rerenderViews();
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    const savedData = loadedData && typeof loadedData === 'object' ? loadedData : {};

    this.settings = { ...DEFAULT_SETTINGS };

    Object.keys(savedData).forEach(key => {
      if (key !== 'projectTemplates') {
        this.settings[key] = savedData[key];
      }
    });

    if (savedData.projectTemplates && Array.isArray(savedData.projectTemplates)) {
      const defaultTemplatesMap = new Map(
        DEFAULT_SETTINGS.projectTemplates.map(t => [t.id, t])
      );

      const mergedTemplates = savedData.projectTemplates.map(savedTemplate => {
        const defaultTemplate = defaultTemplatesMap.get(savedTemplate.id);
        if (defaultTemplate) {
          return {
            id: savedTemplate.id,
            name: savedTemplate.name !== undefined ? savedTemplate.name : defaultTemplate.name,
            icon: savedTemplate.icon !== undefined ? savedTemplate.icon : defaultTemplate.icon,
            order: savedTemplate.order !== undefined ? savedTemplate.order : defaultTemplate.order,
            description: savedTemplate.description !== undefined ? savedTemplate.description : defaultTemplate.description,
            structure: savedTemplate.structure !== undefined ? savedTemplate.structure : defaultTemplate.structure
          };
        }
        return savedTemplate;
      });

      DEFAULT_SETTINGS.projectTemplates.forEach(defaultTemplate => {
        if (!mergedTemplates.find(t => t.id === defaultTemplate.id)) {
          mergedTemplates.push({ ...defaultTemplate });
        }
      });

      this.settings.projectTemplates = mergedTemplates;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async loadBookConfig(book) {
    return this.configService.loadBookConfig(book);
  }

  async saveBookConfig(book, config) {
    return this.configService.saveBookConfig(book, config);
  }

  async loadBookMeta(book) {
    return this.configService.loadProjectMeta(book);
  }

  async getNewFileFrontmatter(destPath, fileName, explicitScreenplay = false) {
    let projectType = null;
    const book = this.booksIndex.find(b => destPath.startsWith(b.path));
    if (book) {
      const cfg = (await this.loadBookConfig(book)) || {};
      projectType = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
    }
    const useScreenplay = this.bookService.shouldUseScreenplayClass(projectType, fileName, explicitScreenplay);
    if (!useScreenplay) return "";
    return this.bookService.buildFrontmatter({ projectType, screenplay: true });
  }

  async waitForFolderSync(filePath, retries = 20) {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    while (retries-- > 0) {
      const folder = this.app.vault.getAbstractFileByPath(filePath);
      if (folder && folder.children && folder.children.length > 0) return;
      await delay(50);
    }
  }

  rerenderViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      try {
        if (view && typeof view.render === "function") view.render();
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
        const items = view.contentEl.querySelectorAll('.tree-item');
        items.forEach(el => {
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

  async updateStatsInViews(book) {
    try {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
      for (const leaf of leaves) {
        const view = leaf.view;
        try {
          if (!view || !view.statsEl) continue;
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

  async onFileModified(file) {
    try {
      if (!file || !file.path) return;
      if (file.extension !== 'md' && !file.path.endsWith('.md')) return;
      const book = this.booksIndex.find(b => file.path === b.path || file.path.startsWith(b.path + '/'));
      if (!book) return;

      const key = book.path;
      if (this._statsDebounceTimers[key]) clearTimeout(this._statsDebounceTimers[key]);
      this._statsDebounceTimers[key] = setTimeout(() => {
        this.computeAndSaveStatsForBook(book).catch(e => console.warn('computeAndSaveStatsForBook failed', e));
        delete this._statsDebounceTimers[key];
      }, 400);
    } catch (e) {
      console.warn('onFileModified error', e);
    }
  }

  _collectMarkdownFiles(folder) {
    const out = [];
    if (!folder || !folder.children) return out;
    for (const c of folder.children) {
      if (c instanceof TFile && c.name && c.name.toLowerCase().endsWith('.md')) out.push(c);
      else if (c.children) out.push(...this._collectMarkdownFiles(c));
    }
    return out;
  }

  // Delegates to statsService — no local copy of word counting logic
  _countWords(text) {
    return this.statsService.countWords(text);
  }

  _getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  async computeAndSaveStatsForBook(book) {
    const stats = await this.statsService.computeAndSaveStatsForBook(book);
    if (stats) await this.updateStatsInViews(book);
    return stats;
  }

  async syncChapterStatsBaseline(book) {
    return this.statsService.syncChapterStatsBaseline(book);
  }

  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  async buildTreeFromFilesystem(bookFolder) {
    return this.treeService.buildTreeFromFilesystem(bookFolder);
  }

  async reorderTreeNodes(book, draggedNodeId, targetNodeId, position) {
    return this.treeService.reorderTreeNodes(book, draggedNodeId, targetNodeId, position);
  }
}
