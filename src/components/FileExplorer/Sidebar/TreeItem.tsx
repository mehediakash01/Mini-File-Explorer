'use client';

// Tree node
import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useFileSystem } from '@/context/FileSystemContext';

interface TreeItemProps {
  nodeId: string;
  depth: number;
  onFolderClick?: (id: string) => void;
}

export function TreeItem({ nodeId, depth, onFolderClick }: TreeItemProps) {
  const { getNode, getChildren, currentFolderId, navigateTo } = useFileSystem();

  // Local expansion state — each node owns its open/closed toggle
  const [isExpanded, setIsExpanded] = useState(false);

  const node = getNode(nodeId);

  // Skip missing nodes and file nodes — sidebar only shows folders
  if (!node || node.type === 'file') return null;

  const isActive   = currentFolderId === nodeId;
  const subFolders = isExpanded
    ? getChildren(nodeId).filter((c) => c.type === 'folder')
    : [];

  // Click — navigate + toggle
  const handleClick = () => {
    navigateTo(nodeId);
    setIsExpanded((prev) => !prev);
    onFolderClick?.(nodeId);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 12}px` }}
        className={`
          group flex items-center gap-1.5 w-full pr-3 py-[5px] text-sm
          transition-colors duration-150 rounded-sm
          ${isActive
            ? 'bg-indigo-500/15 text-indigo-300'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          }
        `}
      >
        {/* Chevron */}
        <span className="flex-shrink-0">
          {isExpanded
            ? <ChevronDown  size={13} className={isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} />
            : <ChevronRight size={13} className={isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} />
          }
        </span>

        {/* Folder icon */}
        <span className="flex-shrink-0">
          {isExpanded
            ? <FolderOpen size={15} className={isActive ? 'text-indigo-400' : 'text-amber-500/70 group-hover:text-amber-400'} />
            : <Folder     size={15} className={isActive ? 'text-indigo-400' : 'text-amber-500/70 group-hover:text-amber-400'} />
          }
        </span>

        {/* Label */}
        <span className="truncate font-medium tracking-tight">{node.name}</span>
      </button>

      {/* Recursive children */}
      {isExpanded && subFolders.length > 0 && (
        <div>
          {subFolders.map((child) => (
            <TreeItem
              key={child.id}
              nodeId={child.id}
              depth={depth + 1}
              onFolderClick={onFolderClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
