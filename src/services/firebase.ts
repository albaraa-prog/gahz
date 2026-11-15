/**
 * Firebase bootstrap (modular SDK).
 *
 * The SDK is imported dynamically, so guests on a build without Firebase
 * credentials never download it. Configuration comes from VITE_FIREBASE_*
 * environment variables (see .env.example). These values identify the project
 * and are safe to ship to the browser; access is enforced by firestore.rules.
 */

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
};

/** False on builds without credentials: the app then runs in guest-only mode. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let services: Promise<FirebaseServices> | null = null;

async function initialize(): Promise<FirebaseServices> {
  const [{ initializeApp }, { getAuth }, firestore] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  let db: Firestore;
  try {
    // Offline persistence: reads work from cache and writes are queued until
    // the connection returns, across all open tabs.
    db = firestore.initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: firestore.persistentLocalCache({ tabManager: firestore.persistentMultipleTabManager() }),
    });
  } catch (error) {
    // IndexedDB unavailable (some private modes): fall back to the in-memory cache.
    console.warn('[firebase] persistent cache unavailable, using memory cache', error);
    db = firestore.initializeFirestore(app, { ignoreUndefinedProperties: true });
  }

  return { app, auth, db };
}

export function getFirebase(): Promise<FirebaseServices> {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error('Firebase is not configured for this build.'));
  }
  if (!services) {
    services = initialize().catch((error) => {
      services = null; // allow a retry after a failed SDK download
      throw error;
    });
  }
  return services;
}
