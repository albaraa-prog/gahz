/**
 * Learning roadmap: ordered paths made of steps, each step a set of question
 * categories.
 *
 * Like "Practice my mistakes", nothing extra is stored. Progress is derived
 * from the per-question answers kept with each attempt, so it counts answers
 * from every kind of quiz, works for guests, follows the account through the
 * normal history sync and is reset by "Clear history".
 *
 * To add a step: add it to ROADMAP_STEPS and add `step.<id>.title` and
 * `step.<id>.desc` to both dictionaries in utils/i18n.ts.
 * To add a path: add it to ROADMAP_PATHS and add `path.<id>.title` and
 * `path.<id>.desc`. TypeScript reports any text that is missing.
 */

import type { Attempt, Question } from '../types';
import { randomSample } from '../utils/helpers';

/** step id -> the question categories it covers. A step can be used by several paths. */
export const ROADMAP_STEPS = {
  basics: ['Programming Basics'],
  fundamentals: ['CS & Programming Fundamentals'],
  logic: ['Logic & IQ'],
  systems: ['General Computer Science & Advanced Systems'],
  javascript: ['JavaScript'],
  fullstack: ['Fullstack Web Dev', 'Fullstack'],
  backend_language: ['Java', 'C#', 'PHP', 'Python'],
  databases: ['Databases'],
  plsql: ['PL/SQL'],
  rest: ['REST & SOAP'],
  apis: ['APIs & Data Integration (REST, GraphQL, WebSockets)'],
  networking: ['CS & Networks', 'Computer Networking & Protocols'],
  flutter_basics: ['Flutter & Dart Fundamentals (Junior to Mid)'],
  flutter_core: ['Flutter & Dart Core Mastery'],
  flutter_architecture: ['Flutter Clean Architecture & Provider'],
  flutter_performance: ['Flutter Performance, Storage & Native Integrations'],
  fintech_security: ['Fintech Mobile Security, QR & Payments'],
  enterprise_backend: ['Oman Enterprise: Backend & ERP Integration', 'Oman Enterprise: Oracle & PostgreSQL'],
  enterprise_operations: ['Oman Enterprise: Incidents & Security Judgment', 'Oman Enterprise: Resilience & Scalability'],
  enterprise_communication: ['Oman Enterprise: Stakeholder Communication'],
  // Categories below arrive with other question packs. A step with no questions
  // in the loaded bank is hidden, and so is a path with no steps left.
  dsa: ['Data Structures & Algorithms'],
  sql: ['SQL'],
  ai_fundamentals: ['AI Fundamentals'],
  llms: ['LLMs & Generative AI'],
  prompt_engineering: ['Prompt Engineering'],
  csharp: ['C#'],
  unity: ['Unity & C# Game Development'],
  backend_frameworks: ['Spring Boot', '.NET & ASP.NET Core', 'Laravel & Modern PHP'],
  networking_fundamentals: ['Networking Fundamentals'],
  job_aptitude: ['Job Test: Aptitude & Reasoning'],
  job_it: ['Job Test: IT & Information Systems'],
  git_github: ['Git & GitHub'],
  cicd: ['CI/CD with GitHub Actions'],
  docker: ['Docker'],
  firebase: ['Firebase'],
  supabase: ['Supabase'],
  netlify: ['Netlify'],
  ai_python: ['AI-Assisted Python'],
  claude_code: ['Claude & Claude Code'],
  vibe_coding: ['Vibe Coding & AI App Builders'],
} as const satisfies Record<string, readonly string[]>;

export type StepId = keyof typeof ROADMAP_STEPS;

export const ROADMAP_PATHS = [
  { id: 'foundations', steps: ['basics', 'fundamentals', 'dsa', 'logic', 'systems'] },
  { id: 'web', steps: ['basics', 'javascript', 'fullstack', 'rest', 'apis', 'sql', 'databases'] },
  {
    id: 'backend',
    steps: ['fundamentals', 'backend_language', 'backend_frameworks', 'sql', 'databases', 'plsql', 'rest', 'apis', 'networking'],
  },
  {
    id: 'mobile',
    steps: ['flutter_basics', 'flutter_core', 'flutter_architecture', 'flutter_performance', 'fintech_security', 'apis'],
  },
  { id: 'ai', steps: ['ai_fundamentals', 'llms', 'prompt_engineering'] },
  { id: 'ai_coding', steps: ['basics', 'ai_python', 'prompt_engineering', 'claude_code', 'vibe_coding', 'git_github'] },
  { id: 'game', steps: ['basics', 'csharp', 'unity', 'dsa', 'logic'] },
  { id: 'devops', steps: ['git_github', 'cicd', 'docker', 'firebase', 'supabase', 'netlify'] },
  { id: 'networks', steps: ['networking_fundamentals', 'networking', 'rest', 'apis'] },
  { id: 'job_test', steps: ['job_aptitude', 'logic', 'job_it', 'networking_fundamentals'] },
  {
    id: 'interview',
    steps: ['logic', 'dsa', 'systems', 'networking', 'enterprise_backend', 'enterprise_operations', 'enterprise_communication'],
  },
] as const satisfies readonly { id: string; steps: readonly StepId[] }[];

export type RoadmapPath = (typeof ROADMAP_PATHS)[number];
export type PathId = RoadmapPath['id'];

/** A step is complete once this share of its questions has been answered correctly. */
export const STEP_DONE_PERCENT = 80;
export const STEP_QUIZ_QUESTIONS = 10;

const MODE_PREFIX = 'Roadmap: ';

/** Stored with the attempt, in English like the preset labels. See presets.displayMode. */
export function roadmapMode(stepId: StepId): string {
  return `${MODE_PREFIX}${stepId}`;
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === 'string' && Object.hasOwn(ROADMAP_STEPS, value);
}

/** The step a stored mode label belongs to, or null for any other kind of quiz. */
export function parseRoadmapMode(mode: string): StepId | null {
  if (!mode.startsWith(MODE_PREFIX)) return null;
  const id = mode.slice(MODE_PREFIX.length);
  return isStepId(id) ? id : null;
}

export function findPath(id: unknown): RoadmapPath | undefined {
  return ROADMAP_PATHS.find((path) => path.id === id);
}

/** The first path that contains a step. Every step belongs to at least one path. */
export function pathForStep(stepId: StepId): RoadmapPath | undefined {
  return ROADMAP_PATHS.find((path) => (path.steps as readonly StepId[]).includes(stepId));
}

/**
 * Ids of the questions whose latest answer was correct. A later wrong answer
 * takes a question out again; a skipped question does not change its status.
 */
export function masteredQuestionIds(history: readonly Attempt[]): Set<number> {
  const oldestFirst = history.slice().sort((a, b) => a.timestamp - b.timestamp);
  const mastered = new Set<number>();
  for (const attempt of oldestFirst) {
    for (const answer of attempt.answers ?? []) {
      if (answer.correct) mastered.add(answer.questionId);
      else if (answer.selected !== null) mastered.delete(answer.questionId);
    }
  }
  return mastered;
}

export function stepQuestions(stepId: StepId, all: readonly Question[]): Question[] {
  const categories: readonly string[] = ROADMAP_STEPS[stepId];
  return all.filter((question) => categories.includes(question.category));
}

export interface StepProgress {
  id: StepId;
  total: number;
  mastered: number;
  percent: number;
  done: boolean;
}

export function stepProgress(stepId: StepId, all: readonly Question[], mastered: ReadonlySet<number>): StepProgress {
  const questions = stepQuestions(stepId, all);
  const count = questions.filter((question) => mastered.has(question.id)).length;
  const percent = questions.length === 0 ? 0 : Math.floor((count / questions.length) * 100);
  return { id: stepId, total: questions.length, mastered: count, percent, done: percent >= STEP_DONE_PERCENT };
}

export interface PathProgress {
  /** Steps that have questions in the loaded bank, in path order. */
  steps: StepProgress[];
  done: number;
  percent: number;
  /** The first step that is not complete yet, or null when the path is finished. */
  next: StepId | null;
}

export function pathProgress(path: RoadmapPath, all: readonly Question[], mastered: ReadonlySet<number>): PathProgress {
  const steps = path.steps.map((id) => stepProgress(id, all, mastered)).filter((step) => step.total > 0);
  const done = steps.filter((step) => step.done).length;
  // Each step counts up to its completion mark, so a finished path reads 100%.
  const share = steps.reduce((sum, step) => sum + Math.min(1, step.percent / STEP_DONE_PERCENT), 0);
  return {
    steps,
    done,
    percent: steps.length === 0 ? 0 : Math.floor((share / steps.length) * 100),
    next: steps.find((step) => !step.done)?.id ?? null,
  };
}

/** Questions for one step quiz: the ones not answered correctly yet come first. */
export function pickStepQuestions(
  stepId: StepId,
  all: readonly Question[],
  mastered: ReadonlySet<number>,
  random: () => number = Math.random,
): Question[] {
  const questions = stepQuestions(stepId, all);
  const fresh = questions.filter((question) => !mastered.has(question.id));
  const known = questions.filter((question) => mastered.has(question.id));
  const picked = [...randomSample(fresh, fresh.length, random), ...randomSample(known, known.length, random)];
  return picked.slice(0, STEP_QUIZ_QUESTIONS);
}
