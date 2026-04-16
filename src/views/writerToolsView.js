/**
 * Writer Tools View - Panel de herramientas para escritura
 */

import { ItemView, Modal, Notice, setIcon } from 'obsidian';
import { ConfirmModal } from '../modals/confirmModal.js';
import { FocusModeStatsModal } from '../modals/focusModeStatsModal.js';
import { renderArchetypeDetail, renderCharacterArcDetail, renderPitfallsDetail, renderTipsDetail, renderTechniqueDetail, renderStructureDetail } from '../writer-tools/referenceDetails.js';
import { ui, label, TECHNIQUE_DATA, TIPS_DATA, PITFALLS_DATA } from '../writer-tools/resourcesI18n.js';

/**
 * @typedef {Object} ExportPdfSettings
 * @property {string} pageSize
 * @property {{ include: boolean, imagePath: string, title: PdfCoverTextStyle, subtitle: PdfCoverTextStyle, author: PdfCoverTextStyle }} cover
 * @property {{ enabled: boolean, left: string, center: string, right: string, fontSize: number }} header
 * @property {{ enabled: boolean, left: string, center: string, right: string, fontSize: number }} footer
 * @property {{ enabled: boolean, title: string, maxHeadingLevel: number, fontStyle: string, fontSize: number, lineHeight: number, indentation: number, pageBreakAfter: boolean }} toc
 * @property {{ applyCssClasses: boolean, fontFamily: string, fontSize: number, lineHeight: number, margins: { top: number, right: number, bottom: number, left: number }, bleed: number, capitalizeHeadings: boolean, includePageNumbers: boolean }} layout
 * @property {{ mode: string, rules: Array<{ path: string, kind: string, include: boolean }> }} content
 */

/**
 * @typedef {Object} PdfCoverTextStyle
 * @property {string} text
 * @property {number} size
 * @property {string} color
 * @property {string} weight
 * @property {string} style
 */

export const WRITER_TOOLS_VIEW_TYPE = "folio-writer-tools";

export class WriterToolsView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.focusModeActive = false;
    this.focusSessionDurationMinutes = 25;
    this.focusSessionDurationSeconds = this.focusSessionDurationMinutes * 60;
    this.timerSeconds = this.focusSessionDurationSeconds;
    this.timerRunning = false;
    this.timerInterval = null;
    this.focusSessionState = "idle";
    this.focusSessionStartedAt = null;
    this.focusPauseStartWords = null;
    this.sessionStartWords = null;
    this.quietWorkspaceActive = false;
    this.restoreLeftSidebarAfterFocus = false;
    this.focusSetupExpanded = false;
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
    this.exportProject = null;
    this.exportMeta = null;
    this.exportConfig = null;
    this.pdfSettings = null;
    this.pdfPreviewContainer = null;
    this.pdfSettingsContainer = null;
    this.pdfPreviewTimeout = null;
    this.pdfSaveTimeout = null;
    this.pdfSettingsLayoutRoot = null;
    this.pdfSettingsControlsEl = null;
    this.coverDesignOpen = false;
    this.coverDesignDraft = null;
    this.advancedLayoutOpen = false;
    this.pdfPreviewRenderToken = 0;
    this.pdfPreviewScaleObserver = null;
    this.pdfPreviewUrl = null;
    this.pdfInlinePreviewContainer = null;
    this.pdfPreviewWebview = null;
    this.pdfExportStateUpdater = null;
    this.isPdfExporting = false;
    this.pdfExportAbortController = null;
    this.resourceLanguage = 'en';
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
    // Load persisted language preference
    this.resourceLanguage = this.plugin.settings?.resourceLanguage || 'en';

    const container = this.containerEl.children[1];
    container.empty();
    container.removeClass("folio-focus-mode");
    container.removeClass("folio-export-settings");
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

  async onClose() {
    this.setQuietWorkspace(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  renderToolsSection() {
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "TOOLS" });

    const focusItem = section.createDiv({ cls: "writer-tools-item" });
    focusItem.setAttr("role", "button");
    focusItem.setAttr("tabindex", "0");
    focusItem.setAttr("aria-label", "Open Focus mode for a quiet timed writing session");
    const focusIcon = focusItem.createSpan({ cls: "writer-tools-item-icon" });
    setIcon(focusIcon, "circle-dot");
    focusItem.createSpan({ cls: "writer-tools-item-text", text: "Focus mode" });
    const openFocusMode = () => this.showFocusMode();
    focusItem.addEventListener("click", openFocusMode);
    focusItem.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openFocusMode();
      }
    });

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
    const container = this.containerEl.children[1];
    container.empty();
    container.removeClass("folio-writer-tools");
    container.removeClass("folio-export-settings");
    container.addClass("folio-focus-mode");

    // Get current project
    const project = this.plugin.activeProject || this.plugin.activeBook;
    if (!project) {
      this.focusModeActive = false;
      this.focusModeProject = null;
      const empty = container.createDiv({ cls: "focus-mode-empty-state" });
      const emptyIcon = empty.createSpan({ cls: "focus-mode-empty-icon" });
      setIcon(emptyIcon, "circle-dot");
      empty.createDiv({ cls: "focus-mode-empty-title", text: "Choose a project first" });
      empty.createDiv({
        cls: "focus-mode-empty-subtitle",
        text: "Focus Mode tracks words inside the active Folio project."
      });
      const backBtn = empty.createEl("button", { cls: "focus-mode-btn-secondary", text: "Back to tools" });
      backBtn.addEventListener("click", () => this.closeFocusModeView());
      return;
    }

    this.focusModeActive = true;

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

    if (!cfg && this.plugin.configService?.createDefaultConfig) {
      const fallbackAuthor = Array.isArray(meta?.author) ? meta.author[0] : (meta?.author || "");
      cfg = this.plugin.configService.createDefaultConfig(meta?.title || project?.name || "Untitled", fallbackAuthor);
    }

    this.exportProject = project;
    this.exportMeta = meta;
    this.exportConfig = cfg || {};
    this.exportFormat = this.exportFormat || this.exportConfig?.export?.default_format || "pdf";
    this.pdfSettings = this.getPdfSettings(this.exportMeta, this.exportConfig);

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
    formatLabel.createDiv({ cls: "export-settings-section-title", text: "Export format" });
    const formatGrid = formatSection.createDiv({ cls: "export-settings-format-grid" });

    const formats = [
      { id: "pdf", title: "PDF", subtitle: "Portable document format", icon: "file-text" }
    ];

    const pdfLauncher = content.createDiv({ cls: "export-settings-section" });
    const pdfLauncherLabel = pdfLauncher.createDiv({ cls: "export-settings-section-label" });
    pdfLauncherLabel.createDiv({ cls: "export-settings-section-accent" });
    const pdfLauncherTitle = pdfLauncherLabel.createDiv({ cls: "export-settings-section-title", text: "PDF Settings" });
    const pdfLauncherBody = pdfLauncher.createDiv({ cls: "export-settings-card" });
    const pdfLauncherText = pdfLauncherBody.createDiv({
      cls: "export-settings-card-text",
      text: "Open PDF settings to customize layout, cover and font."
    });
    const pdfLauncherBtn = pdfLauncherBody.createEl("button", { cls: "export-settings-btn", text: "Open Settings" });
    pdfLauncherBtn.addEventListener("click", () => this.openPdfSettingsModal());

    const statusRow = content.createDiv({ cls: "export-settings-status" });
    const statusIcon = statusRow.createSpan({ cls: "export-settings-status-icon" });
    setIcon(statusIcon, "settings");
    const statusText = statusRow.createSpan({ cls: "export-settings-status-text" });

    const refreshState = () => {
      const hasFormat = !!this.exportFormat;
      const formatLabel = hasFormat ? this.exportFormat.toUpperCase() : "PDF";
      statusText.textContent = hasFormat ? `Selected format: ${formatLabel}` : "Please choose an export format first.";

      pdfLauncherTitle.textContent = `${formatLabel} Settings`;
      pdfLauncherText.textContent = `Open ${formatLabel} settings to customize layout, cover and font.`;
    };

    formats.forEach((format) => {
      const card = formatGrid.createDiv({ cls: "export-settings-format-card" });
      const icon = card.createSpan({ cls: "export-settings-format-icon" });
      setIcon(icon, format.icon);
      card.createDiv({ cls: "export-settings-format-title", text: format.title });
      card.createDiv({ cls: "export-settings-format-subtitle", text: format.subtitle });
      card.addEventListener("click", () => {
        this.exportFormat = format.id;
        if (this.exportConfig?.export) this.exportConfig.export.default_format = format.id;
        this.queuePdfSettingsSave("format-change");
        formatGrid.querySelectorAll(".export-settings-format-card").forEach((node) => node.classList.remove("is-selected"));
        card.classList.add("is-selected");
        refreshState();
      });
      if (this.exportFormat === format.id) card.classList.add("is-selected");
    });

    refreshState();
  }

  openPdfPreviewModal() {
    if (!this.exportProject) return;
    const modal = new PdfPreviewModal(this.app, this);
    modal.open();
  }

  openPdfSettingsModal() {
    if (!this.exportProject) return;
    const modal = new PdfSettingsModal(this.app, this);
    modal.open();
  }

  async handleExportAction(options = {}) {
    if (!this.exportProject) {
      new Notice("No active project selected.");
      return false;
    }
    if (!this.validatePdfExportSettings()) {
      return false;
    }
    if (this.exportFormat === "pdf") {
      if (this.plugin?.pdfExportService?.exportProject) {
        await this.plugin.pdfExportService.exportProject(this.exportProject, this.pdfSettings, options);
        return true;
      }
      new Notice("PDF export is not wired yet. Settings are saved and preview updates are in place.");
      return false;
    }
    if (this.exportFormat === "docx") {
      this.exportFormat = "pdf";
      this.queuePdfSettingsSave("export-format-fallback");
    }
    return false;
  }

  getDefaultPdfSettings(meta) {
    const author = Array.isArray(meta?.author) ? meta.author.join(", ") : (meta?.author || "");
    const projectType = meta?.projectType || "book";
    const defaultMode = projectType === "script" || projectType === "film" ? "scriptOnly" : "allIncluded";
    return {
      pageSize: "A4",
      cover: {
        include: true,
        imagePath: "",
        imageDataUrl: "",
        title: { text: meta?.title || "Untitled", size: 32, color: "#111111", weight: "Bold", style: "Normal" },
        subtitle: { text: meta?.subtitle || "", size: 18, color: "#444444", weight: "Regular", style: "Normal" },
        author: { text: author || "", size: 14, color: "#555555", weight: "Regular", style: "Normal" }
      },
      header: {
        enabled: false,
        left: "{{title}}",
        center: "",
        right: "{{author}}",
        fontSize: 11
      },
      footer: {
        enabled: true,
        left: "",
        center: "",
        right: "{{pageNumber}}/{{totalPages}}",
        fontSize: 10
      },
      toc: {
        enabled: false,
        title: "Table of Contents",
        maxHeadingLevel: 3,
        fontStyle: "Serif",
        fontSize: 12,
        lineHeight: 1.4,
        indentation: 12,
        pageBreakAfter: true
      },
      layout: {
        applyCssClasses: true,
        fontFamily: "Courier Prime, \"Courier New\", Courier, monospace",
        fontSize: 12,
        lineHeight: 1.45,
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        bleed: 0,
        capitalizeHeadings: true,
        includePageNumbers: true
      },
      content: {
        mode: defaultMode,
        rules: []
      }
    };
  }

  mergePdfSettings(base, incoming) {
    if (!incoming) return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(incoming).forEach((key) => {
      const next = incoming[key];
      if (next === undefined) return;
      if (next && typeof next === "object" && !Array.isArray(next)) {
        out[key] = this.mergePdfSettings(base ? base[key] : {}, next);
      } else {
        out[key] = next;
      }
    });
    return out;
  }

  getPdfSettings(meta, cfg) {
    const defaults = this.getDefaultPdfSettings(meta);
    const existing = cfg?.export?.pdf || {};
    const merged = this.mergePdfSettings(defaults, existing);
    if (merged?.toc) merged.toc.enabled = false;
    if (!merged.content) {
      merged.content = { mode: defaults.content.mode, rules: [] };
    }
    if (!Array.isArray(merged.content.rules)) merged.content.rules = [];
    return merged;
  }

  queuePdfSettingsSave(reason) {
    if (this.pdfSaveTimeout) window.clearTimeout(this.pdfSaveTimeout);
    this.pdfSaveTimeout = window.setTimeout(async () => {
      if (!this.exportProject || !this.plugin.configService) return;
      const cfg = this.exportConfig || {};
      cfg.export = cfg.export || {};
      cfg.export.pdf = this.pdfSettings;
      cfg.export.include_cover = !!this.pdfSettings?.cover?.include;
      await this.plugin.configService.saveProjectConfig(this.exportProject, cfg);
      this.exportConfig = cfg;
    }, 250);
  }

  getExportTreeNodes() {
    const tree = this.exportConfig?.structure?.tree || [];
    const nodes = [];
    const walk = (node, depth) => {
      if (!node) return;
      nodes.push({ node, depth });
      const children = [...(node.children || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      children.forEach((child) => walk(child, depth + 1));
    };
    [...tree].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((node) => walk(node, 0));
    return nodes;
  }

  isExportableContentNode(node) {
    if (!node || node.exclude || !node.path) return false;
    const path = String(node.path).toLowerCase();
    return node.type === "file" || node.type === "canvas" || path.endsWith(".md") || path.endsWith(".canvas");
  }

  getIncludedExportableNodes(nodes = this.getExportTreeNodes()) {
    return nodes
      .filter(({ node }) => this.isExportableContentNode(node))
      .filter(({ node }) => this.resolveContentInclusion(node.path, node.type));
  }

  getPdfExportReadiness() {
    if (!this.exportProject) {
      return { canExport: false, message: "Select a project before exporting." };
    }
    if (this.app?.isMobile) {
      return { canExport: false, message: "PDF export is available on desktop only." };
    }

    const nodes = this.getExportTreeNodes();
    const exportableNodes = nodes.filter(({ node }) => this.isExportableContentNode(node));
    const includedNodes = this.getIncludedExportableNodes(nodes);
    if (exportableNodes.length > 0 && includedNodes.length === 0) {
      return { canExport: false, message: "Select at least one file to export." };
    }
    if (exportableNodes.length > 0) {
      const saveHint = this.getPdfSaveHint();
      return {
        canExport: true,
        message: `${includedNodes.length} ${includedNodes.length === 1 ? "file" : "files"} selected. ${saveHint}`
      };
    }
    return { canExport: true, message: `Folio will scan the project folder when export starts. ${this.getPdfSaveHint()}` };
  }

  getPdfSaveHint() {
    if (this.plugin?.pdfExportService?.getDefaultSaveHint) {
      return this.plugin.pdfExportService.getDefaultSaveHint(this.exportProject, this.exportMeta);
    }
    return "Save dialog opens next.";
  }

  updatePdfExportState() {
    if (typeof this.pdfExportStateUpdater === "function") {
      this.pdfExportStateUpdater(this.getPdfExportReadiness());
    }
  }

  validatePdfExportSettings(notify = true) {
    const state = this.getPdfExportReadiness();
    if (!state.canExport && notify) {
      new Notice(state.message);
    }
    return state.canExport;
  }

  requestPdfPreviewUpdate(reason) {
    if (this.pdfPreviewTimeout) window.clearTimeout(this.pdfPreviewTimeout);
    this.pdfPreviewTimeout = window.setTimeout(() => {
      if (!this.pdfPreviewContainer) {
        console.info("PDF preview pending:", reason);
        return;
      }
      this.renderPdfPreview(this.pdfPreviewContainer);
    }, 300);
  }

  notifyTocSettingsChanged() {
    // Stub hook for a TOC generator pipeline if available.
    if (this.plugin?.pdfExportService?.updateTocSettings) {
      this.plugin.pdfExportService.updateTocSettings(this.pdfSettings?.toc);
    }
  }

  async renderPdfPreview(container) {
    if (!container) return;
    if (container.childElementCount > 3) {
      container.empty();
    }
    container.empty();
    const card = container.createDiv({ cls: "pdf-preview-card" });
    card.createDiv({ cls: "pdf-preview-title", text: "Live PDF preview" });
    const frameWrap = card.createDiv({ cls: "pdf-preview-frame-wrap" });
    const loadingMeta = card.createDiv({ cls: "pdf-preview-meta", text: "Rendering preview..." });

    const token = ++this.pdfPreviewRenderToken;
    const service = this.plugin?.pdfExportService;
    if (!service?.buildExportHtml) {
      loadingMeta.remove();
      card.createDiv({ cls: "pdf-preview-meta", text: "Preview unavailable." });
      return;
    }
    try {
      const size = this.pdfSettings?.pageSize || "A4";
      const widthIn = {
        A4: 8.27,
        A5: 5.83,
        A3: 11.69,
        Letter: 8.5,
        Legal: 8.5,
        Tabloid: 11
      };
      const inches = widthIn[size] || widthIn.A4;
      const baseWidth = inches * 96;
      const pageSize = this.pdfSettings?.pageSize || "A4";
      const ratios = {
        A4: 297 / 210,
        A5: 210 / 148,
        A3: 420 / 297,
        Letter: 11 / 8.5,
        Legal: 14 / 8.5,
        Tabloid: 17 / 11
      };
      const ratio = ratios[pageSize] || ratios.A4;
      frameWrap.style.aspectRatio = `1 / ${ratio}`;
      frameWrap.style.setProperty("--pdf-aspect", String(ratio));
      const html = await service.buildExportHtml(this.exportProject, this.exportMeta, this.exportConfig, this.pdfSettings);
      if (token !== this.pdfPreviewRenderToken) return;
      loadingMeta.remove();

      let pdfDataUrl = "";
      if (service?.renderHtmlToPdf && !this.app?.isMobile) {
        const pdfBuffer = await service.renderHtmlToPdf(html, this.pdfSettings, this.exportMeta);
        if (token !== this.pdfPreviewRenderToken) return;
        if (pdfBuffer) {
          const base64 = Buffer.from(pdfBuffer).toString("base64");
          pdfDataUrl = `data:application/pdf;base64,${base64}`;
        }
      }
      const pdfPreviewUrl = pdfDataUrl
        ? `${pdfDataUrl}#page=1&zoom=page-fit&navpanes=0`
        : "";

      const encoded = encodeURIComponent(html);
      const dataUrl = `data:text/html;charset=utf-8,${encoded}`;
      const canUseWebview = typeof document !== "undefined" && typeof document.createElement === "function" && !this.app?.isMobile;
      if (canUseWebview) {
        let webview = this.pdfPreviewWebview;
        if (!webview || !frameWrap.contains(webview)) {
          frameWrap.empty();
          webview = document.createElement("webview");
          webview.className = "pdf-preview-webview";
          webview.setAttribute("allowpopups", "false");
          webview.setAttribute("disableguestresize", "true");
          webview.nodeintegration = true;
          frameWrap.appendChild(webview);
          this.pdfPreviewWebview = webview;
        }
        webview.src = pdfPreviewUrl || dataUrl;
        return;
      }

      frameWrap.empty();
      const frame = frameWrap.createEl("iframe", { cls: "pdf-preview-frame" });
      frame.setAttr("loading", "lazy");
      if (pdfPreviewUrl) {
        frame.src = pdfPreviewUrl;
      } else {
        frame.srcdoc = html;
      }
    } catch (e) {
      console.warn("Preview render failed", e);
      loadingMeta.remove();
      card.createDiv({ cls: "pdf-preview-meta", text: "Preview failed to render." });
    }
  }


  renderPdfSettingsPanel(container) {
    if (!container) return;
    let layout = this.pdfSettingsLayoutRoot;
    let controls = this.pdfSettingsControlsEl;
    if (!layout || !container.contains(layout)) {
      container.empty();
      layout = container.createDiv({ cls: "pdf-settings-layout" });
      let previewPane = this.pdfInlinePreviewContainer;
      if (!previewPane) {
        previewPane = document.createElement("div");
        previewPane.className = "pdf-settings-preview-pane";
        this.pdfInlinePreviewContainer = previewPane;
      } else {
        previewPane.classList.add("pdf-settings-preview-pane");
      }
      layout.appendChild(previewPane);
      controls = layout.createDiv({ cls: "pdf-settings-controls" });
      this.pdfSettingsLayoutRoot = layout;
      this.pdfSettingsControlsEl = controls;
    } else {
      controls.empty();
    }
    const previewPane = this.pdfInlinePreviewContainer;

    this.pdfInlinePreviewContainer = previewPane;
    if (this.pdfPreviewContainer !== previewPane) {
      this.pdfPreviewContainer = previewPane;
    }
    this.renderPdfPreview(previewPane);

    const title = controls.createDiv({ cls: "pdf-settings-header-row" });
    title.createSpan({ cls: "pdf-settings-header-accent" });
    title.createSpan({ cls: "pdf-settings-header-title", text: "PDF setup" });

    this.renderPdfSettingsOverview(controls);
    this.renderContentSelectionSection(controls);
    this.renderCoverSection(controls);
    this.renderFolioSettingsSection(controls);
    this.updatePdfExportState();

    const actions = controls.createDiv({ cls: "pdf-settings-footer" });
    const resetBtn = actions.createEl("button", { cls: "pdf-settings-reset", text: "Reset to Defaults" });
    resetBtn.addEventListener("click", () => {
      this.pdfSettings = this.getDefaultPdfSettings(this.exportMeta);
      this.queuePdfSettingsSave("reset-defaults");
      this.requestPdfPreviewUpdate("reset-defaults");
      this.renderPdfSettingsPanel(container);
    });
  }

  renderPdfSettingsOverview(container) {
    const nodes = this.getExportTreeNodes();
    const exportableCount = nodes.filter(({ node }) => this.isExportableContentNode(node)).length;
    const includedCount = this.getIncludedExportableNodes(nodes).length;
    const projectTitle = this.exportMeta?.title || this.exportProject?.name || "Untitled project";
    const mode = this.pdfSettings?.content?.mode || "allIncluded";
    const modeLabel = this.getContentModeLabel(mode);
    const coverText = this.pdfSettings?.cover?.include ? "Cover on" : "Cover off";
    const pageSize = this.pdfSettings?.pageSize || "A4";

    const overview = container.createDiv({ cls: "pdf-export-overview" });
    const copy = overview.createDiv({ cls: "pdf-export-overview-copy" });
    copy.createDiv({ cls: "pdf-export-overview-title", text: projectTitle });
    const detail = exportableCount > 0
      ? `${modeLabel} / ${includedCount} of ${exportableCount} files / ${pageSize} / ${coverText}`
      : `${modeLabel} / Project folder scan / ${pageSize} / ${coverText}`;
    copy.createDiv({ cls: "pdf-export-overview-detail", text: detail });
    const badge = overview.createDiv({ cls: "pdf-export-overview-badge", text: "PDF" });
    if (exportableCount > 0 && includedCount === 0) {
      overview.addClass("has-warning");
      badge.textContent = "Needs content";
    }
  }

  renderCoverSection(container) {
    const card = this.createPdfCard(container, "Cover", "palette", "Add a simple title page before the manuscript.");

    const toggleRow = this.createPdfRow(card, "Include cover page", "Uses the project title, subtitle, author, and optional artwork.");
    const toggle = this.createPdfToggle(toggleRow.control, !!this.pdfSettings.cover.include, (checked) => {
      this.pdfSettings.cover.include = checked;
      if (!checked) {
        this.coverDesignOpen = false;
        this.coverDesignDraft = null;
      }
      this.queuePdfSettingsSave("cover-toggle");
      this.requestPdfPreviewUpdate("cover-toggle");
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });

    const actionRow = this.createPdfRow(card, "Cover design", "Edit the cover text, artwork, and typography.");
    const customizeBtn = actionRow.control.createEl("button", { cls: "pdf-settings-button", text: this.coverDesignOpen ? "Hide editor" : "Edit cover" });
    if (!this.pdfSettings.cover.include) {
      customizeBtn.setAttr("disabled", "true");
      actionRow.row.addClass("is-muted");
    }
    customizeBtn.addEventListener("click", () => {
      if (!this.pdfSettings.cover.include) return;
      this.coverDesignOpen = !this.coverDesignOpen;
      if (this.coverDesignOpen) {
        this.coverDesignDraft = JSON.parse(JSON.stringify(this.pdfSettings.cover));
      }
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });

    if (!this.pdfSettings.cover.include) {
      card.createDiv({ cls: "pdf-settings-note", text: "Turn on the cover page to edit its design." });
    }

    if (this.coverDesignOpen) {
      this.renderCoverDesignPanel(card);
    }
  }

  renderContentSelectionSection(container) {
    const card = this.createPdfCard(container, "Content", "layers", "Choose what goes into the PDF before changing layout.");

    const projectType = this.exportMeta?.projectType || this.exportConfig?.basic?.projectType || "book";
    const isScriptProject = projectType === "script" || projectType === "film";
    const currentMode = this.pdfSettings.content?.mode || "allIncluded";
    const modeRow = this.createPdfRow(card, "Export scope", this.getContentModeHelper(currentMode, isScriptProject));
    const modeOptions = [
      { label: isScriptProject ? "Script draft only" : "Chapter draft only", value: "scriptOnly" },
      { label: "Everything in project", value: "allIncluded" },
      { label: "Choose files manually", value: "custom" }
    ];
    const modeSelect = this.createPdfSelect(
      modeRow.control,
      modeOptions,
      currentMode,
      (value) => {
        const previousMode = this.pdfSettings.content?.mode || "allIncluded";
        if (value === "custom" && previousMode !== "custom") {
          this.seedCustomContentRulesFromMode(previousMode);
        }
        this.pdfSettings.content.mode = value;
        this.queuePdfSettingsSave("content-mode");
        this.requestPdfPreviewUpdate("content-mode");
        this.renderPdfSettingsPanel(this.pdfSettingsContainer);
      }
    );
    modeSelect.addClass("pdf-select-wide");

    const nodes = this.getExportTreeNodes();
    const exportableNodes = nodes.filter(({ node }) => this.isExportableContentNode(node));
    const includedNodes = this.getIncludedExportableNodes(nodes);
    this.renderContentSummary(card, exportableNodes.length, includedNodes.length, currentMode);

    const listLabel = card.createDiv({
      cls: "pdf-content-list-label",
      text: currentMode === "custom" ? "Choose files and folders" : "Included by current scope"
    });
    const list = card.createDiv({ cls: "pdf-content-list" });
    if (!nodes.length) {
      list.createDiv({ cls: "pdf-content-empty", text: "No saved project structure was found. Folio will scan the project folder when export starts." });
      return;
    }

    nodes.forEach(({ node, depth }) => {
      const row = list.createDiv({ cls: "pdf-content-row" });
      row.style.paddingLeft = `${depth * 14}px`;
      const checkbox = row.createEl("input", { type: "checkbox" });
      const included = this.resolveContentRowInclusion(node, nodes);
      checkbox.checked = included;
      checkbox.disabled = currentMode !== "custom";
      if (!included) row.addClass("is-excluded");
      if (currentMode !== "custom") row.addClass("is-readonly");
      checkbox.addEventListener("change", () => {
        this.updateContentRule(node.path, node.type, checkbox.checked);
        this.renderPdfSettingsPanel(this.pdfSettingsContainer);
      });
      const label = row.createDiv({ cls: "pdf-content-label", text: node.title || node.path || "Untitled" });
      if (node.type === "group") label.addClass("is-folder");
    });
  }

  renderCoverDesignPanel(container) {
    if (!this.coverDesignDraft) {
      this.coverDesignDraft = JSON.parse(JSON.stringify(this.pdfSettings.cover));
      this.normalizeCoverDesignColors(this.coverDesignDraft);
    }
    const panel = container.createDiv({ cls: "pdf-cover-design" });
    panel.createDiv({ cls: "pdf-cover-design-title", text: "Cover design" });

    const preview = panel.createDiv({ cls: "pdf-cover-preview" });
    const renderCoverPreview = () => {
      const imageUrl = this.coverDesignDraft?.imageDataUrl || this.resolveCoverImageUrl(this.coverDesignDraft?.imagePath);
      preview.toggleClass("has-image", !!imageUrl);
      if (imageUrl) {
        preview.style.backgroundImage = `url("${imageUrl}")`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
      } else {
        preview.style.backgroundImage = "";
      }
      preview.empty();
      const textWrap = preview.createDiv({ cls: "pdf-cover-preview-text" });
      const titleEl = textWrap.createDiv({ cls: "pdf-cover-preview-title", text: this.coverDesignDraft?.title?.text || "Title" });
      this.applyCoverTextStyles(titleEl, this.coverDesignDraft?.title);
      if (this.coverDesignDraft?.subtitle?.text) {
        const subtitleEl = textWrap.createDiv({ cls: "pdf-cover-preview-subtitle", text: this.coverDesignDraft.subtitle.text });
        this.applyCoverTextStyles(subtitleEl, this.coverDesignDraft?.subtitle);
      }
      if (this.coverDesignDraft?.author?.text) {
        const authorEl = textWrap.createDiv({ cls: "pdf-cover-preview-author", text: this.coverDesignDraft.author.text });
        this.applyCoverTextStyles(authorEl, this.coverDesignDraft?.author);
      }
    };
    renderCoverPreview();

    const imageRow = this.createPdfRow(panel, "Cover image", "Choose an image from your computer.");
    const imageControls = imageRow.control.createDiv({ cls: "pdf-cover-image-controls" });
    const selectBtn = imageControls.createEl("button", { cls: "pdf-settings-button", text: "Select image" });
    const clearBtn = imageControls.createEl("button", { cls: "pdf-settings-button", text: "Clear" });
    const imageLabel = imageRow.control.createDiv({ cls: "pdf-cover-image-label", text: this.coverDesignDraft?.imagePath ? `Selected: ${this.coverDesignDraft.imagePath}` : "No image selected" });

    const fileInput = imageControls.createEl("input", { type: "file", attr: { accept: "image/*" } });
    fileInput.addClass("pdf-cover-file-input");
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      this.coverDesignDraft.imagePath = file.path || file.name || "";
      const displayName = this.coverDesignDraft.imagePath ? this.coverDesignDraft.imagePath.split("/").pop() : "";
      const reader = new FileReader();
      reader.onload = () => {
        this.coverDesignDraft.imageDataUrl = typeof reader.result === "string" ? reader.result : "";
        renderCoverPreview();
      };
      reader.onerror = () => {
        this.coverDesignDraft.imageDataUrl = "";
        renderCoverPreview();
      };
      reader.readAsDataURL(file);
      imageLabel.textContent = displayName ? `Selected: ${displayName}` : "No image selected";
      renderCoverPreview();
    });

    selectBtn.addEventListener("click", () => fileInput.click());
    clearBtn.addEventListener("click", () => {
      this.coverDesignDraft.imagePath = "";
      this.coverDesignDraft.imageDataUrl = "";
      imageLabel.textContent = "No image selected";
      renderCoverPreview();
    });

    const createCoverTextRow = (label, key) => {
      if (!this.coverDesignDraft[key]) {
        this.coverDesignDraft[key] = { text: "", size: 12, color: "#ffffff", weight: "Regular", style: "Normal" };
      }
      const row = this.createPdfRow(panel, label);
      row.row.addClass("pdf-cover-text-row");
      const input = row.control.createEl("input", { type: "text", cls: "pdf-text-input" });
      input.value = this.coverDesignDraft?.[key]?.text || "";
      input.addEventListener("input", () => {
        this.coverDesignDraft[key].text = input.value;
        renderCoverPreview();
      });
      const slider = this.createPdfRange(row.control, this.coverDesignDraft?.[key]?.size || 12, 10, 48, 1, (value) => {
        this.coverDesignDraft[key].size = value;
        renderCoverPreview();
      });
      slider.addClass("pdf-cover-slider");
      const color = row.control.createEl("input", { type: "color", cls: "pdf-color-input" });
      color.value = this.coverDesignDraft?.[key]?.color || "#ffffff";
      color.addEventListener("input", () => {
        this.coverDesignDraft[key].color = color.value;
        renderCoverPreview();
      });
      const weight = this.createPdfSelect(row.control, ["Regular", "Bold"], this.coverDesignDraft?.[key]?.weight || "Regular", (value) => {
        this.coverDesignDraft[key].weight = value;
        renderCoverPreview();
      });
      weight.addClass("pdf-select-compact");
      const style = this.createPdfSelect(row.control, ["Normal", "Italic"], this.coverDesignDraft?.[key]?.style || "Normal", (value) => {
        this.coverDesignDraft[key].style = value;
        renderCoverPreview();
      });
      style.addClass("pdf-select-compact");
    };

    createCoverTextRow("Title", "title");
    createCoverTextRow("Subtitle", "subtitle");
    createCoverTextRow("Author", "author");

    const actions = panel.createDiv({ cls: "pdf-cover-actions" });
    const cancelBtn = actions.createEl("button", { cls: "pdf-settings-button", text: "Cancel" });
    const applyBtn = actions.createEl("button", { cls: "pdf-settings-button is-primary", text: "Apply cover" });
    cancelBtn.addEventListener("click", () => {
      this.coverDesignOpen = false;
      this.coverDesignDraft = null;
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });
    applyBtn.addEventListener("click", () => {
      if (this.coverDesignDraft) {
        this.pdfSettings.cover = JSON.parse(JSON.stringify(this.coverDesignDraft));
      }
      this.coverDesignOpen = false;
      this.coverDesignDraft = null;
      this.queuePdfSettingsSave("cover-design");
      this.requestPdfPreviewUpdate("cover-design");
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });
  }

  renderFolioSettingsSection(container) {
    const card = this.createPdfCard(container, "Layout & formatting", "sliders-horizontal", "Set the reading shape of the exported document.");

    if (!this.pdfSettings.layout) {
      this.pdfSettings.layout = this.getDefaultPdfSettings(this.exportMeta).layout;
    }

    const pageRow = this.createPdfRow(card, "Page size", "Paper size for the generated PDF.");
    const pageSelect = this.createPdfSelect(pageRow.control, ["A4", "A5", "A3", "Letter", "Legal", "Tabloid"], this.pdfSettings.pageSize, (value) => {
      this.pdfSettings.pageSize = value;
      this.queuePdfSettingsSave("page-size");
      this.requestPdfPreviewUpdate("page-size");
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });
    pageSelect.addClass("pdf-select-wide");

    const fontRow = this.createPdfRow(card, "Body font", "Used for prose and screenplay text unless note CSS overrides it.");
    const fontOptions = [
      { label: "Courier Prime", value: "Courier Prime, \"Courier New\", Courier, monospace" },
      { label: "Courier New", value: "\"Courier New\", Courier, monospace" },
      { label: "Courier Final Draft", value: "\"Courier Final Draft\", \"Courier New\", Courier, monospace" },
      { label: "Courier Screenplay", value: "\"Courier Screenplay\", \"Courier New\", Courier, monospace" },
      { label: "Times New Roman", value: "\"Times New Roman\", Times, serif" },
      { label: "Georgia", value: "Georgia, serif" },
      { label: "Arial", value: "Arial, sans-serif" },
      { label: "Helvetica Neue", value: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" },
      { label: "Iosevka", value: "\"Iosevka\", \"Courier New\", monospace" },
      { label: "IBM Plex Mono", value: "\"IBM Plex Mono\", monospace" }
    ];
    const currentFont = this.pdfSettings.layout.fontFamily || "";
    if (currentFont && !fontOptions.some((opt) => opt.value === currentFont)) {
      fontOptions.unshift({ label: `Current: ${currentFont}`, value: currentFont });
    }
    const fontSelect = this.createPdfSelect(fontRow.control, fontOptions, currentFont, (value) => {
      this.pdfSettings.layout.fontFamily = value;
      this.queuePdfSettingsSave("layout-font-family");
      this.requestPdfPreviewUpdate("layout-font-family");
    });
    fontSelect.addClass("pdf-select-wide");

    const sizeRow = this.createPdfRow(card, "Font size", "Measured in points.");
    const sizeInput = sizeRow.control.createEl("input", { type: "number", cls: "pdf-text-input" });
    this.preventNumberScroll(sizeInput);
    sizeInput.min = "8";
    sizeInput.max = "24";
    sizeInput.step = "0.5";
    sizeInput.value = String(this.pdfSettings.layout.fontSize || 12);
    sizeInput.addEventListener("input", () => {
      this.pdfSettings.layout.fontSize = Number(sizeInput.value) || 12;
      this.queuePdfSettingsSave("layout-font-size");
      this.requestPdfPreviewUpdate("layout-font-size");
    });

    const lineRow = this.createPdfRow(card, "Line spacing", "Controls vertical rhythm in the exported pages.");
    const lineInput = lineRow.control.createEl("input", { type: "number", cls: "pdf-text-input" });
    this.preventNumberScroll(lineInput);
    lineInput.min = "1";
    lineInput.max = "2.5";
    lineInput.step = "0.05";
    lineInput.value = String(this.pdfSettings.layout.lineHeight || 1.45);
    lineInput.addEventListener("input", () => {
      this.pdfSettings.layout.lineHeight = Number(lineInput.value) || 1.45;
      this.queuePdfSettingsSave("layout-line-height");
      this.requestPdfPreviewUpdate("layout-line-height");
    });

    const numbersRow = this.createPdfRow(card, "Page numbers", "Adds page numbers in the footer.");
    this.createPdfToggle(numbersRow.control, this.pdfSettings.layout.includePageNumbers !== false, (checked) => {
      this.pdfSettings.layout.includePageNumbers = checked;
      this.queuePdfSettingsSave("layout-page-numbers");
      this.requestPdfPreviewUpdate("layout-page-numbers");
      this.updatePdfExportState();
    });

    const advancedRow = this.createPdfRow(card, "Advanced layout", "Margins, bleed, note CSS, and screenplay heading behavior.");
    const advancedBtn = advancedRow.control.createEl("button", {
      cls: "pdf-settings-button",
      text: this.advancedLayoutOpen ? "Hide advanced" : "Show advanced"
    });
    advancedBtn.addEventListener("click", () => {
      this.advancedLayoutOpen = !this.advancedLayoutOpen;
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });

    if (!this.advancedLayoutOpen) return;

    const advancedPanel = card.createDiv({ cls: "pdf-advanced-panel" });

    const marginRow = this.createPdfRow(advancedPanel, "Margins", "Top, right, bottom, and left spacing in millimeters.");
    const marginControls = marginRow.control.createDiv({ cls: "pdf-margin-controls" });
    const makeMarginInput = (label, key) => {
      const wrap = marginControls.createDiv({ cls: "pdf-margin-control" });
      wrap.createDiv({ cls: "pdf-margin-label", text: label });
      const input = wrap.createEl("input", { type: "number", cls: "pdf-text-input" });
      this.preventNumberScroll(input);
      input.min = "0";
      input.max = "50";
      input.step = "1";
      input.value = String(this.pdfSettings.layout.margins?.[key] ?? 20);
      input.addEventListener("input", () => {
        this.pdfSettings.layout.margins = this.pdfSettings.layout.margins || { top: 20, right: 20, bottom: 20, left: 20 };
        this.pdfSettings.layout.margins[key] = Number(input.value) || 0;
        this.queuePdfSettingsSave(`layout-margin-${key}`);
        this.requestPdfPreviewUpdate(`layout-margin-${key}`);
      });
    };
    makeMarginInput("Top", "top");
    makeMarginInput("Right", "right");
    makeMarginInput("Bottom", "bottom");
    makeMarginInput("Left", "left");

    const bleedRow = this.createPdfRow(advancedPanel, "Bleed", "Extra page edge space in millimeters.");
    const bleedInput = bleedRow.control.createEl("input", { type: "number", cls: "pdf-text-input" });
    this.preventNumberScroll(bleedInput);
    bleedInput.min = "0";
    bleedInput.max = "20";
    bleedInput.step = "0.5";
    bleedInput.value = String(this.pdfSettings.layout.bleed || 0);
    bleedInput.addEventListener("input", () => {
      this.pdfSettings.layout.bleed = Number(bleedInput.value) || 0;
      this.queuePdfSettingsSave("layout-bleed");
      this.requestPdfPreviewUpdate("layout-bleed");
    });

    const applyRow = this.createPdfRow(advancedPanel, "Use note CSS classes", "Applies cssclass/cssclasses frontmatter, including screenplay formatting.");
    const applyToggle = this.createPdfToggle(applyRow.control, this.pdfSettings.layout.applyCssClasses !== false, (checked) => {
      this.pdfSettings.layout.applyCssClasses = checked;
      this.queuePdfSettingsSave("layout-apply-css");
      this.requestPdfPreviewUpdate("layout-apply-css");
    });

    const capRow = this.createPdfRow(advancedPanel, "Uppercase screenplay headings", "Matches common screenplay export style.");
    this.createPdfToggle(capRow.control, this.pdfSettings.layout.capitalizeHeadings !== false, (checked) => {
      this.pdfSettings.layout.capitalizeHeadings = checked;
      this.queuePdfSettingsSave("layout-capitalization");
      this.requestPdfPreviewUpdate("layout-capitalization");
    });
  }

  createPdfCard(container, title, iconName, helper) {
    const card = container.createDiv({ cls: "pdf-settings-card" });
    const header = card.createDiv({ cls: "pdf-settings-card-header" });
    const icon = header.createSpan({ cls: "pdf-settings-card-icon" });
    setIcon(icon, iconName);
    const copy = header.createDiv({ cls: "pdf-settings-card-copy" });
    copy.createDiv({ cls: "pdf-settings-card-title", text: title });
    if (helper) copy.createDiv({ cls: "pdf-settings-card-helper", text: helper });
    return card;
  }

  createPdfRow(parent, label, helper) {
    const row = parent.createDiv({ cls: "pdf-settings-row" });
    const labelWrap = row.createDiv({ cls: "pdf-settings-row-label" });
    labelWrap.createDiv({ cls: "pdf-settings-row-title", text: label });
    if (helper) {
      labelWrap.createDiv({ cls: "pdf-settings-row-helper", text: helper });
    }
    const control = row.createDiv({ cls: "pdf-settings-row-control" });
    return { row, labelWrap, control };
  }

  createPdfToggle(control, checked, onChange) {
    const wrap = control.createEl("label", { cls: "pdf-toggle" });
    const input = wrap.createEl("input", { type: "checkbox" });
    const slider = wrap.createSpan({ cls: "pdf-toggle-slider" });
    input.dataset.pdfKeepEnabled = "true";
    input.checked = !!checked;
    input.addEventListener("change", () => onChange(input.checked));
    return input;
  }

  createPdfSelect(control, options, value, onChange) {
    const select = control.createEl("select", { cls: "pdf-select" });
    options.forEach((opt) => {
      const label = typeof opt === "string" ? opt : opt.label;
      const optionValue = typeof opt === "string" ? opt : opt.value;
      const option = select.createEl("option", { text: label, value: optionValue });
      if (optionValue === value) option.selected = true;
    });
    select.addEventListener("change", () => onChange(select.value));
    return select;
  }

  createPdfRange(control, value, min, max, step, onChange) {
    const input = control.createEl("input", { type: "range", cls: "pdf-slider" });
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", () => onChange(Number(input.value)));
    return input;
  }

  preventNumberScroll(input) {
    if (!input) return;
    input.addEventListener("wheel", (event) => {
      if (document.activeElement === input) {
        event.preventDefault();
      }
    }, { passive: false });
  }

  applyCoverTextStyles(el, style) {
    if (!el || !style) return;
    if (style.size) el.style.fontSize = `${style.size}px`;
    el.style.fontWeight = style.weight === "Bold" ? "700" : "400";
    el.style.fontStyle = style.style === "Italic" ? "italic" : "normal";
    if (style.color) el.style.color = style.color;
  }

  resolveCoverImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("data:") || imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(imagePath)) {
      const normalized = imagePath.replace(/\\/g, "/");
      return encodeURI(`file://${normalized}`);
    }
    const projectPath = this.exportProject?.path || "";
    const file = this.app?.metadataCache?.getFirstLinkpathDest(imagePath, projectPath);
    if (file) {
      return this.app.vault.getResourcePath(file);
    }
    return "";
  }

  normalizeCoverDesignColors(cover) {
    if (!cover || cover.imagePath) return;
    const legacyLight = new Set(["#ffffff", "#fff", "#d0d0d0", "#cfcfcf", "#cccccc"]);
    const normalize = (value) => (value || "").trim().toLowerCase();
    if (cover.title && legacyLight.has(normalize(cover.title.color))) cover.title.color = "#111111";
    if (cover.subtitle && legacyLight.has(normalize(cover.subtitle.color))) cover.subtitle.color = "#444444";
    if (cover.author && legacyLight.has(normalize(cover.author.color))) cover.author.color = "#555555";
  }

  resolveContentInclusion(path, kind, modeOverride = null, rulesOverride = null) {
    const mode = modeOverride || this.pdfSettings?.content?.mode || "allIncluded";
    const rules = rulesOverride || this.pdfSettings?.content?.rules || [];
    if (mode === "custom") {
      const rule = this.findContentRule(path, rules);
      if (rule) return !!rule.include;
      return false;
    }

    if (mode === "scriptOnly") {
      const projectType = this.getProjectType();
      const isScriptProject = projectType === "script" || projectType === "film";
      return isScriptProject ? this.isScriptContentPath(path) : this.isChapterContentPath(path);
    }
    return true;
  }

  resolveContentRowInclusion(node, allNodes = this.getExportTreeNodes()) {
    if (!node) return false;
    if (node.type !== "group") return this.resolveContentInclusion(node.path, node.type);
    const prefix = node.path ? `${node.path}/` : "";
    const descendants = allNodes.filter(({ node: child }) => {
      if (!this.isExportableContentNode(child)) return false;
      if (!prefix) return false;
      return child.path === node.path || child.path.startsWith(prefix);
    });
    if (!descendants.length) return this.resolveContentInclusion(node.path, node.type);
    return descendants.some(({ node: child }) => this.resolveContentInclusion(child.path, child.type));
  }

  getContentModeLabel(mode) {
    const projectType = this.getProjectType();
    const isScriptProject = projectType === "script" || projectType === "film";
    if (mode === "scriptOnly") return isScriptProject ? "Script draft only" : "Chapter draft only";
    if (mode === "custom") return "Manual selection";
    return "Everything in project";
  }

  getContentModeHelper(mode, isScriptProject) {
    if (mode === "custom") return "Choose exactly which files and folders appear in the PDF.";
    if (mode === "scriptOnly") return isScriptProject
      ? "Includes script-like files and skips dossier, research, and outline material."
      : "Includes chapter-like files and skips planning material.";
    return "Includes every saved project file except items marked excluded.";
  }

  renderContentSummary(card, exportableCount, includedCount, mode) {
    const summary = card.createDiv({ cls: "pdf-content-summary" });
    summary.createDiv({ cls: "pdf-content-summary-item", text: this.getContentModeLabel(mode) });
    if (exportableCount > 0) {
      summary.createDiv({
        cls: "pdf-content-summary-item",
        text: `${includedCount} of ${exportableCount} ${exportableCount === 1 ? "file" : "files"} selected`
      });
    } else {
      summary.createDiv({ cls: "pdf-content-summary-item", text: "Folder scan at export" });
    }
    if (exportableCount > 0 && includedCount === 0) {
      summary.addClass("has-warning");
    }
  }

  seedCustomContentRulesFromMode(previousMode) {
    this.pdfSettings.content = this.pdfSettings.content || { mode: "custom", rules: [] };
    const rules = [];
    this.getExportTreeNodes().forEach(({ node }) => {
      if (!this.isExportableContentNode(node)) return;
      rules.push({
        path: node.path,
        kind: node.type === "group" ? "folder" : "file",
        include: this.resolveContentInclusion(node.path, node.type, previousMode, [])
      });
    });
    this.pdfSettings.content.rules = rules;
  }

  findContentRule(path, rules) {
    if (!path) return null;
    let best = null;
    for (const rule of rules) {
      if (!rule?.path) continue;
      if (path === rule.path || path.startsWith(`${rule.path}/`)) {
        if (!best || rule.path.length > best.path.length) best = rule;
      }
    }
    return best;
  }

  updateContentRule(path, kind, include) {
    if (!path) return;
    this.pdfSettings.content = this.pdfSettings.content || { mode: "custom", rules: [] };
    if (this.pdfSettings.content.mode !== "custom") {
      this.pdfSettings.content.mode = "custom";
    }
    let rules = this.pdfSettings.content.rules || [];
    if (kind === "group") {
      rules = rules.filter((rule) => rule.path !== path && !rule.path.startsWith(`${path}/`));
    }
    const existingIndex = rules.findIndex((rule) => rule.path === path);
    const nextRule = { path, kind: kind === "group" ? "folder" : "file", include };
    if (existingIndex >= 0) rules[existingIndex] = nextRule;
    else rules.push(nextRule);
    this.pdfSettings.content.rules = rules;
    this.queuePdfSettingsSave("content-rule");
    this.requestPdfPreviewUpdate("content-rule");
  }

  isScriptContentPath(path) {
    const lower = (path || "").toLowerCase();
    if (!lower) return false;
    if (lower.includes("bible") || lower.includes("dossier") || lower.includes("research") || lower.includes("outline")) return false;
    if (lower.includes("/scenes/") || lower.startsWith("scenes/") || lower.includes("scene")) return true;
    if (lower.includes("script") || lower.includes("episode") || lower.includes("draft")) return true;
    return false;
  }

  isChapterContentPath(path) {
    const lower = (path || "").toLowerCase();
    if (!lower) return false;
    if (lower.includes("/chapters/") || lower.startsWith("chapters/")) return true;
    if (lower.includes("chapter")) return true;
    return false;
  }

  getProjectType() {
    return this.exportMeta?.projectType || this.exportConfig?.basic?.projectType || "book";
  }

  async loadFocusStats(project) {
    try {
      this.focusStats = {
        sessions: 0,
        interruptions: 0,
        currentWords: 0,
        wordGoal: 500,
        totalTimeSpent: 0,
        history: []
      };
      this.setFocusSessionDuration(25, { resetTimer: true });
      const cfg = await this.plugin.configService.loadProjectConfig(project);
      if (cfg && cfg.focusMode) {
        const durationMinutes = Number(cfg.focusMode.sessionDurationMinutes || 25);
        this.focusStats = {
          sessions: cfg.focusMode.sessions || 0,
          interruptions: cfg.focusMode.interruptions || 0,
          currentWords: Number(cfg.focusMode.currentWords || 0),
          wordGoal: cfg.focusMode.wordGoal || 500,
          totalTimeSpent: cfg.focusMode.totalTimeSpent || 0,
          history: Array.isArray(cfg.focusMode.history) ? cfg.focusMode.history : []
        };
        this.setFocusSessionDuration(Number.isFinite(durationMinutes) ? durationMinutes : 25, { resetTimer: true });
      }
      if (!this.focusStats.wordGoal) this.focusStats.wordGoal = 500;
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
        sessionDurationMinutes: this.focusSessionDurationMinutes,
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
    this.focusModeContainer = container;
    container.empty();
    ["is-ready", "is-running", "is-paused", "is-completed", "is-ended"].forEach(cls => container.removeClass(cls));

    const header = container.createDiv({ cls: "focus-mode-header" });
    const headerIcon = header.createSpan({ cls: "focus-mode-header-icon" });
    setIcon(headerIcon, "circle-dot");
    const context = this.getFocusContext(project);
    const headerCopy = header.createDiv({ cls: "focus-mode-header-copy" });
    headerCopy.createSpan({ cls: "focus-mode-header-title", text: "Focus mode" });
    const contextLine = headerCopy.createDiv({ cls: "focus-mode-header-context" });
    contextLine.createSpan({ cls: "focus-mode-header-context-label", text: "Project" });
    contextLine.createSpan({ cls: "focus-mode-header-context-value", text: context.projectName });
    if (context.fileName) {
      contextLine.createSpan({ cls: "focus-mode-header-context-separator", text: "/" });
      contextLine.createSpan({ cls: "focus-mode-header-context-value", text: context.fileName });
    }
    const headerActions = header.createDiv({ cls: "focus-mode-header-actions" });
    this.quietButton = headerActions.createEl("button", { cls: "focus-mode-header-action focus-mode-quiet-toggle", text: "Quiet" });
    this.quietButton.setAttr("aria-label", "Quiet the workspace");
    this.quietButton.addEventListener("click", () => this.toggleQuietWorkspace());
    const backButton = headerActions.createEl("button", { cls: "focus-mode-exit-button", text: "Back" });
    backButton.setAttr("aria-label", "Return to Writer Tools");
    backButton.addEventListener("click", () => this.exitFocusMode());

    const sessionPanel = container.createDiv({ cls: "focus-mode-session-panel" });

    const timerContainer = sessionPanel.createDiv({ cls: "focus-mode-timer-container" });
    const timerCircle = timerContainer.createDiv({ cls: "focus-mode-timer-circle" });
    this.timerCircle = timerCircle;
    this.timerStateLabel = timerCircle.createDiv({ cls: "focus-mode-timer-state", text: "Ready" });
    this.timerDisplay = timerCircle.createDiv({ cls: "focus-mode-timer-display" });
    this.timerDisplay.setAttr("aria-live", "polite");
    this.timerCaption = timerCircle.createDiv({ cls: "focus-mode-timer-caption", text: "25-minute session" });
    this.updateTimerDisplay();

    const statusBlock = sessionPanel.createDiv({ cls: "focus-mode-status-block" });
    this.statusText = statusBlock.createDiv({ cls: "focus-mode-status", text: "Ready when you are" });
    this.statusHint = statusBlock.createDiv({
      cls: "focus-mode-status-hint",
      text: "Start the timer, then write in your current project file."
    });

    const progress = sessionPanel.createDiv({ cls: "focus-mode-word-progress" });
    const progressHeader = progress.createDiv({ cls: "focus-mode-word-progress-header" });
    this.wordProgressLabel = progressHeader.createDiv({ cls: "focus-mode-word-progress-label" });
    this.focusProgressHint = progressHeader.createDiv({ cls: "focus-mode-word-progress-hint" });
    const progressTrack = progress.createDiv({ cls: "focus-mode-word-progress-track" });
    this.wordProgressBar = progressTrack.createDiv({ cls: "focus-mode-word-progress-fill" });

    this.setupSummary = sessionPanel.createEl("button", { cls: "focus-mode-setup-summary" });
    this.setupSummaryLabel = this.setupSummary.createSpan({ cls: "focus-mode-setup-summary-label", text: "Sprint setup" });
    this.setupSummaryValue = this.setupSummary.createSpan({ cls: "focus-mode-setup-summary-value", text: "25 min / 500 words" });
    this.setupSummary.setAttr("aria-expanded", "false");
    this.setupSummary.addEventListener("click", () => {
      if (this.hasFocusSessionInProgress()) return;
      this.focusSetupExpanded = !this.focusSetupExpanded;
      this.updateFocusControls();
    });

    this.setupPanel = sessionPanel.createDiv({ cls: "focus-mode-setup-panel" });
    const setup = this.setupPanel.createDiv({ cls: "focus-mode-setup" });
    const durationField = setup.createDiv({ cls: "focus-mode-setup-field" });
    durationField.createDiv({ cls: "focus-mode-setup-label", text: "Minutes" });
    this.durationInput = durationField.createEl("input", {
      type: "number",
      cls: "focus-mode-setup-input",
      value: this.focusSessionDurationMinutes.toString()
    });
    this.durationInput.setAttr("min", "5");
    this.durationInput.setAttr("max", "180");
    this.durationInput.setAttr("step", "5");
    this.durationInput.addEventListener("change", () => this.updateFocusSessionSetup(project));

    const goalField = setup.createDiv({ cls: "focus-mode-setup-field" });
    goalField.createDiv({ cls: "focus-mode-setup-label", text: "Word goal" });
    this.wordGoalInput = goalField.createEl("input", {
      type: "number",
      cls: "focus-mode-setup-input",
      value: String(this.focusStats.wordGoal || 500)
    });
    this.wordGoalInput.setAttr("min", "1");
    this.wordGoalInput.setAttr("max", "99999");
    this.wordGoalInput.setAttr("step", "50");
    this.wordGoalInput.addEventListener("change", () => this.updateFocusSessionSetup(project));

    const buttonsContainer = sessionPanel.createDiv({ cls: "focus-mode-buttons" });
    this.startButton = buttonsContainer.createEl("button", { cls: "focus-mode-btn-primary", text: "Start session" });
    this.startButton.addEventListener("click", () => this.toggleTimer());

    this.endButton = buttonsContainer.createEl("button", { cls: "focus-mode-btn-secondary", text: "End early" });
    this.endButton.addEventListener("click", () => this.endFocusSession());

    const statsBar = container.createDiv({ cls: "focus-mode-stats-bar" });
    this.renderFocusStats(statsBar);
    this.updateFocusControls();
  }

  getFocusContext(project) {
    const projectName = project?.name || "Current project";
    try {
      const activeFile = this.plugin.app.workspace?.getActiveFile?.();
      const projectPath = project?.path ? `${project.path}/` : "";
      if (activeFile?.path && projectPath && activeFile.path.startsWith(projectPath)) {
        const fileName = activeFile.basename || activeFile.name?.replace(/\.md$/i, "") || activeFile.path.split("/").pop();
        return { projectName, fileName };
      }
    } catch (e) {
      // Context is a nicety; Focus Mode should still open if Obsidian has no active file.
    }
    return { projectName, fileName: "" };
  }

  setFocusSessionDuration(minutes, { resetTimer = false } = {}) {
    const normalized = Math.min(180, Math.max(5, Math.round(Number(minutes || 25))));
    this.focusSessionDurationMinutes = normalized;
    this.focusSessionDurationSeconds = normalized * 60;
    if (resetTimer || !this.hasFocusSessionInProgress()) {
      this.timerSeconds = this.focusSessionDurationSeconds;
    }
  }

  updateFocusSessionSetup(project) {
    if (this.hasFocusSessionInProgress()) {
      this.updateFocusControls();
      return;
    }
    const durationValue = Number(this.durationInput?.value || this.focusSessionDurationMinutes);
    const goalValue = Number(this.wordGoalInput?.value || this.focusStats.wordGoal || 500);
    this.setFocusSessionDuration(durationValue, { resetTimer: true });
    this.focusStats.wordGoal = Math.min(99999, Math.max(1, Math.round(goalValue)));
    if (this.durationInput) this.durationInput.value = this.focusSessionDurationMinutes.toString();
    if (this.wordGoalInput) this.wordGoalInput.value = String(this.focusStats.wordGoal);
    this.updateFocusControls();
    this.refreshFocusStats();
    if (project) this.saveFocusStats(project);
  }

  updateTimerDisplay() {
    if (!this.timerDisplay) return;
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    this.timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const elapsed = Math.max(0, this.focusSessionDurationSeconds - this.timerSeconds);
    const progress = this.focusSessionDurationSeconds > 0 ? elapsed / this.focusSessionDurationSeconds : 0;
    if (this.timerCircle) {
      this.timerCircle.style.setProperty("--focus-progress", `${Math.min(360, Math.max(0, progress * 360))}deg`);
      this.timerCircle.toggleClass("is-running", this.timerRunning);
      this.timerCircle.toggleClass("is-paused", this.focusSessionState === "paused");
      this.timerCircle.toggleClass("is-completed", this.focusSessionState === "completed");
    }
    if (this.timerCaption) {
      this.timerCaption.textContent = this.focusSessionState === "running"
        ? "left in this sprint"
        : this.focusSessionState === "paused"
          ? "Paused"
          : this.focusSessionState === "completed"
            ? "Session complete"
            : `${this.focusSessionDurationMinutes}-minute session`;
    }
    this.updateFocusProgress();
  }

  toggleTimer() {
    if (this.timerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const previousState = this.focusSessionState;
    const shouldStartFresh = this.timerSeconds <= 0 || previousState === "completed" || previousState === "ended";
    if (previousState === "paused" && this.focusPauseStartWords !== null && this.sessionStartWords !== null) {
      const resumeWords = this.getActiveEditorWordCount();
      this.sessionStartWords = Math.max(0, this.sessionStartWords + (resumeWords - this.focusPauseStartWords));
      this.focusPauseStartWords = null;
    }
    this.focusSetupExpanded = false;
    this.timerRunning = true;
    this.focusSessionState = "running";
    if (shouldStartFresh) {
      this.timerSeconds = this.focusSessionDurationSeconds;
    }
    if (this.timerSeconds === this.focusSessionDurationSeconds || this.sessionStartWords === null) {
      this.focusSessionStartedAt = new Date().toISOString();
      this.sessionStartWords = this.getActiveEditorWordCount();
      this.focusStats.currentWords = 0;
      this.refreshFocusStats();
    }
    this.updateFocusControls();
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.updateTimerDisplay();
      }
      if (this.timerSeconds <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    if (!this.timerRunning) return;
    this.timerRunning = false;
    this.focusSessionState = "paused";
    this.focusPauseStartWords = this.getActiveEditorWordCount();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const project = this.focusModeProject || this.plugin.activeProject || this.plugin.activeBook;
    if (project) this.saveFocusStats(project);
    this.updateFocusControls();
  }

  completeSession() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning = false;
    this.focusSessionState = "completed";
    this.focusStats.sessions++;
    this.focusStats.totalTimeSpent += this.focusSessionDurationSeconds;
    this.focusStats.history.push({
      type: 'completed',
      timestamp: new Date().toISOString(),
      startedAt: this.focusSessionStartedAt,
      words: this.focusStats.currentWords || 0,
      target: this.focusStats.wordGoal || 0,
      elapsedSeconds: this.focusSessionDurationSeconds
    });
    this.timerSeconds = 0;
    this.focusSessionStartedAt = null;
    this.focusPauseStartWords = null;
    this.sessionStartWords = null;
    this.updateTimerDisplay();
    const project = this.focusModeProject || this.plugin.activeProject || this.plugin.activeBook;
    if (project) this.saveFocusStats(project);
    this.refreshFocusStats();
    this.updateFocusControls();
  }

  async endFocusSession({ exitAfter = false } = {}) {
    if (!this.hasFocusSessionInProgress()) {
      if (exitAfter) this.closeFocusModeView();
      return;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const elapsedSeconds = Math.max(0, this.focusSessionDurationSeconds - this.timerSeconds);
    this.timerRunning = false;
    this.focusSessionState = "ended";
    this.focusStats.interruptions++;
    this.focusStats.totalTimeSpent += elapsedSeconds;
    this.focusStats.history.push({
      type: 'interrupted',
      timestamp: new Date().toISOString(),
      startedAt: this.focusSessionStartedAt,
      words: this.focusStats.currentWords || 0,
      target: this.focusStats.wordGoal || 0,
      elapsedSeconds
    });
    this.timerSeconds = this.focusSessionDurationSeconds;
    this.focusSessionStartedAt = null;
    this.focusPauseStartWords = null;
    this.sessionStartWords = null;
    this.updateTimerDisplay();
    const project = this.focusModeProject || this.plugin.activeProject || this.plugin.activeBook;
    if (project) await this.saveFocusStats(project);
    this.refreshFocusStats();
    this.updateFocusControls();
    if (exitAfter) this.closeFocusModeView();
  }

  hasFocusSessionInProgress() {
    return this.timerRunning || this.focusSessionState === "paused" || (
      this.timerSeconds > 0 && this.timerSeconds < this.focusSessionDurationSeconds
    );
  }

  updateFocusControls() {
    const hasSession = this.hasFocusSessionInProgress();
    const visualState = this.timerRunning
      ? "running"
      : this.focusSessionState === "paused"
        ? "paused"
        : this.focusSessionState === "completed"
          ? "completed"
          : this.focusSessionState === "ended"
            ? "ended"
            : "ready";
    if (this.focusModeContainer) {
      this.focusModeContainer.toggleClass("is-ready", visualState === "ready");
      this.focusModeContainer.toggleClass("is-running", visualState === "running");
      this.focusModeContainer.toggleClass("is-paused", visualState === "paused");
      this.focusModeContainer.toggleClass("is-completed", visualState === "completed");
      this.focusModeContainer.toggleClass("is-ended", visualState === "ended");
    }
    if (this.timerStateLabel) {
      this.timerStateLabel.textContent = visualState === "running"
        ? "Writing"
        : visualState === "paused"
          ? "Paused"
          : visualState === "completed"
            ? "Done"
            : visualState === "ended"
              ? "Ended"
              : "Ready";
    }
    if (this.durationInput) this.durationInput.disabled = hasSession;
    if (this.wordGoalInput) this.wordGoalInput.disabled = hasSession;
    if (this.setupSummary) {
      const goal = Number(this.focusStats.wordGoal || 0);
      if (this.setupSummaryValue) {
        this.setupSummaryValue.textContent = `${this.focusSessionDurationMinutes} min / ${goal || 0} words`;
      }
      this.setupSummary.disabled = hasSession;
      this.setupSummary.setAttr("aria-expanded", this.focusSetupExpanded && !hasSession ? "true" : "false");
      this.setupSummary.toggleClass("is-disabled", hasSession);
      this.setupSummary.toggleClass("is-open", this.focusSetupExpanded && !hasSession);
    }
    if (this.setupPanel) {
      this.setupPanel.toggleClass("is-open", this.focusSetupExpanded && !hasSession);
    }
    if (this.startButton) {
      this.startButton.textContent = this.timerRunning
        ? "Pause session"
        : hasSession
          ? "Resume session"
          : this.focusSessionState === "completed"
            ? "Start another"
            : "Start session";
      this.startButton.toggleClass("is-running", this.timerRunning);
    }
    if (this.endButton) {
      this.endButton.disabled = !hasSession;
      this.endButton.toggleClass("is-disabled", !hasSession);
      this.endButton.toggleClass("is-hidden", !hasSession);
    }
    if (this.quietButton) {
      this.quietButton.textContent = this.quietWorkspaceActive ? "Restore" : "Quiet";
      this.quietButton.toggleClass("is-active", this.quietWorkspaceActive);
    }
    if (this.statusText && this.statusHint) {
      if (this.timerRunning) {
        this.statusText.textContent = "Writing session active";
        this.statusHint.textContent = "Stay with the draft. Words and time are being tracked.";
      } else if (this.focusSessionState === "paused") {
        this.statusText.textContent = "Session paused";
        this.statusHint.textContent = "Nothing is recorded as ended. Resume when ready.";
      } else if (this.focusSessionState === "completed") {
        this.statusText.textContent = "Session complete";
        this.statusHint.textContent = "Saved to your Focus stats. Start another when you like.";
      } else if (this.focusSessionState === "ended") {
        this.statusText.textContent = "Session ended early";
        this.statusHint.textContent = "Saved to your Focus stats as ended early.";
      } else {
        this.statusText.textContent = "Ready when you are";
        this.statusHint.textContent = "Set a sprint, then write in your current project file.";
      }
    }
    this.updateFocusProgress();
    this.updateTimerDisplay();
  }

  updateFocusProgress() {
    if (!this.wordProgressLabel || !this.wordProgressBar) return;
    const words = Number(this.focusStats.currentWords || 0);
    const goal = Number(this.focusStats.wordGoal || 0);
    const percent = goal > 0 ? Math.min(100, Math.round((words / goal) * 100)) : 0;
    this.wordProgressLabel.textContent = goal > 0
      ? `${words} / ${goal} words`
      : `${words} words this session`;
    if (this.focusProgressHint) {
      const remainingWords = goal > 0 ? Math.max(0, goal - words) : 0;
      const timeLabel = this.timerSeconds > 0 ? `${this.formatFocusClock(this.timerSeconds)} left` : "Time complete";
      const wordLabel = remainingWords > 0 ? `${remainingWords} words left` : "goal reached";
      this.focusProgressHint.textContent = goal > 0
        ? `${timeLabel} · ${wordLabel}`
        : timeLabel;
    }
    this.wordProgressBar.style.width = `${percent}%`;
  }

  formatFocusClock(totalSeconds) {
    const seconds = Math.max(0, Number(totalSeconds || 0));
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  toggleQuietWorkspace() {
    this.setQuietWorkspace(!this.quietWorkspaceActive);
  }

  setQuietWorkspace(enabled) {
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;
    if (enabled) {
      this.quietWorkspaceActive = true;
      body.classList.add("folio-focus-quiet-workspace");
      const leftSplit = this.plugin.app.workspace?.leftSplit;
      const wasCollapsed = !!leftSplit?.collapsed;
      this.restoreLeftSidebarAfterFocus = !wasCollapsed;
      try {
        if (!wasCollapsed && typeof leftSplit?.collapse === "function") {
          leftSplit.collapse();
        }
      } catch (e) {
        console.warn("Failed to quiet the workspace", e);
      }
    } else {
      const shouldRestore = this.quietWorkspaceActive && this.restoreLeftSidebarAfterFocus;
      this.quietWorkspaceActive = false;
      this.restoreLeftSidebarAfterFocus = false;
      body.classList.remove("folio-focus-quiet-workspace");
      const leftSplit = this.plugin.app.workspace?.leftSplit;
      try {
        if (shouldRestore && typeof leftSplit?.expand === "function") {
          leftSplit.expand();
        }
      } catch (e) {
        console.warn("Failed to restore the workspace", e);
      }
    }
    this.updateFocusControls();
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
    const totalTime = Number(this.focusStats.totalTimeSpent || 0);
    const completed = Number(this.focusStats.sessions || 0);
    const interrupted = Number(this.focusStats.interruptions || 0);
    const hasHistory = completed > 0 || interrupted > 0 || totalTime > 0;
    const statsSummary = statsHeader.createDiv({
      cls: "focus-mode-stats-summary",
      text: hasHistory
        ? `${completed} completed · ${formatTime(totalTime)} focused`
        : "No sessions yet"
    });
    const statsButton = statsHeader.createEl("button", { cls: "focus-mode-stats-button", text: "Session log" });
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

    statsSummary.setAttr("aria-label", "Focus session summary");
  }

  getActiveEditorWordCount() {
    try {
      const activeEditor = this.plugin.app.workspace.activeEditor?.editor;
      const leaf = this.plugin.app.workspace.getMostRecentLeaf();
      const editor = activeEditor || leaf?.view?.editor;
      if (!editor || typeof editor.getValue !== "function") return 0;
      return this.plugin.statsService.countWords(editor.getValue());
    } catch (e) {
      return 0;
    }
  }

  updateFocusSessionWordsFromEditor(text, file) {
    if (!this.focusModeActive) return;
    if (!this.timerRunning) return;
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
      this.updateFocusControls();
    }
  }

  exitFocusMode() {
    if (this.hasFocusSessionInProgress()) {
      new ConfirmModal(this.plugin.app, {
        title: "End this focus session?",
        message: "Your timer is still active. End the session early and return to Writer Tools?",
        confirmText: "End session",
        onConfirm: async () => {
          await this.endFocusSession({ exitAfter: true });
        }
      }).open();
      return;
    }
    this.closeFocusModeView();
  }

  closeFocusModeView() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning = false;
    this.timerSeconds = this.focusSessionDurationSeconds;
    this.focusModeActive = false;
    this.focusSessionState = "idle";
    this.focusSessionStartedAt = null;
    this.focusPauseStartWords = null;
    this.sessionStartWords = null;
    this.setQuietWorkspace(false);
    const container = this.containerEl.children[1];
    container.removeClass("folio-focus-mode");
    this.onOpen();
  }

  renderResourcesSection() {
    const lang = this.resourceLanguage;
    const section = this.toolsContainer.createDiv({ cls: "writer-tools-section" });
    section.createDiv({ cls: "writer-tools-section-title", text: "RESOURCES" });

    const resourcesGrid = section.createDiv({ cls: "writer-tools-resources-grid" });

    const resources = [
      { icon: "user", key: "character", label: ui(lang, "characterResources"), action: () => this.showCharacterResources() },
      { icon: "bookmark", key: "narrative", label: ui(lang, "narrativeResources"), action: () => this.showNarrativeResources() },
      { icon: "layout-grid", key: "structure", label: ui(lang, "structureResources"), action: () => this.showStructureResources() },
      { icon: "lightbulb", key: "tips", label: ui(lang, "tipsResources"), action: () => this.showTipsResources() }
    ];

    resources.forEach(resource => {
      const resourceItem = resourcesGrid.createDiv({ cls: "writer-tools-item" });
      resourceItem.setAttribute("role", "button");
      resourceItem.setAttribute("tabindex", "0");
      resourceItem.setAttribute("aria-label", resource.label);

      const iconWrapper = resourceItem.createDiv({ cls: "writer-tools-item-icon" });
      setIcon(iconWrapper, resource.icon);

      resourceItem.createDiv({ cls: "writer-tools-item-text", text: resource.label });

      const activate = () => resource.action();
      resourceItem.addEventListener("click", activate);
      resourceItem.addEventListener("keydown", evt => {
        if (evt.key === "Enter" || evt.key === " ") { evt.preventDefault(); activate(); }
      });
    });
  }

  // ── Language toggle helper ─────────────────────────────────────────────────

  /**
   * Creates an ES/EN language toggle and appends it to the given container.
   * Returns the toggle element.
   */
  createLangToggle(parent, onToggle) {
    const toggle = parent.createDiv({ cls: "resource-lang-toggle" });
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language");

    const langOptions = [
      { code: "en", label: "EN" },
      { code: "es", label: "ES" }
    ];

    langOptions.forEach(opt => {
      const btn = toggle.createEl("button", {
        cls: "resource-lang-btn" + (this.resourceLanguage === opt.code ? " is-active" : ""),
        text: opt.label
      });
      btn.setAttribute("aria-pressed", String(this.resourceLanguage === opt.code));
      btn.addEventListener("click", async () => {
        if (this.resourceLanguage === opt.code) return;
        this.resourceLanguage = opt.code;
        // Persist
        if (this.plugin.settings) {
          this.plugin.settings.resourceLanguage = opt.code;
          await this.plugin.saveSettings?.();
        }
        onToggle(opt.code);
      });
    });

    return toggle;
  }

  /** Shared header builder for all resource category views. */
  buildResourceViewHeader(container, iconName, titleText, onBack, onLangToggle) {
    const header = container.createDiv({ cls: "folio-resource-view-header" });

    const left = header.createDiv({ cls: "folio-resource-view-header-left" });
    const iconEl = left.createSpan({ cls: "folio-resource-view-header-icon" });
    setIcon(iconEl, iconName);
    left.createSpan({ cls: "folio-resource-view-header-title", text: titleText });

    const right = header.createDiv({ cls: "folio-resource-view-header-right" });
    this.createLangToggle(right, onLangToggle);

    const backButton = right.createEl("button", { cls: "folio-resource-view-back" });
    const backIcon = backButton.createSpan({ cls: "folio-resource-view-back-icon" });
    setIcon(backIcon, "chevron-left");
    backButton.createSpan({ text: ui(this.resourceLanguage, "back") });
    backButton.addEventListener("click", onBack);

    return header;
  }

  /** Make a div act as an accessible interactive card. */
  makeInteractive(el, action) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("click", action);
    el.addEventListener("keydown", evt => {
      if (evt.key === "Enter" || evt.key === " ") { evt.preventDefault(); action(); }
    });
  }

  showCharacterResources() {
    const lang = this.resourceLanguage;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-view");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) setIcon(el, "circle-dot");
    };

    this.buildResourceViewHeader(
      container, "user",
      ui(lang, "characterResources"),
      () => this.onOpen(),
      () => this.showCharacterResources()
    );

    // Character arcs
    const arcsSection = container.createDiv({ cls: "resource-view-section" });
    arcsSection.createDiv({ cls: "resource-view-section-title", text: ui(lang, "characterArcs") });
    const arcsGrid = arcsSection.createDiv({ cls: "resource-view-arc-grid" });

    const arcs = [
      { key: "Moral Ascent", icon: "trending-up" },
      { key: "Moral Descent", icon: "trending-down" },
      { key: "Flat Moral", icon: "minus" },
      { key: "Moral Transformation", icon: "trending-up-down" }
    ];
    arcs.forEach(arc => {
      const item = arcsGrid.createDiv({ cls: "resource-view-arc-item" });
      const icon = item.createSpan({ cls: "resource-view-item-icon" });
      applyIcon(icon, arc.icon);
      item.createDiv({ cls: "resource-view-item-label", text: label(lang, arc.key) });
      this.makeInteractive(item, () => this.showResourceDetail(arc.key, () => this.showCharacterResources()));
    });

    // Character archetypes
    const archetypesSection = container.createDiv({ cls: "resource-view-section is-separated" });
    archetypesSection.createDiv({ cls: "resource-view-section-title", text: ui(lang, "characterArchetypes") });

    const campbellSection = archetypesSection.createDiv({ cls: "resource-view-subsection" });
    campbellSection.createDiv({ cls: "resource-view-subtitle", text: ui(lang, "campbellArchetypes") });
    const campbellGrid = campbellSection.createDiv({ cls: "resource-view-grid" });

    const campbellArchetypes = [
      { key: "The Ally", icon: "handshake" },
      { key: "The Herald", icon: "bell" },
      { key: "The Hero (Jung)", icon: "sword" },
      { key: "The Mentor", icon: "graduation-cap" },
      { key: "The Shadow", icon: "moon" },
      { key: "The Shapeshifter", icon: "hat-glasses" },
      { key: "The Threshold Guardian", icon: "shield" },
      { key: "The Trickster", icon: "dice" }
    ];
    campbellArchetypes.forEach(itemData => {
      const item = campbellGrid.createDiv({ cls: "resource-view-card" });
      const icon = item.createSpan({ cls: "resource-view-card-icon" });
      applyIcon(icon, itemData.icon);
      item.createDiv({ cls: "resource-view-card-label", text: label(lang, itemData.key) });
      this.makeInteractive(item, () => this.showResourceDetail(itemData.key, () => this.showCharacterResources()));
    });

    const jungSection = archetypesSection.createDiv({ cls: "resource-view-subsection" });
    jungSection.createDiv({ cls: "resource-view-subtitle", text: ui(lang, "jungArchetypes") });
    const jungGrid = jungSection.createDiv({ cls: "resource-view-grid" });

    const jungArchetypes = [
      { key: "The Caregiver", icon: "heart-handshake" },
      { key: "The Creator", icon: "paintbrush" },
      { key: "The Everyman", icon: "users" },
      { key: "The Explorer", icon: "compass" },
      { key: "The Hero", icon: "sword" },
      { key: "The Innocent", icon: "baby" },
      { key: "The Jester", icon: "party-popper" },
      { key: "The Lover", icon: "heart" },
      { key: "The Magician", icon: "wand-2" },
      { key: "The Outlaw", icon: "flame-kindling" },
      { key: "The Ruler", icon: "crown" },
      { key: "The Sage", icon: "book-open" }
    ];
    jungArchetypes.forEach(itemData => {
      const item = jungGrid.createDiv({ cls: "resource-view-card" });
      const icon = item.createSpan({ cls: "resource-view-card-icon" });
      applyIcon(icon, itemData.icon);
      item.createDiv({ cls: "resource-view-card-label", text: label(lang, itemData.key) });
      this.makeInteractive(item, () => this.showResourceDetail(itemData.key, () => this.showCharacterResources()));
    });
  }

  showNarrativeResources() {
    const lang = this.resourceLanguage;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-view");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) setIcon(el, "circle-dot");
    };

    this.buildResourceViewHeader(
      container, "bookmark",
      ui(lang, "narrativeResources"),
      () => this.onOpen(),
      () => this.showNarrativeResources()
    );

    container.createDiv({ cls: "resource-view-section-label", text: ui(lang, "narrativeTechniques") });

    const groups = ui(lang, "narrativeGroups");
    const groupItems = [
      [
        { key: "Flashback", icon: "rewind" },
        { key: "Flashforward", icon: "fast-forward" },
        { key: "Foreshadowing", icon: "scan-eye" }
      ],
      [
        { key: "Chekhov's Gun", icon: "bomb" },
        { key: "Red Herring", icon: "fish" },
        { key: "Plot Twist", icon: "rotate-3d" }
      ],
      [
        { key: "Deus Ex Machina", icon: "wand-2" },
        { key: "Eucatastrophe", icon: "mountain" },
        { key: "Poetic Justice", icon: "scale" }
      ],
      [
        { key: "“Show, Don’t Tell”", icon: "eye" },
        { key: "Quibble (Wordplay)", icon: "quote" }
      ]
    ];

    groups.forEach((group, i) => {
      const card = container.createDiv({ cls: "resource-view-group-card" });
      card.createDiv({ cls: "resource-view-group-title", text: group.title });
      if (group.subtitle) {
        card.createDiv({ cls: "resource-view-group-subtitle", text: group.subtitle });
      }
      const grid = card.createDiv({ cls: "resource-view-group-grid" });
      groupItems[i].forEach(itemData => {
        const item = grid.createDiv({ cls: "resource-view-item" });
        const icon = item.createSpan({ cls: "resource-view-item-icon" });
        applyIcon(icon, itemData.icon);
        item.createSpan({ cls: "resource-view-item-label", text: label(lang, itemData.key) });
        this.makeInteractive(item, () => this.showResourceDetail(itemData.key, () => this.showNarrativeResources()));
      });
      if (group.note) {
        card.createDiv({ cls: "resource-view-group-note", text: group.note });
      }
    });
  }

  showStructureResources() {
    const lang = this.resourceLanguage;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-view");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) setIcon(el, "circle-dot");
    };

    this.buildResourceViewHeader(
      container, "layout-grid",
      ui(lang, "structureResources"),
      () => this.onOpen(),
      () => this.showStructureResources()
    );

    container.createDiv({ cls: "resource-view-section-label", text: ui(lang, "storyArchitecture") });

    const groups = ui(lang, "structureGroups");
    const groupItems = [
      [
        { key: "The Hero's Journey", icon: "map" },
        { key: "Dan Harmon Story Circle", icon: "orbit" }
      ],
      [
        { key: "Freytag's Pyramid", icon: "triangle" },
        { key: "Fichtean Curve", icon: "line-chart" },
        { key: "Three Act Structure", icon: "columns-3" },
        { key: "Kishōtenketsu", icon: "route" }
      ],
      [
        { key: "Save the Cat", icon: "cat" },
        { key: "Seven Point Structure", icon: "wheat" },
        { key: "Pulp Formula", icon: "book" },
        { key: "McKee Story paradigm", icon: "book-open" },
        { key: "Into the Woods structure", icon: "trees" }
      ],
      [
        { key: "Frame Narrative", icon: "scan" },
        { key: "Nonlinear Structure", icon: "line-squiggle" },
        { key: "Rashomon Structure", icon: "shrink" },
        { key: "In Medias Res", icon: "git-commit-horizontal" }
      ]
    ];

    groups.forEach((group, i) => {
      const card = container.createDiv({ cls: "resource-view-group-card" });
      card.createDiv({ cls: "resource-view-group-title", text: group.title });
      if (group.subtitle) {
        card.createDiv({ cls: "resource-view-group-subtitle", text: group.subtitle });
      }
      const grid = card.createDiv({ cls: "resource-view-group-grid" });
      groupItems[i].forEach(itemData => {
        const item = grid.createDiv({ cls: "resource-view-item" });
        const icon = item.createSpan({ cls: "resource-view-item-icon" });
        applyIcon(icon, itemData.icon);
        item.createSpan({ cls: "resource-view-item-label", text: label(lang, itemData.key) });
        this.makeInteractive(item, () => this.showResourceDetail(itemData.key, () => this.showStructureResources()));
      });
    });
  }

  showTipsResources() {
    const lang = this.resourceLanguage;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-view");

    const applyIcon = (el, iconName) => {
      setIcon(el, iconName);
      if (!el.querySelector("svg")) setIcon(el, "circle-dot");
    };

    this.buildResourceViewHeader(
      container, "lightbulb",
      ui(lang, "tipsResources"),
      () => this.onOpen(),
      () => this.showTipsResources()
    );

    container.createDiv({ cls: "resource-view-description", text: ui(lang, "tipsIntro") });

    const tipsCard = container.createDiv({ cls: "resource-view-group-card" });
    const tipsGrid = tipsCard.createDiv({ cls: "resource-view-group-grid" });

    const tips = [
      { key: "Argumentation (tips)", icon: "scale" },
      { key: "Description (tips)", icon: "image" },
      { key: "Dialogue (tips)", icon: "message-circle" },
      { key: "Exposition (tips)", icon: "file-text" },
      { key: "Narration (tips)", icon: "book-open" },
      { key: "Persuasion (tips)", icon: "megaphone" }
    ];

    tips.forEach(tip => {
      const item = tipsGrid.createDiv({ cls: "resource-view-item" });
      const icon = item.createSpan({ cls: "resource-view-item-icon" });
      applyIcon(icon, tip.icon);
      item.createSpan({ cls: "resource-view-item-label", text: label(lang, tip.key) });
      this.makeInteractive(item, () => this.showResourceDetail(tip.key, () => this.showTipsResources()));
    });

    container.createDiv({ cls: "resource-view-divider" });
    container.createDiv({ cls: "resource-view-section-label", text: ui(lang, "commonPitfalls") });

    const pitfallsCard = container.createDiv({ cls: "resource-view-group-card" });
    const pitfallsGrid = pitfallsCard.createDiv({ cls: "resource-view-group-grid" });

    const pitfalls = [
      { key: "Character Pitfalls", icon: "user" },
      { key: "Character Arc Pitfalls", icon: "route" },
      { key: "Narrative Technique Pitfalls", icon: "book-open" },
      { key: "Structure Pitfalls", icon: "layout-grid" },
      { key: "Writing-Level Pitfalls", icon: "pen-line" }
    ];

    pitfalls.forEach(pitfall => {
      const item = pitfallsGrid.createDiv({ cls: "resource-view-item" });
      const icon = item.createSpan({ cls: "resource-view-item-icon" });
      applyIcon(icon, pitfall.icon);
      item.createSpan({ cls: "resource-view-item-label", text: label(lang, pitfall.key) });
      this.makeInteractive(item, () => this.showResourceDetail(pitfall.key, () => this.showTipsResources()));
    });
  }

  showResourceDetail(title, onBack) {
    const lang = this.resourceLanguage;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("folio-resource-detail");

    this.buildResourceViewHeader(
      container,
      this.getResourceIcon(title),
      label(lang, title),
      () => {
        container.removeClass("folio-resource-detail");
        onBack();
      },
      () => this.showResourceDetail(title, onBack)
    );

    // ── Archetype routing ────────────────────────────────────────────────────
    const archetypeKeyMap = {
      "The Ally": "ally",
      "The Herald": "herald",
      "The Hero (Jung)": "heroJung",
      "The Mentor": "mentor",
      "The Shadow": "shadow",
      "The Shapeshifter": "shapeshifter",
      "The Threshold Guardian": "thresholdGuardian",
      "The Trickster": "trickster",
      "The Caregiver": "caregiver",
      "The Creator": "creator",
      "The Everyman": "everyman",
      "The Explorer": "explorer",
      "The Hero": "hero",
      "The Innocent": "innocent",
      "The Jester": "jester",
      "The Lover": "lover",
      "The Magician": "magician",
      "The Outlaw": "outlaw",
      "The Ruler": "ruler",
      "The Sage": "sage"
    };

    if (archetypeKeyMap[title]) {
      renderArchetypeDetail(container, archetypeKeyMap[title], lang);
      return;
    }

    // ── Character arc routing ────────────────────────────────────────────────
    const arcKeyMap = {
      "Moral Ascent": "moralAscent",
      "Moral Descent": "moralDescent",
      "Flat Moral": "flatMoral",
      "Moral Transformation": "moralTransformation"
    };

    if (arcKeyMap[title]) {
      renderCharacterArcDetail(container, arcKeyMap[title], lang);
      return;
    }

    // ── Narrative technique routing ──────────────────────────────────────────
    if (TECHNIQUE_DATA[title]) {
      renderTechniqueDetail(container, TECHNIQUE_DATA[title][lang] ?? TECHNIQUE_DATA[title].en);
      return;
    }

    // ── Writing tips routing ─────────────────────────────────────────────────
    if (TIPS_DATA[title]) {
      renderTipsDetail(container, TIPS_DATA[title][lang] ?? TIPS_DATA[title].en);
      return;
    }

    // ── Pitfalls routing ─────────────────────────────────────────────────────
    if (PITFALLS_DATA[title]) {
      const data = PITFALLS_DATA[title][lang] ?? PITFALLS_DATA[title].en;
      renderPitfallsDetail(container, data.title, data.items);
      return;
    }

    // ── Story structure routing ──────────────────────────────────────────────
    if (title === "The Hero's Journey") {
      renderStructureDetail(container, {
        introTitle: "What is the Hero\u2019s Journey?",
        intro: [
          "The Hero\u2019s Journey is a mythic structure that frames story as transformation: a character leaves the familiar, faces trials, dies symbolically, and returns changed. It\u2019s less a rigid formula than a map for meaning and growth."
        ],
        core: [
          "A movement from comfort to challenge to return",
          "External trials that force internal change",
          "Symbolic death and rebirth",
          "A concluding \u201cgift\u201d brought back to the world"
        ],
        stepsTitle: "Steps (classic model)",
        stepGroups: [
          {
            title: "ACT I",
            items: [
              { title: "Ordinary World", body: "Establish the Hero\u2019s baseline life, limitations, and unmet need.", icon: "earth" },
              { title: "Call to Adventure", body: "A disruption offers a mission, opportunity, or threat that demands response.", icon: "phone-incoming" },
              { title: "Refusal of the Call", body: "Fear, duty, or doubt causes hesitation; the Hero resists change.", icon: "phone-off" },
              { title: "Meeting the Mentor", body: "Guidance appears: training, tools, wisdom, or encouragement.", icon: "graduation-cap" },
              { title: "Crossing the First Threshold", body: "The Hero commits and enters the \u201cspecial world,\u201d leaving the old life behind.", icon: "brick-wall" }
            ]
          },
          {
            title: "ACT II",
            items: [
              { title: "Tests, Allies, Enemies", body: "The rules of the new world are learned; relationships and rivalries form.", icon: "line-squiggle" },
              { title: "Approach to the Inmost Cave", body: "Preparation for the central crisis; tensions tighten and stakes clarify.", icon: "mountain" },
              { title: "Ordeal", body: "A major confrontation with death, failure, or the deepest fear.", icon: "swords" },
              { title: "Reward (Seizing the Sword)", body: "The Hero gains something: knowledge, power, object, love, or self-belief.", icon: "trophy" }
            ]
          },
          {
            title: "ACT III",
            items: [
              { title: "The Road Back", body: "Consequences arrive; the Hero must return with the reward under pressure.", icon: "arrow-big-left" },
              { title: "Resurrection", body: "A final test proves transformation. The Hero confronts the core flaw one last time.", icon: "user-round-plus" },
              { title: "Return with the Elixir", body: "The Hero returns changed, bringing value to others: healing, truth, freedom, hope.", icon: "gem" }
            ]
          }
        ],
        whyTitle: "Why this works",
        why: "These steps externalize inner change: the world forces the Hero to become someone new.",
        examplesTitle: "Hero\u2019s Journey Examples",
        examples: ["Star Wars", "The Matrix", "The Lord of the Rings", "Moana", "Harry Potter"]
      });
      return;
    }
    if (title === "Dan Harmon Story Circle") {
      renderStructureDetail(container, {
        introTitle: "What is the Story Circle?",
        intro: [
          "The Story Circle compresses transformation into a repeatable loop: a character wants something, leaves comfort, pays a price, and returns changed. It\u2019s designed to be practical for episodes as well as features."
        ],
        core: [
          "Motivation-driven steps",
          "Clear cause-and-effect",
          "Repeatable structure (especially for TV)",
          "Emphasis on change and cost"
        ],
        stepsTitle: "Steps (8-step circle)",
        steps: [
          { title: "YOU (COMFORT)", body: "Establish the character\u2019s normal world and identity.", icon: "fish" },
          { title: "NEED (DESIRE)", body: "The character wants or needs something that disrupts balance.", icon: "candy" },
          { title: "GO (ENTER UNFAMILIAR)", body: "The character leaves comfort and enters a new situation.", icon: "log-in" },
          { title: "SEARCH (ADAPT)", body: "The character explores the new world and tries strategies that may fail.", icon: "map" },
          { title: "FIND (GET WHAT THEY WANTED)", body: "The character achieves the goal\u2014or seems to.", icon: "search-check" },
          { title: "TAKE (PAY A PRICE)", body: "There is a cost: sacrifice, loss, compromise, or consequence.", icon: "hand-coins" },
          { title: "RETURN (BACK TO FAMILIAR)", body: "The character returns to a version of their old world.", icon: "arrow-big-left" },
          { title: "CHANGE (TRANSFORMED)", body: "The character is different: wiser, broken, empowered, humbled, etc.", icon: "user-pen" }
        ],
        examplesTitle: "Story Circle Examples",
        examples: ["Episodic TV arcs", "Community", "Rick and Morty", "Character-centered short stories"]
      });
      return;
    }
    if (title === "Three Act Structure") {
      renderStructureDetail(container, {
        introTitle: "What is the Three Act Structure?",
        intro: ["A story divided into Setup, Confrontation, and Resolution. It\u2019s the most common modern narrative skeleton because it aligns with audience attention and escalating stakes."],
        stepsTitle: "Steps (typical beats)",
        numberedSteps: true,
        steps: [
          "ACT I \u2014 Setup",
          "1. Opening / Status Quo \u2014 Introduce the protagonist, their world, and the core problem-space.",
          "2. Inciting Incident \u2014 A disruption creates a new problem or opportunity.",
          "3. Debate / Refusal \u2014 The protagonist hesitates, resists, or explores alternatives.",
          "4. Act I Break (Commitment) \u2014 The protagonist commits and can\u2019t go back.",
          "ACT II \u2014 Confrontation",
          "5. Rising Complications \u2014 Obstacles escalate; stakes increase; plans fail.",
          "6. Midpoint Shift \u2014 A major reveal or reversal changes the story\u2019s direction and intensity.",
          "7. Bad Guys Close In / Pressure Peaks \u2014 Consequences compound; resources thin; relationships strain.",
          "8. All Is Lost \u2014 The lowest point; apparent defeat or devastating cost.",
          "9. Dark Night of the Soul \u2014 Reflection and decision: who will the protagonist become?",
          "ACT III \u2014 Resolution",
          "10. Act III Break (New plan) \u2014 The protagonist acts with new clarity, courage, or strategy.",
          "11. Climax \u2014 The decisive confrontation that resolves the central conflict.",
          "12. Denouement \u2014 Aftermath: new equilibrium; consequences; thematic closure."
        ],
        examplesTitle: "Three Act Examples",
        examples: ["Most Hollywood films", "Contemporary commercial novels", "Studio-driven storytelling"]
      });
      return;
    }
    if (title === "Freytag's Pyramid") {
      renderStructureDetail(container, {
        introTitle: "What is Freytag\u2019s Pyramid?",
        intro: ["A classical five-part model of dramatic tension, often associated with tragedy. It formalizes a rise to climax followed by a decline into resolution."],
        stepsTitle: "Steps (5-part model)",
        steps: [
          "1. Exposition \u2014 Introduce setting, characters, and the initial balance.",
          "2. Rising Action \u2014 Complications build; conflict intensifies; choices narrow.",
          "3. Climax \u2014 The turning point\u2014the peak tension where fate changes direction.",
          "4. Falling Action \u2014 Consequences unfold; momentum turns toward inevitable outcome.",
          "5. Denouement / Catastrophe \u2014 Final resolution, often with moral or tragic closure."
        ],
        examplesTitle: "Freytag Examples",
        examples: ["Classical tragedies", "Shakespearean drama", "Traditional stage plays"]
      });
      return;
    }
    if (title === "Fichtean Curve") {
      renderStructureDetail(container, {
        introTitle: "What is the Fichtean Curve?",
        intro: ["A structure built from a chain of escalating crises with minimal exposition. The story begins close to conflict and continues increasing pressure until climax."],
        stepsTitle: "Steps (crisis chain)",
        steps: [
          "1. Immediate Hook / First Crisis \u2014 Start near a problem, not far before it.",
          "2. Crisis Escalation 1 \u2014 The protagonist responds; the response creates new complications.",
          "3. Crisis Escalation 2 \u2014 Stakes rise; setbacks compound; options shrink.",
          "4. Crisis Escalation 3 \u2014 Pressure intensifies; emotional and practical costs deepen.",
          "5. Major Crisis / Low Point \u2014 A near-defeat moment that forces a decisive shift.",
          "6. Climax \u2014 The protagonist commits fully and confronts the core conflict.",
          "7. Short Resolution \u2014 Quick wrap-up; consequences and new stability."
        ],
        examplesTitle: "Fichtean Curve Examples",
        examples: ["Thrillers", "Page-turner genre fiction", "Serialized storytelling"]
      });
      return;
    }
    if (title === "Kish\u014dtenketsu") {
      renderStructureDetail(container, {
        introTitle: "What is Kish\u014dtenketsu?",
        intro: ["Kish\u014dtenketsu is a four-part structure that emphasizes development and contrast rather than conflict. It\u2019s common in East Asian storytelling and works well for narratives driven by discovery, theme, or perspective."],
        stepsTitle: "Steps (4-part model)",
        steps: [
          "1. Ki (Introduction) \u2014 Establish the situation, characters, and core idea.",
          "2. Sh\u014d (Development) \u2014 Expand the situation; deepen detail and context without major disruption.",
          "3. Ten (Turn / Twist) \u2014 Introduce a surprising contrast or shift: a new angle, reveal, or reframing event.",
          "4. Ketsu (Conclusion) \u2014 Synthesize: show how the contrast changes meaning; resolve by integration rather than victory."
        ],
        examplesTitle: "Kish\u014dtenketsu Examples",
        examples: ["Many slice-of-life stories", "Certain anime and manga arcs", "Essays or thematic short fiction", "Some puzzle-like narratives"]
      });
      return;
    }
    if (title === "Save the Cat") {
      renderStructureDetail(container, {
        introTitle: "What is Save the Cat?",
        intro: ["Save the Cat is a commercial beat sheet designed to maximize audience engagement. It focuses on emotional timing, clarity, and likeability, especially for film and genre fiction."],
        core: ["Strong emotional beats", "Clear pacing", "Audience empathy", "Market-tested structure"],
        stepsTitle: "Steps (15-beat model)",
        steps: [
          "1. Opening Image \u2014 A snapshot of the protagonist\u2019s world before change.",
          "2. Theme Stated \u2014 A line or moment hints at the story\u2019s central lesson.",
          "3. Setup \u2014 Introduce characters, flaws, relationships, and stakes.",
          "4. Catalyst \u2014 The inciting incident that disrupts normal life.",
          "5. Debate \u2014 The protagonist hesitates and weighs options.",
          "6. Break into Act II \u2014 Commitment to the journey.",
          "7. B Story \u2014 A secondary plot, often emotional or relational.",
          "8. Fun and Games \u2014 The \u201cpromise of the premise\u201d; the story delivers on genre.",
          "9. Midpoint \u2014 A major reversal: false victory or false defeat.",
          "10. Bad Guys Close In \u2014 Pressure increases; plans unravel.",
          "11. All Is Lost \u2014 Apparent defeat; emotional or literal low point.",
          "12. Dark Night of the Soul \u2014 Reflection and internal reckoning.",
          "13. Break into Act III \u2014 New insight leads to decisive action.",
          "14. Finale \u2014 The protagonist applies what they\u2019ve learned to win or lose meaningfully.",
          "15. Final Image \u2014 A mirror of the opening image, showing change."
        ],
        examplesTitle: "Save the Cat Examples",
        examples: ["Most studio films", "Romantic comedies", "High-concept genre movies", "Animated features"]
      });
      return;
    }
    if (title === "Seven Point Structure") {
      renderStructureDetail(container, {
        introTitle: "What is the Seven Point Structure?",
        intro: ["A clean, flexible structure focused on cause-and-effect turning points. It emphasizes clarity and momentum."],
        core: ["Fewer beats, higher impact", "Clear reversals", "Strong midpoint logic"],
        stepsTitle: "Steps (7-point model)",
        numberedSteps: true,
        steps: [
          "1. Hook \u2014 Introduce the protagonist and the central problem.",
          "2. Plot Turn 1 \u2014 An event pushes the protagonist into action.",
          "3. Pinch Point 1 \u2014 Pressure reveals the antagonist\u2019s power.",
          "4. Midpoint \u2014 The protagonist shifts from reactive to proactive.",
          "5. Pinch Point 2 \u2014 Stakes intensify; consequences loom.",
          "6. Plot Turn 2 \u2014 Final commitment toward resolution.",
          "7. Resolution \u2014 Conflict concludes; new status quo established."
        ],
        examplesTitle: "Seven Point Examples",
        examples: ["Fantasy and sci-fi novels", "Plot-driven fiction", "Serialized narratives"]
      });
      return;
    }
    if (title === "Pulp Formula") {
      renderStructureDetail(container, {
        introTitle: "What is the Pulp Formula?",
        intro: ["A fast-paced structure designed for entertainment, clarity, and momentum. It prioritizes action, stakes, and accessibility over thematic subtlety."],
        core: ["Immediate engagement", "Clear heroes and villains", "Escalating danger", "High momentum"],
        stepsTitle: "Steps (common pulp rhythm)",
        steps: [
          "1. Immediate Hook \u2014 Start with action or danger.",
          "2. Clear Goal \u2014 The protagonist knows what must be done.",
          "3. Obstacle Chain \u2014 Continuous challenges and reversals.",
          "4. Escalation \u2014 Stakes increase rapidly.",
          "5. Cliffhanger or Crisis \u2014 A major setback or revelation.",
          "6. Final Confrontation \u2014 Direct clash with the antagonist.",
          "7. Swift Resolution \u2014 Loose ends tied quickly."
        ],
        examplesTitle: "Pulp Examples",
        examples: ["Adventure serials", "Noir fiction", "Action thrillers", "Comic storytelling"]
      });
      return;
    }
    if (title === "McKee Story paradigm") {
      renderStructureDetail(container, {
        introTitle: "What is the McKee Paradigm?",
        intro: ["Robert McKee\u2019s model emphasizes story as a sequence of value changes driven by conflict and choice. It focuses on scene design and narrative causality."],
        core: ["Value shifts", "Progressive complications", "Scene-level causality", "Strong climax logic"],
        stepsTitle: "Structural principles",
        steps: [
          "1. Inciting Incident \u2014 A radical change disrupts balance.",
          "2. Progressive Complications \u2014 Each action leads to greater difficulty.",
          "3. Crisis \u2014 A decision between irreconcilable values.",
          "4. Climax \u2014 Action that resolves the crisis.",
          "5. Resolution \u2014 The world stabilizes in a new form."
        ],
        examplesTitle: "McKee Examples",
        examples: ["Prestige drama", "Character-driven films", "Serious literary narratives"]
      });
      return;
    }
    if (title === "Into the Woods structure") {
      renderStructureDetail(container, {
        introTitle: "What is the Into the Woods structure?",
        intro: ["John Yorke\u2019s model views story as a five-act, fractal pattern: order, disorder, repair, collapse, and transformation. It emphasizes repetition at multiple scales."],
        core: ["Five-part rhythm", "Fractal repetition", "Moral consequence", "Thematic depth"],
        stepsTitle: "Steps (5-act pattern)",
        steps: [
          "1. Order \u2014 Establish a flawed equilibrium.",
          "2. Disruption \u2014 A desire or problem breaks order.",
          "3. Attempted Repair \u2014 Characters try to fix things.",
          "4. Collapse \u2014 Efforts fail; chaos peaks.",
          "5. New Order \u2014 A transformed equilibrium emerges."
        ],
        examplesTitle: "Into the Woods Examples",
        examples: ["British television drama", "Prestige serialized storytelling", "Thematic narratives"]
      });
      return;
    }
    if (title === "Frame Narrative") {
      renderStructureDetail(container, {
        introTitle: "What is a Frame Narrative?",
        intro: ["A story within a story. An outer narrative contextualizes or reframes an inner narrative."],
        core: ["Nested storytelling", "Perspective mediation", "Interpretive distance"],
        stepsTitle: "Structural layers",
        steps: [
          "1. Outer Frame \u2014 Establish the narrator or context.",
          "2. Inner Story \u2014 The primary narrative is told.",
          "3. Interruption or Commentary \u2014 The frame reacts or reframes meaning.",
          "4. Return to Frame \u2014 The story closes with new understanding."
        ],
        examplesTitle: "Frame Narrative Examples",
        examples: ["Frankenstein", "The Princess Bride", "Heart of Darkness", "Arabian Nights"]
      });
      return;
    }
    if (title === "Nonlinear Structure") {
      renderStructureDetail(container, {
        introTitle: "What is a Nonlinear Structure?",
        intro: ["A narrative told out of chronological order. Meaning emerges from juxtaposition rather than sequence."],
        core: ["Fragmented timeline", "Pattern recognition", "Active audience participation"],
        stepsTitle: "Common nonlinear patterns",
        steps: ["Reverse chronology", "Interwoven timelines", "Fragmented memory", "Circular narratives"],
        examplesTitle: "Nonlinear Examples",
        examples: ["Memento", "Pulp Fiction", "Westworld", "Slaughterhouse-Five"]
      });
      return;
    }
    if (title === "Rashomon Structure") {
      renderStructureDetail(container, {
        introTitle: "What is a Rashomon Structure?",
        intro: ["A narrative that presents multiple, conflicting perspectives of the same event, emphasizing subjectivity and truth ambiguity."],
        core: ["Multiple narrators", "Contradictory accounts", "Truth as unstable"],
        stepsTitle: "Structural pattern",
        steps: ["1. Single event", "2. Multiple retellings", "3. Contradictions revealed", "4. Ambiguity preserved"],
        examplesTitle: "Rashomon Examples",
        examples: ["Rashomon", "Hero", "The Affair", "Gone Girl (partial)"]
      });
      return;
    }
    if (title === "In Medias Res") {
      renderStructureDetail(container, {
        introTitle: "What is In Medias Res?",
        intro: ["A narrative that begins in the middle of action, then later provides context for how events reached that point."],
        core: ["Immediate engagement", "Delayed exposition", "Momentum-first storytelling"],
        stepsTitle: "Structural pattern",
        steps: [
          "1. Mid-action opening",
          "2. Audience confusion",
          "3. Gradual backfill",
          "4. Recontextualization",
          "5. Continuation to resolution"
        ],
        examplesTitle: "In Medias Res Examples",
        examples: ["The Odyssey", "Breaking Bad (cold opens)", "Mad Max: Fury Road", "Fight Club"]
      });
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
    const donateCopy = card.createDiv({ cls: "donate-view-card-text" });
    donateCopy.createSpan({
      text: "Folio is free and open-source."
    });
    donateCopy.createEl("br");
    donateCopy.createEl("br");
    donateCopy.createSpan({
      text: "If you find it useful, you can optionally support its development here"
    });
    donateCopy.createEl("br");
    donateCopy.createSpan({
      text: "Support is voluntary and does not unlock features or provide special access."
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
      { icon: "github", label: "@danigarvire", url: "https://github.com/danigarvire" }
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

class PdfPreviewModal extends Modal {
  constructor(app, view) {
    super(app);
    this.view = view;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("pdf-preview-modal");
    this.modalEl?.addClass("pdf-preview-modal-shell");

    const header = contentEl.createDiv({ cls: "pdf-settings-modal-header" });
    header.createDiv({ cls: "pdf-settings-modal-title", text: "PDF Preview" });

    const body = contentEl.createDiv({ cls: "pdf-preview-modal-body" });
    const preview = body.createDiv({ cls: "pdf-preview-modal-preview" });

    this.view.pdfPreviewContainer = preview;
    this.view.renderPdfPreview(preview);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl?.removeClass("pdf-preview-modal-shell");
    if (this.view.pdfPreviewContainer === this.contentEl.querySelector(".pdf-preview-modal-preview")) {
      this.view.pdfPreviewContainer = this.view.pdfInlinePreviewContainer || null;
      if (this.view.pdfPreviewContainer) {
        this.view.renderPdfPreview(this.view.pdfPreviewContainer);
      }
    }
  }
}

class PdfSettingsModal extends Modal {
  constructor(app, view) {
    super(app);
    this.view = view;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("pdf-settings-modal");
    this.modalEl?.addClass("pdf-settings-modal-shell");
    this.applyCenteredPaneLayout();

    const header = contentEl.createDiv({ cls: "pdf-settings-modal-header" });
    const headerCopy = header.createDiv({ cls: "pdf-settings-modal-heading" });
    headerCopy.createDiv({ cls: "pdf-settings-modal-title", text: "PDF export" });
    headerCopy.createDiv({ cls: "pdf-settings-modal-subtitle", text: "Choose the content, check the preview, then export." });

    const body = contentEl.createDiv({ cls: "pdf-settings-modal-body" });
    this.view.pdfSettingsContainer = body;
    this.view.renderPdfSettingsPanel(body);

    const actions = contentEl.createDiv({ cls: "pdf-settings-modal-actions" });
    const actionStatus = actions.createDiv({ cls: "pdf-settings-action-status" });
    const actionButtons = actions.createDiv({ cls: "pdf-settings-action-buttons" });
    const cancel = actionButtons.createEl("button", { cls: "export-settings-btn", text: "Close" });
    const exportBtn = actionButtons.createEl("button", { cls: "export-settings-btn is-primary", text: "Export PDF" });

    this.view.pdfExportStateUpdater = (state) => {
      const canExport = !!state?.canExport && !this.view.isPdfExporting;
      if (!this.view.isPdfExporting) {
        actionStatus.textContent = state?.message || "";
      }
      exportBtn.disabled = !canExport;
      exportBtn.toggleClass("is-disabled", !canExport);
    };
    this.view.updatePdfExportState();

    cancel.addEventListener("click", () => {
      if (this.view.isPdfExporting && this.view.pdfExportAbortController) {
        actionStatus.textContent = "Cancelling export...";
        cancel.disabled = true;
        this.view.pdfExportAbortController.abort();
        return;
      }
      this.close();
    });
    exportBtn.addEventListener("click", async () => {
      if (!this.view.validatePdfExportSettings()) return;
      const controller = new AbortController();
      this.view.pdfExportAbortController = controller;
      this.view.isPdfExporting = true;
      exportBtn.disabled = true;
      exportBtn.toggleClass("is-disabled", true);
      exportBtn.textContent = "Exporting...";
      cancel.textContent = "Cancel export";
      actionStatus.textContent = "Starting export...";
      try {
        await this.view.handleExportAction({
          signal: controller.signal,
          onProgress: (message) => {
            actionStatus.textContent = message;
          }
        });
      } finally {
        this.view.isPdfExporting = false;
        this.view.pdfExportAbortController = null;
        exportBtn.textContent = "Export PDF";
        cancel.textContent = "Close";
        cancel.disabled = false;
        this.view.updatePdfExportState();
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    if (this.view.isPdfExporting && this.view.pdfExportAbortController) {
      this.view.pdfExportAbortController.abort();
    }
    contentEl.empty();
    this.modalEl?.removeClass("pdf-settings-modal-shell");
    this.resetCenteredPaneLayout();
    this.view.pdfExportStateUpdater = null;
    this.view.isPdfExporting = false;
    this.view.pdfExportAbortController = null;
    this.view.pdfSettingsLayoutRoot = null;
    this.view.pdfSettingsControlsEl = null;
    if (this.view.pdfSettingsContainer === this.contentEl.querySelector(".pdf-settings-modal-body")) {
      this.view.pdfSettingsContainer = null;
    }
  }

  applyCenteredPaneLayout() {
    const modalEl = this.modalEl;
    if (!modalEl) return;
    const activeLeaf = document.querySelector(".workspace-leaf.mod-active .workspace-leaf-content");
    const rootLeaf = document.querySelector(".mod-root .workspace-leaf-content");
    const rootLeaves = Array.from(document.querySelectorAll(".mod-root .workspace-leaf-content"));
    const centerLeaf = rootLeaves
      .filter((leaf) => leaf.matches("[data-type='markdown'], [data-type='markdown-preview'], [data-type='empty']"))
      .sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0];
    const largestRoot = rootLeaves
      .sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0];
    const target = centerLeaf || largestRoot || activeLeaf || rootLeaf;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    modalEl.dataset.prevPosition = modalEl.style.position || "";
    modalEl.dataset.prevLeft = modalEl.style.left || "";
    modalEl.dataset.prevTop = modalEl.style.top || "";
    modalEl.dataset.prevWidth = modalEl.style.width || "";
    modalEl.dataset.prevHeight = modalEl.style.height || "";
    modalEl.dataset.prevMaxWidth = modalEl.style.maxWidth || "";
    modalEl.dataset.prevMaxHeight = modalEl.style.maxHeight || "";
    modalEl.dataset.prevMargin = modalEl.style.margin || "";
    modalEl.dataset.prevRadius = modalEl.style.borderRadius || "";
    modalEl.dataset.prevTransform = modalEl.style.transform || "";
    modalEl.dataset.prevResize = modalEl.style.resize || "";
    modalEl.dataset.prevOverflow = modalEl.style.overflow || "";
    modalEl.dataset.prevMinWidth = modalEl.style.minWidth || "";
    modalEl.dataset.prevMinHeight = modalEl.style.minHeight || "";
    modalEl.style.position = "fixed";
    modalEl.style.left = `${rect.left}px`;
    modalEl.style.top = `${rect.top}px`;
    modalEl.style.width = `${rect.width}px`;
    modalEl.style.height = `${rect.height}px`;
    modalEl.style.maxWidth = "100vw";
    modalEl.style.maxHeight = "100vh";
    modalEl.style.minWidth = "720px";
    modalEl.style.minHeight = "520px";
    modalEl.style.margin = "0";
    modalEl.style.borderRadius = "0";
    modalEl.style.transform = "none";
    modalEl.style.resize = "both";
    modalEl.style.overflow = "hidden";
    this.contentEl.style.height = "100%";
    this.contentEl.style.width = "100%";
    const content = modalEl.querySelector(".modal-content");
    if (content) {
      content.dataset.prevWidth = content.style.width || "";
      content.dataset.prevHeight = content.style.height || "";
      content.dataset.prevMaxWidth = content.style.maxWidth || "";
      content.dataset.prevMaxHeight = content.style.maxHeight || "";
      content.style.width = "100%";
      content.style.height = "100%";
      content.style.maxWidth = "100%";
      content.style.maxHeight = "100%";
    }
  }

  resetCenteredPaneLayout() {
    const modalEl = this.modalEl;
    if (!modalEl) return;
    modalEl.style.position = modalEl.dataset.prevPosition || "";
    modalEl.style.left = modalEl.dataset.prevLeft || "";
    modalEl.style.top = modalEl.dataset.prevTop || "";
    modalEl.style.width = modalEl.dataset.prevWidth || "";
    modalEl.style.height = modalEl.dataset.prevHeight || "";
    modalEl.style.maxWidth = modalEl.dataset.prevMaxWidth || "";
    modalEl.style.maxHeight = modalEl.dataset.prevMaxHeight || "";
    modalEl.style.margin = modalEl.dataset.prevMargin || "";
    modalEl.style.borderRadius = modalEl.dataset.prevRadius || "";
    modalEl.style.transform = modalEl.dataset.prevTransform || "";
    modalEl.style.resize = modalEl.dataset.prevResize || "";
    modalEl.style.overflow = modalEl.dataset.prevOverflow || "";
    modalEl.style.minWidth = modalEl.dataset.prevMinWidth || "";
    modalEl.style.minHeight = modalEl.dataset.prevMinHeight || "";
    modalEl.dataset.prevPosition = "";
    modalEl.dataset.prevLeft = "";
    modalEl.dataset.prevTop = "";
    modalEl.dataset.prevWidth = "";
    modalEl.dataset.prevHeight = "";
    modalEl.dataset.prevMaxWidth = "";
    modalEl.dataset.prevMaxHeight = "";
    modalEl.dataset.prevMargin = "";
    modalEl.dataset.prevRadius = "";
    modalEl.dataset.prevTransform = "";
    modalEl.dataset.prevResize = "";
    modalEl.dataset.prevOverflow = "";
    modalEl.dataset.prevMinWidth = "";
    modalEl.dataset.prevMinHeight = "";
    this.contentEl.style.height = "";
    this.contentEl.style.width = "";
    const content = modalEl.querySelector(".modal-content");
    if (content) {
      content.style.width = content.dataset.prevWidth || "";
      content.style.height = content.dataset.prevHeight || "";
      content.style.maxWidth = content.dataset.prevMaxWidth || "";
      content.style.maxHeight = content.dataset.prevMaxHeight || "";
      content.dataset.prevWidth = "";
      content.dataset.prevHeight = "";
      content.dataset.prevMaxWidth = "";
      content.dataset.prevMaxHeight = "";
    }
  }
}
