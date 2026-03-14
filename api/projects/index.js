const { listProjectsController } = require('../../server/controllers/projectController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['GET'])) {
      return;
    }

    return listProjectsController(req, res);
  }),
);
