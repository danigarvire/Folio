/**
 * Writer Tools View - Panel de herramientas para escritura
 */

import { ItemView } from 'obsidian';

export const WRITER_TOOLS_VIEW_TYPE = "novelist-writer-tools";

export class WriterToolsView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return WRITER_TOOLS_VIEW_TYPE;
  }

  getDisplayText() {
    return "Writer Tools";
  }

  getIcon() {
    return "wrench";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("novelist-writer-tools");

    // Header
    const header = container.createDiv({ cls: "writer-tools-header" });
    header.createEl("h2", { text: "Writer Tools" });

    // Contenedor para las herramientas
    this.toolsContainer = container.createDiv({ cls: "writer-tools-container" });

    // Placeholder inicial (se reemplazará con herramientas)
    this.renderPlaceholder();
  }

  renderPlaceholder() {
    this.toolsContainer.empty();
    const placeholder = this.toolsContainer.createDiv({ cls: "writer-tools-placeholder" });
    placeholder.createEl("p", { 
      text: "Herramientas de escritura cargándose...",
      cls: "writer-tools-placeholder-text"
    });
  }

  async onClose() {
    // Cleanup si hace falta
  }
}
