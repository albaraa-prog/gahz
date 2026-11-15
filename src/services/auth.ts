/**
 * Authentication: Email/Password and Google Sign-In.
 * Signing in is optional. Without it the app is a fully working guest mode.
 */

import type { User } from 'firebase/auth';
import type { AuthUser } from '../types';
import { reportError } from '../utils/errors';
import { state } from '../utils/state';
import { track } from './analytics';
import { getFirebase, isFirebaseConfigured } from './firebase';
import { handleSignedIn, handleSignedOut } from './sync';

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, displayName: user.displayName, email: user.email };
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address does not look right.',
  'auth/missing-password': 'Please enter your password.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Please choose a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for this project yet.',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in in the Firebase console.',
};

/** Returns null for errors the user caused on purpose (closing the popup). */
export function describeAuthError(error: unknown): string | null {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  return MESSAGES[code] ?? 'Sign-in failed. Please try again.';
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
      (error) => reportError(error, 'Could not check your sign-in status.'),
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
