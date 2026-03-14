const { query } = require('../../server/config/db');
const { withErrorHandler } = require('../../server/middleware/errorHandler');
const { allowMethods } = require('../../server/middleware/methodGuard');
const { sendSuccess } = require('../../server/utils/response');

module.exports = withErrorHandler(async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }

  const startedAt = Date.now();
  await query('SELECT 1');

  return sendSuccess(res, {
    data: {
      service: 'CloudTask Pro Database',
      status: 'ok',
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
  });
});
