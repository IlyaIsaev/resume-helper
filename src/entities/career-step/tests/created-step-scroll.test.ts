import { expect, test } from 'vitest';
import { createdStepScrollAction } from '../lib/created-step-scroll';

const IDLE_STATUS = {
  isFetching: false,
  hasNextPage: false,
  isFetchingNextPage: false,
} as const;

test('does nothing without a created step id', () => {
  expect(
    createdStepScrollAction({
      scrollToId: null,
      itemIds: ['a'],
      status: IDLE_STATUS,
    }),
  ).toEqual({
    type: 'idle',
  });
});

test('scrolls to the created step once it is loaded', () => {
  expect(
    createdStepScrollAction({
      scrollToId: 'b',
      itemIds: ['a', 'b', 'c'],
      status: IDLE_STATUS,
    }),
  ).toEqual({
    type: 'scroll',
    index: 1,
  });
});

test('waits while the list is refetching or paging', () => {
  expect(
    createdStepScrollAction({
      scrollToId: 'missing',
      itemIds: ['a'],
      status: {
        isFetching: true,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    }),
  ).toEqual({ type: 'wait' });
  expect(
    createdStepScrollAction({
      scrollToId: 'missing',
      itemIds: ['a'],
      status: {
        isFetching: false,
        hasNextPage: true,
        isFetchingNextPage: true,
      },
    }),
  ).toEqual({ type: 'wait' });
});

test('loads the next page when the created step is not in the loaded items', () => {
  expect(
    createdStepScrollAction({
      scrollToId: 'missing',
      itemIds: ['a'],
      status: {
        isFetching: false,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    }),
  ).toEqual({ type: 'fetchNext' });
});

test('waits when the created step is not in the loaded items yet', () => {
  expect(
    createdStepScrollAction({
      scrollToId: 'missing',
      itemIds: ['a'],
      status: IDLE_STATUS,
    }),
  ).toEqual({
    type: 'wait',
  });
});
