'use client';
// Root workspace — three-pane IDE layout

// Root layout — three-pane file explorer workspace
import { FileSystemProvider } from '@/context/FileSystemContext';
import { TreeView } from '@/components/FileExplorer/Sidebar/TreeView';
import { MainPanel } from '@/components/FileExplorer/MainPanel';
import { TextEditor } from '@/components/FileExplorer/Editor/TextEditor';
import { useFileSystem } from '@/context/FileSystemContext';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Inner layout reads openFileId to control the editor pane width
function WorkspaceLayout() {
  const { openFileId, isHydrated } = useFileSystem();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const editorOpen = openFileId !== null;

  if (!isHydrated) {
    return (
      <div className="dark flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-medium tracking-widest uppercase">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 relative">
      {/* ── Mobile Sidebar Backdrop ── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <TreeView />
      </div>

      {/* ── Main content pane ──────────────────────────────────────── */}
      <main className="flex flex-col flex-1 overflow-hidden relative">
        {/* Mobile Header Toolbar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-zinc-800/70 bg-zinc-950 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={18} />
          </Button>
          <span className="ml-3 font-semibold text-zinc-200">Mini File Explorer</span>
        </div>

        <div className="flex flex-1 overflow-hidden transition-all duration-200 relative">
          {/* Folder grid — hidden on mobile when editor open, shrinks on desktop */}
          <div
            className={`
              flex flex-col overflow-hidden transition-all duration-200 ease-in-out
              ${editorOpen ? 'hidden md:flex md:w-[340px] shrink-0' : 'flex-1'}
            `}
          >
            <MainPanel />
          </div>

          {/* Editor panel — slides in over grid on mobile, flex-1 on desktop */}
          <div
            className={`
              absolute inset-0 md:relative md:inset-auto bg-zinc-950
              flex flex-col overflow-hidden transition-all duration-200 ease-in-out
              ${editorOpen ? 'translate-x-0 flex-1' : 'translate-x-full md:translate-x-0 w-0'}
            `}
          >
            <TextEditor />
          </div>
        </div>
      </main>
    </div>
  );
}

// Provider wrapper — must sit above WorkspaceLayout so hooks can read context
export default function Home() {
  return (
    <FileSystemProvider>
      <WorkspaceLayout />
    </FileSystemProvider>
  );
}