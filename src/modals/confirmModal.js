const { Modal } = require("obsidian");

export class ConfirmModal extends Modal {
  constructor(app, { title, message, confirmText, onConfirm }) {
    super(app);
    this.title = title;
    this.message = message;
    this.confirmText = confirmText || "Confirm";
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });

    const actions = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = actions.createEl("button", { text: "Cancel" });
    const confirmBtn = actions.createEl("button", {
      text: this.confirmText,
      cls: "mod-warning",
    });

    cancelBtn.onclick = () => this.close();
    confirmBtn.onclick = async () => {
      await this.onConfirm();
      this.close();
    };
  }
}
