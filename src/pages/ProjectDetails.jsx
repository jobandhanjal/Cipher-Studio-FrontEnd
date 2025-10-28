import React, { useEffect, useState } from 'react';
import { loadProject } from '../services/api';
import Text from '../components/Text';
import Button from '../components/Button';
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
    return <Text as="p" variant="small" className="text-red-500">{error}</Text>;
  }

  if (!project) {
    return <Text as="p" variant="body">Loading...</Text>;
  }

  return (
    <div className="page-container p-6">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-inner">
          <Text as="h1" variant="heading" className="text-2xl font-bold mb-4">{project.name}</Text>
          <Text as="p" variant="small" className="mb-4 text-muted">{project.description}</Text>
          <Button variant="primary" onClick={() => navigate(`/projects/${id}/edit`)}><Text as="span" variant="label" allowColorOverride>Edit Project</Text></Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;