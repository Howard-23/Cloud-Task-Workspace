const { query } = require('../config/db');

async function listCommentsForEntity(entityType, entityId, client) {
  const result = await query(
    `
      SELECT
        c.id,
        c.user_id AS "userId",
        c.entity_type AS "entityType",
        c.entity_id AS "entityId",
        c.body,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        u.name AS "userName",
        u.avatar_url AS "userAvatarUrl"
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.entity_type = $1 AND c.entity_id = $2
      ORDER BY c.created_at ASC
    `,
    [entityType, entityId],
    client,
  );

  return result.rows;
}

async function insertComment(payload, client) {
  const result = await query(
    `
      INSERT INTO comments (user_id, entity_type, entity_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        user_id AS "userId",
        entity_type AS "entityType",
        entity_id AS "entityId",
        body,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [payload.userId || null, payload.entityType, payload.entityId, payload.body],
    client,
  );

  return result.rows[0];
}

module.exports = {
  listCommentsForEntity,
  insertComment,
};
