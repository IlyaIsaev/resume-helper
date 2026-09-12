import {
  action,
  computed,
  withChangeHook,
  withSearchParams,
} from '@reatom/core';

import {
  type CareerStepSort,
  careerSteps,
  careerStepsSort,
  clearCreatedCareerStepScroll,
  DEFAULT_CAREER_STEP_SORT,
  isCareerStepSort,
} from '@/entities/career-step';
import { CAREER_STEPS_PATH } from '@/shared/config';

export const CAREER_STEPS_SORT_SEARCH_KEY = 'sort' as const;

export const careerStepsSortFromSearchParam = (
  value?: string,
): CareerStepSort =>
  isCareerStepSort(value) ? value : DEFAULT_CAREER_STEP_SORT;

export const careerStepsSortToSearchParam = (
  value: CareerStepSort,
): string | undefined =>
  value === DEFAULT_CAREER_STEP_SORT ? undefined : value;

careerStepsSort.extend(
  withSearchParams(CAREER_STEPS_SORT_SEARCH_KEY, {
    parse: careerStepsSortFromSearchParam,
    serialize: careerStepsSortToSearchParam,
    path: `${CAREER_STEPS_PATH}/*`,
  }),
  withChangeHook(() => {
    if (careerSteps() === null) return;

    clearCreatedCareerStepScroll();
  }),
);

export const nextCareerStepSort = (sort: CareerStepSort): CareerStepSort =>
  sort === DEFAULT_CAREER_STEP_SORT
    ? 'startedOn-asc'
    : DEFAULT_CAREER_STEP_SORT;

export const careerStepsSortButtonLabel = computed(() => {
  if (careerStepsSort() === DEFAULT_CAREER_STEP_SORT)
    return 'Sort oldest first';

  return 'Sort newest first';
}, 'careerStepsSortButtonLabel');

export const careerStepsSortTooltip = computed(() => {
  if (careerStepsSort() === DEFAULT_CAREER_STEP_SORT) return 'Newest first';

  return 'Oldest first';
}, 'careerStepsSortTooltip');

export const toggleCareerStepsSort = action(() => {
  careerStepsSort.set(nextCareerStepSort);
}, 'toggleCareerStepsSort');
