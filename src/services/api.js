import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Create an axios instance that automatically attaches the auth token from localStorage
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveProject(payload) {
  const res = await api.post('/api/projects/save', payload);
  return res.data;
}

export async function loadProject(id) {
  const res = await api.get(`/api/projects/${id}`);
  return res.data;
}

export async function updateProject(id, payload) {
  const res = await api.put(`/api/projects/${id}`, payload);
  return res.data;
}

export async function listProjects() {
  const res = await api.get('/api/projects');
  return res.data;
}

export async function saveOrUpdateProject(id, payload) {
  if (id) {
    // Update existing project
    const res = await api.put(`/api/projects/${id}`, payload);
    return res.data;
  } else {
    // Save new project
    const res = await api.post('/api/projects/save', payload);
    return res.data;
  }
}

export default API_BASE;

export { api };
