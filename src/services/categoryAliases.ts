/**
 * Categories that were merged into another one.
 *
 * Question ids never change, so the roadmap, "Practice my mistakes" and the
 * per-question answers in the history are not affected by a merge. Category
 * names, however, are also stored on the device and in the account: in the
 * custom quiz settings, in the per-category scores of finished attempts and in
 * a quiz that is saved for resuming. Those are mapped to the current name when
 * they are read, so nothing a user saved before a merge is lost.
 *
 * To merge a category: change `category` in its bank file(s) and add the old
 * name here.
 */

import type { CategoryStat } from '../types';

const MERGED_CATEGORIES: Readonly<Record<string, string>> = {
  Fullstack: 'Fullstack Web Dev',
  'CS & Networks': 'Computer Networking & Protocols',
  SQL: 'SQL & Databases',
  Databases: 'SQL & Databases',
};

/** The name a category goes by today. Unknown and current names are returned as they are. */
export function currentCategory(category: string): string {
  return Object.hasOwn(MERGED_CATEGORIES, category) ? (MERGED_CATEGORIES[category] ?? category) : category;
}

/** A saved category selection with merged names replaced and repeats removed. */
export function currentCategories(categories: readonly string[]): string[] {
  return [...new Set(categories.map(currentCategory))];
}

/** Per-category scores under today's names; rows that now share a name are added up. */
export function mergeCategoryStats(stats: readonly CategoryStat[]): CategoryStat[] {
  const merged = new Map<string, CategoryStat>();
  for (const stat of stats) {
    const category = currentCategory(stat.category);
    const existing = merged.get(category);
    if (existing) {
      existing.total += stat.total;
      existing.correct += stat.correct;
    } else {
      merged.set(category, { category, total: stat.total, correct: stat.correct });
    }
  }
  return [...merged.values()];
}
