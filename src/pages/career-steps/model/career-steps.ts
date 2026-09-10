import {
  action,
  atom,
  computed,
  effect,
  withAbort,
  withAsync,
  wrap,
} from '@reatom/core';
import { filter, flatten, map, pipe } from 'es-toolkit/fp';

import { clientApi } from '@/shared/api';
import { session } from '@/shared/auth';

import { createdStepScrollAction } from '../lib/created-step-scroll';
import {
  type CareerStepListCursor,
  type CareerStepSort,
  DEFAULT_CAREER_STEP_SORT,
} from './list-query';
import type { CareerStep } from './schema';

export const careerSteps = atom<ReadonlyArray<CareerStep> | null>(
  null,
  'careerSteps',
);

export const careerStepsCursor = atom<CareerStepListCursor | null>(
  null,
  'careerStepsCursor',
);

export const hasNextCareerStepsPage = computed(
  () => careerStepsCursor() !== null,
  'hasNextCareerStepsPage',
);

export const careerStepsQuery = atom('', 'careerStepsQuery');

export const careerStepsSort = atom<CareerStepSort>(
  DEFAULT_CAREER_STEP_SORT,
  'careerStepsSort',
);

export const createdCareerStepId = atom<string | null>(
  null,
  'createdCareerStepId',
);

export const careerStep = atom<CareerStep | null>(null, 'careerStep');

export const initCareerStep = action((nextCareerStep: CareerStep | null) => {
  careerStep.set(nextCareerStep);
}, 'initCareerStep');

export const initCareerSteps = action(
  (page: {
    items: ReadonlyArray<CareerStep>;
    nextCursor: CareerStepListCursor | null;
  }) => {
    careerSteps.set(page.items);
    careerStepsCursor.set(page.nextCursor);
  },
  'initCareerSteps',
);

export const loadCareerSteps = async () => {
  if (!session.data()?.user) return;

  const page = await wrap(
    clientApi.loadCareerSteps({
      query: careerStepsQuery(),
      sort: careerStepsSort(),
    }),
  );

  initCareerSteps(page);
};

export const resetCareerSteps = action(() => {
  careerSteps.set(null);
  careerStepsCursor.set(null);
  careerStepsQuery.set('');
  careerStepsSort.set(DEFAULT_CAREER_STEP_SORT);
  createdCareerStepId.set(null);
  careerStep.set(null);
}, 'resetCareerSteps');

export const addToCareerSteps = action((step: CareerStep) => {
  careerSteps.set(pipe([careerSteps() ?? [], [step]], flatten()));
}, 'addToCareerSteps');

export const updateInCareerSteps = action((nextStep: CareerStep) => {
  const replaceStep = (step: CareerStep) =>
    step.id === nextStep.id ? nextStep : step;

  careerSteps.set(pipe(careerSteps() ?? [], map(replaceStep)));

  if (careerStep()?.id === nextStep.id) {
    careerStep.set(nextStep);
  }
}, 'updateInCareerSteps');

export const removeFromCareerSteps = action((stepId: string) => {
  const isOtherStep = (step: CareerStep) => step.id !== stepId;

  careerSteps.set(pipe(careerSteps() ?? [], filter(isOtherStep)));
}, 'removeFromCareerSteps');

export const restoreToCareerSteps = action(
  ({ step, atIndex }: { step: CareerStep; atIndex: number }) => {
    careerSteps.set((careerSteps() ?? []).toSpliced(atIndex, 0, step));
  },
  'restoreToCareerSteps',
);

export const refetchCareerSteps = action(async () => {
  try {
    const page = await wrap(
      clientApi.loadCareerSteps({
        query: careerStepsQuery(),
        sort: careerStepsSort(),
      }),
    );

    initCareerSteps(page);
  } catch {
    return;
  }
}, 'refetchCareerSteps').extend(withAbort(), withAsync());

export const loadMoreCareerSteps = action(async () => {
  const cursor = careerStepsCursor();
  if (!cursor) return;

  try {
    const page = await wrap(
      clientApi.loadCareerSteps({
        query: careerStepsQuery(),
        sort: careerStepsSort(),
        cursor,
      }),
    );

    careerSteps.set([...(careerSteps() ?? []), ...page.items]);
    careerStepsCursor.set(page.nextCursor);
  } catch {
    return;
  }
}, 'loadMoreCareerSteps').extend(withAsync());

export const requestScrollToCreatedCareerStep = action((stepId: string) => {
  createdCareerStepId.set(stepId);
}, 'requestScrollToCreatedCareerStep');

export const clearCreatedCareerStepScroll = action(() => {
  createdCareerStepId.set(null);
}, 'clearCreatedCareerStepScroll');

export const createdCareerStepScrollAction = action(() => {
  return createdStepScrollAction({
    scrollToId: createdCareerStepId(),
    itemIds: (careerSteps() ?? []).map((step) => step.id),
    status: {
      isFetching: !refetchCareerSteps.ready(),
      hasNextPage: hasNextCareerStepsPage(),
      isFetchingNextPage: !loadMoreCareerSteps.ready(),
    },
  });
}, 'createdCareerStepScrollAction');

effect(() => {
  if (!session.ready()) return;
  if (session.data()?.user) return;
  if (careerSteps() === null) return;

  resetCareerSteps();
}, 'resetCareerStepsWhenSignedOut');
