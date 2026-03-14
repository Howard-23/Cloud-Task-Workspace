import api, { extractData } from './api';

export async function getNotifications() {
  const response = await api.get('/notifications');
  return extractData(response);
}

export async function markNotificationRead(id) {
  const response = await api.put('/notifications', { id });
  return extractData(response).notification;
}

export async function markAllNotificationsRead() {
  const response = await api.put('/notifications', {});
  return extractData(response);
}
