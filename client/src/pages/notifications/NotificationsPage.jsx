import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/formatDate';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead } = useNotifications();

  if (error) {
    return <ErrorState description={error} action={<Button onClick={() => refresh()}>Retry</Button>} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Notifications"
        title="Workspace notifications"
        description="Track assignment changes, project updates, and workspace activity that needs attention."
        actions={
          <Button variant="secondary" onClick={() => markAllRead()} disabled={!unreadCount}>
            Mark all as read
          </Button>
        }
      />

      {loading ? (
        <Card title="Loading notifications">Syncing your latest updates...</Card>
      ) : notifications.length ? (
        <Card>
          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${notification.readAt ? '' : 'notification-item--unread'}`.trim()}
                onClick={() => markRead(notification.id)}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </div>
                <span>{formatDate(notification.createdAt)}</span>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState title="No notifications yet" description="Assignments, invites, and updates will appear here." />
      )}
    </div>
  );
}
