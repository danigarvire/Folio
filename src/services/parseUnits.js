/**
 * Unit parser
 *
 * Turns a markdown document into an ordered list of Units (scenes / sections)
 * using a format profile (see formatProfiles.js). A Unit is a span of the
 * document from one unit-role heading up to the next unit-role or higher-or-equal
 * grouper boundary. Groupers (act / part / chapter) provide the agrouping context
 * carried on each Unit.
 *
 * Dispatch is by ROLE, not heading depth, so formats with "inverted" nesting
 * (screenplay act at ##### grouping scenes at #) parse correctly.
 *
 * Pure module (no Obsidian / vault access) so it is unit-tested and reusable. The
 * production path (spineService) feeds metadataCache headings into
 * `unitsFromHeadings` to avoid re-parsing text; `parseUnits` is the text path.
 */

const HEADING_RE = /^(#{1,6})\s+(.*\S)\s*$/;
const HEADING_PREFIX_RE = /^#{1,6}\s/;
// A stable Unit id is an Obsidian block id (e.g. ` ^folioab12cd`) on the Unit's
// first body line — INSIDE the Unit span, so it travels with the block on moves
// and lets the canvas target `#^id` even when sluglines repeat. Obsidian forbids
// block ids on heading lines, so it cannot live on the slugline itself.
const BLOCK_ID_RE = /(?:^|\s)\^(folio[A-Za-z0-9]+)\s*$/;

/**
 * Return the folio Unit id (block id) encoded at the end of a line, or null.
 * Matches whether or not there's leading whitespace, so a malformed column-0 id
 * is still detected (prevents double-assigning a second id to the same Unit).
 */
export function parseBlockId(line) {
  if (!line) return null;
  const m = BLOCK_ID_RE.exec(line);
  return m ? m[1] : null;
}

/**
 * Extract ATX headings from markdown, skipping any inside fenced code blocks.
 * @returns {Array<{level:number, text:string, line:number}>}
 */
export function parseHeadings(text) {
  const lines = (text || "").split("\n");
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = HEADING_RE.exec(lines[i]);
    if (m) out.push({ level: m[1].length, text: m[2], line: i });
  }
  return out;
}

/**
 * Build Units from already-parsed headings plus the document's total line count.
 * Shared by the text path (parseUnits) and the metadataCache path (spineService).
 *
 * @param {Array<{level:number, text:string, line:number}>} headings document order
 * @param {number} totalLines number of lines in the document (for the last span)
 * @param {{headingRoles:object, unitRole:string, grouperTiers:object}} profile
 * @returns {Array<{role:string,title:string,startLine:number,endLine:number,groups:Array<{role:string,text:string}>}>}
 */
export function unitsFromHeadings(headings, totalLines, profile) {
  const units = [];
  let current = null;
  const groupStack = []; // [{ role, tier, text }]

  const roleOf = (lvl) => profile.headingRoles[lvl] ?? "unknown";
  const closeUnit = (endExclusive) => {
    if (current) { current.endLine = endExclusive; units.push(current); current = null; }
  };

  for (const head of headings || []) {
    const role = roleOf(head.level);
    const isGrouper = Object.prototype.hasOwnProperty.call(profile.grouperTiers, role);
    const isUnit = role === profile.unitRole;

    if (isGrouper) {
      closeUnit(head.line);                       // a grouper closes the open unit
      const tier = profile.grouperTiers[role];
      while (groupStack.length && groupStack[groupStack.length - 1].tier >= tier) groupStack.pop();
      groupStack.push({ role, tier, text: head.text });
    } else if (isUnit) {
      closeUnit(head.line);                       // the next unit closes the previous
      current = {
        role,
        title: head.text,
        startLine: head.line,
        endLine: null,
        groups: groupStack.map((g) => ({ role: g.role, text: g.text })),
      };
    }
    // inline roles (character / action / transition / subsection) are unit body
  }
  closeUnit(totalLines);                          // last unit runs to EOF
  return units;
}

/**
 * Parse a markdown document into Units using a format profile.
 * @param {string} text
 * @param {{headingRoles:object, unitRole:string, grouperTiers:object}} profile
 */
export function parseUnits(text, profile) {
  const lines = (text || "").split("\n");
  const headings = parseHeadings(text);
  const units = unitsFromHeadings(headings, lines.length, profile);
  // Attach the stable id from the first block id found inside the Unit span,
  // plus any beats declared in a [!beat] callout.
  for (const u of units) {
    u.id = null;
    const end = u.endLine ?? lines.length;
    for (let i = u.startLine; i < end; i++) {
      const id = parseBlockId(lines[i]);
      if (id) { u.id = id; break; }
    }
    u.beats = extractBeats(lines, u);
  }
  return units;
}

const BEAT_CALLOUT_RE = /^>\s*\[!beat\]/i;
const CALLOUT_BODY_RE = /^>\s?(.*)$/;
const LIST_ITEM_RE = /^[-*+]\s+(.*\S)\s*$/;

/**
 * Extract the beats of a Unit from a `[!beat]` callout inside its span:
 *
 *   > [!beat]- Beats
 *   > - Llega Alice
 *   > - Descubre la carta
 *
 * Returns the list-item texts in order (empty if there is no beat callout).
 * Pure — operates on the document's split lines and the Unit's span.
 */
export function extractBeats(lines, unit) {
  const end = unit.endLine ?? lines.length;
  let i = unit.startLine;
  while (i < end && !BEAT_CALLOUT_RE.test(lines[i])) i++;
  if (i >= end) return [];
  const beats = [];
  for (i = i + 1; i < end; i++) {
    const m = CALLOUT_BODY_RE.exec(lines[i]);
    if (!m) break; // callout block ended
    const item = LIST_ITEM_RE.exec(m[1].trim());
    if (item) beats.push(item[1]);
  }
  return beats;
}

/** First non-blank, non-heading line index inside a Unit span, or -1. */
function firstBodyLine(lines, unit) {
  const end = unit.endLine ?? lines.length;
  for (let i = unit.startLine + 1; i < end; i++) {
    const l = lines[i];
    if (!l || l.trim() === "") continue;
    if (HEADING_PREFIX_RE.test(l)) continue;
    return i;
  }
  return -1;
}

/**
 * Append a ` ^<id>` block id to the first body line of every Unit that lacks an
 * id. Pure: takes an injected id generator (which returns the full id, e.g.
 * "folioab12cd") so it is deterministic in tests. Idempotent. A Unit with no
 * anchorable body line (heading immediately followed by another heading) is
 * skipped — it has no place to carry a block id.
 *
 * Editing line content in place (not splicing lines) keeps every other Unit's
 * line indices valid, so no bottom-up pass is needed.
 *
 * @param {string} text
 * @param {object} profile format profile
 * @param {()=>string} genId returns a fresh id string (incl. the folio prefix)
 * @returns {{text:string, assignedCount:number, assigned:Array<{title:string,id:string}>}}
 */
export function ensureUnitIds(text, profile, genId) {
  const units = parseUnits(text, profile);
  const lines = (text || "").split("\n");
  const assigned = [];
  for (const u of units) {
    if (u.id) continue;
    const target = firstBodyLine(lines, u);
    if (target === -1) continue; // nowhere to anchor a block id
    const id = genId();
    lines[target] = lines[target].replace(/\s+$/, "") + ` ^${id}`;
    assigned.push({ title: u.title, id });
  }
  return { text: assigned.length ? lines.join("\n") : text, assignedCount: assigned.length, assigned };
}
