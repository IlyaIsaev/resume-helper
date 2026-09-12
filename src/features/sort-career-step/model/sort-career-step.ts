import { action, wrap } from '@reatom/core';

import {
  careerStepsSort,
  clearCreatedCareerStepScroll,
  isCareerStepSort,
  refetchCareerSteps,
} from '@/entities/career-step';

export const changeCareerStepsSort = action((value: string) => {
  if (!isCareerStepSort(value)) return;

  careerStepsSort.set(value);
  clearCreatedCareerStepScroll();

  void wrap(refetchCareerSteps());
}, 'changeCareerStepsSort');
