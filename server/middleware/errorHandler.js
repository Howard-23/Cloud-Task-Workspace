const { ZodError } = require('zod');

const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');

function handleApiError(error, res) {
  if (error instanceof ZodError) {
    return sendError(res, {
      statusCode: 400,
      code: 'validation_error',
      message: 'Validation failed',
      details: error.flatten(),
    });
  }

  if (error instanceof AppError) {
    return sendError(res, {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error?.code === '23505') {
    return sendError(res, {
      statusCode: 409,
      code: 'duplicate_record',
      message: 'A record with those details already exists.',
    });
  }

  console.error(error);

  return sendError(res, {
    statusCode: 500,
    code: 'internal_error',
    message: 'Something went wrong while processing the request.',
  });
}

function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  };
}

module.exports = {
  handleApiError,
  withErrorHandler,
};
