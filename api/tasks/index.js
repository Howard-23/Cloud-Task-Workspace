const {
  createTaskController,
  deleteTaskController,
  listTasksController,
  updateTaskController,
} = require('../../server/controllers/taskController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
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
  }),
);
