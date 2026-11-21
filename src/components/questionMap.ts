/** Sidebar grid: one button per question showing answered / flagged / current. */

import { goToQuestion } from '../services/quizEngine';
import { byId, closestFrom } from '../utils/dom';
import { escapeHtml } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';

function render(): void {
  if (state.screen !== 'quiz') return;
  const { questions, answers, checked, flags, currentIdx } = state;

  byId('questionGridMap').innerHTML = questions
    .map((question, index) => {
      const answer = answers[question.id];
      const classes = ['grid-btn'];
      const labels = [t('map.question', { n: index + 1 })];
      if (answer !== undefined) {
        classes.push('answered');
        if (checked[question.id]) {
          // A checked answer has been revealed, so the map shows the result too.
          const correct = answer === question.correctAnswer;
          classes.push(correct ? 'correct' : 'wrong');
          labels.push(t(correct ? 'map.correct' : 'map.incorrect'));
        } else {
          labels.push(t('map.answered'));
        }
      } else {
        labels.push(t('map.unanswered'));
      }
      if (flags[question.id]) {
        classes.push('flagged');
        labels.push(t('map.flagged'));
      }
      if (index === currentIdx) classes.push('current');
      return `<button type="button" class="${classes.join(' ')}" data-index="${index}" aria-label="${escapeHtml(labels.join(', '))}"${
        index === currentIdx ? ' aria-current="true"' : ''
      }>${index + 1}</button>`;
    })
    .join('');

  byId('mapProgressLabel').textContent = `${Object.keys(answers).length} / ${questions.length}`;
}

export function initQuestionMap(): void {
  byId('questionGridMap').addEventListener('click', (event) => {
    const button = closestFrom(event, '[data-index]');
    if (button) goToQuestion(Number(button.dataset.index));
  });
  store.subscribe(render, ['screen', 'questions', 'currentIdx', 'answers', 'checked', 'flags', 'locale']);
}
