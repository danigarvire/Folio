/**
 * Folio Settings Tab
 */

import { PluginSettingTab, Setting, setIcon } from 'obsidian';

// Common Lucide icons for project templates
const COMMON_ICONS = [
  'book', 'book-open', 'book-text', 'library',
  'newspaper', 'file-text', 'scroll', 'scroll-text',
  'tv', 'tv-minimal-play', 'clapperboard', 'film', 'video',
  'pen', 'pen-tool', 'pencil', 'feather',
  'folder', 'folder-open', 'file', 'files',
  'notebook', 'clipboard', 'sticky-note', 'bookmark',
  'graduation-cap', 'school', 'brain', 'lightbulb',
  'music', 'mic', 'headphones', 'radio',
  'camera', 'image', 'palette', 'brush',
  'code', 'terminal', 'database', 'server',
  'globe', 'map', 'compass', 'navigation',
  'heart', 'star', 'trophy', 'medal',
  'rocket', 'plane', 'car', 'ship'
];

export class FolioSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const el = this.containerEl;
    el.empty();

    el.createEl("h2", { text: "Folio" });

    // ============ BASIC OPTIONS ============
    const basicSection = el.createDiv({ cls: 'folio-settings-section' });
    const basicHeader = basicSection.createDiv({ cls: 'folio-settings-section-header' });
    const basicToggle = basicHeader.createSpan({ cls: 'folio-settings-toggle' });
    setIcon(basicToggle, 'chevron-down');
    basicHeader.createSpan({ text: 'Basic options', cls: 'folio-settings-section-title' });
    const basicContent = basicSection.createDiv({ cls: 'folio-settings-section-content' });

    basicHeader.onclick = () => {
      basicContent.classList.toggle('collapsed');
      setIcon(basicToggle, basicContent.classList.contains('collapsed') ? 'chevron-right' : 'chevron-down');
    };

    new Setting(basicContent)
      .setName("Default author")
      .setDesc("Default author name for new projects")
      .addText((text) =>
        text
          .setPlaceholder("Author name")
          .setValue(this.plugin.settings.defaultAuthor || "")
          .onChange(async (value) => {
            this.plugin.settings.defaultAuthor = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(basicContent)
      .setName("Project storage path")
      .setDesc("Default storage path for new projects (relative to vault root)")
      .addText((text) =>
        text
          .setPlaceholder("projects")
          .setValue(this.plugin.settings.basePath || "projects")
          .onChange(async (value) => {
            // Normalize the path: trim whitespace, remove leading/trailing slashes
            let normalizedPath = value.trim().replace(/^\/+|\/+$/g, '') || "projects";
            this.plugin.settings.basePath = normalizedPath;
            await this.plugin.saveSettings();
            // Ensure the base path folder exists
            await this.plugin.ensureBasePath();
            // Rescan books from the new path
            await this.plugin.refresh();
          })
      );

    // ============ TEMPLATE OPTIONS ============
    const templateSection = el.createDiv({ cls: 'folio-settings-section' });
    const templateHeader = templateSection.createDiv({ cls: 'folio-settings-section-header' });
    const templateToggle = templateHeader.createSpan({ cls: 'folio-settings-toggle' });
    setIcon(templateToggle, 'chevron-down');
    templateHeader.createSpan({ text: 'Template options', cls: 'folio-settings-section-title' });
    const templateContent = templateSection.createDiv({ cls: 'folio-settings-section-content' });

    templateHeader.onclick = () => {
      templateContent.classList.toggle('collapsed');
      setIcon(templateToggle, templateContent.classList.contains('collapsed') ? 'chevron-right' : 'chevron-down');
    };

    // Ensure projectTemplates exists
    if (!this.plugin.settings.projectTemplates) {
      this.plugin.settings.projectTemplates = [
        { id: "book", name: "Book", icon: "book", order: 1, description: "Novel or written work" },
        { id: "script", name: "TV Show", icon: "tv-minimal-play", order: 2, description: "Series with episodes and sequences" },
        { id: "film", name: "Film", icon: "clapperboard", order: 3, description: "Feature film or short" },
        { id: "essay", name: "Essay", icon: "newspaper", order: 4, description: "Essay or short nonfiction piece" }
      ];
    }

    // Default template dropdown
    const templates = this.plugin.settings.projectTemplates || [];
    const defaultOptions = {};
    templates.sort((a, b) => a.order - b.order).forEach(t => {
      defaultOptions[t.id] = t.name;
    });

    new Setting(templateContent)
      .setName("Default template")
      .setDesc("Default template used when creating new projects")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(defaultOptions)
          .setValue(this.plugin.settings.defaultProjectType || "book")
          .onChange(async (value) => {
            this.plugin.settings.defaultProjectType = value;
            await this.plugin.saveSettings();
          })
      );

    // Project templates header
    templateContent.createEl("h4", { text: "Project templates", cls: "folio-settings-subheader" });

    // Templates list container
    const templatesListEl = templateContent.createDiv({ cls: 'folio-templates-list' });
    this.renderTemplatesList(templatesListEl);

    // Add new template button
    const addBtnContainer = templateContent.createDiv({ cls: 'folio-settings-add-btn-container' });
    const addBtn = addBtnContainer.createEl('button', { text: 'Add new template', cls: 'mod-cta folio-add-template-btn' });
    addBtn.onclick = () => {
      this.openTemplateEditor(null, templatesListEl);
    };
  }

  renderTemplatesList(container) {
    container.empty();
    const templates = (this.plugin.settings.projectTemplates || []).sort((a, b) => a.order - b.order);

    templates.forEach((template, index) => {
      const row = container.createDiv({ cls: 'folio-template-row' });
      
      // Icon
      const iconEl = row.createDiv({ cls: 'folio-template-icon' });
      setIcon(iconEl, template.icon || 'file');

      // Info
      const infoEl = row.createDiv({ cls: 'folio-template-info' });
      infoEl.createDiv({ text: template.name, cls: 'folio-template-name' });
      infoEl.createDiv({ text: template.description || '', cls: 'folio-template-desc' });

      // Actions
      const actionsEl = row.createDiv({ cls: 'folio-template-actions' });

      // Edit
      const editBtn = actionsEl.createEl('button', { cls: 'folio-template-action-btn' });
      setIcon(editBtn, 'pencil');
      editBtn.title = 'Edit template';
      editBtn.onclick = () => {
        this.openTemplateEditor(template, container);
      };

      // Delete (only if more than 1 template)
      if (templates.length > 1) {
        const deleteBtn = actionsEl.createEl('button', { cls: 'folio-template-action-btn mod-danger' });
        setIcon(deleteBtn, 'trash');
        deleteBtn.title = 'Delete template';
        deleteBtn.onclick = async () => {
          this.plugin.settings.projectTemplates = templates.filter(t => t.id !== template.id);
          await this.plugin.saveSettings();
          this.renderTemplatesList(container);
          this.plugin.rerenderViews();
        };
      }
    });
  }

  openTemplateEditor(template, listContainer) {
    const isNew = !template;
    const editData = template ? { ...template } : {
      id: `custom-${Date.now()}`,
      name: '',
      icon: 'file',
      order: (this.plugin.settings.projectTemplates?.length || 0) + 1,
      description: ''
    };

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'folio-template-editor-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'folio-template-editor-modal';

    // Build modal content using DOM methods for proper interactivity
    const title = document.createElement('h3');
    title.textContent = isNew ? 'Add new template' : 'Edit template';
    modal.appendChild(title);

    // Name row
    const nameRow = document.createElement('div');
    nameRow.className = 'folio-template-editor-row';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'folio-template-editor-input';
    nameInput.value = editData.name;
    nameInput.placeholder = 'Template name';
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    modal.appendChild(nameRow);

    // Icon row with picker
    const iconRow = document.createElement('div');
    iconRow.className = 'folio-template-editor-row';
    const iconLabel = document.createElement('label');
    iconLabel.textContent = 'Icon';
    iconRow.appendChild(iconLabel);

    const iconInputRow = document.createElement('div');
    iconInputRow.className = 'folio-template-icon-input-row';

    const iconPreview = document.createElement('span');
    iconPreview.className = 'folio-template-icon-preview folio-icon-clickable';
    iconPreview.title = 'Click to browse icons';
    
    const iconInput = document.createElement('input');
    iconInput.type = 'text';
    iconInput.className = 'folio-template-editor-input';
    iconInput.value = editData.icon;
    iconInput.placeholder = 'e.g., book, newspaper, file';

    iconInputRow.appendChild(iconPreview);
    iconInputRow.appendChild(iconInput);
    iconRow.appendChild(iconInputRow);

    // Icon picker dropdown (hidden by default)
    const iconPicker = document.createElement('div');
    iconPicker.className = 'folio-icon-picker';
    iconPicker.style.display = 'none';
    
    COMMON_ICONS.forEach(iconName => {
      const iconOption = document.createElement('div');
      iconOption.className = 'folio-icon-option';
      iconOption.title = iconName;
      setIcon(iconOption, iconName);
      iconOption.onclick = () => {
        iconInput.value = iconName;
        updateIconPreview();
        iconPicker.style.display = 'none';
      };
      iconPicker.appendChild(iconOption);
    });
    
    iconRow.appendChild(iconPicker);
    modal.appendChild(iconRow);

    // Update icon preview function
    const updateIconPreview = () => {
      iconPreview.innerHTML = '';
      try {
        setIcon(iconPreview, iconInput.value || 'file');
      } catch {
        setIcon(iconPreview, 'file');
      }
    };
    updateIconPreview();

    // Icon input events
    iconInput.addEventListener('input', updateIconPreview);
    iconPreview.onclick = () => {
      iconPicker.style.display = iconPicker.style.display === 'none' ? 'grid' : 'none';
    };

    // Description row
    const descRow = document.createElement('div');
    descRow.className = 'folio-template-editor-row';
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description';
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'folio-template-editor-input';
    descInput.value = editData.description || '';
    descInput.placeholder = 'Short description';
    descRow.appendChild(descLabel);
    descRow.appendChild(descInput);
    modal.appendChild(descRow);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'folio-template-editor-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'folio-template-editor-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'folio-template-editor-save mod-cta';
    saveBtn.textContent = isNew ? 'Add' : 'Save';
    saveBtn.type = 'button';
    saveBtn.onclick = async () => {
      const name = nameInput.value.trim();
      const icon = iconInput.value.trim() || 'file';
      const desc = descInput.value.trim();

      if (!name) {
        nameInput.style.borderColor = 'red';
        return;
      }

      editData.name = name;
      editData.icon = icon;
      editData.description = desc;

      if (isNew) {
        this.plugin.settings.projectTemplates = this.plugin.settings.projectTemplates || [];
        this.plugin.settings.projectTemplates.push(editData);
      } else {
        const idx = this.plugin.settings.projectTemplates.findIndex(t => t.id === editData.id);
        if (idx !== -1) {
          this.plugin.settings.projectTemplates[idx] = editData;
        }
      }

      await this.plugin.saveSettings();
      overlay.remove();
      this.renderTemplatesList(listContainer);
      this.plugin.rerenderViews();
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click (but not on modal click)
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    // Close icon picker when clicking elsewhere
    modal.onclick = (e) => {
      if (!iconInputRow.contains(e.target) && !iconPicker.contains(e.target)) {
        iconPicker.style.display = 'none';
      }
    };

    // Focus name input
    nameInput.focus();
  }
}
