export function formatDate(value, options = {}) {
  if (!value) return 'No date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return 'No date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function isOverdue(value) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}
