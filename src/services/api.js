import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

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

// Global loading indicator coordination
// We track an active request count and dispatch a window event 'api:loading'
let activeRequests = 0;

const setLoading = (countOrBool) => {
  // dispatch numeric count for consumers that prefer it
  const detail = typeof countOrBool === 'number' ? countOrBool : (countOrBool ? 1 : 0);
  try {
    window.dispatchEvent(new CustomEvent('api:loading', { detail }));
  } catch (err) {
    // ignore in non-browser environments
  }
};

api.interceptors.request.use((config) => {
  activeRequests += 1;
  setLoading(activeRequests);
  return config;
}, (error) => {
  // increment may not have occurred but ensure events
  setTimeout(() => {
    activeRequests = Math.max(0, activeRequests - 1);
    setLoading(activeRequests);
  }, 0);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  activeRequests = Math.max(0, activeRequests - 1);
  setLoading(activeRequests);
  return response;
}, (error) => {
  activeRequests = Math.max(0, activeRequests - 1);
  setLoading(activeRequests);
  // If unauthorized, clear session and redirect to login
  const status = error?.response?.status;
  if (status === 401) {
    clearSessionAndRedirect();
    // swallow further handling since redirecting
    return Promise.reject(error);
  }
  return Promise.reject(error);
});

// Also attach to the global axios instance so code that uses `axios` directly
// (instead of the `api` instance) will also trigger the overlay.
axios.interceptors.request.use((config) => {
  activeRequests += 1;
  setLoading(activeRequests);
  return config;
}, (error) => {
  setTimeout(() => {
    activeRequests = Math.max(0, activeRequests - 1);
    setLoading(activeRequests);
  }, 0);
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  activeRequests = Math.max(0, activeRequests - 1);
  setLoading(activeRequests);
  return response;
}, (error) => {
  activeRequests = Math.max(0, activeRequests - 1);
  setLoading(activeRequests);
  const status = error?.response?.status;
  if (status === 401) {
    clearSessionAndRedirect();
    return Promise.reject(error);
  }
  return Promise.reject(error);
});

// Shared session clear + redirect helper
export async function clearSessionAndRedirect() {
  try {
    // Clear local/session storage
    try { localStorage.clear(); } catch (e) { /* ignore */ }
    try { sessionStorage.clear(); } catch (e) { /* ignore */ }

    // Clear caches if available
    if (typeof caches !== 'undefined' && caches && caches.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (err) {
    // ignore errors during cleanup
    // eslint-disable-next-line no-console
    console.error('Error clearing session caches', err);
  }

  // Redirect to login route
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

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

export async function deleteProject(id) {
  const res = await api.delete(`/api/projects/${id}`);
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

// --- S3 presign + upload helpers ---
export async function getPresignedUrl(filename, contentType) {
  const res = await api.get(`/api/uploads/presign`, { params: { filename, contentType } });
  return res.data; // { url, key, bucket }
}

export async function uploadFileToS3(presignUrl, file, extraHeaders = {}) {
  // presignUrl: the full signed URL to PUT the file to
  // file: File or Blob
  // Use fetch to PUT binary data directly to S3
  const headers = {
    'Content-Type': file.type || 'application/octet-stream',
    ...extraHeaders,
  };

  const res = await fetch(presignUrl, {
    method: 'PUT',
    headers,
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
  }

  return true;
}

export default API_BASE;

export { api };
