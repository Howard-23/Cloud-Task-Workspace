const { ensureAuthUser } = require('./userService');

async function verifyAuthenticatedUser(currentUser) {
  return {
    user: currentUser,
  };
}

async function syncAuthenticatedUser(authUser, overrides) {
  const user = await ensureAuthUser(authUser, overrides);
  return {
    user,
  };
}

module.exports = {
  verifyAuthenticatedUser,
  syncAuthenticatedUser,
};
