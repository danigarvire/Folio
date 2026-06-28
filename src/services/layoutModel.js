/**
 * Layout model (pure)
 *
 * The shared page-layout engine behind BOTH the on-screen Paged View and the PDF
 * export, so "what you see paged = what you export". No DOM / Obsidian here.
 *
 * Pipeline:
 *   markdown ──parseDocumentBlocks──▶ typed, line-tracked blocks
 *   blocks + profile ──paginate──▶ pages of positioned blocks (real page count)
 *
 * A "block" is one typed line/paragraph carrying its SOURCE location
 * ({ file, startLine, endLine }) so an editable view can write edits back to the
 * exact place in the exact file. A "profile" is the single source of truth for
 * page geometry + per-element typography (indents, case, spacing) — the same
 * object the exporter consumes.
 *
 * All measurements are in POINTS (1in = 72pt) unless a name says otherwise.
 */

export const PT_PER_INCH = 72;
export const inToPt = (n) => n * PT_PER_INCH;

/** Page sizes in points. */
export const PAGE_SIZES = {
  letter: { width: inToPt(8.5), height: inToPt(11) },
  a4: { width: 595.28, height: 841.89 }, // 210×297mm
};

/**
 * Screenplay layout profile — US industry standard (Courier 12pt, US Letter).
 * Element margins are in INCHES from the page's content edge (inside page
 * margins). Width is derived: contentWidth − marginLeft − marginRight.
 *   cpi  = characters per inch for the monospace face (Courier 12pt = 10cpi)
 *   lines counted at 12pt single-spaced → ~55 lines/page (the classic metric).
 */
export const SCREENPLAY_PROFILE = {
  id: "screenplay",
  page: { size: "letter", margins: { top: inToPt(1), right: inToPt(1), bottom: inToPt(1), left: inToPt(1.5) } },
  font: { family: '"Courier New", Courier, monospace', sizePt: 12, lineHeight: 1, cpi: 10 },
  // Screenplay spacing comes from the literal blank lines in the markdown (kept as
  // "spacer" rows), so per-element spaceBefore/After is 0 — otherwise the space is
  // counted twice and pages inflate. marginLeft/marginRight are inches.
  elements: {
    spacer:       { marginLeft: 0,   marginRight: 0,   align: "left",  upper: false, spaceBefore: 0, spaceAfter: 0 },
    scene:        { marginLeft: 0,   marginRight: 0,   align: "left",  upper: true,  spaceBefore: 0, spaceAfter: 0, keepWithNext: true },
    action:       { marginLeft: 0,   marginRight: 0,   align: "left",  upper: false, spaceBefore: 0, spaceAfter: 0 },
    character:    { marginLeft: 2.0, marginRight: 0,   align: "left",  upper: true,  spaceBefore: 0, spaceAfter: 0, keepWithNext: true },
    parenthetical:{ marginLeft: 1.5, marginRight: 1.5, align: "left",  upper: false, spaceBefore: 0, spaceAfter: 0, keepWithNext: true },
    dialogue:     { marginLeft: 1.0, marginRight: 1.5, align: "left",  upper: false, spaceBefore: 0, spaceAfter: 0 },
    transition:   { marginLeft: 0,   marginRight: 0,   align: "right", upper: true,  spaceBefore: 0, spaceAfter: 0 },
    section:      { marginLeft: 0,   marginRight: 0,   align: "left",  upper: true,  spaceBefore: 0, spaceAfter: 0, bold: true },
  },
};

/**
 * Prose layout profile (novels/essays). Serif, page-margin based. cpi is an
 * approximation for a proportional face (rough but stable for an estimator;
 * the DOM-measured pass refines it later).
 */
export const PROSE_PROFILE = {
  id: "prose",
  page: { size: "letter", margins: { top: inToPt(1), right: inToPt(1), bottom: inToPt(1), left: inToPt(1) } },
  font: { family: "Georgia, 'Times New Roman', serif", sizePt: 12, lineHeight: 1.5, cpi: 14 },
  elements: {
    chapter:   { marginLeft: 0, marginRight: 0, align: "center", upper: false, spaceBefore: 4, spaceAfter: 2, bold: true, pageBreakBefore: true, sizeScale: 1.6 },
    section:   { marginLeft: 0, marginRight: 0, align: "left",   upper: false, spaceBefore: 1.5, spaceAfter: 0.5, bold: true, sizeScale: 1.15 },
    paragraph: { marginLeft: 0, marginRight: 0, align: "left",   upper: false, spaceBefore: 0, spaceAfter: 0, firstLineIndent: 0.3 },
    blockquote:{ marginLeft: 0.5, marginRight: 0.5, align: "left", upper: false, spaceBefore: 0.5, spaceAfter: 0.5 },
  },
};

export const LAYOUT_PRESETS = { screenplay: SCREENPLAY_PROFILE, prose: PROSE_PROFILE };

/** Deep-ish merge of profile overrides (page/font/elements) onto a preset. */
export function resolveProfile({ screenplay = false, overrides = null } = {}) {
  const base = screenplay ? SCREENPLAY_PROFILE : PROSE_PROFILE;
  if (!overrides) return base;
  return {
    ...base,
    page: { ...base.page, ...(overrides.page || {}), margins: { ...base.page.margins, ...((overrides.page || {}).margins || {}) } },
    font: { ...base.font, ...(overrides.font || {}) },
    elements: { ...base.elements, ...(overrides.elements || {}) },
  };
}

/** The usable content box of a profile's page, in points. */
export function contentBox(profile) {
  const size = PAGE_SIZES[profile.page.size] || PAGE_SIZES.letter;
  const m = profile.page.margins;
  return {
    width: size.width - m.left - m.right,
    height: size.height - m.top - m.bottom,
    pageWidth: size.width,
    pageHeight: size.height,
  };
}

/** Strip a trailing folio block id + trailing whitespace from a line. */
function cleanLine(raw) {
  return raw.replace(/\s+$/, "").replace(/\s\^folio[A-Za-z0-9]+$/, "");
}

/** Remove a leading YAML frontmatter block; returns { body, offset } (lines skipped). */
function splitFrontmatter(text) {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  if (lines[0] !== "---") return { lines, offset: 0 };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") return { lines: lines.slice(i + 1), offset: i + 1 };
  }
  return { lines, offset: 0 };
}

/**
 * Parse SCREENPLAY markdown into typed, line-tracked blocks. Mirrors
 * screenplayParser's role mapping (#scene ##character ###parenthetical
 * ####transition #####section; plain lines = action, or dialogue after a cue).
 * Each block carries its source line index for write-back.
 *
 * @param {string} text
 * @param {{file?:string}} ctx
 * @returns {Array<{type:string,text:string,file?:string,startLine:number,endLine:number}>}
 */
export function parseScreenplayBlocks(text, ctx = {}) {
  const { lines, offset } = splitFrontmatter(text);
  const keepBlanks = !!ctx.keepBlanks; // emit blank lines as editable spacer blocks (paged view)
  const out = [];
  let inDialogue = false;
  for (let i = 0; i < lines.length; i++) {
    const srcLine = offset + i;
    const line = cleanLine(lines[i]);
    if (line.trim() === "") {
      inDialogue = false;
      if (keepBlanks) out.push({ type: "spacer", text: "", raw: "", prefix: "", file: ctx.file, startLine: srcLine, endLine: srcLine });
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    // `text` is the display string (transformed); `raw`+`prefix` reconstruct the
    // exact source line for write-back: source line = prefix + raw.
    const mk = (type, text, raw, prefix) => ({ type, text, raw, prefix, file: ctx.file, startLine: srcLine, endLine: srcLine });
    if (!h) { out.push(mk(inDialogue ? "dialogue" : "action", line, line, "")); continue; }
    const marks = h[1];
    const t = h[2].trim();
    if (!t) continue;
    const level = marks.length;
    if (level === 1) { out.push(mk("scene", t.toUpperCase(), t, "# ")); inDialogue = false; }
    else if (level === 2) { out.push(mk("character", t.toUpperCase(), t, "## ")); inDialogue = true; }
    else if (level === 3) { const inner = t.replace(/^\(+|\)+$/g, "").trim(); out.push(mk("parenthetical", `(${inner})`, inner, "### ")); inDialogue = true; }
    else if (level === 4) { out.push(mk("transition", t.toUpperCase(), t, "#### ")); inDialogue = false; }
    else { out.push(mk("section", t, t, marks + " ")); inDialogue = false; }
  }
  return out;
}

/**
 * Parse PROSE markdown into typed, line-tracked blocks: headings become
 * chapter (h1/h2) or section (h3+); consecutive non-blank lines fold into one
 * paragraph (or blockquote). Tracks start/end source lines per block.
 */
export function parseProseBlocks(text, ctx = {}) {
  const { lines, offset } = splitFrontmatter(text);
  const out = [];
  let para = null; // { type, parts:[], prefix, startLine, endLine }
  const flush = () => {
    if (para) {
      const text = para.parts.join(" ");
      out.push({ type: para.type, text, raw: text, prefix: para.prefix, file: ctx.file, startLine: para.startLine, endLine: para.endLine });
      para = null;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const srcLine = offset + i;
    const line = cleanLine(lines[i]);
    if (line.trim() === "") { flush(); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      const t = h[2].trim();
      if (!t) continue;
      out.push({ type: h[1].length <= 2 ? "chapter" : "section", text: t, raw: t, prefix: h[1] + " ", file: ctx.file, startLine: srcLine, endLine: srcLine });
      continue;
    }
    const isQuote = /^>\s?/.test(line);
    const type = isQuote ? "blockquote" : "paragraph";
    const body = isQuote ? line.replace(/^>\s?/, "") : line;
    if (para && para.type === type) { para.parts.push(body); para.endLine = srcLine; }
    else { flush(); para = { type, parts: [body], prefix: isQuote ? "> " : "", startLine: srcLine, endLine: srcLine }; }
  }
  flush();
  return out;
}

/** Parse a document into blocks, dispatching by format. */
export function parseDocumentBlocks(text, { screenplay = false, file } = {}) {
  return screenplay ? parseScreenplayBlocks(text, { file }) : parseProseBlocks(text, { file });
}

/** Characters that fit on one line for an element, given the profile + content width. */
export function charsPerLine(profile, elementType) {
  const cb = contentBox(profile);
  const el = profile.elements[elementType] || profile.elements.action || profile.elements.paragraph || {};
  const widthIn = (cb.width / PT_PER_INCH) - (el.marginLeft || 0) - (el.marginRight || 0);
  const cpi = profile.font.cpi || 10;
  return Math.max(1, Math.floor(widthIn * cpi));
}

/**
 * Estimate a block's laid-out height in points (without page breaking).
 * lines = wrapped text lines; height = lines·lineStep + spaceBefore/After.
 */
export function blockMetrics(profile, block) {
  const el = profile.elements[block.type] || profile.elements.action || profile.elements.paragraph || {};
  const sizePt = profile.font.sizePt * (el.sizeScale || 1);
  const lineStep = sizePt * (profile.font.lineHeight || 1);
  const cpl = charsPerLine(profile, block.type);
  const textLines = String(block.text || "").split("\n");
  let wrapped = 0;
  for (const tl of textLines) wrapped += Math.max(1, Math.ceil(tl.length / cpl));
  const lineHeightPt = profile.font.sizePt * (profile.font.lineHeight || 1);
  const spaceBefore = (el.spaceBefore || 0) * lineHeightPt;
  const spaceAfter = (el.spaceAfter || 0) * lineHeightPt;
  return { lines: wrapped, textHeight: wrapped * lineStep, spaceBefore, spaceAfter, height: spaceBefore + wrapped * lineStep + spaceAfter, lineStep };
}

/**
 * Flow blocks into pages of the profile's content height.
 *
 * Rules (phase-1 estimator):
 *  - pageBreakBefore (e.g. prose chapter) starts a fresh page.
 *  - A block taller than a page is allowed to overflow (no mid-block split yet).
 *  - keepWithNext / orphan control: a heading-like block that would land at the
 *    very bottom with no room for a following line is pushed to the next page.
 *
 * @returns {{ pages: Array<{index:number, blocks:Array, heightPt:number}>, pageCount:number, contentHeightPt:number }}
 */
export function paginate(blocks, profile) {
  const cb = contentBox(profile);
  const contentHeightPt = cb.height;
  const pages = [];
  let cur = { index: 0, blocks: [], heightPt: 0 };
  const pushPage = () => { pages.push(cur); cur = { index: pages.length, blocks: [], heightPt: 0 }; };

  for (const block of blocks || []) {
    const el = profile.elements[block.type] || {};
    const m = blockMetrics(profile, block);

    if ((el.pageBreakBefore || block.pageBreakBefore) && cur.blocks.length) pushPage();

    // Orphan guard: if a keep-with-next block won't leave room for one more line,
    // bump it to the next page (so a scene heading / character cue isn't stranded).
    const needs = m.height + (el.keepWithNext ? m.lineStep : 0);
    if (cur.blocks.length && cur.heightPt + needs > contentHeightPt) pushPage();

    const top = cur.heightPt;
    cur.blocks.push({ ...block, top, height: m.height, lines: m.lines });
    cur.heightPt += m.height;

    // If we've overflowed the page (block taller than remaining), start fresh for
    // the next block. (A future pass splits oversized blocks across pages.)
    if (cur.heightPt > contentHeightPt && cur.blocks.length > 1) {
      // move the last block onto a new page so it starts clean
      const last = cur.blocks.pop();
      cur.heightPt -= last.height;
      pushPage();
      last.top = 0;
      cur.blocks.push(last);
      cur.heightPt += last.height;
    }
  }
  if (cur.blocks.length || pages.length === 0) pages.push(cur);
  return { pages, pageCount: pages.length, contentHeightPt };
}

/**
 * The document line index that starts each page after the first → { line: pageNum }.
 * Used to place page-break markers in the editor at the SAME boundaries the strip
 * uses (single canonical pagination).
 */
export function pageBreakLines(blocks, profile) {
  const { pages } = paginate(blocks, profile);
  const map = new Map();
  for (let k = 1; k < pages.length; k++) {
    const first = pages[k].blocks[0];
    if (first && first.startLine != null) map.set(first.startLine, k + 1); // page number (1-based)
  }
  return map;
}

/**
 * The exact continuous page position of a source line (0 = top of page 1,
 * 12.6 = 60% down page 13…), from the real block layout. Returns null if the
 * line isn't a laid-out block (e.g. hidden frontmatter).
 */
export function pageOffsetOfLine(blocks, profile, line) {
  const { pages, contentHeightPt } = paginate(blocks, profile);
  for (const pg of pages) {
    for (const b of pg.blocks) {
      if (b.startLine === line) return (pg.index * contentHeightPt + b.top) / contentHeightPt;
    }
  }
  return null;
}

/**
 * Map a Spine (scenes, in document order) onto the engine's real pages, returning
 * the same shape outlineLayout.layout() consumes — but in PAGE units (perPage =
 * page content height in pt, scene start/length in pt) so the strip ruler and the
 * Paged editor agree on page numbers and positions.
 */
export function paginatedScenesFromBlocks(blocks, spine, profile) {
  const { pages, pageCount, contentHeightPt } = paginate(blocks, profile);
  // Absolute vertical offset (pt) of every block, keyed by file:startLine, plus
  // each file's first-block offset (fallback for synthetic whole-file units whose
  // heading line isn't itself a laid-out block).
  const absByKey = new Map();
  const fileFirst = new Map();
  for (const pg of pages) for (const b of pg.blocks) {
    const at = pg.index * contentHeightPt + b.top;
    absByKey.set(`${b.file}:${b.startLine}`, at);
    if (!fileFirst.has(b.file)) fileFirst.set(b.file, at);
  }
  const docTotal = pageCount * contentHeightPt;

  const scenes = (spine || []).map((u, i) => {
    const key = `${u.file}:${u.startLine || 0}`;
    const at = absByKey.has(key) ? absByKey.get(key) : (fileFirst.has(u.file) ? fileFirst.get(u.file) : null);
    return { index: i, id: u.id || null, title: u.title, file: u.file, line: u.startLine || 0, end: u.endLine, status: u.status || null, _at: at };
  });
  // Forward-fill any unit whose heading line wasn't a block start (e.g. a synthetic
  // whole-file unit), then derive each scene's length from the next scene's start.
  let last = 0;
  for (const s of scenes) { if (s._at == null) s.start = last; else { s.start = s._at; last = s._at; } delete s._at; }
  for (let i = 0; i < scenes.length; i++) scenes[i].length = Math.max(1, (scenes[i + 1] ? scenes[i + 1].start : docTotal) - scenes[i].start);
  return { scenes, total: docTotal || 1, pages: pageCount, perPage: contentHeightPt };
}
