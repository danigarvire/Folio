/**
 * Screenplay Paged Editor (CodeMirror 6)
 *
 * A continuous, natively-typed editor (the Final Draft model): one flowing text
 * surface — instant typing, real undo/selection/IME — with two decoration layers:
 *
 *   1. Line styling   — each line is classified (scene / character / dialogue /
 *      parenthetical / transition / section / action) and given a CSS class that
 *      applies the standard indents, case and Courier face. Heading markers
 *      (`#`, `##`…) are visually hidden so it reads as a script, not markdown.
 *   2. Page breaks    — block widgets inserted at page boundaries, computed from
 *      a per-line "row cost" (constant Courier line height + element spacing), so
 *      pagination spans the whole document without measuring off-screen geometry.
 *
 * Editing and pagination are decoupled: typing never re-renders the document; the
 * decoration fields recompute from the doc and the page widgets just reflow.
 *
 * CM6 modules are provided by Obsidian at runtime (externalised in the build).
 */

import { EditorView, Decoration, WidgetType, keymap } from "@codemirror/view";
import { EditorState, StateField, StateEffect } from "@codemirror/state";
import { history, historyKeymap, defaultKeymap } from "@codemirror/commands";
import { SCREENPLAY_PROFILE, PROSE_PROFILE, PAGE_SIZES, parseScreenplayBlocks, parseProseBlocks, paginate, pageBreakLines, pageOffsetOfLine } from "../services/layoutModel.js";

const PX_PER_PT = 96 / 72; // render points at 96dpi

/**
 * The inter-page gap widget: the ending page's BOTTOM margin (white) + a desk gap
 * + the next page's TOP margin (white, with its page number), so each page has the
 * real ~1in top/bottom whitespace — like the printed/exported page.
 */
class PageBreakWidget extends WidgetType {
  constructor(pageNum) { super(); this.pageNum = pageNum; }
  eq(other) { return other.pageNum === this.pageNum; }
  toDOM() {
    const wrap = document.createElement("div");
    wrap.className = "folio-cm-pagebreak";
    wrap.appendChild(this._part("folio-cm-pb-bottom"));      // bottom margin of page N
    wrap.appendChild(this._part("folio-cm-pb-gap"));         // desk between sheets
    const top = this._part("folio-cm-pb-top");               // top margin of page N+1
    const label = document.createElement("span");
    label.className = "folio-cm-pb-label";
    label.textContent = this.pageNum + ".";
    top.appendChild(label);
    wrap.appendChild(top);
    return wrap;
  }
  _part(cls) { const d = document.createElement("div"); d.className = cls; return d; }
  ignoreEvent() { return true; }
}

/** Fills the unused bottom of the LAST page so the final sheet is full height. */
class PageFillWidget extends WidgetType {
  constructor(px) { super(); this.px = Math.round(px); }
  eq(other) { return other.px === this.px; }
  toDOM() { const d = document.createElement("div"); d.className = "folio-cm-pagefill"; d.style.height = this.px + "px"; return d; }
  ignoreEvent() { return true; }
}

const FOLIO_ANCHOR = /\s*\^folio[A-Za-z0-9]+\s*$/;

/** Hide a leading YAML frontmatter block; returns the first body line (1-indexed). */
function hideFrontmatter(doc, decos) {
  if (doc.lines >= 1 && doc.line(1).text.trim() === "---") {
    let close = 0;
    for (let i = 2; i <= doc.lines; i++) { if (doc.line(i).text.trim() === "---") { close = i; break; } }
    if (close) {
      const to = close < doc.lines ? doc.line(close + 1).from : doc.line(close).to;
      decos.push(Decoration.replace({ block: true }).range(0, to));
      return close + 1;
    }
  }
  return 1;
}

/** Fill the last page to full height so the final sheet isn't cut short. */
function fillLastPage(doc, pages, contentHeightPt, decos) {
  const lastPage = pages[pages.length - 1];
  if (!lastPage) return;
  const fillPt = contentHeightPt - (lastPage.heightPt || 0);
  if (fillPt > 2) decos.push(Decoration.widget({ widget: new PageFillWidget(fillPt * PX_PER_PT), block: true, side: 1 }).range(doc.line(doc.lines).to));
}

/**
 * PROSE decorations: chapter/section/paragraph styling + hidden heading markers +
 * page breaks, via the shared engine with PROSE_PROFILE.
 */
function buildProseDecorations(state, profile, pageOffset = 0) {
  const decos = [];
  const doc = state.doc;
  const blocks = parseProseBlocks(doc.toString());
  const { pages, contentHeightPt } = paginate(blocks, profile);
  const breakAt = new Map();
  for (let k = 1; k < pages.length; k++) { const f = pages[k].blocks[0]; if (f && f.startLine != null) breakAt.set(f.startLine, k + 1); }
  const lineBlock = new Map();
  for (const b of blocks) for (let ln = b.startLine; ln <= b.endLine; ln++) lineBlock.set(ln, b);

  const startLine = hideFrontmatter(doc, decos);
  for (let i = startLine; i <= doc.lines; i++) {
    const line = doc.line(i);
    const idx = i - 1;
    if (breakAt.has(idx)) decos.push(Decoration.widget({ widget: new PageBreakWidget(pageOffset + breakAt.get(idx)), block: true, side: -1 }).range(line.from));
    const b = lineBlock.get(idx);
    if (!b) continue; // blank line
    decos.push(Decoration.line({ class: `folio-cm-line folio-cm-prose-${b.type}` }).range(line.from));
    if ((b.type === "chapter" || b.type === "section") && idx === b.startLine) {
      const m = /^(#{1,6})\s+/.exec(line.text);
      if (m) decos.push(Decoration.replace({}).range(line.from, line.from + m[0].length));
    }
  }
  fillLastPage(doc, pages, contentHeightPt, decos);
  return Decoration.set(decos, true);
}

/**
 * SCREENPLAY decorations: per-line styling + hidden markers + page breaks.
 * Page breaks come from the SHARED engine (parseScreenplayBlocks → pageBreakLines),
 * so the editor and the outline strip agree on page numbers and boundaries.
 */
function buildScreenplayDecorations(state, profile, pageOffset = 0) {
  const decos = [];
  const doc = state.doc;
  const text = doc.toString();

  // Canonical pagination: one block per source line (keepBlanks → spacers).
  const blocks = parseScreenplayBlocks(text, { keepBlanks: true });
  const blockByLine = new Map();
  for (const b of blocks) blockByLine.set(b.startLine, b);
  const { pages, contentHeightPt } = paginate(blocks, profile);
  const breakAt = new Map(); // line index → local page number
  for (let k = 1; k < pages.length; k++) {
    const first = pages[k].blocks[0];
    if (first && first.startLine != null) breakAt.set(first.startLine, k + 1);
  }

  // Hide a leading YAML frontmatter block entirely.
  let startLine = 1;
  if (doc.lines >= 1 && doc.line(1).text.trim() === "---") {
    let close = 0;
    for (let i = 2; i <= doc.lines; i++) { if (doc.line(i).text.trim() === "---") { close = i; break; } }
    if (close) {
      const to = close < doc.lines ? doc.line(close + 1).from : doc.line(close).to;
      decos.push(Decoration.replace({ block: true }).range(0, to));
      startLine = close + 1;
    }
  }

  for (let i = startLine; i <= doc.lines; i++) {
    const line = doc.line(i);
    const idx = i - 1; // 0-indexed source line
    const block = blockByLine.get(idx) || { type: "action", prefix: "" };
    const prefixLen = (block.prefix || "").length;

    if (breakAt.has(idx)) {
      decos.push(Decoration.widget({ widget: new PageBreakWidget(pageOffset + breakAt.get(idx)), block: true, side: -1 }).range(line.from));
    }
    decos.push(Decoration.line({ class: `folio-cm-line folio-cm-${block.type}` }).range(line.from));
    if (prefixLen > 0) decos.push(Decoration.replace({}).range(line.from, line.from + prefixLen));
    const a = FOLIO_ANCHOR.exec(line.text);
    if (a && prefixLen === 0) { const f = line.from + a.index; decos.push(Decoration.replace({}).range(f, f + a[0].length)); }
  }

  // Fill the unused bottom of the last page so the final sheet is full height
  // (a continuous column would otherwise stop right after the last line).
  const lastPage = pages[pages.length - 1];
  if (lastPage) {
    const fillPt = contentHeightPt - (lastPage.heightPt || 0);
    if (fillPt > 2) {
      const end = doc.line(doc.lines).to;
      decos.push(Decoration.widget({ widget: new PageFillWidget(fillPt * PX_PER_PT), block: true, side: 1 }).range(end));
    }
  }
  return Decoration.set(decos, true);
}

/** A StateField that keeps the decoration set in sync with the document. */
function pagedDecorationField(profile, pageOffset) {
  const build = profile && profile.id === "prose" ? buildProseDecorations : buildScreenplayDecorations;
  return StateField.define({
    create(state) { return build(state, profile, pageOffset); },
    update(value, tr) { return tr.docChanged ? build(tr.state, profile, pageOffset) : value; },
    provide: (f) => EditorView.decorations.from(f),
  });
}

/** A CM theme that turns the editor into a centered paper column (per profile geometry). */
function paperTheme(profile) {
  const fontPx = profile.font.sizePt * PX_PER_PT;
  const size = PAGE_SIZES[profile.page.size] || PAGE_SIZES.letter;
  const m = profile.page.margins;
  return EditorView.theme({
    "&": { backgroundColor: "transparent" },
    ".cm-scroller": { fontFamily: profile.font.family, fontSize: fontPx + "px", lineHeight: String(profile.font.lineHeight), justifyContent: "center" },
    ".cm-content": {
      caretColor: "var(--text-normal)",
      width: (size.width * PX_PER_PT) + "px",
      padding: `${m.top * PX_PER_PT}px ${m.right * PX_PER_PT}px ${m.bottom * PX_PER_PT}px ${m.left * PX_PER_PT}px`,
      // Exposed so the page-break widget bleeds exactly to the sheet edges per profile.
      "--folio-pad-left": (m.left * PX_PER_PT) + "px",
      "--folio-pad-right": (m.right * PX_PER_PT) + "px",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text-normal)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "var(--text-selection)" },
  });
}

/**
 * Create a paged screenplay editor.
 * @param {HTMLElement} parent
 * @param {string} doc initial text
 * @param {{ onChange?: (text:string)=>void, profile?: object }} opts
 * @returns {EditorView}
 */
export function createPagedEditor(parent, doc, opts = {}) {
  const profile = opts.profile || SCREENPLAY_PROFILE;
  const pageOffset = opts.pageOffset || 0; // pages before this file in the draft
  let debounce = null;
  const onChange = opts.onChange || (() => {});
  const state = EditorState.create({
    doc: doc || "",
    extensions: [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      pagedDecorationField(profile, pageOffset),
      paperTheme(profile),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) {
          clearTimeout(debounce);
          const text = u.state.doc.toString();
          debounce = setTimeout(() => onChange(text), 400);
        }
        if ((u.selectionSet || u.docChanged) && opts.onCursor) {
          const pos = u.state.selection.main.head;
          const line = u.state.doc.lineAt(pos).number - 1; // 0-indexed source line
          let pageFraction = null;
          try {
            const blocks = parseScreenplayBlocks(u.state.doc.toString(), { keepBlanks: true });
            const local = pageOffsetOfLine(blocks, profile, line);
            if (local != null) pageFraction = pageOffset + local; // global page position
          } catch (e) { /* keep null */ }
          opts.onCursor(line, pageFraction);
        }
      }),
    ],
  });
  return new EditorView({ state, parent });
}

/* ======================================================================
 * Native-editor pagination
 *
 * A CM6 editor extension (registered via plugin.registerEditorExtension) that
 * draws page-break markers in OBSIDIAN'S OWN editor for screenplay files (those
 * with the md-screenplay / folio-screenplay cssclass). It uses the SAME engine
 * as Paged View, the strip and export, so page numbers stay consistent. It only
 * adds break widgets — Obsidian's live-preview + the md-screenplay snippet keep
 * doing the styling. (Per-file page numbering; reading mode isn't a CM editor.)
 * ==================================================================== */

// Whether the native editor shows page breaks (Normal view) or not (Speed view).
let nativePaginationOn = true;
export function setNativePaginationEnabled(on) { nativePaginationOn = !!on; }
/** Dispatch this effect to a CM EditorView to force the page-break field to recompute. */
export const togglePaginationEffect = StateEffect.define();

/** The doc's YAML frontmatter block ('' if none). */
function frontmatter(text) {
  const m = /^---\s*\r?\n([\s\S]*?)\r?\n---/.exec(text || "");
  return m ? m[1] : "";
}
/** True if the doc declares the screenplay cssclass. */
function hasScreenplayClass(text) {
  return /(?:cssclass|cssclasses)\s*:[\s\S]*?(md-screenplay|folio-screenplay)/.test(frontmatter(text));
}
/** True if the doc is a Folio manuscript file (any template adds projectType). */
function hasProjectType(text) {
  return /(^|\n)\s*projectType\s*:/.test(frontmatter(text));
}

/**
 * Final Draft "Normal View" page break: a boundary rule + a real inter-page gap
 * (page bottom margin + page top margin) with the next page's number at top-right,
 * so the flow stays continuous but pages are clearly delimited.
 */
class NativePageBreakWidget extends WidgetType {
  constructor(pageNum) { super(); this.pageNum = pageNum; }
  eq(other) { return other.pageNum === this.pageNum; }
  toDOM() {
    const wrap = document.createElement("div");
    wrap.className = "folio-native-pagebreak";
    wrap.appendChild(this._div("folio-native-pb-rule"));        // page boundary line
    const gap = this._div("folio-native-pb-gap");               // bottom + top margins
    const num = this._div("folio-native-pb-num");
    num.textContent = this.pageNum + ".";
    gap.appendChild(num);
    wrap.appendChild(gap);
    return wrap;
  }
  _div(cls) { const d = document.createElement("div"); d.className = cls; return d; }
  ignoreEvent() { return true; }
}

function nativePageDecorations(state) {
  if (!nativePaginationOn) return Decoration.none; // Normal (page breaks off)
  const text = state.doc.toString();
  // md-screenplay → screenplay layout; otherwise a Folio manuscript file → prose.
  // Random vault notes (no cssclass, no projectType) are left alone.
  const screenplay = hasScreenplayClass(text);
  if (!screenplay && !hasProjectType(text)) return Decoration.none;
  const profile = screenplay ? SCREENPLAY_PROFILE : PROSE_PROFILE;
  let breakAt;
  try {
    const blocks = screenplay
      ? parseScreenplayBlocks(text, { keepBlanks: true })
      : parseProseBlocks(text);
    breakAt = pageBreakLines(blocks, profile); // 0-indexed line → page number
  } catch (e) { return Decoration.none; }
  const decos = [];
  for (const [line, num] of breakAt) {
    if (line < 0 || line + 1 > state.doc.lines) continue;
    const pos = state.doc.line(line + 1).from;
    decos.push(Decoration.widget({ widget: new NativePageBreakWidget(num), block: true, side: -1 }).range(pos));
  }
  return Decoration.set(decos, true);
}

/** The editor extension to register on Obsidian's markdown editors. */
export function screenplayNativePagination() {
  return StateField.define({
    create: (state) => nativePageDecorations(state),
    update: (value, tr) => (tr.docChanged || tr.effects.some((e) => e.is(togglePaginationEffect)) ? nativePageDecorations(tr.state) : value),
    provide: (f) => EditorView.decorations.from(f),
  });
}
