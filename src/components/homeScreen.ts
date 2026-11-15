/** Home screen: welcome card, study-mode switch, preset cards and load notices. */

import { PRESETS } from '../services/presets';
import { QuizStartError, setStudyMode, startPreset } from '../services/quizEngine';
import { byId, closestFrom } from '../utils/dom';
import { reportError } from '../utils/errors';
import { escapeHtml } from '../utils/helpers';
import { state, store } from '../utils/state';
import { showDialog } from './modal';

/** Runs a "start quiz" action and turns expected failures into a friendly notice. */
export function startSafely(start: () => void): void {
  try {
    start();
  } catch (error) {
    if (error instanceof QuizStartError) {
      void showDialog({ title: 'Cannot start this quiz', body: error.message, cancelLabel: null });
    } else {
      reportError(error, 'Could not start the quiz. Please try again.');
    }
  }
}

function renderPresetCards(): void {
  const all = state.allQuestions;
  const ready = state.bankStatus === 'ready';

  byId('presetCards').innerHTML = PRESETS.filter((preset) => preset.card)
    .map((preset) => {
      const card = preset.card!;
      const available = ready ? Math.min(preset.count, preset.pick(all).length) : preset.count;
      const chips = [`${available} Qs`, `${preset.minutes} Mins`, ...(card.extraChip ? [card.extraChip] : [])];
      const unavailable = ready && available === 0;
      return `
        <div class="mode-card${card.accent ? ` mode-card--${card.accent}` : ''}" role="button" tabindex="0"
             data-preset="${escapeHtml(preset.id)}"${card.rtl ? ' dir="rtl" lang="ar"' : ''}
             aria-disabled="${String(!ready || unavailable)}">
          <div>
            <div class="mode-title">${escapeHtml(card.title)}</div>
            <p class="mode-description">${escapeHtml(card.description)}</p>
          </div>
          <div class="mode-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('<span>•</span>')}</div>
        </div>`;
    })
    .join('');
}

function renderBankState(): void {
  const notices = byId('homeNotices');
  const count = state.allQuestions.length;
  const ready = state.bankStatus === 'ready';

  document.querySelectorAll<HTMLButtonElement>('button[data-preset]').forEach((button) => {
    button.disabled = !ready;
  });

  byId('welcomeBlurb').textContent = ready
    ? `Test your skills with a randomly mixed set of questions compiled from our complete database of ${count} technical, CS fundamentals, Networking, REST/GraphQL APIs, logic/IQ, Arabic, Oman enterprise, and Junior-to-Senior Flutter SWE questions. Every session is randomized!`
    : 'Loading the question bank…';
  byId('questionCountLabel').textContent = ready ? `${count} questions in ${state.categories.length} categories` : '';

  if (state.bankStatus === 'error') {
    notices.innerHTML = `
      <div class="notice notice--error" role="alert">
        <span>${escapeHtml(state.bankError ?? 'The question bank could not be loaded.')}</span>
        <button class="btn btn-sm" type="button" id="retryBankBtn">Retry</button>
      </div>`;
  } else if (ready && state.bankError) {
    notices.innerHTML = `<div class="notice notice--warning" role="status"><span>${escapeHtml(state.bankError)}</span></div>`;
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
  }, ['bankStatus', 'bankError', 'allQuestions']);
  store.subscribe(renderStudyMode, ['studyMode']);
}
