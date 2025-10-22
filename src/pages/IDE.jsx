import React, { useEffect, useRef } from "react";
import "../index.css";
import "../styles/ide.css";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import CodeEditor from "../components/Editor/CodeEditor";
import LivePreview from "../components/Preview/LivePreview";
import FileExplorer from "../components/FileExplorer/FileExplorer";
import Navbar from "../components/Navbar";
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

const IDEInner = () => {
  const { projectId } = useParams();
  const { files, loadProjectFromData, setProjectName, projectName } = useProject();
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
      const payload = { name: projectName || 'Untitled', files };
      const updateId = existingId || projectId;
      const res = await saveOrUpdateProject(updateId, payload);
      push({ title: "Saved", message: `Project ${res.id} updated successfully` });
    } catch (err) {
      console.error("Failed to update project", err);
      push({ title: "Error", message: "Failed to update project" });
    }
  };

  return (
    <SandpackProvider template="react" files={sandpackFiles}>
      <SaveProjectModal
        isOpen={saveOpen}
        existingId={existingId}
        onClose={(res) => {
          setSaveOpen(false);
          if (res && res.id) {
            setExistingId(res.id);
            setProjectName(res.name);
            push({ title: "Saved", message: `Project id: ${res.id}` });
          }
        }}
      />
      <div className="ide-root bg-gray-900 text-white h-screen w-screen flex flex-col">
        <Navbar
          onSave={handleSaveProject}
          projectName={projectName}
        />
        <div className="w-full text-center text-yellow-400 text-sm py-1">Remember to click 'Save Project' after editing files to persist changes!</div>
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={20} minSize={15} className="bg-gray-950">
            <div className="h-full p-2">
              <FileExplorer />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-600 transition-colors" />
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full p-2">
              <CodeEditor />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-600 transition-colors" />
          <Panel defaultSize={30} minSize={25}>
            <div className="h-full p-2">
              <LivePreview />
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Output</button>
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
          <div className="flex flex-col h-screen">
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/editor/:projectId" element={<ProtectedRoute><IDEInner /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </ProjectProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default IDE;
