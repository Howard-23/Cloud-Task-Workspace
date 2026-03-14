const { query } = require('../config/db');

async function listWorkspaceMembers(client) {
  const result = await query(
    `
      SELECT
        id,
        firebase_uid AS "firebaseUid",
        name,
        email,
        avatar_url AS "avatarUrl",
        role,
        theme_preference AS "themePreference",
        notifications_enabled AS "notificationsEnabled",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      ORDER BY
        CASE role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        name ASC
    `,
    [],
    client,
  );

  return result.rows;
}

module.exports = {
  listWorkspaceMembers,
};
