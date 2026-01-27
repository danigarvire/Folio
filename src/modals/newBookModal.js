const { Modal, TFile } = require("obsidian");

export class NewBookModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Create new book" });

    const makeDivider = () => contentEl.createDiv({ cls: 'novelist-modal-divider' });

    // Template row
    makeDivider();
    const tplRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const tplLeft = tplRow.createDiv({ cls: 'novelist-modal-left' });
    tplLeft.createEl('div', { text: 'Template', cls: 'novelist-modal-row-title' });
    tplLeft.createEl('div', { text: 'Please select a book template', cls: 'novelist-modal-row-sub' });
    const tplRight = tplRow.createDiv({ cls: 'novelist-modal-right' });
    const tplSelect = tplRight.createEl('select', { cls: 'novelist-template-select' });
    tplSelect.createEl('option', { text: 'default', value: 'default' });

    // Cover row
    makeDivider();
    const coverRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'novelist-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'novelist-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select cover image (optional)', cls: 'novelist-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'novelist-modal-right' });
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
    const titleRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'novelist-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'novelist-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter book title', cls: 'novelist-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'novelist-modal-right' });
    // responsive field width (max 320px or 60% of modal)
    const fieldWidth = 'min(320px, 60%)';
    const titleInput = titleRight.createEl('input', { type: 'text', placeholder: 'Book title', cls: 'novelist-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}

    // Subtitle
    makeDivider();
    const subRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'novelist-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'novelist-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'novelist-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'novelist-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', placeholder: 'Subtitle', cls: 'novelist-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}

    // Target word count (input is in 1k units: e.g., 20 => 20,000)
    makeDivider();
    const targetRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'novelist-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'novelist-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'novelist-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'novelist-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', placeholder: 'e.g., 20 (20k) or 20000', cls: 'novelist-modal-input' });
    try { targetInput.style.width = fieldWidth; } catch {}

    // Author
    makeDivider();
    const authorRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'novelist-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'novelist-modal-row-title' });
    authorLeft.createEl('div', { text: 'Enter author names, separate multiple authors with commas', cls: 'novelist-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'novelist-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', placeholder: 'Author', cls: 'novelist-modal-input' });
    try { authorInput.style.width = fieldWidth; } catch {}

    // Description
    makeDivider();
    const descRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'novelist-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'novelist-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'novelist-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'novelist-modal-right' });
    const descInput = descRight.createEl('textarea', { placeholder: 'Book description', cls: 'novelist-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; } catch {}

    // Bottom divider + actions
    makeDivider();
    const actions = contentEl.createDiv({ cls: 'novelist-modal-actions' });
    const createBtn = actions.createEl('button', { text: 'Create', cls: 'mod-cta novelist-modal-create' });

    createBtn.onclick = async () => {
      const title = titleInput.value.trim();
      if (!title) return;
      // capture fields before closing the modal (closing may remove DOM inputs)
      const subtitleVal = subtitleInput.value.trim();
      const authorVal = authorInput.value.trim();
      const descVal = descInput.value.trim();
      const targetValRaw = targetInput.value;
      const targetValNum = parseFloat(targetValRaw) || 0;
      this.close();
      // create book folder and base files (createBook should NOT refresh)
      await this.plugin.createBook(title);
      // normalize base path to match createBook's behavior
      const basePath = (this.plugin.settings && this.plugin.settings.basePath) ? String(this.plugin.settings.basePath).replace(/\/+/g, '/') : 'projects';
      const bookPath = `${basePath}/${title}`.replace(/\/+/g, "/");
      try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('NewBookModal.create captured', { title, subtitleVal, authorVal, descVal, targetValNum, bookPath }); } catch {}
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

        // create initial volume/chapter after metadata persisted
        await this.plugin.createVolume(book, "Volume 1");
        await this.plugin.createChapter({ path: `${book.path}/Volume 1` }, "Chapter 1");

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
