/**
 * Interactive lessons: short, hands-on walkthroughs made of steps.
 *
 * A lesson is plain data. Each step is either a short explanation or an
 * exercise the learner has to get right before moving on. All prose is written
 * in both languages next to each other, so a lesson cannot ship half
 * translated. Code, and answers that are code or program output, are written
 * once as plain strings.
 */

import type { StepId } from '../services/roadmap';
import type { Locale } from '../utils/i18n';

/** Prose in every interface language. Supports **bold** and `inline code`. */
export type Localized = Record<Locale, string>;

/** Language-neutral text (code, output) or prose in both languages. */
export type Text = string | Localized;

interface StepBase {
  /** What the learner reads first: the explanation or the task. */
  text: Localized;
  /** A read-only code sample shown under the text. */
  code?: string;
}

interface ExerciseBase extends StepBase {
  /** A nudge shown on request, without giving the answer away. */
  hint: Localized;
  /** Shown once the exercise is solved: why the answer is the answer. */
  explain: Localized;
}

/** Reading only. */
export interface ExplainStep extends StepBase {
  kind: 'explain';
}

/** Pick one option, for example "what does this print?". */
export interface ChoiceStep extends ExerciseBase {
  kind: 'choice';
  options: readonly Text[];
  /** Index of the correct option. Options are shuffled when shown. */
  answer: number;
}

/** Fill the gaps in a code template from a bank of tokens. */
export interface BlankStep extends ExerciseBase {
  kind: 'blank';
  /** Code with one `___` (three underscores) per gap. */
  template: string;
  /** The token for each gap, in order. */
  answers: readonly string[];
  /** Wrong tokens mixed in with the right ones. */
  distractors: readonly string[];
}

/** Put shuffled lines of code back in order. */
export interface OrderStep extends ExerciseBase {
  kind: 'order';
  /** The lines in their correct order. There must be only one correct order. */
  lines: readonly string[];
}

export interface CodeTest {
  /** A JavaScript expression evaluated after the learner's code, such as `sum([1, 2])`. */
  call: string;
  /** The value it must produce. Compared as JSON. */
  expect: unknown;
}

/** Write JavaScript that runs in the browser and has to pass the tests. */
export interface CodeStep extends ExerciseBase {
  kind: 'code';
  /** What the editor starts with. */
  starter: string;
  /** A reference answer. The test suite runs it against `tests`. */
  solution: string;
  tests: readonly CodeTest[];
}

export type LessonStep = ExplainStep | ChoiceStep | BlankStep | OrderStep | CodeStep;
export type ExerciseStep = Exclude<LessonStep, ExplainStep>;

export interface Lesson {
  /** Stable id, kebab-case. Progress is stored under it. */
  id: string;
  /** Short label of the technology, shown as a tag. Not translated. */
  tag: string;
  title: Localized;
  summary: Localized;
  minutes: number;
  /** Roadmap steps this lesson belongs to. It is offered on each of them. */
  roadmapSteps: readonly StepId[];
  steps: readonly LessonStep[];
}
