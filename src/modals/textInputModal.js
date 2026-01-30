const { Modal } = require("obsidian");

export class TextInputModal extends Modal {
  constructor(app, { title, placeholder, cta, onSubmit, toggleLabel = null, toggleDefault = false, toggleKey = "toggle" }) {
    super(app);
    this.title = title;
    this.placeholder = placeholder;
    this.cta = cta;
    this.onSubmit = onSubmit;
    this.toggleLabel = toggleLabel;
    this.toggleDefault = toggleDefault;
    this.toggleKey = toggleKey;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: this.title });

    const input = contentEl.createEl("input", {
      type: "text",
      placeholder: this.placeholder,
    });

    let toggleInput = null;
    if (this.toggleLabel) {
      const toggleRow = contentEl.createDiv({ cls: "modal-toggle-row" });
      toggleInput = toggleRow.createEl("input", { type: "checkbox" });
      toggleInput.checked = !!this.toggleDefault;
      toggleRow.createSpan({ text: this.toggleLabel });
    }

    const actions = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = actions.createEl("button", {
      text: "Cancel",
    });

    const confirmBtn = actions.createEl("button", {
      text: this.cta,
      cls: "mod-cta",
    });

    cancelBtn.onclick = () => this.close();

    confirmBtn.onclick = () => {
      const value = input.value.trim();
      if (!value) return;

      const toggleState = toggleInput ? toggleInput.checked : false;
      this.onSubmit(value, { [this.toggleKey]: toggleState });
      this.close();
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        confirmBtn.click();
      } else if (e.key === "Escape") {
        this.close();
      }
    });

    input.focus();
  }
}
