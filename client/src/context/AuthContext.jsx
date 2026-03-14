import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import {
  auth,
  loginUser,
  loginWithGoogle,
  logoutUser,
  registerUser,
  requestPasswordReset,
  updateFirebaseAccount,
} from '../services/auth';
import { getUserProfile, syncUser, updateUserProfile, verifyUser } from '../services/userService';

export const AuthContext = createContext(null);

function buildFallbackProfile(user) {
  if (!user) return null;

  return {
    id: user.uid,
    firebaseUid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Workspace User',
    email: user.email,
    avatarUrl: user.photoURL,
    role: 'member',
    themePreference: 'light',
    notificationsEnabled: true,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setInitializing(false);
        return;
      }

      try {
        const syncedProfile = await syncUser({
          name: user.displayName || undefined,
          avatarUrl: user.photoURL || undefined,
        });
        setProfile(syncedProfile);
      } catch (syncError) {
        setProfile(buildFallbackProfile(user));
      } finally {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function refreshProfile() {
    if (!auth.currentUser) return null;

    try {
      const result = await getUserProfile();
      setProfile(result.user);
      return result.user;
    } catch (error) {
      const verifiedProfile = await verifyUser();
      setProfile(verifiedProfile);
      return verifiedProfile;
    }
  }

  async function login(email, password) {
    const credential = await loginUser(email, password);
    return credential.user;
  }

  async function register(payload) {
    const credential = await registerUser(payload);
    return credential.user;
  }

  async function loginWithGoogleProvider() {
    const credential = await loginWithGoogle();
    return credential.user;
  }

  async function forgotPassword(email) {
    return requestPasswordReset(email);
  }

  async function logout() {
    await logoutUser();
  }

  async function saveProfile(payload) {
    const firebaseUser = await updateFirebaseAccount(payload);
    setCurrentUser(firebaseUser);
    const nextProfile = await updateUserProfile(payload);
    setProfile(nextProfile);
    return nextProfile;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        initializing,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        loginWithGoogle: loginWithGoogleProvider,
        forgotPassword,
        logout,
        refreshProfile,
        saveProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
