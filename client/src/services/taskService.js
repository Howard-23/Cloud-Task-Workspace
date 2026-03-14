import api, { extractData } from './api';

function normalizeTaskPayload(payload) {
  return {
    ...payload,
    assignedTo: payload.assignedTo || null,
    dueDate: payload.dueDate || null,
  };
}

export async function getTasks(filters = {}) {
  const response = await api.get('/tasks', { params: filters });
  return extractData(response);
}

export async function getTaskById(id) {
  const response = await api.get(`/tasks/${id}`);
  return extractData(response);
}

export async function createTask(payload) {
  const response = await api.post('/tasks/create', normalizeTaskPayload(payload));
  return extractData(response).task;
}

export async function updateTask(payload) {
  const response = await api.put('/tasks/update', normalizeTaskPayload(payload));
  return extractData(response).task;
}

export async function deleteTask(id) {
  const response = await api.delete('/tasks/delete', { data: { id } });
  return extractData(response).task;
}
