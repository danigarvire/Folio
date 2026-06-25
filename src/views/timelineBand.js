/**
 * Timeline Band — the multilane Outline Editor pinned above the script.
 *
 * A horizontal, page-scaled strip (Final Draft's Outline Editor): a page ruler,
 * one or more planning lanes of free beat bars (positioned + resized over the
 * page scale), and a Script lane whose scene bars are sized by length. Beats are
 * planning-only (cfg.outline); the script lane is derived from the Spine.
 *
 * Injected into each markdown view's `.view-content` (above the scroller) and
 * reconciled on leaf/file/layout changes. Pure layout math lives in
 * outlineModel.js / outlineLayout.js.
 */

import { setIcon } from 'obsidian';
import { PROJECT_TYPES, BEAT_BOARD_VIEW_TYPE } from '../constants/index.js';
import { getProfile } from '../services/formatProfiles.js';
import { beatsInLane, paginate, MIN_ZOOM, MAX_ZOOM } from '../services/outlineModel.js';
import { findDrafts, draftScopeNodes, resolveCurrentDraft } from '../services/draftModel.js';
import { layout, pxToPage } from '../services/outlineLayout.js';
import { BeatModal } from '../modals/beatModal.js';
import { TextInputModal } from '../modals/textInputModal.js';

const BAND_CLASS = "folio-timeline-band";
const HOST_CLASS = "folio-timeline-band-host";
const PX_PER_PAGE = 120;
const LABEL_W = 80; // sticky label gutter width (matches CSS)

export class TimelineBand {
  constructor(plugin) {
    this.plugin = plugin;
    this._cache = new Map(); // book.path -> { spine, outline }
  }

  register() {
    const ws = this.plugin.app.workspace;
    this.plugin.registerEvent(ws.on("active-leaf-change", () => this.refresh(false)));
    this.plugin.registerEvent(ws.on("file-open", () => this.refresh(false)));
    this.plugin.registerEvent(ws.on("layout-change", () => this.refresh(false)));
    // Keep the strip in sync as the user types (so new headings appear and
    // scene indices/ids never go stale). Debounced — a rebuild re-reads files.
    this.plugin.registerEvent(ws.on("editor-change", () => {
      clearTimeout(this._editDebounce);
      this._editDebounce = setTimeout(() => this.refresh(true), 500);
    }));
    this.plugin.register(() => { clearTimeout(this._editDebounce); clearTimeout(this._zoomDebounce); this.removeAll(); });
    // Live cursor playhead: follow the caret without a forced rebuild (cheap DOM move).
    this.plugin.registerInterval(window.setInterval(() => this.tick(), 150));
    ws.onLayoutReady(() => this.refresh(true));
  }

  /** Cheap per-frame update: move the playhead + active-scene highlight to the caret. */
  tick() {
    try {
      const av = this.plugin.app.workspace.activeEditor;
      if (!av || !av.editor || !av.file || !av.contentEl) return;
      const band = av.contentEl.querySelector(":scope > ." + BAND_CLASS);
      if (!band) return;
      const book = this.bookForFile(av.file);
      if (!book) return;
      this.positionPlayhead(band, book, av.file);
      this.updateHighlight(band, av.file.path, false);
    } catch (e) { /* ignore */ }
  }

  removeAll() {
    try {
      document.querySelectorAll("." + HOST_CLASS).forEach((host) => {
        host.classList.remove(HOST_CLASS);
        const band = host.querySelector(":scope > ." + BAND_CLASS);
        if (band) band.remove();
      });
    } catch (e) { /* best-effort */ }
  }

  bookForFile(file) {
    if (!file || !file.path) return null;
    return (this.plugin.booksIndex || []).find((b) => file.path.startsWith(b.path + "/")) || null;
  }

  isScene(file, book) {
    if (!file || file.extension !== "md") return false;
    const rel = file.path.replace(book.path + "/", "");
    return !rel.startsWith("misc/");
  }

  async refresh(force = false) {
    try {
      const ws = this.plugin.app.workspace;
      for (const leaf of ws.getLeavesOfType("markdown")) {
        const view = leaf.view;
        const contentEl = view?.contentEl;
        if (!contentEl) continue;
        const file = view.file;
        const book = this.bookForFile(file);
        if (book && this.isScene(file, book)) await this.renderBand(contentEl, book, file, force);
        else this.removeBand(contentEl);
      }
      // The Beat Board hosts the same strip (file-less — no playhead) in its own
      // header slot, so "Beat Board with strip" is a complete standalone view.
      for (const leaf of ws.getLeavesOfType(BEAT_BOARD_VIEW_TYPE)) {
        const host = leaf.view?.contentEl?.querySelector(":scope > .folio-bb-strip");
        const book = this.plugin.activeBook;
        if (host && book) await this.renderBand(host, book, null, force);
      }
    } catch (e) {
      console.warn("TimelineBand.refresh failed", e);
    }
  }

  /** Render the current draft's strip into an arbitrary host (e.g. the Beat Board). */
  async renderBandInto(host, book, force = true) {
    if (!host || !book) return;
    try { await this.renderBand(host, book, null, force); } catch (e) { console.warn(e); }
  }

  removeBand(contentEl) {
    const band = contentEl.querySelector(":scope > ." + BAND_CLASS);
    if (band) band.remove();
    contentEl.classList.remove(HOST_CLASS);
  }

  async getData(book, file, force) {
    let cfg = {};
    try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch (e) { cfg = {}; }
    const profile = getProfile(cfg.basic?.projectType || PROJECT_TYPES.BOOK);
    const tree = (cfg.structure && cfg.structure.tree) || [];
    // The strip reflects the project's CURRENT draft, no matter which file is open
    // — so it persists across the whole project. The playhead only lights up when
    // the active file actually belongs to the current draft (handled downstream).
    const draftNode = resolveCurrentDraft(tree, cfg.currentDraftPath);
    const draftPath = draftNode ? draftNode.path : "";
    const key = book.path + "::" + draftPath;
    if (!force && this._cache.has(key)) return this._cache.get(key);

    // Scope the spine to the current draft (its files). A legacy project with no
    // flagged drafts falls back to the whole tree.
    const scopedTree = draftNode ? draftScopeNodes(draftNode) : tree;
    const scopedCfg = { ...cfg, structure: { ...(cfg.structure || {}), tree: scopedTree } };
    let spine = [];
    try { spine = await this.plugin.spineService.buildSpine(book, scopedCfg, profile); } catch (e) { spine = []; }
    let outline = { lanes: [], beats: [] };
    try { outline = await this.plugin.outlineEditorService.load(book); } catch (e) { outline = { lanes: [], beats: [] }; }
    const pt = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
    const perPage = pt === PROJECT_TYPES.SCRIPT || pt === PROJECT_TYPES.FILM ? 190 : 280; // words/page
    const choices = findDrafts(tree).map((d) => ({ path: d.path, name: d.title || d.path }));
    const draftName = draftNode ? (draftNode.title || draftNode.path) : "";
    const data = { spine, outline, draftPath, draftName, choices, perPage };
    this._cache.set(key, data);
    return data;
  }

  async renderBand(contentEl, book, file, force) {
    // Ensure exactly one band synchronously before any await (event bursts).
    const existing = contentEl.querySelectorAll(":scope > ." + BAND_CLASS);
    let band = existing[0] || null;
    for (let i = 1; i < existing.length; i++) existing[i].remove();
    if (!band) { band = createDiv({ cls: BAND_CLASS }); contentEl.prepend(band); }
    contentEl.classList.add(HOST_CLASS);

    const { spine, outline, draftPath, draftName, choices, perPage } = await this.getData(book, file, force);
    const draftKey = book.path + "::" + draftPath;

    // Cheap path on nav: same draft already rendered, not forced → just highlight.
    if (band.dataset.draftkey === draftKey && !force) { this.updateHighlight(band, file ? file.path : null); this.positionPlayhead(band, book, file); return; }

    const paginated = paginate(spine, perPage);
    const pxPerPage = outline.zoom || PX_PER_PAGE;
    const view = layout(paginated, outline.beats, pxPerPage);
    if (!this._views) this._views = new Map();
    this._views.set(book.path, view);

    band.empty();
    band.dataset.book = book.path;
    band.dataset.draftkey = draftKey;
    band.dataset.pp = String(view.perPage);
    band.dataset.total = String(view.total);

    // Toolbar (sticky-left): quick-open views + add a lane + zoom.
    const toolbar = band.createDiv({ cls: "folio-tl-toolbar" });
    const views = toolbar.createDiv({ cls: "folio-tl-views" });
    const viewBtn = (icon, title, fn) => {
      const b = views.createSpan({ cls: "folio-tl-viewbtn" });
      try { setIcon(b, icon); } catch (e) {}
      b.setAttribute("aria-label", title);
      b.setAttribute("title", title);
      b.addEventListener("click", () => { try { fn(); } catch (e) { console.warn(e); } });
    };
    viewBtn("columns-2", "Open Folio (split)", () => this.plugin.activateFolio());
    viewBtn("file-text", "Open draft script", () => this.plugin.openDraftScript());
    viewBtn("layout-dashboard", "Open Beat Board", () => this.plugin.openBeatBoard());
    viewBtn("list-tree", "Build outline from draft", () => this.plugin.buildOutlineFromDraft());
    viewBtn("pencil-ruler", "Writer Tools", () => this.plugin.openWriterTools());
    viewBtn("focus", "Focus Mode", () => this.plugin.openFocusMode());

    // Current-draft switcher — the strip always reflects the chosen draft.
    if (choices && choices.length) {
      const dwrap = toolbar.createDiv({ cls: "folio-tl-draftwrap" });
      try { setIcon(dwrap.createSpan({ cls: "folio-tl-draft-icon" }), "layers"); } catch (e) {}
      if (choices.length > 1) {
        const sel = dwrap.createEl("select", { cls: "folio-tl-draftselect" });
        for (const c of choices) {
          const o = sel.createEl("option", { text: c.name }); o.value = c.path;
          if (c.path === draftPath) o.selected = true;
        }
        sel.setAttribute("title", "Current draft (drives the strip)");
        sel.addEventListener("change", async () => {
          await this.plugin.setCurrentDraft(book, sel.value);
          this.refresh(true);
        });
      } else {
        dwrap.createSpan({ cls: "folio-tl-draftname", text: draftName || choices[0].name });
      }
    }

    const addLane = toolbar.createSpan({ cls: "folio-tl-addlane", text: "+ lane" });
    addLane.addEventListener("click", async () => { await this.plugin.outlineEditorService.addLane(book); this.refresh(true); });

    // Zoom slider (drag to rescale the page timeline).
    const zoomWrap = toolbar.createDiv({ cls: "folio-tl-zoomwrap" });
    try { setIcon(zoomWrap.createSpan({ cls: "folio-tl-zoom-icon" }), "zoom-in"); } catch (e) {}
    const slider = zoomWrap.createEl("input", { cls: "folio-tl-zoom-slider", type: "range" });
    slider.min = String(MIN_ZOOM); slider.max = String(MAX_ZOOM); slider.step = "4"; slider.value = String(Math.round(pxPerPage));
    slider.setAttribute("title", "Zoom timeline");
    // Live rescale during drag (cheap DOM repositioning, no rebuild)…
    slider.addEventListener("input", () => this.applyZoomLive(band, Number(slider.value)));
    // …and persist on release (a rebuild here can't interrupt the drag).
    slider.addEventListener("change", async () => {
      await this.plugin.outlineEditorService.setZoom(book, Number(slider.value));
      this.refresh(true);
    });

    const scroll = band.createDiv({ cls: "folio-tl-scroll" });
    const inner = scroll.createDiv({ cls: "folio-tl-inner" });

    // Cursor playhead spanning all lanes (positioned in track space).
    const playhead = inner.createDiv({ cls: "folio-tl-playhead" });
    playhead.style.display = "none";

    this.renderRuler(inner, view);
    outline.lanes.forEach((lane, i) => this.renderLane(inner, view, outline, lane, i, book));
    this.renderFileLane(inner, view, book);
    this.renderScriptLane(inner, view, book);

    this.updateHighlight(band, file ? file.path : null);
    this.positionPlayhead(band, book, file);
  }

  renderRuler(inner, view) {
    const row = inner.createDiv({ cls: "folio-tl-row folio-tl-ruler" });
    row.createSpan({ cls: "folio-tl-label" });
    const track = row.createDiv({ cls: "folio-tl-track" });
    track.style.width = view.width + "px";
    for (let p = 0; p < view.pages; p++) {
      const tick = track.createSpan({ cls: "folio-tl-page", text: String(p + 1) });
      tick.dataset.page = String(p);
      tick.style.left = p * view.pxPerPage + "px";
    }
  }

  renderLane(inner, view, outline, lane, laneIndex, book) {
    const row = inner.createDiv({ cls: "folio-tl-row folio-tl-lane" });
    const label = row.createSpan({ cls: "folio-tl-label is-lane", text: lane.name || `Outline ${laneIndex + 1}` });
    label.setAttribute("title", "Click to rename");
    label.addEventListener("click", () => this.renameLane(book, laneIndex, lane.name));
    if (outline.lanes.length > 1) {
      const rm = label.createSpan({ cls: "folio-tl-lane-remove", text: " ×" });
      rm.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.plugin.outlineEditorService.removeLane(book, laneIndex);
        this.refresh(true);
      });
    }
    const track = row.createDiv({ cls: "folio-tl-track" });
    track.style.width = view.width + "px";

    for (const beat of beatsInLane(outline, laneIndex)) {
      const bar = track.createDiv({ cls: "folio-tl-beat" });
      bar.dataset.pstart = String(beat.start || 0);
      bar.dataset.pspan = String(beat.span || 1);
      bar.style.left = (beat.start || 0) * view.pxPerPage + "px";
      bar.style.width = Math.max(view.pxPerPage * 0.4, (beat.span || 1) * view.pxPerPage) + "px";
      if (beat.color) bar.style.background = beat.color;
      bar.createSpan({ cls: "folio-tl-beat-title", text: beat.title || "Beat" });
      if (beat.goal) bar.createSpan({ cls: "folio-tl-beat-goal", text: String(beat.goal) });
      bar.setAttribute("title", beat.notes || beat.title || "");
      const lh = bar.createDiv({ cls: "folio-tl-handle is-left" });
      const rh = bar.createDiv({ cls: "folio-tl-handle is-right" });
      bar.addEventListener("click", () => { if (!this._beatMoved) this.openBeatEditor(book, beat, outline.lanes); });
      this.beatPointer(bar, lh, rh, book, beat, view.pxPerPage);
    }

    // Double-click empty lane space → add a beat there.
    track.addEventListener("dblclick", async (e) => {
      if (e.target !== track) return;
      const start = pxToPage(e.offsetX, view.pxPerPage);
      await this.plugin.outlineEditorService.addBeat(book, { title: "New beat", lane: laneIndex, start, span: 1 });
      this.refresh(true);
    });
  }

  /** Pointer-based move (body) + resize (edge handles); persists page start/span. */
  beatPointer(bar, lh, rh, book, beat, pxPerPage) {
    const begin = (e, mode) => {
      e.preventDefault(); e.stopPropagation();
      this._beatMoved = false;
      const startX = e.clientX;
      const origLeft = parseFloat(bar.style.left) || 0;
      const origW = parseFloat(bar.style.width) || pxPerPage;
      const minW = pxPerPage * 0.4;
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        if (Math.abs(dx) > 3) this._beatMoved = true;
        if (mode === "move") bar.style.left = Math.max(0, origLeft + dx) + "px";
        else if (mode === "resize-r") bar.style.width = Math.max(minW, origW + dx) + "px";
        else { const nl = Math.max(0, origLeft + dx); bar.style.left = nl + "px"; bar.style.width = Math.max(minW, origW - (nl - origLeft)) + "px"; }
      };
      const onUp = async () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (!this._beatMoved) return;
        const left = parseFloat(bar.style.left) || 0;
        const w = parseFloat(bar.style.width) || pxPerPage;
        await this.plugin.outlineEditorService.updateBeat(book, beat.id, {
          start: pxToPage(left, pxPerPage),
          span: Math.max(0.25, pxToPage(w, pxPerPage)),
        });
        this.refresh(true);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };
    bar.addEventListener("mousedown", (e) => { if (e.target === lh || e.target === rh) return; begin(e, "move"); });
    lh.addEventListener("mousedown", (e) => begin(e, "resize-l"));
    rh.addEventListener("mousedown", (e) => begin(e, "resize-r"));
  }

  /** A grouping row showing each source file as a labeled segment over its scenes.
   *  Only shown when the draft spans 2+ files (no point for a single-file script). */
  renderFileLane(inner, view, book) {
    const scenes = view.scenes || [];
    if (new Set(scenes.map((s) => s.file)).size < 2) return;
    const groups = [];
    for (const s of scenes) {
      const last = groups[groups.length - 1];
      if (last && last.file === s.file) last.endWords = s.start + s.length;
      else groups.push({ file: s.file, startWords: s.start, endWords: s.start + s.length, line: s.line });
    }
    const row = inner.createDiv({ cls: "folio-tl-row folio-tl-filelane" });
    row.createSpan({ cls: "folio-tl-label", text: "Files" });
    const track = row.createDiv({ cls: "folio-tl-track" });
    track.style.width = view.width + "px";
    groups.forEach((g, i) => {
      const lenWords = Math.max(1, g.endWords - g.startWords);
      const seg = track.createDiv({ cls: "folio-tl-fileseg" + (i % 2 ? " is-alt" : "") });
      seg.style.left = g.startWords * view.pxPerUnit + "px";
      seg.style.width = lenWords * view.pxPerUnit + "px";
      seg.dataset.sstart = String(g.startWords);
      seg.dataset.slen = String(lenWords);
      const base = g.file.split("/").pop().replace(/\.md$/, "");
      seg.createSpan({ cls: "folio-tl-fileseg-label", text: base });
      seg.setAttribute("title", base);
      seg.addEventListener("click", () => this.revealAtLine(`${book.path}/${g.file}`, g.line));
    });
  }

  renderScriptLane(inner, view, book) {
    const row = inner.createDiv({ cls: "folio-tl-row folio-tl-script" });
    row.createSpan({ cls: "folio-tl-label is-script", text: "Script" });
    const track = row.createDiv({ cls: "folio-tl-track" });
    track.style.width = view.width + "px";

    for (const scene of view.scenes) {
      const fullPath = `${book.path}/${scene.file}`;
      const status = scene.status || null;
      const bar = track.createDiv({ cls: `folio-tl-scene is-${status || "none"}` });
      bar.style.left = scene.px + "px";
      bar.style.width = scene.w + "px";
      bar.dataset.sstart = String(scene.start || 0);
      bar.dataset.slen = String(scene.length || 1);
      bar.dataset.path = fullPath;
      bar.dataset.line = String(scene.line || 0);
      bar.dataset.end = scene.end != null ? String(scene.end) : "";
      bar.dataset.index = String(scene.index);
      bar.dataset.id = scene.id || "";
      bar.createSpan({ cls: "folio-tl-scene-title", text: scene.title });
      bar.setAttribute("title", scene.title);
      bar.addEventListener("click", () => { if (!this._dragging) this.revealAtLine(fullPath, scene.line); });
      this.attachSceneDrag(bar, book, scene);
    }

    // Drop on empty track space → move the dragged scene to the end.
    track.addEventListener("dragover", (e) => { if (this._dragging && e.target === track) e.preventDefault(); });
    track.addEventListener("drop", (e) => {
      if (!this._dragging || e.target !== track) return;
      e.preventDefault();
      this.handleSceneDrop(book, { id: null, index: null });
    });
  }

  // --- Scene reorder (HTML5 drag; prefers stable id, falls back to index) ---
  attachSceneDrag(bar, book, scene) {
    bar.setAttribute("draggable", "true");
    bar.addEventListener("dragstart", (e) => {
      this._dragging = true;
      this._drag = { id: scene.id || null, index: scene.index };
      bar.addClass("is-dragging");
      try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(scene.index)); } catch (err) {}
    });
    bar.addEventListener("dragend", () => { bar.removeClass("is-dragging"); setTimeout(() => { this._dragging = false; }, 0); });
    bar.addEventListener("dragover", (e) => { if (!this._dragging) return; e.preventDefault(); bar.addClass("is-drop-target"); });
    bar.addEventListener("dragleave", () => bar.removeClass("is-drop-target"));
    bar.addEventListener("drop", (e) => {
      e.preventDefault(); e.stopPropagation(); bar.removeClass("is-drop-target");
      this.handleSceneDrop(book, { id: scene.id || null, index: scene.index });
    });
  }

  async handleSceneDrop(book, target) {
    const from = this._drag;
    if (!from || (target.index != null && target.index === from.index)) return;
    try {
      let cfg = {};
      try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch (e) { cfg = {}; }
      const profile = getProfile(cfg.basic?.projectType || PROJECT_TYPES.BOOK);
      let res;
      // Prefer stable-id reorder (immune to index drift); fall back to index
      // (which also assigns ids) when a scene has none yet.
      if (from.id && (target.id || target.id === null && target.index === null)) {
        res = await this.plugin.reorderService.applyMove(book, cfg, profile, from.id, target.id);
      } else {
        res = await this.plugin.reorderService.applyMoveByIndex(book, cfg, profile, from.index, target.index);
      }
      if (!res || !res.ok) { console.warn("scene reorder failed", res); return; }
      this._cache.delete(book.path);
      await this.refresh(true);
    } catch (err) { console.warn("handleSceneDrop failed", err); }
  }

  renameLane(book, laneIndex, current) {
    const modal = new TextInputModal(this.plugin.app, {
      title: "Rename lane",
      placeholder: current || "Lane name",
      cta: "Rename",
      onSubmit: async (value) => { await this.plugin.outlineEditorService.renameLane(book, laneIndex, value); this.refresh(true); },
    });
    modal.open();
  }

  openBeatEditor(book, beat, lanes) {
    const modal = new BeatModal(this.plugin.app, {
      beat: { ...beat },
      lanes,
      onSave: async (patch) => { await this.plugin.outlineEditorService.updateBeat(book, beat.id, patch); this.refresh(true); },
      onDelete: async () => { await this.plugin.outlineEditorService.removeBeat(book, beat.id); this.refresh(true); },
      onSend: (b) => this.plugin.sendBeatTextToScript(book, b),
    });
    modal.open();
  }

  async revealAtLine(fullPath, line) {
    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(fullPath);
      if (!file) return;
      const leaf = this.plugin.app.workspace.getLeaf(false);
      await leaf.openFile(file, { eState: { line: line || 0 } });
    } catch (e) { console.warn(e); }
  }

  activeCursorLine(path) {
    try {
      const av = this.plugin.app.workspace.activeEditor;
      const editor = av && av.file && av.file.path === path && av.editor ? av.editor : null;
      return editor ? editor.getCursor().line : null;
    } catch (e) { return null; }
  }

  updateHighlight(band, activePath, scroll = true) {
    const cursor = this.activeCursorLine(activePath);
    const scenes = [...band.querySelectorAll(".folio-tl-scene")].filter((c) => c.dataset.path === activePath);
    let current = null;
    if (cursor != null) {
      for (const s of scenes) {
        const start = Number(s.dataset.line || 0);
        const end = s.dataset.end ? Number(s.dataset.end) : Infinity;
        if (cursor >= start && cursor < end) { current = s; break; }
      }
      if (!current && scenes.length) current = scenes[0];
    } else {
      current = scenes[0] || null;
    }
    band.querySelectorAll(".folio-tl-scene").forEach((s) => s.classList.toggle("is-current", s === current));
    if (scroll && current && typeof current.scrollIntoView === "function") {
      try { current.scrollIntoView({ inline: "center", block: "nearest" }); } catch (e) { /* ignore */ }
    }
  }

  /** Pixel x (in track space) of the caret within the script timeline, or null. */
  computePlayheadPx(view, book, filePath, line) {
    const rel = filePath.slice(book.path.length + 1);
    const fileScenes = view.scenes.filter((s) => s.file === rel);
    if (!fileScenes.length) return null;
    const sc = fileScenes.find((s) => line >= s.line && line < (s.end != null ? s.end : Infinity)) || fileScenes[fileScenes.length - 1];
    // The caret line maps to a fraction of the unit's span; apply to its word-length.
    const spanLines = Math.max(1, (sc.end != null ? sc.end : sc.line + 1) - sc.line);
    const frac = Math.min(1, Math.max(0, (line - sc.line) / spanLines));
    return (sc.start + frac * (sc.length || 0)) * view.pxPerUnit;
  }

  /** Move the caret playhead to the cursor's page position (or hide it). */
  positionPlayhead(band, book, file) {
    const view = this._views && this._views.get(book.path);
    const playhead = band.querySelector(".folio-tl-playhead");
    if (!view || !playhead) return;
    if (!file) { playhead.style.display = "none"; return; } // file-less host (Beat Board)
    const line = this.activeCursorLine(file.path);
    if (line == null) { playhead.style.display = "none"; return; }
    const px = this.computePlayheadPx(view, book, file.path, line);
    if (px == null) { playhead.style.display = "none"; return; }
    playhead.style.display = "";
    playhead.style.left = LABEL_W + px + "px";
    playhead.dataset.uoff = String(px / view.pxPerUnit); // metric (word) offset, for live zoom
  }

  /** Reposition all bars/ticks/playhead for a new zoom without a rebuild (live drag). */
  applyZoomLive(band, v) {
    const pp = Number(band.dataset.pp) || 280;
    const total = Number(band.dataset.total) || 1;
    const pxUnit = v / pp;
    const width = Math.max(total * pxUnit, v) + "px";
    band.querySelectorAll(".folio-tl-track").forEach((t) => { t.style.width = width; });
    band.querySelectorAll(".folio-tl-scene, .folio-tl-fileseg").forEach((b) => {
      b.style.left = (Number(b.dataset.sstart) || 0) * pxUnit + "px";
      b.style.width = Math.max(10, (Number(b.dataset.slen) || 1) * pxUnit) + "px";
    });
    band.querySelectorAll(".folio-tl-beat").forEach((b) => {
      b.style.left = (Number(b.dataset.pstart) || 0) * v + "px";
      b.style.width = Math.max(v * 0.4, (Number(b.dataset.pspan) || 1) * v) + "px";
    });
    band.querySelectorAll(".folio-tl-page").forEach((t) => { t.style.left = (Number(t.dataset.page) || 0) * v + "px"; });
    const ph = band.querySelector(".folio-tl-playhead");
    if (ph && ph.dataset.uoff != null && ph.style.display !== "none") ph.style.left = LABEL_W + (Number(ph.dataset.uoff) || 0) * pxUnit + "px";
  }
}
