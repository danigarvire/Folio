/**
 * Folio View - Main UI view for the plugin
 */

import { ItemView, TFolder, Menu, setIcon } from 'obsidian';
import { VIEW_TYPE, PROJECT_TYPES } from '../constants/index.js';

// Helper to get icon from settings templates
function getProjectTypeIcon(plugin, projectType) {
  const templates = plugin.settings?.projectTemplates || [];
  const template = templates.find(t => t.id === projectType);
  if (template?.icon) return template.icon;
  // Fallback to defaults
  if (projectType === PROJECT_TYPES.BOOK) return 'book';
  if (projectType === PROJECT_TYPES.SCRIPT) return 'tv-minimal-play';
  if (projectType === PROJECT_TYPES.FILM) return 'clapperboard';
  if (projectType === PROJECT_TYPES.ESSAY) return 'newspaper';
  return 'book';
}

export class FolioView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this._isRendering = false;
    this._renderCounter = 0;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Folio";
  }

  getIcon() {
    return "book-open";
  }

  async onOpen() {
    this.render();
  }

  onClose() {
    // clear plugin singleton reference to avoid multiple active views
    if (this.plugin && this.plugin.novelistLeaf === this.leaf) {
      this.plugin.novelistLeaf = null;
    }
  }

  clearView() {
    try {
      this.contentEl.empty();
    } catch {}
    // reset rendering guard so a fresh render can proceed
    this._isRendering = false;
  }

  // Render a filesystem-backed editorial tree for a book folder (Obsidian-safe)
  // Now with Book-Smith style drag & drop support
  // Get custom icon for specific folder/file names
  getCustomIcon(title, isExpanded = false) {
    const lowerTitle = title.toLowerCase();
    
    // Custom folder icons
    if (lowerTitle === 'show dossier') return 'book-marked';
    if (lowerTitle === 'film dossier') return 'book-marked';
    if (lowerTitle === 'concept') return 'lightbulb';
    if (lowerTitle === 'faces') return 'drama';
    if (lowerTitle === 'places') return 'map-pin';
    if (lowerTitle === 'objects') return 'box';
    if (lowerTitle === 'structure') return 'map';
    if (lowerTitle === 'documentation') return 'scroll-text';
    
    // Default folder icons
    return isExpanded ? 'folder-open' : 'folder';
  }

  async renderBookTree(container, bookFolder) {
    container.empty();

    const folder =
      bookFolder instanceof TFolder
        ? bookFolder
        : this.plugin.app.vault.getAbstractFileByPath(
            bookFolder?.path || bookFolder
          );

    if (!(folder instanceof TFolder)) {
      console.error("Invalid book folder", bookFolder);
      return;
    }

    const book = this.plugin.activeBook;
    if (!book) return;

    // Always sync tree from filesystem to pick up new/deleted files
    // while preserving existing order and metadata (Book-Smith pattern)
    let configTree = [];
    let useConfigTree = false;
    
    try {
      // Build/sync tree from filesystem (merges with existing config)
      configTree = await this.plugin.buildTreeFromFilesystem(folder);
      
      if (configTree.length > 0) {
        // Save the synced tree
        const cfg = (await this.plugin.loadBookConfig(book)) || {};
        if (!cfg.structure) cfg.structure = {};
        cfg.structure.tree = configTree;
        await this.plugin.saveBookConfig(book, cfg);
        useConfigTree = true;
      }
    } catch (e) {
      console.warn('Failed to build/sync tree from filesystem', e);
    }

    // Drag and drop state
    let draggedElement = null;
    let draggedNodeId = null;

    // Helper to setup drag events
    const setupDragEvents = (element, nodeId, nodeType) => {
      element.setAttribute('draggable', 'true');
      
      element.addEventListener('dragstart', (e) => {
        draggedElement = element;
        draggedNodeId = nodeId;
        element.classList.add('folio-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', nodeId);
      });

      element.addEventListener('dragend', (e) => {
        element.classList.remove('folio-dragging');
        document.querySelectorAll('.folio-dragover, .folio-dragover-before, .folio-dragover-after, .folio-dragover-inside')
          .forEach(el => el.classList.remove('folio-dragover', 'folio-dragover-before', 'folio-dragover-after', 'folio-dragover-inside'));
        draggedElement = null;
        draggedNodeId = null;
      });

      element.addEventListener('dragover', (e) => {
        if (!draggedElement || draggedElement === element) return;
        e.preventDefault();
        e.stopPropagation();
        
        const rect = element.getBoundingClientRect();
        const mouseY = e.clientY;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        element.classList.remove('folio-dragover-before', 'folio-dragover-after', 'folio-dragover-inside');
        
        if (nodeType === 'group') {
          // Use quarters instead of thirds for better "after" zone when expanded
          const topQuarter = elementTop + elementHeight / 4;
          const bottomHalf = elementTop + elementHeight / 2;
          
          if (mouseY < topQuarter) {
            element.classList.add('folio-dragover-before');
            e.dataTransfer.dropEffect = 'move';
          } else if (mouseY > bottomHalf) {
            element.classList.add('folio-dragover-after');
            e.dataTransfer.dropEffect = 'move';
          } else {
            element.classList.add('folio-dragover-inside');
            e.dataTransfer.dropEffect = 'move';
          }
        } else {
          const middle = elementTop + elementHeight / 2;
          if (mouseY < middle) {
            element.classList.add('folio-dragover-before');
          } else {
            element.classList.add('folio-dragover-after');
          }
          e.dataTransfer.dropEffect = 'move';
        }
      });

      element.addEventListener('dragleave', (e) => {
        element.classList.remove('folio-dragover-before', 'folio-dragover-after', 'folio-dragover-inside');
      });

      element.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedNodeId || draggedElement === element) return;
        
        const rect = element.getBoundingClientRect();
        const mouseY = e.clientY;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        let position = 'after';
        
        if (nodeType === 'group') {
          // Use quarters instead of thirds for better "after" zone detection
          const topQuarter = elementTop + elementHeight / 4;
          const bottomHalf = elementTop + elementHeight / 2;
          
          if (mouseY < topQuarter) {
            position = 'before';
          } else if (mouseY > bottomHalf) {
            position = 'after';
          } else {
            position = 'inside';
          }
        } else {
          const middle = elementTop + elementHeight / 2;
          position = mouseY < middle ? 'before' : 'after';
        }
        
        const success = await this.plugin.reorderTreeNodes(book, draggedNodeId, nodeId, position);
        if (success) {
          this.plugin.rerenderViews();
        }
        
        element.classList.remove('folio-dragover-before', 'folio-dragover-after', 'folio-dragover-inside');
      });
    };

    // Render tree from config structure (Book-Smith pattern)
    const renderNodeFromConfig = (node, parentContainer) => {
      // Get the actual file/folder from vault
      const fullPath = `${book.path}/${node.path}`;
      const vaultItem = this.plugin.app.vault.getAbstractFileByPath(fullPath);
      
      // Skip if file/folder doesn't exist in vault
      if (!vaultItem) {
        console.warn('Vault item not found:', fullPath, 'for node:', node);
        return;
      }

      if (node.type === 'group') {
        // Render folder
        const folderRow = parentContainer.createDiv("folio-tree-folder tree-item is-folder");
        folderRow.dataset.path = fullPath;
        folderRow.dataset.nodeId = node.id;
        
        const collapse = folderRow.createSpan({ cls: "folio-tree-toggle" });
        collapse.classList.toggle("is-open", this.plugin.expandedFolders.has(fullPath));
        
        const folderIcon = folderRow.createSpan({ cls: "folio-tree-icon folder-icon" });
        try { 
          const isExpanded = this.plugin.expandedFolders.has(fullPath);
          // Use custom icon if defined, otherwise use getCustomIcon for special folders
          const iconName = node.icon || this.getCustomIcon(node.title, isExpanded);
          setIcon(folderIcon, iconName); 
          setIcon(collapse, isExpanded ? "chevron-down" : "chevron-right"); 
        } catch {}
        
        const titleSpan = folderRow.createSpan({ text: node.title, cls: "folio-tree-label" });
        
        // Add visual indicator if folder is excluded
        if (node.exclude) {
          titleSpan.classList.add('exclude-from-stats');
        }

        setupDragEvents(folderRow, node.id, 'group');

        try {
          folderRow.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
            this.plugin.openVolumeMenu(evt, vaultItem, false, node);
          });
        } catch {}

        const childrenEl = parentContainer.createDiv("folio-tree-children");
        childrenEl.classList.toggle("is-open", this.plugin.expandedFolders.has(fullPath));
        if (!this.plugin.expandedFolders.has(fullPath)) childrenEl.style.display = "none";
        
        collapse.onclick = (e) => {
          e.stopPropagation();
          const isHidden = childrenEl.style.display === "none";
          childrenEl.style.display = isHidden ? "" : "none";
          collapse.classList.toggle("is-open", isHidden);
          childrenEl.classList.toggle("is-open", isHidden);
          if (isHidden) this.plugin.expandedFolders.add(fullPath);
          else this.plugin.expandedFolders.delete(fullPath);
          try { 
            // Use custom icon if defined, otherwise use getCustomIcon
            const iconName = node.icon || this.getCustomIcon(node.title, isHidden);
            setIcon(folderIcon, iconName); 
            setIcon(collapse, isHidden ? "chevron-down" : "chevron-right"); 
          } catch {}
        };

        // Render children
        if (node.children && node.children.length > 0) {
          const sortedChildren = [...node.children].sort((a, b) => a.order - b.order);
          sortedChildren.forEach(child => renderNodeFromConfig(child, childrenEl));
        }
      } else {
        // Render file (file or canvas)
        const fileRow = parentContainer.createDiv("folio-tree-file tree-item is-file");
        fileRow.dataset.path = fullPath;
        fileRow.dataset.nodeId = node.id;
        
        const icon = fileRow.createSpan({ cls: "folio-tree-icon" });
        try { 
          // Use custom icon if defined, otherwise default based on type
          const defaultIcon = node.type === 'canvas' ? 'layout-dashboard' : 'file';
          setIcon(icon, node.icon || defaultIcon); 
        } catch {}
        
        const label = fileRow.createSpan({ text: node.title, cls: "folio-tree-label" });
        
        if (node.exclude) {
          label.classList.add('exclude-from-stats');
        }
        if (node.completed) {
          label.classList.add('is-done');
        }
        
        fileRow.onclick = (e) => {
          e.stopPropagation();
          this.plugin.app.workspace.openLinkText(fullPath, "", false);
        };
        
        setupDragEvents(fileRow, node.id, 'file');
        
        try {
          fileRow.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
            this.plugin.openChapterContextMenu(evt, vaultItem, node);
          });
        } catch {}
      }
    };

    // Render the tree
    if (useConfigTree && configTree.length > 0) {
      console.log('Rendering tree with', configTree.length, 'root nodes');
      const sortedTree = [...configTree].sort((a, b) => a.order - b.order);
      sortedTree.forEach(node => renderNodeFromConfig(node, container));
    } else {
      console.warn('No config tree to render, useConfigTree:', useConfigTree, 'length:', configTree.length);
    }

    // Allow right-click on empty tree area
    try {
      container.addEventListener('contextmenu', (evt) => {
        try {
          if (evt.target && evt.target.closest && evt.target.closest('.tree-item')) return;
          evt.preventDefault();
          this.plugin.openVolumeMenu(evt, folder, true);
        } catch (e) {}
      });
    } catch {}
  }

  async renderStats(container, book) {
    try {
      if (!book || !this.plugin.loadBookConfig) return;
      let cfg = {};
      try {
        cfg = (await this.plugin.loadBookConfig(book)) || {};
      } catch (e) {
        // ignore load errors
      }
      try { if (this.plugin && this.plugin.settings && this.plugin.settings.verboseLogs) console.debug('Folio.renderStats loaded cfg', book && book.path, { basic: cfg.basic, stats: cfg.stats }); } catch {}
      const stats = cfg.stats || {};
      if (!stats) return;

      const pad = (n) => (typeof n === 'number' ? n : 0);
      const formatTarget = (n) => {
        if (!n) return '—';
        const num = Number(n) || 0;
        if (num >= 1000) {
          const k = num / 1000;
          return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
        }
        return String(num);
      };

      // derive values with safe fallbacks
      const todayKey = new Date().toISOString().slice(0, 10);
      const dailyWords = stats.daily_words || {};
      const todayCount = pad(dailyWords[todayKey]) || 0;
      const totalWords = pad(stats.total_words) || 0;
      const targetWords = pad(stats.target_total_words) || 0;
      const completionPct = typeof stats.progress_by_words !== 'undefined' && stats.progress_by_words !== null
        ? Number(stats.progress_by_words)
        : (targetWords > 0 ? Math.round((totalWords / targetWords) * 10000) / 100 : 0);
      const writingDays = typeof stats.writing_days === 'number' ? stats.writing_days : (stats.daily_words ? Object.keys(stats.daily_words).length : 0);
      const dailyAvg = typeof stats.average_daily_words === 'number' ? stats.average_daily_words : (writingDays > 0 ? Math.round(totalWords / writingDays) : 0);

      // clear and render rows
      container.empty();
      const row = (iconName, label, value, extra) => {
        const r = container.createDiv("folio-stat-row");
        const left = r.createDiv({ cls: 'folio-stat-left' });
        const iconSpan = left.createSpan({ cls: 'folio-stat-icon' });
        try { if (Array.isArray(iconName)) {
          // composite: create multiple small icons
          iconName.forEach((n, i) => {
            const s = iconSpan.createSpan({ cls: `folio-stat-icon-part part-${i}` });
            try { setIcon(s, n); } catch {}
          });
        } else {
          try { setIcon(iconSpan, iconName); } catch {}
        }} catch {}
        left.createSpan({ text: label, cls: "folio-stat-label" });
        r.createSpan({ text: value, cls: "folio-stat-value" });
        if (extra && typeof extra === 'function') extra(r);
      };

      row('pencil', 'Today', `${todayCount} words`);
      // Total words: format as "X / Y" where Y may be 20.0K
      row('file', 'Total words', `${totalWords} / ${formatTarget(targetWords)}`);
      row('target', 'Completion', `${(Math.round(completionPct * 100) / 100).toFixed(2)}%`);
      row('clock', 'Writing days', `${writingDays} days`);
      // use lucide calendar-clock for daily average
      row('calendar-clock', 'Daily average', `${dailyAvg} words`);
    } catch (e) {
      console.warn('renderStats failed', e);
    }
  }

  async render() {
    // Import modals dynamically to avoid circular dependency
    const { NewBookModal } = await import('../modals/newBookModal.js');
    const { SwitchBookModal } = await import('../modals/switchBookModal.js');
    const { ManageBooksModal } = await import('../modals/manageBooksModal.js');
    const { HelpModal } = await import('../modals/helpModal.js');
    const { TextInputModal } = await import('../modals/textInputModal.js');

    // start a new render; use a token so any previous async render can abort
    const token = ++this._renderCounter;
    this._isRendering = true;

    try {
      const el = this.contentEl;
      el.empty();
      // Abort immediately if a newer render has started
      if (this._renderCounter !== token) return;
      el.addClass("folio-view");

      /* TOP BAR */
      const topBar = el.createDiv("folio-topbar");
      const newBtn = topBar.createEl("button", { cls: "folio-top-btn" });
      const newIcon = newBtn.createSpan({ cls: "folio-top-icon" });
      try { setIcon(newIcon, 'edit'); } catch {}
      newBtn.createSpan({ text: "New Project", cls: "folio-top-label" });

      const switchBtn = topBar.createEl("button", { cls: "folio-top-btn" });
      const switchIcon = switchBtn.createSpan({ cls: "folio-top-icon" });
      try { setIcon(switchIcon, "repeat"); } catch {}
      switchBtn.createSpan({ text: "Switch", cls: "folio-top-label" });

      const manageBtn = topBar.createEl("button", { cls: "folio-top-btn" });
      const manageIcon = manageBtn.createSpan({ cls: "folio-top-icon" });
      try { setIcon(manageIcon, "library"); } catch {}
      manageBtn.createSpan({ text: "Manage", cls: "folio-top-label" });
      const helpBtn = topBar.createEl("button", { cls: "folio-help-btn" });
      const helpIcon = helpBtn.createSpan({ cls: "folio-help-icon" });
      try { setIcon(helpIcon, "help"); } catch {}

      newBtn.onclick = () => {
        new NewBookModal(this.plugin).open();
      };

      switchBtn.onclick = () => {
        new SwitchBookModal(this.plugin).open();
      };

      manageBtn.onclick = () => {
        new ManageBooksModal(this.plugin).open();
      };

      helpBtn.onclick = () => {
        new HelpModal(this.plugin).open();
      };

      /* SINGLE ACTIVE BOOK ONLY */
      const book = this.plugin.activeBook;
      if (!book) {
        // Render a neutral Novelist header when no active book exists (no CTA).
        const headerEl = el.createDiv("folio-book-header");
        const coverCol = headerEl.createDiv("folio-book-cover-col");
        const coverEl = coverCol.createDiv("folio-book-cover");
        coverEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
        // ensure placeholder styling is applied when no cover image exists
        try {
          coverEl.addClass('folio-book-cover-placeholder');
          const iconEl = coverEl.createDiv({ cls: 'folio-book-cover-icon' });
          setIcon(iconEl, 'square-plus');
        } catch {}
        const titleBlock = headerEl.createDiv("folio-book-title-block");
        titleBlock.createEl("div", { cls: "folio-book-title", text: "No active project" });
        titleBlock.createEl("div", { cls: "folio-book-subtitle", text: "(Select or create a project)" });

        // metadata placeholder (empty)
        const metaBlock = el.createDiv("folio-book-meta folio-book-info");
        const authorRow = metaBlock.createDiv('folio-meta-row');
        authorRow.createEl('div', { text: 'Author', cls: 'folio-meta-label' });
        authorRow.createEl('div', { text: '—', cls: 'folio-meta-value' });
        const descRow = metaBlock.createDiv('folio-meta-row');
        descRow.createEl('div', { text: 'Description', cls: 'folio-meta-label' });
        descRow.createEl('div', { text: '—', cls: 'folio-meta-value folio-meta-desc' });

        // empty structure area
        const structureEl = el.createDiv("folio-structure");
        structureEl.createEl('p', { text: '(No project selected)' });

        // minimal stats placeholder so the header area doesn't look empty
        try {
          const statsEl = el.createDiv('folio-stats');
          const makeRow = (label, value) => {
            const r = statsEl.createDiv('folio-stat-row');
            const left = r.createDiv({ cls: 'folio-stat-left' });
            left.createSpan({ cls: 'folio-stat-icon' });
            left.createSpan({ text: label, cls: 'folio-stat-label' });
            r.createSpan({ text: value, cls: 'folio-stat-value' });
          };
          makeRow('Today', '—');
          makeRow('Total words', '— / —');
          makeRow('Completion', '—');
          makeRow('Writing days', '—');
          makeRow('Daily average', '—');
        } catch (e) { /* ignore */ }

        return;
      }

      // If the book folder was removed from disk, render a neutral header
      // rather than a CTA. The main view stays read-only and neutral.
      const bookFolderCheck = this.plugin.app.vault.getAbstractFileByPath(book.path);
      if (!bookFolderCheck || !(bookFolderCheck instanceof TFolder)) {
        const headerEl = el.createDiv("folio-book-header");
        const coverCol = headerEl.createDiv("folio-book-cover-col");
        const coverEl = coverCol.createDiv("folio-book-cover");
        coverEl.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
        try {
          coverEl.addClass('folio-book-cover-placeholder');
          const iconEl = coverEl.createDiv({ cls: 'folio-book-cover-icon' });
          setIcon(iconEl, 'square-plus');
        } catch {}
        const titleBlock = headerEl.createDiv("folio-book-title-block");
        titleBlock.createEl("div", { cls: "folio-book-title", text: "No active project" });
        titleBlock.createEl("div", { cls: "folio-book-subtitle", text: "(Project folder missing)" });

        // metadata placeholder (empty)
        const metaBlock = el.createDiv("folio-book-meta folio-book-info");
        const authorRow = metaBlock.createDiv('folio-meta-row');
        authorRow.createEl('div', { text: 'Author', cls: 'folio-meta-label' });
        authorRow.createEl('div', { text: '—', cls: 'folio-meta-value' });
        const descRow = metaBlock.createDiv('folio-meta-row');
        descRow.createEl('div', { text: 'Description', cls: 'folio-meta-label' });
        descRow.createEl('div', { text: '—', cls: 'folio-meta-value folio-meta-desc' });

        // empty structure area
        const structureEl = el.createDiv("folio-structure");
        structureEl.createEl('p', { text: '(Book folder missing on disk)' });

        // minimal stats placeholder for missing-folder state
        try {
          const statsEl = el.createDiv('folio-stats');
          const makeRow = (label, value) => {
            const r = statsEl.createDiv('folio-stat-row');
            const left = r.createDiv({ cls: 'folio-stat-left' });
            left.createSpan({ cls: 'folio-stat-icon' });
            left.createSpan({ text: label, cls: 'folio-stat-label' });
            r.createSpan({ text: value, cls: 'folio-stat-value' });
          };
          makeRow('Today', '—');
          makeRow('Total words', '— / —');
          makeRow('Completion', '—');
          makeRow('Writing days', '—');
          makeRow('Daily average', '—');
        } catch (e) { /* ignore */ }

        return;
      }


      /* READ METADATA (authoritative) */
      let metadata = {};
      try {
        if (this.plugin.loadBookMeta) metadata = (await this.plugin.loadBookMeta(book)) || {};
      } catch (e) {
        metadata = {};
      }
      if (this._renderCounter !== token) return;

      // BOOK HEADER — new visual structure (cover left, meta right)
      const headerEl = el.createDiv("folio-book-header");

      const coverCol = headerEl.createDiv("folio-book-cover-col");
      const coverEl = coverCol.createDiv("folio-book-cover");

      const coverPath = book.cover
        ? this.plugin.app.vault.getResourcePath(book.cover)
        : null;
      if (coverPath) {
        coverEl.style.backgroundImage = `url("${coverPath}")`;
      } else {
        // No cover image - add placeholder with project type icon
        try {
          coverEl.addClass('folio-book-cover-placeholder');
          const iconEl = coverEl.createDiv({ cls: 'folio-book-cover-icon' });
          const projectType = metadata?.projectType || PROJECT_TYPES.BOOK;
          const iconName = getProjectTypeIcon(this.plugin, projectType);
          setIcon(iconEl, iconName);
        } catch {}
      }

      // Title block inside header (cover left, title/subtitle right)
      const titleBlock = headerEl.createDiv("folio-book-title-block");
      titleBlock.createEl("div", {
        cls: "folio-book-title",
        text: (metadata && metadata.title) || book.name || "Untitled book",
      });

      const subtitleText = (metadata && metadata.subtitle) || "";
      if (subtitleText) {
        titleBlock.createEl("div", {
          cls: "folio-book-subtitle",
          text: subtitleText,
        });
      }

      // Separate metadata block (author + description) placed below the header
      const metaBlock = el.createDiv("folio-book-meta folio-book-info");
      // Use authoritative metadata (loadBookMeta maps config -> simple shape)
      const authorVal = (metadata && metadata.author) || "";
      const descVal = (metadata && metadata.description) || "";

      // Author row (non-editable)
      const authorRow = metaBlock.createDiv('folio-meta-row');
      authorRow.createEl('div', { text: 'Author', cls: 'folio-meta-label' });
      authorRow.createEl('div', { text: authorVal || '—', cls: 'folio-meta-value' });

      // Description row (non-editable)
      const descRow = metaBlock.createDiv('folio-meta-row');
      descRow.createEl('div', { text: 'Description', cls: 'folio-meta-label' });
      descRow.createEl('div', { text: descVal || '—', cls: 'folio-meta-value folio-meta-desc' });

      

      /* STRUCTURE (VOLUMES & CHAPTERS) — render from filesystem (editorial order) */
      if (this._renderCounter !== token) return;
      const structureEl = el.createDiv("folio-structure");

      const bookFolder = this.plugin.app.vault.getAbstractFileByPath(book.path);
      if (this._renderCounter !== token) return;
      if (bookFolder instanceof TFolder) {
        await this.renderBookTree(structureEl, bookFolder);
      } else {
        // fallback to in-memory model if filesystem folder missing
        structureEl.createEl("p", { text: "(No folder found on disk)" });
      }

      // (stats compute will be run right before rendering the stats element)

      // Right-click on empty tree zone: show generic tree menu (New file / New volume)
      try {
        structureEl.addEventListener('contextmenu', (evt) => {
          try {
            // if the click was on a specific tree item, let its handler manage the menu
            const item = evt.target && evt.target.closest && evt.target.closest('.tree-item');
            if (item) return; // ignore — files/volumes have their own context menus
            evt.preventDefault();
            const menu = new Menu(this.plugin.app);

            // New root canvas (ask for name)
            menu.addItem((it) =>
              it.setTitle('New root canvas').setIcon('layout-dashboard').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root canvas',
                  placeholder: 'Canvas name (without .canvas)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const raw = (value || '').trim();
                      if (!raw) return;
                      const base = raw.endsWith('.canvas') ? raw.slice(0, -7) : raw;
                      let name = `${base}.canvas`;
                      let i = 1;
                      while (this.plugin.app.vault.getAbstractFileByPath(`${book.path}/${name}`)) {
                        name = `${base} ${i}.canvas`;
                        i += 1;
                      }
                      await this.plugin.app.vault.create(`${book.path}/${name}`, '');
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            // New root file (book root)
            menu.addItem((it) =>
              it.setTitle('New root file').setIcon('file-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root file',
                  placeholder: 'File name (without .md)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      const fileName = name.endsWith('.md') ? name : `${name}.md`;
                      const path = `${book.path}/${fileName}`;
                      if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
                        await this.plugin.app.vault.create(path, '');
                      }
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            // (Only root file/volume allowed from empty tree context)

            menu.addItem((it) =>
              it.setTitle('New volume').setIcon('folder-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New volume',
                  placeholder: 'Volume name',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      await this.plugin.createVolume(book, name);
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.showAtMouseEvent(evt);
          } catch (e) {
            console.error(e);
          }
        });
      } catch (e) {
        // ignore if adding listener fails
      }

      // Fixed-height stats block (reserve real space for stats)
      // Always create a fresh stats element to ensure correct DOM order
      if (this._renderCounter !== token) return;
      this.statsEl = el.createDiv("folio-stats");

      // Render stats into the stats element (stats are updated by file events)
      await this.renderStats(this.statsEl, book);

      // Also allow right-clicking the stats block (it overlays the lower area)
      try {
        if (this.statsEl) this.statsEl.addEventListener('contextmenu', (evt) => {
          try {
            evt.preventDefault();
            const row = evt.target && evt.target.closest && evt.target.closest('.folio-stat-row');
            if (row) return;

            const menu = new Menu(this.plugin.app);
            // New root canvas (ask for name)
            menu.addItem((it) =>
              it.setTitle('New root canvas').setIcon('layout-dashboard').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root canvas',
                  placeholder: 'Canvas name (without .canvas)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const raw = (value || '').trim();
                      if (!raw) return;
                      const base = raw.endsWith('.canvas') ? raw.slice(0, -7) : raw;
                      let name = `${base}.canvas`;
                      let i = 1;
                      while (this.plugin.app.vault.getAbstractFileByPath(`${book.path}/${name}`)) {
                        name = `${base} ${i}.canvas`;
                        i += 1;
                      }
                      await this.plugin.app.vault.create(`${book.path}/${name}`, '');
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.addItem((it) =>
              it.setTitle('New root file').setIcon('file-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New root file',
                  placeholder: 'File name (without .md)',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      const fileName = name.endsWith('.md') ? name : `${name}.md`;
                      const path = `${book.path}/${fileName}`;
                      if (!this.plugin.app.vault.getAbstractFileByPath(path)) {
                        await this.plugin.app.vault.create(path, '');
                      }
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.addItem((it) =>
              it.setTitle('New volume').setIcon('folder-plus').onClick(() => {
                const modal = new TextInputModal(this.plugin.app, {
                  title: 'New volume',
                  placeholder: 'Volume name',
                  cta: 'Create',
                  onSubmit: async (value) => {
                    try {
                      const name = (value || '').trim();
                      if (!name) return;
                      await this.plugin.createVolume(book, name);
                      await this.plugin.refresh();
                      this.plugin.rerenderViews();
                    } catch (e) {
                      console.error(e);
                    }
                  },
                });
                modal.open();
              })
            );

            menu.showAtMouseEvent(evt);
          } catch (e) {
            console.error(e);
          }
        });
      } catch (e) {
        // ignore
      }
    } finally {
      if (this._renderCounter === token) {
        this._isRendering = false;
      }
    }
  }
}
