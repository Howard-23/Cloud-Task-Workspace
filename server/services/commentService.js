const { createActivityLog } = require('../queries/activityLogs');
const commentsQuery = require('../queries/comments');
const projectsQuery = require('../queries/projects');
const tasksQuery = require('../queries/tasks');
const { withTransaction } = require('../config/db');
const { canEditTasks } = require('../../shared/helpers/permissions');
const { AppError } = require('../utils/errors');

async function assertEntityAccess(currentUser, entityType, entityId, client) {
  if (entityType === 'project') {
    const project = await projectsQuery.getProjectForUser(entityId, currentUser, client);

    if (!project) {
      throw new AppError('Project not found.', 404, 'project_not_found');
    }

    return { entityType, entity: project };
  }

  if (entityType === 'task') {
    const task = await tasksQuery.getTaskForUser(entityId, currentUser, client);

    if (!task) {
      throw new AppError('Task not found.', 404, 'task_not_found');
    }

    const project = await projectsQuery.getProjectForUser(task.projectId, currentUser, client);
    const membership = await projectsQuery.getProjectMembership(task.projectId, currentUser.id, client);

    if (!canEditTasks(currentUser, project, membership)) {
      throw new AppError('Your role does not allow commenting on this task.', 403, 'forbidden');
    }

    return { entityType, entity: task };
  }

  throw new AppError('Unsupported comment target.', 400, 'invalid_entity_type');
}

async function listComments(currentUser, entityType, entityId) {
  await assertEntityAccess(currentUser, entityType, entityId);
  const comments = await commentsQuery.listCommentsForEntity(entityType, entityId);
  return { comments };
}

async function createComment(currentUser, payload) {
  return withTransaction(async (client) => {
    await assertEntityAccess(currentUser, payload.entityType, payload.entityId, client);

    const comment = await commentsQuery.insertComment(
      {
        userId: currentUser.id,
        entityType: payload.entityType,
        entityId: payload.entityId,
        body: payload.body,
      },
      client,
    );

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'comment_added',
        entityType: payload.entityType,
        entityId: payload.entityId,
        message: `${currentUser.name} commented on ${payload.entityType}.`,
      },
      client,
    );

    return {
      ...comment,
      userName: currentUser.name,
      userAvatarUrl: currentUser.avatarUrl || null,
    };
  });
}

module.exports = {
  listComments,
  createComment,
};
