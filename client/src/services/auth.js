import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  reload,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = getApps().length
  ? getApp()
  : initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'demo-key',
            authDomain: 'demo.local',
            projectId: 'demo-project',
            appId: 'demo-app',
          },
    );

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => undefined);

function ensureFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase client configuration is missing. Add the VITE_FIREBASE_* variables first.');
  }
}

export async function loginUser(email, password) {
  ensureFirebaseConfigured();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerUser({ name, email, password }) {
  ensureFirebaseConfigured();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  return credential;
}

export async function loginWithGoogle() {
  ensureFirebaseConfigured();
  return signInWithPopup(auth, googleProvider);
}

export async function requestPasswordReset(email) {
  ensureFirebaseConfigured();
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function updateFirebaseAccount({ name, email, avatarUrl }) {
  ensureFirebaseConfigured();

  if (!auth.currentUser) {
    throw new Error('No authenticated Firebase user is available.');
  }

  const profileUpdates = {};

  if (typeof name === 'string' && name !== auth.currentUser.displayName) {
    profileUpdates.displayName = name;
  }

  if (typeof avatarUrl === 'string' && avatarUrl !== (auth.currentUser.photoURL || '')) {
    profileUpdates.photoURL = avatarUrl || null;
  }

  if (Object.keys(profileUpdates).length) {
    await updateProfile(auth.currentUser, profileUpdates);
  }

  if (typeof email === 'string' && email && email !== auth.currentUser.email) {
    await updateEmail(auth.currentUser, email);
  }

  await reload(auth.currentUser);
  await auth.currentUser.getIdToken(true);

  return auth.currentUser;
}
