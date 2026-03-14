const { readNotificationController } = require('../../server/controllers/notificationController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['PUT'])) {
      return;
    }

    return readNotificationController(req, res);
  }),
);
