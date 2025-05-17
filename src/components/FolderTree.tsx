import React from 'react';
import { Folder as FolderIcon, ChevronRight, ChevronDown, File as FileIcon } from 'lucide-react';
import type { Folder } from '../types';
import type { Document } from '../types';

interface FolderTreeProps {
  folders: Folder[];
  documents: Document[];
  selectedFolder?: string;
  onFolderSelect: (folderId: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  documents,
  selectedFolder,
  onFolderSelect,
}) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpanded(newExpanded);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    // تصفية المجلدات الفرعية
    const children = folders.filter(f => f.parentId === folder.id);
    // تصفية الملفات التي تنتمي للمجلد الحالي
    const folderFiles = documents.filter(doc => doc.folderId === folder.id);
    const isExpanded = expanded.has(folder.id);

    return (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer ${selectedFolder === folder.id ? 'bg-blue-50' : ''}`}
          onClick={() => onFolderSelect(folder.id)}
        >
          {(children.length > 0 || folderFiles.length > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <FolderIcon className="w-5 h-5 text-yellow-500 mr-2" />
          <span>{folder.name}</span>
        </div>
        {isExpanded && (
          <div>
            {/* عرض الملفات الموجودة في هذا المجلد */}
            {folderFiles.map(doc => (
              <div
                key={doc.id}
                style={{ marginLeft: '16px' }}
                className="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => onFolderSelect(folder.id)}
              >
                <FileIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{doc.title}</span>
              </div>
            ))}
            {/* عرض المجلدات الفرعية */}
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <div className="w-64 border-r p-4">
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  );
};
