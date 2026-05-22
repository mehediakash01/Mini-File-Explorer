'use client';

// Sidebar container
import { HardDrive } from 'lucide-react';
import { useFileSystem } from '@/context/FileSystemContext';
import { TreeItem } from './TreeItem';

export function TreeView() {
  const { nodes, currentFolderId, navigateTo } = useFileSystem();

  // Root folders only
  const rootFolders = Object.values(nodes).filter(
    (n) => n.type === 'folder' && n.parentId === null,
  );

  const isRootActive = currentFolderId === null;

  return (
    <aside className="flex flex-col h-full w-60 bg-zinc-950 border-r border-zinc-800/70 select-none shrink-0">

      {/* Panel label */}
      <div className="px-4 py-3 border-b border-zinc-800/70">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Explorer
        </span>
      </div>

      {/* Root button */}
      <button
        onClick={() => navigateTo(null)}
        className={`
          flex items-center gap-2 w-full px-3 py-2 text-sm
          transition-colors duration-150
          ${isRootActive
            ? 'bg-indigo-500/15 text-indigo-300'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          }
        `}
      >
        <HardDrive
          size={15}
          className={isRootActive ? 'text-indigo-400' : 'text-zinc-500'}
        />
        <span className="font-semibold tracking-tight">Root Directory</span>
      </button>

      {/* Divider */}
      <div className="mx-3 border-t border-zinc-800/60" />

      {/* Folder tree */}
      <nav className="flex-1 overflow-y-auto py-1 px-1 space-y-px">
        {rootFolders.map((folder) => (
          <TreeItem key={folder.id} nodeId={folder.id} depth={1} />
        ))}
      </nav>

    </aside>
  );
}
