import { action, atom, computed, effect, wrap } from '@reatom/core';
import { last } from 'es-toolkit';
import { findIndex, pipe } from 'es-toolkit/fp';

import {
  careerSteps,
  careerStepsQuery,
  clearCreatedCareerStepScroll,
  createdCareerStepId,
  createdCareerStepScrollAction,
  hasNextCareerStepsPage,
  loadMoreCareerSteps,
  refetchCareerSteps,
} from './career-steps';

export type CareerStepListScroller = {
  scrollToIndex: (index: number, options: { align: 'start' }) => void;
};

export const careerStepsEmptyMessage = (query: string): string => {
  if (query.trim().length === 0) return 'No career steps yet.';

  return 'No career steps match your search.';
};

export const shouldLoadMoreCareerSteps = ({
  lastVisibleIndex,
  itemCount,
  hasNextPage,
  isFetchingNextPage,
}: {
  lastVisibleIndex: number;
  itemCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}): boolean => {
  if (itemCount === 0) return false;
  if (lastVisibleIndex < 0) return false;
  if (lastVisibleIndex < itemCount - 1) return false;
  if (!hasNextPage) return false;
  if (isFetchingNextPage) return false;

  return true;
};

export const careerStepsEmptyCopy = computed(
  () => careerStepsEmptyMessage(careerStepsQuery()),
  'careerStepsEmptyCopy',
);

export const lastVisibleCareerStepIndex = atom(
  -1,
  'lastVisibleCareerStepIndex',
);

export const careerStepListViewportHeight = atom(
  0,
  'careerStepListViewportHeight',
);

export const careerStepListScroller = atom<CareerStepListScroller | null>(
  null,
  'careerStepListScroller',
);

export const setCareerStepListViewportHeight = action((height: number) => {
  careerStepListViewportHeight.set(height);
}, 'setCareerStepListViewportHeight');

export const bindCareerStepListScroller = action(
  (scroller: CareerStepListScroller | null) => {
    careerStepListScroller.set(scroller);
  },
  'bindCareerStepListScroller',
);

export const reportCareerStepListVirtualizer = action(
  (instance: { getVirtualItems: () => ReadonlyArray<{ index: number }> }) => {
    const virtualItems = instance.getVirtualItems();
    const lastItem = last(virtualItems);
    if (lastItem === undefined) {
      lastVisibleCareerStepIndex.set(-1);

      return;
    }

    lastVisibleCareerStepIndex.set(lastItem.index);
  },
  'reportCareerStepListVirtualizer',
);

export const maybeLoadMoreCareerSteps = action(() => {
  const shouldLoad = shouldLoadMoreCareerSteps({
    lastVisibleIndex: lastVisibleCareerStepIndex(),
    itemCount: (careerSteps() ?? []).length,
    hasNextPage: hasNextCareerStepsPage(),
    isFetchingNextPage: !loadMoreCareerSteps.ready(),
  });
  if (!shouldLoad) return;

  void wrap(loadMoreCareerSteps());
}, 'maybeLoadMoreCareerSteps');

export const applyCreatedCareerStepScroll = action(async () => {
  const scrollAction = createdCareerStepScrollAction();

  switch (scrollAction.type) {
    case 'idle':
    case 'wait':
      return;
    case 'fetchNext':
      void wrap(loadMoreCareerSteps());
      return;
    case 'scroll': {
      if (careerStepListViewportHeight() === 0) return;

      const scroller = careerStepListScroller();
      if (!scroller) return;

      const scrollToId = createdCareerStepId();
      if (scrollToId === null) return;

      const { index } = scrollAction;

      scroller.scrollToIndex(index, { align: 'start' });

      await wrap(
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            wrap(resolve)();
          });
        }),
      );

      if (createdCareerStepId() !== scrollToId) return;

      const nextIndex = pipe(
        careerSteps() ?? [],
        findIndex((step) => step.id === scrollToId),
      );
      if (nextIndex < 0) {
        clearCreatedCareerStepScroll();
        return;
      }

      scroller.scrollToIndex(nextIndex, { align: 'start' });
      clearCreatedCareerStepScroll();
      return;
    }
  }
}, 'applyCreatedCareerStepScroll');

effect(() => {
  lastVisibleCareerStepIndex();
  careerSteps();
  hasNextCareerStepsPage();
  loadMoreCareerSteps.ready();
  maybeLoadMoreCareerSteps();
}, 'maybeLoadMoreCareerStepsWhenVisibleEnd');

effect(() => {
  createdCareerStepId();
  careerSteps();
  careerStepListViewportHeight();
  careerStepListScroller();
  refetchCareerSteps.ready();
  loadMoreCareerSteps.ready();
  hasNextCareerStepsPage();
  void wrap(applyCreatedCareerStepScroll());
}, 'createdCareerStepScrollWhenListChanges');
