/** Sidebar grid: one button per question showing answered / flagged / current. */

import { goToQuestion } from '../services/quizEngine';
import { byId, closestFrom } from '../utils/dom';
import { state, store } from '../utils/state';

function render(): void {
  if (state.screen !== 'quiz') return;
  const { questions, answers, flags, currentIdx, studyMode } = state;

  byId('questionGridMap').innerHTML = questions
    .map((question, index) => {
      const answer = answers[question.id];
      const classes = ['grid-btn'];
      const labels = [`Question ${index + 1}`];
      if (answer !== undefined) {
        classes.push('answered');
        if (studyMode) {
          // Study mode reveals the result straight away, so the map shows it too.
          const correct = answer === question.correctAnswer;
          classes.push(correct ? 'correct' : 'wrong');
          labels.push(correct ? 'correct' : 'incorrect');
        } else {
          labels.push('answered');
        }
      } else {
        labels.push('unanswered');
      }
      if (flags[question.id]) {
        classes.push('flagged');
        labels.push('flagged');
      }
      if (index === currentIdx) classes.push('current');
      return `<button type="button" class="${classes.join(' ')}" data-index="${index}" aria-label="${labels.join(', ')}"${
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
  store.subscribe(render, ['screen', 'questions', 'currentIdx', 'answers', 'flags', 'studyMode']);
}
