/** Opening, stepping through and leaving a lesson. The view is components/lessonScreen.ts. */

import type { Lesson } from '../lessons/types';
import { state, store } from '../utils/state';
import { advanceProgress, findLesson, lessonStatus, loadLessonProgress, saveLessonProgress } from './lessons';

export function initLessons(): void {
  state.lessonProgress = loadLessonProgress();
}

export function currentLesson(): Lesson | undefined {
  return findLesson(state.lessonId);
}

/** Opens a lesson where the learner left off, or from the start once it has been finished. */
export function openLesson(id: string, returnTo: 'home' | 'roadmap' = 'home'): void {
  const lesson = findLesson(id);
  if (!lesson) return;
  const status = lessonStatus(lesson, state.lessonProgress);
  store.set({
    lessonId: lesson.id,
    lessonStep: status.completed ? 0 : status.reached,
    lessonReturn: returnTo,
    screen: 'lesson',
  });
}

/** Moves to a step and records how far the learner has got. */
export function goToLessonStep(index: number): void {
  const lesson = currentLesson();
  if (!lesson) return;
  const target = Math.max(0, Math.min(index, lesson.steps.length));
  const progress = advanceProgress(state.lessonProgress, lesson, target);
  if (progress !== state.lessonProgress) saveLessonProgress(progress);
  store.set({ lessonStep: target, lessonProgress: progress });
}

export function closeLesson(): void {
  state.screen = state.lessonReturn;
}
