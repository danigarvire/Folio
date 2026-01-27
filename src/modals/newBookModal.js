const { Modal, TFile } = require("obsidian");
import { PROJECT_TYPES } from '../constants/index.js';
import { ProjectTypeSelectorModal } from './projectTypeSelectorModal.js';

export class NewBookModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
    // Use default project type from settings if set
    const defaultType = plugin.settings?.defaultProjectType;
    this.selectedProjectType = defaultType || null;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Create new project" });

    const makeDivider = () => contentEl.createDiv({ cls: 'folio-modal-divider' });

    // Project Type row
    makeDivider();
    const typeRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const typeLeft = typeRow.createDiv({ cls: 'folio-modal-left' });
    typeLeft.createEl('div', { text: 'Project Type', cls: 'folio-modal-row-title' });
    typeLeft.createEl('div', { text: 'Select the type of project', cls: 'folio-modal-row-sub' });
    const typeRight = typeRow.createDiv({ cls: 'folio-modal-right' });
    
    // Get templates from settings
    const templates = this.plugin.settings?.projectTemplates || [];
    
    // Build type names from templates
    const typeNames = {};
    templates.forEach(t => {
      const emoji = { book: '📘', script: '📺', film: '🎬', essay: '📰' }[t.id] || '📄';
      typeNames[t.id] = `${emoji} ${t.name}`;
    });
    // Fallback for standard types
    if (!typeNames[PROJECT_TYPES.BOOK]) typeNames[PROJECT_TYPES.BOOK] = '📘 Book';
    if (!typeNames[PROJECT_TYPES.SCRIPT]) typeNames[PROJECT_TYPES.SCRIPT] = '📺 TV Show';
    if (!typeNames[PROJECT_TYPES.FILM]) typeNames[PROJECT_TYPES.FILM] = '🎬 Film';
    if (!typeNames[PROJECT_TYPES.ESSAY]) typeNames[PROJECT_TYPES.ESSAY] = '📰 Essay';
    
    // Button to open project type selector
    const typeButton = typeRight.createEl('button', { text: 'Select', cls: 'folio-project-type-button' });
    const updateButtonText = () => {
      typeButton.textContent = typeNames[this.selectedProjectType] || 'Select type';
    };
    
    typeButton.onclick = () => {
      const modal = new ProjectTypeSelectorModal(this.app, (projectType) => {
        this.selectedProjectType = projectType;
        updateButtonText();
      }, templates.length > 0 ? templates : null);
      modal.open();
    };
    
    updateButtonText();

    // Cover row
    makeDivider();
    const coverRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'folio-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'folio-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select cover image (optional)', cls: 'folio-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'folio-modal-right' });
    const coverBtn = coverRight.createEl('button', { text: 'Select Image' });
    // store selected cover in the modal instance
    this._selectedCover = null;
    coverBtn.onclick = () => {
      // create a hidden file input to open Finder
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const ab = ev.target.result; // ArrayBuffer
            this._selectedCover = { name: file.name, data: ab };
            coverBtn.textContent = 'Select Image';
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          console.warn('cover selection failed', err);
        }
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };

    // Title
    makeDivider();
    const titleRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'folio-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'folio-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter project title', cls: 'folio-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'folio-modal-right' });
    // responsive field width (max 320px or 60% of modal)
    const fieldWidth = 'min(320px, 60%)';
    const titleInput = titleRight.createEl('input', { type: 'text', placeholder: 'Project title', cls: 'folio-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}

    // Subtitle
    makeDivider();
    const subRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'folio-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'folio-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'folio-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'folio-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', placeholder: 'Subtitle', cls: 'folio-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}

    // Target word count (input is in 1k units: e.g., 20 => 20,000)
    makeDivider();
    const targetRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'folio-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'folio-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'folio-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'folio-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', placeholder: 'e.g., 20 (20k) or 20000', cls: 'folio-modal-input' });
    try { targetInput.style.width = fieldWidth; } catch {}

    // Author - use default from settings
    makeDivider();
    const authorRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'folio-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'folio-modal-row-title' });
    authorLeft.createEl('div', { text: 'Enter author names, separate multiple authors with commas', cls: 'folio-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'folio-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', placeholder: 'Author', cls: 'folio-modal-input' });
    // Pre-fill with default author from settings
    const defaultAuthor = this.plugin.settings?.defaultAuthor || '';
    if (defaultAuthor) {
      authorInput.value = defaultAuthor;
    }
    try { authorInput.style.width = fieldWidth; } catch {}

    // Description
    makeDivider();
    const descRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'folio-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'folio-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'folio-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'folio-modal-right' });
    const descInput = descRight.createEl('textarea', { placeholder: 'Book description', cls: 'folio-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; } catch {}

    // Bottom divider + actions
    makeDivider();
    const actions = contentEl.createDiv({ cls: 'folio-modal-actions' });
    const createBtn = actions.createEl('button', { text: 'Create', cls: 'mod-cta folio-modal-create' });

    createBtn.onclick = async () => {
      const title = titleInput.value.trim();
      if (!title) return;

      // Get selected project type from dropdown; fallback to button label if unset
      let projectType = this.selectedProjectType;
      if (!projectType) {
        const btnText = typeButton.textContent || '';
        if (btnText.includes('Essay')) projectType = PROJECT_TYPES.ESSAY;
        else if (btnText.includes('TV Show') || btnText.includes('TV')) projectType = PROJECT_TYPES.SCRIPT;
        else if (btnText.includes('Film')) projectType = PROJECT_TYPES.FILM;
        else projectType = PROJECT_TYPES.BOOK;
      }
      console.debug && console.debug('Creating project with type:', projectType);
      
      // Get template structure for the selected project type
      const selectedTemplate = templates.find(t => t.id === projectType);
      const templateStructure = selectedTemplate?.structure || null;
      
      // capture fields before closing the modal (closing may remove DOM inputs)
      const subtitleVal = subtitleInput.value.trim();
      const authorVal = authorInput.value.trim();
      const descVal = descInput.value.trim();
      const targetValRaw = targetInput.value;
      const targetValNum = parseFloat(targetValRaw) || 0;
      this.close();
      // create book folder and base files WITH project type and template structure
      await this.plugin.createBook(title, projectType, templateStructure);
      // normalize base path to match createBook's behavior
      const basePath = (this.plugin.settings && this.plugin.settings.basePath) ? String(this.plugin.settings.basePath).replace(/\/+/g, '/') : 'projects';
      const bookPath = `${basePath}/${title}`.replace(/\/+/g, "/");
      try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('NewBookModal.create captured', { title, projectType, subtitleVal, authorVal, descVal, targetValNum, bookPath }); } catch {}
      await this.plugin.waitForFolderSync(bookPath);
      // Ensure the plugin rescans the vault so the new book appears in booksIndex
      await this.plugin.refresh();
      const book = this.plugin.booksIndex.find((b) => b.path === bookPath) || this.plugin.booksIndex.find((b) => b.name === title);
      if (book) {
        // Persist initial metadata ASAP so subsequent stats saves won't overwrite it
        try {
          let cfg = {};
          if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(book)) || {};
          cfg.basic = cfg.basic || {};
          cfg.basic.title = title;
          cfg.basic.subtitle = subtitleVal || '';
          cfg.basic.author = authorVal ? authorVal.split(',').map(s=>s.trim()).filter(Boolean) : (cfg.basic.author || []);
          cfg.basic.desc = descVal || '';
          cfg.basic.created_at = cfg.basic.created_at || new Date().toISOString();
          cfg.stats = cfg.stats || {};
          const targ = targetValNum || 0;
          if (targ > 0) {
            cfg.stats.target_total_words = targ >= 1000 ? Math.round(targ) : Math.round(targ * 1000);
          } else {
            cfg.stats.target_total_words = cfg.stats.target_total_words || 0;
          }
          if (this._selectedCover && this._selectedCover.name && this._selectedCover.data) {
            try {
              const destName = `${Date.now()}-${this._selectedCover.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
              const destPath = `${book.path}/misc/cover/${destName}`;
              if (this.plugin.app.vault.adapter && typeof this.plugin.app.vault.adapter.writeBinary === 'function') {
                const uint8 = new Uint8Array(this._selectedCover.data);
                await this.plugin.app.vault.adapter.writeBinary(destPath, uint8);
              } else {
                const blob = new Blob([this._selectedCover.data]);
                const arrayBuf = await blob.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuf);
                try { await this.plugin.app.vault.create(destPath, uint8); } catch (e) { console.warn('fallback cover write failed', e); }
              }
              cfg.basic.cover = `misc/cover/${destName}`;
            } catch (e) {
              console.warn('saving selected cover failed', e);
            }
          }
          if (this.plugin.saveBookConfig) {
            await this.plugin.saveBookConfig(book, cfg);
            try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('NewBookModal saved initial config for', book.path, { basic: cfg.basic }); } catch {}
          }
        } catch (e) {
          console.warn(e);
        }

        // create initial volume/chapter after metadata persisted (only if no template structure was used)
        if (!templateStructure || templateStructure.length === 0) {
          if (projectType === PROJECT_TYPES.SCRIPT) {
            // For script projects, create Episode 1/Sequence 1/Scene 1
            const episodeName = "Episode 1";
            const sequenceName = "Sequence 1";
            const sceneName = "Scene 1";
            
            await this.plugin.createVolume(book, episodeName);
            await this.plugin.createVolume({ path: `${book.path}/${episodeName}` }, sequenceName);
            await this.plugin.createChapter({ path: `${book.path}/${episodeName}/${sequenceName}` }, sceneName, projectType);
          } else if (projectType === PROJECT_TYPES.FILM) {
            // For film projects, structure is already created by ensureFilmStructure
            // No additional volumes/chapters needed
          } else if (projectType === PROJECT_TYPES.ESSAY) {
            // Essay structure is created by ensureEssayStructure (Documentation, Outline, Manuscript)
            // No additional volumes/chapters needed
          } else {
            // For book projects, create Volume 1/Chapter 1
            const volumeName = "Volume 1";
            const chapterName = "Chapter 1";
            
            await this.plugin.createVolume(book, volumeName);
            await this.plugin.createChapter({ path: `${book.path}/${volumeName}` }, chapterName, projectType);
          }
        }

        // Refresh to get updated book structure with volumes/chapters
        await this.plugin.refresh();

        // Now set active book after refresh so it has full structure
        const updatedBook = this.plugin.booksIndex.find((b) => b.path === book.path);
        if (updatedBook) {
          this.plugin.activeBook = updatedBook;
          try {
            this.plugin.settings = this.plugin.settings || {};
            this.plugin.settings.lastActiveBookPath = updatedBook.path;
            await this.plugin.saveSettings();
          } catch (e) {
            console.warn('failed to persist lastActiveBookPath', e);
          }
        }
      }
      
      // Final render with fully loaded book
      this.plugin.rerenderViews();
    };

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        createBtn.click();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    titleInput.focus();
  }
}
