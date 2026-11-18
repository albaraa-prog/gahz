/**
 * Authentication: Email/Password and Google Sign-In.
 * Signing in is optional. Without it the app is a fully working guest mode.
 */

import type { User } from 'firebase/auth';
import type { AuthUser } from '../types';
import { reportError } from '../utils/errors';
import { t, type TranslationKey } from '../utils/i18n';
import { state } from '../utils/state';
import { track } from './analytics';
import { getFirebase, isFirebaseConfigured } from './firebase';
import { handleSignedIn, handleSignedOut } from './sync';

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL };
}

const MESSAGES: Record<string, TranslationKey> = {
  'auth/invalid-email': 'authError.invalidEmail',
  'auth/missing-password': 'authError.missingPassword',
  'auth/invalid-credential': 'authError.invalidCredential',
  'auth/wrong-password': 'authError.invalidCredential',
  'auth/user-not-found': 'authError.invalidCredential',
  'auth/user-disabled': 'authError.userDisabled',
  'auth/email-already-in-use': 'authError.emailInUse',
  'auth/weak-password': 'authError.weakPassword',
  'auth/too-many-requests': 'authError.tooManyRequests',
  'auth/network-request-failed': 'authError.network',
  'auth/popup-blocked': 'authError.popupBlocked',
  'auth/operation-not-allowed': 'authError.notAllowed',
  'auth/unauthorized-domain': 'authError.unauthorizedDomain',
};

/** Returns null for errors the user caused on purpose (closing the popup). */
export function describeAuthError(error: unknown): string | null {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  return t(MESSAGES[code] ?? 'authError.generic');
}

/** Starts listening for the signed-in user. Safe to call without Firebase credentials. */
export async function initAuth(): Promise<void> {
  if (!isFirebaseConfigured) {
    state.syncStatus = 'disabled';
    return;
  }
  state.syncStatus = 'guest';
  try {
    const [{ auth }, { onAuthStateChanged }] = await Promise.all([getFirebase(), import('firebase/auth')]);
    onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          state.user = toAuthUser(user);
          void handleSignedIn(user.uid);
        } else {
          state.user = null;
          handleSignedOut();
        }
      },
      (error) => reportError(error, t('authError.status')),
    );
  } catch (error) {
    // SDK failed to download (offline first visit): stay in guest mode.
    console.warn('[auth] unavailable', error);
    state.syncStatus = 'guest';
  }
}

export async function signInWithGoogle(): Promise<void> {
  const [{ auth }, sdk] = await Promise.all([getFirebase(), import('firebase/auth')]);
  const provider = new sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await sdk.signInWithPopup(auth, provider);
  track('login', { method: 'google' });
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const [{ auth }, sdk] = await Promise.all([getFirebase(), import('firebase/auth')]);
  await sdk.signInWithEmailAndPassword(auth, email, password);
  track('login', { method: 'password' });
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<void> {
  const [{ auth }, sdk] = await Promise.all([getFirebase(), import('firebase/auth')]);
  const credential = await sdk.createUserWithEmailAndPassword(auth, email, password);
  const displayName = name.trim();
  if (displayName) {
    await sdk.updateProfile(credential.user, { displayName });
    state.user = toAuthUser(credential.user);
  }
  track('sign_up', { method: 'password' });
}

export async function sendPasswordReset(email: string): Promise<void> {
  const [{ auth }, sdk] = await Promise.all([getFirebase(), import('firebase/auth')]);
  await sdk.sendPasswordResetEmail(auth, email);
}

export async function signOutUser(): Promise<void> {
  const [{ auth }, sdk] = await Promise.all([getFirebase(), import('firebase/auth')]);
  await sdk.signOut(auth);
}
