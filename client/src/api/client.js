const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const auth = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

export const projects = {
  list: () => request('/projects'),
  get: (id) => request(`/projects/${id}`),
  create: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id, body) => request(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(body) }),
  updateMember: (id, userId, body) => request(`/projects/${id}/members/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeMember: (id, userId) => request(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
};

export const tasks = {
  list: (projectId) => request(`/tasks/project/${projectId}`),
  create: (projectId, body) => request(`/tasks/project/${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};

export const dashboard = {
  get: () => request('/dashboard'),
};

export const users = {
  all: () => request('/users/all'),
  search: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),
};
