import React, { useState } from 'react';
import FileList from './FileList';
import AddFileModal from './AddFileModal';

const FileExplorer = () => {
  const [modal, setModal] = useState({ isOpen: false, type: 'file' });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="font-semibold">Explorer</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setModal({ isOpen: true, type: 'file' })}
            className="p-1 hover:bg-gray-700 rounded"
            title="New File"
          >
            📄
          </button>
          <button
            onClick={() => setModal({ isOpen: true, type: 'folder' })}
            className="p-1 hover:bg-gray-700 rounded"
            title="New Folder"
          >
            📁
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        <FileList />
      </div>

      {/* Add File/Folder Modal */}
      <AddFileModal
        isOpen={modal.isOpen}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default FileExplorer;
