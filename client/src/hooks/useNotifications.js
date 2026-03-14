import { useEffect, useState } from 'react';

import {
  getNotifications,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  markNotificationRead as markNotificationReadRequest,
} from '../services/notificationService';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { currentUser, initializing, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const result = await getNotifications();
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
      return result;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError('');
      setLoading(false);
      return;
    }

    refresh().catch(() => undefined);
  }, [currentUser?.uid, initializing, isAuthenticated]);

  async function markRead(id) {
    const existing = notifications.find((notification) => notification.id === id);

    if (existing?.readAt) {
      return existing;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, readAt: new Date().toISOString() } : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      return await markNotificationReadRequest(id);
    } catch (requestError) {
      await refresh().catch(() => undefined);
      throw requestError;
    }
  }

  async function markAllRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt || new Date().toISOString() })));
    setUnreadCount(0);

    try {
      await markAllNotificationsReadRequest();
    } catch (requestError) {
      await refresh().catch(() => undefined);
      throw requestError;
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
}
