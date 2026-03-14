const fs = require('fs');
const path = require('path');

const files = {
    "shared/constants/roles.js": `export const ROLES = { ADMIN: 'admin', MEMBER: 'member' };`,
    "shared/constants/statuses.js": `export const STATUSES = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' };`,
    "shared/constants/priorities.js": `export const PRIORITIES = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };`,
    "shared/helpers/formatters.js": `export const formatDate = (d) => new Date(d).toLocaleDateString();`,

    "server/config/db.js": `const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};`,

    "server/config/firebaseAdmin.js": `const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    }),
  });
}

module.exports = admin;`,

    "server/middleware/authMiddleware.js": `const admin = require('../config/firebaseAdmin');

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized, missing token' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized, invalid token' });
  }
}
module.exports = authMiddleware;`,

    "server/middleware/methodGuard.js": `function methodGuard(allowedMethods) {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ error: \`Method \${req.method} not allowed\` });
    }
    next();
  };
}
module.exports = methodGuard;`,

    "server/middleware/errorHandler.js": `function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
}
module.exports = errorHandler;`,

    "server/utils/response.js": `module.exports = {
  success: (res, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
  },
  error: (res, message, statusCode = 400) => {
    return res.status(statusCode).json({ success: false, error: message });
  }
};`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Server foundation created');
