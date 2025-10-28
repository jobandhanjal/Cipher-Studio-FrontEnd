import React, { useState } from 'react';
import FileList from './FileList';
import AddFileModal from './AddFileModal';
import Text from '../Text';
import Button from '../Button';

const FileExplorer = () => {
  const [modal, setModal] = useState({ isOpen: false, type: 'file' });

  return (
    <div className="h-full flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between p-3 border-b border-gray-700 group">
    <Text as="h2" variant="heading" className="font-semibold">File Explorer</Text>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <Button
            onClick={() => setModal({ isOpen: true, type: 'file' })}
            className="w-7 h-7 flex items-center justify-center text-[12px] hover:bg-gray-700 rounded"
            variant="icon"
            title="New File"
            aria-label="New File"
          >
            📄
          </Button>
          <Button
            onClick={() => setModal({ isOpen: true, type: 'folder' })}
            className="w-7 h-7 flex items-center justify-center text-[12px] hover:bg-gray-700 rounded"
            variant="icon"
            title="New Folder"
            aria-label="New Folder"
          >
            📁
          </Button>
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
