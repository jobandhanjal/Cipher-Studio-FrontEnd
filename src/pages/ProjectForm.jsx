import React, { useState, useEffect } from 'react';
import { saveProject, updateProject, loadProject } from '../services/api';
import Text from '../components/Text';
import Button from '../components/Button';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const project = await loadProject(id);
          setName(project.name);
          setDescription(project.description);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchProject();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !name.trim()) throw new Error('Project name is required');
      if (!description || !String(description).trim()) throw new Error('Project description is required');
      if (id) {
        await updateProject(id, { name, description });
      } else {
        await saveProject({ name, description });
      }
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container p-6">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-inner">
          <Text as="h1" variant="heading" className="text-2xl font-bold mb-4">{id ? 'Edit Project' : 'New Project'}</Text>
          {error && <Text as="p" variant="small" className="text-red-500">{error}</Text>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                required
              />
            </div>
            <Button type="submit" variant="primary"><Text as="span" variant="label" allowColorOverride>{id ? 'Update Project' : 'Create Project'}</Text></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;