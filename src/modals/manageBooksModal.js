const { Modal, TFile } = require("obsidian");
import { ConfirmModal } from './confirmModal.js';
import { EditBookModal } from './editBookModal.js';

export class ManageBooksModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Manage books" });
    const search = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search books...",
      cls: 'novelist-manage-search'
    });
    // import button intentionally omitted — search field serves as primary control

    const list = contentEl.createDiv({ cls: 'novelist-manage-list' });

    // helper to format large targets (e.g., 20000 -> 20K or 20.5K)
    const formatTarget = (n) => {
      if (!n) return '—';
      const num = Number(n) || 0;
      if (num >= 1000) {
        const k = num / 1000;
        return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
      }
      return String(num);
    };

    // render list with optional filter
    const renderList = async (filter) => {
      list.empty();
      const seen = new Set();
      for (const book of this.plugin.booksIndex) {
        if (!book || !book.path) continue;
        if (seen.has(book.path)) continue;
        seen.add(book.path);

        // load config once per book
        let cfg = {};
        try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch {}

        const subtitle = cfg?.basic?.subtitle || '';
        const authors = Array.isArray(cfg?.basic?.author) ? cfg.basic.author.join(', ') : (cfg?.basic?.author || '');
        const desc = cfg?.basic?.desc || cfg?.basic?.description || '';
        const totalWords = cfg?.stats?.total_words || 0;
        const targetWords = Number(cfg?.stats?.target_total_words || cfg?.basic?.targetWordCount || 0) || 0;
        // prefer configured title when present
        const displayTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : (book.name || '');

        const q = filter ? String(filter).trim().toLowerCase() : '';
        if (q) {
          const fields = [displayTitle || book.name || '', subtitle || '', authors || '', desc || ''];
          const matches = fields.some((f) => {
            const s = String(f).toLowerCase();
            if (s.startsWith(q)) return true;
            return s.split(/\s+/).some((w) => w.startsWith(q));
          });
          if (!matches) continue;
        }

        const card = list.createDiv({ cls: 'novelist-manage-card' });
        const left = card.createDiv({ cls: 'novelist-manage-left' });
        const right = card.createDiv({ cls: 'novelist-manage-right' });

        // cover (left)
        const coverWrap = left.createDiv({ cls: 'novelist-manage-cover' });
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (coverFile instanceof TFile) {
            const url = this.plugin.app.vault.getResourcePath(coverFile);
            coverWrap.style.backgroundImage = `url("${url}")`;
          }
        } catch {}
        // placeholder when no cover exists
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (!(coverFile instanceof TFile)) {
            coverWrap.addClass('novelist-manage-cover-placeholder');
            try { coverWrap.createSpan({ text: 'TBD', cls: 'novelist-manage-cover-txt' }); } catch { coverWrap.textContent = 'TBD'; }
          }
        } catch {}

        // Title row: use configured title when available; actions live at right of title
        const titleRow = right.createDiv({ cls: 'novelist-manage-title-row' });
        titleRow.createDiv({ text: displayTitle || book.name || 'Untitled', cls: 'novelist-manage-title' });
        const actions = titleRow.createDiv({ cls: 'novelist-manage-actions' });
        const deleteBtn = actions.createEl('button', { text: 'Delete', cls: 'mod-danger' });
        const editBtn = actions.createEl('button', { text: 'Edit' });

        // Metadata grid: labels on left, values on right (Author / Description / Progress)
        const metaGrid = right.createDiv({ cls: 'novelist-manage-meta-grid' });
        const labelsCol = metaGrid.createDiv({ cls: 'novelist-manage-labels' });
        const valuesCol = metaGrid.createDiv({ cls: 'novelist-manage-values' });

        labelsCol.createEl('div', { text: 'Author', cls: 'novelist-manage-label' });
        valuesCol.createEl('div', { text: authors || '—', cls: 'novelist-manage-author' });

        labelsCol.createEl('div', { text: 'Description', cls: 'novelist-manage-label' });
        const short = desc ? (desc.length > 160 ? desc.slice(0, 157) + '…' : desc) : '—';
        valuesCol.createEl('div', { text: short, cls: 'novelist-manage-desc' });

        labelsCol.createEl('div', { text: 'Progress', cls: 'novelist-manage-label' });
        valuesCol.createEl('div', { text: `${totalWords} / ${formatTarget(targetWords)}`, cls: 'novelist-manage-progress' });

        deleteBtn.onclick = async () => {
          const self = this;
          const modal = new ConfirmModal(this.plugin.app, {
            title: `Delete ${book.name}`,
            message: `Delete book "${book.name}" and all its files? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: async () => {
              try {
                await self.plugin.deleteFolderRecursive(book.path);
              } catch (e) { console.warn('delete book failed', e); }
              await self.plugin.refresh();
              self.close();
            },
          });
          modal.open();
        };

        editBtn.onclick = () => {
          new EditBookModal(this.plugin, book).open();
        };
      }

      // show placeholder when no items match filter
      if (!list.children || list.children.length === 0) {
        const empty = list.createDiv({ cls: 'novelist-manage-empty' });
        empty.createEl('div', { text: 'No books found' });
      }
    };

    // wire search
    search.addEventListener('input', (e) => {
      renderList(e.target.value);
    });

    // handle external updates so the list refreshes while the modal is open
    this._onBookUpdated = (ev) => {
      try { renderList(search.value); } catch {}
    };
    document.addEventListener('novelist:book-updated', this._onBookUpdated);

    // initial render
    await renderList('');
  }

  onClose() {
    try { document.removeEventListener('novelist:book-updated', this._onBookUpdated); } catch {}
  }
}
