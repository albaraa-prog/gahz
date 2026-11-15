/** Performance history table on the home screen. */

import { clearLocalHistory } from '../services/history';
import { displayMode } from '../services/presets';
import { PASS_PERCENT, computeStats } from '../services/scoring';
import { clearRemoteAttempts } from '../services/sync';
import { byId } from '../utils/dom';
import { guarded } from '../utils/errors';
import { escapeHtml } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { showDialog } from './modal';
import { toast } from './toast';

function render(): void {
  const body = byId('historyTableBody');
  const history = state.history;

  const streak = computeStats(history).currentStreak;
  const chip = byId('streakChip');
  chip.hidden = streak === 0;
  chip.textContent = t('history.streak', { n: streak });

  byId<HTMLButtonElement>('clearHistoryBtn').disabled = history.length === 0;

  if (history.length === 0) {
    body.innerHTML = `<tr><td colspan="6" class="empty-row">${escapeHtml(t('history.empty'))}</td></tr>`;
    return;
  }

  body.innerHTML = history
    .map((attempt) => {
      const passed = attempt.percent >= PASS_PERCENT;
      return `
        <tr>
          <td dir="ltr">${escapeHtml(attempt.date)}</td>
          <td><strong dir="auto">${escapeHtml(displayMode(attempt.mode))}</strong></td>
          <td>${attempt.totalQuestions}</td>
          <td><strong dir="ltr">${attempt.percent}%</strong></td>
          <td dir="ltr">${attempt.correct} / ${attempt.totalQuestions}</td>
          <td><span class="badge ${passed ? 'badge-success' : 'badge-fail'}">${escapeHtml(t(passed ? 'history.pass' : 'history.fail'))}</span></td>
        </tr>`;
    })
    .join('');
}

async function clearHistory(): Promise<void> {
  const signedIn = state.user !== null;
  const confirmed = await showDialog({
    title: t('history.clearTitle'),
    body: signedIn ? t('history.clearCloud') : t('history.clearLocal'),
    confirmLabel: t('history.clear'),
    danger: true,
  });
  if (!confirmed) return;

  clearLocalHistory();
  if (signedIn) await clearRemoteAttempts();
  toast(t('history.cleared'), 'success');
}

export function initHistoryTable(): void {
  byId('clearHistoryBtn').addEventListener('click', () => guarded(clearHistory, t('error.clearCloud'))());
  render();
  store.subscribe(render, ['history', 'locale']);
}
