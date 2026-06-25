/**
 * Outline Service
 *
 * Treats the project's `Outline.md` as the source of truth for the scene running
 * order: an ordered list of links to scene headings (sluglines) in the script
 * files, e.g.
 *
 *   - [[CALEIDOSCOPIO_v01#INT. CONSERVATORIO - DÍA]]
 *   - [[CALEIDOSCOPIO_v01#EXT. CAMPO DE ESPIGAS - DÍA]]
 *
 * Scenes are parsed from the script files' level-1 headings (Folio maps `#` to a
 * scene heading). `syncOutlineFromScenes` appends a link for every new scene not
 * already in the outline, preserving the user's order and manual edits.
 *
 * NOTE: `Outline.md` is NOT a source of truth. The running order is derived from
 * the Spine (structure tree ⊕ in-document headings; see spineService.js), which
 * is what the timeline band, beat board, and reorder all read. This file is only
 * a convenience EXPORT — a flat, linkable scene list — written on demand by the
 * "Sync outline" command. Editing it does not move scenes.
 *
 * The line parsing/building is pure and unit-tested; only the sync touches the
 * vault / metadata cache.
 */

const OUTLINE_BASENAME = "Outline";

/** Build an outline list line linking to a scene (heading) or a whole file. */
export function buildOutlineLine(basename, heading) {
  return heading ? `- [[${basename}#${heading}]]` : `- [[${basename}]]`;
}

/**
 * Parse all scene links from outline text, in order.
 * Matches [[file#heading]] and [[file]] (with optional |alias).
 * @returns {Array<{file:string, heading:(string|null), raw:string}>}
 */
export function parseOutlineSceneLinks(text) {
  const out = [];
  if (!text) return out;
  const re = /\[\[([^\[\]#|]+)(?:#([^\[\]|]+))?(?:\|[^\[\]]+)?\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      file: (m[1] || "").trim(),
      heading: m[2] ? m[2].trim() : null,
      raw: m[0],
    });
  }
  return out;
}

/** Stable key for a scene link, for de-duplication. */
export function sceneLinkKey(file, heading) {
  return `${(file || "").trim().toLowerCase()}::${(heading || "").trim().toLowerCase()}`;
}

export class OutlineService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  getOutlinePath(book) {
    return `${book.path}/${OUTLINE_BASENAME}.md`;
  }

  /**
   * Parse the project's scenes from script files' level-1 headings, in outline
   * order. Files with no headings count as a single scene (the file itself).
   * The Outline file itself is skipped.
   * @returns {Array<{basename:string, path:string, heading:(string|null), line:number}>}
   */
  getProjectScenes(book, sceneFiles) {
    const scenes = [];
    for (const file of sceneFiles || []) {
      if (!file || file.extension !== "md") continue;
      if (file.basename && file.basename.toLowerCase() === OUTLINE_BASENAME.toLowerCase()) continue;

      const cache = this.app.metadataCache.getFileCache(file);
      const headings = (cache?.headings || []).filter((h) => h.level === 1);
      if (headings.length) {
        for (const h of headings) {
          scenes.push({ basename: file.basename, path: file.path, heading: h.heading, line: h.position?.start?.line ?? 0 });
        }
      } else {
        scenes.push({ basename: file.basename, path: file.path, heading: null, line: 0 });
      }
    }
    return scenes;
  }

  /**
   * Append outline links for every scene not already present. Preserves order
   * and any manual edits. Creates Outline.md if missing.
   * @returns {Promise<{added:number, outlinePath:(string|null)}>}
   */
  async syncOutlineFromScenes(book, sceneFiles) {
    try {
      const scenes = this.getProjectScenes(book, sceneFiles);
      const outlinePath = this.getOutlinePath(book);
      let outlineFile = this.app.vault.getAbstractFileByPath(outlinePath);

      let text = "";
      if (outlineFile) text = await this.app.vault.read(outlineFile);

      const existing = new Set(parseOutlineSceneLinks(text).map((l) => sceneLinkKey(l.file, l.heading)));
      const toAppend = [];
      for (const s of scenes) {
        if (!existing.has(sceneLinkKey(s.basename, s.heading))) {
          toAppend.push(buildOutlineLine(s.basename, s.heading));
          existing.add(sceneLinkKey(s.basename, s.heading));
        }
      }

      if (!toAppend.length) {
        return { added: 0, outlinePath: outlineFile ? outlineFile.path : null };
      }

      const needsHeader = !text.trim();
      const sep = text && !text.endsWith("\n") ? "\n" : "";
      const body = (needsHeader ? "# Outline\n\n" : "") + toAppend.join("\n") + "\n";
      const newText = text + sep + body;

      if (outlineFile) {
        await this.app.vault.modify(outlineFile, newText);
      } else {
        outlineFile = await this.app.vault.create(outlinePath, newText);
      }
      return { added: toAppend.length, outlinePath: outlineFile.path };
    } catch (e) {
      console.warn("syncOutlineFromScenes failed", e);
      return { added: 0, outlinePath: null };
    }
  }
}
