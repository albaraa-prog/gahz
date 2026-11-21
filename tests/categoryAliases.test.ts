import { describe, expect, it } from 'vitest';
import { currentCategories, currentCategory, mergeCategoryStats } from '../src/services/categoryAliases';
import { parseAttempt } from '../src/services/history';
import { parseCustomConfig } from '../src/services/preferences';
import { listCategories, loadQuestionBanks, parseQuestion } from '../src/services/questionLoader';

const MERGED = ['Fullstack', 'CS & Networks', 'SQL', 'Databases'];

describe('merged categories', () => {
  it('maps the old names to the category that replaced them', () => {
    expect(currentCategory('Fullstack')).toBe('Fullstack Web Dev');
    expect(currentCategory('CS & Networks')).toBe('Computer Networking & Protocols');
    expect(currentCategory('SQL')).toBe('SQL & Databases');
    expect(currentCategory('Databases')).toBe('SQL & Databases');
    expect(currentCategory('Python')).toBe('Python');
    expect(currentCategory('toString')).toBe('toString');
  });

  it('no longer has the old names in the question bank, and every replacement exists', async () => {
    const { questions } = await loadQuestionBanks();
    const categories = listCategories(questions);
    for (const old of MERGED) {
      expect(categories, old).not.toContain(old);
      expect(categories, old).toContain(currentCategory(old));
    }
  });

  it('keeps the question ids of the merged banks', async () => {
    const { questions } = await loadQuestionBanks();
    const ids = (bank: string): number[] => questions.filter((q) => q.bank === bank).map((q) => q.id);
    expect(ids('fullstack')).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);
    expect(ids('cs-networks')).toEqual([81, 82, 83, 84, 85, 86, 87, 88, 89, 90]);
    expect(ids('databases')).toEqual([71, 72, 73, 74, 75, 76, 77, 78, 79, 80]);
    expect(ids('sql')).toEqual(Array.from({ length: 20 }, (_, i) => 346 + i));
  });

  it('keeps a saved custom quiz selection, without repeats', () => {
    const config = parseCustomConfig({ count: 10, minutes: 10, categories: ['SQL', 'Databases', 'Python', 'Fullstack'] });
    expect(config.categories).toEqual(['SQL & Databases', 'Python', 'Fullstack Web Dev']);
    expect(currentCategories([])).toEqual([]);
    expect(parseCustomConfig({ count: 10, minutes: 10, categories: null }).categories).toBeNull();
  });

  it('adds up the per-category scores of an attempt saved before the merge', () => {
    const attempt = parseAttempt({
      id: 'a1',
      timestamp: 1,
      date: '',
      mode: 'SQL & Databases',
      totalQuestions: 6,
      correct: 4,
      percent: 67,
      categoryStats: [
        { category: 'SQL', total: 3, correct: 2 },
        { category: 'Python', total: 1, correct: 1 },
        { category: 'Databases', total: 2, correct: 1 },
      ],
    });
    expect(attempt?.categoryStats).toEqual([
      { category: 'SQL & Databases', total: 5, correct: 3 },
      { category: 'Python', total: 1, correct: 1 },
    ]);
    const stats = [{ category: 'SQL', total: 1, correct: 1 }];
    mergeCategoryStats(stats);
    expect(stats).toEqual([{ category: 'SQL', total: 1, correct: 1 }]);
  });

  it('renames the category of a question in a quiz saved for resuming', () => {
    const saved = { id: 91, category: 'Fullstack', question: 'Q?', options: ['a', 'b', 'c', 'd'], correctAnswer: 0, explanation: 'E' };
    expect(parseQuestion(saved, 'fullstack')?.category).toBe('Fullstack Web Dev');
  });
});
