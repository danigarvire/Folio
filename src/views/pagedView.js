/**
 * Folio Paged View
 *
 * A WYSIWYG, page-correlated rendering of the CURRENT DRAFT — all its files
 * flowed continuously into real US-Letter pages using the shared layout engine
 * (layoutModel.js) and the standard profile (screenplay or prose). The same
 * profile will drive export, so screen and PDF stay consistent.
 *
 * Editing is per-block: click a line to edit its raw source in place; on commit
 * it's written back to the exact { file, startLine..endLine } it came from and
 * the draft re-paginates. The outline strip is hosted on top (like the Beat
 * Board), so this is a complete standalone view.
 */

import { ItemView, setIcon } from 'obsidian';
import { PAGED_VIEW_TYPE, PROJECT_TYPES } from '../constants/index.js';
import { resolveCurrentDraft, draftScopeNodes } from '../services/draftModel.js';
import {
  SCREENPLAY_PROFILE, PROSE_PROFILE, PAGE_SIZES,
  parseScreenplayBlocks, parseProseBlocks, paginate, PT_PER_INCH,
} from '../services/layoutModel.js';
import { createPagedEditor } from '../editor/screenplayPagedEditor.js';

const PX_PER_PT = 96 / 72; // render points at 96dpi ("actual size")
const PX_PER_IN = 96;

export class FolioPagedView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return PAGED_VIEW_TYPE; }
  getDisplayText() { return "Paged View"; }
  getIcon() { return "book-open"; }

  async onOpen() {
    const ws = this.plugin.app.workspace;
    try { this.addAction("gallery-vertical", "Views", (e) => this.plugin.showViewMenu(e)); } catch (e) {}
    this.registerEvent(ws.on("active-leaf-change", (leaf) => {
      // Re-render when focus returns here (to pick up edits made elsewhere), but
      // debounce so tab/focus churn doesn't repaint repeatedly.
      if (leaf && leaf.view === this) {
        clearTimeout(this._alcTimer);
        this._alcTimer = setTimeout(() => this.render(), 150);
      }
    }));
    // Live sync FROM a file (edits made in Obsidian View / elsewhere) INTO its stacked editor.
    this.registerEvent(ws.on("editor-change", (editor, info) => {
      const f = info && info.file;
      if (f && this._editorFor(f.path)) this._scheduleSync(f.path);
    }));
    this.registerEvent(this.plugin.app.vault.on("modify", (file) => {
      if (file && this._editorFor(file.path)) this._scheduleSync(file.path);
    }));
    await this.render();
  }
  async onClose() { clearTimeout(this._alcTimer); clearTimeout(this._syncTimer); this._destroyEditors(); }

  _scheduleSync(fullPath) { clearTimeout(this._syncTimer); this._syncTimer = setTimeout(() => this._syncFromFile(fullPath), 150); }

  /** Pull a file's current text into its stacked editor when it changed elsewhere. */
  async _syncFromFile(fullPath) {
    try {
      const e = this._editorFor(fullPath);
      if (!e || !e.view || e.view.hasFocus) return; // don't clobber while typing here
      const text = await this._readText(fullPath);
      if (text == null || text === e.view.state.doc.toString()) return; // unchanged / our own save
      e.view.dispatch({ changes: { from: 0, to: e.view.state.doc.length, insert: text } });
    } catch (err) { console.warn("paged sync-from-file failed", err); }
  }

  /** Serialised render (empty-then-await would otherwise interleave; see Beat Board). */
  async render() {
    if (this._rendering) { this._pending = true; return; }
    this._rendering = true;
    try { do { this._pending = false; await this._renderImpl(); } while (this._pending); }
    finally { this._rendering = false; }
  }

  /** The current draft's markdown files, in tree order. */
  _draftFiles(cfg) {
    const draft = resolveCurrentDraft(cfg.structure?.tree || [], cfg.currentDraftPath);
    const scope = draftScopeNodes(draft) || [];
    const out = [];
    const walk = (nodes) => {
      for (const n of [...(nodes || [])].sort((a, b) => (a.order || 0) - (b.order || 0))) {
        if (n.type === "file" && n.path && n.path.endsWith(".md")) out.push(n);
        else if (n.children) walk(n.children);
      }
    };
    walk(scope);
    return { draft, files: out };
  }

  /** Read a file's current text, preferring an open editor's buffer. */
  async _readText(fullPath) {
    for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
      const v = leaf.view;
      if (v && v.file && v.file.path === fullPath && v.editor) return v.editor.getValue();
    }
    const file = this.plugin.app.vault.getAbstractFileByPath(fullPath);
    return file && file.extension === "md" ? await this.plugin.app.vault.read(file) : null;
  }

  async _renderImpl() {
    const el = this.contentEl;
    el.addClass("folio-paged-view");

    const book = this.plugin.activeBook;
    if (!book) { this._teardown(el); this._empty(el, "No active project", "Open or create a Folio project to use the Paged View."); return; }
    this._book = book;

    const cfg = (await this.plugin.loadBookConfig(book)) || {};
    const projectType = cfg.basic?.projectType || PROJECT_TYPES.BOOK;
    const screenplay = projectType === PROJECT_TYPES.SCRIPT || projectType === PROJECT_TYPES.FILM;
    const profile = screenplay ? SCREENPLAY_PROFILE : PROSE_PROFILE;
    this._profile = profile;
    this._screenplay = screenplay;

    const { draft, files } = this._draftFiles(cfg);
    if (!draft) { this._teardown(el); this._empty(el, "No draft", "Mark a folder or file as a draft to page it."); return; }

    // Persistent strip host (create once) — refreshed cheaply so it never flashes.
    let stripHost = el.querySelector(":scope > .folio-paged-strip");
    if (!stripHost) { stripHost = createDiv({ cls: "folio-paged-strip folio-bb-strip" }); el.prepend(stripHost); }

    await this._mountEditors(el, book, files, profile); // continuous CM editor — screenplay or prose

    try { await this.plugin.timelineBand?.renderBandInto(stripHost, book, false); } catch (e) { /* ignore */ }
    if (this._cursorFrac != null) this._updatePlayhead(this._cursorFrac); // restore "you are here"
  }

  /** The mounted editor entry for a full file path, or null. */
  _editorFor(fullPath) { return (this._editors || []).find((e) => e.fullPath === fullPath) || null; }

  /**
   * Mount one CodeMirror paged editor PER draft file, stacked — so every file
   * lives in the same Paged View. Each file is numbered LOCALLY (from page 1);
   * the strip ruler on top is the continuous PROJECT pagination, and each file's
   * header shows its project page range. Rebuilds only when the file set changes
   * (so live editors keep their cursors).
   */
  async _mountEditors(el, book, files, profile) {
    if (!files.length) { this._destroyEditors(); this._clearBody(el); this._empty(el, "Nothing to page yet", "Add a script file to the current draft."); return; }
    const sig = book.path + "::" + files.map((f) => f.path).join("|");
    if (this._editors && this._editors.length && this._editorsSig === sig) return; // keep the live editors

    this._destroyEditors();
    this._clearBody(el);
    const scroller = el.createDiv({ cls: "folio-paged-body folio-paged-scroller folio-paged-editor-host" });
    this._editors = [];
    this._editorsSig = sig;
    const multi = files.length > 1;

    const parse = this._screenplay ? (t) => parseScreenplayBlocks(t, { keepBlanks: true }) : (t) => parseProseBlocks(t);
    let projOffset = 0;
    for (const node of files) {
      const fullPath = `${book.path}/${node.path}`;
      const text = (await this._readText(fullPath)) || "";
      let pageCount = 1;
      try { pageCount = paginate(parse(text), profile).pageCount || 1; } catch (e) {}
      const projTo = projOffset + pageCount;

      const section = scroller.createDiv({ cls: "folio-paged-filesection" });
      if (multi) {
        const header = section.createDiv({ cls: "folio-paged-fileheader" });
        header.createSpan({ cls: "folio-paged-filename", text: node.title || node.path.replace(/\.md$/, "") });
        header.createSpan({ cls: "folio-paged-filerange", text: `project p. ${projOffset + 1}–${projTo}` });
      }
      const host = section.createDiv({ cls: "folio-paged-fileeditor" });

      const fileOffset = projOffset; // capture for closures
      let view = null;
      try {
        view = createPagedEditor(host, text, {
          profile,
          pageOffset: 0, // local numbering (each file from page 1)
          onChange: (t) => this._saveEditor(fullPath, t),
          onCursor: (line, localFrac) => {
            const frac = localFrac == null ? null : fileOffset + localFrac; // project position
            this._cursorFrac = frac; this._cursorPath = fullPath;
            this._updatePlayhead(frac);
          },
        });
      } catch (e) {
        console.error("paged editor mount failed", e);
        this._empty(host, "Editor unavailable", "Couldn't start the paged editor (see console).");
      }
      this._editors.push({ path: node.path, fullPath, view, projOffset, pageCount });
      projOffset = projTo;
    }
  }

  _destroyEditors() {
    for (const e of this._editors || []) { try { e.view?.destroy(); } catch (x) {} }
    this._editors = [];
    this._editorsSig = null;
  }

  /** Persist the editor's text to its file (via the open editor if any, else the vault). */
  async _saveEditor(fullPath, text) {
    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(fullPath);
      if (!file) return;
      for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
        const v = leaf.view;
        if (v && v.file && v.file.path === fullPath && v.editor) {
          // Same file open in a normal editor: keep it in sync but preserve its
          // cursor/scroll (setValue would otherwise jump it on every autosave).
          if (v.editor.getValue() !== text) {
            const cur = v.editor.getCursor?.();
            const scroll = v.editor.getScrollInfo?.();
            v.editor.setValue(text);
            try { if (cur) v.editor.setCursor(cur); if (scroll) v.editor.scrollTo?.(scroll.left, scroll.top); } catch (e) {}
          }
          this.plugin.timelineBand?.refresh(true);
          return;
        }
      }
      await this.plugin.app.vault.modify(file, text);
      this.plugin.timelineBand?.refresh(true);
    } catch (e) { console.error("paged save failed", e); }
  }

  /** Scroll the stacked editor for a file to a source line. Called by scene clicks. */
  async scrollToLine(fullPath, line) {
    try {
      const e = this._editorFor(fullPath);
      const view = e && e.view;
      if (!view) return;
      const n = Math.max(1, Math.min(view.state.doc.lines, (line || 0) + 1));
      const info = view.state.doc.line(n);
      view.dispatch({ selection: { anchor: info.from }, scrollIntoView: true });
      view.focus();
    } catch (e) { console.warn("scrollToLine failed", e); }
  }

  /** Move the strip's "you are here" playhead to the cursor's PROJECT page position. */
  _updatePlayhead(pageFraction) {
    try {
      const host = this.contentEl.querySelector(":scope > .folio-paged-strip");
      const band = host && host.querySelector(".folio-timeline-band");
      if (band) this.plugin.timelineBand?.positionExternalPlayhead(band, this._book, this._cursorPath || "", 0, pageFraction);
    } catch (e) { /* ignore */ }
  }

  /** Remove the body (pages/editor) but keep the strip host. */
  _clearBody(el) {
    el.querySelectorAll(":scope > .folio-paged-body, :scope > .folio-paged-scroller, :scope > .folio-paged-empty").forEach((n) => n.remove());
  }

  /** Empty-state teardown: destroy the editors and clear the whole view. */
  _teardown(el) { this._destroyEditors(); el.empty(); }

  /** Prose pages (DOM preview with per-block click-to-edit), build-then-swap. */
  async _renderProsePages(el, book, files, profile) {
    const blocks = [];
    let first = true;
    for (const node of files) {
      const text = await this._readText(`${book.path}/${node.path}`);
      if (text == null) continue;
      let fileBlocks = parseProseBlocks(text, { file: node.path });
      // An empty file still gets its own page (otherwise it just vanishes).
      if (!fileBlocks.length) fileBlocks = [{ type: "paragraph", text: "", file: node.path, startLine: 0, endLine: 0 }];
      if (!first) fileBlocks[0] = { ...fileBlocks[0], pageBreakBefore: true };
      blocks.push(...fileBlocks);
      first = false;
    }
    this._blocks = blocks;
    this._blockEls = [];

    const building = el.createDiv({ cls: "folio-paged-body folio-paged-scroller folio-paged-building" });
    building.createDiv({ cls: "folio-paged-prose-note", text: "Prose preview — click a line to edit. Continuous typing arrives with the prose editor; for now write in Obsidian View." });
    this._paginateInto(building, blocks, profile);
    if (!blocks.length) this._empty(building, "Nothing to page yet", "Add chapters to the current draft.");
    let prevScroll = 0;
    el.querySelectorAll(":scope > .folio-paged-scroller").forEach((s) => { if (s !== building) { prevScroll = s.scrollTop || prevScroll; s.remove(); } });
    building.classList.remove("folio-paged-building");
    building.scrollTop = prevScroll;
    this._restoreFocus();
  }

  /** Build a fresh page element and return its content area. */
  _newPage(scroller, profile) {
    const size = PAGE_SIZES[profile.page.size] || PAGE_SIZES.letter;
    const m = profile.page.margins;
    const page = scroller.createDiv({ cls: "folio-page" });
    page.style.width = (size.width * PX_PER_PT) + "px";
    page.style.height = (size.height * PX_PER_PT) + "px";
    page.style.paddingTop = (m.top * PX_PER_PT) + "px";
    page.style.paddingRight = (m.right * PX_PER_PT) + "px";
    page.style.paddingBottom = (m.bottom * PX_PER_PT) + "px";
    page.style.paddingLeft = (m.left * PX_PER_PT) + "px";
    page.style.fontFamily = profile.font.family;
    page.style.fontSize = (profile.font.sizePt * PX_PER_PT) + "px";
    page.style.lineHeight = String(profile.font.lineHeight);
    const content = page.createDiv({ cls: "folio-page-content" });
    const num = page.createDiv({ cls: "folio-page-number" });
    num.textContent = String(scroller.querySelectorAll(".folio-page").length);
    return content;
  }

  /** Style one block element per the profile (no positioning — it flows). */
  _styleBlock(blockEl, block, profile) {
    const e = profile.elements[block.type] || {};
    blockEl.style.marginLeft = ((e.marginLeft || 0) * PX_PER_IN) + "px";
    blockEl.style.marginRight = ((e.marginRight || 0) * PX_PER_IN) + "px";
    blockEl.style.textAlign = e.align || "left";
    blockEl.style.fontWeight = e.bold ? "700" : "400";
    if (e.sizeScale) blockEl.style.fontSize = (profile.font.sizePt * e.sizeScale * PX_PER_PT) + "px";
    const lh = profile.font.sizePt * profile.font.lineHeight * PX_PER_PT;
    blockEl.style.marginTop = ((e.spaceBefore || 0) * lh) + "px";
    blockEl.style.marginBottom = ((e.spaceAfter || 0) * lh) + "px";
    if (e.firstLineIndent) blockEl.style.textIndent = (e.firstLineIndent * PX_PER_IN) + "px";
  }

  /** Render a block's display element (click to edit). */
  _renderBlock(block, profile) {
    const b = createDiv({ cls: `folio-pb folio-pb-${block.type}` });
    b.textContent = block.type === "spacer" ? "" : (block.text || "");
    this._styleBlock(b, block, profile);
    b._block = block;
    (this._blockEls || (this._blockEls = [])).push(b);
    b.addEventListener("click", (e) => this._editBlock(b, block, this._caretFromClick(b, e)));
    return b;
  }

  /** Approximate caret offset from where the block was clicked (start vs end). */
  _caretFromClick(blockEl, e) {
    try {
      const r = blockEl.getBoundingClientRect();
      return (e.clientX - r.left) < r.width / 2 ? 0 : undefined; // left half → start, else end
    } catch (x) { return undefined; }
  }

  /** After a structural edit + re-render, re-open the editor where the caret should land. */
  _restoreFocus() {
    const f = this._focus; this._focus = null;
    if (!f) return;
    const el = (this._blockEls || []).find((e) => e._block && e._block.file === f.file && e._block.startLine === f.line);
    if (el) this._editBlock(el, el._block, f.ch);
  }

  /** Flow blocks into pages by real DOM height (append → overflow → new page). */
  _paginateInto(scroller, blocks, profile) {
    let content = this._newPage(scroller, profile);
    for (const block of blocks) {
      if (block.pageBreakBefore && content.childElementCount) content = this._newPage(scroller, profile);
      const b = this._renderBlock(block, profile);
      content.appendChild(b);
      if (content.scrollHeight > content.clientHeight && content.childElementCount > 1) {
        content.removeChild(b);
        content = this._newPage(scroller, profile);
        content.appendChild(b);
      }
    }
  }

  /**
   * Click-to-edit with structural keys. The block becomes an inline editor of its
   * raw source; Enter inserts/splits lines (push a cue onto the next page),
   * Backspace removes an empty/spacer line, Esc cancels, blur commits the text.
   */
  _editBlock(blockEl, block, caretCh) {
    if (!blockEl || blockEl.querySelector("textarea")) return;
    const ta = document.createElement("textarea");
    ta.className = "folio-pb-edit";
    ta.value = block.raw != null ? block.raw : (block.text || "");
    blockEl.textContent = "";
    blockEl.appendChild(ta);
    const autosize = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", autosize);
    try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
    autosize();
    let pos = caretCh;
    if (pos == null) pos = ta.value.length;
    if (!Number.isFinite(pos) || pos > ta.value.length) pos = ta.value.length;
    try { ta.setSelectionRange(pos, pos); } catch (e) {}

    let done = false;
    ta.addEventListener("keydown", (ev) => {
      const atStart = ta.selectionStart === 0 && ta.selectionEnd === 0;
      if (ev.key === "Escape") { ev.preventDefault(); done = true; this.render(); return; }
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault(); done = true; this._enterAt(block, ta.value, ta.selectionStart); return;
      }
      if (ev.key === "Backspace" && atStart && (block.type === "spacer" || ta.value === "")) {
        ev.preventDefault(); done = true; this._deleteLine(block); return;
      }
    });
    ta.addEventListener("blur", () => { if (done) return; done = true; this._commitText(block, ta.value); });
  }

  /** Apply a line-array mutation to a file (open editor → setValue, else vault). */
  async _mutateFile(relFile, mutate) {
    const fullPath = `${this._book.path}/${relFile}`;
    for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
      const v = leaf.view;
      if (v && v.file && v.file.path === fullPath && v.editor) {
        const ed = v.editor;
        ed.setValue(mutate(ed.getValue().split("\n")).join("\n"));
        return;
      }
    }
    const file = this.plugin.app.vault.getAbstractFileByPath(fullPath);
    if (!file) return;
    if (typeof this.plugin.app.vault.process === "function") await this.plugin.app.vault.process(file, (d) => mutate(d.split("\n")).join("\n"));
    else { const d = await this.plugin.app.vault.read(file); await this.plugin.app.vault.modify(file, mutate(d.split("\n")).join("\n")); }
  }

  /** Enter at a caret: insert a blank line before/after, or split the line. */
  async _enterAt(block, value, caret) {
    const span = (block.endLine - block.startLine) + 1;
    const pfx = block.prefix || "";
    if (!this._screenplay) { await this._commitText(block, value); return; } // prose: just commit (no spacers)
    await this._mutateFile(block.file, (lines) => {
      let repl;
      if (caret <= 0) repl = ["", pfx + value];                       // blank BEFORE → push this block down
      else if (caret >= value.length) repl = [pfx + value, ""];       // blank AFTER
      else repl = [pfx + value.slice(0, caret), value.slice(caret)];  // split (remainder becomes a plain line)
      lines.splice(block.startLine, span, ...repl);
      return lines;
    });
    // Land the caret on the block that moved down (or the new blank / remainder).
    this._focus = { file: block.file, line: block.startLine + 1, ch: 0 };
    this.render();
  }

  /** Remove an empty/spacer line and pull focus up to the previous line's end. */
  async _deleteLine(block) {
    const span = (block.endLine - block.startLine) + 1;
    await this._mutateFile(block.file, (lines) => { lines.splice(block.startLine, span); return lines; });
    this._focus = { file: block.file, line: Math.max(0, block.startLine - 1), ch: Infinity };
    this.render();
  }

  /** Commit edited text for a block back to its source range. */
  async _commitText(block, value) {
    if (value === (block.raw != null ? block.raw : block.text)) { this.render(); return; }
    const span = (block.endLine - block.startLine) + 1;
    const repl = ((block.prefix || "") + value).split("\n");
    await this._mutateFile(block.file, (lines) => { lines.splice(block.startLine, span, ...repl); return lines; });
    this.render();
  }

  _empty(parent, title, subtitle) {
    const wrap = parent.createDiv({ cls: "folio-paged-empty" });
    const icon = wrap.createDiv({ cls: "folio-paged-empty-icon" });
    try { setIcon(icon, "file-text"); } catch (e) {}
    wrap.createDiv({ cls: "folio-paged-empty-title", text: title });
    wrap.createDiv({ cls: "folio-paged-empty-subtitle", text: subtitle });
  }
}
