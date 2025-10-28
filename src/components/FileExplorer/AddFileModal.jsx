import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Text from '../Text';
import Button from '../Button';

const AddFileModal = ({ isOpen, onClose, type = 'file' }) => {
  const { handleCreateFile, files } = useProject();
  const [error, setError] = useState('');
  const [parent, setParent] = useState('/');

  // Build available folder options from existing files
  const folderOptions = (() => {
    const set = new Set();
    set.add('/');
    (files || []).forEach((f) => {
      const p = f.path.replace(/^\//, '');
      const parts = p.split('/').filter(Boolean);
      let acc = '';
      parts.slice(0, -1).forEach((part) => {
        acc = acc ? `${acc}/${part}` : part;
        set.add('/' + acc + '/');
      });
      // if this file itself is a folder, include it
      if (f.type === 'folder') {
        const folderPath = f.path.startsWith('/') ? f.path : '/' + f.path;
        set.add(folderPath.endsWith('/') ? folderPath : folderPath + '/');
      }
    });
    return Array.from(set).sort();
  })();
  
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
    
    // Create file/folder under chosen parent
    try {
      handleCreateFile(finalName, type, parent);
    } catch (err) {
      setError(err.message || 'Failed to create');
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    // z-50 ensures the modal overlays other panel/content stacking contexts
    <div className="modal-overlay">
      <div className="modal-card">
        <Text as="h2" variant="heading" className="text-xl font-semibold mb-4">
          Create New {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Text as="label" variant="label" htmlFor="fileName" className="block text-sm font-medium mb-2">
              {type.charAt(0).toUpperCase() + type.slice(1)} Name
            </Text>
            <input
              type="text"
              id="fileName"
              name="fileName"
              className="input"
              placeholder={type === 'file' ? 'Example.js' : 'ExampleFolder'}
              autoFocus
            />
            {error && <Text as="p" variant="small" className="text-red-400 text-sm mt-1">{error}</Text>}
          </div>
          <div className="mb-4">
            <Text as="label" variant="label" htmlFor="parent" className="block text-sm font-medium mb-2">Parent Folder</Text>
            <select
              id="parent"
              name="parent"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="select"
            >
              {folderOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="primary"><Text as="span" variant="label">Cancel</Text></Button>
            <Button type="submit" variant="primary"><Text as="span" variant="label" allowColorOverride>Create</Text></Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFileModal;