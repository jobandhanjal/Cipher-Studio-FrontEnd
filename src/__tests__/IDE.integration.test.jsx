import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { ProjectProvider, useProject } from '../context/ProjectContext';
import FileExplorer from '../components/FileExplorer/FileExplorer';
import CodeEditor from '../components/Editor/CodeEditor';
import { SandpackProvider } from '@codesandbox/sandpack-react';

// Small harness to expose project context values for assertions
const ActiveFileDisplay = () => {
  const { activeFile } = useProject();
  return <div data-testid="active-file">{activeFile}</div>;
};

const CreateFileButton = () => {
  const { handleCreateFile } = useProject();
  return (
    <button
      data-testid="create-file-button"
      onClick={() => handleCreateFile('IntegrationFile.js')}
    >
      Create
    </button>
  );
};

describe('IDE integration', () => {
  beforeEach(() => {
    // Ensure clean localStorage
    localStorage.clear();
  });

  it('selects file from File Explorer and updates active file', async () => {
    const { getByTestId, getByText } = render(
      <ProjectProvider>
        <CreateFileButton />
        <FileExplorer />
        <ActiveFileDisplay />
      </ProjectProvider>
    );

    // Create a file
    act(() => {
      getByTestId('create-file-button').click();
    });

    // Wait for file to appear in explorer
    await waitFor(() => expect(getByText('IntegrationFile.js')).toBeInTheDocument());

    // Click the file in explorer
    act(() => {
      getByText('IntegrationFile.js').click();
    });

    // Active file display should show the normalized path
    await waitFor(() => expect(getByTestId('active-file').textContent).toBe('/IntegrationFile.js'));
  });

  it('auto-saves to localStorage when files change', async () => {
    const { getByTestId } = render(
      <ProjectProvider>
        <CreateFileButton />
      </ProjectProvider>
    );

    act(() => {
      getByTestId('create-file-button').click();
    });

    // autosave should persist the project under default key
    await waitFor(() => {
      const raw = localStorage.getItem('cipherstudio:project:local');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw);
      expect(parsed.files.some(f => f.path === '/IntegrationFile.js')).toBe(true);
    });
  });

  it('Ctrl/Cmd+S inside the editor triggers ide:requestSave event', async () => {
    const { getByTestId } = render(
      <ProjectProvider>
        <SandpackProvider>
          <CodeEditor />
        </SandpackProvider>
      </ProjectProvider>
    );

    // Set up a listener for the custom event
    let called = 0;
    const handler = () => { called += 1; };
    window.addEventListener('ide:requestSave', handler);

    // Dispatch a ctrl+s keydown on window
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
      window.dispatchEvent(event);
    });

    // Give effect a chance to run
    await waitFor(() => expect(called).toBeGreaterThanOrEqual(1));

    window.removeEventListener('ide:requestSave', handler);
  });

  it('can save to and clear scoped localStorage for a project id', async () => {
    let ctx;

    const TestHarness = () => {
      ctx = useProject();
      return null;
    };

    render(
      <ProjectProvider>
        <TestHarness />
      </ProjectProvider>
    );

    // save to a scoped id
    act(() => {
      ctx.saveToLocalStorage('my-test-proj', 'My Test');
    });

    const key = 'cipherstudio:project:my-test-proj';
    expect(localStorage.getItem(key)).toBeTruthy();

    act(() => {
      ctx.clearLocalStorageFor('my-test-proj');
    });

    expect(localStorage.getItem(key)).toBeNull();
  });
});
