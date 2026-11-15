/** Custom quiz builder: question count, time limit and category checkboxes. */

import type { CustomQuizConfig } from '../types';
import { startCustomQuiz } from '../services/quizEngine';
import { byId } from '../utils/dom';
import { clamp, escapeHtml } from '../utils/helpers';
import { state, store } from '../utils/state';
import { startSafely } from './homeScreen';

function categoryBoxes(): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>('input[name="customCategory"]')];
}

function syncSelectAll(): void {
  const boxes = categoryBoxes();
  const checked = boxes.filter((box) => box.checked).length;
  const selectAll = byId<HTMLInputElement>('selectAllCategories');
  selectAll.checked = boxes.length > 0 && checked === boxes.length;
  selectAll.indeterminate = checked > 0 && checked < boxes.length;
}

function render(): void {
  const { count, minutes, categories } = state.customConfig;
  byId<HTMLInputElement>('customQuestionCount').value = String(count);
  byId<HTMLInputElement>('customTimer').value = String(minutes);

  const counts = new Map<string, number>();
  for (const question of state.allQuestions) counts.set(question.category, (counts.get(question.category) ?? 0) + 1);

  byId('categoryTogglesContainer').innerHTML = state.categories
    .map((category) => {
      const checked = categories === null || categories.includes(category);
      return `
        <label class="checkbox-container">
          <input type="checkbox" name="customCategory" value="${escapeHtml(category)}"${checked ? ' checked' : ''}>
          <span>${escapeHtml(category)} (${counts.get(category) ?? 0})</span>
        </label>`;
    })
    .join('');
  syncSelectAll();
}

function readConfig(): CustomQuizConfig {
  const boxes = categoryBoxes();
  const selected = boxes.filter((box) => box.checked).map((box) => box.value);
  const count = Number.parseInt(byId<HTMLInputElement>('customQuestionCount').value, 10);
  const minutes = Number.parseInt(byId<HTMLInputElement>('customTimer').value, 10);
  return {
    count: Number.isFinite(count) ? clamp(count, 5, 100) : 25,
    minutes: Number.isFinite(minutes) ? clamp(minutes, 1, 120) : 25,
    // null = "all", so categories added to the bank later are included automatically
    categories: selected.length === boxes.length ? null : selected,
  };
}

function setOpen(open: boolean): void {
  byId('customConfigPanel').classList.toggle('active', open);
  byId('customConfigToggle').setAttribute('aria-expanded', String(open));
}

export function initCustomConfig(): void {
  const panel = byId('customConfigPanel');

  byId('customConfigToggle').addEventListener('click', () => setOpen(!panel.classList.contains('active')));
  byId('customConfigCancel').addEventListener('click', () => setOpen(false));

  byId<HTMLInputElement>('selectAllCategories').addEventListener('change', (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    categoryBoxes().forEach((box) => {
      box.checked = checked;
    });
  });
  byId('categoryTogglesContainer').addEventListener('change', syncSelectAll);

  byId('customConfigStart').addEventListener('click', () => {
    const config = readConfig();
    startSafely(() => {
      startCustomQuiz(config);
      // Remember the configuration only once it has produced a quiz.
      state.customConfig = config;
      setOpen(false);
    });
  });

  render();
  store.subscribe(render, ['categories', 'allQuestions', 'customConfig']);
}
