import React, { useState, useEffect } from 'react';
import { saveProject, updateProject, loadProject } from '../services/api';
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Project' : 'New Project'}</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {id ? 'Update Project' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;