/**
 * Shared screenplay parser.
 *
 * Turns a screenplay-formatted markdown document into an ordered list of typed
 * elements, using Folio's heading convention (see README):
 *   #     -> scene heading
 *   ##    -> character cue
 *   ###   -> parenthetical
 *   ####  -> transition
 *   ##### -> section / act
 * Plain lines are Action, unless they directly follow a character cue or
 * parenthetical (then they are Dialogue, inferred from context). Blank lines
 * end a dialogue block.
 *
 * Pure module (no Obsidian/vault access) so it can be unit-tested and reused by
 * multiple exporters (Fountain, Final Draft FDX, ...).
 */

/** Remove a leading YAML frontmatter block, if present. */
export function stripFrontmatter(text) {
  if (!text) return "";
  return text.replace(/^---\s*\n[\s\S]*?\n---\s*(\n|$)/, "");
}

/**
 * @typedef {{ type: 'scene'|'character'|'parenthetical'|'transition'|'section'|'action'|'dialogue', text: string }} ScreenplayElement
 */

/**
 * Parse markdown into screenplay elements.
 * @param {string} markdown
 * @returns {ScreenplayElement[]}
 */
export function parseScreenplayElements(markdown) {
  const body = stripFrontmatter(markdown || "").replace(/\r\n/g, "\n");
  const lines = body.split("\n");
  const elements = [];
  let inDialogue = false;

  for (const rawLine of lines) {
    // Strip a trailing folio block id (our stable Unit anchor) so it never
    // leaks into exported action/dialogue text.
    const line = rawLine.replace(/\s+$/, "").replace(/\s\^folio[A-Za-z0-9]+$/, "");

    if (line.trim() === "") {
      // Blank line ends any dialogue block.
      inDialogue = false;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (!headingMatch) {
      elements.push({ type: inDialogue ? "dialogue" : "action", text: line });
      continue;
    }

    const level = headingMatch[1].length;
    const text = headingMatch[2].trim();
    if (!text) continue;

    switch (level) {
      case 1:
        elements.push({ type: "scene", text: text.toUpperCase() });
        inDialogue = false;
        break;
      case 2:
        elements.push({ type: "character", text: text.toUpperCase() });
        inDialogue = true;
        break;
      case 3: {
        const inner = text.replace(/^\(+|\)+$/g, "").trim();
        elements.push({ type: "parenthetical", text: `(${inner})` });
        inDialogue = true;
        break;
      }
      case 4:
        elements.push({ type: "transition", text: text.toUpperCase() });
        inDialogue = false;
        break;
      default:
        elements.push({ type: "section", text });
        inDialogue = false;
        break;
    }
  }

  return elements;
}
