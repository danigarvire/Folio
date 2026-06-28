/**
 * Folio Beat Board
 *
 * A freeform 2D corkboard of the SAME beats the outline strip shows (Outline 1 /
 * Outline 2 …, stored in cfg.outline.beats). Cards are positioned by bx/by (free
 * board coordinates, separate from the strip's page start/span), draggable, and
 * editable via the beat modal. Edits persist and refresh the strip, so the two
 * views stay in sync — the brainstorm board and the structured timeline.
 */

import { ItemView, setIcon } from 'obsidian';
import { BEAT_BOARD_VIEW_TYPE } from '../constants/index.js';
import { beatsInLane } from '../services/outlineModel.js';
import { resolveCurrentDraft } from '../services/draftModel.js';
import { BeatModal } from '../modals/beatModal.js';

const CARD_W = 240;
const CARD_H = 120;
const COL = 270;
const ROW = 140;

export class FolioBeatBoardView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return BEAT_BOARD_VIEW_TYPE; }
  getDisplayText() { return "Beat Board"; }
  getIcon() { return "layout-dashboard"; }

  async onOpen() {
    try { this.addAction("gallery-vertical", "Views", (e) => this.plugin.showViewMenu(e)); } catch (e) {}
    // Re-render when this board regains focus so edits made in the strip show up.
    this.registerEvent(this.plugin.app.workspace.on("active-leaf-change", (leaf) => {
      if (leaf && leaf.view === this) this.render();
    }));
    await this.render();
  }
  async onClose() {}

  /**
   * Serialised render. render() empties contentEl and then awaits (config + the
   * strip) before appending — so two concurrent calls (onOpen + the
   * active-leaf-change that fires as this leaf activates) would interleave and
   * duplicate the strip/board. Guard against re-entrancy; coalesce extra requests
   * into one trailing re-render.
   */
  async render() {
    if (this._rendering) { this._pending = true; return; }
    this._rendering = true;
    try {
      do { this._pending = false; await this._renderImpl(); } while (this._pending);
    } finally {
      this._rendering = false;
    }
  }

  async _renderImpl() {
    const el = this.contentEl;
    el.empty();
    el.addClass("folio-bb-view");

    const book = this.plugin.activeBook;
    if (!book) { this.renderEmpty(el, "No active project", "Open or create a Folio project to use the Beat Board."); return; }
    this._book = book;

    let outline = { lanes: [], beats: [] };
    try { outline = await this.plugin.outlineEditorService.load(book); } catch (e) { /* default */ }
    this._outline = outline;

    // Which draft's beats are these? (beats are per-draft).
    let draftName = "";
    try {
      const cfg = (await this.plugin.loadBookConfig(book)) || {};
      const d = resolveCurrentDraft(cfg.structure?.tree || [], cfg.currentDraftPath);
      draftName = d ? (d.title || d.path) : "";
    } catch (e) { /* ignore */ }

    // The outline strip, hosted at the top of the board (file-less — no playhead),
    // so the Beat Board is a complete "board + strip" standalone view.
    const stripHost = el.createDiv({ cls: "folio-bb-strip" });
    try { await this.plugin.timelineBand?.renderBandInto(stripHost, book); } catch (e) { /* ignore */ }

    const header = el.createDiv({ cls: "folio-bb-header" });
    const titleWrap = header.createDiv({ cls: "folio-bb-title-wrap" });
    try { setIcon(titleWrap.createSpan({ cls: "folio-bb-title-icon" }), "layout-dashboard"); } catch (e) {}
    titleWrap.createSpan({ cls: "folio-bb-title", text: draftName ? `${draftName} — Beats` : `${book.name || "Beat Board"} — Beats` });
    const addBtn = header.createEl("button", { cls: "folio-bb-add", text: "+ Beat" });
    addBtn.addEventListener("click", () => this.addBeat());
    const refreshBtn = header.createEl("button", { cls: "folio-bb-refresh", text: "Refresh" });
    refreshBtn.addEventListener("click", () => this.render());

    const surface = el.createDiv({ cls: "folio-bb-surface" });
    for (const beat of outline.beats) this.renderCard(surface, beat, outline);
    if (!outline.beats.length) {
      surface.createDiv({ cls: "folio-bb-hint", text: 'No beats yet. Click "+ Beat", or add beats from the outline strip.' });
    }
  }

  renderCard(surface, beat, outline) {
    const laneIndex = beat.lane || 0;
    const laneBeats = beatsInLane(outline, laneIndex);
    const idx = Math.max(0, laneBeats.findIndex((b) => b.id === beat.id));
    const bx = beat.bx != null ? beat.bx : 20 + laneIndex * COL;
    const by = beat.by != null ? beat.by : 20 + idx * ROW;

    const card = surface.createDiv({ cls: "folio-bb-card" });
    card.style.left = bx + "px";
    card.style.top = by + "px";
    card.style.width = (beat.bw || CARD_W) + "px";
    card.style.minHeight = (beat.bh || CARD_H) + "px";
    if (beat.color) card.style.borderTopColor = beat.color;

    const laneName = (outline.lanes[laneIndex] && outline.lanes[laneIndex].name) || `Lane ${laneIndex + 1}`;
    const top = card.createDiv({ cls: "folio-bb-card-top" });
    top.createSpan({ cls: "folio-bb-card-lane", text: laneName });
    if (beat.goal) top.createSpan({ cls: "folio-bb-card-goal", text: String(beat.goal) });
    card.createDiv({ cls: "folio-bb-card-title", text: beat.title || "Beat" });
    if (beat.notes) card.createDiv({ cls: "folio-bb-card-notes", text: beat.notes });

    this.cardPointer(card, beat);

    // Bottom-right resize handle (persists bw/bh).
    const handle = card.createDiv({ cls: "folio-bb-resize" });
    handle.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation(); // don't start a card move
      this._moved = true;  // suppress the click-to-edit that follows
      const sx = e.clientX, sy = e.clientY;
      const ow = card.offsetWidth, oh = card.offsetHeight;
      const onMove = (ev) => {
        card.style.width = Math.max(160, ow + (ev.clientX - sx)) + "px";
        card.style.minHeight = Math.max(80, oh + (ev.clientY - sy)) + "px";
      };
      const onUp = async () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        const bw = parseFloat(card.style.width) || CARD_W;
        const bh = parseFloat(card.style.minHeight) || CARD_H;
        await this.plugin.outlineEditorService.updateBeat(this._book, beat.id, { bw, bh });
        this.syncStrip();
        setTimeout(() => { this._moved = false; }, 0);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    card.addEventListener("click", () => { if (!this._moved) this.editBeat(beat); });
  }

  cardPointer(card, beat) {
    card.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this._moved = false;
      const sx = e.clientX, sy = e.clientY;
      // Read the CURRENT position (not a render-time value) so repeated drags
      // continue from where the card actually is.
      const bx = parseFloat(card.style.left) || 0;
      const by = parseFloat(card.style.top) || 0;
      const onMove = (ev) => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { this._moved = true; card.addClass("is-dragging"); }
        card.style.left = Math.max(0, bx + dx) + "px";
        card.style.top = Math.max(0, by + dy) + "px";
      };
      const onUp = async () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        card.removeClass("is-dragging");
        if (!this._moved) return;
        const nbx = parseFloat(card.style.left) || 0;
        const nby = parseFloat(card.style.top) || 0;
        await this.plugin.outlineEditorService.updateBeat(this._book, beat.id, { bx: nbx, by: nby });
        this.syncStrip();
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  editBeat(beat) {
    const modal = new BeatModal(this.plugin.app, {
      beat: { ...beat },
      lanes: this._outline.lanes,
      onSave: async (patch) => { await this.plugin.outlineEditorService.updateBeat(this._book, beat.id, patch); await this.render(); this.syncStrip(); },
      onDelete: async () => { await this.plugin.outlineEditorService.removeBeat(this._book, beat.id); await this.render(); this.syncStrip(); },
      onSend: (b) => this.plugin.sendBeatTextToScript(this._book, b),
    });
    modal.open();
  }

  async addBeat() {
    if (!this._book) return;
    await this.plugin.outlineEditorService.addBeat(this._book, { title: "New beat", lane: 0 });
    await this.render();
    this.syncStrip();
  }

  syncStrip() {
    try { this.plugin.timelineBand && this.plugin.timelineBand.refresh(true); } catch (e) { /* ignore */ }
  }

  renderEmpty(el, title, subtitle) {
    const empty = el.createDiv({ cls: "folio-bb-empty" });
    const icon = empty.createDiv({ cls: "folio-bb-empty-icon" });
    try { setIcon(icon, "layout-dashboard"); } catch (e) {}
    empty.createDiv({ cls: "folio-bb-empty-title", text: title });
    empty.createDiv({ cls: "folio-bb-empty-subtitle", text: subtitle });
  }
}
