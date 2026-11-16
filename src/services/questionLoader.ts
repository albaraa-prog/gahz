/**
 * Question-bank loader.
 *
 * Every JSON file in /src/data is a "bank". Vite turns each one into its own
 * lazily loaded chunk, so the app shell paints before the questions arrive.
 * Banks are validated again at runtime: a malformed question is skipped and a
 * bank that fails to download is retried once, then reported, without taking
 * the rest of the app down.
 */

import type { Difficulty, Question } from '../types';
import { isRecord } from '../utils/helpers';

type BankModule = { default: unknown };

const bankImporters = import.meta.glob<BankModule>('../data/*.json');

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export class QuestionBankError extends Error {
  constructor(message: string, readonly failedBanks: string[]) {
    super(message);
    this.name = 'QuestionBankError';
  }
}

export interface LoadResult {
  questions: Question[];
  /** Banks that could not be loaded or contained no valid questions. */
  failedBanks: string[];
  /** Number of individual questions dropped by validation. */
  skipped: number;
}

function bankName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.json$/, '');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);
}

/** True for a permutation of 0..length-1, as written by `shuffleOptions`. */
function isOptionOrder(value: unknown, length: number): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === length &&
    new Set(value).size === length &&
    value.every((item) => Number.isInteger(item) && item >= 0 && item < length)
  );
}

/**
 * Validates one question. Also accepts the field names used by the original
 * single-file app (q / code / correct), so a quiz saved by that version can
 * still be resumed after upgrading.
 */
export function parseQuestion(value: unknown, bank: string): Question | null {
  if (!isRecord(value)) return null;

  const text = value.question ?? value.q;
  const code = value.codeSnippet ?? value.code;
  const correct = value.correctAnswer ?? value.correct;
  const { id, category, options, explanation } = value;

  if (typeof id !== 'number' || !Number.isInteger(id)) return null;
  if (typeof category !== 'string' || category.length === 0) return null;
  if (typeof text !== 'string' || text.length === 0) return null;
  if (!isStringArray(options) || options.length !== 4) return null;
  if (typeof correct !== 'number' || !Number.isInteger(correct) || correct < 0 || correct >= options.length) return null;
  if (typeof explanation !== 'string') return null;

  const difficulty = DIFFICULTIES.includes(value.difficulty as Difficulty) ? (value.difficulty as Difficulty) : 'medium';
  const question: Question = {
    id,
    category,
    difficulty,
    question: text,
    options,
    correctAnswer: correct,
    explanation,
    bank: typeof value.bank === 'string' ? value.bank : bank,
  };
  if (typeof code === 'string' && code.trim().length > 0) question.codeSnippet = code;
  if (isOptionOrder(value.optionOrder, options.length)) question.optionOrder = value.optionOrder;
  return question;
}

async function importWithRetry(importer: () => Promise<BankModule>, retries = 1): Promise<BankModule> {
  try {
    return await importer();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return importWithRetry(importer, retries - 1);
  }
}

let cache: Promise<LoadResult> | null = null;

async function loadAll(): Promise<LoadResult> {
  const entries = Object.entries(bankImporters);
  const settled = await Promise.allSettled(entries.map(([, importer]) => importWithRetry(importer)));

  const questions: Question[] = [];
  const failedBanks: string[] = [];
  const seenIds = new Set<number>();
  let skipped = 0;

  settled.forEach((result, index) => {
    const entry = entries[index];
    if (!entry) return;
    const bank = bankName(entry[0]);

    if (result.status === 'rejected') {
      console.error(`[questions] failed to load bank "${bank}"`, result.reason);
      failedBanks.push(bank);
      return;
    }

    const raw = result.value.default;
    if (!Array.isArray(raw)) {
      console.error(`[questions] bank "${bank}" is not an array`);
      failedBanks.push(bank);
      return;
    }

    let valid = 0;
    for (const item of raw) {
      const question = parseQuestion(item, bank);
      if (!question || seenIds.has(question.id)) {
        skipped += 1;
        continue;
      }
      seenIds.add(question.id);
      questions.push(question);
      valid += 1;
    }
    if (valid === 0) failedBanks.push(bank);
  });

  if (questions.length === 0) {
    throw new QuestionBankError('No question banks could be loaded.', failedBanks);
  }

  questions.sort((a, b) => a.id - b.id);
  return { questions, failedBanks, skipped };
}

/** Loads every bank once. A failed load is not cached, so "Retry" works. */
export function loadQuestionBanks(): Promise<LoadResult> {
  if (!cache) {
    cache = loadAll().catch((error) => {
      cache = null;
      throw error;
    });
  }
  return cache;
}

/** Categories in the order they first appear (by question id). */
export function listCategories(questions: readonly Question[]): string[] {
  return [...new Set(questions.map((q) => q.category))];
}
