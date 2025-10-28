import React, { useEffect, useRef } from "react";
import "../index.css";
import "../styles/ide.css";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import CodeEditor from "../components/Editor/CodeEditor";
import LivePreview from "../components/Preview/LivePreview";
import FileExplorer from "../components/FileExplorer/FileExplorer";
import Navbar from "../components/Navbar";
import Button from '../components/Button';
import Text from '../components/Text';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ProjectProvider, useProject } from "../context/ProjectContext";
import { loadProject, saveOrUpdateProject } from "../services/api";
import { NotificationProvider, useNotifications } from "../context/NotificationContext";
import { ThemeProvider } from "../context/ThemeContext";
import SaveProjectModal from "../components/FileExplorer/SaveProjectModal";
import { Routes, Route, useParams } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Signup from './Signup';
import logo from "../assets/react.svg"; // Updated to use react.svg
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingOverlay from '../components/LoadingOverlay';

const IDEInner = () => {
  const { projectId } = useParams();
  const { files, loadProjectFromData, setProjectName, projectName, saveToLocalStorage, loadFromLocalStorage, runId, triggerRun, setProjectId, clearLocalStorageFor } = useProject();
  const { push } = useNotifications();
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [existingId, setExistingId] = React.useState(null);
  const isProjectLoaded = useRef(false);

  // Load project from backend and set project name in context
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await loadProject(projectId);
        loadProjectFromData(project);
        setProjectName(project.name);
        setExistingId(projectId);
        try { setProjectId(projectId); } catch (err) { /* ignore */ }
        push({ title: 'Loaded', message: `Project ${project.name} loaded` });
      } catch (err) {
        console.error(err);
        push({ title: 'Error', message: 'Failed to load project' });
      }
    };
    if (projectId && !isProjectLoaded.current) {
      fetchProject();
      isProjectLoaded.current = true;
    }
  }, [projectId, loadProjectFromData, setProjectName, push]);

  const sandpackFiles = files.reduce((acc, f) => {
    if (f.type === "file") acc[f.path] = f.code || "";
    return acc;
  }, {
    "/package.json": JSON.stringify({
      name: "live-preview",
      version: "1.0.0",
      main: "/index.js",
      dependencies: {
        react: "^18.0.0",
        "react-dom": "^18.0.0"
      }
    }, null, 2)
  });

  const handleSaveProject = async () => {
    try {
      // persist locally first (scope by backend id or URL projectId if present)
      const storageId = existingId || projectId;
      saveToLocalStorage(storageId, projectName);
      const payload = { name: projectName || 'Untitled', files };
      const updateId = existingId || projectId;
      const res = await saveOrUpdateProject(updateId, payload);
      push({ title: "Saved", message: `Project ${res.id} updated successfully` });
      // clear local storage for this project since it was saved to backend
      try { clearLocalStorageFor(res.id || updateId); } catch (err) { /* ignore */ }
    } catch (err) {
      console.error("Failed to update project", err);
      push({ title: "Error", message: "Failed to update project" });
    }
  };

  const handleRun = () => {
    // trigger remount of Sandpack provider
    triggerRun();
  };

  const handleLoadLocal = () => {
    const storageId = existingId || projectId;
    const project = loadFromLocalStorage(storageId);
    if (project) {
      loadProjectFromData(project);
      setProjectName(project.name || 'Untitled');
      push({ title: 'Loaded', message: 'Project loaded from local storage' });
    } else {
      push({ title: 'Not found', message: 'No local project found' });
    }
  };

  // allow other components (editor) to request a save via window event
  useEffect(() => {
    const handler = (e) => {
      handleSaveProject();
    };
    window.addEventListener('ide:requestSave', handler);
    return () => window.removeEventListener('ide:requestSave', handler);
  }, [handleSaveProject]);

  // On unmount (leaving IDE), if this project is a backend project (existingId or url projectId),
  // clear the scoped localStorage so the dashboard / new session starts clean.
  useEffect(() => {
    return () => {
      try {
        const idToClear = existingId || projectId;
        if (idToClear) clearLocalStorageFor(idToClear);
      } catch (err) {
        // ignore
      }
    };
  }, [existingId, projectId, clearLocalStorageFor]);

  return (
    // use runId as key so changing it forces a full remount (Run action)
    <SandpackProvider key={runId} template="react" files={sandpackFiles}>
          <SaveProjectModal
        isOpen={saveOpen}
        existingId={existingId}
        onClose={(res) => {
          setSaveOpen(false);
          if (res && res.id) {
            setExistingId(res.id);
            setProjectName(res.name);
            // set project id in context (so local saves get scoped)
            try { setProjectId(res.id); } catch (err) { /* ignore */ }
            push({ title: "Saved", message: `Project id: ${res.id}` });
          }
        }}
      />
      <div className="ide-root h-screen w-screen flex flex-col">
        <Navbar
          onSave={handleSaveProject}
          onRun={handleRun}
          onLoad={handleLoadLocal}
          projectName={projectName}
        />
        <div className="w-full text-center text-yellow-400 text-sm py-1">Remember to click 'Save' after editing files to persist changes!</div>
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={20} minSize={15}>
            <div className="h-full p-2">
              <FileExplorer />
            </div>
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel defaultSize={50} minSize={30}>
            {/* remove inner padding so editor fills the panel fully */}
            <div className="h-full p-0">
              <CodeEditor />
            </div>
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel defaultSize={30} minSize={25}>
            {/* remove inner padding so preview fills the panel fully */}
            <div className="h-full p-0">
              <LivePreview />
              <div style={{ padding: '0.5rem' }}>
             <Button variant="primary"><Text as="span" variant="label" allowColorOverride>Output</Text></Button>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </SandpackProvider>
  );
};

const IDE = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <ProjectProvider>
        <NotificationProvider>
          <LoadingOverlay />
          <div className="flex flex-col h-screen">
            <main className="flex-1">
                <Routes>
                  {/* Root should show dashboard for authenticated users */}
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/editor/:projectId" element={<ProtectedRoute><IDEInner /></ProtectedRoute>} />
                  {/* Catch-all route for unknown paths */}
                  <Route path="*" element={<Login />} />
                </Routes>
            </main>
          </div>
        </NotificationProvider>
      </ProjectProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default IDE;
