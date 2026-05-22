'use client';

// Grid view — folder contents with file/folder cards
import { useState, useRef } from 'react';
import { Folder, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFileSystem } from '@/context/FileSystemContext';
import type { FileNode } from '@/types/fileSystem.types';
import { NodeActionMenu } from './NodeActionMenu';

const INVALID_CHARS = /[\\/:*?"<>|]/;

// Single card item
function NodeCard({ node }: { node: FileNode }) {
  const { navigateTo, openFile, selectNode, selectedNodeId, renameNode, deleteNode } = useFileSystem();

  const isSelected = selectedNodeId === node.id;
  const isFolder = node.type === 'folder';

  // Dialog states
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftName, setDraftName] = useState(node.name);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Click tracking for double-click detection
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    selectNode(node.id);

    if (isFolder) {
      // Double-click enters folder; single-click just selects
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
        navigateTo(node.id);
      } else {
        clickTimer.current = setTimeout(() => {
          clickTimer.current = null;
        }, 280);
      }
    } else {
      openFile(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'F2') {
      e.preventDefault();
      e.stopPropagation();
      openRename();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      setDeleteOpen(true);
    }
  };

  const openRename = () => {
    setDraftName(node.name);
    setError('');
    setRenameOpen(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 60);
  };

  const handleRename = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    if (INVALID_CHARS.test(trimmed)) {
      setError('A file name cannot contain any of the following characters: \\ / : * ? " < > |');
      return;
    }
    renameNode(node.id, trimmed);
    setRenameOpen(false);
  };

  const handleDelete = () => {
    deleteNode(node.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={node.name}
        title={isFolder ? 'Double-click to open' : 'Click to open'}
        className={`
          group/card relative flex flex-col items-center gap-2.5 p-3.5 rounded-xl
          border transition-all duration-200 cursor-pointer select-none outline-none
          focus-visible:ring-2 focus-visible:ring-indigo-500/50
          ${isSelected
            ? 'border-indigo-500/40 bg-indigo-500/8 shadow-sm shadow-indigo-500/10'
            : 'border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/70 hover:bg-zinc-800/40'
          }
        `}
      >
        {/* Action menu — appears on hover */}
        <div className="absolute top-2 right-2 z-10">
          <NodeActionMenu 
            nodeName={node.name} 
            onRename={openRename} 
            onDelete={() => setDeleteOpen(true)} 
          />
        </div>

        {/* Icon */}
        <div className={`
          flex items-center justify-center w-11 h-11 rounded-xl
          ${isFolder
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-indigo-500/10 text-indigo-400'
          }
        `}>
          {isFolder
            ? <Folder size={22} className="group-hover/card:hidden" />
            : <FileText size={22} />
          }
          {isFolder && <FolderOpen size={22} className="hidden group-hover/card:block" />}
        </div>

        {/* Name */}
        <span className={`
          w-full text-center text-xs font-medium leading-tight truncate px-1
          transition-colors duration-150
          ${isSelected ? 'text-indigo-200' : 'text-zinc-300 group-hover/card:text-zinc-100'}
        `}>
          {node.name}
        </span>

        {/* File type badge */}
        {!isFolder && (
          <span className="text-[10px] text-zinc-600 -mt-1 uppercase tracking-wide">
            {node.name.includes('.') ? node.name.split('.').pop() : 'file'}
          </span>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent aria-describedby={undefined} onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>

          <div>
            <Input
              ref={inputRef}
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setRenameOpen(false);
              }}
              placeholder="New name…"
              className="mt-1"
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!draftName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent aria-describedby={undefined} onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete {isFolder ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-zinc-200">{node.name}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20 select-none">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800/50 text-zinc-700">
        <FolderOpen size={26} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-zinc-500">This folder is empty</p>
        <p className="text-xs text-zinc-700">Use the buttons above to add files or folders</p>
      </div>
    </div>
  );
}

// Grid view
export function GridView() {
  const { currentFolderId, getChildren } = useFileSystem();
  const children = getChildren(currentFolderId);

  if (children.length === 0) return <EmptyState />;

  // Folders first, then files (already sorted by context)
  return (
    <div
      className="grid gap-2.5 p-4 content-start flex-1 overflow-y-auto"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
      }}
    >
      {children.map((node) => (
        <NodeCard key={node.id} node={node} />
      ))}
    </div>
  );
}
