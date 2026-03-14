function sendSuccess(res, { statusCode = 200, data = {}, meta } = {}) {
  const payload = {
    success: true,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

function sendError(
  res,
  { statusCode = 500, message = 'Internal server error', code = 'internal_error', details } = {},
) {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
