/**
 * Reorder primitives
 *
 * Pure, format-agnostic text surgery for moving a Unit (a heading span) within
 * or between documents. The caller (a service) reads the file text, applies the
 * returned text, and re-parses to rebuild the Spine — never trust in-place swaps.
 *
 * Design choices:
 *  - A Unit's block is [startLine, endLine). The stable id is a block id on the
 *    Unit's first body line, i.e. already inside the block, so it travels with
 *    the Unit when it moves (spec §8).
 *  - Grouper (act / part / chapter) heading lines are NOT part of any Unit block;
 *    they stay where they are. A Unit's act membership is therefore POSITIONAL —
 *    moving a scene past an act heading reassigns its act. This keeps order fully
 *    derived (D1): nothing about grouping is stored on the Unit (spec §7).
 *  - Separators are normalised to exactly one blank line between blocks at the
 *    seams we touch (spec §7); internal blank runs collapse to one as well.
 *
 * All functions take Units shaped like spineService output: {startLine, endLine,
 * file, id, ...}. endLine is exclusive.
 */

const isBlank = (l) => !l || l.trim() === '';

/** Start line of a Unit's block. The id lives in the body, so this is just the heading line. */
function blockStart(lines, unit) {
  return unit.startLine;
}

/** Drop leading/trailing blank lines from a slice. */
function trimBlanks(block) {
  let s = 0;
  let e = block.length;
  while (s < e && isBlank(block[s])) s++;
  while (e > s && isBlank(block[e - 1])) e--;
  return block.slice(s, e);
}

/** Collapse runs of blank lines to one and trim leading/trailing blanks. */
function normalizeBlankRuns(lines) {
  const out = [];
  let blank = false;
  for (const l of lines) {
    if (isBlank(l)) { if (!blank && out.length) out.push(''); blank = true; }
    else { out.push(l); blank = false; }
  }
  while (out.length && isBlank(out[out.length - 1])) out.pop();
  return out;
}

/** Re-join lines, preserving a single trailing newline if the source had one. */
function join(lines, hadTrailingNewline) {
  const text = lines.join('\n');
  return hadTrailingNewline && text ? text + '\n' : text;
}

/** Extract a Unit's block (id comment + heading + body), trimmed of blank edges. */
export function extractBlock(lines, unit) {
  const start = blockStart(lines, unit);
  return trimBlanks(lines.slice(start, unit.endLine));
}

/**
 * Move `fromUnit` so it sits immediately before `beforeUnit` (or to the end of
 * the document when `beforeUnit` is null). Both Units must be in the SAME file's
 * `text`. Returns the rewritten text.
 */
export function moveUnitWithinText(text, fromUnit, beforeUnit) {
  const src = text ?? '';
  const lines = src.split('\n');
  const fromStart = blockStart(lines, fromUnit);
  const fromEnd = fromUnit.endLine;
  const block = trimBlanks(lines.slice(fromStart, fromEnd));
  const removedLen = fromEnd - fromStart;

  // Remove the block, leaving a blank placeholder so the source seam stays separated.
  let rest = lines.slice(0, fromStart).concat([''], lines.slice(fromEnd));

  let insertAt;
  if (!beforeUnit) {
    insertAt = rest.length;
  } else {
    let b = blockStart(lines, beforeUnit);
    // The placeholder added +1 line at fromStart and removed `removedLen`; only
    // targets after the removed region shift.
    if (b >= fromEnd) b = b - removedLen + 1;
    insertAt = b;
  }

  rest = rest.slice(0, insertAt).concat([''], block, [''], rest.slice(insertAt));
  return join(normalizeBlankRuns(rest), src.endsWith('\n'));
}

/**
 * Remove `unit`'s block from its file text. Returns {text, block} where block is
 * the trimmed array of moved lines (id comment travels with it).
 */
export function removeUnitFromText(text, unit) {
  const src = text ?? '';
  const lines = src.split('\n');
  const start = blockStart(lines, unit);
  const block = trimBlanks(lines.slice(start, unit.endLine));
  const rest = lines.slice(0, start).concat([''], lines.slice(unit.endLine));
  return { text: join(normalizeBlankRuns(rest), src.endsWith('\n')), block };
}

/**
 * Insert a block (array of lines) into `text` immediately before `beforeUnit`
 * (or at the end when null). Returns the rewritten text.
 */
export function insertBlockBeforeUnit(text, block, beforeUnit) {
  const src = text ?? '';
  const lines = src.split('\n');
  const trimmed = trimBlanks(block);
  const insertAt = beforeUnit ? blockStart(lines, beforeUnit) : lines.length;
  const rest = lines.slice(0, insertAt).concat([''], trimmed, [''], lines.slice(insertAt));
  return join(normalizeBlankRuns(rest), src.endsWith('\n') || lines.length === 0);
}
