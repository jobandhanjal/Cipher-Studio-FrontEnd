import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Text from '../Text';
import Button from '../Button';

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
  const { handleDeleteFile, handleRenameFile } = useProject();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { setActiveFile } = useProject();

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const newName = e.target.elements.newName.value;
    // Use basename only when renaming
    const oldBase = file.path.replace(/\/$/, '').split('/').pop();
    if (newName && newName !== oldBase) {
      handleRenameFile(file.path, newName);
    }
    setIsRenaming(false);
  };

  return (
    // Use a div here (not <li>) because FileItem is rendered inside a wrapping <li> in the tree.
    <div
      role="listitem"
      className={`flex items-center group file-item ${isActive ? 'file-item--active' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => setActiveFile(file.path)}
    >
  <span className="mr-2">{getIcon(file)}</span>

      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex-1">
          <input
            name="newName"
            defaultValue={file.path.replace(/\/$/, '').split('/').pop()}
            className="input"
            autoFocus
            onBlur={() => setIsRenaming(false)}
          />
        </form>
      ) : (
        // left: filename (flex-1) | right: action buttons (fixed width, right aligned)
        <div className="flex items-center w-full">
            <div className="flex-1 text-left">
            <Text as="span" className="truncate block" variant="body">
              {file.path.replace(/^\//, '').replace(/\/$/, '')}
            </Text>
          </div>

          {/* Action buttons hidden by default; become visible on hover */}
          <div className="flex items-center gap-2 ml-4 w-20 justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <Button
              className=""
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
              aria-label="Rename file"
              title="Rename"
            >
              <span style={{ fontSize: '12px', lineHeight: 1 }}>✏️</span>
            </Button>
            <Button
              className=""
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                const base = file.path.replace(/\/$/, '').split('/').pop();
                const confirmMsg = `Delete '${base}'? This action cannot be undone. Are you sure you want to permanently delete this file?`;
                if (window.confirm(confirmMsg)) {
                  handleDeleteFile(file.path);
                }
              }}
              aria-label="Delete file"
              title="Delete"
            >
              <span style={{ fontSize: '12px', lineHeight: 1 }}>🗑️</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileItem;