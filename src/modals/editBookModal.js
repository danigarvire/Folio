import { Modal, TFile } from "obsidian";

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

    const fieldWidth = 'min(320px, 60%)';

    // Cover selector
    let selectedCover = null;
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const coverRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const coverLeft = coverRow.createDiv({ cls: 'folio-modal-left' });
    coverLeft.createEl('div', { text: 'Cover', cls: 'folio-modal-row-title' });
    coverLeft.createEl('div', { text: 'Select image (optional)', cls: 'folio-modal-row-sub' });
    const coverRight = coverRow.createDiv({ cls: 'folio-modal-right' });
    const coverBtn = coverRight.createEl('button', { text: 'Select Image' });
    try {
      const existingCover = cfg?.basic?.cover || '';
      if (existingCover) {
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

    // Title
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const titleRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const titleLeft = titleRow.createDiv({ cls: 'folio-modal-left' });
    titleLeft.createEl('div', { text: 'Title', cls: 'folio-modal-row-title' });
    titleLeft.createEl('div', { text: 'Please enter book title', cls: 'folio-modal-row-sub' });
    const titleRight = titleRow.createDiv({ cls: 'folio-modal-right' });
    const titleInput = titleRight.createEl('input', { type: 'text', cls: 'folio-modal-input' });
    try { titleInput.style.width = fieldWidth; } catch {}
    titleInput.value = meta.title || this.book.name || '';

    // Subtitle
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const subRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const subLeft = subRow.createDiv({ cls: 'folio-modal-left' });
    subLeft.createEl('div', { text: 'Subtitle', cls: 'folio-modal-row-title' });
    subLeft.createEl('div', { text: 'Optional', cls: 'folio-modal-row-sub' });
    const subRight = subRow.createDiv({ cls: 'folio-modal-right' });
    const subtitleInput = subRight.createEl('input', { type: 'text', cls: 'folio-modal-input' });
    try { subtitleInput.style.width = fieldWidth; } catch {}
    subtitleInput.value = meta.subtitle || '';

    // Author
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const authorRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const authorLeft = authorRow.createDiv({ cls: 'folio-modal-left' });
    authorLeft.createEl('div', { text: 'Author', cls: 'folio-modal-row-title' });
    authorLeft.createEl('div', { text: 'Separate multiple authors with commas', cls: 'folio-modal-row-sub' });
    const authorRight = authorRow.createDiv({ cls: 'folio-modal-right' });
    const authorInput = authorRight.createEl('input', { type: 'text', cls: 'folio-modal-input' });
    try { authorInput.style.width = fieldWidth; } catch {}
    authorInput.value = meta.author || '';

    // Description
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const descRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const descLeft = descRow.createDiv({ cls: 'folio-modal-left' });
    descLeft.createEl('div', { text: 'Description', cls: 'folio-modal-row-title' });
    descLeft.createEl('div', { text: 'Please enter book description', cls: 'folio-modal-row-sub' });
    const descRight = descRow.createDiv({ cls: 'folio-modal-right' });
    const descInput = descRight.createEl('textarea', { cls: 'folio-modal-textarea' });
    try { descInput.style.width = fieldWidth; descInput.style.minHeight = '120px'; descInput.style.maxWidth = '100%'; } catch {}
    descInput.value = meta.description || '';

    // Target word count
    contentEl.createDiv({ cls: 'folio-modal-divider' });
    const targetRow = contentEl.createDiv({ cls: 'folio-modal-row' });
    const targetLeft = targetRow.createDiv({ cls: 'folio-modal-left' });
    targetLeft.createEl('div', { text: 'Target word count', cls: 'folio-modal-row-title' });
    targetLeft.createEl('div', { text: 'Set estimated total word count (in 1k)', cls: 'folio-modal-row-sub' });
    const targetRight = targetRow.createDiv({ cls: 'folio-modal-right' });
    const targetInput = targetRight.createEl('input', { type: 'text', cls: 'folio-modal-input', placeholder: 'e.g., 20 (20k) or 20000' });
    const existingTarget = cfg?.basic?.targetWordCount ?? cfg?.stats?.target_total_words ?? cfg?.stats?.targetWordCount ?? '';
    try {
      const num = Number(existingTarget) || 0;
      targetInput.value = num >= 1000 ? String(num / 1000) : (existingTarget || '');
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
      out.subtitle = subtitleInput.value.trim();
      out.author = authorInput.value.trim();
      out.description = descInput.value.trim();
      const targetRaw = targetInput.value.trim();
      const targNum = parseFloat(targetRaw) || 0;

      try {
        if (this.plugin.saveBookMeta) {
          await this.plugin.saveBookMeta(this.book, {
            title: out.title,
            subtitle: out.subtitle || '',
            author: out.author || '',
            description: out.description || '',
            targetWordCount: targNum,
          });
        }
      } catch (e) {
        console.warn('saveBookMeta failed', e);
      }

      let cfg = {};
      try {
        if (this.plugin.loadBookConfig) cfg = (await this.plugin.loadBookConfig(this.book)) || {};
        cfg.basic = cfg.basic || {};
        cfg.stats = cfg.stats || {};
        cfg.basic.title = out.title || cfg.basic.title || this.book.name;
        cfg.basic.subtitle = out.subtitle || cfg.basic.subtitle || '';
        cfg.basic.author = out.author ? out.author.split(',').map(s => s.trim()).filter(Boolean) : (cfg.basic.author || []);
        cfg.basic.desc = out.description || cfg.basic.desc || '';

        let normalizedTarget = 0;
        if (targNum > 0) {
          normalizedTarget = targNum >= 1000 ? Math.round(targNum) : Math.round(targNum * 1000);
        }
        cfg.stats.target_total_words = normalizedTarget;
        cfg.stats.last_modified = new Date().toISOString();

        // Handle cover image — only use writeBinary, never vault.create with binary data
        if (selectedCover && selectedCover.name && selectedCover.data) {
          try {
            const destName = `${Date.now()}-${selectedCover.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destPath = `${this.book.path}/misc/cover/${destName}`;
            if (this.plugin.app.vault.adapter && typeof this.plugin.app.vault.adapter.writeBinary === 'function') {
              await this.plugin.app.vault.adapter.writeBinary(destPath, new Uint8Array(selectedCover.data));
              cfg.basic.cover = `misc/cover/${destName}`;
            } else {
              console.warn('writeBinary unavailable — cover not saved');
            }
          } catch (e) { console.warn('saving selected cover failed', e); }
        }

        if (this.plugin.saveBookConfig) await this.plugin.saveBookConfig(this.book, cfg);
      } catch (e) { console.warn(e); }

      let newTitle;
      try {
        newTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : out.title || this.book.name;
        try { this.book.name = newTitle; } catch {}
        if (Array.isArray(this.plugin.booksIndex)) {
          const idx = this.plugin.booksIndex.findIndex(b => b && b.path === this.book.path);
          if (idx !== -1) this.plugin.booksIndex[idx].name = newTitle;
        }
        try {
          if (this.plugin.activeBook && this.plugin.activeBook.path === this.book.path) this.plugin.activeBook.name = newTitle;
        } catch {}
      } catch (err) { console.warn('updating in-memory book title failed', err); }

      // Attempt folder rename
      try {
        const oldPath = this.book.path;
        const parentParts = String(oldPath).split('/').slice(0, -1);
        const parent = parentParts.join('/');
        const safeName = String(newTitle || '').replace(/[\\/\:\*\?"<>\|]/g, '_').trim();
        const newPath = parent ? `${parent}/${safeName}` : safeName;
        if (safeName && newPath !== oldPath) {
          const existing = this.plugin.app.vault.getAbstractFileByPath(newPath);
          if (!existing) {
            const folderAf = this.plugin.app.vault.getAbstractFileByPath(oldPath);
            if (folderAf) {
              const onUnhandledRej = (ev) => {
                try {
                  const r = ev && ev.reason;
                  if (r && r.code === 'ENOENT' && typeof r.message === 'string' && r.message.includes(oldPath)) {
                    try { ev.preventDefault && ev.preventDefault(); } catch {}
                  }
                } catch {}
              };
              try {
                if (typeof window !== 'undefined' && window.addEventListener) {
                  window.addEventListener('unhandledrejection', onUnhandledRej);
                }
                try {
                  if (this.plugin.app.fileManager && typeof this.plugin.app.fileManager.renameFile === 'function') {
                    await this.plugin.app.fileManager.renameFile(folderAf, newPath);
                  } else {
                    await this.plugin.app.vault.rename(folderAf, newPath);
                  }
                } finally {
                  try { await new Promise(r => setTimeout(r, 250)); } catch {}
                }
                try { await this.plugin.waitForFolderSync(newPath, 40); } catch {}
                const checkAf = this.plugin.app.vault.getAbstractFileByPath(newPath);
                if (checkAf) {
                  try { this.book.path = newPath; } catch {}
                  if (Array.isArray(this.plugin.booksIndex)) {
                    const idx2 = this.plugin.booksIndex.findIndex(b => b && b.path === oldPath);
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
                try {
                  if (typeof window !== 'undefined' && window.removeEventListener) {
                    window.removeEventListener('unhandledrejection', onUnhandledRej);
                  }
                } catch {}
              }
            }
          }
        }
      } catch (e) {
        console.warn('rename attempt failed', e);
      }

      try { document.dispatchEvent(new CustomEvent('novelist:book-updated', { detail: { path: this.book.path } })); } catch {}
      await this.plugin.refresh();
      this.plugin.rerenderViews();
      this.close();
    };
  }
}
