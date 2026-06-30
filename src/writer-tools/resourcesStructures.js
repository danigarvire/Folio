/**
 * Story-structure reference cards (bilingual EN / ES).
 *
 * Single source of truth for all structure frameworks. Previously these lived as
 * 15 English-only inline configs in WriterToolsView plus 4 in resourcesExtra.js;
 * unified and translated here. Consumed by renderStructureDetail via
 * STRUCTURE_DATA[title][lang].
 */

export const STRUCTURE_DATA = {
  "The Hero's Journey": {
    en: {
      introTitle: "What is the Hero's Journey?",
      intro: ["The Hero's Journey is a mythic structure that frames story as transformation: a character leaves the familiar, faces trials, dies symbolically, and returns changed. It's less a rigid formula than a map for meaning and growth."],
      core: ["A movement from comfort to challenge to return","External trials that force internal change","Symbolic death and rebirth","A concluding “gift” brought back to the world"],
      stepsTitle: "Steps (classic model)",
      stepGroups: [
        { title: "ACT I", items: [
          { title: "Ordinary World", body: "Establish the Hero's baseline life, limitations, and unmet need.", icon: "earth" },
          { title: "Call to Adventure", body: "A disruption offers a mission, opportunity, or threat that demands response.", icon: "phone-incoming" },
          { title: "Refusal of the Call", body: "Fear, duty, or doubt causes hesitation; the Hero resists change.", icon: "phone-off" },
          { title: "Meeting the Mentor", body: "Guidance appears: training, tools, wisdom, or encouragement.", icon: "graduation-cap" },
          { title: "Crossing the First Threshold", body: "The Hero commits and enters the “special world,” leaving the old life behind.", icon: "brick-wall" } ] },
        { title: "ACT II", items: [
          { title: "Tests, Allies, Enemies", body: "The rules of the new world are learned; relationships and rivalries form.", icon: "line-squiggle" },
          { title: "Approach to the Inmost Cave", body: "Preparation for the central crisis; tensions tighten and stakes clarify.", icon: "mountain" },
          { title: "Ordeal", body: "A major confrontation with death, failure, or the deepest fear.", icon: "swords" },
          { title: "Reward (Seizing the Sword)", body: "The Hero gains something: knowledge, power, object, love, or self-belief.", icon: "trophy" } ] },
        { title: "ACT III", items: [
          { title: "The Road Back", body: "Consequences arrive; the Hero must return with the reward under pressure.", icon: "arrow-big-left" },
          { title: "Resurrection", body: "A final test proves transformation. The Hero confronts the core flaw one last time.", icon: "user-round-plus" },
          { title: "Return with the Elixir", body: "The Hero returns changed, bringing value to others: healing, truth, freedom, hope.", icon: "gem" } ] }
      ],
      whyTitle: "Why this works",
      why: "These steps externalize inner change: the world forces the Hero to become someone new.",
      examplesTitle: "Hero's Journey Examples",
      examples: ["Star Wars", "The Matrix", "The Lord of the Rings", "Moana", "Harry Potter"]
    },
    es: {
      introTitle: "¿Qué es el Viaje del Héroe?",
      intro: ["El Viaje del Héroe es una estructura mítica que plantea la historia como transformación: un personaje abandona lo familiar, afronta pruebas, muere simbólicamente y regresa cambiado. Más que una fórmula rígida, es un mapa hacia el sentido y el crecimiento."],
      core: ["Un movimiento de la comodidad al desafío y al regreso","Pruebas externas que fuerzan un cambio interno","Muerte y renacimiento simbólicos","Un “regalo” final que se trae de vuelta al mundo"],
      stepsTitle: "Pasos (modelo clásico)",
      stepGroups: [
        { title: "ACTO I", items: [
          { title: "Mundo Ordinario", body: "Establece la vida de partida del Héroe, sus limitaciones y su necesidad insatisfecha.", icon: "earth" },
          { title: "Llamada a la Aventura", body: "Una alteración ofrece una misión, oportunidad o amenaza que exige una respuesta.", icon: "phone-incoming" },
          { title: "Rechazo de la Llamada", body: "El miedo, el deber o la duda provocan vacilación; el Héroe se resiste al cambio.", icon: "phone-off" },
          { title: "Encuentro con el Mentor", body: "Aparece una guía: entrenamiento, herramientas, sabiduría o aliento.", icon: "graduation-cap" },
          { title: "Cruce del Primer Umbral", body: "El Héroe se compromete y entra en el “mundo especial”, dejando atrás su vida anterior.", icon: "brick-wall" } ] },
        { title: "ACTO II", items: [
          { title: "Pruebas, Aliados, Enemigos", body: "Se aprenden las reglas del nuevo mundo; se forman relaciones y rivalidades.", icon: "line-squiggle" },
          { title: "Acercamiento a la Caverna Más Profunda", body: "Preparación para la crisis central; las tensiones aumentan y lo que está en juego se aclara.", icon: "mountain" },
          { title: "Calvario", body: "Una gran confrontación con la muerte, el fracaso o el miedo más profundo.", icon: "swords" },
          { title: "Recompensa (Apoderarse de la Espada)", body: "El Héroe obtiene algo: conocimiento, poder, un objeto, amor o confianza en sí mismo.", icon: "trophy" } ] },
        { title: "ACTO III", items: [
          { title: "El Camino de Regreso", body: "Llegan las consecuencias; el Héroe debe regresar con la recompensa bajo presión.", icon: "arrow-big-left" },
          { title: "Resurrección", body: "Una prueba final demuestra la transformación. El Héroe se enfrenta a su defecto esencial una última vez.", icon: "user-round-plus" },
          { title: "Regreso con el Elixir", body: "El Héroe regresa cambiado, aportando valor a los demás: sanación, verdad, libertad, esperanza.", icon: "gem" } ] }
      ],
      whyTitle: "Por qué funciona",
      why: "Estos pasos externalizan el cambio interno: el mundo obliga al Héroe a convertirse en alguien nuevo.",
      examplesTitle: "Ejemplos del Viaje del Héroe",
      examples: ["La guerra de las galaxias", "Matrix", "El Señor de los Anillos", "Vaiana", "Harry Potter"]
    }
  },
  "Dan Harmon Story Circle": {
    en: {
      introTitle: "What is the Story Circle?",
      intro: ["The Story Circle compresses transformation into a repeatable loop: a character wants something, leaves comfort, pays a price, and returns changed. It's designed to be practical for episodes as well as features."],
      core: ["Motivation-driven steps","Clear cause-and-effect","Repeatable structure (especially for TV)","Emphasis on change and cost"],
      stepsTitle: "Steps (8-step circle)",
      steps: [
        { title: "YOU (COMFORT)", body: "Establish the character's normal world and identity.", icon: "fish" },
        { title: "NEED (DESIRE)", body: "The character wants or needs something that disrupts balance.", icon: "candy" },
        { title: "GO (ENTER UNFAMILIAR)", body: "The character leaves comfort and enters a new situation.", icon: "log-in" },
        { title: "SEARCH (ADAPT)", body: "The character explores the new world and tries strategies that may fail.", icon: "map" },
        { title: "FIND (GET WHAT THEY WANTED)", body: "The character achieves the goal—or seems to.", icon: "search-check" },
        { title: "TAKE (PAY A PRICE)", body: "There is a cost: sacrifice, loss, compromise, or consequence.", icon: "hand-coins" },
        { title: "RETURN (BACK TO FAMILIAR)", body: "The character returns to a version of their old world.", icon: "arrow-big-left" },
        { title: "CHANGE (TRANSFORMED)", body: "The character is different: wiser, broken, empowered, humbled, etc.", icon: "user-pen" }
      ],
      examplesTitle: "Story Circle Examples",
      examples: ["Episodic TV arcs", "Community", "Rick and Morty", "Character-centered short stories"]
    },
    es: {
      introTitle: "¿Qué es el Círculo de la Historia?",
      intro: ["El Círculo de la Historia comprime la transformación en un bucle repetible: un personaje desea algo, abandona la comodidad, paga un precio y regresa cambiado. Está diseñado para ser práctico tanto en episodios como en largometrajes."],
      core: ["Pasos impulsados por la motivación","Causa y efecto claros","Estructura repetible (especialmente para televisión)","Énfasis en el cambio y su coste"],
      stepsTitle: "Pasos (círculo de 8 pasos)",
      steps: [
        { title: "TÚ (COMODIDAD)", body: "Establece el mundo normal y la identidad del personaje.", icon: "fish" },
        { title: "NECESIDAD (DESEO)", body: "El personaje quiere o necesita algo que rompe el equilibrio.", icon: "candy" },
        { title: "IR (ENTRAR EN LO DESCONOCIDO)", body: "El personaje abandona la comodidad y entra en una nueva situación.", icon: "log-in" },
        { title: "BUSCAR (ADAPTARSE)", body: "El personaje explora el nuevo mundo y prueba estrategias que pueden fracasar.", icon: "map" },
        { title: "ENCONTRAR (CONSEGUIR LO QUE QUERÍA)", body: "El personaje logra el objetivo, o eso parece.", icon: "search-check" },
        { title: "TOMAR (PAGAR UN PRECIO)", body: "Hay un coste: sacrificio, pérdida, concesión o consecuencia.", icon: "hand-coins" },
        { title: "REGRESAR (VOLVER A LO FAMILIAR)", body: "El personaje regresa a una versión de su mundo anterior.", icon: "arrow-big-left" },
        { title: "CAMBIAR (TRANSFORMADO)", body: "El personaje es distinto: más sabio, roto, empoderado, humillado, etc.", icon: "user-pen" }
      ],
      examplesTitle: "Ejemplos del Círculo de la Historia",
      examples: ["Arcos de televisión episódica", "Community", "Rick and Morty", "Relatos cortos centrados en el personaje"]
    }
  },
  "Three Act Structure": {
    en: {
      introTitle: "What is the Three Act Structure?",
      intro: ["A story divided into Setup, Confrontation, and Resolution. It's the most common modern narrative skeleton because it aligns with audience attention and escalating stakes."],
      stepsTitle: "Steps (typical beats)",
      numberedSteps: true,
      steps: ["ACT I — Setup","1. Opening / Status Quo — Introduce the protagonist, their world, and the core problem-space.","2. Inciting Incident — A disruption creates a new problem or opportunity.","3. Debate / Refusal — The protagonist hesitates, resists, or explores alternatives.","4. Act I Break (Commitment) — The protagonist commits and can't go back.","ACT II — Confrontation","5. Rising Complications — Obstacles escalate; stakes increase; plans fail.","6. Midpoint Shift — A major reveal or reversal changes the story's direction and intensity.","7. Bad Guys Close In / Pressure Peaks — Consequences compound; resources thin; relationships strain.","8. All Is Lost — The lowest point; apparent defeat or devastating cost.","9. Dark Night of the Soul — Reflection and decision: who will the protagonist become?","ACT III — Resolution","10. Act III Break (New plan) — The protagonist acts with new clarity, courage, or strategy.","11. Climax — The decisive confrontation that resolves the central conflict.","12. Denouement — Aftermath: new equilibrium; consequences; thematic closure."],
      examplesTitle: "Three Act Examples",
      examples: ["Most Hollywood films", "Contemporary commercial novels", "Studio-driven storytelling"]
    },
    es: {
      introTitle: "¿Qué es la Estructura en Tres Actos?",
      intro: ["Una historia dividida en Planteamiento, Confrontación y Resolución. Es el esqueleto narrativo moderno más común porque se ajusta a la atención del público y a una tensión creciente."],
      stepsTitle: "Pasos (beats típicos)",
      numberedSteps: true,
      steps: ["ACTO I — Planteamiento","1. Apertura / Statu Quo — Presenta al protagonista, su mundo y el espacio del conflicto central.","2. Incidente Incitador — Una alteración crea un nuevo problema u oportunidad.","3. Debate / Rechazo — El protagonista vacila, se resiste o explora alternativas.","4. Quiebre del Acto I (Compromiso) — El protagonista se compromete y ya no puede volver atrás.","ACTO II — Confrontación","5. Complicaciones Crecientes — Los obstáculos se intensifican; sube lo que está en juego; los planes fracasan.","6. Giro del Punto Medio — Una gran revelación o vuelco cambia la dirección e intensidad de la historia.","7. Los Villanos se Acercan / La Presión Alcanza su Tope — Las consecuencias se acumulan; los recursos escasean; las relaciones se tensan.","8. Todo Está Perdido — El punto más bajo; derrota aparente o coste devastador.","9. Noche Oscura del Alma — Reflexión y decisión: ¿en quién se convertirá el protagonista?","ACTO III — Resolución","10. Quiebre del Acto III (Nuevo plan) — El protagonista actúa con nueva claridad, valor o estrategia.","11. Clímax — La confrontación decisiva que resuelve el conflicto central.","12. Desenlace — Las secuelas: nuevo equilibrio; consecuencias; cierre temático."],
      examplesTitle: "Ejemplos de Tres Actos",
      examples: ["La mayoría de las películas de Hollywood", "Novelas comerciales contemporáneas", "Narrativa dirigida por estudios"]
    }
  },
  "Freytag's Pyramid": {
    en: {
      introTitle: "What is Freytag's Pyramid?",
      intro: ["A classical five-part model of dramatic tension, often associated with tragedy. It formalizes a rise to climax followed by a decline into resolution."],
      stepsTitle: "Steps (5-part model)",
      steps: ["1. Exposition — Introduce setting, characters, and the initial balance.","2. Rising Action — Complications build; conflict intensifies; choices narrow.","3. Climax — The turning point—the peak tension where fate changes direction.","4. Falling Action — Consequences unfold; momentum turns toward inevitable outcome.","5. Denouement / Catastrophe — Final resolution, often with moral or tragic closure."],
      examplesTitle: "Freytag Examples",
      examples: ["Classical tragedies", "Shakespearean drama", "Traditional stage plays"]
    },
    es: {
      introTitle: "¿Qué es la Pirámide de Freytag?",
      intro: ["Un modelo clásico de tensión dramática en cinco partes, a menudo asociado con la tragedia. Formaliza un ascenso hacia el clímax seguido de un descenso hacia la resolución."],
      stepsTitle: "Pasos (modelo de 5 partes)",
      steps: ["1. Exposición — Presenta el escenario, los personajes y el equilibrio inicial.","2. Acción Creciente — Se acumulan complicaciones; el conflicto se intensifica; las opciones se reducen.","3. Clímax — El punto de inflexión: la tensión máxima donde el destino cambia de rumbo.","4. Acción Descendente — Se despliegan las consecuencias; el impulso se dirige hacia el desenlace inevitable.","5. Desenlace / Catástrofe — Resolución final, a menudo con un cierre moral o trágico."],
      examplesTitle: "Ejemplos de Freytag",
      examples: ["Tragedias clásicas", "Drama shakespeariano", "Obras de teatro tradicionales"]
    }
  },
  "Fichtean Curve": {
    en: {
      introTitle: "What is the Fichtean Curve?",
      intro: ["A structure built from a chain of escalating crises with minimal exposition. The story begins close to conflict and continues increasing pressure until climax."],
      stepsTitle: "Steps (crisis chain)",
      steps: ["1. Immediate Hook / First Crisis — Start near a problem, not far before it.","2. Crisis Escalation 1 — The protagonist responds; the response creates new complications.","3. Crisis Escalation 2 — Stakes rise; setbacks compound; options shrink.","4. Crisis Escalation 3 — Pressure intensifies; emotional and practical costs deepen.","5. Major Crisis / Low Point — A near-defeat moment that forces a decisive shift.","6. Climax — The protagonist commits fully and confronts the core conflict.","7. Short Resolution — Quick wrap-up; consequences and new stability."],
      examplesTitle: "Fichtean Curve Examples",
      examples: ["Thrillers", "Page-turner genre fiction", "Serialized storytelling"]
    },
    es: {
      introTitle: "¿Qué es la curva fichteana?",
      intro: ["Una estructura construida a partir de una cadena de crisis cada vez mayores con una exposición mínima. La historia comienza cerca del conflicto y sigue aumentando la presión hasta el clímax."],
      stepsTitle: "Pasos (cadena de crisis)",
      steps: ["1. Gancho inmediato / Primera crisis — Empieza cerca de un problema, no mucho antes de él.","2. Escalada de crisis 1 — El protagonista responde; la respuesta genera nuevas complicaciones.","3. Escalada de crisis 2 — Lo que está en juego aumenta; los reveses se acumulan; las opciones se reducen.","4. Escalada de crisis 3 — La presión se intensifica; los costes emocionales y prácticos se profundizan.","5. Gran crisis / Punto más bajo — Un momento de casi derrota que obliga a un cambio decisivo.","6. Clímax — El protagonista se compromete por completo y se enfrenta al conflicto central.","7. Resolución breve — Cierre rápido; consecuencias y nueva estabilidad."],
      examplesTitle: "Ejemplos de la curva fichteana",
      examples: ["Thrillers", "Ficción de género absorbente", "Narrativa serializada"]
    }
  },
  "Kishōtenketsu": {
    en: {
      introTitle: "What is Kishōtenketsu?",
      intro: ["Kishōtenketsu is a four-part structure that emphasizes development and contrast rather than conflict. It's common in East Asian storytelling and works well for narratives driven by discovery, theme, or perspective."],
      stepsTitle: "Steps (4-part model)",
      steps: ["1. Ki (Introduction) — Establish the situation, characters, and core idea.","2. Shō (Development) — Expand the situation; deepen detail and context without major disruption.","3. Ten (Turn / Twist) — Introduce a surprising contrast or shift: a new angle, reveal, or reframing event.","4. Ketsu (Conclusion) — Synthesize: show how the contrast changes meaning; resolve by integration rather than victory."],
      examplesTitle: "Kishōtenketsu Examples",
      examples: ["Many slice-of-life stories", "Certain anime and manga arcs", "Essays or thematic short fiction", "Some puzzle-like narratives"]
    },
    es: {
      introTitle: "¿Qué es el kishōtenketsu?",
      intro: ["El kishōtenketsu es una estructura de cuatro partes que enfatiza el desarrollo y el contraste en lugar del conflicto. Es habitual en la narrativa de Asia Oriental y funciona bien para relatos impulsados por el descubrimiento, el tema o la perspectiva."],
      stepsTitle: "Pasos (modelo de 4 partes)",
      steps: ["1. Ki (Introducción) — Establece la situación, los personajes y la idea central.","2. Shō (Desarrollo) — Amplía la situación; profundiza el detalle y el contexto sin una gran disrupción.","3. Ten (Giro / Vuelta de tuerca) — Introduce un contraste o cambio sorprendente: un nuevo ángulo, una revelación o un acontecimiento que replantea todo.","4. Ketsu (Conclusión) — Sintetiza: muestra cómo el contraste cambia el significado; se resuelve por integración en lugar de por victoria."],
      examplesTitle: "Ejemplos de kishōtenketsu",
      examples: ["Muchas historias costumbristas (slice of life)", "Ciertos arcos de anime y manga", "Ensayos o relatos breves temáticos", "Algunas narrativas tipo rompecabezas"]
    }
  },
  "Save the Cat": {
    en: {
      introTitle: "What is Save the Cat?",
      intro: ["Save the Cat is a commercial beat sheet designed to maximize audience engagement. It focuses on emotional timing, clarity, and likeability, especially for film and genre fiction."],
      core: ["Strong emotional beats", "Clear pacing", "Audience empathy", "Market-tested structure"],
      stepsTitle: "Steps (15-beat model)",
      steps: ["1. Opening Image — A snapshot of the protagonist's world before change.","2. Theme Stated — A line or moment hints at the story's central lesson.","3. Setup — Introduce characters, flaws, relationships, and stakes.","4. Catalyst — The inciting incident that disrupts normal life.","5. Debate — The protagonist hesitates and weighs options.","6. Break into Act II — Commitment to the journey.","7. B Story — A secondary plot, often emotional or relational.","8. Fun and Games — The “promise of the premise”; the story delivers on genre.","9. Midpoint — A major reversal: false victory or false defeat.","10. Bad Guys Close In — Pressure increases; plans unravel.","11. All Is Lost — Apparent defeat; emotional or literal low point.","12. Dark Night of the Soul — Reflection and internal reckoning.","13. Break into Act III — New insight leads to decisive action.","14. Finale — The protagonist applies what they've learned to win or lose meaningfully.","15. Final Image — A mirror of the opening image, showing change."],
      examplesTitle: "Save the Cat Examples",
      examples: ["Most studio films", "Romantic comedies", "High-concept genre movies", "Animated features"]
    },
    es: {
      introTitle: "¿Qué es Save the Cat?",
      intro: ["Save the Cat es una hoja de beats comercial diseñada para maximizar la conexión con el público. Se centra en el ritmo emocional, la claridad y la simpatía, especialmente para el cine y la ficción de género."],
      core: ["Beats emocionales potentes", "Ritmo claro", "Empatía del público", "Estructura probada en el mercado"],
      stepsTitle: "Pasos (modelo de 15 beats)",
      steps: ["1. Imagen inicial — Una instantánea del mundo del protagonista antes del cambio.","2. Tema planteado — Una frase o momento insinúa la lección central de la historia.","3. Planteamiento — Presenta a los personajes, sus defectos, sus relaciones y lo que está en juego.","4. Catalizador — El incidente incitador que altera la vida normal.","5. Debate — El protagonista duda y sopesa sus opciones.","6. Entrada en el segundo acto — Compromiso con el viaje.","7. Historia B — Una trama secundaria, a menudo emocional o relacional.","8. Diversión y juegos — La «promesa de la premisa»; la historia cumple con su género.","9. Punto medio — Un gran giro: falsa victoria o falsa derrota.","10. Los malos se acercan — La presión aumenta; los planes se desmoronan.","11. Todo está perdido — Derrota aparente; punto más bajo emocional o literal.","12. Noche oscura del alma — Reflexión y ajuste de cuentas interno.","13. Entrada en el tercer acto — Una nueva comprensión conduce a la acción decisiva.","14. Desenlace — El protagonista aplica lo aprendido para ganar o perder de forma significativa.","15. Imagen final — Un reflejo de la imagen inicial que muestra el cambio."],
      examplesTitle: "Ejemplos de Save the Cat",
      examples: ["La mayoría de las películas de estudio", "Comedias románticas", "Películas de género de alto concepto", "Largometrajes de animación"]
    }
  },
  "Seven Point Structure": {
    en: {
      introTitle: "What is the Seven Point Structure?",
      intro: ["A clean, flexible structure focused on cause-and-effect turning points. It emphasizes clarity and momentum."],
      core: ["Fewer beats, higher impact", "Clear reversals", "Strong midpoint logic"],
      stepsTitle: "Steps (7-point model)",
      numberedSteps: true,
      steps: ["1. Hook — Introduce the protagonist and the central problem.","2. Plot Turn 1 — An event pushes the protagonist into action.","3. Pinch Point 1 — Pressure reveals the antagonist's power.","4. Midpoint — The protagonist shifts from reactive to proactive.","5. Pinch Point 2 — Stakes intensify; consequences loom.","6. Plot Turn 2 — Final commitment toward resolution.","7. Resolution — Conflict concludes; new status quo established."],
      examplesTitle: "Seven Point Examples",
      examples: ["Fantasy and sci-fi novels", "Plot-driven fiction", "Serialized narratives"]
    },
    es: {
      introTitle: "¿Qué es la estructura de siete puntos?",
      intro: ["Una estructura limpia y flexible centrada en los puntos de inflexión de causa y efecto. Enfatiza la claridad y el impulso."],
      core: ["Menos beats, mayor impacto", "Giros claros", "Lógica de punto medio sólida"],
      stepsTitle: "Pasos (modelo de 7 puntos)",
      numberedSteps: true,
      steps: ["1. Gancho — Presenta al protagonista y el problema central.","2. Giro de trama 1 — Un acontecimiento empuja al protagonista a la acción.","3. Punto de tensión 1 — La presión revela el poder del antagonista.","4. Punto medio — El protagonista pasa de reactivo a proactivo.","5. Punto de tensión 2 — Lo que está en juego se intensifica; las consecuencias se ciernen.","6. Giro de trama 2 — Compromiso final hacia la resolución.","7. Resolución — El conflicto concluye; se establece un nuevo statu quo."],
      examplesTitle: "Ejemplos de siete puntos",
      examples: ["Novelas de fantasía y ciencia ficción", "Ficción impulsada por la trama", "Narrativas serializadas"]
    }
  },
  "Pulp Formula": {
    en: {
      introTitle: "What is the Pulp Formula?",
      intro: ["A fast-paced structure designed for entertainment, clarity, and momentum. It prioritizes action, stakes, and accessibility over thematic subtlety."],
      core: ["Immediate engagement", "Clear heroes and villains", "Escalating danger", "High momentum"],
      stepsTitle: "Steps (common pulp rhythm)",
      steps: ["1. Immediate Hook — Start with action or danger.","2. Clear Goal — The protagonist knows what must be done.","3. Obstacle Chain — Continuous challenges and reversals.","4. Escalation — Stakes increase rapidly.","5. Cliffhanger or Crisis — A major setback or revelation.","6. Final Confrontation — Direct clash with the antagonist.","7. Swift Resolution — Loose ends tied quickly."],
      examplesTitle: "Pulp Examples",
      examples: ["Adventure serials", "Noir fiction", "Action thrillers", "Comic storytelling"]
    },
    es: {
      introTitle: "¿Qué es la Fórmula Pulp?",
      intro: ["Una estructura de ritmo rápido diseñada para el entretenimiento, la claridad y el impulso. Prioriza la acción, lo que está en juego y la accesibilidad por encima de la sutileza temática."],
      core: ["Enganche inmediato", "Héroes y villanos claros", "Peligro en aumento", "Gran impulso"],
      stepsTitle: "Pasos (ritmo pulp habitual)",
      steps: ["1. Gancho inmediato — Empieza con acción o peligro.","2. Objetivo claro — El protagonista sabe lo que hay que hacer.","3. Cadena de obstáculos — Desafíos y reveses continuos.","4. Escalada — Lo que está en juego aumenta rápidamente.","5. Suspense o crisis — Un revés o revelación importante.","6. Confrontación final — Choque directo con el antagonista.","7. Resolución rápida — Los cabos sueltos se atan con celeridad."],
      examplesTitle: "Ejemplos pulp",
      examples: ["Seriales de aventuras", "Ficción noir", "Thrillers de acción", "Narrativa de cómic"]
    }
  },
  "McKee Story paradigm": {
    en: {
      introTitle: "What is the McKee Paradigm?",
      intro: ["Robert McKee's model emphasizes story as a sequence of value changes driven by conflict and choice. It focuses on scene design and narrative causality."],
      core: ["Value shifts", "Progressive complications", "Scene-level causality", "Strong climax logic"],
      stepsTitle: "Structural principles",
      steps: ["1. Inciting Incident — A radical change disrupts balance.","2. Progressive Complications — Each action leads to greater difficulty.","3. Crisis — A decision between irreconcilable values.","4. Climax — Action that resolves the crisis.","5. Resolution — The world stabilizes in a new form."],
      examplesTitle: "McKee Examples",
      examples: ["Prestige drama", "Character-driven films", "Serious literary narratives"]
    },
    es: {
      introTitle: "¿Qué es el paradigma de McKee?",
      intro: ["El modelo de Robert McKee concibe la historia como una secuencia de cambios de valor impulsados por el conflicto y la elección. Se centra en el diseño de escenas y la causalidad narrativa."],
      core: ["Cambios de valor", "Complicaciones progresivas", "Causalidad a nivel de escena", "Lógica sólida del clímax"],
      stepsTitle: "Principios estructurales",
      steps: ["1. Incidente incitante — Un cambio radical altera el equilibrio.","2. Complicaciones progresivas — Cada acción conduce a una mayor dificultad.","3. Crisis — Una decisión entre valores irreconciliables.","4. Clímax — La acción que resuelve la crisis.","5. Resolución — El mundo se estabiliza en una nueva forma."],
      examplesTitle: "Ejemplos de McKee",
      examples: ["Drama de prestigio", "Películas centradas en el personaje", "Narrativas literarias serias"]
    }
  },
  "Into the Woods structure": {
    en: {
      introTitle: "What is the Into the Woods structure?",
      intro: ["John Yorke's model views story as a five-act, fractal pattern: order, disorder, repair, collapse, and transformation. It emphasizes repetition at multiple scales."],
      core: ["Five-part rhythm", "Fractal repetition", "Moral consequence", "Thematic depth"],
      stepsTitle: "Steps (5-act pattern)",
      steps: ["1. Order — Establish a flawed equilibrium.","2. Disruption — A desire or problem breaks order.","3. Attempted Repair — Characters try to fix things.","4. Collapse — Efforts fail; chaos peaks.","5. New Order — A transformed equilibrium emerges."],
      examplesTitle: "Into the Woods Examples",
      examples: ["British television drama", "Prestige serialized storytelling", "Thematic narratives"]
    },
    es: {
      introTitle: "¿Qué es la estructura de Into the Woods?",
      intro: ["El modelo de John Yorke entiende la historia como un patrón fractal de cinco actos: orden, desorden, reparación, colapso y transformación. Hace hincapié en la repetición a múltiples escalas."],
      core: ["Ritmo en cinco partes", "Repetición fractal", "Consecuencia moral", "Profundidad temática"],
      stepsTitle: "Pasos (patrón de 5 actos)",
      steps: ["1. Orden — Establecer un equilibrio imperfecto.","2. Disrupción — Un deseo o problema rompe el orden.","3. Intento de reparación — Los personajes intentan arreglar las cosas.","4. Colapso — Los esfuerzos fracasan; el caos alcanza su punto máximo.","5. Nuevo orden — Surge un equilibrio transformado."],
      examplesTitle: "Ejemplos de Into the Woods",
      examples: ["Drama televisivo británico", "Narrativa seriada de prestigio", "Narrativas temáticas"]
    }
  },
  "Frame Narrative": {
    en: {
      introTitle: "What is a Frame Narrative?",
      intro: ["A story within a story. An outer narrative contextualizes or reframes an inner narrative."],
      core: ["Nested storytelling", "Perspective mediation", "Interpretive distance"],
      stepsTitle: "Structural layers",
      steps: ["1. Outer Frame — Establish the narrator or context.","2. Inner Story — The primary narrative is told.","3. Interruption or Commentary — The frame reacts or reframes meaning.","4. Return to Frame — The story closes with new understanding."],
      examplesTitle: "Frame Narrative Examples",
      examples: ["Frankenstein", "The Princess Bride", "Heart of Darkness", "Arabian Nights"]
    },
    es: {
      introTitle: "¿Qué es una narrativa marco?",
      intro: ["Una historia dentro de otra historia. Una narrativa externa contextualiza o reencuadra una narrativa interna."],
      core: ["Narración anidada", "Mediación de la perspectiva", "Distancia interpretativa"],
      stepsTitle: "Capas estructurales",
      steps: ["1. Marco externo — Establecer al narrador o el contexto.","2. Historia interna — Se cuenta la narrativa principal.","3. Interrupción o comentario — El marco reacciona o reencuadra el significado.","4. Regreso al marco — La historia se cierra con una nueva comprensión."],
      examplesTitle: "Ejemplos de narrativa marco",
      examples: ["Frankenstein", "La princesa prometida", "El corazón de las tinieblas", "Las mil y una noches"]
    }
  },
  "Nonlinear Structure": {
    en: {
      introTitle: "What is a Nonlinear Structure?",
      intro: ["A narrative told out of chronological order. Meaning emerges from juxtaposition rather than sequence."],
      core: ["Fragmented timeline", "Pattern recognition", "Active audience participation"],
      stepsTitle: "Common nonlinear patterns",
      steps: ["Reverse chronology", "Interwoven timelines", "Fragmented memory", "Circular narratives"],
      examplesTitle: "Nonlinear Examples",
      examples: ["Memento", "Pulp Fiction", "Westworld", "Slaughterhouse-Five"]
    },
    es: {
      introTitle: "¿Qué es una estructura no lineal?",
      intro: ["Una narración contada fuera del orden cronológico. El significado surge de la yuxtaposición más que de la secuencia."],
      core: ["Línea temporal fragmentada", "Reconocimiento de patrones", "Participación activa del público"],
      stepsTitle: "Patrones no lineales comunes",
      steps: ["Cronología inversa", "Líneas temporales entrelazadas", "Memoria fragmentada", "Narrativas circulares"],
      examplesTitle: "Ejemplos no lineales",
      examples: ["Memento", "Pulp Fiction", "Westworld", "Matadero cinco"]
    }
  },
  "Rashomon Structure": {
    en: {
      introTitle: "What is a Rashomon Structure?",
      intro: ["A narrative that presents multiple, conflicting perspectives of the same event, emphasizing subjectivity and truth ambiguity."],
      core: ["Multiple narrators", "Contradictory accounts", "Truth as unstable"],
      stepsTitle: "Structural pattern",
      steps: ["1. Single event", "2. Multiple retellings", "3. Contradictions revealed", "4. Ambiguity preserved"],
      examplesTitle: "Rashomon Examples",
      examples: ["Rashomon", "Hero", "The Affair", "Gone Girl (partial)"]
    },
    es: {
      introTitle: "¿Qué es una estructura Rashomon?",
      intro: ["Una narración que presenta múltiples perspectivas contradictorias del mismo suceso, enfatizando la subjetividad y la ambigüedad de la verdad."],
      core: ["Múltiples narradores", "Relatos contradictorios", "La verdad como algo inestable"],
      stepsTitle: "Patrón estructural",
      steps: ["1. Un solo suceso", "2. Múltiples versiones", "3. Contradicciones reveladas", "4. Ambigüedad preservada"],
      examplesTitle: "Ejemplos de Rashomon",
      examples: ["Rashomon", "Hero", "The Affair", "Perdida (parcial)"]
    }
  },
  "In Medias Res": {
    en: {
      introTitle: "What is In Medias Res?",
      intro: ["A narrative that begins in the middle of action, then later provides context for how events reached that point."],
      core: ["Immediate engagement", "Delayed exposition", "Momentum-first storytelling"],
      stepsTitle: "Structural pattern",
      steps: ["1. Mid-action opening","2. Audience confusion","3. Gradual backfill","4. Recontextualization","5. Continuation to resolution"],
      examplesTitle: "In Medias Res Examples",
      examples: ["The Odyssey", "Breaking Bad (cold opens)", "Mad Max: Fury Road", "Fight Club"]
    },
    es: {
      introTitle: "¿Qué es In Medias Res?",
      intro: ["Una narración que comienza en mitad de la acción y, más adelante, ofrece el contexto de cómo los acontecimientos llegaron a ese punto."],
      core: ["Implicación inmediata", "Exposición diferida", "Narración que prioriza el impulso"],
      stepsTitle: "Patrón estructural",
      steps: ["1. Apertura en plena acción","2. Confusión del público","3. Relleno gradual del contexto","4. Recontextualización","5. Continuación hasta la resolución"],
      examplesTitle: "Ejemplos de In Medias Res",
      examples: ["La Odisea", "Breaking Bad (aperturas en frío)", "Mad Max: Furia en la carretera", "El club de la lucha"]
    }
  },
  "Eight-Sequence Structure": {
    en: {
      introTitle: "What is the Eight-Sequence Structure?",
      intro: ["A feature film built as eight sequences of roughly 10-15 minutes, each a self-contained mini-movie with its own tension, goal, and resolution.", "Developed by Frank Daniel and codified by Paul Joseph Gulino, it maps onto the three acts: Act 1 (sequences 1-2), Act 2 (sequences 3-6), Act 3 (sequences 7-8)."],
      coreHeading: "Core characteristics",
      core: ["Manageable, reel-sized units", "Each sequence has its own dramatic arc", "Escalating tension across the whole"],
      stepsTitle: "Steps (8 sequences)",
      steps: ["1. Sequence 1 (Status Quo & Inciting Incident) — Establish the world, the protagonist, and the disturbance that sets the story in motion.","2. Sequence 2 (Predicament & Lock-In) — Define the central tension and commit the protagonist to a course of action; close Act 1.","3. Sequence 3 (First Obstacle & Raising Stakes) — The protagonist's initial attempt at the goal meets early resistance.","4. Sequence 4 (First Culmination & Midpoint) — A major reversal or revelation recontextualizes the goal and pushes toward the midpoint.","5. Sequence 5 (Subplot & Rising Action) — Complications deepen as subplots intertwine and pressure mounts.","6. Sequence 6 (Main Culmination & Lowest Point) — The strongest opposition forces a crisis; the protagonist hits the all-is-lost moment, ending Act 2.","7. Sequence 7 (New Tension & Final Push) — Armed with new understanding, the protagonist regroups for the final confrontation.","8. Sequence 8 (Resolution) — The climax resolves the central tension and a new equilibrium is established."],
      whyTitle: "Why this works",
      why: "Breaking a feature into reel-sized chunks keeps each stretch dramatically active, preventing the sagging second act by giving every sequence its own goal, conflict, and payoff.",
      examplesTitle: "Eight-Sequence Examples",
      examples: ["Casablanca", "Toy Story", "Die Hard", "The Silence of the Lambs", "North by Northwest"]
    },
    es: {
      introTitle: "¿Qué es la estructura de ocho secuencias?",
      intro: ["Un largometraje construido como ocho secuencias de aproximadamente 10-15 minutos, cada una una minipelícula autónoma con su propia tensión, objetivo y resolución.", "Desarrollada por Frank Daniel y codificada por Paul Joseph Gulino, se corresponde con los tres actos: Acto 1 (secuencias 1-2), Acto 2 (secuencias 3-6), Acto 3 (secuencias 7-8)."],
      coreHeading: "Características principales",
      core: ["Unidades manejables, del tamaño de un rollo", "Cada secuencia tiene su propio arco dramático", "Tensión creciente a lo largo del conjunto"],
      stepsTitle: "Pasos (8 secuencias)",
      steps: ["1. Secuencia 1 (Statu quo e incidente incitador) — Establece el mundo, el protagonista y la perturbación que pone en marcha la historia.","2. Secuencia 2 (Aprieto y compromiso) — Define la tensión central y compromete al protagonista con un curso de acción; cierra el Acto 1.","3. Secuencia 3 (Primer obstáculo y aumento de lo que está en juego) — El primer intento del protagonista por alcanzar el objetivo encuentra una resistencia inicial.","4. Secuencia 4 (Primera culminación y punto medio) — Un giro o revelación importante recontextualiza el objetivo y empuja hacia el punto medio.","5. Secuencia 5 (Subtrama y acción ascendente) — Las complicaciones se profundizan a medida que las subtramas se entrelazan y aumenta la presión.","6. Secuencia 6 (Culminación principal y punto más bajo) — La oposición más fuerte provoca una crisis; el protagonista llega al momento en que todo está perdido, cerrando el Acto 2.","7. Secuencia 7 (Nueva tensión y empuje final) — Con una nueva comprensión, el protagonista se reagrupa para la confrontación final.","8. Secuencia 8 (Resolución) — El clímax resuelve la tensión central y se establece un nuevo equilibrio."],
      whyTitle: "Por qué funciona",
      why: "Dividir un largometraje en fragmentos del tamaño de un rollo mantiene cada tramo dramáticamente activo, evitando el decaimiento del segundo acto al dar a cada secuencia su propio objetivo, conflicto y recompensa.",
      examplesTitle: "Ejemplos de ocho secuencias",
      examples: ["Casablanca", "Toy Story", "Jungla de cristal", "El silencio de los corderos", "Con la muerte en los talones"]
    }
  },
  "Syd Field Paradigm": {
    en: {
      introTitle: "What is the Syd Field Paradigm?",
      intro: ["A three-act model that organizes a screenplay around fixed structural anchors: two plot points, two pinch points, and a midpoint.", "Introduced in Screenplay, it treats structure as a paradigm of setup, confrontation, and resolution held together by clear turning points."],
      coreHeading: "Core characteristics",
      core: ["Fixed structural anchors", "Plot points end each act", "Pinch points sustain conflict"],
      stepsTitle: "Steps (paradigm beats)",
      steps: ["1. Setup — Establish the protagonist, world, and dramatic premise.","2. Inciting Incident — An event disrupts the status quo and raises the central question.","3. Plot Point I — A decisive turn spins the story in a new direction and ends Act 1.","4. Pinch 1 — A reminder of the antagonistic force applies pressure in the first half of Act 2.","5. Midpoint — A major shift raises the stakes and recommits the protagonist to the goal.","6. Pinch 2 — Renewed pressure from the opposition drives toward the act's crisis.","7. Plot Point II — A second decisive turn launches the story into Act 3.","8. Climax — The protagonist confronts the central conflict head-on.","9. Resolution — The aftermath settles the story and reveals the new normal."],
      whyTitle: "Why this works",
      why: "By fixing turning points at predictable structural positions, the paradigm gives writers reliable targets that keep momentum building from setup through resolution.",
      examplesTitle: "Syd Field Paradigm Examples",
      examples: ["Chinatown", "Thelma & Louise", "Star Wars", "The Matrix", "Witness"]
    },
    es: {
      introTitle: "¿Qué es el Paradigma de Syd Field?",
      intro: ["Un modelo de tres actos que organiza un guion en torno a anclajes estructurales fijos: dos puntos de giro, dos puntos de presión y un punto medio.", "Presentado en El libro del guion, trata la estructura como un paradigma de planteamiento, confrontación y resolución sostenido por puntos de giro claros."],
      coreHeading: "Características principales",
      core: ["Anclajes estructurales fijos", "Los puntos de giro cierran cada acto", "Los puntos de presión sostienen el conflicto"],
      stepsTitle: "Pasos (tiempos del paradigma)",
      steps: ["1. Planteamiento — Establece al protagonista, el mundo y la premisa dramática.","2. Incidente incitador — Un suceso altera el statu quo y plantea la pregunta central.","3. Punto de giro I — Un giro decisivo lanza la historia en una nueva dirección y cierra el Acto 1.","4. Presión 1 — Un recordatorio de la fuerza antagonista ejerce presión en la primera mitad del Acto 2.","5. Punto medio — Un cambio importante eleva lo que está en juego y vuelve a comprometer al protagonista con su objetivo.","6. Presión 2 — La presión renovada de la oposición empuja hacia la crisis del acto.","7. Punto de giro II — Un segundo giro decisivo lanza la historia hacia el Acto 3.","8. Clímax — El protagonista se enfrenta de lleno al conflicto central.","9. Resolución — Las consecuencias asientan la historia y revelan la nueva normalidad."],
      whyTitle: "Por qué funciona",
      why: "Al fijar los puntos de giro en posiciones estructurales predecibles, el paradigma ofrece a los guionistas objetivos fiables que mantienen el impulso en aumento desde el planteamiento hasta la resolución.",
      examplesTitle: "Ejemplos del Paradigma de Syd Field",
      examples: ["Chinatown", "Thelma & Louise", "La guerra de las galaxias", "Matrix", "Testigo en peligro"]
    }
  },
  "Truby 22 Steps": {
    en: {
      introTitle: "What are Truby's 22 Steps?",
      intro: ["A 22-step framework for organic story design that grows plot out of a character's moral and psychological need rather than imposing external act beats.", "Drawn from John Truby's The Anatomy of Story, the steps trace a continuous chain from weakness and desire to self-revelation and a new equilibrium."],
      coreHeading: "Core characteristics",
      core: ["Character-driven, organic structure", "Moral plus psychological need", "Designed around self-revelation"],
      stepsTitle: "Steps (22-step model)",
      steps: ["1. Self-Revelation, Need, and Desire — Conceive the ending first: what the hero will learn and want.","2. Ghost and Story World — The wound from the past that haunts the hero, set within a defined world.","3. Weakness and Need — The hero's flaw and the psychological or moral change required to overcome it.","4. Inciting Event — An event that jolts the hero and prompts a response.","5. Desire — The specific external goal the hero pursues, driving the plot.","6. Ally or Allies — Companions who help and reflect the hero.","7. Opponent and/or Mystery — The antagonist who competes for the same goal.","8. Fake-Ally Opponent — A character who appears to help but secretly opposes the hero.","9. First Revelation and Decision — New information changes the hero's understanding and choice of action.","10. Plan — The hero's strategy for reaching the goal.","11. Opponent's Plan and Main Counterattack — The antagonist's countering scheme and offensive.","12. Drive — The hero's escalating campaign of actions toward the goal.","13. Attack by Ally — An ally challenges the hero's methods or morality.","14. Apparent Defeat — The hero believes the goal is lost; the lowest point.","15. Second Revelation and Decision — Renewed motivation as new information spurs a fresh decision.","16. Audience Revelation — The audience learns something the hero does not.","17. Third Revelation and Decision — A further discovery sharpens the hero's resolve and direction.","18. Gate, Gauntlet, Visit to Death — Intensifying pressure as the hero faces a symbolic or literal brush with death.","19. Battle — The final conflict between hero and opponent.","20. Self-Revelation — The hero grasps the truth about themselves, learning the need.","21. Moral Decision — The hero acts on that revelation through a choice that proves real change.","22. New Equilibrium — A new, higher (or lower) level of order settles after the desire is resolved."],
      whyTitle: "Why this works",
      why: "Because each step springs causally from the hero's need rather than a fixed timetable, the framework produces a tightly woven, character-rooted plot that culminates in earned change.",
      examplesTitle: "Truby 22 Steps Examples",
      examples: ["The Godfather", "Tootsie", "Casablanca", "Vertigo", "It's a Wonderful Life"]
    },
    es: {
      introTitle: "¿Cuáles son los 22 Pasos de Truby?",
      intro: ["Un marco de 22 pasos para el diseño orgánico de historias que hace crecer la trama a partir de la necesidad moral y psicológica de un personaje, en lugar de imponer tiempos de acto externos.", "Extraídos de La anatomía del guion de John Truby, los pasos trazan una cadena continua desde la debilidad y el deseo hasta la autorrevelación y un nuevo equilibrio."],
      coreHeading: "Características principales",
      core: ["Estructura orgánica impulsada por el personaje", "Necesidad moral y psicológica", "Diseñado en torno a la autorrevelación"],
      stepsTitle: "Pasos (modelo de 22 pasos)",
      steps: ["1. Autorrevelación, necesidad y deseo — Concibe primero el final: qué aprenderá y qué querrá el héroe.","2. Fantasma y mundo de la historia — La herida del pasado que atormenta al héroe, situada en un mundo definido.","3. Debilidad y necesidad — El defecto del héroe y el cambio psicológico o moral necesario para superarlo.","4. Suceso incitador — Un suceso que sacude al héroe y provoca una respuesta.","5. Deseo — El objetivo externo concreto que persigue el héroe y que impulsa la trama.","6. Aliado o aliados — Compañeros que ayudan y reflejan al héroe.","7. Oponente y/o misterio — El antagonista que compite por el mismo objetivo.","8. Falso aliado oponente — Un personaje que parece ayudar pero que en secreto se opone al héroe.","9. Primera revelación y decisión — La nueva información cambia la comprensión del héroe y su elección de acción.","10. Plan — La estrategia del héroe para alcanzar el objetivo.","11. Plan del oponente y contraataque principal — El plan opuesto del antagonista y su ofensiva.","12. Impulso — La campaña creciente de acciones del héroe hacia el objetivo.","13. Ataque del aliado — Un aliado cuestiona los métodos o la moral del héroe.","14. Derrota aparente — El héroe cree que el objetivo está perdido; el punto más bajo.","15. Segunda revelación y decisión — Motivación renovada cuando la nueva información impulsa una nueva decisión.","16. Revelación al público — El público descubre algo que el héroe no sabe.","17. Tercera revelación y decisión — Un nuevo descubrimiento agudiza la determinación y el rumbo del héroe.","18. Puerta, prueba, visita a la muerte — Presión creciente mientras el héroe afronta un roce simbólico o literal con la muerte.","19. Batalla — El conflicto final entre el héroe y el oponente.","20. Autorrevelación — El héroe comprende la verdad sobre sí mismo y aprende la necesidad.","21. Decisión moral — El héroe actúa según esa revelación mediante una elección que demuestra un cambio real.","22. Nuevo equilibrio — Un nuevo nivel de orden, más alto (o más bajo), se asienta una vez resuelto el deseo."],
      whyTitle: "Por qué funciona",
      why: "Como cada paso surge de forma causal de la necesidad del héroe y no de un cronograma fijo, el marco produce una trama bien tejida y arraigada en el personaje que culmina en un cambio merecido.",
      examplesTitle: "Ejemplos de los 22 Pasos de Truby",
      examples: ["El padrino", "Tootsie", "Casablanca", "Vértigo", "¡Qué bello es vivir!"]
    }
  },
  "TV Series Structure": {
    en: {
      introTitle: "What is TV Series Structure?",
      intro: ["A model for episodic and serialized television built around act breaks, interwoven plotlines, and arcs that span both the episode and the season.", "Episodes open with a teaser, divide into network act breaks, and balance an A-story against supporting B and C plots while a runner threads through the whole."],
      coreHeading: "Core characteristics",
      core: ["Act breaks engineered for ad cuts", "Layered A/B/C plots", "Episode arc within a season arc"],
      stepsTitle: "Steps (key concepts)",
      steps: ["1. Cold Open / Teaser — A pre-titles hook that establishes the episode's question and draws the viewer in.","2. Act Breaks — Network drama divides into four or five acts, each ending on a cliffhanger before a commercial.","3. A Plot — The episode's main story, carrying the most screen time and stakes.","4. B and C Plots — Secondary and tertiary stories that complement, contrast, or relieve the A plot.","5. The Runner — A light recurring thread or joke that recurs across the episode for cohesion.","6. Serialized vs. Episodic — Choosing between self-contained episodes and ongoing storylines that build week to week.","7. The Break / Beat Sheet — The writers' room 'breaks' the story into beats on a board before scripting.","8. Season Arc vs. Episode Arc — Balancing a satisfying single-episode story against the longer character and plot arcs of the season.","9. The Button / Tag — A short closing scene after the climax that lands a final beat, laugh, or hook into the next episode."],
      whyTitle: "Why this works",
      why: "Layering self-contained episode stories over longer season arcs keeps each installment satisfying while building the momentum that brings viewers back week after week.",
      examplesTitle: "TV Series Structure Examples",
      examples: ["Breaking Bad", "The Wire", "Friends", "The Sopranos", "Lost"]
    },
    es: {
      introTitle: "¿Qué es la estructura de serie de televisión?",
      intro: ["Un modelo para la televisión episódica y serializada construido en torno a cortes de acto, tramas entrelazadas y arcos que abarcan tanto el episodio como la temporada.", "Los episodios abren con un teaser, se dividen en cortes de acto televisivos y equilibran una trama A frente a tramas secundarias B y C, mientras un hilo conductor recorre el conjunto."],
      coreHeading: "Características principales",
      core: ["Cortes de acto diseñados para las pausas publicitarias", "Tramas A/B/C en capas", "Arco del episodio dentro del arco de la temporada"],
      stepsTitle: "Pasos (conceptos clave)",
      steps: ["1. Apertura en frío / Teaser — Un gancho antes de los créditos que plantea la pregunta del episodio y atrae al espectador.","2. Cortes de acto — El drama televisivo se divide en cuatro o cinco actos, cada uno terminando en un momento de suspense antes de un anuncio.","3. Trama A — La historia principal del episodio, con el mayor tiempo en pantalla y lo que más está en juego.","4. Tramas B y C — Historias secundarias y terciarias que complementan, contrastan o aligeran la trama A.","5. El hilo conductor — Un hilo o chiste recurrente y ligero que reaparece a lo largo del episodio para dar cohesión.","6. Serializado vs. episódico — Elegir entre episodios autoconclusivos y tramas continuas que crecen semana a semana.","7. El desglose / Hoja de tiempos — La sala de guionistas 'desglosa' la historia en tiempos en una pizarra antes de escribir el guion.","8. Arco de temporada vs. arco de episodio — Equilibrar una historia satisfactoria de un solo episodio con los arcos más largos de personaje y trama de la temporada.","9. El remate / Coda — Una breve escena de cierre tras el clímax que aterriza un último tiempo, risa o gancho hacia el siguiente episodio."],
      whyTitle: "Por qué funciona",
      why: "Superponer historias autoconclusivas de episodio sobre arcos más largos de temporada mantiene cada entrega satisfactoria a la vez que genera el impulso que hace volver a los espectadores semana tras semana.",
      examplesTitle: "Ejemplos de estructura de serie de televisión",
      examples: ["Breaking Bad", "The Wire", "Friends", "Los Soprano", "Perdidos"]
    }
  }
};
