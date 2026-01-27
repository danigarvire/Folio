/**
 * Novelist Settings Tab
 */

import { PluginSettingTab, Setting } from 'obsidian';

export class NovelistSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const el = this.containerEl;
    el.empty();

    el.createEl("h2", { text: "Novelist Settings" });

    new Setting(el)
      .setName("Books base path")
      .setDesc("Folder where all books are stored")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.basePath)
          .onChange(async (value) => {
            this.plugin.settings.basePath =
              value.trim() || "projects";
            await this.plugin.saveSettings();
            await this.plugin.refresh();
          })
      );
  }
}
