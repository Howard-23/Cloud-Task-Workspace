const { sendError } = require('../utils/response');

function allowMethods(req, res, methods = []) {
  if (methods.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', methods.join(', '));
  sendError(res, {
    statusCode: 405,
    code: 'method_not_allowed',
    message: `Method ${req.method} is not allowed for this route.`,
  });

  return false;
}

module.exports = {
  allowMethods,
};
