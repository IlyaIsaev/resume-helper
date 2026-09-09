import { expect, test } from 'vitest';
import { createdStepScrollAction } from '../created-step-scroll';

const idleStatus = {
  isFetching: false,
  hasNextPage: false,
  isFetchingNextPage: false,
};

test('does nothing without a created step id', () => {
  expect(createdStepScrollAction(null, ['a'], idleStatus)).toEqual({
    type: 'idle',
  });
});

test('scrolls to the created step once it is loaded', () => {
  expect(createdStepScrollAction('b', ['a', 'b', 'c'], idleStatus)).toEqual({
    type: 'scroll',
    index: 1,
  });
});

test('waits while the list is refetching or paging', () => {
  expect(
    createdStepScrollAction('missing', ['a'], {
      isFetching: true,
      hasNextPage: true,
      isFetchingNextPage: false,
    }),
  ).toEqual({ type: 'wait' });
  expect(
    createdStepScrollAction('missing', ['a'], {
      isFetching: false,
      hasNextPage: true,
      isFetchingNextPage: true,
    }),
  ).toEqual({ type: 'wait' });
});

test('loads the next page when the created step is not in the loaded items', () => {
  expect(
    createdStepScrollAction('missing', ['a'], {
      isFetching: false,
      hasNextPage: true,
      isFetchingNextPage: false,
    }),
  ).toEqual({ type: 'fetchNext' });
});

test('waits when the created step is not in the loaded items yet', () => {
  expect(createdStepScrollAction('missing', ['a'], idleStatus)).toEqual({
    type: 'wait',
  });
});
