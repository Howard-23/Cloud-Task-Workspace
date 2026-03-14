import { NavLink } from 'react-router-dom';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks/board', label: 'Board' },
  { to: '/team', label: 'Team' },
  { to: '/settings', label: 'Settings' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ compact = false, onNavigate }) {
  return (
    <div className={`sidebar ${compact ? 'sidebar--compact' : ''}`.trim()}>
      <div className="sidebar__brand">
        <div className="brand__mark">CT</div>
        <div>
          <strong>CloudTask Pro</strong>
          <p>Premium work OS</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`.trim()}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
