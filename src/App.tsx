import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { FolderTree } from './components/FolderTree';
import { Search, Tag, X } from 'lucide-react';
import type { Document, Folder, ACLItem } from './types';
import FolderManagement from './components/FolderManagement';
import AccessControlManager from './components/AccessControlManager';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Documents', createdAt: new Date() },
    { id: '2', name: 'Images', createdAt: new Date() },
    { id: '3', name: 'Reports', parentId: '1', createdAt: new Date() },
  ]);

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const handleFileSelect = (
    file: File,
    metadata: { title: string; description: string; tags: string[] },
    storedId: string
  ) => {
    const fileUrl = URL.createObjectURL(file);

    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: metadata.title,
      description: metadata.description,
      type: file.type,
      size: file.size,
      url: fileUrl,
      tags: metadata.tags,
      folderId: selectedFolder,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      acl: [] 
    };

    setDocuments(prevDocs => [...prevDocs, newDocument]);
    setSelectedDocument(newDocument);
  };


  const selectedFolderName = folders.find(folder => folder.id === selectedFolder)?.name;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
          <div className="flex items-center gap-4">
            
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <FolderTree
            folders={folders}
            documents={documents} 
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
          />
          <div className="flex-1">
            <FolderManagement folders={folders} onUpdateFolders={setFolders} />
            <div className="mb-4">
              {selectedFolder ? (
                <p className="text-gray-700">
                  Selected Folder: <strong>{selectedFolderName}</strong>
                </p>
              ) : (
                <p className="text-gray-700">Please select a folder to add the file.</p>
              )}
            </div>
            {!selectedDocument && (
              <div className="mb-8">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  acceptedTypes={acceptedTypes}
                  maxSize={10 * 1024 * 1024}
                />
              </div>
            )}
            {documents.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>
                <ul>
                  {documents.map(doc => (
                    <li
                      key={doc.id}
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {doc.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedDocument && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                    <p className="text-sm text-gray-500">
                      {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB • Added{' '}
                      {selectedDocument.createdAt.toLocaleDateString()}
                    </p>
                    {selectedDocument.description && (
                      <p className="text-gray-600 mt-2">{selectedDocument.description}</p>
                    )}
                    {selectedDocument.tags.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {selectedDocument.tags.map(tag => (
                          <div
                            key={tag}
                            className="inline-flex items-center bg-blue-100 text-blue-700 rounded-full"
                          >
                            <span className="px-2 py-1 text-sm">
                              {tag}
                            </span>
                            <button
                              onClick={() => {
                                const newTagValue = prompt('Edit tag', tag);
                                if (newTagValue && newTagValue !== tag) {
                                  const updatedTags = selectedDocument.tags.map(t => 
                                    t === tag ? newTagValue : t
                                  );
                                  const updatedDoc = { ...selectedDocument, tags: updatedTags };
                                  setSelectedDocument(updatedDoc);
                                  setDocuments(prevDocs =>
                                    prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
                                  );
                                }
                              }}
                              className="px-1 hover:text-blue-700"
                            >
                              <Tag className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedTags = selectedDocument.tags.filter(t => t !== tag);
                                const updatedDoc = { ...selectedDocument, tags: updatedTags };
                                setSelectedDocument(updatedDoc);
                                setDocuments(prevDocs =>
                                  prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
                                );
                              }}
                              className="px-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                      </div>
                    )}<button
                              onClick={() => {
                                const newTag = prompt('Add new tag');
                                if (newTag && !selectedDocument.tags.includes(newTag)) {
                                  const updatedTags = [...selectedDocument.tags, newTag];
                                  const updatedDoc = { ...selectedDocument, tags: updatedTags };
                                  setSelectedDocument(updatedDoc);
                                  setDocuments(prevDocs =>
                                    prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
                                  );
                                }
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                            >
                              + Add Tag
                            </button>
                    <AccessControlManager
                      documentId={selectedDocument.id}
                      acl={selectedDocument.acl}
                      onUpdateACL={(updatedACL: ACLItem[]) => {
                        const updatedDoc = { ...selectedDocument, acl: updatedACL };
                        setSelectedDocument(updatedDoc);
                        setDocuments(prevDocs =>
                          prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
                        );
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>
               {selectedDocument && (
              <DocumentViewer
                url={selectedDocument.url}
                type={selectedDocument.type}
              />
            )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
