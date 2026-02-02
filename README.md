# Folio (Obsidian Plugin)

Folio is an Obsidian plugin for long-form writing projects such as books, screenplays, TV series, essays, and films.

It introduces a **project-centric writing workflow** that combines structure, drafting tools, and writing reference material—all inside Obsidian.

---

## Core concepts

- **Projects**: Each writing project lives in its own structured workspace.
- **Narrative structure**: Chapters, scenes, or sections are organized as a meaningful hierarchy, not just files.
- **Drafting + reference**: Writing tools and narrative reference material coexist in the same workflow.
- **Focus**: Dedicated tools for distraction-free drafting and writing sessions.

Folio is designed for writers working on complex, long-form material who need more than plain markdown notes, while keeping full control of their files.

---

## What Folio does today

### Project-based workspace
- Create projects with predefined folder structures depending on project type (book, script, etc.).
- Each project has its own root, metadata, and internal organization.
- Projects are self-contained and coexist cleanly with the rest of your vault.

### Folio View (project overview)
- Central project dashboard with:
  - Cover placeholder
  - Title and subtitle
  - Author and description
  - Live project statistics (word count)
- Acts as the main entry point for navigating and managing a project.

### Tree / Outline view
- Hierarchical outline representing chapters, scenes, or sections.
- Drag-and-drop reordering.
- Context actions for managing project files.
- Designed to reflect **narrative structure**, not just folders.

---

## Writer Tools view

The Writer Tools view is a core part of Folio and provides **writing-focused tools and reference material** alongside drafting.

### Characters
- Centralized character reference.
- Designed to keep character information accessible while writing.
- Helps maintain consistency across long-form projects.

### Narrative
- Narrative techniques, devices, and concepts.
- Intended as an in-project reference while planning or revising.
- Useful for both fiction and scripted formats.

### Structure
- Structural models and frameworks (acts, journeys, story shapes).
- Supports planning and analysis of long-form narrative structure.
- Acts as a conceptual guide rather than a rigid template.

### Tips
- Writing advice, best practices, and common pitfalls.
- Focused on practical guidance during the writing process.

### Export Assistant
- Tool to consolidate a project into a single document.
- Designed for exporting or reviewing full drafts outside the vault.

### About
- Plugin information, support links, and contact.

---

## Focus Mode (drafting)

- Distraction-free writing mode.
- Built-in timer for writing sessions.
- Session-based word count tracking.
- Focus Mode Stats modal for reviewing session data.

---

## Screenplay formatting

Notes with frontmatter `cssclass: md-screenplay` (or `cssclass: folio-screenplay`) render in screenplay style.  
Folio bundles a third-party MIT-licensed screenplay CSS snippet for formatting (see Third-party notices).

Designed to separate **drafting time** from planning and management.

---

## Statistics
- Project-level word count tracking.
- Session-level statistics for Focus Mode.

---

## Project structure (developer overview)

High-level structure of the codebase:

- `src/main.js` — plugin entry point, event handling, orchestration.
- `src/views/` — UI views (Folio view, Writer Tools view, settings).
- `src/services/` — configuration, tree management, statistics.
- `src/modals/` — modals (new project, manage project, focus stats).
- `styles.css` — UI styling.

End users install only the compiled release files.

---

## Support

Folio is free and open-source.

If you find it useful, you can optionally support its development here:  
☕ Buy Me a Coffee: https://buymeacoffee.com/danielgarvire

Support is voluntary and does not unlock features or provide special access.

---

## Disclaimer

This plugin is provided "as is", without warranty of any kind.  
The author is not responsible for data loss, corruption, or any unintended behavior.

Use at your own risk and always keep backups of your vault.

---

## No Warranty / No Liability

This plugin is provided without warranties or conditions of any kind.  
In no event shall the author be liable for any claim, damages, or other liability.

---

## Not affiliated with Obsidian

This plugin is an independent project and is not affiliated with, sponsored by, or endorsed by Obsidian.

---

## Third-party notices

- PRO Screenwriting Snippet — Bluemoondragon07 (MIT)
- Lucide Icons — https://lucide.dev

---

## Roadmap (ideas)

- Extended export formatting options.
- Additional narrative frameworks and writing resources.
- Expanded Focus Mode analytics and history.
- Additional project types and customization.

---

Folio is under active development.  
UI and features may evolve as the project grows.
