const { Modal, TFile } = require("obsidian");

export class EditBookModal extends Modal {
  constructor(plugin, book) {
    super(plugin.app);
    this.plugin = plugin;
    this.book = book;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Edit book" });

    // Prefer loading the full book-config.json, fall back to legacy meta/frontmatter
    let meta = {};
    let cfg = {};
    try {
      if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(this.book)) || {};
    } catch {}

    if (cfg && cfg.basic) {
      meta.title = cfg.basic.title || this.book.name || "";
      meta.subtitle = cfg.basic.subtitle || "";
      meta.author = Array.isArray(cfg.basic.author) ? cfg.basic.author.join(', ') : (cfg.basic.author || "");
      meta.description = cfg.basic.desc || cfg.basic.description || "";
    } else {
      try {
        if (this.plugin.loadBookMeta) meta = (await this.plugin.loadBookMeta(this.book)) || {};
      } catch {}
      try {
        if (!meta || Object.keys(meta).length === 0) {
          const fm = await this.plugin.readBookMetadata(this.book);
          if (fm) meta = Object.assign({}, meta, fm);
        }
      } catch {}
    }

    // unify field sizing for better readability (responsive and narrower)
    const fieldWidth = 'min(320px, 60%)';

    // Cover selector — prefill if config has cover
    let selectedCover = null;
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const coverRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'novelist-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'novelist-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select image (optional)', cls: 'novelist-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'novelist-modal-right' });
    const coverBtn = coverRight.createEl('button', { text: 'Select Image' });
    try {
      const existingCover = cfg?.basic?.cover || '';
      if (existingCover) {
        // keep the button text constant; we still prefill selectedCover
        const baseName = existingCover.split('/').pop();
        selectedCover = { name: baseName, data: null };
      }
    } catch {}
    coverBtn.onclick = () => {
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
            const ab = ev.target.result;
            selectedCover = { name: file.name, data: ab };
            coverBtn.textContent = 'Select Image';
          };
          reader.readAsArrayBuffer(file);
        } catch (err) { console.warn('cover selection failed', err); }
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };

    // Title row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const titleRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'novelist-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'novelist-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter book title', cls: 'novelist-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'novelist-modal-right' });
    const titleInput = titleRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}
    titleInput.value = meta.title || this.book.name || '';

    // Subtitle row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const subRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'novelist-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'novelist-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'novelist-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'novelist-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}
    subtitleInput.value = meta.subtitle || '';

    // Author row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const authorRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'novelist-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'novelist-modal-row-title' });
    authorLeft.createEl('div', { text: 'Enter author names, separate multiple authors with commas', cls: 'novelist-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'novelist-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', cls: 'novelist-modal-input' });
    try { authorInput.style.width = fieldWidth; } catch {}
    authorInput.value = meta.author || '';

    // Description row
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const descRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'novelist-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'novelist-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'novelist-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'novelist-modal-right' });
    const descInput = descRight.createEl('textarea', { cls: 'novelist-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; descInput.style.maxWidth = '100%'; } catch {}
    descInput.value = meta.description || '';

    // Target row (1k units)
    contentEl.createDiv({ cls: 'novelist-modal-divider' });
    const targetRow = contentEl.createDiv({ cls: 'novelist-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'novelist-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'novelist-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'novelist-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'novelist-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', cls: 'novelist-modal-input', placeholder: 'e.g., 20 (20k) or 20000' });
    // detect existing target keys and present a human-friendly value (match NewBook modal scale in 1k)
    const existingTarget = cfg?.basic?.targetWordCount ?? cfg?.stats?.target_total_words ?? cfg?.stats?.targetWordCount ?? '';
    try {
      const num = Number(existingTarget) || 0;
      if (num >= 1000) {
        targetInput.value = String(num / 1000);
      } else {
        targetInput.value = existingTarget || '';
      }
    } catch {
      targetInput.value = existingTarget || '';
    }
    try { targetInput.style.width = fieldWidth; } catch {}

    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const cancelBtn = actions.createEl("button", { text: "Cancel" });
    const saveBtn = actions.createEl("button", { text: "Save", cls: "mod-cta" });

    cancelBtn.onclick = () => this.close();

    saveBtn.onclick = async () => {
      const out = Object.assign({}, meta || {});
      out.title = titleInput.value.trim();
      out.subtitle = (typeof subtitleInput !== 'undefined') ? subtitleInput.value.trim() : '';
      out.author = authorInput.value.trim();
      out.description = descInput.value.trim();
      const targetRaw = targetInput.value.trim();
      const targNum = parseFloat(targetRaw) || 0;

      // Persist editorial metadata to legacy book.json (editorial/data layer)
      try {
        if (this.plugin.saveBookMeta) {
          const metaToSave = {
            title: out.title,
            subtitle: out.subtitle || '',
            author: out.author || '',
            description: out.description || '',
            targetWordCount: targNum,
          };
          await this.plugin.saveBookMeta(this.book, metaToSave);
        }
      } catch (e) {
        console.warn('saveBookMeta failed', e);
      }

      // Persist to book-config.json inside misc (map simple fields into the full config)
      let cfg = {};
      try {
        if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(this.book)) || {};
        cfg.basic = cfg.basic || {};
        cfg.stats = cfg.stats || {};

        cfg.basic.title = out.title || cfg.basic.title || this.book.name;
        cfg.basic.subtitle = out.subtitle || cfg.basic.subtitle || '';
        // store authors as array
        cfg.basic.author = out.author ? out.author.split(',').map((s) => s.trim()).filter(Boolean) : (cfg.basic.author || []);
        cfg.basic.desc = out.description || cfg.basic.desc || '';

        // Normalize target to the canonical `stats.target_total_words`.
        // Treat inputs <1000 as '1k' units (e.g., 20 => 20,000). Inputs >=1000 are raw word counts.
        let normalizedTarget = 0;
        if (targNum > 0) {
          if (targNum >= 1000) normalizedTarget = Math.round(targNum);
          else normalizedTarget = Math.round(targNum * 1000);
        }
        cfg.stats = cfg.stats || {};
        cfg.stats.target_total_words = normalizedTarget;

        // ensure baseline modification time for stats
        cfg.stats.last_modified = new Date().toISOString();

        // handle selected cover (copy into misc/cover and reference)
        if (selectedCover && selectedCover.name && selectedCover.data) {
          try {
            const destName = `${Date.now()}-${selectedCover.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destPath = `${this.book.path}/misc/cover/${destName}`;
            if (this.plugin.app.vault.adapter && typeof this.plugin.app.vault.adapter.writeBinary === 'function') {
              const uint8 = new Uint8Array(selectedCover.data);
              await this.plugin.app.vault.adapter.writeBinary(destPath, uint8);
            } else {
              const blob = new Blob([selectedCover.data]);
              const arrayBuf = await blob.arrayBuffer();
              const uint8 = new Uint8Array(arrayBuf);
              try { await this.plugin.app.vault.create(destPath, uint8); } catch (e) { console.warn('fallback cover write failed', e); }
            }
            cfg.basic = cfg.basic || {};
            cfg.basic.cover = `misc/cover/${destName}`;
          } catch (e) { console.warn('saving selected cover failed', e); }
        }

        if (this.plugin.saveBookConfig) await this.plugin.saveBookConfig(this.book, cfg);
      } catch (e) { console.warn(e); }

      // Update in-memory book title last so UI lists (Switch / Manage) reflect
      // the new title after all other fields have been migrated to disk.
      let newTitle;
      try {
        newTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : out.title || this.book.name;
        // update the modal's book instance
        try { this.book.name = newTitle; } catch {}
        // update entry in plugin.booksIndex
        if (Array.isArray(this.plugin.booksIndex)) {
          const idx = this.plugin.booksIndex.findIndex((b) => b && b.path === this.book.path);
          if (idx !== -1) this.plugin.booksIndex[idx].name = newTitle;
        }
        // update activeBook if it's the same book
        try { if (this.plugin.activeBook && this.plugin.activeBook.path === this.book.path) this.plugin.activeBook.name = newTitle; } catch {}
      } catch (err) { console.warn('updating in-memory book title failed', err); }

      // Attempt to rename the underlying folder to match the new title.
      try {
        const oldPath = this.book.path;
        const parentParts = String(oldPath).split('/').slice(0, -1);
        const parent = parentParts.join('/');
        // sanitize folder name for filesystem
        const safeName = String(newTitle || '').replace(/[\\/\:\*\?"<>\|]/g, '_').trim();
        const newPath = parent ? `${parent}/${safeName}` : safeName;
        if (safeName && newPath !== oldPath) {
          const existing = this.plugin.app.vault.getAbstractFileByPath(newPath);
          if (!existing) {
            const folderAf = this.plugin.app.vault.getAbstractFileByPath(oldPath);
            if (folderAf) {
              // Temporarily suppress known ENOENT unhandled rejections that can
              // occur inside Obsidian's internal link-update/read pipeline while
              // a folder is being renamed. We only suppress errors that reference
              // the old path to avoid hiding unrelated issues.
              const onUnhandledRej = (ev) => {
                try {
                  const r = ev && ev.reason;
                  if (!r) return;
                  // Node/Electron may surface an Error-like object with `code` and `message`
                  if (r && r.code === 'ENOENT' && typeof r.message === 'string' && r.message.includes(oldPath)) {
                    try { ev.preventDefault && ev.preventDefault(); } catch {}
                  }
                } catch {}
              };
              try {
                if (typeof window !== 'undefined' && window && window.addEventListener) {
                  window.addEventListener('unhandledrejection', onUnhandledRej);
                }

                try {
                  // Prefer FileManager.renameFile when available for better integration
                  if (this.plugin.app.fileManager && typeof this.plugin.app.fileManager.renameFile === 'function') {
                    await this.plugin.app.fileManager.renameFile(folderAf, newPath);
                  } else {
                    await this.plugin.app.vault.rename(folderAf, newPath);
                  }
                } finally {
                  // Small stabilization delay to allow Obsidian's background tasks
                  // (link updates, watchers) to settle before we touch in-memory state.
                  try { await new Promise((r) => setTimeout(r, 250)); } catch {}
                }

                // Wait briefly for the vault to surface the new folder (some backends are async)
                try { await this.plugin.waitForFolderSync(newPath, 40); } catch {}

                // verify new folder is visible before updating in-memory structures
                const checkAf = this.plugin.app.vault.getAbstractFileByPath(newPath);
                if (checkAf) {
                  try { this.book.path = newPath; } catch {}
                  if (Array.isArray(this.plugin.booksIndex)) {
                    const idx2 = this.plugin.booksIndex.findIndex((b) => b && b.path === oldPath);
                    if (idx2 !== -1) {
                      this.plugin.booksIndex[idx2].path = newPath;
                      this.plugin.booksIndex[idx2].name = newTitle;
                    }
                  }
                  if (this.plugin.activeBook && this.plugin.activeBook.path === oldPath) {
                    this.plugin.activeBook.path = newPath;
                    this.plugin.activeBook.name = newTitle;
                    try {
                      this.plugin.settings = this.plugin.settings || {};
                      this.plugin.settings.lastActiveBookPath = newPath;
                      await this.plugin.saveSettings();
                    } catch (e) {}
                  }
                } else {
                  console.warn('rename succeeded but new folder not visible yet', newPath);
                }
              } catch (e) {
                console.warn('folder rename failed', e);
              } finally {
                try { if (typeof window !== 'undefined' && window && window.removeEventListener) window.removeEventListener('unhandledrejection', onUnhandledRej); } catch {}
              }
            }
          } else {
            console.warn('target folder already exists, skipping rename', newPath);
          }
        }
      } catch (e) {
        console.warn('rename attempt failed', e);
      }

      // Notify other modals/views that the book updated so ManageBooks can refresh in-place
      try { document.dispatchEvent(new CustomEvent('novelist:book-updated', { detail: { path: this.book.path } })); } catch {}
      // Also refresh views
      await this.plugin.refresh();
      this.plugin.rerenderViews();
      this.close();
    };
  }
}
