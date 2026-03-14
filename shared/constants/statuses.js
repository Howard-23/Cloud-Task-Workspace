const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'];
const TASK_STATUSES = ['todo', 'in_progress', 'done'];

const STATUS_LABELS = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

module.exports = {
  PROJECT_STATUSES,
  TASK_STATUSES,
  STATUS_LABELS,
  default: {
    PROJECT_STATUSES,
    TASK_STATUSES,
    STATUS_LABELS,
  },
};
