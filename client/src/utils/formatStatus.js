const statusLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  healthy: 'Healthy',
  on_track: 'On Track',
  at_risk: 'At Risk',
  overdue: 'Overdue',
  archived: 'Archived',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function formatStatus(value = '') {
  return statusLabels[value] || value.replace(/_/g, ' ');
}
