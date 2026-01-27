/**
 * Book Service - Handles book management (create, scan, delete)
 */

import { TFile, TFolder } from 'obsidian';
import { BOOK_STRUCTURE_FILES, PROJECT_TYPES } from '../constants/index.js';
import { bookChapterTemplate } from '../templates/project/book.js';
import { scriptChapterTemplate } from '../templates/project/script.js';

export class BookService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  /**
   * Scan for all books in the base path
   */
  async scanBooks(basePath) {
    const base = this.app.vault.getAbstractFileByPath(basePath);
    if (!(base instanceof TFolder)) return [];

    const booksIndex = [];
    const seenPaths = new Set();

    for (const bookFolder of base.children) {
      if (!bookFolder || !bookFolder.path) continue;
      if (seenPaths.has(bookFolder.path)) continue;
      seenPaths.add(bookFolder.path);
      if (!(bookFolder instanceof TFolder)) continue;

      const book = {
        name: bookFolder.name,
        path: bookFolder.path,
        cover: null,
        volumes: [],
      };

      // Cleanup legacy misc/metadata folder if present
      try {
        const legacyMetaPath = `${bookFolder.path}/misc/metadata`;
        const legacyMetaAf = this.app.vault.getAbstractFileByPath(legacyMetaPath);
        if (legacyMetaAf) {
          await this.app.vault.delete(legacyMetaAf, true);
        }
      } catch (e) {
        // ignore cleanup failures
      }

      for (const child of bookFolder.children) {
        // Ignore misc folder
        if (child instanceof TFolder && child.name === "misc") {
          continue;
        }

        // Collect volumes
        if (child instanceof TFolder) {
          const volume = {
            name: child.name,
            path: child.path,
            chapters: [],
            collapsed: false,
          };

          for (const f of child.children) {
            if (f instanceof TFile && f.extension === "md") {
              volume.chapters.push({
                name: f.basename,
                path: f.path,
              });
            }
          }

          book.volumes.push(volume);
        }
      }

      // Attempt to load configured cover
      try {
        const cfg = (await this.configService.loadBookConfig({ path: book.path })) || {};
        const coverRel = cfg?.basic?.cover;
        if (coverRel) {
          const coverPath = `${book.path}/${coverRel}`;
          const coverFile = this.app.vault.getAbstractFileByPath(coverPath);
          if (coverFile instanceof TFile) {
            book.cover = coverFile;
          }
        } else {
          // fallback: if misc/cover has any file, pick the first one
          const coverFolderPath = `${book.path}/misc/cover`;
          const cf = this.app.vault.getAbstractFileByPath(coverFolderPath);
          if (cf && cf.children && cf.children.length > 0) {
            const first = cf.children.find((c) => c instanceof TFile);
            if (first) book.cover = first;
          }
        }
      } catch (e) {
        // ignore cover load failures
      }

      booksIndex.push(book);
    }

    // Sort books alphabetically
    booksIndex.sort((a, b) => a.name.localeCompare(b.name));
    return booksIndex;
  }

  /**
   * Create a new book with default structure
   */
  async createBook(basePath, name, projectType = 'book') {
    if (!name) return;
    const path = `${basePath}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;

    // Create book root folder
    await this.app.vault.createFolder(path);

    // Create misc structure
    const miscPath = `${path}/misc`;
    const coverPath = `${miscPath}/cover`;

    await this.app.vault.createFolder(miscPath);
    await this.app.vault.createFolder(coverPath);

    // Create canonical book config file
    try {
      const bookConfigPath = `${path}/misc/book-config.json`;
      const now = new Date().toISOString();
      
      // Different default tree structure for script, essay, vs book projects
      const defaultTree = projectType === PROJECT_TYPES.SCRIPT ? [
        { 
          id: 'series-framework', 
          title: 'Show Dossier', 
          type: 'group', 
          path: 'Show Dossier', 
          order: 1, 
          default_status: 'draft', 
          is_expanded: false, 
          created_at: now, 
          last_modified: now, 
          children: [
            { id: 'concept', title: 'Concept', type: 'group', path: 'Show Dossier/Concept', order: 1, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'structure', title: 'Structure', type: 'group', path: 'Show Dossier/Structure', order: 2, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'faces', title: 'Faces', type: 'group', path: 'Show Dossier/Faces', order: 3, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'places', title: 'Places', type: 'group', path: 'Show Dossier/Places', order: 4, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'objects', title: 'Objects', type: 'group', path: 'Show Dossier/Objects', order: 5, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
            { id: 'documentation', title: 'Documentation', type: 'group', path: 'Show Dossier/Documentation', order: 6, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] }
          ]
        },
        { id: 'episode1', title: 'Episode 1', type: 'group', path: 'Episode 1', order: 2, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] }
      ] : projectType === PROJECT_TYPES.ESSAY ? [
        { id: 'documentation', title: 'Documentation', type: 'group', path: 'Documentation', order: 1, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [
            { id: 'document1', title: 'Document 1', type: 'file', path: 'Documentation/Document 1.md', order: 1, default_status: 'draft', created_at: now, last_modified: now }
          ]
        },
        { id: 'outline', title: 'Outline', type: 'file', path: 'Outline.md', order: 2, default_status: 'draft', created_at: now, last_modified: now },
        { id: 'manuscript', title: 'Manuscript', type: 'file', path: 'Manuscript.md', order: 3, default_status: 'draft', created_at: now, last_modified: now }
      ] : [
        { id: 'preface', title: 'Preface', type: 'file', path: 'Preface.md', order: 1, default_status: 'draft', created_at: now, last_modified: now },
        { id: 'moodboard', title: 'Moodboard', type: 'canvas', path: 'Moodboard.canvas', order: 2, default_status: 'draft', created_at: now, last_modified: now },
        { id: 'volume1', title: 'Volume 1', type: 'group', path: 'Volume 1', order: 3, default_status: 'draft', is_expanded: false, created_at: now, last_modified: now, children: [] },
        { id: 'outline', title: 'Outline', type: 'file', path: 'Outline.md', order: 4, default_status: 'draft', created_at: now, last_modified: now },
        { id: 'afterword', title: 'Afterword', type: 'file', path: 'Afterword.md', order: 5, default_status: 'draft', created_at: now, last_modified: now }
      ];
      
      const defaultConfig = {
        basic: {
          title: name,
          author: [],
          subtitle: "",
          desc: "",
          uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`,
          created_at: now,
          projectType: projectType, // Save project type
        },
        structure: {
          tree: defaultTree
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
          last_modified: now
        },
        export: {
          default_format: 'pdf',
          template: 'default',
          include_cover: true
        }
      };
      
      if (!this.app.vault.getAbstractFileByPath(bookConfigPath)) {
        await this.app.vault.create(bookConfigPath, JSON.stringify(defaultConfig, null, 2));
      }
    } catch (e) {
      console.warn('createBook: failed to create book-config.json in misc', e);
    }

    // Ensure base structure based on project type
    const bookFolder = this.app.vault.getAbstractFileByPath(path);
    if (bookFolder instanceof TFolder) {
      if (projectType === PROJECT_TYPES.SCRIPT) {
        await this.ensureScriptStructure(bookFolder);
      } else if (projectType === PROJECT_TYPES.FILM) {
        await this.ensureFilmStructure(bookFolder);
      } else if (projectType === PROJECT_TYPES.ESSAY) {
        await this.ensureEssayStructure(bookFolder);
      } else {
        await this.ensureBookBaseStructure(bookFolder);
      }
    }
  }

  /**
   * Ensure essay project has minimal structure: Documentation folder, Document 1.md, Outline.md, Manuscript.md
   */
  async ensureEssayStructure(bookFolder) {
    const vault = this.app.vault;

    const documentationPath = `${bookFolder.path}/Documentation`;
    if (!vault.getAbstractFileByPath(documentationPath)) {
      await vault.createFolder(documentationPath);
    }

    const document1Path = `${documentationPath}/Document 1.md`;
    if (!vault.getAbstractFileByPath(document1Path)) {
      await vault.create(document1Path, `---\nprojectType: essay\n---\n\n`);
    }

    const outlinePath = `${bookFolder.path}/Outline.md`;
    if (!vault.getAbstractFileByPath(outlinePath)) {
      await vault.create(outlinePath, `---\nprojectType: essay\n---\n\n`);
    }

    const manuscriptPath = `${bookFolder.path}/Manuscript.md`;
    if (!vault.getAbstractFileByPath(manuscriptPath)) {
      await vault.create(manuscriptPath, `---\nprojectType: essay\n---\n\n`);
    }
  }

  /**
   * Ensure script project has screenplay-specific structure
   */
  async ensureScriptStructure(bookFolder) {
    const vault = this.app.vault;
    
    // Create Show Dossier folder structure FIRST (to ensure it appears before Episode)
    const biblePath = `${bookFolder.path}/Show Dossier`;
    if (!vault.getAbstractFileByPath(biblePath)) {
      await vault.createFolder(biblePath);
    }
    
    // Create Show Dossier subfolders in order: Concept, Structure, Faces, Places, Objects, Documentation
    const conceptPath = `${biblePath}/Concept`;
    const structurePath = `${biblePath}/Structure`;
    const facesPath = `${biblePath}/Faces`;
    const placesPath = `${biblePath}/Places`;
    const objectsPath = `${biblePath}/Objects`;
    const documentationPath = `${biblePath}/Documentation`;
    
    if (!vault.getAbstractFileByPath(conceptPath)) {
      await vault.createFolder(conceptPath);
    }
    
    if (!vault.getAbstractFileByPath(structurePath)) {
      await vault.createFolder(structurePath);
    }
    
    if (!vault.getAbstractFileByPath(facesPath)) {
      await vault.createFolder(facesPath);
    }
    
    if (!vault.getAbstractFileByPath(placesPath)) {
      await vault.createFolder(placesPath);
    }
    
    if (!vault.getAbstractFileByPath(objectsPath)) {
      await vault.createFolder(objectsPath);
    }
    
    if (!vault.getAbstractFileByPath(documentationPath)) {
      await vault.createFolder(documentationPath);
    }
    
    // Create Concept files in order
    const conceptFiles = ["Logline.md", "Theme.md", "Premise & Tone.md", "Moodboard.canvas"];
    for (const file of conceptFiles) {
      const filePath = `${conceptPath}/${file}`;
      if (!vault.getAbstractFileByPath(filePath)) {
        await vault.create(filePath, file.endsWith('.canvas') ? "" : `---\nprojectType: script\n---\n\n`);
      }
    }
    
    // Create Structure files in order
    const structureFiles = ["Arcs.md", "Outline.md"];
    for (const file of structureFiles) {
      const filePath = `${structurePath}/${file}`;
      if (!vault.getAbstractFileByPath(filePath)) {
        await vault.create(filePath, `---\nprojectType: script\n---\n\n`);
      }
    }
    
    // Create initial documentation file
    const document1Path = `${documentationPath}/Document 1.md`;
    if (!vault.getAbstractFileByPath(document1Path)) {
      await vault.create(document1Path, `---\nprojectType: script\n---\n\n`);
    }
    
    // Create initial character file
    const character1Path = `${facesPath}/Character 1.md`;
    if (!vault.getAbstractFileByPath(character1Path)) {
      await vault.create(character1Path, `---\nprojectType: script\n---\n\n`);
    }
    
    // Create initial location file
    const location1Path = `${placesPath}/Location 1.md`;
    if (!vault.getAbstractFileByPath(location1Path)) {
      await vault.create(location1Path, `---\nprojectType: script\n---\n\n`);
    }
    
    // Create initial object file
    const object1Path = `${objectsPath}/Object 1.md`;
    if (!vault.getAbstractFileByPath(object1Path)) {
      await vault.create(object1Path, `---\nprojectType: script\n---\n\n`);
    }
    
    // Create Episode 1 folder and Sequence 1 inside it
    const episode1Path = `${bookFolder.path}/Episode 1`;
    if (!vault.getAbstractFileByPath(episode1Path)) {
      await vault.createFolder(episode1Path);
    }
    
    const sequence1Path = `${episode1Path}/Sequence 1`;
    if (!vault.getAbstractFileByPath(sequence1Path)) {
      await vault.createFolder(sequence1Path);
    }
  }

  /**
   * Ensure film project has simplified structure
   */
  async ensureFilmStructure(bookFolder) {
    const vault = this.app.vault;
    
    // Create Film Dossier folder
    const dossierPath = `${bookFolder.path}/Film Dossier`;
    if (!vault.getAbstractFileByPath(dossierPath)) {
      await vault.createFolder(dossierPath);
    }
    
    // Create files inside Film Dossier
    const moodboardPath = `${dossierPath}/Moodboard.canvas`;
    if (!vault.getAbstractFileByPath(moodboardPath)) {
      await vault.create(moodboardPath, "");
    }
    
    const outlinePath = `${dossierPath}/Outline.md`;
    if (!vault.getAbstractFileByPath(outlinePath)) {
      await vault.create(outlinePath, `---\nprojectType: film\n---\n\n`);
    }
    
    const themePath = `${dossierPath}/Theme & Tone.md`;
    if (!vault.getAbstractFileByPath(themePath)) {
      await vault.create(themePath, `---\nprojectType: film\n---\n\n`);
    }
    
    // Create Sequence 1 folder
    const sequence1Path = `${bookFolder.path}/Sequence 1`;
    if (!vault.getAbstractFileByPath(sequence1Path)) {
      await vault.createFolder(sequence1Path);
    }
    
    // Create Scene 1.md inside Sequence 1
    const scene1Path = `${sequence1Path}/Scene 1.md`;
    if (!vault.getAbstractFileByPath(scene1Path)) {
      await vault.create(scene1Path, `---\nprojectType: film\n---\n\n`);
    }
  }

  /**
   * Ensure book has basic structure (Preface, Outline, etc.)
   */
  async ensureBookBaseStructure(bookFolder) {
    const vault = this.app.vault;
    const filesToCreate = ["Preface.md", "Outline.md", "Moodboard.canvas", "Afterword.md"];

    for (const file of filesToCreate) {
      const filePath = `${bookFolder.path}/${file}`;
      if (!vault.getAbstractFileByPath(filePath)) {
        await vault.create(filePath, "");
      }
    }

    const miscPath = `${bookFolder.path}/misc`;
    const coverPath = `${miscPath}/cover`;

    if (!vault.getAbstractFileByPath(miscPath)) {
      await vault.createFolder(miscPath);
    }

    if (!vault.getAbstractFileByPath(coverPath)) {
      await vault.createFolder(coverPath);
    }

    // Ensure canonical book-config.json exists
    try {
      const bmPath = `${bookFolder.path}/misc/book-config.json`;
      if (!vault.getAbstractFileByPath(bmPath)) {
        const now = new Date().toISOString();
        const defaultConfig = {
          basic: {
            title: bookFolder.name,
            author: [],
            subtitle: "",
            desc: "",
            uuid: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`,
            created_at: now
          },
          structure: { tree: [] },
          stats: {
            total_words: 0,
            target_total_words: 10000,
            progress_by_words: 0,
            progress_by_chapter: 0,
            daily_words: {},
            writing_days: 0,
            average_daily_words: 0,
            last_writing_date: now,
            last_modified: now
          },
          export: {
            default_format: 'pdf',
            template: 'default',
            include_cover: true
          }
        };
        await vault.create(bmPath, JSON.stringify(defaultConfig, null, 2));
      }
    } catch (e) {
      console.warn('ensureBookBaseStructure: failed to create book-config.json in misc', e);
    }
  }

  /**
   * Create a new volume (folder) in a book
   */
  async createVolume(book, name) {
    if (!name) return;
    const path = `${book.path}/${name}`;
    if (await this.app.vault.adapter.exists(path)) return;
    await this.app.vault.createFolder(path);
  }

  /**
   * Create a new chapter (markdown file) in a volume
   */
  async createChapter(volume, name, projectType = 'book') {
    if (!name) return;
    const path = `${volume.path}/${name}.md`;
    if (await this.app.vault.adapter.exists(path)) return;
    
    // Use template based on project type
    const template = projectType === PROJECT_TYPES.SCRIPT
      ? scriptChapterTemplate
      : bookChapterTemplate;
    
    const content = template({ title: name });
    await this.app.vault.create(path, content);
  }

  /**
   * Check if a file is a volume folder
   */
  isVolumeFolder(file, booksIndex) {
    try {
      return booksIndex.some((b) =>
        b.volumes.some((v) => v.path === file.path)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a file is a chapter file
   */
  isChapterFile(file, booksIndex) {
    try {
      return booksIndex.some((b) =>
        b.volumes.some((v) =>
          v.chapters.some((c) => c.path === file.path)
        )
      );
    } catch {
      return false;
    }
  }
}
