/** Performance history table on the home screen. */

import { clearLocalHistory } from '../services/history';
import { PASS_PERCENT, computeStats } from '../services/scoring';
import { clearRemoteAttempts } from '../services/sync';
import { byId } from '../utils/dom';
import { guarded } from '../utils/errors';
import { escapeHtml } from '../utils/helpers';
import { state, store } from '../utils/state';
import { showDialog } from './modal';
import { toast } from './toast';

function render(): void {
  const body = byId('historyTableBody');
  const history = state.history;

  const streak = computeStats(history).currentStreak;
  const chip = byId('streakChip');
  chip.hidden = streak === 0;
  chip.textContent = `${streak}-day streak`;

  byId<HTMLButtonElement>('clearHistoryBtn').disabled = history.length === 0;

  if (history.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty-row">No attempts yet. Your results will appear here.</td></tr>';
    return;
  }

  body.innerHTML = history
    .map((attempt) => {
      const passed = attempt.percent >= PASS_PERCENT;
      return `
        <tr>
          <td>${escapeHtml(attempt.date)}</td>
          <td><strong>${escapeHtml(attempt.mode)}</strong></td>
          <td>${attempt.totalQuestions}</td>
          <td><strong>${attempt.percent}%</strong></td>
          <td>${attempt.correct} / ${attempt.totalQuestions}</td>
          <td><span class="badge ${passed ? 'badge-success' : 'badge-fail'}">${passed ? 'PASS' : 'FAIL'}</span></td>
        </tr>`;
    })
    .join('');
}

async function clearHistory(): Promise<void> {
  const signedIn = state.user !== null;
  const confirmed = await showDialog({
    title: 'Clear history?',
    body: signedIn
      ? 'This permanently deletes your attempt history from this device and from your cloud account.'
      : 'Are you sure you want to clear your local history log? This action is permanent.',
    confirmLabel: 'Clear history',
    danger: true,
  });
  if (!confirmed) return;

  clearLocalHistory();
  if (signedIn) await clearRemoteAttempts();
  toast('History cleared.', 'success');
}

export function initHistoryTable(): void {
  byId('clearHistoryBtn').addEventListener('click', guarded(clearHistory, 'Could not clear your cloud history. Please try again.'));
  render();
  store.subscribe(render, ['history']);
}
