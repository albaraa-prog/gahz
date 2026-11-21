import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/lessons';
import type { BlankStep, CodeStep, Lesson, Localized, OrderStep } from '../src/lessons/types';
import type { CallResult } from '../src/services/codeRunner';
import {
  advanceProgress,
  blankCount,
  checkBlanks,
  expectedJson,
  gradeTests,
  isLocalized,
  isOrderCorrect,
  lessonStatus,
  lessonsForStep,
  mergeLessonProgress,
  parseLessonProgress,
  shuffledOrder,
  tokenBank,
} from '../src/services/lessons';
import { ROADMAP_STEPS, isStepId } from '../src/services/roadmap';
import { LOCALES } from '../src/utils/i18n';

const ARABIC = /[؀-ۿ]/;

function expectLocalized(text: Localized, where: string): void {
  for (const locale of LOCALES) expect(text[locale].trim().length, `${where} (${locale})`).toBeGreaterThan(0);
  expect(ARABIC.test(text.ar), `${where}: Arabic text`).toBe(true);
  // Inline code must survive translation: the same number of `code` spans in both languages is not
  // required, but backticks must be balanced in each.
  for (const locale of LOCALES) expect((text[locale].match(/`/g) ?? []).length % 2, `${where} (${locale}) backticks`).toBe(0);
}

/** What public/runner.html does with a learner's code, without the sandbox. */
function runSolution(step: CodeStep): CallResult[] {
  const thunks = step.tests.map((test) => `function () { return (${test.call}\n); }`);
  const silent = { log() {}, info() {}, debug() {}, warn() {}, error() {} };
  const run = new Function('console', `"use strict";\n${step.solution}\n;return [${thunks.join(',')}];`)(silent) as (() => unknown)[];
  return run.map((thunk) => {
    try {
      const value = thunk();
      return { ok: true, json: expectedJson(value), text: String(value) };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  });
}

describe('lesson content', () => {
  it('has unique ids and belongs to real roadmap steps', () => {
    const ids = LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const lesson of LESSONS) {
      expect(lesson.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(lesson.roadmapSteps.length, lesson.id).toBeGreaterThan(0);
      for (const stepId of lesson.roadmapSteps) expect(isStepId(stepId), `${lesson.id}: ${stepId}`).toBe(true);
    }
  });

  it('is complete in every language and every exercise is well formed', () => {
    for (const lesson of LESSONS) {
      expectLocalized(lesson.title, `${lesson.id} title`);
      expectLocalized(lesson.summary, `${lesson.id} summary`);
      expect(lesson.steps.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.steps[0]?.kind, `${lesson.id} starts with an explanation`).toBe('explain');

      lesson.steps.forEach((step, index) => {
        const where = `${lesson.id} step ${index + 1}`;
        expectLocalized(step.text, `${where} text`);
        if (step.kind === 'explain') return;
        expectLocalized(step.hint, `${where} hint`);
        expectLocalized(step.explain, `${where} explain`);

        if (step.kind === 'choice') {
          expect(step.options.length, where).toBeGreaterThanOrEqual(3);
          expect(step.options[step.answer], where).toBeDefined();
          for (const option of step.options) if (isLocalized(option)) expectLocalized(option, `${where} option`);
          const plain = step.options.filter((option) => !isLocalized(option));
          expect(new Set(plain).size, `${where} repeats an option`).toBe(plain.length);
        } else if (step.kind === 'blank') {
          expect(blankCount(step), where).toBe(step.answers.length);
          expect(step.answers.length, where).toBeGreaterThan(0);
          for (const wrong of step.distractors) expect(step.answers, `${where} distractor`).not.toContain(wrong);
        } else if (step.kind === 'order') {
          expect(step.lines.length, where).toBeGreaterThanOrEqual(4);
        } else {
          expect(step.tests.length, where).toBeGreaterThanOrEqual(2);
          expect(step.starter, `${where} starter must not already be the answer`).not.toBe(step.solution);
        }
      });
    }
  });

  it('has a solution that passes its tests for every code exercise, and a starter that does not', () => {
    for (const lesson of LESSONS) {
      lesson.steps.forEach((step, index) => {
        if (step.kind !== 'code') return;
        const where = `${lesson.id} step ${index + 1}`;
        const outcomes = gradeTests(step.tests, runSolution(step));
        for (const outcome of outcomes) expect(outcome.passed, `${where}: ${outcome.test.call} gave ${outcome.actual}`).toBe(true);
        const starter = gradeTests(step.tests, runSolution({ ...step, solution: step.starter }));
        expect(
          starter.some((outcome) => !outcome.passed),
          `${where}: the starter code already passes`,
        ).toBe(true);
      });
    }
  });

  it('is offered on the roadmap steps it names', () => {
    for (const stepId of Object.keys(ROADMAP_STEPS)) {
      if (!isStepId(stepId)) continue;
      for (const lesson of lessonsForStep(stepId)) expect(lesson.roadmapSteps).toContain(stepId);
    }
    expect(lessonsForStep('javascript').length).toBeGreaterThan(0);
  });
});

describe('checking answers', () => {
  const blank: BlankStep = {
    kind: 'blank',
    text: { en: 'x', ar: 'س' },
    hint: { en: 'x', ar: 'س' },
    explain: { en: 'x', ar: 'س' },
    template: 'for (let i = 0; i ___ 3; i___) {}',
    answers: ['<', '++'],
    distractors: ['<=', '<'],
  };
  const order: OrderStep = {
    kind: 'order',
    text: { en: 'x', ar: 'س' },
    hint: { en: 'x', ar: 'س' },
    explain: { en: 'x', ar: 'س' },
    lines: ['if (a) {', '  one();', '}', 'if (b) {', '  two();', '}'],
  };

  it('marks each gap and treats an empty gap as wrong', () => {
    expect(blankCount(blank)).toBe(2);
    expect(checkBlanks(blank, ['<', '++'])).toEqual([true, true]);
    expect(checkBlanks(blank, ['<=', '++'])).toEqual([false, true]);
    expect(checkBlanks(blank, ['<', null])).toEqual([true, false]);
  });

  it('offers every answer once in the token bank', () => {
    const bank = tokenBank(blank);
    expect(bank.slice().sort()).toEqual(['++', '<', '<='].sort());
  });

  it('never starts a reorder exercise solved, and accepts identical lines in either place', () => {
    for (let round = 0; round < 50; round++) expect(isOrderCorrect(order, shuffledOrder(order))).toBe(false);
    expect(isOrderCorrect(order, [0, 1, 2, 3, 4, 5])).toBe(true);
    // The two closing braces are the same text, so swapping them is still correct.
    expect(isOrderCorrect(order, [0, 1, 5, 3, 4, 2])).toBe(true);
    expect(isOrderCorrect(order, [3, 1, 2, 0, 4, 5])).toBe(false);
    expect(isOrderCorrect(order, [0, 1, 2])).toBe(false);
  });

  it('grades code results against the expected values', () => {
    const tests = [
      { call: 'f(1)', expect: 2 },
      { call: 'f(2)', expect: [1, 'a'] },
      { call: 'f(3)', expect: undefined },
      { call: 'f(4)', expect: 'x' },
    ];
    const outcomes = gradeTests(tests, [
      { ok: true, json: '2', text: '2' },
      { ok: true, json: '[1,"a"]', text: '[1, "a"]' },
      { ok: true, json: '"undefined"', text: '"undefined"' },
      { ok: false, error: 'ReferenceError: f is not defined' },
    ]);
    expect(outcomes.map((outcome) => outcome.passed)).toEqual([true, true, false, false]);
    expect(outcomes[3]?.actual).toContain('ReferenceError');
    // A run that stopped early has no result for the later tests.
    expect(gradeTests(tests, []).every((outcome) => !outcome.passed)).toBe(true);
  });
});

describe('lesson progress', () => {
  const lesson = LESSONS[0] as Lesson;
  const total = lesson.steps.length;

  it('remembers the furthest step and completes once', () => {
    let progress = advanceProgress({}, lesson, 2, 100);
    expect(lessonStatus(lesson, progress)).toMatchObject({ reached: 2, total, completed: false });

    // Going back does not lose progress, and changes nothing.
    expect(advanceProgress(progress, lesson, 1, 150)).toBe(progress);

    progress = advanceProgress(progress, lesson, total, 200);
    expect(lessonStatus(lesson, progress)).toMatchObject({ reached: total, percent: 100, completed: true });
    expect(progress[lesson.id]?.completedAt).toBe(200);

    // Finishing again keeps the first completion time.
    expect(advanceProgress(progress, lesson, total, 300)).toBe(progress);
  });

  it('starts empty', () => {
    expect(lessonStatus(lesson, {})).toEqual({ reached: 0, total, percent: 0, completed: false });
  });
});

describe('code runner page', () => {
  it('is allowed by its content security policy', () => {
    const html = readFileSync('public/runner.html', 'utf8');
    const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';
    const hash = `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
    const config = JSON.parse(readFileSync('firebase.json', 'utf8')) as {
      hosting: { headers: { source: string; headers: { key: string; value: string }[] }[] };
    };
    const rule = config.hosting.headers.find((entry) => entry.source.startsWith('/runner'));
    const policy = rule?.headers.find((header) => header.key === 'Content-Security-Policy')?.value ?? '';
    expect(policy, `runner.html changed: put ${hash} in the /runner policy in firebase.json`).toContain(hash);
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain('sandbox allow-scripts');
  });
});

describe('lesson progress sync', () => {
  it('keeps the furthest step and the earliest finish from either side', () => {
    const local = { a: { reached: 3, completedAt: null }, b: { reached: 5, completedAt: 900 }, c: { reached: 1, completedAt: null } };
    const remote = { a: { reached: 2, completedAt: null }, b: { reached: 5, completedAt: 400 }, d: { reached: 4, completedAt: 700 } };
    expect(mergeLessonProgress(local, remote)).toEqual({
      a: { reached: 3, completedAt: null },
      b: { reached: 5, completedAt: 400 },
      c: { reached: 1, completedAt: null },
      d: { reached: 4, completedAt: 700 },
    });
    // The same result whichever side is "local".
    expect(mergeLessonProgress(remote, local)).toEqual(mergeLessonProgress(local, remote));
  });

  it('returns the same object when the other side adds nothing', () => {
    const local = { a: { reached: 3, completedAt: 50 } };
    expect(mergeLessonProgress(local, {})).toBe(local);
    expect(mergeLessonProgress(local, { a: { reached: 1, completedAt: 80 } })).toBe(local);
  });

  it('drops malformed entries read from storage or the account', () => {
    expect(parseLessonProgress(null)).toBeNull();
    expect(parseLessonProgress([])).toBeNull();
    expect(
      parseLessonProgress({
        'js-variables': { reached: 2.7, completedAt: 'yesterday' },
        done: { reached: 4, completedAt: 123 },
        'bad id!': { reached: 1, completedAt: null },
        negative: { reached: -1, completedAt: null },
        text: 'nope',
        huge: { reached: 1e9, completedAt: null },
      }),
    ).toEqual({
      'js-variables': { reached: 2, completedAt: null },
      done: { reached: 4, completedAt: 123 },
      huge: { reached: 1000, completedAt: null },
    });
  });

  it('every lesson id can be stored', () => {
    const all = Object.fromEntries(LESSONS.map((lesson) => [lesson.id, { reached: 1, completedAt: null }]));
    expect(Object.keys(parseLessonProgress(all) ?? {})).toHaveLength(LESSONS.length);
  });
});
