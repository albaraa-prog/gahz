/** Results: score ring, verdict, per-topic bars and the filterable review list. */

import type { ReviewFilter, VerdictLevel } from '../types';
import { returnToHome } from '../services/quizEngine';
import { byId, closestFrom, svgById } from '../utils/dom';
import { escapeHtml, formatRichText } from '../utils/helpers';
import { t, type TranslationKey } from '../utils/i18n';
import { state, store } from '../utils/state';
import { questionDirection } from './questionCard';

const RING_CIRCUMFERENCE = 440;

const VERDICTS: Record<VerdictLevel, { key: TranslationKey; className: string }> = {
  pass: { key: 'verdict.pass', className: 'score-badge-desc badge-success' },
  junior: { key: 'verdict.junior', className: 'score-badge-desc verdict--junior' },
  fail: { key: 'verdict.fail', className: 'score-badge-desc badge-fail' },
};

const FILTER_LABEL: Record<ReviewFilter, TranslationKey> = {
  all: 'filter.all',
  correct: 'filter.correct',
  incorrect: 'filter.incorrect',
  flagged: 'filter.flagged',
};

function renderSummary(animate: boolean): void {
  const report = state.lastReport;
  if (!report) return;

  byId('scoreCircleText').textContent = `${report.percent}%`;
  byId('scoreCountsText').textContent = t('results.counts', { correct: report.correct, total: report.total });

  const verdict = VERDICTS[report.verdict];
  const badge = byId('scoreVerdictBadge');
  badge.textContent = t(verdict.key);
  badge.className = verdict.className;

  const bars = byId('topicPerformanceBars');
  bars.innerHTML = report.categoryStats
    .map((stat) => {
      const percent = Math.round((stat.correct / stat.total) * 100);
      return `
        <div class="perf-bar-item">
          <div class="perf-label" dir="auto">${escapeHtml(stat.category)}</div>
          <div class="perf-track"><div class="perf-fill" data-percent="${percent}"></div></div>
          <div class="perf-percent" dir="ltr">${percent}%</div>
        </div>`;
    })
    .join('');

  const ring = svgById('scoreCircleFill');
  const fill = (): void => {
    ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * report.percent) / 100);
    bars.querySelectorAll<HTMLElement>('.perf-fill').forEach((bar) => {
      bar.style.width = `${bar.dataset.percent ?? '0'}%`;
    });
  };
  if (animate) {
    // Start from empty, then set the real values on the next frame so the CSS transitions run.
    ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    requestAnimationFrame(fill);
  } else {
    fill();
  }
}

function renderReview(): void {
  const { questions, answers, flags } = state;
  let correctCount = 0;
  let flaggedCount = 0;

  byId('reviewQuestionsList').innerHTML = questions
    .map((question, index) => {
      const answer = answers[question.id];
      const correct = answer === question.correctAnswer;
      const flagged = Boolean(flags[question.id]);
      if (correct) correctCount += 1;
      if (flagged) flaggedCount += 1;

      const cardClass = correct ? 'correct-card' : answer === undefined ? 'unanswered-card' : 'incorrect-card';
      const status = correct
        ? `<span class="status-correct">${t('review.correct')}</span>`
        : answer === undefined
          ? `<span class="status-skipped">${t('review.skipped')}</span>`
          : `<span class="status-incorrect">${t('review.incorrect')}</span>`;
      const direction = questionDirection(question);

      const options = question.options
        .map((option, optionIndex) => {
          let optionClass = '';
          let suffix = '';
          if (optionIndex === question.correctAnswer) {
            optionClass = ' correct-choice';
            suffix = t('review.correctAnswer');
          } else if (answer === optionIndex) {
            optionClass = ' user-wrong-choice';
            suffix = t('review.yourAnswer');
          }
          return `<div class="review-option${optionClass}"><span>${formatRichText(option)}</span><strong>${suffix}</strong></div>`;
        })
        .join('');

      return `
        <article class="review-item ${cardClass}" data-correct="${String(correct)}" data-flagged="${String(flagged)}">
          <div class="review-status-header">
            <div>
              <span class="category-tag" dir="auto">${escapeHtml(question.category)}</span>
              <strong>${t('review.question', { n: index + 1 })}</strong>
            </div>
            <div>${status}${flagged ? `<span class="status-flag">${t('review.flagged')}</span>` : ''}</div>
          </div>
          <div dir="${direction}" lang="${direction === 'rtl' ? 'ar' : 'en'}">
            <div class="question-text">${formatRichText(question.question)}</div>
            ${question.codeSnippet ? `<pre class="code-block" dir="ltr">${escapeHtml(question.codeSnippet)}</pre>` : ''}
            <div class="review-options-list">${options}</div>
            <div class="explanation-box">
              <span class="explanation-label"><strong>${t('quiz.explanation')}</strong></span>
              ${formatRichText(question.explanation)}
            </div>
          </div>
        </article>`;
    })
    .join('');

  const counts: Record<ReviewFilter, number> = {
    all: questions.length,
    correct: correctCount,
    incorrect: questions.length - correctCount,
    flagged: flaggedCount,
  };
  document.querySelectorAll<HTMLButtonElement>('#reviewFilters .filter-btn').forEach((button) => {
    const filter = FILTERS.find((f) => f === button.dataset.filter);
    if (filter) button.textContent = t(FILTER_LABEL[filter], { n: counts[filter] });
  });
}

function applyFilter(): void {
  const filter = state.reviewFilter;
  document.querySelectorAll<HTMLButtonElement>('#reviewFilters .filter-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  document.querySelectorAll<HTMLElement>('#reviewQuestionsList .review-item').forEach((card) => {
    const correct = card.dataset.correct === 'true';
    const flagged = card.dataset.flagged === 'true';
    const visible =
      filter === 'all' || (filter === 'correct' && correct) || (filter === 'incorrect' && !correct) || (filter === 'flagged' && flagged);
    card.hidden = !visible;
  });
}

const FILTERS: readonly ReviewFilter[] = ['all', 'correct', 'incorrect', 'flagged'];

export function initResultsScreen(): void {
  byId('returnHomeBtn').addEventListener('click', returnToHome);

  byId('reviewFilters').addEventListener('click', (event) => {
    const button = closestFrom(event, '[data-filter]');
    const filter = FILTERS.find((f) => f === button?.dataset.filter);
    if (filter) state.reviewFilter = filter;
  });

  store.subscribe((_state, changed) => {
    if (state.screen !== 'results') return;
    // A language switch re-renders in place without replaying the score animation.
    renderSummary(!changed.has('locale') || changed.has('lastReport'));
    renderReview();
    applyFilter();
  }, ['lastReport', 'screen', 'locale']);
  store.subscribe(applyFilter, ['reviewFilter']);
}
