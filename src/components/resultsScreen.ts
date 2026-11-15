/** Results: score ring, verdict, per-topic bars and the filterable review list. */

import type { ReviewFilter, VerdictLevel } from '../types';
import { returnToHome } from '../services/quizEngine';
import { byId, closestFrom, svgById } from '../utils/dom';
import { containsArabic, escapeHtml, formatRichText } from '../utils/helpers';
import { state, store } from '../utils/state';

const RING_CIRCUMFERENCE = 440;

const VERDICTS: Record<VerdictLevel, { text: string; className: string }> = {
  pass: { text: '🏆 Pass - Solid Mid-Level Developer', className: 'score-badge-desc badge badge-success verdict' },
  junior: { text: '⚙️ Passed - Associate / Junior Level', className: 'score-badge-desc badge verdict verdict--junior' },
  fail: { text: '⚠️ Review Required - Keep Practicing', className: 'score-badge-desc badge badge-fail verdict' },
};

function renderSummary(): void {
  const report = state.lastReport;
  if (!report) return;

  byId('scoreCircleText').textContent = `${report.percent}%`;
  byId('scoreCountsText').textContent = `${report.correct} / ${report.total} Correct`;

  const verdict = VERDICTS[report.verdict];
  const badge = byId('scoreVerdictBadge');
  badge.textContent = verdict.text;
  badge.className = verdict.className;

  const bars = byId('topicPerformanceBars');
  bars.innerHTML = report.categoryStats
    .map((stat) => {
      const percent = Math.round((stat.correct / stat.total) * 100);
      return `
        <div class="perf-bar-item">
          <div class="perf-label">${escapeHtml(stat.category)}</div>
          <div class="perf-track"><div class="perf-fill" data-percent="${percent}"></div></div>
          <div class="perf-percent">${percent}%</div>
        </div>`;
    })
    .join('');

  // Start from empty, then set the real values on the next frame so the CSS transitions run.
  const ring = svgById('scoreCircleFill');
  ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
  requestAnimationFrame(() => {
    ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * report.percent) / 100);
    bars.querySelectorAll<HTMLElement>('.perf-fill').forEach((fill) => {
      fill.style.width = `${fill.dataset.percent ?? '0'}%`;
    });
  });
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
        ? '<span class="status-correct">✓ Correct</span>'
        : answer === undefined
          ? '<span class="status-skipped">⚡ Skipped</span>'
          : '<span class="status-incorrect">✗ Incorrect</span>';
      const rtl = question.category.includes('Arabic') || containsArabic(question.question);

      const options = question.options
        .map((option, optionIndex) => {
          let optionClass = '';
          let suffix = '';
          if (optionIndex === question.correctAnswer) {
            optionClass = ' correct-choice';
            suffix = ' ✓ (Correct Answer)';
          } else if (answer === optionIndex) {
            optionClass = ' user-wrong-choice';
            suffix = ' ✗ (Your Selection)';
          }
          return `<div class="review-option${optionClass}"><span>${formatRichText(option)}</span><strong>${suffix}</strong></div>`;
        })
        .join('');

      return `
        <article class="review-item ${cardClass}${rtl ? ' rtl' : ''}" data-correct="${String(correct)}" data-flagged="${String(flagged)}">
          <div class="review-status-header">
            <div>
              <span class="category-tag">${escapeHtml(question.category)}</span>
              <strong>Question ${index + 1}</strong>
            </div>
            <div>${status}${flagged ? '<span class="status-flag">🚩 Flagged</span>' : ''}</div>
          </div>
          <div class="question-text">${formatRichText(question.question)}</div>
          ${question.codeSnippet ? `<pre class="code-block">${escapeHtml(question.codeSnippet)}</pre>` : ''}
          <div class="review-options-list">${options}</div>
          <div class="explanation-box">
            <span class="explanation-label"><strong>Explanation:</strong></span>
            ${formatRichText(question.explanation)}
          </div>
        </article>`;
    })
    .join('');

  byId('filterAllCount').textContent = String(questions.length);
  byId('filterCorrectCount').textContent = String(correctCount);
  byId('filterIncorrectCount').textContent = String(questions.length - correctCount);
  byId('filterFlaggedCount').textContent = String(flaggedCount);
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

  store.subscribe(() => {
    if (state.screen !== 'results') return;
    renderSummary();
    renderReview();
    applyFilter();
  }, ['lastReport', 'screen']);
  store.subscribe(applyFilter, ['reviewFilter']);
}
