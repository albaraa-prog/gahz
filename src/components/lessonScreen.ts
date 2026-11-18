/**
 * Interactive lessons: the "Learn by doing" cards on the home screen and the
 * lesson player, which shows one step at a time and checks each exercise on
 * the spot.
 *
 * The exercise being worked on (chosen option, filled gaps, line order, typed
 * code) is kept in this module, not in the store: it is thrown away when the
 * learner moves to another step.
 */

import type { BlankStep, ChoiceStep, CodeStep, ExerciseStep, Lesson, LessonStep, OrderStep } from '../lessons/types';
import { RunnerUnavailableError, runCode, type RunResult } from '../services/codeRunner';
import { closeLesson, currentLesson, goToLessonStep, openLesson } from '../services/lessonPlayer';
import {
  LESSONS,
  blankCount,
  checkBlanks,
  expectedJson,
  findLesson,
  gradeTests,
  isLocalized,
  isOrderCorrect,
  lessonStatus,
  localized,
  shuffledOrder,
  splitTemplate,
  tokenBank,
  type TestOutcome,
} from '../services/lessons';
import { startRoadmapStep } from '../services/quizEngine';
import { stepQuestions, type StepId } from '../services/roadmap';
import { byId, closestFrom } from '../utils/dom';
import { reportError } from '../utils/errors';
import { escapeHtml, formatRichText, randomSample } from '../utils/helpers';
import { t } from '../utils/i18n';
import { state, store } from '../utils/state';
import { startSafely } from './homeScreen';

/** After this many wrong tries the learner may ask for the answer. */
const TRIES_BEFORE_ANSWER = 2;

type Feedback = 'none' | 'wrong' | 'right';

interface Work {
  /** `${lessonId}:${stepIndex}`: the step this work belongs to. */
  key: string;
  feedback: Feedback;
  tries: number;
  hintShown: boolean;
  // choice
  optionOrder: number[];
  selected: number | null;
  // blank
  bank: string[];
  filled: (string | null)[];
  blankFlags: boolean[] | null;
  // order
  order: number[];
  // code
  code: string;
  running: boolean;
  run: RunResult | null;
  outcomes: TestOutcome[] | null;
  runnerDown: boolean;
}

let work: Work | null = null;

function newWork(key: string, step: LessonStep | undefined): Work {
  const base: Work = {
    key,
    feedback: 'none',
    tries: 0,
    hintShown: false,
    optionOrder: [],
    selected: null,
    bank: [],
    filled: [],
    blankFlags: null,
    order: [],
    code: '',
    running: false,
    run: null,
    outcomes: null,
    runnerDown: false,
  };
  if (!step) return base;
  if (step.kind === 'choice') {
    const indexes = step.options.map((_, index) => index);
    base.optionOrder = randomSample(indexes, indexes.length);
  } else if (step.kind === 'blank') {
    base.bank = tokenBank(step);
    base.filled = Array.from({ length: blankCount(step) }, () => null);
  } else if (step.kind === 'order') {
    base.order = shuffledOrder(step);
  } else if (step.kind === 'code') {
    base.code = step.starter;
  }
  return base;
}

const text = (value: Parameters<typeof localized>[0]): string => localized(value, state.locale);

/** Prose with blank lines between paragraphs. */
function paragraphs(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${formatRichText(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function codeBlock(code: string): string {
  return `<pre class="code-block lesson-code" dir="ltr">${escapeHtml(code)}</pre>`;
}

/** Widths are set from script: the site's content security policy does not allow inline style attributes. */
function fillBars(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-percent]').forEach((fill) => {
    fill.style.width = `${fill.dataset.percent ?? '0'}%`;
  });
}

// -------------------------------------------------------------- home cards

function renderHomeCards(): void {
  const container = byId('lessonCards');
  container.innerHTML = LESSONS.map((lesson) => {
    const status = lessonStatus(lesson, state.lessonProgress);
    const progressChip = status.completed
      ? t('lesson.done')
      : status.reached > 0
        ? t('lesson.progress', { n: status.reached, total: status.total })
        : t('lesson.steps', { n: status.total });
    const chips = [lesson.tag, t('chip.minutes', { n: lesson.minutes }), progressChip];
    return `
      <div class="mode-card roadmap-card lesson-card${status.completed ? ' lesson-card--done' : ''}" role="button" tabindex="0"
           data-lesson="${escapeHtml(lesson.id)}">
        <div>
          <div class="mode-title">${escapeHtml(text(lesson.title))}</div>
          <p class="mode-description">${formatRichText(text(lesson.summary))}</p>
        </div>
        <div>
          <div class="mode-meta">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('<span aria-hidden="true">·</span>')}</div>
          <div class="perf-track roadmap-track"><div class="perf-fill" data-percent="${status.percent}"></div></div>
        </div>
      </div>`;
  }).join('');
  fillBars(container);
}

// ------------------------------------------------------------------ player

function renderChoice(step: ChoiceStep, current: Work, locked: boolean): string {
  const options = current.optionOrder
    .map((optionIndex) => {
      const option = step.options[optionIndex];
      if (option === undefined) return '';
      const selected = current.selected === optionIndex;
      let stateClass = selected ? ' selected' : '';
      if (selected && current.feedback === 'right') stateClass = ' correct-choice';
      else if (selected && current.feedback === 'wrong') stateClass = ' user-wrong-choice';
      const label = isLocalized(option) ? formatRichText(text(option)) : `<code dir="ltr">${escapeHtml(option)}</code>`;
      return `
        <button type="button" class="option-item${stateClass}" role="radio" aria-checked="${String(selected)}"
                data-lesson-option="${optionIndex}"${locked ? ' disabled' : ''}>
          <span class="option-radio"></span>
          <span class="option-text">${label}</span>
        </button>`;
    })
    .join('');
  return `<div class="options-list lesson-options${locked ? ' locked' : ''}" role="radiogroup">${options}</div>`;
}

function renderBlank(step: BlankStep, current: Work, locked: boolean): string {
  const parts = splitTemplate(step.template);
  const firstEmpty = current.filled.indexOf(null);
  const template = parts
    .map((part, index) => {
      if (index === parts.length - 1) return escapeHtml(part);
      const token = current.filled[index] ?? null;
      const flag = current.blankFlags?.[index];
      const stateClass = token === null ? ' blank-slot--empty' : flag === true ? ' blank-slot--right' : flag === false ? ' blank-slot--wrong' : '';
      const active = index === firstEmpty ? ' blank-slot--active' : '';
      const label = token === null ? t('lesson.gapEmpty', { n: index + 1 }) : t('lesson.gapFilled', { n: index + 1, token });
      return `${escapeHtml(part)}<button type="button" class="blank-slot${stateClass}${active}" data-blank="${index}"
        aria-label="${escapeHtml(label)}"${locked || token === null ? ' disabled' : ''}>${token === null ? '&nbsp;' : escapeHtml(token)}</button>`;
    })
    .join('');
  const bank = current.bank
    .map(
      (token) =>
        `<button type="button" class="token-chip" data-token="${escapeHtml(token)}"${locked || firstEmpty === -1 ? ' disabled' : ''}>${escapeHtml(token)}</button>`,
    )
    .join('');
  return `
    <pre class="code-block lesson-code lesson-template" dir="ltr">${template}</pre>
    <div class="token-bank" dir="ltr" role="group" aria-label="${escapeHtml(t('lesson.tokens'))}">${bank}</div>`;
}

function renderOrder(step: OrderStep, current: Work, locked: boolean): string {
  const last = current.order.length - 1;
  const items = current.order
    .map((lineIndex, position) => {
      const line = step.lines[lineIndex] ?? '';
      return `
        <li class="order-line">
          <span class="order-number" aria-hidden="true">${position + 1}</span>
          <pre class="order-code" dir="ltr">${escapeHtml(line)}</pre>
          <span class="order-moves">
            <button type="button" class="order-move" data-move="-1" data-position="${position}"
              aria-label="${escapeHtml(t('lesson.moveUp', { n: position + 1 }))}"${locked || position === 0 ? ' disabled' : ''}>↑</button>
            <button type="button" class="order-move" data-move="1" data-position="${position}"
              aria-label="${escapeHtml(t('lesson.moveDown', { n: position + 1 }))}"${locked || position === last ? ' disabled' : ''}>↓</button>
          </span>
        </li>`;
    })
    .join('');
  return `<ol class="order-list${current.feedback === 'right' ? ' order-list--right' : ''}">${items}</ol>`;
}

function renderRunOutput(step: CodeStep, current: Work): string {
  if (current.runnerDown) return `<p class="lesson-note lesson-note--wrong">${escapeHtml(t('lesson.runnerDown'))}</p>`;
  const run = current.run;
  if (!run) return '';
  const blocks: string[] = [];

  if (run.timedOut) {
    blocks.push(`<p class="lesson-note lesson-note--wrong">${escapeHtml(t('lesson.timedOut'))}</p>`);
  } else if (run.error) {
    blocks.push(
      `<div class="run-block"><p class="run-label">${escapeHtml(t('lesson.error'))}</p><pre class="run-output run-output--error" dir="ltr">${escapeHtml(run.error)}</pre></div>`,
    );
  }
  if (run.logs.length > 0) {
    const lines = run.logs.map((line) => `<span class="run-line run-line--${line.level}">${escapeHtml(line.text)}</span>`).join('\n');
    blocks.push(
      `<div class="run-block"><p class="run-label">${escapeHtml(t('lesson.output'))}</p><pre class="run-output" dir="ltr">${lines}</pre></div>`,
    );
  }
  if (current.outcomes && !run.timedOut && !run.error) {
    const passed = current.outcomes.filter((outcome) => outcome.passed).length;
    const rows = current.outcomes
      .map((outcome) => {
        const detail = outcome.passed
          ? ''
          : `<span class="test-detail">${escapeHtml(t('lesson.expected'))} <code dir="ltr">${escapeHtml(expectedJson(outcome.test.expect))}</code>
             ${escapeHtml(t('lesson.got'))} <code dir="ltr">${escapeHtml(outcome.actual || '—')}</code></span>`;
        return `
          <li class="test-row test-row--${outcome.passed ? 'pass' : 'fail'}">
            <span class="test-mark" aria-hidden="true">${outcome.passed ? '✓' : '✗'}</span>
            <span class="test-body"><code dir="ltr">${escapeHtml(outcome.test.call)}</code>${detail}</span>
          </li>`;
      })
      .join('');
    blocks.push(
      `<div class="run-block"><p class="run-label">${escapeHtml(t('lesson.tests', { passed, total: step.tests.length }))}</p><ul class="test-list">${rows}</ul></div>`,
    );
  }
  return blocks.join('');
}

function renderCode(step: CodeStep, current: Work): string {
  return `
    <label class="sr-only" for="lessonEditor">${escapeHtml(t('lesson.editor'))}</label>
    <textarea class="code-editor" id="lessonEditor" dir="ltr" spellcheck="false" autocapitalize="off" autocomplete="off"
      autocorrect="off" rows="${Math.max(8, current.code.split('\n').length + 2)}">${escapeHtml(current.code)}</textarea>
    <p class="lesson-note">${escapeHtml(t('lesson.editorNote'))}</p>
    <div class="run-results" id="lessonRunResults" aria-live="polite">${renderRunOutput(step, current)}</div>`;
}

function renderExercise(step: ExerciseStep, current: Work, locked: boolean): string {
  switch (step.kind) {
    case 'choice':
      return renderChoice(step, current, locked);
    case 'blank':
      return renderBlank(step, current, locked);
    case 'order':
      return renderOrder(step, current, locked);
    case 'code':
      return renderCode(step, current);
  }
}

function canCheck(step: ExerciseStep, current: Work): boolean {
  if (step.kind === 'choice') return current.selected !== null;
  if (step.kind === 'blank') return !current.filled.includes(null);
  if (step.kind === 'code') return !current.running;
  return true;
}

function nextLesson(after: Lesson): Lesson | undefined {
  const index = LESSONS.indexOf(after);
  const rest = [...LESSONS.slice(index + 1), ...LESSONS.slice(0, index)];
  return rest.find((lesson) => !lessonStatus(lesson, state.lessonProgress).completed);
}

/** The first roadmap step of the lesson that has questions to practise. */
function practiceStep(lesson: Lesson): StepId | undefined {
  return lesson.roadmapSteps.find((stepId) => stepQuestions(stepId, state.allQuestions).length > 0);
}

function renderFinished(lesson: Lesson): string {
  const next = nextLesson(lesson);
  const practice = practiceStep(lesson);
  return `
    <div class="lesson-finished">
      <p class="eyebrow">${escapeHtml(t('lesson.finishedEyebrow'))}</p>
      <h2 class="section-title lesson-title">${escapeHtml(t('lesson.finishedTitle', { title: text(lesson.title) }))}</h2>
      <p class="section-intro">${escapeHtml(practice ? t('lesson.finishedPractice') : t('lesson.finishedBody'))}</p>
      <div class="lesson-actions lesson-actions--start">
        ${practice ? `<button class="btn" type="button" data-practice="${practice}">${escapeHtml(t('lesson.practice'))}</button>` : ''}
        ${
          next
            ? `<button class="btn${practice ? ' btn-outline' : ''}" type="button" data-lesson="${escapeHtml(next.id)}">${escapeHtml(t('lesson.next', { title: text(next.title) }))}</button>`
            : ''
        }
        <button class="btn btn-outline" type="button" data-lesson-step="0">${escapeHtml(t('lesson.restart'))}</button>
      </div>
    </div>`;
}

function render(): void {
  if (state.screen !== 'lesson') return;
  const container = byId('lessonBody');
  const lesson = currentLesson();
  if (!lesson) {
    closeLesson();
    return;
  }
  byId('lessonBackBtn').textContent = state.lessonReturn === 'roadmap' ? t('lesson.backRoadmap') : t('roadmap.back');

  const total = lesson.steps.length;
  const index = Math.min(state.lessonStep, total);
  const step = lesson.steps[index];
  const key = `${lesson.id}:${index}`;
  if (!work || work.key !== key) work = newWork(key, step);
  const current = work;

  const head = `
    <p class="eyebrow"><span dir="ltr">${escapeHtml(lesson.tag)}</span> · ${escapeHtml(text(lesson.title))}</p>
    <div class="progress-bar-bg lesson-progress"><div class="progress-bar-fill" data-percent="${Math.round((index / total) * 100)}"></div></div>`;

  if (!step) {
    container.innerHTML = head + renderFinished(lesson);
    fillBars(container);
    return;
  }

  const reached = state.lessonProgress[lesson.id]?.reached ?? 0;
  const completed = Boolean(state.lessonProgress[lesson.id]?.completedAt);
  const solved = current.feedback === 'right';
  const isExercise = step.kind !== 'explain';
  const mayContinue = !isExercise || solved || index < reached || completed;

  let body = '';
  let feedback = '';
  const actions: string[] = [];
  if (index > 0) {
    actions.push(`<button class="btn btn-outline" type="button" data-lesson-step="${index - 1}">${escapeHtml(t('quiz.prev'))}</button>`);
  }

  if (step.kind !== 'explain') {
    body = renderExercise(step, current, solved);
    if (current.hintShown && !solved) {
      feedback += `<div class="lesson-feedback lesson-feedback--hint"><span class="feedback-label">${escapeHtml(t('lesson.hint'))}</span>${paragraphs(text(step.hint))}</div>`;
    }
    if (current.feedback === 'wrong') {
      feedback += `<div class="lesson-feedback lesson-feedback--wrong" role="status"><span class="feedback-label">${escapeHtml(t('lesson.wrong'))}</span><p>${escapeHtml(
        step.kind === 'code' ? t('lesson.wrongCode') : t('lesson.wrongBody'),
      )}</p></div>`;
    }
    if (solved) {
      feedback += `<div class="lesson-feedback lesson-feedback--right" role="status"><span class="feedback-label">${escapeHtml(t('lesson.right'))}</span>${paragraphs(text(step.explain))}</div>`;
    }
    if (!solved) {
      if (!current.hintShown) actions.push(`<button class="link-btn" type="button" data-lesson-action="hint">${escapeHtml(t('lesson.showHint'))}</button>`);
      if (current.tries >= TRIES_BEFORE_ANSWER) {
        actions.push(`<button class="link-btn" type="button" data-lesson-action="answer">${escapeHtml(t('lesson.showAnswer'))}</button>`);
      }
    }
  }

  const continueLabel = index === total - 1 ? t('lesson.finish') : t('lesson.continue');
  const primary: string[] = [];
  if (step.kind !== 'explain' && !solved) {
    const label = step.kind === 'code' ? (current.running ? t('lesson.running') : t('lesson.run')) : t('lesson.check');
    primary.push(
      `<button class="btn" type="button" data-lesson-action="check"${canCheck(step, current) ? '' : ' disabled'}>${escapeHtml(label)}</button>`,
    );
    if (mayContinue) {
      primary.push(`<button class="btn btn-outline" type="button" data-lesson-step="${index + 1}">${escapeHtml(t('lesson.skip'))}</button>`);
    }
  } else {
    primary.push(`<button class="btn" type="button" data-lesson-step="${index + 1}">${escapeHtml(continueLabel)}</button>`);
  }

  container.innerHTML = `
    ${head}
    <p class="lesson-step-label">
      <span>${escapeHtml(t('lesson.stepOf', { n: index + 1, total }))}</span>
      <span class="lesson-kind">${escapeHtml(t(`lesson.kind.${step.kind}`))}</span>
    </p>
    <div class="lesson-text">${paragraphs(text(step.text))}</div>
    ${step.code ? codeBlock(step.code) : ''}
    ${body}
    <div id="lessonFeedback">${feedback}</div>
    <div class="lesson-actions">
      <span class="lesson-actions-side">${actions.join('')}</span>
      <span class="lesson-actions-side">${primary.join('')}</span>
    </div>`;
  fillBars(container);
}

// ---------------------------------------------------------------- actions

function currentExercise(): { step: ExerciseStep; current: Work } | null {
  const lesson = currentLesson();
  const step = lesson?.steps[state.lessonStep];
  if (!step || step.kind === 'explain' || !work) return null;
  return { step, current: work };
}

/** Keeps what was typed when the step is drawn again. */
function readEditor(): void {
  const editor = document.getElementById('lessonEditor');
  if (work && editor instanceof HTMLTextAreaElement) work.code = editor.value;
}

function settle(current: Work, correct: boolean): void {
  current.feedback = correct ? 'right' : 'wrong';
  if (!correct) current.tries += 1;
}

async function runAndGrade(step: CodeStep, current: Work): Promise<void> {
  current.running = true;
  current.feedback = 'none';
  current.runnerDown = false;
  render();
  try {
    const run = await runCode(
      current.code,
      step.tests.map((test) => test.call),
    );
    if (work !== current) return;
    current.run = run;
    current.outcomes = gradeTests(step.tests, run.results);
    const passed = !run.timedOut && !run.error && current.outcomes.every((outcome) => outcome.passed);
    settle(current, passed);
  } catch (error) {
    if (work !== current) return;
    current.run = null;
    current.outcomes = null;
    current.runnerDown = true;
    if (!(error instanceof RunnerUnavailableError)) reportError(error);
  } finally {
    current.running = false;
    if (work === current) render();
  }
}

function check(): void {
  const exercise = currentExercise();
  if (!exercise) return;
  const { step, current } = exercise;
  if (current.feedback === 'right' || !canCheck(step, current)) return;

  if (step.kind === 'code') {
    readEditor();
    void runAndGrade(step, current);
    return;
  }
  if (step.kind === 'choice') {
    settle(current, current.selected === step.answer);
  } else if (step.kind === 'blank') {
    current.blankFlags = checkBlanks(step, current.filled);
    settle(
      current,
      current.blankFlags.every((flag) => flag),
    );
  } else {
    settle(current, isOrderCorrect(step, current.order));
  }
  render();
}

/** Puts the right answer in place. The learner still presses Check, so they see it work. */
function showAnswer(): void {
  const exercise = currentExercise();
  if (!exercise) return;
  const { step, current } = exercise;
  current.feedback = 'none';
  if (step.kind === 'choice') current.selected = step.answer;
  else if (step.kind === 'blank') {
    current.filled = [...step.answers];
    current.blankFlags = null;
  } else if (step.kind === 'order') current.order = step.lines.map((_, index) => index);
  else {
    current.code = step.solution;
    current.run = null;
    current.outcomes = null;
  }
  render();
}

function onPlayerClick(event: Event): void {
  const stepButton = closestFrom(event, '[data-lesson-step]');
  if (stepButton) {
    goToLessonStep(Number(stepButton.dataset.lessonStep));
    return;
  }
  const lessonButton = closestFrom(event, '[data-lesson]');
  if (lessonButton && findLesson(lessonButton.dataset.lesson)) {
    openLesson(lessonButton.dataset.lesson ?? '', state.lessonReturn);
    return;
  }
  const practice = closestFrom(event, '[data-practice]');
  if (practice) {
    startSafely(() => startRoadmapStep(practice.dataset.practice as StepId));
    return;
  }

  const action = closestFrom(event, '[data-lesson-action]')?.dataset.lessonAction;
  if (action === 'check') {
    check();
    return;
  }
  if (action === 'answer') {
    showAnswer();
    return;
  }

  const exercise = currentExercise();
  if (!exercise || exercise.current.feedback === 'right') return;
  const { step, current } = exercise;

  if (action === 'hint') {
    readEditor();
    current.hintShown = true;
    render();
    return;
  }

  const option = closestFrom(event, '[data-lesson-option]');
  if (option && step.kind === 'choice') {
    current.selected = Number(option.dataset.lessonOption);
    current.feedback = 'none';
    render();
    byId('lessonBody').querySelector<HTMLElement>(`[data-lesson-option="${current.selected}"]`)?.focus();
    return;
  }

  const token = closestFrom(event, '[data-token]');
  if (token && step.kind === 'blank') {
    const empty = current.filled.indexOf(null);
    if (empty === -1) return;
    current.filled = current.filled.map((value, index) => (index === empty ? (token.dataset.token ?? null) : value));
    current.blankFlags = null;
    current.feedback = 'none';
    render();
    return;
  }
  const slot = closestFrom(event, '[data-blank]');
  if (slot && step.kind === 'blank') {
    const target = Number(slot.dataset.blank);
    current.filled = current.filled.map((value, index) => (index === target ? null : value));
    current.blankFlags = null;
    current.feedback = 'none';
    render();
    return;
  }

  const move = closestFrom(event, '[data-move]');
  if (move && step.kind === 'order') {
    const from = Number(move.dataset.position);
    const direction = Number(move.dataset.move);
    const to = from + direction;
    if (to < 0 || to >= current.order.length) return;
    const order = current.order.slice();
    [order[from], order[to]] = [order[to] as number, order[from] as number];
    current.order = order;
    current.feedback = 'none';
    render();
    // Follow the line that moved, so it can be moved again from the keyboard.
    const selector = `[data-move="${direction}"][data-position="${to}"]`;
    const follow = byId('lessonBody').querySelector<HTMLButtonElement>(selector);
    (follow && !follow.disabled ? follow : byId('lessonBody').querySelector<HTMLElement>(`[data-move="${-direction}"][data-position="${to}"]`))?.focus();
  }
}

function onEditorKey(event: KeyboardEvent): void {
  const editor = event.target;
  if (!(editor instanceof HTMLTextAreaElement) || editor.id !== 'lessonEditor') return;
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    check();
    return;
  }
  // Tab indents, like a code editor. Escape then Tab leaves the editor.
  if (event.key === 'Escape') {
    editor.dataset.tabOut = 'true';
    return;
  }
  if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
    if (editor.dataset.tabOut === 'true') {
      delete editor.dataset.tabOut;
      return;
    }
    event.preventDefault();
    editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
    return;
  }
  delete editor.dataset.tabOut;
}

export function initLessonScreen(): void {
  const cards = byId('lessonCards');
  const openFromCard = (event: Event): void => {
    const id = closestFrom(event, '[data-lesson]')?.dataset.lesson;
    if (id) openLesson(id, 'home');
  };
  cards.addEventListener('click', openFromCard);
  cards.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      openFromCard(event);
    }
  });

  const body = byId('lessonBody');
  body.addEventListener('click', onPlayerClick);
  body.addEventListener('keydown', onEditorKey);
  byId('lessonBackBtn').addEventListener('click', closeLesson);

  renderHomeCards();
  store.subscribe(renderHomeCards, ['locale', 'lessonProgress']);
  store.subscribe(
    (_, changed) => {
      readEditor();
      render();
      if (state.screen === 'lesson' && (changed.has('lessonStep') || changed.has('lessonId'))) window.scrollTo(0, 0);
    },
    ['screen', 'lessonId', 'lessonStep', 'locale', 'lessonProgress', 'allQuestions'],
  );
}
