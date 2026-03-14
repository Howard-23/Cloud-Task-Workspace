const { createActivityLog } = require('../queries/activityLogs');
const { insertNotification } = require('../queries/notifications');
const { listWorkspaceMembers } = require('../queries/team');
const usersQuery = require('../queries/users');
const { withTransaction } = require('../config/db');
const { canInviteMembers, canRemoveMembers } = require('../../shared/helpers/permissions');
const { AppError } = require('../utils/errors');

async function listTeam() {
  const members = await listWorkspaceMembers();

  return {
    members,
  };
}

async function inviteMember(currentUser, payload) {
  if (!canInviteMembers(currentUser)) {
    throw new AppError('Your role does not allow inviting workspace members.', 403, 'forbidden');
  }

  return withTransaction(async (client) => {
    const existingMember = await usersQuery.getUserByEmail(payload.email, client);
    let member = existingMember;

    if (existingMember) {
      member = await usersQuery.updateUserById(
        existingMember.id,
        {
          name: payload.name,
          avatarUrl: payload.avatarUrl || existingMember.avatarUrl,
          role: payload.role,
        },
        client,
      );
    } else {
      member = await usersQuery.insertUser(
        {
          firebaseUid: `pending:${payload.email.toLowerCase()}`,
          name: payload.name,
          email: payload.email.toLowerCase(),
          avatarUrl: payload.avatarUrl || null,
          role: payload.role,
          themePreference: 'light',
          notificationsEnabled: true,
        },
        client,
      );
    }

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'member_invited',
        entityType: 'user',
        entityId: member.id,
        message: `${currentUser.name} invited ${member.email} to the workspace.`,
      },
      client,
    );

    await insertNotification(
      {
        userId: member.id,
        actorUserId: currentUser.id,
        type: 'member_invited',
        title: 'Workspace invitation',
        message: `${currentUser.name} invited you to the workspace as ${payload.role}.`,
        entityType: 'user',
        entityId: member.id,
      },
      client,
    );

    return member;
  });
}

async function removeMember(currentUser, userId) {
  if (!canRemoveMembers(currentUser)) {
    throw new AppError('Your role does not allow removing workspace members.', 403, 'forbidden');
  }

  if (currentUser.id === userId) {
    throw new AppError('You cannot remove your own account from the workspace.', 400, 'invalid_action');
  }

  return withTransaction(async (client) => {
    const member = await usersQuery.deleteUserById(userId, client);

    if (!member) {
      throw new AppError('Team member not found.', 404, 'member_not_found');
    }

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'member_removed',
        entityType: 'user',
        entityId: userId,
        message: `${currentUser.name} removed ${member.email} from the workspace.`,
      },
      client,
    );

    return member;
  });
}

module.exports = {
  listTeam,
  inviteMember,
  removeMember,
};
