/**
 * Draft model (pure)
 *
 * A "draft" is the manuscript slice the outline/strip/beats operate on — NOT the
 * whole project tree (which also holds front/back matter, research, graveyard…).
 *
 * A draft is a tree FOLDER flagged `draft: true`. The ACTIVE draft is the draft
 * folder containing the file you're editing. If nothing is flagged, we fall back
 * to the file's top-level folder, so the common one-manuscript-folder templates
 * (Volume 1 / Sequence 1 / Episode 1 / Manuscript) work out of the box.
 *
 * No DOM/vault here — the band/services consume these.
 */

/** All nodes explicitly flagged as drafts (folder or file), in tree order. */
export function findDrafts(tree) {
  const out = [];
  const walk = (nodes) => {
    for (const n of nodes || []) {
      if (n.draft && (n.type === "group" || n.type === "file")) out.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(tree || []);
  return out;
}

function findGroupByPath(tree, path) {
  let found = null;
  const walk = (nodes) => {
    for (const n of nodes || []) {
      if (found) return;
      if (n.type === "group" && n.path === path) { found = n; return; }
      if (n.children) walk(n.children);
    }
  };
  walk(tree || []);
  return found;
}

const isAncestorPath = (folder, file) => file === folder || file.startsWith(folder + "/");

/**
 * The active draft node for a file (book-relative path), or null.
 * - Prefers the deepest flagged-draft ancestor (folder draft) or the file itself
 *   if it is a flagged file-draft.
 * - If the project has ANY flagged drafts but this file is in none → null (the
 *   file is outside the manuscript, e.g. the show bible / research).
 * - Only when NOTHING is flagged (legacy projects) does it fall back to the
 *   file's top-level folder.
 */
export function draftNodeForFile(tree, relPath) {
  if (!relPath) return null;
  const drafts = findDrafts(tree);
  let best = null;
  for (const d of drafts) {
    if (d.path && isAncestorPath(d.path, relPath) && (!best || d.path.length > best.path.length)) best = d;
  }
  if (best) return best;
  if (drafts.length) return null; // explicit drafts exist; this file is outside them
  const i = relPath.indexOf("/");
  if (i === -1) return null; // legacy + loose root file → no draft
  return findGroupByPath(tree, relPath.slice(0, i));
}

/** Files (book-relative paths) that make up a draft node's subtree, in order. */
export function draftScopeNodes(draftNode) {
  if (!draftNode) return null;
  return draftNode.type === "file" ? [draftNode] : (draftNode.children || []);
}

/**
 * The project's CURRENT draft — the single draft the strip/outline/beats reflect,
 * regardless of which file is open. Resolution:
 *   1. the draft at `currentDraftPath`, if it still exists and is flagged; else
 *   2. the first flagged draft (tree order); else
 *   3. null (legacy project with no flagged drafts → callers fall back to whole tree).
 */
export function resolveCurrentDraft(tree, currentDraftPath) {
  const drafts = findDrafts(tree);
  if (!drafts.length) return null;
  if (currentDraftPath) {
    const match = drafts.find((d) => d.path === currentDraftPath);
    if (match) return match;
  }
  return drafts[0];
}

/** True if a book-relative file path belongs to a draft node's subtree. */
export function isPathInDraft(draftNode, relPath) {
  if (!draftNode || !relPath) return false;
  return relPath === draftNode.path || relPath.startsWith(draftNode.path + "/");
}

/**
 * The "Drafts shelf" — the folder that holds drafts (current and older). A folder
 * flagged `shelf:true` (template), else one literally named "Drafts". New drafts
 * are created inside it; null means create at project root.
 */
export function draftShelfNode(tree) {
  let found = null;
  const walk = (nodes) => {
    for (const n of nodes || []) {
      if (found) return;
      if (n.type === "group" && (n.shelf || /^drafts$/i.test(n.title || ""))) { found = n; return; }
      if (n.children) walk(n.children);
    }
  };
  walk(tree || []);
  return found;
}

/** Options for a draft switcher: every flagged draft, else top-level folders. */
export function draftChoices(tree) {
  const flagged = findDrafts(tree);
  const source = flagged.length ? flagged : (tree || []).filter((n) => n.type === "group");
  return source.map((n) => ({ path: n.path, name: n.title || n.path }));
}
