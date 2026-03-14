const demoService = require('../services/demoService');
const { sendSuccess } = require('../utils/response');

async function seedDemoController(req, res) {
  const result = await demoService.seedDemoWorkspace(req.currentUser);
  return sendSuccess(res, { statusCode: 201, data: result });
}

module.exports = {
  seedDemoController,
};
