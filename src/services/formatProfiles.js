/**
 * Format profiles
 *
 * Declares, per project type, how markdown headings map to narrative roles so a
 * single parser (see parseUnits.js) can handle any format. Each profile says:
 *   - headingRoles: which role each heading level carries
 *   - unitRole:     which role is the orderable Unit (the scene / section)
 *   - grouperTiers: which roles group Units, and at which tier (lower = outer)
 *
 * The parser dispatches by ROLE, not by heading depth — so a screenplay whose
 * "act" lives at `#####` (level 5) but groups ABOVE the scene at `#` (level 1)
 * parses correctly: in document order an act heading opens a group regardless of
 * its level. Adding a new format = adding a profile here; the engine is untouched.
 *
 * Keyed by `cfg.basic.projectType` (see PROJECT_TYPES in constants). Pure data.
 */

// Screenplay (film + TV script). Mirrors the historic hardcoded map in
// screenplayParser.js: # scene, ## character, ### parenthetical, #### transition,
// ##### act. character/parenthetical/transition are inline body of a scene; only
// scene is a Unit and only act is a grouper.
const SCREENPLAY_PROFILE = {
  headingRoles: { 1: "scene", 2: "character", 3: "parenthetical", 4: "transition", 5: "act" },
  unitRole: "scene",
  grouperTiers: { act: 0 },
};

export const FORMAT_PROFILES = {
  script: SCREENPLAY_PROFILE,
  film: SCREENPLAY_PROFILE,
  book: {
    headingRoles: { 1: "part", 2: "chapter", 3: "scene" },
    unitRole: "scene",
    grouperTiers: { part: 0, chapter: 1 },
  },
  essay: {
    headingRoles: { 1: "title", 2: "section", 3: "subsection" },
    unitRole: "section",
    grouperTiers: {},
  },
};

/** Default profile when a project type is unknown (matches defaultProjectType). */
export const DEFAULT_PROFILE = FORMAT_PROFILES.book;

/**
 * Resolve a format profile for a project type.
 * @param {string} projectType one of PROJECT_TYPES values
 * @returns {{headingRoles:object, unitRole:string, grouperTiers:object}}
 */
export function getProfile(projectType) {
  return FORMAT_PROFILES[projectType] || DEFAULT_PROFILE;
}
