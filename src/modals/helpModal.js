import { Modal, setIcon } from "obsidian";

/**
 * Bilingual (EN/ES) help content. Each card is data-driven: an icon, a title
 * and an ordered list of blocks (paragraph / list / code / tip) so both
 * languages stay symmetric and the modal is easy to extend.
 */
const HELP_CONTENT = {
  en: {
    title: "Help",
    lead: "Folio is a calm, project-based home for long-form writing — novels, screenplays, series and essays. It keeps your drafts, structure, stats and reference tools in one place so your energy goes into the writing, not into wrangling files.",
    tabs: { basics: "Basics", advanced: "Advanced" },
    basics: [
      {
        icon: "rocket",
        title: "Getting started",
        blocks: [
          { type: "p", text: "Folio turns a folder of notes into a writing project. To create one:" },
          { type: "ol", items: [
            "Open Folio from the left ribbon (the book icon).",
            "Click New Project and give it a name.",
            "Pick a type — Book, Film, TV series or Essay.",
            "Folio builds the folder structure and a starting outline for you."
          ] },
          { type: "tip", text: "Everything stays as plain Markdown in your vault. Folio only organizes and tracks your files — you can still edit them anywhere." }
        ]
      },
      {
        icon: "layout-dashboard",
        title: "Your project dashboard",
        blocks: [
          { type: "p", text: "The Folio View in the left sidebar is your project's home base:" },
          { type: "ul", items: [
            "See the title, author, description and cover at a glance.",
            "Watch live stats: words today, total vs. target, completion and writing streak.",
            "Browse and open every part of the manuscript.",
            "Jump to Writer Tools for Focus Mode and Export."
          ] },
          { type: "tip", text: "Use Switch to move between projects, and Manage to rename or remove them." }
        ]
      },
      {
        icon: "list-tree",
        title: "Structure & outline",
        blocks: [
          { type: "p", text: "Your manuscript is shown as an outline tree, not a flat file list:" },
          { type: "ul", items: [
            "Drag and drop chapters or scenes to reorder them.",
            "Drop an item onto a folder to nest it inside.",
            "Right-click anything for actions: new file, rename, duplicate, or delete.",
            "Use “Exclude from stats” to keep notes or research out of the word count."
          ] },
          { type: "tip", text: "Reordering also moves the files on disk, so your outline and your vault always match. Deletions go to the trash, not gone for good." }
        ]
      },
      {
        icon: "focus",
        title: "Drafting with Focus Mode",
        blocks: [
          { type: "p", text: "Focus Mode is a distraction-free space for writing sessions:" },
          { type: "ul", items: [
            "Open it from Writer Tools, or run “Open Focus Mode” from the command palette.",
            "Set a session length and a word goal.",
            "A timer and a live session word count keep you moving.",
            "Review how the session went in the stats summary afterwards."
          ] },
          { type: "tip", text: "Words written during a session are tracked per day, so your streak and daily average stay accurate." }
        ]
      }
    ],
    advanced: [
      {
        icon: "file-output",
        title: "Exporting your work",
        blocks: [
          { type: "p", text: "Open Writer Tools → Export Assistant to turn a project into a finished file:" },
          { type: "ul", items: [
            "PDF — live preview, page size, fonts, margins, cover and table of contents.",
            "Final Draft (.fdx) — for screenplays; a save dialog lets you choose where it goes.",
            "Choose exactly which files to include, in outline order."
          ] },
          { type: "tip", text: "You can also run “Export current project to Final Draft” straight from the command palette." }
        ]
      },
      {
        icon: "book-open",
        title: "Writing resources",
        blocks: [
          { type: "p", text: "Writer Tools includes reference material you can keep open while you write:" },
          { type: "ul", items: [
            "Characters — archetypes and character-arc shapes.",
            "Narrative — techniques and devices.",
            "Structure — story models and frameworks.",
            "Tips — practical advice and common pitfalls."
          ] },
          { type: "tip", text: "These resources are bilingual — switch between EN and ES with the toggle, just like this Help." }
        ]
      },
      {
        icon: "clapperboard",
        title: "Screenplay formatting",
        blocks: [
          { type: "p", text: "Format any scene as a screenplay by adding this to its frontmatter:" },
          { type: "code", text: "---\ncssclass: md-screenplay\n---" },
          { type: "p", text: "(folio-screenplay works too.) Then write using headings:" },
          { type: "ul", items: [
            "#  → Scene heading",
            "## → Character",
            "### → Parenthetical",
            "#### → Transition",
            "##### → Act / Section"
          ] },
          { type: "tip", text: "The same mapping is used when exporting to PDF and Final Draft — no external plugins required." }
        ]
      }
    ],
    footerTitle: "Good to know",
    footer: [
      "Your writing never leaves Markdown — uninstalling Folio leaves every file intact.",
      "Projects live in their own folders and stay out of the way of the rest of your vault.",
      "Keep regular backups. Folio is provided as-is, without warranty."
    ]
  },

  es: {
    title: "Ayuda",
    lead: "Folio es un hogar tranquilo y por proyectos para la escritura de formato largo: novelas, guiones, series y ensayos. Reúne tus borradores, la estructura, las estadísticas y las herramientas de referencia en un solo sitio para que tu energía vaya a escribir, no a pelear con archivos.",
    tabs: { basics: "Básico", advanced: "Avanzado" },
    basics: [
      {
        icon: "rocket",
        title: "Primeros pasos",
        blocks: [
          { type: "p", text: "Folio convierte una carpeta de notas en un proyecto de escritura. Para crear uno:" },
          { type: "ol", items: [
            "Abre Folio desde la barra lateral izquierda (el icono de libro).",
            "Pulsa Nuevo proyecto y dale un nombre.",
            "Elige un tipo: Libro, Película, Serie o Ensayo.",
            "Folio crea la estructura de carpetas y un esquema inicial por ti."
          ] },
          { type: "tip", text: "Todo se queda como Markdown normal en tu vault. Folio solo organiza y hace seguimiento de tus archivos; puedes seguir editándolos donde quieras." }
        ]
      },
      {
        icon: "layout-dashboard",
        title: "El panel de tu proyecto",
        blocks: [
          { type: "p", text: "La Vista Folio de la barra lateral izquierda es el centro de tu proyecto:" },
          { type: "ul", items: [
            "Ves de un vistazo el título, el autor, la descripción y la portada.",
            "Sigues las estadísticas en vivo: palabras de hoy, total frente al objetivo, progreso y racha.",
            "Recorres y abres cada parte del manuscrito.",
            "Saltas a las Herramientas de escritura para el Modo enfoque y la Exportación."
          ] },
          { type: "tip", text: "Usa Cambiar para moverte entre proyectos, y Gestionar para renombrarlos o eliminarlos." }
        ]
      },
      {
        icon: "list-tree",
        title: "Estructura y esquema",
        blocks: [
          { type: "p", text: "Tu manuscrito se muestra como un árbol de esquema, no como una lista plana de archivos:" },
          { type: "ul", items: [
            "Arrastra y suelta capítulos o escenas para reordenarlos.",
            "Suelta un elemento sobre una carpeta para anidarlo dentro.",
            "Haz clic derecho en cualquier cosa para acciones: nuevo archivo, renombrar, duplicar o eliminar.",
            "Usa «Excluir de las estadísticas» para dejar fuera del recuento notas o documentación."
          ] },
          { type: "tip", text: "Al reordenar también se mueven los archivos en disco, así que tu esquema y tu vault siempre coinciden. Lo que borras va a la papelera, no se pierde." }
        ]
      },
      {
        icon: "focus",
        title: "Escribir con el Modo enfoque",
        blocks: [
          { type: "p", text: "El Modo enfoque es un espacio sin distracciones para las sesiones de escritura:" },
          { type: "ul", items: [
            "Ábrelo desde las Herramientas de escritura, o ejecuta «Abrir Modo enfoque» desde la paleta de comandos.",
            "Fija una duración de sesión y un objetivo de palabras.",
            "Un temporizador y el recuento de palabras en vivo te mantienen en marcha.",
            "Después repasas cómo fue la sesión en el resumen de estadísticas."
          ] },
          { type: "tip", text: "Las palabras que escribes en una sesión se registran por día, así que tu racha y tu media diaria se mantienen exactas." }
        ]
      }
    ],
    advanced: [
      {
        icon: "file-output",
        title: "Exportar tu trabajo",
        blocks: [
          { type: "p", text: "Abre Herramientas de escritura → Asistente de exportación para convertir un proyecto en un archivo final:" },
          { type: "ul", items: [
            "PDF — vista previa en vivo, tamaño de página, fuentes, márgenes, portada e índice.",
            "Final Draft (.fdx) — para guiones; un diálogo te deja elegir dónde guardarlo.",
            "Eliges exactamente qué archivos incluir, en el orden del esquema."
          ] },
          { type: "tip", text: "También puedes ejecutar «Exportar el proyecto actual a Final Draft» directamente desde la paleta de comandos." }
        ]
      },
      {
        icon: "book-open",
        title: "Recursos de escritura",
        blocks: [
          { type: "p", text: "Las Herramientas de escritura incluyen material de referencia que puedes tener abierto mientras escribes:" },
          { type: "ul", items: [
            "Personajes — arquetipos y formas de arco de personaje.",
            "Narrativa — técnicas y recursos.",
            "Estructura — modelos y marcos de historia.",
            "Consejos — ideas prácticas y errores frecuentes."
          ] },
          { type: "tip", text: "Estos recursos son bilingües — alterna entre EN y ES con el botón, igual que esta Ayuda." }
        ]
      },
      {
        icon: "clapperboard",
        title: "Formato de guion",
        blocks: [
          { type: "p", text: "Da formato de guion a cualquier escena añadiendo esto a su frontmatter:" },
          { type: "code", text: "---\ncssclass: md-screenplay\n---" },
          { type: "p", text: "(folio-screenplay también sirve.) Luego escribe con encabezados:" },
          { type: "ul", items: [
            "#  → Encabezado de escena",
            "## → Personaje",
            "### → Acotación",
            "#### → Transición",
            "##### → Acto / Sección"
          ] },
          { type: "tip", text: "La misma correspondencia se usa al exportar a PDF y a Final Draft — sin plugins externos." }
        ]
      }
    ],
    footerTitle: "Bueno saber",
    footer: [
      "Tu escritura nunca deja de ser Markdown — desinstalar Folio deja todos los archivos intactos.",
      "Los proyectos viven en sus propias carpetas y no estorban al resto de tu vault.",
      "Haz copias de seguridad con regularidad. Folio se ofrece tal cual, sin garantía."
    ]
  }
};

export class HelpModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.lang = plugin.settings?.resourceLanguage === "es" ? "es" : "en";
    this.activeTab = "basics";
  }

  onOpen() {
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("folio-help-modal");
    const c = HELP_CONTENT[this.lang] || HELP_CONTENT.en;

    // Header: title + language toggle
    const header = contentEl.createDiv({ cls: "help-header" });
    header.createEl("h2", { text: c.title });
    this.renderLangToggle(header);

    contentEl.createEl("p", { cls: "help-lead", text: c.lead });

    // Tabs
    const tabs = contentEl.createDiv({ cls: "help-tabs" });
    const basicsTab = tabs.createEl("button", {
      cls: "help-tab" + (this.activeTab === "basics" ? " is-active" : ""),
      text: c.tabs.basics
    });
    const advancedTab = tabs.createEl("button", {
      cls: "help-tab" + (this.activeTab === "advanced" ? " is-active" : ""),
      text: c.tabs.advanced
    });

    const basicsPane = contentEl.createDiv({ cls: "help-tab-pane" + (this.activeTab === "basics" ? " is-active" : "") });
    const advancedPane = contentEl.createDiv({ cls: "help-tab-pane" + (this.activeTab === "advanced" ? " is-active" : "") });

    const setActiveTab = (tab) => {
      this.activeTab = tab;
      const isBasics = tab === "basics";
      basicsTab.toggleClass("is-active", isBasics);
      advancedTab.toggleClass("is-active", !isBasics);
      basicsPane.toggleClass("is-active", isBasics);
      advancedPane.toggleClass("is-active", !isBasics);
    };
    basicsTab.addEventListener("click", () => setActiveTab("basics"));
    advancedTab.addEventListener("click", () => setActiveTab("advanced"));

    const basicsGrid = basicsPane.createDiv({ cls: "help-card-grid" });
    c.basics.forEach((card) => this.renderCard(basicsGrid, card));

    const advancedGrid = advancedPane.createDiv({ cls: "help-card-grid" });
    c.advanced.forEach((card) => this.renderCard(advancedGrid, card));

    // Footer
    const footer = contentEl.createDiv({ cls: "help-footer-note" });
    footer.createEl("p", { cls: "help-footer-title", text: c.footerTitle });
    const footerList = footer.createEl("ul");
    c.footer.forEach((item) => footerList.createEl("li", { text: item }));
  }

  renderCard(grid, card) {
    const el = grid.createDiv({ cls: "help-card" });
    const cardHeader = el.createDiv({ cls: "help-card-header" });
    const icon = cardHeader.createSpan({ cls: "help-card-icon" });
    try { setIcon(icon, card.icon); } catch {}
    cardHeader.createEl("h3", { text: card.title });
    this.renderBlocks(el, card.blocks);
  }

  renderBlocks(parent, blocks) {
    for (const block of blocks || []) {
      if (block.type === "p") {
        parent.createEl("p", { text: block.text });
      } else if (block.type === "code") {
        parent.createEl("pre", { cls: "help-code", text: block.text });
      } else if (block.type === "tip") {
        parent.createDiv({ cls: "help-tip", text: block.text });
      } else if (block.type === "ul" || block.type === "ol") {
        const list = parent.createEl(block.type);
        (block.items || []).forEach((item) => list.createEl("li", { text: item }));
      }
    }
  }

  renderLangToggle(parent) {
    const toggle = parent.createDiv({ cls: "resource-lang-toggle" });
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language");

    [{ code: "en", label: "EN" }, { code: "es", label: "ES" }].forEach((opt) => {
      const btn = toggle.createEl("button", {
        cls: "resource-lang-btn" + (this.lang === opt.code ? " is-active" : ""),
        text: opt.label
      });
      btn.setAttribute("aria-pressed", String(this.lang === opt.code));
      btn.addEventListener("click", async () => {
        if (this.lang === opt.code) return;
        this.lang = opt.code;
        if (this.plugin.settings) {
          this.plugin.settings.resourceLanguage = opt.code;
          await this.plugin.saveSettings?.();
        }
        this.render();
      });
    });
  }
}
