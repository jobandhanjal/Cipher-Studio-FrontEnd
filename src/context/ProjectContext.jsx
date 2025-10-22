import React, { createContext, useState, useCallback, useContext, useEffect, useRef } from "react";
import defaultFiles from "../utils/defaultFiles";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // Build initial files array from defaultFiles (object)
  const initialFilesArray = Object.keys(defaultFiles).map((path) => ({
    path,
    type: "file",
    meta: { size: defaultFiles[path].length || 0, modifiedAt: Date.now() },
    code: defaultFiles[path],
  }));

  // Use useState for files, not useLocalStorage
  const [files, setFiles] = useState(initialFilesArray);
  const [activeFile, setActiveFile] = useState(initialFilesArray[0]?.path || "/App.js");

  // File management handlers
  const handleCreateFile = useCallback((name, type = 'file') => {
    const newPath = `/${name}${type === 'folder' ? '/' : ''}`;
    if (files.some(f => f.path === newPath)) {
      throw new Error('A file or folder with this name already exists');
    }
    const newFile = {
      path: newPath,
      type,
      meta: { size: 0, modifiedAt: Date.now() },
      code: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined
    };
    setFiles([...files, newFile]);
    if (type === 'file') setActiveFile(newPath);
  }, [files, setFiles, setActiveFile]);

  const handleDeleteFile = useCallback((path) => {
    setFiles(files.filter(f => !f.path.startsWith(path)));
    if (activeFile.startsWith(path)) {
      setActiveFile(files[0]?.path || '');
    }
  }, [files, setFiles, activeFile, setActiveFile]);

  const handleRenameFile = useCallback((oldPath, newName) => {
    const file = files.find(f => f.path === oldPath);
    if (!file) return;
    const isFolder = file.type === 'folder';
    const newPath = `/${newName}${isFolder ? '/' : ''}`;
    setFiles(files.map(f => {
      if (f.path.startsWith(oldPath)) {
        return {
          ...f,
          path: f.path.replace(oldPath, newPath),
          meta: { ...f.meta, modifiedAt: Date.now() }
        };
      }
      return f;
    }));
    if (activeFile.startsWith(oldPath)) {
      setActiveFile(activeFile.replace(oldPath, newPath));
    }
  }, [files, setFiles, activeFile, setActiveFile]);

  // Project name state
  const [projectName, setProjectName] = useState('Untitled');

  const value = {
    files,
    setFiles,
    activeFile,
    setActiveFile,
    handleCreateFile,
    handleDeleteFile,
    handleRenameFile,
    projectName,
    setProjectName,
    // Build payload suitable for backend
    createProjectPayload: (name = 'Untitled') => ({ name, files }),
    // Load project data (replace files in context)
    loadProjectFromData: (project) => {
      if (!project || !Array.isArray(project.files)) return;
      setFiles(project.files.map(f => ({
        path: f.path,
        type: f.type || 'file',
        meta: f.meta || {},
        code: f.code || ''
      })));
      if (project.files[0]) {
        setActiveFile(project.files[0].path);
      }
      setProjectName(project.name || 'Untitled');
    },
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  return useContext(ProjectContext);
};
