/** Home screen: hero, study-mode switch, preset cards and load notices. */

import { PRESETS, presetText } from '../services/presets';
import { MISTAKES_MAX_QUESTIONS, mistakeQuestions } from '../services/mistakes';
import { QuizStartError, setStudyMode, startMistakesQuiz, startPreset } from '../services/quizEngine';
import { byId, closestFrom } from '../utils/dom';
import { reportError } from '../utils/errors';
import { escapeHtml } from '../utils/helpers';
import { isRtl, t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { showDialog } from './modal';

/** Runs a "start quiz" action and turns expected failures into a friendly notice. */
export function startSafely(start: () => void): void {
  try {
    start();
  } catch (error) {
    if (error instanceof QuizStartError) {
      void showDialog({ title: t('start.title'), body: error.message, cancelLabel: null });
    } else {
      reportError(error, t('error.startQuiz'));
    }
  }
}

/** The first card of the grid. It is built from the user's own history, not from a preset. */
function mistakesCard(): string {
  const ready = state.bankStatus === 'ready';
  const total = ready ? mistakeQuestions(state.history, state.allQuestions).length : 0;
  const count = Math.min(total, MISTAKES_MAX_QUESTIONS);
  const chips =
    total > 0
      ? [t('chip.questions', { n: count }), t('chip.minutes', { n: Math.max(5, count) }), t('mistakes.count', { n: total })]
      : [t('mistakes.chip')];
  return `
    <div class="mode-card mode-card--mistakes" role="button" tabindex="0" data-mistakes
         aria-disabled="${String(total === 0)}">
      <div>
        <div class="mode-title">${escapeHtml(t('mistakes.title'))}</div>
        <p class="mode-description">${escapeHtml(total > 0 ? t('mistakes.desc') : t('mistakes.empty'))}</p>
      </div>
      <div class="mode-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('<span aria-hidden="true">·</span>')}</div>
    </div>`;
}

function renderPresetCards(): void {
  const all = state.allQuestions;
  const ready = state.bankStatus === 'ready';

  const presetCards = PRESETS.filter((preset) => preset.card)
    .map((preset) => {
      const text = presetText(preset);
      const available = ready ? Math.min(preset.count, preset.pick(all).length) : preset.count;
      const chips = [t('chip.questions', { n: available }), t('chip.minutes', { n: preset.minutes }), ...(text.chip ? [text.chip] : [])];
      const unavailable = ready && available === 0;
      // A card whose text is always Arabic needs its own direction in the English interface.
      const direction = preset.card?.alwaysArabic && !isRtl() ? ' dir="rtl" lang="ar"' : '';
      return `
        <div class="mode-card" role="button" tabindex="0" data-preset="${escapeHtml(preset.id)}"${direction}
             aria-disabled="${String(!ready || unavailable)}">
          <div>
            <div class="mode-title">${escapeHtml(text.title)}</div>
            <p class="mode-description">${escapeHtml(text.description)}</p>
          </div>
          <div class="mode-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('<span aria-hidden="true">·</span>')}</div>
        </div>`;
    })
    .join('');
  byId('presetCards').innerHTML = mistakesCard() + presetCards;
}

function renderBankState(): void {
  const notices = byId('homeNotices');
  const count = state.allQuestions.length;
  const topics = state.categories.length;
  const ready = state.bankStatus === 'ready';

  document.querySelectorAll<HTMLButtonElement>('button[data-preset]').forEach((button) => {
    button.disabled = !ready;
  });

  byId('welcomeBlurb').textContent = ready ? t('home.lead', { count, topics }) : t('home.loading');
  byId('questionCountLabel').textContent = ready ? t('footer.count', { count, topics }) : '';

  if (state.bankStatus === 'error') {
    notices.innerHTML = `
      <div class="notice notice--error" role="alert">
        <span>${escapeHtml(t('bank.error'))}</span>
        <button class="btn btn-sm" type="button" id="retryBankBtn">${escapeHtml(t('bank.retry'))}</button>
      </div>`;
  } else if (ready && state.failedBanks.length > 0) {
    const message = t('bank.partial', { list: state.failedBanks.join(', ') });
    notices.innerHTML = `<div class="notice notice--warning" role="status"><span>${escapeHtml(message)}</span></div>`;
  } else {
    notices.innerHTML = '';
  }
}

function renderStudyMode(): void {
  byId<HTMLInputElement>('studyModeCheckbox').checked = state.studyMode;
}

export function initHomeScreen(onRetryBank: () => void): void {
  const home = byId('homeScreen');

  const activate = (event: Event): void => {
    const trigger = closestFrom(event, '[data-preset], [data-mistakes]');
    if (!trigger || trigger.getAttribute('aria-disabled') === 'true') return;
    const presetId = trigger.dataset.preset;
    if (presetId) startSafely(() => startPreset(presetId));
    else if ('mistakes' in trigger.dataset) startSafely(startMistakesQuiz);
  };
  home.addEventListener('click', (event) => {
    if (closestFrom(event, '#retryBankBtn')) onRetryBank();
    else activate(event);
  });
  home.addEventListener('keydown', (event) => {
    // Preset cards are div[role=button]; real buttons already handle these keys.
    if ((event.key === 'Enter' || event.key === ' ') && closestFrom(event, '.mode-card')) {
      event.preventDefault();
      activate(event);
    }
  });

  byId<HTMLInputElement>('studyModeCheckbox').addEventListener('change', (event) => {
    setStudyMode((event.target as HTMLInputElement).checked);
  });

  renderPresetCards();
  renderBankState();
  renderStudyMode();
  store.subscribe(() => {
    renderPresetCards();
    renderBankState();
  }, ['bankStatus', 'failedBanks', 'allQuestions', 'locale', 'history']);
  store.subscribe(renderStudyMode, ['studyMode']);
}
