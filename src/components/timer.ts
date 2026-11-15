/** Countdown display. The engine owns the clock; this only renders it. */

import { byId } from '../utils/dom';
import { formatClock } from '../utils/helpers';
import { state, store } from '../utils/state';

const WARNING_BELOW_SECONDS = 180;
const DANGER_BELOW_SECONDS = 60;

function render(): void {
  const remaining = state.secondsRemaining;
  byId('timerDigits').textContent = formatClock(remaining);
  const level = remaining < DANGER_BELOW_SECONDS ? ' danger' : remaining < WARNING_BELOW_SECONDS ? ' warning' : '';
  byId('quizTimer').className = `timer-container${level}`;
}

export function initTimer(): void {
  render();
  store.subscribe(render, ['secondsRemaining']);
}
