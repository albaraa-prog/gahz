/**
 * Safe wrapper around localStorage.
 *
 * localStorage can throw (private browsing, disabled storage, full quota) and
 * can hold data written by an older version or edited by hand. Nothing in the
 * app touches localStorage directly; everything goes through this module, so
 * a storage problem degrades to "not saved" instead of a crash.
 */

import { reportError } from '../utils/errors';
import { t } from '../utils/i18n';

// The "devquiz-" prefix is the app's original name. It is kept so existing
// users do not lose their history and settings after the rename to Gahz.
export const STORAGE_KEYS = {
  theme: 'devquiz-theme',
  locale: 'devquiz-lang',
  history: 'devquiz-history',
  activeSession: 'devquiz-active-state',
  preferences: 'devquiz-prefs',
  historyOwner: 'devquiz-history-owner',
  lessons: 'gahz-lessons',
  analyticsConsent: 'gahz-analytics-consent',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Used when localStorage is unavailable, so the current tab still works. */
const memoryFallback = new Map<string, string>();
let storageAvailable: boolean | null = null;

function backend(): Storage | null {
  if (storageAvailable === false) return null;
  try {
    const storage = window.localStorage;
    if (storageAvailable === null) {
      const probe = '__devquiz_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      storageAvailable = true;
    }
    return storage;
  } catch {
    storageAvailable = false;
    return null;
  }
}

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22)
  );
}

export function readString(key: StorageKey): string | null {
  const storage = backend();
  if (!storage) return memoryFallback.get(key) ?? null;
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn(`[storage] could not read ${key}`, error);
    return memoryFallback.get(key) ?? null;
  }
}

/** Returns false when the value could not be persisted. */
export function writeString(key: StorageKey, value: string): boolean {
  memoryFallback.set(key, value);
  const storage = backend();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      reportError(error, t('error.storageFull'));
    } else {
      reportError(error, t('error.storageWrite'));
    }
    return false;
  }
}

export function remove(key: StorageKey): void {
  memoryFallback.delete(key);
  try {
    backend()?.removeItem(key);
  } catch (error) {
    console.warn(`[storage] could not remove ${key}`, error);
  }
}

/**
 * Reads and validates JSON. `parse` receives the raw parsed value and returns
 * a typed value or null. Corrupted entries are removed and the fallback is
 * returned, so bad data can never reach the UI.
 */
export function readJson<T>(key: StorageKey, parse: (value: unknown) => T | null, fallback: T): T {
  const raw = readString(key);
  if (raw === null) return fallback;
  try {
    const parsed = parse(JSON.parse(raw));
    if (parsed !== null) return parsed;
    console.warn(`[storage] ${key} had an unexpected shape and was reset`);
  } catch (error) {
    console.warn(`[storage] ${key} was not valid JSON and was reset`, error);
  }
  remove(key);
  return fallback;
}

export function writeJson(key: StorageKey, value: unknown): boolean {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    reportError(error, t('error.storageWrite'));
    return false;
  }
  return writeString(key, serialized);
}

export function isPersistent(): boolean {
  return backend() !== null;
}
