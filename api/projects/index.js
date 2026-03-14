const {
  createProjectController,
  deleteProjectController,
  listProjectsController,
  updateProjectController,
} = require('../../server/controllers/projectController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
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
  }),
);
