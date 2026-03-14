const { updateTaskController } = require('../../server/controllers/taskController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['PUT'])) {
      return;
    }

    return updateTaskController(req, res);
  }),
);
