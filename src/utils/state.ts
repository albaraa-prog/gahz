import type { AppState, CustomQuizConfig } from '../types';
import { createStore } from './store';
import { reportError } from './errors';
import { t } from './i18n';

export const DEFAULT_CUSTOM_CONFIG: CustomQuizConfig = { count: 25, minutes: 25, categories: null };

const initialState: AppState = {
  screen: 'home',

  bankStatus: 'loading',
  failedBanks: [],
  allQuestions: [],
  categories: [],

  questions: [],
  answers: {},
  flags: {},
  currentIdx: 0,
  secondsRemaining: 0,
  totalSeconds: 0,
  activeMode: 'Standard Mixed Exam',

  lastReport: null,
  reviewFilter: 'all',

  locale: 'en',
  translationsReady: false,
  theme: 'dark',
  studyMode: true,
  customConfig: DEFAULT_CUSTOM_CONFIG,

  history: [],
  user: null,
  syncStatus: 'disabled',
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
};

/** The app-wide store. Components subscribe to the keys they render. */
export const store = createStore<AppState>(initialState, {
  onError: (error) => reportError(error, t('error.view')),
});

export const state = store.state;
