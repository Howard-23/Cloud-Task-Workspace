const { listRecentActivity } = require('../queries/activityLogs');
const usersQuery = require('../queries/users');
const { withTransaction } = require('../config/db');
const { AppError } = require('../utils/errors');

function getFallbackName(authUser, overrides = {}) {
  return (
    overrides.name ||
    authUser.name ||
    authUser.displayName ||
    authUser.email?.split('@')[0] ||
    'Workspace User'
  );
}

async function ensureAuthUser(authUser, overrides = {}) {
  if (!authUser?.uid) {
    throw new AppError('Authenticated user details are missing.', 401, 'invalid_auth_user');
  }

  const email = overrides.email || authUser.email;

  if (!email) {
    throw new AppError('Authenticated user email is required.', 400, 'missing_email');
  }

  const payload = {
    firebaseUid: authUser.uid,
    email,
    name: getFallbackName(authUser, overrides),
    avatarUrl: overrides.avatarUrl || authUser.picture || authUser.photoURL || null,
    role: overrides.role || 'member',
    themePreference: overrides.themePreference || 'light',
    notificationsEnabled: overrides.notificationsEnabled ?? true,
  };

  return withTransaction(async (client) => {
    const allUsers = await usersQuery.listUsers(client);
    const workspaceHasAdmin = allUsers.some((user) => ['owner', 'admin'].includes(user.role));
    const defaultRole = overrides.role || (workspaceHasAdmin ? 'member' : 'owner');
    const existingByUid = await usersQuery.getUserByFirebaseUid(payload.firebaseUid, client);

    if (existingByUid) {
      return usersQuery.updateUserById(
        existingByUid.id,
        {
          ...payload,
          role:
            overrides.role ||
            (!workspaceHasAdmin && existingByUid.role === 'member' ? 'owner' : existingByUid.role),
        },
        client,
      );
    }

    const existingByEmail = await usersQuery.getUserByEmail(payload.email, client);

    if (existingByEmail) {
      return usersQuery.updateUserById(
        existingByEmail.id,
        {
          ...payload,
          role:
            overrides.role ||
            (!workspaceHasAdmin && existingByEmail.role === 'member' ? 'owner' : existingByEmail.role),
        },
        client,
      );
    }

    return usersQuery.insertUser({ ...payload, role: defaultRole }, client);
  });
}

async function getProfile(userId) {
  const user = await usersQuery.getUserById(userId);

  if (!user) {
    throw new AppError('Profile not found.', 404, 'profile_not_found');
  }

  const recentActivity = await listRecentActivity(8);

  return {
    user,
    recentActivity: recentActivity.filter((item) => item.userId === userId),
  };
}

async function updateProfile(userId, payload) {
  const updatedUser = await usersQuery.updateUserById(userId, {
    name: payload.name,
    email: payload.email,
    avatarUrl: payload.avatarUrl || null,
    themePreference: payload.themePreference,
    notificationsEnabled: payload.notificationsEnabled,
  });

  if (!updatedUser) {
    throw new AppError('Unable to update profile.', 404, 'profile_not_found');
  }

  return updatedUser;
}

module.exports = {
  ensureAuthUser,
  getProfile,
  updateProfile,
};
