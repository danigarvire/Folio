/**
 * Project Type Selector Modal - Choose between Book, TV Show, or Film
 */

import { Modal, setIcon } from 'obsidian';
import { PROJECT_TYPES } from '../constants/index.js';

export class ProjectTypeSelectorModal extends Modal {
  constructor(app, onSelect) {
    super(app);
    this.onSelect = onSelect;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('folio-project-type-selector-modal');

    contentEl.createEl('h2', { text: 'Select Project Type' });

    const optionsContainer = contentEl.createDiv({ cls: 'folio-project-type-options' });

    // Book option
    this.createProjectOption(optionsContainer, {
      title: 'Book',
      description: 'Novel or written work',
      icon: 'book',
      value: PROJECT_TYPES.BOOK
    });

    // TV Show option
    this.createProjectOption(optionsContainer, {
      title: 'TV Show',
      description: 'Series with episodes and sequences',
      icon: 'tv-minimal-play',
      value: PROJECT_TYPES.SCRIPT
    });

    // Film option
    this.createProjectOption(optionsContainer, {
      title: 'Film',
      description: 'Feature film or short',
      icon: 'clapperboard',
      value: PROJECT_TYPES.FILM
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
