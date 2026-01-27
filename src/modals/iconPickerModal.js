/**
 * Icon Picker Modal
 * A modal for selecting icons from a grid of common Lucide icons
 */

import { Modal, setIcon } from "obsidian";

// Common Lucide icons for project templates
export const COMMON_ICONS = [
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
  'rocket', 'plane', 'car', 'ship',
  'crown', 'gem', 'diamond', 'sparkles',
  'sun', 'moon', 'cloud', 'umbrella',
  'tree', 'flower', 'leaf', 'mountain',
  'home', 'building', 'castle', 'tent',
  'gift', 'shopping-bag', 'package', 'box',
  'clock', 'calendar', 'alarm-clock', 'timer',
  'mail', 'message-circle', 'message-square', 'send',
  'phone', 'smartphone', 'tablet', 'monitor',
  'wifi', 'bluetooth', 'battery', 'plug',
  'key', 'lock', 'unlock', 'shield',
  'user', 'users', 'user-circle', 'contact',
  'settings', 'sliders', 'tool', 'wrench',
  'search', 'zoom-in', 'zoom-out', 'filter',
  'link', 'external-link', 'share', 'download',
  'upload', 'save', 'copy', 'clipboard-copy',
  'trash', 'archive', 'inbox', 'outbox',
  'check', 'check-circle', 'x', 'x-circle',
  'alert-circle', 'alert-triangle', 'info', 'help-circle',
  'play', 'pause', 'stop', 'skip-forward',
  'volume', 'volume-2', 'speaker', 'bell',
  'eye', 'eye-off', 'glasses', 'scan',
  'printer', 'scanner', 'fax', 'projector',
  'cpu', 'hard-drive', 'memory-stick', 'usb',
  'git-branch', 'git-commit', 'git-merge', 'git-pull-request',
  'layout-dashboard', 'layout-grid', 'layout-list', 'kanban'
];

export class IconPickerModal extends Modal {
  constructor(app, { title, currentIcon, onSelect }) {
    super(app);
    this.title = title || "Select Icon";
    this.currentIcon = currentIcon;
    this.onSelect = onSelect;
    this.searchQuery = '';
    this.filteredIcons = [...COMMON_ICONS];
  }

  onOpen() {
    const { contentEl, modalEl, containerEl } = this;
    contentEl.empty();
    contentEl.addClass('folio-icon-picker-modal');
    
    // Force high z-index on modal container
    if (containerEl) {
      containerEl.style.zIndex = '9999';
    }
    if (modalEl) {
      modalEl.style.zIndex = '10000';
    }

    // Title
    contentEl.createEl("h2", { text: this.title });

    // Search input
    const searchContainer = contentEl.createDiv({ cls: 'folio-icon-picker-search' });
    const searchInput = searchContainer.createEl('input', {
      type: 'text',
      placeholder: 'Search icons...',
      cls: 'folio-icon-picker-search-input'
    });
    
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.filterAndRenderIcons(iconGrid);
    };

    // Icon grid
    const iconGrid = contentEl.createDiv({ cls: 'folio-icon-picker-grid' });
    this.renderIcons(iconGrid, COMMON_ICONS);

    // Focus search
    searchInput.focus();
  }

  filterAndRenderIcons(container) {
    const filtered = this.searchQuery 
      ? COMMON_ICONS.filter(icon => icon.toLowerCase().includes(this.searchQuery))
      : COMMON_ICONS;
    this.renderIcons(container, filtered);
  }

  renderIcons(container, icons) {
    container.empty();
    
    if (icons.length === 0) {
      container.createDiv({ 
        cls: 'folio-icon-picker-empty',
        text: 'No icons found'
      });
      return;
    }

    icons.forEach(iconName => {
      const iconOption = container.createDiv({ 
        cls: 'folio-icon-picker-option' + (iconName === this.currentIcon ? ' is-selected' : '')
      });
      iconOption.title = iconName;
      setIcon(iconOption, iconName);
      
      // Icon name label
      const label = iconOption.createSpan({ cls: 'folio-icon-picker-label' });
      label.textContent = iconName;
      
      iconOption.onclick = () => {
        this.onSelect(iconName);
        this.close();
      };
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
