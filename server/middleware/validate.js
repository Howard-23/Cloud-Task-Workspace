const { AppError } = require('../utils/errors');

function parseRequestBody(req) {
  if (req.body == null || req.body === '') {
    return {};
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      throw new AppError('Request body must be valid JSON.', 400, 'invalid_json');
    }
  }

  return req.body;
}

function validateBody(schema, req) {
  return schema.parse(parseRequestBody(req));
}

function validateQuery(schema, req) {
  return schema.parse(req.query || {});
}

module.exports = {
  parseRequestBody,
  validateBody,
  validateQuery,
};
