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
            "Watch live stats: streak, words today, total vs. target, completion. Click “Writing stats” for the full panel — streaks, peak day, Words/Pages over Week/Month/Year, and a daily goal.",
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
        icon: "layers",
        title: "Drafts & the current draft",
        blocks: [
          { type: "p", text: "A draft is the manuscript you write in — a folder of chapters or episodes, or a single screenplay/essay file. A project can hold several drafts." },
          { type: "ul", items: [
            "Drafts live together on a “Drafts” shelf folder, so your project root stays tidy.",
            "Exactly one draft is the current draft — it drives the outline strip, beats and timeline.",
            "The current draft shows a CURRENT badge in the tree; other drafts show a quiet dot.",
            "Switch with the draft dropdown in the strip toolbar, or right-click a draft → “Set as current draft”.",
            "Mark any folder or file as a draft by right-clicking it, or set the draft target when editing a template."
          ] },
          { type: "tip", text: "Everything outside the current draft — characters, research, notes — stays out of the outline and stats workflow, so the strip only ever shows your manuscript." }
        ]
      },
      {
        icon: "circle-dot",
        title: "Track scene status",
        blocks: [
          { type: "p", text: "Give each scene or chapter a writing status so you can see progress at a glance:" },
          { type: "ul", items: [
            "A coloured dot sits at the end of each file row.",
            "Click the dot to cycle: To-do → Draft → Revised → Final → none.",
            "Or right-click a file and pick a Status.",
            "Colours: To-do (grey), Draft (amber), Revised (blue), Final (green)."
          ] },
          { type: "tip", text: "The status is saved to the file's frontmatter (status:), so it travels with the file and survives reordering." }
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
        icon: "gantt-chart",
        title: "The outline strip",
        blocks: [
          { type: "p", text: "A page-scaled strip sits above your script (and at the top of the Beat Board), mirroring Final Draft's Outline Editor:" },
          { type: "ul", items: [
            "Planning lanes (Lane 1, Lane 2…) hold free beats — arcs and subplots you position and resize over the page scale. Double-click a lane to add one, drag to move, drag an edge to resize, click to edit (title, goal, notes, colour).",
            "The Draft lane below is built from the current draft's scenes, sized by length — a live map of the manuscript.",
            "A playhead follows your cursor and the ruler marks pages; drag the zoom slider to rescale.",
            "Toolbar (left): a Split menu, build-outline, Writer Tools and Focus Mode — plus “+ lane” and the current-draft switcher. Switching views lives in the single Views menu in the document header (next to Obsidian's edit/read toggle): Normal / Numbered / Paged, Beat Board, and more soon. Views in the header, tools in the strip."
          ] },
          { type: "tip", text: "Beats are saved per draft, so each draft keeps its own planning. The strip follows the current draft no matter which file you have open." }
        ]
      },
      {
        icon: "book-open",
        title: "Paged View (real pages)",
        blocks: [
          { type: "p", text: "Paged View shows the current draft as real US-Letter pages — what you'll export. Open it from the Views menu in the document header (next to Obsidian's edit/read toggle), or run “Open Paged View”." },
          { type: "ul", items: [
            "Screenplay drafts get a continuous, natively-typed editor with industry formatting (Courier, scene/character/dialogue indents) and real page breaks — type, and the pages reflow.",
            "Page numbers, the strip ruler and the PDF all use one shared engine, so a scene on page 12 is on page 12 everywhere.",
            "Click a scene in the strip to jump straight to it in the pages; the playhead shows where you are.",
            "Prose drafts show a page preview (click a line to edit) — continuous prose typing comes later."
          ] },
          { type: "tip", text: "Three document modes, all from the Views menu: Normal = the plain editor; Numbered = the editor with page-break markers + page numbers; Paged = these real sheets. The frontmatter is hidden in Paged mode; edit it in Normal/Numbered." }
        ]
      },
      {
        icon: "layout-dashboard",
        title: "Beat board",
        blocks: [
          { type: "p", text: "A freeform corkboard of the same beats as the strip — for brainstorming structure as movable cards:" },
          { type: "ul", items: [
            "Open it from the strip's dashboard button, or run “Open Beat Board”.",
            "Drag cards anywhere, drag a corner to resize, click to edit, and use “+ Beat” to add.",
            "Cards are coloured and grouped by lane (Lane 1, Lane 2…), matching the strip.",
            "The outline strip is pinned at the top of the board too, so structure stays in view while you think."
          ] },
          { type: "tip", text: "Edits sync both ways with the strip in real time. From a beat you can “Send to script” to drop an arc marker into the manuscript." }
        ]
      },
      {
        icon: "arrow-left-right",
        title: "Outline ⇄ draft, both ways",
        blocks: [
          { type: "p", text: "Move between planning and prose without losing work — both directions are non-destructive:" },
          { type: "ul", items: [
            "“Build outline from draft” writes every scene heading of the current draft into your Outline file as editable headers. Write notes under each; re-running keeps them.",
            "“Build new draft from outline” does the reverse: it turns the Outline file into a brand-new draft on the Drafts shelf and makes it current — your original draft is untouched.",
            "A single outline group becomes a single-file draft; several groups become a folder of files."
          ] },
          { type: "tip", text: "Run both from the command palette, or use the list-tree button in the strip toolbar." }
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
          { type: "p", text: "You usually don't add this by hand: Film/TV templates already mark the draft as screenplay (Settings → Template options → the “Screenplay format” selector), so new files in the draft are formatted automatically. The “New file” dialog also has a Screenplay toggle." },
          { type: "tip", text: "Exporting a screenplay to PDF lays it out as true script pages (US-Letter, Courier, standard margins) using the same engine as Paged View — so the PDF's pages match what you see. Final Draft (.fdx) export uses the same heading mapping." }
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
            "Sigues las estadísticas en vivo: racha, palabras de hoy, total frente al objetivo, progreso. Pulsa «Writing stats» para el panel completo — rachas, día punta, Words/Pages por Semana/Mes/Año y una meta diaria.",
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
        icon: "layers",
        title: "Borradores y el borrador actual",
        blocks: [
          { type: "p", text: "Un borrador es el manuscrito en el que escribes: una carpeta de capítulos o episodios, o un único archivo de guion/ensayo. Un proyecto puede tener varios borradores." },
          { type: "ul", items: [
            "Los borradores conviven en una carpeta «Drafts» (estante), así la raíz del proyecto queda ordenada.",
            "Solo un borrador es el borrador actual: es el que alimenta la tira de esquema, los beats y la línea de tiempo.",
            "El borrador actual muestra una insignia CURRENT en el árbol; los demás muestran un punto discreto.",
            "Cámbialo con el desplegable de borrador en la barra de la tira, o haz clic derecho en un borrador → «Set as current draft».",
            "Marca cualquier carpeta o archivo como borrador con clic derecho, o fija el borrador objetivo al editar una plantilla."
          ] },
          { type: "tip", text: "Todo lo que está fuera del borrador actual —personajes, documentación, notas— queda fuera del flujo de esquema y estadísticas, así que la tira solo muestra tu manuscrito." }
        ]
      },
      {
        icon: "circle-dot",
        title: "Estado de cada escena",
        blocks: [
          { type: "p", text: "Asigna a cada escena o capítulo un estado de escritura para ver tu progreso de un vistazo:" },
          { type: "ul", items: [
            "Un punto de color aparece al final de cada fila de archivo.",
            "Haz clic en el punto para ciclar: To-do → Draft → Revised → Final → ninguno.",
            "O haz clic derecho en un archivo y elige un Estado.",
            "Colores: To-do (gris), Draft (ámbar), Revised (azul), Final (verde)."
          ] },
          { type: "tip", text: "El estado se guarda en el frontmatter del archivo (status:), así que viaja con él y sobrevive al reordenar." }
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
        icon: "gantt-chart",
        title: "La tira de esquema",
        blocks: [
          { type: "p", text: "Una tira escalada por páginas se sitúa sobre tu guion (y en la parte superior del Beat Board), inspirada en el Editor de esquema de Final Draft:" },
          { type: "ul", items: [
            "Los carriles de planificación (Lane 1, Lane 2…) contienen beats libres: arcos y subtramas que colocas y redimensionas sobre la escala de páginas. Doble clic en un carril para añadir, arrastra para mover, arrastra un borde para redimensionar, clic para editar (título, objetivo, notas, color).",
            "El carril Draft de abajo se construye con las escenas del borrador actual, dimensionadas por longitud: un mapa vivo del manuscrito.",
            "Un cursor (playhead) sigue tu posición y la regla marca las páginas; arrastra el control de zoom para reescalar.",
            "Barra (izquierda): un menú Split, construir esquema, Herramientas de escritura y Modo enfoque — además de «+ lane» y el selector de borrador actual. El cambio de vista vive en un único menú Views en la cabecera del documento (junto al toggle de edición/lectura de Obsidian): Normal / Numbered / Paged, Beat Board, y más pronto. Vistas en la cabecera, herramientas en el strip."
          ] },
          { type: "tip", text: "Los beats se guardan por borrador, así cada borrador conserva su planificación. La tira sigue al borrador actual sin importar qué archivo tengas abierto." }
        ]
      },
      {
        icon: "book-open",
        title: "Vista paginada (páginas reales)",
        blocks: [
          { type: "p", text: "La Vista paginada muestra el borrador actual como páginas reales US-Letter — lo que vas a exportar. Ábrela desde el menú Views en la cabecera del documento (junto al toggle de edición/lectura de Obsidian), o ejecuta «Open Paged View»." },
          { type: "ul", items: [
            "Los guiones tienen un editor continuo, de escritura nativa, con formato profesional (Courier, sangrías de escena/personaje/diálogo) y saltos de página reales — escribes y las páginas se recomponen.",
            "Los números de página, la regla de la tira y el PDF usan un mismo motor, así que una escena en la página 12 está en la 12 en todas partes.",
            "Haz clic en una escena de la tira para saltar a ella en las páginas; el playhead muestra dónde estás.",
            "Los borradores en prosa muestran una previsualización paginada (clic en una línea para editar) — la escritura continua de prosa llegará más adelante."
          ] },
          { type: "tip", text: "Tres modos de documento, todos en el menú Views: Normal = el editor liso; Numbered = el editor con marcas de salto y números de página; Paged = estas hojas reales. El frontmatter se oculta en modo Paged; edítalo en Normal/Numbered." }
        ]
      },
      {
        icon: "layout-dashboard",
        title: "Beat board",
        blocks: [
          { type: "p", text: "Un tablero libre con los mismos beats que la tira — para idear la estructura como tarjetas movibles:" },
          { type: "ul", items: [
            "Ábrelo desde el botón de panel de la tira, o ejecuta «Open Beat Board».",
            "Arrastra las tarjetas a cualquier sitio, arrastra una esquina para redimensionar, clic para editar y usa «+ Beat» para añadir.",
            "Las tarjetas se colorean y agrupan por carril (Lane 1, Lane 2…), igual que la tira.",
            "La tira de esquema también queda fijada arriba del tablero, así la estructura permanece a la vista mientras piensas."
          ] },
          { type: "tip", text: "Las ediciones se sincronizan en ambos sentidos con la tira en tiempo real. Desde un beat puedes «Send to script» para insertar un marcador de arco en el manuscrito." }
        ]
      },
      {
        icon: "arrow-left-right",
        title: "Esquema ⇄ borrador, en ambos sentidos",
        blocks: [
          { type: "p", text: "Muévete entre la planificación y la prosa sin perder trabajo — ambas direcciones son no destructivas:" },
          { type: "ul", items: [
            "«Build outline from draft» escribe cada encabezado de escena del borrador actual en tu archivo Outline como encabezados editables. Escribe notas bajo cada uno; al repetir se conservan.",
            "«Build new draft from outline» hace lo contrario: convierte el archivo Outline en un borrador nuevo en el estante «Drafts» y lo marca como actual — tu borrador original queda intacto.",
            "Un solo grupo del esquema crea un borrador de un archivo; varios grupos crean una carpeta de archivos."
          ] },
          { type: "tip", text: "Ejecuta ambos desde la paleta de comandos, o usa el botón de árbol (list-tree) en la barra de la tira." }
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
          { type: "p", text: "Normalmente no lo añades a mano: las plantillas de Película/TV ya marcan el borrador como guion (Ajustes → Opciones de plantilla → el selector «Screenplay format»), así que los archivos nuevos del borrador se formatean solos. El diálogo «New file» también tiene un interruptor de Guion." },
          { type: "tip", text: "Al exportar un guion a PDF se compone como páginas de guion reales (US-Letter, Courier, márgenes estándar) con el mismo motor que la Vista paginada — así el PDF coincide con lo que ves. El export a Final Draft (.fdx) usa la misma correspondencia de encabezados." }
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
