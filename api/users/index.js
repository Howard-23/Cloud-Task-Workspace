const { getProfileController, updateProfileController } = require('../../server/controllers/userController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['GET', 'PUT'])) {
      return;
    }

    if (req.method === 'GET') {
      return getProfileController(req, res);
    }

    return updateProfileController(req, res);
  }),
);
