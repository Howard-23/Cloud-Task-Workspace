const { query } = require('../config/db');

const USER_SELECT = `
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
`;

async function getUserByFirebaseUid(firebaseUid, client) {
  const result = await query(`${USER_SELECT} WHERE firebase_uid = $1`, [firebaseUid], client);
  return result.rows[0] || null;
}

async function getUserByEmail(email, client) {
  const result = await query(`${USER_SELECT} WHERE email = $1`, [email], client);
  return result.rows[0] || null;
}

async function getUserById(id, client) {
  const result = await query(`${USER_SELECT} WHERE id = $1`, [id], client);
  return result.rows[0] || null;
}

async function listUsers(client) {
  const result = await query(`${USER_SELECT} ORDER BY name ASC`, [], client);
  return result.rows;
}

async function insertUser(payload, client) {
  const result = await query(
    `
      INSERT INTO users (
        firebase_uid,
        name,
        email,
        avatar_url,
        role,
        theme_preference,
        notifications_enabled
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
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
    `,
    [
      payload.firebaseUid,
      payload.name,
      payload.email,
      payload.avatarUrl || null,
      payload.role || 'member',
      payload.themePreference || 'light',
      payload.notificationsEnabled ?? true,
    ],
    client,
  );

  return result.rows[0];
}

async function updateUserById(id, payload, client) {
  const result = await query(
    `
      UPDATE users
      SET
        firebase_uid = COALESCE($2, firebase_uid),
        name = COALESCE($3, name),
        email = COALESCE($4, email),
        avatar_url = COALESCE($5, avatar_url),
        role = COALESCE($6, role),
        theme_preference = COALESCE($7, theme_preference),
        notifications_enabled = COALESCE($8, notifications_enabled),
        updated_at = NOW()
      WHERE id = $1
      RETURNING
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
    `,
    [
      id,
      payload.firebaseUid || null,
      payload.name || null,
      payload.email || null,
      payload.avatarUrl || null,
      payload.role || null,
      payload.themePreference || null,
      payload.notificationsEnabled ?? null,
    ],
    client,
  );

  return result.rows[0] || null;
}

async function deleteUserById(id, client) {
  const result = await query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING
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
    `,
    [id],
    client,
  );

  return result.rows[0] || null;
}

module.exports = {
  getUserByFirebaseUid,
  getUserByEmail,
  getUserById,
  listUsers,
  insertUser,
  updateUserById,
  deleteUserById,
};
