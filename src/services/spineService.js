/**
 * Spine service
 *
 * The Spine is the ordered list of Units for a project. It is NOT stored — it is
 * derived as a pure function of (structure.tree order ⊕ in-document heading
 * order). One deterministic source of order, zero duplication.
 *
 *   order = tree order (between files) ⊕ heading order (within a file)
 *
 * `buildSpine` is pure: it walks the tree and delegates per-file parsing to an
 * injected `readUnits(node)` so it can be unit-tested without Obsidian. The
 * production path (SpineService.buildSpine) implements `readUnits` from the
 * metadataCache, the same source outlineService already uses.
 *
 * A file with no unit-role headings degrades to a single synthetic Unit spanning
 * the whole file — preserving today's one-file-per-scene behaviour.
 */

import { parseUnits, ensureUnitIds, parseHeadings, parseBlockId, extractBeats } from './parseUnits.js';

/** Generate a short, collision-resistant Unit id (block id; runtime, not the pure core). */
function generateUnitId() {
  return 'folio' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Walk the structure tree in order and flatten every file node's Units.
 * Pure — no vault access.
 *
 * @param {object} cfg project config (uses cfg.structure.tree)
 * @param {{headingRoles:object, unitRole:string, grouperTiers:object}} profile
 * @param {(node:object)=>Array} readUnits returns the Units for a file node, in
 *   document order, each {role,title,startLine,endLine,groups}. May be empty.
 * @returns {Array<object>} the Spine: Units enriched with file + status context.
 */
export function buildSpine(cfg, profile, readUnits) {
  const tree = cfg?.structure?.tree || [];
  const sortByOrder = (nodes) => [...nodes].sort((a, b) => (a.order || 0) - (b.order || 0));
  const spine = [];

  const visit = (nodes) => {
    for (const node of sortByOrder(nodes)) {
      if (node.type === 'group') {
        if (node.children) visit(node.children);
      } else if (node.type === 'file') {
        appendFileUnits(node);
      }
      // canvas / other node types are skipped
    }
  };

  const appendFileUnits = (node) => {
    const status = node.status || (node.completed ? 'final' : null);
    const units = readUnits(node) || [];
    if (units.length === 0) {
      // No unit-role heading: the file itself is one Unit (legacy behaviour).
      spine.push({
        role: profile.unitRole,
        title: node.title || node.path,
        file: node.path,
        fileNodeId: node.id,
        startLine: 0,
        endLine: null,
        groups: [],
        status,
        synthetic: true,
      });
      return;
    }
    for (const u of units) {
      spine.push({ ...u, file: node.path, fileNodeId: node.id, status });
    }
  };

  visit(tree);
  return spine;
}

export class SpineService {
  constructor(app) {
    this.app = app;
  }

  /** The Editor for an open markdown leaf showing `path`, or null. */
  openEditor(path) {
    try {
      for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
        const v = leaf.view;
        if (v && v.file && v.file.path === path && v.editor) return v.editor;
      }
    } catch (e) { /* best effort */ }
    return null;
  }

  /**
   * Read a file's current text, preferring the OPEN EDITOR's buffer over disk so
   * the Spine reflects exactly what the writer sees (avoids disk/buffer drift —
   * the source of band-vs-document desync after a reorder). Returns null for a
   * missing / non-markdown file.
   */
  async readText(fullPath) {
    const ed = this.openEditor(fullPath);
    if (ed) return ed.getValue();
    const file = this.app.vault.getAbstractFileByPath(fullPath);
    return file && file.extension === 'md' ? await this.app.vault.read(file) : null;
  }

  /**
   * Build the Spine for a project (production path). Reads each file's live text
   * so Units carry their stable id and accurate span lines — both required by the
   * beat board (id matching) and reorder (span moves).
   * @param {{path:string}} book
   * @param {object} cfg project config
   * @param {{headingRoles:object, unitRole:string, grouperTiers:object}} profile
   * @returns {Promise<Array<object>>}
   */
  async buildSpine(book, cfg, profile) {
    const texts = new Map();
    const fileNodes = [];
    const walk = (nodes) => {
      for (const n of nodes || []) {
        if (n.type === 'file') fileNodes.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(cfg?.structure?.tree || []);
    for (const node of fileNodes) {
      const text = await this.readText(`${book.path}/${node.path}`);
      if (text != null) texts.set(node.path, text);
    }
    const readUnits = (node) => {
      const text = texts.get(node.path);
      if (text == null) return [];
      const lines = text.split("\n");
      const wordsIn = (s, e) =>
        lines.slice(s, e == null ? lines.length : e)
          .join(" ")
          .replace(/\^folio[A-Za-z0-9]+/g, " ")  // drop our id anchors
          .replace(/[#>*_`-]/g, " ")               // drop common markdown marks
          .split(/\s+/).filter(Boolean).length;
      let units = parseUnits(text, profile);
      if (units.length) {
        for (const u of units) { u.fromHeading = true; u.words = wordsIn(u.startLine, u.endLine); }
        return units;
      }
      // No unit-role (scene) headings: the whole FILE is one unit. Title it by
      // its first heading if it has one (book/essay with `# Chapter`), else by
      // its filename (prose chapters whose title is the note name).
      const headings = parseHeadings(text);
      const fromHeading = headings.length > 0;
      let id = null;
      for (const l of lines) { const b = parseBlockId(l); if (b) { id = b; break; } }
      const startLine = fromHeading ? headings[0].line : 0;
      const title = fromHeading ? headings[0].text : (node.title || node.path);
      const unit = { role: profile.unitRole, title, startLine, endLine: lines.length, groups: [], id, fromHeading, beats: extractBeats(lines, { startLine, endLine: lines.length }) };
      unit.words = wordsIn(startLine, lines.length);
      return [unit];
    };
    return buildSpine(cfg, profile, readUnits);
  }

  /**
   * Lazily assign stable ids to any Units in a single file that lack one. Writes
   * through the open editor (one transaction) when the file is open, else atomic
   * via vault.process with a read/modify fallback. Returns the number assigned.
   */
  async assignMissingIds(book, node, profile) {
    const fullPath = `${book.path}/${node.path}`;
    const ed = this.openEditor(fullPath);
    if (ed) {
      const res = ensureUnitIds(ed.getValue(), profile, generateUnitId);
      if (res.assignedCount) {
        const last = ed.lastLine();
        ed.transaction({ changes: [{ from: { line: 0, ch: 0 }, to: { line: last, ch: ed.getLine(last).length }, text: res.text }] });
      }
      return res.assignedCount;
    }
    const file = this.app.vault.getAbstractFileByPath(fullPath);
    if (!file || file.extension !== 'md') return 0;
    let count = 0;
    const apply = (data) => {
      const res = ensureUnitIds(data, profile, generateUnitId);
      count = res.assignedCount;
      return count ? res.text : data;
    };
    if (typeof this.app.vault.process === 'function') {
      await this.app.vault.process(file, apply);
    } else {
      const data = await this.app.vault.read(file);
      const next = apply(data);
      if (next !== data) await this.app.vault.modify(file, next);
    }
    return count;
  }

  /**
   * Walk a project's tree and assign missing ids across every markdown file.
   * Call before a feature that persists per-Unit state (beat board, reorder).
   * @returns {Promise<number>} total ids assigned
   */
  async assignIdsForProject(book, cfg, profile) {
    const files = [];
    const walk = (nodes) => {
      for (const n of nodes || []) {
        if (n.type === 'file') files.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(cfg?.structure?.tree || []);
    let total = 0;
    for (const node of files) total += await this.assignMissingIds(book, node, profile);
    return total;
  }
}
