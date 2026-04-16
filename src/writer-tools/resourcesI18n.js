/**
 * Folio Resources — Bilingual content module (EN / ES)
 * All resource data lives here: UI strings, card labels, archetype data,
 * technique data, structure data, tips data, pitfalls data.
 */

// ─── Archetype data helper ──────────────────────────────────────────────────

export const ARCHETYPE_DATA = {

  // ── Campbell archetypes ──────────────────────────────────────────────────

  hero: {
    en: {
      introQuestion: "Who is the Hero?",
      intro: [
        "The Hero is the transforming protagonist. They represent the struggle for personal growth, the confrontation of fear, and the overcoming of obstacles. The Hero symbolizes the human drive to transcend limits, improve, and give meaning to adversity.",
        "This is a universal archetype found in myth, classical stories, and modern narratives. The Hero's journey forms the backbone of many plots."
      ],
      traitsHeading: "Core traits",
      traits: ["Courage in the face of danger", "Inner and outer strength", "Empathy and leadership", "Strong sense of justice", "Human flaws and vulnerability"],
      traitsNote: "The Hero is not perfect. They fall, struggle, and rise transformed.",
      relationshipsHeading: "Key relationships",
      relationships: ["Mentor → guidance and wisdom", "Ally → shared mission", "Threshold Guardian → trial or blockage", "Shadow → antagonist or repressed self", "Trickster → chaos and disruption", "Shapeshifter → uncertainty and tension", "Herald → announces change"],
      writingHeading: "Writing a strong Hero",
      writing: ["Clear motivation", "Internal conflict", "Meaningful backstory", "Unique skills", "Emotional relationships", "Balance of strength and fragility", "Strong contrast between ordinary life and transformation"],
      whyHeading: "Why this archetype works",
      why: "Because it mirrors the human experience: struggle, fall, learning, and transformation.",
      examplesHeading: "Hero Examples",
      examples: ["Harry Potter", "Frodo Baggins", "Katniss Everdeen", "Mulan", "Luke Skywalker", "Simba", "Elizabeth Bennet"]
    },
    es: {
      introQuestion: "¿Quién es el Héroe?",
      intro: [
        "El Héroe es el protagonista transformador. Representa la lucha por el crecimiento personal, la confrontación del miedo y la superación de los obstáculos. El Héroe simboliza el impulso humano de trascender los límites, mejorar y dar sentido a la adversidad.",
        "Este es un arquetipo universal presente en el mito, las historias clásicas y las narrativas modernas. El viaje del Héroe forma la columna vertebral de muchas tramas."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Valentía ante el peligro", "Fuerza interior y exterior", "Empatía y liderazgo", "Fuerte sentido de la justicia", "Defectos y vulnerabilidad humana"],
      traitsNote: "El Héroe no es perfecto. Cae, lucha y emerge transformado.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Mentor → guía y sabiduría", "Aliado → misión compartida", "Guardián del Umbral → prueba o bloqueo", "Sombra → antagonista o yo reprimido", "Embaucador → caos y disrupción", "Cambiante → incertidumbre y tensión", "Heraldo → anuncia el cambio"],
      writingHeading: "Cómo escribir un Héroe sólido",
      writing: ["Motivación clara", "Conflicto interno", "Historia de fondo significativa", "Habilidades únicas", "Relaciones emocionales", "Equilibrio entre fortaleza y fragilidad", "Contraste marcado entre la vida ordinaria y la transformación"],
      whyHeading: "Por qué funciona este arquetipo",
      why: "Porque refleja la experiencia humana: la lucha, la caída, el aprendizaje y la transformación.",
      examplesHeading: "Ejemplos del Héroe",
      examples: ["Harry Potter", "Frodo Bolsón", "Katniss Everdeen", "Mulan", "Luke Skywalker", "Simba", "Elizabeth Bennet"]
    }
  },

  mentor: {
    en: {
      introQuestion: "Who is the Mentor?",
      intro: [
        "The Mentor guides, teaches, and inspires the Hero. They provide wisdom, experience, and emotional support, helping the Hero grow and overcome challenges.",
        "The Mentor represents inherited knowledge, tradition, and the possibility of inner transformation."
      ],
      traitsHeading: "Core traits",
      traits: ["Spiritual and practical guide", "Accumulated wisdom", "Emotional support figure", "Ethical compass", "Connection to tradition", "Catalyst for action"],
      traitsNote: "Often the Mentor sacrifices something, forcing the Hero into independence.",
      functionHeading: "Narrative function",
      functionIntro: "The Mentor supports the Hero's growth as:",
      functions: ["Trusted advisor", "Trainer or teacher", "Giver of tools or gifts", "Emotional challenger", "Bridge between worlds"],
      functionNote: "When the Mentor disappears, the Hero must act alone.",
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → formative bond", "Threshold Guardian → shared trials", "Shadow → moral counterpoint", "Ally → cooperation or tension", "Trickster → disruption of authority", "Shapeshifter → ambiguity", "Herald → signals the need for guidance"],
      writingHeading: "Writing a compelling Mentor",
      writing: ["Strong introduction", "Clear motivation", "Demonstrated expertise", "Unique personality", "Revealing backstory", "Trust with the Hero", "Memorable first lesson", "Symbolic presence"],
      examplesHeading: "Mentor Examples",
      examples: ["Gandalf", "Dumbledore", "Mr. Miyagi", "Yoda", "Professor Xavier", "Glinda", "Haymitch", "Rafiki", "Morpheus"]
    },
    es: {
      introQuestion: "¿Quién es el Mentor?",
      intro: [
        "El Mentor guía, enseña e inspira al Héroe. Proporciona sabiduría, experiencia y apoyo emocional, ayudándole a crecer y a superar los desafíos.",
        "El Mentor representa el conocimiento heredado, la tradición y la posibilidad de la transformación interior."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Guía espiritual y práctico", "Sabiduría acumulada", "Figura de apoyo emocional", "Brújula ética", "Conexión con la tradición", "Catalizador de la acción"],
      traitsNote: "Con frecuencia, el Mentor sacrifica algo, lo que obliga al Héroe a valerse por sí mismo.",
      functionHeading: "Función narrativa",
      functionIntro: "El Mentor apoya el crecimiento del Héroe como:",
      functions: ["Consejero de confianza", "Formador o maestro", "Dador de herramientas o dones", "Desafío emocional", "Puente entre mundos"],
      functionNote: "Cuando el Mentor desaparece, el Héroe debe actuar solo.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → vínculo formativo", "Guardián del Umbral → pruebas compartidas", "Sombra → contrapunto moral", "Aliado → cooperación o tensión", "Embaucador → disrupción de la autoridad", "Cambiante → ambigüedad", "Heraldo → señala la necesidad de guía"],
      writingHeading: "Cómo escribir un Mentor convincente",
      writing: ["Presentación sólida", "Motivación clara", "Experiencia demostrada", "Personalidad única", "Historia de fondo reveladora", "Relación de confianza con el Héroe", "Primera lección memorable", "Presencia simbólica"],
      examplesHeading: "Ejemplos del Mentor",
      examples: ["Gandalf", "Dumbledore", "Mr. Miyagi", "Yoda", "Profesor Xavier", "Glinda", "Haymitch", "Rafiki", "Morfeo"]
    }
  },

  herald: {
    en: {
      introQuestion: "Who is the Herald?",
      intro: [
        "The Herald announces change. They disrupt the status quo and deliver the call to adventure, signaling that the current world can no longer remain the same.",
        "The Herald does not need to stay in the story long — their power lies in initiating movement."
      ],
      traitsHeading: "Core traits",
      traits: ["Messenger of change", "Catalyst for action", "Bringer of information or crisis", "External or internal trigger", "Neutral, positive, or threatening"],
      traitsNote: "The Herald forces a decision.",
      functionHeading: "Narrative function",
      functionIntro: "The Herald appears to:",
      functions: ["Deliver news", "Introduce conflict", "Reveal danger or opportunity", "Force the Hero to act", "Break routine"],
      functionNote: "They are the narrative spark.",
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → awakens purpose", "Mentor → confirms the call", "Shadow → escalation of threat", "Ally → shared urgency", "Shapeshifter → uncertainty around meaning", "Trickster → distorted message"],
      writingHeading: "Writing an effective Herald",
      writing: ["Clear message", "Strong timing", "Memorable entrance", "Emotional impact", "Immediate consequences", "No unnecessary exposition"],
      examplesHeading: "Herald Examples",
      examples: ["R2-D2", "The White Rabbit", "Hagrid", "The Letter from Hogwarts", "The Black Spot (Treasure Island)", "Morpheus (first contact)", "Paul Revere"]
    },
    es: {
      introQuestion: "¿Quién es el Heraldo?",
      intro: [
        "El Heraldo anuncia el cambio. Trastoca el statu quo y entrega la llamada a la aventura, señalando que el mundo tal como existe ya no puede seguir igual.",
        "El Heraldo no necesita permanecer en la historia mucho tiempo; su poder reside en iniciar el movimiento."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Mensajero del cambio", "Catalizador de la acción", "Portador de información o crisis", "Detonante externo o interno", "Neutral, positivo o amenazante"],
      traitsNote: "El Heraldo fuerza una decisión.",
      functionHeading: "Función narrativa",
      functionIntro: "El Heraldo aparece para:",
      functions: ["Entregar noticias", "Introducir el conflicto", "Revelar peligro u oportunidad", "Obligar al Héroe a actuar", "Romper la rutina"],
      functionNote: "Es la chispa narrativa.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → despierta el propósito", "Mentor → confirma la llamada", "Sombra → escalada de la amenaza", "Aliado → urgencia compartida", "Cambiante → incertidumbre sobre el significado", "Embaucador → mensaje distorsionado"],
      writingHeading: "Cómo escribir un Heraldo efectivo",
      writing: ["Mensaje claro", "Momento oportuno", "Entrada memorable", "Impacto emocional", "Consecuencias inmediatas", "Sin exposición innecesaria"],
      examplesHeading: "Ejemplos del Heraldo",
      examples: ["R2-D2", "El Conejo Blanco", "Hagrid", "La carta de Hogwarts", "La Mancha Negra (La isla del tesoro)", "Morfeo (primer contacto)", "Paul Revere"]
    }
  },

  shadow: {
    en: {
      introQuestion: "Who is the Shadow?",
      intro: [
        "The Shadow represents the Hero's greatest obstacle. It often embodies the Hero's repressed fears, flaws, or dark potential.",
        "The Shadow can be a villain, antagonist, rival, or internal force."
      ],
      traitsHeading: "Core traits",
      traits: ["Opposition and threat", "Moral contrast", "Power or temptation", "Psychological mirror", "Fear incarnate"],
      traitsNote: "The Shadow tests the Hero's values.",
      functionHeading: "Narrative function",
      functionIntro: "The Shadow exists to:",
      functions: ["Block progress", "Challenge morality", "Force growth", "Expose weakness", "Represent consequences"],
      functionNote: "Defeating the Shadow often means internal change.",
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → mirrored opposition", "Mentor → ideological contrast", "Ally → collateral conflict", "Trickster → destabilization", "Shapeshifter → hidden threat", "Threshold Guardian → shared function"],
      writingHeading: "Writing a powerful Shadow",
      writing: ["Clear motivation", "Personal connection to Hero", "Symbolic design", "Escalating threat", "Moral complexity", "Consequences beyond defeat"],
      examplesHeading: "Shadow Examples",
      examples: ["Darth Vader", "Voldemort", "Sauron", "Joker", "Scar", "Thanos", "Capitán Ahab"]
    },
    es: {
      introQuestion: "¿Quién es la Sombra?",
      intro: [
        "La Sombra representa el mayor obstáculo del Héroe. Con frecuencia encarna los miedos reprimidos, los defectos o el potencial oscuro del propio Héroe.",
        "La Sombra puede ser un villano, un antagonista, un rival o una fuerza interior."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Oposición y amenaza", "Contraste moral", "Poder o tentación", "Espejo psicológico", "El miedo hecho carne"],
      traitsNote: "La Sombra pone a prueba los valores del Héroe.",
      functionHeading: "Función narrativa",
      functionIntro: "La Sombra existe para:",
      functions: ["Bloquear el progreso", "Desafiar la moralidad", "Forzar el crecimiento", "Exponer las debilidades", "Representar las consecuencias"],
      functionNote: "Vencer a la Sombra a menudo implica un cambio interno.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → oposición especular", "Mentor → contraste ideológico", "Aliado → conflicto colateral", "Embaucador → desestabilización", "Cambiante → amenaza oculta", "Guardián del Umbral → función compartida"],
      writingHeading: "Cómo escribir una Sombra poderosa",
      writing: ["Motivación clara", "Conexión personal con el Héroe", "Diseño simbólico", "Amenaza en escalada", "Complejidad moral", "Consecuencias más allá de la derrota"],
      examplesHeading: "Ejemplos de la Sombra",
      examples: ["Darth Vader", "Voldemort", "Sauron", "Joker", "Scar", "Thanos", "Capitán Ahab"]
    }
  },

  trickster: {
    en: {
      introQuestion: "Who is the Trickster?",
      intro: [
        "The Trickster introduces chaos, humor, and unpredictability. They question authority, expose hypocrisy, and disrupt order.",
        "The Trickster is rarely evil — they destabilize to reveal truth."
      ],
      traitsHeading: "Core traits",
      traits: ["Humor and wit", "Rule-breaking behavior", "Irony and satire", "Unpredictability", "Social disruption"],
      traitsNote: "They thrive on contradiction.",
      functionHeading: "Narrative function",
      functionIntro: "The Trickster serves to:",
      functions: ["Relieve tension", "Challenge norms", "Reveal hidden truths", "Expose weakness", "Create narrative surprise"],
      functionNote: "They prevent stagnation.",
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → comic relief or moral test", "Mentor → challenges authority", "Shadow → ironic contrast", "Ally → unreliable support", "Shapeshifter → shared ambiguity"],
      writingHeading: "Writing an effective Trickster",
      writing: ["Sharp dialogue", "Clear worldview", "Narrative timing", "Purposeful disruption", "Balance humor and impact"],
      examplesHeading: "Trickster Examples",
      examples: ["Loki", "Jack Sparrow", "Bugs Bunny", "Deadpool", "The Joker (comic function)", "Puck", "Han Solo"]
    },
    es: {
      introQuestion: "¿Quién es el Embaucador?",
      intro: [
        "El Embaucador introduce el caos, el humor y la imprevisibilidad. Cuestiona la autoridad, expone la hipocresía y trastoca el orden establecido.",
        "El Embaucador rara vez es malvado: desestabiliza para revelar la verdad."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Humor e ingenio", "Comportamiento transgresor", "Ironía y sátira", "Imprevisibilidad", "Disrupción social"],
      traitsNote: "Prospera en la contradicción.",
      functionHeading: "Función narrativa",
      functionIntro: "El Embaucador sirve para:",
      functions: ["Aliviar la tensión", "Cuestionar las normas", "Revelar verdades ocultas", "Exponer las debilidades", "Crear sorpresa narrativa"],
      functionNote: "Impide el estancamiento.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → alivio cómico o prueba moral", "Mentor → desafía la autoridad", "Sombra → contraste irónico", "Aliado → apoyo poco fiable", "Cambiante → ambigüedad compartida"],
      writingHeading: "Cómo escribir un Embaucador efectivo",
      writing: ["Diálogo afilado", "Visión del mundo clara", "Ritmo narrativo", "Disrupción con propósito", "Equilibrar humor e impacto"],
      examplesHeading: "Ejemplos del Embaucador",
      examples: ["Loki", "Jack Sparrow", "Bugs Bunny", "Deadpool", "El Joker (función cómica)", "Puck", "Han Solo"]
    }
  },

  ally: {
    en: {
      introQuestion: "Who is the Ally?",
      intro: [
        "The Ally supports the Hero emotionally, strategically, or practically. They represent friendship, loyalty, and shared purpose.",
        "Allies humanize the Hero."
      ],
      traitsHeading: "Core traits",
      traits: ["Loyalty", "Complementary skills", "Emotional support", "Shared risk", "Personal stake"],
      traitsNote: "Allies often have their own arcs.",
      functionHeading: "Narrative function",
      functionIntro: "The Ally helps by:",
      functions: ["Assisting in conflict", "Providing perspective", "Supporting decisions", "Sharing danger", "Reflecting growth"],
      functionNote: "They reinforce connection.",
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → partnership", "Mentor → guidance extension", "Shadow → vulnerability", "Trickster → contrast", "Shapeshifter → trust tension"],
      writingHeading: "Writing strong Allies",
      writing: ["Clear individuality", "Defined strengths", "Emotional bond", "Independent goals", "Potential conflict"],
      examplesHeading: "Ally Examples",
      examples: ["Samwise Gamgee", "Ron Weasley", "Hermione Granger", "Chewbacca", "Dr. Watson", "Merry & Pippin", "Peeta Mellark"]
    },
    es: {
      introQuestion: "¿Quién es el Aliado?",
      intro: [
        "El Aliado apoya al Héroe emocional, estratégica o prácticamente. Representa la amistad, la lealtad y el propósito compartido.",
        "Los aliados humanizan al Héroe."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Lealtad", "Habilidades complementarias", "Apoyo emocional", "Riesgo compartido", "Interés personal en el resultado"],
      traitsNote: "Los aliados suelen tener sus propios arcos.",
      functionHeading: "Función narrativa",
      functionIntro: "El Aliado ayuda mediante:",
      functions: ["Asistencia en el conflicto", "Aportación de perspectiva", "Respaldo en las decisiones", "Compartir el peligro", "Reflejo del crecimiento del Héroe"],
      functionNote: "Refuerzan la conexión.",
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → asociación", "Mentor → extensión de la guía", "Sombra → vulnerabilidad", "Embaucador → contraste", "Cambiante → tensión de confianza"],
      writingHeading: "Cómo escribir Aliados sólidos",
      writing: ["Individualidad clara", "Fortalezas definidas", "Vínculo emocional", "Objetivos propios", "Potencial de conflicto"],
      examplesHeading: "Ejemplos del Aliado",
      examples: ["Samsagaz Gamyi", "Ron Weasley", "Hermione Granger", "Chewbacca", "Dr. Watson", "Merry y Pippin", "Peeta Mellark"]
    }
  },

  shapeshifter: {
    en: {
      introQuestion: "Who is the Shapeshifter?",
      intro: [
        "The Shapeshifter embodies uncertainty. Their allegiance, identity, or intentions are unclear, creating doubt and tension.",
        "They represent change and ambiguity."
      ],
      traitsHeading: "Core traits",
      traits: ["Duality", "Uncertainty", "Fluid loyalty", "Deception or mystery", "Emotional instability"],
      traitsNote: "They challenge trust.",
      functionHeading: "Narrative function",
      functionIntro: "The Shapeshifter exists to:",
      functions: ["Create doubt", "Test perception", "Complicate relationships", "Introduce surprise", "Represent internal conflict"],
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → trust challenge", "Mentor → warning or lesson", "Shadow → secret alliance", "Ally → betrayal risk", "Trickster → shared chaos"],
      writingHeading: "Writing a compelling Shapeshifter",
      writing: ["Clear mystery", "Consistent ambiguity", "Emotional stakes", "Gradual revelation", "Meaningful transformation"],
      examplesHeading: "Shapeshifter Examples",
      examples: ["Catwoman", "Severus Snape", "Gollum", "Mystique", "Nick Fury", "Scarlett O'Hara"]
    },
    es: {
      introQuestion: "¿Quién es el Cambiante?",
      intro: [
        "El Cambiante encarna la incertidumbre. Su lealtad, identidad o intenciones son difusas, lo que genera duda y tensión.",
        "Representa el cambio y la ambigüedad."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Dualidad", "Incertidumbre", "Lealtad fluida", "Engaño o misterio", "Inestabilidad emocional"],
      traitsNote: "Pone a prueba la confianza.",
      functionHeading: "Función narrativa",
      functionIntro: "El Cambiante existe para:",
      functions: ["Crear duda", "Poner a prueba la percepción", "Complicar las relaciones", "Introducir la sorpresa", "Representar el conflicto interno"],
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → desafío a la confianza", "Mentor → advertencia o lección", "Sombra → alianza secreta", "Aliado → riesgo de traición", "Embaucador → caos compartido"],
      writingHeading: "Cómo escribir un Cambiante convincente",
      writing: ["Misterio claro", "Ambigüedad coherente", "Apuestas emocionales", "Revelación gradual", "Transformación significativa"],
      examplesHeading: "Ejemplos del Cambiante",
      examples: ["Catwoman", "Severus Snape", "Gollum", "Mystique", "Nick Fury", "Scarlett O'Hara"]
    }
  },

  thresholdGuardian: {
    en: {
      introQuestion: "Who is the Threshold Guardian?",
      intro: [
        "The Threshold Guardian blocks progress and tests readiness. They appear at key moments of transition.",
        "They are not always villains — they are gatekeepers."
      ],
      traitsHeading: "Core traits",
      traits: ["Obstacle or challenge", "Moral or physical test", "Enforcer of rules", "Neutral opposition", "Trial embodiment"],
      traitsNote: "Passing them marks growth.",
      functionHeading: "Narrative function",
      functions: ["Tests commitment", "Filters worthiness", "Forces preparation", "Delays progression", "Raises stakes"],
      relationshipsHeading: "Key relationships",
      relationships: ["Hero → rite of passage", "Mentor → preparation source", "Shadow → structural parallel", "Ally → shared test", "Trickster → bypass attempt"],
      writingHeading: "Writing effective Threshold Guardians",
      writing: ["Clear rules", "Symbolic challenge", "Consequences for failure", "Escalation of difficulty", "Memorable encounter"],
      examplesHeading: "Threshold Guardian Examples",
      examples: ["The Sphinx", "Cerberus", "The Bouncer", "Stormtroopers", "Gatekeepers", "Dragons", "The First Boss"]
    },
    es: {
      introQuestion: "¿Quién es el Guardián del Umbral?",
      intro: [
        "El Guardián del Umbral bloquea el progreso y pone a prueba la preparación. Aparece en momentos clave de transición.",
        "No siempre es un villano: es el guardián de la puerta."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Obstáculo o desafío", "Prueba moral o física", "Custodio de las reglas", "Oposición neutral", "Encarnación de la prueba"],
      traitsNote: "Superarlo marca el crecimiento.",
      functionHeading: "Función narrativa",
      functions: ["Pone a prueba el compromiso", "Filtra la valía", "Obliga a la preparación", "Retrasa la progresión", "Eleva las apuestas"],
      relationshipsHeading: "Relaciones clave",
      relationships: ["Héroe → rito de paso", "Mentor → fuente de preparación", "Sombra → paralelo estructural", "Aliado → prueba compartida", "Embaucador → intento de eludir la prueba"],
      writingHeading: "Cómo escribir Guardianes del Umbral efectivos",
      writing: ["Reglas claras", "Desafío simbólico", "Consecuencias por el fracaso", "Escalada de dificultad", "Encuentro memorable"],
      examplesHeading: "Ejemplos del Guardián del Umbral",
      examples: ["La Esfinge", "Cerbero", "El portero", "Soldados imperiales", "Guardianes", "Dragones", "El primer jefe"]
    }
  },

  // ── Jung archetypes ─────────────────────────────────────────────────────

  caregiver: {
    en: {
      introQuestion: "Who is the Caregiver?",
      intro: [
        "The Caregiver is driven by compassion, responsibility, and the desire to protect others. They exist to nurture, support, and sustain, often putting others' needs before their own.",
        "This archetype represents altruism, sacrifice, and unconditional care."
      ],
      traitsHeading: "Core traits",
      traits: ["Empathy and compassion", "Selflessness", "Responsibility", "Emotional strength", "Protective instinct"],
      traitsNote: "The Caregiver's weakness is often self-neglect.",
      functionHeading: "Narrative function",
      functions: ["Protects vulnerable characters", "Provides emotional stability", "Represents moral goodness", "Motivates sacrifice", "Creates emotional stakes"],
      functionNote: "They often anchor the story's heart.",
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Helping others vs. self-preservation", "Love vs. burnout", "Responsibility vs. freedom"],
      examplesHeading: "Caregiver Examples",
      examples: ["Marmee (Little Women)", "Samwise Gamgee", "Aunt May", "Molly Weasley", "Baymax", "Marlin (Finding Nemo)"]
    },
    es: {
      introQuestion: "¿Quién es el Cuidador?",
      intro: [
        "El Cuidador está impulsado por la compasión, la responsabilidad y el deseo de proteger a los demás. Existe para nutrir, apoyar y sostener, anteponiendo con frecuencia las necesidades ajenas a las propias.",
        "Este arquetipo representa el altruismo, el sacrificio y el cuidado incondicional."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Empatía y compasión", "Altruismo", "Responsabilidad", "Fortaleza emocional", "Instinto protector"],
      traitsNote: "La debilidad del Cuidador suele ser el descuido de sí mismo.",
      functionHeading: "Función narrativa",
      functions: ["Protege a los personajes vulnerables", "Proporciona estabilidad emocional", "Representa la bondad moral", "Motiva el sacrificio", "Crea apuestas emocionales"],
      functionNote: "Con frecuencia ancla el corazón de la historia.",
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Ayudar a otros frente a la autoconservación", "Amor frente al agotamiento", "Responsabilidad frente a libertad"],
      examplesHeading: "Ejemplos del Cuidador",
      examples: ["Marmee (Mujercitas)", "Samsagaz Gamyi", "Tía May", "Molly Weasley", "Baymax", "Marlin (Buscando a Nemo)"]
    }
  },

  creator: {
    en: {
      introQuestion: "Who is the Creator?",
      intro: [
        "The Creator is driven by imagination and the urge to build something meaningful. They seek originality, self-expression, and lasting impact through creation.",
        "This archetype fears mediocrity and unrealized potential."
      ],
      traitsHeading: "Core traits",
      traits: ["Creativity", "Vision", "Innovation", "Sensitivity", "Perfectionism"],
      traitsNote: "They are often torn between inspiration and self-doubt.",
      functionHeading: "Narrative function",
      functions: ["Brings new ideas into the world", "Challenges existing systems", "Embodies artistic struggle", "Explores identity through creation"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Fear of failure", "Obsession with perfection", "Isolation", "The cost of creation"],
      examplesHeading: "Creator Examples",
      examples: ["Victor Frankenstein", "Tony Stark", "Walt Disney (fictionalized)", "Dr. Emmett Brown", "Jo March", "Da Vinci–type characters"]
    },
    es: {
      introQuestion: "¿Quién es el Creador?",
      intro: [
        "El Creador está impulsado por la imaginación y el impulso de construir algo significativo. Busca la originalidad, la autoexpresión y un impacto duradero a través de la creación.",
        "Este arquetipo teme la mediocridad y el potencial sin realizar."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Creatividad", "Visión", "Innovación", "Sensibilidad", "Perfeccionismo"],
      traitsNote: "Con frecuencia se debate entre la inspiración y la duda.",
      functionHeading: "Función narrativa",
      functions: ["Trae nuevas ideas al mundo", "Desafía los sistemas existentes", "Encarna la lucha artística", "Explora la identidad a través de la creación"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Miedo al fracaso", "Obsesión con la perfección", "Aislamiento", "El precio de la creación"],
      examplesHeading: "Ejemplos del Creador",
      examples: ["Víctor Frankenstein", "Tony Stark", "Walt Disney (ficcional)", "Dr. Emmett Brown", "Jo March", "Personajes tipo Da Vinci"]
    }
  },

  everyman: {
    en: {
      introQuestion: "Who is the Everyman?",
      intro: [
        "The Everyman represents normalcy, relatability, and belonging. They are not exceptional by skill or destiny, but by humanity.",
        "This archetype allows the audience to see themselves in the story."
      ],
      traitsHeading: "Core traits",
      traits: ["Humility", "Honesty", "Reliability", "Relatability", "Desire for connection"],
      traitsNote: "They succeed through perseverance, not greatness.",
      functionHeading: "Narrative function",
      functions: ["Grounds the story", "Reflects audience values", "Humanizes extraordinary events", "Emphasizes community and belonging"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Feeling insignificant", "Fear of standing out", "Desire to belong vs. desire to matter"],
      examplesHeading: "Everyman Examples",
      examples: ["Arthur Dent", "Bilbo Baggins (early)", "Jim Halpert", "Forrest Gump", "Frodo (initially)"]
    },
    es: {
      introQuestion: "¿Quién es el Ciudadano Común?",
      intro: [
        "El Ciudadano Común representa la normalidad, la identificación y la pertenencia. No es excepcional por sus habilidades o destino, sino por su humanidad.",
        "Este arquetipo permite al público verse reflejado en la historia."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Humildad", "Honestidad", "Fiabilidad", "Identificabilidad", "Deseo de conexión"],
      traitsNote: "Triunfa gracias a la perseverancia, no a la grandeza.",
      functionHeading: "Función narrativa",
      functions: ["Ancla la historia", "Refleja los valores del público", "Humaniza los eventos extraordinarios", "Subraya la comunidad y la pertenencia"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Sentirse insignificante", "Miedo a destacar", "Deseo de pertenecer frente a deseo de importar"],
      examplesHeading: "Ejemplos del Ciudadano Común",
      examples: ["Arthur Dent", "Bilbo Bolsón (al inicio)", "Jim Halpert", "Forrest Gump", "Frodo (al principio)"]
    }
  },

  explorer: {
    en: {
      introQuestion: "Who is the Explorer?",
      intro: [
        "The Explorer seeks freedom, discovery, and self-definition. They reject confinement and pursue meaning through experience.",
        "This archetype values independence above all else."
      ],
      traitsHeading: "Core traits",
      traits: ["Curiosity", "Independence", "Courage", "Restlessness", "Self-reliance"],
      traitsNote: "They fear conformity and stagnation.",
      functionHeading: "Narrative function",
      functions: ["Drives journeys and quests", "Expands the world of the story", "Challenges limits and borders", "Represents personal freedom"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Commitment", "Loneliness", "Rootlessness", "The cost of freedom"],
      examplesHeading: "Explorer Examples",
      examples: ["Indiana Jones", "Lara Croft", "Moana", "Huck Finn", "The Doctor (Doctor Who)"]
    },
    es: {
      introQuestion: "¿Quién es el Explorador?",
      intro: [
        "El Explorador busca libertad, descubrimiento y autodefinición. Rechaza el confinamiento y persigue el significado a través de la experiencia.",
        "Este arquetipo valora la independencia por encima de todo."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Curiosidad", "Independencia", "Valentía", "Inquietud", "Autosuficiencia"],
      traitsNote: "Teme la conformidad y el estancamiento.",
      functionHeading: "Función narrativa",
      functions: ["Impulsa viajes y búsquedas", "Amplía el mundo de la historia", "Desafía los límites y las fronteras", "Representa la libertad personal"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["El compromiso", "La soledad", "La falta de raíces", "El precio de la libertad"],
      examplesHeading: "Ejemplos del Explorador",
      examples: ["Indiana Jones", "Lara Croft", "Moana", "Huck Finn", "El Doctor (Doctor Who)"]
    }
  },

  heroJung: {
    en: {
      introQuestion: "Who is the Hero (Jungian)?",
      intro: [
        "The Jungian Hero represents courage, willpower, and the drive to prove worth through action. Unlike the mythic Hero's Journey, this archetype focuses on strength and achievement."
      ],
      traitsHeading: "Core traits",
      traits: ["Bravery", "Determination", "Discipline", "Moral clarity", "Endurance"],
      traitsNote: "They define themselves through struggle.",
      functionHeading: "Narrative function",
      functions: ["Confronts danger directly", "Overcomes adversity", "Protects others", "Embodies action and resolve"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Pride", "Fear of weakness", "Burnout", "Identity tied solely to victory"],
      examplesHeading: "Hero Examples",
      examples: ["Wonder Woman", "Captain America", "Achilles", "Beowulf", "Maximus"]
    },
    es: {
      introQuestion: "¿Quién es el Héroe (Jung)?",
      intro: [
        "El Héroe jungiano representa el valor, la fuerza de voluntad y el impulso de demostrar la valía a través de la acción. A diferencia del viaje mítico del Héroe, este arquetipo se centra en la fortaleza y el logro."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Valentía", "Determinación", "Disciplina", "Claridad moral", "Resistencia"],
      traitsNote: "Se definen a sí mismos a través de la lucha.",
      functionHeading: "Función narrativa",
      functions: ["Afronta el peligro directamente", "Supera la adversidad", "Protege a los demás", "Encarna la acción y la resolución"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Orgullo", "Miedo a la debilidad", "Agotamiento", "Identidad ligada exclusivamente a la victoria"],
      examplesHeading: "Ejemplos del Héroe",
      examples: ["Wonder Woman", "Capitán América", "Aquiles", "Beowulf", "Máximo"]
    }
  },

  innocent: {
    en: {
      introQuestion: "Who is the Innocent?",
      intro: [
        "The Innocent seeks happiness, safety, and goodness. They believe in a just world and trust others easily.",
        "This archetype represents hope and moral purity."
      ],
      traitsHeading: "Core traits",
      traits: ["Optimism", "Trust", "Faith", "Simplicity", "Moral clarity"],
      traitsNote: "Their weakness is naivety.",
      functionHeading: "Narrative function",
      functions: ["Highlights corruption or cruelty", "Inspires protection", "Restores hope", "Contrasts darker characters"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Loss of faith", "Disillusionment", "Exposure to harsh reality"],
      examplesHeading: "Innocent Examples",
      examples: ["Dorothy Gale", "Paddington", "Buddy (Elf)", "Bambi", "Amélie"]
    },
    es: {
      introQuestion: "¿Quién es el Inocente?",
      intro: [
        "El Inocente busca la felicidad, la seguridad y la bondad. Cree en un mundo justo y confía en los demás con facilidad.",
        "Este arquetipo representa la esperanza y la pureza moral."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Optimismo", "Confianza", "Fe", "Sencillez", "Claridad moral"],
      traitsNote: "Su debilidad es la ingenuidad.",
      functionHeading: "Función narrativa",
      functions: ["Pone de relieve la corrupción o la crueldad", "Inspira la protección", "Restaura la esperanza", "Contrasta con los personajes más oscuros"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Pérdida de la fe", "Desilusión", "Exposición a la realidad más dura"],
      examplesHeading: "Ejemplos del Inocente",
      examples: ["Dorothy Gale", "Paddington", "Buddy (Elf)", "Bambi", "Amélie"]
    }
  },

  jester: {
    en: {
      introQuestion: "Who is the Jester?",
      intro: [
        "The Jester lives in the moment, embracing humor, chaos, and joy. They expose truth through laughter and subversion."
      ],
      traitsHeading: "Core traits",
      traits: ["Humor", "Irreverence", "Playfulness", "Chaos", "Social critique"],
      traitsNote: "They fear boredom and oppression.",
      functionHeading: "Narrative function",
      functions: ["Relieves tension", "Exposes hypocrisy", "Challenges authority", "Brings levity"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Being taken seriously", "Hiding pain behind humor"],
      examplesHeading: "Jester Examples",
      examples: ["Jack Sparrow", "The Genie", "Tyrion Lannister", "Bugs Bunny", "Puck"]
    },
    es: {
      introQuestion: "¿Quién es el Bufón?",
      intro: [
        "El Bufón vive el momento presente, abrazando el humor, el caos y la alegría. Revela la verdad a través de la risa y la subversión."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Humor", "Irreverencia", "Juego", "Caos", "Crítica social"],
      traitsNote: "Teme el aburrimiento y la opresión.",
      functionHeading: "Función narrativa",
      functions: ["Alivia la tensión", "Expone la hipocresía", "Desafía la autoridad", "Aporta ligereza"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["No ser tomado en serio", "Esconder el dolor detrás del humor"],
      examplesHeading: "Ejemplos del Bufón",
      examples: ["Jack Sparrow", "El Genio", "Tyrion Lannister", "Bugs Bunny", "Puck"]
    }
  },

  lover: {
    en: {
      introQuestion: "Who is the Lover?",
      intro: [
        "The Lover is driven by passion, intimacy, and connection. They seek union — romantic, emotional, or aesthetic."
      ],
      traitsHeading: "Core traits",
      traits: ["Passion", "Devotion", "Sensuality", "Emotional depth", "Vulnerability"],
      traitsNote: "They fear abandonment and loss.",
      functionHeading: "Narrative function",
      functions: ["Raises emotional stakes", "Motivates sacrifice", "Explores intimacy", "Drives relational conflict"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Obsession", "Dependency", "Loss of identity"],
      examplesHeading: "Lover Examples",
      examples: ["Romeo & Juliet", "Rose (Titanic)", "Westley", "Scarlett O'Hara", "Jack Dawson"]
    },
    es: {
      introQuestion: "¿Quién es el Amante?",
      intro: [
        "El Amante está impulsado por la pasión, la intimidad y la conexión. Busca la unión, ya sea romántica, emocional o estética."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Pasión", "Devoción", "Sensualidad", "Profundidad emocional", "Vulnerabilidad"],
      traitsNote: "Teme el abandono y la pérdida.",
      functionHeading: "Función narrativa",
      functions: ["Eleva las apuestas emocionales", "Motiva el sacrificio", "Explora la intimidad", "Impulsa el conflicto relacional"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["La obsesión", "La dependencia", "La pérdida de identidad"],
      examplesHeading: "Ejemplos del Amante",
      examples: ["Romeo y Julieta", "Rose (Titanic)", "Westley", "Scarlett O'Hara", "Jack Dawson"]
    }
  },

  magician: {
    en: {
      introQuestion: "Who is the Magician?",
      intro: [
        "The Magician seeks transformation — of self, others, or reality itself. They understand hidden systems and use knowledge to enact change."
      ],
      traitsHeading: "Core traits",
      traits: ["Insight", "Vision", "Power", "Charisma", "Transformation"],
      traitsNote: "They fear unintended consequences.",
      functionHeading: "Narrative function",
      functions: ["Enables change", "Transforms situations", "Reveals hidden truths", "Alters reality"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Control vs. ethics", "Power misuse", "Hubris"],
      examplesHeading: "Magician Examples",
      examples: ["Gandalf", "Doctor Strange", "Merlin", "Neo", "Dumbledore"]
    },
    es: {
      introQuestion: "¿Quién es el Mago?",
      intro: [
        "El Mago busca la transformación, ya sea de sí mismo, de los demás o de la propia realidad. Comprende los sistemas ocultos y utiliza el conocimiento para provocar el cambio."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Perspicacia", "Visión", "Poder", "Carisma", "Transformación"],
      traitsNote: "Teme las consecuencias no deseadas.",
      functionHeading: "Función narrativa",
      functions: ["Posibilita el cambio", "Transforma las situaciones", "Revela verdades ocultas", "Altera la realidad"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Control frente a ética", "Abuso de poder", "Hybris"],
      examplesHeading: "Ejemplos del Mago",
      examples: ["Gandalf", "Doctor Strange", "Merlín", "Neo", "Dumbledore"]
    }
  },

  outlaw: {
    en: {
      introQuestion: "Who is the Outlaw?",
      intro: [
        "The Outlaw rejects rules, authority, and conformity. They seek freedom through rebellion and disruption."
      ],
      traitsHeading: "Core traits",
      traits: ["Defiance", "Independence", "Anger or idealism", "Courage", "Anti-authoritarianism"],
      traitsNote: "They fear powerlessness.",
      functionHeading: "Narrative function",
      functions: ["Challenges systems", "Sparks revolution", "Represents resistance", "Breaks unjust rules"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Destruction vs. change", "Isolation", "Moral ambiguity"],
      examplesHeading: "Outlaw Examples",
      examples: ["V", "Robin Hood", "Han Solo", "Tyler Durden", "Katniss Everdeen"]
    },
    es: {
      introQuestion: "¿Quién es el Forajido?",
      intro: [
        "El Forajido rechaza las normas, la autoridad y la conformidad. Busca la libertad a través de la rebelión y la disrupción."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Rebeldía", "Independencia", "Ira o idealismo", "Valentía", "Antiautoritarismo"],
      traitsNote: "Teme la impotencia.",
      functionHeading: "Función narrativa",
      functions: ["Desafía los sistemas", "Inflama la revolución", "Representa la resistencia", "Rompe las normas injustas"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Destrucción frente a cambio", "Aislamiento", "Ambigüedad moral"],
      examplesHeading: "Ejemplos del Forajido",
      examples: ["V", "Robin Hood", "Han Solo", "Tyler Durden", "Katniss Everdeen"]
    }
  },

  ruler: {
    en: {
      introQuestion: "Who is the Ruler?",
      intro: [
        "The Ruler seeks order, control, and stability. They value leadership, responsibility, and structure."
      ],
      traitsHeading: "Core traits",
      traits: ["Authority", "Control", "Responsibility", "Vision", "Discipline"],
      traitsNote: "They fear chaos and loss of power.",
      functionHeading: "Narrative function",
      functions: ["Establishes order", "Sets laws and norms", "Represents power", "Creates political stakes"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Tyranny vs. justice", "Control vs. trust"],
      examplesHeading: "Ruler Examples",
      examples: ["Mufasa", "Aragorn", "Queen Elizabeth–type figures", "Tywin Lannister", "Odin"]
    },
    es: {
      introQuestion: "¿Quién es el Gobernante?",
      intro: [
        "El Gobernante busca el orden, el control y la estabilidad. Valora el liderazgo, la responsabilidad y la estructura."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Autoridad", "Control", "Responsabilidad", "Visión", "Disciplina"],
      traitsNote: "Teme el caos y la pérdida de poder.",
      functionHeading: "Función narrativa",
      functions: ["Establece el orden", "Fija leyes y normas", "Representa el poder", "Crea apuestas políticas"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Tiranía frente a justicia", "Control frente a confianza"],
      examplesHeading: "Ejemplos del Gobernante",
      examples: ["Mufasa", "Aragorn", "Figuras tipo Isabel I", "Tywin Lannister", "Odín"]
    }
  },

  sage: {
    en: {
      introQuestion: "Who is the Sage?",
      intro: [
        "The Sage seeks truth through knowledge and understanding. They value wisdom over action."
      ],
      traitsHeading: "Core traits",
      traits: ["Intelligence", "Objectivity", "Insight", "Reflection", "Patience"],
      traitsNote: "They fear ignorance and deception.",
      functionHeading: "Narrative function",
      functions: ["Provides truth", "Explains systems", "Guides decisions", "Offers perspective"],
      innerConflictHeading: "Inner conflict",
      innerConflicts: ["Detachment", "Inaction", "Emotional distance"],
      examplesHeading: "Sage Examples",
      examples: ["Obi-Wan Kenobi", "Socrates–type figures", "Professor X", "Dumbledore (as Sage)", "Spock"]
    },
    es: {
      introQuestion: "¿Quién es el Sabio?",
      intro: [
        "El Sabio busca la verdad a través del conocimiento y la comprensión. Valora la sabiduría por encima de la acción."
      ],
      traitsHeading: "Rasgos fundamentales",
      traits: ["Inteligencia", "Objetividad", "Perspicacia", "Reflexión", "Paciencia"],
      traitsNote: "Teme la ignorancia y el engaño.",
      functionHeading: "Función narrativa",
      functions: ["Proporciona la verdad", "Explica los sistemas", "Guía las decisiones", "Ofrece perspectiva"],
      innerConflictHeading: "Conflicto interno",
      innerConflicts: ["Distanciamiento", "Inacción", "Distancia emocional"],
      examplesHeading: "Ejemplos del Sabio",
      examples: ["Obi-Wan Kenobi", "Figuras tipo Sócrates", "Profesor X", "Dumbledore (como Sabio)", "Spock"]
    }
  },

  // ── Character arcs ─────────────────────────────────────────────────────

  moralAscent: {
    en: {
      introQuestion: "What is a Moral Ascent?",
      intro: [
        "A Moral Ascent arc follows a character who grows ethically over the course of the story. The character starts with flaws, ignorance, or selfishness and gradually learns to act with greater integrity, empathy, or responsibility.",
        "This is the classic arc of becoming better."
      ],
      characteristicsHeading: "Core characteristics",
      characteristics: ["Ethical growth", "Increased empathy", "Personal responsibility", "Learning from mistakes", "Sacrifice for others"],
      characteristicsNote: "The character ends the story morally stronger than they began.",
      functionHeading: "Narrative function",
      functions: ["Inspire the audience", "Reinforce ethical values", "Reward self-reflection and growth", "Create emotional catharsis"],
      functionNote: "It often aligns with hopeful or redemptive stories.",
      conflictsHeading: "Common internal conflicts",
      conflicts: ["Fear vs. courage", "Self-interest vs. responsibility", "Ignorance vs. awareness", "Comfort vs. change"],
      examplesHeading: "Moral Ascent Examples",
      examples: ["Ebenezer Scrooge", "Zuko", "Jean Valjean", "Tony Stark", "Shrek", "Mulan"]
    },
    es: {
      introQuestion: "¿Qué es el Ascenso Moral?",
      intro: [
        "El arco de Ascenso Moral sigue a un personaje que crece éticamente a lo largo de la historia. El personaje comienza con defectos, ignorancia o egoísmo y aprende gradualmente a actuar con mayor integridad, empatía o responsabilidad.",
        "Es el arco clásico de llegar a ser mejor."
      ],
      characteristicsHeading: "Características fundamentales",
      characteristics: ["Crecimiento ético", "Mayor empatía", "Responsabilidad personal", "Aprendizaje de los errores", "Sacrificio por los demás"],
      characteristicsNote: "El personaje termina la historia moralmente más fuerte que al comenzarla.",
      functionHeading: "Función narrativa",
      functions: ["Inspirar al público", "Reforzar los valores éticos", "Recompensar la autorreflexión y el crecimiento", "Crear catarsis emocional"],
      functionNote: "Con frecuencia se asocia a historias esperanzadoras o de redención.",
      conflictsHeading: "Conflictos internos frecuentes",
      conflicts: ["Miedo frente a valentía", "Interés propio frente a responsabilidad", "Ignorancia frente a conciencia", "Comodidad frente a cambio"],
      examplesHeading: "Ejemplos de Ascenso Moral",
      examples: ["Ebenezer Scrooge", "Zuko", "Jean Valjean", "Tony Stark", "Shrek", "Mulan"]
    }
  },

  moralDescent: {
    en: {
      introQuestion: "What is a Moral Descent?",
      intro: [
        "A Moral Descent arc follows a character who deteriorates ethically over time. They begin with good intentions or neutrality but gradually compromise their values, often due to fear, ambition, pride, or trauma.",
        "This is the arc of corruption."
      ],
      characteristicsHeading: "Core characteristics",
      characteristics: ["Ethical erosion", "Rationalization of wrongdoing", "Increasing selfishness or cruelty", "Loss of empathy", "Escalating consequences"],
      characteristicsNote: "The character becomes morally worse by the end.",
      functionHeading: "Narrative function",
      functions: ["Explore the cost of power", "Examine temptation and corruption", "Create tragedy or cautionary tales", "Critique ambition or hubris"],
      conflictsHeading: "Common internal conflicts",
      conflicts: ["Power vs. morality", "Control vs. restraint", "Fear vs. conscience", "Justification vs. accountability"],
      examplesHeading: "Moral Descent Examples",
      examples: ["Walter White", "Anakin Skywalker", "Michael Corleone", "Macbeth", "Gollum", "Light Yagami"]
    },
    es: {
      introQuestion: "¿Qué es el Descenso Moral?",
      intro: [
        "El arco de Descenso Moral sigue a un personaje que se deteriora éticamente con el tiempo. Comienza con buenas intenciones o neutralidad, pero poco a poco compromete sus valores, a menudo por miedo, ambición, orgullo o trauma.",
        "Es el arco de la corrupción."
      ],
      characteristicsHeading: "Características fundamentales",
      characteristics: ["Erosión ética", "Racionalización de las malas acciones", "Egoísmo o crueldad en aumento", "Pérdida de empatía", "Consecuencias en escalada"],
      characteristicsNote: "El personaje es moralmente peor al final que al comienzo.",
      functionHeading: "Función narrativa",
      functions: ["Explorar el precio del poder", "Examinar la tentación y la corrupción", "Crear tragedias o relatos moralizantes", "Criticar la ambición o la hybris"],
      conflictsHeading: "Conflictos internos frecuentes",
      conflicts: ["Poder frente a moralidad", "Control frente a contención", "Miedo frente a conciencia", "Justificación frente a responsabilidad"],
      examplesHeading: "Ejemplos de Descenso Moral",
      examples: ["Walter White", "Anakin Skywalker", "Michael Corleone", "Macbeth", "Gollum", "Light Yagami"]
    }
  },

  flatMoral: {
    en: {
      introQuestion: "What is a Flat Moral Arc?",
      intro: [
        "In a Flat Moral Arc, the character does not significantly change their moral beliefs. Instead, the character's values remain constant while the world around them is challenged or transformed.",
        "The character changes others, not themselves."
      ],
      characteristicsHeading: "Core characteristics",
      characteristics: ["Stable moral compass", "Strong convictions", "Resistance to pressure", "Consistency under stress", "Influence on others"],
      characteristicsNote: "The arc is external rather than internal.",
      functionHeading: "Narrative function",
      functions: ["Represent ideal values", "Challenge a flawed world", "Serve as moral anchors", "Highlight societal change"],
      conflictsHeading: "Common internal tensions",
      conflicts: ["Isolation due to integrity", "Conflict with changing norms", "Burden of being right", "Moral fatigue"],
      examplesHeading: "Flat Moral Arc Examples",
      examples: ["Captain America", "Paddington", "Atticus Finch", "Superman", "Wonder Woman", "Marge Gunderson"]
    },
    es: {
      introQuestion: "¿Qué es el Arco Plano?",
      intro: [
        "En el Arco Plano, el personaje no cambia significativamente sus creencias morales. En cambio, sus valores permanecen constantes mientras el mundo a su alrededor es desafiado o transformado.",
        "El personaje cambia a los demás, no a sí mismo."
      ],
      characteristicsHeading: "Características fundamentales",
      characteristics: ["Brújula moral estable", "Convicciones sólidas", "Resistencia a la presión", "Coherencia bajo el estrés", "Influencia sobre los demás"],
      characteristicsNote: "El arco es externo, no interno.",
      functionHeading: "Función narrativa",
      functions: ["Representar los valores ideales", "Desafiar un mundo defectuoso", "Servir de ancla moral", "Poner de relieve el cambio social"],
      conflictsHeading: "Tensiones internas frecuentes",
      conflicts: ["Aislamiento por integridad", "Conflicto con las normas cambiantes", "La carga de tener razón", "Fatiga moral"],
      examplesHeading: "Ejemplos de Arco Plano",
      examples: ["Capitán América", "Paddington", "Atticus Finch", "Superman", "Wonder Woman", "Marge Gunderson"]
    }
  },

  moralTransformation: {
    en: {
      introQuestion: "What is a Moral Transformation?",
      intro: [
        "A Moral Transformation arc depicts a character who undergoes a fundamental ethical shift. Unlike gradual ascent or descent, this change is often abrupt, intense, and tied to a defining moment or revelation.",
        "The character becomes morally different — not just better or worse."
      ],
      characteristicsHeading: "Core characteristics",
      characteristics: ["Pivotal turning point", "Identity redefinition", "Value realignment", "Emotional shock or revelation", "Clear 'before and after'"],
      characteristicsNote: "Transformation is often irreversible.",
      functionHeading: "Narrative function",
      functions: ["Mark decisive moments", "Reinvent characters", "Shock or reframe audience perception", "Signal thematic shifts"],
      conflictsHeading: "Common internal conflicts",
      conflicts: ["Guilt vs. denial", "Old identity vs. new self", "Fear of change", "Consequences of awakening"],
      examplesHeading: "Moral Transformation Examples",
      examples: ["Darth Vader (redemption moment)", "Neo (awakening)", "Clarice Starling", "Jaime Lannister", "Elsa (acceptance)", "Andy Dufresne"]
    },
    es: {
      introQuestion: "¿Qué es la Transformación Moral?",
      intro: [
        "El arco de Transformación Moral muestra a un personaje que experimenta un cambio ético fundamental. A diferencia del ascenso o descenso gradual, este cambio suele ser abrupto, intenso y ligado a un momento o revelación decisivos.",
        "El personaje se vuelve moralmente diferente, no simplemente mejor o peor."
      ],
      characteristicsHeading: "Características fundamentales",
      characteristics: ["Punto de inflexión decisivo", "Redefinición de la identidad", "Realineamiento de los valores", "Conmoción emocional o revelación", "Claro 'antes y después'"],
      characteristicsNote: "La transformación suele ser irreversible.",
      functionHeading: "Función narrativa",
      functions: ["Marcar momentos decisivos", "Reinventar a los personajes", "Impactar o replantear la percepción del público", "Señalar cambios temáticos"],
      conflictsHeading: "Conflictos internos frecuentes",
      conflicts: ["Culpa frente a negación", "Identidad antigua frente a nuevo yo", "Miedo al cambio", "Consecuencias del despertar"],
      examplesHeading: "Ejemplos de Transformación Moral",
      examples: ["Darth Vader (momento de redención)", "Neo (el despertar)", "Clarice Starling", "Jaime Lannister", "Elsa (la aceptación)", "Andy Dufresne"]
    }
  }
};

// ─── UI string translations ──────────────────────────────────────────────────

export const UI_I18N = {
  en: {
    back: "Back",
    languageLabel: "Language",
    resources: "Resources",
    characterResources: "Character resources",
    narrativeResources: "Narrative resources",
    structureResources: "Structure resources",
    tipsResources: "Writing tips",
    characterArcs: "Character arcs",
    characterArchetypes: "Character archetypes",
    campbellArchetypes: "Campbell archetypes",
    jungArchetypes: "Jung archetypes",
    narrativeTechniques: "Narrative techniques",
    storyArchitecture: "Story architecture",
    commonPitfalls: "Common pitfalls",
    writingTips: "Writing tips",
    coreCharacteristics: "Core characteristics",
    coreTechniques: "Core techniques",
    coreTraits: "Core traits",
    narrativeFunction: "Narrative function",
    keyRelationships: "Key relationships",
    innerConflict: "Inner conflict",
    examples: "Examples",
    categoryDescriptions: {
      character: "Archetypes, arcs, and character roles",
      narrative: "Techniques that shape how stories unfold",
      structure: "Frameworks and architectures for storytelling",
      tips: "Craft guidance for sentence-level writing"
    },
    tipsIntro: "Practical craft guidance focused on sentence-level execution, clarity of communication, and reader impact. Unlike structural frameworks, this category deals with how language operates moment to moment — voice, rhythm, precision, and rhetorical control. These tips refine technique inside paragraphs rather than shaping the macro architecture of a story.",
    narrativeGroups: [
      { title: "Structural Time Manipulation", subtitle: "Techniques that reorganize chronology to control information flow.", note: "These operate on the temporal axis of the narrative. They don't change events — they change when the audience receives them." },
      { title: "Setup / Payoff Mechanics", subtitle: "Techniques about planting and resolving narrative information. They're all about audience prediction vs outcome.", note: "" },
      { title: "Resolution Devices", subtitle: "Techniques that control how conflict is concluded. Think of these as ending logic frameworks.", note: "" },
      { title: "Style & Delivery Techniques", subtitle: "These shape how information is expressed rather than plot structure. These affect reader experience, not plot mechanics.", note: "" }
    ],
    structureGroups: [
      { title: "Archetypal Character Journeys", subtitle: "Frameworks that model internal transformation and mythic character evolution rather than strict plot beats." },
      { title: "Dramatic Tension Architectures", subtitle: "Models that describe how narrative pressure rises and falls across the story." },
      { title: "Commercial Beat Frameworks", subtitle: "Prescriptive systems designed for audience engagement, genre expectations, and market-friendly pacing." },
      { title: "Narrative Geometry / Experimental Structures", subtitle: "Architectural choices that shape how perspective, time, or reality are presented." }
    ]
  },
  es: {
    back: "Volver",
    languageLabel: "Idioma",
    resources: "Recursos",
    characterResources: "Recursos de personaje",
    narrativeResources: "Recursos narrativos",
    structureResources: "Recursos de estructura",
    tipsResources: "Técnicas de escritura",
    characterArcs: "Arcos de personaje",
    characterArchetypes: "Arquetipos de personaje",
    campbellArchetypes: "Arquetipos de Campbell",
    jungArchetypes: "Arquetipos de Jung",
    narrativeTechniques: "Técnicas narrativas",
    storyArchitecture: "Arquitectura narrativa",
    commonPitfalls: "Errores frecuentes",
    writingTips: "Técnicas de escritura",
    coreCharacteristics: "Características fundamentales",
    coreTechniques: "Técnicas fundamentales",
    coreTraits: "Rasgos fundamentales",
    narrativeFunction: "Función narrativa",
    keyRelationships: "Relaciones clave",
    innerConflict: "Conflicto interno",
    examples: "Ejemplos",
    categoryDescriptions: {
      character: "Arquetipos, arcos y roles de personaje",
      narrative: "Técnicas que modelan cómo se desarrollan las historias",
      structure: "Marcos y arquitecturas para la narración",
      tips: "Guía de oficio para la escritura a nivel de frase"
    },
    tipsIntro: "Guía práctica de oficio centrada en la ejecución a nivel de frase, la claridad de la comunicación y el impacto en el lector. A diferencia de los marcos estructurales, esta categoría trata cómo opera el lenguaje momento a momento: voz, ritmo, precisión y control retórico. Estos consejos perfeccionan la técnica dentro de los párrafos, en lugar de moldear la arquitectura macro de una historia.",
    narrativeGroups: [
      { title: "Manipulación Temporal Estructural", subtitle: "Técnicas que reorganizan la cronología para controlar el flujo de información.", note: "Operan sobre el eje temporal de la narrativa. No cambian los eventos, sino cuándo los recibe el público." },
      { title: "Mecánicas de Preparación y Resolución", subtitle: "Técnicas sobre la siembra y resolución de información narrativa. Se centran en la predicción del público frente al desenlace real.", note: "" },
      { title: "Dispositivos de Resolución", subtitle: "Técnicas que controlan cómo se concluye el conflicto. Son marcos de lógica del final.", note: "" },
      { title: "Técnicas de Estilo y Presentación", subtitle: "Moldean cómo se expresa la información, no la estructura de la trama. Afectan la experiencia del lector, no la mecánica del argumento.", note: "" }
    ],
    structureGroups: [
      { title: "Viajes Arquetípicos del Personaje", subtitle: "Marcos que modelan la transformación interna y la evolución mítica del personaje, en lugar de beats de trama estrictos." },
      { title: "Arquitecturas de Tensión Dramática", subtitle: "Modelos que describen cómo la presión narrativa sube y baja a lo largo de la historia." },
      { title: "Marcos Comerciales de Estructura", subtitle: "Sistemas prescriptivos diseñados para el compromiso del público, las expectativas del género y un ritmo adecuado para el mercado." },
      { title: "Geometría Narrativa / Estructuras Experimentales", subtitle: "Elecciones arquitectónicas que moldean cómo se presentan la perspectiva, el tiempo o la realidad." }
    ]
  }
};

// ─── Card label translations ──────────────────────────────────────────────────

export const LABEL_I18N = {
  en: {
    // Character
    "The Hero": "The Hero",
    "The Mentor": "The Mentor",
    "The Herald": "The Herald",
    "The Shadow": "The Shadow",
    "The Trickster": "The Trickster",
    "The Ally": "The Ally",
    "The Shapeshifter": "The Shapeshifter",
    "The Threshold Guardian": "The Threshold Guardian",
    "The Caregiver": "The Caregiver",
    "The Creator": "The Creator",
    "The Everyman": "The Everyman",
    "The Explorer": "The Explorer",
    "The Hero (Jung)": "The Hero (Jung)",
    "The Innocent": "The Innocent",
    "The Jester": "The Jester",
    "The Lover": "The Lover",
    "The Magician": "The Magician",
    "The Outlaw": "The Outlaw",
    "The Ruler": "The Ruler",
    "The Sage": "The Sage",
    "Moral Ascent": "Moral Ascent",
    "Moral Descent": "Moral Descent",
    "Flat Moral": "Flat Moral Arc",
    "Moral Transformation": "Moral Transformation",
    // Narrative
    "Flashback": "Flashback",
    "Flashforward": "Flashforward",
    "Foreshadowing": "Foreshadowing",
    "Chekhov's Gun": "Chekhov's Gun",
    "Red Herring": "Red Herring",
    "Plot Twist": "Plot Twist",
    "Deus Ex Machina": "Deus Ex Machina",
    "Eucatastrophe": "Eucatastrophe",
    "Poetic Justice": "Poetic Justice",
    "\u201cShow, Don\u2019t Tell\u201d": "\u201cShow, Don\u2019t Tell\u201d",
    "Quibble (Wordplay)": "Quibble (Wordplay)",
    // Structure
    "The Hero's Journey": "The Hero's Journey",
    "Dan Harmon Story Circle": "Dan Harmon Story Circle",
    "Freytag's Pyramid": "Freytag's Pyramid",
    "Fichtean Curve": "Fichtean Curve",
    "Three Act Structure": "Three Act Structure",
    "Kishōtenketsu": "Kishōtenketsu",
    "Save the Cat": "Save the Cat",
    "Seven Point Structure": "Seven Point Structure",
    "Pulp Formula": "Pulp Formula",
    "McKee Story paradigm": "McKee Story Paradigm",
    "Into the Woods structure": "Into the Woods Structure",
    "Frame Narrative": "Frame Narrative",
    "Nonlinear Structure": "Nonlinear Structure",
    "Rashomon Structure": "Rashomon Structure",
    "In Medias Res": "In Medias Res",
    // Tips
    "Argumentation (tips)": "Argumentation",
    "Description (tips)": "Description",
    "Dialogue (tips)": "Dialogue",
    "Exposition (tips)": "Exposition",
    "Narration (tips)": "Narration",
    "Persuasion (tips)": "Persuasion",
    // Pitfalls
    "Character Pitfalls": "Character Pitfalls",
    "Character Arc Pitfalls": "Character Arc Pitfalls",
    "Narrative Technique Pitfalls": "Narrative Technique Pitfalls",
    "Structure Pitfalls": "Structure Pitfalls",
    "Writing-Level Pitfalls": "Writing-Level Pitfalls"
  },
  es: {
    // Character
    "The Hero": "El Héroe",
    "The Mentor": "El Mentor",
    "The Herald": "El Heraldo",
    "The Shadow": "La Sombra",
    "The Trickster": "El Embaucador",
    "The Ally": "El Aliado",
    "The Shapeshifter": "El Cambiante",
    "The Threshold Guardian": "El Guardián del Umbral",
    "The Caregiver": "El Cuidador",
    "The Creator": "El Creador",
    "The Everyman": "El Ciudadano Común",
    "The Explorer": "El Explorador",
    "The Hero (Jung)": "El Héroe (Jung)",
    "The Innocent": "El Inocente",
    "The Jester": "El Bufón",
    "The Lover": "El Amante",
    "The Magician": "El Mago",
    "The Outlaw": "El Forajido",
    "The Ruler": "El Gobernante",
    "The Sage": "El Sabio",
    "Moral Ascent": "Ascenso Moral",
    "Moral Descent": "Descenso Moral",
    "Flat Moral": "Arco Plano",
    "Moral Transformation": "Transformación Moral",
    // Narrative
    "Flashback": "Analepsis",
    "Flashforward": "Prolepsis",
    "Foreshadowing": "Presagio",
    "Chekhov's Gun": "La Pistola de Chéjov",
    "Red Herring": "Pista Falsa",
    "Plot Twist": "Giro de Trama",
    "Deus Ex Machina": "Deus Ex Machina",
    "Eucatastrophe": "Eucatástrofe",
    "Poetic Justice": "Justicia Poética",
    "\u201cShow, Don\u2019t Tell\u201d": "Mostrar, No Contar",
    "Quibble (Wordplay)": "Quibble (Juego de Palabras)",
    // Structure
    "The Hero's Journey": "El Viaje del Héroe",
    "Dan Harmon Story Circle": "El Círculo de Dan Harmon",
    "Freytag's Pyramid": "La Pirámide de Freytag",
    "Fichtean Curve": "La Curva Fichtean",
    "Three Act Structure": "Estructura de Tres Actos",
    "Kishōtenketsu": "Kishōtenketsu",
    "Save the Cat": "Save the Cat",
    "Seven Point Structure": "Estructura de Siete Puntos",
    "Pulp Formula": "Fórmula Pulp",
    "McKee Story paradigm": "Paradigma de McKee",
    "Into the Woods structure": "Estructura Into the Woods",
    "Frame Narrative": "Narración Enmarcada",
    "Nonlinear Structure": "Estructura No Lineal",
    "Rashomon Structure": "Estructura Rashomon",
    "In Medias Res": "In Medias Res",
    // Tips
    "Argumentation (tips)": "Argumentación",
    "Description (tips)": "Descripción",
    "Dialogue (tips)": "Diálogo",
    "Exposition (tips)": "Exposición",
    "Narration (tips)": "Narración",
    "Persuasion (tips)": "Persuasión",
    // Pitfalls
    "Character Pitfalls": "Errores de Personaje",
    "Character Arc Pitfalls": "Errores de Arco de Personaje",
    "Narrative Technique Pitfalls": "Errores de Técnica Narrativa",
    "Structure Pitfalls": "Errores de Estructura",
    "Writing-Level Pitfalls": "Errores de Escritura"
  }
};

/**
 * Get a UI string in the given language.
 * @param {string} lang - 'en' or 'es'
 * @param {string} key - key in UI_I18N
 * @returns {string}
 */
export function ui(lang, key) {
  return UI_I18N[lang]?.[key] ?? UI_I18N.en[key] ?? key;
}

/**
 * Get a card label in the given language.
 * @param {string} lang - 'en' or 'es'
 * @param {string} key - original EN key
 * @returns {string}
 */
export function label(lang, key) {
  return LABEL_I18N[lang]?.[key] ?? LABEL_I18N.en[key] ?? key;
}

/**
 * Get archetype data in the given language.
 * @param {string} archetypeKey - key in ARCHETYPE_DATA
 * @param {string} lang - 'en' or 'es'
 * @returns {object}
 */
export function getArchetypeData(archetypeKey, lang) {
  return ARCHETYPE_DATA[archetypeKey]?.[lang] ?? ARCHETYPE_DATA[archetypeKey]?.en ?? null;
}

// ─── Technique content (bilingual) ──────────────────────────────────────────

export const TECHNIQUE_DATA = {
  "Flashback": {
    en: {
      introTitle: "What is a Flashback?",
      intro: ["A flashback interrupts the present narrative to show events from the past. It provides context, emotional depth, or critical information that reshapes how the audience understands current events."],
      core: ["Temporal shift to the past", "Reveals backstory", "Adds emotional or thematic weight", "Recontextualizes present actions"],
      coreNote: "Flashbacks change understanding, not events.",
      narrativeFunction: ["Reveal motivation", "Explain relationships", "Deepen character psychology", "Withhold and release information strategically"],
      risksTitle: "Common risks",
      risks: ["Interrupting narrative momentum", "Overexplaining", "Redundancy with present action"],
      examplesTitle: "Flashback Examples",
      examples: ["Lost", "The Godfather Part II", "Citizen Kane", "Arrow", "Eternal Sunshine of the Spotless Mind"]
    },
    es: {
      introTitle: "¿Qué es una Analepsis?",
      intro: ["La analepsis (flashback) interrumpe la narrativa presente para mostrar eventos del pasado. Aporta contexto, profundidad emocional o información esencial que transforma la comprensión del público sobre los eventos actuales."],
      core: ["Salto temporal al pasado", "Revela la historia previa", "Añade peso emocional o temático", "Recontextualiza las acciones presentes"],
      coreNote: "Las analepsis cambian la comprensión, no los hechos.",
      narrativeFunction: ["Revelar la motivación", "Explicar las relaciones", "Profundizar en la psicología del personaje", "Retener y liberar información estratégicamente"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Interrumpir el ritmo narrativo", "Sobreexplicar", "Redundancia con la acción presente"],
      examplesTitle: "Ejemplos de Analepsis",
      examples: ["Lost", "El Padrino II", "Ciudadano Kane", "Arrow", "Eterno resplandor de una mente sin recuerdos"]
    }
  },
  "Flashforward": {
    en: {
      introTitle: "What is a Flashforward?",
      intro: ["A flashforward reveals events that will occur later in the story. It creates anticipation, tension, or dramatic irony by showing consequences before causes."],
      core: ["Temporal jump to the future", "Creates suspense", "Reframes current decisions", "Often partial or ambiguous"],
      narrativeFunction: ["Build anticipation", "Signal inevitability", "Create dramatic irony", "Frame the narrative outcome"],
      risksTitle: "Common risks",
      risks: ["Spoiling tension", "Removing mystery", "Confusing chronology"],
      examplesTitle: "Flashforward Examples",
      examples: ["Breaking Bad (cold opens)", "How to Get Away with Murder", "Arrival", "Six Feet Under", "The Book Thief"]
    },
    es: {
      introTitle: "¿Qué es una Prolepsis?",
      intro: ["La prolepsis (flashforward) revela eventos que ocurrirán más adelante en la historia. Crea anticipación, tensión o ironía dramática al mostrar las consecuencias antes que las causas."],
      core: ["Salto temporal al futuro", "Crea suspense", "Replantea las decisiones actuales", "Con frecuencia parcial o ambiguo"],
      narrativeFunction: ["Generar anticipación", "Señalar la inevitabilidad", "Crear ironía dramática", "Enmarcar el desenlace narrativo"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Desvelar la tensión", "Eliminar el misterio", "Confundir la cronología"],
      examplesTitle: "Ejemplos de Prolepsis",
      examples: ["Breaking Bad (cold opens)", "How to Get Away with Murder", "La llegada", "Six Feet Under", "La ladrona de libros"]
    }
  },
  "Foreshadowing": {
    en: {
      introTitle: "What is Foreshadowing?",
      intro: ["Foreshadowing plants subtle hints about future events. These clues may be symbolic, visual, verbal, or thematic.", "The goal is preparation, not prediction."],
      core: ["Early setup", "Subtlety", "Payoff later in the story", "Often unnoticed on first read"],
      narrativeFunction: ["Create cohesion", "Make twists feel earned", "Build subconscious anticipation", "Reinforce themes"],
      risksTitle: "Common risks",
      risks: ["Being too obvious", "Making outcomes predictable", "Heavy-handed symbolism"],
      examplesTitle: "Foreshadowing Examples",
      examples: ["Romeo and Juliet", "Jaws (early warnings)", "Breaking Bad (visual cues)", "Of Mice and Men", "The Sixth Sense"]
    },
    es: {
      introTitle: "¿Qué es el Presagio?",
      intro: ["El presagio (foreshadowing) siembra pistas sutiles sobre eventos futuros. Estas claves pueden ser simbólicas, visuales, verbales o temáticas.", "El objetivo es la preparación, no la predicción."],
      core: ["Establecimiento temprano", "Sutileza", "Recompensa más adelante en la historia", "A menudo pasa desapercibido en la primera lectura"],
      narrativeFunction: ["Crear cohesión", "Hacer que los giros parezcan merecidos", "Generar anticipación subconsciente", "Reforzar los temas"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Ser demasiado obvio", "Hacer los desenlaces predecibles", "Simbolismo excesivamente obvio"],
      examplesTitle: "Ejemplos de Presagio",
      examples: ["Romeo y Julieta", "Tiburón (advertencias tempranas)", "Breaking Bad (claves visuales)", "De ratones y hombres", "El sexto sentido"]
    }
  },
  "Chekhov's Gun": {
    en: {
      introTitle: "What is Chekhov's Gun?",
      intro: ["Chekhov's Gun states that every significant element introduced in a story should have a purpose. If a detail is highlighted, it must eventually matter."],
      core: ["Meaningful setup", "Inevitable payoff", "Narrative economy", "Focused attention"],
      narrativeFunction: ["Eliminate filler", "Create satisfying resolutions", "Train audience attention", "Strengthen narrative cohesion"],
      risksTitle: "Common risks",
      risks: ["Over-signaling importance", "Forced payoff", "Red herrings mistaken for setup"],
      examplesTitle: "Chekhov's Gun Examples",
      examples: ["The rifle in Chekhov's plays", "The ring in Lord of the Rings", "The knife in Psycho", "The coin in No Country for Old Men"]
    },
    es: {
      introTitle: "¿Qué es la Pistola de Chéjov?",
      intro: ["La Pistola de Chéjov establece que todo elemento significativo introducido en una historia debe tener un propósito. Si un detalle se enfatiza, debe importar en algún momento."],
      core: ["Establecimiento significativo", "Resolución inevitable", "Economía narrativa", "Atención focalizada"],
      narrativeFunction: ["Eliminar el relleno", "Crear resoluciones satisfactorias", "Educar la atención del público", "Reforzar la cohesión narrativa"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Señalar la importancia en exceso", "Resolución forzada", "Pistas falsas confundidas con elementos de setup"],
      examplesTitle: "Ejemplos de la Pistola de Chéjov",
      examples: ["El rifle en las obras de Chéjov", "El anillo en El Señor de los Anillos", "El cuchillo en Psicosis", "La moneda en No Country for Old Men"]
    }
  },
  "Red Herring": {
    en: {
      introTitle: "What is a Red Herring?",
      intro: ["A red herring is a deliberate misdirection that leads the audience to form false assumptions. It distracts from the true narrative outcome."],
      core: ["False emphasis", "Misdirection", "Plausibility", "Temporary relevance"],
      narrativeFunction: ["Create mystery", "Increase suspense", "Hide twists", "Manipulate expectations"],
      risksTitle: "Common risks",
      risks: ["Feeling unfair", "Wasting narrative time", "Breaking trust with the audience"],
      examplesTitle: "Red Herring Examples",
      examples: ["Murder mystery suspects", "Knives Out", "Sherlock Holmes stories", "Gone Girl", "The Girl with the Dragon Tattoo"]
    },
    es: {
      introTitle: "¿Qué es una Pista Falsa?",
      intro: ["Una pista falsa (red herring) es una desorientación deliberada que lleva al público a formarse suposiciones incorrectas. Distrae del verdadero desenlace narrativo."],
      core: ["Énfasis falso", "Desorientación", "Plausibilidad", "Relevancia temporal"],
      narrativeFunction: ["Crear misterio", "Aumentar el suspense", "Ocultar los giros", "Manipular las expectativas"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Parecer injusta", "Desperdiciar tiempo narrativo", "Romper la confianza del público"],
      examplesTitle: "Ejemplos de Pista Falsa",
      examples: ["Sospechosos en los misterios detectivescos", "Entre navajas y secretos", "Las historias de Sherlock Holmes", "Perdida", "La chica del dragón tatuado"]
    }
  },
  "Plot Twist": {
    en: {
      introTitle: "What is a Plot Twist?",
      intro: ["A plot twist is an unexpected development that recontextualizes the story. It surprises the audience while remaining logically consistent."],
      core: ["Surprise", "Retrospective logic", "Setup and payoff", "Shift in perspective"],
      narrativeFunction: ["Reframe the story", "Shock the audience", "Elevate stakes", "Reveal hidden truth"],
      risksTitle: "Common risks",
      risks: ["Twist for shock only", "Lack of setup", "Undermining character logic"],
      examplesTitle: "Plot Twist Examples",
      examples: ["The Sixth Sense", "Fight Club", "The Others", "Oldboy", "Shutter Island"]
    },
    es: {
      introTitle: "¿Qué es un Giro de Trama?",
      intro: ["Un giro de trama es un desarrollo inesperado que recontextualiza la historia. Sorprende al público y al mismo tiempo mantiene la coherencia lógica."],
      core: ["Sorpresa", "Lógica retrospectiva", "Setup y resolución", "Cambio de perspectiva"],
      narrativeFunction: ["Replantear la historia", "Impactar al público", "Elevar las apuestas", "Revelar la verdad oculta"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Giro solo para impactar", "Falta de preparación previa", "Socavar la lógica del personaje"],
      examplesTitle: "Ejemplos de Giro de Trama",
      examples: ["El sexto sentido", "El club de la lucha", "Los otros", "Oldboy", "La isla siniestra"]
    }
  },
  "Deus Ex Machina": {
    en: {
      introTitle: "What is Deus Ex Machina?",
      intro: ["Deus ex Machina resolves conflict through an external, unexpected intervention that is not properly set up within the story."],
      core: ["Sudden resolution", "External force", "Minimal foreshadowing", "Breaks causality"],
      narrativeFunction: ["Resolve unsolvable conflicts", "Deliver moral or divine judgment"],
      narrativeNote: "In modern storytelling, it is often discouraged.",
      risksTitle: "Common risks",
      risks: ["Undermining stakes", "Invalidating character effort", "Breaking narrative credibility"],
      examplesTitle: "Deus Ex Machina Examples",
      examples: ["Ancient Greek theater", "War of the Worlds (original ending)", "Certain superhero rescues", "Mythological interventions"]
    },
    es: {
      introTitle: "¿Qué es el Deus Ex Machina?",
      intro: ["El Deus ex Machina resuelve el conflicto mediante una intervención externa e inesperada que no ha sido debidamente preparada dentro de la historia."],
      core: ["Resolución repentina", "Fuerza externa", "Escaso presagio previo", "Rompe la causalidad"],
      narrativeFunction: ["Resolver conflictos irresolubles", "Emitir un juicio moral o divino"],
      narrativeNote: "En la narrativa moderna, su uso suele desaconsejarse.",
      risksTitle: "Riesgos frecuentes",
      risks: ["Socavar las apuestas", "Invalidar el esfuerzo del personaje", "Romper la credibilidad narrativa"],
      examplesTitle: "Ejemplos de Deus Ex Machina",
      examples: ["Teatro griego antiguo", "La guerra de los mundos (final original)", "Ciertos rescates de superhéroes", "Intervenciones mitológicas"]
    }
  },
  "Eucatastrophe": {
    en: {
      introTitle: "What is Eucatastrophe?",
      intro: ["Eucatastrophe is a sudden positive reversal at the story's darkest moment. Unlike Deus ex Machina, it feels meaningful and earned.", "The term was coined by J.R.R. Tolkien."],
      core: ["Sudden hope", "Emotional release", "Moral or thematic payoff", "Earned resolution"],
      narrativeFunction: ["Affirm hope", "Deliver catharsis", "Reinforce moral order", "Reward endurance"],
      risksTitle: "Common risks",
      risks: ["Confusing it with Deus ex Machina", "Insufficient setup", "Over-sentimentality"],
      examplesTitle: "Eucatastrophe Examples",
      examples: ["The Lord of the Rings", "The Lion, the Witch and the Wardrobe", "It's a Wonderful Life", "Harry Potter finales"]
    },
    es: {
      introTitle: "¿Qué es la Eucatástrofe?",
      intro: ["La eucatástrofe es una inversión positiva repentina en el momento más oscuro de la historia. A diferencia del Deus ex Machina, se siente significativa y merecida.", "El término fue acuñado por J.R.R. Tolkien."],
      core: ["Esperanza repentina", "Liberación emocional", "Resolución moral o temática", "Resolución merecida"],
      narrativeFunction: ["Afirmar la esperanza", "Proporcionar catarsis", "Reforzar el orden moral", "Recompensar la resistencia"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Confundirla con el Deus ex Machina", "Preparación insuficiente", "Exceso de sentimentalismo"],
      examplesTitle: "Ejemplos de Eucatástrofe",
      examples: ["El Señor de los Anillos", "El león, la bruja y el armario", "Qué bello es vivir", "Los finales de Harry Potter"]
    }
  },
  "Poetic Justice": {
    en: {
      introTitle: "What is Poetic Justice?",
      intro: ["Poetic Justice ensures that characters receive outcomes that fittingly reflect their actions, values, or flaws."],
      core: ["Moral symmetry", "Cause-and-effect resolution", "Thematic reinforcement", "Emotional satisfaction"],
      narrativeFunction: ["Reinforce theme", "Deliver moral closure", "Satisfy audience expectations", "Balance narrative consequences"],
      risksTitle: "Common risks",
      risks: ["Predictability", "Moral simplification", "Heavy-handed messaging"],
      examplesTitle: "Poetic Justice Examples",
      examples: ["Villains undone by their own schemes", "Fables and fairy tales", "Crime fiction endings", "Shakespearean punishment arcs"]
    },
    es: {
      introTitle: "¿Qué es la Justicia Poética?",
      intro: ["La justicia poética garantiza que los personajes reciban los desenlaces que reflejan de manera apropiada sus acciones, valores o defectos."],
      core: ["Simetría moral", "Resolución de causa y efecto", "Refuerzo temático", "Satisfacción emocional"],
      narrativeFunction: ["Reforzar el tema", "Proporcionar cierre moral", "Satisfacer las expectativas del público", "Equilibrar las consecuencias narrativas"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Predictabilidad", "Simplificación moral", "Mensaje excesivamente explícito"],
      examplesTitle: "Ejemplos de Justicia Poética",
      examples: ["Villanos destruidos por sus propias tramas", "Fábulas y cuentos de hadas", "Finales de novela negra", "Arcos de castigo shakespearianos"]
    }
  },
  "\u201cShow, Don\u2019t Tell\u201d": {
    en: {
      introTitle: "What does \u201cShow, Don\u2019t Tell\u201d mean?",
      intro: ["This principle encourages conveying information through action, dialogue, and sensory detail rather than direct explanation."],
      core: ["Implicit storytelling", "Sensory detail", "Active scenes", "Reader inference"],
      narrativeFunction: ["Increase immersion", "Engage the reader", "Strengthen emotional impact", "Avoid exposition overload"],
      risksTitle: "Common risks",
      risks: ["Obscuring clarity", "Over-description", "Avoiding necessary exposition"],
      examplesTitle: "Show, Don't Tell Examples",
      examples: ["Character emotion shown through action", "Visual storytelling in film", "Minimalist prose styles", "Hemingway's writing"]
    },
    es: {
      introTitle: "¿Qué significa \u201cMostrar, No Contar\u201d?",
      intro: ["Este principio anima a transmitir la información a través de la acción, el diálogo y el detalle sensorial, en lugar de la explicación directa."],
      core: ["Narración implícita", "Detalle sensorial", "Escenas activas", "Inferencia del lector"],
      narrativeFunction: ["Aumentar la inmersión", "Implicar al lector", "Reforzar el impacto emocional", "Evitar la sobrecarga de exposición"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Oscurecer la claridad", "Descripción excesiva", "Evitar la exposición necesaria"],
      examplesTitle: "Ejemplos de Mostrar, No Contar",
      examples: ["Emoción del personaje mostrada mediante la acción", "Narración visual en el cine", "Estilos de prosa minimalistas", "La escritura de Hemingway"]
    }
  },
  "Quibble (Wordplay)": {
    en: {
      introTitle: "What is a Quibble?",
      intro: ["A quibble is playful or clever use of language, often relying on ambiguity, double meanings, or rhetorical tricks."],
      core: ["Linguistic play", "Humor or irony", "Verbal agility", "Ambiguity"],
      narrativeFunction: ["Add wit", "Reveal character intelligence", "Create tonal contrast", "Engage the audience linguistically"],
      risksTitle: "Common risks",
      risks: ["Overuse", "Breaking tone", "Confusing meaning"],
      examplesTitle: "Quibble Examples",
      examples: ["Shakespearean wordplay", "Oscar Wilde", "Legal or political dialogue", "Screwball comedies"]
    },
    es: {
      introTitle: "¿Qué es el Quibble?",
      intro: ["Un quibble es el uso juguetón o ingenioso del lenguaje, a menudo basado en la ambigüedad, los dobles sentidos o los recursos retóricos."],
      core: ["Juego lingüístico", "Humor o ironía", "Agilidad verbal", "Ambigüedad"],
      narrativeFunction: ["Añadir ingenio", "Revelar la inteligencia del personaje", "Crear contraste tonal", "Implicar al público lingüísticamente"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Uso excesivo", "Ruptura del tono", "Ambigüedad confusa"],
      examplesTitle: "Ejemplos de Quibble",
      examples: ["El juego de palabras shakespeariano", "Oscar Wilde", "El diálogo legal o político", "Las comedias de enredo"]
    }
  }
};

// ─── Tips content (bilingual) ────────────────────────────────────────────────

export const TIPS_DATA = {
  "Argumentation (tips)": {
    en: {
      introTitle: "What is argumentative writing?",
      intro: ["Argumentative writing focuses on presenting, supporting, and defending a position with the goal of persuading the reader through reasoned discourse.", "It is essential for essays, opinion pieces, critical analysis, and persuasive nonfiction."],
      techniques: ["Logical reasoning — Use deductive, inductive, or analogical reasoning to support claims and conclusions.", "Evidence and examples — Support arguments with facts, data, statistics, real-world examples, or credible sources.", "Counterarguments and refutation — Anticipate opposing views and address them directly to strengthen overall credibility.", "Emotional appeal — Engage the reader's emotions, values, or beliefs to reinforce logical points.", "Rhetorical strategies — Apply ethos (credibility), pathos (emotion), and logos (logic) strategically.", "Clear structure and organization — Present arguments in a coherent order with clear topic sentences and conclusions.", "Clarity and concision — Avoid unnecessary complexity; express ideas precisely and directly.", "Ethical responsibility — Ground arguments in honesty and respect for the audience's values and intelligence."]
    },
    es: {
      introTitle: "¿Qué es la escritura argumentativa?",
      intro: ["La escritura argumentativa se centra en presentar, fundamentar y defender una posición con el objetivo de persuadir al lector mediante el discurso razonado.", "Es esencial para los ensayos, los artículos de opinión, el análisis crítico y la no ficción persuasiva."],
      techniques: ["Razonamiento lógico — Utiliza el razonamiento deductivo, inductivo o analógico para sustentar afirmaciones y conclusiones.", "Evidencia y ejemplos — Apoya los argumentos con hechos, datos, estadísticas, ejemplos reales o fuentes fiables.", "Contraargumentos y refutación — Anticipa las opiniones contrarias y abórdalas directamente para reforzar la credibilidad global.", "Apelación emocional — Involucra las emociones, los valores o las creencias del lector para reforzar los puntos lógicos.", "Estrategias retóricas — Aplica estratégicamente el ethos (credibilidad), el pathos (emoción) y el logos (lógica).", "Estructura y organización claras — Presenta los argumentos en un orden coherente con frases temáticas y conclusiones bien definidas.", "Claridad y concisión — Evita la complejidad innecesaria; expresa las ideas con precisión y de forma directa.", "Responsabilidad ética — Fundamenta los argumentos en la honestidad y el respeto por los valores e inteligencia del público."]
    }
  },
  "Description (tips)": {
    en: {
      introTitle: "What is descriptive writing?",
      intro: ["Descriptive writing creates vivid mental images by engaging the reader's senses, emotions, and imagination. Its purpose is immersion rather than explanation."],
      techniques: ["Sensory imagery — Appeal to sight, sound, touch, taste, and smell to create a multidimensional experience.", "Figurative language — Use metaphor, simile, personification, and imagery to enrich atmosphere and tone.", "Specificity and detail — Favor precise, concrete details over generic or abstract descriptions.", "Show, don't tell — Convey meaning through action, sensory detail, and implication rather than direct explanation.", "Point of view awareness — Filter description through the narrator's perspective, biases, and limitations.", "Emotional resonance — Connect description to characters' internal reactions and emotional states.", "Narrative pacing — Balance descriptive passages with action and dialogue to maintain momentum.", "Symbolism and motifs — Use recurring imagery to reinforce theme and meaning."]
    },
    es: {
      introTitle: "¿Qué es la escritura descriptiva?",
      intro: ["La escritura descriptiva crea imágenes mentales vívidas al involucrar los sentidos, las emociones y la imaginación del lector. Su propósito es la inmersión, no la explicación."],
      techniques: ["Imágenes sensoriales — Apela a la vista, el sonido, el tacto, el gusto y el olfato para crear una experiencia multidimensional.", "Lenguaje figurado — Utiliza la metáfora, el símil, la personificación y las imágenes para enriquecer la atmósfera y el tono.", "Especificidad y detalle — Favorece los detalles precisos y concretos frente a las descripciones genéricas o abstractas.", "Mostrar, no contar — Transmite el significado a través de la acción, el detalle sensorial y la implicación, en lugar de la explicación directa.", "Conciencia del punto de vista — Filtra la descripción a través de la perspectiva, los sesgos y las limitaciones del narrador.", "Resonancia emocional — Conecta la descripción con las reacciones internas y los estados emocionales de los personajes.", "Ritmo narrativo — Equilibra los pasajes descriptivos con la acción y el diálogo para mantener el impulso.", "Simbolismo y motivos — Utiliza imágenes recurrentes para reforzar el tema y el significado."]
    }
  },
  "Dialogue (tips)": {
    en: {
      introTitle: "What is effective dialogue?",
      intro: ["Effective dialogue creates believable conversations that reveal character, advance plot, and convey subtext without sounding artificial or expository."],
      techniques: ["Distinct character voice — Give each character unique speech patterns, vocabulary, and tone.", "Subtext — Allow meaning to exist beneath the spoken words through implication and tension.", "Natural flow — Imitate real conversational rhythm without reproducing real speech verbatim.", "Rhythm and cadence — Vary sentence length and pacing to reflect emotional intensity.", "Conflict and tension — Use disagreement, power imbalance, or competing goals to energize exchanges.", "Show, don't tell — Reveal emotion and motivation through what is said — and what is avoided.", "Subtle exposition — Embed necessary information naturally within conversation.", "Authenticity and realism — Reflect cultural, social, and contextual speech patterns appropriately."]
    },
    es: {
      introTitle: "¿Qué es el diálogo efectivo?",
      intro: ["El diálogo efectivo crea conversaciones creíbles que revelan el carácter, hacen avanzar la trama y transmiten el subtexto sin sonar artificiales o expositivos."],
      techniques: ["Voz propia de cada personaje — Dota a cada personaje de patrones de habla, vocabulario y tono únicos.", "Subtexto — Permite que el significado exista bajo las palabras pronunciadas, a través de la implicación y la tensión.", "Fluidez natural — Imita el ritmo conversacional real sin reproducir el habla real de forma literal.", "Ritmo y cadencia — Varía la longitud de las frases y el ritmo para reflejar la intensidad emocional.", "Conflicto y tensión — Usa el desacuerdo, el desequilibrio de poder o los objetivos en competencia para dinamizar los intercambios.", "Mostrar, no contar — Revela la emoción y la motivación a través de lo que se dice, y de lo que se evita.", "Exposición sutil — Integra la información necesaria de forma natural dentro de la conversación.", "Autenticidad y realismo — Refleja adecuadamente los patrones de habla culturales, sociales y contextuales."]
    }
  },
  "Exposition (tips)": {
    en: {
      introTitle: "What is exposition?",
      intro: ["Exposition provides essential background information, context, or history needed for the audience to understand the story world without disrupting narrative flow."],
      techniques: ["Narrative summary — Compress complex information into concise overviews.", "Flashbacks — Reveal past events that directly inform present actions or motivations.", "Dialogue-based exposition — Deliver information through natural conversation rather than narration.", "Descriptive context — Use sensory detail to establish setting, culture, or historical background.", "Prologues or introductory sections — Present foundational information before the main narrative begins.", "Gradual information release — Distribute exposition strategically to avoid overload.", "Integrated backstory — Weave background details into character thoughts or actions.", "Worldbuilding — Establish social, political, cultural, or historical frameworks that support the story."]
    },
    es: {
      introTitle: "¿Qué es la exposición?",
      intro: ["La exposición proporciona la información de fondo, el contexto o la historia esenciales para que el público comprenda el mundo de la historia sin interrumpir el flujo narrativo."],
      techniques: ["Resumen narrativo — Condensa la información compleja en panorámicas concisas.", "Analepsis — Revela eventos pasados que informan directamente las acciones o motivaciones presentes.", "Exposición dialogada — Transmite la información a través de una conversación natural, no de la narración.", "Contexto descriptivo — Usa el detalle sensorial para establecer el escenario, la cultura o el trasfondo histórico.", "Prólogos o secciones introductorias — Presenta la información fundacional antes de que comience la narrativa principal.", "Liberación gradual de información — Distribuye la exposición estratégicamente para evitar la sobrecarga.", "Historia de fondo integrada — Entreteje los detalles del trasfondo en los pensamientos o acciones de los personajes.", "Worldbuilding — Establece los marcos sociales, políticos, culturales o históricos que sustentan la historia."]
    }
  },
  "Narration (tips)": {
    en: {
      introTitle: "What is narration?",
      intro: ["Narration refers to how a story is told: the voice, perspective, structure, and style that shape how the reader experiences events."],
      techniques: ["Point of view — Choose first person, second person, or third person (limited or omniscient) deliberately.", "Narrative structure — Organize events using linear, nonlinear, framed, or experimental sequencing.", "Tone and atmosphere — Establish emotional mood through diction, imagery, and rhythm.", "Characterization — Reveal character through actions, internal thought, and reaction.", "Foreshadowing and suspense — Plant hints and manage anticipation to sustain engagement.", "Symbolism and imagery — Use recurring symbols to convey deeper meaning.", "Voice and style — Develop a distinctive narrative presence consistent with theme and perspective.", "Narrative pacing — Control speed and tension through sentence structure, scene length, and transitions."]
    },
    es: {
      introTitle: "¿Qué es la narración?",
      intro: ["La narración se refiere a cómo se cuenta una historia: la voz, la perspectiva, la estructura y el estilo que moldean la experiencia del lector con los eventos."],
      techniques: ["Punto de vista — Elige deliberadamente la primera, segunda o tercera persona (limitada u omnisciente).", "Estructura narrativa — Organiza los eventos con una secuencia lineal, no lineal, enmarcada o experimental.", "Tono y atmósfera — Establece el estado de ánimo emocional a través de la dicción, las imágenes y el ritmo.", "Caracterización — Revela el carácter a través de las acciones, el pensamiento interno y la reacción.", "Presagio y suspense — Siembra pistas y gestiona la anticipación para mantener el interés.", "Simbolismo e imágenes — Utiliza símbolos recurrentes para transmitir un significado más profundo.", "Voz y estilo — Desarrolla una presencia narrativa distintiva coherente con el tema y la perspectiva.", "Ritmo narrativo — Controla la velocidad y la tensión mediante la estructura de las frases, la duración de las escenas y las transiciones."]
    }
  },
  "Persuasion (tips)": {
    en: {
      introTitle: "What is persuasive writing?",
      intro: ["Persuasive writing aims to influence beliefs, attitudes, or actions by combining logic, emotion, credibility, and narrative clarity."],
      techniques: ["Emotional appeal — Engage feelings such as empathy, fear, hope, or desire.", "Storytelling — Use anecdotes or narratives to humanize abstract ideas.", "Social proof — Reference collective agreement, trends, or testimonials.", "Authority — Establish credibility through expertise or reputable sources.", "Repetition — Reinforce key ideas to increase memorability.", "Persuasive language — Choose words that convey urgency, clarity, and emotional weight.", "Call to action — Direct the reader toward a specific response or behavior.", "Addressing counterarguments — Acknowledge and refute opposing views to strengthen trust."]
    },
    es: {
      introTitle: "¿Qué es la escritura persuasiva?",
      intro: ["La escritura persuasiva busca influir en las creencias, actitudes o acciones combinando lógica, emoción, credibilidad y claridad narrativa."],
      techniques: ["Apelación emocional — Involucra sentimientos como la empatía, el miedo, la esperanza o el deseo.", "Narración — Usa anécdotas o relatos para humanizar ideas abstractas.", "Prueba social — Referencia el consenso colectivo, las tendencias o los testimonios.", "Autoridad — Establece la credibilidad a través de la experiencia o fuentes reputadas.", "Repetición — Refuerza las ideas clave para aumentar la memorabilidad.", "Lenguaje persuasivo — Elige palabras que transmitan urgencia, claridad y peso emocional.", "Llamada a la acción — Dirige al lector hacia una respuesta o comportamiento específico.", "Abordar los contraargumentos — Reconoce y refuta los puntos de vista opuestos para reforzar la confianza."]
    }
  }
};

// ─── Pitfalls content (bilingual) ────────────────────────────────────────────

export const PITFALLS_DATA = {
  "Character Pitfalls": {
    en: { title: "Character Pitfalls", items: ["Flat characters", "Inconsistent motivation", "Unearned redemption", "Passive protagonists", "Villain without agency", "Archetype clichés"] },
    es: { title: "Errores de Personaje", items: ["Personajes planos", "Motivación incoherente", "Redención no merecida", "Protagonistas pasivos", "Villano sin agencia", "Clichés de arquetipo"] }
  },
  "Character Arc Pitfalls": {
    en: { title: "Character Arc Pitfalls", items: ["No real change", "Change without cause", "Moral whiplash", "Transformation too late", "Arc contradicts theme"] },
    es: { title: "Errores de Arco de Personaje", items: ["Sin cambio real", "Cambio sin causa", "Latigazo moral", "Transformación demasiado tardía", "El arco contradice el tema"] }
  },
  "Narrative Technique Pitfalls": {
    en: { title: "Narrative Technique Pitfalls", items: ["Foreshadowing too obvious", "Plot twists without setup", "Red herrings that waste time", "Deus ex machina abuse", "Flashbacks killing momentum"] },
    es: { title: "Errores de Técnica Narrativa", items: ["Presagio demasiado obvio", "Giros sin preparación previa", "Pistas falsas que no aportan nada", "Abuso del Deus ex Machina", "Flashbacks que matan el ritmo"] }
  },
  "Structure Pitfalls": {
    en: { title: "Structure Pitfalls", items: ["Act breaks without tension", "Sagging middle", "Climax too early / too late", "Resolution without consequence", "Structure fighting the story"] },
    es: { title: "Errores de Estructura", items: ["Quiebres de acto sin tensión", "Segundo acto flácido", "Clímax demasiado temprano / tardío", "Resolución sin consecuencias", "La estructura lucha contra la historia"] }
  },
  "Writing-Level Pitfalls": {
    en: { title: "Writing-Level Pitfalls", items: ["Over-exposition", "On-the-nose dialogue", "Telling instead of showing", "Purple prose", "Inconsistent tone"] },
    es: { title: "Errores de Escritura", items: ["Sobreexposición", "Diálogo demasiado explícito", "Contar en lugar de mostrar", "Prosa recargada", "Tono inconsistente"] }
  }
};
