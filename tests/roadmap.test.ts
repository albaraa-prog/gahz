import { afterEach, describe, expect, it } from 'vitest';
import { displayMode } from '../src/services/presets';
import { loadQuestionBanks } from '../src/services/questionLoader';
import {
  ROADMAP_PATHS,
  ROADMAP_STEPS,
  STEP_QUIZ_QUESTIONS,
  type StepId,
  masteredQuestionIds,
  parseRoadmapMode,
  pathForStep,
  pathProgress,
  pickStepQuestions,
  roadmapMode,
  stepProgress,
  stepQuestions,
} from '../src/services/roadmap';
import type { Attempt, AttemptAnswer, Question } from '../src/types';
import { LOCALES, setActiveLocale, t } from '../src/utils/i18n';

const answer = (questionId: number, correct: boolean, selected: number | null = 0): AttemptAnswer => ({
  questionId,
  selected,
  correct,
  flagged: false,
});

const attempt = (timestamp: number, answers: AttemptAnswer[]): Attempt => ({
  id: `a${timestamp}`,
  timestamp,
  date: '',
  mode: 'm',
  totalQuestions: answers.length,
  correct: answers.filter((a) => a.correct).length,
  percent: 0,
  answers,
});

const question = (id: number, category: string): Question => ({
  id,
  category,
  difficulty: 'easy',
  question: `Question number ${id}?`,
  options: ['a', 'b', 'c', 'd'],
  correctAnswer: 0,
  explanation: 'Because.',
  bank: 'test',
});

/** Ten "Programming Basics" questions (ids 1-10) and five "Logic & IQ" questions (ids 11-15). */
const bank: Question[] = [
  ...Array.from({ length: 10 }, (_, i) => question(i + 1, 'Programming Basics')),
  ...Array.from({ length: 5 }, (_, i) => question(i + 11, 'Logic & IQ')),
];

const correctAnswers = (ids: number[]): Attempt[] => [attempt(1, ids.map((id) => answer(id, true)))];

afterEach(() => setActiveLocale('en'));

describe('roadmap progress', () => {
  it('counts a question as answered correctly by its latest answer, ignoring skips', () => {
    const history = [
      attempt(3, [answer(1, false), answer(2, false, null)]),
      attempt(1, [answer(1, true), answer(2, true), answer(3, false)]),
      attempt(2, [answer(3, true)]),
      { ...attempt(4, []), answers: undefined },
    ];
    expect([...masteredQuestionIds(history)].sort()).toEqual([2, 3]);
  });

  it('completes a step at 80% and not before', () => {
    const seven = stepProgress('basics', bank, masteredQuestionIds(correctAnswers([1, 2, 3, 4, 5, 6, 7])));
    expect(seven).toMatchObject({ total: 10, mastered: 7, percent: 70, done: false });
    const eight = stepProgress('basics', bank, masteredQuestionIds(correctAnswers([1, 2, 3, 4, 5, 6, 7, 8])));
    expect(eight).toMatchObject({ mastered: 8, percent: 80, done: true });
  });

  it('hides steps without questions and points at the first unfinished step', () => {
    const foundations = ROADMAP_PATHS[0];
    const start = pathProgress(foundations, bank, new Set());
    expect(start.steps.map((step) => step.id)).toEqual(['basics', 'logic']);
    expect(start).toMatchObject({ done: 0, percent: 0, next: 'basics' });

    const half = pathProgress(foundations, bank, masteredQuestionIds(correctAnswers([1, 2, 3, 4, 5, 6, 7, 8])));
    expect(half).toMatchObject({ done: 1, percent: 50, next: 'logic' });

    const all = pathProgress(foundations, bank, masteredQuestionIds(correctAnswers([1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14])));
    expect(all).toMatchObject({ done: 2, percent: 100, next: null });
  });

  it('builds a step quiz from the questions not answered correctly yet first', () => {
    const mastered = new Set([1, 2, 3, 4, 5, 6]);
    const picked = pickStepQuestions('basics', [...bank, question(16, 'Programming Basics'), question(17, 'Programming Basics')], mastered);
    expect(picked).toHaveLength(STEP_QUIZ_QUESTIONS);
    expect(picked.slice(0, 6).map((q) => q.id).sort((a, b) => a - b)).toEqual([7, 8, 9, 10, 16, 17]);
    expect(picked.slice(6).every((q) => mastered.has(q.id))).toBe(true);
    expect(pickStepQuestions('logic', bank, new Set())).toHaveLength(5);
  });
});

describe('roadmap content', () => {
  const stepIds = Object.keys(ROADMAP_STEPS) as StepId[];

  it('uses every step in at least one path, with no repeats inside a path', () => {
    for (const id of stepIds) expect(pathForStep(id), id).toBeDefined();
    for (const path of ROADMAP_PATHS) expect(new Set(path.steps).size, path.id).toBe(path.steps.length);
  });

  it('has a title and description for every path and step in every language', () => {
    for (const locale of LOCALES) {
      setActiveLocale(locale);
      for (const path of ROADMAP_PATHS) {
        expect(t(`path.${path.id}.title`).length, `${path.id} (${locale})`).toBeGreaterThan(3);
        expect(t(`path.${path.id}.desc`).length, `${path.id} (${locale})`).toBeGreaterThan(10);
      }
      for (const id of stepIds) {
        expect(t(`step.${id}.title`).length, `${id} (${locale})`).toBeGreaterThan(2);
        expect(t(`step.${id}.desc`).length, `${id} (${locale})`).toBeGreaterThan(10);
      }
    }
    setActiveLocale('ar');
    expect(t('path.web.title')).not.toBe('Web developer');
  });

  it('points every step that is not waiting for a new question pack at real questions', async () => {
    const { questions } = await loadQuestionBanks();
    // These categories are added by separate question packs; their steps stay hidden until then.
    const upcoming: StepId[] = ['dsa', 'sql', 'ai_fundamentals', 'llms', 'prompt_engineering'];
    for (const id of stepIds) {
      if (upcoming.includes(id) && stepQuestions(id, questions).length === 0) continue;
      expect(stepQuestions(id, questions).length, id).toBeGreaterThanOrEqual(4);
    }
  });

  it('stores an English mode label and translates it for the history table', () => {
    expect(roadmapMode('plsql')).toBe('Roadmap: plsql');
    expect(parseRoadmapMode('Roadmap: plsql')).toBe('plsql');
    expect(parseRoadmapMode('Roadmap: nothing')).toBeNull();
    expect(parseRoadmapMode('Standard Mixed Exam')).toBeNull();
    expect(displayMode('Roadmap: sql')).toBe('Roadmap: SQL & databases');
    setActiveLocale('ar');
    expect(displayMode('Roadmap: sql')).toBe('خارطة التعلّم: SQL وقواعد البيانات');
  });

  it('shows attempts saved under a merged step as the step that replaced it', () => {
    expect(parseRoadmapMode('Roadmap: databases')).toBe('sql');
    expect(displayMode('Roadmap: databases')).toBe('Roadmap: SQL & databases');
  });
});
