import React, { useEffect, useState } from 'react';
import { listProjects } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      {error && <p className="text-red-500">{error}</p>}
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate('/projects/new')}
      >
        Create New Project
      </button>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li
            key={project._id}
            className="p-4 border rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;