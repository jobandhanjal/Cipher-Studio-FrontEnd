import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

// File type icons
const icons = {
  js: "📄",
  css: "🎨",
  folder: "📁",
  default: "📄",
};

const getIcon = (file) => {
  if (file.type === "folder") return icons.folder;
  if (file.path.endsWith(".js")) return icons.js;
  if (file.path.endsWith(".css")) return icons.css;
  return icons.default;
};

const FileItem = ({ file, isActive }) => {
  const { setActiveFile, handleDeleteFile, handleRenameFile } = useProject();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const newName = e.target.elements.newName.value;
    if (newName && newName !== file.path) {
      handleRenameFile(file.path, newName);
    }
    setIsRenaming(false);
  };

  return (
    <li 
      className={`flex items-center group px-2 py-1 rounded cursor-pointer ${
        isActive ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
      }`}
      onClick={() => file.type === 'file' && setActiveFile(file.path)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <span className="mr-2">{getIcon(file)}</span>
      
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex-1">
          <input
            name="newName"
            defaultValue={file.path.replace(/^\//, '').replace(/\/$/, '')}
            className="bg-gray-800 px-1 py-0.5 rounded w-full"
            autoFocus
            onBlur={() => setIsRenaming(false)}
          />
        </form>
      ) : (
        <div className="flex justify-between items-center flex-1">
          <span className="truncate">
            {file.path.replace(/^\//, '').replace(/\/$/, '')}
          </span>
          
          {showActions && (
            <div className="flex gap-2 text-gray-400">
              <button
                className="hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
              >
                ✏️
              </button>
              <button
                className="hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.path);
                }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default FileItem;