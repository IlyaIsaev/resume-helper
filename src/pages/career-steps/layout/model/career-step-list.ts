import { action, atom, computed, effect, wrap } from '@reatom/core';

import {
  careerSteps,
  careerStepsQuery,
  careerStepsSort,
  clearCreatedCareerStepScroll,
  createdCareerStepId,
  createdCareerStepScrollAction,
  hasNextCareerStepsPage,
  isCareerStepSort,
  loadMoreCareerSteps,
  refetchCareerSteps,
} from '@/entities/career-step';

import { searchCareerSteps } from './career-step-search';

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

export const changeCareerStepsQuery = action(
  (event: { target: { value: string } }) => {
    searchCareerSteps(event.target.value);
  },
  'changeCareerStepsQuery',
);

export const changeCareerStepsSort = action((value: string) => {
  if (!isCareerStepSort(value)) return;

  careerStepsSort.set(value);

  void wrap(refetchCareerSteps());
}, 'changeCareerStepsSort');

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
    const lastItem = virtualItems[virtualItems.length - 1];
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
  if (scrollAction.type === 'fetchNext') {
    void wrap(loadMoreCareerSteps());

    return;
  }

  if (scrollAction.type !== 'scroll') return;
  if (careerStepListViewportHeight() === 0) return;

  const scroller = careerStepListScroller();
  if (!scroller) return;

  const { index } = scrollAction;

  scroller.scrollToIndex(index, { align: 'start' });

  await wrap(
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        wrap(resolve)();
      });
    }),
  );

  scroller.scrollToIndex(index, { align: 'start' });
  clearCreatedCareerStepScroll();
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
