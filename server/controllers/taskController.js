const { validateBody, validateQuery } = require('../middleware/validate');
const taskService = require('../services/taskService');
const { sendSuccess } = require('../utils/response');
const { idSchema, taskPayloadSchema, taskQuerySchema, taskUpdateSchema } = require('../utils/validators');

async function listTasksController(req, res) {
  const filters = validateQuery(taskQuerySchema, req);
  const result = await taskService.listTasks(req.currentUser, filters);
  return sendSuccess(res, { data: result });
}

async function getTaskController(req, res) {
  const { id } = idSchema.parse({ id: req.query.id });
  const result = await taskService.getTask(req.currentUser, id);
  return sendSuccess(res, { data: result });
}

async function createTaskController(req, res) {
  const payload = validateBody(taskPayloadSchema, req);
  const task = await taskService.createTask(req.currentUser, payload);
  return sendSuccess(res, { statusCode: 201, data: { task } });
}

async function updateTaskController(req, res) {
  const payload = validateBody(taskUpdateSchema, req);
  const task = await taskService.updateTask(req.currentUser, payload);
  return sendSuccess(res, { data: { task } });
}

async function deleteTaskController(req, res) {
  const payload = validateBody(idSchema, req);
  const task = await taskService.deleteTask(req.currentUser, payload.id);
  return sendSuccess(res, { data: { task } });
}

module.exports = {
  listTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
};
