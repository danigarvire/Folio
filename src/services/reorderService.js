/**
 * Reorder service (apply layer)
 *
 * Turns a "move Unit X to before Unit Y" intent into the right edits and applies
 * them, then leaves the caller to re-derive the Spine (views rebuild on the
 * vault/​config change). Uses the pure primitives in reorder.js for all text
 * surgery; this layer only handles I/O, the open-editor seam, and dispatch.
 *
 * Editor seam (spec §7/§13):
 *  - Reads prefer the OPEN EDITOR's buffer over disk, so an in-flight unsaved
 *    edit is respected rather than clobbered.
 *  - Writes to an open file go through editor.transaction (one atomic undo step,
 *    cursor preserved by Obsidian); writes to closed files use vault.process
 *    (atomic) with a vault.modify fallback.
 *  - Spans are re-parsed from the freshly-read text right before editing — the
 *    pre-built Spine is used only to decide which files/Units are involved.
 */

import { parseUnits } from './parseUnits.js';
import {
  moveUnitWithinText,
  removeUnitFromText,
  insertBlockBeforeUnit,
} from './reorder.js';

export class ReorderService {
  constructor(app, spineService, treeService) {
    this.app = app;
    this.spineService = spineService;
    this.treeService = treeService;
  }

  fullPath(book, rel) { return `${book.path}/${rel}`; }

  /** The Editor for an open markdown leaf showing `path`, or null. */
  findOpenEditor(path) {
    try {
      const leaves = this.app.workspace.getLeavesOfType('markdown');
      for (const leaf of leaves) {
        const view = leaf.view;
        if (view && view.file && view.file.path === path && view.editor) return view.editor;
      }
    } catch (e) { /* best effort */ }
    return null;
  }

  /** Read current text, preferring the open editor buffer over disk. */
  async readText(book, rel) {
    const path = this.fullPath(book, rel);
    const editor = this.findOpenEditor(path);
    if (editor) return editor.getValue();
    const file = this.app.vault.getAbstractFileByPath(path);
    return file ? await this.app.vault.read(file) : '';
  }

  /** Write text atomically; through the editor when the file is open. */
  async writeText(book, rel, text) {
    const path = this.fullPath(book, rel);
    const editor = this.findOpenEditor(path);
    if (editor) {
      const last = editor.lastLine();
      const end = { line: last, ch: editor.getLine(last).length };
      editor.transaction({ changes: [{ from: { line: 0, ch: 0 }, to: end, text }] });
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) return;
    if (typeof this.app.vault.process === 'function') await this.app.vault.process(file, () => text);
    else await this.app.vault.modify(file, text);
  }

  /**
   * Move by Spine position rather than id — the natural entry point for drag UI.
   * Spine order is stable across id assignment (adding a block id never reorders
   * Units), so the caller can capture indices at render time. Assigns missing ids
   * first, then delegates to applyMove.
   * @param {number} fromIndex 0-based Spine index of the dragged Unit
   * @param {number|null} beforeIndex index to land before, or null for the end
   */
  async applyMoveByIndex(book, cfg, profile, fromIndex, beforeIndex) {
    await this.spineService.assignIdsForProject(book, cfg, profile);
    const spine = await this.spineService.buildSpine(book, cfg, profile);
    const from = spine[fromIndex];
    if (!from) return { ok: false, reason: 'from-not-found' };
    if (!from.id) return { ok: false, reason: 'no-id' }; // unanchorable Unit (no body line)
    const before = beforeIndex == null || beforeIndex < 0 || beforeIndex >= spine.length ? null : spine[beforeIndex];
    if (before && before.id === from.id) return { ok: true, kind: 'noop' };
    return this.applyMove(book, cfg, profile, from.id, before ? before.id : null);
  }

  /**
   * Move the Unit with id `fromId` so it sits immediately before the Unit with
   * id `beforeId` (or to the end of the project when `beforeId` is null).
   * @returns {Promise<{ok:boolean, kind?:string, reason?:string}>}
   */
  async applyMove(book, cfg, profile, fromId, beforeId) {
    if (fromId === beforeId) return { ok: true, kind: 'noop' };

    const spine = await this.spineService.buildSpine(book, cfg, profile);
    const fromUnit = spine.find((u) => u.id === fromId);
    const beforeUnit = beforeId ? spine.find((u) => u.id === beforeId) : null;
    if (!fromUnit) return { ok: false, reason: 'from-not-found' };
    if (beforeId && !beforeUnit) return { ok: false, reason: 'before-not-found' };

    const counts = new Map();
    for (const u of spine) counts.set(u.file, (counts.get(u.file) || 0) + 1);
    const unitsInFile = (f) => counts.get(f) || 0;
    const fromWhole = fromUnit.synthetic || unitsInFile(fromUnit.file) === 1;

    // Tree move: a whole-file Unit reordered at a file boundary (before another
    // single-file Unit, or to the very end). No prose is touched.
    const targetWhole = !beforeUnit || unitsInFile(beforeUnit.file) === 1;
    if (fromWhole && targetWhole) {
      if (beforeUnit) {
        const ok = await this.treeService.reorderTreeNodes(book, fromUnit.fileNodeId, beforeUnit.fileNodeId, 'before');
        return { ok: !!ok, kind: 'tree' };
      }
      const last = [...spine].reverse().find((u) => u.fileNodeId !== fromUnit.fileNodeId);
      if (!last) return { ok: true, kind: 'noop' };
      const ok = await this.treeService.reorderTreeNodes(book, fromUnit.fileNodeId, last.fileNodeId, 'after');
      return { ok: !!ok, kind: 'tree' };
    }

    // Text move. Resolve the destination file + in-file target. "Move to end"
    // (beforeUnit null) lands at the end of the project's last file.
    const dstRel = beforeUnit ? beforeUnit.file : spine[spine.length - 1].file;
    const beforeDstId = beforeUnit ? beforeUnit.id : null;

    if (dstRel === fromUnit.file) {
      const text = await this.readText(book, fromUnit.file);
      const units = parseUnits(text, profile);
      const from = units.find((u) => u.id === fromId);
      const before = beforeDstId ? units.find((u) => u.id === beforeDstId) : null;
      if (!from || (beforeDstId && !before)) return { ok: false, reason: 'stale-spans' };
      await this.writeText(book, fromUnit.file, moveUnitWithinText(text, from, before));
      return { ok: true, kind: 'within-file' };
    }

    const srcText = await this.readText(book, fromUnit.file);
    const dstText = await this.readText(book, dstRel);
    const from = parseUnits(srcText, profile).find((u) => u.id === fromId);
    const before = beforeDstId ? parseUnits(dstText, profile).find((u) => u.id === beforeDstId) : null;
    if (!from || (beforeDstId && !before)) return { ok: false, reason: 'stale-spans' };
    const { text: newSrc, block } = removeUnitFromText(srcText, from);
    const newDst = insertBlockBeforeUnit(dstText, block, before); // before null = end of dst
    await this.writeText(book, dstRel, newDst);
    await this.writeText(book, fromUnit.file, newSrc);
    return { ok: true, kind: 'cross-file' };
  }
}
