import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

const AddFileModal = ({ isOpen, onClose, type = 'file' }) => {
  const { handleCreateFile } = useProject();
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const fileName = e.target.elements.fileName.value;
    
    // Validation
    if (!fileName) {
      setError('File name is required');
      return;
    }
    
    // Add extension if not provided for files
    let finalName = fileName;
    if (type === 'file' && !fileName.includes('.')) {
      finalName = `${fileName}.js`;
    }
    
    // Create file/folder
    handleCreateFile(finalName, type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">
          Create New {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fileName" className="block text-sm font-medium mb-2">
              {type.charAt(0).toUpperCase() + type.slice(1)} Name
            </label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              className="w-full bg-gray-700 rounded px-3 py-2"
              placeholder={type === 'file' ? 'Example.js' : 'ExampleFolder'}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFileModal;