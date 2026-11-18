/**
 * Learning roadmap: path cards on the home screen and the roadmap screen,
 * which shows one path as an ordered list of steps with the user's progress.
 */

import { openLesson } from '../services/lessonPlayer';
import { lessonStatus, lessonsForStep, localized } from '../services/lessons';
import { openRoadmap, returnToHome, startRoadmapStep } from '../services/quizEngine';
import {
  ROADMAP_PATHS,
  STEP_DONE_PERCENT,
  findPath,
  isStepId,
  masteredQuestionIds,
  pathProgress,
  type PathProgress,
  type RoadmapPath,
  type StepId,
} from '../services/roadmap';
import { byId, closestFrom } from '../utils/dom';
import { escapeHtml, formatRichText } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { startSafely } from './homeScreen';

interface PathView {
  path: RoadmapPath;
  progress: PathProgress;
}

/** Paths that have at least one step with questions. Before the bank loads, every path is listed. */
function visiblePaths(): PathView[] {
  const ready = state.bankStatus === 'ready';
  const mastered = masteredQuestionIds(state.history);
  return ROADMAP_PATHS.map((path) => ({ path, progress: pathProgress(path, state.allQuestions, mastered) })).filter(
    ({ progress }) => !ready || progress.steps.length > 0,
  );
}

function bar(percent: number): string {
  return `<div class="perf-track roadmap-track"><div class="perf-fill" data-percent="${percent}"></div></div>`;
}

/** Widths are set from script: the site's content security policy does not allow inline style attributes. */
function fillBars(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.perf-fill').forEach((fill) => {
    fill.style.width = `${fill.dataset.percent ?? '0'}%`;
  });
}

function renderHomeCards(): void {
  const ready = state.bankStatus === 'ready';
  byId('roadmapCards').innerHTML = visiblePaths()
    .map(({ path, progress }) => {
      const total = ready ? progress.steps.length : path.steps.length;
      const chips = [t('roadmap.steps', { done: progress.done, total }), t('roadmap.percent', { n: progress.percent })];
      return `
        <div class="mode-card roadmap-card" role="button" tabindex="0" data-roadmap-path="${path.id}"
             aria-disabled="${String(!ready)}">
          <div>
            <div class="mode-title">${escapeHtml(t(`path.${path.id}.title`))}</div>
            <p class="mode-description">${escapeHtml(t(`path.${path.id}.desc`))}</p>
          </div>
          <div>
            <div class="mode-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('<span aria-hidden="true">·</span>')}</div>
            ${bar(progress.percent)}
          </div>
        </div>`;
    })
    .join('');
  fillBars(byId('roadmapCards'));
}

/** Interactive lessons that teach this step, offered before its quiz. */
function lessonLinks(stepId: StepId): string {
  const links = lessonsForStep(stepId).map((lesson) => {
    const done = lessonStatus(lesson, state.lessonProgress).completed;
    const title = localized(lesson.title, state.locale);
    return `<button class="link-btn lesson-link${done ? ' lesson-link--done' : ''}" type="button" data-lesson="${escapeHtml(lesson.id)}">${escapeHtml(
      t('lesson.roadmapLink', { title }),
    )}${done ? ' ✓' : ''}</button>`;
  });
  return links.length > 0 ? `<div class="lesson-links">${links.join('')}</div>` : '';
}

function renderRoadmap(): void {
  const paths = visiblePaths();
  const current = paths.find(({ path }) => path.id === state.roadmapPath) ?? paths[0];

  byId('roadmapTabs').innerHTML = paths
    .map(({ path }) => {
      const selected = path === current?.path;
      return `<button class="filter-btn${selected ? ' active' : ''}" type="button" role="tab" aria-selected="${String(selected)}"
        data-roadmap-path="${path.id}">${escapeHtml(t(`path.${path.id}.title`))}</button>`;
    })
    .join('');

  const container = byId('roadmapPath');
  if (!current) {
    container.innerHTML = `<p class="section-intro">${escapeHtml(t('home.loading'))}</p>`;
    return;
  }
  const { path, progress } = current;

  const steps = progress.steps
    .map((step, index) => {
      const isNext = step.id === progress.next;
      const status = step.done ? 'done' : isNext ? 'next' : 'todo';
      const label = step.done ? t('roadmap.again') : step.mastered > 0 ? t('roadmap.continue') : t('roadmap.start');
      const badge = step.done ? t('roadmap.done') : isNext ? t('roadmap.next') : '';
      return `
        <li class="roadmap-step roadmap-step--${status}">
          <div class="roadmap-node" aria-hidden="true">${step.done ? '✓' : index + 1}</div>
          <div class="roadmap-step-body">
            <p class="roadmap-step-label">
              <span>${escapeHtml(t('roadmap.stepLabel', { n: index + 1 }))}</span>
              ${badge ? `<span class="roadmap-badge">${escapeHtml(badge)}</span>` : ''}
            </p>
            <h4 class="roadmap-step-title">${escapeHtml(t(`step.${step.id}.title`))}</h4>
            <p class="mode-description">${formatRichText(t(`step.${step.id}.desc`))}</p>
            ${lessonLinks(step.id)}
            <div class="roadmap-step-progress">
              ${bar(step.percent)}
              <span>${escapeHtml(t('roadmap.mastered', { n: step.mastered, total: step.total }))}</span>
            </div>
          </div>
          <button class="btn ${isNext ? '' : 'btn-outline '}btn-sm" type="button" data-roadmap-step="${step.id}">${escapeHtml(label)}</button>
        </li>`;
    })
    .join('');

  const summary =
    progress.next === null ? t('roadmap.pathDone') : t('roadmap.steps', { done: progress.done, total: progress.steps.length });
  container.innerHTML = `
    <div class="roadmap-head">
      <h2 class="section-title">${escapeHtml(t(`path.${path.id}.title`))}</h2>
      <p class="section-intro">${escapeHtml(t(`path.${path.id}.desc`))}</p>
      <div class="roadmap-summary">
        <span class="roadmap-summary-text${progress.next === null ? ' roadmap-summary-text--done' : ''}">${escapeHtml(summary)}</span>
        <span dir="ltr">${progress.percent}%</span>
        ${bar(progress.percent)}
      </div>
    </div>
    <ol class="roadmap-steps">${steps}</ol>
    <p class="roadmap-rule">${escapeHtml(t('roadmap.rule', { percent: STEP_DONE_PERCENT }))}</p>`;
  fillBars(container);
}

export function initRoadmapScreen(): void {
  const home = byId('roadmapCards');
  const openFromCard = (event: Event): void => {
    const card = closestFrom(event, '[data-roadmap-path]');
    const path = findPath(card?.dataset.roadmapPath);
    if (!card || !path || card.getAttribute('aria-disabled') === 'true') return;
    // The home screen's own handler ignores these cards: they carry no preset.
    openRoadmap(path.id);
  };
  home.addEventListener('click', openFromCard);
  home.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      openFromCard(event);
    }
  });

  const screen = byId('roadmapScreen');
  screen.addEventListener('click', (event) => {
    const tab = findPath(closestFrom(event, '[data-roadmap-path]')?.dataset.roadmapPath);
    if (tab) {
      state.roadmapPath = tab.id;
      return;
    }
    const lessonId = closestFrom(event, '[data-lesson]')?.dataset.lesson;
    if (lessonId) {
      openLesson(lessonId, 'roadmap');
      return;
    }
    const stepId = closestFrom(event, '[data-roadmap-step]')?.dataset.roadmapStep;
    if (isStepId(stepId)) startSafely(() => startRoadmapStep(stepId));
  });
  byId('roadmapBackBtn').addEventListener('click', returnToHome);

  renderHomeCards();
  store.subscribe(renderHomeCards, ['bankStatus', 'allQuestions', 'locale', 'history']);
  store.subscribe(() => {
    if (state.screen === 'roadmap') renderRoadmap();
  }, ['screen', 'roadmapPath', 'bankStatus', 'allQuestions', 'locale', 'history', 'lessonProgress']);
}
