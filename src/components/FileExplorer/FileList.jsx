import React from 'react';
import FileItem from './FileItem';
import { useProject } from '../../context/ProjectContext';

const FileList = () => {
  const { files, activeFile } = useProject();

  if (!files || files.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No files available. Create or load a project to view files.
      </div>
    );
  }

  return (
    <ul className="file-list space-y-1 py-2">
      {files.map((file) => (
        <FileItem 
          key={file.path} 
          file={file} 
          isActive={activeFile === file.path}
        />
      ))}
    </ul>
  );
};

export default FileList;