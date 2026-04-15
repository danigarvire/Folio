/**
 * Reference detail render functions for Writer Tools.
 * Each function renders a resource detail panel into a given container element.
 * Extracted from WriterToolsView to keep that class focused on navigation/state.
 */

import { setIcon } from 'obsidian';

export function createResourceSubheading(parent, iconName, text) {
  const heading = parent.createDiv({ cls: "resource-detail-subheading-row" });
  const icon = heading.createSpan({ cls: "resource-detail-subheading-icon" });
  setIcon(icon, iconName);
  heading.createSpan({ cls: "resource-detail-subheading", text });
}

export function renderHeroDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Hero?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Hero is the transforming protagonist. They represent the struggle for personal growth, the confrontation of fear, and the overcoming of obstacles. The Hero symbolizes the human drive to transcend limits, improve, and give meaning to adversity."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This is a universal archetype found in myth, classical stories, and modern narratives. The Hero’s journey forms the backbone of many plots."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Courage in the face of danger",
    "Inner and outer strength",
    "Empathy and leadership",
    "Strong sense of justice",
    "Human flaws and vulnerability"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Hero is not perfect. They fall, struggle, and rise transformed."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Mentor → guidance and wisdom",
    "Ally → shared mission",
    "Threshold Guardian → trial or blockage",
    "Shadow → antagonist or repressed self",
    "Trickster → chaos and disruption",
    "Shapeshifter → uncertainty and tension",
    "Herald → announces change"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing a strong Hero");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear motivation",
    "Internal conflict",
    "Meaningful backstory",
    "Unique skills",
    "Emotional relationships",
    "Balance of strength and fragility",
    "Strong contrast between ordinary life and transformation"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const whyZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(whyZone, "chart-spline", "Why this archetype works");
  whyZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Because it mirrors the human experience: struggle, fall, learning, and transformation."
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "bookmark");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Hero Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Harry Potter",
    "Frodo Baggins",
    "Katniss Everdeen",
    "Mulan",
    "Luke Skywalker",
    "Simba",
    "Elizabeth Bennet"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderMentorDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Mentor?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Mentor guides, teaches, and inspires the Hero. They provide wisdom, experience, and emotional support, helping the Hero grow and overcome challenges."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Mentor represents inherited knowledge, tradition, and the possibility of inner transformation."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Spiritual and practical guide",
    "Accumulated wisdom",
    "Emotional support figure",
    "Ethical compass",
    "Connection to tradition",
    "Catalyst for action"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Often the Mentor sacrifices something, forcing the Hero into independence."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Mentor supports the Hero’s growth as:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Trusted advisor",
    "Trainer or teacher",
    "Giver of tools or gifts",
    "Emotional challenger",
    "Bridge between worlds"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "When the Mentor disappears, the Hero must act alone."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → formative bond",
    "Threshold Guardian → shared trials",
    "Shadow → moral counterpoint",
    "Ally → cooperation or tension",
    "Trickster → disruption of authority",
    "Shapeshifter → ambiguity",
    "Herald → signals the need for guidance"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing a compelling Mentor");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Strong introduction",
    "Clear motivation",
    "Demonstrated expertise",
    "Unique personality",
    "Revealing backstory",
    "Trust with the Hero",
    "Memorable first lesson",
    "Symbolic presence"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "layout-grid");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Mentor Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Gandalf",
    "Dumbledore",
    "Mr. Miyagi",
    "Yoda",
    "Professor Xavier",
    "Glinda",
    "Haymitch",
    "Rafiki",
    "Morpheus"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderHeraldDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Herald?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Herald announces change. They disrupt the status quo and deliver the call to adventure, signaling that the current world can no longer remain the same."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Herald does not need to stay in the story long — their power lies in initiating movement."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Messenger of change",
    "Catalyst for action",
    "Bringer of information or crisis",
    "External or internal trigger",
    "Neutral, positive, or threatening"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Herald forces a decision."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Herald appears to:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Deliver news",
    "Introduce conflict",
    "Reveal danger or opportunity",
    "Force the Hero to act",
    "Break routine"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They are the narrative spark."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → awakens purpose",
    "Mentor → confirms the call",
    "Shadow → escalation of threat",
    "Ally → shared urgency",
    "Shapeshifter → uncertainty around meaning",
    "Trickster → distorted message"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing an effective Herald");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear message",
    "Strong timing",
    "Memorable entrance",
    "Emotional impact",
    "Immediate consequences",
    "No unnecessary exposition"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Herald Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "R2-D2",
    "The White Rabbit",
    "Hagrid",
    "The Letter from Hogwarts",
    "The Black Spot (Treasure Island)",
    "Morpheus (first contact)",
    "Paul Revere"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderShadowDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Shadow?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shadow represents the Hero’s greatest obstacle. It often embodies the Hero’s repressed fears, flaws, or dark potential."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shadow can be a villain, antagonist, rival, or internal force."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Opposition and threat",
    "Moral contrast",
    "Power or temptation",
    "Psychological mirror",
    "Fear incarnate"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shadow tests the Hero’s values."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shadow exists to:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Block progress",
    "Challenge morality",
    "Force growth",
    "Expose weakness",
    "Represent consequences"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Defeating the Shadow often means internal change."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → mirrored opposition",
    "Mentor → ideological contrast",
    "Ally → collateral conflict",
    "Trickster → destabilization",
    "Shapeshifter → hidden threat",
    "Threshold Guardian → shared function"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing a powerful Shadow");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear motivation",
    "Personal connection to Hero",
    "Symbolic design",
    "Escalating threat",
    "Moral complexity",
    "Consequences beyond defeat"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Shadow Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Darth Vader",
    "Voldemort",
    "Sauron",
    "Joker",
    "Scar",
    "Thanos",
    "Captain Ahab"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderTricksterDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Trickster?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Trickster introduces chaos, humor, and unpredictability. They question authority, expose hypocrisy, and disrupt order."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Trickster is rarely evil — they destabilize to reveal truth."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Humor and wit",
    "Rule-breaking behavior",
    "Irony and satire",
    "Unpredictability",
    "Social disruption"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They thrive on contradiction."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Trickster serves to:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Relieve tension",
    "Challenge norms",
    "Reveal hidden truths",
    "Expose weakness",
    "Create narrative surprise"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They prevent stagnation."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → comic relief or moral test",
    "Mentor → challenges authority",
    "Shadow → ironic contrast",
    "Ally → unreliable support",
    "Shapeshifter → shared ambiguity"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing an effective Trickster");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Sharp dialogue",
    "Clear worldview",
    "Narrative timing",
    "Purposeful disruption",
    "Balance humor and impact"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Trickster Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Loki",
    "Jack Sparrow",
    "Bugs Bunny",
    "Deadpool",
    "The Joker (comic function)",
    "Puck",
    "Han Solo"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderAllyDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Ally?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Ally supports the Hero emotionally, strategically, or practically. They represent friendship, loyalty, and shared purpose."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Allies humanize the Hero."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Loyalty",
    "Complementary skills",
    "Emotional support",
    "Shared risk",
    "Personal stake"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Allies often have their own arcs."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Ally helps by:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Assisting in conflict",
    "Providing perspective",
    "Supporting decisions",
    "Sharing danger",
    "Reflecting growth"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They reinforce connection."
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → partnership",
    "Mentor → guidance extension",
    "Shadow → vulnerability",
    "Trickster → contrast",
    "Shapeshifter → trust tension"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing strong Allies");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear individuality",
    "Defined strengths",
    "Emotional bond",
    "Independent goals",
    "Potential conflict"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Ally Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Samwise Gamgee",
    "Ron Weasley",
    "Hermione Granger",
    "Chewbacca",
    "Dr. Watson",
    "Merry & Pippin",
    "Peeta Mellark"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderShapeshifterDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Shapeshifter?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shapeshifter embodies uncertainty. Their allegiance, identity, or intentions are unclear, creating doubt and tension."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They represent change and ambiguity."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Duality",
    "Uncertainty",
    "Fluid loyalty",
    "Deception or mystery",
    "Emotional instability"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They challenge trust."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Shapeshifter exists to:"
  });
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Create doubt",
    "Test perception",
    "Complicate relationships",
    "Introduce surprise",
    "Represent internal conflict"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → trust challenge",
    "Mentor → warning or lesson",
    "Shadow → secret alliance",
    "Ally → betrayal risk",
    "Trickster → shared chaos"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing a compelling Shapeshifter");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear mystery",
    "Consistent ambiguity",
    "Emotional stakes",
    "Gradual revelation",
    "Meaningful transformation"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Shapeshifter Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Catwoman",
    "Severus Snape",
    "Gollum",
    "Mystique",
    "Nick Fury",
    "Scarlett O’Hara"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderThresholdGuardianDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Threshold Guardian?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Threshold Guardian blocks progress and tests readiness. They appear at key moments of transition."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They are not always villains — they are gatekeepers."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Obstacle or challenge",
    "Moral or physical test",
    "Enforcer of rules",
    "Neutral opposition",
    "Trial embodiment"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Passing them marks growth."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Tests commitment",
    "Filters worthiness",
    "Forces preparation",
    "Delays progression",
    "Raises stakes"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const relationshipsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(relationshipsZone, "flask-conical", "Key relationships");
  const relationships = relationshipsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Hero → rite of passage",
    "Mentor → preparation source",
    "Shadow → structural parallel",
    "Ally → shared test",
    "Trickster → bypass attempt"
  ].forEach((item) => {
    relationships.createEl("li", { text: item });
  });

  const writingZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(writingZone, "square-pen", "Writing effective Threshold Guardians");
  const writing = writingZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Clear rules",
    "Symbolic challenge",
    "Consequences for failure",
    "Escalation of difficulty",
    "Memorable encounter"
  ].forEach((item) => {
    writing.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "club");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Threshold Guardian Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "The Sphinx",
    "Cerberus",
    "The Bouncer",
    "Stormtroopers",
    "Gatekeepers",
    "Dragons",
    "The First Boss"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderCaregiverDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Caregiver?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Caregiver is driven by compassion, responsibility, and the desire to protect others. They exist to nurture, support, and sustain, often putting others’ needs before their own."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This archetype represents altruism, sacrifice, and unconditional care."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Empathy and compassion",
    "Selflessness",
    "Responsibility",
    "Emotional strength",
    "Protective instinct"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Caregiver’s weakness is often self-neglect."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Protects vulnerable characters",
    "Provides emotional stability",
    "Represents moral goodness",
    "Motivates sacrifice",
    "Creates emotional stakes"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They often anchor the story’s heart."
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Helping others vs. self-preservation",
    "Love vs. burnout",
    "Responsibility vs. freedom"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Caregiver Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Marmee (Little Women)",
    "Samwise Gamgee",
    "Aunt May",
    "Molly Weasley",
    "Baymax",
    "Marlin (Finding Nemo)"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderCreatorDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Creator?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Creator is driven by imagination and the urge to build something meaningful. They seek originality, self-expression, and lasting impact through creation."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This archetype fears mediocrity and unrealized potential."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Creativity",
    "Vision",
    "Innovation",
    "Sensitivity",
    "Perfectionism"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They are often torn between inspiration and self-doubt."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Brings new ideas into the world",
    "Challenges existing systems",
    "Embodies artistic struggle",
    "Explores identity through creation"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Fear of failure",
    "Obsession with perfection",
    "Isolation",
    "The cost of creation"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Creator Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Victor Frankenstein",
    "Tony Stark",
    "Walt Disney (fictionalized)",
    "Dr. Emmett Brown",
    "Jo March",
    "Da Vinci–type characters"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderEverymanDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Everyman?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Everyman represents normalcy, relatability, and belonging. They are not exceptional by skill or destiny, but by humanity."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This archetype allows the audience to see themselves in the story."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Humility",
    "Honesty",
    "Reliability",
    "Relatability",
    "Desire for connection"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They succeed through perseverance, not greatness."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Grounds the story",
    "Reflects audience values",
    "Humanizes extraordinary events",
    "Emphasizes community and belonging"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Feeling insignificant",
    "Fear of standing out",
    "Desire to belong vs. desire to matter"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Everyman Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Arthur Dent",
    "Bilbo Baggins (early)",
    "Jim Halpert",
    "Forrest Gump",
    "Frodo (initially)"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderExplorerDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Explorer?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Explorer seeks freedom, discovery, and self-definition. They reject confinement and pursue meaning through experience."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This archetype values independence above all else."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Curiosity",
    "Independence",
    "Courage",
    "Restlessness",
    "Self-reliance"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear conformity and stagnation."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Drives journeys and quests",
    "Expands the world of the story",
    "Challenges limits and borders",
    "Represents personal freedom"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Commitment",
    "Loneliness",
    "Rootlessness",
    "The cost of freedom"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Explorer Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Indiana Jones",
    "Lara Croft",
    "Moana",
    "Huck Finn",
    "The Doctor (Doctor Who)"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderHeroJungDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Hero?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Jungian Hero represents courage, willpower, and the drive to prove worth through action. Unlike the mythic Hero’s Journey, this archetype focuses on strength and achievement."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Bravery",
    "Determination",
    "Discipline",
    "Moral clarity",
    "Endurance"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They define themselves through struggle."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Confronts danger directly",
    "Overcomes adversity",
    "Protects others",
    "Embodies action and resolve"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Pride",
    "Fear of weakness",
    "Burnout",
    "Identity tied solely to victory"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Hero Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Wonder Woman",
    "Captain America",
    "Achilles",
    "Beowulf",
    "Maximus"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderInnocentDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Innocent?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Innocent seeks happiness, safety, and goodness. They believe in a just world and trust others easily."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This archetype represents hope and moral purity."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Optimism",
    "Trust",
    "Faith",
    "Simplicity",
    "Moral clarity"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Their weakness is naivety."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Highlights corruption or cruelty",
    "Inspires protection",
    "Restores hope",
    "Contrasts darker characters"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Loss of faith",
    "Disillusionment",
    "Exposure to harsh reality"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Innocent Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Dorothy Gale",
    "Paddington",
    "Buddy (Elf)",
    "Bambi",
    "Amélie"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderJesterDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Jester?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Jester lives in the moment, embracing humor, chaos, and joy. They expose truth through laughter and subversion."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Humor",
    "Irreverence",
    "Playfulness",
    "Chaos",
    "Social critique"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear boredom and oppression."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Relieves tension",
    "Exposes hypocrisy",
    "Challenges authority",
    "Brings levity"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Being taken seriously",
    "Hiding pain behind humor"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Jester Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Jack Sparrow",
    "The Genie",
    "Tyrion Lannister",
    "Bugs Bunny",
    "Puck"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderLoverDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Lover?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Lover is driven by passion, intimacy, and connection. They seek union — romantic, emotional, or aesthetic."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Passion",
    "Devotion",
    "Sensuality",
    "Emotional depth",
    "Vulnerability"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear abandonment and loss."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Raises emotional stakes",
    "Motivates sacrifice",
    "Explores intimacy",
    "Drives relational conflict"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Obsession",
    "Dependency",
    "Loss of identity"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Lover Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Romeo & Juliet",
    "Rose (Titanic)",
    "Westley",
    "Scarlett O’Hara",
    "Jack Dawson"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderMagicianDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Magician?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Magician seeks transformation — of self, others, or reality itself. They understand hidden systems and use knowledge to enact change."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Insight",
    "Vision",
    "Power",
    "Charisma",
    "Transformation"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear unintended consequences."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Enables change",
    "Transforms situations",
    "Reveals hidden truths",
    "Alters reality"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Control vs. ethics",
    "Power misuse",
    "Hubris"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Magician Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Gandalf",
    "Doctor Strange",
    "Merlin",
    "Neo",
    "Dumbledore"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderOutlawDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Outlaw?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Outlaw rejects rules, authority, and conformity. They seek freedom through rebellion and disruption."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Defiance",
    "Independence",
    "Anger or idealism",
    "Courage",
    "Anti-authoritarianism"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear powerlessness."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Challenges systems",
    "Sparks revolution",
    "Represents resistance",
    "Breaks unjust rules"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Destruction vs. change",
    "Isolation",
    "Moral ambiguity"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Outlaw Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "V",
    "Robin Hood",
    "Han Solo",
    "Tyler Durden",
    "Katniss Everdeen"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderRulerDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Ruler?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Ruler seeks order, control, and stability. They value leadership, responsibility, and structure."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Authority",
    "Control",
    "Responsibility",
    "Vision",
    "Discipline"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear chaos and loss of power."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Establishes order",
    "Sets laws and norms",
    "Represents power",
    "Creates political stakes"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Tyranny vs. justice",
    "Control vs. trust"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Ruler Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Mufasa",
    "Aragorn",
    "Queen Elizabeth–type figures",
    "Tywin Lannister",
    "Odin"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderSageDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "Who is the Sage?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The Sage seeks truth through knowledge and understanding. They value wisdom over action."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core traits");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Intelligence",
    "Objectivity",
    "Insight",
    "Reflection",
    "Patience"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "They fear ignorance and deception."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Provides truth",
    "Explains systems",
    "Guides decisions",
    "Offers perspective"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Inner conflict");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Detachment",
    "Inaction",
    "Emotional distance"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Sage Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Obi-Wan Kenobi",
    "Socrates–type figures",
    "Professor X",
    "Dumbledore (as Sage)",
    "Spock"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderMoralAscentDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Ascent?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "A Moral Ascent arc follows a character who grows ethically over the course of the story. The character starts with flaws, ignorance, or selfishness and gradually learns to act with greater integrity, empathy, or responsibility."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This is the classic arc of becoming better."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core characteristics");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Ethical growth",
    "Increased empathy",
    "Personal responsibility",
    "Learning from mistakes",
    "Sacrifice for others"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The character ends the story morally stronger than they began."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Inspire the audience",
    "Reinforce ethical values",
    "Reward self-reflection and growth",
    "Create emotional catharsis"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });
  functionZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "It often aligns with hopeful or redemptive stories."
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Fear vs. courage",
    "Self-interest vs. responsibility",
    "Ignorance vs. awareness",
    "Comfort vs. change"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Ascent Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Ebenezer Scrooge",
    "Zuko",
    "Jean Valjean",
    "Tony Stark",
    "Shrek",
    "Mulan"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderMoralDescentDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Descent?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "A Moral Descent arc follows a character who deteriorates ethically over time. They begin with good intentions or neutrality but gradually compromise their values, often due to fear, ambition, pride, or trauma."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "This is the arc of corruption."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core characteristics");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Ethical erosion",
    "Rationalization of wrongdoing",
    "Increasing selfishness or cruelty",
    "Loss of empathy",
    "Escalating consequences"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The character becomes morally worse by the end."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Explore the cost of power",
    "Examine temptation and corruption",
    "Create tragedy or cautionary tales",
    "Critique ambition or hubris"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Power vs. morality",
    "Control vs. restraint",
    "Fear vs. conscience",
    "Justification vs. accountability"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Descent Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Walter White",
    "Anakin Skywalker",
    "Michael Corleone",
    "Macbeth",
    "Gollum",
    "Light Yagami"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderFlatMoralDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "What is a Flat Moral Arc?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "In a Flat Moral Arc, the character does not significantly change their moral beliefs. Instead, the character’s values remain constant while the world around them is challenged or transformed."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The character changes others, not themselves."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core characteristics");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Stable moral compass",
    "Strong convictions",
    "Resistance to pressure",
    "Consistency under stress",
    "Influence on others"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The arc is external rather than internal."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Represent ideal values",
    "Challenge a flawed world",
    "Serve as moral anchors",
    "Highlight societal change"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Common internal tensions");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Isolation due to integrity",
    "Conflict with changing norms",
    "Burden of being right",
    "Moral fatigue"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Flat Moral Arc Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Captain America",
    "Paddington",
    "Atticus Finch",
    "Superman",
    "Wonder Woman",
    "Marge Gunderson"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderMoralTransformationDetail(container) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", "What is a Moral Transformation?");
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "A Moral Transformation arc depicts a character who undergoes a fundamental ethical shift. Unlike gradual ascent or descent, this change is often abrupt, intense, and tied to a defining moment or revelation."
  });
  introZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "The character becomes morally different — not just better or worse."
  });

  const traitsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(traitsZone, "heart", "Core characteristics");
  const traits = traitsZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Pivotal turning point",
    "Identity redefinition",
    "Value realignment",
    "Emotional shock or revelation",
    "Clear “before and after”"
  ].forEach((item) => {
    traits.createEl("li", { text: item });
  });
  traitsZone.createDiv({
    cls: "resource-detail-paragraph",
    text: "Transformation is often irreversible."
  });

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionsList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Mark decisive moments",
    "Reinvent characters",
    "Shock or reframe audience perception",
    "Signal thematic shifts"
  ].forEach((item) => {
    functionsList.createEl("li", { text: item });
  });

  const conflictZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(conflictZone, "alert-triangle", "Common internal conflicts");
  const conflictList = conflictZone.createEl("ul", { cls: "resource-detail-list" });
  [
    "Guilt vs. denial",
    "Old identity vs. new self",
    "Fear of change",
    "Consequences of awakening"
  ].forEach((item) => {
    conflictList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "user-round");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: "Moral Transformation Examples" });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  [
    "Darth Vader (redemption moment)",
    "Neo (awakening)",
    "Clarice Starling",
    "Jaime Lannister",
    "Elsa (acceptance)",
    "Andy Dufresne"
  ].forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderPitfallsDetail(container, title, items) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const pitfallsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(pitfallsZone, "alert-triangle", title);
  const list = pitfallsZone.createEl("ul", { cls: "resource-detail-list" });
  items.forEach((item) => {
    list.createEl("li", { text: item });
  });
}

export function renderTipsDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach((paragraph) => {
    introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
  });

  const techniquesZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(techniquesZone, "heart", "Core techniques");
  const techniquesList = techniquesZone.createDiv({ cls: "resource-detail-callout-list" });
  config.techniques.forEach((item) => {
    renderCalloutItem(techniquesList, item);
  });
}

export function renderCalloutItem(container, item) {
  const cleanText = typeof item === "string" ? item.replace(/^\d+\.\s*/, "") : "";
  const parts = cleanText ? cleanText.split(" — ") : [];
  const title = typeof item === "string" ? parts[0]?.trim() : item?.title?.trim();
  const body = typeof item === "string" ? parts.slice(1).join(" — ").trim() : item?.body?.trim();
  const stepIconMap = {
    "EXPOSITION": "scroll-text",
    "RISING ACTION": "trending-up",
    "CLIMAX": "triangle",
    "FALLING ACTION": "trending-down",
    "DENOUEMENT / CATASTROPHE": "skull",
    "IMMEDIATE HOOK / FIRST CRISIS": "flame",
    "CRISIS ESCALATION 1": "move-up-right",
    "CRISIS ESCALATION 2": "trending-up",
    "CRISIS ESCALATION 3": "corner-right-up",
    "MAJOR CRISIS / LOW POINT": "triangle-alert",
    "SHORT RESOLUTION": "flag",
    "OPENING / STATUS QUO": "home",
    "INCITING INCIDENT": "zap",
    "DEBATE / REFUSAL": "message-circle-x",
    "ACT I BREAK (COMMITMENT)": "thumbs-up",
    "RISING COMPLICATIONS": "trending-up",
    "MIDPOINT SHIFT": "refresh-ccw-dot",
    "BAD GUYS CLOSE IN / PRESSURE PEAKS": "alert-triangle",
    "ALL IS LOST": "bone",
    "DARK NIGHT OF THE SOUL": "skull",
    "ACT III BREAK (NEW PLAN)": "notepad-text",
    "DENOUEMENT": "flag",
    "KI (INTRODUCTION)": "circle-play",
    "SHÔ (DEVELOPMENT)": "trending-up",
    "TEN (TURN / TWIST)": "rotate-cw",
    "KETSU (CONCLUSSION)": "flag",
    "OPENING IMAGE": "image",
    "THEME STATED": "quote",
    "SETUP": "list",
    "CATALYST": "sparkles",
    "DEBATE": "message-circle-x",
    "BREAK INTO ACT II": "log-in",
    "B STORY": "users",
    "FUN AND GAMES": "sparkles",
    "MIDPOINT": "refresh-ccw-dot",
    "BAD GUYS CLOSE IN": "alert-triangle",
    "BREAK INTO ACT III": "notepad-text",
    "FINALE": "flag",
    "FINAL IMAGE": "image",
    "HOOK": "sparkles",
    "PLOT TURN 1": "log-in",
    "PINCH POINT 1": "grip",
    "PINCH POINT 2": "grip",
    "PLOT TURN 2": "log-in",
    "RESOLUTION": "flag",
    "IMMEDIATE HOOK": "flame",
    "CLEAR GOAL": "target",
    "OBSTACLE CHAIN": "link-2",
    "ESCALATION": "trending-up",
    "CLIFFHANGER OR CRISIS": "siren",
    "FINAL CONFRONTATION": "swords",
    "SWIFT RESOLUTION": "flag",
    "PROGRESSIVE COMPLICATIONS": "trending-up",
    "CRISIS": "circle-alert",
    "ORDER": "square",
    "DISRUPTION": "sparkles",
    "ATTEMPTED REPAIR": "wrench",
    "COLLAPSE": "triangle-alert",
    "NEW ORDER": "flag",
    "OUTER FRAME": "frame",
    "INNER STORY": "book-open",
    "INTERRUPTION OR COMMENTARY": "message-square",
    "RETURN TO FRAME": "corner-up-left",
    "REVERSE CHRONOLOGY": "rotate-ccw",
    "INTERWOVEN TIMELINES": "split",
    "FRAGMENTED MEMORY": "brain",
    "CIRCULAR NARRATIVES": "repeat",
    "SINGLE EVENT": "dot",
    "MULTIPLE RETELLINGS": "repeat-2",
    "CONTRADICTIONS REVEALED": "alert-triangle",
    "AMBIGUITY PRESERVED": "help-circle",
    "MID-ACTION OPENING": "zap",
    "AUDIENCE CONFUSION": "help-circle",
    "GRADUAL BACKFILL": "clock-4",
    "RECONTEXTUALIZATION": "refresh-ccw-dot",
    "CONTINUATION TO RESOLUTION": "arrow-right"
  };
  const iconName = typeof item === "object" ? item?.icon : (title ? stepIconMap[title.toUpperCase()] : null);
  if (!title) {
    return;
  }
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

export function renderTechniqueDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach((paragraph) => {
    introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
  });

  const coreZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(coreZone, "heart", "Core characteristics");
  const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
  config.core.forEach((item) => {
    coreList.createEl("li", { text: item });
  });
  if (config.coreNote) {
    coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
  }

  const functionZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(functionZone, "chart-spline", "Narrative function");
  const functionList = functionZone.createEl("ul", { cls: "resource-detail-list" });
  config.narrativeFunction.forEach((item) => {
    functionList.createEl("li", { text: item });
  });
  if (config.narrativeNote) {
    functionZone.createDiv({ cls: "resource-detail-paragraph", text: config.narrativeNote });
  }

  const risksZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(risksZone, "alert-triangle", config.risksTitle || "Common risks");
  const risksList = risksZone.createEl("ul", { cls: "resource-detail-list" });
  config.risks.forEach((item) => {
    risksList.createEl("li", { text: item });
  });

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "bookmark");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  config.examples.forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

export function renderStructureDetail(container, config) {
  const content = container.createDiv({ cls: "resource-detail-content" });

  const introZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(introZone, "circle-question-mark", config.introTitle);
  config.intro.forEach((paragraph) => {
    introZone.createDiv({ cls: "resource-detail-paragraph", text: paragraph });
  });

  if (config.core?.length) {
    const coreZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(coreZone, "heart", "Core characteristics");
    const coreList = coreZone.createEl("ul", { cls: "resource-detail-list" });
    config.core.forEach((item) => {
      coreList.createEl("li", { text: item });
    });
    if (config.coreNote) {
      coreZone.createDiv({ cls: "resource-detail-paragraph", text: config.coreNote });
    }
  }

  const stepsZone = content.createDiv({ cls: "resource-detail-zone" });
  createResourceSubheading(stepsZone, "list-ordered", config.stepsTitle || "Steps");

  if (config.stepGroups?.length) {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    config.stepGroups.forEach((group) => {
      const headingClass = /^ACT\\s+/i.test(group.title)
        ? "resource-detail-step-heading-plain"
        : "resource-detail-step-heading";
      const heading = stepsList.createDiv({ cls: headingClass });
      heading.createSpan({ text: group.title });
      const groupBox = stepsList.createDiv({ cls: "resource-detail-step-group" });
      group.items.forEach((item) => {
        renderCalloutItem(groupBox, item);
      });
    });
  } else if (config.numberedSteps) {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    let currentGroup = null;
    config.steps.forEach((item) => {
      if (/^ACT\s+[IVX]+\s+—\s+/i.test(item)) {
        const heading = stepsList.createDiv({ cls: "resource-detail-step-heading" });
        heading.createSpan({ text: item });
        currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
        return;
      }
      if (!currentGroup) {
        currentGroup = stepsList.createDiv({ cls: "resource-detail-step-group" });
      }
      renderCalloutItem(currentGroup, item);
    });
  } else {
    const stepsList = stepsZone.createDiv({ cls: "resource-detail-numbered-steps" });
    config.steps.forEach((item) => {
      renderCalloutItem(stepsList, item);
    });
  }

  if (config.why) {
    const whyZone = content.createDiv({ cls: "resource-detail-zone" });
    createResourceSubheading(whyZone, "chart-spline", config.whyTitle || "Why this works");
    whyZone.createDiv({ cls: "resource-detail-paragraph", text: config.why });
  }

  const examplesZone = content.createDiv({ cls: "resource-detail-zone resource-detail-examples-zone" });
  const examplesHeader = examplesZone.createDiv({ cls: "resource-detail-examples-header" });
  const examplesIcon = examplesHeader.createSpan({ cls: "resource-detail-examples-icon" });
  setIcon(examplesIcon, "layout-grid");
  examplesHeader.createSpan({ cls: "resource-detail-subheading", text: config.examplesTitle });

  const examplesGrid = examplesZone.createDiv({ cls: "resource-detail-examples-grid" });
  config.examples.forEach((example) => {
    const card = examplesGrid.createDiv({ cls: "resource-detail-example-card" });
    card.createSpan({ text: example });
  });
}

