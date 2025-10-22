import React, { useEffect } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import IDE from './pages/IDE';
import { Login, Signup, ProjectList, ProjectForm, ProjectDetails } from './pages';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Router>
      <ThemeProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/*" element={<IDE />} />
          </Routes>
        </ProjectProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
