/**
 * Writer Tools View - Panel de herramientas para escritura
 */

import { ItemView, setIcon } from 'obsidian';
import { FocusModeStatsModal } from '../modals/focusModeStatsModal.js';

export const WRITER_TOOLS_VIEW_TYPE = "folio-writer-tools";

export class WriterToolsView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.focusModeActive = false;
    this.timerSeconds = 25 * 60; // 25 minutes
    this.timerRunning = false;
    this.timerInterval = null;
    this.sessionStartWords = 0;
    this.focusStats = {
      sessions: 0,
      interruptions: 0,
      currentWords: 0,
      wordGoal: 500,
      totalTimeSpent: 0, // in seconds
      history: []
    };
    this.focusStatsModal = null;
    this.exportFormat = null;
  }

  getViewType() {
    return WRITER_TOOLS_VIEW_TYPE;
  }

  getDisplayText() {
    return "Writer Tools";
  }

  getIcon() {
    return "pencil-ruler";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-writer-tools");

    // Header (no icon)
    const header = container.createDiv({ cls: "writer-tools-header" });
    const headerTitle = header.createDiv({ cls: "writer-tools-title" });
    headerTitle.createSpan({ text: "Writer tools" });

    // Divider
    container.createDiv({ cls: "writer-tools-divider" });

    // Tools container
    this.toolsContainer = container.createDiv({ cls: "writer-tools-container" });

    // Render sections
    this.renderToolsSection();
    this.renderResourcesSection();
    this.renderAboutSection();
  }

  renderToolsSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "TOOLS" });

    const focusItem = section.createDiv({ cls: "writer-tools-item" });
    const focusIcon = focusItem.createSpan({ cls: "writer-tools-item-icon" });
    setIcon(focusIcon, "circle-dot");
    focusItem.createSpan({ cls: "writer-tools-item-text", text: "Focus mode" });
    focusItem.addEventListener("click", () => this.showFocusMode());

    const exportItem = section.createDiv({ cls: "writer-tools-item" });
    const exportIcon = exportItem.createSpan({ cls: "writer-tools-item-icon" });
    setIcon(exportIcon, "file-stack");
    exportItem.createSpan({ cls: "writer-tools-item-text", text: "Export assistant" });
    exportItem.addEventListener("click", () => this.showExportSettingsView());
  }

  getProjectTypeIcon(projectType) {
    const templates = this.plugin.settings?.projectTemplates || [];
    const template = templates.find(t => t.id === projectType);
    if (template?.icon) return template.icon;
    if (projectType === 'book') return 'book';
    if (projectType === 'script') return 'tv';
    if (projectType === 'film') return 'clapperboard';
    if (projectType === 'essay') return 'newspaper';
    return 'book';
  }

  showFocusMode() {
    this.focusModeActive = true;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-focus-mode");

    // Get current project
    const project = this.plugin.activeProject || this.plugin.activeBook;
    if (!project) {
      container.createDiv({ cls: "focus-mode-no-project", text: "No project selected. Please select a project first." });
      const backBtn = container.createEl("button", { cls: "focus-mode-btn-secondary", text: "Back" });
      backBtn.addEventListener("click", () => this.exitFocusMode());
      return;
    }

    // Load focus stats from project config
    this.loadFocusStats(project).then(() => {
      this.renderFocusModeUI(container, project);
    });
  }

  async showExportSettingsView() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-export-settings");

    const header = container.createDiv({ cls: "export-settings-header" });
    const headerIcon = header.createSpan({ cls: "export-settings-header-icon" });
    setIcon(headerIcon, "settings");
    header.createSpan({ cls: "export-settings-header-title", text: "Export project" });
    const backButton = header.createEl("button", { cls: "export-settings-back", text: "Back" });
    backButton.addEventListener("click", () => this.onOpen());

    const content = container.createDiv({ cls: "export-settings-content" });
    const project = this.plugin.activeProject || this.plugin.activeBook;
    const hasActiveProject = !!(project && project.path && (this.plugin.booksIndex || []).some((b) => b.path === project.path));
    if (!hasActiveProject) {
      const shell = content.createDiv({ cls: "export-assistant-shell" });
      shell.createDiv({ cls: "export-assistant-pill", text: "No active projects" });
      const panel = shell.createDiv({ cls: "export-assistant-panel" });
      panel.createDiv({ cls: "export-assistant-empty-title", text: "No active projects" });
      panel.createDiv({ cls: "export-assistant-empty-subtitle", text: "Select or create a project before exporting" });
      const actions = content.createDiv({ cls: "export-assistant-actions" });
      actions.createEl("button", { cls: "export-assistant-btn", text: "Cancel" }).addEventListener("click", () => this.onOpen());
      const primary = actions.createEl("button", { cls: "export-assistant-btn is-primary", text: "Export" });
      primary.setAttr("disabled", "true");
      return;
    }
    let meta = null;
    let cfg = null;
    try {
      if (project && this.plugin.configService?.loadProjectMeta) {
        meta = await this.plugin.configService.loadProjectMeta(project);
      }
      if (project && this.plugin.configService?.loadProjectConfig) {
        cfg = await this.plugin.configService.loadProjectConfig(project);
      }
    } catch {}

    const card = content.createDiv({ cls: "export-settings-book-card" });
    const iconWrap = card.createDiv({ cls: "export-settings-book-icon" });
    const iconEl = iconWrap.createSpan({ cls: "export-settings-book-icon-svg" });
    const type = meta?.projectType || cfg?.basic?.projectType || "book";
    setIcon(iconEl, this.getProjectTypeIcon(type));
    const bookInfo = card.createDiv({ cls: "export-settings-book-info" });
    const displayTitle = meta?.title || project?.name || "Untitled";
    bookInfo.createDiv({ cls: "export-settings-book-title", text: displayTitle });
    const author = Array.isArray(meta?.author) ? meta.author.join(", ") : (meta?.author || "");
    bookInfo.createDiv({ cls: "export-settings-book-meta", text: author ? `Author: ${author}` : "Author: —" });
    const totalWords = Number(cfg?.stats?.total_words || 0);
    bookInfo.createDiv({ cls: "export-settings-book-meta", text: `Word count: ${totalWords}` });

    const formatSection = content.createDiv({ cls: "export-settings-section" });
    const formatLabel = formatSection.createDiv({ cls: "export-settings-section-label" });
    formatLabel.createDiv({ cls: "export-settings-section-accent" });
    formatLabel.createDiv({ cls: "export-settings-section-title", text: "Choose export format" });
    const formatGrid = formatSection.createDiv({ cls: "export-settings-format-grid" });

    const formats = [
      { id: "pdf", title: "PDF", subtitle: "Portable document format", icon: "file-text" },
      { id: "docx", title: "DOCX", subtitle: "Word document format", icon: "file" }
    ];

    const statusRow = content.createDiv({ cls: "export-settings-status" });
    const statusIcon = statusRow.createSpan({ cls: "export-settings-status-icon" });
    setIcon(statusIcon, "settings");
    const statusText = statusRow.createSpan({ cls: "export-settings-status-text" });

    const actions = content.createDiv({ cls: "export-settings-actions" });
    const cancelBtn = actions.createEl("button", { cls: "export-settings-btn", text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.showExportAssistant());
    const exportBtn = actions.createEl("button", { cls: "export-settings-btn is-primary", text: "Export" });

    const refreshState = () => {
      const hasFormat = !!this.exportFormat;
      statusText.textContent = hasFormat ? `Selected format: ${this.exportFormat.toUpperCase()}` : "Please choose an export format first.";
      exportBtn.toggleClass("is-disabled", !hasFormat);
      if (!hasFormat) exportBtn.setAttr("disabled", "true");
      else exportBtn.removeAttr("disabled");
    };

    formats.forEach((format) => {
      const card = formatGrid.createDiv({ cls: "export-settings-format-card" });
      const icon = card.createSpan({ cls: "export-settings-format-icon" });
      setIcon(icon, format.icon);
      card.createDiv({ cls: "export-settings-format-title", text: format.title });
      card.createDiv({ cls: "export-settings-format-subtitle", text: format.subtitle });
      card.addEventListener("click", () => {
        this.exportFormat = format.id;
        formatGrid.querySelectorAll(".export-settings-format-card").forEach((node) => node.classList.remove("is-selected"));
        card.classList.add("is-selected");
        refreshState();
      });
      if (this.exportFormat === format.id) card.classList.add("is-selected");
    });

    refreshState();
  }

  async loadFocusStats(project) {
    try {
      const cfg = await this.plugin.configService.loadProjectConfig(project);
      if (cfg && cfg.focusMode) {
        this.focusStats = {
          sessions: cfg.focusMode.sessions || 0,
          interruptions: cfg.focusMode.interruptions || 0,
          currentWords: Number(cfg.focusMode.currentWords || 0),
          wordGoal: cfg.focusMode.wordGoal || 500,
          totalTimeSpent: cfg.focusMode.totalTimeSpent || 0,
          history: Array.isArray(cfg.focusMode.history) ? cfg.focusMode.history : []
        };
      }
    } catch (e) {
      console.warn("Failed to load focus stats", e);
    }
  }

  async saveFocusStats(project) {
    try {
      const cfg = await this.plugin.configService.loadProjectConfig(project) || {};
      cfg.focusMode = {
        sessions: this.focusStats.sessions,
        interruptions: this.focusStats.interruptions,
        currentWords: this.focusStats.currentWords || 0,
        wordGoal: this.focusStats.wordGoal,
        totalTimeSpent: this.focusStats.totalTimeSpent,
        history: this.focusStats.history,
        lastSession: new Date().toISOString()
      };
      await this.plugin.configService.saveProjectConfig(project, cfg);
      if (this.focusStatsModal) {
        this.focusStatsModal.setProject(project);
        this.focusStatsModal.refresh();
      }
    } catch (e) {
      console.warn("Failed to save focus stats", e);
    }
  }

  renderFocusModeUI(container, project) {
    this.focusModeProject = project;
    // Header
    const header = container.createDiv({ cls: "focus-mode-header" });
    const headerIcon = header.createSpan({ cls: "focus-mode-header-icon" });
    setIcon(headerIcon, "circle-dot");
    header.createSpan({ cls: "focus-mode-header-title", text: "Focus mode" });

    // Project name
    const projectLabel = container.createDiv({ cls: "focus-mode-project-name" });
    projectLabel.createSpan({ text: "Project: ", cls: "focus-mode-project-label" });
    projectLabel.createSpan({ text: project.name, cls: "focus-mode-project-value" });

    // Timer container
    const timerContainer = container.createDiv({ cls: "focus-mode-timer-container" });
    
    // Timer circle
    const timerCircle = timerContainer.createDiv({ cls: "focus-mode-timer-circle" });
    this.timerDisplay = timerCircle.createDiv({ cls: "focus-mode-timer-display" });
    this.updateTimerDisplay();

    // Status text
    this.statusText = container.createDiv({ cls: "focus-mode-status", text: "Ready to start" });

    // Buttons container
    const buttonsContainer = container.createDiv({ cls: "focus-mode-buttons" });
    
    // Start/Pause button
    this.startButton = buttonsContainer.createEl("button", { cls: "focus-mode-btn-primary", text: "Start focus" });
    this.startButton.addEventListener("click", () => this.toggleTimer());

    // Exit button
    const exitButton = buttonsContainer.createEl("button", { cls: "focus-mode-btn-secondary", text: "Exit" });
    exitButton.addEventListener("click", () => this.exitFocusMode());

    // Stats bar
    const statsBar = container.createDiv({ cls: "focus-mode-stats-bar" });
    this.renderFocusStats(statsBar);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    this.timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  toggleTimer() {
    if (this.timerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timerRunning = true;
    this.startButton.textContent = "Pause";
    this.statusText.textContent = "Focus in progress...";
    if (this.timerSeconds === 25 * 60) {
      this.sessionStartWords = this.getActiveEditorWordCount();
      this.focusStats.currentWords = 0;
      this.refreshFocusStats();
    }
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.updateTimerDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timerRunning = false;
    this.startButton.textContent = "Resume";
    this.statusText.textContent = "Paused";
    this.focusStats.interruptions++;
    this.focusStats.history.push({
      type: 'interrupted',
      timestamp: new Date().toISOString(),
      words: this.focusStats.currentWords || 0,
      target: this.focusStats.wordGoal || 0
    });
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // Save interruption
    const project = this.plugin.activeProject || this.plugin.activeBook;
    if (project) this.saveFocusStats(project);
    this.refreshFocusStats();
    this.sessionStartWords = 0;
    this.focusStats.currentWords = 0;
  }

  completeSession() {
    this.timerRunning = false;
    this.focusStats.sessions++;
    this.focusStats.totalTimeSpent += 25 * 60; // Add 25 minutes
    this.focusStats.history.push({
      type: 'completed',
      timestamp: new Date().toISOString(),
      words: this.focusStats.currentWords || 0,
      target: this.focusStats.wordGoal || 0
    });
    this.startButton.textContent = "Start focus";
    this.statusText.textContent = "Session complete!";
    this.timerSeconds = 25 * 60;
    this.updateTimerDisplay();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // Save completed session to project config
    const project = this.plugin.activeProject || this.plugin.activeBook;
    if (project) this.saveFocusStats(project);
    this.refreshFocusStats();
  }

  refreshFocusStats() {
    const statsBar = this.containerEl.querySelector(".focus-mode-stats-bar");
    if (statsBar) {
      statsBar.empty();
      this.renderFocusStats(statsBar);
    }
  }

  renderFocusStats(container) {
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      if (hrs > 0) return `${hrs}h ${mins}m`;
      return `${mins}m`;
    };
    
    const project = this.focusModeProject || this.plugin.activeProject || this.plugin.activeBook;
    const statsHeader = container.createDiv({ cls: "focus-mode-stats-header" });
    const statsButton = statsHeader.createEl("button", { cls: "focus-mode-stats-button", text: "Focus mode stats" });
    statsButton.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      if (!project) return;
      await this.saveFocusStats(project);
      if (!this.focusStatsModal) {
        this.focusStatsModal = new FocusModeStatsModal(this.plugin, project);
      }
      this.focusStatsModal.setProject(project);
      this.focusStatsModal.open();
    });

    // Create tooltip zone above stats
    const tooltipZone = container.createDiv({ cls: "focus-mode-tooltip-zone" });
    
    const stats = [
      { label: "Completed sessions", value: this.focusStats.sessions, tooltip: "Number of 25-minute focus sessions completed without exiting", priority: "secondary" },
      { label: "Interrupted sessions", value: this.focusStats.interruptions, tooltip: "Number of times you paused during an active focus session", priority: "secondary" },
      { label: "Words in session", value: this.focusStats.currentWords, tooltip: "Words written during the current focus session", priority: "primary" },
      { label: "Session word target", value: this.focusStats.wordGoal, tooltip: "Target number of words to write per session", priority: "primary" }
    ];
    
    const statsRow = container.createDiv({ cls: "focus-mode-stats-row" });
    
    stats.forEach(stat => {
      const statItem = statsRow.createDiv({ cls: `focus-mode-stat-item ${stat.priority === 'primary' ? 'is-primary' : 'is-secondary'}` });
      statItem.createDiv({ cls: "focus-mode-stat-label", text: stat.label });
      statItem.createDiv({ cls: "focus-mode-stat-value", text: stat.value.toString() });
      
      // Show tooltip in central zone on click
      statItem.addEventListener("click", (e) => {
        e.stopPropagation();
        tooltipZone.textContent = stat.tooltip;
        tooltipZone.classList.add("visible");
        
        // Hide after 3 seconds or on next click
        setTimeout(() => {
          tooltipZone.classList.remove("visible");
        }, 3000);
      });
    });
    
    // Click anywhere else to dismiss tooltip
    container.addEventListener("click", () => {
      tooltipZone.classList.remove("visible");
    });
  }

  getActiveEditorWordCount() {
    try {
      const leaf = this.plugin.app.workspace.getMostRecentLeaf();
      const editor = leaf?.view?.editor;
      if (!editor || typeof editor.getValue !== "function") return 0;
      return this.plugin.statsService.countWords(editor.getValue());
    } catch (e) {
      return 0;
    }
  }

  updateFocusSessionWordsFromEditor(text, file) {
    if (!this.focusModeActive) return;
    const project = this.focusModeProject || this.plugin.activeProject || this.plugin.activeBook;
    if (!project || !file?.path || !file.path.startsWith(project.path + "/")) return;
    const total = this.plugin.statsService.countWords(text);
    if (this.sessionStartWords === undefined || this.sessionStartWords === null) {
      this.sessionStartWords = total;
    }
    const current = Math.max(0, total - this.sessionStartWords);
    if (current !== this.focusStats.currentWords) {
      this.focusStats.currentWords = current;
      this.refreshFocusStats();
    }
  }

  exitFocusMode() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning = false;
    this.timerSeconds = 25 * 60;
    this.focusModeActive = false;
    const container = this.containerEl.children[1];
    container.removeClass("folio-focus-mode");
    this.onOpen();
  }

  renderResourcesSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "RESOURCES" });

    const resourcesGrid = section.createDiv({ cls: "writer-tools-resources-grid" });

    const resources = [
      { icon: "user", label: "Character", tooltip: "Character development resources" },
      { icon: "bookmark", label: "Narrative", tooltip: "Narrative techniques" },
      { icon: "layout-grid", label: "Structure", tooltip: "Story structure guides" },
      { icon: "lightbulb", label: "Tips", tooltip: "Writing tips" }
    ];

    resources.forEach(resource => {
      const resourceItem = resourcesGrid.createDiv({ cls: "writer-tools-resource-item" });
      resourceItem.setAttribute("aria-label", resource.tooltip);
      
      const iconWrapper = resourceItem.createDiv({ cls: "writer-tools-resource-icon" });
      setIcon(iconWrapper, resource.icon);
      
      resourceItem.createDiv({ cls: "writer-tools-resource-label", text: resource.label });

      resourceItem.addEventListener("click", () => {
        if (resource.label === "Character") {
          this.showCharacterResources();
          return;
        }
        if (resource.label === "Narrative") {
          this.showNarrativeResources();
          return;
        }
        if (resource.label === "Structure") {
          this.showStructureResources();
          return;
        }
        if (resource.label === "Tips") {
          this.showTipsResources();
          return;
        }
        // TODO: Implement resource functionality
        console.log(`${resource.label} clicked`);
      });
    });
  }

  showCharacterResources() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-character-resources");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) {
        setIcon(el, "circle-dot");
      }
    };

    const header = container.createDiv({ cls: "character-resources-header" });
    const headerIcon = header.createSpan({ cls: "character-resources-header-icon" });
    applyIcon(headerIcon, "user");
    header.createSpan({ cls: "character-resources-header-title", text: "Character resources" });

    const backButton = header.createEl("button", { cls: "character-resources-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitCharacterResources());

    const arcsSection = container.createDiv({ cls: "character-resources-section" });
    arcsSection.createDiv({ cls: "character-resources-section-title", text: "Character arcs" });
    const arcsGrid = arcsSection.createDiv({ cls: "character-resources-arc-grid" });
    const arcs = [
      { label: "Moral Ascent", icon: "trending-up" },
      { label: "Moral Descent", icon: "trending-down" },
      { label: "Flat Moral", icon: "minus" },
      { label: "Moral Transformation", icon: "trending-up-down" }
    ];
    arcs.forEach((arc) => {
      const item = arcsGrid.createDiv({ cls: "character-resources-arc-item" });
      const icon = item.createSpan({ cls: "character-resources-card-icon" });
      applyIcon(icon, arc.icon);
      item.createDiv({ cls: "character-resources-arc-label", text: arc.label });
      item.addEventListener("click", () => {
        this.showResourceDetail(arc.label, () => this.showCharacterResources());
      });
    });

    const archetypesSection = container.createDiv({ cls: "character-resources-section is-separated" });
    archetypesSection.createDiv({ cls: "character-resources-section-title", text: "Character archetypes" });

    const campbellSection = archetypesSection.createDiv({ cls: "character-resources-subsection" });
    campbellSection.createDiv({ cls: "character-resources-subtitle", text: "Campbell archetypes" });
    const campbellGrid = campbellSection.createDiv({ cls: "character-resources-grid" });
    const campbellArchetypes = [
      { label: "The Ally", icon: "handshake" },
      { label: "The Herald", icon: "bell" },
      { label: "The Hero (Jung)", icon: "sword" },
      { label: "The Mentor", icon: "graduation-cap" },
      { label: "The Shadow", icon: "moon" },
      { label: "The Shapeshifter", icon: "hat-glasses" },
      { label: "The Threshold Guardian", icon: "shield" },
      { label: "The Trickster", icon: "dice" }
    ];
    campbellArchetypes.forEach((itemData) => {
      const item = campbellGrid.createDiv({ cls: "character-resources-card" });
      const icon = item.createSpan({ cls: "character-resources-card-icon" });
      applyIcon(icon, itemData.icon);
      item.createDiv({ cls: "character-resources-card-label", text: itemData.label });
      item.addEventListener("click", () => {
        this.showResourceDetail(itemData.label, () => this.showCharacterResources());
      });
    });

    const jungSection = archetypesSection.createDiv({ cls: "character-resources-subsection" });
    jungSection.createDiv({ cls: "character-resources-subtitle", text: "Jung archetypes" });
    const jungGrid = jungSection.createDiv({ cls: "character-resources-grid" });
    const jungArchetypes = [
      { label: "The Caregiver", icon: "heart-handshake" },
      { label: "The Creator", icon: "paintbrush" },
      { label: "The Everyman", icon: "users" },
      { label: "The Explorer", icon: "compass" },
      { label: "The Hero", icon: "sword" },
      { label: "The Innocent", icon: "baby" },
      { label: "The Jester", icon: "party-popper" },
      { label: "The Lover", icon: "heart" },
      { label: "The Magician", icon: "wand-2" },
      { label: "The Outlaw", icon: "flame-kindling" },
      { label: "The Ruler", icon: "crown" },
      { label: "The Sage", icon: "book-open" }
    ];
    jungArchetypes.forEach((itemData) => {
      const item = jungGrid.createDiv({ cls: "character-resources-card" });
      const icon = item.createSpan({ cls: "character-resources-card-icon" });
      applyIcon(icon, itemData.icon);
      item.createDiv({ cls: "character-resources-card-label", text: itemData.label });
      item.addEventListener("click", () => {
        this.showResourceDetail(itemData.label, () => this.showCharacterResources());
      });
    });
  }

  exitCharacterResources() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-character-resources");
    this.onOpen();
  }

  showNarrativeResources() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-narrative-resources");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) {
        setIcon(el, "circle-dot");
      }
    };

    const header = container.createDiv({ cls: "narrative-resources-header" });
    const headerIcon = header.createSpan({ cls: "narrative-resources-header-icon" });
    applyIcon(headerIcon, "bookmark");
    header.createSpan({ cls: "narrative-resources-header-title", text: "Narrative resources" });

    const backButton = header.createEl("button", { cls: "narrative-resources-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitNarrativeResources());

    const intro = container.createDiv({ cls: "narrative-resources-intro" });
    intro.createSpan({ text: "Narrative techniques" });

    const groups = [
      {
        title: "Structural Time Manipulation",
        subtitle: "Techniques that reorganize chronology to control information flow.",
        items: [
          { label: "Flashback", icon: "rewind" },
          { label: "Flashforward", icon: "fast-forward" },
          { label: "Foreshadowing", icon: "scan-eye" }
        ],
        note: "These operate on the temporal axis of the narrative. They don’t change events — they change when the audience receives them."
      },
      {
        title: "Setup / Payoff Mechanics",
        subtitle: "Techniques about planting and resolving narrative information. They’re all about audience prediction vs outcome.",
        items: [
          { label: "Chekhov’s Gun", icon: "bomb" },
          { label: "Red Herring", icon: "fish" },
          { label: "Plot Twist", icon: "rotate-3d" }
        ],
        note: ""
      },
      {
        title: "Resolution Devices",
        subtitle: "Techniques that control how conflict is concluded. Think of these as ending logic frameworks.",
        items: [
          { label: "Deus Ex Machina", icon: "wand-2" },
          { label: "Eucatastrophe", icon: "mountain" },
          { label: "Poetic Justice", icon: "scale" }
        ],
        note: ""
      },
      {
        title: "Style & Delivery Techniques",
        subtitle: "These shape how information is expressed rather than plot structure. These affect reader experience, not plot mechanics.",
        items: [
          { label: "“Show, Don’t Tell”", icon: "eye" },
          { label: "Quibble (Wordplay)", icon: "quote" }
        ],
        note: ""
      }
    ];

    groups.forEach((group) => {
      const card = container.createDiv({ cls: "narrative-resources-card" });
      card.createDiv({ cls: "narrative-resources-card-title", text: group.title });
      card.createDiv({ cls: "narrative-resources-card-subtitle", text: group.subtitle });

      const grid = card.createDiv({ cls: "narrative-resources-grid" });
      group.items.forEach((label) => {
        const item = grid.createDiv({ cls: "narrative-resources-item" });
        const icon = item.createSpan({ cls: "narrative-resources-item-icon" });
        applyIcon(icon, label.icon);
        item.createSpan({ cls: "narrative-resources-item-text", text: label.label });
        item.addEventListener("click", () => {
          this.showResourceDetail(label.label, () => this.showNarrativeResources());
        });
      });

      if (group.note) {
        const note = card.createDiv({ cls: "narrative-resources-note" });
        group.note.split("\n").forEach((line, index) => {
          if (index > 0) note.createEl("br");
          note.createSpan({ text: line });
        });
      }
    });
  }

  exitNarrativeResources() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-narrative-resources");
    this.onOpen();
  }

  showStructureResources() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-structure-resources");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) {
        setIcon(el, "circle-dot");
      }
    };

    const header = container.createDiv({ cls: "structure-resources-header" });
    const headerIcon = header.createSpan({ cls: "structure-resources-header-icon" });
    applyIcon(headerIcon, "layout-grid");
    header.createSpan({ cls: "structure-resources-header-title", text: "Structure resources" });

    const backButton = header.createEl("button", { cls: "structure-resources-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitStructureResources());

    const intro = container.createDiv({ cls: "structure-resources-intro" });
    intro.createSpan({ text: "Story architecture" });

    const groups = [
      {
        title: "Archetypal Character Journeys",
        subtitle: "Frameworks that model internal transformation and mythic character evolution rather than strict plot beats.",
        items: [
          { label: "The Hero’s Journey", icon: "map" },
          { label: "Dan Harmon Story Circle", icon: "orbit" }
        ]
      },
      {
        title: "Dramatic Tension Architectures",
        subtitle: "Models that describe how narrative pressure rises and falls across the story.",
        items: [
          { label: "Freytag’s Pyramid", icon: "triangle" },
          { label: "Fichtean Curve", icon: "line-chart" },
          { label: "Three Act Structure", icon: "columns-3" },
          { label: "Kishōtenketsu", icon: "route" }
        ]
      },
      {
        title: "Commercial Beat Frameworks",
        subtitle: "Prescriptive systems designed for audience engagement, genre expectations, and market-friendly pacing.",
        items: [
          { label: "Save the Cat", icon: "cat" },
          { label: "Seven Point Structure", icon: "wheat" },
          { label: "Pulp Formula", icon: "book" },
          { label: "McKee Story paradigm", icon: "book-open" },
          { label: "Into the Woods structure", icon: "trees" }
        ]
      },
      {
        title: "Narrative Geometry / Experimental Structures",
        subtitle: "Architectural choices that shape how perspective, time, or reality are presented.",
        items: [
          { label: "Frame Narrative", icon: "scan" },
          { label: "Nonlinear Structure", icon: "line-squiggle" },
          { label: "Rashomon Structure", icon: "shrink" },
          { label: "In Medias Res", icon: "git-commit-horizontal" }
        ]
      }
    ];

    groups.forEach((group) => {
      const card = container.createDiv({ cls: "structure-resources-card" });
      card.createDiv({ cls: "structure-resources-card-title", text: group.title });
      card.createDiv({ cls: "structure-resources-card-subtitle", text: group.subtitle });

      const grid = card.createDiv({ cls: "structure-resources-grid" });
      group.items.forEach((itemData) => {
        const item = grid.createDiv({ cls: "structure-resources-item" });
        const icon = item.createSpan({ cls: "structure-resources-item-icon" });
        applyIcon(icon, itemData.icon);
        item.createSpan({ cls: "structure-resources-item-text", text: itemData.label });
        item.addEventListener("click", () => {
          this.showResourceDetail(itemData.label, () => this.showStructureResources());
        });
      });
    });
  }

  exitStructureResources() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-structure-resources");
    this.onOpen();
  }

  showTipsResources() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-tips-resources");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) {
        setIcon(el, "circle-dot");
      }
    };

    const header = container.createDiv({ cls: "tips-resources-header" });
    const headerIcon = header.createSpan({ cls: "tips-resources-header-icon" });
    applyIcon(headerIcon, "lightbulb");
    header.createSpan({ cls: "tips-resources-header-title", text: "Writing tips" });

    const backButton = header.createEl("button", { cls: "tips-resources-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitTipsResources());

    const intro = container.createDiv({ cls: "tips-resources-intro" });
    intro.createSpan({ text: "Writing tips" });

    const description = container.createDiv({ cls: "tips-resources-description" });
    description.createSpan({
      text: "Practical craft guidance focused on sentence-level execution, clarity of communication, and reader impact. Unlike structural frameworks, this category deals with how language operates moment to moment — voice, rhythm, precision, and rhetorical control. These tips refine technique inside paragraphs rather than shaping the macro architecture of a story."
    });

    const gridCard = container.createDiv({ cls: "tips-resources-card" });
    const grid = gridCard.createDiv({ cls: "tips-resources-grid" });

    const tips = [
      { label: "Argumentation (tips)", icon: "scale" },
      { label: "Description (tips)", icon: "image" },
      { label: "Dialogue (tips)", icon: "message-circle" },
      { label: "Exposition (tips)", icon: "file-text" },
      { label: "Narration (tips)", icon: "book-open" },
      { label: "Persuasion (tips)", icon: "megaphone" }
    ];

    tips.forEach((tip) => {
      const item = grid.createDiv({ cls: "tips-resources-item" });
      const icon = item.createSpan({ cls: "tips-resources-item-icon" });
      applyIcon(icon, tip.icon);
      item.createSpan({ cls: "tips-resources-item-text", text: tip.label });
      item.addEventListener("click", () => {
        this.showResourceDetail(tip.label, () => this.showTipsResources());
      });
    });

    container.createDiv({ cls: "tips-resources-divider" });
    container.createDiv({ cls: "tips-resources-subtitle", text: "Common pitfalls" });

    const pitfallsCard = container.createDiv({ cls: "tips-resources-card" });
    const pitfallsGrid = pitfallsCard.createDiv({ cls: "tips-resources-grid" });
    const pitfalls = [
      { label: "Character Pitfalls", icon: "user" },
      { label: "Character Arc Pitfalls", icon: "route" },
      { label: "Narrative Technique Pitfalls", icon: "book-open" },
      { label: "Structure Pitfalls", icon: "layout-grid" },
      { label: "Writing-Level Pitfalls", icon: "pen-line" }
    ];

    pitfalls.forEach((pitfall) => {
      const item = pitfallsGrid.createDiv({ cls: "tips-resources-item" });
      const icon = item.createSpan({ cls: "tips-resources-item-icon" });
      applyIcon(icon, pitfall.icon);
      item.createSpan({ cls: "tips-resources-item-text", text: pitfall.label });
      item.addEventListener("click", () => {
        this.showResourceDetail(pitfall.label, () => this.showTipsResources());
      });
    });
  }

  exitTipsResources() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-tips-resources");
    this.onOpen();
  }

  showResourceDetail(title, onBack) {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-detail");

    const header = container.createDiv({ cls: "resource-detail-header" });
    const headingText = this.getResourceHeading(title);
    const headingIcon = header.createSpan({ cls: "resource-detail-heading-icon" });
    setIcon(headingIcon, this.getResourceIcon(title));
    header.createSpan({ cls: "resource-detail-heading", text: headingText });
    const backButton = header.createEl("button", { cls: "resource-detail-back", text: "Back" });
    backButton.addEventListener("click", () => {
      container.removeClass("folio-resource-detail");
      onBack();
    });

    if (title === "The Hero") {
      this.renderHeroDetail(container);
      return;
    }
    if (title === "The Caregiver") {
      this.renderCaregiverDetail(container);
      return;
    }
    if (title === "The Creator") {
      this.renderCreatorDetail(container);
      return;
    }
    if (title === "The Everyman") {
      this.renderEverymanDetail(container);
      return;
    }
    if (title === "The Explorer") {
      this.renderExplorerDetail(container);
      return;
    }
    if (title === "The Hero (Jung)") {
      this.renderHeroJungDetail(container);
      return;
    }
    if (title === "The Innocent") {
      this.renderInnocentDetail(container);
      return;
    }
    if (title === "The Jester") {
      this.renderJesterDetail(container);
      return;
    }
    if (title === "The Lover") {
      this.renderLoverDetail(container);
      return;
    }
    if (title === "The Magician") {
      this.renderMagicianDetail(container);
      return;
    }
    if (title === "The Outlaw") {
      this.renderOutlawDetail(container);
      return;
    }
    if (title === "The Ruler") {
      this.renderRulerDetail(container);
      return;
    }
    if (title === "The Sage") {
      this.renderSageDetail(container);
      return;
    }
    if (title === "Moral Ascent") {
      this.renderMoralAscentDetail(container);
      return;
    }
    if (title === "Moral Descent") {
      this.renderMoralDescentDetail(container);
      return;
    }
    if (title === "Flat Moral") {
      this.renderFlatMoralDetail(container);
      return;
    }
    if (title === "Moral Transformation") {
      this.renderMoralTransformationDetail(container);
      return;
    }
    if (title === "Character Pitfalls") {
      this.renderPitfallsDetail(container, "Character Pitfalls", [
        "Flat characters",
        "Inconsistent motivation",
        "Unearned redemption",
        "Passive protagonists",
        "Villain without agency",
        "Archetype clichés"
      ]);
      return;
    }
    if (title === "Character Arc Pitfalls") {
      this.renderPitfallsDetail(container, "Character Arc Pitfalls", [
        "No real change",
        "Change without cause",
        "Moral whiplash",
        "Transformation too late",
        "Arc contradicts theme"
      ]);
      return;
    }
    if (title === "Narrative Technique Pitfalls") {
      this.renderPitfallsDetail(container, "Narrative Technique Pitfalls", [
        "Foreshadowing too obvious",
        "Plot twists without setup",
        "Red herrings that waste time",
        "Deus ex machina abuse",
        "Flashbacks killing momentum"
      ]);
      return;
    }
    if (title === "Structure Pitfalls") {
      this.renderPitfallsDetail(container, "Structure Pitfalls", [
        "Act breaks without tension",
        "Sagging middle",
        "Climax too early / too late",
        "Resolution without consequence",
        "Structure fighting the story"
      ]);
      return;
    }
    if (title === "Writing-Level Pitfalls") {
      this.renderPitfallsDetail(container, "Writing-Level Pitfalls", [
        "Over-exposition",
        "On-the-nose dialogue",
        "Telling instead of showing",
        "Purple prose",
        "Inconsistent tone"
      ]);
      return;
    }
    if (title === "Argumentation (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is argumentative writing?",
        intro: [
          "Argumentative writing focuses on presenting, supporting, and defending a position with the goal of persuading the reader through reasoned discourse.",
          "It is essential for essays, opinion pieces, critical analysis, and persuasive nonfiction."
        ],
        techniques: [
          "Logical reasoning — Use deductive, inductive, or analogical reasoning to support claims and conclusions.",
          "Evidence and examples — Support arguments with facts, data, statistics, real-world examples, or credible sources.",
          "Counterarguments and refutation — Anticipate opposing views and address them directly to strengthen overall credibility.",
          "Emotional appeal — Engage the reader’s emotions, values, or beliefs to reinforce logical points.",
          "Rhetorical strategies — Apply ethos (credibility), pathos (emotion), and logos (logic) strategically.",
          "Clear structure and organization — Present arguments in a coherent order with clear topic sentences and conclusions.",
          "Clarity and concision — Avoid unnecessary complexity; express ideas precisely and directly.",
          "Ethical responsibility — Ground arguments in honesty and respect for the audience’s values and intelligence."
        ]
      });
      return;
    }
    if (title === "Description (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is descriptive writing?",
        intro: [
          "Descriptive writing creates vivid mental images by engaging the reader’s senses, emotions, and imagination. Its purpose is immersion rather than explanation."
        ],
        techniques: [
          "Sensory imagery — Appeal to sight, sound, touch, taste, and smell to create a multidimensional experience.",
          "Figurative language — Use metaphor, simile, personification, and imagery to enrich atmosphere and tone.",
          "Specificity and detail — Favor precise, concrete details over generic or abstract descriptions.",
          "Show, don’t tell — Convey meaning through action, sensory detail, and implication rather than direct explanation.",
          "Point of view awareness — Filter description through the narrator’s perspective, biases, and limitations.",
          "Emotional resonance — Connect description to characters’ internal reactions and emotional states.",
          "Narrative pacing — Balance descriptive passages with action and dialogue to maintain momentum.",
          "Symbolism and motifs — Use recurring imagery to reinforce theme and meaning."
        ]
      });
      return;
    }
    if (title === "Dialogue (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is effective dialogue?",
        intro: [
          "Effective dialogue creates believable conversations that reveal character, advance plot, and convey subtext without sounding artificial or expository."
        ],
        techniques: [
          "Distinct character voice — Give each character unique speech patterns, vocabulary, and tone.",
          "Subtext — Allow meaning to exist beneath the spoken words through implication and tension.",
          "Natural flow — Imitate real conversational rhythm without reproducing real speech verbatim.",
          "Rhythm and cadence — Vary sentence length and pacing to reflect emotional intensity.",
          "Conflict and tension — Use disagreement, power imbalance, or competing goals to energize exchanges.",
          "Show, don’t tell — Reveal emotion and motivation through what is said — and what is avoided.",
          "Subtle exposition — Embed necessary information naturally within conversation.",
          "Authenticity and realism — Reflect cultural, social, and contextual speech patterns appropriately."
        ]
      });
      return;
    }
    if (title === "Exposition (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is exposition?",
        intro: [
          "Exposition provides essential background information, context, or history needed for the audience to understand the story world without disrupting narrative flow."
        ],
        techniques: [
          "Narrative summary — Compress complex information into concise overviews.",
          "Flashbacks — Reveal past events that directly inform present actions or motivations.",
          "Dialogue-based exposition — Deliver information through natural conversation rather than narration.",
          "Descriptive context — Use sensory detail to establish setting, culture, or historical background.",
          "Prologues or introductory sections — Present foundational information before the main narrative begins.",
          "Gradual information release — Distribute exposition strategically to avoid overload.",
          "Integrated backstory — Weave background details into character thoughts or actions.",
          "Worldbuilding — Establish social, political, cultural, or historical frameworks that support the story."
        ]
      });
      return;
    }
    if (title === "Narration (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is narration?",
        intro: [
          "Narration refers to how a story is told: the voice, perspective, structure, and style that shape how the reader experiences events."
        ],
        techniques: [
          "Point of view — Choose first person, second person, or third person (limited or omniscient) deliberately.",
          "Narrative structure — Organize events using linear, nonlinear, framed, or experimental sequencing.",
          "Tone and atmosphere — Establish emotional mood through diction, imagery, and rhythm.",
          "Characterization — Reveal character through actions, internal thought, and reaction.",
          "Foreshadowing and suspense — Plant hints and manage anticipation to sustain engagement.",
          "Symbolism and imagery — Use recurring symbols to convey deeper meaning.",
          "Voice and style — Develop a distinctive narrative presence consistent with theme and perspective.",
          "Narrative pacing — Control speed and tension through sentence structure, scene length, and transitions."
        ]
      });
      return;
    }
    if (title === "Persuasion (tips)") {
      this.renderTipsDetail(container, {
        introTitle: "What is persuasive writing?",
        intro: [
          "Persuasive writing aims to influence beliefs, attitudes, or actions by combining logic, emotion, credibility, and narrative clarity."
        ],
        techniques: [
          "Emotional appeal — Engage feelings such as empathy, fear, hope, or desire.",
          "Storytelling — Use anecdotes or narratives to humanize abstract ideas.",
          "Social proof — Reference collective agreement, trends, or testimonials.",
          "Authority — Establish credibility through expertise or reputable sources.",
          "Repetition — Reinforce key ideas to increase memorability.",
          "Persuasive language — Choose words that convey urgency, clarity, and emotional weight.",
          "Call to action — Direct the reader toward a specific response or behavior.",
          "Addressing counterarguments — Acknowledge and refute opposing views to strengthen trust."
        ]
      });
      return;
    }
    if (title === "Flashback") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is a Flashback?",
        intro: [
          "A flashback interrupts the present narrative to show events from the past. It provides context, emotional depth, or critical information that reshapes how the audience understands current events."
        ],
        core: [
          "Temporal shift to the past",
          "Reveals backstory",
          "Adds emotional or thematic weight",
          "Recontextualizes present actions"
        ],
        coreNote: "Flashbacks change understanding, not events.",
        narrativeFunction: [
          "Reveal motivation",
          "Explain relationships",
          "Deepen character psychology",
          "Withhold and release information strategically"
        ],
        risksTitle: "Common risks",
        risks: [
          "Interrupting narrative momentum",
          "Overexplaining",
          "Redundancy with present action"
        ],
        examplesTitle: "Flashback Examples",
        examples: [
          "Lost",
          "The Godfather Part II",
          "Citizen Kane",
          "Arrow",
          "Eternal Sunshine of the Spotless Mind"
        ]
      });
      return;
    }
    if (title === "Flashforward") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is a Flashforward?",
        intro: [
          "A flashforward reveals events that will occur later in the story. It creates anticipation, tension, or dramatic irony by showing consequences before causes."
        ],
        core: [
          "Temporal jump to the future",
          "Creates suspense",
          "Reframes current decisions",
          "Often partial or ambiguous"
        ],
        narrativeFunction: [
          "Build anticipation",
          "Signal inevitability",
          "Create dramatic irony",
          "Frame the narrative outcome"
        ],
        risksTitle: "Common risks",
        risks: [
          "Spoiling tension",
          "Removing mystery",
          "Confusing chronology"
        ],
        examplesTitle: "Flashforward Examples",
        examples: [
          "Breaking Bad (cold opens)",
          "How to Get Away with Murder",
          "Arrival",
          "Six Feet Under",
          "The Book Thief"
        ]
      });
      return;
    }
    if (title === "Foreshadowing") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is Foreshadowing?",
        intro: [
          "Foreshadowing plants subtle hints about future events. These clues may be symbolic, visual, verbal, or thematic.",
          "The goal is preparation, not prediction."
        ],
        core: [
          "Early setup",
          "Subtlety",
          "Payoff later in the story",
          "Often unnoticed on first read"
        ],
        narrativeFunction: [
          "Create cohesion",
          "Make twists feel earned",
          "Build subconscious anticipation",
          "Reinforce themes"
        ],
        risksTitle: "Common risks",
        risks: [
          "Being too obvious",
          "Making outcomes predictable",
          "Heavy-handed symbolism"
        ],
        examplesTitle: "Foreshadowing Examples",
        examples: [
          "Romeo and Juliet",
          "Jaws (early warnings)",
          "Breaking Bad (visual cues)",
          "Of Mice and Men",
          "The Sixth Sense"
        ]
      });
      return;
    }
    if (title === "Chekhov’s Gun") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is Chekhov’s Gun?",
        intro: [
          "Chekhov’s Gun states that every significant element introduced in a story should have a purpose. If a detail is highlighted, it must eventually matter."
        ],
        core: [
          "Meaningful setup",
          "Inevitable payoff",
          "Narrative economy",
          "Focused attention"
        ],
        narrativeFunction: [
          "Eliminate filler",
          "Create satisfying resolutions",
          "Train audience attention",
          "Strengthen narrative cohesion"
        ],
        risksTitle: "Common risks",
        risks: [
          "Over-signaling importance",
          "Forced payoff",
          "Red herrings mistaken for setup"
        ],
        examplesTitle: "Chekhov’s Gun Examples",
        examples: [
          "The rifle in Chekhov’s plays",
          "The ring in Lord of the Rings",
          "The knife in Psycho",
          "The coin in No Country for Old Men"
        ]
      });
      return;
    }
    if (title === "Red Herring") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is a Red Herring?",
        intro: [
          "A red herring is a deliberate misdirection that leads the audience to form false assumptions. It distracts from the true narrative outcome."
        ],
        core: [
          "False emphasis",
          "Misdirection",
          "Plausibility",
          "Temporary relevance"
        ],
        narrativeFunction: [
          "Create mystery",
          "Increase suspense",
          "Hide twists",
          "Manipulate expectations"
        ],
        risksTitle: "Common risks",
        risks: [
          "Feeling unfair",
          "Wasting narrative time",
          "Breaking trust with the audience"
        ],
        examplesTitle: "Red Herring Examples",
        examples: [
          "Murder mystery suspects",
          "Knives Out",
          "Sherlock Holmes stories",
          "Gone Girl",
          "The Girl with the Dragon Tattoo"
        ]
      });
      return;
    }
    if (title === "Plot Twist") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is a Plot Twist?",
        intro: [
          "A plot twist is an unexpected development that recontextualizes the story. It surprises the audience while remaining logically consistent."
        ],
        core: [
          "Surprise",
          "Retrospective logic",
          "Setup and payoff",
          "Shift in perspective"
        ],
        narrativeFunction: [
          "Reframe the story",
          "Shock the audience",
          "Elevate stakes",
          "Reveal hidden truth"
        ],
        risksTitle: "Common risks",
        risks: [
          "Twist for shock only",
          "Lack of setup",
          "Undermining character logic"
        ],
        examplesTitle: "Plot Twist Examples",
        examples: [
          "The Sixth Sense",
          "Fight Club",
          "The Others",
          "Oldboy",
          "Shutter Island"
        ]
      });
      return;
    }
    if (title === "Deus Ex Machina") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is Deus Ex Machina?",
        intro: [
          "Deus ex Machina resolves conflict through an external, unexpected intervention that is not properly set up within the story."
        ],
        core: [
          "Sudden resolution",
          "External force",
          "Minimal foreshadowing",
          "Breaks causality"
        ],
        narrativeFunction: [
          "Resolve unsolvable conflicts",
          "Deliver moral or divine judgment"
        ],
        narrativeNote: "In modern storytelling, it is often discouraged.",
        risksTitle: "Common risks",
        risks: [
          "Undermining stakes",
          "Invalidating character effort",
          "Breaking narrative credibility"
        ],
        examplesTitle: "Deus Ex Machina Examples",
        examples: [
          "Ancient Greek theater",
          "War of the Worlds (original ending)",
          "Certain superhero rescues",
          "Mythological interventions"
        ]
      });
      return;
    }
    if (title === "Eucatastrophe") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is Eucatastrophe?",
        intro: [
          "Eucatastrophe is a sudden positive reversal at the story’s darkest moment. Unlike Deus ex Machina, it feels meaningful and earned.",
          "The term was coined by J.R.R. Tolkien."
        ],
        core: [
          "Sudden hope",
          "Emotional release",
          "Moral or thematic payoff",
          "Earned resolution"
        ],
        narrativeFunction: [
          "Affirm hope",
          "Deliver catharsis",
          "Reinforce moral order",
          "Reward endurance"
        ],
        risksTitle: "Common risks",
        risks: [
          "Confusing it with Deus ex Machina",
          "Insufficient setup",
          "Over-sentimentality"
        ],
        examplesTitle: "Eucatastrophe Examples",
        examples: [
          "The Lord of the Rings",
          "The Lion, the Witch and the Wardrobe",
          "It’s a Wonderful Life",
          "Harry Potter finales"
        ]
      });
      return;
    }
    if (title === "Poetic Justice") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is Poetic Justice?",
        intro: [
          "Poetic Justice ensures that characters receive outcomes that fittingly reflect their actions, values, or flaws."
        ],
        core: [
          "Moral symmetry",
          "Cause-and-effect resolution",
          "Thematic reinforcement",
          "Emotional satisfaction"
        ],
        narrativeFunction: [
          "Reinforce theme",
          "Deliver moral closure",
          "Satisfy audience expectations",
          "Balance narrative consequences"
        ],
        risksTitle: "Common risks",
        risks: [
          "Predictability",
          "Moral simplification",
          "Heavy-handed messaging"
        ],
        examplesTitle: "Poetic Justice Examples",
        examples: [
          "Villains undone by their own schemes",
          "Fables and fairy tales",
          "Crime fiction endings",
          "Shakespearean punishment arcs"
        ]
      });
      return;
    }
    if (title === "“Show, Don’t Tell”") {
      this.renderTechniqueDetail(container, {
        introTitle: "What does “Show, Don’t Tell” mean?",
        intro: [
          "This principle encourages conveying information through action, dialogue, and sensory detail rather than direct explanation."
        ],
        core: [
          "Implicit storytelling",
          "Sensory detail",
          "Active scenes",
          "Reader inference"
        ],
        narrativeFunction: [
          "Increase immersion",
          "Engage the reader",
          "Strengthen emotional impact",
          "Avoid exposition overload"
        ],
        risksTitle: "Common risks",
        risks: [
          "Obscuring clarity",
          "Over-description",
          "Avoiding necessary exposition"
        ],
        examplesTitle: "Show, Don’t Tell Examples",
        examples: [
          "Character emotion shown through action",
          "Visual storytelling in film",
          "Minimalist prose styles",
          "Hemingway’s writing"
        ]
      });
      return;
    }
    if (title === "Quibble (Wordplay)") {
      this.renderTechniqueDetail(container, {
        introTitle: "What is a Quibble?",
        intro: [
          "A quibble is playful or clever use of language, often relying on ambiguity, double meanings, or rhetorical tricks."
        ],
        core: [
          "Linguistic play",
          "Humor or irony",
          "Verbal agility",
          "Ambiguity"
        ],
        narrativeFunction: [
          "Add wit",
          "Reveal character intelligence",
          "Create tonal contrast",
          "Engage the audience linguistically"
        ],
        risksTitle: "Common risks",
        risks: [
          "Overuse",
          "Breaking tone",
          "Confusing meaning"
        ],
        examplesTitle: "Quibble Examples",
        examples: [
          "Shakespearean wordplay",
          "Oscar Wilde",
          "Legal or political dialogue",
          "Screwball comedies"
        ]
      });
      return;
    }
    if (title === "The Hero’s Journey") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Hero’s Journey?",
        intro: [
          "The Hero’s Journey is a mythic structure that frames story as transformation: a character leaves the familiar, faces trials, dies symbolically, and returns changed. It’s less a rigid formula than a map for meaning and growth."
        ],
        core: [
          "A movement from comfort to challenge to return",
          "External trials that force internal change",
          "Symbolic death and rebirth",
          "A concluding “gift” brought back to the world"
        ],
        stepsTitle: "Steps (classic model)",
        stepGroups: [
          {
            title: "ACT I",
            items: [
              {
                title: "Ordinary World",
                body: "Establish the Hero’s baseline life, limitations, and unmet need.",
                icon: "earth"
              },
              {
                title: "Call to Adventure",
                body: "A disruption offers a mission, opportunity, or threat that demands response.",
                icon: "phone-incoming"
              },
              {
                title: "Refusal of the Call",
                body: "Fear, duty, or doubt causes hesitation; the Hero resists change.",
                icon: "phone-off"
              },
              {
                title: "Meeting the Mentor",
                body: "Guidance appears: training, tools, wisdom, or encouragement.",
                icon: "graduation-cap"
              },
              {
                title: "Crossing the First Threshold",
                body: "The Hero commits and enters the “special world,” leaving the old life behind.",
                icon: "brick-wall"
              }
            ]
          },
          {
            title: "ACT II",
            items: [
              {
                title: "Tests, Allies, Enemies",
                body: "The rules of the new world are learned; relationships and rivalries form.",
                icon: "line-squiggle"
              },
              {
                title: "Approach to the Inmost Cave",
                body: "Preparation for the central crisis; tensions tighten and stakes clarify.",
                icon: "mountain"
              },
              {
                title: "Ordeal",
                body: "A major confrontation with death, failure, or the deepest fear.",
                icon: "swords"
              },
              {
                title: "Reward (Seizing the Sword)",
                body: "The Hero gains something: knowledge, power, object, love, or self-belief.",
                icon: "trophy"
              }
            ]
          },
          {
            title: "ACT III",
            items: [
              {
                title: "The Road Back",
                body: "Consequences arrive; the Hero must return with the reward under pressure.",
                icon: "arrow-big-left"
              },
              {
                title: "Resurrection",
                body: "A final test proves transformation. The Hero confronts the core flaw one last time.",
                icon: "user-round-plus"
              },
              {
                title: "Return with the Elixir",
                body: "The Hero returns changed, bringing value to others: healing, truth, freedom, hope.",
                icon: "gem"
              }
            ]
          }
        ],
        whyTitle: "Why this works",
        why: "These steps externalize inner change: the world forces the Hero to become someone new.",
        examplesTitle: "Hero’s Journey Examples",
        examples: [
          "Star Wars",
          "The Matrix",
          "The Lord of the Rings",
          "Moana",
          "Harry Potter"
        ]
      });
      return;
    }
    if (title === "Dan Harmon Story Circle") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Story Circle?",
        intro: [
          "The Story Circle compresses transformation into a repeatable loop: a character wants something, leaves comfort, pays a price, and returns changed. It’s designed to be practical for episodes as well as features."
        ],
        core: [
          "Motivation-driven steps",
          "Clear cause-and-effect",
          "Repeatable structure (especially for TV)",
          "Emphasis on change and cost"
        ],
        stepsTitle: "Steps (8-step circle)",
        steps: [
          { title: "YOU (COMFORT)", body: "Establish the character’s normal world and identity.", icon: "fish" },
          { title: "NEED (DESIRE)", body: "The character wants or needs something that disrupts balance.", icon: "candy" },
          { title: "GO (ENTER UNFAMILIAR)", body: "The character leaves comfort and enters a new situation.", icon: "log-in" },
          { title: "SEARCH (ADAPT)", body: "The character explores the new world and tries strategies that may fail.", icon: "map" },
          { title: "FIND (GET WHAT THEY WANTED)", body: "The character achieves the goal—or seems to.", icon: "search-check" },
          { title: "TAKE (PAY A PRICE)", body: "There is a cost: sacrifice, loss, compromise, or consequence.", icon: "hand-coins" },
          { title: "RETURN (BACK TO FAMILIAR)", body: "The character returns to a version of their old world.", icon: "arrow-big-left" },
          { title: "CHANGE (TRANSFORMED)", body: "The character is different: wiser, broken, empowered, humbled, etc.", icon: "user-pen" }
        ],
        examplesTitle: "Story Circle Examples",
        examples: [
          "Episodic TV arcs",
          "Community",
          "Rick and Morty",
          "Character-centered short stories"
        ]
      });
      return;
    }
    if (title === "Three Act Structure") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Three Act Structure?",
        intro: [
          "A story divided into Setup, Confrontation, and Resolution. It’s the most common modern narrative skeleton because it aligns with audience attention and escalating stakes."
        ],
        stepsTitle: "Steps (typical beats)",
        numberedSteps: true,
        steps: [
          "ACT I — Setup",
          "1. Opening / Status Quo — Introduce the protagonist, their world, and the core problem-space.",
          "2. Inciting Incident — A disruption creates a new problem or opportunity.",
          "3. Debate / Refusal — The protagonist hesitates, resists, or explores alternatives.",
          "4. Act I Break (Commitment) — The protagonist commits and can’t go back.",
          "ACT II — Confrontation",
          "5. Rising Complications — Obstacles escalate; stakes increase; plans fail.",
          "6. Midpoint Shift — A major reveal or reversal changes the story’s direction and intensity.",
          "7. Bad Guys Close In / Pressure Peaks — Consequences compound; resources thin; relationships strain.",
          "8. All Is Lost — The lowest point; apparent defeat or devastating cost.",
          "9. Dark Night of the Soul — Reflection and decision: who will the protagonist become?",
          "ACT III — Resolution",
          "10. Act III Break (New plan) — The protagonist acts with new clarity, courage, or strategy.",
          "11. Climax — The decisive confrontation that resolves the central conflict.",
          "12. Denouement — Aftermath: new equilibrium; consequences; thematic closure."
        ],
        examplesTitle: "Three Act Examples",
        examples: [
          "Most Hollywood films",
          "Contemporary commercial novels",
          "Studio-driven storytelling"
        ]
      });
      return;
    }
    if (title === "Freytag’s Pyramid") {
      this.renderStructureDetail(container, {
        introTitle: "What is Freytag’s Pyramid?",
        intro: [
          "A classical five-part model of dramatic tension, often associated with tragedy. It formalizes a rise to climax followed by a decline into resolution."
        ],
        stepsTitle: "Steps (5-part model)",
        steps: [
          "1. Exposition — Introduce setting, characters, and the initial balance.",
          "2. Rising Action — Complications build; conflict intensifies; choices narrow.",
          "3. Climax — The turning point—the peak tension where fate changes direction.",
          "4. Falling Action — Consequences unfold; momentum turns toward inevitable outcome.",
          "5. Denouement / Catastrophe — Final resolution, often with moral or tragic closure."
        ],
        examplesTitle: "Freytag Examples",
        examples: [
          "Classical tragedies",
          "Shakespearean drama",
          "Traditional stage plays"
        ]
      });
      return;
    }
    if (title === "Fichtean Curve") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Fichtean Curve?",
        intro: [
          "A structure built from a chain of escalating crises with minimal exposition. The story begins close to conflict and continues increasing pressure until climax."
        ],
        stepsTitle: "Steps (crisis chain)",
        steps: [
          "1. Immediate Hook / First Crisis — Start near a problem, not far before it.",
          "2. Crisis Escalation 1 — The protagonist responds; the response creates new complications.",
          "3. Crisis Escalation 2 — Stakes rise; setbacks compound; options shrink.",
          "4. Crisis Escalation 3 — Pressure intensifies; emotional and practical costs deepen.",
          "5. Major Crisis / Low Point — A near-defeat moment that forces a decisive shift.",
          "6. Climax — The protagonist commits fully and confronts the core conflict.",
          "7. Short Resolution — Quick wrap-up; consequences and new stability."
        ],
        examplesTitle: "Fichtean Curve Examples",
        examples: [
          "Thrillers",
          "Page-turner genre fiction",
          "Serialized storytelling"
        ]
      });
      return;
    }
    if (title === "Kishōtenketsu") {
      this.renderStructureDetail(container, {
        introTitle: "What is Kishōtenketsu?",
        intro: [
          "Kishōtenketsu is a four-part structure that emphasizes development and contrast rather than conflict. It’s common in East Asian storytelling and works well for narratives driven by discovery, theme, or perspective."
        ],
        stepsTitle: "Steps (4-part model)",
        steps: [
          "1. Ki (Introduction) — Establish the situation, characters, and core idea.",
          "2. Shō (Development) — Expand the situation; deepen detail and context without major disruption.",
          "3. Ten (Turn / Twist) — Introduce a surprising contrast or shift: a new angle, reveal, or reframing event.",
          "4. Ketsu (Conclusion) — Synthesize: show how the contrast changes meaning; resolve by integration rather than victory."
        ],
        examplesTitle: "Kishōtenketsu Examples",
        examples: [
          "Many slice-of-life stories",
          "Certain anime and manga arcs",
          "Essays or thematic short fiction",
          "Some puzzle-like narratives"
        ]
      });
      return;
    }
    if (title === "Save the Cat") {
      this.renderStructureDetail(container, {
        introTitle: "What is Save the Cat?",
        intro: [
          "Save the Cat is a commercial beat sheet designed to maximize audience engagement. It focuses on emotional timing, clarity, and likeability, especially for film and genre fiction."
        ],
        core: [
          "Strong emotional beats",
          "Clear pacing",
          "Audience empathy",
          "Market-tested structure"
        ],
        stepsTitle: "Steps (15-beat model)",
        steps: [
          "1. Opening Image — A snapshot of the protagonist’s world before change.",
          "2. Theme Stated — A line or moment hints at the story’s central lesson.",
          "3. Setup — Introduce characters, flaws, relationships, and stakes.",
          "4. Catalyst — The inciting incident that disrupts normal life.",
          "5. Debate — The protagonist hesitates and weighs options.",
          "6. Break into Act II — Commitment to the journey.",
          "7. B Story — A secondary plot, often emotional or relational.",
          "8. Fun and Games — The “promise of the premise”; the story delivers on genre.",
          "9. Midpoint — A major reversal: false victory or false defeat.",
          "10. Bad Guys Close In — Pressure increases; plans unravel.",
          "11. All Is Lost — Apparent defeat; emotional or literal low point.",
          "12. Dark Night of the Soul — Reflection and internal reckoning.",
          "13. Break into Act III — New insight leads to decisive action.",
          "14. Finale — The protagonist applies what they’ve learned to win or lose meaningfully.",
          "15. Final Image — A mirror of the opening image, showing change."
        ],
        examplesTitle: "Save the Cat Examples",
        examples: [
          "Most studio films",
          "Romantic comedies",
          "High-concept genre movies",
          "Animated features"
        ]
      });
      return;
    }
    if (title === "Seven Point Structure") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Seven Point Structure?",
        intro: [
          "A clean, flexible structure focused on cause-and-effect turning points. It emphasizes clarity and momentum."
        ],
        core: [
          "Fewer beats, higher impact",
          "Clear reversals",
          "Strong midpoint logic"
        ],
        stepsTitle: "Steps (7-point model)",
        numberedSteps: true,
        steps: [
          "1. Hook — Introduce the protagonist and the central problem.",
          "2. Plot Turn 1 — An event pushes the protagonist into action.",
          "3. Pinch Point 1 — Pressure reveals the antagonist’s power.",
          "4. Midpoint — The protagonist shifts from reactive to proactive.",
          "5. Pinch Point 2 — Stakes intensify; consequences loom.",
          "6. Plot Turn 2 — Final commitment toward resolution.",
          "7. Resolution — Conflict concludes; new status quo established."
        ],
        examplesTitle: "Seven Point Examples",
        examples: [
          "Fantasy and sci-fi novels",
          "Plot-driven fiction",
          "Serialized narratives"
        ]
      });
      return;
    }
    if (title === "Pulp Formula") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Pulp Formula?",
        intro: [
          "A fast-paced structure designed for entertainment, clarity, and momentum. It prioritizes action, stakes, and accessibility over thematic subtlety."
        ],
        core: [
          "Immediate engagement",
          "Clear heroes and villains",
          "Escalating danger",
          "High momentum"
        ],
        stepsTitle: "Steps (common pulp rhythm)",
        steps: [
          "1. Immediate Hook — Start with action or danger.",
          "2. Clear Goal — The protagonist knows what must be done.",
          "3. Obstacle Chain — Continuous challenges and reversals.",
          "4. Escalation — Stakes increase rapidly.",
          "5. Cliffhanger or Crisis — A major setback or revelation.",
          "6. Final Confrontation — Direct clash with the antagonist.",
          "7. Swift Resolution — Loose ends tied quickly."
        ],
        examplesTitle: "Pulp Examples",
        examples: [
          "Adventure serials",
          "Noir fiction",
          "Action thrillers",
          "Comic storytelling"
        ]
      });
      return;
    }
    if (title === "McKee Story paradigm") {
      this.renderStructureDetail(container, {
        introTitle: "What is the McKee Paradigm?",
        intro: [
          "Robert McKee’s model emphasizes story as a sequence of value changes driven by conflict and choice. It focuses on scene design and narrative causality."
        ],
        core: [
          "Value shifts",
          "Progressive complications",
          "Scene-level causality",
          "Strong climax logic"
        ],
        stepsTitle: "Structural principles",
        steps: [
          "1. Inciting Incident — A radical change disrupts balance.",
          "2. Progressive Complications — Each action leads to greater difficulty.",
          "3. Crisis — A decision between irreconcilable values.",
          "4. Climax — Action that resolves the crisis.",
          "5. Resolution — The world stabilizes in a new form."
        ],
        examplesTitle: "McKee Examples",
        examples: [
          "Prestige drama",
          "Character-driven films",
          "Serious literary narratives"
        ]
      });
      return;
    }
    if (title === "Into the Woods structure") {
      this.renderStructureDetail(container, {
        introTitle: "What is the Into the Woods structure?",
        intro: [
          "John Yorke’s model views story as a five-act, fractal pattern: order, disorder, repair, collapse, and transformation. It emphasizes repetition at multiple scales."
        ],
        core: [
          "Five-part rhythm",
          "Fractal repetition",
          "Moral consequence",
          "Thematic depth"
        ],
        stepsTitle: "Steps (5-act pattern)",
        steps: [
          "1. Order — Establish a flawed equilibrium.",
          "2. Disruption — A desire or problem breaks order.",
          "3. Attempted Repair — Characters try to fix things.",
          "4. Collapse — Efforts fail; chaos peaks.",
          "5. New Order — A transformed equilibrium emerges."
        ],
        examplesTitle: "Into the Woods Examples",
        examples: [
          "British television drama",
          "Prestige serialized storytelling",
          "Thematic narratives"
        ]
      });
      return;
    }
    if (title === "Frame Narrative") {
      this.renderStructureDetail(container, {
        introTitle: "What is a Frame Narrative?",
        intro: [
          "A story within a story. An outer narrative contextualizes or reframes an inner narrative."
        ],
        core: [
          "Nested storytelling",
          "Perspective mediation",
          "Interpretive distance"
        ],
        stepsTitle: "Structural layers",
        steps: [
          "1. Outer Frame — Establish the narrator or context.",
          "2. Inner Story — The primary narrative is told.",
          "3. Interruption or Commentary — The frame reacts or reframes meaning.",
          "4. Return to Frame — The story closes with new understanding."
        ],
        examplesTitle: "Frame Narrative Examples",
        examples: [
          "Frankenstein",
          "The Princess Bride",
          "Heart of Darkness",
          "Arabian Nights"
        ]
      });
      return;
    }
    if (title === "Nonlinear Structure") {
      this.renderStructureDetail(container, {
        introTitle: "What is a Nonlinear Structure?",
        intro: [
          "A narrative told out of chronological order. Meaning emerges from juxtaposition rather than sequence."
        ],
        core: [
          "Fragmented timeline",
          "Pattern recognition",
          "Active audience participation"
        ],
        stepsTitle: "Common nonlinear patterns",
        steps: [
          "Reverse chronology",
          "Interwoven timelines",
          "Fragmented memory",
          "Circular narratives"
        ],
        examplesTitle: "Nonlinear Examples",
        examples: [
          "Memento",
          "Pulp Fiction",
          "Westworld",
          "Slaughterhouse-Five"
        ]
      });
      return;
    }
    if (title === "Rashomon Structure") {
      this.renderStructureDetail(container, {
        introTitle: "What is a Rashomon Structure?",
        intro: [
          "A narrative that presents multiple, conflicting perspectives of the same event, emphasizing subjectivity and truth ambiguity."
        ],
        core: [
          "Multiple narrators",
          "Contradictory accounts",
          "Truth as unstable"
        ],
        stepsTitle: "Structural pattern",
        steps: [
          "1. Single event",
          "2. Multiple retellings",
          "3. Contradictions revealed",
          "4. Ambiguity preserved"
        ],
        examplesTitle: "Rashomon Examples",
        examples: [
          "Rashomon",
          "Hero",
          "The Affair",
          "Gone Girl (partial)"
        ]
      });
      return;
    }
    if (title === "In Medias Res") {
      this.renderStructureDetail(container, {
        introTitle: "What is In Medias Res?",
        intro: [
          "A narrative that begins in the middle of action, then later provides context for how events reached that point."
        ],
        core: [
          "Immediate engagement",
          "Delayed exposition",
          "Momentum-first storytelling"
        ],
        stepsTitle: "Structural pattern",
        steps: [
          "1. Mid-action opening",
          "2. Audience confusion",
          "3. Gradual backfill",
          "4. Recontextualization",
          "5. Continuation to resolution"
        ],
        examplesTitle: "In Medias Res Examples",
        examples: [
          "The Odyssey",
          "Breaking Bad (cold opens)",
          "Mad Max: Fury Road",
          "Fight Club"
        ]
      });
      return;
    }
    if (title === "The Mentor") {
      this.renderMentorDetail(container);
      return;
    }
    if (title === "The Herald") {
      this.renderHeraldDetail(container);
      return;
    }
    if (title === "The Shadow") {
      this.renderShadowDetail(container);
      return;
    }
    if (title === "The Trickster") {
      this.renderTricksterDetail(container);
      return;
    }
    if (title === "The Ally") {
      this.renderAllyDetail(container);
      return;
    }
    if (title === "The Shapeshifter") {
      this.renderShapeshifterDetail(container);
      return;
    }
    if (title === "The Threshold Guardian") {
      this.renderThresholdGuardianDetail(container);
      return;
    }
    if (title === "The Caregiver") {
      this.renderCaregiverDetail(container);
      return;
    }

    container.createDiv({ cls: "resource-detail-placeholder", text: "Content coming soon." });
  }

  getResourceIcon(title) {
    const iconMap = {
      "The Hero": "sword",
      "The Mentor": "graduation-cap",
      "The Herald": "bell",
      "The Shadow": "moon",
      "The Trickster": "dice",
      "The Ally": "handshake",
      "The Shapeshifter": "hat-glasses",
      "The Threshold Guardian": "shield",
      "The Caregiver": "heart-handshake",
      "The Creator": "paintbrush",
      "The Everyman": "users",
      "The Explorer": "compass",
      "The Hero (Jung)": "sword",
      "The Innocent": "baby",
      "The Jester": "party-popper",
      "The Lover": "heart",
      "The Magician": "wand-2",
      "The Outlaw": "flame-kindling",
      "The Ruler": "crown",
      "The Sage": "book-open",
      "Moral Ascent": "trending-up",
      "Moral Descent": "trending-down",
      "Flat Moral": "minus",
      "Moral Transformation": "trending-up-down",
      "Character Pitfalls": "user",
      "Character Arc Pitfalls": "route",
      "Narrative Technique Pitfalls": "book-open",
      "Structure Pitfalls": "layout-grid",
      "Writing-Level Pitfalls": "pen-line",
      "Flashback": "rewind",
      "Flashforward": "fast-forward",
      "Foreshadowing": "scan-eye",
      "Chekhov’s Gun": "bomb",
      "Red Herring": "fish",
      "Plot Twist": "rotate-3d",
      "Deus Ex Machina": "wand-2",
      "Eucatastrophe": "mountain",
      "Poetic Justice": "scale",
      "“Show, Don’t Tell”": "eye",
      "Quibble (Wordplay)": "quote",
      "The Hero’s Journey": "map",
      "Dan Harmon Story Circle": "orbit",
      "Freytag’s Pyramid": "triangle",
      "Fichtean Curve": "line-chart",
      "Three Act Structure": "columns-3",
      "Kishōtenketsu": "route",
      "Save the Cat": "cat",
      "Seven Point Structure": "wheat",
      "Pulp Formula": "book",
      "McKee Story paradigm": "book-open",
      "Into the Woods structure": "trees",
      "Frame Narrative": "scan",
      "Nonlinear Structure": "line-squiggle",
      "Rashomon Structure": "shrink",
      "In Medias Res": "git-commit-horizontal",
      "Argumentation (tips)": "scale",
      "Description (tips)": "image",
      "Dialogue (tips)": "message-circle",
      "Exposition (tips)": "file-text",
      "Narration (tips)": "book-open",
      "Persuasion (tips)": "megaphone"
    };
    return iconMap[title] || "book";
  }

  getResourceHeading(title) {
    const archetypeTitles = new Set([
      "The Hero",
      "The Mentor",
      "The Herald",
      "The Shadow",
      "The Trickster",
      "The Ally",
      "The Shapeshifter",
      "The Threshold Guardian",
      "The Caregiver",
      "The Creator",
      "The Everyman",
      "The Explorer",
      "The Hero (Jung)",
      "The Innocent",
      "The Jester",
      "The Lover",
      "The Magician",
      "The Outlaw",
      "The Ruler",
      "The Sage"
    ]);

    if (archetypeTitles.has(title)) {
      return `${title.toUpperCase()} ARCHETYPE`;
    }

    if (title.endsWith("(tips)")) {
      return title.replace(" (tips)", "").toUpperCase();
    }

    return title.toUpperCase();
  }

  createResourceSubheading(parent, iconName, text) {
    const heading = parent.createDiv({ cls: "resource-detail-subheading-row" });
    const icon = heading.createSpan({ cls: "resource-detail-subheading-icon" });
    setIcon(icon, iconName);
    heading.createSpan({ cls: "resource-detail-subheading", text });
  }

  renderHeroDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Hero?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Hero is the transforming protagonist. They represent the struggle for personal growth, the confrontation of fear, and the overcoming of obstacles. The Hero symbolizes the human drive to transcend limits, improve, and give meaning to adversity."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This is a universal archetype found in myth, classical stories, and modern narratives. The Hero’s journey forms the backbone of many plots."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Courage in the face of danger",
      "Inner and outer strength",
      "Empathy and leadership",
      "Strong sense of justice",
      "Human flaws and vulnerability"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Hero is not perfect. They fall, struggle, and rise transformed."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Mentor → guidance and wisdom",
      "Ally → shared mission",
      "Threshold Guardian → trial or blockage",
      "Shadow → antagonist or repressed self",
      "Trickster → chaos and disruption",
      "Shapeshifter → uncertainty and tension",
      "Herald → announces change"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing a strong Hero");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear motivation",
      "Internal conflict",
      "Meaningful backstory",
      "Unique skills",
      "Emotional relationships",
      "Balance of strength and fragility",
      "Strong contrast between ordinary life and transformation"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const whyZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(whyZone, "chart-spline", "Why this archetype works");
    whyZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Because it mirrors the human experience: struggle, fall, learning, and transformation."
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "bookmark");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Hero Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Harry Potter",
      "Frodo Baggins",
      "Katniss Everdeen",
      "Mulan",
      "Luke Skywalker",
      "Simba",
      "Elizabeth Bennet"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderMentorDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Mentor?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Mentor guides, teaches, and inspires the Hero. They provide wisdom, experience, and emotional support, helping the Hero grow and overcome challenges."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Mentor represents inherited knowledge, tradition, and the possibility of inner transformation."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Spiritual and practical guide",
      "Accumulated wisdom",
      "Emotional support figure",
      "Ethical compass",
      "Connection to tradition",
      "Catalyst for action"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Often the Mentor sacrifices something, forcing the Hero into independence."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Mentor supports the Hero’s growth as:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Trusted advisor",
      "Trainer or teacher",
      "Giver of tools or gifts",
      "Emotional challenger",
      "Bridge between worlds"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "When the Mentor disappears, the Hero must act alone."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → formative bond",
      "Threshold Guardian → shared trials",
      "Shadow → moral counterpoint",
      "Ally → cooperation or tension",
      "Trickster → disruption of authority",
      "Shapeshifter → ambiguity",
      "Herald → signals the need for guidance"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing a compelling Mentor");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Strong introduction",
      "Clear motivation",
      "Demonstrated expertise",
      "Unique personality",
      "Revealing backstory",
      "Trust with the Hero",
      "Memorable first lesson",
      "Symbolic presence"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "layout-grid");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Mentor Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Gandalf",
      "Dumbledore",
      "Mr. Miyagi",
      "Yoda",
      "Professor Xavier",
      "Glinda",
      "Haymitch",
      "Rafiki",
      "Morpheus"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderHeraldDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Herald?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Herald announces change. They disrupt the status quo and deliver the call to adventure, signaling that the current world can no longer remain the same."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Herald does not need to stay in the story long — their power lies in initiating movement."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Messenger of change",
      "Catalyst for action",
      "Bringer of information or crisis",
      "External or internal trigger",
      "Neutral, positive, or threatening"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Herald forces a decision."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Herald appears to:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Deliver news",
      "Introduce conflict",
      "Reveal danger or opportunity",
      "Force the Hero to act",
      "Break routine"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They are the narrative spark."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → awakens purpose",
      "Mentor → confirms the call",
      "Shadow → escalation of threat",
      "Ally → shared urgency",
      "Shapeshifter → uncertainty around meaning",
      "Trickster → distorted message"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing an effective Herald");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear message",
      "Strong timing",
      "Memorable entrance",
      "Emotional impact",
      "Immediate consequences",
      "No unnecessary exposition"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Herald Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "R2-D2",
      "The White Rabbit",
      "Hagrid",
      "The Letter from Hogwarts",
      "The Black Spot (Treasure Island)",
      "Morpheus (first contact)",
      "Paul Revere"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderShadowDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Shadow?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shadow represents the Hero’s greatest obstacle. It often embodies the Hero’s repressed fears, flaws, or dark potential."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shadow can be a villain, antagonist, rival, or internal force."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Opposition and threat",
      "Moral contrast",
      "Power or temptation",
      "Psychological mirror",
      "Fear incarnate"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shadow tests the Hero’s values."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shadow exists to:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Block progress",
      "Challenge morality",
      "Force growth",
      "Expose weakness",
      "Represent consequences"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Defeating the Shadow often means internal change."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → mirrored opposition",
      "Mentor → ideological contrast",
      "Ally → collateral conflict",
      "Trickster → destabilization",
      "Shapeshifter → hidden threat",
      "Threshold Guardian → shared function"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing a powerful Shadow");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear motivation",
      "Personal connection to Hero",
      "Symbolic design",
      "Escalating threat",
      "Moral complexity",
      "Consequences beyond defeat"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Shadow Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Darth Vader",
      "Voldemort",
      "Sauron",
      "Joker",
      "Scar",
      "Thanos",
      "Captain Ahab"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderTricksterDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Trickster?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Trickster introduces chaos, humor, and unpredictability. They question authority, expose hypocrisy, and disrupt order."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Trickster is rarely evil — they destabilize to reveal truth."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Humor and wit",
      "Rule-breaking behavior",
      "Irony and satire",
      "Unpredictability",
      "Social disruption"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They thrive on contradiction."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Trickster serves to:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Relieve tension",
      "Challenge norms",
      "Reveal hidden truths",
      "Expose weakness",
      "Create narrative surprise"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They prevent stagnation."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → comic relief or moral test",
      "Mentor → challenges authority",
      "Shadow → ironic contrast",
      "Ally → unreliable support",
      "Shapeshifter → shared ambiguity"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing an effective Trickster");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Sharp dialogue",
      "Clear worldview",
      "Narrative timing",
      "Purposeful disruption",
      "Balance humor and impact"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Trickster Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Loki",
      "Jack Sparrow",
      "Bugs Bunny",
      "Deadpool",
      "The Joker (comic function)",
      "Puck",
      "Han Solo"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderAllyDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Ally?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Ally supports the Hero emotionally, strategically, or practically. They represent friendship, loyalty, and shared purpose."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Allies humanize the Hero."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Loyalty",
      "Complementary skills",
      "Emotional support",
      "Shared risk",
      "Personal stake"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Allies often have their own arcs."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Ally helps by:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Assisting in conflict",
      "Providing perspective",
      "Supporting decisions",
      "Sharing danger",
      "Reflecting growth"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They reinforce connection."
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → partnership",
      "Mentor → guidance extension",
      "Shadow → vulnerability",
      "Trickster → contrast",
      "Shapeshifter → trust tension"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing strong Allies");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear individuality",
      "Defined strengths",
      "Emotional bond",
      "Independent goals",
      "Potential conflict"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Ally Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Samwise Gamgee",
      "Ron Weasley",
      "Hermione Granger",
      "Chewbacca",
      "Dr. Watson",
      "Merry & Pippin",
      "Peeta Mellark"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderShapeshifterDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Shapeshifter?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shapeshifter embodies uncertainty. Their allegiance, identity, or intentions are unclear, creating doubt and tension."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They represent change and ambiguity."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Duality",
      "Uncertainty",
      "Fluid loyalty",
      "Deception or mystery",
      "Emotional instability"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They challenge trust."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Shapeshifter exists to:"
    });
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Create doubt",
      "Test perception",
      "Complicate relationships",
      "Introduce surprise",
      "Represent internal conflict"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → trust challenge",
      "Mentor → warning or lesson",
      "Shadow → secret alliance",
      "Ally → betrayal risk",
      "Trickster → shared chaos"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing a compelling Shapeshifter");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear mystery",
      "Consistent ambiguity",
      "Emotional stakes",
      "Gradual revelation",
      "Meaningful transformation"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Shapeshifter Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Catwoman",
      "Severus Snape",
      "Gollum",
      "Mystique",
      "Nick Fury",
      "Scarlett O’Hara"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderThresholdGuardianDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Threshold Guardian?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Threshold Guardian blocks progress and tests readiness. They appear at key moments of transition."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They are not always villains — they are gatekeepers."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Obstacle or challenge",
      "Moral or physical test",
      "Enforcer of rules",
      "Neutral opposition",
      "Trial embodiment"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Passing them marks growth."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Tests commitment",
      "Filters worthiness",
      "Forces preparation",
      "Delays progression",
      "Raises stakes"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
    const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Hero → rite of passage",
      "Mentor → preparation source",
      "Shadow → structural parallel",
      "Ally → shared test",
      "Trickster → bypass attempt"
    ].forEach((item) => {
      relationships.createEl("li", { text: item });
    });

    const writingZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(writingZone, "square-pen", "Writing effective Threshold Guardians");
    const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Clear rules",
      "Symbolic challenge",
      "Consequences for failure",
      "Escalation of difficulty",
      "Memorable encounter"
    ].forEach((item) => {
      writing.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "club");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Threshold Guardian Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "The Sphinx",
      "Cerberus",
      "The Bouncer",
      "Stormtroopers",
      "Gatekeepers",
      "Dragons",
      "The First Boss"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderCaregiverDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Caregiver?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Caregiver is driven by compassion, responsibility, and the desire to protect others. They exist to nurture, support, and sustain, often putting others’ needs before their own."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This archetype represents altruism, sacrifice, and unconditional care."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Empathy and compassion",
      "Selflessness",
      "Responsibility",
      "Emotional strength",
      "Protective instinct"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Caregiver’s weakness is often self-neglect."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Protects vulnerable characters",
      "Provides emotional stability",
      "Represents moral goodness",
      "Motivates sacrifice",
      "Creates emotional stakes"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They often anchor the story’s heart."
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Helping others vs. self-preservation",
      "Love vs. burnout",
      "Responsibility vs. freedom"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Caregiver Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Marmee (Little Women)",
      "Samwise Gamgee",
      "Aunt May",
      "Molly Weasley",
      "Baymax",
      "Marlin (Finding Nemo)"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderCreatorDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Creator?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Creator is driven by imagination and the urge to build something meaningful. They seek originality, self-expression, and lasting impact through creation."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This archetype fears mediocrity and unrealized potential."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Creativity",
      "Vision",
      "Innovation",
      "Sensitivity",
      "Perfectionism"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They are often torn between inspiration and self-doubt."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Brings new ideas into the world",
      "Challenges existing systems",
      "Embodies artistic struggle",
      "Explores identity through creation"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Fear of failure",
      "Obsession with perfection",
      "Isolation",
      "The cost of creation"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Creator Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Victor Frankenstein",
      "Tony Stark",
      "Walt Disney (fictionalized)",
      "Dr. Emmett Brown",
      "Jo March",
      "Da Vinci–type characters"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderEverymanDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Everyman?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Everyman represents normalcy, relatability, and belonging. They are not exceptional by skill or destiny, but by humanity."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This archetype allows the audience to see themselves in the story."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Humility",
      "Honesty",
      "Reliability",
      "Relatability",
      "Desire for connection"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They succeed through perseverance, not greatness."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Grounds the story",
      "Reflects audience values",
      "Humanizes extraordinary events",
      "Emphasizes community and belonging"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Feeling insignificant",
      "Fear of standing out",
      "Desire to belong vs. desire to matter"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Everyman Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Arthur Dent",
      "Bilbo Baggins (early)",
      "Jim Halpert",
      "Forrest Gump",
      "Frodo (initially)"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderExplorerDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Explorer?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Explorer seeks freedom, discovery, and self-definition. They reject confinement and pursue meaning through experience."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This archetype values independence above all else."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Curiosity",
      "Independence",
      "Courage",
      "Restlessness",
      "Self-reliance"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear conformity and stagnation."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Drives journeys and quests",
      "Expands the world of the story",
      "Challenges limits and borders",
      "Represents personal freedom"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Commitment",
      "Loneliness",
      "Rootlessness",
      "The cost of freedom"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Explorer Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Indiana Jones",
      "Lara Croft",
      "Moana",
      "Huck Finn",
      "The Doctor (Doctor Who)"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderHeroJungDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Hero?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Jungian Hero represents courage, willpower, and the drive to prove worth through action. Unlike the mythic Hero’s Journey, this archetype focuses on strength and achievement."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Bravery",
      "Determination",
      "Discipline",
      "Moral clarity",
      "Endurance"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They define themselves through struggle."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Confronts danger directly",
      "Overcomes adversity",
      "Protects others",
      "Embodies action and resolve"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Pride",
      "Fear of weakness",
      "Burnout",
      "Identity tied solely to victory"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Hero Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Wonder Woman",
      "Captain America",
      "Achilles",
      "Beowulf",
      "Maximus"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderInnocentDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Innocent?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Innocent seeks happiness, safety, and goodness. They believe in a just world and trust others easily."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This archetype represents hope and moral purity."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Optimism",
      "Trust",
      "Faith",
      "Simplicity",
      "Moral clarity"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Their weakness is naivety."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Highlights corruption or cruelty",
      "Inspires protection",
      "Restores hope",
      "Contrasts darker characters"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Loss of faith",
      "Disillusionment",
      "Exposure to harsh reality"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Innocent Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Dorothy Gale",
      "Paddington",
      "Buddy (Elf)",
      "Bambi",
      "Amélie"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderJesterDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Jester?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Jester lives in the moment, embracing humor, chaos, and joy. They expose truth through laughter and subversion."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Humor",
      "Irreverence",
      "Playfulness",
      "Chaos",
      "Social critique"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear boredom and oppression."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Relieves tension",
      "Exposes hypocrisy",
      "Challenges authority",
      "Brings levity"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Being taken seriously",
      "Hiding pain behind humor"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Jester Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Jack Sparrow",
      "The Genie",
      "Tyrion Lannister",
      "Bugs Bunny",
      "Puck"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderLoverDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Lover?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Lover is driven by passion, intimacy, and connection. They seek union — romantic, emotional, or aesthetic."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Passion",
      "Devotion",
      "Sensuality",
      "Emotional depth",
      "Vulnerability"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear abandonment and loss."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Raises emotional stakes",
      "Motivates sacrifice",
      "Explores intimacy",
      "Drives relational conflict"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Obsession",
      "Dependency",
      "Loss of identity"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Lover Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Romeo & Juliet",
      "Rose (Titanic)",
      "Westley",
      "Scarlett O’Hara",
      "Jack Dawson"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderMagicianDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Magician?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Magician seeks transformation — of self, others, or reality itself. They understand hidden systems and use knowledge to enact change."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Insight",
      "Vision",
      "Power",
      "Charisma",
      "Transformation"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear unintended consequences."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Enables change",
      "Transforms situations",
      "Reveals hidden truths",
      "Alters reality"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Control vs. ethics",
      "Power misuse",
      "Hubris"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Magician Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Gandalf",
      "Doctor Strange",
      "Merlin",
      "Neo",
      "Dumbledore"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderOutlawDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Outlaw?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Outlaw rejects rules, authority, and conformity. They seek freedom through rebellion and disruption."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Defiance",
      "Independence",
      "Anger or idealism",
      "Courage",
      "Anti-authoritarianism"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear powerlessness."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Challenges systems",
      "Sparks revolution",
      "Represents resistance",
      "Breaks unjust rules"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Destruction vs. change",
      "Isolation",
      "Moral ambiguity"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Outlaw Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "V",
      "Robin Hood",
      "Han Solo",
      "Tyler Durden",
      "Katniss Everdeen"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderRulerDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Ruler?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Ruler seeks order, control, and stability. They value leadership, responsibility, and structure."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Authority",
      "Control",
      "Responsibility",
      "Vision",
      "Discipline"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear chaos and loss of power."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Establishes order",
      "Sets laws and norms",
      "Represents power",
      "Creates political stakes"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Tyranny vs. justice",
      "Control vs. trust"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Ruler Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Mufasa",
      "Aragorn",
      "Queen Elizabeth–type figures",
      "Tywin Lannister",
      "Odin"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderSageDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "Who is the Sage?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The Sage seeks truth through knowledge and understanding. They value wisdom over action."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core traits");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Intelligence",
      "Objectivity",
      "Insight",
      "Reflection",
      "Patience"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "They fear ignorance and deception."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Provides truth",
      "Explains systems",
      "Guides decisions",
      "Offers perspective"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Detachment",
      "Inaction",
      "Emotional distance"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Sage Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Obi-Wan Kenobi",
      "Socrates–type figures",
      "Professor X",
      "Dumbledore (as Sage)",
      "Spock"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderMoralAscentDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Ascent?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "A Moral Ascent arc follows a character who grows ethically over the course of the story. The character starts with flaws, ignorance, or selfishness and gradually learns to act with greater integrity, empathy, or responsibility."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This is the classic arc of becoming better."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core characteristics");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Ethical growth",
      "Increased empathy",
      "Personal responsibility",
      "Learning from mistakes",
      "Sacrifice for others"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The character ends the story morally stronger than they began."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Inspire the audience",
      "Reinforce ethical values",
      "Reward self-reflection and growth",
      "Create emotional catharsis"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });
    functionZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "It often aligns with hopeful or redemptive stories."
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Fear vs. courage",
      "Self-interest vs. responsibility",
      "Ignorance vs. awareness",
      "Comfort vs. change"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Ascent Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Ebenezer Scrooge",
      "Zuko",
      "Jean Valjean",
      "Tony Stark",
      "Shrek",
      "Mulan"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderMoralDescentDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Descent?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "A Moral Descent arc follows a character who deteriorates ethically over time. They begin with good intentions or neutrality but gradually compromise their values, often due to fear, ambition, pride, or trauma."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "This is the arc of corruption."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core characteristics");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Ethical erosion",
      "Rationalization of wrongdoing",
      "Increasing selfishness or cruelty",
      "Loss of empathy",
      "Escalating consequences"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The character becomes morally worse by the end."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Explore the cost of power",
      "Examine temptation and corruption",
      "Create tragedy or cautionary tales",
      "Critique ambition or hubris"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Power vs. morality",
      "Control vs. restraint",
      "Fear vs. conscience",
      "Justification vs. accountability"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Descent Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Walter White",
      "Anakin Skywalker",
      "Michael Corleone",
      "Macbeth",
      "Gollum",
      "Light Yagami"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderFlatMoralDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "What is a Flat Moral Arc?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "In a Flat Moral Arc, the character does not significantly change their moral beliefs. Instead, the character’s values remain constant while the world around them is challenged or transformed."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The character changes others, not themselves."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core characteristics");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Stable moral compass",
      "Strong convictions",
      "Resistance to pressure",
      "Consistency under stress",
      "Influence on others"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The arc is external rather than internal."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Represent ideal values",
      "Challenge a flawed world",
      "Serve as moral anchors",
      "Highlight societal change"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Common internal tensions");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Isolation due to integrity",
      "Conflict with changing norms",
      "Burden of being right",
      "Moral fatigue"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Flat Moral Arc Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Captain America",
      "Paddington",
      "Atticus Finch",
      "Superman",
      "Wonder Woman",
      "Marge Gunderson"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderMoralTransformationDetail(container) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Transformation?");
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "A Moral Transformation arc depicts a character who undergoes a fundamental ethical shift. Unlike gradual ascent or descent, this change is often abrupt, intense, and tied to a defining moment or revelation."
    });
    introZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "The character becomes morally different — not just better or worse."
    });

    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(traitsZone, "heart", "Core characteristics");
    const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Pivotal turning point",
      "Identity redefinition",
      "Value realignment",
      "Emotional shock or revelation",
      "Clear “before and after”"
    ].forEach((item) => {
      traits.createEl("li", { text: item });
    });
    traitsZone.createDiv({
      cls: "resource-detail-paragraph",
      text: "Transformation is often irreversible."
    });

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Mark decisive moments",
      "Reinvent characters",
      "Shock or reframe audience perception",
      "Signal thematic shifts"
    ].forEach((item) => {
      functionsList.createEl("li", { text: item });
    });

    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
    const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    [
      "Guilt vs. denial",
      "Old identity vs. new self",
      "Fear of change",
      "Consequences of awakening"
    ].forEach((item) => {
      conflictList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "user-round");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Transformation Examples" });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    [
      "Darth Vader (redemption moment)",
      "Neo (awakening)",
      "Clarice Starling",
      "Jaime Lannister",
      "Elsa (acceptance)",
      "Andy Dufresne"
    ].forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderPitfallsDetail(container, title, items) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const pitfallsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(pitfallsZone, "alert-triangle", title);
    const list = pitfallsZone.createEl("ul", { cls: "resource-detail-list" });
    items.forEach((item) => {
      list.createEl("li", { text: item });
    });
  }

  renderTipsDetail(container, config) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
    config.intro.forEach((paragraph) => {
      introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
    });

    const techniquesZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(techniquesZone, "heart", "Core techniques");
    const techniquesList = techniquesZone.createDiv({ cls: "resource-detail-callout-list" });
    config.techniques.forEach((item) => {
      this.renderCalloutItem(techniquesList, item);
    });
  }

  renderCalloutItem(container, item) {
    const cleanText = typeof item === "string" ? item.replace(/^\d+\.\s*/, "") : "";
    const parts = cleanText ? cleanText.split(" — ") : [];
    const title = typeof item === "string" ? parts[0]?.trim() : item?.title?.trim();
    const body = typeof item === "string" ? parts.slice(1).join(" — ").trim() : item?.body?.trim();
    const stepIconMap = {
      "EXPOSITION": "scroll-text",
      "RISING ACTION": "trending-up",
      "CLIMAX": "triangle",
      "FALLING ACTION": "trending-down",
      "DENOUEMENT / CATASTROPHE": "skull",
      "IMMEDIATE HOOK / FIRST CRISIS": "flame",
      "CRISIS ESCALATION 1": "move-up-right",
      "CRISIS ESCALATION 2": "trending-up",
      "CRISIS ESCALATION 3": "corner-right-up",
      "MAJOR CRISIS / LOW POINT": "triangle-alert",
      "SHORT RESOLUTION": "flag",
      "OPENING / STATUS QUO": "home",
      "INCITING INCIDENT": "zap",
      "DEBATE / REFUSAL": "message-circle-x",
      "ACT I BREAK (COMMITMENT)": "thumbs-up",
      "RISING COMPLICATIONS": "trending-up",
      "MIDPOINT SHIFT": "refresh-ccw-dot",
      "BAD GUYS CLOSE IN / PRESSURE PEAKS": "alert-triangle",
      "ALL IS LOST": "bone",
      "DARK NIGHT OF THE SOUL": "skull",
      "ACT III BREAK (NEW PLAN)": "notepad-text",
      "DENOUEMENT": "flag",
      "KI (INTRODUCTION)": "circle-play",
      "SHÔ (DEVELOPMENT)": "trending-up",
      "TEN (TURN / TWIST)": "rotate-cw",
      "KETSU (CONCLUSSION)": "flag",
      "OPENING IMAGE": "image",
      "THEME STATED": "quote",
      "SETUP": "list",
      "CATALYST": "sparkles",
      "DEBATE": "message-circle-x",
      "BREAK INTO ACT II": "log-in",
      "B STORY": "users",
      "FUN AND GAMES": "sparkles",
      "MIDPOINT": "refresh-ccw-dot",
      "BAD GUYS CLOSE IN": "alert-triangle",
      "BREAK INTO ACT III": "notepad-text",
      "FINALE": "flag",
      "FINAL IMAGE": "image",
      "HOOK": "sparkles",
      "PLOT TURN 1": "log-in",
      "PINCH POINT 1": "grip",
      "PINCH POINT 2": "grip",
      "PLOT TURN 2": "log-in",
      "RESOLUTION": "flag",
      "IMMEDIATE HOOK": "flame",
      "CLEAR GOAL": "target",
      "OBSTACLE CHAIN": "link-2",
      "ESCALATION": "trending-up",
      "CLIFFHANGER OR CRISIS": "siren",
      "FINAL CONFRONTATION": "swords",
      "SWIFT RESOLUTION": "flag",
      "PROGRESSIVE COMPLICATIONS": "trending-up",
      "CRISIS": "circle-alert",
      "ORDER": "square",
      "DISRUPTION": "sparkles",
      "ATTEMPTED REPAIR": "wrench",
      "COLLAPSE": "triangle-alert",
      "NEW ORDER": "flag",
      "OUTER FRAME": "frame",
      "INNER STORY": "book-open",
      "INTERRUPTION OR COMMENTARY": "message-square",
      "RETURN TO FRAME": "corner-up-left",
      "REVERSE CHRONOLOGY": "rotate-ccw",
      "INTERWOVEN TIMELINES": "split",
      "FRAGMENTED MEMORY": "brain",
      "CIRCULAR NARRATIVES": "repeat",
      "SINGLE EVENT": "dot",
      "MULTIPLE RETELLINGS": "repeat-2",
      "CONTRADICTIONS REVEALED": "alert-triangle",
      "AMBIGUITY PRESERVED": "help-circle",
      "MID-ACTION OPENING": "zap",
      "AUDIENCE CONFUSION": "help-circle",
      "GRADUAL BACKFILL": "clock-4",
      "RECONTEXTUALIZATION": "refresh-ccw-dot",
      "CONTINUATION TO RESOLUTION": "arrow-right"
    };
    const iconName = typeof item === "object" ? item?.icon : (title ? stepIconMap[title.toUpperCase()] : null);
    if (!title) {
      return;
    }
    const callout = container.createDiv({ cls: "resource-detail-callout" });
    if (iconName) {
      const icon = callout.createSpan({ cls: "resource-detail-callout-icon" });
      setIcon(icon, iconName);
    }
    callout.createSpan({ cls: "resource-detail-callout-title", text: title });
    if (body) {
      callout.createDiv({ cls: "resource-detail-callout-body", text: body });
    }
  }

  renderTechniqueDetail(container, config) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
    config.intro.forEach((paragraph) => {
      introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
    });

    const coreZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(coreZone, "heart", "Core characteristics");
    const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
    config.core.forEach((item) => {
      coreList.createEl("li", { text: item });
    });
    if (config.coreNote) {
      coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
    }

    const functionZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(functionZone, "chart-spline", "Narrative function");
    const functionList = functionZone.createEl("ul", { cls: "resource-detail-list" });
    config.narrativeFunction.forEach((item) => {
      functionList.createEl("li", { text: item });
    });
    if (config.narrativeNote) {
      functionZone.createDiv({ cls: "resource-detail-paragraph", text: config.narrativeNote });
    }

    const risksZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(risksZone, "alert-triangle", config.risksTitle || "Common risks");
    const risksList = risksZone.createEl("ul", { cls: "resource-detail-list" });
    config.risks.forEach((item) => {
      risksList.createEl("li", { text: item });
    });

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "bookmark");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    config.examples.forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderStructureDetail(container, config) {
    const content = container.createDiv({ cls: "resource-detail-content" });

    const introZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
    config.intro.forEach((paragraph) => {
      introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
    });

    if (config.core?.length) {
      const coreZone = content.createDiv({ cls: "resource-detail-zone" });
      this.createResourceSubheading(coreZone, "heart", "Core characteristics");
      const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
      config.core.forEach((item) => {
        coreList.createEl("li", { text: item });
      });
      if (config.coreNote) {
        coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
      }
    }

    const stepsZone = content.createDiv({ cls: "resource-detail-zone" });
    this.createResourceSubheading(stepsZone, "list-ordered", config.stepsTitle || "Steps");

    if (config.stepGroups?.length) {
      const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
      config.stepGroups.forEach((group) => {
        const headingClass = /^ACT\\s+/i.test(group.title)
          ? "resource-detail-step-heading-plain"
          : "resource-detail-step-heading";
        const heading = stepsList.createDiv({ cls: headingClass });
        heading.createSpan({ text: group.title });
        const groupBox = stepsList.createDiv({ cls: "resource-detail-step-group" });
        group.items.forEach((item) => {
          this.renderCalloutItem(groupBox, item);
        });
      });
    } else if (config.numberedSteps) {
      const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
      let currentGroup = null;
      config.steps.forEach((item) => {
        if (/^ACT\s+[IVX]+\s+—\s+/i.test(item)) {
          const heading = stepsList.createDiv({ cls: "resource-detail-step-heading" });
          heading.createSpan({ text: item });
          currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
          return;
        }
        if (!currentGroup) {
          currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
        }
        this.renderCalloutItem(currentGroup, item);
      });
    } else {
      const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
      config.steps.forEach((item) => {
        this.renderCalloutItem(stepsList, item);
      });
    }

    if (config.why) {
      const whyZone = content.createDiv({ cls: "resource-detail-zone" });
      this.createResourceSubheading(whyZone, "chart-spline", config.whyTitle || "Why this works");
      whyZone.createDiv({ cls: "resource-detail-paragraph", text: config.why });
    }

    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "layout-grid");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });

    const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    config.examples.forEach((example) => {
      const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }

  renderAboutSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "ABOUT" });

    const aboutItems = [
      { icon: "heart", label: "Support", action: () => this.showDonateView() },
      { icon: "mail", label: "Contact", action: () => this.showContactView() }
    ];

    aboutItems.forEach(item => {
      const aboutItem = section.createDiv({ cls: "writer-tools-item" });
      const iconSpan = aboutItem.createSpan({ cls: "writer-tools-item-icon" });
      setIcon(iconSpan, item.icon);
      aboutItem.createSpan({ cls: "writer-tools-item-text", text: item.label });

      aboutItem.addEventListener("click", item.action);
    });
  }

  showDonateView() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-donate-view");

    const header = container.createDiv({ cls: "donate-view-header" });
    const headerLeft = header.createDiv({ cls: "donate-view-header-left" });
    const headerHeart = headerLeft.createSpan({ cls: "donate-view-header-heart" });
    setIcon(headerHeart, "heart");
    headerLeft.createSpan({ cls: "donate-view-header-title", text: "Support" });
    const backButton = header.createEl("button", { cls: "donate-view-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitDonateView());

    const content = container.createDiv({ cls: "donate-view-content" });
    const card = content.createDiv({ cls: "donate-view-card" });
    const cardHeader = card.createDiv({ cls: "donate-view-card-header" });
    const cardIcon = cardHeader.createSpan({ cls: "donate-view-card-icon" });
    setIcon(cardIcon, "coffee");
    cardHeader.createSpan({ cls: "donate-view-card-title", text: "Support Folio development" });
    card.createDiv({
      cls: "donate-view-card-text",
      text: "If this plugin saves you time or helps your writing, consider supporting its development."
    });
    const donateBtn = card.createEl("button", { cls: "donate-view-button", text: "Buy Me a Coffee" });
    donateBtn.addEventListener("click", () => {
      window.open("https://buymeacoffee.com/danielgarvire", "_blank");
    });
  }

  exitDonateView() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-donate-view");
    this.onOpen();
  }

  showContactView() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-contact-view");

    const header = container.createDiv({ cls: "contact-view-header" });
    const headerIcon = header.createSpan({ cls: "contact-view-header-icon" });
    setIcon(headerIcon, "mail");
    header.createSpan({ cls: "contact-view-header-title", text: "Contact" });

    const backButton = header.createEl("button", { cls: "contact-view-back", text: "Back" });
    backButton.addEventListener("click", () => this.exitContactView());

    const content = container.createDiv({ cls: "contact-view-content" });
    content.createDiv({
      cls: "contact-view-text",
      text: "Follow for updates and writing resources:"
    });

    const links = [
      { icon: "github", label: "@danigarvire", url: "https://github.com/danigarvire" },
      { icon: "youtube", label: "@danielgarvire", url: "https://www.youtube.com/@danielgarvire" },
      { icon: "instagram", label: "@danigarvire", url: "https://www.instagram.com/danigarvire" }
    ];

    const list = content.createDiv({ cls: "contact-view-list" });
    links.forEach((item) => {
      const row = list.createDiv({ cls: "contact-view-item" });
      const icon = row.createSpan({ cls: "contact-view-item-icon" });
      setIcon(icon, item.icon);
      const text = row.createDiv({ cls: "contact-view-item-text" });
      text.createDiv({ cls: "contact-view-item-title", text: item.label });
      text.createDiv({ cls: "contact-view-item-subtext", text: item.url });
      row.addEventListener("click", () => window.open(item.url, "_blank"));
    });
  }

  exitContactView() {
    const container = this.containerEl.children[1];
    container.removeClass("folio-contact-view");
    this.onOpen();
  }

  async onClose() {
    // Cleanup if needed
  }
}
