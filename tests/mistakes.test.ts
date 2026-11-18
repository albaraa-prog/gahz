import { afterEach, describe, expect, it } from 'vitest';
import { MISTAKES_MODE, mistakeQuestionIds, mistakeQuestions } from '../src/services/mistakes';
import { displayMode } from '../src/services/presets';
import { loadQuestionBanks } from '../src/services/questionLoader';
import { categoryLabel, parseQuestionText, questionDirection, questionText, registerTranslations } from '../src/services/questionText';
import type { Attempt, AttemptAnswer, Question } from '../src/types';
import { formatLine } from '../src/utils/helpers';
import { setActiveLocale } from '../src/utils/i18n';
import { state } from '../src/utils/state';

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

const question = (id: number, options = ['a', 'b', 'c', 'd']): Question => ({
  id,
  category: 'Databases',
  difficulty: 'easy',
  question: `Question number ${id}?`,
  options,
  correctAnswer: 0,
  explanation: 'Because.',
  bank: 'databases',
});

afterEach(() => {
  setActiveLocale('en');
  state.locale = 'en';
  state.allQuestions = [];
});

describe('practice my mistakes', () => {
  it('collects wrong answers, most recent first', () => {
    const history = [attempt(2, [answer(7, false), answer(8, true)]), attempt(1, [answer(5, false), answer(6, false)])];
    expect(mistakeQuestionIds(history)).toEqual([7, 6, 5]);
  });

  it('drops a question once it is answered correctly, and brings it back if missed again', () => {
    const wrongThenRight = [attempt(1, [answer(5, false)]), attempt(2, [answer(5, true)])];
    expect(mistakeQuestionIds(wrongThenRight)).toEqual([]);
    expect(mistakeQuestionIds([...wrongThenRight, attempt(3, [answer(5, false)])])).toEqual([5]);
  });

  it('ignores skipped questions and attempts without per-question detail', () => {
    const history = [
      attempt(1, [answer(5, false)]),
      attempt(2, [answer(5, false, null), answer(9, false, null)]),
      { ...attempt(3, []), answers: undefined },
    ];
    expect(mistakeQuestionIds(history)).toEqual([5]);
  });

  it('keeps only mistakes that still exist in the bank', () => {
    const history = [attempt(1, [answer(5, false), answer(404, false)])];
    expect(mistakeQuestions(history, [question(5), question(6)]).map((q) => q.id)).toEqual([5]);
  });

  it('translates its mode label in the history table', () => {
    expect(displayMode(MISTAKES_MODE)).toBe('Practice my mistakes');
    setActiveLocale('ar');
    expect(displayMode(MISTAKES_MODE)).toBe('تدرّب على أخطائي');
  });
});

describe('Arabic question text', () => {
  const arabic = { question: 'سؤال؟', options: ['أ', 'ب', 'ج', 'د'], explanation: 'لأن.' };

  it('shows the bank text in English and the translation in Arabic', () => {
    registerTranslations({ 9001: arabic });
    const q = question(9001);
    state.allQuestions = [q];
    expect(questionText(q)).toBe(q);
    expect(questionDirection(q)).toBe('ltr');

    state.locale = 'ar';
    expect(questionText(q)).toEqual(arabic);
    expect(questionDirection(q)).toBe('rtl');
    expect(questionText(question(9002))).toMatchObject({ question: 'Question number 9002?' });
  });

  it('keeps each translated option with its English option when a quiz reorders them', () => {
    registerTranslations({ 9003: arabic });
    state.allQuestions = [question(9003)];
    state.locale = 'ar';
    const shuffled = { ...question(9003, ['c', 'a', 'd', 'b']), correctAnswer: 1 };
    expect(questionText(shuffled).options).toEqual(['ج', 'أ', 'د', 'ب']);
  });

  it('rejects malformed translations', () => {
    expect(parseQuestionText(arabic)).toEqual(arabic);
    expect(parseQuestionText({ ...arabic, options: ['أ', 'ب', 'ج'] })).toBeNull();
    expect(parseQuestionText({ ...arabic, question: '' })).toBeNull();
    expect(parseQuestionText(null)).toBeNull();
  });

  it('translates category names for display only', () => {
    expect(categoryLabel('Databases')).toBe('Databases');
    state.locale = 'ar';
    expect(categoryLabel('Databases')).toBe('قواعد البيانات');
    expect(categoryLabel('Unknown topic')).toBe('Unknown topic');
  });

  it('has an Arabic name for every category that is not a language name', async () => {
    const { questions } = await loadQuestionBanks();
    state.locale = 'ar';
    const untranslated = [...new Set(questions.map((q) => q.category))].filter((c) => categoryLabel(c) === c);
    expect(untranslated.sort()).toEqual(['C#', 'Java', 'JavaScript', 'PHP', 'PL/SQL', 'Python', 'SQL', 'Spring Boot']);
  });

  it('keeps code-only options left to right inside Arabic content', () => {
    expect(formatLine('O(n log n)', true)).toBe('<span dir="ltr">O(n log n)</span>');
    expect(formatLine('يرمي `TypeError`', true)).toBe('<span dir="rtl">يرمي <code>TypeError</code></span>');
    expect(formatLine('O(n log n)', false)).toBe('O(n log n)');
  });
});
