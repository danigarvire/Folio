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
        { title: "Moodboard", type: "canvas", icon: "layout-dashboard" },
        { title: "Preface", type: "file", icon: "file" },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Volume 1", type: "folder", icon: "folder-open", children: [
          { title: "Chapter 1", type: "file", icon: "file" }
        ] },
        { title: "Afterword", type: "file", icon: "file" }
      ]
    },
    { 
      id: "script", 
      name: "TV Show", 
      icon: "tv", 
      order: 2, 
      description: "Series with episodes and sequences",
      structure: [
        { 
          title: "Show Dossier", 
          type: "folder",
          icon: "folder-open",
          children: [
            { title: "Concept", type: "folder", icon: "lightbulb", children: [
              { title: "Logline", type: "file", icon: "file" },
              { title: "Synopsis", type: "file", icon: "file" }
            ] },
            { title: "Structure", type: "folder", icon: "list-tree", children: [
              { title: "Beat Sheet", type: "file", icon: "file" }
            ] },
            { title: "Faces", type: "folder", icon: "users", children: [
              { title: "Character 1", type: "file", icon: "file" }
            ] },
            { title: "Places", type: "folder", icon: "map-pin", children: [
              { title: "Location 1", type: "file", icon: "file" }
            ] },
            { title: "Objects", type: "folder", icon: "box", children: [
              { title: "Prop 1", type: "file", icon: "file" }
            ] },
            { title: "Documentation", type: "folder", icon: "archive", children: [
              { title: "Research", type: "file", icon: "file" }
            ] }
          ]
        },
        { title: "Episode 1", type: "folder", icon: "clapperboard", children: [
          { title: "Scene 1", type: "file", icon: "file" }
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
        { title: "Sequence 1", type: "folder", icon: "film", children: [
          { title: "Scene 1", type: "file", icon: "file" }
        ] }
      ]
    },
    { 
      id: "essay", 
      name: "Essay", 
      icon: "newspaper", 
      order: 4, 
      description: "Essay or short nonfiction piece",
      structure: [
        { title: "Research", type: "folder", icon: "archive", children: [
            { title: "Document 1", type: "file", icon: "file" }
          ]
        },
        { title: "Outline", type: "file", icon: "list" },
        { title: "Manuscript", type: "file", icon: "scroll-text" }
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
