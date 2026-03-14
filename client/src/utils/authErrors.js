export function getFirebaseAuthMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/popup-closed-by-user') {
    return '';
  }

  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in popup. Allow popups and try again.';
  }

  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email using a different sign-in method.';
  }

  return error?.message || 'Authentication failed.';
}

export function shouldIgnoreFirebaseAuthError(error) {
  return error?.code === 'auth/popup-closed-by-user';
}
