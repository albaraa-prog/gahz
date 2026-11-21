import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadPyodide } from 'pyodide';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/lessons';
import type { BlankStep, CodeStep, Lesson, Localized, OrderStep } from '../src/lessons/types';
import type { CallResult, RunResult } from '../src/services/codeRunner';
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
  sameJson,
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

type PythonRun = Pick<RunResult, 'logs' | 'results' | 'error'>;
let pythonRunner: Promise<(code: string, calls: readonly string[]) => PythonRun> | null = null;

/** Python as the lessons run it: Pyodide with the harness taken out of public/runner.html. */
function python(): Promise<(code: string, calls: readonly string[]) => PythonRun> {
  pythonRunner ??= (async () => {
    const harness = /String\.raw`([\s\S]*?)`/.exec(readFileSync('public/runner.html', 'utf8'))?.[1];
    if (!harness) throw new Error('The Python harness was not found in public/runner.html');
    const pyodide = await loadPyodide();
    pyodide.runPython(harness);
    const run = pyodide.globals.get('_gahz_run') as (code: string, calls: string) => string;
    return (code, calls) => JSON.parse(run(code, JSON.stringify(calls))) as PythonRun;
  })();
  return pythonRunner;
}

/** What public/runner.html does with a learner's code, without the sandbox. */
async function runSolution(step: CodeStep): Promise<CallResult[]> {
  if (step.language === 'python') {
    const run = (await python())(
      step.solution,
      step.tests.map((test) => test.call),
    );
    expect(run.error, 'the code must load without an error').toBeNull();
    return run.results;
  }
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

  it('has a solution that passes its tests for every code exercise, and a starter that does not', async () => {
    for (const lesson of LESSONS) {
      for (const [index, step] of lesson.steps.entries()) {
        if (step.kind !== 'code') continue;
        const where = `${lesson.id} step ${index + 1}`;
        const outcomes = gradeTests(step.tests, await runSolution(step));
        for (const outcome of outcomes) expect(outcome.passed, `${where}: ${outcome.test.call} gave ${outcome.actual}`).toBe(true);
        const starter = gradeTests(step.tests, await runSolution({ ...step, solution: step.starter }));
        expect(
          starter.some((outcome) => !outcome.passed),
          `${where}: the starter code already passes`,
        ).toBe(true);
      }
    }
  }, 60_000);

  it('has exercises that run Python', () => {
    const languages = LESSONS.flatMap((lesson) => lesson.steps).flatMap((step) => (step.kind === 'code' ? [step.language ?? 'javascript'] : []));
    expect(languages).toContain('python');
    expect(languages).toContain('javascript');
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

  it('compares objects whatever the order of their keys, and nothing else loosely', () => {
    expect(sameJson('{"go":2,"java":1}', '{"java":1,"go":2}')).toBe(true);
    expect(sameJson('[{"b":[1,2],"a":1}]', '[{"a":1,"b":[1,2]}]')).toBe(true);
    expect(sameJson('[1,2]', '[2,1]')).toBe(false);
    expect(sameJson('"1"', '1')).toBe(false);
    expect(sameJson('undefined', 'undefined')).toBe(true);
    expect(sameJson('unserializable', '{}')).toBe(false);
  });
});

describe('running Python', () => {
  it('reports printed lines, values as JSON and errors with their line', async () => {
    const run = await python();
    const good = run(
      'def pair(n):\n    print("inside a check")\n    return (n, n / 2)\n\nprint("hello", 3)\nprint("two\\nlines")\ntags = {"b", "a"}',
      ['pair(4)', 'tags', '{"x": None, "ok": True}', 'pair("a")', 'object()'],
    );
    expect(good.error).toBeNull();
    // Only the learner's own run is shown, not what the checks print.
    expect(good.logs.map((line) => line.text)).toEqual(['hello 3', 'two', 'lines']);
    expect(good.results[0]).toEqual({ ok: true, json: '[4,2]', text: '(4, 2.0)' });
    expect(good.results[1]).toMatchObject({ ok: true, json: '["a","b"]' });
    expect(good.results[2]).toMatchObject({ ok: true, json: '{"x":null,"ok":true}' });
    expect(good.results[3]).toMatchObject({ ok: false });
    expect((good.results[3] as { error: string }).error).toMatch(/^TypeError: .* \(line 3\)$/);
    expect(good.results[4]).toMatchObject({ ok: true, json: 'unserializable' });

    const crash = run('x = 1\nprint("before")\nprint(y)', ['x']);
    expect(crash.error).toBe("NameError: name 'y' is not defined (line 3)");
    expect(crash.logs.map((line) => line.text)).toEqual(['before']);
    expect(crash.results).toEqual([]);

    const syntax = run('def broken(:\n    pass', []);
    expect(syntax.error).toContain('SyntaxError');
    expect(syntax.error).toContain('line 1');

    expect(run('name = input("Name? ")', []).error).toContain('input() is not available');
    // One run cannot see the names of the one before it.
    expect(run('print(x)', []).error).toContain('NameError');
  }, 60_000);
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

  it('can download Python from this site, and nothing else', () => {
    const config = JSON.parse(readFileSync('firebase.json', 'utf8')) as {
      hosting: { headers: { source: string; headers: { key: string; value: string }[] }[] };
    };
    const policy =
      config.hosting.headers
        .find((entry) => entry.source.startsWith('/runner'))
        ?.headers.find((header) => header.key === 'Content-Security-Policy')?.value ?? '';
    const connect = /connect-src ([^;]*)/.exec(policy)?.[1]?.split(' ') ?? [];
    expect(connect).toContain("'self'");
    for (const source of connect) expect(source === "'self'" || source.startsWith('https://gahz.web.app/pyodide/'), source).toBe(true);
    // The runner page is sandboxed, so the browser asks the Pyodide files for permission to read them.
    const pyodide = config.hosting.headers.find((entry) => entry.source === '/pyodide/**');
    expect(pyodide?.headers).toContainEqual({ key: 'Access-Control-Allow-Origin', value: '*' });
  });
});
