'use client';
// Root workspace — three-pane IDE layout

// Root layout — three-pane file explorer workspace
import { FileSystemProvider } from '@/context/FileSystemContext';
import { TreeView } from '@/components/FileExplorer/Sidebar/TreeView';
import { MainPanel } from '@/components/FileExplorer/MainPanel';
import { TextEditor } from '@/components/FileExplorer/Editor/TextEditor';
import { useFileSystem } from '@/context/FileSystemContext';

// Inner layout reads openFileId to control the editor pane width
function WorkspaceLayout() {
  const { openFileId, isHydrated } = useFileSystem();
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
    <div className="dark flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <TreeView />

      {/* ── Main content pane ──────────────────────────────────────── */}
      <main
        className="flex flex-1 overflow-hidden transition-all duration-200"
      >
        {/* Folder grid — shrinks to make room for editor */}
        <div
          className={`
            flex flex-col overflow-hidden transition-all duration-200 ease-in-out
            ${editorOpen ? 'w-[340px] shrink-0' : 'flex-1'}
          `}
        >
          <MainPanel />
        </div>

        {/* Editor panel — slides in when a file is open */}
        <div
          className={`
            flex flex-col overflow-hidden transition-all duration-200 ease-in-out
            ${editorOpen ? 'flex-1' : 'w-0'}
          `}
        >
          <TextEditor />
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