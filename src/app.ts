/**
 * DevQuiz Studio entry point: wires services and components together and
 * switches between the three screens (home, quiz, results).
 */

import { initAuthModal } from './components/authModal';
import { initCustomConfig } from './components/customConfig';
import { initHistoryTable } from './components/historyTable';
import { initHomeScreen } from './components/homeScreen';
import { initDialog, showDialog } from './components/modal';
import { initNavbar } from './components/navbar';
import { initQuestionCard } from './components/questionCard';
import { initQuestionMap } from './components/questionMap';
import { initResultsScreen } from './components/resultsScreen';
import { initTimer } from './components/timer';
import { initToasts, toast } from './components/toast';
import { initAuth } from './services/auth';
import { initHistory } from './services/history';
import { initPreferences } from './services/preferences';
import { QuestionBankError, listCategories, loadQuestionBanks } from './services/questionLoader';
import { discardSavedSession, loadSavedSession, onTimeUp, resumeQuiz } from './services/quizEngine';
import { isPersistent } from './services/storage';
import { initSync } from './services/sync';
import type { Screen } from './types';
import { byId } from './utils/dom';
import { guarded, installGlobalErrorHandlers, reportError } from './utils/errors';
import { state, store } from './utils/state';
import { initTheme } from './utils/theme';

const SCREENS: readonly Screen[] = ['home', 'quiz', 'results'];

/** Router: exactly one <section class="screen"> is active at a time. */
function initRouter(): void {
  const show = (): void => {
    for (const screen of SCREENS) {
      byId(`${screen}Screen`).classList.toggle('active', screen === state.screen);
    }
    window.scrollTo(0, 0);
  };
  show();
  store.subscribe(show, ['screen']);
}

async function loadBank(): Promise<void> {
  store.set({ bankStatus: 'loading', bankError: null });
  try {
    const { questions, failedBanks } = await loadQuestionBanks();
    store.set({
      allQuestions: questions,
      categories: listCategories(questions),
      bankStatus: 'ready',
      bankError:
        failedBanks.length > 0
          ? `Some topics could not be loaded (${failedBanks.join(', ')}). The rest of the question bank is available.`
          : null,
    });
  } catch (error) {
    console.error('[DevQuiz] question bank failed to load', error);
    store.set({
      bankStatus: 'error',
      bankError:
        error instanceof QuestionBankError || !state.online
          ? 'The question bank could not be loaded. Check your connection and try again.'
          : 'The question bank could not be loaded. Please try again.',
    });
  }
}

async function offerResume(): Promise<void> {
  const session = loadSavedSession();
  if (!session) return;
  const resume = await showDialog({
    title: 'Resume your quiz?',
    body: 'You have an unfinished quiz attempt in progress. Would you like to resume it?',
    confirmLabel: 'Resume',
    cancelLabel: 'Discard',
  });
  if (resume) resumeQuiz(session);
  else discardSavedSession();
}

function initConnectivity(): void {
  window.addEventListener('online', () => {
    state.online = true;
    if (state.bankStatus === 'error') void loadBank();
  });
  window.addEventListener('offline', () => {
    state.online = false;
  });
}

function initPrivacyNote(): void {
  byId('privacyBtn').addEventListener('click', () => {
    void showDialog({
      title: 'Privacy',
      body: 'As a guest, your attempts and settings are saved only in this browser. If you sign in, your attempt history, settings and stats are also stored in your own private cloud record so you can use them on other devices. Nobody else can read them.',
      cancelLabel: null,
    });
  });
}

function main(): void {
  installGlobalErrorHandlers();
  initToasts();
  initDialog();

  initPreferences();
  initTheme();
  initHistory();

  initNavbar();
  initAuthModal();
  initHomeScreen(guarded(loadBank));
  initCustomConfig();
  initHistoryTable();
  initQuestionCard();
  initQuestionMap();
  initTimer();
  initResultsScreen();
  initRouter();
  initConnectivity();
  initPrivacyNote();

  onTimeUp(() => {
    void showDialog({
      title: "Time's up!",
      body: 'Your exam was submitted automatically.',
      cancelLabel: null,
    });
  });

  if (!isPersistent()) {
    toast('Browser storage is unavailable, so progress will not be kept after you close this tab.', 'warning', 10_000);
  }

  initSync();
  void initAuth();
  void loadBank();
  void offerResume().catch((error) => reportError(error));
}

main();
