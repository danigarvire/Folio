import { Modal, setIcon } from 'obsidian';
import { PROJECT_TYPES } from '../constants/index.js';

function getProjectTypeIcon(plugin, projectType) {
  const templates = plugin.settings?.projectTemplates || [];
  const template = templates.find(t => t.id === projectType);
  if (template?.icon) return template.icon;
  if (projectType === PROJECT_TYPES.BOOK) return 'book';
  if (projectType === PROJECT_TYPES.SCRIPT) return 'tv';
  if (projectType === PROJECT_TYPES.FILM) return 'clapperboard';
  if (projectType === PROJECT_TYPES.ESSAY) return 'newspaper';
  return 'book';
}

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
      placeholder: "Search books...",
      cls: 'folio-manage-search'
    });

    const list = contentEl.createDiv({ cls: 'folio-manage-list' });

    const formatTarget = (n) => {
      if (!n) return '—';
      const num = Number(n) || 0;
      if (num >= 1000) {
        const k = num / 1000;
        return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
      }
      return String(num);
    };

    const renderList = async (filter) => {
      list.empty();
      const seen = new Set();
      for (const book of this.plugin.booksIndex) {
        if (!book || !book.path) continue;
        if (seen.has(book.path)) continue;
        seen.add(book.path);

        let cfg = {};
        try { cfg = (await this.plugin.loadBookConfig(book)) || {}; } catch {}

        const subtitle = cfg?.basic?.subtitle || '';
        const authors = Array.isArray(cfg?.basic?.author) ? cfg.basic.author.join(', ') : (cfg?.basic?.author || '');
        const desc = cfg?.basic?.desc || cfg?.basic?.description || '';
        const totalWords = cfg?.stats?.total_words || 0;
        const targetWords = Number(cfg?.stats?.target_total_words || cfg?.basic?.targetWordCount || 0) || 0;
        const displayTitle = (cfg && cfg.basic && cfg.basic.title) ? cfg.basic.title : (book.name || '');

        const q = filter ? String(filter).trim().toLowerCase() : '';
        if (q) {
          const fields = [displayTitle || book.name || '', subtitle || '', authors || '', desc || ''];
          const matches = fields.some(f => {
            const s = String(f).toLowerCase();
            if (s.startsWith(q)) return true;
            return s.split(/\s+/).some(w => w.startsWith(q));
          });
          if (!matches) continue;
        }

        const row = list.createDiv({ cls: 'folio-switch-book-row' });
        const leftCol = row.createDiv({ cls: 'folio-switch-left' });
        const rightCol = row.createDiv({ cls: 'folio-switch-right' });

        const titleRow = leftCol.createDiv({ cls: 'folio-switch-title-row' });

        const iconEl = titleRow.createSpan({ cls: 'folio-switch-icon' });
        const projectType = cfg?.basic?.projectType || PROJECT_TYPES.BOOK;
        setIcon(iconEl, getProjectTypeIcon(this.plugin, projectType));

        titleRow.createSpan({ text: displayTitle || book.name || 'Untitled', cls: 'folio-switch-title' });
        if (subtitle) {
          titleRow.createSpan({ text: ' - ', cls: 'folio-switch-dash' });
          titleRow.createSpan({ text: subtitle, cls: 'folio-switch-subtitle' });
        }

        const progressPct = (targetWords > 0) ? Math.round((Number(totalWords) / Number(targetWords)) * 100) : '—';
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

        leftCol.createDiv({ text: `Author: ${authors || '—'} | Progress: ${progressPct}% | Words: ${formatTarget(totalWords)}`, cls: 'folio-switch-meta' });
        leftCol.createDiv({ text: `Created: ${createdDate}`, cls: 'folio-switch-meta-second' });
        leftCol.createDiv({ text: `Last modified: ${lastMod}`, cls: 'folio-switch-meta-second' });

        const selectBtn = rightCol.createEl('button', { text: 'Select', cls: 'mod-cta' });
        selectBtn.onclick = async () => {
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
    };

    search.addEventListener('input', (e) => renderList(e.target.value));

    await renderList('');
  }
}
