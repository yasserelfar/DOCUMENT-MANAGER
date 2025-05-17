import React, { useState } from 'react';
import type { Folder } from '../types';

interface FolderManagementProps {
  folders: Folder[];
  onUpdateFolders: (folders: Folder[]) => void;
}

const FolderManagement: React.FC<FolderManagementProps> = ({ folders, onUpdateFolders }) => {
  const [folderName, setFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(undefined);

  // دالة لإنشاء مجلد جديد
  const createFolder = (name: string, parentId?: string): Folder => {
    return {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: new Date(),
    };
  };

  const handleAddFolder = () => {
    if (folderName.trim() === '') return;
    const newFolder = createFolder(folderName, parentFolderId);
    onUpdateFolders([...folders, newFolder]); // تحديث القائمة من App
    setFolderName('');
  };

  // دوال التعديل والحذف (يمكن تعديلها بنفس المنطق)
  const editFolder = (folderId: string, newName: string, newParentId?: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, name: newName, parentId: newParentId } : folder
    );
    onUpdateFolders(updatedFolders);
  };

  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    onUpdateFolders(updatedFolders);
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Manage Folders</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder Name"
          className="px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleAddFolder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Folder
        </button>
      </div>
      <ul>
        {folders.map(folder => (
          <li key={folder.id} className="mb-2 flex items-center justify-between">
            <span>{folder.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newName = prompt('Enter new folder name', folder.name);
                  if (newName) editFolder(folder.id, newName);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderManagement;
