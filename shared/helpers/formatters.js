function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCompactDate(value) {
  if (!value) return 'No date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

module.exports = {
  titleCase,
  formatCompactDate,
  default: {
    titleCase,
    formatCompactDate,
  },
};
