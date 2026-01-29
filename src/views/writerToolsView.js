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
  }

  getViewType() {
    return WRITER_TOOLS_VIEW_TYPE;
  }

  getDisplayText() {
    return "Writer Tools";
  }

  getIcon() {
    return "drafting-compass";
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
    this.renderFocusModeSection();
    this.renderExportSection();
    this.renderResourcesSection();
    this.renderAboutSection();
  }

  renderFocusModeSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "FOCUS MODE" });

    const focusItem = section.createDiv({ cls: "writer-tools-item" });
    const iconSpan = focusItem.createSpan({ cls: "writer-tools-item-icon" });
    setIcon(iconSpan, "circle-dot");
    focusItem.createSpan({ cls: "writer-tools-item-text", text: "Enter focus mode" });

    focusItem.addEventListener("click", () => {
      this.showFocusMode();
    });
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

  renderExportSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "EXPORT ASSISTANT" });

    const exportItem = section.createDiv({ cls: "writer-tools-item" });
    const iconSpan = exportItem.createSpan({ cls: "writer-tools-item-icon" });
    setIcon(iconSpan, "file-stack");
    exportItem.createSpan({ cls: "writer-tools-item-text", text: "Consolidate document" });

    exportItem.addEventListener("click", () => {
      // TODO: Implement consolidate document functionality
      console.log("Consolidate document clicked");
    });
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
        // TODO: Implement resource functionality
        console.log(`${resource.label} clicked`);
      });
    });
  }

  renderAboutSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "ABOUT" });

    const aboutItems = [
      { icon: "heart", label: "Donate", action: () => window.open("https://github.com/sponsors", "_blank") },
      { icon: "mail", label: "Contact", action: () => window.open("mailto:contact@example.com", "_blank") }
    ];

    aboutItems.forEach(item => {
      const aboutItem = section.createDiv({ cls: "writer-tools-item" });
      const iconSpan = aboutItem.createSpan({ cls: "writer-tools-item-icon" });
      setIcon(iconSpan, item.icon);
      aboutItem.createSpan({ cls: "writer-tools-item-text", text: item.label });

      aboutItem.addEventListener("click", item.action);
    });
  }

  async onClose() {
    // Cleanup if needed
  }
}
