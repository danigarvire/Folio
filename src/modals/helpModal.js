const { Modal } = require("obsidian");

export class HelpModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("folio-help-modal");
    contentEl.createEl("h2", { text: "Help" });
    contentEl.createEl("p", {
      cls: "help-lead",
      text: "Folio is a project-based writing workspace for long-form projects such as books, screenplays, and series. It keeps drafts, structure, and reference tools together so you can focus on writing instead of managing files."
    });

    const tabs = contentEl.createDiv({ cls: "help-tabs" });
    const basicsTab = tabs.createEl("button", { cls: "help-tab is-active", text: "Basics" });
    const advancedTab = tabs.createEl("button", { cls: "help-tab", text: "Advanced" });

    const basicsPane = contentEl.createDiv({ cls: "help-tab-pane is-active" });
    const advancedPane = contentEl.createDiv({ cls: "help-tab-pane" });

    const setActiveTab = (tab) => {
      const isBasics = tab === "basics";
      basicsTab.toggleClass("is-active", isBasics);
      advancedTab.toggleClass("is-active", !isBasics);
      basicsPane.toggleClass("is-active", isBasics);
      advancedPane.toggleClass("is-active", !isBasics);
    };

    basicsTab.addEventListener("click", () => setActiveTab("basics"));
    advancedTab.addEventListener("click", () => setActiveTab("advanced"));

    const basicsGrid = basicsPane.createDiv({ cls: "help-card-grid" });

    const card1 = basicsGrid.createDiv({ cls: "help-card" });
    card1.createEl("h3", { text: "Getting started (first 2 minutes)" });
    card1.createEl("p", { text: "Create your first project:" });
    const steps = card1.createEl("ol");
    steps.createEl("li", { text: "Open Folio from the left ribbon (book icon)." });
    steps.createEl("li", { text: "Click New Project." });
    steps.createEl("li", { text: "Choose a project type (Book, Script, Film, TV, etc.)." });
    steps.createEl("li", { text: "A structured folder and outline are created automatically." });
    card1.createEl("p", { text: "You write in normal Markdown files — Folio just organizes them for you." });

    const card2 = basicsGrid.createDiv({ cls: "help-card" });
    card2.createEl("h3", { text: "Folio View (project dashboard)" });
    card2.createEl("p", { text: "The Folio View is your project’s control center:" });
    const dash = card2.createEl("ul");
    dash.createEl("li", { text: "Edit project metadata (title, description, cover)." });
    dash.createEl("li", { text: "Track live word-count stats." });
    dash.createEl("li", { text: "Navigate your structure." });
    dash.createEl("li", { text: "Open Writer Tools (Focus Mode, Export, Resources)." });
    card2.createEl("p", { text: "Think of this as your project home, not a document." });

    const card3 = basicsGrid.createDiv({ cls: "help-card" });
    card3.createEl("h3", { text: "Outline & structure" });
    card3.createEl("p", { text: "Projects are organized as a hierarchy:" });
    const outline = card3.createEl("ul");
    outline.createEl("li", { text: "Chapters/scenes appear in a tree." });
    outline.createEl("li", { text: "Drag and drop to reorder." });
    outline.createEl("li", { text: "Nest items to reflect structure." });
    outline.createEl("li", { text: "Right-click any item for actions." });
    card3.createEl("p", { text: "This helps you focus on structure and flow, not filenames." });

    const card4 = basicsGrid.createDiv({ cls: "help-card" });
    card4.createEl("h3", { text: "Writing & Focus Mode" });
    card4.createEl("p", { text: "Focus Mode is for drafting sessions:" });
    const focus = card4.createEl("ul");
    focus.createEl("li", { text: "Writer Tools → Focus Mode" });
    focus.createEl("li", { text: "Distraction-free writing" });
    focus.createEl("li", { text: "Session timer" });
    focus.createEl("li", { text: "Session word count and stats" });
    card4.createEl("p", { text: "Use Focus Mode when you want to write, not plan." });

    const advancedGrid = advancedPane.createDiv({ cls: "help-card-grid" });

    const card5 = advancedGrid.createDiv({ cls: "help-card" });
    card5.createEl("h3", { text: "Writer Tools & Export" });
    card5.createEl("p", { text: "Export Assistant:" });
    const exportList = card5.createEl("ul");
    exportList.createEl("li", { text: "Consolidate your project into a single document or PDF." });
    exportList.createEl("li", { text: "Works for prose and screenplay projects." });
    exportList.createEl("li", { text: "Customize layout in PDF Settings." });
    card5.createEl("p", { text: "Writing resources:" });
    const resources = card5.createEl("ul");
    resources.createEl("li", { text: "Characters" });
    resources.createEl("li", { text: "Narrative" });
    resources.createEl("li", { text: "Structure" });
    resources.createEl("li", { text: "Tips" });

    const card6 = advancedGrid.createDiv({ cls: "help-card" });
    card6.createEl("h3", { text: "Screenplay mode (Markdown → screenplay)" });
    card6.createEl("p", { text: "Enable screenplay formatting by adding this frontmatter to a scene file:" });
    card6.createEl("pre", { cls: "help-code", text: "---\ncssclass: md-screenplay\n---" });
    card6.createEl("p", { text: "(or folio-screenplay)" });
    card6.createEl("p", { text: "Heading mapping:" });
    const map = card6.createEl("ul");
    map.createEl("li", { text: "#  → Scene heading" });
    map.createEl("li", { text: "## → Character" });
    map.createEl("li", { text: "### → Parenthetical" });
    map.createEl("li", { text: "#### → Transition" });
    map.createEl("li", { text: "##### → Act / Section" });
    card6.createEl("p", { text: "No external plugins required. Works in editing and PDF export." });

    const footer = contentEl.createDiv({ cls: "help-footer-note" });
    footer.createEl("p", { text: "Good to know:" });
    const footerList = footer.createEl("ul");
    footerList.createEl("li", { text: "Folio does not lock you in — files remain standard Markdown." });
    footerList.createEl("li", { text: "Projects coexist safely with the rest of your vault." });
    footerList.createEl("li", { text: "Keep vault backups. The plugin is provided as-is." });
  }
}
