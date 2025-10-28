import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, listProjects } from '../services/api';
import { FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import Navbar from '../components/Navbar';
import SaveProjectModal from '../components/FileExplorer/SaveProjectModal';
import Text from '../components/Text';
import Button from '../components/Button';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await listProjects();
        // Normalize API result: may return an array or an object { projects: [...] }
        const normalized = Array.isArray(data)
          ? data
          : (Array.isArray(data && data.projects) ? data.projects : []);
        if (!Array.isArray(normalized)) {
          // defensive fallback
          console.warn('Unexpected projects payload:', data);
        }
        setProjects(normalized || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load projects');
      }
    };

    fetchProjects();
  }, []);

  const [saveOpen, setSaveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleCreateProject = () => {
    // open modal so user can enter project name; modal will stay open on duplicate error
    setSaveOpen(true);
  };

  const handleModalClose = (res) => {
    setSaveOpen(false);
    if (res && res.id) {
      navigate(`/editor/${res.id}`);
    }
  };

  const handleEditClose = async (res) => {
    setEditOpen(false);
    setEditingProject(null);
    if (res && res.id) {
      // refresh projects list to reflect updated metadata
      try {
        const data = await listProjects();
        const normalized = Array.isArray(data)
          ? data
          : (Array.isArray(data && data.projects) ? data.projects : []);
        setProjects(normalized || []);
      } catch (err) {
        toast.error('Failed to refresh projects');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/api/projects/${projectId}`);
  setProjects((prev) => Array.isArray(prev) ? prev.filter((project) => project._id !== projectId) : []);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  // Guard against non-array projects (defensive): if projects isn't an array, treat as empty list
  const safeProjects = Array.isArray(projects) ? projects : [];
  if (!Array.isArray(projects)) console.warn('projects state is not an array in Dashboard:', projects);

  const filteredProjects = safeProjects.filter((project) =>
    String(project.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container w-screen min-h-screen">
      <Navbar />
      <div className="dashboard-content flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="card" style={{ maxWidth: '700px', width: '100%' }}>
          <div className="card-inner flex flex-col items-center">
            <Text as="h1" variant="heading" className="text-2xl font-extrabold mb-6 text-center card-title" style={{ letterSpacing: '0.5px' }}>My Projects</Text>

            <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <Button onClick={handleCreateProject} variant="cta">Create New Project</Button>
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="projects-list w-full flex flex-col gap-4">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const updated = project.updatedAt || project.createdAt;
                  const updatedDate = updated ? new Date(updated) : null;
                  const isToday = updatedDate ? (new Date(updatedDate).toDateString() === new Date().toDateString()) : false;
                  const lastModified = updatedDate ? (isToday ? updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : updatedDate.toLocaleDateString()) : '';
                  return (
                    <div key={project._id} className="project-card flex flex-col md:flex-row items-center justify-between p-4 listing-card" style={{ minHeight: '70px' }}>
                      <div className="project-info flex-1 flex flex-col items-start justify-center min-w-0">
                        <Text as="h3" variant="label" className="font-bold text-lg mb-1 text-ellipsis truncate" style={{ letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>{project.name}</Text>
                        {project.description && (
                          <Text as="p" variant="small" className="text-sm text-muted" style={{ marginTop: '2px', maxWidth: '90%' }}>{project.description}</Text>
                        )}
                        <Text as="p" variant="small" className="text-xs text-muted mt-2">Last modified: {lastModified}</Text>
                      </div>
                      <div className="project-actions flex gap-2 mt-2 md:mt-0 items-center">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setEditOpen(true);
                          }}
                          variant="cta"
                          className="flex items-center gap-2"
                          title="Edit metadata"
                          aria-label="Edit project"
                        >
                          <FiEdit2 size={16} />
                          <span className="text-sm">Edit</span>
                        </Button>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProject(project._id);
                          }}
                          variant="cta"
                          className="flex items-center gap-2"
                          title="Open project"
                          aria-label="Open project"
                        >
                          <FiFolder size={16} />
                          <span className="text-sm">Open</span>
                        </Button>

                        <IconButton
                          title="Delete project"
                          aria-label="Delete project"
                          className="btn-logout"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                        >
                          <FiTrash2 size={18} />
                        </IconButton>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Text as="p" variant="body" className="text-gray-500 text-center">No projects found. Create a new project to get started!</Text>
              )}
            </div>
            {/* Create project modal — stays open until success or user cancels */}
            <SaveProjectModal isOpen={saveOpen} onClose={handleModalClose} />
            {/* Edit project modal (inline) */}
            {editingProject && (
              <SaveProjectModal
                isOpen={editOpen}
                onClose={handleEditClose}
                existingId={editingProject._id}
                initialName={editingProject.name}
                initialDescription={editingProject.description}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;