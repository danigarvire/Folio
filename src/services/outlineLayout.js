/**
 * Outline layout (pure)
 *
 * Maps the paginated script + planning beats onto a shared horizontal PAGE
 * scale (pixels), so the script lane's scene widths and the beats' page-ranges
 * line up — the Final Draft-style outline editor. No DOM here; the band applies
 * the returned pixel geometry.
 */

const MIN_SCENE_PX = 10;

/**
 * @param {{scenes:Array,totalLines:number,pages:number,linesPerPage:number}} paginated from outlineModel.paginate
 * @param {Array} beats outline beats with {start (page), span (pages)}
 * @param {number} pxPerPage horizontal pixels per script page
 * @returns {{width, pxPerPage, pxPerLine, pages, scenes:Array, beatBars:Array}}
 */
export function layout(paginated, beats, pxPerPage) {
  const perPage = paginated.perPage || 280;
  const pxPerUnit = pxPerPage / perPage;          // px per metric unit (word)
  const total = paginated.total || 1;
  const width = Math.max(total * pxPerUnit, pxPerPage);

  const scenes = (paginated.scenes || []).map((s) => ({
    ...s,
    px: (s.start || 0) * pxPerUnit,
    w: Math.max(MIN_SCENE_PX, (s.length || 1) * pxPerUnit),
  }));

  const beatBars = (beats || []).map((b) => ({
    ...b,
    px: (b.start || 0) * pxPerPage,
    w: Math.max(pxPerPage * 0.4, (b.span || 1) * pxPerPage),
  }));

  return { width, pxPerPage, pxPerUnit, perPage, total, pages: paginated.pages || 1, scenes, beatBars };
}

/** Convert a pixel x-offset to a page position (rounded to a quarter page). */
export function pxToPage(px, pxPerPage) {
  return Math.max(0, Math.round((px / pxPerPage) * 4) / 4);
}
