/**
 * Outline editor service
 *
 * Reads/writes the outline (lanes + beats) shown in the multilane strip and the
 * beat board. Outlines are PER-DRAFT: each draft carries its own planning layer,
 * stored under `cfg.drafts[draftPath]`. This service always targets the project's
 * CURRENT draft (resolved from cfg), so callers don't thread a draft id through —
 * switching the current draft simply switches which beats these methods touch.
 *
 * Pure logic lives in outlineModel.js; this layer persists via the config service.
 * Beats are planning data only (no link to script scenes).
 */

import {
  normalizeOutline,
  readDraftOutline,
  writeDraftOutline,
  addBeat as addBeatPure,
  updateBeat as updateBeatPure,
  removeBeat as removeBeatPure,
  moveBeat as moveBeatPure,
  addLane as addLanePure,
  renameLane as renameLanePure,
  removeLane as removeLanePure,
  clampZoom,
} from './outlineModel.js';
import { resolveCurrentDraft } from './draftModel.js';

function newBeatId() {
  return 'beat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/** The current draft's storage key (its path), or the default bucket for legacy projects. */
function draftKeyFor(cfg) {
  const node = resolveCurrentDraft(cfg?.structure?.tree || [], cfg?.currentDraftPath);
  return node ? node.path : '';
}

export class OutlineEditorService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  /** The current draft's outline (lanes + beats), normalised. */
  async load(book) {
    const cfg = (await this.configService.loadBookConfig(book)) || {};
    return readDraftOutline(cfg, draftKeyFor(cfg));
  }

  /** Apply a pure outline transform to the current draft and persist. */
  async _mutate(book, fn, ret) {
    const cfg = (await this.configService.loadBookConfig(book)) || {};
    const key = draftKeyFor(cfg);
    const outline = readDraftOutline(cfg, key);
    const next = fn(outline);
    const cfg2 = writeDraftOutline(cfg, key, next);
    await this.configService.saveBookConfig(book, cfg2);
    return ret;
  }

  async save(book, outline) {
    return this._mutate(book, () => normalizeOutline(outline));
  }

  /** Add a beat to a lane; returns its id. */
  async addBeat(book, beat) {
    const id = newBeatId();
    await this._mutate(book, (o) => addBeatPure(o, { ...beat, id }));
    return id;
  }

  async updateBeat(book, id, patch) {
    return this._mutate(book, (o) => updateBeatPure(o, id, patch));
  }

  async removeBeat(book, id) {
    return this._mutate(book, (o) => removeBeatPure(o, id));
  }

  async moveBeat(book, id, toLane, toIndex) {
    return this._mutate(book, (o) => moveBeatPure(o, id, toLane, toIndex));
  }

  async addLane(book, name) {
    return this._mutate(book, (o) => addLanePure(o, name));
  }

  async renameLane(book, laneIndex, name) {
    return this._mutate(book, (o) => renameLanePure(o, laneIndex, name));
  }

  async removeLane(book, laneIndex) {
    return this._mutate(book, (o) => removeLanePure(o, laneIndex));
  }

  async setZoom(book, zoom) {
    return this._mutate(book, (o) => { const n = normalizeOutline(o); n.zoom = clampZoom(zoom); return n; });
  }
}
