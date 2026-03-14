const { validateBody, validateQuery } = require('../middleware/validate');
const projectService = require('../services/projectService');
const { sendSuccess } = require('../utils/response');
const { idSchema, projectPayloadSchema, projectQuerySchema, projectUpdateSchema } = require('../utils/validators');

async function listProjectsController(req, res) {
  const filters = validateQuery(projectQuerySchema, req);
  const result = await projectService.listProjects(req.currentUser, filters);
  return sendSuccess(res, { data: result });
}

async function getProjectController(req, res) {
  const { id } = idSchema.parse({ id: req.query.id });
  const result = await projectService.getProject(req.currentUser, id);
  return sendSuccess(res, { data: result });
}

async function createProjectController(req, res) {
  const payload = validateBody(projectPayloadSchema, req);
  const project = await projectService.createProject(req.currentUser, payload);
  return sendSuccess(res, { statusCode: 201, data: { project } });
}

async function updateProjectController(req, res) {
  const payload = validateBody(projectUpdateSchema, req);
  const project = await projectService.updateProject(req.currentUser, payload);
  return sendSuccess(res, { data: { project } });
}

async function deleteProjectController(req, res) {
  const payload = validateBody(idSchema, req);
  const project = await projectService.deleteProject(req.currentUser, payload.id);
  return sendSuccess(res, { data: { project } });
}

module.exports = {
  listProjectsController,
  getProjectController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
};
