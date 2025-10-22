import React from 'react';
import { render, act } from '@testing-library/react';
import { ProjectProvider, useProject } from '../context/ProjectContext';

// Mock component to test ProjectContext
const TestComponent = () => {
  const { files, handleCreateFile, handleDeleteFile, handleRenameFile } = useProject();

  return (
    <div>
      <ul data-testid="file-list">
        {files.map((file) => (
          <li key={file.path}>{file.path}</li>
        ))}
      </ul>
      <button
        onClick={() => handleCreateFile('NewFile.js')}
        data-testid="create-file"
      >
        Create File
      </button>
      <button
        onClick={() => handleDeleteFile('/NewFile.js')}
        data-testid="delete-file"
      >
        Delete File
      </button>
      <button
        onClick={() => handleRenameFile('/App.js', 'RenamedApp.js')}
        data-testid="rename-file"
      >
        Rename File
      </button>
    </div>
  );
};

describe('ProjectContext', () => {
  it('should create, delete, and rename files', () => {
    const { getByTestId, getByText, queryByText } = render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    // Create a new file
    act(() => {
      getByTestId('create-file').click();
    });
    expect(getByText('/NewFile.js')).toBeInTheDocument();

    // Delete the file
    act(() => {
      getByTestId('delete-file').click();
    });
    expect(queryByText('/NewFile.js')).not.toBeInTheDocument();

    // Rename a file
    act(() => {
      getByTestId('rename-file').click();
    });
    expect(getByText('/RenamedApp.js')).toBeInTheDocument();
  });
});