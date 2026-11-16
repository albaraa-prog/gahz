import { describe, expect, it } from 'vitest';
import { mergeAttempts, parseAttempt } from '../src/services/history';
import { PRESETS } from '../src/services/presets';
import { listCategories, loadQuestionBanks, parseQuestion } from '../src/services/questionLoader';
import { parseSavedSession } from '../src/services/quizEngine';
import { formatRichText, initialOf, shortName } from '../src/utils/helpers';

describe('question banks', () => {
  it('loads every bank with no failures', async () => {
    const { questions, failedBanks, skipped } = await loadQuestionBanks();
    expect(failedBanks).toEqual([]);
    expect(skipped).toBe(0);
    expect(questions.length).toBeGreaterThanOrEqual(515);
    expect(listCategories(questions).length).toBeGreaterThanOrEqual(38);
  });

  it('gives every preset enough questions', async () => {
    const { questions } = await loadQuestionBanks();
    for (const preset of PRESETS) {
      expect(preset.pick(questions).length, preset.id).toBeGreaterThanOrEqual(preset.count);
    }
  });

  it('has 20 Oman questions spread evenly over five topics', async () => {
    const { questions } = await loadQuestionBanks();
    const oman = questions.filter((q) => q.bank === 'oman-enterprise');
    const perCategory = new Map<string, number>();
    for (const q of oman) perCategory.set(q.category, (perCategory.get(q.category) ?? 0) + 1);
    expect(oman).toHaveLength(20);
    expect([...perCategory.values()]).toEqual([4, 4, 4, 4, 4]);
  });
});

describe('parseQuestion', () => {
  const valid = {
    id: 1,
    category: 'X',
    difficulty: 'easy',
    question: 'Q?',
    options: ['a', 'b', 'c', 'd'],
    correctAnswer: 2,
    explanation: 'E',
  };

  it('accepts the current shape and the original app shape', () => {
    expect(parseQuestion(valid, 'bank')).toMatchObject({ id: 1, correctAnswer: 2, bank: 'bank' });
    const legacy = {
      id: 7,
      category: 'X',
      isIq: false,
      q: 'Old?',
      code: 'x = 1',
      options: ['a', 'b', 'c', 'd'],
      correct: 0,
      explanation: 'E',
    };
    expect(parseQuestion(legacy, 'saved')).toMatchObject({
      question: 'Old?',
      codeSnippet: 'x = 1',
      correctAnswer: 0,
      difficulty: 'medium',
    });
  });

  it('rejects malformed questions', () => {
    expect(parseQuestion({ ...valid, options: ['a', 'b', 'c'] }, 'b')).toBeNull();
    expect(parseQuestion({ ...valid, correctAnswer: 4 }, 'b')).toBeNull();
    expect(parseQuestion({ ...valid, id: '1' }, 'b')).toBeNull();
    expect(parseQuestion(null, 'b')).toBeNull();
  });
});

describe('stored data recovery', () => {
  const q = { id: 1, category: 'X', q: 'Old?', options: ['a', 'b', 'c', 'd'], correct: 0, explanation: 'E' };

  it('rejects corrupted saved sessions', () => {
    expect(parseSavedSession('garbage')).toBeNull();
    expect(parseSavedSession({ questions: [], secondsRemaining: 10 })).toBeNull();
    expect(parseSavedSession({ questions: [{ id: 1 }], secondsRemaining: 10 })).toBeNull();
    expect(parseSavedSession({ questions: [q], secondsRemaining: 0 })).toBeNull();
  });

  it('repairs recoverable saved sessions, including ones from the original app', () => {
    const session = parseSavedSession({
      questions: [q],
      answers: { 1: 2, 99: 1, 3: 'x' },
      flags: { 1: true },
      currentIdx: 42,
      secondsRemaining: 30.7,
    });
    expect(session).toMatchObject({
      answers: { 1: 2 },
      flags: { 1: true },
      currentIdx: 0,
      secondsRemaining: 30,
      totalSeconds: 30,
      studyMode: true,
    });
  });

  it('migrates history rows from the original app and merges without duplicates', () => {
    const legacy = parseAttempt({ date: '8/12/2026 04:51 PM', mode: 'standard', totalQuestions: 25, correct: 18, percent: 72 });
    expect(legacy).toMatchObject({ timestamp: 0, percent: 72 });
    expect(legacy!.id).toMatch(/^legacy-/);
    expect(parseAttempt({ mode: 'x' })).toBeNull();

    const fresh = parseAttempt({ id: 'n1', timestamp: 5, mode: 'm', totalQuestions: 1, correct: 1, percent: 100 })!;
    expect(mergeAttempts([legacy!, fresh], [fresh]).map((a) => a.id)).toEqual(['n1', legacy!.id]);
  });
});

describe('formatRichText', () => {
  it('escapes HTML before applying bold and code markup', () => {
    expect(formatRichText('Use **<b>** and `a < b`')).toBe('Use <strong>&lt;b&gt;</strong> and <code>a &lt; b</code>');
  });
});

describe('account badge helpers', () => {
  it('finds a visible initial in any script', () => {
    expect(initialOf('albaraa')).toBe('A');
    expect(initialOf('البراء أحمد')).toBe('ا');
    expect(initialOf('  \u200f😀 سارة')).toBe('س');
    expect(initialOf(null, 'user@example.com')).toBe('U');
    expect(initialOf('', null)).toBe('?');
  });

  it('shortens a full name to something readable instead of clipping it', () => {
    expect(shortName('Al-Baraa Al Saadi', 'a@example.com')).toBe('Al-Baraa');
    expect(shortName('البراء بن أحمد السعدي', null)).toBe('البراء');
    expect(shortName('A. Rahman', null)).toBe('A. Rahman');
    expect(shortName(null, 'someone@example.com')).toBe('someone');
    expect(shortName('   ', null)).toBe('');
  });
});
