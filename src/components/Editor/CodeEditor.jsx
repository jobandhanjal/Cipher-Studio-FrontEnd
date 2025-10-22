import React from "react";
import { SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { useProject } from "../../context/ProjectContext";

const CodeEditor = () => {
  const { files, setFiles, activeFile } = useProject();
  const fileObj = files.find(f => f.path === activeFile);
  const code = fileObj ? fileObj.code || "" : "";

  const handleChange = (newCode) => {
    setFiles(
      files.map(f =>
        f.path === activeFile ? { ...f, code: newCode, meta: { ...f.meta, modifiedAt: Date.now() } } : f
      )
    );
  };

  return (
    <SandpackCodeEditor
      value={code}
      showLineNumbers
      showTabs={false}
      wrapContent
      onChange={handleChange}
      style={{ height: "100%", width: "100%" }}
      data-testid="code-editor"
    />
  );
};

export default CodeEditor;
