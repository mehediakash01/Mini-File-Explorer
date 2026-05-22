'use client';

// Main panel — header toolbar + breadcrumbs + grid
import { useState, useRef } from 'react';
import { FolderPlus, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFileSystem } from '@/context/FileSystemContext';
import { Breadcrumbs } from './Breadcrumbs';
import { GridView } from './GridView';
import type { NodeType } from '@/types/fileSystem.types';

// Shared creation dialog — new folder or new file
function CreateNodeDialog({
  open,
  onOpenChange,
  nodeType,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nodeType: NodeType;
}) {
  const { createNode, currentFolderId } = useFileSystem();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  const handleOpen = (v: boolean) => {
    if (v) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
    onOpenChange(v);
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    if (/[\\/:*?"<>|]/.test(trimmed)) {
      setError('A name cannot contain any of the following characters: \\ / : * ? " < > |');
      return;
    }
    createNode(trimmed, nodeType, currentFolderId);
    onOpenChange(false);
    setName('');
    setError('');
  };

  const label = nodeType === 'folder' ? 'New Folder' : 'New File';

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div>
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') onOpenChange(false);
            }}
            placeholder={nodeType === 'folder' ? 'Folder name…' : 'File name…'}
            className="mt-1"
          />
          {error && (
            <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exported main panel
export function MainPanel() {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 h-full bg-zinc-950 overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/70 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Contents
        </span>

        <div className="flex items-center gap-1.5">
          {/* New folder */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFolderDialogOpen(true)}
            className="gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          >
            <FolderPlus size={13} />
            New Folder
          </Button>

          {/* New file */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFileDialogOpen(true)}
            className="gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          >
            <FilePlus size={13} />
            New File
          </Button>
        </div>
      </div>

      {/* Breadcrumb path */}
      <Breadcrumbs />

      {/* File / folder grid */}
      <GridView />

      {/* Creation dialogs */}
      <CreateNodeDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        nodeType="folder"
      />
      <CreateNodeDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        nodeType="file"
      />
    </div>
  );
}
