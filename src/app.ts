/**
 * Gahz entry point: wires services and components together and switches
 * between the three screens (home, quiz, results).
 */

import { initAuthModal } from './components/authModal';
import { initConstellation } from './components/constellation';
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
import { listCategories, loadQuestionBanks } from './services/questionLoader';
import { ensureQuestionTranslations } from './services/questionText';
import { discardSavedSession, loadSavedSession, onTimeUp, resumeQuiz } from './services/quizEngine';
import { isPersistent } from './services/storage';
import { initSync } from './services/sync';
import type { Screen } from './types';
import { byId } from './utils/dom';
import { guarded, installGlobalErrorHandlers, reportError } from './utils/errors';
import { applyStaticTranslations, t } from './utils/i18n';
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
  store.set({ bankStatus: 'loading', failedBanks: [] });
  try {
    const { questions, failedBanks } = await loadQuestionBanks();
    store.set({
      allQuestions: questions,
      categories: listCategories(questions),
      bankStatus: 'ready',
      failedBanks,
    });
  } catch (error) {
    console.error('[Gahz] question bank failed to load', error);
    store.set({ bankStatus: 'error' });
  }
}

async function offerResume(): Promise<void> {
  const session = loadSavedSession();
  if (!session) return;
  const resume = await showDialog({
    title: t('resume.title'),
    body: t('resume.body'),
    confirmLabel: t('resume.confirm'),
    cancelLabel: t('resume.discard'),
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
    void showDialog({ title: t('privacy.title'), body: t('privacy.body'), cancelLabel: null });
  });
}

function main(): void {
  installGlobalErrorHandlers();
  initToasts();
  initDialog();

  // Language first, so everything below renders in the right one.
  initPreferences();
  applyStaticTranslations();
  store.subscribe(() => applyStaticTranslations(), ['locale']);
  // Arabic question text is a separate download, fetched only when the interface is in Arabic.
  void ensureQuestionTranslations();
  store.subscribe(() => void ensureQuestionTranslations(), ['locale']);
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
  initConstellation();
  initConnectivity();
  initPrivacyNote();

  onTimeUp(() => {
    void showDialog({ title: t('timeUp.title'), body: t('timeUp.body'), cancelLabel: null });
  });

  if (!isPersistent()) toast(t('error.storageUnavailable'), 'warning', 10_000);

  initSync();
  void initAuth();
  void loadBank();
  void offerResume().catch((error) => reportError(error));
}

main();
