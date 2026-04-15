/**
 * Writer Tools View - Panel de herramientas para escritura
 */

import { ItemView, Modal, Notice, setIcon } from 'obsidian';
import { FocusModeStatsModal } from '../modals/focusModeStatsModal.js';
import { createResourceSubheading, renderCalloutItem, renderHeroDetail, renderMentorDetail, renderHeraldDetail, renderShadowDetail, renderTricksterDetail, renderAllyDetail, renderShapeshifterDetail, renderThresholdGuardianDetail, renderCaregiverDetail, renderCreatorDetail, renderEverymanDetail, renderExplorerDetail, renderHeroJungDetail, renderInnocentDetail, renderJesterDetail, renderLoverDetail, renderMagicianDetail, renderOutlawDetail, renderRulerDetail, renderSageDetail, renderMoralAscentDetail, renderMoralDescentDetail, renderFlatMoralDetail, renderMoralTransformationDetail, renderPitfallsDetail, renderTipsDetail, renderTechniqueDetail, renderStructureDetail } from '../writer-tools/referenceDetails.js';

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

  handleExportAction() {
    if (!this.exportProject) {
      new Notice("No active project selected.");
      return;
    }
    if (this.exportFormat === "pdf") {
      if (this.plugin?.pdfExportService?.exportProject) {
        this.plugin.pdfExportService.exportProject(this.exportProject, this.pdfSettings);
        return;
      }
      new Notice("PDF export is not wired yet. Settings are saved and preview updates are in place.");
      return;
    }
    if (this.exportFormat === "docx") {
      this.exportFormat = "pdf";
      this.queuePdfSettingsSave("export-format-fallback");
    }
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
    card.createDiv({ cls: "pdf-preview-title", text: "PDF Export Preview" });
    const frameWrap = card.createDiv({ cls: "pdf-preview-frame-wrap" });

    const token = ++this.pdfPreviewRenderToken;
    const service = this.plugin?.pdfExportService;
    if (!service?.buildExportHtml) {
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
    title.createSpan({ cls: "pdf-settings-header-title", text: "Export Settings" });

    this.renderPageSizeSection(controls);
    this.renderContentSelectionSection(controls);
    this.renderCoverSection(controls);
    this.renderFolioSettingsSection(controls);

    const actions = controls.createDiv({ cls: "pdf-settings-footer" });
    const resetBtn = actions.createEl("button", { cls: "pdf-settings-reset", text: "Reset to Defaults" });
    resetBtn.addEventListener("click", () => {
      this.pdfSettings = this.getDefaultPdfSettings(this.exportMeta);
      this.queuePdfSettingsSave("reset-defaults");
      this.requestPdfPreviewUpdate("reset-defaults");
      this.renderPdfSettingsPanel(container);
    });
  }

  renderPageSizeSection(container) {
    const card = container.createDiv({ cls: "pdf-settings-card" });
    const header = card.createDiv({ cls: "pdf-settings-card-header" });
    const icon = header.createSpan({ cls: "pdf-settings-card-icon" });
    setIcon(icon, "book-open");
    header.createDiv({ cls: "pdf-settings-card-title", text: "Page Size" });

    const row = this.createPdfRow(card, "Page Size");
    const select = this.createPdfSelect(row.control, ["A4", "A5", "A3", "Letter", "Legal", "Tabloid"], this.pdfSettings.pageSize, (value) => {
      this.pdfSettings.pageSize = value;
      this.queuePdfSettingsSave("page-size");
      this.requestPdfPreviewUpdate("page-size");
    });
    select.addClass("pdf-select-wide");
  }

  renderCoverSection(container) {
    // Book-Smith: "封面设置" -> "Cover Settings"
    const card = container.createDiv({ cls: "pdf-settings-card" });
    const header = card.createDiv({ cls: "pdf-settings-card-header" });
    const icon = header.createSpan({ cls: "pdf-settings-card-icon" });
    setIcon(icon, "palette");
    header.createDiv({ cls: "pdf-settings-card-title", text: "Cover Settings" });

    const toggleRow = this.createPdfRow(card, "Include Cover");
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

    const actionRow = this.createPdfRow(card, "Cover Design");
    const customizeBtn = actionRow.control.createEl("button", { cls: "pdf-settings-button", text: this.coverDesignOpen ? "Hide Cover Design" : "Customize Cover" });
    customizeBtn.addEventListener("click", () => {
      if (!this.pdfSettings.cover.include) return;
      this.coverDesignOpen = !this.coverDesignOpen;
      if (this.coverDesignOpen) {
        this.coverDesignDraft = JSON.parse(JSON.stringify(this.pdfSettings.cover));
      }
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    });

    if (!this.pdfSettings.cover.include) {
      this.applyPdfDisabled(card, true);
    }

    if (this.coverDesignOpen) {
      this.renderCoverDesignPanel(card);
    }
  }

  renderContentSelectionSection(container) {
    const card = container.createDiv({ cls: "pdf-settings-card" });
    const header = card.createDiv({ cls: "pdf-settings-card-header" });
    const icon = header.createSpan({ cls: "pdf-settings-card-icon" });
    setIcon(icon, "layers");
    header.createDiv({ cls: "pdf-settings-card-title", text: "Content Selection" });

    const modeRow = this.createPdfRow(card, "Mode");
    const projectType = this.exportMeta?.projectType || this.exportConfig?.basic?.projectType || "book";
    const isScriptProject = projectType === "script" || projectType === "film";
    const modeOptions = [
      { label: isScriptProject ? "Script Only" : "Chapters Only", value: "scriptOnly" },
      { label: "All Included Files", value: "allIncluded" },
      { label: "Custom Selection", value: "custom" }
    ];
    const modeSelect = this.createPdfSelect(
      modeRow.control,
      modeOptions,
      this.pdfSettings.content?.mode || "allIncluded",
      (value) => {
        this.pdfSettings.content.mode = value;
        this.queuePdfSettingsSave("content-mode");
        this.requestPdfPreviewUpdate("content-mode");
        this.renderPdfSettingsPanel(this.pdfSettingsContainer);
      }
    );
    modeSelect.addClass("pdf-select-wide");

    const tree = this.exportConfig?.structure?.tree || [];
    const list = card.createDiv({ cls: "pdf-content-list" });
    if (!tree.length) {
      list.createDiv({ cls: "pdf-content-empty", text: "No project structure found." });
      return;
    }

    const nodes = [];
    const walk = (node, depth) => {
      nodes.push({ node, depth });
      const children = [...(node.children || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      children.forEach((child) => walk(child, depth + 1));
    };
    [...tree].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((node) => walk(node, 0));

    nodes.forEach(({ node, depth }) => {
      const row = list.createDiv({ cls: "pdf-content-row" });
      row.style.paddingLeft = `${depth * 14}px`;
      const checkbox = row.createEl("input", { type: "checkbox" });
      checkbox.checked = this.resolveContentInclusion(node.path, node.type);
      checkbox.addEventListener("change", () => {
        this.updateContentRule(node.path, node.type, checkbox.checked);
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
    panel.createDiv({ cls: "pdf-cover-design-title", text: "Cover Design" });

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

    const imageRow = this.createPdfRow(panel, "Cover Image");
    const imageControls = imageRow.control.createDiv({ cls: "pdf-cover-image-controls" });
    const selectBtn = imageControls.createEl("button", { cls: "pdf-settings-button", text: "Select Image" });
    const clearBtn = imageControls.createEl("button", { cls: "pdf-settings-button", text: "Clear Image" });
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
    const applyBtn = actions.createEl("button", { cls: "pdf-settings-button is-primary", text: "Apply" });
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
    const card = container.createDiv({ cls: "pdf-settings-card" });
    const header = card.createDiv({ cls: "pdf-settings-card-header" });
    const icon = header.createSpan({ cls: "pdf-settings-card-icon" });
    setIcon(icon, "sliders-horizontal");
    header.createDiv({ cls: "pdf-settings-card-title", text: "Folio Settings" });

    if (!this.pdfSettings.layout) {
      this.pdfSettings.layout = this.getDefaultPdfSettings(this.exportMeta).layout;
    }

    const applyRow = this.createPdfRow(card, "Apply CSS Classes");
    const applyToggle = this.createPdfToggle(applyRow.control, this.pdfSettings.layout.applyCssClasses !== false, (checked) => {
      this.pdfSettings.layout.applyCssClasses = checked;
      this.queuePdfSettingsSave("layout-apply-css");
      this.requestPdfPreviewUpdate("layout-apply-css");
    });

    const fontRow = this.createPdfRow(card, "Font");
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

    const sizeRow = this.createPdfRow(card, "Font Size (pt)");
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

    const lineRow = this.createPdfRow(card, "Line Height");
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

    const marginRow = this.createPdfRow(card, "Margins (mm)");
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

    const bleedRow = this.createPdfRow(card, "Bleed (mm)");
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

    const capRow = this.createPdfRow(card, "Capitalize Headings");
    this.createPdfToggle(capRow.control, this.pdfSettings.layout.capitalizeHeadings !== false, (checked) => {
      this.pdfSettings.layout.capitalizeHeadings = checked;
      this.queuePdfSettingsSave("layout-capitalization");
      this.requestPdfPreviewUpdate("layout-capitalization");
    });

    const pageRow = this.createPdfRow(card, "Include Page Numbers");
    this.createPdfToggle(pageRow.control, this.pdfSettings.layout.includePageNumbers !== false, (checked) => {
      this.pdfSettings.layout.includePageNumbers = checked;
      this.queuePdfSettingsSave("layout-page-numbers");
      this.requestPdfPreviewUpdate("layout-page-numbers");
    });
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

  applyPdfDisabled(container, disabled) {
    if (!container) return;
    container.toggleClass("is-disabled", disabled);
    container.querySelectorAll("input, select, button, textarea").forEach((el) => {
      if (disabled && el.dataset?.pdfKeepEnabled === "true") return;
      if (disabled) el.setAttr("disabled", "true");
      else el.removeAttr("disabled");
    });
  }

  resolveContentInclusion(path, kind) {
    const mode = this.pdfSettings?.content?.mode || "allIncluded";
    const rules = this.pdfSettings?.content?.rules || [];
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
    if (this.pdfSettings.content.mode !== "custom") {
      this.pdfSettings.content.mode = "custom";
      this.renderPdfSettingsPanel(this.pdfSettingsContainer);
    }
    const rules = this.pdfSettings.content.rules || [];
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
      renderHeroDetail(container);
      return;
    }
    if (title === "The Caregiver") {
      renderCaregiverDetail(container);
      return;
    }
    if (title === "The Creator") {
      renderCreatorDetail(container);
      return;
    }
    if (title === "The Everyman") {
      renderEverymanDetail(container);
      return;
    }
    if (title === "The Explorer") {
      renderExplorerDetail(container);
      return;
    }
    if (title === "The Hero (Jung)") {
      renderHeroJungDetail(container);
      return;
    }
    if (title === "The Innocent") {
      renderInnocentDetail(container);
      return;
    }
    if (title === "The Jester") {
      renderJesterDetail(container);
      return;
    }
    if (title === "The Lover") {
      renderLoverDetail(container);
      return;
    }
    if (title === "The Magician") {
      renderMagicianDetail(container);
      return;
    }
    if (title === "The Outlaw") {
      renderOutlawDetail(container);
      return;
    }
    if (title === "The Ruler") {
      renderRulerDetail(container);
      return;
    }
    if (title === "The Sage") {
      renderSageDetail(container);
      return;
    }
    if (title === "Moral Ascent") {
      renderMoralAscentDetail(container);
      return;
    }
    if (title === "Moral Descent") {
      renderMoralDescentDetail(container);
      return;
    }
    if (title === "Flat Moral") {
      renderFlatMoralDetail(container);
      return;
    }
    if (title === "Moral Transformation") {
      renderMoralTransformationDetail(container);
      return;
    }
    if (title === "Character Pitfalls") {
      renderPitfallsDetail(container, "Character Pitfalls", [
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
      renderPitfallsDetail(container, "Character Arc Pitfalls", [
        "No real change",
        "Change without cause",
        "Moral whiplash",
        "Transformation too late",
        "Arc contradicts theme"
      ]);
      return;
    }
    if (title === "Narrative Technique Pitfalls") {
      renderPitfallsDetail(container, "Narrative Technique Pitfalls", [
        "Foreshadowing too obvious",
        "Plot twists without setup",
        "Red herrings that waste time",
        "Deus ex machina abuse",
        "Flashbacks killing momentum"
      ]);
      return;
    }
    if (title === "Structure Pitfalls") {
      renderPitfallsDetail(container, "Structure Pitfalls", [
        "Act breaks without tension",
        "Sagging middle",
        "Climax too early / too late",
        "Resolution without consequence",
        "Structure fighting the story"
      ]);
      return;
    }
    if (title === "Writing-Level Pitfalls") {
      renderPitfallsDetail(container, "Writing-Level Pitfalls", [
        "Over-exposition",
        "On-the-nose dialogue",
        "Telling instead of showing",
        "Purple prose",
        "Inconsistent tone"
      ]);
      return;
    }
    if (title === "Argumentation (tips)") {
      renderTipsDetail(container, {
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
      renderTipsDetail(container, {
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
      renderTipsDetail(container, {
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
      renderTipsDetail(container, {
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
      renderTipsDetail(container, {
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
      renderTipsDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderTechniqueDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderStructureDetail(container, {
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
      renderMentorDetail(container);
      return;
    }
    if (title === "The Herald") {
      renderHeraldDetail(container);
      return;
    }
    if (title === "The Shadow") {
      renderShadowDetail(container);
      return;
    }
    if (title === "The Trickster") {
      renderTricksterDetail(container);
      return;
    }
    if (title === "The Ally") {
      renderAllyDetail(container);
      return;
    }
    if (title === "The Shapeshifter") {
      renderShapeshifterDetail(container);
      return;
    }
    if (title === "The Threshold Guardian") {
      renderThresholdGuardianDetail(container);
      return;
    }
    if (title === "The Caregiver") {
      renderCaregiverDetail(container);
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
    header.createDiv({ cls: "pdf-settings-modal-title", text: "PDF Export Settings" });

    const body = contentEl.createDiv({ cls: "pdf-settings-modal-body" });
    this.view.pdfSettingsContainer = body;
    this.view.renderPdfSettingsPanel(body);

    const actions = contentEl.createDiv({ cls: "pdf-settings-modal-actions" });
    const cancel = actions.createEl("button", { cls: "export-settings-btn", text: "Cancel" });
    const exportBtn = actions.createEl("button", { cls: "export-settings-btn is-primary", text: "Export" });

    cancel.addEventListener("click", () => this.close());
    exportBtn.addEventListener("click", () => {
      this.view.handleExportAction();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl?.removeClass("pdf-settings-modal-shell");
    this.resetCenteredPaneLayout();
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
