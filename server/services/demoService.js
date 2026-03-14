const { createActivityLog } = require('../queries/activityLogs');
const projectsQuery = require('../queries/projects');
const tasksQuery = require('../queries/tasks');
const { withTransaction } = require('../config/db');
const { AppError } = require('../utils/errors');

async function seedDemoWorkspace(currentUser) {
  const existingProjects = await projectsQuery.listProjectsForUser(currentUser, { archived: false });

  if (existingProjects.length) {
    throw new AppError('Demo data can only be seeded into an empty workspace.', 400, 'workspace_not_empty');
  }

  return withTransaction(async (client) => {
    const project = await projectsQuery.insertProject(
      currentUser.id,
      {
        title: 'Product Launch Sprint',
        description: 'Sample launch workflow for onboarding and demo purposes.',
        status: 'active',
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        priority: 'high',
        archived: false,
      },
      client,
    );

    await projectsQuery.replaceProjectMembers(project.id, currentUser.id, [], client);

    const sampleTasks = [
      {
        title: 'Define launch goals',
        description: 'Clarify success metrics, release scope, and owners.',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        title: 'Prepare campaign assets',
        description: 'Collect visuals, copy, and channel-specific deliverables.',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        title: 'Review release checklist',
        description: 'Confirm launch readiness with stakeholders and QA.',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
    ];

    for (const task of sampleTasks) {
      await tasksQuery.insertTask(
        {
          projectId: project.id,
          assignedTo: currentUser.id,
          ...task,
        },
        client,
      );
    }

    await createActivityLog(
      {
        userId: currentUser.id,
        action: 'demo_seeded',
        entityType: 'project',
        entityId: project.id,
        message: `${currentUser.name} seeded demo workspace data.`,
      },
      client,
    );

    return { project };
  });
}

module.exports = {
  seedDemoWorkspace,
};
