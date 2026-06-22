/**
 * Final Draft (.fdx) Export Service
 *
 * Converts a Folio project's ordered markdown into a Final Draft XML document
 * and lets the user choose where to save it via the native save dialog
 * (falling back to the project folder inside the vault when no dialog is
 * available). Element classification is delegated to the shared
 * screenplayParser.
 *
 * The build methods are pure and unit-tested; only exportProject and the
 * filesystem helpers touch the environment.
 */

import { FileSystemAdapter } from 'obsidian';
import { parseScreenplayElements } from './screenplayParser.js';

// Map our element types to Final Draft paragraph types.
// FDX has no dedicated "section/act" paragraph type that imports cleanly
// everywhere, so sections fall back to "Action".
const FDX_TYPE = {
  scene: "Scene Heading",
  character: "Character",
  parenthetical: "Parenthetical",
  dialogue: "Dialogue",
  transition: "Transition",
  action: "Action",
  section: "Action",
};

export class FdxExportService {
  constructor(app) {
    this.app = app;
  }

  escapeXml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  /** Serialize one element to an FDX <Paragraph>. Pure. */
  buildParagraph(element) {
    const type = FDX_TYPE[element?.type] || "Action";
    return `    <Paragraph Type="${type}"><Text>${this.escapeXml(element?.text)}</Text></Paragraph>`;
  }

  /** Build the <Content> body from a markdown document. Pure. */
  buildContentFromMarkdown(markdown) {
    const elements = parseScreenplayElements(markdown);
    return elements.map((el) => this.buildParagraph(el)).join("\n");
  }

  /** Optional FDX title page from project metadata. Pure. */
  buildTitlePage(meta) {
    const title = (meta?.title || "").trim();
    const authorRaw = meta?.author;
    const author = Array.isArray(authorRaw)
      ? authorRaw.filter(Boolean).join(", ")
      : (authorRaw || "").toString().trim();

    if (!title && !author) return "";

    const paras = [];
    if (title) paras.push(`      <Paragraph Type="Action" Alignment="Center"><Text>${this.escapeXml(title)}</Text></Paragraph>`);
    if (author) {
      paras.push(`      <Paragraph Type="Action" Alignment="Center"><Text>Written by</Text></Paragraph>`);
      paras.push(`      <Paragraph Type="Action" Alignment="Center"><Text>${this.escapeXml(author)}</Text></Paragraph>`);
    }
    return `  <TitlePage>\n    <Content>\n${paras.join("\n")}\n    </Content>\n  </TitlePage>`;
  }

  /** Wrap content sections into a full FDX document. Pure. */
  buildDocument(contentBody, meta) {
    const titlePage = this.buildTitlePage(meta);
    return [
      `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
      `<FinalDraft DocumentType="Script" Template="No" Version="1">`,
      `  <Content>`,
      contentBody,
      `  </Content>`,
      titlePage,
      `</FinalDraft>`,
      ``,
    ].filter((part) => part !== "").join("\n");
  }

  /**
   * Convert the project to FDX and let the user pick where to save it.
   * @param {{path:string,name:string}} project
   * @param {object} meta  loadProjectMeta() shape
   * @param {Array} files  ordered list of TFile to include
   * @returns {Promise<string|null>} the saved path, or null if cancelled
   * @throws on read/write failure (the caller reports it)
   */
  async exportProject(project, meta, files) {
    const bodies = [];
    for (const file of files || []) {
      try {
        const md = await this.app.vault.read(file);
        const body = this.buildContentFromMarkdown(md);
        if (body.trim()) bodies.push(body);
      } catch (e) {
        console.warn("FDX export: failed to read", file?.path, e);
      }
    }
    const document = this.buildDocument(bodies.join("\n"), meta);

    const targetPath = await this.promptSavePath(project, meta);
    if (!targetPath) return null; // user cancelled the save dialog

    await this.writeText(targetPath, document);
    this.revealInFolder(targetPath);
    return targetPath;
  }

  /** Build a safe default file name (with .fdx extension). */
  getDefaultFileName(project, meta) {
    const raw = String(meta?.title || project?.name || "screenplay").trim() || "screenplay";
    const safe = raw
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim() || "screenplay";
    return safe.toLowerCase().endsWith(".fdx") ? safe : `${safe}.fdx`;
  }

  /**
   * Ask the user where to save via the native dialog. Falls back to the
   * project folder inside the vault when no dialog is available.
   * @returns {Promise<string|null>} absolute (or vault-relative) path, or null if cancelled
   */
  async promptSavePath(project, meta) {
    const defaultName = this.getDefaultFileName(project, meta);
    const dialog = this.getElectronApi()?.dialog;
    if (dialog?.showSaveDialog) {
      const result = await dialog.showSaveDialog({
        title: "Export Final Draft",
        defaultPath: defaultName,
        filters: [{ name: "Final Draft", extensions: ["fdx"] }],
      });
      if (result.canceled) return null;
      return result.filePath || null;
    }

    const basePath = this.getVaultBasePath();
    return basePath ? `${basePath}/${project.path}/${defaultName}` : `${project.path}/${defaultName}`;
  }

  /** Write text either to an absolute filesystem path or into the vault. */
  async writeText(targetPath, content) {
    const basePath = this.getVaultBasePath();
    if (basePath && targetPath.startsWith(basePath)) {
      const rel = targetPath.slice(basePath.length + 1);
      if (this.app.vault?.adapter?.write) {
        await this.app.vault.adapter.write(rel, content);
        return;
      }
    }
    if (/^(\/|[A-Za-z]:[\\/])/.test(targetPath)) {
      const fsPromises = require("fs/promises");
      await fsPromises.writeFile(targetPath, content, "utf8");
      return;
    }
    // Vault-relative fallback (e.g. mobile, no filesystem adapter)
    const existing = this.app.vault.getAbstractFileByPath(targetPath);
    if (existing) await this.app.vault.modify(existing, content);
    else await this.app.vault.create(targetPath, content);
  }

  /** Reveal the exported file in the system file manager (desktop only). */
  revealInFolder(targetPath) {
    try {
      if (!/^(\/|[A-Za-z]:[\\/])/.test(targetPath)) return;
      let shell = null;
      try { shell = require("electron")?.shell; } catch {}
      if (!shell) shell = this.getElectronApi()?.shell;
      if (shell?.showItemInFolder) shell.showItemInFolder(targetPath);
    } catch {
      // best-effort; ignore
    }
  }

  getVaultBasePath() {
    const adapter = this.app.vault?.adapter;
    if (adapter instanceof FileSystemAdapter) {
      return adapter.getBasePath();
    }
    return null;
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
}
