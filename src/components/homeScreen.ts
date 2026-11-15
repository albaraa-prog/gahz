/** Home screen: hero, study-mode switch, preset cards and load notices. */

import { PRESETS, presetText } from '../services/presets';
import { QuizStartError, setStudyMode, startPreset } from '../services/quizEngine';
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

function renderPresetCards(): void {
  const all = state.allQuestions;
  const ready = state.bankStatus === 'ready';

  byId('presetCards').innerHTML = PRESETS.filter((preset) => preset.card)
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
    const trigger = closestFrom(event, '[data-preset]');
    const presetId = trigger?.dataset.preset;
    if (!trigger || !presetId || trigger.getAttribute('aria-disabled') === 'true') return;
    startSafely(() => startPreset(presetId));
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
  }, ['bankStatus', 'failedBanks', 'allQuestions', 'locale']);
  store.subscribe(renderStudyMode, ['studyMode']);
}
