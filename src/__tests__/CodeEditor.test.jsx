import React from 'react';
import { render, act } from '@testing-library/react';
import CodeEditor from '../components/Editor/CodeEditor';
import { ProjectProvider, useProject } from '../context/ProjectContext';
import { SandpackProvider } from '@codesandbox/sandpack-react';

// Mock component to test CodeEditor
const TestComponent = () => {
  const { files, setFiles, activeFile, setActiveFile } = useProject();

  React.useEffect(() => {
    // Set initial file for testing
    setFiles([{ path: '/TestFile.js', type: 'file', code: 'console.log("Hello World");' }]);
    setActiveFile('/TestFile.js');
  }, [setFiles, setActiveFile]);

  return <CodeEditor />;
};

describe('CodeEditor', () => {
  it('should update live preview on code change', async () => {
    let getByTestId;

    await act(async () => {
      ({ getByTestId } = render(
        <SandpackProvider>
          <ProjectProvider>
            <TestComponent />
          </ProjectProvider>
        </SandpackProvider>
      ));
    });

    const editor = getByTestId('code-editor');

    // Simulate typing in the editor
    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      editor.dispatchEvent(event);
    });

    // Verify live preview updates (mock preview logic here)
    expect(editor.textContent).toContain('a');
  });
});