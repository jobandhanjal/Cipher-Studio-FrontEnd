import React, { useEffect, useState } from 'react';
import { listProjects, api } from '../services/api';
import Text from '../components/Text';
import Button from '../components/Button';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import SaveProjectModal from '../components/FileExplorer/SaveProjectModal';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await listProjects();
        const normalized = Array.isArray(data)
          ? data
          : (Array.isArray(data && data.projects) ? data.projects : []);
        if (!Array.isArray(normalized)) console.warn('Unexpected projects payload in ProjectList:', data);
        setProjects(normalized || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="page-container p-6">
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-inner">
          <Text as="h1" variant="heading" className="text-2xl font-bold mb-4">Projects</Text>
          {error && <Text as="p" variant="small" className="text-red-500">{error}</Text>}
          <Button className="mb-4" variant="primary" onClick={() => navigate('/projects/new')}><Text as="span" variant="label" allowColorOverride>Create New Project</Text></Button>
          <div className="grid gap-4">
            { (Array.isArray(projects) ? projects : []).map((project) => {
              const updated = project.updatedAt || project.createdAt;
              const updatedDate = updated ? new Date(updated) : null;
              const isToday = updatedDate ? (new Date(updatedDate).toDateString() === new Date().toDateString()) : false;
              const lastModified = updatedDate ? (isToday ? updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : updatedDate.toLocaleDateString()) : '';
              return (
                <div key={project._id} className="flex items-center justify-between p-4 listing-card shadow-sm hover:shadow-md transition" role="article">
                  <div className="flex-1 min-w-0">
                    <Text as="h2" variant="label" className="text-lg font-semibold truncate">{project.name}</Text>
                    {project.description && (
                      <Text as="p" variant="small" className="text-muted mt-1 line-clamp-2">{project.description}</Text>
                    )}
                    <Text as="p" variant="small" className="text-muted mt-2 text-xs">Last modified: {lastModified}</Text>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <IconButton title="Edit metadata" aria-label="Edit project" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setEditOpen(true); }}>
                      <FiEdit2 size={18} />
                    </IconButton>
                    <IconButton title="Open project" aria-label="Open project" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project._id}`); }}>
                      <FiFolder size={18} />
                    </IconButton>
                    <Button
                      variant="danger"
                      className="btn-logout flex items-center gap-2"
                      title="Delete project"
                      aria-label="Delete project"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Delete this project?')) return;
                        try {
                          await api.delete(`/api/projects/${project._id}`);
                          setProjects((prev) => Array.isArray(prev) ? prev.filter(p => p._id !== project._id) : []);
                        } catch (err) {
                          setError(err.message || 'Delete failed');
                        }
                      }}
                    >
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {editingProject && (
            <SaveProjectModal
              isOpen={editOpen}
              onClose={async (res) => {
                setEditOpen(false);
                setEditingProject(null);
                if (res && res.id) {
                  try {
                    const data = await listProjects();
                    const normalized = Array.isArray(data)
                      ? data
                      : (Array.isArray(data && data.projects) ? data.projects : []);
                    setProjects(normalized || []);
                  } catch (err) {
                    setError('Failed to refresh projects');
                  }
                }
              }}
              existingId={editingProject?._id}
              initialName={editingProject?.name || ''}
              initialDescription={editingProject?.description || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;