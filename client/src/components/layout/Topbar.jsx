import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/formatDate';

const titleMap = {
  '/dashboard': 'Workspace Overview',
  '/notifications': 'Notifications',
  '/projects': 'Project Portfolio',
  '/tasks': 'Task Operations',
  '/calendar': 'Calendar',
  '/tasks/board': 'Kanban Board',
  '/team': 'Team Directory',
  '/settings': 'Workspace Settings',
  '/profile': 'My Profile',
};

export default function Topbar({ onOpenCommandPalette, onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <Button variant="ghost" className="topbar__menu" onClick={onToggleSidebar}>
          Menu
        </Button>
        <div>
          <p className="topbar__eyebrow">Workspace</p>
          <h1>{titleMap[location.pathname] || 'CloudTask Pro'}</h1>
        </div>
      </div>

      <div className="topbar__right">
        <form className="topbar__search" onSubmit={handleSearchSubmit}>
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workspace"
          />
        </form>

        <Button variant="secondary" className="topbar__command-button" onClick={onOpenCommandPalette}>
          Quick actions
          <span className="topbar__shortcut">Ctrl K</span>
        </Button>

        <div className="topbar__notifications">
          <Button
            variant="ghost"
            className="topbar__notification-button"
            onClick={() => setNotificationsOpen((current) => !current)}
          >
            Notifications
            {unreadCount ? <span className="topbar__notification-count">{unreadCount}</span> : null}
          </Button>

          {notificationsOpen ? (
            <div className="notification-popover">
              <div className="notification-popover__header">
                <strong>Notifications</strong>
                <Button variant="ghost" size="sm" onClick={() => markAllRead()} disabled={!unreadCount}>
                  Mark all read
                </Button>
              </div>
              <div className="notification-popover__body">
                {notifications.length ? (
                  notifications.slice(0, 6).map((notification) => (
                    <Link
                      key={notification.id}
                      to={notification.link || '/notifications'}
                      className={`notification-popover__item ${notification.readAt ? '' : 'notification-popover__item--unread'}`.trim()}
                      onClick={() => {
                        markRead(notification.id).catch(() => undefined);
                        setNotificationsOpen(false);
                      }}
                    >
                      <div>
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>
                      </div>
                      <span>{formatDate(notification.createdAt)}</span>
                    </Link>
                  ))
                ) : (
                  <p className="notification-popover__empty">No notifications yet.</p>
                )}
              </div>
              <Link to="/notifications" className="notification-popover__footer" onClick={() => setNotificationsOpen(false)}>
                View all notifications
              </Link>
            </div>
          ) : null}
        </div>

        <div className="topbar__profile">
          <div>
            <strong>{profile?.name || 'Workspace User'}</strong>
            <p>{profile?.role || 'member'}</p>
          </div>
          <Avatar name={profile?.name} src={profile?.avatarUrl} />
        </div>
      </div>
    </header>
  );
}
