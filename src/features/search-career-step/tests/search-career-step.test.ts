import { expect, test } from 'vitest';

import {
  careerStepsQueryFromSearchParam,
  careerStepsQueryToSearchParam,
} from '../model/search-career-step';

test('should keep the query and fall back to blank when the search param is missing', () => {
  expect(careerStepsQueryFromSearchParam('billing')).toBe('billing');
  expect(careerStepsQueryFromSearchParam(undefined)).toBe('');
  expect(careerStepsQueryFromSearchParam('')).toBe('');
});

test('should omit a blank query from the search param and keep text', () => {
  expect(careerStepsQueryToSearchParam('')).toBeUndefined();
  expect(careerStepsQueryToSearchParam('billing')).toBe('billing');
});
