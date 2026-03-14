const {
  listNotificationsController,
  readAllNotificationsController,
  readNotificationController,
} = require('../../server/controllers/notificationController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
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
  }),
);
