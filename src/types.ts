export interface Document {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  type: string;
  size: number;
  url: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  type: 'highlight' | 'comment';
  content: string;
  position: {
    page: number;
    x: number;
    y: number;
  };
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}