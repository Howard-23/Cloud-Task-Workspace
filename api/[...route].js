const { syncUserController, verifyUserController } = require('../server/controllers/authController');
const { listCommentsController, createCommentController } = require('../server/controllers/commentController');
const { seedDemoController } = require('../server/controllers/demoController');
const {
  listNotificationsController,
  readAllNotificationsController,
  readNotificationController,
} = require('../server/controllers/notificationController');
const {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} = require('../server/controllers/projectController');
const {
  createTaskController,
  deleteTaskController,
  getTaskController,
  listTasksController,
  updateTaskController,
} = require('../server/controllers/taskController');
const { inviteMemberController, listTeamController, removeMemberController } = require('../server/controllers/teamController');
const { getProfileController, updateProfileController } = require('../server/controllers/userController');
const { isDatabaseConfigured, query } = require('../server/config/db');
const { isFirebaseAdminConfigured } = require('../server/config/firebaseAdmin');
const { withErrorHandler } = require('../server/middleware/errorHandler');
const { withAuth } = require('../server/middleware/authMiddleware');
const { allowMethods } = require('../server/middleware/methodGuard');
const { AppError } = require('../server/utils/errors');
const { sendSuccess } = require('../server/utils/response');

function getSegments(req) {
  const route = req.query?.route;

  if (Array.isArray(route)) {
    return route.filter(Boolean);
  }

  return route ? [route] : [];
}

async function handleHealth(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }

  let database = {
    configured: isDatabaseConfigured(),
    status: 'not_configured',
  };

  if (isDatabaseConfigured()) {
    const startedAt = Date.now();
    await query('SELECT 1');
    database = {
      configured: true,
      status: 'ok',
      latencyMs: Date.now() - startedAt,
    };
  }

  return sendSuccess(res, {
    data: {
      service: 'CloudTask Pro API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      integrations: {
        databaseConfigured: isDatabaseConfigured(),
        firebaseAdminConfigured: isFirebaseAdminConfigured(),
      },
      database,
    },
  });
}

async function handleProtected(req, res, segments) {
  const [resource, resourceId] = segments;

  if (resource === 'auth') {
    if (!allowMethods(req, res, ['POST'])) {
      return;
    }

    if (resourceId === 'syncUser') {
      return syncUserController(req, res);
    }

    if (resourceId === 'verifyUser') {
      return verifyUserController(req, res);
    }
  }

  if (resource === 'comments') {
    if (!allowMethods(req, res, ['GET', 'POST'])) {
      return;
    }

    if (req.method === 'GET') {
      return listCommentsController(req, res);
    }

    return createCommentController(req, res);
  }

  if (resource === 'demo' && resourceId === 'seed') {
    if (!allowMethods(req, res, ['POST'])) {
      return;
    }

    return seedDemoController(req, res);
  }

  if (resource === 'notifications') {
    if (!allowMethods(req, res, ['GET', 'PUT'])) {
      return;
    }

    if (req.method === 'GET') {
      return listNotificationsController(req, res);
    }

    if (req.body?.id) {
      return readNotificationController(req, res);
    }

    return readAllNotificationsController(req, res);
  }

  if (resource === 'projects') {
    if (resourceId) {
      if (!allowMethods(req, res, ['GET'])) {
        return;
      }

      req.query = {
        ...req.query,
        id: resourceId,
      };

      return getProjectController(req, res);
    }

    if (!allowMethods(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) {
      return;
    }

    if (req.method === 'GET') {
      return listProjectsController(req, res);
    }

    if (req.method === 'POST') {
      return createProjectController(req, res);
    }

    if (req.method === 'PUT') {
      return updateProjectController(req, res);
    }

    return deleteProjectController(req, res);
  }

  if (resource === 'tasks') {
    if (resourceId) {
      if (!allowMethods(req, res, ['GET'])) {
        return;
      }

      req.query = {
        ...req.query,
        id: resourceId,
      };

      return getTaskController(req, res);
    }

    if (!allowMethods(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) {
      return;
    }

    if (req.method === 'GET') {
      return listTasksController(req, res);
    }

    if (req.method === 'POST') {
      return createTaskController(req, res);
    }

    if (req.method === 'PUT') {
      return updateTaskController(req, res);
    }

    return deleteTaskController(req, res);
  }

  if (resource === 'team') {
    if (resourceId === 'invite') {
      if (!allowMethods(req, res, ['POST'])) {
        return;
      }

      return inviteMemberController(req, res);
    }

    if (resourceId === 'remove') {
      if (!allowMethods(req, res, ['DELETE'])) {
        return;
      }

      return removeMemberController(req, res);
    }

    if (!allowMethods(req, res, ['GET'])) {
      return;
    }

    return listTeamController(req, res);
  }

  if (resource === 'users') {
    if (!allowMethods(req, res, ['GET', 'PUT'])) {
      return;
    }

    if (req.method === 'GET') {
      return getProfileController(req, res);
    }

    return updateProfileController(req, res);
  }

  throw new AppError('API route not found.', 404, 'not_found');
}

module.exports = withErrorHandler(async (req, res) => {
  const segments = getSegments(req);

  if (segments[0] === 'health') {
    return handleHealth(req, res);
  }

  return withAuth((authedReq, authedRes) => handleProtected(authedReq, authedRes, segments))(req, res);
});
