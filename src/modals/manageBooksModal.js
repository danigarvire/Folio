import { Modal, TFile, setIcon } from "obsidian";
import { ConfirmModal } from './confirmModal.js';
import { EditBookModal } from './editBookModal.js';
import {
  formatWordTarget,
  getProjectSummary,
  getProjectTypeIcon,
  projectMatchesFilter,
  truncateToWords,
} from './projectListUtils.js';

export class ManageBooksModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    this.modalEl.style.width = '750px';
    this.modalEl.style.maxWidth = '90vw';

    contentEl.createEl("h2", { text: "Manage projects" });
    const search = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search projects...",
      cls: 'folio-manage-search'
    });

    const list = contentEl.createDiv({ cls: 'folio-manage-list' });

    const renderList = async (filter) => {
      list.empty();
      const seen = new Set();
      for (const book of this.plugin.booksIndex) {
        if (!book || !book.path) continue;
        if (seen.has(book.path)) continue;
        seen.add(book.path);

        let cfg = {};
        try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch {}
        const summary = getProjectSummary(book, cfg);

        if (!projectMatchesFilter(summary, filter)) continue;

        const card = list.createDiv({ cls: 'folio-manage-card' });
        const left = card.createDiv({ cls: 'folio-manage-left' });
        const right = card.createDiv({ cls: 'folio-manage-right' });

        const coverWrap = left.createDiv({ cls: 'folio-manage-cover' });
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (coverFile instanceof TFile) {
            const url = this.plugin.app.vault.getResourcePath(coverFile);
            coverWrap.style.backgroundImage = `url("${url}")`;
          }
        } catch {}
        try {
          const coverFile = book.cover instanceof TFile ? book.cover : (book.cover ? this.plugin.app.vault.getAbstractFileByPath(book.cover) : null);
          if (!(coverFile instanceof TFile)) {
            coverWrap.addClass('folio-manage-cover-placeholder');
            const iconEl = coverWrap.createDiv({ cls: 'folio-manage-cover-icon' });
            setIcon(iconEl, getProjectTypeIcon(this.plugin, summary.projectType));
          }
        } catch {}

        const titleRow = right.createDiv({ cls: 'folio-manage-title-row' });
        titleRow.createDiv({ text: summary.displayTitle || book.name || 'Untitled', cls: 'folio-manage-title' });
        const actions = titleRow.createDiv({ cls: 'folio-manage-actions' });
        const deleteBtn = actions.createEl('button', { text: 'Delete', cls: 'mod-danger' });
        const editBtn = actions.createEl('button', { text: 'Edit' });

        const metaGrid = right.createDiv({ cls: 'folio-manage-meta-grid' });
        const labelsCol = metaGrid.createDiv({ cls: 'folio-manage-labels' });
        const valuesCol = metaGrid.createDiv({ cls: 'folio-manage-values' });

        labelsCol.createEl('div', { text: 'Type', cls: 'folio-manage-label' });
        valuesCol.createEl('div', { text: summary.typeLabel, cls: 'folio-manage-author' });

        labelsCol.createEl('div', { text: 'Author', cls: 'folio-manage-label' });
        valuesCol.createEl('div', { text: summary.authors || '—', cls: 'folio-manage-author' });

        labelsCol.createEl('div', { text: 'Description', cls: 'folio-manage-label' });
        valuesCol.createEl('div', { text: truncateToWords(summary.desc, 5), cls: 'folio-manage-desc' });

        labelsCol.createEl('div', { text: 'Progress', cls: 'folio-manage-label' });
        valuesCol.createEl('div', { text: `${summary.totalWords.toLocaleString()} / ${formatWordTarget(summary.targetWords)}`, cls: 'folio-manage-progress' });

        deleteBtn.onclick = async () => {
          const modal = new ConfirmModal(this.plugin.app, {
            title: `Delete ${book.name}`,
            message: `Delete project "${book.name}" and all its files? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: async () => {
              try {
                await this.plugin.deleteFolderRecursive(book.path);
              } catch (e) { console.warn('delete book failed', e); }
              await this.plugin.refresh();
              this.close();
            },
          });
          modal.open();
        };

        editBtn.onclick = () => {
          new EditBookModal(this.plugin, book).open();
        };
      }

      if (!list.children || list.children.length === 0) {
        list.createDiv({ cls: 'folio-manage-empty' }).createEl('div', { text: 'No projects found' });
      }
    };

    search.addEventListener('input', (e) => renderList(e.target.value));

    this._onBookUpdated = () => {
      try { renderList(search.value); } catch {}
    };
    document.addEventListener('novelist:book-updated', this._onBookUpdated);

    await renderList('');
  }

  onClose() {
    try { document.removeEventListener('novelist:book-updated', this._onBookUpdated); } catch {}
  }
}
