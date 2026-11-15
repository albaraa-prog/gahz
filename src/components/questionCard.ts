/** The active question: text, code snippet, options, explanation and navigation. */

import { navigate, selectOption, setStudyMode, submitQuiz, toggleFlag, unansweredCount } from '../services/quizEngine';
import { byId, closestFrom } from '../utils/dom';
import { containsArabic, formatRichText } from '../utils/helpers';
import { state, store } from '../utils/state';
import { showDialog } from './modal';

/** Shared by the Next button on the last question and the sidebar's Finish button. */
export async function confirmSubmit(): Promise<void> {
  const unanswered = unansweredCount();
  const confirmed = await showDialog({
    title: 'Submit exam?',
    body:
      unanswered > 0
        ? { html: `You have <strong>${unanswered} unanswered</strong> question(s). Are you sure you want to finish and submit?` }
        : 'Excellent work! All questions have been answered. Would you like to submit and grade your exam now?',
    confirmLabel: 'Submit and finish',
  });
  if (confirmed) submitQuiz();
}

function render(): void {
  if (state.screen !== 'quiz') return;
  const index = state.currentIdx;
  const question = state.questions[index];
  if (!question) return;

  const total = state.questions.length;
  const answer = state.answers[question.id];
  const answered = answer !== undefined;
  const reveal = state.studyMode && answered;
  const rtl = question.category.includes('Arabic') || containsArabic(question.question);

  const main = byId('quizMain');
  main.classList.toggle('rtl', rtl);
  main.lang = rtl ? 'ar' : 'en';

  byId('currentCategoryTag').textContent = question.category;
  const difficulty = byId('currentDifficultyTag');
  difficulty.textContent = question.difficulty;
  difficulty.dataset.level = question.difficulty;

  byId('quizProgressBar').style.width = `${(index / total) * 100}%`;
  byId('questionText').innerHTML = `<strong>${String(index + 1).padStart(2, '0')}</strong>&ensp;${formatRichText(question.question)}`;

  const code = byId('questionCodeBlock');
  code.hidden = !question.codeSnippet;
  code.textContent = question.codeSnippet ?? '';

  const options = byId('optionsContainer');
  const hadFocus = options.contains(document.activeElement);
  options.classList.toggle('locked', reveal);
  options.setAttribute('role', 'radiogroup');
  options.innerHTML = question.options
    .map((option, optionIndex) => {
      const selected = answer === optionIndex;
      let stateClass = '';
      if (reveal) {
        if (optionIndex === question.correctAnswer) stateClass = ' correct-choice';
        else if (selected) stateClass = ' user-wrong-choice';
      } else if (selected) {
        stateClass = ' selected';
      }
      return `
        <button type="button" class="option-item${stateClass}" role="radio" aria-checked="${String(selected)}"
                data-option="${optionIndex}"${reveal ? ' disabled' : ''}>
          <span class="option-radio"></span>
          <span class="option-text">${formatRichText(option)}</span>
        </button>`;
    })
    .join('');
  // Re-rendering replaces the buttons, so give keyboard focus back to the chosen option.
  if (hadFocus && answered) options.querySelector<HTMLElement>(`[data-option="${answer}"]`)?.focus();

  const explanation = byId('quizExplanationBox');
  explanation.hidden = !reveal;
  explanation.innerHTML = reveal
    ? `<span class="explanation-label"><strong>Explanation</strong></span> ${formatRichText(question.explanation)}`
    : '';

  byId<HTMLButtonElement>('prevBtn').disabled = index === 0;
  const next = byId('nextBtn');
  const last = index === total - 1;
  next.textContent = last ? 'Review and finish' : 'Next';
  next.className = 'btn';

  const flag = byId('flagBtn');
  const flagged = Boolean(state.flags[question.id]);
  flag.classList.toggle('active', flagged);
  flag.setAttribute('aria-pressed', String(flagged));

  byId<HTMLInputElement>('sidebarStudyMode').checked = state.studyMode;
}

export function initQuestionCard(): void {
  byId('optionsContainer').addEventListener('click', (event) => {
    const option = closestFrom(event, '[data-option]');
    const question = state.questions[state.currentIdx];
    if (!option || !question) return;
    selectOption(question.id, Number(option.dataset.option));
  });

  byId('prevBtn').addEventListener('click', () => navigate(-1));
  byId('nextBtn').addEventListener('click', () => {
    if (!navigate(1)) void confirmSubmit();
  });
  byId('flagBtn').addEventListener('click', toggleFlag);
  byId('finishBtn').addEventListener('click', () => void confirmSubmit());
  byId<HTMLInputElement>('sidebarStudyMode').addEventListener('change', (event) => {
    setStudyMode((event.target as HTMLInputElement).checked);
  });

  store.subscribe(render, ['screen', 'questions', 'currentIdx', 'answers', 'flags', 'studyMode']);
}
