/**
 * Outline model (pure)
 *
 * The outline editor's data lives in project-config under `cfg.outline`:
 *   { lanes: [{id, name}], beats: [{id, lane, title, notes, color, goal, order}] }
 *
 * Beats are a free, high-concept planning layer (arcs / subplots) — NOT linked
 * to the script's structure. The bottom "script lane" is DERIVED from the Spine
 * (scenes) and paginated by length, mirroring Final Draft's Outline Editor.
 *
 * All functions here are pure (no vault / Obsidian); the service persists.
 */

// Words per page — the length metric for the script lane (a prose-friendly proxy
// for pages; screenplay uses a smaller value). Relative bar sizes only depend on
// each unit's word count; perPage just scales the ruler.
export const DEFAULT_PER_PAGE = 280;

export const DEFAULT_LANES = [
  { id: "lane-1", name: "Outline 1" },
  { id: "lane-2", name: "Outline 2" },
];

export const DEFAULT_ZOOM = 120; // px per script page
export const MIN_ZOOM = 40;
export const MAX_ZOOM = 600;

/** Clamp a zoom (px-per-page) into the allowed range. */
export function clampZoom(z) {
  const n = Number(z) || DEFAULT_ZOOM;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, n));
}

/** Normalise a stored outline (fill defaults), returning a fresh object. */
export function normalizeOutline(outline) {
  const lanes = (outline && Array.isArray(outline.lanes) && outline.lanes.length ? outline.lanes : DEFAULT_LANES).map((l) => ({ ...l }));
  const beats = (outline && Array.isArray(outline.beats) ? outline.beats : []).map((b) => ({ ...b }));
  const zoom = clampZoom(outline && outline.zoom);
  return { lanes, beats, zoom };
}

// Fallback key for a project with no flagged drafts (legacy / single-bucket).
const DEFAULT_DRAFT_KEY = "__default__";

/**
 * Read the outline (lanes/beats/zoom) for a specific draft, normalised.
 *
 * Per-draft outlines live in `cfg.drafts[draftPath]`. A legacy project stored a
 * single global `cfg.outline`; when no per-draft entry exists yet we adopt that
 * global outline (the writer's existing beats migrate to whichever draft they
 * first edit — typically the current one). No mutation here; the service writes.
 */
export function readDraftOutline(cfg, draftPath) {
  const key = draftPath || DEFAULT_DRAFT_KEY;
  const drafts = (cfg && cfg.drafts) || {};
  if (drafts[key]) return normalizeOutline(drafts[key]);
  if (cfg && cfg.outline) return normalizeOutline(cfg.outline); // legacy global → adopt
  return normalizeOutline(null);
}

/**
 * Return a new cfg with `draftPath`'s outline set. Clears the legacy global
 * `cfg.outline` once anything is written (it has been migrated into a draft).
 */
export function writeDraftOutline(cfg, draftPath, outline) {
  const key = draftPath || DEFAULT_DRAFT_KEY;
  const next = { ...(cfg || {}) };
  next.drafts = { ...(next.drafts || {}) };
  next.drafts[key] = normalizeOutline(outline);
  if (next.outline) delete next.outline; // legacy global now lives under drafts[]
  return next;
}

/** Beats in a given lane index, in order. */
export function beatsInLane(outline, laneIndex) {
  return (outline.beats || [])
    .filter((b) => (b.lane || 0) === laneIndex)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/** Add a beat to a lane. Positioned (page `start`/`span`) after the lane's last beat. Returns a new outline. */
export function addBeat(outline, beat) {
  const next = normalizeOutline(outline);
  const lane = beat.lane || 0;
  const laneBeats = beatsInLane(next, lane);
  const order = laneBeats.length;
  const start = beat.start != null ? beat.start : laneBeats.reduce((m, b) => Math.max(m, (b.start || 0) + (b.span || 1)), 0);
  next.beats.push({
    id: beat.id,
    lane,
    title: beat.title || "New beat",
    notes: beat.notes || "",
    color: beat.color || null,
    goal: beat.goal || "",
    order,
    start,
    span: beat.span != null ? beat.span : 1,
  });
  return next;
}

/** Add a new outline lane. Returns a new outline. */
export function addLane(outline, name) {
  const next = normalizeOutline(outline);
  next.lanes.push({ id: "lane-" + (next.lanes.length + 1) + "-" + Math.random().toString(36).slice(2, 5), name: name || `Outline ${next.lanes.length + 1}` });
  return next;
}

/** Rename a lane by index. Returns a new outline. */
export function renameLane(outline, laneIndex, name) {
  const next = normalizeOutline(outline);
  if (next.lanes[laneIndex]) next.lanes[laneIndex].name = name;
  return next;
}

/** Remove a lane by index; its beats are dropped, and higher lanes shift down. Returns a new outline. */
export function removeLane(outline, laneIndex) {
  const next = normalizeOutline(outline);
  if (next.lanes.length <= 1) return next; // keep at least one lane
  next.lanes.splice(laneIndex, 1);
  next.beats = next.beats
    .filter((b) => (b.lane || 0) !== laneIndex)
    .map((b) => ((b.lane || 0) > laneIndex ? { ...b, lane: (b.lane || 0) - 1 } : b));
  return next;
}

/** Merge a patch into a beat. Returns a new outline. */
export function updateBeat(outline, id, patch) {
  const next = normalizeOutline(outline);
  const beat = next.beats.find((b) => b.id === id);
  if (beat) Object.assign(beat, patch);
  return next;
}

/** Remove a beat and renumber its lane. Returns a new outline. */
export function removeBeat(outline, id) {
  const next = normalizeOutline(outline);
  const beat = next.beats.find((b) => b.id === id);
  next.beats = next.beats.filter((b) => b.id !== id);
  if (beat) renumber(next, beat.lane || 0);
  return next;
}

/**
 * Move a beat to `toLane` at position `toIndex` (clamped), renumbering both
 * the source and destination lanes. Returns a new outline.
 */
export function moveBeat(outline, id, toLane, toIndex) {
  const next = normalizeOutline(outline);
  const beat = next.beats.find((b) => b.id === id);
  if (!beat) return next;
  const fromLane = beat.lane || 0;
  beat.lane = toLane;
  const laneBeats = next.beats
    .filter((b) => (b.lane || 0) === toLane && b.id !== id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const at = Math.max(0, Math.min(toIndex, laneBeats.length));
  laneBeats.splice(at, 0, beat);
  laneBeats.forEach((b, i) => { b.order = i; });
  if (fromLane !== toLane) renumber(next, fromLane);
  return next;
}

function renumber(outline, laneIndex) {
  outline.beats
    .filter((b) => (b.lane || 0) === laneIndex)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((b, i) => { b.order = i; });
}

/**
 * Derive the script lane from the Spine: each scene positioned by cumulative
 * length (word count; falls back to line span if a unit lacks a word count).
 * Pure. `length`/`start`/`total` are in the chosen metric (words).
 * @returns {{scenes:Array<{index,id,title,file,line,end,status,length,start}>, total, pages, perPage}}
 */
export function paginate(spine, perPage = DEFAULT_PER_PAGE) {
  let offset = 0;
  const scenes = (spine || []).map((u, i) => {
    const endLine = u.endLine != null ? u.endLine : (u.startLine || 0) + 1;
    const length = Math.max(1, u.words != null ? u.words : endLine - (u.startLine || 0));
    const start = offset;
    offset += length;
    return { index: i, id: u.id || null, title: u.title, file: u.file, line: u.startLine || 0, end: endLine, status: u.status || null, length, start };
  });
  const total = offset || 1;
  return { scenes, total, pages: Math.max(1, Math.ceil(total / perPage)), perPage };
}
