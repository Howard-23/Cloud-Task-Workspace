const { isDatabaseConfigured } = require('../server/config/db');
const { query } = require('../server/config/db');
const { isFirebaseAdminConfigured } = require('../server/config/firebaseAdmin');
const { withErrorHandler } = require('../server/middleware/errorHandler');
const { allowMethods } = require('../server/middleware/methodGuard');
const { sendSuccess } = require('../server/utils/response');

module.exports = withErrorHandler(async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }

  let database = {
    configured: isDatabaseConfigured(),
    status: 'not_configured',
  };

  if (isDatabaseConfigured()) {
    const startedAt = Date.now();
    await query('SELECT 1');
    database = {
      configured: true,
      status: 'ok',
      latencyMs: Date.now() - startedAt,
    };
  }

  return sendSuccess(res, {
    data: {
      service: 'CloudTask Pro API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      integrations: {
        databaseConfigured: isDatabaseConfigured(),
        firebaseAdminConfigured: isFirebaseAdminConfigured(),
      },
      database,
    },
  });
});
