'use client';

// Breadcrumb navigation bar
import { ChevronRight, HardDrive } from 'lucide-react';
import { useFileSystem } from '@/context/FileSystemContext';
import type { FileNode } from '@/types/fileSystem.types';

export function Breadcrumbs() {
  const { currentFolderId, getBreadcrumbs, navigateTo } = useFileSystem();

  // Build path segments from root to current folder
  const crumbs: FileNode[] = getBreadcrumbs(currentFolderId);

  return (
    <nav
      aria-label="Folder path"
      className="flex items-center gap-0.5 px-4 py-2.5 border-b border-zinc-800/70 overflow-x-auto shrink-0"
    >
      {/* Root segment */}
      <button
        onClick={() => navigateTo(null)}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
          transition-colors duration-150 whitespace-nowrap shrink-0
          ${currentFolderId === null
            ? 'text-indigo-300 bg-indigo-500/10'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }
        `}
      >
        <HardDrive size={12} className="shrink-0" />
        <span>Root</span>
      </button>

      {/* Dynamic folder segments */}
      {crumbs.map((crumb) => (
        <span key={crumb.id} className="flex items-center gap-0.5 shrink-0">
          {/* Separator chevron */}
          <ChevronRight size={12} className="text-zinc-700 shrink-0" />

          <button
            onClick={() => navigateTo(crumb.id)}
            className={`
              px-2 py-1 rounded-md text-xs font-medium
              transition-colors duration-150 whitespace-nowrap
              ${currentFolderId === crumb.id
                ? 'text-indigo-300 bg-indigo-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }
            `}
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
