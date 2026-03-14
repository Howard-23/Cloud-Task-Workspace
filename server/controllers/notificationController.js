const { validateBody } = require('../middleware/validate');
const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');
const { notificationReadSchema } = require('../utils/validators');

async function listNotificationsController(req, res) {
  const result = await notificationService.listNotifications(req.currentUser);
  return sendSuccess(res, { data: result });
}

async function readNotificationController(req, res) {
  const payload = validateBody(notificationReadSchema, req);
  const notification = await notificationService.markNotificationRead(req.currentUser, payload.id);
  return sendSuccess(res, { data: { notification } });
}

async function readAllNotificationsController(req, res) {
  const result = await notificationService.markAllNotificationsRead(req.currentUser);
  return sendSuccess(res, { data: result });
}

module.exports = {
  listNotificationsController,
  readNotificationController,
  readAllNotificationsController,
};
