const { isFirebaseAdminConfigured, verifyIdToken } = require('../config/firebaseAdmin');
const { ensureAuthUser } = require('../services/userService');
const { AppError } = require('../utils/errors');

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header || typeof header !== 'string') {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function decodeJwtPayload(token) {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new AppError('Authentication token is malformed.', 401, 'invalid_token');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

  return {
    uid: payload.user_id || payload.sub,
    email: payload.email,
    name: payload.name,
    displayName: payload.name,
    picture: payload.picture,
    photoURL: payload.picture,
    ...payload,
  };
}

async function resolveAuthenticatedUser(token) {
  if (isFirebaseAdminConfigured()) {
    return verifyIdToken(token);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new AppError(
      'Firebase Admin credentials are missing. Configure the server environment variables first.',
      503,
      'firebase_admin_not_configured',
    );
  }

  return decodeJwtPayload(token);
}

function withAuth(handler) {
  return async (req, res) => {
    const token = getBearerToken(req);

    if (!token) {
      throw new AppError('Authentication token is required.', 401, 'unauthorized');
    }

    const decodedToken = await resolveAuthenticatedUser(token);
    req.user = decodedToken;
    req.currentUser = await ensureAuthUser(decodedToken);

    return handler(req, res);
  };
}

module.exports = {
  getBearerToken,
  withAuth,
};
