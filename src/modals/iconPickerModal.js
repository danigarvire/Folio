/**
 * Icon Picker Modal
 * A modal for selecting icons from a grid of common Lucide icons
 */

import { Modal, setIcon } from "obsidian";

// Comprehensive Lucide icons for project templates
export const COMMON_ICONS = [
  // Books & Documents
  'book', 'book-open', 'book-text', 'book-copy', 'book-marked', 'book-open-check', 'book-open-text',
  'library', 'library-big', 'notebook', 'notebook-pen', 'notebook-tabs',
  'newspaper', 'file-text', 'file', 'files', 'file-check', 'file-edit', 'file-plus', 'file-minus',
  'scroll', 'scroll-text', 'sticky-note', 'clipboard', 'clipboard-list', 'clipboard-check',
  'bookmark', 'bookmark-plus', 'bookmarks', 'bookmark-check',
  
  // Writing & Creativity
  'pen', 'pen-tool', 'pen-line', 'pencil', 'pencil-line', 'pencil-ruler',
  'feather', 'highlighter', 'eraser', 'type', 'text', 'text-cursor', 'text-cursor-input',
  'signature', 'quote', 'pilcrow', 'baseline', 'subscript', 'superscript',
  'spell-check', 'spell-check-2', 'whole-word', 'case-sensitive',
  
  // Media & Entertainment
  'tv', 'tv-minimal', 'tv-minimal-play', 'monitor-play',
  'clapperboard', 'film', 'video', 'videotape', 'camera', 'camera-off',
  'projector', 'theater', 'popcorn', 'ticket', 'drama',
  'music', 'music-2', 'music-3', 'music-4', 'mic', 'mic-2', 'mic-off',
  'headphones', 'headset', 'radio', 'podcast', 'audio-lines', 'audio-waveform',
  'play', 'play-circle', 'pause', 'pause-circle', 'stop-circle', 'skip-forward', 'skip-back',
  'rewind', 'fast-forward', 'repeat', 'repeat-1', 'shuffle', 'list-music',
  
  // Visual & Art
  'image', 'image-plus', 'images', 'gallery-horizontal', 'gallery-vertical',
  'palette', 'paintbrush', 'paintbrush-2', 'brush', 'paint-bucket', 'paint-roller',
  'pipette', 'droplet', 'droplets', 'blend', 'contrast', 'sun-dim',
  'aperture', 'focus', 'scan', 'crop', 'flip-horizontal', 'flip-vertical',
  'rotate-ccw', 'rotate-cw', 'move', 'maximize', 'minimize',
  'frame', 'picture-in-picture', 'picture-in-picture-2',
  
  // Folders & Organization
  'folder', 'folder-open', 'folder-closed', 'folder-plus', 'folder-minus',
  'folder-check', 'folder-x', 'folder-search', 'folder-heart', 'folder-input', 'folder-output',
  'folder-archive', 'folder-cog', 'folder-dot', 'folder-git', 'folder-git-2',
  'folder-kanban', 'folder-key', 'folder-lock', 'folder-symlink', 'folder-sync', 'folder-tree',
  'folders', 'package', 'package-open', 'box', 'boxes', 'archive', 'archive-restore',
  
  // Education & Learning
  'graduation-cap', 'school', 'school-2', 'backpack',
  'brain', 'brain-circuit', 'brain-cog', 'lightbulb', 'lightbulb-off',
  'lamp', 'lamp-desk', 'lamp-floor', 'lamp-ceiling', 'lamp-wall-down', 'lamp-wall-up',
  'presentation', 'flip-chart', 'clipboard-pen', 'clipboard-type',
  'calculator', 'ruler', 'triangle-ruler', 'drafting-compass',
  'beaker', 'flask-conical', 'flask-round', 'microscope', 'telescope', 'atom',
  
  // Technology
  'code', 'code-2', 'terminal', 'terminal-square', 'braces', 'brackets',
  'database', 'server', 'hard-drive', 'cpu', 'memory-stick', 'usb',
  'monitor', 'laptop', 'laptop-2', 'tablet', 'smartphone', 'phone',
  'keyboard', 'mouse', 'mouse-pointer', 'mouse-pointer-2', 'touchpad',
  'wifi', 'wifi-off', 'bluetooth', 'nfc', 'signal', 'antenna',
  'battery', 'battery-charging', 'battery-full', 'battery-low', 'battery-medium', 'battery-warning',
  'plug', 'plug-2', 'plug-zap', 'power', 'power-off',
  'git-branch', 'git-commit', 'git-merge', 'git-pull-request', 'git-fork', 'git-compare',
  'github', 'gitlab', 'chrome', 'firefox',
  
  // Navigation & Location
  'globe', 'globe-2', 'earth', 'map', 'map-pin', 'map-pinned',
  'compass', 'navigation', 'navigation-2', 'locate', 'locate-fixed', 'locate-off',
  'route', 'signpost', 'signpost-big', 'milestone', 'flag', 'flag-triangle-right',
  'home', 'house', 'house-plus', 'building', 'building-2', 'factory', 'warehouse', 'store',
  'castle', 'church', 'landmark', 'tent', 'tent-tree', 'mountain', 'mountain-snow', 'trees',
  
  // People & Social
  'user', 'user-2', 'user-circle', 'user-circle-2', 'user-check', 'user-plus', 'user-minus', 'user-x',
  'users', 'users-2', 'users-round', 'contact', 'contact-2', 'contacts',
  'person-standing', 'accessibility', 'baby', 'hand', 'hand-metal', 'handshake',
  'heart', 'heart-handshake', 'heart-pulse', 'activity', 'heart-crack', 'heart-off',
  'thumbs-up', 'thumbs-down', 'smile', 'smile-plus', 'frown', 'meh', 'laugh', 'angry',
  
  // Communication
  'mail', 'mail-open', 'mail-plus', 'mail-check', 'mail-x', 'mail-warning', 'mail-search',
  'inbox', 'send', 'send-horizontal', 'forward', 'reply', 'reply-all',
  'message-circle', 'message-square', 'message-square-plus', 'messages-square',
  'at-sign', 'hash', 'phone', 'phone-call', 'phone-incoming', 'phone-outgoing',
  'voicemail', 'megaphone', 'volume', 'volume-1', 'volume-2', 'volume-x',
  'bell', 'bell-ring', 'bell-plus', 'bell-minus', 'bell-off',
  
  // Weather & Nature
  'sun', 'sun-dim', 'sun-medium', 'sun-moon', 'sunrise', 'sunset',
  'moon', 'moon-star', 'cloud', 'cloud-sun', 'cloud-rain', 'cloud-snow', 'cloud-lightning',
  'snowflake', 'wind', 'tornado', 'rainbow', 'thermometer', 'thermometer-sun', 'thermometer-snowflake',
  'umbrella', 'umbrella-off', 'droplet', 'droplets', 'waves',
  'tree', 'tree-deciduous', 'tree-pine', 'trees', 'palm-tree', 'sprout', 'leaf', 'clover',
  'flower', 'flower-2', 'cherry', 'apple', 'banana', 'grape', 'citrus',
  'bird', 'bug', 'cat', 'dog', 'fish', 'rabbit', 'snail', 'squirrel', 'turtle',
  
  // Objects & Tools
  'wrench', 'hammer', 'axe', 'pickaxe', 'shovel', 'scissors', 'knife',
  'screwdriver', 'nut', 'cog', 'settings', 'settings-2', 'sliders', 'sliders-horizontal',
  'key', 'key-round', 'key-square', 'lock', 'lock-keyhole', 'unlock', 'unlock-keyhole',
  'shield', 'shield-check', 'shield-alert', 'shield-off', 'shield-question',
  'glasses', 'binoculars', 'eye', 'eye-off', 'scan-eye', 'scan-face',
  'magnet', 'flashlight', 'flashlight-off', 'lighter', 'flame', 'fire-extinguisher',
  'trash', 'trash-2', 'recycle', 'archive', 'archive-restore', 'archive-x',
  
  // Shapes & Symbols
  'circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon',
  'star', 'stars', 'sparkle', 'sparkles', 'zap', 'zap-off', 'bolt',
  'crown', 'gem', 'award', 'badge', 'badge-check', 'medal', 'trophy',
  'ribbon', 'gift', 'party-popper', 'cake', 'cake-slice', 'candy', 'candy-cane', 'cookie', 'ice-cream',
  'check', 'check-circle', 'check-square', 'x', 'x-circle', 'x-square',
  'plus', 'plus-circle', 'plus-square', 'minus', 'minus-circle', 'minus-square',
  'equal', 'divide', 'percent', 'infinity', 'sigma', 'pi', 'omega',
  
  // Arrows & Direction
  'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
  'arrow-up-right', 'arrow-up-left', 'arrow-down-right', 'arrow-down-left',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'chevrons-up', 'chevrons-down', 'chevrons-left', 'chevrons-right',
  'move-up', 'move-down', 'move-left', 'move-right',
  'corner-up-left', 'corner-up-right', 'corner-down-left', 'corner-down-right',
  'undo', 'undo-2', 'redo', 'redo-2', 'refresh-cw', 'refresh-ccw',
  
  // Time & Calendar
  'clock', 'clock-1', 'clock-2', 'clock-3', 'clock-4', 'clock-5', 'clock-6',
  'alarm-clock', 'alarm-clock-check', 'alarm-clock-minus', 'alarm-clock-off', 'alarm-clock-plus',
  'timer', 'timer-off', 'timer-reset', 'stopwatch', 'hourglass', 'history',
  'calendar', 'calendar-days', 'calendar-check', 'calendar-plus', 'calendar-minus', 'calendar-x',
  'calendar-heart', 'calendar-clock', 'calendar-range', 'calendar-search',
  
  // Layout & UI
  'layout-dashboard', 'layout-grid', 'layout-list', 'layout-template', 'layout-panel-left', 'layout-panel-top',
  'kanban', 'kanban-square', 'trello', 'columns', 'rows', 'table', 'table-2',
  'grid-2x2', 'grid-3x3', 'align-left', 'align-center', 'align-right', 'align-justify',
  'list', 'list-checks', 'list-ordered', 'list-todo', 'list-tree', 'list-filter',
  'sidebar', 'panel-left', 'panel-right', 'panel-top', 'panel-bottom',
  'split', 'split-square-horizontal', 'split-square-vertical',
  'maximize-2', 'minimize-2', 'expand', 'shrink', 'fullscreen',
  
  // Actions & Status
  'search', 'zoom-in', 'zoom-out', 'filter', 'filter-x', 'sort-asc', 'sort-desc',
  'save', 'save-all', 'download', 'upload', 'import', 'share', 'share-2',
  'link', 'link-2', 'unlink', 'external-link', 'qr-code', 'scan-barcode',
  'copy', 'clipboard-copy', 'clipboard-paste', 'cut', 'edit', 'edit-2', 'edit-3',
  'info', 'circle-help', 'help-circle', 'alert-circle', 'alert-triangle', 'alert-octagon',
  'ban', 'slash', 'loader', 'loader-2', 'refresh-cw', 'rotate-ccw',
  'grip-horizontal', 'grip-vertical', 'more-horizontal', 'more-vertical', 'menu',
  
  // Commerce & Finance
  'dollar-sign', 'euro', 'pound-sterling', 'bitcoin', 'coins', 'piggy-bank', 'wallet', 'wallet-2',
  'credit-card', 'banknote', 'receipt', 'ticket', 'tags', 'tag', 'percent',
  'shopping-cart', 'shopping-bag', 'shopping-basket', 'store', 'storefront',
  'scale', 'scale-3d', 'weight', 'barcode', 'scan-line',
  
  // Travel & Transport
  'plane', 'plane-takeoff', 'plane-landing', 'rocket', 'satellite', 'satellite-dish',
  'car', 'car-front', 'bus', 'train', 'train-front', 'tram-front',
  'bike', 'ship', 'sailboat', 'anchor', 'fuel', 'parking-meter', 'traffic-cone',
  'luggage', 'briefcase', 'suitcase', 'suitcase-rolling',
  
  // Sports & Games
  'dumbbell', 'trophy', 'medal', 'target', 'crosshair', 'goal',
  'gamepad', 'gamepad-2', 'joystick', 'dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6',
  'puzzle', 'swords', 'sword', 'wand', 'wand-2', 'crown'
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
