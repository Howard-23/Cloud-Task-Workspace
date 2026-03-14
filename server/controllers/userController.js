const { validateBody } = require('../middleware/validate');
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');
const { profileUpdateSchema } = require('../utils/validators');

async function getProfileController(req, res) {
  const result = await userService.getProfile(req.currentUser.id);
  return sendSuccess(res, { data: result });
}

async function updateProfileController(req, res) {
  const payload = validateBody(profileUpdateSchema, req);
  const user = await userService.updateProfile(req.currentUser.id, payload);
  return sendSuccess(res, { data: { user } });
}

module.exports = {
  getProfileController,
  updateProfileController,
};
