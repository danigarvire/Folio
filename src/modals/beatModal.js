import { Modal } from "obsidian";

// A small palette for beats (hex; matches the status dots plus a few extras).
const COLORS = [
  { hex: null, name: "None" },
  { hex: "#e0a23b", name: "Amber" },
  { hex: "#4a8fe0", name: "Blue" },
  { hex: "#3fa45b", name: "Green" },
  { hex: "#c0504d", name: "Red" },
  { hex: "#8e6fc7", name: "Purple" },
  { hex: "#9aa0a6", name: "Grey" },
];

/**
 * Edit a planning beat: title, notes, goal, colour — plus actions to send the
 * beat's text to the script (a one-way kickoff) or delete it.
 */
export class BeatModal extends Modal {
  constructor(app, { beat, lanes, onSave, onSend, onDelete }) {
    super(app);
    this.beat = beat;
    this.lanes = lanes || [];
    this.onSave = onSave;
    this.onSend = onSend;
    this.onDelete = onDelete;
    this.color = beat.color || null;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Beat" });

    const titleInput = contentEl.createEl("input", { type: "text", placeholder: "Title (e.g. First Day)" });
    titleInput.value = this.beat.title || "";
    titleInput.style.width = "100%";

    const goalInput = contentEl.createEl("input", { type: "text", placeholder: "Goal (e.g. 1–2 pages)" });
    goalInput.value = this.beat.goal || "";
    goalInput.style.width = "100%";
    goalInput.style.marginTop = "8px";

    const notes = contentEl.createEl("textarea", { placeholder: "Notes / description…" });
    notes.value = this.beat.notes || "";
    notes.style.width = "100%";
    notes.style.minHeight = "120px";
    notes.style.marginTop = "8px";

    // Lane selector (move the beat between outline lanes).
    let laneSelect = null;
    if (this.lanes.length > 1) {
      laneSelect = contentEl.createEl("select");
      laneSelect.style.width = "100%";
      laneSelect.style.marginTop = "8px";
      this.lanes.forEach((lane, i) => {
        const opt = laneSelect.createEl("option", { text: lane.name || `Outline ${i + 1}`, value: String(i) });
        if ((this.beat.lane || 0) === i) opt.selected = true;
      });
    }
    this._laneSelect = laneSelect;

    // Colour swatches
    const swatchRow = contentEl.createDiv({ cls: "folio-beat-swatches" });
    const swatches = [];
    COLORS.forEach((c) => {
      const sw = swatchRow.createDiv({ cls: "folio-beat-swatch" });
      sw.style.background = c.hex || "transparent";
      if (!c.hex) sw.setText("∅");
      sw.setAttribute("title", c.name);
      if ((this.color || null) === c.hex) sw.addClass("is-selected");
      sw.addEventListener("click", () => {
        this.color = c.hex;
        swatches.forEach((s) => s.removeClass("is-selected"));
        sw.addClass("is-selected");
      });
      swatches.push(sw);
    });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const del = actions.createEl("button", { text: "Delete" });
    del.addEventListener("click", () => { this.close(); this.onDelete && this.onDelete(); });
    const send = actions.createEl("button", { text: "Send to script" });
    send.addEventListener("click", () => {
      this.commitInto();
      this.close();
      this.onSend && this.onSend({ ...this.beat });
    });
    const save = actions.createEl("button", { text: "Save", cls: "mod-cta" });
    save.addEventListener("click", () => {
      this.commitInto();
      this.close();
      const patch = { title: this.beat.title, goal: this.beat.goal, notes: this.beat.notes, color: this.color };
      if (this._laneSelect) patch.lane = Number(this._laneSelect.value);
      this.onSave && this.onSave(patch);
    });

    this._titleInput = titleInput;
    this._goalInput = goalInput;
    this._notes = notes;
    titleInput.focus();
  }

  commitInto() {
    this.beat.title = (this._titleInput.value || "").trim() || "New beat";
    this.beat.goal = (this._goalInput.value || "").trim();
    this.beat.notes = this._notes.value || "";
  }
}
