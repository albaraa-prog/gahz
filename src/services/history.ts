/**
 * Attempt history. localStorage is always the first place an attempt is
 * written (guest mode and offline both rely on it); the sync service mirrors
 * it to Firestore when someone is signed in.
 */

import type { Attempt, AttemptAnswer, CategoryStat } from '../types';
import { formatAttemptDate, isRecord } from '../utils/helpers';
import { state } from '../utils/state';
import { STORAGE_KEYS, readJson, readString, remove, writeJson, writeString } from './storage';

export const MAX_ATTEMPTS = 50;

type AttemptListener = (attempt: Attempt) => void;
const attemptListeners = new Set<AttemptListener>();

/** The sync service uses this to upload each new attempt. */
export function onAttemptAdded(listener: AttemptListener): () => void {
  attemptListeners.add(listener);
  return () => attemptListeners.delete(listener);
}

function parseCategoryStats(value: unknown): CategoryStat[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const stats = value.filter(
    (item): item is CategoryStat =>
      isRecord(item) && typeof item.category === 'string' && typeof item.total === 'number' && typeof item.correct === 'number',
  );
  return stats.length > 0 ? stats : undefined;
}

function parseAnswers(value: unknown): AttemptAnswer[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const answers = value.filter(
    (item): item is AttemptAnswer =>
      isRecord(item) &&
      typeof item.questionId === 'number' &&
      (item.selected === null || typeof item.selected === 'number') &&
      typeof item.correct === 'boolean' &&
      typeof item.flagged === 'boolean',
  );
  return answers.length > 0 ? answers : undefined;
}

/**
 * Validates one stored attempt. Entries written by the original app have no
 * id or timestamp; they get a stable id derived from their content so they
 * are not duplicated when merged with the cloud copy.
 */
export function parseAttempt(value: unknown): Attempt | null {
  if (!isRecord(value)) return null;
  const { mode, totalQuestions, correct, percent } = value;
  if (typeof mode !== 'string') return null;
  if (typeof totalQuestions !== 'number' || typeof correct !== 'number' || typeof percent !== 'number') return null;
  if (!Number.isFinite(totalQuestions) || !Number.isFinite(correct) || !Number.isFinite(percent)) return null;

  const timestamp = typeof value.timestamp === 'number' && value.timestamp > 0 ? value.timestamp : 0;
  const date =
    typeof value.date === 'string' && value.date.length > 0 ? value.date : timestamp > 0 ? formatAttemptDate(timestamp) : '';
  const id =
    typeof value.id === 'string' && value.id.length > 0
      ? value.id
      : `legacy-${`${date}|${mode}|${totalQuestions}|${correct}`.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 80)}`;

  const attempt: Attempt = { id, timestamp, date, mode, totalQuestions, correct, percent };
  if (typeof value.durationSeconds === 'number') attempt.durationSeconds = value.durationSeconds;
  if (typeof value.studyMode === 'boolean') attempt.studyMode = value.studyMode;
  const categoryStats = parseCategoryStats(value.categoryStats);
  if (categoryStats) attempt.categoryStats = categoryStats;
  const answers = parseAnswers(value.answers);
  if (answers) attempt.answers = answers;
  return attempt;
}

function parseHistory(value: unknown): Attempt[] | null {
  if (!Array.isArray(value)) return null;
  // Keep whatever is valid; one bad row should not wipe the whole history.
  return value.map(parseAttempt).filter((attempt): attempt is Attempt => attempt !== null);
}

/** Newest first, de-duplicated by id, capped. Migrated entries keep their original order at the end. */
export function mergeAttempts(...lists: ReadonlyArray<readonly Attempt[]>): Attempt[] {
  const byId = new Map<string, Attempt>();
  for (const list of lists) {
    for (const attempt of list) {
      if (!byId.has(attempt.id)) byId.set(attempt.id, attempt);
    }
  }
  return [...byId.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ATTEMPTS);
}

function persist(history: Attempt[]): void {
  if (writeJson(STORAGE_KEYS.history, history)) return;
  // Storage is probably full: drop the per-question detail of older attempts and retry once.
  const slim = history.map((attempt, index) => {
    if (index < 5) return attempt;
    const { answers: _answers, ...rest } = attempt;
    return rest;
  });
  writeJson(STORAGE_KEYS.history, slim);
}

export function initHistory(): void {
  state.history = mergeAttempts(readJson(STORAGE_KEYS.history, parseHistory, []));
}

export function addAttempt(attempt: Attempt): void {
  const history = mergeAttempts([attempt], state.history);
  state.history = history;
  persist(history);
  for (const listener of attemptListeners) listener(attempt);
}

export function replaceHistory(history: readonly Attempt[]): void {
  const next = mergeAttempts(history);
  state.history = next;
  persist(next);
}

export function clearLocalHistory(): void {
  state.history = [];
  remove(STORAGE_KEYS.history);
}

/** uid of the account the local history belongs to, or null for a guest. */
export function getHistoryOwner(): string | null {
  return readString(STORAGE_KEYS.historyOwner);
}

export function setHistoryOwner(uid: string | null): void {
  if (uid === null) remove(STORAGE_KEYS.historyOwner);
  else writeString(STORAGE_KEYS.historyOwner, uid);
}
