import api, { extractData } from './api';

function normalizeProjectPayload(payload) {
  return {
    ...payload,
    startDate: payload.startDate || null,
    dueDate: payload.dueDate || null,
    archived: payload.archived ?? false,
    memberAssignments: payload.memberAssignments || [],
  };
}

export async function getProjects(filters = {}) {
  const response = await api.get('/projects', { params: filters });
  return extractData(response);
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`);
  return extractData(response);
}

export async function createProject(payload) {
  const response = await api.post('/projects', normalizeProjectPayload(payload));
  return extractData(response).project;
}

export async function updateProject(payload) {
  const response = await api.put('/projects', normalizeProjectPayload(payload));
  return extractData(response).project;
}

export async function deleteProject(id) {
  const response = await api.delete('/projects', { data: { id } });
  return extractData(response).project;
}
