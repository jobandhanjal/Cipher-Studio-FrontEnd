import React, { useEffect, useRef, useState } from "react";
import { useProject } from "../../context/ProjectContext";
import Text from '../Text';

const CodeEditor = () => {
  const { files, setFiles, activeFile } = useProject();
  const fileObj = files.find(f => f.path === activeFile);
  const code = fileObj ? fileObj.code || "" : "";

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const modelRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

  const handleChange = (newCode) => {
    setFiles(prevFiles => prevFiles.map(f =>
      f.path === activeFile ? { ...f, code: newCode, meta: { ...f.meta, modifiedAt: Date.now() } } : f
    ));
  };

  const { saveToLocalStorage } = useProject();

  useEffect(() => {
    const onKey = (e) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        try { saveToLocalStorage(); } catch (err) { /* ignore */ }
        try { window.dispatchEvent(new Event('ide:requestSave')); } catch (err) { /* ignore */ }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveToLocalStorage]);

  // Monaco editor integration with a graceful fallback to a textarea for test envs
  useEffect(() => {
    // cleanup previous editor
    if (!fileObj || fileObj.type !== 'file') return undefined;

    let mounted = true;
    let monaco = null;

    try {
      // require inside effect to avoid SSR/test-time errors
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      monaco = require('monaco-editor');
    } catch (err) {
      // Monaco may not be available in test env; use fallback textarea
      setUseFallback(true);
      return undefined;
    }

    if (!mounted || !monaco || !containerRef.current) return undefined;

    setUseFallback(false);

    const path = fileObj.path || '/file.js';
    const uri = monaco.Uri.parse('inmemory://model' + path);
    const language = path.endsWith('.js') ? 'javascript' : (path.endsWith('.css') ? 'css' : 'plaintext');

    modelRef.current = monaco.editor.getModel(uri) || monaco.editor.createModel(code, language, uri);

    editorRef.current = monaco.editor.create(containerRef.current, {
      model: modelRef.current,
      automaticLayout: true,
      minimap: { enabled: false },
      theme: 'vs-dark',
      fontSize: 13,
    });

    const disposable = modelRef.current.onDidChangeContent(() => {
      const v = modelRef.current.getValue();
      handleChange(v);
    });

    return () => {
      try { disposable.dispose(); } catch (e) { }
      try { editorRef.current && editorRef.current.dispose(); } catch (e) { }
      // do not dispose model to keep undo history across files
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, fileObj && fileObj.path]);

  if (!fileObj || fileObj.type !== 'file') {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted">
        <div>
          <Text as="div" variant="label" className="text-lg font-medium mb-2">No file selected</Text>
          <Text as="div" variant="small" className="text-sm">Select a file from the explorer to edit its contents.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-3 py-2 border-b editor-header text-sm">
        <Text as="span" variant="body">Editing:</Text> <Text as="span" className="font-mono ml-2">{fileObj.path}</Text>
      </div>
      <div className="flex-1 relative">
        {useFallback ? (
          <textarea
            data-testid="code-editor"
            className="w-full h-full code-textarea p-3 font-mono"
            value={code}
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : (
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} data-testid="code-editor" />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
