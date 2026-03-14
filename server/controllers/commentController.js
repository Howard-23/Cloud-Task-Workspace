const { validateBody, validateQuery } = require('../middleware/validate');
const commentService = require('../services/commentService');
const { sendSuccess } = require('../utils/response');
const { commentPayloadSchema, commentQuerySchema } = require('../utils/validators');

async function listCommentsController(req, res) {
  const query = validateQuery(commentQuerySchema, req);
  const result = await commentService.listComments(req.currentUser, query.entityType, query.entityId);
  return sendSuccess(res, { data: result });
}

async function createCommentController(req, res) {
  const payload = validateBody(commentPayloadSchema, req);
  const comment = await commentService.createComment(req.currentUser, payload);
  return sendSuccess(res, { statusCode: 201, data: { comment } });
}

module.exports = {
  listCommentsController,
  createCommentController,
};
