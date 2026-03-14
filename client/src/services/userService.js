import api, { extractData } from './api';

export async function syncUser(overrides = {}) {
  const response = await api.post('/auth/syncUser', {
    ...overrides,
    avatarUrl: overrides.avatarUrl || undefined,
  });
  return extractData(response).user;
}

export async function verifyUser() {
  const response = await api.post('/auth/verifyUser');
  return extractData(response).user;
}

export async function getUserProfile() {
  const response = await api.get('/users/profile');
  return extractData(response);
}

export async function updateUserProfile(payload) {
  const response = await api.put('/users/update', {
    ...payload,
    avatarUrl: payload.avatarUrl || '',
  });
  return extractData(response).user;
}
