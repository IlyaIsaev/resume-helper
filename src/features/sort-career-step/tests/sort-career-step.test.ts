import { expect, test } from 'vitest';

import { DEFAULT_CAREER_STEP_SORT } from '@/entities/career-step';

import {
  careerStepsSortFromSearchParam,
  careerStepsSortToSearchParam,
} from '../model/sort-career-step';

test('should keep startedOn sorts and fall back to newest when the search param is missing or invalid', () => {
  expect(careerStepsSortFromSearchParam('startedOn-asc')).toBe('startedOn-asc');
  expect(careerStepsSortFromSearchParam('startedOn-desc')).toBe(
    'startedOn-desc',
  );
  expect(careerStepsSortFromSearchParam(undefined)).toBe(
    DEFAULT_CAREER_STEP_SORT,
  );
  expect(careerStepsSortFromSearchParam('')).toBe(DEFAULT_CAREER_STEP_SORT);
  expect(careerStepsSortFromSearchParam('position-asc')).toBe(
    DEFAULT_CAREER_STEP_SORT,
  );
});

test('should omit newest from the search param and keep oldest', () => {
  expect(careerStepsSortToSearchParam('startedOn-desc')).toBeUndefined();
  expect(careerStepsSortToSearchParam('startedOn-asc')).toBe('startedOn-asc');
});
