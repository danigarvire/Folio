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
    headerTitle.createSpan({ cls: "writer-tools-build-tag", text: "build: icons-verify" });

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
    exportItem.addEventListener("click", () => {
      // TODO: Implement consolidate document functionality
      console.log("Consolidate document clicked");
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
      { label: "The Hero", icon: "sword" },
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
    header.createSpan({ cls: "resource-detail-title", text: title });
    const backButton = header.createEl("button", { cls: "resource-detail-back", text: "Back" });
    backButton.addEventListener("click", () => {
      container.removeClass("folio-resource-detail");
      onBack();
    });

    container.createDiv({
      cls: "resource-detail-placeholder",
      text: "Content coming soon."
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
