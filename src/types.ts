/** Shared data models. Every module imports its types from here. */

export type Difficulty = 'easy' | 'medium' | 'hard';

/** A question exactly as it is stored in a JSON bank under /src/data. */
export interface RawQuestion {
  id: number;
  category: string;
  difficulty: Difficulty;
  question: string;
  codeSnippet?: string;
  options: string[];
  /** Zero-based index into `options`. */
  correctAnswer: number;
  explanation: string;
}

/** A question after loading: the loader adds the bank (file name) it came from. */
export interface Question extends RawQuestion {
  bank: string;
  /**
   * Set when the options were shuffled for a quiz: `optionOrder[shown]` is the
   * option's index in the bank file. Absent means the options are in bank order.
   */
  optionOrder?: number[];
}

/** question id -> selected option index */
export type AnswerMap = Record<number, number>;
/** question id -> flagged for review */
export type FlagMap = Record<number, boolean>;

export type Theme = 'dark' | 'light';
export type { Locale } from './utils/i18n';
export type Screen = 'home' | 'roadmap' | 'quiz' | 'results';
export type ReviewFilter = 'all' | 'correct' | 'incorrect' | 'flagged';

export interface CategoryStat {
  category: string;
  total: number;
  correct: number;
}

export type VerdictLevel = 'pass' | 'junior' | 'fail';

export interface ScoreReport {
  total: number;
  correct: number;
  percent: number;
  verdict: VerdictLevel;
  categoryStats: CategoryStat[];
}

export interface AttemptAnswer {
  questionId: number;
  /** null when the question was skipped. */
  selected: number | null;
  correct: boolean;
  flagged: boolean;
}

/** One finished quiz. Stored in localStorage and, when signed in, in Firestore. */
export interface Attempt {
  id: string;
  /** Epoch milliseconds. 0 for entries migrated from the original app. */
  timestamp: number;
  /** Display string, kept for entries migrated from the original app. */
  date: string;
  mode: string;
  totalQuestions: number;
  correct: number;
  percent: number;
  durationSeconds?: number;
  studyMode?: boolean;
  categoryStats?: CategoryStat[];
  answers?: AttemptAnswer[];
}

/** The in-progress quiz that is saved every second so it can be resumed. */
export interface SavedSession {
  questions: Question[];
  answers: AnswerMap;
  flags: FlagMap;
  currentIdx: number;
  secondsRemaining: number;
  totalSeconds: number;
  activeMode: string;
  studyMode: boolean;
}

export interface CustomQuizConfig {
  count: number;
  minutes: number;
  /** null means "all categories". */
  categories: string[] | null;
}

export interface UserPreferences {
  theme: Theme;
  studyMode: boolean;
  customConfig: CustomQuizConfig;
}

export interface UserStats {
  totalAttempts: number;
  bestPercent: number;
  averagePercent: number;
  currentStreak: number;
  longestStreak: number;
  lastAttemptAt: number;
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  /** Profile picture from the sign-in provider (Google). Null for email accounts. */
  photoURL: string | null;
}

/**
 * disabled: Firebase is not configured for this build (guest-only).
 * guest:    Firebase is available but nobody is signed in.
 */
export type SyncStatus = 'disabled' | 'guest' | 'syncing' | 'synced' | 'offline' | 'error';

export type BankStatus = 'loading' | 'ready' | 'error';

/** The single source of truth for the UI. See utils/state.ts. */
export interface AppState {
  screen: Screen;

  // Question bank
  bankStatus: BankStatus;
  /** Banks that failed to load while the rest succeeded. */
  failedBanks: string[];
  allQuestions: Question[];
  categories: string[];

  // Active quiz
  questions: Question[];
  answers: AnswerMap;
  flags: FlagMap;
  currentIdx: number;
  secondsRemaining: number;
  totalSeconds: number;
  activeMode: string;

  // Learning roadmap
  /** The path shown on the roadmap screen. */
  roadmapPath: import('./services/roadmap').PathId;

  // Results
  lastReport: ScoreReport | null;
  reviewFilter: ReviewFilter;

  // Preferences
  locale: import('./utils/i18n').Locale;
  /** True once the Arabic question text has been downloaded. */
  translationsReady: boolean;
  theme: Theme;
  studyMode: boolean;
  customConfig: CustomQuizConfig;

  // History and account
  history: Attempt[];
  user: AuthUser | null;
  syncStatus: SyncStatus;
  online: boolean;
}
