'use client';

// File content editor — workspace panel
import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, X, Code2, CheckCheck, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileSystem } from '@/context/FileSystemContext';

// ── Empty / no-file state ──────────────────────────────────────────────────
function EmptyWorkspace() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 select-none">
      {/* Layered icon ring */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 ring-1 ring-indigo-500/10" />
        <div className="absolute inset-2.5 rounded-xl bg-indigo-500/8 ring-1 ring-indigo-500/15" />
        <Code2 size={28} className="relative text-indigo-400/60" />
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center max-w-[220px]">
        <p className="text-sm font-semibold text-zinc-400 tracking-tight">
          No file open
        </p>
        <p className="text-xs leading-relaxed text-zinc-600">
          Select a text file from the explorer to read or edit its contents.
        </p>
      </div>
    </div>
  );
}

// ── Save indicator badge ───────────────────────────────────────────────────
type SaveState = 'idle' | 'unsaved' | 'saved';

function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'idle') return null;

  if (state === 'saved') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400
                       bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full
                       animate-in fade-in-0 zoom-in-95 duration-200">
        <CheckCheck size={10} />
        Saved
      </span>
    );
  }

  // unsaved
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400/80
                     bg-amber-500/8 border border-amber-500/15 px-2 py-0.5 rounded-full">
      <Circle size={7} className="fill-amber-400 text-amber-400" />
      Unsaved
    </span>
  );
}

// ── Main editor ────────────────────────────────────────────────────────────
export function TextEditor() {
  const { openFileId, openFile, getNode, updateFileContent, nodes } = useFileSystem();

  // Resolve active node
  const activeNode = openFileId ? getNode(openFileId) : undefined;
  const isValidFile = !!activeNode && activeNode.type === 'file';

  // Local draft — decoupled from global state for lag-free typing
  const [draft, setDraft] = useState<string>('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync draft when the active file changes
  useEffect(() => {
    if (!isValidFile || !activeNode) {
      setDraft('');
      setSaveState('idle');
      return;
    }
    // Load persisted content
    setDraft(activeNode.content ?? '');
    setSaveState('idle');

    // Auto-focus textarea
    requestAnimationFrame(() => textareaRef.current?.focus());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFileId]);

  // Derive unsaved state from draft vs. stored content
  useEffect(() => {
    if (!isValidFile || !activeNode) return;
    const stored = activeNode.content ?? '';
    if (draft === stored) {
      setSaveState((s) => (s === 'saved' ? 'saved' : 'idle'));
    } else {
      setSaveState('unsaved');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, nodes]);

  // Persist to global state + show "Saved" badge
  const handleSave = useCallback(() => {
    if (!openFileId || !isValidFile) return;
    updateFileContent(openFileId, draft);
    setSaveState('saved');

    // Reset badge after 2 s
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
  }, [openFileId, isValidFile, draft, updateFileContent]);

  // Ctrl / Cmd + S shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Handle textarea changes — update draft only
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (!isValidFile) {
    return (
      <div className="flex flex-col flex-1 h-full bg-[#0d0d14] border-l border-zinc-800/60">
        <EmptyWorkspace />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[#0d0d14] border-l border-zinc-800/60 overflow-hidden">

      {/* ── File tab bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5
                      border-b border-zinc-800/70 shrink-0">
        {/* Filename + icon */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md
                          bg-indigo-500/10 text-indigo-400 shrink-0">
            <FileText size={13} />
          </div>
          <span className="text-sm font-medium text-zinc-200 truncate">
            {activeNode.name}
          </span>
          <SaveBadge state={saveState} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Manual save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 gap-1.5"
          >
            <CheckCheck size={12} />
            Save
          </Button>

          {/* Close editor panel */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openFile(null)}
            aria-label="Close file"
            className="text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* ── Writing workspace ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col flex-1 overflow-hidden">
        {/* Line-number gutter — decorative */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-10 border-r border-zinc-800/40
                     bg-zinc-950/30 pointer-events-none z-10"
        />

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="
            flex-1 w-full h-full resize-none outline-none border-none
            bg-transparent text-zinc-300 text-sm leading-[1.75]
            font-mono placeholder:text-zinc-700
            pl-14 pr-6 pt-4 pb-6
            selection:bg-indigo-500/25
          "
          placeholder="Start typing…"
          aria-label={`Editor — ${activeNode.name}`}
        />

        {/* Shortcut hint */}
        <div className="absolute bottom-3 right-4 text-[10px] text-zinc-800
                        font-mono select-none pointer-events-none">
          Ctrl + S to save
        </div>
      </div>
    </div>
  );
}
