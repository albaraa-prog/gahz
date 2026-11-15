/** Loads user preferences into the store and writes them back when they change. */

import type { CustomQuizConfig, Theme, UserPreferences } from '../types';
import { clamp, isRecord } from '../utils/helpers';
import { DEFAULT_CUSTOM_CONFIG, state, store } from '../utils/state';
import { STORAGE_KEYS, readJson, readString, writeJson, writeString } from './storage';

export function parseCustomConfig(value: unknown): CustomQuizConfig {
  if (!isRecord(value)) return DEFAULT_CUSTOM_CONFIG;
  const count = typeof value.count === 'number' && Number.isFinite(value.count) ? clamp(Math.round(value.count), 5, 100) : 25;
  const minutes =
    typeof value.minutes === 'number' && Number.isFinite(value.minutes) ? clamp(Math.round(value.minutes), 1, 120) : 25;
  const categories =
    Array.isArray(value.categories) && value.categories.every((c) => typeof c === 'string')
      ? (value.categories as string[])
      : null;
  return { count, minutes, categories };
}

export function parseTheme(value: unknown): Theme | null {
  return value === 'dark' || value === 'light' ? value : null;
}

type StoredPreferences = Pick<UserPreferences, 'studyMode' | 'customConfig'>;

function parseStored(value: unknown): StoredPreferences | null {
  if (!isRecord(value)) return null;
  return {
    studyMode: typeof value.studyMode === 'boolean' ? value.studyMode : true,
    customConfig: parseCustomConfig(value.customConfig),
  };
}

export function currentPreferences(): UserPreferences {
  return { theme: state.theme, studyMode: state.studyMode, customConfig: state.customConfig };
}

export function initPreferences(): void {
  // The theme keeps the storage key used by the original app, so returning users keep their choice.
  const theme = parseTheme(readString(STORAGE_KEYS.theme)) ?? 'dark';
  const stored = readJson<StoredPreferences>(STORAGE_KEYS.preferences, parseStored, {
    studyMode: true,
    customConfig: DEFAULT_CUSTOM_CONFIG,
  });
  store.set({ theme, studyMode: stored.studyMode, customConfig: stored.customConfig });

  store.subscribe(() => writeString(STORAGE_KEYS.theme, state.theme), ['theme']);
  store.subscribe(
    () => writeJson(STORAGE_KEYS.preferences, { studyMode: state.studyMode, customConfig: state.customConfig }),
    ['studyMode', 'customConfig'],
  );
}
