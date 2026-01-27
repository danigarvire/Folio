/**
 * Constants for Novelist plugin
 */

export const VIEW_TYPE = "novelist-view";

export const DEFAULT_SETTINGS = {
  booksPath: "projects",
  basePath: "projects",  // Legacy compatibility
  lastActiveBookPath: null,
  verboseLogs: false,
};

export const DEFAULT_BOOK_CONFIG = {
  basic: {
    title: "",
    author: [],
    subtitle: "",
    desc: "",
    uuid: "",
    created_at: new Date().toISOString(),
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
    last_writing_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    per_chapter: {},
  },
  export: {
    default_format: "pdf",
    template: "default",
    include_cover: true,
  },
};

export const BOOK_STRUCTURE_FILES = [
  { name: "Preface.md", id: "preface" },
  { name: "Outline.md", id: "outline" },
  { name: "Afterword.md", id: "afterword" },
];
