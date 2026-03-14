function hasWorkspaceRole(currentUser, roles = []) {
  return Boolean(currentUser) && roles.includes(currentUser.role);
}

function resolveProjectRole(currentUser, project, membership) {
  if (!currentUser) return null;

  if (membership?.role) {
    return membership.role;
  }

  const ownerId = project?.ownerId || project?.owner_id;

  if (ownerId && ownerId === currentUser.id) {
    return 'owner';
  }

  return null;
}

function canCreateProjects(currentUser) {
  return hasWorkspaceRole(currentUser, ['owner', 'admin', 'member']);
}

function canDeleteProject(currentUser, project, membership) {
  return (
    hasWorkspaceRole(currentUser, ['owner', 'admin']) ||
    resolveProjectRole(currentUser, project, membership) === 'owner'
  );
}

function canInviteMembers(currentUser) {
  return hasWorkspaceRole(currentUser, ['owner', 'admin']);
}

function canRemoveMembers(currentUser) {
  return hasWorkspaceRole(currentUser, ['owner', 'admin']);
}

function canChangeProjectSettings(currentUser, project, membership) {
  return (
    hasWorkspaceRole(currentUser, ['owner', 'admin']) ||
    ['owner', 'admin'].includes(resolveProjectRole(currentUser, project, membership))
  );
}

function canEditTasks(currentUser, project, membership) {
  return (
    hasWorkspaceRole(currentUser, ['owner', 'admin']) ||
    ['owner', 'admin', 'member'].includes(resolveProjectRole(currentUser, project, membership))
  );
}

function canAssignTasks(currentUser, project, membership) {
  return canEditTasks(currentUser, project, membership);
}

module.exports = {
  hasWorkspaceRole,
  resolveProjectRole,
  canCreateProjects,
  canDeleteProject,
  canInviteMembers,
  canRemoveMembers,
  canChangeProjectSettings,
  canEditTasks,
  canAssignTasks,
  default: {
    hasWorkspaceRole,
    resolveProjectRole,
    canCreateProjects,
    canDeleteProject,
    canInviteMembers,
    canRemoveMembers,
    canChangeProjectSettings,
    canEditTasks,
    canAssignTasks,
  },
};
