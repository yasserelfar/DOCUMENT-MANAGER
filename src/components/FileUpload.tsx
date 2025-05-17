import React, { useCallback, useState } from 'react';
import { Upload, X, Tag as TagIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File, metadata: FileMetadata, storedId: string) => void;
  acceptedTypes: string[];
  maxSize: number;
}

interface FileMetadata {
  title: string;
  description: string;
  tags: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes,
  maxSize,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata>({
    title: '',
    description: '',
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      setSelectedFile(file);
      setMetadata(prev => ({ ...prev, title: file.name }));
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!file) return false;
    
    const fileType = file.type;
    if (!acceptedTypes.includes(fileType)) {
      alert('File type not supported');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size too large');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setMetadata(prev => ({ ...prev, title: file.name }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !metadata.tags.includes(currentTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // دالة لتخزين الملف في localStorage (كمثال)
  const storeFile = (file: File, metadata: FileMetadata): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result;
        if (base64Data) {
          // generate a unique id using current time and a random string
          const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
          const fileObject = {
            id: uniqueId,
            fileData: base64Data,
            metadata: metadata,
          };
          // هنا بنخزن الملف مع البيانات في localStorage كـ JSON string
          localStorage.setItem(uniqueId, JSON.stringify(fileObject));
          resolve(uniqueId);
        } else {
          reject('Error reading file');
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && metadata.title) {
      try {
        // هنا بنخزن الملف وناخد الـ uniqueId
        const storedId = await storeFile(selectedFile, metadata);
        console.log("File stored with unique id: ", storedId);
        // بنادي الدالة اللي بتمرر الملف والميتا داتا والـ uniqueId للسيرفر (أو لأي استخدام)
        onFileSelect(selectedFile, metadata, storedId);
        // بنعيد الحالة للوضع الافتراضي
        setSelectedFile(null);
        setMetadata({ title: '', description: '', tags: [] });
      } catch (error) {
        console.error(error);
        alert("There was an error storing the file");
      }
    }
  };

  if (!selectedFile) {
    return (
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">Drag and drop your files here</p>
        <p className="text-sm text-gray-500">or</p>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          Select File
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Upload className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{selectedFile.name}</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedFile(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={metadata.description}
          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {metadata.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
            >
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-700 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Upload Document
        </button>
      </div>
    </form>
  );
};
