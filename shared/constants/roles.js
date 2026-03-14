const USER_ROLES = ['owner', 'admin', 'member', 'viewer'];

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

module.exports = {
  USER_ROLES,
  ROLE_LABELS,
  default: {
    USER_ROLES,
    ROLE_LABELS,
  },
};
