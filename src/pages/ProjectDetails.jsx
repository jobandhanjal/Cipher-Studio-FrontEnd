import React, { useEffect, useState } from 'react';
import { loadProject } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await loadProject(id);
        setProject(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProject();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!project) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate(`/projects/${id}/edit`)}
      >
        Edit Project
      </button>
    </div>
  );
};

export default ProjectDetails;