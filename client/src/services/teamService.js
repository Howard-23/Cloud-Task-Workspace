import api, { extractData } from './api';

export async function getTeamMembers() {
  const response = await api.get('/team');
  return extractData(response);
}

export async function inviteMember(payload) {
  const response = await api.post('/team/invite', {
    ...payload,
    avatarUrl: payload.avatarUrl || null,
  });
  return extractData(response).member;
}

export async function removeMember(userId) {
  const response = await api.delete('/team/remove', { data: { userId } });
  return extractData(response).member;
}
