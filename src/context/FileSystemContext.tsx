'use client';

// File system context — global data pipeline for the explorer

import { createContext, useContext, type ReactNode } from 'react';

import { useFileSystemState } from '@/hooks/useFileSystemState';
import type { FileSystemContextProps } from '@/types/fileSystem.types';

// Context instance — null default forces the safety check in useFileSystem
const FileSystemContext = createContext<FileSystemContextProps | null>(null);

// Provider — mounts the state engine and broadcasts all values down the tree
export function FileSystemProvider({ children }: { children: ReactNode }) {
  const fs = useFileSystemState();

  return (
    <FileSystemContext.Provider value={fs}>
      {children}
    </FileSystemContext.Provider>
  );
}

// Consumer hook — throws a descriptive error when used outside the provider
export function useFileSystem(): FileSystemContextProps {
  const ctx = useContext(FileSystemContext);

  if (ctx === null) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }

  return ctx;
}
