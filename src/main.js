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
import { FdxExportService } from './services/fdxExportService.js';
import { OutlineService } from './services/outlineService.js';
import { SpineService } from './services/spineService.js';
import { ReorderService } from './services/reorderService.js';
import { OutlineEditorService } from './services/outlineEditorService.js';
import { getProfile } from './services/formatProfiles.js';
import { findDrafts, draftScopeNodes, resolveCurrentDraft, draftShelfNode } from './services/draftModel.js';
import { FolioBeatBoardView } from './views/beatBoardView.js';
import { VIEW_TYPE, WRITER_TOOLS_VIEW_TYPE, BEAT_BOARD_VIEW_TYPE, DEFAULT_SETTINGS, PROJECT_TYPES, SCENE_STATUSES, nextSceneStatus } from './constants/index.js';

import { FolioView } from './views/folioView.js';
import { WriterToolsView } from './views/writerToolsView.js';
import { TimelineBand } from './views/timelineBand.js';
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
    this.fdxExportService = new FdxExportService(this.app);
    this.outlineService = new OutlineService(this.app, this.configService);
    this.spineService = new SpineService(this.app);
    this.reorderService = new ReorderService(this.app, this.spineService, this.treeService);
    this.outlineEditorService = new OutlineEditorService(this.app, this.configService);
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

    this.expandedFolders = new Set(
      Array.isArray(this.settings?.expandedFolders) ? this.settings.expandedFolders : []
    );
    this.activeFilePath = null;

    this.registerView(VIEW_TYPE, (leaf) => new FolioView(leaf, this));
    this.registerView(WRITER_TOOLS_VIEW_TYPE, (leaf) => new WriterToolsView(leaf, this));
    this.registerView(BEAT_BOARD_VIEW_TYPE, (leaf) => new FolioBeatBoardView(leaf, this));

    this.addRibbonIcon("book", "Open Folio", () => this.activateFolio());

    // Timeline band: a Final Draft-style scene strip pinned above the editor.
    this.timelineBand = new TimelineBand(this);
    this.timelineBand.register();
    this.addCommand({
      id: "open-focus-mode",
      name: "Open Focus Mode",
      callback: () => this.openFocusMode(),
    });
    this.addCommand({
      id: "export-fdx",
      name: "Export current project to Final Draft (.fdx)",
      callback: () => this.exportActiveProjectToFdx(),
    });
    this.addCommand({
      id: "new-beat",
      name: "New beat (outline editor)",
      callback: () => this.addOutlineBeatForActiveProject(),
    });
    this.addCommand({
      id: "open-beat-board",
      name: "Open Beat Board",
      callback: () => this.openBeatBoard(),
    });
    this.addCommand({
      id: "toggle-draft-folder",
      name: "Mark/unmark current file's folder as a draft",
      callback: () => this.toggleDraftFolder(),
    });
    this.addCommand({
      id: "build-outline-from-draft",
      name: "Build outline from draft",
      callback: () => this.buildOutlineFromDraft(),
    });
    this.addCommand({
      id: "build-draft-from-outline",
      name: "Build new draft from outline",
      callback: () => this.buildDraftFromOutline(),
    });
    this.addCommand({
      id: "sync-outline",
      name: "Sync outline from scene headings",
      callback: () => this.syncOutlineForActiveProject(),
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

      // Writing status (To-do / Draft / Revised / Final).
      const currentStatus = node?.status || (node?.completed ? "final" : null);
      SCENE_STATUSES.forEach(s => {
        menu.addItem(it => {
          it.setTitle(`Status: ${s.label}`)
            .setIcon(s.id === "final" ? "check-circle" : "circle")
            .onClick(() => this.setNodeStatus(file, s.id));
          if (currentStatus === s.id) it.setChecked?.(true);
        });
      });
      if (currentStatus) {
        menu.addItem(it =>
          it.setTitle("Clear status").setIcon("circle-slash")
            .onClick(() => this.setNodeStatus(file, null))
        );
      }

      // Single-file draft controls (a file flagged as its own manuscript draft).
      if (node && node.path) {
        menu.addSeparator();
        if (!node.draft) {
          menu.addItem(it =>
            it.setTitle("Mark as draft").setIcon("layers")
              .onClick(() => this.setDraftForFolderPath(node.path, true))
          );
        } else {
          if (!node._isCurrentDraft) {
            menu.addItem(it =>
              it.setTitle("Set as current draft").setIcon("check-circle")
                .onClick(() => this.setCurrentDraft(this.activeBook, node.path))
            );
          }
          menu.addItem(it =>
            it.setTitle("Unmark as draft").setIcon("layers")
              .onClick(() => this.setDraftForFolderPath(node.path, false))
          );
        }
      }

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
            message: `Delete ${name}? It will be moved to trash.`,
            confirmText: "Delete",
            onConfirm: async () => {
              try {
                await this.app.fileManager.trashFile(file);
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
        if (!node.draft) {
          menu.addItem(it =>
            it.setTitle("Mark as draft").setIcon("layers")
              .onClick(() => this.setDraftForFolderPath(node.path, true))
          );
        } else {
          if (!node._isCurrentDraft) {
            menu.addItem(it =>
              it.setTitle("Set as current draft").setIcon("check-circle")
                .onClick(() => this.setCurrentDraft(this.activeBook, node.path))
            );
          }
          menu.addItem(it =>
            it.setTitle("Unmark as draft").setIcon("layers")
              .onClick(() => this.setDraftForFolderPath(node.path, false))
          );
        }
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
            message: `Delete folder "${folder.name}" and all its contents? It will be moved to trash.`,
            confirmText: "Delete",
            onConfirm: async () => {
              try {
                await this.app.fileManager.trashFile(folder);
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
      await this.app.fileManager.trashFile(file);
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

  /* Collect the active project's ordered markdown for screenplay export.
     Returns { book, meta, files } or null (with a Notice) when nothing usable. */
  async _collectScreenplayExport() {
    const book = this.activeBook;
    if (!book) { new Notice("Open or create a project first."); return null; }

    const cfg = (await this.loadBookConfig(book)) || {};
    const meta = (await this.loadBookMeta(book)) || {};
    // Screenplay export includes ALL markdown in tree order — the PDF "scriptOnly"
    // heuristic excludes files that aren't named like scenes, which surprises users.
    const settings = { ...(cfg.export || {}), content: { ...((cfg.export || {}).content || {}), mode: 'allIncluded' } };

    const collected = await this.pdfExportService.collectOrderedMarkdownFiles(book, cfg, settings, meta);
    // Screenplay formats are text-only: skip canvases, keep ordered markdown.
    const files = (collected || []).filter(f => f && f.extension === "md");
    if (files.length === 0) { new Notice("No markdown files to export."); return null; }

    return { book, meta, files };
  }

  async exportActiveProjectToFdx() {
    try {
      const ctx = await this._collectScreenplayExport();
      if (!ctx) return;
      const path = await this.fdxExportService.exportProject(ctx.book, ctx.meta, ctx.files);
      this._announceExport(path, "Final Draft");
    } catch (e) {
      console.error("exportActiveProjectToFdx failed", e);
      new Notice("Final Draft export failed. See console for details.");
    }
  }

  async syncOutlineForActiveProject() {
    try {
      const book = this.activeBook;
      if (!book) { new Notice("Open or create a project first."); return; }

      const cfg = (await this.loadBookConfig(book)) || {};
      const meta = (await this.loadBookMeta(book)) || {};
      const settings = { ...(cfg.export || {}), content: { ...((cfg.export || {}).content || {}), mode: 'allIncluded' } };
      const collected = await this.pdfExportService.collectOrderedMarkdownFiles(book, cfg, settings, meta);
      const sceneFiles = (collected || []).filter(f => f && f.extension === "md");

      const res = await this.outlineService.syncOutlineFromScenes(book, sceneFiles);
      await this.refresh();
      this.rerenderViews();

      if (res.added > 0) {
        new Notice(`Outline updated — added ${res.added} scene${res.added === 1 ? "" : "s"}.`);
        if (res.outlinePath) { try { this.app.workspace.openLinkText(res.outlinePath, "", false); } catch (e) { console.warn(e); } }
      } else {
        new Notice("Outline already up to date.");
      }
    } catch (e) {
      console.error("syncOutlineForActiveProject failed", e);
      new Notice("Outline sync failed. See console for details.");
    }
  }

  /** Parse an outline into [{file, scenes:[{title, notes:[]}]}] for rebuilding a draft. */
  _parseOutlineForRebuild(text) {
    const lines = (text || "").split("\n");
    const isAutoLink = (l) => /^\[\[.*\|Open( scene)? ›\]\]\s*$/.test(l.trim());
    const groups = [];
    let g = null, s = null, stop = false;
    for (const l of lines) {
      if (stop) break;
      const sm = /^###\s+(.*\S)\s*$/.exec(l);
      if (sm) { if (!g) { g = { file: "Draft", scenes: [] }; groups.push(g); } s = { title: sm[1].trim(), notes: [] }; g.scenes.push(s); continue; }
      const gm = /^##\s+(.*\S)\s*$/.exec(l);
      if (gm) {
        const t = gm[1].trim();
        if (/^notes \(not in current draft\)/i.test(t)) { stop = true; continue; } // skip orphan archive
        g = { file: t, scenes: [] }; groups.push(g); s = null; continue;
      }
      if (/^#\s+/.test(l)) continue; // file title
      if (s && !isAutoLink(l)) s.notes.push(l);
    }
    // trim blank edges of each scene's notes
    const trim = (arr) => { let a = 0, b = arr.length; while (a < b && !arr[a].trim()) a++; while (b > a && !arr[b - 1].trim()) b--; return arr.slice(a, b); };
    for (const grp of groups) for (const sc of grp.scenes) sc.notes = trim(sc.notes);
    return groups.filter((grp) => grp.scenes.length);
  }

  /** Compile the project's Outline file into a NEW draft folder (non-destructive). */
  async buildDraftFromOutline() {
    try {
      const book = this.activeBook;
      if (!book) { new Notice("Open or create a project first."); return; }
      const cfg = (await this.loadBookConfig(book)) || {};
      const profile = getProfile(cfg.basic?.projectType || PROJECT_TYPES.BOOK);
      const pt = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
      const tree = cfg.structure?.tree || [];

      // Source outline: the active file if it's an outline, else the project's Outline file.
      const av = this.app.workspace.activeEditor;
      let outlineFile = null;
      if (av && av.file && av.file.path.startsWith(book.path + "/") && /outline/i.test(av.file.basename)) outlineFile = av.file;
      if (!outlineFile) {
        let rel = null;
        const walk = (nodes) => { for (const n of nodes || []) { if (rel) return; if (n.type === "file" && /outline/i.test(n.title || "")) rel = n.path; if (n.children) walk(n.children); } };
        walk(tree);
        if (rel) outlineFile = this.app.vault.getAbstractFileByPath(`${book.path}/${rel}`);
      }
      if (!outlineFile) { new Notice('No "Outline" file found to build from.'); return; }

      const groups = this._parseOutlineForRebuild(await this.app.vault.read(outlineFile));
      if (!groups.length) { new Notice("The outline has no scene headers (###) to build from."); return; }

      // Heading prefix for the format's unit (scene): # for screenplay, ### for book…
      const roles = profile.headingRoles || {};
      const unitLevel = Number(Object.keys(roles).find((l) => roles[l] === profile.unitRole)) || 1;
      const unitPrefix = "#".repeat(unitLevel);

      // New drafts live on the "Drafts shelf" (a folder flagged shelf:true or named
      // "Drafts"), if the project has one; otherwise at the project root.
      const shelf = draftShelfNode(tree);
      const parentRel = shelf ? shelf.path : "";
      const single = groups.length === 1; // one outline group → a single-file draft

      const fileContent = (bodyLines) =>
        ["---", `projectType: ${pt}`, "---", "", ...bodyLines].join("\n").replace(/\s*$/, "") + "\n";
      const sceneBody = (g) => {
        const lines = [];
        const wholeFile = g.scenes.length === 1 && g.scenes[0].title === g.file;
        if (wholeFile) {
          if (g.scenes[0].notes.length) lines.push(...g.scenes[0].notes);
        } else {
          for (const s of g.scenes) { lines.push(`${unitPrefix} ${s.title}`, ""); if (s.notes.length) lines.push(...s.notes, ""); }
        }
        return lines;
      };

      const modal = new TextInputModal(this.app, {
        title: "New draft from outline",
        placeholder: single ? "New draft name (e.g. Draft 2)" : "New draft folder name (e.g. Draft 2)",
        cta: "Create draft",
        onSubmit: async (value) => {
          try {
            const name = (value || "").trim() || "Draft 2";
            let draftRel; // book-relative path of the new draft node (file or folder)
            if (single) {
              draftRel = parentRel ? `${parentRel}/${name}.md` : `${name}.md`;
              const abs = `${book.path}/${draftRel}`;
              if (this.app.vault.getAbstractFileByPath(abs)) { new Notice(`“${name}” already exists.`); return; }
              await this.app.vault.create(abs, fileContent(sceneBody(groups[0])));
            } else {
              draftRel = parentRel ? `${parentRel}/${name}` : name;
              const folderAbs = `${book.path}/${draftRel}`;
              if (this.app.vault.getAbstractFileByPath(folderAbs)) { new Notice(`“${name}” already exists.`); return; }
              await this.app.vault.createFolder(folderAbs);
              for (const g of groups) await this.app.vault.create(`${folderAbs}/${g.file}.md`, fileContent(sceneBody(g)));
            }
            await this.refresh();
            await this.setDraftForFolderPath(draftRel, true); // mark new node as a draft
            await this.setCurrentDraft(book, draftRel);        // and make it the current draft
            new Notice(`Created draft “${name}”${shelf ? " in Drafts" : ""}.`);
          } catch (e) {
            console.error("buildDraftFromOutline (create) failed", e);
            new Notice("Couldn't create the draft. See console for details.");
          }
        },
      });
      modal.open();
    } catch (e) {
      console.error("buildDraftFromOutline failed", e);
      new Notice("Couldn't build draft from outline. See console for details.");
    }
  }

  /**
   * Parse an outline file into title → queue of note-blocks (the user's prose
   * under each `### heading`), dropping the auto-generated "Open scene" link and
   * blank edges. A queue per title preserves order for repeated sluglines.
   */
  _parseOutlineNotes(text) {
    const lines = (text || "").split("\n");
    const sections = [];
    let cur = null;
    for (const l of lines) {
      const m = /^###\s+(.*\S)\s*$/.exec(l);
      if (m) { cur = { title: m[1].trim(), body: [] }; sections.push(cur); continue; }
      if (/^#{1,2}\s+/.test(l)) { cur = null; continue; } // file/section header — regenerated
      if (cur) cur.body.push(l);
    }
    const isAutoLink = (l) => /^\[\[.*\|Open( scene)? ›\]\]\s*$/.test(l.trim());
    const trimEdges = (arr) => {
      let s = 0, e = arr.length;
      while (s < e && !arr[s].trim()) s++;
      while (e > s && !arr[e - 1].trim()) e--;
      return arr.slice(s, e);
    };
    const map = new Map();
    for (const sec of sections) {
      const body = trimEdges(sec.body.filter((l) => !isAutoLink(l)));
      if (!map.has(sec.title)) map.set(sec.title, []);
      map.get(sec.title).push(body);
    }
    return map;
  }

  /** Write the active draft's scene/chapter headings (as headers) into the project's Outline file. */
  async buildOutlineFromDraft() {
    try {
      const book = this.activeBook;
      if (!book) { new Notice("Open or create a project first."); return; }
      const cfg = (await this.loadBookConfig(book)) || {};
      const profile = getProfile(cfg.basic?.projectType || PROJECT_TYPES.BOOK);
      const tree = cfg.structure?.tree || [];

      // Resolve the project's CURRENT draft (what the strip reflects).
      const draftNode = resolveCurrentDraft(tree, cfg.currentDraftPath);
      if (!draftNode) { new Notice("No draft found. Mark a folder as a draft first."); return; }

      // Find an "Outline" file outside the draft.
      const draftPrefix = draftNode.path + "/";
      let outlineRel = null;
      const walk = (nodes) => {
        for (const n of nodes || []) {
          if (outlineRel) return;
          if (n.type === "file" && /outline/i.test(n.title || "") && !(n.path === draftNode.path || n.path.startsWith(draftPrefix))) outlineRel = n.path;
          if (n.children) walk(n.children);
        }
      };
      walk(tree);
      if (!outlineRel) { new Notice('No "Outline" file in this project to write into.'); return; }

      const scopedCfg = { ...cfg, structure: { ...(cfg.structure || {}), tree: draftScopeNodes(draftNode) } };
      const spine = await this.spineService.buildSpine(book, scopedCfg, profile);

      const file = this.app.vault.getAbstractFileByPath(`${book.path}/${outlineRel}`);
      if (!file) { new Notice("Outline file not found."); return; }

      // Merge: keep any notes the user wrote under each scene heading on rebuild.
      const prev = await this.app.vault.read(file);
      const notesByTitle = this._parseOutlineNotes(prev); // title -> queue of note-blocks

      const out = [`_Generated from “${draftNode.title || "Draft"}”. Your notes under each scene are kept on rebuild._`, ""];
      let lastFile = null;
      for (const u of spine) {
        const base = u.file.split("/").pop().replace(/\.md$/, "");
        if (u.file !== lastFile) { lastFile = u.file; out.push(`## ${base}`, ""); }
        out.push(`### ${u.title}`);
        out.push(u.fromHeading ? `[[${base}#${u.title}|Open scene ›]]` : `[[${base}|Open ›]]`, "");
        const q = notesByTitle.get(u.title);
        const body = q && q.length ? q.shift() : null;
        if (body && body.length) out.push(...body, "");
      }
      // Preserve orphaned notes (renamed/removed scenes) so nothing is lost.
      const orphans = [];
      for (const [title, queue] of notesByTitle) for (const body of queue) if (body.length) orphans.push({ title, body });
      if (orphans.length) {
        out.push("## Notes (not in current draft)", "");
        for (const o of orphans) out.push(`### ${o.title}`, ...o.body, "");
      }

      await this.app.vault.modify(file, out.join("\n") + "\n");
      try { this.app.workspace.openLinkText(file.path, "", false); } catch (e) { console.warn(e); }
      new Notice(`Outline updated (${spine.length} scenes) → ${outlineRel}.`);
    } catch (e) {
      console.error("buildOutlineFromDraft failed", e);
      new Notice("Couldn't build outline. See console for details.");
    }
  }

  /** Set/clear the draft flag on a folder node (book-relative path) in the active project. */
  async setDraftForFolderPath(relPath, value) {
    try {
      const book = this.activeBook;
      if (!book || !relPath) return;
      const cfg = (await this.configService.loadBookConfig(book)) || {};
      const find = (nodes) => {
        for (const n of nodes || []) {
          if ((n.type === "group" || n.type === "file") && n.path === relPath) return n;
          if (n.children) { const r = find(n.children); if (r) return r; }
        }
        return null;
      };
      const node = find(cfg.structure?.tree || []);
      if (!node) { new Notice("Couldn't find that folder."); return; }
      node.draft = !!value;
      // Keep the current-draft pointer valid: marking with none set → make it current;
      // unmarking the current one → fall back to the first remaining draft (or none).
      if (node.draft) {
        if (!cfg.currentDraftPath) cfg.currentDraftPath = node.path;
      } else if (cfg.currentDraftPath === node.path) {
        const remaining = findDrafts(cfg.structure?.tree || []).filter((d) => d.path !== node.path);
        cfg.currentDraftPath = remaining[0]?.path || null;
      }
      await this.configService.saveBookConfig(book, cfg);
      await this.refresh();
      this.rerenderViews();
      try { this.timelineBand && this.timelineBand.refresh(true); } catch (e) { console.warn(e); }
      new Notice(node.draft ? `“${node.title || relPath}” is now a draft.` : `“${node.title || relPath}” is no longer a draft.`);
    } catch (e) {
      console.error("setDraftForFolderPath failed", e);
    }
  }

  /** Make a draft (book-relative path) the project's CURRENT draft — what the strip/beats reflect. */
  async setCurrentDraft(book, draftPath) {
    try {
      const bk = book || this.activeBook;
      if (!bk || !draftPath) return;
      const cfg = (await this.configService.loadBookConfig(bk)) || {};
      cfg.currentDraftPath = draftPath;
      await this.configService.saveBookConfig(bk, cfg);
      await this.refresh();
      this.rerenderViews();
      try { this.timelineBand && this.timelineBand.refresh(true); } catch (e) { console.warn(e); }
    } catch (e) {
      console.error("setCurrentDraft failed", e);
    }
  }

  /** Toggle the draft flag on the active file's top-level folder (so the strip scopes to it). */
  async toggleDraftFolder() {
    try {
      const av = this.app.workspace.activeEditor;
      if (!av || !av.file) { new Notice("Open a file in a project folder first."); return; }
      const book = (this.booksIndex || []).find((b) => av.file.path.startsWith(b.path + "/"));
      if (!book) { new Notice("Active file is not in a Folio project."); return; }
      const rel = av.file.path.slice(book.path.length + 1);
      const i = rel.indexOf("/");
      if (i === -1) { new Notice("This file isn't inside a folder to mark as a draft."); return; }
      const topPath = rel.slice(0, i);
      const cfg = (await this.configService.loadBookConfig(book)) || {};
      const node = (cfg.structure?.tree || []).find((n) => n.type === "group" && n.path === topPath);
      if (!node) { new Notice("Couldn't find that folder in the project."); return; }
      node.draft = !node.draft;
      await this.configService.saveBookConfig(book, cfg);
      try { this.timelineBand && this.timelineBand.refresh(true); } catch (e) { console.warn(e); }
      new Notice(node.draft ? `“${topPath}” is now a draft.` : `“${topPath}” is no longer a draft.`);
    } catch (e) {
      console.error("toggleDraftFolder failed", e);
      new Notice("Couldn't toggle draft. See console for details.");
    }
  }

  /** Open (or reveal) the current draft's script — the manuscript "file view". */
  async openDraftScript() {
    try {
      const book = this.activeBook;
      if (!book) { new Notice("Open or create a project first."); return; }
      const cfg = (await this.loadBookConfig(book)) || {};
      const draft = resolveCurrentDraft(cfg.structure?.tree || [], cfg.currentDraftPath);
      if (!draft) { new Notice("No draft found. Mark a folder or file as a draft first."); return; }
      const find = (nodes) => { for (const n of nodes || []) { if (n.type === "file") return n; if (n.children) { const r = find(n.children); if (r) return r; } } return null; };
      const first = find(draftScopeNodes(draft) || []);
      if (!first) { new Notice("This draft has no script file yet."); return; }
      const path = `${book.path}/${first.path}`;
      // Reveal it if already open; otherwise open it in a tab.
      for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
        if (leaf.view?.file?.path === path) { this.app.workspace.revealLeaf(leaf); return; }
      }
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!file) { new Notice("Script file not found."); return; }
      const leaf = this.app.workspace.getLeaf("tab");
      if (leaf) { await leaf.openFile(file); this.app.workspace.revealLeaf(leaf); }
    } catch (e) {
      console.error("openDraftScript failed", e);
      new Notice("Couldn't open the draft script. See console for details.");
    }
  }

  /** Open (or reveal) the Beat Board as a standalone view (it carries its own strip). */
  async openBeatBoard() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(BEAT_BOARD_VIEW_TYPE);
    if (existing.length > 0) { workspace.revealLeaf(existing[0]); return existing[0]; }
    const leaf = workspace.getLeaf("tab");
    if (!leaf) return null;
    await leaf.setViewState({ type: BEAT_BOARD_VIEW_TYPE, active: true });
    workspace.revealLeaf(leaf);
    return leaf;
  }

  /** Add a planning beat to the project's outline (lane 1) and refresh the strip. */
  addOutlineBeatForActiveProject() {
    const book = this.activeBook;
    if (!book) { new Notice("Open or create a project first."); return; }
    const modal = new TextInputModal(this.app, {
      title: "New beat",
      placeholder: "Beat title (e.g. First Day)",
      cta: "Add beat",
      onSubmit: async (value) => {
        try {
          await this.outlineEditorService.addBeat(book, { title: value || "New beat", lane: 0 });
          try { this.timelineBand && this.timelineBand.refresh(true); } catch (e) { console.warn(e); }
          new Notice("Beat added to the outline.");
        } catch (e) {
          console.error("addBeat failed", e);
          new Notice("Couldn't add beat. See console for details.");
        }
      },
    });
    modal.open();
  }

  /** Heading prefix for an arc = the profile's outermost grouper level (e.g. ##### for screenplay). */
  _arcPrefix(profile) {
    const tiers = (profile && profile.grouperTiers) || {};
    const outerRole = Object.keys(tiers).find((r) => tiers[r] === 0) || Object.keys(tiers)[0];
    const roles = (profile && profile.headingRoles) || {};
    const level = outerRole ? Object.keys(roles).find((l) => roles[l] === outerRole) : null;
    return "#".repeat(level ? Number(level) : 5);
  }

  /** One-way kickoff: drop a beat into the script as an arc (grouper) at the cursor, else at the end. */
  async sendBeatTextToScript(book, beat) {
    try {
      const cfg = (await this.loadBookConfig(book)) || {};
      const profile = getProfile(cfg.basic?.projectType || PROJECT_TYPES.BOOK);
      const text = `${this._arcPrefix(profile)} ${beat.title || "New arc"}\n\n${(beat.notes || "").trim()}\n`;
      const av = this.app.workspace.activeEditor;
      if (av && av.editor && av.file && av.file.extension === "md" && av.file.path.startsWith(book.path + "/")) {
        av.editor.replaceRange(text + "\n", av.editor.getCursor());
        new Notice(`Sent “${beat.title}” as an arc at the cursor.`);
        return;
      }
      const spine = await this.spineService.buildSpine(book, cfg, profile);
      let rel = spine.length ? spine[spine.length - 1].file : null;
      if (!rel) {
        const walk = (nodes) => {
          for (const n of nodes || []) {
            if (rel) return;
            if (n.type === "file" && typeof n.path === "string" && n.path.endsWith(".md")) { rel = n.path; return; }
            if (n.children) walk(n.children);
          }
        };
        walk(cfg?.structure?.tree || []);
      }
      if (!rel) { new Notice("No script file to send the beat into."); return; }
      const file = this.app.vault.getAbstractFileByPath(`${book.path}/${rel}`);
      const existing = await this.app.vault.read(file);
      await this.app.vault.modify(file, existing.replace(/\s*$/, "") + "\n\n" + text);
      new Notice(`Sent “${beat.title}” to the end of ${rel}.`);
    } catch (e) {
      console.warn("sendBeatTextToScript failed", e);
      new Notice("Send failed. See console for details.");
    }
  }

  _announceExport(path, formatLabel) {
    // path is null when the user cancels the save dialog — stay silent then.
    if (path) {
      new Notice(`Exported ${formatLabel} to ${path}`);
    }
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
    this.timelineBand?.refresh(true);
  }

  getBasePath() {
    let base = this.settings.basePath || "projects";
    base = base.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    return base || "projects";
  }

  loadScreenplaySnippetCss() {
    try {
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
      // fs/path unavailable (mobile) or snippet not found
    }
    return "";
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
    await this.app.fileManager.trashFile(af);
    await this.refresh();
  }

  async deleteChapter(file) {
    const af = this.app.vault.getAbstractFileByPath(file.path) || file;
    await this.app.fileManager.trashFile(af);
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
      await this.app.fileManager.trashFile(af);
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

  async setNodeStatus(file, status) {
    const book = this.booksIndex.find(b => file.path.startsWith(b.path));
    if (!book) { console.warn('Could not find book for file:', file.path); return; }
    await this.treeService.setNodeStatus(book, file, status);
    await this.refresh();
    this.rerenderViews();
  }

  cycleNodeStatus(file, currentStatus) {
    return this.setNodeStatus(file, nextSceneStatus(currentStatus));
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

  /* Persist the expanded-folders set so the tree keeps its open/closed state
     across reloads. Debounced to avoid a disk write on every toggle. */
  persistExpandedFolders() {
    if (this._expandedFoldersSaveTimer) clearTimeout(this._expandedFoldersSaveTimer);
    this._expandedFoldersSaveTimer = setTimeout(() => {
      this._expandedFoldersSaveTimer = null;
      try {
        this.settings.expandedFolders = Array.from(this.expandedFolders);
        this.saveSettings();
      } catch (e) {
        console.warn('persistExpandedFolders failed', e);
      }
    }, 300);
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
    for (const type of [VIEW_TYPE, BEAT_BOARD_VIEW_TYPE]) {
      const leaves = this.app.workspace.getLeavesOfType(type);
      for (const leaf of leaves) {
        const view = leaf.view;
        try {
          if (view && typeof view.render === "function") view.render();
        } catch (e) {
          console.warn("render failed", e);
        }
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
