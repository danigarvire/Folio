/**
 * Tree Service - Handles tree structure building and manipulation
 */

import { TFile, TFolder } from 'obsidian';

export class TreeService {
  constructor(app, configService) {
    this.app = app;
    this.configService = configService;
  }

  /**
   * Generate unique node ID
   */
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Build tree from filesystem (sync tree structure with actual files/folders)
   * Merges with existing config to preserve order, IDs, and metadata
   */
  async buildTreeFromFilesystem(bookFolder) {
    try {
      const cfg = (await this.configService.loadBookConfig({ path: bookFolder.path })) || {};
      const existingTree = cfg?.structure?.tree || [];
      const existingMap = new Map();
      
      // Map existing nodes by path for quick lookup
      const mapNodes = (nodes) => {
        for (const node of nodes) {
          existingMap.set(node.path, node);
          if (node.children) mapNodes(node.children);
        }
      };
      mapNodes(existingTree);

      const buildNode = (item, order) => {
        const relativePath = item.path.replace(bookFolder.path + '/', '');
        const existing = existingMap.get(relativePath);
        
        if (item instanceof TFile) {
          return {
            id: existing?.id || this.generateNodeId(),
            title: existing?.title || item.basename,
            type: item.extension === 'canvas' ? 'canvas' : 'file',
            path: relativePath,
            order: existing?.order ?? order,
            exclude: existing?.exclude || false,
            completed: existing?.completed || false,
            created_at: existing?.created_at || new Date().toISOString(),
            last_modified: new Date().toISOString()
          };
        } else if (item instanceof TFolder) {
          const folderChildren = (item.children || [])
            .filter(child => !(child instanceof TFolder && child.name === 'misc'));
          
          // Sort by existing order if available, otherwise alphabetically
          const childNodes = folderChildren.map(child => buildNode(child, 0));
          childNodes.sort((a, b) => {
            if (a.order && b.order) return a.order - b.order;
            return a.title.localeCompare(b.title);
          });
          // Reassign sequential order numbers
          childNodes.forEach((node, idx) => node.order = idx + 1);
          
          const children = childNodes;
          
          return {
            id: existing?.id || this.generateNodeId(),
            title: existing?.title || item.name,
            type: 'group',
            path: relativePath,
            order: existing?.order ?? order,
            is_expanded: existing?.is_expanded ?? false,
            created_at: existing?.created_at || new Date().toISOString(),
            last_modified: new Date().toISOString(),
            children
          };
        }
      };

      const tree = [];
      const fsChildren = (bookFolder.children || [])
        .filter(child => !(child instanceof TFolder && child.name === 'misc'));
      
      // Build nodes first
      const nodes = fsChildren.map(child => buildNode(child, 0));
      
      // Sort by existing order if available, otherwise alphabetically
      nodes.sort((a, b) => {
        if (a.order && b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
      });
      
      // Only reassign order numbers to nodes that don't have one
      let nextOrder = Math.max(0, ...nodes.map(n => n.order || 0)) + 1;
      nodes.forEach((node) => {
        if (!node.order || node.order === 0) {
          node.order = nextOrder++;
        }
        tree.push(node);
      });

      console.log('Built tree from filesystem:', tree);
      return tree;
    } catch (e) {
      console.warn('buildTreeFromFilesystem failed', e);
      return [];
    }
  }

  /**
   * Reorder tree nodes after drag and drop
   * Handles physical file movement in vault when parent changes
   */
  async reorderTreeNodes(book, draggedNodeId, targetNodeId, position) {
    try {
      const cfg = (await this.configService.loadBookConfig(book)) || {};
      if (!cfg.structure) cfg.structure = {};
      if (!cfg.structure.tree) cfg.structure.tree = [];

      const tree = cfg.structure.tree;
      
      // Find nodes recursively
      const findNode = (nodes, id, parent = null) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            return { node: nodes[i], parent, index: i, siblings: nodes };
          }
          if (nodes[i].children) {
            const result = findNode(nodes[i].children, id, nodes[i]);
            if (result) return result;
          }
        }
        return null;
      };

      const draggedInfo = findNode(tree, draggedNodeId);
      const targetInfo = findNode(tree, targetNodeId);

      if (!draggedInfo || !targetInfo) {
        console.warn('Could not find nodes for reorder', { draggedNodeId, targetNodeId });
        return false;
      }

      // Remove dragged node from its current position
      draggedInfo.siblings.splice(draggedInfo.index, 1);

      // Insert at new position
      if (position === 'inside' && targetInfo.node.type === 'group') {
        // Moving INTO a folder
        const oldPath = `${book.path}/${draggedInfo.node.path}`;
        const fileName = draggedInfo.node.path.split('/').pop();
        const newPath = `${targetInfo.node.path}/${fileName}`;
        
        try {
          const fileToMove = this.app.vault.getAbstractFileByPath(oldPath);
          if (fileToMove) {
            await this.app.fileManager.renameFile(fileToMove, `${book.path}/${newPath}`);
            draggedInfo.node.path = newPath;
          }
        } catch (e) {
          console.warn('Failed to move file in vault:', e);
          return false;
        }
        
        // Add to target's children
        if (!targetInfo.node.children) targetInfo.node.children = [];
        targetInfo.node.children.push(draggedInfo.node);
      } else {
        // Moving BEFORE or AFTER (might be changing parent level)
        const draggedParentPath = draggedInfo.node.path.split('/').slice(0, -1).join('/');
        const targetParentPath = targetInfo.node.path.split('/').slice(0, -1).join('/');
        
        // If parent paths differ, we need to physically move the file
        if (draggedParentPath !== targetParentPath) {
          const oldPath = `${book.path}/${draggedInfo.node.path}`;
          const fileName = draggedInfo.node.path.split('/').pop();
          const newPath = targetParentPath ? `${targetParentPath}/${fileName}` : fileName;
          
          try {
            const fileToMove = this.app.vault.getAbstractFileByPath(oldPath);
            if (fileToMove) {
              await this.app.fileManager.renameFile(fileToMove, `${book.path}/${newPath}`);
              draggedInfo.node.path = newPath;
            }
          } catch (e) {
            console.warn('Failed to move file to new level:', e);
            return false;
          }
        }
        
        // Find target's new index after removal (in case it shifted)
        const newTargetIndex = targetInfo.siblings.findIndex(n => n.id === targetNodeId);
        if (newTargetIndex === -1) return false;

        const insertIndex = position === 'before' ? newTargetIndex : newTargetIndex + 1;
        targetInfo.siblings.splice(insertIndex, 0, draggedInfo.node);
      }

      // Reorder all nodes
      const reorderNodes = (nodes) => {
        nodes.forEach((node, idx) => {
          node.order = idx + 1;
          node.last_modified = new Date().toISOString();
          if (node.children) reorderNodes(node.children);
        });
      };
      reorderNodes(tree);

      // Save updated tree
      await this.configService.saveBookConfig(book, cfg);
      return true;
    } catch (e) {
      console.warn('reorderTreeNodes failed', e);
      return false;
    }
  }

  /**
   * Mark a chapter as complete/incomplete
   * Updates both frontmatter and config tree
   */
  async markChapterComplete(book, file, completed) {
    try {
      // Update frontmatter
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        fm.is_done = completed;
      });

      // Update config tree
      const cfg = (await this.configService.loadBookConfig(book)) || {};
      if (!cfg.structure?.tree) return;

      const relativePath = file.path.replace(book.path + '/', '');
      
      const updateNode = (nodes) => {
        for (const node of nodes) {
          if (node.path === relativePath) {
            node.completed = completed;
            node.last_modified = new Date().toISOString();
            return true;
          }
          if (node.children && updateNode(node.children)) {
            return true;
          }
        }
        return false;
      };

      if (updateNode(cfg.structure.tree)) {
        await this.configService.saveBookConfig(book, cfg);
      }
    } catch (e) {
      console.warn('markChapterComplete failed', e);
    }
  }

  /**
   * Exclude/include a chapter from stats
   * Updates both frontmatter and config tree
   */
  async excludeFromStats(book, file, exclude) {
    try {
      // Update frontmatter
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        fm.exclude_from_stats = exclude;
      });

      // Update config tree
      const cfg = (await this.configService.loadBookConfig(book)) || {};
      if (!cfg.structure?.tree) return;

      const relativePath = file.path.replace(book.path + '/', '');
      
      const updateNode = (nodes) => {
        for (const node of nodes) {
          if (node.path === relativePath) {
            node.exclude = exclude;
            node.last_modified = new Date().toISOString();
            return true;
          }
          if (node.children && updateNode(node.children)) {
            return true;
          }
        }
        return false;
      };

      if (updateNode(cfg.structure.tree)) {
        await this.configService.saveBookConfig(book, cfg);
      }
    } catch (e) {
      console.warn('excludeFromStats failed', e);
    }
  }
}
