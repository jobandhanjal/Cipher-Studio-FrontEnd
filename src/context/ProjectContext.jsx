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
  // name: base name (e.g., "App.js" or "components"), parentPath: folder path like '/' or '/src/'
  // normalize path helper: ensure file paths start with '/', and folders end with '/'
  const normalizePath = useCallback((pathStr, type = 'file') => {
    if (!pathStr) return pathStr;
    let p = String(pathStr);
    // remove duplicate slashes
    p = p.replace(/\\+/g, '/');
    if (!p.startsWith('/')) p = '/' + p;
    if (type === 'folder') {
      if (!p.endsWith('/')) p = p + '/';
    } else {
      // remove trailing slash for files
      if (p !== '/' && p.endsWith('/')) p = p.replace(/\/$/, '');
    }
    return p;
  }, []);

  const handleCreateFile = useCallback((name, type = 'file', parentPath = '/') => {
    const baseName = String(name).replace(/^\/+|\/+$/g, '');
    const parent = parentPath === '/' ? '/' : parentPath.replace(/\/$/, '');
    const combined = parent === '/' ? `/${baseName}` : `${parent}/${baseName}`;
    const newPath = normalizePath(combined, type);

    setFiles(prev => {
      if (prev.some(f => f.path === newPath)) {
        throw new Error('A file or folder with this name already exists in the selected folder');
      }
      const newFile = {
        path: newPath,
        type,
        meta: { size: 0, modifiedAt: Date.now() },
        code: type === 'file' ? '' : undefined,
      };
      return [...prev, newFile];
    });
    if (type === 'file') setActiveFile(newPath);
  }, [normalizePath]);

  const handleDeleteFile = useCallback((path) => {
    const normalized = normalizePath(path, path.endsWith('/') ? 'folder' : 'file');
    setFiles(prev => {
      const next = prev.filter(f => !f.path.startsWith(normalized));
      // adjust active file if it was under deleted path
      if (activeFile && activeFile.startsWith(normalized)) {
        setActiveFile(next[0]?.path || '');
      }
      return next;
    });
  }, [normalizePath, setActiveFile, activeFile]);

  // newName is just the base name (not full path). Preserve parent path when renaming.
  const handleRenameFile = useCallback((oldPath, newName) => {
    const normalizedOld = normalizePath(oldPath, oldPath.endsWith('/') ? 'folder' : 'file');
    setFiles(prev => {
      const target = prev.find(f => f.path === normalizedOld);
      if (!target) return prev;
      const isFolder = target.type === 'folder';
      const parts = normalizedOld.replace(/^\//, '').replace(/\/$/, '').split('/');
      parts.pop();
      const parentPrefix = parts.length > 0 ? '/' + parts.join('/') : '/';
      const newBase = String(newName).replace(/^\/+|\/+$/g, '');
      const combined = parentPrefix === '/' ? `/${newBase}` : `${parentPrefix}/${newBase}`;
      const newPath = normalizePath(combined, isFolder ? 'folder' : 'file');

      // update files paths
      const updated = prev.map(f => {
        if (f.path === normalizedOld || f.path.startsWith(normalizedOld)) {
          return {
            ...f,
            path: f.path.replace(normalizedOld, newPath),
            meta: { ...f.meta, modifiedAt: Date.now() }
          };
        }
        return f;
      });

      // update active file if necessary (outside setFiles to avoid stale prev)
      setActiveFile(prevActive => (prevActive && prevActive.startsWith(normalizedOld) ? prevActive.replace(normalizedOld, newPath) : prevActive));

      return updated;
    });
  }, [normalizePath]);

  // Project name state
  const [projectName, setProjectName] = useState('Untitled');
  // local persistence key (default project)
  const LOCAL_KEY = 'cipherstudio:project:local';

  // projectId for local keys (can be backend id or local name)
  const [projectIdState, setProjectIdState] = useState(null);

  // autosave toggle
  const [autoSave, setAutoSave] = useState(true);

  // run refresh trigger - incrementing this value will force a remount of Sandpack provider
  const [runId, setRunId] = useState(0);

  const triggerRun = useCallback(() => setRunId((v) => v + 1), [setRunId]);

  // Helper to construct storage key for a given project identifier
  const buildLocalKey = useCallback((maybeId) => {
    if (!maybeId) return LOCAL_KEY;
    return `cipherstudio:project:${maybeId}`;
  }, []);

  // Save current project to localStorage (returns key used). Accepts optional projectId (string).
  const saveToLocalStorage = useCallback((maybeId = null, name = projectName) => {
    try {
      const key = buildLocalKey(maybeId || projectIdState);
      // normalize file paths before saving
      const normalizedFiles = files.map(f => ({
        ...f,
        path: normalizePath(f.path, f.type === 'folder' ? 'folder' : 'file')
      }));
      const payload = { name: name || 'Untitled', files: normalizedFiles, lastActiveFile: activeFile };
      localStorage.setItem(key, JSON.stringify(payload));
      return key;
    } catch (err) {
      // ignore localStorage failures
      return null;
    }
  }, [files, projectName, activeFile, projectIdState, buildLocalKey]);

  // Load a project from localStorage. Accepts optional projectId (string) or full key.
  const loadFromLocalStorage = useCallback((maybeId = null) => {
    try {
      const key = buildLocalKey(maybeId || projectIdState);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const project = JSON.parse(raw);
      if (!project || !Array.isArray(project.files)) return null;
      setFiles(project.files.map(f => ({
        path: normalizePath(f.path, f.type === 'folder' ? 'folder' : 'file'),
        type: f.type || 'file',
        meta: f.meta || {},
        code: f.code || ''
      })));
      if (project.lastActiveFile) setActiveFile(normalizePath(project.lastActiveFile));
      else if (project.files[0]) setActiveFile(project.files[0].path);
      setProjectName(project.name || 'Untitled');
      return project;
    } catch (err) {
      return null;
    }
  }, [setFiles, setActiveFile, projectIdState, buildLocalKey]);

  // Auto-save effect: persist to localStorage on files change when autoSave enabled
  useEffect(() => {
    if (!autoSave) return;
    try {
      saveToLocalStorage();
    } catch (err) {
      // ignore
    }
  }, [files, autoSave, saveToLocalStorage]);

  // clear local storage key(s) for a given project id (or default)
  const clearLocalStorageFor = useCallback((maybeId = null) => {
    try {
      const key = buildLocalKey(maybeId || projectIdState);
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      return false;
    }
  }, [buildLocalKey, projectIdState]);

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
    runId,
    triggerRun,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorageFor,
  // Build payload suitable for backend
  // include description for project metadata
  createProjectPayload: (name = 'Untitled', description = '') => ({ name, description, files }),
    // Load project data (replace files in context)
    loadProjectFromData: (project) => {
      if (!project || !Array.isArray(project.files)) return;
      setFiles(project.files.map(f => ({
        path: normalizePath(f.path, f.type === 'folder' ? 'folder' : 'file'),
        type: f.type || 'file',
        meta: f.meta || {},
        code: f.code || ''
      })));
      if (project.lastActiveFile) setActiveFile(normalizePath(project.lastActiveFile));
      else if (project.files[0]) setActiveFile(normalizePath(project.files[0].path));
      setProjectName(project.name || 'Untitled');
      // if backend project has an id, set it for local storage scoping
      if (project._id || project.id) {
        setProjectIdState(project._id || project.id);
      }
    },
    projectId: projectIdState,
    setProjectId: setProjectIdState,
    autoSave,
    setAutoSave,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  return useContext(ProjectContext);
};
