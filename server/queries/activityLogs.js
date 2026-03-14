const { query } = require('../config/db');

async function createActivityLog(payload, client) {
  const result = await query(
    `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id AS "userId",
        action,
        entity_type AS "entityType",
        entity_id AS "entityId",
        message,
        created_at AS "createdAt"
    `,
    [payload.userId || null, payload.action, payload.entityType, payload.entityId || null, payload.message],
    client,
  );

  return result.rows[0];
}

async function listRecentActivity(limit = 10, client) {
  const result = await query(
    `
      SELECT
        a.id,
        a.user_id AS "userId",
        a.action,
        a.entity_type AS "entityType",
        a.entity_id AS "entityId",
        a.message,
        a.created_at AS "createdAt",
        u.name AS "userName"
      FROM activity_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT $1
    `,
    [limit],
    client,
  );

  return result.rows;
}

async function listActivityForEntity(entityType, entityId, limit = 10, client) {
  const result = await query(
    `
      SELECT
        a.id,
        a.user_id AS "userId",
        a.action,
        a.entity_type AS "entityType",
        a.entity_id AS "entityId",
        a.message,
        a.created_at AS "createdAt",
        u.name AS "userName"
      FROM activity_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.entity_type = $1 AND a.entity_id = $2
      ORDER BY a.created_at DESC
      LIMIT $3
    `,
    [entityType, entityId, limit],
    client,
  );

  return result.rows;
}

module.exports = {
  createActivityLog,
  listRecentActivity,
  listActivityForEntity,
};
