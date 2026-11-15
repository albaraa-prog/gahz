/** Pure grading and statistics. No store, DOM or storage access. */

import type {
  AnswerMap,
  Attempt,
  AttemptAnswer,
  CategoryStat,
  FlagMap,
  Question,
  ScoreReport,
  UserStats,
  VerdictLevel,
} from '../types';
import { dayKey } from '../utils/helpers';

export const PASS_PERCENT = 70;
export const JUNIOR_PERCENT = 50;

export function verdictFor(percent: number): VerdictLevel {
  if (percent >= PASS_PERCENT) return 'pass';
  if (percent >= JUNIOR_PERCENT) return 'junior';
  return 'fail';
}

export function isCorrect(question: Question, answers: AnswerMap): boolean {
  return answers[question.id] === question.correctAnswer;
}

export function gradeQuiz(questions: readonly Question[], answers: AnswerMap): ScoreReport {
  const byCategory = new Map<string, CategoryStat>();
  let correct = 0;

  for (const question of questions) {
    let stat = byCategory.get(question.category);
    if (!stat) {
      stat = { category: question.category, total: 0, correct: 0 };
      byCategory.set(question.category, stat);
    }
    stat.total += 1;
    if (isCorrect(question, answers)) {
      correct += 1;
      stat.correct += 1;
    }
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { total, correct, percent, verdict: verdictFor(percent), categoryStats: [...byCategory.values()] };
}

export function buildAttemptAnswers(questions: readonly Question[], answers: AnswerMap, flags: FlagMap): AttemptAnswer[] {
  return questions.map((question) => ({
    questionId: question.id,
    selected: answers[question.id] ?? null,
    correct: isCorrect(question, answers),
    flagged: Boolean(flags[question.id]),
  }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Streak = consecutive calendar days with at least one attempt. The current
 * streak stays alive until the end of the day after the last attempt.
 */
export function computeStats(history: readonly Attempt[], now: number = Date.now()): UserStats {
  const totalAttempts = history.length;
  const bestPercent = history.reduce((best, a) => Math.max(best, a.percent), 0);
  const averagePercent =
    totalAttempts === 0 ? 0 : Math.round(history.reduce((sum, a) => sum + a.percent, 0) / totalAttempts);
  const lastAttemptAt = history.reduce((latest, a) => Math.max(latest, a.timestamp), 0);

  const days = new Set(history.filter((a) => a.timestamp > 0).map((a) => dayKey(a.timestamp)));

  let currentStreak = 0;
  let cursor = now;
  if (!days.has(dayKey(cursor))) cursor -= DAY_MS; // nothing yet today: count from yesterday
  while (days.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor -= DAY_MS;
  }

  let longestStreak = 0;
  for (const day of days) {
    const start = new Date(`${day}T12:00:00`).getTime();
    if (days.has(dayKey(start - DAY_MS))) continue; // not the first day of a run
    let length = 1;
    while (days.has(dayKey(start + length * DAY_MS))) length += 1;
    longestStreak = Math.max(longestStreak, length);
  }

  return { totalAttempts, bestPercent, averagePercent, currentStreak, longestStreak, lastAttemptAt };
}
