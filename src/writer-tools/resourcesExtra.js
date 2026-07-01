/**
 * Extended Writer Tools reference content (bilingual).
 *
 * Kept separate from resourcesI18n.js so the core library stays readable.
 * These maps are merged into the exported TECHNIQUE_DATA / TIPS_DATA /
 * PITFALLS_DATA / LABEL_I18N / UI_I18N objects via Object.assign at the bottom
 * of resourcesI18n.js. (Story-structure cards live in resourcesStructures.js.)
 */

// ─── Technique-shaped content (Theme, Character engines, Dialogue, Genre) ─────

export const EXTRA_TECHNIQUE_DATA = {
  // ── Theme & premise ────────────────────────────────────────────────────────
  "Theme vs Premise": {
    en: {
      introTitle: "Theme vs Premise?",
      intro: ["Theme is the abstract topic a story explores, such as justice or love. Premise is the specific argument the story makes about that topic, stated as a complete declarative claim the narrative sets out to prove."],
      core: ["Theme is a subject; premise is an assertion", "Premise can be phrased as one sentence", "Premise predicts the ending", "Theme invites questions, premise answers them"],
      coreNote: "A theme is a word; a premise is a sentence.",
      narrativeFunction: ["Focus the story on a single argument", "Guide which scenes belong", "Unify character and plot", "Clarify the intended meaning"],
      risksTitle: "Common risks",
      risks: ["Confusing a topic for an argument", "Stating the premise too literally on the page", "Pursuing a premise the plot never proves"],
      examplesTitle: "Theme vs Premise Examples",
      examples: ["Romeo and Juliet (love vs. \"great love defies even death\")", "The Godfather (family vs. \"loyalty to family destroys the self\")", "Macbeth (ambition vs. \"ruthless ambition leads to ruin\")", "Breaking Bad (pride vs. \"pride corrupts a good man\")", "A Christmas Carol (greed vs. \"compassion redeems a miserly soul\")"]
    },
    es: {
      introTitle: "¿Tema vs Premisa?",
      intro: ["El tema es el asunto abstracto que explora una historia, como la justicia o el amor. La premisa es el argumento concreto que la historia plantea sobre ese asunto, formulado como una afirmación completa que la narrativa se propone demostrar."],
      core: ["El tema es un asunto; la premisa es una afirmación", "La premisa cabe en una sola frase", "La premisa anticipa el desenlace", "El tema plantea preguntas; la premisa las responde"],
      coreNote: "El tema es una palabra; la premisa es una frase.",
      narrativeFunction: ["Centrar la historia en un único argumento", "Decidir qué escenas pertenecen a la obra", "Unificar personaje y trama", "Clarificar el significado pretendido"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Confundir un asunto con un argumento", "Enunciar la premisa de forma demasiado literal", "Perseguir una premisa que la trama nunca demuestra"],
      examplesTitle: "Ejemplos de Tema vs Premisa",
      examples: ["Romeo y Julieta (amor vs. «el gran amor desafía incluso a la muerte»)", "El Padrino (familia vs. «la lealtad a la familia destruye al individuo»)", "Macbeth (ambición vs. «la ambición despiadada conduce a la ruina»)", "Breaking Bad (orgullo vs. «el orgullo corrompe a un buen hombre»)", "Cuento de Navidad (avaricia vs. «la compasión redime al avaro»)"]
    }
  },
  "Controlling Idea": {
    en: {
      introTitle: "What is a Controlling Idea?",
      intro: ["Robert McKee's controlling idea expresses a story's ultimate meaning in a single sentence that names a value and the cause that brings it about. It states how and why life changes from one condition to another by the story's end."],
      core: ["One sentence: value plus cause", "Identifies the final emotional charge", "Predicted by the climax, not the opening", "Either ironic, idealistic, or pessimistic"],
      coreNote: "Form: \"Value prevails when cause.\"",
      narrativeFunction: ["Anchor every scene to a single meaning", "Test whether the climax earns its message", "Resolve conflicting impulses in the draft", "Distinguish honest theme from sentiment"],
      risksTitle: "Common risks",
      risks: ["Naming the value but not the cause", "A climax that contradicts the stated idea", "Forcing a moral the story has not dramatized"],
      examplesTitle: "Controlling Idea Examples",
      examples: ["Chinatown (\"Evil triumphs when good people are powerless\")", "Casablanca (\"Love is fulfilled when we sacrifice our own desire\")", "The Verdict (\"Justice prevails when one man refuses to compromise\")", "Thelma & Louise (\"Freedom is won when we defy a world that cages us\")", "No Country for Old Men (\"Evil prevails when the world outpaces those who fight it\")"]
    },
    es: {
      introTitle: "¿Qué es una Idea de Control?",
      intro: ["La idea de control de Robert McKee expresa el significado último de una historia en una sola frase que nombra un valor y la causa que lo produce. Enuncia cómo y por qué la vida cambia de una condición a otra al final del relato."],
      core: ["Una frase: valor más causa", "Identifica la carga emocional final", "La predice el clímax, no el inicio", "Irónica, idealista o pesimista"],
      coreNote: "Forma: «El valor prevalece cuando causa».",
      narrativeFunction: ["Anclar cada escena a un único significado", "Comprobar si el clímax justifica su mensaje", "Resolver impulsos contradictorios del borrador", "Distinguir el tema honesto del sentimentalismo"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Nombrar el valor pero no la causa", "Un clímax que contradice la idea enunciada", "Imponer una moraleja que la historia no ha dramatizado"],
      examplesTitle: "Ejemplos de Idea de Control",
      examples: ["Chinatown («El mal triunfa cuando los buenos son impotentes»)", "Casablanca («El amor se cumple cuando sacrificamos nuestro propio deseo»)", "Veredicto final («La justicia prevalece cuando un hombre se niega a transigir»)", "Thelma y Louise («La libertad se gana cuando desafiamos a un mundo que nos enjaula»)", "No es país para viejos («El mal prevalece cuando el mundo supera a quienes lo combaten»)"]
    }
  },
  "Thematic Argument": {
    en: {
      introTitle: "What is a Thematic Argument?",
      intro: ["A thematic argument treats the whole story as a case being argued, with the protagonist proving or disproving a moral proposition through the choices they make under pressure. John Truby calls this the story's moral argument, advanced not by speeches but by consequences."],
      core: ["Dramatizes a debate, not a statement", "Advanced through choices and consequences", "Protagonist embodies one side", "Resolved by the climactic decision"],
      coreNote: "The protagonist's final choice is the verdict.",
      narrativeFunction: ["Convert abstract theme into action", "Give choices moral weight", "Make the ending feel earned", "Reveal character through values under test"],
      risksTitle: "Common risks",
      risks: ["Preaching the argument in dialogue", "A conclusion the choices do not support", "Reducing characters to mouthpieces"],
      examplesTitle: "Thematic Argument Examples",
      examples: ["A Christmas Carol", "Schindler's List", "Groundhog Day", "Crime and Punishment", "It's a Wonderful Life", "12 Angry Men"]
    },
    es: {
      introTitle: "¿Qué es un Argumento Temático?",
      intro: ["El argumento temático trata la historia entera como un caso que se debate, donde el protagonista demuestra o refuta una proposición moral mediante las decisiones que toma bajo presión. John Truby lo llama el argumento moral de la historia, sostenido no con discursos sino con consecuencias."],
      core: ["Dramatiza un debate, no una afirmación", "Se sostiene con decisiones y consecuencias", "El protagonista encarna una postura", "Se resuelve con la decisión del clímax"],
      coreNote: "La decisión final del protagonista es el veredicto.",
      narrativeFunction: ["Convertir el tema abstracto en acción", "Dar peso moral a las decisiones", "Hacer que el desenlace parezca merecido", "Revelar al personaje al poner a prueba sus valores"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Predicar el argumento en los diálogos", "Una conclusión que las decisiones no respaldan", "Reducir a los personajes a portavoces"],
      examplesTitle: "Ejemplos de Argumento Temático",
      examples: ["Cuento de Navidad", "La lista de Schindler", "Atrapado en el tiempo", "Crimen y castigo", "¡Qué bello es vivir!", "Doce hombres sin piedad"]
    }
  },
  "Motif & Symbol": {
    en: {
      introTitle: "What is a Motif & Symbol?",
      intro: ["A motif is a concrete image, object, or action that recurs throughout a story and accumulates meaning with each appearance. A symbol is such an image standing for an abstract idea, letting theme register through the senses rather than through statement."],
      core: ["Concrete and repeatable", "Gains meaning through recurrence", "Carries thematic weight indirectly", "Works on the audience subconsciously"],
      coreNote: "A motif repeats; a symbol stands for something.",
      narrativeFunction: ["Express theme without exposition", "Create cohesion across scenes", "Track a character's inner change", "Reward attentive audiences"],
      risksTitle: "Common risks",
      risks: ["Heavy-handed or obvious symbolism", "Repetition without development", "Meaning the story never supports"],
      examplesTitle: "Motif & Symbol Examples",
      examples: ["The green light in The Great Gatsby", "The conch in Lord of the Flies", "Water in Moonlight", "The scarlet letter in The Scarlet Letter", "Rosebud in Citizen Kane", "The mockingbird in To Kill a Mockingbird"]
    },
    es: {
      introTitle: "¿Qué es un Motivo y Símbolo?",
      intro: ["Un motivo es una imagen, objeto o acción concreta que se repite a lo largo de una historia y acumula significado en cada aparición. Un símbolo es esa imagen que representa una idea abstracta, permitiendo que el tema se perciba por los sentidos en lugar de enunciarse."],
      core: ["Concreto y repetible", "Gana significado al repetirse", "Porta peso temático de forma indirecta", "Actúa sobre el público de modo subconsciente"],
      coreNote: "El motivo se repite; el símbolo representa algo.",
      narrativeFunction: ["Expresar el tema sin exposición", "Crear cohesión entre escenas", "Seguir el cambio interior de un personaje", "Recompensar al público atento"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Simbolismo obvio o recargado", "Repetición sin desarrollo", "Un significado que la historia nunca respalda"],
      examplesTitle: "Ejemplos de Motivo y Símbolo",
      examples: ["La luz verde en El gran Gatsby", "La caracola en El señor de las moscas", "El agua en Moonlight", "La letra escarlata en La letra escarlata", "Rosebud en Ciudadano Kane", "El ruiseñor en Matar a un ruiseñor"]
    }
  },
  "Theme Through Character": {
    en: {
      introTitle: "What is Theme Through Character?",
      intro: ["Theme through character dramatizes an argument by having the protagonist and antagonist embody opposing values, so the conflict between them becomes a living debate over the premise. Lajos Egri taught that the antagonist must be the protagonist's equal so the premise is truly tested, not merely asserted."],
      core: ["Protagonist and antagonist hold opposing values", "Conflict stages the premise line", "Each side argues through action", "Outcome declares which value wins"],
      coreNote: "The antagonist is the premise's strongest objection.",
      narrativeFunction: ["Turn theme into character conflict", "Give the antagonist genuine validity", "Test the premise instead of stating it", "Let the climax settle the debate"],
      risksTitle: "Common risks",
      risks: ["A straw-man antagonist who cannot win", "Values too similar to generate debate", "Resolving the argument by force, not choice"],
      examplesTitle: "Theme Through Character Examples",
      examples: ["The Dark Knight (order vs. chaos)", "Les Misérables (mercy vs. law)", "Amadeus (genius vs. mediocrity)", "There Will Be Blood (greed vs. faith)", "Whiplash (greatness vs. cost)", "Captain America: Civil War (liberty vs. security)"]
    },
    es: {
      introTitle: "¿Qué es el Tema a Través del Personaje?",
      intro: ["El tema a través del personaje dramatiza un argumento haciendo que protagonista y antagonista encarnen valores opuestos, de modo que el conflicto entre ambos se convierte en un debate vivo sobre la premisa. Lajos Egri enseñaba que el antagonista debe estar a la altura del protagonista para que la premisa se ponga a prueba de verdad, no solo se afirme."],
      core: ["Protagonista y antagonista sostienen valores opuestos", "El conflicto escenifica la premisa", "Cada bando argumenta mediante la acción", "El desenlace declara qué valor vence"],
      coreNote: "El antagonista es la mayor objeción a la premisa.",
      narrativeFunction: ["Convertir el tema en conflicto de personajes", "Dar validez genuina al antagonista", "Poner a prueba la premisa en vez de enunciarla", "Dejar que el clímax zanje el debate"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un antagonista de paja incapaz de vencer", "Valores demasiado similares para generar debate", "Resolver el argumento por la fuerza y no por elección"],
      examplesTitle: "Ejemplos de Tema a Través del Personaje",
      examples: ["El caballero oscuro (orden vs. caos)", "Los miserables (misericordia vs. ley)", "Amadeus (genio vs. mediocridad)", "Pozos de ambición (codicia vs. fe)", "Whiplash (grandeza vs. coste)", "Capitán América: Civil War (libertad vs. seguridad)"]
    }
  },

  // ── Character engines ───────────────────────────────────────────────────────
  "Want vs Need": {
    en: {
      introTitle: "What is Want vs Need?",
      intro: ["A character's want is the external, conscious goal they actively pursue; the need is the internal truth or change required to become whole. The gap between them is the spine of a character arc."],
      core: ["Want is external and conscious", "Need is internal and often unknown", "Pursuit of the want exposes the need", "The two frequently conflict", "Resolution defines the arc's outcome"],
      coreNote: "Characters chase the want but the story is about the need.",
      narrativeFunction: ["Generate the arc's central tension", "Drive plot through active pursuit", "Reveal theme through internal change", "Force a climactic choice between want and need"],
      risksTitle: "Common risks",
      risks: ["A want with no underlying need feels hollow", "A need too obvious to the character kills the arc", "Confusing plot goal with emotional growth", "Resolving both too neatly"],
      examplesTitle: "Want vs Need Examples",
      examples: ["Michael Corleone (The Godfather)", "Woody (Toy Story)", "Scrooge (A Christmas Carol)", "Walter White (Breaking Bad)", "Elsa (Frozen)", "Andrew Neiman (Whiplash)"]
    },
    es: {
      introTitle: "¿Qué es Deseo vs Necesidad?",
      intro: ["El deseo de un personaje es la meta externa y consciente que persigue activamente; la necesidad es la verdad interna o el cambio que requiere para estar completo. La distancia entre ambos es la columna vertebral del arco de personaje."],
      core: ["El deseo es externo y consciente", "La necesidad es interna y a menudo desconocida", "La búsqueda del deseo expone la necesidad", "Ambos suelen entrar en conflicto", "Su resolución define el desenlace del arco"],
      coreNote: "El personaje persigue el deseo, pero la historia trata sobre la necesidad.",
      narrativeFunction: ["Generar la tensión central del arco", "Impulsar la trama mediante la búsqueda activa", "Revelar el tema a través del cambio interno", "Forzar una elección climática entre deseo y necesidad"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un deseo sin necesidad de fondo resulta hueco", "Una necesidad demasiado evidente para el personaje anula el arco", "Confundir la meta de la trama con el crecimiento emocional", "Resolver ambos de forma demasiado limpia"],
      examplesTitle: "Ejemplos de Deseo vs Necesidad",
      examples: ["Michael Corleone (El Padrino)", "Woody (Toy Story)", "Scrooge (Cuento de Navidad)", "Walter White (Breaking Bad)", "Elsa (Frozen)", "Andrew Neiman (Whiplash)"]
    }
  },
  "Wound & Ghost": {
    en: {
      introTitle: "What is the Wound & Ghost?",
      intro: ["The wound is a painful past event that scarred the character; the ghost is the lingering psychological residue that haunts and shapes present behavior. It is the source of the character's defensive coping and false beliefs."],
      core: ["A specific past trauma or loss", "An ongoing psychological haunting", "Drives avoidance and defense mechanisms", "Roots the character's lie", "Often unresolved at the story's start"],
      coreNote: "Truby's 'ghost' is the wound that still controls the hero from the past.",
      narrativeFunction: ["Explain why the character resists change", "Ground the lie and the need in backstory", "Create empathy through hidden pain", "Provide the obstacle the arc must overcome"],
      risksTitle: "Common risks",
      risks: ["Over-explaining the wound in exposition", "A trauma disproportionate to the behavior", "Healing the ghost too easily", "Using it as an excuse rather than a force"],
      examplesTitle: "Wound & Ghost Examples",
      examples: ["Rick Blaine (Casablanca)", "Bruce Wayne (Batman)", "Will Hunting (Good Will Hunting)", "Theodore (Her)", "Jake LaMotta (Raging Bull)", "Carl Fredricksen (Up)"]
    },
    es: {
      introTitle: "¿Qué es la Herida y el Fantasma?",
      intro: ["La herida es un suceso doloroso del pasado que marcó al personaje; el fantasma es el residuo psicológico persistente que lo acecha y moldea su conducta presente. Es el origen de sus mecanismos de defensa y de sus creencias falsas."],
      core: ["Un trauma o pérdida concretos del pasado", "Un acecho psicológico continuo", "Impulsa la evitación y las defensas", "Enraíza la mentira del personaje", "Suele estar sin resolver al inicio de la historia"],
      coreNote: "El 'fantasma' de Truby es la herida que aún controla al héroe desde el pasado.",
      narrativeFunction: ["Explicar por qué el personaje se resiste al cambio", "Anclar la mentira y la necesidad en la historia previa", "Crear empatía mediante el dolor oculto", "Aportar el obstáculo que el arco debe superar"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Sobreexplicar la herida con exposición", "Un trauma desproporcionado respecto a la conducta", "Sanar el fantasma con demasiada facilidad", "Usarlo como excusa en lugar de como fuerza"],
      examplesTitle: "Ejemplos de Herida y Fantasma",
      examples: ["Rick Blaine (Casablanca)", "Bruce Wayne (Batman)", "Will Hunting (El indomable Will Hunting)", "Theodore (Her)", "Jake LaMotta (Toro salvaje)", "Carl Fredricksen (Up)"]
    }
  },
  "The Lie & The Truth": {
    en: {
      introTitle: "What is The Lie & The Truth?",
      intro: ["The lie is the false belief the character holds about themselves or the world, born from their wound; the truth is the thematic insight they must accept to grow. The arc traces the journey from lie to truth."],
      core: ["A flawed belief governs the character", "The lie shields them from past pain", "The truth is the story's thematic premise", "Confronting the lie drives the arc", "Embracing the truth enables change"],
      coreNote: "Weiland frames the arc as the character abandoning the Lie for the Truth.",
      narrativeFunction: ["Define the character's starting worldview", "Anchor the story's theme as a counter-argument", "Create internal conflict at each turning point", "Measure growth by movement toward the truth"],
      risksTitle: "Common risks",
      risks: ["A lie too vague to dramatize", "Stating the truth instead of revealing it", "Theme that preaches rather than tests", "A conversion that feels unearned"],
      examplesTitle: "The Lie & The Truth Examples",
      examples: ["Ebenezer Scrooge (A Christmas Carol)", "Neo (The Matrix)", "Phil Connors (Groundhog Day)", "Tony Stark (Iron Man)", "Jen (The Devil Wears Prada)", "Lightning McQueen (Cars)"]
    },
    es: {
      introTitle: "¿Qué es La Mentira y La Verdad?",
      intro: ["La mentira es la creencia falsa que el personaje sostiene sobre sí mismo o el mundo, nacida de su herida; la verdad es la comprensión temática que debe aceptar para crecer. El arco recorre el camino de la mentira a la verdad."],
      core: ["Una creencia errónea gobierna al personaje", "La mentira lo protege del dolor pasado", "La verdad es la premisa temática de la historia", "Confrontar la mentira impulsa el arco", "Abrazar la verdad posibilita el cambio"],
      coreNote: "Weiland plantea el arco como el abandono de la Mentira en favor de la Verdad.",
      narrativeFunction: ["Definir la visión del mundo inicial del personaje", "Anclar el tema de la historia como contraargumento", "Crear conflicto interno en cada punto de giro", "Medir el crecimiento por el avance hacia la verdad"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Una mentira demasiado vaga para dramatizar", "Enunciar la verdad en lugar de revelarla", "Un tema que sermonea en vez de poner a prueba", "Una conversión que parece inmerecida"],
      examplesTitle: "Ejemplos de La Mentira y La Verdad",
      examples: ["Ebenezer Scrooge (Cuento de Navidad)", "Neo (Matrix)", "Phil Connors (Atrapado en el tiempo)", "Tony Stark (Iron Man)", "Jen (El diablo viste de Prada)", "Rayo McQueen (Cars)"]
    }
  },
  "Fatal Flaw": {
    en: {
      introTitle: "What is the Fatal Flaw?",
      intro: ["The fatal flaw (hamartia) is the ingrained trait or error of judgment that propels a character toward downfall or blocks their growth. In classical tragedy it is the crack through which fate enters."],
      core: ["An intrinsic trait, not mere bad luck", "Often a strength carried to excess", "Blinds the character to consequences", "Drives self-inflicted catastrophe", "Frequently paired with hubris"],
      coreNote: "Hamartia is a flaw in judgment or character, not a moral verdict on the person.",
      narrativeFunction: ["Make downfall feel inevitable yet self-caused", "Generate dramatic irony as others see the danger", "Anchor the obstacle to inner change", "Deliver catharsis through recognition"],
      risksTitle: "Common risks",
      risks: ["A flaw with no link to the plot's outcome", "Making the character merely unlikable", "Punishing the flaw without recognition", "Confusing a flaw with a quirk"],
      examplesTitle: "Fatal Flaw Examples",
      examples: ["Oedipus (pride/rashness)", "Macbeth (ambition)", "Othello (jealousy)", "Anakin Skywalker (fear of loss)", "Gatsby (idealized obsession)", "Michael Scott (need to be loved)"]
    },
    es: {
      introTitle: "¿Qué es el Defecto Fatal?",
      intro: ["El defecto fatal (hamartia) es el rasgo arraigado o el error de juicio que empuja al personaje hacia su caída o bloquea su crecimiento. En la tragedia clásica es la grieta por la que entra el destino."],
      core: ["Un rasgo intrínseco, no mera mala suerte", "A menudo una virtud llevada al exceso", "Ciega al personaje ante las consecuencias", "Provoca una catástrofe autoinfligida", "Suele ir unido a la soberbia (hybris)"],
      coreNote: "La hamartia es un error de juicio o de carácter, no un veredicto moral sobre la persona.",
      narrativeFunction: ["Hacer que la caída resulte inevitable pero autocausada", "Generar ironía dramática cuando otros ven el peligro", "Anclar el obstáculo al cambio interior", "Producir catarsis mediante el reconocimiento"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un defecto sin vínculo con el desenlace de la trama", "Hacer al personaje simplemente antipático", "Castigar el defecto sin reconocimiento", "Confundir un defecto con una manía"],
      examplesTitle: "Ejemplos de Defecto Fatal",
      examples: ["Edipo (orgullo/impulsividad)", "Macbeth (ambición)", "Otelo (celos)", "Anakin Skywalker (miedo a la pérdida)", "Gatsby (obsesión idealizada)", "Michael Scott (necesidad de ser querido)"]
    }
  },
  "Antagonist Design": {
    en: {
      introTitle: "What is Antagonist Design?",
      intro: ["A well-built antagonist wants the same goal as the hero or attacks the same need, forcing direct opposition over a shared stake. The opponent acts as a mirror and the primary source of pressure on the hero's arc."],
      core: ["Competes for the same goal or value", "Attacks the hero's specific weakness", "Holds a coherent, justified worldview", "Mirrors the hero with a key variation", "Is strong enough to seem capable of winning"],
      coreNote: "Truby: the best opponent attacks the hero's greatest weakness and necessitates the need.",
      narrativeFunction: ["Force the hero to confront their flaw", "Embody the counter-argument to the theme", "Escalate stakes through worthy opposition", "Define the hero by contrast"],
      risksTitle: "Common risks",
      risks: ["Evil without motivation or logic", "An opponent too weak to threaten", "No thematic connection to the hero", "Villainy that excuses the hero's own flaws"],
      examplesTitle: "Antagonist Design Examples",
      examples: ["Hans Gruber (Die Hard)", "The Joker (The Dark Knight)", "Amon Goeth (Schindler's List)", "Nurse Ratched (One Flew Over the Cuckoo's Nest)", "Thanos (Avengers)", "Anton Chigurh (No Country for Old Men)"]
    },
    es: {
      introTitle: "¿Qué es el Diseño del Antagonista?",
      intro: ["Un antagonista bien construido desea la misma meta que el héroe o ataca su misma necesidad, forzando una oposición directa sobre algo en disputa. El oponente funciona como espejo y como principal fuente de presión sobre el arco del héroe."],
      core: ["Compite por la misma meta o valor", "Ataca la debilidad concreta del héroe", "Sostiene una visión del mundo coherente y justificada", "Refleja al héroe con una variación clave", "Es lo bastante fuerte para parecer capaz de ganar"],
      coreNote: "Truby: el mejor oponente ataca la mayor debilidad del héroe y hace ineludible la necesidad.",
      narrativeFunction: ["Obligar al héroe a confrontar su defecto", "Encarnar el contraargumento del tema", "Elevar lo que está en juego con una oposición digna", "Definir al héroe por contraste"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Maldad sin motivación ni lógica", "Un oponente demasiado débil para amenazar", "Ninguna conexión temática con el héroe", "Una villanía que excusa los propios defectos del héroe"],
      examplesTitle: "Ejemplos de Diseño del Antagonista",
      examples: ["Hans Gruber (Jungla de cristal)", "El Joker (El caballero oscuro)", "Amon Goeth (La lista de Schindler)", "La enfermera Ratched (Alguien voló sobre el nido del cuco)", "Thanos (Vengadores)", "Anton Chigurh (No Country for Old Men)"]
    }
  },
  "Character Web": {
    en: {
      introTitle: "What is the Character Web?",
      intro: ["The character web is Truby's principle that no character exists in isolation: each is designed in relation to the hero, defining them through opposition or variation on the central theme. Every figure embodies a different possible response to the story's moral question."],
      core: ["All characters defined against the hero", "Each is a variation on the theme", "Opponents and allies form a system", "Roles contrast moral choices", "The web reveals theme by comparison"],
      coreNote: "Truby: design characters as a web, never as isolated individuals.",
      narrativeFunction: ["Articulate theme through contrasting choices", "Make every role earn its place", "Sharpen the hero by surrounding variation", "Unify the cast around one moral question"],
      risksTitle: "Common risks",
      risks: ["Characters that duplicate the same function", "Allies with no thematic distinction", "A cast that doesn't reflect the hero", "Subplots disconnected from the theme"],
      examplesTitle: "Character Web Examples",
      examples: ["Hamlet (Laertes and Fortinbras as foils)", "Breaking Bad (Walt, Jesse, Gus, Hank)", "Pride and Prejudice (the sisters and suitors)", "The Godfather (the Corleone sons)", "Toy Story (Woody, Buzz, the toys)", "Succession (the Roy siblings)"]
    },
    es: {
      introTitle: "¿Qué es la Red de Personajes?",
      intro: ["La red de personajes es el principio de Truby según el cual ningún personaje existe de forma aislada: cada uno se diseña en relación con el héroe, definiéndolo por oposición o por variación sobre el tema central. Cada figura encarna una respuesta posible distinta a la pregunta moral de la historia."],
      core: ["Todos los personajes se definen frente al héroe", "Cada uno es una variación sobre el tema", "Oponentes y aliados forman un sistema", "Los roles contrastan elecciones morales", "La red revela el tema por comparación"],
      coreNote: "Truby: diseña los personajes como una red, nunca como individuos aislados.",
      narrativeFunction: ["Articular el tema mediante elecciones contrastadas", "Hacer que cada rol justifique su lugar", "Perfilar al héroe rodeándolo de variaciones", "Unificar el reparto en torno a una pregunta moral"],
      risksTitle: "Riesgos frecuentes",
      risks: ["Personajes que duplican la misma función", "Aliados sin distinción temática", "Un reparto que no refleja al héroe", "Tramas secundarias desconectadas del tema"],
      examplesTitle: "Ejemplos de Red de Personajes",
      examples: ["Hamlet (Laertes y Fortinbras como contrapuntos)", "Breaking Bad (Walt, Jesse, Gus, Hank)", "Orgullo y prejuicio (las hermanas y los pretendientes)", "El Padrino (los hijos Corleone)", "Toy Story (Woody, Buzz, los juguetes)", "Succession (los hermanos Roy)"]
    }
  },

  // ── Dialogue craft ──────────────────────────────────────────────────────────
  "Subtext": {
    en: {
      introTitle: "What is subtext?",
      intro: ["Subtext is the meaning that lives beneath the spoken line—what a character actually wants, feels, or fears while saying something else. The surface words carry the scene; the real freight rides underneath."],
      core: ["Characters pursue an objective indirectly, masking intent behind ordinary talk", "The literal content of the line and its true purpose diverge", "Emotion is implied through behavior and word choice, never announced", "The audience reads the gap between what is said and what is meant", "Politeness, deflection, and small talk become vehicles for hidden agendas"],
      coreNote: "Subtext depends on context: the same line can carry opposite meanings depending on what the audience already knows.",
      narrativeFunction: ["Creates dramatic tension by withholding direct statement", "Respects the audience's intelligence, inviting active interpretation", "Reveals character through evasion, restraint, and what goes unsaid", "Mirrors real human behavior, where people rarely state their true feelings outright"],
      risksTitle: "Common risks",
      risks: ["Burying intent so deep the scene becomes opaque or unreadable", "Relying on subtext the audience has no context to decode", "Inconsistent layering, where some lines are coded and others bluntly literal", "Mistaking vagueness for subtext—lines that mean nothing rather than two things"],
      examplesTitle: "Subtext Examples",
      examples: ["Lost in Translation (Coppola)", "Brokeback Mountain", "The Remains of the Day (Ishiguro)", "Mad Men", "Who's Afraid of Virginia Woolf? (Albee)", "Before Sunset (Linklater)", "The Sopranos"]
    },
    es: {
      introTitle: "¿Qué es el subtexto?",
      intro: ["El subtexto es el significado que vive bajo la línea hablada: lo que un personaje realmente quiere, siente o teme mientras dice otra cosa. Las palabras sostienen la escena; la verdadera carga viaja por debajo."],
      core: ["Los personajes persiguen un objetivo de forma indirecta, ocultando su intención tras una charla corriente", "El contenido literal de la línea y su propósito real divergen", "La emoción se sugiere a través del comportamiento y la elección de palabras, nunca se anuncia", "El público lee la brecha entre lo que se dice y lo que se quiere decir", "La cortesía, la evasión y la charla trivial se vuelven vehículos de agendas ocultas"],
      coreNote: "El subtexto depende del contexto: la misma línea puede tener significados opuestos según lo que el público ya sepa.",
      narrativeFunction: ["Genera tensión dramática al evitar la declaración directa", "Respeta la inteligencia del público y lo invita a interpretar activamente", "Revela el personaje a través de la evasión, la contención y lo que no se dice", "Refleja la conducta humana real, donde la gente rara vez expresa sus sentimientos sin rodeos"],
      risksTitle: "Riesgos comunes",
      risks: ["Enterrar la intención tan hondo que la escena se vuelve opaca o ilegible", "Apoyarse en un subtexto que el público no tiene contexto para descifrar", "Capas inconsistentes, donde algunas líneas van codificadas y otras son crudamente literales", "Confundir la vaguedad con el subtexto: líneas que no significan nada en vez de dos cosas"],
      examplesTitle: "Ejemplos de subtexto",
      examples: ["Lost in Translation (Coppola)", "Brokeback Mountain", "Los restos del día (Ishiguro)", "Mad Men", "¿Quién teme a Virginia Woolf? (Albee)", "Antes del atardecer (Linklater)", "Los Soprano"]
    }
  },
  "On-the-Nose Dialogue": {
    en: {
      introTitle: "What is on-the-nose dialogue?",
      intro: ["On-the-nose dialogue is the failure mode in which characters say exactly what they think, feel, and mean with no gap between word and intent. It is the opposite of subtext, and it flattens drama by leaving nothing for the audience to discover."],
      core: ["Characters name their emotions directly ('I'm so angry at you right now')", "Information is delivered for the audience's benefit, not the character's need", "Lines answer questions fully and literally, with no evasion or resistance", "Dialogue restates what the action or image already shows", "Everyone speaks their full intent aloud, leaving no hidden agenda"],
      coreNote: "These are symptoms to diagnose, not rules—on-the-nose lines occasionally serve comedy, children's writing, or deliberate bluntness.",
      narrativeFunction: ["Replace stated emotion with behavior that lets the audience infer the feeling", "Give characters a reason to conceal, deflect, or only partially answer", "Cut lines that duplicate information the scene already conveys visually", "Bury intent under an opposing surface objective, creating a gap to read"],
      risksTitle: "Common risks",
      risks: ["Over-correcting into total opacity, where no intent can be tracked at all", "Stripping necessary clarity from plot-critical beats in the name of subtlety", "Assuming all directness is bad—some characters are blunt by design"],
      examplesTitle: "On-the-Nose Examples",
      examples: ["Early-draft exposition fixed by Sorkin/Mamet revisions", "The Room (Wiseau) — emotions stated flatly", "Attack of the Clones — romance dialogue criticized as literal", "Daytime soap operas, where feelings are narrated aloud", "After Earth — widely cited for declarative emotion"]
    },
    es: {
      introTitle: "¿Qué es el diálogo obvio (on-the-nose)?",
      intro: ["El diálogo obvio es el modo de fallo en el que los personajes dicen exactamente lo que piensan, sienten y quieren, sin ninguna brecha entre la palabra y la intención. Es lo contrario del subtexto y aplana el drama al no dejar nada por descubrir al público."],
      core: ["Los personajes nombran sus emociones directamente ('estoy furioso contigo ahora mismo')", "La información se entrega para beneficio del público, no por necesidad del personaje", "Las líneas responden a las preguntas de forma plena y literal, sin evasión ni resistencia", "El diálogo repite lo que la acción o la imagen ya muestran", "Todos expresan su intención completa en voz alta, sin ninguna agenda oculta"],
      coreNote: "Son síntomas a diagnosticar, no reglas: el diálogo obvio a veces sirve a la comedia, la escritura infantil o una franqueza deliberada.",
      narrativeFunction: ["Sustituir la emoción declarada por un comportamiento que deje al público inferir el sentimiento", "Dar a los personajes un motivo para ocultar, esquivar o responder solo en parte", "Recortar las líneas que duplican información que la escena ya transmite visualmente", "Enterrar la intención bajo un objetivo de superficie opuesto, creando una brecha que leer"],
      risksTitle: "Riesgos comunes",
      risks: ["Sobrecorregir hacia una opacidad total, donde no se puede seguir ninguna intención", "Quitar la claridad necesaria en momentos clave de la trama en nombre de la sutileza", "Asumir que toda franqueza es mala: algunos personajes son directos por diseño"],
      examplesTitle: "Ejemplos de diálogo obvio",
      examples: ["Exposición de primeros borradores corregida en revisiones de Sorkin/Mamet", "The Room (Wiseau) — emociones declaradas sin matiz", "El ataque de los clones — diálogos románticos criticados por literales", "Telenovelas, donde los sentimientos se narran en voz alta", "After Earth — citada a menudo por su emoción declarativa"]
    }
  },
  "Voice Differentiation": {
    en: {
      introTitle: "What is voice differentiation?",
      intro: ["Voice differentiation is the craft of making each character sound distinct, so a reader could identify who is speaking with the names stripped away. It is built from diction, rhythm, vocabulary, syntax, and the things a character will and won't say."],
      core: ["Distinct diction and vocabulary tied to background, era, and education", "Individual rhythm and sentence length—clipped, rambling, formal, fragmented", "Recurring verbal tics, idioms, or pet phrases unique to the character", "Differences in directness, profanity, humor, and emotional register", "Worldview leaking into word choice—what each character notices and names"],
      coreNote: "The test: cover the character names in a script and see whether the speakers remain identifiable.",
      narrativeFunction: ["Lets the audience track who is speaking without attribution", "Externalizes character history, class, and psychology through speech", "Creates friction when contrasting voices collide in a scene", "Builds a textured, believable world of genuinely separate people"],
      risksTitle: "Common risks",
      risks: ["Every character sounding like the writer—one uniform authorial voice", "Reducing voice to a single gimmick or catchphrase instead of full texture", "Tics so heavy they tip into caricature or distract from content", "Dialect spelled phonetically until it becomes unreadable"],
      examplesTitle: "Voice Differentiation Examples",
      examples: ["Deadwood (Milch)", "Pulp Fiction (Tarantino)", "The Wire", "Fargo (Coen Brothers)", "Juno (Cody)", "Succession", "Glengarry Glen Ross (Mamet)"]
    },
    es: {
      introTitle: "¿Qué es la diferenciación de voces?",
      intro: ["La diferenciación de voces es el oficio de hacer que cada personaje suene distinto, de modo que un lector pueda identificar quién habla aunque se borren los nombres. Se construye con la dicción, el ritmo, el vocabulario, la sintaxis y lo que un personaje diría y no diría."],
      core: ["Dicción y vocabulario propios, ligados al origen, la época y la educación", "Ritmo y longitud de frase individuales: cortante, divagante, formal, fragmentado", "Tics verbales, modismos o muletillas recurrentes únicos del personaje", "Diferencias en la franqueza, el lenguaje soez, el humor y el registro emocional", "La visión del mundo filtrándose en la elección de palabras: lo que cada uno nota y nombra"],
      coreNote: "La prueba: tapa los nombres de los personajes en un guion y comprueba si los hablantes siguen siendo identificables.",
      narrativeFunction: ["Permite al público seguir quién habla sin necesidad de atribución", "Externaliza la historia, la clase y la psicología del personaje a través del habla", "Crea fricción cuando voces contrastantes chocan en una escena", "Construye un mundo creíble y texturado de personas genuinamente distintas"],
      risksTitle: "Riesgos comunes",
      risks: ["Que todos los personajes suenen al autor: una única voz autoral uniforme", "Reducir la voz a un solo truco o muletilla en lugar de una textura completa", "Tics tan marcados que caen en la caricatura o distraen del contenido", "Dialecto escrito fonéticamente hasta volverse ilegible"],
      examplesTitle: "Ejemplos de diferenciación de voces",
      examples: ["Deadwood (Milch)", "Pulp Fiction (Tarantino)", "The Wire", "Fargo (hermanos Coen)", "Juno (Cody)", "Succession", "Glengarry Glen Ross (Mamet)"]
    }
  },
  "The Scene Turn": {
    en: {
      introTitle: "What is the scene turn?",
      intro: ["The scene turn is the moment a scene's emotional value shifts from one charge to its opposite—positive to negative, or negative to positive—through the exchange between characters. In McKee's model, a scene that ends on the same value it began is exposition, not drama."],
      core: ["A scene opens on one value (trust, hope, safety) and closes on its opposite", "The shift is driven by character action and reaction, not coincidence", "A turning point—often a single line or beat—pivots the charge", "Each character enters with an objective and meets resistance", "The change is the reason the scene exists in the story"],
      coreNote: "Value charges can be tracked beat by beat (+ / -); a scene with no swing usually shouldn't be there.",
      narrativeFunction: ["Ensures every scene advances or changes the story's emotional state", "Gives actors a clear arc to play from entrance to exit", "Maintains momentum by denying scenes that merely tread water", "Links the micro of the scene to the macro of the act and story arc"],
      risksTitle: "Common risks",
      risks: ["Static scenes that begin and end on the same emotional charge", "Engineering a turn so abruptly it feels mechanical or unearned", "Confusing plot events with genuine shifts in dramatic value", "Stacking too many reversals until the swing loses credibility"],
      examplesTitle: "Scene Turn Examples",
      examples: ["Michael's restaurant scene in The Godfather", "The 'coffee is for closers' scene in Glengarry Glen Ross", "The interrogation scenes in Breaking Bad", "The diner negotiation in Heat (Pacino/De Niro)", "The opening farmhouse scene in Inglourious Basterds", "The breakup beats in Marriage Story"]
    },
    es: {
      introTitle: "¿Qué es el giro de escena?",
      intro: ["El giro de escena es el momento en que el valor emocional de una escena cambia de una carga a su opuesta —de positiva a negativa, o de negativa a positiva— a través del intercambio entre personajes. En el modelo de McKee, una escena que termina con el mismo valor con el que empezó es exposición, no drama."],
      core: ["La escena abre con un valor (confianza, esperanza, seguridad) y cierra con su opuesto", "El cambio lo impulsan la acción y la reacción de los personajes, no la casualidad", "Un punto de giro —a menudo una sola línea o beat— invierte la carga", "Cada personaje entra con un objetivo y encuentra resistencia", "Ese cambio es la razón por la que la escena existe en la historia"],
      coreNote: "Las cargas de valor pueden rastrearse beat a beat (+ / -); una escena sin oscilación normalmente sobra.",
      narrativeFunction: ["Asegura que cada escena haga avanzar o cambiar el estado emocional de la historia", "Da a los actores un arco claro que interpretar de la entrada a la salida", "Mantiene el impulso al descartar escenas que solo dan vueltas en el mismo sitio", "Conecta el micro de la escena con el macro del acto y del arco de la historia"],
      risksTitle: "Riesgos comunes",
      risks: ["Escenas estáticas que empiezan y terminan con la misma carga emocional", "Forzar un giro de forma tan abrupta que resulte mecánico o inmerecido", "Confundir los eventos de trama con cambios genuinos de valor dramático", "Acumular tantos giros que la oscilación pierda credibilidad"],
      examplesTitle: "Ejemplos de giro de escena",
      examples: ["La escena del restaurante de Michael en El Padrino", "La escena del 'el café es para los que cierran' en Glengarry Glen Ross", "Los interrogatorios en Breaking Bad", "La negociación en la cafetería de Heat (Pacino/De Niro)", "La escena inicial de la granja en Malditos bastardos", "Los momentos de ruptura en Historia de un matrimonio"]
    }
  },
  "Exposition in Dialogue": {
    en: {
      introTitle: "What is exposition in dialogue?",
      intro: ["Exposition in dialogue is the art of delivering necessary information—backstory, world rules, relationships—through speech without the clumsy 'As you know, Bob' problem, where characters tell each other things they already know for the audience's sake. The fix is to make information a weapon, a stake, or a casualty of conflict."],
      core: ["Information surfaces because a character needs it, not because the audience does", "Facts are revealed through conflict, negotiation, or pursuit of an objective", "Exposition is dramatized: paid out in fragments as the scene demands", "Characters resist, distort, or withhold information rather than volunteer it", "The audience pieces facts together rather than receiving them in a lump"],
      coreNote: "Best practice: convert exposition into ammunition—something one character uses against another.",
      narrativeFunction: ["Keeps necessary information from stalling forward momentum", "Hides the seams of plot mechanics inside active, charged scenes", "Doubles up—each expository line also reveals character or advances conflict", "Controls reveal timing to manage suspense, surprise, and curiosity"],
      risksTitle: "Common risks",
      risks: ["'As you know, Bob'—characters reciting facts both already know", "Info-dumps that halt the scene to brief the audience", "Using a naive newcomer purely as a question-asking delivery device", "Over-withholding until the audience is confused rather than intrigued"],
      examplesTitle: "Exposition Examples",
      examples: ["The Social Network (Sorkin) deposition framing", "Jaws — Quint's Indianapolis monologue", "Michael Clayton", "The opening heist briefing in Inception", "A Few Good Men (Sorkin)", "Margin Call"]
    },
    es: {
      introTitle: "¿Qué es la exposición en el diálogo?",
      intro: ["La exposición en el diálogo es el arte de entregar la información necesaria —antecedentes, reglas del mundo, relaciones— a través del habla sin caer en el torpe problema del 'como ya sabes, Bob', donde los personajes se cuentan cosas que ya conocen solo para el público. La solución es convertir la información en un arma, una apuesta o una víctima del conflicto."],
      core: ["La información aflora porque un personaje la necesita, no porque la necesite el público", "Los datos se revelan a través del conflicto, la negociación o la búsqueda de un objetivo", "La exposición se dramatiza: se dosifica en fragmentos según lo pida la escena", "Los personajes resisten, distorsionan u ocultan la información en vez de ofrecerla", "El público arma los datos por sí mismo en lugar de recibirlos de golpe"],
      coreNote: "Buena práctica: convertir la exposición en munición, algo que un personaje usa contra otro.",
      narrativeFunction: ["Evita que la información necesaria frene el impulso de la historia", "Oculta las costuras de la mecánica de la trama dentro de escenas activas y cargadas", "Duplica funciones: cada línea expositiva también revela personaje o avanza el conflicto", "Controla el momento de cada revelación para gestionar el suspense, la sorpresa y la curiosidad"],
      risksTitle: "Riesgos comunes",
      risks: ["'Como ya sabes, Bob': personajes recitando datos que ambos ya conocen", "Volcados de información que detienen la escena para informar al público", "Usar a un recién llegado ingenuo solo como excusa para hacer preguntas", "Ocultar tanto que el público acaba confundido en lugar de intrigado"],
      examplesTitle: "Ejemplos de exposición",
      examples: ["El encuadre de las declaraciones en La red social (Sorkin)", "Tiburón — el monólogo del Indianapolis de Quint", "Michael Clayton", "El informe inicial del golpe en Origen", "Algunos hombres buenos (Sorkin)", "Margin Call"]
    }
  },
  "Action Beats & Silence": {
    en: {
      introTitle: "What are action beats and silence?",
      intro: ["Action beats and silence are the non-verbal tools that shape dialogue rhythm and carry subtext: the pauses, gestures, business, and stage directions woven between or beneath lines. What a character does—and what they don't say—often speaks louder than the words themselves."],
      core: ["Pauses and silences that create rhythm, tension, or unspoken weight", "Physical business and gestures that contradict or complicate the spoken line", "Action lines that interrupt, delay, or punctuate the dialogue", "Beats marking shifts in power, thought, or emotional temperature", "Behavior that reveals what a character is unwilling to put into words"],
      coreNote: "Pinter built whole scenes on the pause; what is withheld can land harder than what is spoken.",
      narrativeFunction: ["Controls pacing, letting scenes breathe or tighten the screws", "Carries subtext physically when words would be too direct", "Shifts power and status through who acts, who waits, and who looks away", "Gives actors and directors playable behavior beyond the lines"],
      risksTitle: "Common risks",
      risks: ["Over-directing actors with excessive parentheticals and stage business", "Pauses inserted for effect that kill momentum instead of building it", "Action lines that describe what the dialogue already makes clear", "Silence used so often it loses its charge and reads as dead air"],
      examplesTitle: "Action Beats & Silence Examples",
      examples: ["The Birthday Party / Betrayal (Pinter)", "No Country for Old Men (Coen Brothers)", "Drive (Refn)", "There Will Be Blood", "Lost in Translation (Coppola)", "A Quiet Place", "The films of Yasujiro Ozu"]
    },
    es: {
      introTitle: "¿Qué son los beats de acción y el silencio?",
      intro: ["Los beats de acción y el silencio son las herramientas no verbales que dan forma al ritmo del diálogo y portan el subtexto: las pausas, los gestos, la actividad física y las acotaciones tejidas entre o bajo las líneas. Lo que un personaje hace —y lo que no dice— a menudo habla más alto que las propias palabras."],
      core: ["Pausas y silencios que crean ritmo, tensión o un peso no dicho", "Actividad física y gestos que contradicen o complican la línea hablada", "Líneas de acción que interrumpen, retrasan o puntúan el diálogo", "Beats que marcan cambios de poder, de pensamiento o de temperatura emocional", "Conducta que revela lo que un personaje no quiere poner en palabras"],
      coreNote: "Pinter construyó escenas enteras sobre la pausa; lo que se calla puede golpear más fuerte que lo que se dice.",
      narrativeFunction: ["Controla el ritmo, dejando respirar las escenas o apretando las tuercas", "Porta el subtexto físicamente cuando las palabras serían demasiado directas", "Desplaza el poder y el estatus según quién actúa, quién espera y quién aparta la mirada", "Ofrece a actores y directores una conducta jugable más allá de las líneas"],
      risksTitle: "Riesgos comunes",
      risks: ["Sobredirigir a los actores con acotaciones y actividad física excesivas", "Pausas puestas por efecto que matan el impulso en vez de construirlo", "Líneas de acción que describen lo que el diálogo ya deja claro", "Silencio usado tan a menudo que pierde su carga y suena a aire muerto"],
      examplesTitle: "Ejemplos de beats de acción y silencio",
      examples: ["La fiesta de cumpleaños / Traición (Pinter)", "No es país para viejos (hermanos Coen)", "Drive (Refn)", "Pozos de ambición (There Will Be Blood)", "Lost in Translation (Coppola)", "Un lugar tranquilo", "El cine de Yasujiro Ozu"]
    }
  },

  // ── Genre (Save the Cat story-type genres) ───────────────────────────────────
  "Genre & Conventions": {
    en: {
      introTitle: "What is genre in story-craft?",
      intro: ["Genre is a promise to the audience: it tells them what kind of emotional experience they signed up for and what events they expect to see. In Blake Snyder's system, genre is defined by a story's structural problem, not its marketing shelf."],
      core: ["A genre is a category of story, not a setting or tone (horror can be comedy, sci-fi can be romance).", "Each genre carries conventions: recurring elements audiences recognize and crave.", "Each genre has obligatory scenes the story must deliver or the audience feels cheated.", "Genre sets up the central question and the kind of payoff that answers it.", "Knowing your genre tells you which beats are non-negotiable."],
      coreNote: "The 'obligatory scene' (Coyne/Snyder) is the moment the genre has promised from page one; skipping it breaks the contract.",
      narrativeFunction: ["Establish the promise early so expectations are correctly set.", "Honor the conventions of the chosen genre while finding fresh execution.", "Build toward and deliver the obligatory scenes the genre demands.", "Subvert knowingly, never accidentally: break a rule only with purpose."],
      risksTitle: "Common risks",
      risks: ["Mixing genres without a clear primary, leaving the audience unsure what they are watching.", "Withholding the obligatory scene, which reads as a broken promise rather than a clever twist.", "Copying surface conventions (tropes) without understanding the emotional need beneath them.", "Confusing marketing genre (vampires, spaceships) with story genre (the actual structural engine)."],
      examplesTitle: "Genre-defining works",
      examples: ["Jaws (Monster in the House)", "Star Wars (Golden Fleece)", "Die Hard (Dude with a Problem)", "When Harry Met Sally (Buddy Love)", "The Silence of the Lambs (Whydunit)", "Spider-Man (Superhero)", "Ordinary People (Rites of Passage)"]
    },
    es: {
      introTitle: "¿Qué es el género en la narrativa?",
      intro: ["El género es una promesa al público: le dice qué tipo de experiencia emocional eligió y qué acontecimientos espera ver. En el sistema de Blake Snyder, el género se define por el problema estructural de la historia, no por su estante comercial."],
      core: ["Un género es una categoría de historia, no un escenario ni un tono (el terror puede ser comedia, la ciencia ficción puede ser romance).", "Cada género trae convenciones: elementos recurrentes que el público reconoce y desea.", "Cada género tiene escenas obligatorias que la historia debe entregar o el público se siente engañado.", "El género plantea la pregunta central y el tipo de recompensa que la responde.", "Conocer tu género te dice qué momentos son innegociables."],
      coreNote: "La 'escena obligatoria' (Coyne/Snyder) es el momento que el género prometió desde la primera página; omitirlo rompe el contrato.",
      narrativeFunction: ["Establecer la promesa pronto para fijar bien las expectativas.", "Honrar las convenciones del género elegido encontrando una ejecución fresca.", "Avanzar hacia las escenas obligatorias que el género exige y entregarlas.", "Subvertir con conocimiento, nunca por accidente: romper una regla solo con un propósito."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Mezclar géneros sin un primario claro, dejando al público sin saber qué está viendo.", "Negar la escena obligatoria, que se lee como una promesa rota y no como un giro ingenioso.", "Copiar convenciones superficiales (tópicos) sin entender la necesidad emocional que las sustenta.", "Confundir el género comercial (vampiros, naves) con el género de historia (el verdadero motor estructural)."],
      examplesTitle: "Obras que definen género",
      examples: ["Tiburón (El Monstruo en Casa)", "La Guerra de las Galaxias (El Vellocino de Oro)", "Jungla de Cristal (Un Tipo con un Problema)", "Cuando Harry Encontró a Sally (Amor de Compañeros)", "El Silencio de los Corderos (El Porqué del Crimen)", "Spider-Man (Superhéroe)", "Gente Corriente (Ritos de Paso)"]
    }
  },
  "Monster in the House": {
    en: {
      introTitle: "What is Monster in the House?",
      intro: ["A monster, a house, and a sin that summons the monster. Characters are trapped in a confined space with a force that wants to kill them, and someone's transgression is what brought it."],
      core: ["A 'monster': a threat with power, often supernatural or unstoppable, sometimes human.", "A 'house': a confined or sealed space the characters cannot easily escape.", "A 'sin': a moral transgression by someone that invites or unleashes the monster.", "Survival is the engine; the monster picks off victims one by one.", "Scale can stretch the 'house' to a town, ship, planet, or family."],
      coreNote: "The sin is essential: it makes the horror a moral reckoning, not just random slaughter.",
      narrativeFunction: ["Define the monster and its rules of power early.", "Seal the house so escape is closed off and stakes are inescapable.", "Reveal the sin that called the monster, assigning hidden guilt.", "Force a half-man (flawed hero) to confront and survive the threat."],
      risksTitle: "Common risks",
      risks: ["A monster with no rules, so threat feels arbitrary and tension collapses.", "Characters who could simply leave the house, dissolving the trap.", "Forgetting the sin, reducing the story to a body-count exercise.", "Over-explaining or over-showing the monster until fear evaporates."],
      examplesTitle: "Monster in the House Examples",
      examples: ["Jaws", "Alien", "The Exorcist", "Psycho", "A Quiet Place", "Tremors", "Get Out"]
    },
    es: {
      introTitle: "¿Qué es El Monstruo en Casa?",
      intro: ["Un monstruo, una casa y un pecado que lo invoca. Los personajes quedan atrapados en un espacio cerrado con una fuerza que quiere matarlos, y la transgresión de alguien es lo que la trajo."],
      core: ["Un 'monstruo': una amenaza con poder, a menudo sobrenatural o imparable, a veces humana.", "Una 'casa': un espacio cerrado o sellado del que los personajes no pueden escapar con facilidad.", "Un 'pecado': una transgresión moral de alguien que invita o desata al monstruo.", "La supervivencia es el motor; el monstruo elimina a las víctimas una a una.", "La escala puede estirar la 'casa' a un pueblo, un barco, un planeta o una familia."],
      coreNote: "El pecado es esencial: convierte el terror en un ajuste de cuentas moral, no en una matanza aleatoria.",
      narrativeFunction: ["Definir el monstruo y las reglas de su poder desde el principio.", "Sellar la casa para cerrar la huida y volver inevitables las apuestas.", "Revelar el pecado que llamó al monstruo, asignando una culpa oculta.", "Obligar a un héroe imperfecto a enfrentarse a la amenaza y sobrevivir."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un monstruo sin reglas, de modo que la amenaza se siente arbitraria y la tensión se desploma.", "Personajes que podrían simplemente marcharse de la casa, disolviendo la trampa.", "Olvidar el pecado, reduciendo la historia a un recuento de cadáveres.", "Explicar o mostrar demasiado al monstruo hasta que el miedo se evapora."],
      examplesTitle: "Ejemplos de El Monstruo en Casa",
      examples: ["Tiburón", "Alien", "El Exorcista", "Psicosis", "Un Lugar Tranquilo", "Temblores", "Déjame Salir"]
    }
  },
  "Golden Fleece": {
    en: {
      introTitle: "What is the Golden Fleece?",
      intro: ["A road, a team, and a prize at the end. A hero sets out on a quest to win something, but the real treasure is the internal growth gained along the way."],
      core: ["A 'road': a journey across space, time, or stages that structures the plot.", "A 'team' or companions who travel with (or against) the hero.", "A 'prize': the external goal that justifies the trip.", "Episodic incidents that each change the hero a little.", "The true reward is internal: the hero is transformed, not just enriched."],
      coreNote: "The fleece (external goal) is a pretext; the story is really about who the hero becomes.",
      narrativeFunction: ["Set a clear goal and the road that leads to it.", "Assemble a team whose members test and reveal the hero.", "String episodic 'beads on a necklace' that each force growth.", "Deliver the prize while showing the deeper internal transformation."],
      risksTitle: "Common risks",
      risks: ["Episodes that feel random instead of escalating and changing the hero.", "A road trip where nobody grows, leaving only sightseeing.", "Companions who are decoration rather than mirrors of the hero.", "Focusing on the prize so hard that the inner journey is forgotten."],
      examplesTitle: "Golden Fleece Examples",
      examples: ["Star Wars", "The Lord of the Rings: The Fellowship of the Ring", "The Wizard of Oz", "Finding Nemo", "Raiders of the Lost Ark", "The Hangover", "Little Miss Sunshine"]
    },
    es: {
      introTitle: "¿Qué es El Vellocino de Oro?",
      intro: ["Un camino, un equipo y un premio al final. Un héroe parte en una búsqueda para ganar algo, pero el verdadero tesoro es el crecimiento interior que obtiene por el camino."],
      core: ["Un 'camino': un viaje por el espacio, el tiempo o varias etapas que estructura la trama.", "Un 'equipo' o compañeros que viajan con (o contra) el héroe.", "Un 'premio': la meta externa que justifica el viaje.", "Incidentes episódicos que cambian al héroe un poco cada vez.", "La verdadera recompensa es interna: el héroe se transforma, no solo se enriquece."],
      coreNote: "El vellocino (la meta externa) es un pretexto; la historia trata en realidad de en quién se convierte el héroe.",
      narrativeFunction: ["Fijar una meta clara y el camino que conduce a ella.", "Reunir un equipo cuyos miembros pongan a prueba y revelen al héroe.", "Encadenar episodios como 'cuentas de un collar' que fuercen el crecimiento.", "Entregar el premio mostrando la transformación interna más profunda."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Episodios que se sienten aleatorios en lugar de escalar y cambiar al héroe.", "Un viaje en el que nadie crece, que deja solo paisaje.", "Compañeros que son decoración en vez de espejos del héroe.", "Centrarse tanto en el premio que se olvida el viaje interior."],
      examplesTitle: "Ejemplos de El Vellocino de Oro",
      examples: ["La Guerra de las Galaxias", "El Señor de los Anillos: La Comunidad del Anillo", "El Mago de Oz", "Buscando a Nemo", "En Busca del Arca Perdida", "Resacón en Las Vegas", "Pequeña Miss Sunshine"]
    }
  },
  "Dude with a Problem": {
    en: {
      introTitle: "What is Dude with a Problem?",
      intro: ["An ordinary person is thrust into extraordinary circumstances through no fault of their own. A regular life collides with sudden, overwhelming danger that must be survived."],
      core: ["An 'ordinary' protagonist: relatable, not specially skilled or chosen.", "A 'sudden event': danger that erupts without warning and without their seeking it.", "High stakes that escalate, usually life-or-death.", "Survival and endurance rather than mastery drive the action.", "The contrast between the everyday person and the impossible situation is the hook."],
      coreNote: "The hero is innocent: they did not ask for this, which earns audience empathy.",
      narrativeFunction: ["Ground the hero as believably ordinary before the storm hits.", "Trigger a sudden event that traps them with no easy exit.", "Escalate the stakes so survival grows steadily harder.", "Let the ordinary person find extraordinary resolve to endure."],
      risksTitle: "Common risks",
      risks: ["A hero who is secretly a superhero, killing the everyman empathy.", "A problem the protagonist invited, which forfeits their innocence.", "Stakes that plateau instead of escalating, draining tension.", "Coincidences that rescue the hero, undercutting earned survival."],
      examplesTitle: "Dude with a Problem Examples",
      examples: ["Die Hard", "Titanic", "North by Northwest", "The Pursuit of Happyness", "Schindler's List", "127 Hours", "Breaking Away"]
    },
    es: {
      introTitle: "¿Qué es Un Tipo con un Problema?",
      intro: ["Una persona corriente es arrojada a circunstancias extraordinarias sin culpa propia. Una vida normal choca con un peligro repentino y abrumador que debe sobrevivir."],
      core: ["Un protagonista 'corriente': cercano, sin habilidades especiales ni destino elegido.", "Un 'suceso repentino': un peligro que estalla sin aviso y sin que él lo busque.", "Apuestas altas que escalan, normalmente de vida o muerte.", "La supervivencia y la resistencia, no el dominio, mueven la acción.", "El contraste entre la persona común y la situación imposible es el gancho."],
      coreNote: "El héroe es inocente: no pidió esto, y eso le gana la empatía del público.",
      narrativeFunction: ["Asentar al héroe como creíblemente corriente antes de que estalle la tormenta.", "Detonar un suceso repentino que lo atrape sin salida fácil.", "Escalar las apuestas para que sobrevivir sea cada vez más difícil.", "Permitir que la persona común halle una determinación extraordinaria para resistir."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un héroe que en secreto es un superhéroe, lo que mata la empatía con el hombre común.", "Un problema que el protagonista provocó, lo que le quita su inocencia.", "Apuestas que se estancan en vez de escalar, agotando la tensión.", "Casualidades que rescatan al héroe, restando mérito a la supervivencia ganada."],
      examplesTitle: "Ejemplos de Un Tipo con un Problema",
      examples: ["Jungla de Cristal", "Titanic", "Con la Muerte en los Talones", "En Busca de la Felicidad", "La Lista de Schindler", "127 Horas", "El Relevo"]
    }
  },
  "Rites of Passage": {
    en: {
      introTitle: "What is Rites of Passage?",
      intro: ["A story about the pain of a universal life change: adolescence, addiction, midlife, grief, death. The real enemy is internal, and the hero must accept what they have been resisting."],
      core: ["A 'life problem': a transition everyone faces sooner or later.", "The pain is universal and recognizable, not exotic.", "The enemy is internal: the hero's own resistance to change.", "Victory means acceptance and surrender, not defeating an outside foe.", "Often quiet and character-driven rather than plot-driven."],
      coreNote: "The breakthrough comes when the hero stops fighting reality and embraces the change.",
      narrativeFunction: ["Name the universal life passage causing the pain.", "Show the hero resisting it through denial, anger, or avoidance.", "Build the internal conflict until resistance becomes unbearable.", "Resolve through acceptance: the hero surrenders and is changed."],
      risksTitle: "Common risks",
      risks: ["Externalizing the conflict into a villain, betraying the internal genre.", "Wallowing in misery without movement toward acceptance.", "A 'cure' that feels easy or unearned, cheapening the change.", "Mistaking aimlessness for depth, leaving the story without shape."],
      examplesTitle: "Rites of Passage Examples",
      examples: ["Ordinary People", "Days of Wine and Roses", "Manchester by the Sea", "Lady Bird", "Leaving Las Vegas", "When a Man Loves a Woman"]
    },
    es: {
      introTitle: "¿Qué es Ritos de Paso?",
      intro: ["Una historia sobre el dolor de un cambio vital universal: la adolescencia, la adicción, la madurez, el duelo, la muerte. El verdadero enemigo es interno, y el héroe debe aceptar aquello a lo que se resistía."],
      core: ["Un 'problema vital': una transición que todos enfrentan tarde o temprano.", "El dolor es universal y reconocible, no exótico.", "El enemigo es interno: la propia resistencia del héroe al cambio.", "La victoria es la aceptación y la rendición, no derrotar a un rival externo.", "Suele ser íntima y guiada por el personaje, no por la trama."],
      coreNote: "El avance llega cuando el héroe deja de luchar contra la realidad y abraza el cambio.",
      narrativeFunction: ["Nombrar el paso vital universal que causa el dolor.", "Mostrar al héroe resistiéndose mediante negación, ira o evasión.", "Acrecentar el conflicto interno hasta que la resistencia sea insoportable.", "Resolver mediante la aceptación: el héroe se rinde y queda transformado."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Externalizar el conflicto en un villano, traicionando el carácter interno del género.", "Regodearse en la miseria sin avanzar hacia la aceptación.", "Una 'cura' que se siente fácil o inmerecida, abaratando el cambio.", "Confundir la falta de rumbo con la profundidad, dejando la historia sin forma."],
      examplesTitle: "Ejemplos de Ritos de Paso",
      examples: ["Gente Corriente", "Días de Vino y Rosas", "Manchester Frente al Mar", "Lady Bird", "Leaving Las Vegas", "Cuando un Hombre Ama a una Mujer"]
    }
  },
  "Buddy Love": {
    en: {
      introTitle: "What is Buddy Love?",
      intro: ["Two people who complete each other. Whether romance or friendship, the story is about a pair who resist, then need, then are transformed by their bond."],
      core: ["An 'incomplete hero': someone missing a quality the other supplies.", "A 'counterpart': the partner who challenges and completes them.", "A 'complication': the obstacle keeping the pair apart.", "The relationship itself is the plot, not a subplot.", "Works for romance and for platonic buddy stories alike."],
      coreNote: "The lesson: the hero learns they are better, and more whole, with the other person.",
      narrativeFunction: ["Introduce two characters who each lack what the other has.", "Force them together so friction reveals their need.", "Raise a complication that drives them apart at the low point.", "Reunite them transformed, completing what each was missing."],
      risksTitle: "Common risks",
      risks: ["Partners with no real friction, so there is nothing to overcome.", "A complication so contrived the breakup feels false.", "One character existing only to fix the other, with no arc of their own.", "Resolving the bond before the hero has actually changed."],
      examplesTitle: "Buddy Love Examples",
      examples: ["When Harry Met Sally", "Casablanca", "Rain Man", "Brokeback Mountain", "Thelma & Louise", "The Fault in Our Stars", "Lethal Weapon"]
    },
    es: {
      introTitle: "¿Qué es Amor de Compañeros?",
      intro: ["Dos personas que se completan mutuamente. Sea romance o amistad, la historia trata de una pareja que primero se resiste, luego se necesita y al fin queda transformada por su vínculo."],
      core: ["Un 'héroe incompleto': alguien al que le falta una cualidad que el otro aporta.", "Una 'contraparte': el compañero que lo desafía y lo completa.", "Una 'complicación': el obstáculo que mantiene separada a la pareja.", "La relación misma es la trama, no una subtrama.", "Sirve igual para el romance que para las historias de amistad platónica."],
      coreNote: "La lección: el héroe descubre que es mejor, y más completo, junto a la otra persona.",
      narrativeFunction: ["Presentar a dos personajes a los que les falta lo que el otro tiene.", "Forzar su encuentro para que el roce revele su necesidad mutua.", "Plantear una complicación que los separe en el punto más bajo.", "Reunirlos transformados, completando lo que a cada uno le faltaba."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Una pareja sin roce real, de modo que no hay nada que superar.", "Una complicación tan forzada que la ruptura se siente falsa.", "Un personaje que existe solo para arreglar al otro, sin arco propio.", "Resolver el vínculo antes de que el héroe haya cambiado de verdad."],
      examplesTitle: "Ejemplos de Amor de Compañeros",
      examples: ["Cuando Harry Encontró a Sally", "Casablanca", "Rain Man", "Brokeback Mountain", "Thelma y Louise", "Bajo la Misma Estrella", "Arma Letal"]
    }
  },
  "Whydunit": {
    en: {
      introTitle: "What is a Whydunit?",
      intro: ["A mystery whose point is not who did it but the dark truth uncovered along the way. The investigation peels back layers to expose something disturbing about human nature."],
      core: ["A 'detective': the figure who pursues the mystery, professional or not.", "A 'secret': the dark truth waiting to be exposed.", "The 'why' matters more than the 'who'.", "The descent uncovers darkness in people, institutions, or the self.", "The detective is often changed, even corrupted, by what they find."],
      coreNote: "The audience reward is revelation about the human capacity for darkness, not just a solved puzzle.",
      narrativeFunction: ["Open a mystery whose surface question hides a deeper one.", "Send a detective figure down through escalating layers of truth.", "Expose the dark 'why' behind the crime or secret.", "Mark the detective with the cost of what they have learned."],
      risksTitle: "Common risks",
      risks: ["Treating it as a mere puzzle, so the reveal carries no moral weight.", "A 'why' that is shallow or arbitrary, deflating the descent.", "A detective untouched by the darkness, with nothing at stake.", "Withholding clues unfairly so the solution feels like a cheat."],
      examplesTitle: "Whydunit Examples",
      examples: ["Chinatown", "The Silence of the Lambs", "Se7en", "Citizen Kane", "Zodiac", "Mystic River", "All the President's Men"]
    },
    es: {
      introTitle: "¿Qué es El Porqué del Crimen?",
      intro: ["Un misterio cuyo sentido no es quién lo hizo, sino la verdad oscura que se descubre por el camino. La investigación retira capas hasta exponer algo perturbador sobre la naturaleza humana."],
      core: ["Un 'detective': la figura que persigue el misterio, sea profesional o no.", "Un 'secreto': la verdad oscura que espera ser revelada.", "El 'porqué' importa más que el 'quién'.", "El descenso descubre oscuridad en las personas, las instituciones o uno mismo.", "El detective suele salir cambiado, incluso corrompido, por lo que halla."],
      coreNote: "La recompensa del público es la revelación sobre la capacidad humana para la oscuridad, no solo un enigma resuelto.",
      narrativeFunction: ["Abrir un misterio cuya pregunta superficial esconde otra más profunda.", "Hacer descender al detective por capas de verdad cada vez más hondas.", "Exponer el oscuro 'porqué' detrás del crimen o del secreto.", "Marcar al detective con el coste de lo que ha aprendido."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Tratarlo como un mero enigma, de modo que la revelación no tiene peso moral.", "Un 'porqué' superficial o arbitrario, que desinfla el descenso.", "Un detective al que la oscuridad no roza, sin nada en juego.", "Ocultar pistas de forma injusta para que la solución parezca una trampa."],
      examplesTitle: "Ejemplos de El Porqué del Crimen",
      examples: ["Chinatown", "El Silencio de los Corderos", "Seven", "Ciudadano Kane", "Zodiac", "Mystic River", "Todos los Hombres del Presidente"]
    }
  },
  "Superhero": {
    en: {
      introTitle: "What is the Superhero genre?",
      intro: ["An extraordinary person dropped into an ordinary world: the opposite of Dude with a Problem. The hero's gift sets them apart, and the struggle is bearing the burden of being special."],
      core: ["An 'extraordinary' protagonist with a special power, gift, or destiny.", "An 'ordinary world' that cannot fully understand or contain them.", "A 'nemesis' whose power matches or challenges the hero's own.", "The conflict is the price of being different and misunderstood.", "Need not be a literal superhero; any uniquely gifted figure qualifies."],
      coreNote: "The empathy comes from the loneliness and obligation of being greater than those around you.",
      narrativeFunction: ["Establish the hero's extraordinary nature or power.", "Place them in an ordinary world that resists or fears them.", "Introduce a worthy nemesis who tests the limits of that power.", "Dramatize the burden and isolation that come with the gift."],
      risksTitle: "Common risks",
      risks: ["A hero so powerful nothing threatens them, killing the stakes.", "A nemesis too weak to truly challenge the hero's gift.", "Forgetting the burden, so the power feels like wish-fulfillment only.", "An ordinary world that simply adores the hero, removing the friction."],
      examplesTitle: "Superhero Examples",
      examples: ["Spider-Man", "Gladiator", "A Beautiful Mind", "The Matrix", "Frankenstein", "Lawrence of Arabia", "Black Panther"]
    },
    es: {
      introTitle: "¿Qué es el género Superhéroe?",
      intro: ["Una persona extraordinaria caída en un mundo corriente: lo opuesto a Un Tipo con un Problema. El don del héroe lo aparta de los demás, y la lucha consiste en soportar la carga de ser especial."],
      core: ["Un protagonista 'extraordinario' con un poder, don o destino especial.", "Un 'mundo corriente' que no puede comprenderlo ni contenerlo del todo.", "Un 'némesis' cuyo poder iguala o desafía al del propio héroe.", "El conflicto es el precio de ser diferente e incomprendido.", "No hace falta un superhéroe literal; sirve cualquier figura singularmente dotada."],
      coreNote: "La empatía nace de la soledad y la obligación de ser más grande que quienes te rodean.",
      narrativeFunction: ["Establecer la naturaleza o el poder extraordinario del héroe.", "Situarlo en un mundo corriente que se le resiste o lo teme.", "Presentar un némesis a su altura que ponga a prueba los límites de ese poder.", "Dramatizar la carga y el aislamiento que acompañan al don."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un héroe tan poderoso que nada lo amenaza, lo que mata las apuestas.", "Un némesis demasiado débil para desafiar de verdad el don del héroe.", "Olvidar la carga, de modo que el poder parece solo cumplimiento de deseos.", "Un mundo corriente que simplemente adora al héroe, eliminando el roce."],
      examplesTitle: "Ejemplos de Superhéroe",
      examples: ["Spider-Man", "Gladiator", "Una Mente Maravillosa", "Matrix", "Frankenstein", "Lawrence de Arabia", "Black Panther"]
    }
  },
  "Out of the Bottle": {
    en: {
      introTitle: "What is Out of the Bottle?",
      intro: ["Magic enters an ordinary life — a wish granted or a curse imposed — and the story turns on what the magic teaches. The lesson is always that the magic was never the point: the power was earned, or was inside the hero all along, and must finally be given up."],
      core: ["A 'wish' or a 'spell': magic granted to someone who longs for it, or laid on someone who needs a lesson.", "An ordinary protagonist, so the audience projects their own longing onto the magic.", "A 'comeuppance' version (the deserving learn humility) or a 'deserving' version (the downtrodden get a break).", "Magic that solves the surface problem but exposes the real one.", "A return to the ordinary: the spell is relinquished and the hero is changed."],
      coreNote: "The rule: the magic must end, because the lesson is that the hero never needed it.",
      narrativeFunction: ["Grant the wish or impose the curse early, with clear rules.", "Let the magic deliver what the hero thought they wanted.", "Reveal the deeper need the magic cannot satisfy.", "Strip the magic away so the change has to come from the hero."],
      risksTitle: "Common risks",
      risks: ["Magic with no rules or cost, so nothing is at stake.", "A lesson preached instead of dramatized through the wish.", "Letting the hero keep the magic, which voids the moral.", "Wish-fulfilment with no comeuppance, so the hero never grows."],
      examplesTitle: "Out of the Bottle Examples",
      examples: ["Liar Liar", "Bruce Almighty", "Big", "Freaky Friday", "Groundhog Day", "The Mask", "Cinderella"]
    },
    es: {
      introTitle: "¿Qué es Out of the Bottle (La magia embotellada)?",
      intro: ["La magia entra en una vida corriente —un deseo concedido o una maldición impuesta— y la historia gira en torno a lo que esa magia enseña. La lección siempre es que la magia nunca fue lo importante: el poder se ganó, o estuvo dentro del héroe todo el tiempo, y al final hay que renunciar a él."],
      core: ["Un 'deseo' o un 'hechizo': magia concedida a quien la anhela, o impuesta a quien necesita una lección.", "Un protagonista corriente, para que el público proyecte su propio anhelo en la magia.", "Una versión de 'escarmiento' (el merecedor aprende humildad) o de 'merecimiento' (el oprimido recibe un respiro).", "Una magia que resuelve el problema de superficie pero destapa el de fondo.", "Un regreso a lo corriente: se renuncia al hechizo y el héroe sale cambiado."],
      coreNote: "La regla: la magia debe terminar, porque la lección es que el héroe nunca la necesitó.",
      narrativeFunction: ["Conceder el deseo o imponer la maldición pronto, con reglas claras.", "Dejar que la magia entregue lo que el héroe creía querer.", "Revelar la necesidad profunda que la magia no puede satisfacer.", "Retirar la magia para que el cambio tenga que salir del héroe."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Magia sin reglas ni coste, de modo que no hay nada en juego.", "Una lección predicada en vez de dramatizada a través del deseo.", "Dejar que el héroe conserve la magia, lo que anula la moraleja.", "Cumplimiento de deseos sin escarmiento, de modo que el héroe nunca crece."],
      examplesTitle: "Ejemplos de Out of the Bottle",
      examples: ["Mentiroso compulsivo", "Como Dios", "Big", "Ponte en mi lugar", "Atrapado en el tiempo", "La máscara", "Cenicienta"]
    }
  },
  "The Fool Triumphant": {
    en: {
      introTitle: "What is The Fool Triumphant?",
      intro: ["An underestimated 'fool' takes on a powerful establishment and wins — precisely because everyone underrates them. The fool's apparent simplicity is their strength, and the story exposes the vanity and corruption of the institution that scorned them."],
      core: ["A 'fool': an innocent or outsider the world dismisses.", "An 'establishment': the powerful group, system, or rival the fool disrupts.", "An 'insider' who recognizes the fool's worth — or burns with envy at it.", "A transformation, sometimes marked by a new name or role.", "Victory won not by changing, but by staying true to the fool's nature."],
      coreNote: "The fool wins by being underestimated; the establishment loses by underestimating them.",
      narrativeFunction: ["Establish the fool as harmless and overlooked.", "Set them against an establishment that cannot take them seriously.", "Use an envious insider to voice the threat the fool poses.", "Let the fool triumph by being exactly who they always were."],
      risksTitle: "Common risks",
      risks: ["A fool so passive the plot happens entirely to them.", "An establishment too weak to make the victory meaningful.", "Mistaking stupidity for the fool's wise innocence.", "A win that requires the fool to abandon their nature."],
      examplesTitle: "The Fool Triumphant Examples",
      examples: ["Forrest Gump", "Being There", "Amadeus", "Legally Blonde", "The Jerk", "Dave", "Chaplin's The Great Dictator"]
    },
    es: {
      introTitle: "¿Qué es The Fool Triumphant (El triunfo del tonto)?",
      intro: ["Un 'tonto' subestimado se enfrenta a un poder establecido y vence, justamente porque todos lo menosprecian. La aparente simpleza del tonto es su fuerza, y la historia desnuda la vanidad y la corrupción de la institución que lo despreció."],
      core: ["Un 'tonto': un inocente o forastero al que el mundo descarta.", "Un 'poder establecido': el grupo, sistema o rival al que el tonto altera.", "Alguien de dentro del propio sistema que reconoce el valor del tonto, o que arde de envidia ante él.", "Una transformación, a veces marcada por un nombre o un rol nuevos.", "Una victoria lograda no por cambiar, sino por permanecer fiel a la naturaleza del tonto."],
      coreNote: "El tonto gana por ser subestimado; el poder pierde por subestimarlo.",
      narrativeFunction: ["Establecer al tonto como inofensivo y pasado por alto.", "Enfrentarlo a un poder que no puede tomarlo en serio.", "Recurrir a alguien del propio sistema, envidioso, para poner en palabras la amenaza que el tonto representa.", "Dejar que el tonto triunfe siendo exactamente quien siempre fue."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Un tonto tan pasivo que la trama le sucede por completo.", "Un poder demasiado débil para que la victoria signifique algo.", "Confundir la estupidez con la sabia inocencia del tonto.", "Una victoria que exige que el tonto abandone su naturaleza."],
      examplesTitle: "Ejemplos de The Fool Triumphant",
      examples: ["Forrest Gump", "Bienvenido, Mr. Chance", "Amadeus", "Una rubia muy legal", "El loco de los líos", "Dave, presidente por un día", "El gran dictador (Chaplin)"]
    }
  },
  "Institutionalized": {
    en: {
      introTitle: "What is Institutionalized?",
      intro: ["A story about a group — a family, an army, a company, a mob — and the tension between the individual and the collective that absorbs them. The drama is the choice every member faces: join the group, blow it up, or be destroyed by it."],
      core: ["An 'institution': a family, unit, or organization with its own rules and loyalties.", "A 'choice': the recurring tension of the one against the many.", "A 'brain': often a newcomer or observer who sees the system clearly.", "A 'sacrifice': someone pays the price for belonging or for breaking away.", "The triad of endings — join it, burn it down, or go mad."],
      coreNote: "Snyder's rule: the question is always the individual versus the group, and the group usually wins.",
      narrativeFunction: ["Establish the institution's rules, hierarchy, and loyalties.", "Drop in the observer who questions whether belonging is worth the cost.", "Escalate the pressure to conform until a choice becomes unavoidable.", "Resolve through one of the three fates: assimilation, rebellion, or breakdown."],
      risksTitle: "Common risks",
      risks: ["An institution so vaguely drawn the stakes never land.", "No clear individual perspective to anchor the group dynamics.", "Forgetting the cost, so belonging carries no real weight.", "A tidy ending that dodges the genre's hard choice."],
      examplesTitle: "Institutionalized Examples",
      examples: ["One Flew Over the Cuckoo's Nest", "The Godfather", "American Beauty", "M*A*S*H", "Office Space", "Goodfellas", "Animal House"]
    },
    es: {
      introTitle: "¿Qué es Institutionalized (Institucionalizado)?",
      intro: ["Una historia sobre un grupo —una familia, un ejército, una empresa, una mafia— y la tensión entre el individuo y el colectivo que lo absorbe. El drama es la elección que afronta cada miembro: integrarse en el grupo, hacerlo saltar por los aires, o ser destruido por él."],
      core: ["Una 'institución': una familia, unidad u organización con sus propias reglas y lealtades.", "Una 'elección': la tensión recurrente del uno contra los muchos.", "Un 'cerebro': a menudo un recién llegado u observador que ve el sistema con claridad.", "Un 'sacrificio': alguien paga el precio de pertenecer o de escapar.", "La tríada de finales: integrarse, incendiarlo, o enloquecer."],
      coreNote: "La regla de Snyder: la pregunta siempre es el individuo frente al grupo, y el grupo suele ganar.",
      narrativeFunction: ["Establecer las reglas, la jerarquía y las lealtades de la institución.", "Introducir al observador que cuestiona si pertenecer merece su precio.", "Aumentar la presión por conformarse hasta que la elección sea inevitable.", "Resolver con uno de los tres destinos: asimilación, rebelión o derrumbe."],
      risksTitle: "Riesgos frecuentes",
      risks: ["Una institución tan vagamente dibujada que lo que está en juego nunca cala.", "Ninguna perspectiva individual clara que ancle la dinámica de grupo.", "Olvidar el coste, de modo que pertenecer no pesa de verdad.", "Un final pulcro que esquiva la elección difícil del género."],
      examplesTitle: "Ejemplos de Institutionalized",
      examples: ["Alguien voló sobre el nido del cuco", "El padrino", "American Beauty", "M*A*S*H", "Trabajo basura", "Uno de los nuestros", "Desmadre a la americana"]
    }
  }
};

// ─── Tips-shaped content (Screenwriting format, Revision) ────────────────────

export const EXTRA_TIPS_DATA = {
  // ── Screenwriting format & documents ────────────────────────────────────────
  "Scene Headings (tips)": {
    en: {
      introTitle: "What is a scene heading?",
      intro: ["A scene heading (or slugline) opens every scene and tells the reader where and when the action occurs. It is always typed in uppercase and structured as INT./EXT. — LOCATION — TIME OF DAY."],
      techniques: ["INT./EXT. prefix — Begin with INT. for interiors and EXT. for exteriors; use INT./EXT. when a scene plays both inside and outside (e.g., a moving car).", "Location — Name the specific setting in caps, moving from general to specific (KITCHEN, then a dash to a sub-area if needed).", "Time of day — End with DAY or NIGHT; reserve DAWN, DUSK, and MORNING for when the exact light is dramatically essential.", "CONTINUOUS — Use in place of a time when action flows unbroken from the previous scene without a time jump.", "ESTABLISHING — Append to flag a wide orienting shot of a location before entering it.", "Uppercase rule — Type the entire slugline in capitals, separating each element with a space-hyphen-space.", "One line only — Keep the heading to a single line; never wrap location detail or description into it.", "Consistency — Spell each recurring location identically every time so script software can track it correctly."]
    },
    es: {
      introTitle: "¿Qué es un encabezado de escena?",
      intro: ["Un encabezado de escena (o slugline) abre cada escena e indica al lector dónde y cuándo ocurre la acción. Siempre se escribe en mayúsculas y se estructura como INT./EXT. — LOCALIZACIÓN — MOMENTO DEL DÍA."],
      techniques: ["Prefijo INT./EXT. — Empieza con INT. para interiores y EXT. para exteriores; usa INT./EXT. cuando una escena transcurre dentro y fuera (p. ej., un coche en marcha).", "Localización — Nombra el escenario concreto en mayúsculas, de lo general a lo específico (COCINA y, tras un guion, una subzona si hace falta).", "Momento del día — Termina con DAY o NIGHT; reserva DAWN, DUSK o MORNING para cuando la luz exacta sea dramáticamente esencial.", "CONTINUOUS — Úsalo en lugar de la hora cuando la acción fluye sin interrupción desde la escena anterior, sin salto temporal.", "ESTABLISHING — Añádelo para señalar un plano general de ubicación antes de entrar en el lugar.", "Regla de mayúsculas — Escribe todo el slugline en mayúsculas, separando cada elemento con espacio-guion-espacio.", "Una sola línea — Mantén el encabezado en una única línea; nunca metas en él detalles de localización ni descripción.", "Coherencia — Escribe cada localización recurrente de forma idéntica siempre para que el software de guion la rastree correctamente."]
    }
  },
  "Action Lines (tips)": {
    en: {
      introTitle: "What are action lines?",
      intro: ["Action lines (or scene description) describe what the audience sees and hears between dialogue. They are written in the present tense, in clear visual prose, and run the full width of the page."],
      techniques: ["Present tense — Describe everything as it happens now: 'She opens the door,' never 'She opened the door.'", "Concise and visual — Write only what can be seen or heard on screen; cut internal thoughts and literary flourishes.", "Character names in CAPS — Capitalize a character's name the first time they appear, then use normal case afterward.", "Sounds and key props — Put important SOUNDS and crucial PROPS in caps to flag them for the production departments.", "White space — Break description into short paragraphs of one to four lines so the page reads fast and clean.", "No camera directions in spec — Avoid CLOSE ON, PAN, or ANGLE; imply shots through what you choose to describe.", "Active voice — Favor strong verbs and active constructions over passive or 'there is/are' phrasing.", "One image per beat — Let each paragraph carry a single moment so the reader's eye tracks the action clearly."]
    },
    es: {
      introTitle: "¿Qué son las líneas de acción?",
      intro: ["Las líneas de acción (o descripción) relatan lo que el público ve y oye entre los diálogos. Se escriben en presente, en prosa visual y clara, y ocupan todo el ancho de la página."],
      techniques: ["Presente — Describe todo como si ocurriera ahora: «Ella abre la puerta», nunca «Ella abrió la puerta».", "Conciso y visual — Escribe solo lo que puede verse u oírse en pantalla; elimina los pensamientos internos y los adornos literarios.", "Nombres en MAYÚSCULAS — Capitaliza el nombre de un personaje la primera vez que aparece y luego úsalo en formato normal.", "Sonidos y atrezo clave — Pon los SONIDOS importantes y el ATREZO crucial en mayúsculas para señalarlos a los departamentos de producción.", "Espacio en blanco — Divide la descripción en párrafos breves de una a cuatro líneas para que la página se lea rápido y limpia.", "Sin indicaciones de cámara en el spec — Evita CLOSE ON, PAN o ANGLE; sugiere los planos a través de lo que eliges describir.", "Voz activa — Prioriza los verbos fuertes y las construcciones activas frente a la voz pasiva o el «hay/había».", "Una imagen por beat — Deja que cada párrafo contenga un solo momento para que la mirada del lector siga la acción con claridad."]
    }
  },
  "Character & Dialogue (tips)": {
    en: {
      introTitle: "How are character cues and dialogue formatted?",
      intro: ["Dialogue is introduced by a centered character cue in caps, followed by the spoken lines in a narrower indented block. Standard extensions clarify how and from where a line is delivered."],
      techniques: ["Character cue — Center the speaker's name in uppercase directly above their lines, using the same name consistently.", "Dialogue block — Indent dialogue in a column narrower than action, centered under the cue.", "(V.O.) — Add after the name for a voice-over: narration or thought heard but not from a present, speaking source.", "(O.S.) and (O.C.) — Use (O.S.) when a character is off-screen in a scene's space, (O.C.) for off-camera within frame conventions.", "(CONT'D) — Append when the same character speaks again after an action line interrupts their dialogue.", "(MORE) and (CONT'D) — When dialogue breaks across a page, place (MORE) at the bottom and the name with (CONT'D) on the next page.", "Avoid wrylie overuse — Let the dialogue and context carry tone; reserve parentheticals for genuinely unclear delivery.", "Subtext over speeches — Keep speeches short and let characters mean more than they say rather than over-explaining."]
    },
    es: {
      introTitle: "¿Cómo se formatean el nombre del personaje y el diálogo?",
      intro: ["El diálogo se introduce con el nombre del personaje centrado y en mayúsculas, seguido de las líneas habladas en un bloque sangrado más estrecho. Las extensiones estándar aclaran cómo y desde dónde se dice la línea."],
      techniques: ["Nombre del personaje — Centra el nombre del hablante en mayúsculas justo encima de sus líneas, usando siempre el mismo nombre.", "Bloque de diálogo — Sangra el diálogo en una columna más estrecha que la acción, centrada bajo el nombre.", "(V.O.) — Añádelo tras el nombre para una voz en off: narración o pensamiento que se oye pero no proviene de una fuente presente.", "(O.S.) y (O.C.) — Usa (O.S.) cuando el personaje está fuera de plano dentro del espacio de la escena, y (O.C.) para fuera de cámara según convención.", "(CONT'D) — Añádelo cuando el mismo personaje vuelve a hablar tras una línea de acción que interrumpe su diálogo.", "(MORE) y (CONT'D) — Cuando el diálogo se corta entre páginas, pon (MORE) al pie y el nombre con (CONT'D) en la página siguiente.", "Evita abusar de las acotaciones — Deja que el diálogo y el contexto transmitan el tono; reserva los paréntesis para una entonación realmente ambigua.", "Subtexto antes que discursos — Mantén las réplicas breves y deja que los personajes signifiquen más de lo que dicen en vez de explicarlo todo."]
    }
  },
  "Parentheticals (tips)": {
    en: {
      introTitle: "What are parentheticals (wrylies)?",
      intro: ["A parenthetical, or wrylie, is a brief note in parentheses between a character cue and their dialogue that specifies how a line is delivered or to whom. It is used sparingly and only when the intent is not already clear."],
      techniques: ["Brevity — Keep it to a word or short phrase such as (whispering) or (to Sam); never write a full sentence.", "Only when needed — Add a wrylie only when tone, target, or action is genuinely unclear from the dialogue and context.", "Lowercase — Type wrylies in lowercase, even though character cues above them are in caps.", "Placement — Set the parenthetical on its own line directly beneath the character cue, indented within the dialogue column.", "No directing the actor — Avoid telling actors how to emote when the scene already implies it (e.g., redundant (angrily)).", "Mid-dialogue beats — Use a parenthetical like (beat) or (re: the photo) inside a speech to mark a pause or shift in focus.", "Action vs. wrylie — Move physical action that runs more than a few words into an action line rather than a parenthetical.", "Consistency — Apply the same convention throughout so wrylies read as deliberate, not arbitrary."]
    },
    es: {
      introTitle: "¿Qué son las acotaciones (wrylies)?",
      intro: ["Una acotación, o wrylie, es una nota breve entre paréntesis situada entre el nombre del personaje y su diálogo que precisa cómo se dice una línea o a quién se dirige. Se usa con moderación y solo cuando la intención no resulta ya evidente."],
      techniques: ["Brevedad — Limítala a una palabra o frase corta como (susurrando) o (a Sam); nunca escribas una oración completa.", "Solo cuando hace falta — Añade una acotación únicamente cuando el tono, el destinatario o la acción no se deduzcan del diálogo y el contexto.", "Minúsculas — Escribe las acotaciones en minúsculas, aunque el nombre del personaje arriba esté en mayúsculas.", "Ubicación — Coloca la acotación en su propia línea justo debajo del nombre, sangrada dentro de la columna del diálogo.", "No dirigir al actor — Evita indicar al actor cómo emocionarse cuando la escena ya lo implica (p. ej., un redundante (con enfado)).", "Beats dentro del diálogo — Usa una acotación como (beat) o (sobre la foto) dentro de una réplica para marcar una pausa o un cambio de foco.", "Acción frente a acotación — Lleva la acción física de más de unas pocas palabras a una línea de acción, no a un paréntesis.", "Coherencia — Aplica la misma convención en todo el guion para que las acotaciones se lean como deliberadas, no arbitrarias."]
    }
  },
  "Transitions (tips)": {
    en: {
      introTitle: "What are scene transitions?",
      intro: ["Transitions describe how one scene moves into the next, such as a cut or dissolve. In a spec script they are right-aligned, written in caps, and used sparingly because editing choices belong to the director."],
      techniques: ["CUT TO: — The default hard cut between scenes; often omitted in spec scripts since a new slugline already implies it.", "DISSOLVE TO: — Signals a softer blend, typically marking a passage of time or a change in mood.", "SMASH CUT: — An abrupt, jarring cut used for shock or sharp tonal contrast between scenes.", "FADE IN: / FADE OUT. — FADE IN: opens the script flush left; FADE OUT. closes it, usually before THE END.", "MATCH CUT: — Links two scenes through a shared visual shape, motion, or composition for thematic effect.", "Right alignment — Place transitions against the right margin, ending most with a colon (FADE OUT. takes a period).", "Use sparingly — In spec scripts, lean on slugline changes for cuts and reserve named transitions for deliberate effect.", "Uppercase — Type all transitions in capitals to match standard formatting."]
    },
    es: {
      introTitle: "¿Qué son las transiciones de escena?",
      intro: ["Las transiciones describen cómo una escena pasa a la siguiente, como un corte o un fundido. En un spec se alinean a la derecha, se escriben en mayúsculas y se usan con moderación, porque las decisiones de montaje corresponden al director."],
      techniques: ["CUT TO: — El corte directo por defecto entre escenas; suele omitirse en el spec, ya que un nuevo slugline lo implica.", "DISSOLVE TO: — Indica una mezcla más suave, que normalmente marca un paso de tiempo o un cambio de tono.", "SMASH CUT: — Un corte brusco y abrupto usado para el impacto o el fuerte contraste tonal entre escenas.", "FADE IN: / FADE OUT. — FADE IN: abre el guion alineado a la izquierda; FADE OUT. lo cierra, normalmente antes de THE END.", "MATCH CUT: — Enlaza dos escenas mediante una forma, un movimiento o una composición visual compartidos, con efecto temático.", "Alineación a la derecha — Coloca las transiciones contra el margen derecho, terminando la mayoría con dos puntos (FADE OUT. lleva punto).", "Úsalas con moderación — En el spec, apóyate en los cambios de slugline para los cortes y reserva las transiciones nombradas para un efecto deliberado.", "Mayúsculas — Escribe todas las transiciones en mayúsculas conforme al formato estándar."]
    }
  },
  "Montage & Intercut (tips)": {
    en: {
      introTitle: "How are montages and intercuts formatted?",
      intro: ["A montage compresses time or shows a process through a sequence of brief images, while an intercut alternates between two simultaneous locations. Both have established formatting that keeps the rapid cutting clear on the page."],
      techniques: ["MONTAGE header — Introduce with a heading like 'MONTAGE — TRAINING FOR THE FIGHT' to label the sequence.", "Lettered or dashed beats — List each montage image as a short line, often led by a letter (A), B)) or a dash for clarity.", "SERIES OF SHOTS — Use this label for a tighter list of connected shots advancing a single action or idea.", "END MONTAGE — Close a montage explicitly so the reader knows normal scene flow resumes.", "INTERCUT — Use 'INTERCUT — APARTMENT / OFFICE' to alternate between locations without repeating full sluglines each cut.", "Phone calls — Establish both ends of a conversation, then write INTERCUT to flip between speakers fluidly.", "Present tense and brevity — Keep each montage or intercut beat in present tense and as short as a single line.", "Don't overuse — Reserve montages for genuine time compression; a string of full scenes usually serves story better."]
    },
    es: {
      introTitle: "¿Cómo se formatean los montajes y los intercuts?",
      intro: ["Un montaje comprime el tiempo o muestra un proceso mediante una secuencia de imágenes breves, mientras que un intercut alterna entre dos localizaciones simultáneas. Ambos tienen un formato establecido que mantiene claro en la página el corte rápido."],
      techniques: ["Encabezado MONTAGE — Introdúcelo con un título como «MONTAGE — ENTRENAMIENTO PARA EL COMBATE» para etiquetar la secuencia.", "Beats con letra o guion — Enumera cada imagen del montaje como una línea corta, a menudo encabezada por una letra (A), B)) o un guion para mayor claridad.", "SERIES OF SHOTS — Usa esta etiqueta para una lista más compacta de planos conectados que hacen avanzar una sola acción o idea.", "END MONTAGE — Cierra el montaje de forma explícita para que el lector sepa que se reanuda el flujo normal de escenas.", "INTERCUT — Usa «INTERCUT — APARTAMENTO / OFICINA» para alternar entre localizaciones sin repetir el slugline completo en cada corte.", "Llamadas telefónicas — Establece ambos extremos de la conversación y luego escribe INTERCUT para saltar entre interlocutores con fluidez.", "Presente y brevedad — Mantén cada beat de montaje o intercut en presente y tan breve como una sola línea.", "No abuses — Reserva los montajes para una compresión real del tiempo; una serie de escenas completas suele servir mejor a la historia."]
    }
  },
  "Loglines (tips)": {
    en: {
      introTitle: "What is a logline?",
      intro: ["A logline is a single sentence that captures the essence of a story by naming its protagonist, goal, and central obstacle. Written in present tense, it sells the concept and hooks a reader in one breath."],
      techniques: ["One sentence — Distill the whole story into a single, tight sentence; if it needs two, the hook isn't sharp enough.", "Protagonist — Identify the hero by descriptive role, not name (e.g., 'a burned-out detective').", "Goal — State clearly what the protagonist is trying to achieve to give the story direction.", "Obstacle — Name the central conflict or antagonist that stands in the protagonist's way.", "Irony or hook — Add the ironic, surprising, or high-stakes twist that makes the premise compelling.", "Present tense — Write in the present to convey immediacy and active momentum.", "No names — Omit character and place names; use evocative descriptors so the concept reads universally.", "Stakes implied — Suggest what is at risk so the reader feels why the story matters."]
    },
    es: {
      introTitle: "¿Qué es una logline?",
      intro: ["Una logline es una sola frase que captura la esencia de una historia nombrando a su protagonista, su objetivo y su obstáculo central. Escrita en presente, vende el concepto y engancha al lector de un solo aliento."],
      techniques: ["Una sola frase — Destila toda la historia en una única frase compacta; si necesita dos, el gancho no está bastante afinado.", "Protagonista — Identifica al héroe por su rol descriptivo, no por su nombre (p. ej., «un detective quemado»).", "Objetivo — Expresa con claridad qué intenta lograr el protagonista para dar dirección a la historia.", "Obstáculo — Nombra el conflicto central o el antagonista que se interpone en el camino del protagonista.", "Ironía o gancho — Añade el giro irónico, sorprendente o de alto riesgo que hace atractiva la premisa.", "Presente — Escribe en presente para transmitir inmediatez e impulso activo.", "Sin nombres — Omite los nombres de personajes y lugares; usa descriptores evocadores para que el concepto se lea de forma universal.", "Riesgo implícito — Sugiere qué está en juego para que el lector sienta por qué importa la historia."]
    }
  },
  "Treatment & Outline (tips)": {
    en: {
      introTitle: "What are treatments and outlines?",
      intro: ["A treatment is a prose summary of a story told in present tense, while an outline maps its structure as a sequence of beats or steps. Both are development tools used to test and refine the narrative before writing pages."],
      techniques: ["Prose summary — Write a treatment in present-tense narrative prose, conveying the story's events, tone, and arc.", "Treatment length — Keep a treatment anywhere from one to a few pages for a pitch, or longer for a detailed sale document.", "Beat sheet — List the story's major turning points as concise beats to verify structure before scene work.", "Step outline — Break the story into numbered steps, one short entry per scene or sequence, describing what happens.", "Scene cards — Summarize each scene on a single card or line so the sequence can be reordered and stress-tested.", "Purpose over polish — Use these tools to diagnose pacing and causality, not to showcase finished prose.", "Cause and effect — Ensure each beat or step leads logically to the next, exposing gaps before the draft.", "Present tense throughout — Maintain present tense across treatment and outline for a consistent, active read."]
    },
    es: {
      introTitle: "¿Qué son los tratamientos y las escaletas?",
      intro: ["Un tratamiento es un resumen en prosa de una historia contado en presente, mientras que una escaleta traza su estructura como una secuencia de beats o pasos. Ambos son herramientas de desarrollo que sirven para probar y depurar la narrativa antes de escribir páginas."],
      techniques: ["Resumen en prosa — Escribe el tratamiento en prosa narrativa en presente, transmitiendo los eventos, el tono y el arco de la historia.", "Extensión del tratamiento — Mantén el tratamiento entre una y unas pocas páginas para un pitch, o más extenso para un documento de venta detallado.", "Hoja de beats — Enumera los grandes puntos de giro como beats concisos para verificar la estructura antes de trabajar las escenas.", "Escaleta — Divide la historia en pasos numerados, una entrada breve por escena o secuencia, describiendo qué ocurre.", "Tarjetas de escena — Resume cada escena en una sola tarjeta o línea para poder reordenar y poner a prueba la secuencia.", "Función antes que pulido — Usa estas herramientas para diagnosticar el ritmo y la causalidad, no para lucir una prosa acabada.", "Causa y efecto — Asegúrate de que cada beat o paso conduce lógicamente al siguiente, revelando los huecos antes del borrador.", "Presente en todo — Mantén el presente en el tratamiento y la escaleta para una lectura coherente y activa."]
    }
  },

  // ── Revision & self-editing ─────────────────────────────────────────────────
  "The Rewrite Pass (tips)": {
    en: {
      introTitle: "What is the rewrite pass?",
      intro: ["Revision works best in focused passes, each targeting one layer of the story, rather than fixing everything at once.", "Working pass by pass keeps your attention sharp and prevents you from polishing prose you may later cut."],
      techniques: ["Structure pass — Read for the big shape first: act breaks, scene order, escalation, and whether each scene earns its place.", "Plot and logic pass — Track cause and effect, setups and payoffs, timelines, and continuity gaps before going deeper.", "Character pass — Follow one character at a time, checking motivation, consistency, voice, and arc across the whole draft.", "Theme pass — Ensure the central idea surfaces through events and choices, not lectures, and that the ending answers the question the story asks.", "Dialogue pass — Read exchanges aloud for distinct voices, subtext, and rhythm; cut the on-the-nose and the redundant.", "Line pass — Tighten sentences last: word choice, clarity, repetition, and flow, once the structure beneath them is locked.", "One pass, one job — Resist fixing everything you notice; jot other problems in the margin and address them in their own pass.", "Rest between passes — Let the draft cool so you return as a reader, not the author, and see what is actually on the page."]
    },
    es: {
      introTitle: "¿Qué es el pase de reescritura?",
      intro: ["La revisión funciona mejor en pases enfocados, cada uno dirigido a una capa de la historia, en lugar de arreglarlo todo a la vez.", "Trabajar pase por pase mantiene la atención afilada y evita que pulas una prosa que quizá luego elimines."],
      techniques: ["Pase de estructura — Lee primero la forma general: quiebres de acto, orden de escenas, escalada y si cada escena se gana su lugar.", "Pase de trama y lógica — Rastrea la causa y el efecto, los presagios y sus pagos, las líneas temporales y los vacíos de continuidad antes de profundizar.", "Pase de personaje — Sigue a un personaje a la vez, comprobando motivación, coherencia, voz y arco a lo largo de todo el borrador.", "Pase de tema — Asegura que la idea central emerja a través de los hechos y las decisiones, no de los sermones, y que el final responda a la pregunta que plantea la historia.", "Pase de diálogo — Lee los intercambios en voz alta buscando voces distintas, subtexto y ritmo; recorta lo demasiado explícito y lo redundante.", "Pase de línea — Ajusta las frases al final: elección de palabras, claridad, repetición y fluidez, una vez fijada la estructura que las sostiene.", "Un pase, una tarea — Resiste el impulso de arreglar todo lo que notes; anota otros problemas al margen y abórdalos en su propio pase.", "Descansa entre pases — Deja enfriar el borrador para volver como lector, no como autor, y ver lo que realmente hay en la página."]
    }
  },
  "Self-Editing Checklist (tips)": {
    en: {
      introTitle: "What is self-editing?",
      intro: ["Self-editing is the disciplined craft of revising your own draft with a reader's eye, catching the weaknesses you were too close to see while writing.", "A concrete checklist turns vague dissatisfaction into specific, fixable problems."],
      techniques: ["Cut filler and throat-clearing — Delete warm-up sentences, redundant beats, and stage directions the reader already infers.", "Kill filter words — Remove \"saw,\" \"felt,\" \"realized,\" \"noticed,\" and \"thought\" that distance the reader from direct experience.", "Trim adverbs and weak modifiers — Replace \"-ly\" propping and \"very/really/just\" with stronger, more precise verbs and nouns.", "Vary sentence length and rhythm — Mix short and long sentences; a string of equal-length lines flattens pace and energy.", "Check POV consistency — Stay inside your chosen viewpoint; flag head-hopping and details the narrator could not know.", "Prefer the active voice — Convert passive constructions unless the passive is a deliberate choice for emphasis or mystery.", "Hunt repetition — Search for pet words, repeated images, and crutch phrases that dull through overuse.", "Read it aloud — Hear clunky rhythm, tongue-twisters, and unnatural dialogue the eye glides past on the page."]
    },
    es: {
      introTitle: "¿Qué es la autoedición?",
      intro: ["La autoedición es el oficio disciplinado de revisar tu propio borrador con ojo de lector, detectando las debilidades que estabas demasiado cerca para ver al escribir.", "Una lista de comprobación concreta convierte la insatisfacción vaga en problemas específicos y solucionables."],
      techniques: ["Recorta el relleno y los carraspeos — Elimina las frases de calentamiento, los compases redundantes y las acotaciones que el lector ya deduce.", "Elimina los verbos de filtro — Quita \"vio\", \"sintió\", \"se dio cuenta\", \"notó\" y \"pensó\" que distancian al lector de la experiencia directa.", "Reduce los adverbios y modificadores débiles — Sustituye los apoyos en \"-mente\" y los \"muy/realmente/solo\" por verbos y sustantivos más fuertes y precisos.", "Varía la longitud y el ritmo de las frases — Mezcla frases cortas y largas; una hilera de líneas de igual longitud aplana el ritmo y la energía.", "Comprueba la coherencia del punto de vista — Permanece dentro de tu perspectiva elegida; señala los saltos de cabeza y los detalles que el narrador no podría conocer.", "Prefiere la voz activa — Convierte las construcciones pasivas salvo que la pasiva sea una elección deliberada para enfatizar o crear misterio.", "Caza la repetición — Busca palabras recurrentes, imágenes repetidas y muletillas que se embotan por el uso excesivo.", "Léelo en voz alta — Oye el ritmo torpe, los trabalenguas y el diálogo poco natural que el ojo pasa por alto en la página."]
    }
  },
  "Cutting & Tightening (tips)": {
    en: {
      introTitle: "What is cutting and tightening?",
      intro: ["Cutting and tightening removes everything that does not earn its place, so the remaining words carry more weight and the pace stays alive.", "Most first drafts are too long; the prose grows sharper as it grows shorter."],
      techniques: ["Kill your darlings — Cut the clever lines, scenes, and flourishes you love most when they serve your ego rather than the story.", "Enter late, leave early — Start each scene at the latest possible moment and end it before the energy drains away.", "Trim on-the-nose lines — Delete dialogue and narration that state outright what the reader already understands from context.", "Compress scenes — Merge scenes that repeat a function, and summarize transitions the reader can fill in.", "Cut to the conflict — Remove pleasantries, logistics, and travel that delay the moment the scene actually exists for.", "Tighten every sentence — Strip redundant words, hedges, and qualifiers until each line says one thing cleanly.", "Replace, don't just delete — Swap a paragraph of explanation for a single telling image, gesture, or line.", "Test each cut — If the scene still works without a line, beat, or word, it was not pulling its weight."]
    },
    es: {
      introTitle: "¿Qué es recortar y comprimir?",
      intro: ["Recortar y comprimir elimina todo lo que no se gana su lugar, de modo que las palabras restantes pesen más y el ritmo siga vivo.", "La mayoría de los primeros borradores son demasiado largos; la prosa se afila a medida que se acorta."],
      techniques: ["Mata a tus criaturas queridas — Recorta las líneas, escenas y florituras ingeniosas que más amas cuando sirven a tu ego y no a la historia.", "Entra tarde, sal temprano — Comienza cada escena en el momento más tardío posible y termínala antes de que la energía se agote.", "Recorta las líneas demasiado explícitas — Elimina el diálogo y la narración que enuncian sin más lo que el lector ya entiende por el contexto.", "Comprime las escenas — Fusiona las escenas que repiten una función y resume las transiciones que el lector puede rellenar.", "Ve directo al conflicto — Quita las cortesías, la logística y los desplazamientos que retrasan el momento para el que la escena existe.", "Ajusta cada frase — Elimina palabras redundantes, rodeos y matices hasta que cada línea diga una cosa con limpieza.", "Sustituye, no solo borres — Cambia un párrafo de explicación por una sola imagen, gesto o línea reveladora.", "Pon a prueba cada recorte — Si la escena sigue funcionando sin una línea, compás o palabra, no estaba aportando su parte."]
    }
  },
  "Notes & Feedback (tips)": {
    en: {
      introTitle: "How do you work with feedback?",
      intro: ["Feedback is data, not orders: readers reliably tell you where something is wrong, but rarely how to fix it.", "The skill is interpreting reactions to find the real problem and protecting your vision while you do."],
      techniques: ["Find the note behind the note — Treat a proposed solution as a symptom; ask what reaction caused it and solve that root cause.", "Listen for where, not what — Trust readers about where they got bored or confused; distrust their specific prescriptions.", "Use varied beta readers — Gather a few trusted readers who match your audience, and weigh patterns over any single opinion.", "Hold a table read — Hear screenplays and dialogue performed aloud to expose dead lines, pacing drags, and unclear beats.", "Look for the pattern — When several readers flag the same spot, believe it, even if each names a different cause.", "Separate taste from craft — Distinguish notes about objective problems from notes that simply reflect a reader's personal preference.", "Sleep on it before reacting — Let the sting of criticism fade so you can judge each note on its merits, not your defensiveness.", "Know when to ignore a note — Protect the story's core intention; a note that would make it someone else's book can be set aside."]
    },
    es: {
      introTitle: "¿Cómo se trabaja con la retroalimentación?",
      intro: ["La retroalimentación son datos, no órdenes: los lectores te dicen con fiabilidad dónde algo falla, pero rara vez cómo arreglarlo.", "La habilidad está en interpretar las reacciones para hallar el problema real y proteger tu visión mientras lo haces."],
      techniques: ["Encuentra la nota detrás de la nota — Trata una solución propuesta como un síntoma; pregunta qué reacción la causó y resuelve esa raíz.", "Escucha el dónde, no el qué — Confía en los lectores sobre dónde se aburrieron o confundieron; desconfía de sus recetas concretas.", "Usa lectores beta variados — Reúne a unos pocos lectores de confianza que encajen con tu público y valora los patrones por encima de cualquier opinión aislada.", "Haz una lectura de mesa — Escucha guiones y diálogos interpretados en voz alta para revelar líneas muertas, baches de ritmo y compases poco claros.", "Busca el patrón — Cuando varios lectores señalan el mismo punto, créelo, aunque cada uno nombre una causa distinta.", "Separa el gusto del oficio — Distingue las notas sobre problemas objetivos de las que solo reflejan la preferencia personal de un lector.", "Consúltalo con la almohada antes de reaccionar — Deja que el escozor de la crítica se desvanezca para juzgar cada nota por sus méritos, no por tu actitud defensiva.", "Sabe cuándo ignorar una nota — Protege la intención central de la historia; una nota que la convertiría en el libro de otro puede dejarse de lado."]
    }
  }
};

// ─── Pitfalls-shaped content ─────────────────────────────────────────────────

export const EXTRA_PITFALLS_DATA = {
  "Revision Pitfalls": {
    en: { title: "Revision Pitfalls", items: ["Polishing prose before fixing structure", "Endless tinkering without ever finishing", "Editing out the original voice", "Over-explaining after notes", "Applying every note literally", "Revising while still drafting"] },
    es: { title: "Errores de Revisión", items: ["Pulir la prosa antes de arreglar la estructura", "Retoques sin fin sin terminar nunca", "Editar hasta borrar la voz original", "Sobreexplicar tras recibir notas", "Aplicar cada nota al pie de la letra", "Revisar mientras aún se escribe el borrador"] }
  }
};

// ─── Structure framework configs (English, consumed by renderStructureDetail) ─

// ─── Label + UI string additions ─────────────────────────────────────────────

export const EXTRA_LABELS = {
  en: {
    // Theme & premise
    "Theme vs Premise": "Theme vs Premise",
    "Controlling Idea": "Controlling Idea",
    "Thematic Argument": "Thematic Argument",
    "Motif & Symbol": "Motif & Symbol",
    "Theme Through Character": "Theme Through Character",
    // Character engines
    "Want vs Need": "Want vs Need",
    "Wound & Ghost": "Wound & Ghost",
    "The Lie & The Truth": "The Lie & The Truth",
    "Fatal Flaw": "Fatal Flaw",
    "Antagonist Design": "Antagonist Design",
    "Character Web": "Character Web",
    // Dialogue craft
    "Subtext": "Subtext",
    "On-the-Nose Dialogue": "On-the-Nose Dialogue",
    "Voice Differentiation": "Voice Differentiation",
    "The Scene Turn": "The Scene Turn",
    "Exposition in Dialogue": "Exposition in Dialogue",
    "Action Beats & Silence": "Action Beats & Silence",
    // Genre
    "Genre & Conventions": "Genre & Conventions",
    "Monster in the House": "Monster in the House",
    "Golden Fleece": "Golden Fleece",
    "Dude with a Problem": "Dude with a Problem",
    "Rites of Passage": "Rites of Passage",
    "Buddy Love": "Buddy Love",
    "Whydunit": "Whydunit (the detective changes)",
    "Out of the Bottle": "Out of the Bottle",
    "The Fool Triumphant": "The Fool Triumphant",
    "Institutionalized": "Institutionalized",
    "Superhero": "Superhero",
    // Screenwriting format & documents
    "Scene Headings (tips)": "Scene Headings",
    "Action Lines (tips)": "Action Lines",
    "Character & Dialogue (tips)": "Character & Dialogue",
    "Parentheticals (tips)": "Parentheticals",
    "Transitions (tips)": "Transitions",
    "Montage & Intercut (tips)": "Montage & Intercut",
    "Loglines (tips)": "Loglines",
    "Treatment & Outline (tips)": "Treatment & Outline",
    // Revision
    "The Rewrite Pass (tips)": "The Rewrite Pass",
    "Self-Editing Checklist (tips)": "Self-Editing Checklist",
    "Cutting & Tightening (tips)": "Cutting & Tightening",
    "Notes & Feedback (tips)": "Notes & Feedback",
    "Revision Pitfalls": "Revision Pitfalls",
    // Structure frameworks
    "Eight-Sequence Structure": "Eight-Sequence Structure",
    "Syd Field Paradigm": "Syd Field Paradigm",
    "Truby 22 Steps": "Truby's 22 Steps",
    "TV Series Structure": "TV Series Structure"
  },
  es: {
    // Theme & premise
    "Theme vs Premise": "Tema vs Premisa",
    "Controlling Idea": "Idea de Control",
    "Thematic Argument": "Argumento Temático",
    "Motif & Symbol": "Motivo y Símbolo",
    "Theme Through Character": "Tema a Través del Personaje",
    // Character engines
    "Want vs Need": "Deseo vs Necesidad",
    "Wound & Ghost": "Herida y Fantasma",
    "The Lie & The Truth": "La Mentira y La Verdad",
    "Fatal Flaw": "Defecto Fatal",
    "Antagonist Design": "Diseño del Antagonista",
    "Character Web": "Red de Personajes",
    // Dialogue craft
    "Subtext": "Subtexto",
    "On-the-Nose Dialogue": "Diálogo obvio",
    "Voice Differentiation": "Diferenciación de voces",
    "The Scene Turn": "El giro de escena",
    "Exposition in Dialogue": "Exposición en el diálogo",
    "Action Beats & Silence": "Beats de acción y silencio",
    // Genre
    "Genre & Conventions": "Género y convenciones",
    "Monster in the House": "El Monstruo en Casa",
    "Golden Fleece": "El Vellocino de Oro",
    "Dude with a Problem": "Un Tipo con un Problema",
    "Rites of Passage": "Ritos de Paso",
    "Buddy Love": "Amor de Compañeros",
    "Whydunit": "El Porqué del Crimen (whydunit)",
    "Out of the Bottle": "La magia embotellada",
    "The Fool Triumphant": "El triunfo del tonto",
    "Institutionalized": "Institucionalizado",
    "Superhero": "Superhéroe",
    // Screenwriting format & documents
    "Scene Headings (tips)": "Encabezados de escena",
    "Action Lines (tips)": "Líneas de acción",
    "Character & Dialogue (tips)": "Personaje y diálogo",
    "Parentheticals (tips)": "Acotaciones",
    "Transitions (tips)": "Transiciones",
    "Montage & Intercut (tips)": "Montaje e intercut",
    "Loglines (tips)": "Loglines",
    "Treatment & Outline (tips)": "Tratamiento y escaleta",
    // Revision
    "The Rewrite Pass (tips)": "El pase de reescritura",
    "Self-Editing Checklist (tips)": "Lista de autoedición",
    "Cutting & Tightening (tips)": "Recortar y comprimir",
    "Notes & Feedback (tips)": "Notas y retroalimentación",
    "Revision Pitfalls": "Errores de revisión",
    // Structure frameworks
    "Eight-Sequence Structure": "Estructura de Ocho Secuencias",
    "Syd Field Paradigm": "Paradigma de Syd Field",
    "Truby 22 Steps": "Los 22 Pasos de Truby",
    "TV Series Structure": "Estructura de Serie de TV"
  }
};

// ─── Sources / further reading (language-neutral citations) ──────────────────

export const RESOURCE_SOURCES = {
  // Theme & premise
  "Theme vs Premise": ["Lajos Egri — The Art of Dramatic Writing", "John Truby — The Anatomy of Story"],
  "Controlling Idea": ["Robert McKee — Story (1997)"],
  "Thematic Argument": ["John Truby — The Anatomy of Story", "Robert McKee — Story"],
  "Motif & Symbol": ["M. H. Abrams — A Glossary of Literary Terms"],
  "Theme Through Character": ["Lajos Egri — The Art of Dramatic Writing"],
  // Character engines
  "Want vs Need": ["John Truby — The Anatomy of Story", "K. M. Weiland — Creating Character Arcs"],
  "Wound & Ghost": ["John Truby — The Anatomy of Story", "K. M. Weiland — Creating Character Arcs"],
  "The Lie & The Truth": ["K. M. Weiland — Creating Character Arcs"],
  "Fatal Flaw": ["Aristotle — Poetics (hamartia)"],
  "Antagonist Design": ["John Truby — The Anatomy of Story"],
  "Character Web": ["John Truby — The Anatomy of Story"],
  // Dialogue craft
  "Subtext": ["Robert McKee — Dialogue (2016)", "Robert McKee — Story"],
  "On-the-Nose Dialogue": ["Robert McKee — Dialogue"],
  "The Scene Turn": ["Robert McKee — Story (scene design)"],
  "Exposition in Dialogue": ["Robert McKee — Dialogue"],
  "Voice Differentiation": ["Robert McKee — Dialogue (2016)"],
  "Action Beats & Silence": ["David Mamet — On Directing Film", "Harold Pinter (the dramatic pause)"],
  // Genre
  "Genre & Conventions": ["Blake Snyder — Save the Cat!", "Shawn Coyne — The Story Grid"],
  "Monster in the House": ["Blake Snyder — Save the Cat!"],
  "Golden Fleece": ["Blake Snyder — Save the Cat!"],
  "Dude with a Problem": ["Blake Snyder — Save the Cat!"],
  "Rites of Passage": ["Blake Snyder — Save the Cat!"],
  "Buddy Love": ["Blake Snyder — Save the Cat!"],
  "Whydunit": ["Blake Snyder — Save the Cat!"],
  "Out of the Bottle": ["Blake Snyder — Save the Cat!"],
  "The Fool Triumphant": ["Blake Snyder — Save the Cat!"],
  "Institutionalized": ["Blake Snyder — Save the Cat!"],
  "Superhero": ["Blake Snyder — Save the Cat!"],
  // Screenwriting format & documents
  "Scene Headings (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Action Lines (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Character & Dialogue (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Parentheticals (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Transitions (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Montage & Intercut (tips)": ["Christopher Riley — The Hollywood Standard"],
  "Loglines (tips)": ["Blake Snyder — Save the Cat!", "Christopher Lockhart — The Inside Pitch"],
  "Treatment & Outline (tips)": ["Syd Field — Screenplay"],
  // Structure frameworks
  "The Hero's Journey": ["Joseph Campbell — The Hero with a Thousand Faces", "Christopher Vogler — The Writer's Journey"],
  "Freytag's Pyramid": ["Gustav Freytag — Die Technik des Dramas (1863)"],
  "Dan Harmon Story Circle": ["Dan Harmon — Story Structure 101 (Channel 101)", "Adapted from Joseph Campbell"],
  "Three Act Structure": ["Aristotle — Poetics", "Syd Field — Screenplay"],
  "Fichtean Curve": ["Named for Johann Gottlieb Fichte", "John Gardner — The Art of Fiction"],
  "Kishōtenketsu": ["Classical East Asian form (qǐ-chéng-zhuǎn-hé / ki-shō-ten-ketsu)"],
  "Save the Cat": ["Blake Snyder — Save the Cat! (2005)"],
  "Seven Point Structure": ["Dan Wells — 7-Point Story Structure", "Adapted from Lester Dent's Master Fiction Plot"],
  "Pulp Formula": ["Lester Dent — Master Fiction Plot Formula"],
  "McKee Story paradigm": ["Robert McKee — Story (1997)"],
  "Into the Woods structure": ["John Yorke — Into the Woods (2013)"],
  "Frame Narrative": ["Gérard Genette — Narrative Discourse", "e.g. The Decameron; One Thousand and One Nights"],
  "Nonlinear Structure": ["Gérard Genette — Narrative Discourse (anachrony)"],
  "Rashomon Structure": ["Ryūnosuke Akutagawa — In a Grove", "Akira Kurosawa — Rashomon (1950)"],
  "In Medias Res": ["Horace — Ars Poetica"],
  "Eight-Sequence Structure": ["Paul Joseph Gulino — Screenwriting: The Sequence Approach", "Frank Daniel"],
  "Syd Field Paradigm": ["Syd Field — Screenplay (1979)"],
  "Truby 22 Steps": ["John Truby — The Anatomy of Story"],
  "TV Series Structure": ["Pamela Douglas — Writing the TV Drama Series", "Jeffrey Davis — TV Writing"],
  // Named narrative devices
  "Chekhov's Gun": ["Anton Chekhov (the principle of narrative economy)"],
  "Deus Ex Machina": ["Aristotle — Poetics (named and criticized)"],
  "Eucatastrophe": ["J.R.R. Tolkien — On Fairy-Stories"],
  // Revision
  "The Rewrite Pass (tips)": ["Renni Browne & Dave King — Self-Editing for Fiction Writers"],
  "Self-Editing Checklist (tips)": ["Renni Browne & Dave King — Self-Editing for Fiction Writers", "William Zinsser — On Writing Well"],
  "Cutting & Tightening (tips)": ["Stephen King — On Writing", "Strunk & White — The Elements of Style"],
  "Notes & Feedback (tips)": ["Anne Lamott — Bird by Bird"]
};

// ─── Related resources (cross-links, keyed by display title) ─────────────────

export const RESOURCE_RELATED = {
  // Theme & premise
  "Theme vs Premise": ["Controlling Idea", "Thematic Argument", "Theme Through Character"],
  "Controlling Idea": ["Theme vs Premise", "Thematic Argument", "McKee Story paradigm"],
  "Thematic Argument": ["Controlling Idea", "The Lie & The Truth", "Character Web"],
  "Motif & Symbol": ["Theme vs Premise", "“Show, Don’t Tell”"],
  "Theme Through Character": ["Antagonist Design", "Thematic Argument", "Controlling Idea"],
  // Character engines
  "Want vs Need": ["Wound & Ghost", "The Lie & The Truth", "Moral Transformation"],
  "Wound & Ghost": ["Want vs Need", "The Lie & The Truth", "Fatal Flaw"],
  "The Lie & The Truth": ["Want vs Need", "Wound & Ghost", "Thematic Argument"],
  "Fatal Flaw": ["Wound & Ghost", "Moral Descent", "The Shadow"],
  "Antagonist Design": ["Character Web", "The Shadow", "Theme Through Character"],
  "Character Web": ["Antagonist Design", "Theme Through Character", "Thematic Argument"],
  // Dialogue craft
  "Subtext": ["On-the-Nose Dialogue", "Action Beats & Silence", "“Show, Don’t Tell”"],
  "On-the-Nose Dialogue": ["Subtext", "Exposition in Dialogue", "Writing-Level Pitfalls"],
  "Voice Differentiation": ["Subtext", "Dialogue (tips)"],
  "The Scene Turn": ["McKee Story paradigm", "Action Beats & Silence"],
  "Exposition in Dialogue": ["On-the-Nose Dialogue", "Exposition (tips)"],
  "Action Beats & Silence": ["Subtext", "The Scene Turn"],
  // Genre
  "Genre & Conventions": ["Save the Cat", "Monster in the House", "Golden Fleece"],
  "Monster in the House": ["Genre & Conventions", "Whydunit"],
  "Golden Fleece": ["The Hero's Journey", "Genre & Conventions"],
  "Dude with a Problem": ["Superhero", "Genre & Conventions"],
  "Rites of Passage": ["Moral Transformation", "Genre & Conventions"],
  "Buddy Love": ["Want vs Need", "Genre & Conventions"],
  "Whydunit": ["Monster in the House", "Genre & Conventions"],
  "Out of the Bottle": ["The Fool Triumphant", "Genre & Conventions"],
  "The Fool Triumphant": ["Out of the Bottle", "Genre & Conventions"],
  "Institutionalized": ["Buddy Love", "Genre & Conventions"],
  "Superhero": ["Dude with a Problem", "Genre & Conventions"],
  // Screenwriting
  "Character & Dialogue (tips)": ["Subtext", "Parentheticals (tips)"],
  "Loglines (tips)": ["Treatment & Outline (tips)", "Genre & Conventions"],
  "Treatment & Outline (tips)": ["Loglines (tips)", "Eight-Sequence Structure"],
  // Structure frameworks
  "Eight-Sequence Structure": ["Three Act Structure", "Syd Field Paradigm", "Save the Cat"],
  "Syd Field Paradigm": ["Three Act Structure", "Eight-Sequence Structure"],
  "Truby 22 Steps": ["The Hero's Journey", "Character Web", "Want vs Need"],
  "TV Series Structure": ["Save the Cat", "Seven Point Structure"],
  // Revision
  "The Rewrite Pass (tips)": ["Self-Editing Checklist (tips)", "Cutting & Tightening (tips)", "Revision Pitfalls"],
  "Self-Editing Checklist (tips)": ["The Rewrite Pass (tips)", "Cutting & Tightening (tips)"],
  "Cutting & Tightening (tips)": ["Self-Editing Checklist (tips)", "The Scene Turn"],
  "Notes & Feedback (tips)": ["The Rewrite Pass (tips)", "Revision Pitfalls"],
  // A few links from existing classics into the new material
  "Save the Cat": ["Genre & Conventions", "TV Series Structure"],
  "The Hero's Journey": ["Truby 22 Steps", "Golden Fleece"],
  "McKee Story paradigm": ["Controlling Idea", "The Scene Turn"]
};

// ─── Diagnostic entry: common writing problems → the cards that help ─────────

export const DIAGNOSE_PROBLEMS = [
  { id: "saggy-middle", icon: "trending-down", label: { en: "My second act sags", es: "Mi segundo acto se cae" },
    cards: ["Save the Cat", "Eight-Sequence Structure", "Fichtean Curve", "Three Act Structure"] },
  { id: "passive-hero", icon: "user-x", label: { en: "My protagonist is passive", es: "Mi protagonista es pasivo" },
    cards: ["Want vs Need", "Fatal Flaw", "Character Web"] },
  { id: "on-the-nose", icon: "megaphone", label: { en: "My dialogue is on-the-nose", es: "Mi diálogo es demasiado obvio" },
    cards: ["Subtext", "On-the-Nose Dialogue", "Exposition in Dialogue"] },
  { id: "weak-villain", icon: "swords", label: { en: "My villain is weak", es: "Mi villano es flojo" },
    cards: ["Antagonist Design", "Character Web", "Theme Through Character"] },
  { id: "unclear-theme", icon: "compass", label: { en: "I don't know what it's about", es: "No sé de qué trata" },
    cards: ["Theme vs Premise", "Controlling Idea", "Thematic Argument"] },
  { id: "info-dump", icon: "info", label: { en: "I'm info-dumping", es: "Estoy volcando información" },
    cards: ["Exposition in Dialogue", "Scene vs Summary", "Worldbuilding & Setting"] },
  { id: "flat-character", icon: "minus", label: { en: "My character doesn't change", es: "Mi personaje no cambia" },
    cards: ["Want vs Need", "The Lie & The Truth", "Wound & Ghost", "Moral Transformation"] },
  { id: "low-tension", icon: "activity", label: { en: "There are no stakes", es: "No hay nada en juego" },
    cards: ["Fichtean Curve", "The Scene Turn", "Thriller"] },
  { id: "slow-open", icon: "play", label: { en: "My opening is slow", es: "Mi apertura es lenta" },
    cards: ["In Medias Res", "Loglines (tips)", "Pulp Formula"] },
  { id: "scene-nowhere", icon: "refresh-ccw-dot", label: { en: "This scene goes nowhere", es: "Esta escena no avanza" },
    cards: ["The Scene Turn", "Scene vs Summary"] },
  { id: "revise", icon: "repeat", label: { en: "My draft is a mess", es: "Mi borrador es un caos" },
    cards: ["The Rewrite Pass (tips)", "Self-Editing Checklist (tips)", "Cutting & Tightening (tips)"] },
  { id: "purple-prose", icon: "scissors", label: { en: "My prose is overwritten", es: "Mi prosa está recargada" },
    cards: ["Prose Rhythm & Sentence Variety", "Showing & Telling Balance", "Cutting & Tightening (tips)"] },
  { id: "genre-beats", icon: "library-big", label: { en: "I don't know my genre's beats", es: "No conozco los beats de mi género" },
    cards: ["Genre & Conventions", "Save the Cat"] }
];

export const EXTRA_UI = {
  en: {
    // Hub category titles
    storyResources: "Story & theme",
    craftResources: "Craft",
    storyIntro: "What a story is about and the shapes it can take: theme and premise, genre conventions, and the techniques that control how a story unfolds.",
    craftIntro: "The line-by-line craft of telling it well — dialogue, prose, screenplay format, and revision.",
    // Legacy / sub-category titles
    themeResources: "Theme & premise",
    genreResources: "Genre",
    screenwritingResources: "Screenwriting",
    dialogueResources: "Dialogue",
    // Section labels
    characterEngines: "Character engines",
    screenSequence: "Screen & sequence",
    themeArchitecture: "Theme & meaning",
    genreSystem: "Story types (Save the Cat)",
    genreConventional: "Genres",
    proseCraft: "Prose craft",
    screenwritingFormat: "Screenplay format",
    screenwritingDocs: "Story documents",
    dialogueCraft: "Dialogue craft",
    revisionEditing: "Revision & editing",
    // Medium badges
    mediumProse: "Prose",
    mediumScreen: "Screen",
    mediumBoth: "Both",
    // Section heading defaults (localized fallbacks for the generic renderers)
    steps: "Steps",
    whyThisWorks: "Why this works",
    commonRisks: "Common risks",
    writingTipsHeading: "Writing tips",
    whyArchetype: "Why this archetype works",
    commonInternalConflicts: "Common internal conflicts",
    // Misc
    themeIntro: "Theme is what a story is really about; premise is the argument it makes. These tools turn an abstract idea into a structural force the whole story can prove.",
    genreIntro: "Genre is a promise to the audience. Each story-type carries its own conventions and obligatory scenes — know which beats are non-negotiable before you break them.",
    screenwritingIntro: "Industry-standard screenplay format and the development documents that come before pages.",
    dialogueIntro: "Dialogue carries character, conflict, and subtext. These are the deeper craft tools beyond sentence-level tips.",
    searchPlaceholder: "Search resources…",
    searchNoResults: "No resources match your search.",
    sourcesHeading: "Sources & further reading",
    relatedHeading: "Related",
    affiliationDisclaimer: "Folio is an independent project and is not affiliated with, authorized by, or endorsed by the authors, works, or trademark holders referenced here. Frameworks and techniques are summarized in our own words for educational reference; names such as “Save the Cat!” and “Final Draft” are trademarks of their respective owners. Film, TV, and book titles are cited only as examples of the concepts discussed.",
    // Reference → action
    insertBeatSheet: "Insert as beats",
    createCharacterSheet: "Create character sheet",
    beatsAdded: "beats added to the beat board",
    noProjectForBeats: "Open a project first to add beats.",
    beatsUnavailable: "No beats could be created from this framework.",
    beatsFailed: "Could not add beats. See console for details.",
    noProjectForSheet: "Open a project first to create a character sheet.",
    sheetCreated: "Character sheet created",
    sheetFailed: "Could not create the character sheet. See console for details.",
    insertTemplate: "Insert as note",
    templateCreated: "Craft note created",
    templateFailed: "Could not create the note. See console for details.",
    noProjectForTemplate: "Open a project first to create a note.",
    comingSoon: "Content coming soon.",
    diagnoseTitle: "I'm stuck on…",
    diagnoseHint: "Pick a problem — jump straight to the cards that help.",
    diagnoseFixes: "What helps",
    revealSpoiler: "Click to reveal (spoiler)"
  },
  es: {
    storyResources: "Historia y tema",
    craftResources: "Oficio",
    storyIntro: "De qué trata una historia y qué formas puede adoptar: tema y premisa, convenciones de género y las técnicas que controlan cómo se despliega el relato.",
    craftIntro: "El oficio línea a línea de contarlo bien: diálogo, prosa, formato de guion y revisión.",
    themeResources: "Tema y premisa",
    genreResources: "Género",
    screenwritingResources: "Guion",
    dialogueResources: "Diálogo",
    characterEngines: "Motor del personaje",
    screenSequence: "Pantalla y secuencia",
    themeArchitecture: "Tema y significado",
    genreSystem: "Tipos de historia (Save the Cat)",
    genreConventional: "Géneros",
    proseCraft: "Oficio de prosa",
    screenwritingFormat: "Formato de guion",
    screenwritingDocs: "Documentos de la historia",
    dialogueCraft: "Oficio del diálogo",
    revisionEditing: "Revisión y edición",
    mediumProse: "Prosa",
    mediumScreen: "Guion",
    mediumBoth: "Ambos",
    steps: "Pasos",
    whyThisWorks: "Por qué funciona",
    commonRisks: "Riesgos frecuentes",
    writingTipsHeading: "Consejos de escritura",
    whyArchetype: "Por qué funciona este arquetipo",
    commonInternalConflicts: "Conflictos internos frecuentes",
    themeIntro: "El tema es de qué trata realmente una historia; la premisa es el argumento que sostiene. Estas herramientas convierten una idea abstracta en una fuerza estructural que toda la historia puede demostrar.",
    genreIntro: "El género es una promesa al público. Cada tipo de historia trae sus convenciones y escenas obligatorias: conoce qué momentos son innegociables antes de romperlos.",
    screenwritingIntro: "Formato de guion estándar de la industria y los documentos de desarrollo previos a las páginas.",
    dialogueIntro: "El diálogo porta personaje, conflicto y subtexto. Estas son las herramientas de oficio más profundas, más allá de los consejos a nivel de frase.",
    searchPlaceholder: "Buscar recursos…",
    searchNoResults: "Ningún recurso coincide con tu búsqueda.",
    sourcesHeading: "Fuentes y lecturas",
    relatedHeading: "Relacionado",
    affiliationDisclaimer: "Folio es un proyecto independiente y no está afiliado, autorizado ni respaldado por los autores, obras o titulares de marcas aquí mencionados. Los marcos y técnicas se resumen con nuestras propias palabras como referencia educativa; nombres como «Save the Cat!» y «Final Draft» son marcas de sus respectivos propietarios. Los títulos de cine, televisión y libros se citan solo como ejemplos de los conceptos tratados.",
    // Referencia → acción
    insertBeatSheet: "Insertar como beats",
    createCharacterSheet: "Crear ficha de personaje",
    beatsAdded: "beats añadidos al beat board",
    noProjectForBeats: "Abre un proyecto primero para añadir beats.",
    beatsUnavailable: "No se han podido crear beats a partir de este marco.",
    beatsFailed: "No se pudieron añadir los beats. Revisa la consola.",
    noProjectForSheet: "Abre un proyecto primero para crear una ficha.",
    sheetCreated: "Ficha de personaje creada",
    sheetFailed: "No se pudo crear la ficha. Revisa la consola.",
    insertTemplate: "Insertar como nota",
    templateCreated: "Nota de oficio creada",
    templateFailed: "No se pudo crear la nota. Revisa la consola.",
    noProjectForTemplate: "Abre un proyecto primero para crear una nota.",
    comingSoon: "Contenido próximamente.",
    diagnoseTitle: "Estoy atascado en…",
    diagnoseHint: "Elige un problema y salta directo a las fichas que ayudan.",
    diagnoseFixes: "Qué ayuda",
    revealSpoiler: "Pulsa para revelar (spoiler)"
  }
};
