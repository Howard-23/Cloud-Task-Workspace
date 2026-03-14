import { useContext } from 'react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function SettingsPage() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { logout, profile, saveProfile } = useAuth();
  const toast = useToast();

  async function toggleNotifications() {
    try {
      await saveProfile({
        name: profile?.name || 'Workspace User',
        avatarUrl: profile?.avatarUrl || '',
        themePreference: theme,
        notificationsEnabled: !profile?.notificationsEnabled,
      });
      toast.success('Notification preference updated.');
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleLogout() {
    await logout();
    toast.info('You have been signed out.');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Control theme, notifications, and account access."
      />

      <section className="dashboard-grid">
        <Card title="Appearance" description="Adjust your preferred theme mode.">
          <div className="action-grid">
            <button
              type="button"
              className={`action-card ${theme === 'light' ? 'action-card--active' : ''}`.trim()}
              onClick={() => setTheme('light')}
            >
              Light mode
            </button>
            <button
              type="button"
              className={`action-card ${theme === 'dark' ? 'action-card--active' : ''}`.trim()}
              onClick={() => setTheme('dark')}
            >
              Dark mode
            </button>
          </div>
        </Card>

        <Card title="Notifications" description="Persist your workspace notification toggle.">
          <div className="settings-row">
            <div>
              <strong>Email summaries</strong>
              <p>Track activity, due dates, and important team changes.</p>
            </div>
            <Button variant="secondary" onClick={toggleNotifications}>
              {profile?.notificationsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>
      </section>

      <Card title="Account access" description="End the current session from this device.">
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
