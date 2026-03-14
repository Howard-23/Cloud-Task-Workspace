const { listCommentsController, createCommentController } = require('../../server/controllers/commentController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['GET', 'POST'])) {
      return;
    }

    if (req.method === 'GET') {
      return listCommentsController(req, res);
    }

    return createCommentController(req, res);
  }),
);
