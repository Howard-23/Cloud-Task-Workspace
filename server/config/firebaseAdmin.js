const admin = require('firebase-admin');

const { AppError } = require('../utils/errors');

require('dotenv').config();

function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

function getAdminApp() {
  if (!isFirebaseAdminConfigured()) {
    throw new AppError(
      'Firebase Admin credentials are missing. Configure the server environment variables first.',
      503,
      'firebase_admin_not_configured',
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return admin.app();
}

async function verifyIdToken(token) {
  return admin.auth(getAdminApp()).verifyIdToken(token);
}

module.exports = {
  admin,
  getAdminApp,
  verifyIdToken,
  isFirebaseAdminConfigured,
};
