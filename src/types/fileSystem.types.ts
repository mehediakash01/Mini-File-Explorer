export type NodeType = 'folder' | 'file';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  content?: string;
  createdAt: number;
  updatedAt: number;
}

export type FileSystemState = { [id: string]: FileNode };

export interface FileSystemContextProps {
  nodes: FileSystemState;
  currentFolderId: string | null;
  selectedNodeId: string | null;
  openFileId: string | null;

  getChildren: (parentId: string | null) => FileNode[];
  getNode: (id: string) => FileNode | undefined;
  getBreadcrumbs: (folderId: string | null) => FileNode[];

  createNode: (name: string, type: NodeType, parentId: string | null) => FileNode;
  renameNode: (id: string, newName: string) => void;
  deleteNode: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;

  navigateTo: (folderId: string | null) => void;
  selectNode: (id: string | null) => void;
  openFile: (id: string | null) => void;
}
