import { Modal, setIcon } from 'obsidian';
import {
  formatWordTarget,
  getProjectSummary,
  getProjectTypeIcon,
  projectMatchesFilter,
} from './projectListUtils.js';

export class SwitchBookModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Switch project" });

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

        const row = list.createDiv({ cls: 'folio-switch-book-row' });
        const leftCol = row.createDiv({ cls: 'folio-switch-left' });
        const rightCol = row.createDiv({ cls: 'folio-switch-right' });

        const titleRow = leftCol.createDiv({ cls: 'folio-switch-title-row' });

        const iconEl = titleRow.createSpan({ cls: 'folio-switch-icon' });
        setIcon(iconEl, getProjectTypeIcon(this.plugin, summary.projectType));

        titleRow.createSpan({ text: summary.displayTitle || book.name || 'Untitled', cls: 'folio-switch-title' });
        if (summary.subtitle) {
          titleRow.createSpan({ text: ' - ', cls: 'folio-switch-dash' });
          titleRow.createSpan({ text: summary.subtitle, cls: 'folio-switch-subtitle' });
        }

        const progressText = summary.targetWords > 0 ? `${Math.round((summary.totalWords / summary.targetWords) * 100)}%` : '—';
        let createdDate = '—';
        let lastMod = '—';
        try {
          const created = cfg?.stats?.created_at || cfg?.basic?.created_at || '';
          if (created) createdDate = (new Date(created)).toLocaleString();
        } catch {}
        try {
          const lm = cfg?.stats?.last_modified || cfg?.stats?.lastModified || '';
          if (lm) lastMod = (new Date(lm)).toLocaleString();
        } catch {}

        leftCol.createDiv({ text: `Author: ${summary.authors || '—'} | Progress: ${progressText} | Words: ${formatWordTarget(summary.totalWords)}`, cls: 'folio-switch-meta' });
        leftCol.createDiv({ text: `Created: ${createdDate}`, cls: 'folio-switch-meta-second' });
        leftCol.createDiv({ text: `Last modified: ${lastMod}`, cls: 'folio-switch-meta-second' });

        const selectBtn = rightCol.createEl('button', { text: 'Select', cls: 'mod-cta' });
        selectBtn.onclick = async (evt) => {
          evt?.stopPropagation();
          this.plugin.activeBook = book;
          try {
            this.plugin.settings.lastActiveBookPath = book.path;
            await this.plugin.saveSettings();
          } catch (e) {
            console.warn("Failed to persist lastActiveBookPath", e);
          }
          this.plugin.rerenderViews();
          this.close();
        };
        row.onclick = () => selectBtn.click();
      }

      if (!list.children || list.children.length === 0) {
        list.createDiv({ cls: 'folio-manage-empty' }).createEl('div', { text: 'No projects found' });
      }
    };

    search.addEventListener('input', (e) => renderList(e.target.value));

    await renderList('');
  }
}
