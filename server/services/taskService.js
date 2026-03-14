const { createActivityLog } = require('../queries/activityLogs');
const { insertNotification } = require('../queries/notifications');
const projectsQuery = require('../queries/projects');
const tasksQuery = require('../queries/tasks');
const { withTransaction } = require('../config/db');
const { canEditTasks } = require('../../shared/helpers/permissions');
const { AppError } = require('../utils/errors');

async function listTasks(currentUser, filters) {
  const { rows: tasks, pagination } = await tasksQuery.listTasksForUser(currentUser, filters);

  return {
    tasks,
    pagination,
  };
}

async function getTask(currentUser, taskId) {
  const task = await tasksQuery.getTaskForUser(taskId, currentUser);

  if (!task) {
    throw new AppError('Task not found.', 404, 'task_not_found');
  }

  return {
    task,
  };
}

async function createTask(currentUser, payload) {
  return withTransaction(async (client) => {
    const project = await projectsQuery.getProjectForUser(payload.projectId, currentUser.id, client);
    const membership = await projectsQuery.getProjectMembership(payload.projectId, currentUser.id, client);

    if (!project) {
      throw new AppError('Project not found.', 404, 'project_not_found');
    }

    if (!canEditTasks(currentUser, project, membership)) {
      throw new AppError('Your role does not allow creating tasks in this project.', 403, 'forbidden');
    }

    const task = await tasksQuery.insertTask(payload, client);

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'task_created',
        entityType: 'task',
        entityId: task.id,
        message: `${currentUser.name} created task ${task.title}.`,
      },
      client,
    );

    if (task.assignedTo && task.assignedTo !== currentUser.id) {
      await insertNotification(
        {
          userId: task.assignedTo,
          actorUserId: currentUser.id,
          type: 'task_assigned',
          title: 'Task assigned',
          message: `${currentUser.name} assigned you to ${task.title}.`,
          entityType: 'task',
          entityId: task.id,
        },
        client,
      );
    }

    return task;
  });
}

async function updateTask(currentUser, payload) {
  return withTransaction(async (client) => {
    const existingTask = await tasksQuery.getTaskForUser(payload.id, currentUser.id, client);

    if (!existingTask) {
      throw new AppError('Task not found.', 404, 'task_not_found');
    }

    const projectId = payload.projectId || existingTask.projectId;
    const project = await projectsQuery.getProjectForUser(projectId, currentUser.id, client);
    const membership = await projectsQuery.getProjectMembership(projectId, currentUser.id, client);

    if (!canEditTasks(currentUser, project, membership)) {
      throw new AppError('Your role does not allow editing tasks in this project.', 403, 'forbidden');
    }

    const task = await tasksQuery.updateTask(payload.id, payload, client);

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'task_updated',
        entityType: 'task',
        entityId: task.id,
        message: `${currentUser.name} updated task ${task.title}.`,
      },
      client,
    );

    if (task.assignedTo && task.assignedTo !== currentUser.id && task.assignedTo !== existingTask.assignedTo) {
      await insertNotification(
        {
          userId: task.assignedTo,
          actorUserId: currentUser.id,
          type: 'task_assigned',
          title: 'Task assigned',
          message: `${currentUser.name} assigned you to ${task.title}.`,
          entityType: 'task',
          entityId: task.id,
        },
        client,
      );
    }

    if (task.assignedTo && task.assignedTo !== currentUser.id && task.status !== existingTask.status) {
      await insertNotification(
        {
          userId: task.assignedTo,
          actorUserId: currentUser.id,
          type: 'task_status_changed',
          title: 'Task status changed',
          message: `${currentUser.name} changed ${task.title} to ${task.status.replace('_', ' ')}.`,
          entityType: 'task',
          entityId: task.id,
        },
        client,
      );
    }

    return task;
  });
}

async function deleteTask(currentUser, taskId) {
  return withTransaction(async (client) => {
    const existingTask = await tasksQuery.getTaskForUser(taskId, currentUser.id, client);

    if (!existingTask) {
      throw new AppError('Task not found.', 404, 'task_not_found');
    }

    const project = await projectsQuery.getProjectForUser(existingTask.projectId, currentUser.id, client);
    const membership = await projectsQuery.getProjectMembership(existingTask.projectId, currentUser.id, client);

    if (!canEditTasks(currentUser, project, membership)) {
      throw new AppError('Your role does not allow deleting tasks in this project.', 403, 'forbidden');
    }

    const task = await tasksQuery.deleteTask(taskId, client);

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'task_deleted',
        entityType: 'task',
        entityId: taskId,
        message: `${currentUser.name} deleted task ${task.title}.`,
      },
      client,
    );

    return task;
  });
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
