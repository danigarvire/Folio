/**
 * Constants for Folio plugin
 */

export const VIEW_TYPE = "folio-view";
export const WRITER_TOOLS_VIEW_TYPE = "folio-writer-tools";
export const TIMELINE_VIEW_TYPE = "folio-timeline";
export const BEAT_BOARD_VIEW_TYPE = "folio-beat-board";

export const PROJECT_TYPES = {
  BOOK: "book",
  SCRIPT: "script",
  FILM: "film",
  ESSAY: "essay"
};

export const DEFAULT_SETTINGS = {
  basePath: "projects",
  lastActiveBookPath: null,
  verboseLogs: false,
  defaultAuthor: "",
  defaultProjectType: "book",
  resourceLanguage: "en",
  expandedFolders: [],
  focusSoundEnabled: true,
  focusPomodoroEnabled: false,
  focusBreakMinutes: 5,
  projectTemplates: [
    {
      id: "book",
      name: "Book",
      icon: "book",
      order: 1,
      description: "Novel or long-form prose",
      structure: [
        { title: "Moodboard", type: "canvas", icon: "layout-dashboard" },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Characters", type: "folder", icon: "users", children: [
          { title: "Character 1", type: "file", icon: "user" }
        ] },
        { title: "Research", type: "folder", icon: "archive", children: [
          { title: "Note 1", type: "file", icon: "file" }
        ] },
        // The "Drafts" shelf holds every draft; one is current (drives the strip).
        { title: "Drafts", type: "folder", icon: "layers", shelf: true, children: [
          { title: "Draft 1", type: "folder", icon: "book", draft: true, children: [
            { title: "Chapter 1", type: "file", icon: "file" }
          ] }
        ] }
      ]
    },
    {
      id: "script",
      name: "TV Show",
      icon: "tv",
      order: 2,
      description: "Series — bible, outline, and episode drafts",
      structure: [
        { title: "Show Bible", type: "folder", icon: "book-open", children: [
          { title: "Logline & Synopsis", type: "file", icon: "file" },
          { title: "Characters", type: "folder", icon: "users", children: [
            { title: "Character 1", type: "file", icon: "user" }
          ] },
          { title: "World", type: "folder", icon: "map-pin", children: [
            { title: "Location 1", type: "file", icon: "file" }
          ] }
        ] },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Drafts", type: "folder", icon: "layers", shelf: true, children: [
          { title: "Draft 1", type: "folder", icon: "clapperboard", draft: true, children: [
            { title: "Episode 1", type: "file", icon: "file" }
          ] }
        ] }
      ]
    },
    {
      id: "film",
      name: "Film",
      icon: "clapperboard",
      order: 3,
      description: "Feature film or short",
      structure: [
        { title: "Moodboard", type: "canvas", icon: "layout-dashboard" },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Characters", type: "folder", icon: "users", children: [
          { title: "Character 1", type: "file", icon: "user" }
        ] },
        // A film is one screenplay file → a single-file draft on the shelf.
        { title: "Drafts", type: "folder", icon: "layers", shelf: true, children: [
          { title: "Screenplay", type: "file", icon: "film", draft: true }
        ] }
      ]
    },
    {
      id: "essay",
      name: "Essay",
      icon: "newspaper",
      order: 4,
      description: "Essay or short nonfiction",
      structure: [
        { title: "Research", type: "folder", icon: "archive", children: [
          { title: "Source 1", type: "file", icon: "file" }
        ] },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Drafts", type: "folder", icon: "layers", shelf: true, children: [
          { title: "Manuscript", type: "file", icon: "scroll-text", draft: true }
        ] }
      ]
    }
  ]
};

// Use a factory function so timestamps are generated at call time, not module load time
export function makeDefaultBookConfig() {
  const now = new Date().toISOString();
  return {
    basic: {
      title: "",
      author: [],
      subtitle: "",
      desc: "",
      uuid: "",
      created_at: now,
      projectType: "book",
    },
    structure: {
      tree: [],
    },
    stats: {
      total_words: 0,
      target_total_words: 10000,
      progress_by_words: 0,
      progress_by_chapter: 0,
      daily_words: {},
      writing_days: 0,
      average_daily_words: 0,
      last_writing_date: now,
      last_modified: now,
      per_chapter: {},
    },
    export: {
      default_format: "pdf",
      template: "default",
      include_cover: true,
    },
  };
}

/** @deprecated Use makeDefaultBookConfig() instead */
export const DEFAULT_BOOK_CONFIG = makeDefaultBookConfig();

// Per-scene/chapter writing status. Stored on the tree node (and mirrored to
// the file's frontmatter `status:`). Ordered from earliest to latest stage.
export const SCENE_STATUSES = [
  { id: "todo", label: "To-do" },
  // id stays "draft" (colours/frontmatter/defaults unchanged); label avoids
  // clashing with the "Draft" manuscript folder.
  { id: "draft", label: "In progress" },
  { id: "revised", label: "Revised" },
  { id: "final", label: "Final" },
];

const SCENE_STATUS_CYCLE = [null, "todo", "draft", "revised", "final"];

/** Next status when cycling (clicking the dot): none → todo → … → final → none. */
export function nextSceneStatus(current) {
  const i = SCENE_STATUS_CYCLE.indexOf(current || null);
  return SCENE_STATUS_CYCLE[(i + 1) % SCENE_STATUS_CYCLE.length];
}

/** Human label for a status id, or null. */
export function sceneStatusLabel(id) {
  return SCENE_STATUSES.find((s) => s.id === id)?.label || null;
}

export const BOOK_STRUCTURE_FILES = [
  { name: "Preface.md", id: "preface" },
  { name: "Outline.md", id: "outline" },
  { name: "Afterword.md", id: "afterword" },
];
