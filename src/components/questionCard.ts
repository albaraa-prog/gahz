/** The active question: text, code snippet, options, explanation and navigation. */

import { navigate, selectOption, setStudyMode, submitQuiz, toggleFlag, unansweredCount } from '../services/quizEngine';
import { categoryLabel, questionDirection, questionText } from '../services/questionText';
import { byId, closestFrom } from '../utils/dom';
import { formatLine, formatRichText } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { showDialog } from './modal';

/** Shared by the Next button on the last question and the sidebar's Finish button. */
export async function confirmSubmit(): Promise<void> {
  const unanswered = unansweredCount();
  const confirmed = await showDialog({
    title: t('submit.title'),
    body: unanswered > 0 ? { html: t('submit.unanswered', { n: unanswered }) } : t('submit.allAnswered'),
    confirmLabel: t('submit.confirm'),
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
  const direction = questionDirection(question);
  const text = questionText(question);

  const content = byId('questionContent');
  content.dir = direction;
  content.lang = direction === 'rtl' ? 'ar' : 'en';

  byId('currentCategoryTag').textContent = categoryLabel(question.category);
  const difficulty = byId('currentDifficultyTag');
  difficulty.textContent = t(`difficulty.${question.difficulty}`);
  difficulty.dataset.level = question.difficulty;

  byId('quizProgressBar').style.width = `${(index / total) * 100}%`;
  byId('questionText').innerHTML = `<strong>${String(index + 1).padStart(2, '0')}</strong>&ensp;${formatRichText(text.question)}`;

  const code = byId('questionCodeBlock');
  code.hidden = !question.codeSnippet;
  code.textContent = question.codeSnippet ?? '';

  const options = byId('optionsContainer');
  const hadFocus = options.contains(document.activeElement);
  options.classList.toggle('locked', reveal);
  options.setAttribute('role', 'radiogroup');
  options.innerHTML = text.options
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
          <span class="option-text">${formatLine(option, direction === 'rtl')}</span>
        </button>`;
    })
    .join('');
  // Re-rendering replaces the buttons, so give keyboard focus back to the chosen option.
  if (hadFocus && answered) options.querySelector<HTMLElement>(`[data-option="${answer}"]`)?.focus();

  const explanation = byId('quizExplanationBox');
  explanation.hidden = !reveal;
  explanation.innerHTML = reveal
    ? `<span class="explanation-label"><strong>${t('quiz.explanation')}</strong></span> ${formatRichText(text.explanation)}`
    : '';

  byId<HTMLButtonElement>('prevBtn').disabled = index === 0;
  byId('nextBtn').textContent = index === total - 1 ? t('quiz.reviewFinish') : t('quiz.next');

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

  store.subscribe(render, ['screen', 'questions', 'currentIdx', 'answers', 'flags', 'studyMode', 'locale', 'translationsReady']);
}
