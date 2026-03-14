import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

import CommandPalette from '../common/CommandPalette';
import Drawer from '../ui/Drawer';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeydown(event) {
      const isModifierK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isModifierK) {
        event.preventDefault();
        setCommandPaletteOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-shell__sidebar">
        <Sidebar />
      </aside>

      <div className="dashboard-shell__main">
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleSidebar={() => setDrawerOpen(true)}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navigation">
        <Sidebar compact onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
