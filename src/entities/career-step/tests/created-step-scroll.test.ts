import { expect, test } from 'vitest';
import { createdStepScrollAction } from '../lib/created-step-scroll';

const IDLE_STATUS = {
  isFetching: false,
  hasNextPage: false,
  isFetchingNextPage: false,
} as const;

test('should stay idle when there is no created step id', () => {
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

test('should scroll to the created step when it is in the loaded items', () => {
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

test('should wait when the list is refetching or paging', () => {
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

test('should load the next page when the created step is not in the loaded items', () => {
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

test('should wait when the created step is not in the loaded items yet', () => {
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
