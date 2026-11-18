import { describe, expect, it } from 'vitest';
import { buildAttemptAnswers, computeStats, gradeQuiz, shuffleOptions, verdictFor } from '../src/services/scoring';
import type { Attempt, Question } from '../src/types';

const question = (id: number, category: string, correctAnswer: number): Question => ({
  id,
  category,
  difficulty: 'medium',
  question: `Question ${id}?`,
  options: ['a', 'b', 'c', 'd'],
  correctAnswer,
  explanation: 'Because.',
  bank: 'test',
});

const attempt = (id: string, timestamp: number, percent: number): Attempt => ({
  id,
  timestamp,
  date: '',
  mode: 'test',
  totalQuestions: 10,
  correct: percent / 10,
  percent,
});

describe('gradeQuiz', () => {
  it('counts correct answers overall and per category, treating skipped as wrong', () => {
    const questions = [question(1, 'SQL', 0), question(2, 'SQL', 1), question(3, 'APIs', 2), question(4, 'APIs', 3)];
    const report = gradeQuiz(questions, { 1: 0, 2: 3, 3: 2 });

    expect(report).toMatchObject({ total: 4, correct: 2, percent: 50, verdict: 'junior' });
    expect(report.categoryStats).toEqual([
      { category: 'SQL', total: 2, correct: 1 },
      { category: 'APIs', total: 2, correct: 1 },
    ]);
  });

  it('handles an empty quiz', () => {
    expect(gradeQuiz([], {})).toMatchObject({ total: 0, correct: 0, percent: 0 });
  });
});

describe('verdictFor', () => {
  it('uses the 70 and 50 percent thresholds', () => {
    expect([verdictFor(70), verdictFor(69), verdictFor(50), verdictFor(49)]).toEqual(['pass', 'junior', 'junior', 'fail']);
  });
});

describe('computeStats', () => {
  const day = 24 * 60 * 60 * 1000;
  const now = new Date('2026-11-15T12:00:00').getTime();

  it('computes totals and streaks from attempt days', () => {
    const history = [
      attempt('a', now, 80),
      attempt('b', now - day, 60),
      attempt('c', now - 2 * day, 40),
      attempt('d', now - 5 * day, 100),
      attempt('legacy', 0, 20),
    ];
    expect(computeStats(history, now)).toEqual({
      totalAttempts: 5,
      bestPercent: 100,
      averagePercent: 60,
      currentStreak: 3,
      longestStreak: 3,
      lastAttemptAt: now,
    });
  });

  it('keeps the streak alive through the next day, then resets', () => {
    const history = [attempt('a', now - day, 80), attempt('b', now - 2 * day, 80)];
    expect(computeStats(history, now).currentStreak).toBe(2);
    expect(computeStats(history, now + day).currentStreak).toBe(0);
  });
});

describe('shuffleOptions', () => {
  /** Deterministic generator so the shuffle is repeatable. */
  const seeded = (seed: number) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  it('keeps the same options and still points at the right answer', () => {
    const original = { ...question(1, 'SQL', 1), options: ['w', 'right', 'y', 'z'] };
    for (let seed = 1; seed <= 50; seed++) {
      const shuffled = shuffleOptions(original, seeded(seed));
      expect(shuffled.options.slice().sort()).toEqual(['right', 'w', 'y', 'z']);
      expect(shuffled.options[shuffled.correctAnswer]).toBe('right');
      expect(shuffled.optionOrder?.map((index) => original.options[index])).toEqual(shuffled.options);
    }
    expect(original.options).toEqual(['w', 'right', 'y', 'z']);
  });

  it('spreads the correct answer across every position', () => {
    const random = seeded(7);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(shuffleOptions(question(1, 'SQL', 1), random).correctAnswer);
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });

  it('leaves options such as "None of these" in place', () => {
    const original = { ...question(1, 'Logic', 3), options: ['x', 'y', 'z', 'None of these'] };
    for (let seed = 1; seed <= 30; seed++) {
      const shuffled = shuffleOptions(original, seeded(seed));
      expect(shuffled.options[3]).toBe('None of these');
      expect(shuffled.correctAnswer).toBe(3);
    }
  });

  it('records history answers by their position in the bank file', () => {
    const original = { ...question(1, 'SQL', 1), options: ['w', 'right', 'y', 'z'] };
    const shuffled = shuffleOptions(original, seeded(3));
    const shownWrong = shuffled.options.indexOf('z');
    const [wrong] = buildAttemptAnswers([shuffled], { 1: shownWrong }, {});
    expect(wrong).toMatchObject({ selected: 3, correct: false });
    const [right] = buildAttemptAnswers([shuffled], { 1: shuffled.correctAnswer }, {});
    expect(right).toMatchObject({ selected: 1, correct: true });
  });
});
