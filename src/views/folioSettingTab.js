/**
 * Folio Settings Tab
 */

import { PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import { IconPickerModal } from '../modals/iconPickerModal';
import { DEFAULT_SETTINGS } from '../constants/index';

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
      .addText((text) => {
        text
          .setPlaceholder("projects")
          .setValue(this.plugin.settings.basePath || "projects")
          .onChange(async (value) => {
            // Normalize the path: trim whitespace, remove leading/trailing slashes
            let normalizedPath = value.trim().replace(/^\/+|\/+$/g, '') || "projects";
            this.plugin.settings.basePath = normalizedPath;
            await this.plugin.saveSettings();
          });
        // Only create folder and refresh when user finishes typing (on blur)
        text.inputEl.addEventListener("blur", async () => {
          await this.plugin.ensureBasePath();
          await this.plugin.refresh();
        });
      });

    // ============ TEMPLATE OPTIONS ============
    const templateSection = el.createDiv({ cls: 'folio-settings-section' });
    const templateHeader = templateSection.createDiv({ cls: 'folio-settings-section-header' });
    const templateToggle = templateHeader.createSpan({ cls: 'folio-settings-toggle' });
    setIcon(templateToggle, 'chevron-right');
    templateHeader.createSpan({ text: 'Template options', cls: 'folio-settings-section-title' });
    const templateContent = templateSection.createDiv({ cls: 'folio-settings-section-content collapsed' });

    templateHeader.onclick = () => {
      templateContent.classList.toggle('collapsed');
      setIcon(templateToggle, templateContent.classList.contains('collapsed') ? 'chevron-right' : 'chevron-down');
    };

    // Ensure projectTemplates exists
    if (!this.plugin.settings.projectTemplates) {
      this.plugin.settings.projectTemplates = [
        { id: "book", name: "Book", icon: "book", order: 1, description: "Novel or written work" },
        { id: "script", name: "TV Show", icon: "tv", order: 2, description: "Series with episodes and sequences" },
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

    // Project templates header with reset button
    templateContent.createEl("h4", { text: "Project templates", cls: "folio-settings-subheader" });
    const templatesHeaderRow = templateContent.createDiv({ cls: 'folio-templates-header-row' });
    const resetBtn = templatesHeaderRow.createEl('button', { cls: 'folio-reset-templates-btn' });
    setIcon(resetBtn, 'rotate-ccw');
    resetBtn.title = 'Reset all templates to defaults';
    resetBtn.onclick = async () => {
      const confirmed = confirm('Are you sure you want to reset all templates to their default values? This will remove any custom templates and restore the original Book, TV Show, Film, and Essay templates.');
      if (confirmed) {
        this.plugin.settings.projectTemplates = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.projectTemplates));
        await this.plugin.saveSettings();
        this.renderTemplatesList(templatesListEl);
        this.plugin.rerenderViews();
        new Notice('Templates reset to defaults');
      }
    };

    // Templates list container
    const templatesListEl = templateContent.createDiv({ cls: 'folio-templates-list' });
    this.renderTemplatesList(templatesListEl);

    // Add new template button
    const addBtnContainer = templateContent.createDiv({ cls: 'folio-settings-add-btn-container' });
    const addBtn = addBtnContainer.createEl('button', { text: 'Add new template', cls: 'mod-cta folio-add-template-btn' });
    addBtn.onclick = () => {
      this.openTemplateEditor(null, templatesListEl);
    };

    // ============ SUPPORT ============
    const supportSection = el.createDiv({ cls: 'folio-settings-support' });
    supportSection.createDiv({ cls: 'folio-settings-support-title', text: 'Support Folio development' });
    const supportCopy = supportSection.createDiv({ cls: 'folio-settings-support-copy' });
    supportCopy.createSpan({
      text: 'Folio is free and open-source.'
    });
    supportCopy.createEl('br');
    supportCopy.createEl('br');
    supportCopy.createSpan({
      text: 'If you find it useful, you can optionally support its development here'
    });
    supportCopy.createEl('br');
    supportCopy.createSpan({
      text: 'Support is voluntary and does not unlock features or provide special access.'
    });
    const supportLink = supportSection.createEl('a', { cls: 'folio-settings-support-link', text: 'Buy Me a Coffee' });
    supportLink.href = 'https://buymeacoffee.com/danielgarvire';
    supportLink.target = '_blank';
    supportLink.rel = 'noopener noreferrer';
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
          if (!confirm(`Delete the “${template.name}” template? This can't be undone (existing projects are unaffected).`)) return;
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
    const editData = template ? JSON.parse(JSON.stringify(template)) : {
      id: `custom-${Date.now()}`,
      name: '',
      icon: 'file',
      order: (this.plugin.settings.projectTemplates?.length || 0) + 1,
      description: '',
      structure: []
    };
    
    // Ensure structure exists
    if (!editData.structure) {
      editData.structure = [];
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'folio-template-editor-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'folio-template-editor-modal folio-template-editor-modal-large';

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
    nameInput.onkeydown = (e) => e.stopPropagation();
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
    iconInput.onkeydown = (e) => e.stopPropagation();

    iconInputRow.appendChild(iconPreview);
    iconInputRow.appendChild(iconInput);
    iconRow.appendChild(iconInputRow);
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
      new IconPickerModal(this.app, {
        title: 'Select Template Icon',
        currentIcon: iconInput.value,
        onSelect: (iconName) => {
          iconInput.value = iconName;
          updateIconPreview();
        }
      }).open();
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
    descInput.onkeydown = (e) => e.stopPropagation();
    descRow.appendChild(descLabel);
    descRow.appendChild(descInput);
    modal.appendChild(descRow);

    // Draft selector — which folder OR single file is the manuscript. One control
    // (no per-node buttons), with a DRAFT badge shown on the chosen node.
    const draftRow = document.createElement('div');
    draftRow.className = 'folio-template-editor-row';
    const draftLabel = document.createElement('label');
    draftLabel.textContent = 'Draft (manuscript)';
    const draftSelect = document.createElement('select');
    draftSelect.className = 'folio-template-editor-input';
    draftRow.appendChild(draftLabel);
    draftRow.appendChild(draftSelect);
    modal.appendChild(draftRow);
    const draftHint = document.createElement('div');
    draftHint.className = 'folio-template-editor-hint';
    draftHint.textContent = 'The manuscript a draft is written in — a folder (many chapters/episodes) or a single file (one screenplay/essay). It drives the outline, beats and timeline; everything else (notes, characters, research…) stays out of the way. Tip: name a folder “Drafts” to use it as the shelf where new drafts are created.';
    modal.appendChild(draftHint);

    // Collect folders and files as draft targets (canvases can't be drafts).
    const collectDraftTargets = (nodes, depth = 0, acc = []) => {
      for (const n of nodes || []) {
        if (n.type === 'folder') {
          acc.push({ node: n, label: `${'— '.repeat(depth)}${n.title}` });
          collectDraftTargets(n.children, depth + 1, acc);
        } else if (n.type === 'file') {
          acc.push({ node: n, label: `${'— '.repeat(depth)}${n.title} (file)` });
        }
      }
      return acc;
    };
    const refreshDraftSelect = () => {
      const targets = collectDraftTargets(editData.structure);
      draftSelect._folders = targets;
      draftSelect.innerHTML = '';
      const none = document.createElement('option');
      none.value = ''; none.textContent = targets.length ? '— None —' : '— Add a folder or file first —';
      draftSelect.appendChild(none);
      targets.forEach((f, i) => {
        const o = document.createElement('option');
        o.value = String(i); o.textContent = f.label;
        if (f.node.draft) o.selected = true;
        draftSelect.appendChild(o);
      });
      draftSelect.disabled = targets.length === 0;
    };
    draftSelect.onchange = () => {
      (draftSelect._folders || []).forEach((f) => { delete f.node.draft; });
      const idx = draftSelect.value === '' ? -1 : Number(draftSelect.value);
      const targets = draftSelect._folders || [];
      if (idx >= 0 && targets[idx]) targets[idx].node.draft = true;
      renderStructureTree();
    };

    // Screenplay selector — which folder OR file is screenplay-formatted. Same
    // explicit single control as Draft, with a SCREENPLAY badge on the chosen node.
    const spRow = document.createElement('div');
    spRow.className = 'folio-template-editor-row';
    const spLabel = document.createElement('label');
    spLabel.textContent = 'Screenplay format';
    const spSelect = document.createElement('select');
    spSelect.className = 'folio-template-editor-input';
    spRow.appendChild(spLabel);
    spRow.appendChild(spSelect);
    modal.appendChild(spRow);
    const spHint = document.createElement('div');
    spHint.className = 'folio-template-editor-hint';
    spHint.textContent = 'Files here are written as a screenplay (the md-screenplay style: # scene heading, ## character, ### parenthetical…). Pick a folder to format every file inside it, or a single file. Leave as “None” for prose. Usually this is the same place as the Draft.';
    modal.appendChild(spHint);

    const refreshScreenplaySelect = () => {
      const targets = collectDraftTargets(editData.structure);
      spSelect._targets = targets;
      spSelect.innerHTML = '';
      const none = document.createElement('option');
      none.value = ''; none.textContent = targets.length ? '— None (prose) —' : '— Add a folder or file first —';
      spSelect.appendChild(none);
      targets.forEach((f, i) => {
        const o = document.createElement('option');
        o.value = String(i); o.textContent = f.label;
        if (f.node.screenplay) o.selected = true;
        spSelect.appendChild(o);
      });
      spSelect.disabled = targets.length === 0;
    };
    spSelect.onchange = () => {
      (spSelect._targets || []).forEach((f) => { delete f.node.screenplay; });
      const idx = spSelect.value === '' ? -1 : Number(spSelect.value);
      const targets = spSelect._targets || [];
      if (idx >= 0 && targets[idx]) targets[idx].node.screenplay = true;
      renderStructureTree();
    };

    // Structure section
    const structureSection = document.createElement('div');
    structureSection.className = 'folio-template-structure-section';
    
    const structureHeader = document.createElement('div');
    structureHeader.className = 'folio-template-structure-header';
    const structureLabel = document.createElement('label');
    structureLabel.textContent = 'Default structure';
    structureHeader.appendChild(structureLabel);
    
    // Add buttons
    const structureActions = document.createElement('div');
    structureActions.className = 'folio-template-structure-actions';
    
    const addFileBtn = document.createElement('button');
    addFileBtn.className = 'folio-template-structure-add-btn';
    addFileBtn.type = 'button';
    setIcon(addFileBtn, 'file-plus');
    addFileBtn.appendChild(document.createTextNode(' File'));
    addFileBtn.onclick = () => {
      editData.structure.push({ title: 'New File', type: 'file' });
      renderStructureTree();
    };
    
    const addFolderBtn = document.createElement('button');
    addFolderBtn.className = 'folio-template-structure-add-btn';
    addFolderBtn.type = 'button';
    setIcon(addFolderBtn, 'folder-plus');
    addFolderBtn.appendChild(document.createTextNode(' Folder'));
    addFolderBtn.onclick = () => {
      editData.structure.push({ title: 'New Folder', type: 'folder', children: [] });
      renderStructureTree();
    };
    
    const addCanvasBtn = document.createElement('button');
    addCanvasBtn.className = 'folio-template-structure-add-btn';
    addCanvasBtn.type = 'button';
    setIcon(addCanvasBtn, 'layout-dashboard');
    addCanvasBtn.appendChild(document.createTextNode(' Canvas'));
    addCanvasBtn.onclick = () => {
      editData.structure.push({ title: 'New Canvas', type: 'canvas' });
      renderStructureTree();
    };
    
    structureActions.appendChild(addFileBtn);
    structureActions.appendChild(addFolderBtn);
    structureActions.appendChild(addCanvasBtn);
    structureHeader.appendChild(structureActions);
    structureSection.appendChild(structureHeader);
    
    const structureTree = document.createElement('div');
    structureTree.className = 'folio-template-structure-tree';
    structureSection.appendChild(structureTree);
    
    // Track expanded folders
    const expandedFolders = new Set();
    
    // Drag and drop state (lifted to outer scope)
    let draggedNode = null;
    let draggedIndex = null;
    let draggedParentArray = null;
    
    // Render structure tree function
    const renderStructureTree = () => {
      structureTree.innerHTML = '';
      
      const renderNode = (node, parentArray, index, depth = 0) => {
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'folio-template-structure-node-container';
        
        const nodeRow = document.createElement('div');
        nodeRow.className = 'folio-template-structure-node';
        nodeRow.style.paddingLeft = `${depth * 20}px`;
        nodeRow.draggable = true;
        
        // Drag handle
        const dragHandle = document.createElement('span');
        dragHandle.className = 'folio-template-structure-node-drag-handle';
        dragHandle.title = 'Drag to reorder';
        setIcon(dragHandle, 'grip-horizontal');
        nodeRow.appendChild(dragHandle);
        
        // Drag and drop handlers
        nodeRow.addEventListener('dragstart', (e) => {
          draggedNode = node;
          draggedIndex = index;
          draggedParentArray = parentArray;
          nodeRow.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => nodeRow.style.opacity = '0.5', 0);
        });
        
        nodeRow.addEventListener('dragend', (e) => {
          nodeRow.style.opacity = '1';
          nodeRow.classList.remove('dragging');
          document.querySelectorAll('.folio-template-structure-node').forEach(n => {
            n.classList.remove('drag-over');
          });
        });
        
        nodeRow.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          nodeRow.classList.add('drag-over');
        });
        
        nodeRow.addEventListener('dragleave', (e) => {
          nodeRow.classList.remove('drag-over');
        });
        
        nodeRow.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          nodeRow.classList.remove('drag-over');
          
          if (draggedNode && draggedParentArray === parentArray && draggedIndex !== index) {
            // Remove from old position
            parentArray.splice(draggedIndex, 1);
            // Insert at new position
            const newIndex = draggedIndex < index ? index - 1 : index;
            parentArray.splice(newIndex, 0, draggedNode);
            renderStructureTree();
          }
          // Reset drag state
          draggedNode = null;
          draggedIndex = null;
          draggedParentArray = null;
        });
        
        // Folder toggle (only for folders)
        if (node.type === 'folder') {
          const toggleBtn = document.createElement('span');
          toggleBtn.className = 'folio-template-structure-node-toggle';
          const isExpanded = expandedFolders.has(node);
          setIcon(toggleBtn, isExpanded ? 'chevron-down' : 'chevron-right');
          toggleBtn.onclick = () => {
            if (expandedFolders.has(node)) {
              expandedFolders.delete(node);
            } else {
              expandedFolders.add(node);
            }
            renderStructureTree();
          };
          nodeRow.appendChild(toggleBtn);
        } else {
          // Spacer for alignment
          const spacer = document.createElement('span');
          spacer.className = 'folio-template-structure-node-spacer';
          nodeRow.appendChild(spacer);
        }
        
        // Icon (clickable to change)
        const nodeIcon = document.createElement('span');
        nodeIcon.className = 'folio-template-structure-node-icon folio-icon-clickable';
        nodeIcon.title = 'Click to change icon';
        const defaultIcon = node.type === 'folder' ? 'folder' : node.type === 'canvas' ? 'layout-dashboard' : 'file';
        setIcon(nodeIcon, node.icon || defaultIcon);
        
        nodeIcon.onclick = (e) => {
          e.stopPropagation();
          new IconPickerModal(this.app, {
            title: `Select Icon for "${node.title}"`,
            currentIcon: node.icon || defaultIcon,
            onSelect: (iconName) => {
              node.icon = iconName;
              renderStructureTree();
            }
          }).open();
        };
        
        nodeRow.appendChild(nodeIcon);
        
        // Title input
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'folio-template-structure-node-title';
        titleInput.value = node.title;
        titleInput.onclick = (e) => e.stopPropagation();
        titleInput.onkeydown = (e) => e.stopPropagation();
        titleInput.oninput = (e) => {
          node.title = e.target.value;
        };
        titleInput.onblur = (e) => {
          node.title = e.target.value.trim() || 'Untitled';
          if (!e.target.value.trim()) {
            e.target.value = 'Untitled';
          }
        };
        nodeRow.appendChild(titleInput);
        
        // Type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'folio-template-structure-node-type';
        typeBadge.textContent = node.type;
        nodeRow.appendChild(typeBadge);

        // Draft badge (set via the Draft folder dropdown above)
        if (node.draft) {
          const draftBadge = document.createElement('span');
          draftBadge.className = 'folio-template-structure-node-draft';
          draftBadge.textContent = 'DRAFT';
          nodeRow.appendChild(draftBadge);
        }
        // Screenplay badge — files here (and under here, for folders) get the
        // md-screenplay cssclass. Toggled with the clapperboard action.
        if (node.screenplay) {
          const spBadge = document.createElement('span');
          spBadge.className = 'folio-template-structure-node-screenplay';
          spBadge.textContent = 'SCREENPLAY';
          nodeRow.appendChild(spBadge);
        }

        // Node actions
        const nodeActions = document.createElement('div');
        nodeActions.className = 'folio-template-structure-node-actions';
        
        // Add child buttons (only for folders)
        if (node.type === 'folder') {
          const addFileBtn = document.createElement('button');
          addFileBtn.className = 'folio-template-structure-node-btn';
          addFileBtn.type = 'button';
          addFileBtn.title = 'Add file';
          setIcon(addFileBtn, 'file-plus');
          addFileBtn.onclick = () => {
            if (!node.children) node.children = [];
            node.children.push({ title: 'New File', type: 'file' });
            expandedFolders.add(node);
            renderStructureTree();
          };
          nodeActions.appendChild(addFileBtn);
          
          const addFolderBtn = document.createElement('button');
          addFolderBtn.className = 'folio-template-structure-node-btn';
          addFolderBtn.type = 'button';
          addFolderBtn.title = 'Add folder';
          setIcon(addFolderBtn, 'folder-plus');
          addFolderBtn.onclick = () => {
            if (!node.children) node.children = [];
            node.children.push({ title: 'New Folder', type: 'folder', children: [] });
            expandedFolders.add(node);
            renderStructureTree();
          };
          nodeActions.appendChild(addFolderBtn);
          
          const addCanvasBtn = document.createElement('button');
          addCanvasBtn.className = 'folio-template-structure-node-btn';
          addCanvasBtn.type = 'button';
          addCanvasBtn.title = 'Add canvas';
          setIcon(addCanvasBtn, 'layout-dashboard');
          addCanvasBtn.onclick = () => {
            if (!node.children) node.children = [];
            node.children.push({ title: 'New Canvas', type: 'canvas' });
            expandedFolders.add(node);
            renderStructureTree();
          };
          nodeActions.appendChild(addCanvasBtn);
        }
        
        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'folio-template-structure-node-btn mod-danger';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete';
        setIcon(deleteBtn, 'trash');
        deleteBtn.onclick = () => {
          parentArray.splice(index, 1);
          renderStructureTree();
        };
        nodeActions.appendChild(deleteBtn);
        
        nodeRow.appendChild(nodeActions);
        nodeContainer.appendChild(nodeRow);
        structureTree.appendChild(nodeContainer);
        
        // Render children (only if folder is expanded)
        if (node.type === 'folder' && node.children && node.children.length > 0 && expandedFolders.has(node)) {
          node.children.forEach((child, childIndex) => {
            renderNode(child, node.children, childIndex, depth + 1);
          });
        }
      };
      
      if (editData.structure.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'folio-template-structure-empty';
        emptyMsg.textContent = 'No items. Add files or folders above.';
        structureTree.appendChild(emptyMsg);
      } else {
        editData.structure.forEach((node, index) => {
          renderNode(node, editData.structure, index, 0);
        });
      }
      refreshDraftSelect(); // keep the Draft dropdown in sync with the structure
      refreshScreenplaySelect(); // …and the Screenplay dropdown
    };

    renderStructureTree();
    modal.appendChild(structureSection);

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

    // Mount INSIDE the settings .modal (the focus-trapped region) so the editor's
    // inputs can hold focus — appending to document.body let Obsidian's focus trap
    // steal keystrokes back to the settings fields (the "typing lands on the
    // author field" bug).
    const host = this.containerEl.closest('.modal') || this.containerEl.closest('.modal-container') || this.containerEl || document.body;
    host.appendChild(overlay);

    const close = () => { document.removeEventListener('keydown', onKey, true); overlay.remove(); };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    };
    document.addEventListener('keydown', onKey, true);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
    cancelBtn.onclick = close;
    // Keep the original save handler but ensure the listener is torn down too.
    const origSave = saveBtn.onclick;
    saveBtn.onclick = async (e) => { await origSave(e); document.removeEventListener('keydown', onKey, true); };

    // Focus the name field so typing goes where the user expects.
    setTimeout(() => { nameInput.focus(); nameInput.select(); }, 0);

    // Close on overlay click (but not on modal click)
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    // Prevent keyboard events from propagating to settings behind modal
    modal.onkeydown = (e) => e.stopPropagation();
    modal.onkeyup = (e) => e.stopPropagation();
    modal.onkeypress = (e) => e.stopPropagation();

    // Focus name input
    nameInput.focus();
  }
}
