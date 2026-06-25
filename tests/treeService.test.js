/**
 * Tests for TreeService.reorderTreeNodes()
 *
 * Focus: the circular-move guard that prevents dropping a node onto itself or
 * moving a folder into one of its own descendants (which would create a
 * self-referential path like "A/Sub/A" and physically move files into
 * themselves). A valid same-parent reorder must still succeed.
 */

import { TreeService } from '../src/services/treeService.js';

// ---------------------------------------------------------------------------
// Minimal stubs (no Obsidian API needed for the guard path)
// ---------------------------------------------------------------------------

function makeConfigService(tree) {
  let stored = { structure: { tree: JSON.parse(JSON.stringify(tree)) } };
  return {
    async loadBookConfig() { return JSON.parse(JSON.stringify(stored)); },
    async saveBookConfig(_book, cfg) { stored = JSON.parse(JSON.stringify(cfg)); },
    getStored() { return stored; },
  };
}

function makeApp() {
  // Simple manual spy (jest globals are not injected under --experimental-vm-modules)
  const renameFile = (...args) => { renameFile.calls.push(args); };
  renameFile.calls = [];
  return {
    app: {
      vault: {
        getAbstractFileByPath(path) { return { path }; },
      },
      fileManager: { renameFile },
    },
    renameFile,
  };
}

// Tree: folder A → folder A/Sub → file A/Sub/Chapter 1.md
function nestedTree() {
  return [
    {
      id: 'A', title: 'A', type: 'group', path: 'A', order: 1, children: [
        {
          id: 'Sub', title: 'Sub', type: 'group', path: 'A/Sub', order: 1, children: [
            { id: 'ch1', title: 'Chapter 1', type: 'file', path: 'A/Sub/Chapter 1.md', order: 1 },
          ],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------

describe('TreeService.reorderTreeNodes() — circular guard', () => {
  const book = { path: 'projects/MyBook' };

  test('rejects moving a folder INSIDE its own descendant', async () => {
    const cfgSvc = makeConfigService(nestedTree());
    const { app, renameFile } = makeApp();
    const svc = new TreeService(app, cfgSvc);

    const result = await svc.reorderTreeNodes(book, 'A', 'Sub', 'inside');

    expect(result).toBe(false);
    expect(renameFile.calls.length).toBe(0);
    // Tree must remain untouched (A still at root, still contains Sub)
    const tree = cfgSvc.getStored().structure.tree;
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('A');
    expect(tree[0].children[0].id).toBe('Sub');
  });

  test('rejects moving a folder BEFORE a node living inside it', async () => {
    const cfgSvc = makeConfigService(nestedTree());
    const { app, renameFile } = makeApp();
    const svc = new TreeService(app, cfgSvc);

    const result = await svc.reorderTreeNodes(book, 'A', 'ch1', 'before');

    expect(result).toBe(false);
    expect(renameFile.calls.length).toBe(0);
  });

  test('rejects dropping a node onto itself', async () => {
    const cfgSvc = makeConfigService(nestedTree());
    const { app, renameFile } = makeApp();
    const svc = new TreeService(app, cfgSvc);

    const result = await svc.reorderTreeNodes(book, 'Sub', 'Sub', 'inside');

    expect(result).toBe(false);
    expect(renameFile.calls.length).toBe(0);
  });

  test('allows a valid same-parent reorder (no physical move)', async () => {
    const tree = [
      { id: 'one', title: 'One', type: 'file', path: 'One.md', order: 1 },
      { id: 'two', title: 'Two', type: 'file', path: 'Two.md', order: 2 },
    ];
    const cfgSvc = makeConfigService(tree);
    const { app, renameFile } = makeApp();
    const svc = new TreeService(app, cfgSvc);

    const result = await svc.reorderTreeNodes(book, 'one', 'two', 'after');

    expect(result).toBe(true);
    expect(renameFile.calls.length).toBe(0);
    const stored = cfgSvc.getStored().structure.tree;
    // "one" should now come after "two"
    expect(stored.map(n => n.id)).toEqual(['two', 'one']);
  });
});
