import api, { extractData } from './api';

export async function getComments(entityType, entityId) {
  const response = await api.get('/comments', {
    params: { entityType, entityId },
  });

  return extractData(response);
}

export async function createComment(payload) {
  const response = await api.post('/comments', payload);
  return extractData(response).comment;
}
