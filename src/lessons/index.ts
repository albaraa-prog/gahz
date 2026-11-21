/**
 * The interactive lessons, in the order they are listed on the home screen.
 *
 * To add a lesson: create a file next to this one that exports a `Lesson`
 * (see types.ts and CONTRIBUTING.md), then add it to the list below.
 * `npm test` checks every lesson, and runs each code exercise's solution
 * against its tests.
 */

import { bigOBinarySearch } from './big-o-binary-search';
import { conditionsLoops } from './conditions-loops';
import { dockerFirstContainer } from './docker-first-container';
import { gitContributeToGahz } from './git-contribute-to-gahz';
import { githubActionsCi } from './github-actions-ci';
import { jsFunctionsArrays } from './js-functions-arrays';
import { jsVariables } from './js-variables';
import { pythonListsDicts } from './python-lists-dicts';
import { pythonWithAiAssistant } from './python-with-ai-assistant';
import { sqlFirstQueries } from './sql-first-queries';
import type { Lesson } from './types';
import { vibeCodingSafely } from './vibe-coding-safely';

export const LESSONS: readonly Lesson[] = [
  jsVariables,
  conditionsLoops,
  jsFunctionsArrays,
  bigOBinarySearch,
  pythonListsDicts,
  sqlFirstQueries,
  gitContributeToGahz,
  githubActionsCi,
  dockerFirstContainer,
  pythonWithAiAssistant,
  vibeCodingSafely,
];
