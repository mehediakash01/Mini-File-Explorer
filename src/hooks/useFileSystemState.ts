'use client';


import { useState, useEffect, useCallback } from 'react';

import type {
  FileNode,
  FileSystemContextProps,
  FileSystemState,
  NodeType,
} from '@/types/fileSystem.types';

// Constants

const STORAGE_KEY = 'mini-file-explorer:fs-state';
const STORAGE_VERSION = 1; 

/** Wraps the persisted payload so we can detect stale versions. */
interface StorageEnvelope {
  version: number;
  nodes: FileSystemState;
}

// ID generation

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: RFC-4122 v4 UUID built from Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Seed data


function buildInitialState(): FileSystemState {
  const now = Date.now();

  // Pre-generate stable IDs so cross-references (parentId) are consistent.
  const id = {
    projects:     generateId(),
    webDev:       generateId(),
    design:       generateId(),
    readme:       generateId(),
    todo:         generateId(),
    ideas:        generateId(),
    designNotes:  generateId(),
  } as const;

  return {
    // Folders
    [id.projects]: {
      id:        id.projects,
      name:      'Projects',
      type:      'folder',
      parentId:  null,
      createdAt: now - 1_200_000,
      updatedAt: now - 1_200_000,
    },
    [id.webDev]: {
      id:        id.webDev,
      name:      'Web Dev',
      type:      'folder',
      parentId:  id.projects,
      createdAt: now - 900_000,
      updatedAt: now - 900_000,
    },
    [id.design]: {
      id:        id.design,
      name:      'Design',
      type:      'folder',
      parentId:  id.projects,
      createdAt: now - 800_000,
      updatedAt: now - 800_000,
    },

    // Files
    [id.readme]: {
      id:        id.readme,
      name:      'readme.txt',
      type:      'file',
      parentId:  null,
      content:   [
        '# Mini File Explorer',
        '',
        'Welcome! This is a fast, flat-map-powered file explorer.',
        '',
        'Browse folders in the sidebar, click any file to view its content,',
        'and use the toolbar to create, rename, or delete nodes.',
      ].join('\n'),
      createdAt: now - 1_100_000,
      updatedAt: now - 1_100_000,
    },
    [id.todo]: {
      id:        id.todo,
      name:      'todo.txt',
      type:      'file',
      parentId:  id.webDev,
      content:   [
        '[ ] Set up project scaffolding',
        '[ ] Configure ESLint + Prettier',
        '[ ] Build file-explorer state engine',
        '[x] Define TypeScript types',
        '[x] Wire up localStorage persistence',
      ].join('\n'),
      createdAt: now - 700_000,
      updatedAt: now - 700_000,
    },
    [id.ideas]: {
      id:        id.ideas,
      name:      'ideas.txt',
      type:      'file',
      parentId:  id.webDev,
      content:   [
        'Feature backlog:',
        '  • Drag-and-drop reordering',
        '  • Multi-select with Shift+Click',
        '  • Keyboard navigation (arrow keys + Enter)',
        '  • Fuzzy search / filter bar',
        '  • Dark / light theme toggle',
        '  • Export tree as ZIP',
      ].join('\n'),
      createdAt: now - 600_000,
      updatedAt: now - 600_000,
    },
    [id.designNotes]: {
      id:        id.designNotes,
      name:      'design-notes.txt',
      type:      'file',
      parentId:  id.design,
      content:   [
        'Color palette:',
        '  Primary ── #6366f1  (Indigo 500)',
        '  Surface ── #1e1e2e',
        '  Border  ── #313244',
        '  Success ── #22c55e',
        '  Danger  ── #f87171',
        '',
        'Typography:',
        '  Headings ── Inter 600',
        '  Body     ── Inter 400',
        '  Mono     ── JetBrains Mono 400',
      ].join('\n'),
      createdAt: now - 500_000,
      updatedAt: now - 500_000,
    },
  };
}

// localStorage helpers


function loadFromStorage(): FileSystemState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const envelope = JSON.parse(raw) as StorageEnvelope;

    if (envelope.version !== STORAGE_VERSION) {
      // Schema has changed — discard stale data rather than risk corruption.
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const { nodes } = envelope;

    // Basic sanity check: must be a plain object (not an array or primitive).
    if (typeof nodes !== 'object' || nodes === null || Array.isArray(nodes)) {
      return null;
    }

    return nodes;
  } catch {
    console.warn('[FileExplorer] Could not parse localStorage state — reverting to defaults.');
    return null;
  }
}

/** Serialises the current state to localStorage, silently swallowing quota errors. */
function saveToStorage(nodes: FileSystemState): void {
  try {
    const envelope: StorageEnvelope = { version: STORAGE_VERSION, nodes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    console.warn('[FileExplorer] Could not persist state to localStorage.');
  }
}

// Tree utilities

function collectSubtreeIds(rootId: string, state: FileSystemState): Set<string> {
  const ids = new Set<string>();
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    ids.add(currentId);

    // Find and enqueue all direct children of the current node.
    for (const node of Object.values(state)) {
      if (node.parentId === currentId) {
        queue.push(node.id);
      }
    }
  }

  return ids;
}


function getSortedChildren(parentId: string | null, state: FileSystemState): FileNode[] {
  return Object.values(state)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => {
      // Folders before files.
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      // Alphabetical within the same type.
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
}

// Hook


export function useFileSystemState(): FileSystemContextProps {
  // State slices

  // Always start with seed so server and client render identical HTML (no hydration mismatch).
  // localStorage is applied in a useEffect after the first mount.
  const [nodes, setNodes] = useState<FileSystemState>(buildInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  /** The folder whose contents are displayed in the main panel. */
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  /** The node that is visually highlighted / focused in the explorer list. */
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  /** The file whose content is rendered in the preview / editor panel. */
  const [openFileId, setOpenFileId] = useState<string | null>(null);

  // Persistence

  // Rehydrate from localStorage after mount — must run before the save effect.
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setNodes(stored);
    setIsHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every state change after the initial rehydration.
  useEffect(() => {
    saveToStorage(nodes);
  }, [nodes]);

  // Derived helpers

  const getNode = useCallback(
    (id: string): FileNode | undefined => nodes[id],
    [nodes],
  );

  const getChildren = useCallback(
    (parentId: string | null): FileNode[] => getSortedChildren(parentId, nodes),
    [nodes],
  );

  const getBreadcrumbs = useCallback(
    (folderId: string | null): FileNode[] => {
      const trail: FileNode[] = [];
      let cursor = folderId;

      while (cursor !== null) {
        const node = nodes[cursor];
        if (!node) break; 

        trail.unshift(node); 
        cursor = node.parentId;
      }

      return trail;
    },
    [nodes],
  );

  // Mutations

  const createNode = useCallback(
    (rawName: string, type: NodeType, parentId: string | null): FileNode => {
      const now = Date.now();

      
      const baseName = rawName.trim() || (type === 'folder' ? 'New Folder' : 'New File');

     
      const siblingNames = new Set(
        Object.values(nodes)
          .filter((n) => n.parentId === parentId)
          .map((n) => n.name),
      );

     
      const resolvedName = siblingNames.has(baseName) ? `${baseName} (New)` : baseName;

      const newNode: FileNode = {
        id:        generateId(),
        name:      resolvedName,
        type,
        parentId,
       
        ...(type === 'file' ? { content: '' } : {}),
        createdAt: now,
        updatedAt: now,
      };

      setNodes((prev) => ({ ...prev, [newNode.id]: newNode }));

      return newNode;
    },
    [nodes],
  );

  const renameNode = useCallback((id: string, newName: string): void => {
    const trimmed = newName.trim();
    if (!trimmed) return; 

    setNodes((prev) => {
      const target = prev[id];
      if (!target) return prev; 

      return {
        ...prev,
        [id]: { ...target, name: trimmed, updatedAt: Date.now() },
      };
    });
  }, []);

  const deleteNode = useCallback((id: string): void => {
    setNodes((prev) => {
      const target = prev[id];
      if (!target) return prev;

      const toDelete = collectSubtreeIds(id, prev);
      const parentId = target.parentId; 

   
      setCurrentFolderId((cf) =>
        cf !== null && toDelete.has(cf) ? parentId : cf,
      );
      setOpenFileId((of) =>
        of !== null && toDelete.has(of) ? null : of,
      );
      setSelectedNodeId((sn) =>
        sn !== null && toDelete.has(sn) ? null : sn,
      );

      // Build the next state by shallow-copying and removing every affected ID.
      const next = { ...prev };
      for (const deletedId of toDelete) {
        delete next[deletedId];
      }

      return next;
    });
  }, []);

  const updateFileContent = useCallback((id: string, content: string): void => {
    setNodes((prev) => {
      const target = prev[id];

      // Guard: only mutate file nodes.
      if (!target || target.type !== 'file') return prev;

      return {
        ...prev,
        [id]: { ...target, content, updatedAt: Date.now() },
      };
    });
  }, []);

  // Navigation

  const navigateTo = useCallback((folderId: string | null): void => {
    setCurrentFolderId(folderId);
   
    setSelectedNodeId(null);
  }, []);

  const selectNode = useCallback((id: string | null): void => {
    setSelectedNodeId(id);
  }, []);

  const openFile = useCallback((id: string | null): void => {
    setOpenFileId(id);
  }, []);

  // Return

  return {
    isHydrated,
    // State
    nodes,
    currentFolderId,
    selectedNodeId,
    openFileId,

    // Derived helpers
    getNode,
    getChildren,
    getBreadcrumbs,

    // Mutations
    createNode,
    renameNode,
    deleteNode,
    updateFileContent,

    // Navigation
    navigateTo,
    selectNode,
    openFile,
  };
}
