/**
 * Constants for Folio plugin
 */

export const VIEW_TYPE = "folio-view";
export const WRITER_TOOLS_VIEW_TYPE = "folio-writer-tools";

export const PROJECT_TYPES = {
  BOOK: "book",
  SCRIPT: "script",
  FILM: "film",
  ESSAY: "essay"
};

export const DEFAULT_SETTINGS = {
  booksPath: "projects",
  basePath: "projects",  // Legacy compatibility
  lastActiveBookPath: null,
  verboseLogs: false,
  defaultAuthor: "",
  defaultProjectType: "book",
  projectTemplates: [
    { 
      id: "book", 
      name: "Book", 
      icon: "book", 
      order: 1, 
      description: "Novel or written work",
      structure: [
        { title: "Preface", type: "file" },
        { title: "Moodboard", type: "canvas" },
        { title: "Volume 1", type: "folder", children: [] },
        { title: "Outline", type: "file" },
        { title: "Afterword", type: "file" }
      ]
    },
    { 
      id: "script", 
      name: "TV Show", 
      icon: "tv-minimal-play", 
      order: 2, 
      description: "Series with episodes and sequences",
      structure: [
        { 
          title: "Show Dossier", 
          type: "folder", 
          children: [
            { title: "Concept", type: "folder", children: [] },
            { title: "Structure", type: "folder", children: [] },
            { title: "Faces", type: "folder", children: [] },
            { title: "Places", type: "folder", children: [] },
            { title: "Objects", type: "folder", children: [] },
            { title: "Documentation", type: "folder", children: [] }
          ]
        },
        { title: "Episode 1", type: "folder", children: [] }
      ]
    },
    { 
      id: "film", 
      name: "Film", 
      icon: "clapperboard", 
      order: 3, 
      description: "Feature film or short",
      structure: [
        { title: "Moodboard", type: "canvas" },
        { title: "Sequence 1", type: "folder", children: [] },
        { title: "Outline", type: "file" }
      ]
    },
    { 
      id: "essay", 
      name: "Essay", 
      icon: "newspaper", 
      order: 4, 
      description: "Essay or short nonfiction piece",
      structure: [
        { title: "Documentation", type: "folder", children: [
            { title: "Document 1", type: "file" }
          ]
        },
        { title: "Outline", type: "file" },
        { title: "Manuscript", type: "file" }
      ]
    }
  ]
};

export const DEFAULT_BOOK_CONFIG = {
  basic: {
    title: "",
    author: [],
    subtitle: "",
    desc: "",
    uuid: "",
    created_at: new Date().toISOString(),
    projectType: "book", // Default project type
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
