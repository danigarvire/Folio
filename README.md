# Folio (Obsidian Plugin)

Folio is an Obsidian plugin for long‑form writing projects (books, scripts, essays, films). It provides a project‑centric view, a structured outline/tree, and a focus mode for drafting.

## What it does today
- Project-based workspace with custom folder structures per project type.
- Folio view with cover placeholder, title/subtitle, author/description, and project stats.
- Tree/outline view with drag-and-drop structure and context actions.
- Focus Mode with timer, session stats, and a Focus Mode Stats modal.
- Basic word-count stats tracking per project.

## Project structure (high level)
- `src/main.js` — plugin entry, events, and orchestration.
- `src/views/` — UI views (Folio view, Writer Tools view, settings view).
- `src/services/` — config, tree, and stats services.
- `src/modals/` — modals (new project, manage, focus stats, etc).
- `styles.css` — UI styling.

## Writer Tools view (current vs planned)
The Writer Tools view is intentionally ahead of implementation. Most buttons are placeholders to define the UX layout.

Implemented
- Focus Mode (timer, session stats, Focus Mode Stats modal).

Planned / Not active yet
- Export Assistant: "Consolidate document".
- Resources grid: Character, Narrative, Structure, Tips.
- About: Support + Contact.
- Additional focus‑mode analytics (older sessions / history drill‑down).

## Support
Folio is free and open-source.
If you find it useful, you can support development here:
☕ Buy Me a Coffee: https://buymeacoffee.com/danielgarvire

## Roadmap (near‑term)
- Export assistant pipeline (compile to single doc, format presets).
- Resources content system (built‑in guides + user‑added references).
- Focus Mode history view and analytics.
- Polished onboarding, docs, and sample templates.
- More project types and template customization.

## Development
- Build: `npm run build`
- Dev: `npm run dev`

---

Folio is under active development; expect UI to evolve as features land.
