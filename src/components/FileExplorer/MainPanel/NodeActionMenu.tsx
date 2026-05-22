'use client';

// Per-node context menu — rename / delete
import { useState, useRef } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFileSystem } from '@/context/FileSystemContext';

interface NodeActionMenuProps {
  nodeId: string;
  nodeName: string;
}

export function NodeActionMenu({ nodeId, nodeName }: NodeActionMenuProps) {
  const { renameNode, deleteNode } = useFileSystem();

  // Rename dialog state
  const [renameOpen, setRenameOpen] = useState(false);
  const [draftName, setDraftName] = useState(nodeName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Confirm rename
  const handleRename = () => {
    renameNode(nodeId, draftName);
    setRenameOpen(false);
  };

  // Open rename dialog — pre-fill & select text
  const openRename = () => {
    setDraftName(nodeName);
    setRenameOpen(true);
    // Focus after mount
    setTimeout(() => {
      inputRef.current?.select();
    }, 60);
  };

  return (
    <>
      {/* Action trigger button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-150
                       text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${nodeName}`}
          >
            <MoreHorizontal size={14} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[130px]">
          {/* Rename action */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              openRename();
            }}
            className="gap-2 cursor-pointer"
          >
            <Pencil size={13} className="text-zinc-400" />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete action */}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => deleteNode(nodeId)}
            className="gap-2 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>

          <Input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setRenameOpen(false);
            }}
            placeholder="New name…"
            className="mt-1"
          />

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
    </>
  );
}
