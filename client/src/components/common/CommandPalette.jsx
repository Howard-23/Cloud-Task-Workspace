import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Modal from '../ui/Modal';

const baseCommands = [
  { id: 'dashboard', label: 'Go to dashboard', hint: '/dashboard', path: '/dashboard' },
  { id: 'projects', label: 'Open projects', hint: '/projects', path: '/projects' },
  { id: 'new-project', label: 'Create project', hint: 'P', path: '/projects/new' },
  { id: 'tasks', label: 'Open tasks', hint: '/tasks', path: '/tasks' },
  { id: 'new-task', label: 'Create task', hint: 'N', path: '/tasks/new' },
  { id: 'board', label: 'Open kanban board', hint: '/tasks/board', path: '/tasks/board' },
  { id: 'calendar', label: 'Open calendar', hint: '/calendar', path: '/calendar' },
  { id: 'notifications', label: 'Open notifications', hint: '/notifications', path: '/notifications' },
  { id: 'team', label: 'Open team directory', hint: '/team', path: '/team' },
  { id: 'settings', label: 'Open settings', hint: '/settings', path: '/settings' },
  { id: 'profile', label: 'Open my profile', hint: '/profile', path: '/profile' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    function handleKeydown(event) {
      const isModifierK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isModifierK) {
        event.preventDefault();
        if (open) {
          onClose();
        }
      }

      if (event.key === 'Escape' && open) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onClose, open]);

  const commands = useMemo(() => {
    const trimmed = query.trim();
    const searchCommand = trimmed
      ? [
          {
            id: 'search',
            label: `Search for "${trimmed}"`,
            hint: '/search',
            path: `/search?q=${encodeURIComponent(trimmed)}`,
          },
        ]
      : [];

    return [...searchCommand, ...baseCommands].filter((command) => {
      if (!trimmed) return true;
      const haystack = `${command.label} ${command.hint} ${command.path}`.toLowerCase();
      return haystack.includes(trimmed.toLowerCase());
    });
  }, [query]);

  function runCommand(path) {
    onClose();

    if (path !== `${location.pathname}${location.search}`) {
      navigate(path);
    }
  }

  return (
    <Modal open={open} title="Command palette" onClose={onClose}>
      <div className="command-palette">
        <input
          autoFocus
          className="input command-palette__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to a page or search the workspace"
        />
        <div className="command-palette__list" role="listbox" aria-label="Quick actions">
          {commands.length ? (
            commands.map((command) => (
              <button
                key={command.id}
                type="button"
                className="command-palette__item"
                onClick={() => runCommand(command.path)}
              >
                <span>{command.label}</span>
                <span>{command.hint}</span>
              </button>
            ))
          ) : (
            <p className="command-palette__empty">No matching actions. Try another keyword.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
