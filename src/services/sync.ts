/**
 * Firestore sync.
 *
 *   /users/{uid}                      profile, settings, stats
 *   /users/{uid}/attempts/{attemptId} one document per finished quiz
 *
 * localStorage stays the source the UI reads from. On sign-in the local and
 * cloud histories are merged in both directions; afterwards every new attempt
 * and every settings change is written to Firestore as well. Firestore's
 * offline cache queues writes while disconnected, so nothing here blocks on
 * the network.
 */

import type { Attempt, UserPreferences } from '../types';
import { reportError } from '../utils/errors';
import { clamp, debounce, isRecord } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { getFirebase, isFirebaseConfigured } from './firebase';
import {
  MAX_ATTEMPTS,
  clearLocalHistory,
  getHistoryOwner,
  mergeAttempts,
  onAttemptAdded,
  parseAttempt,
  replaceHistory,
  setHistoryOwner,
} from './history';
import { currentPreferences, parseCustomConfig, parseTheme } from './preferences';
import { computeStats } from './scoring';

const BATCH_LIMIT = 400; // Firestore allows 500 writes per batch

let pendingWrites = 0;
let applyingRemote = false;
/** Guards against a slow sign-in sync finishing after the user has signed out or switched account. */
let syncGeneration = 0;
/** True while an account is being deleted, so no queued write can recreate its documents. */
let deleting = false;

function refreshStatus(): void {
  if (!state.user) return;
  if (!state.online) state.syncStatus = 'offline';
  else state.syncStatus = pendingWrites > 0 ? 'syncing' : 'synced';
}

/** Tracks a Firestore write without awaiting it (writes only resolve once the server acknowledges them). */
function trackWrite(write: Promise<unknown>, generation: number = syncGeneration): void {
  pendingWrites += 1;
  refreshStatus();
  write
    .then(() => {
      pendingWrites -= 1;
      if (generation === syncGeneration) refreshStatus();
    })
    .catch((error) => {
      pendingWrites -= 1;
      if (generation !== syncGeneration || !state.user) return;
      state.syncStatus = 'error';
      reportError(error, t('error.sync'));
    });
}

/** Plain object for Firestore: no undefined values, plus a server timestamp. */
function attemptToDoc(attempt: Attempt, createdAt: unknown): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    id: attempt.id,
    timestamp: attempt.timestamp,
    date: attempt.date,
    mode: attempt.mode,
    // Rounded and clamped so rows migrated from older versions always pass firestore.rules.
    totalQuestions: Math.max(1, Math.round(attempt.totalQuestions)),
    correct: clamp(Math.round(attempt.correct), 0, Math.max(1, Math.round(attempt.totalQuestions))),
    percent: clamp(Math.round(attempt.percent), 0, 100),
    createdAt,
  };
  if (attempt.durationSeconds !== undefined) doc.durationSeconds = Math.max(0, Math.round(attempt.durationSeconds));
  if (attempt.studyMode !== undefined) doc.studyMode = attempt.studyMode;
  if (attempt.categoryStats) doc.categoryStats = attempt.categoryStats;
  if (attempt.answers) doc.answers = attempt.answers;
  return doc;
}

function parseRemoteSettings(data: unknown): UserPreferences | null {
  if (!isRecord(data) || !isRecord(data.settings)) return null;
  const { settings } = data;
  const theme = parseTheme(settings.theme);
  if (!theme || typeof settings.studyMode !== 'boolean') return null;
  return { theme, studyMode: settings.studyMode, customConfig: parseCustomConfig(settings.customConfig) };
}

async function pushProfile(): Promise<void> {
  const user = state.user;
  if (!user || deleting) return;
  const [{ db }, sdk] = await Promise.all([getFirebase(), import('firebase/firestore')]);
  const preferences = currentPreferences();
  trackWrite(
    sdk.setDoc(
      sdk.doc(db, 'users', user.uid),
      {
        displayName: user.displayName,
        email: user.email,
        settings: {
          theme: preferences.theme,
          studyMode: preferences.studyMode,
          customConfig: preferences.customConfig,
        },
        stats: computeStats(state.history),
        updatedAt: sdk.serverTimestamp(),
      },
      { merge: true },
    ),
  );
}

const pushProfileSoon = debounce(() => {
  void pushProfile().catch((error) => reportError(error, t('error.sync')));
}, 1500);

async function pushAttempt(attempt: Attempt): Promise<void> {
  const user = state.user;
  if (!user || deleting) return;
  const [{ db }, sdk] = await Promise.all([getFirebase(), import('firebase/firestore')]);
  trackWrite(sdk.setDoc(sdk.doc(db, 'users', user.uid, 'attempts', attempt.id), attemptToDoc(attempt, sdk.serverTimestamp())));
}

/**
 * Runs after every sign-in (including the automatic one on page load).
 * Merges local and cloud history, then applies the cloud settings.
 */
export async function handleSignedIn(uid: string): Promise<void> {
  const generation = ++syncGeneration;
  state.syncStatus = state.online ? 'syncing' : 'offline';

  try {
    const [{ db }, sdk] = await Promise.all([getFirebase(), import('firebase/firestore')]);
    const attemptsRef = sdk.collection(db, 'users', uid, 'attempts');

    // Local history is only uploaded when it belongs to a guest or to this
    // same account, never when another account used this browser before.
    const owner = getHistoryOwner();
    const local = owner === null || owner === uid ? state.history : [];

    const [attemptsSnap, profileSnap] = await Promise.all([
      sdk.getDocs(sdk.query(attemptsRef, sdk.orderBy('timestamp', 'desc'), sdk.limit(MAX_ATTEMPTS))),
      sdk.getDoc(sdk.doc(db, 'users', uid)),
    ]);
    if (generation !== syncGeneration) return;

    const remote = attemptsSnap.docs
      .map((snapshot) => parseAttempt(snapshot.data()))
      .filter((attempt): attempt is Attempt => attempt !== null);
    const remoteIds = new Set(remote.map((attempt) => attempt.id));
    const missingRemotely = local.filter((attempt) => !remoteIds.has(attempt.id));

    for (let i = 0; i < missingRemotely.length; i += BATCH_LIMIT) {
      const batch = sdk.writeBatch(db);
      for (const attempt of missingRemotely.slice(i, i + BATCH_LIMIT)) {
        batch.set(sdk.doc(attemptsRef, attempt.id), attemptToDoc(attempt, sdk.serverTimestamp()));
      }
      trackWrite(batch.commit(), generation);
    }

    replaceHistory(mergeAttempts(local, remote));
    setHistoryOwner(uid);

    // Settings saved in the cloud win over this device's, so a second device picks up the user's choices.
    const remoteSettings = parseRemoteSettings(profileSnap.data());
    if (remoteSettings) {
      applyingRemote = true;
      store.set({ theme: remoteSettings.theme, studyMode: remoteSettings.studyMode, customConfig: remoteSettings.customConfig });
      store.flush();
      applyingRemote = false;
    }

    await pushProfile();
    refreshStatus();
  } catch (error) {
    applyingRemote = false;
    if (generation !== syncGeneration) return;
    state.syncStatus = state.online ? 'error' : 'offline';
    reportError(error, t('error.sync'));
  }
}

/** Runs when there is no signed-in user (on load, or after signing out). */
export function handleSignedOut(): void {
  syncGeneration += 1;
  deleting = false;
  pendingWrites = 0;
  state.syncStatus = isFirebaseConfigured ? 'guest' : 'disabled';
  // The history on this device belonged to an account. It is backed up in the
  // cloud, so remove the local copy instead of showing it to the next person.
  if (getHistoryOwner() !== null) {
    clearLocalHistory();
    setHistoryOwner(null);
  }
}

/** Retry after an error, from the status chip. */
export function retrySync(): void {
  if (state.user) void handleSignedIn(state.user.uid);
}

/** Deletes every attempt stored in the cloud for the signed-in user. */
export async function clearRemoteAttempts(): Promise<void> {
  const user = state.user;
  if (!user) return;
  const [{ db }, sdk] = await Promise.all([getFirebase(), import('firebase/firestore')]);
  const attemptsRef = sdk.collection(db, 'users', user.uid, 'attempts');

  for (;;) {
    const snapshot = await sdk.getDocs(sdk.query(attemptsRef, sdk.limit(BATCH_LIMIT)));
    if (snapshot.empty) break;
    const batch = sdk.writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    trackWrite(batch.commit());
    if (snapshot.size < BATCH_LIMIT || !state.online) break;
  }
}

/**
 * Deletes everything stored in the cloud for the signed-in user: every attempt
 * and the profile document. Unlike the other writes here it waits for the
 * server, so the caller can delete the sign-in afterwards knowing the data is gone.
 */
export async function deleteRemoteData(): Promise<void> {
  const user = state.user;
  if (!user) return;
  deleting = true;
  syncGeneration += 1; // abandon any sign-in sync still in flight
  try {
    const [{ db }, sdk] = await Promise.all([getFirebase(), import('firebase/firestore')]);
    const attemptsRef = sdk.collection(db, 'users', user.uid, 'attempts');
    // Let queued uploads reach the server first, so they are deleted too instead of arriving afterwards.
    await sdk.waitForPendingWrites(db);
    for (;;) {
      const snapshot = await sdk.getDocsFromServer(sdk.query(attemptsRef, sdk.limit(BATCH_LIMIT)));
      if (snapshot.empty) break;
      const batch = sdk.writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    await sdk.deleteDoc(sdk.doc(db, 'users', user.uid));
  } catch (error) {
    deleting = false;
    throw error;
  }
}

/** Called when deleting the sign-in failed after the data was removed, so normal syncing resumes. */
export function cancelAccountDeletion(): void {
  deleting = false;
}

/** Wires the store and history to Firestore. Call once at startup. */
export function initSync(): void {
  if (!isFirebaseConfigured) return;

  onAttemptAdded((attempt) => {
    void pushAttempt(attempt).catch((error) =>
      reportError(error, t('error.sync')),
    );
  });

  store.subscribe(() => {
    if (state.user && !applyingRemote) pushProfileSoon();
  }, ['theme', 'studyMode', 'customConfig', 'history']);

  store.subscribe(refreshStatus, ['online']);
}
