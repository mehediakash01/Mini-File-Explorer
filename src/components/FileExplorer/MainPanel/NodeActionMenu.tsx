'use client';

// Per-node context menu — rename / delete
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NodeActionMenuProps {
  nodeName: string;
  onRename: () => void;
  onDelete: () => void;
}

export function NodeActionMenu({ nodeName, onRename, onDelete }: NodeActionMenuProps) {
  return (
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
            onRename();
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
          onSelect={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="gap-2 cursor-pointer"
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
