import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL, { api, listProjects, saveOrUpdateProject } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Use the shared axios instance which attaches the token automatically
        const data = await listProjects();
        // listProjects returns the raw response data - adapt if backend shape differs
        setProjects(data.projects || data);
      } catch (err) {
        toast.error(err.message || 'Failed to load projects');
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    const name = window.prompt('Enter project name:');
    if (!name) return;

    try {
      const defaultFiles = {
        '/App.js': `import React from 'react';
        
        export default function App() {
          return <h1>Hello, React!</h1>;
        }`,
        '/index.js': `import React from 'react';
        import ReactDOM from 'react-dom/client';
        import App from './App';
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);`,
        '/styles.css': `body { font-family: Arial, sans-serif; }
        h1 { color: #333; }`,
      };

      const payload = {
        name,
        files: Object.keys(defaultFiles).map((path) => ({
          path,
          type: 'file',
          code: defaultFiles[path],
          meta: { size: defaultFiles[path].length, modifiedAt: Date.now() },
        })),
      };

      const res = await saveOrUpdateProject(null, payload);
      toast.success(`Project ${name} created`);
      navigate(`/editor/${res.id}`); // Redirect to IDE page with the new project
    } catch (err) {
      console.error('Failed to create project', err);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  // Ensure clicking on a listed project navigates to the editor view
  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container bg-gray-50" style={{ width: '100vw', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-content flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ maxWidth: '700px', width: '100%', background: '#fff', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Only show projects title, no header */}
          <h1 className="text-2xl font-extrabold mb-6 text-center" style={{ color: '#2563eb', letterSpacing: '0.5px' }}>My Projects</h1>
          <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <button onClick={handleCreateProject} className="create-project-btn" style={{ background: '#2563eb', color: '#fff', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px' }}>Create New Project</button>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ width: '100%', maxWidth: '300px', fontSize: '1rem', color: '#2563eb', }}
            />
          </div>
          <div className="projects-list w-full flex flex-col gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project._id} className="project-card flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-300" style={{ minHeight: '70px' }}>
                  <div className="project-info flex-1 flex flex-col items-start justify-center">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#2563eb', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-700" style={{ marginTop: '2px', maxWidth: '90%' }}>{project.description}</p>
                    )}
                  </div>
                  <div className="project-actions flex gap-2 mt-2 md:mt-0">
                    <button onClick={() => handleOpenProject(project._id)} className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold shadow-sm" style={{ fontSize: '1rem' }}>Open</button>
                    <button onClick={() => handleDeleteProject(project._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-sm" style={{ fontSize: '1rem' }}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No projects found. Create a new project to get started!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;