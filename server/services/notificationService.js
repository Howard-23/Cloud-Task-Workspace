const notificationsQuery = require('../queries/notifications');
const { AppError } = require('../utils/errors');

function buildNotificationLink(notification) {
  if (notification.entityType === 'project' && notification.entityId) {
    return `/projects/${notification.entityId}`;
  }

  if (notification.entityType === 'task' && notification.entityId) {
    return '/tasks';
  }

  if (notification.entityType === 'user') {
    return '/team';
  }

  return '/notifications';
}

async function listNotifications(currentUser) {
  const [notifications, unreadCount] = await Promise.all([
    notificationsQuery.listNotificationsForUser(currentUser.id),
    notificationsQuery.countUnreadNotifications(currentUser.id),
  ]);

  return {
    notifications: notifications.map((notification) => ({
      ...notification,
      link: buildNotificationLink(notification),
    })),
    unreadCount,
  };
}

async function markNotificationRead(currentUser, notificationId) {
  const notification = await notificationsQuery.markNotificationRead(currentUser.id, notificationId);

  if (!notification) {
    throw new AppError('Notification not found.', 404, 'notification_not_found');
  }

  return notification;
}

async function markAllNotificationsRead(currentUser) {
  await notificationsQuery.markAllNotificationsRead(currentUser.id);
  return { success: true };
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
