/**
 * Optional usage analytics. Events are sent to Google Analytics for Firebase
 * only when VITE_FIREBASE_MEASUREMENT_ID is set AND the visitor has accepted
 * analytics; otherwise this is a no-op and the analytics SDK is never loaded.
 * No question content, answers or personal details are ever sent.
 */

import type { Analytics } from 'firebase/analytics';
import { firebaseConfig, getFirebase, isFirebaseConfigured } from './firebase';
import { STORAGE_KEYS, readString, writeString } from './storage';

type EventParams = Record<string, string | number | boolean>;
export type AnalyticsConsent = 'granted' | 'denied';

/** True when this build can send analytics at all, so a consent question makes sense. */
export const analyticsAvailable = isFirebaseConfigured && Boolean(firebaseConfig.measurementId);
let analytics: Promise<Analytics | null> | null = null;

/** The visitor's saved answer, or null when they have not been asked yet. */
export function getAnalyticsConsent(): AnalyticsConsent | null {
  const value = readString(STORAGE_KEYS.analyticsConsent);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  writeString(STORAGE_KEYS.analyticsConsent, consent);
  // If analytics was already running in this tab, switch collection to match the new answer.
  void analytics?.then(async (instance) => {
    if (!instance) return;
    const { setAnalyticsCollectionEnabled } = await import('firebase/analytics');
    setAnalyticsCollectionEnabled(instance, consent === 'granted');
  });
}

async function load(): Promise<Analytics | null> {
  try {
    const [{ app }, sdk] = await Promise.all([getFirebase(), import('firebase/analytics')]);
    return (await sdk.isSupported()) ? sdk.getAnalytics(app) : null;
  } catch (error) {
    console.warn('[analytics] disabled', error);
    return null;
  }
}

export function track(event: string, params: EventParams = {}): void {
  if (!analyticsAvailable || getAnalyticsConsent() !== 'granted') return;
  analytics ??= load();
  void analytics.then(async (instance) => {
    if (!instance) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(instance, event, params);
  });
}
