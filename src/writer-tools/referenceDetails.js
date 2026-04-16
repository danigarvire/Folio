/**
 * Reference detail render functions for Writer Tools.
 * Generic renderers consume bilingual data objects from resourcesI18n.js.
 * Extracted from WriterToolsView to keep that class focused on navigation/state.
 */

import { setIcon } from 'obsidian';
import { getArchetypeData, UI_I18N } from './resourcesI18n.js';

// ─── Shared helpers ──────────────────────────────────────────────────────────

export function createResourceSubheading(parent, iconName, text) {
  const heading = parent.createDiv({ cls: "resource-detail-subheading-row" });
  const icon = heading.createSpan({ cls: "resource-detail-subheading-icon" });
  setIcon(icon, iconName);
  heading.createSpan({ cls: "resource-detail-subheading", text });
}

// ─── Generic archetype renderer ──────────────────────────────────────────────

/**
 * Renders a Campbell or Jung archetype detail panel from a bilingual data object.
 * @param {HTMLElement} container
 * @param {string} archetypeKey - key in ARCHETYPE_DATA
 * @param {string} lang - 'en' | 'es'
 */
export function renderArchetypeDetail(container, archetypeKey, lang = 'en') {
  const data = getArchetypeData(archetypeKey, lang);
  if (!data) {
    container.createDiv({ cls: "resource-detail-placeholder", text: "Content coming soon." });
    return;
  }

  const content = container.createDiv({ cls: "resource-detail-content" });

  // Intro zone
  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", data.introQuestion);
  data.intro.forEach(p => introZone.createDiv({ cls: "resource-detail-paragraph", text: p }));

  // Traits zone
  if (data.traits?.length) {
    const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(traitsZone, "heart", data.traitsHeading || UI_I18N[lang]?.coreTraits || "Core traits");
    const list = traitsZone.createEl("ul", { cls: "resource-detail-list" });
    data.traits.forEach(item => list.createEl("li", { text: item }));
    if (data.traitsNote) {
      traitsZone.createDiv({ cls: "resource-detail-paragraph", text: data.traitsNote });
    }
  }

  // Narrative function zone
  if (data.functions?.length) {
    const funcZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(funcZone, "chart-spline", data.functionHeading || UI_I18N[lang]?.narrativeFunction || "Narrative function");
    if (data.functionIntro) {
      funcZone.createDiv({ cls: "resource-detail-paragraph", text: data.functionIntro });
    }
    const list = funcZone.createEl("ul", { cls: "resource-detail-list" });
    data.functions.forEach(item => list.createEl("li", { text: item }));
    if (data.functionNote) {
      funcZone.createDiv({ cls: "resource-detail-paragraph", text: data.functionNote });
    }
  }

  // Key relationships zone (Campbell archetypes)
  if (data.relationships?.length) {
    const relZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(relZone, "flask-conical", data.relationshipsHeading || UI_I18N[lang]?.keyRelationships || "Key relationships");
    const list = relZone.createEl("ul", { cls: "resource-detail-list" });
    data.relationships.forEach(item => list.createEl("li", { text: item }));
  }

  // Writing tips zone (Campbell archetypes)
  if (data.writing?.length) {
    const writeZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(writeZone, "square-pen", data.writingHeading || "Writing tips");
    const list = writeZone.createEl("ul", { cls: "resource-detail-list" });
    data.writing.forEach(item => list.createEl("li", { text: item }));
  }

  // Why this works zone (Hero only)
  if (data.why) {
    const whyZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(whyZone, "chart-spline", data.whyHeading || "Why this archetype works");
    whyZone.createDiv({ cls: "resource-detail-paragraph", text: data.why });
  }

  // Inner conflict zone (Jung archetypes)
  if (data.innerConflicts?.length) {
    const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(conflictZone, "alert-triangle", data.innerConflictHeading || UI_I18N[lang]?.innerConflict || "Inner conflict");
    const list = conflictZone.createEl("ul", { cls: "resource-detail-list" });
    data.innerConflicts.forEach(item => list.createEl("li", { text: item }));
  }

  // Examples zone
  if (data.examples?.length) {
    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(examplesIcon, "bookmark");
    examplesHeader.createSpan({ cls: "resource-detail-subheading", text: data.examplesHeading });
    const grid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    data.examples.forEach(example => {
      const card = grid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }
}

// ─── Generic character arc renderer ─────────────────────────────────────────

/**
 * Renders a character arc detail panel from a bilingual data object.
 * @param {HTMLElement} container
 * @param {string} arcKey - key in ARCHETYPE_DATA (moralAscent, moralDescent, etc.)
 * @param {string} lang
 */
export function renderCharacterArcDetail(container, arcKey, lang = 'en') {
  const data = getArchetypeData(arcKey, lang);
  if (!data) {
    container.createDiv({ cls: "resource-detail-placeholder", text: "Content coming soon." });
    return;
  }

  const content = container.createDiv({ cls: "resource-detail-content" });

  // Intro
  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", data.introQuestion);
  data.intro.forEach(p => introZone.createDiv({ cls: "resource-detail-paragraph", text: p }));

  // Core characteristics
  if (data.characteristics?.length) {
    const charZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(charZone, "heart", data.characteristicsHeading || UI_I18N[lang]?.coreCharacteristics || "Core characteristics");
    const list = charZone.createEl("ul", { cls: "resource-detail-list" });
    data.characteristics.forEach(item => list.createEl("li", { text: item }));
    if (data.characteristicsNote) {
      charZone.createDiv({ cls: "resource-detail-paragraph", text: data.characteristicsNote });
    }
  }

  // Narrative function
  if (data.functions?.length) {
    const funcZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(funcZone, "chart-spline", data.functionHeading || UI_I18N[lang]?.narrativeFunction || "Narrative function");
    const list = funcZone.createEl("ul", { cls: "resource-detail-list" });
    data.functions.forEach(item => list.createEl("li", { text: item }));
    if (data.functionNote) {
      funcZone.createDiv({ cls: "resource-detail-paragraph", text: data.functionNote });
    }
  }

  // Internal conflicts
  if (data.conflicts?.length) {
    const confZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(confZone, "alert-triangle", data.conflictsHeading || "Common internal conflicts");
    const list = confZone.createEl("ul", { cls: "resource-detail-list" });
    data.conflicts.forEach(item => list.createEl("li", { text: item }));
  }

  // Examples
  if (data.examples?.length) {
    const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
    const header = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
    const icon = header.createSpan({ cls: "resource-detail-examples-icon" });
    setIcon(icon, "bookmark");
    header.createSpan({ cls: "resource-detail-subheading", text: data.examplesHeading });
    const grid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
    data.examples.forEach(example => {
      const card = grid.createDiv({ cls: "resource-detail-example-card" });
      card.createSpan({ text: example });
    });
  }
}

// ─── Technique renderer (data-driven, bilingual via caller) ──────────────────

export function renderTechniqueDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach(p => introZone.createDiv({ cls: "resource-detail-paragraph", text: p }));

  const coreZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(coreZone, "heart", config.coreHeading || "Core characteristics");
  const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
  config.core.forEach(item => coreList.createEl("li", { text: item }));
  if (config.coreNote) {
    coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
  }

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", config.functionHeading || "Narrative function");
  const functionList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  config.narrativeFunction.forEach(item => functionList.createEl("li", { text: item }));
  if (config.narrativeNote) {
    functionZone.createDiv({ cls: "resource-detail-paragraph", text: config.narrativeNote });
  }

  const risksZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(risksZone, "alert-triangle", config.risksTitle || "Common risks");
  const risksList = risksZone.createEl("ul", { cls: "resource-detail-list" });
  config.risks.forEach(item => risksList.createEl("li", { text: item }));

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "bookmark");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });
  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  config.examples.forEach(example => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

// ─── Structure renderer (data-driven, bilingual via caller) ──────────────────

export function renderCalloutItem(container, item) {
  const cleanText = typeof item === "string" ? item.replace(/^\d+\.\s*/, "") : "";
  const parts = cleanText ? cleanText.split(" — ") : [];
  const title = typeof item === "string" ? parts[0]?.trim() : item?.title?.trim();
  const body = typeof item === "string" ? parts.slice(1).join(" — ").trim() : item?.body?.trim();
  const stepIconMap = {
    "EXPOSITION": "scroll-text", "RISING ACTION": "trending-up", "CLIMAX": "triangle",
    "FALLING ACTION": "trending-down", "DENOUEMENT / CATASTROPHE": "skull",
    "IMMEDIATE HOOK / FIRST CRISIS": "flame", "CRISIS ESCALATION 1": "move-up-right",
    "CRISIS ESCALATION 2": "trending-up", "CRISIS ESCALATION 3": "corner-right-up",
    "MAJOR CRISIS / LOW POINT": "triangle-alert", "SHORT RESOLUTION": "flag",
    "OPENING / STATUS QUO": "home", "INCITING INCIDENT": "zap",
    "DEBATE / REFUSAL": "message-circle-x", "ACT I BREAK (COMMITMENT)": "thumbs-up",
    "RISING COMPLICATIONS": "trending-up", "MIDPOINT SHIFT": "refresh-ccw-dot",
    "BAD GUYS CLOSE IN / PRESSURE PEAKS": "alert-triangle", "ALL IS LOST": "bone",
    "DARK NIGHT OF THE SOUL": "skull", "ACT III BREAK (NEW PLAN)": "notepad-text",
    "DENOUEMENT": "flag", "KI (INTRODUCTION)": "circle-play",
    "SHÔ (DEVELOPMENT)": "trending-up", "TEN (TURN / TWIST)": "rotate-cw",
    "KETSU (CONCLUSSION)": "flag", "OPENING IMAGE": "image", "THEME STATED": "quote",
    "SETUP": "list", "CATALYST": "sparkles", "DEBATE": "message-circle-x",
    "BREAK INTO ACT II": "log-in", "B STORY": "users", "FUN AND GAMES": "sparkles",
    "MIDPOINT": "refresh-ccw-dot", "BAD GUYS CLOSE IN": "alert-triangle",
    "BREAK INTO ACT III": "notepad-text", "FINALE": "flag", "FINAL IMAGE": "image",
    "HOOK": "sparkles", "PLOT TURN 1": "log-in", "PINCH POINT 1": "grip",
    "PINCH POINT 2": "grip", "PLOT TURN 2": "log-in", "RESOLUTION": "flag",
    "IMMEDIATE HOOK": "flame", "CLEAR GOAL": "target", "OBSTACLE CHAIN": "link-2",
    "ESCALATION": "trending-up", "CLIFFHANGER OR CRISIS": "siren",
    "FINAL CONFRONTATION": "swords", "SWIFT RESOLUTION": "flag",
    "PROGRESSIVE COMPLICATIONS": "trending-up", "CRISIS": "circle-alert",
    "ORDER": "square", "DISRUPTION": "sparkles", "ATTEMPTED REPAIR": "wrench",
    "COLLAPSE": "triangle-alert", "NEW ORDER": "flag", "OUTER FRAME": "frame",
    "INNER STORY": "book-open", "INTERRUPTION OR COMMENTARY": "message-square",
    "RETURN TO FRAME": "corner-up-left", "REVERSE CHRONOLOGY": "rotate-ccw",
    "INTERWOVEN TIMELINES": "split", "FRAGMENTED MEMORY": "brain",
    "CIRCULAR NARRATIVES": "repeat", "SINGLE EVENT": "dot",
    "MULTIPLE RETELLINGS": "repeat-2", "CONTRADICTIONS REVEALED": "alert-triangle",
    "AMBIGUITY PRESERVED": "help-circle", "MID-ACTION OPENING": "zap",
    "AUDIENCE CONFUSION": "help-circle", "GRADUAL BACKFILL": "clock-4",
    "RECONTEXTUALIZATION": "refresh-ccw-dot", "CONTINUATION TO RESOLUTION": "arrow-right"
  };
  const iconName = typeof item === "object" ? item?.icon : (title ? stepIconMap[title.toUpperCase()] : null);
  if (!title) return;
  const callout = container.createDiv({ cls: "resource-detail-callout" });
  if (iconName) {
    const icon = callout.createSpan({ cls: "resource-detail-callout-icon" });
    setIcon(icon, iconName);
  }
  callout.createSpan({ cls: "resource-detail-callout-title", text: title });
  if (body) {
    callout.createDiv({ cls: "resource-detail-callout-body", text: body });
  }
}

export function renderStructureDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach(p => introZone.createDiv({ cls: "resource-detail-paragraph", text: p }));

  if (config.core?.length) {
    const coreZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(coreZone, "heart", config.coreHeading || "Core characteristics");
    const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
    config.core.forEach(item => coreList.createEl("li", { text: item }));
    if (config.coreNote) {
      coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
    }
  }

  const stepsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(stepsZone, "list-ordered", config.stepsTitle || "Steps");

  if (config.stepGroups?.length) {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    config.stepGroups.forEach(group => {
      const headingClass = /^ACT\s+/i.test(group.title)
        ? "resource-detail-step-heading-plain"
        : "resource-detail-step-heading";
      stepsList.createDiv({ cls: headingClass }).createSpan({ text: group.title });
      const groupBox = stepsList.createDiv({ cls: "resource-detail-step-group" });
      group.items.forEach(item => renderCalloutItem(groupBox, item));
    });
  } else if (config.numberedSteps) {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    let currentGroup = null;
    config.steps.forEach(item => {
      if (/^ACT\s+[IVX]+\s+—\s+/i.test(item)) {
        stepsList.createDiv({ cls: "resource-detail-step-heading" }).createSpan({ text: item });
        currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
        return;
      }
      if (!currentGroup) currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
      renderCalloutItem(currentGroup, item);
    });
  } else {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    config.steps.forEach(item => renderCalloutItem(stepsList, item));
  }

  if (config.why) {
    const whyZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(whyZone, "chart-spline", config.whyTitle || "Why this works");
    whyZone.createDiv({ cls: "resource-detail-paragraph", text: config.why });
  }

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "bookmark");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });
  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  config.examples.forEach(example => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

// ─── Tips renderer (data-driven, bilingual via caller) ───────────────────────

export function renderTipsDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach(p => introZone.createDiv({ cls: "resource-detail-paragraph", text: p }));

  const techniquesZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(techniquesZone, "heart", config.techniquesHeading || "Core techniques");
  const techniquesList = techniquesZone.createDiv({ cls: "resource-detail-callout-list" });
  config.techniques.forEach(item => renderCalloutItem(techniquesList, item));
}

// ─── Pitfalls renderer (data-driven, bilingual via caller) ───────────────────

export function renderPitfallsDetail(container, title, items) {
  const content = container.createDiv({ cls: "resource-detail-content" });
  const pitfallsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(pitfallsZone, "alert-triangle", title);
  const list = pitfallsZone.createEl("ul", { cls: "resource-detail-list" });
  items.forEach(item => list.createEl("li", { text: item }));
}
