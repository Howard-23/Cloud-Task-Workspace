const { createActivityLog, listActivityForEntity, listRecentActivity } = require('../queries/activityLogs');
const { insertNotification } = require('../queries/notifications');
const projectsQuery = require('../queries/projects');
const tasksQuery = require('../queries/tasks');
const { withTransaction } = require('../config/db');
const {
  canChangeProjectSettings,
  canCreateProjects,
  canDeleteProject,
} = require('../../shared/helpers/permissions');
const { AppError } = require('../utils/errors');

function normalizeProjectMembers(payload) {
  if (Array.isArray(payload.memberAssignments) && payload.memberAssignments.length) {
    return payload.memberAssignments;
  }

  if (Array.isArray(payload.memberIds) && payload.memberIds.length) {
    return payload.memberIds.map((userId) => ({ userId, role: 'member' }));
  }

  return [];
}

function buildProjectHealth(project) {
  if (!project) return 'on_track';
  if (project.archived) return 'archived';
  if (project.status === 'completed' || project.progressPercentage >= 100) return 'healthy';

  if (project.dueDate) {
    const dueTime = new Date(project.dueDate).getTime();
    const now = Date.now();

    if (dueTime < now) {
      return 'overdue';
    }

    const remainingDays = (dueTime - now) / (1000 * 60 * 60 * 24);
    if (remainingDays <= 3 && project.progressPercentage < 75) {
      return 'at_risk';
    }
  }

  return 'on_track';
}

function enrichProject(project) {
  if (!project) {
    return project;
  }

  return {
    ...project,
    health: buildProjectHealth(project),
  };
}

async function listProjects(currentUser, filters) {
  const [{ rows: projects, pagination }, recentActivity, deadlines] = await Promise.all([
    projectsQuery.listProjectsForUser(currentUser, filters),
    listRecentActivity(8),
    tasksQuery.listTasksForUser(currentUser, { limit: 50, sort: 'due_asc' }),
  ]);

  return {
    projects: projects.map(enrichProject),
    recentActivity,
    upcomingDeadlines: deadlines.rows.filter((task) => task.dueDate).slice(0, 6),
    pagination,
  };
}

async function getProject(currentUser, projectId) {
  const project = await projectsQuery.getProjectForUser(projectId, currentUser);

  if (!project) {
    throw new AppError('Project not found.', 404, 'project_not_found');
  }

  const [members, tasks, activity] = await Promise.all([
    projectsQuery.listProjectMembers(projectId),
    tasksQuery.listTasksForUser(currentUser, { projectId }),
    listActivityForEntity('project', projectId, 10),
  ]);

  return {
    project: enrichProject(project),
    members,
    tasks,
    activity,
  };
}

async function createProject(currentUser, payload) {
  if (!canCreateProjects(currentUser)) {
    throw new AppError('Your role does not allow creating projects.', 403, 'forbidden');
  }

  return withTransaction(async (client) => {
    const project = await projectsQuery.insertProject(currentUser.id, payload, client);
    const memberAssignments = normalizeProjectMembers(payload);

    await projectsQuery.replaceProjectMembers(
      project.id,
      currentUser.id,
      memberAssignments,
      client,
    );

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'project_created',
        entityType: 'project',
        entityId: project.id,
        message: `${currentUser.name} created project ${project.title}.`,
      },
      client,
    );

    for (const assignment of memberAssignments) {
      if (assignment.userId === currentUser.id) {
        continue;
      }

      await insertNotification(
        {
          userId: assignment.userId,
          actorUserId: currentUser.id,
          type: 'project_assigned',
          title: 'Added to a project',
          message: `${currentUser.name} added you to ${project.title}.`,
          entityType: 'project',
          entityId: project.id,
        },
        client,
      );
    }

    return enrichProject(project);
  });
}

async function updateProject(currentUser, payload) {
  return withTransaction(async (client) => {
    const existingProject = await projectsQuery.getProjectForUser(payload.id, currentUser.id, client);
    const membership = await projectsQuery.getProjectMembership(payload.id, currentUser.id, client);

    if (!existingProject) {
      throw new AppError('Project not found.', 404, 'project_not_found');
    }

    if (!canChangeProjectSettings(currentUser, existingProject, membership)) {
      throw new AppError('Your role does not allow changing project settings.', 403, 'forbidden');
    }

    const project = await projectsQuery.updateProject(payload.id, currentUser.id, payload, client);
    const memberAssignments = normalizeProjectMembers(payload);

    await projectsQuery.replaceProjectMembers(
      project.id,
      currentUser.id,
      memberAssignments,
      client,
    );

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'project_updated',
        entityType: 'project',
        entityId: project.id,
        message: `${currentUser.name} updated project ${project.title}.`,
      },
      client,
    );

    const recipients = await projectsQuery.listProjectMembers(project.id, client);

    for (const member of recipients) {
      if (member.userId === currentUser.id) {
        continue;
      }

      await insertNotification(
        {
          userId: member.userId,
          actorUserId: currentUser.id,
          type: 'project_updated',
          title: 'Project updated',
          message: `${currentUser.name} updated ${project.title}.`,
          entityType: 'project',
          entityId: project.id,
        },
        client,
      );
    }

    return enrichProject(project);
  });
}

async function deleteProject(currentUser, projectId) {
  return withTransaction(async (client) => {
    const existingProject = await projectsQuery.getProjectForUser(projectId, currentUser.id, client);
    const membership = await projectsQuery.getProjectMembership(projectId, currentUser.id, client);

    if (!existingProject) {
      throw new AppError('Project not found or not accessible to the current user.', 404, 'project_not_found');
    }

    if (!canDeleteProject(currentUser, existingProject, membership)) {
      throw new AppError('Your role does not allow deleting this project.', 403, 'forbidden');
    }

    const project = await projectsQuery.deleteProject(projectId, currentUser.id, client);

    if (!project) {
      throw new AppError('Project could not be deleted.', 404, 'project_not_found');
    }

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'project_deleted',
        entityType: 'project',
        entityId: projectId,
        message: `${currentUser.name} archived project ${project.title}.`,
      },
      client,
    );

    return project;
  });
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
