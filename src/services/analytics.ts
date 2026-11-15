/**
 * Optional usage analytics. Events are sent to Google Analytics for Firebase
 * only when VITE_FIREBASE_MEASUREMENT_ID is set; otherwise this is a no-op.
 * No question content, answers or personal details are ever sent.
 */

import type { Analytics } from 'firebase/analytics';
import { firebaseConfig, getFirebase, isFirebaseConfigured } from './firebase';

type EventParams = Record<string, string | number | boolean>;

const enabled = isFirebaseConfigured && Boolean(firebaseConfig.measurementId);
let analytics: Promise<Analytics | null> | null = null;

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
  if (!enabled) return;
  analytics ??= load();
  void analytics.then(async (instance) => {
    if (!instance) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(instance, event, params);
  });
}
