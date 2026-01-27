/**
 * Writer Tools Registry - Registro central de todas las herramientas
 */

// Aquí se registrarán todas las herramientas disponibles
// import { FocusTool } from './focus/focusTool';
// import { HeroJourneyTool } from './structure/heroJourney';

export const writerTools = [
  // new FocusTool(),
  // new HeroJourneyTool(),
  // etc...
];

// Base class para todas las herramientas
export class WriterTool {
  constructor(id, title, icon) {
    this.id = id;
    this.title = title;
    this.icon = icon;
  }

  // Cada herramienta implementa su propio render
  render(container) {
    throw new Error('render() must be implemented by subclass');
  }

  // Opcional: cleanup cuando se cierra la herramienta
  destroy() {
    // override if needed
  }
}
