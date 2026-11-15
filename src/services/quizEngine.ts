/**
 * Quiz engine: every action that changes the active quiz goes through here.
 * It only talks to the store and to storage; components render from the store.
 */

import type { Attempt, CustomQuizConfig, Question, SavedSession } from '../types';
import { clamp, createId, formatAttemptDate, isRecord, randomSample } from '../utils/helpers';
import { state, store } from '../utils/state';
import { track } from './analytics';
import { addAttempt } from './history';
import { findPreset } from './presets';
import { parseQuestion } from './questionLoader';
import { buildAttemptAnswers, gradeQuiz } from './scoring';
import { STORAGE_KEYS, readJson, remove, writeJson } from './storage';

export class QuizStartError extends Error {}

let timerId: ReturnType<typeof setInterval> | undefined;
/** Wall-clock time at which the quiz ends. Immune to throttled background tabs. */
let deadline = 0;
let timeUpHandler: () => void = () => {};

/** The UI registers a handler so it can tell the user the exam was auto-submitted. */
export function onTimeUp(handler: () => void): void {
  timeUpHandler = handler;
}

// ---------------------------------------------------------------- persistence

function saveProgress(): void {
  if (state.screen !== 'quiz') return;
  const session: SavedSession = {
    questions: state.questions,
    answers: state.answers,
    flags: state.flags,
    currentIdx: state.currentIdx,
    secondsRemaining: state.secondsRemaining,
    totalSeconds: state.totalSeconds,
    activeMode: state.activeMode,
    studyMode: state.studyMode,
  };
  writeJson(STORAGE_KEYS.activeSession, session);
}

function parseNumberMap(value: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!isRecord(value)) return out;
  for (const [key, v] of Object.entries(value)) {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3) out[Number(key)] = v;
  }
  return out;
}

function parseFlagMap(value: unknown): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  if (!isRecord(value)) return out;
  for (const [key, v] of Object.entries(value)) {
    if (v === true) out[Number(key)] = true;
  }
  return out;
}

/** Validates a saved session. Anything unusable returns null and is discarded. */
export function parseSavedSession(value: unknown): SavedSession | null {
  if (!isRecord(value) || !Array.isArray(value.questions) || value.questions.length === 0) return null;

  const questions: Question[] = [];
  for (const item of value.questions) {
    const question = parseQuestion(item, 'saved');
    if (!question) return null; // a partly corrupted quiz cannot be graded fairly
    questions.push(question);
  }

  const { secondsRemaining, totalSeconds } = value;
  if (typeof secondsRemaining !== 'number' || !Number.isFinite(secondsRemaining) || secondsRemaining <= 0) return null;

  const ids = new Set(questions.map((q) => q.id));
  const answers = parseNumberMap(value.answers);
  const flags = parseFlagMap(value.flags);
  for (const key of Object.keys(answers)) if (!ids.has(Number(key))) delete answers[Number(key)];
  for (const key of Object.keys(flags)) if (!ids.has(Number(key))) delete flags[Number(key)];

  return {
    questions,
    answers,
    flags,
    currentIdx: typeof value.currentIdx === 'number' ? clamp(Math.floor(value.currentIdx), 0, questions.length - 1) : 0,
    secondsRemaining: Math.floor(secondsRemaining),
    totalSeconds:
      typeof totalSeconds === 'number' && totalSeconds >= secondsRemaining ? Math.floor(totalSeconds) : Math.floor(secondsRemaining),
    activeMode: typeof value.activeMode === 'string' ? value.activeMode : 'Resumed Quiz',
    studyMode: typeof value.studyMode === 'boolean' ? value.studyMode : true,
  };
}

/** Returns the unfinished quiz from a previous visit, if there is a usable one. */
export function loadSavedSession(): SavedSession | null {
  return readJson<SavedSession | null>(STORAGE_KEYS.activeSession, parseSavedSession, null);
}

export function discardSavedSession(): void {
  remove(STORAGE_KEYS.activeSession);
}

// ---------------------------------------------------------------------- timer

function stopTimer(): void {
  if (timerId !== undefined) clearInterval(timerId);
  timerId = undefined;
}

function tick(): void {
  const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (remaining !== state.secondsRemaining) {
    state.secondsRemaining = remaining;
    saveProgress();
  }
  if (remaining <= 0) {
    submitQuiz();
    timeUpHandler();
  }
}

function startTimer(): void {
  stopTimer();
  deadline = Date.now() + state.secondsRemaining * 1000;
  timerId = setInterval(tick, 500);
}

// -------------------------------------------------------------------- actions

function begin(questions: Question[], minutes: number, modeLabel: string): void {
  if (questions.length === 0) throw new QuizStartError('No questions are available for this selection.');
  const totalSeconds = Math.round(minutes * 60);
  store.set({
    questions,
    answers: {},
    flags: {},
    currentIdx: 0,
    totalSeconds,
    secondsRemaining: totalSeconds,
    activeMode: modeLabel,
    lastReport: null,
    reviewFilter: 'all',
    screen: 'quiz',
  });
  startTimer();
  saveProgress();
  track('quiz_start', { mode: modeLabel, questions: questions.length });
}

function requireBank(): Question[] {
  if (state.bankStatus !== 'ready' || state.allQuestions.length === 0) {
    throw new QuizStartError('The question bank is still loading. Please try again in a moment.');
  }
  return state.allQuestions;
}

export function startPreset(presetId: string): void {
  const preset = findPreset(presetId);
  if (!preset) throw new QuizStartError(`Unknown preset "${presetId}".`);
  const pool = preset.pick(requireBank());
  if (pool.length === 0) throw new QuizStartError('The questions for this preset could not be loaded.');
  begin(randomSample(pool, Math.min(preset.count, pool.length)), preset.minutes, preset.modeLabel);
}

export function startCustomQuiz(config: CustomQuizConfig): void {
  const all = requireBank();
  const selected = config.categories ?? state.categories;
  if (selected.length === 0) throw new QuizStartError('Please select at least one category to generate questions.');
  const pool = all.filter((q) => selected.includes(q.category));
  if (pool.length === 0) throw new QuizStartError('No questions found in the selected categories.');
  const count = Math.min(clamp(config.count, 1, 100), pool.length);
  begin(randomSample(pool, count), clamp(config.minutes, 1, 120), `Custom (${count} Qs)`);
}

export function resumeQuiz(session: SavedSession): void {
  store.set({
    questions: session.questions,
    answers: session.answers,
    flags: session.flags,
    currentIdx: session.currentIdx,
    secondsRemaining: session.secondsRemaining,
    totalSeconds: session.totalSeconds,
    activeMode: session.activeMode,
    studyMode: session.studyMode,
    lastReport: null,
    reviewFilter: 'all',
    screen: 'quiz',
  });
  startTimer();
}

export function selectOption(questionId: number, optionIndex: number): void {
  if (state.screen !== 'quiz') return;
  // In study mode the answer is revealed immediately, so it cannot be changed.
  if (state.studyMode && state.answers[questionId] !== undefined) return;
  state.answers = { ...state.answers, [questionId]: optionIndex };
  saveProgress();
}

export function toggleFlag(): void {
  const question = state.questions[state.currentIdx];
  if (!question) return;
  const flags = { ...state.flags };
  if (flags[question.id]) delete flags[question.id];
  else flags[question.id] = true;
  state.flags = flags;
  saveProgress();
}

export function goToQuestion(index: number): void {
  if (index < 0 || index >= state.questions.length) return;
  state.currentIdx = index;
  saveProgress();
}

/** Moves by one question. Returns false when asked to go past the last question. */
export function navigate(direction: 1 | -1): boolean {
  const next = state.currentIdx + direction;
  if (next >= state.questions.length) return false;
  goToQuestion(next);
  return true;
}

export function setStudyMode(enabled: boolean): void {
  state.studyMode = enabled;
  saveProgress();
}

export function unansweredCount(): number {
  return state.questions.filter((q) => state.answers[q.id] === undefined).length;
}

/** Grades the quiz, records the attempt and shows the results screen. */
export function submitQuiz(): void {
  if (state.screen !== 'quiz') return;
  stopTimer();
  discardSavedSession();

  const report = gradeQuiz(state.questions, state.answers);
  const now = Date.now();
  const attempt: Attempt = {
    id: createId(),
    timestamp: now,
    date: formatAttemptDate(now),
    mode: state.activeMode,
    totalQuestions: report.total,
    correct: report.correct,
    percent: report.percent,
    durationSeconds: Math.max(0, state.totalSeconds - state.secondsRemaining),
    studyMode: state.studyMode,
    categoryStats: report.categoryStats,
    answers: buildAttemptAnswers(state.questions, state.answers, state.flags),
  };
  addAttempt(attempt);

  store.set({ lastReport: report, reviewFilter: 'all', screen: 'results' });
  track('quiz_complete', { mode: attempt.mode, percent: attempt.percent, questions: attempt.totalQuestions });
}

export function returnToHome(): void {
  stopTimer();
  state.screen = 'home';
}
