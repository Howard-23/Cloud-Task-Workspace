const fs = require('fs');
const path = require('path');

const files = {
    "server/utils/withApiAuth.js": `const admin = require('../config/firebaseAdmin');

module.exports = function withApiAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split('Bearer ')[1];
      if (!token) return res.status(401).json({ error: 'Missing authorization token' });

      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      
      return handler(req, res);
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};`,

    "server/queries/users.js": `const db = require('../config/db');

exports.upsertUser = async (firebaseUid, email, name, avatarUrl) => {
  const query = \`
    INSERT INTO users (firebase_uid, email, name, avatar_url, role)
    VALUES ($1, $2, $3, $4, 'member')
    ON CONFLICT (firebase_uid)
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
    RETURNING *;
  \`;
  const result = await db.query(query, [firebaseUid, email, name, avatarUrl]);
  return result.rows[0];
};

exports.getUserByUid = async (uid) => {
  const result = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
  return result.rows[0];
};`,

    "server/queries/projects.js": `const db = require('../config/db');

exports.getProjects = async (userId) => {
  const query = \`
    SELECT p.* FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    WHERE p.owner_id = $1 OR pm.user_id = $1
    ORDER BY p.updated_at DESC
  \`;
  const res = await db.query(query, [userId]);
  return res.rows;
};

exports.createProject = async (ownerId, title, description, status = 'todo') => {
  const query = \`
    INSERT INTO projects (owner_id, title, description, status)
    VALUES ($1, $2, $3, $4) RETURNING *
  \`;
  const res = await db.query(query, [ownerId, title, description, status]);
  return res.rows[0];
};

exports.deleteProject = async (projectId, userId) => {
  const query = 'DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id';
  const res = await db.query(query, [projectId, userId]);
  return res.rows[0];
};`,

    "server/queries/tasks.js": `const db = require('../config/db');

exports.getTasks = async (projectId) => {
  const query = 'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC';
  const res = await db.query(query, [projectId]);
  return res.rows;
};

exports.createTask = async (projectId, assignedTo, title, description, priority, status, dueDate) => {
  const query = \`
    INSERT INTO tasks (project_id, assigned_to, title, description, priority, status, due_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  \`;
  const res = await db.query(query, [projectId, assignedTo, title, description, priority, status, dueDate]);
  return res.rows[0];
};

exports.updateTaskStatus = async (taskId, status) => {
  const query = 'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
  const res = await db.query(query, [status, taskId]);
  return res.rows[0];
};`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Queries generated');
