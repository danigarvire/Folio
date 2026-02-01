import fs from "fs";
import path from "path";
import { Component, FileSystemAdapter, MarkdownRenderer, Notice } from "obsidian";

export class PdfExportService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  async exportProject(project, settings) {
    if (!project) {
      new Notice("No active project selected.");
      return;
    }
    if (this.app?.isMobile) {
      new Notice("PDF export is available on desktop only.");
      return;
    }

    const cfg = (await this.configService.loadProjectConfig(project)) || {};
    const meta = (await this.configService.loadProjectMeta(project)) || {};

    const html = await this.buildExportHtml(project, meta, cfg, settings);
    if (!html) {
      new Notice("Failed to build export document.");
      return;
    }

    const targetPath = await this.promptSavePath(project, meta);
    if (!targetPath) return;

    const pdfBuffer = await this.renderHtmlToPdf(html, settings, meta);
    if (!pdfBuffer) {
      new Notice("PDF export failed.");
      return;
    }

    await this.writePdf(targetPath, pdfBuffer);
    new Notice(`PDF exported to ${targetPath}`);
  }

  async buildExportHtml(project, meta, cfg, settings) {
    const files = await this.collectOrderedMarkdownFiles(project, cfg, settings, meta);
    const sections = [];
    const tocItems = [];

    const applyCssClasses = settings?.layout?.applyCssClasses !== false;
    for (const file of files) {
      if (file.extension === "canvas" || file.path.endsWith(".canvas")) {
        const canvasHtml = await this.renderCanvasToHtml(file);
        if (canvasHtml) {
          sections.push(`<section class="canvas-export page-break" data-path="${this.escapeHtml(file.path)}">${canvasHtml}</section>`);
        }
        continue;
      }
      const markdown = await this.app.vault.read(file);
      tocItems.push(...this.extractHeadings(markdown, settings?.toc?.maxHeadingLevel || 3));
      const html = await this.renderMarkdownToHtml(markdown, file.path);
      const cssClasses = applyCssClasses ? this.getFileCssClasses(file) : [];
      const classAttr = ["chapter", "markdown-preview-view", ...cssClasses].join(" ");
      sections.push(`<section class="${classAttr}" data-path="${this.escapeHtml(file.path)}">${html}</section>`);
    }

    const coverHtml = settings?.cover?.include
      ? await this.buildCoverHtml(project, meta, settings)
      : "";
    const tocHtml = settings?.toc?.enabled
      ? this.buildTocHtml(tocItems, settings)
      : "";
    const tocBreak = settings?.toc?.enabled && settings?.toc?.pageBreakAfter
      ? `<div class="page-break"></div>`
      : "";

    const bodyHtml = [coverHtml, tocHtml, tocBreak, sections.join("\n")].filter(Boolean).join("\n");
    const css = this.buildPrintCss(settings);

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${this.escapeHtml(meta?.title || project?.name || "Export")}</title>
    <style>${css}</style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;
  }

  async buildCoverHtml(project, meta, settings) {
    const cover = settings?.cover || {};
    const title = this.escapeHtml(cover?.title?.text || meta?.title || "Untitled");
    const subtitle = this.escapeHtml(cover?.subtitle?.text || meta?.subtitle || "");
    const author = this.escapeHtml(cover?.author?.text || (Array.isArray(meta?.author) ? meta.author.join(", ") : (meta?.author || "")));
    let imageUrl = "";

    if (cover?.imageDataUrl) {
      imageUrl = cover.imageDataUrl;
    } else if (cover?.imagePath) {
      if (cover.imagePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(cover.imagePath)) {
        const dataUrl = this.buildDataUrlFromPath(cover.imagePath);
        if (dataUrl) {
          imageUrl = dataUrl;
        } else {
          imageUrl = `file://${cover.imagePath.replace(/\\/g, "/")}`;
        }
      } else {
        const file = this.app.metadataCache.getFirstLinkpathDest(cover.imagePath, project.path);
        if (file) {
          imageUrl = this.app.vault.getResourcePath(file);
        }
      }
    }

    const imageHtml = imageUrl
      ? `<div class="cover-image" style="background-image:url('${imageUrl}')"></div>`
      : "";

    return `
      <section class="cover page-break">
        ${imageHtml}
        <div class="cover-text">
          <div class="cover-title">${title}</div>
          ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ""}
          ${author ? `<div class="cover-author">${author}</div>` : ""}
        </div>
      </section>
    `;
  }

  buildTocHtml(items, settings) {
    const title = this.escapeHtml(settings?.toc?.title || "Table of Contents");
    const list = items.map((item) => {
      const indent = (item.level - 1) * (settings?.toc?.indentation || 12);
      return `<div class="toc-item" style="margin-left:${indent}px">${this.escapeHtml(item.text)}</div>`;
    }).join("");
    return `
      <section class="toc">
        <div class="toc-title">${title}</div>
        <div class="toc-list">${list}</div>
      </section>
    `;
  }

  buildDataUrlFromPath(filePath) {
    try {
      const fs = require("fs");
      const path = require("path");
      if (!fs.existsSync(filePath)) return "";
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mime = ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "";
      if (!mime) return "";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.warn("Failed to load cover image.", error);
      return "";
    }
  }

  buildPrintCss(settings) {
    const toc = settings?.toc || {};
    const layout = settings?.layout || {};
    const margins = layout.margins || {};
    const marginTop = Number.isFinite(margins.top) ? margins.top : 20;
    const marginRight = Number.isFinite(margins.right) ? margins.right : 20;
    const marginBottom = Number.isFinite(margins.bottom) ? margins.bottom : 20;
    const marginLeft = Number.isFinite(margins.left) ? margins.left : 20;
    const bleed = Number.isFinite(layout.bleed) ? layout.bleed : 0;
    const padTop = marginTop + bleed;
    const padRight = marginRight + bleed;
    const padBottom = marginBottom + bleed;
    const padLeft = marginLeft + bleed;
    const bodyFontFamily = (layout.fontFamily && layout.fontFamily.trim()) ? layout.fontFamily : "var(--font-text, Georgia, serif)";
    const fontSize = Number.isFinite(layout.fontSize) ? layout.fontSize : 12;
    const lineHeight = Number.isFinite(layout.lineHeight) ? layout.lineHeight : 1.4;
    const capitalizeHeadings = layout.capitalizeHeadings !== false;
    const includePageNumbers = layout.includePageNumbers !== false;
    const tocFontFamily = toc.fontStyle === "Sans"
      ? "var(--font-interface, Arial, sans-serif)"
      : toc.fontStyle === "Mono"
        ? "var(--font-monospace, Menlo, monospace)"
        : "var(--font-text, Georgia, serif)";
    const tocFontSize = toc.fontSize || 12;
    const tocLineHeight = toc.lineHeight || 1.4;

    const screenplayCss = settings?.layout?.applyCssClasses === false ? "" : this.loadScreenplaySnippetCss();

    return `
      @page { margin: 0; }
      body { --pad-top: ${padTop}mm; --pad-right: ${padRight}mm; --pad-bottom: ${padBottom}mm; --pad-left: ${padLeft}mm; font-family: ${bodyFontFamily}; font-size: ${fontSize}pt; line-height: ${lineHeight}; color: #111; padding: var(--pad-top) var(--pad-right) var(--pad-bottom) var(--pad-left); box-sizing: border-box; }
      .page-break { page-break-after: always; }
      .canvas-export { page-break-after: always; }
      .canvas-export .canvas-title { font-weight: 600; margin: 0 0 16px; text-align: center; }
      .canvas-export svg { width: 100%; height: auto; max-height: 80vh; display: block; border: 1px solid #ddd; border-radius: 10px; background: #fff; }
      .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - var(--pad-top) - var(--pad-bottom)); text-align: center; }
      .cover-image { width: 60%; height: 220px; background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 24px; }
      .cover-title { font-size: ${settings?.cover?.title?.size || 32}px; font-weight: ${settings?.cover?.title?.weight === "Bold" ? 700 : 400}; font-style: ${settings?.cover?.title?.style === "Italic" ? "italic" : "normal"}; color: ${settings?.cover?.title?.color || "#111"}; }
      .cover-subtitle { font-size: ${settings?.cover?.subtitle?.size || 18}px; font-weight: ${settings?.cover?.subtitle?.weight === "Bold" ? 700 : 400}; font-style: ${settings?.cover?.subtitle?.style === "Italic" ? "italic" : "normal"}; color: ${settings?.cover?.subtitle?.color || "#444"}; margin-top: 12px; }
      .cover-author { font-size: ${settings?.cover?.author?.size || 14}px; font-weight: ${settings?.cover?.author?.weight === "Bold" ? 700 : 400}; font-style: ${settings?.cover?.author?.style === "Italic" ? "italic" : "normal"}; color: ${settings?.cover?.author?.color || "#555"}; margin-top: 18px; }
      .toc { margin: 24px 0 36px; font-family: ${tocFontFamily}; font-size: ${tocFontSize}px; line-height: ${tocLineHeight}; }
      .toc-title { font-weight: 700; margin-bottom: 12px; }
      .toc-item { padding: 2px 0; }
      .chapter { margin-bottom: 28px; }
      .md-screenplay { font-family: ${bodyFontFamily}; font-size: ${fontSize}pt; line-height: ${lineHeight}; max-width: 6.5in; margin: 0 auto; }
      .md-screenplay p { margin: 0 0 10px; }
      .md-screenplay h1, .md-screenplay h2, .md-screenplay h3, .md-screenplay h4 { text-transform: ${capitalizeHeadings ? "uppercase" : "none"}; letter-spacing: 0.8px; margin: 18px 0 8px; font-size: ${fontSize}pt; }
      .md-screenplay blockquote { margin: 0 0 10px 1.2in; }
      ${screenplayCss}
    `;
  }

  loadScreenplaySnippetCss() {
    try {
      const basePath = this.getVaultBasePath();
      const candidates = [
        path.join(__dirname, "PRO Screenwriting Snippet.css"),
        basePath ? path.join(basePath, ".obsidian", "snippets", "PRO Screenwriting Snippet.css") : null,
        basePath ? path.join(basePath, "PRO Screenwriting Snippet.css") : null
      ].filter(Boolean);
      for (const snippetPath of candidates) {
        if (fs.existsSync(snippetPath)) {
          return fs.readFileSync(snippetPath, "utf8");
        }
      }
    } catch (error) {
      console.warn("Screenplay CSS snippet not loaded.", error);
    }
    return "";
  }

  async renderMarkdownToHtml(markdown, sourcePath) {
    const component = new Component();
    component.load();
    const container = document.createElement("div");
    await MarkdownRenderer.render(this.app, markdown, container, sourcePath || "", component);
    component.unload();
    return container.innerHTML || "";
  }

  extractHeadings(markdown, maxLevel = 3) {
    const items = [];
    const lines = (markdown || "").split("\n");
    for (const line of lines) {
      const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
      if (!match) continue;
      const level = match[1].length;
      if (level > maxLevel) continue;
      const text = match[2].replace(/\s#+$/, "").trim();
      if (!text) continue;
      items.push({ level, text });
    }
    return items;
  }

  async collectOrderedMarkdownFiles(project, cfg, settings, meta) {
    const tree = cfg?.structure?.tree || [];
    const files = [];
    const contentMode = this.getContentMode(settings, meta, cfg);
    const rules = settings?.content?.rules || [];
    const projectType = meta?.projectType || cfg?.basic?.projectType || "book";
    const pushNode = (node) => {
      if (!node) return;
      if (node.type === "group") {
        const children = [...(node.children || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
        children.forEach((child) => pushNode(child));
        return;
      }
      if (node.exclude) return;
      if (!node.path || !(node.path.endsWith(".md") || node.path.endsWith(".canvas"))) return;
      if (!this.isPathIncluded(node.path, contentMode, rules, projectType)) return;
      const fullPath = `${project.path}/${node.path}`;
      const file = this.app.vault.getAbstractFileByPath(fullPath);
      if (file) files.push(file);
    };

    const roots = [...tree].sort((a, b) => (a.order || 0) - (b.order || 0));
    roots.forEach((node) => pushNode(node));

    if (files.length > 0) return files;

    const folder = this.app.vault.getAbstractFileByPath(project.path);
    if (!folder || !folder.children) return files;

    const walk = (dir) => {
      for (const child of dir.children || []) {
        if (child.extension === "md" || child.extension === "canvas") {
          const rel = child.path.replace(`${project.path}/`, "");
          if (this.isPathIncluded(rel, contentMode, rules, projectType)) files.push(child);
        }
        else if (child.children) walk(child);
      }
    };
    walk(folder);
    return files;
  }

  getContentMode(settings, meta, cfg) {
    const explicit = settings?.content?.mode;
    if (explicit) return explicit;
    const projectType = meta?.projectType || cfg?.basic?.projectType || "book";
    return projectType === "script" || projectType === "film" ? "scriptOnly" : "allIncluded";
  }

  isPathIncluded(path, mode, rules, projectType = "book") {
    if (mode === "custom") {
      const rule = this.findContentRule(path, rules);
      if (rule) return !!rule.include;
      return false;
    }
    if (mode === "scriptOnly") {
      const isScriptProject = projectType === "script" || projectType === "film";
      return isScriptProject ? this.isScriptContentPath(path) : this.isChapterContentPath(path);
    }
    return true;
  }

  async renderCanvasToHtml(file) {
    try {
      const raw = await this.app.vault.read(file);
      const data = JSON.parse(raw || "{}");
      const svg = await this.buildCanvasSvg(data, file);
      if (!svg) return null;
      const title = this.escapeHtml(file.basename || "Canvas");
      return `<div class="canvas-title">${title}</div>${svg}`;
    } catch (error) {
      console.warn("Canvas export failed.", error);
      return null;
    }
  }

  async buildCanvasSvg(data, file) {
    const nodes = Array.isArray(data?.nodes) ? data.nodes : [];
    const edges = Array.isArray(data?.edges) ? data.edges : [];
    const boxes = nodes.filter((node) => Number.isFinite(node?.x) && Number.isFinite(node?.y) && Number.isFinite(node?.width) && Number.isFinite(node?.height));
    if (!boxes.length) return "";
    const minX = Math.min(...boxes.map((n) => n.x));
    const minY = Math.min(...boxes.map((n) => n.y));
    const maxX = Math.max(...boxes.map((n) => n.x + n.width));
    const maxY = Math.max(...boxes.map((n) => n.y + n.height));
    const padding = 40;
    const vbX = minX - padding;
    const vbY = minY - padding;
    const vbW = (maxX - minX) + padding * 2;
    const vbH = (maxY - minY) + padding * 2;

    const escape = (value) => String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

    const nodeMap = new Map();
    boxes.forEach((node) => {
      if (node?.id) nodeMap.set(node.id, node);
    });

    const getAnchor = (node, side) => {
      const x = node.x;
      const y = node.y;
      const w = node.width;
      const h = node.height;
      switch (side) {
        case "left":
          return { x, y: y + h / 2 };
        case "right":
          return { x: x + w, y: y + h / 2 };
        case "top":
          return { x: x + w / 2, y };
        case "bottom":
          return { x: x + w / 2, y: y + h };
        default:
          return { x: x + w / 2, y: y + h / 2 };
      }
    };

    const renderLabel = (node) => {
      if (node.type === "text") return node.text || "";
      if (node.type === "file") return (node.file || "").split("/").pop();
      if (node.type === "link") return node.url || "";
      return node.label || node.id || "";
    };

    const isImageFile = (name) => {
      const lower = (name || "").toLowerCase();
      return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif") || lower.endsWith(".svg");
    };

    const resolveImageDataUrl = async (node) => {
      if (!node?.file || !isImageFile(node.file)) return "";
      const projectPath = file?.parent?.path || "";
      const target = this.app.metadataCache.getFirstLinkpathDest(node.file, projectPath);
      if (!target) return "";
      const ext = (target.extension || "").toLowerCase();
      try {
        if (ext === "svg") {
          const text = await this.app.vault.read(target);
          const encoded = Buffer.from(text, "utf8").toString("base64");
          return `data:image/svg+xml;base64,${encoded}`;
        }
        const data = await this.app.vault.adapter.readBinary(target.path);
        const base64 = Buffer.from(data).toString("base64");
        const mimeMap = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          gif: "image/gif"
        };
        const mime = mimeMap[ext] || "image/png";
        return `data:${mime};base64,${base64}`;
      } catch (error) {
        console.warn("Canvas image read failed.", error);
        return "";
      }
    };

    const edgePaths = edges.map((edge) => {
      const fromNode = nodeMap.get(edge.fromNode);
      const toNode = nodeMap.get(edge.toNode);
      if (!fromNode || !toNode) return "";
      const start = getAnchor(fromNode, edge.fromSide);
      const end = getAnchor(toNode, edge.toSide);
      return `<path d="M ${start.x} ${start.y} L ${end.x} ${end.y}" stroke="#777" stroke-width="2" fill="none" marker-end="url(#arrow)" />`;
    }).join("");

    const rects = await Promise.all(boxes.map(async (node) => {
      const label = escape(renderLabel(node));
      const x = node.x;
      const y = node.y;
      const w = node.width;
      const h = node.height;
      const fill = node.type === "group" ? "#f3f3f3" : "#ffffff";
      const stroke = "#bdbdbd";
      const textX = x + 14;
      const textY = y + 24;
      const paddingX = 12;
      const fontSize = 14;
      const maxChars = Math.max(4, Math.floor((w - paddingX * 2) / (fontSize * 0.6)));
      const words = String(label || "").split(/\s+/).filter(Boolean);
      const lines = [];
      let current = "";
      words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxChars && current) {
          lines.push(current);
          current = word;
        } else {
          current = next;
        }
      });
      if (current) lines.push(current);
      const textLines = lines.slice(0, Math.max(1, Math.floor((h - 20) / (fontSize + 4))));
      const text = textLines.map((line, idx) => `<tspan x="${textX}" dy="${idx === 0 ? 0 : fontSize + 4}">${escape(line)}</tspan>`).join("");
      const textBlock = `<text x="${textX}" y="${textY}" font-size="${fontSize}" fill="#333" font-family="sans-serif">${text}</text>`;
      const imageDataUrl = await resolveImageDataUrl(node);
      const image = imageDataUrl
        ? `<image href="${imageDataUrl}" x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" preserveAspectRatio="xMidYMid meet" />`
        : "";
      const textLayer = node.type === "file" && imageDataUrl ? "" : textBlock;
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="${fill}" stroke="${stroke}" />
        ${image}
        ${textLayer}
      `;
    }));

    return `
      <svg viewBox="${vbX} ${vbY} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#777" />
          </marker>
        </defs>
        ${edgePaths}
        ${rects.join("")}
      </svg>
    `;
  }

  findContentRule(path, rules) {
    if (!path) return null;
    let best = null;
    for (const rule of rules || []) {
      if (!rule?.path) continue;
      if (path === rule.path || path.startsWith(`${rule.path}/`)) {
        if (!best || rule.path.length > best.path.length) best = rule;
      }
    }
    return best;
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

  getFileCssClasses(file) {
    try {
      const cache = this.app.metadataCache.getFileCache(file);
      const classes = cache?.frontmatter?.cssclasses || cache?.frontmatter?.cssclass;
      if (!classes) return [];
      if (Array.isArray(classes)) return classes.filter(Boolean);
      if (typeof classes === "string") {
        return classes.split(/[\s,]+/).filter(Boolean);
      }
    } catch {}
    return [];
  }

  async renderHtmlToPdf(html, settings, meta) {
    const { BrowserWindow } = this.getElectronApi() || {};
    if (!BrowserWindow) {
      new Notice("Electron API unavailable for PDF export.");
      return null;
    }

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    try {
      const encoded = encodeURIComponent(html);
      await win.loadURL(`data:text/html;charset=utf-8,${encoded}`);
      const headerTemplate = this.buildHeaderFooterTemplate("header", settings, meta);
      const footerTemplate = this.buildHeaderFooterTemplate("footer", settings, meta);
      const displayHeaderFooter = !!(settings?.layout?.includePageNumbers !== false);
      const pdf = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: settings?.pageSize || "A4",
        displayHeaderFooter,
        headerTemplate,
        footerTemplate
      });
      return pdf;
    } catch (e) {
      console.warn("printToPDF failed", e);
      return null;
    } finally {
      win.close();
    }
  }

  buildHeaderFooterTemplate(kind, settings, meta) {
    let config = kind === "header" ? settings?.header : settings?.footer;
    if (kind === "header") return "<div></div>";
    if (settings?.layout?.includePageNumbers === false) return "<div></div>";
    if (!config && kind === "footer") {
      config = { enabled: true, left: "", center: "", right: "{{pageNumber}}/{{totalPages}}", fontSize: 10 };
    }
    if (kind === "footer" && config && config.enabled === false) {
      config = { ...config, enabled: true };
    }
    if (!config?.enabled) return "<div></div>";
    const fontSize = config.fontSize || (kind === "header" ? 11 : 10);
    const left = this.renderTemplate(config.left || "", meta);
    const center = this.renderTemplate(config.center || "", meta);
    const right = this.renderTemplate(config.right || "", meta);
    return `
      <style>
        .hf { font-size: ${fontSize}px; color: #666; width: 100%; padding: 0 20px; }
        .hf-table { width: 100%; font-size: ${fontSize}px; }
        .hf-left { text-align: left; }
        .hf-center { text-align: center; }
        .hf-right { text-align: right; }
      </style>
      <div class="hf">
        <table class="hf-table">
          <tr>
            <td class="hf-left">${left}</td>
            <td class="hf-center">${center}</td>
            <td class="hf-right">${right}</td>
          </tr>
        </table>
      </div>
    `;
  }

  renderTemplate(template, meta) {
    const title = this.escapeHtml(meta?.title || "");
    const author = this.escapeHtml(Array.isArray(meta?.author) ? meta.author.join(", ") : (meta?.author || ""));
    const date = this.escapeHtml(new Date().toLocaleDateString());
    const safe = this.escapeHtml(template || "");
    return safe
      .replaceAll("{{title}}", title)
      .replaceAll("{{author}}", author)
      .replaceAll("{{date}}", date)
      .replaceAll("{{pageNumber}}", '<span class="pageNumber"></span>')
      .replaceAll("{{totalPages}}", '<span class="totalPages"></span>');
  }

  escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  getElectronApi() {
    try {
      const remote = require("@electron/remote");
      if (remote) return remote;
    } catch {}
    try {
      const electron = require("electron");
      if (electron?.remote) return electron.remote;
      return electron;
    } catch {
      return null;
    }
  }

  async promptSavePath(project, meta) {
    const electron = this.getElectronApi();
    const dialog = electron?.dialog;
    if (dialog?.showSaveDialog) {
      const defaultName = `${meta?.title || project?.name || "export"}.pdf`;
      const result = await dialog.showSaveDialog({
        title: "Export PDF",
        defaultPath: defaultName,
        filters: [{ name: "PDF", extensions: ["pdf"] }]
      });
      if (result.canceled) return null;
      return result.filePath || null;
    }

    const basePath = this.getVaultBasePath();
    const fallback = `${project.path}/exports`;
    try {
      await this.app.vault.createFolder(fallback);
    } catch {}
    return basePath ? `${basePath}/${fallback}/export.pdf` : `${fallback}/export.pdf`;
  }

  getVaultBasePath() {
    const adapter = this.app.vault?.adapter;
    if (adapter instanceof FileSystemAdapter) {
      return adapter.getBasePath();
    }
    return null;
  }

  async writePdf(targetPath, pdfBuffer) {
    const basePath = this.getVaultBasePath();
    if (basePath && targetPath.startsWith(basePath)) {
      const relPath = targetPath.slice(basePath.length + 1);
      if (this.app.vault?.adapter?.writeBinary) {
        await this.app.vault.adapter.writeBinary(relPath, pdfBuffer);
        return;
      }
    }
    const fs = require("fs/promises");
    await fs.writeFile(targetPath, pdfBuffer);
  }
}
