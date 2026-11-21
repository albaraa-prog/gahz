/**
 * Interactive lessons: lookup, answer checking and progress.
 *
 * Everything here is pure except the two storage functions at the bottom, so
 * the checking rules are easy to unit test. Lesson content lives in
 * /src/lessons; the player is components/lessonScreen.ts.
 *
 * Progress is kept in one small localStorage entry, which is all a guest has.
 * For a signed-in user services/sync.ts also keeps a copy on the account. It
 * is not part of the attempt history, so "Clear history" leaves it alone.
 */

import { LESSONS } from '../lessons';
import type { BlankStep, CodeTest, Lesson, Localized, OrderStep, Text } from '../lessons/types';
import type { LessonProgress, LessonProgressMap } from '../types';
import { isRecord, randomSample } from '../utils/helpers';
import type { Locale } from '../utils/i18n';
import type { CallResult } from './codeRunner';
import type { StepId } from './roadmap';
import { STORAGE_KEYS, readJson, remove, writeJson } from './storage';

export { LESSONS };

export const BLANK_MARK = '___';

export function findLesson(id: unknown): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function lessonsForStep(stepId: StepId): Lesson[] {
  return LESSONS.filter((lesson) => lesson.roadmapSteps.includes(stepId));
}

export function localized(text: Text, locale: Locale): string {
  return typeof text === 'string' ? text : text[locale];
}

export function isLocalized(text: Text): text is Localized {
  return typeof text !== 'string';
}

/** The pieces of a template around its gaps: "a ___ b" -> ["a ", " b"]. */
export function splitTemplate(template: string): string[] {
  return template.split(BLANK_MARK);
}

export function blankCount(step: BlankStep): number {
  return splitTemplate(step.template).length - 1;
}

/** The tokens offered for a fill-in exercise: the answers plus the distractors, without duplicates. */
export function tokenBank(step: BlankStep, random: () => number = Math.random): string[] {
  const tokens = [...new Set([...step.answers, ...step.distractors])];
  return randomSample(tokens, tokens.length, random);
}

/** One flag per gap. An empty gap is wrong. */
export function checkBlanks(step: BlankStep, filled: readonly (string | null)[]): boolean[] {
  return step.answers.map((answer, index) => filled[index] === answer);
}

/**
 * A starting order for a reorder exercise: positions into `step.lines`, never
 * already solved (as long as the lines are not all the same).
 */
export function shuffledOrder(step: OrderStep, random: () => number = Math.random): number[] {
  const indexes = step.lines.map((_, index) => index);
  for (let attempt = 0; attempt < 8; attempt++) {
    const order = randomSample(indexes, indexes.length, random);
    if (!isOrderCorrect(step, order)) return order;
  }
  // Very unlikely fallback: move the first line to the end.
  return [...indexes.slice(1), ...indexes.slice(0, 1)];
}

/** Compares text, not positions, so two identical lines (such as two `}`) can swap places. */
export function isOrderCorrect(step: OrderStep, order: readonly number[]): boolean {
  return order.length === step.lines.length && order.every((lineIndex, position) => step.lines[lineIndex] === step.lines[position]);
}

/** How a value is compared with a test's expected value. Mirrors `toJson` in public/runner.html. */
export function expectedJson(value: unknown): string {
  const json = JSON.stringify(value);
  return json === undefined ? 'undefined' : json;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])]),
  );
}

/** Whether two JSON texts hold the same value. Object keys may come in any order: a Python dictionary keeps the order it was filled in. */
export function sameJson(actual: string, expected: string): boolean {
  if (actual === expected) return true;
  try {
    return JSON.stringify(sortKeys(JSON.parse(actual))) === JSON.stringify(sortKeys(JSON.parse(expected)));
  } catch {
    // 'undefined' and 'unserializable' are not JSON, and only equal themselves.
    return false;
  }
}

export interface TestOutcome {
  test: CodeTest;
  passed: boolean;
  /** What the code produced, or the error it threw, ready to show. */
  actual: string;
}

export function gradeTests(tests: readonly CodeTest[], results: readonly CallResult[]): TestOutcome[] {
  return tests.map((test, index) => {
    const result = results[index];
    if (!result) return { test, passed: false, actual: '' };
    if (!result.ok) return { test, passed: false, actual: result.error };
    return { test, passed: sameJson(result.json, expectedJson(test.expect)), actual: result.text };
  });
}

// ---------------------------------------------------------------- progress

/** Limits for what is kept, matched by firestore.rules. */
export const MAX_LESSON_ENTRIES = 200;
const MAX_REACHED = 1000;
const LESSON_ID = /^[\w-]{1,100}$/;

/** Reads progress from storage or from the account. Entries that do not look right are dropped. */
export function parseLessonProgress(value: unknown): LessonProgressMap | null {
  if (!isRecord(value)) return null;
  const map: LessonProgressMap = {};
  for (const [id, entry] of Object.entries(value).slice(0, MAX_LESSON_ENTRIES)) {
    if (!LESSON_ID.test(id) || !isRecord(entry)) continue;
    if (typeof entry.reached !== 'number' || !Number.isFinite(entry.reached) || entry.reached < 0) continue;
    map[id] = {
      reached: Math.min(Math.floor(entry.reached), MAX_REACHED),
      completedAt: typeof entry.completedAt === 'number' && Number.isFinite(entry.completedAt) ? entry.completedAt : null,
    };
  }
  return map;
}

/**
 * Combines progress from two places (this browser and the account). Progress
 * never goes backwards: the furthest step wins, and a lesson finished on either
 * side stays finished, with the earlier finish time. Returns `a` itself when
 * `b` adds nothing, so callers can tell that nothing changed.
 */
export function mergeLessonProgress(a: LessonProgressMap, b: LessonProgressMap): LessonProgressMap {
  let merged = a;
  for (const [id, theirs] of Object.entries(b)) {
    const ours = a[id];
    const completedAt =
      ours?.completedAt && theirs.completedAt
        ? Math.min(ours.completedAt, theirs.completedAt)
        : (ours?.completedAt ?? theirs.completedAt);
    const reached = Math.max(ours?.reached ?? 0, theirs.reached);
    if (ours && ours.reached === reached && ours.completedAt === completedAt) continue;
    if (merged === a) merged = { ...a };
    merged[id] = { reached, completedAt };
  }
  return merged;
}

export function loadLessonProgress(): LessonProgressMap {
  return readJson(STORAGE_KEYS.lessons, parseLessonProgress, {});
}

/** Removes this browser's copy, for example after signing out of the account it belongs to. */
export function clearLocalLessonProgress(): void {
  remove(STORAGE_KEYS.lessons);
}

export function saveLessonProgress(progress: LessonProgressMap): void {
  writeJson(STORAGE_KEYS.lessons, progress);
}

/** Progress after the learner arrives at `stepIndex`; `stepIndex === lesson.steps.length` means finished. */
export function advanceProgress(
  progress: LessonProgressMap,
  lesson: Lesson,
  stepIndex: number,
  now: number = Date.now(),
): LessonProgressMap {
  const previous: LessonProgress = progress[lesson.id] ?? { reached: 0, completedAt: null };
  const finished = stepIndex >= lesson.steps.length;
  const next: LessonProgress = {
    reached: Math.max(previous.reached, Math.min(stepIndex, lesson.steps.length)),
    completedAt: previous.completedAt ?? (finished ? now : null),
  };
  if (next.reached === previous.reached && next.completedAt === previous.completedAt) return progress;
  return { ...progress, [lesson.id]: next };
}

export interface LessonStatus {
  /** Steps the learner has got past, capped at the lesson's length. */
  reached: number;
  total: number;
  percent: number;
  completed: boolean;
}

export function lessonStatus(lesson: Lesson, progress: LessonProgressMap): LessonStatus {
  const entry = progress[lesson.id];
  const total = lesson.steps.length;
  const completed = Boolean(entry?.completedAt);
  const reached = completed ? total : Math.min(entry?.reached ?? 0, total);
  return { reached, total, percent: total === 0 ? 0 : Math.floor((reached / total) * 100), completed };
}
