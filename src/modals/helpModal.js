const { Modal } = require("obsidian");

export class HelpModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Help" });
    contentEl.createEl("p", { text: "TBD" });
  }
}
