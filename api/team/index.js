const {
  inviteMemberController,
  listTeamController,
  removeMemberController,
} = require('../../server/controllers/teamController');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { withAuth } = require('../../server/middleware/authMiddleware');
const { allowMethods } = require('../../server/middleware/methodGuard');

module.exports = withErrorHandler(
  withAuth(async (req, res) => {
    if (!allowMethods(req, res, ['GET', 'POST', 'DELETE'])) {
      return;
    }

    if (req.method === 'GET') {
      return listTeamController(req, res);
    }

    if (req.method === 'POST') {
      return inviteMemberController(req, res);
    }

    return removeMemberController(req, res);
  }),
);
