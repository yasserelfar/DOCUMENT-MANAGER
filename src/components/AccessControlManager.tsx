import React, { useState } from 'react';

export type PermissionLevel = 'view' | 'edit' | 'download';

export interface ACLItem {
  userId: string;
  permission: PermissionLevel;
}

interface AccessControlManagerProps {
  documentId: string;
  acl: ACLItem[];
  onUpdateACL: (acl: ACLItem[]) => void;
}

const AccessControlManager: React.FC<AccessControlManagerProps> = ({
  acl,
  onUpdateACL,
}) => {
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('view');
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const resetForm = () => {
    setUserId('');
    setPermission('view');
    setEditUserId(null);
  };

  const handleAddACL = () => {
    if (!userId) return;
    if (acl.find(item => item.userId === userId)) return;
    const newEntry: ACLItem = { userId, permission };
    onUpdateACL([...acl, newEntry]);
    resetForm();
  };

  const handleEditACL = (userIdToEdit: string) => {
    const user = acl.find(item => item.userId === userIdToEdit);
    if (user) {
      setUserId(user.userId);
      setPermission(user.permission);
      setEditUserId(user.userId);
    }
  };

  const handleSaveEdit = () => {
    if (!editUserId) return;
    const updatedACL = acl.map(item =>
      item.userId === editUserId ? { ...item, permission } : item
    );
    onUpdateACL(updatedACL);
    resetForm();
  };

  const handleRemoveACL = (userIdToRemove: string) => {
    const updatedACL = acl.filter(item => item.userId !== userIdToRemove);
    onUpdateACL(updatedACL);
    if (editUserId === userIdToRemove) {
      resetForm();
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">Access Control</h3>
      <div className="mb-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-2 py-1 border rounded"
          disabled={!!editUserId}
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as PermissionLevel)}
          className="px-2 py-1 border rounded"
        >
          <option value="view">View</option>
          <option value="edit">Edit</option>
          <option value="download">Download</option>
        </select>
        {editUserId ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleAddACL}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Add
          </button>
        )}
      </div>
      {editUserId && (
        <div className="mb-2 text-sm text-blue-700">Editing permissions for user: <strong>{editUserId}</strong></div>
      )}
      <ul>
        {acl.map((item, index) => (
          <li key={index} className="flex items-center justify-between">
            <span>
              User: {item.userId} - Permission: {item.permission}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleEditACL(item.userId)} className="text-blue-500">Edit</button>
              <button onClick={() => handleRemoveACL(item.userId)} className="text-red-500">Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccessControlManager;
