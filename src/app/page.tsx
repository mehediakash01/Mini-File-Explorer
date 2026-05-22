import { FileSystemProvider } from '@/context/FileSystemContext';
import { TreeView } from '@/components/FileExplorer/Sidebar/TreeView';
import { MainPanel } from '@/components/FileExplorer/MainPanel';

export default function Home() {
  return (
    // Dark-mode wrapper — force dark on entire app
    <div className="dark flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <FileSystemProvider>
        {/* Sidebar */}
        <TreeView />

        {/* Main content area */}
        <main className="flex flex-1 overflow-hidden">
          <MainPanel />
        </main>
      </FileSystemProvider>
    </div>
  );
}