import { expect, test } from 'vitest';

import {
  careerStepsEmptyMessage,
  shouldLoadMoreCareerSteps,
} from '../model/career-step-list';

test('should show the empty list copy when search is blank', () => {
  expect(careerStepsEmptyMessage('')).toBe('No career steps yet.');
  expect(careerStepsEmptyMessage('   ')).toBe('No career steps yet.');
});

test('should show the search miss copy when search has text', () => {
  expect(careerStepsEmptyMessage('engineer')).toBe(
    'No career steps match your search.',
  );
});

test('should not load more when the list is empty or the last row is not visible', () => {
  expect(
    shouldLoadMoreCareerSteps({
      lastVisibleIndex: -1,
      itemCount: 0,
      hasNextPage: true,
      isFetchingNextPage: false,
    }),
  ).toBe(false);
  expect(
    shouldLoadMoreCareerSteps({
      lastVisibleIndex: 3,
      itemCount: 10,
      hasNextPage: true,
      isFetchingNextPage: false,
    }),
  ).toBe(false);
});

test('should load more when the last visible row is the last loaded row', () => {
  expect(
    shouldLoadMoreCareerSteps({
      lastVisibleIndex: 9,
      itemCount: 10,
      hasNextPage: true,
      isFetchingNextPage: false,
    }),
  ).toBe(true);
});

test('should not load more when the next page is in flight or missing', () => {
  expect(
    shouldLoadMoreCareerSteps({
      lastVisibleIndex: 9,
      itemCount: 10,
      hasNextPage: true,
      isFetchingNextPage: true,
    }),
  ).toBe(false);
  expect(
    shouldLoadMoreCareerSteps({
      lastVisibleIndex: 9,
      itemCount: 10,
      hasNextPage: false,
      isFetchingNextPage: false,
    }),
  ).toBe(false);
});
