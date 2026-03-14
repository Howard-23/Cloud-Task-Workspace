const { isDatabaseConfigured } = require('../server/config/db');
const { isFirebaseAdminConfigured } = require('../server/config/firebaseAdmin');
const { withErrorHandler } = require('../server/middleware/errorHandler');
const { allowMethods } = require('../server/middleware/methodGuard');
const { sendSuccess } = require('../server/utils/response');

module.exports = withErrorHandler(async (req, res) => {
  if (!allowMethods(req, res, ['GET'])) {
    return;
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
    },
  });
});
