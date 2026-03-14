const { validateBody } = require('../middleware/validate');
const teamService = require('../services/teamService');
const { sendSuccess } = require('../utils/response');
const { inviteMemberSchema, removeMemberSchema } = require('../utils/validators');

async function listTeamController(req, res) {
  const result = await teamService.listTeam();
  return sendSuccess(res, { data: result });
}

async function inviteMemberController(req, res) {
  const payload = validateBody(inviteMemberSchema, req);
  const member = await teamService.inviteMember(req.currentUser, payload);
  return sendSuccess(res, { statusCode: 201, data: { member } });
}

async function removeMemberController(req, res) {
  const payload = validateBody(removeMemberSchema, req);
  const member = await teamService.removeMember(req.currentUser, payload.userId);
  return sendSuccess(res, { data: { member } });
}

module.exports = {
  listTeamController,
  inviteMemberController,
  removeMemberController,
};
