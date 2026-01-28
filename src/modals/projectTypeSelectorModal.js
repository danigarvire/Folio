/**
 * Project Type Selector Modal - Choose project type from configured templates
 */

import { Modal, setIcon } from 'obsidian';

export class ProjectTypeSelectorModal extends Modal {
  constructor(app, onSelect, templates = null) {
    super(app);
    this.onSelect = onSelect;
    this.templates = templates;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('folio-project-type-selector-modal');

    contentEl.createEl('h2', { text: 'Select Project Type' });

    const optionsContainer = contentEl.createDiv({ cls: 'folio-project-type-options' });

    // Use templates from settings if provided, otherwise use defaults
    const templates = this.templates || [
      { id: 'book', name: 'Book', icon: 'book', order: 1, description: 'Novel or written work' },
      { id: 'script', name: 'TV Show', icon: 'tv', order: 2, description: 'Series with episodes and sequences' },
      { id: 'film', name: 'Film', icon: 'clapperboard', order: 3, description: 'Feature film or short' },
      { id: 'essay', name: 'Essay', icon: 'newspaper', order: 4, description: 'Essay or short nonfiction piece' }
    ];

    // Sort by order and render each template
    templates.sort((a, b) => a.order - b.order).forEach(template => {
      this.createProjectOption(optionsContainer, {
        title: template.name,
        description: template.description || '',
        icon: template.icon || 'file',
        value: template.id
      });
    });
  }

  createProjectOption(container, { title, description, icon, value }) {
    const option = container.createDiv({ cls: 'folio-project-type-option' });
    
    const iconEl = option.createDiv({ cls: 'folio-project-type-icon' });
    setIcon(iconEl, icon);
    
    const content = option.createDiv({ cls: 'folio-project-type-content' });
    content.createEl('div', { text: title, cls: 'folio-project-type-title' });
    content.createEl('div', { text: description, cls: 'folio-project-type-description' });

    option.addEventListener('click', () => {
      this.onSelect(value);
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
