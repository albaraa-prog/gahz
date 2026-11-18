/**
 * "Practice my mistakes": the questions a user most recently answered wrong.
 *
 * Nothing extra is stored. The list is derived from the per-question answers
 * already kept with each attempt in the history, so it works for guests,
 * follows the account across devices through the normal history sync, and is
 * emptied by "Clear history".
 */

import type { Attempt, Question } from '../types';

/** Stored with the attempt, in English like the preset labels. See presets.displayMode. */
export const MISTAKES_MODE = 'Practice My Mistakes';
export const MISTAKES_MAX_QUESTIONS = 20;

/**
 * Ids of the questions whose latest answer was wrong, most recent mistake
 * first. Answering a question correctly in any later quiz removes it; a
 * skipped question does not change its status either way.
 */
export function mistakeQuestionIds(history: readonly Attempt[]): number[] {
  const oldestFirst = history.slice().sort((a, b) => a.timestamp - b.timestamp);
  // A Map keeps insertion order, so re-inserting moves a repeated mistake to the end.
  const wrong = new Map<number, true>();
  for (const attempt of oldestFirst) {
    for (const answer of attempt.answers ?? []) {
      if (answer.correct) {
        wrong.delete(answer.questionId);
      } else if (answer.selected !== null) {
        wrong.delete(answer.questionId);
        wrong.set(answer.questionId, true);
      }
    }
  }
  return [...wrong.keys()].reverse();
}

/** The mistakes that still exist in the question bank, most recent first. */
export function mistakeQuestions(history: readonly Attempt[], all: readonly Question[]): Question[] {
  const byId = new Map(all.map((question) => [question.id, question]));
  return mistakeQuestionIds(history)
    .map((id) => byId.get(id))
    .filter((question): question is Question => question !== undefined);
}
