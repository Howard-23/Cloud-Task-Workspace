const { query } = require('../config/db');

async function insertNotification(payload, client) {
  const result = await query(
    `
      INSERT INTO notifications (
        user_id,
        actor_user_id,
        type,
        title,
        message,
        entity_type,
        entity_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        user_id AS "userId",
        actor_user_id AS "actorUserId",
        type,
        title,
        message,
        entity_type AS "entityType",
        entity_id AS "entityId",
        read_at AS "readAt",
        created_at AS "createdAt"
    `,
    [
      payload.userId,
      payload.actorUserId || null,
      payload.type,
      payload.title,
      payload.message,
      payload.entityType || null,
      payload.entityId || null,
    ],
    client,
  );

  return result.rows[0];
}

async function listNotificationsForUser(userId, client) {
  const result = await query(
    `
      SELECT
        n.id,
        n.user_id AS "userId",
        n.actor_user_id AS "actorUserId",
        n.type,
        n.title,
        n.message,
        n.entity_type AS "entityType",
        n.entity_id AS "entityId",
        n.read_at AS "readAt",
        n.created_at AS "createdAt",
        actor.name AS "actorName"
      FROM notifications n
      LEFT JOIN users actor ON actor.id = n.actor_user_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50
    `,
    [userId],
    client,
  );

  return result.rows;
}

async function countUnreadNotifications(userId, client) {
  const result = await query(
    'SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId],
    client,
  );

  return result.rows[0]?.total || 0;
}

async function markNotificationRead(userId, notificationId, client) {
  const result = await query(
    `
      UPDATE notifications
      SET read_at = COALESCE(read_at, NOW())
      WHERE id = $1 AND user_id = $2
      RETURNING
        id,
        user_id AS "userId",
        actor_user_id AS "actorUserId",
        type,
        title,
        message,
        entity_type AS "entityType",
        entity_id AS "entityId",
        read_at AS "readAt",
        created_at AS "createdAt"
    `,
    [notificationId, userId],
    client,
  );

  return result.rows[0] || null;
}

async function markAllNotificationsRead(userId, client) {
  await query(
    `
      UPDATE notifications
      SET read_at = COALESCE(read_at, NOW())
      WHERE user_id = $1 AND read_at IS NULL
    `,
    [userId],
    client,
  );
}

module.exports = {
  insertNotification,
  listNotificationsForUser,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
