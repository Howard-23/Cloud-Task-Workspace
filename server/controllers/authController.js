const authService = require('../services/authService');
const { validateBody } = require('../middleware/validate');
const { sendSuccess } = require('../utils/response');
const { profileUpdateSchema } = require('../utils/validators');

async function verifyUserController(req, res) {
  const result = await authService.verifyAuthenticatedUser(req.currentUser);
  return sendSuccess(res, { data: result });
}

async function syncUserController(req, res) {
  const overrides = validateBody(profileUpdateSchema.partial(), req);
  const result = await authService.syncAuthenticatedUser(req.user, overrides);
  return sendSuccess(res, { data: result });
}

module.exports = {
  verifyUserController,
  syncUserController,
};
