import {
  action,
  atom,
  computed,
  reatomBoolean,
  withAsync,
  wrap,
} from '@reatom/core';
import { findIndex, pipe } from 'es-toolkit/fp';

import { clientApi } from '@/shared/api';
import { toast } from '@/shared/ui';

import {
  careerSteps,
  careerStepsQuery,
  refetchCareerSteps,
  removeFromCareerSteps,
  restoreToCareerSteps,
} from './career-steps';
import type { CareerStep } from './schema';

export const deletedCareerStepId = atom<string | null>(
  null,
  'deletedCareerStepId',
);

export const isDeleteCareerStepDialogOpen = reatomBoolean(
  false,
  'isDeleteCareerStepDialogOpen',
);

const hasCareerStepId =
  (stepId: string) =>
  (step: CareerStep): boolean =>
    step.id === stepId;

export const closeDeleteCareerStepDialog = action(() => {
  isDeleteCareerStepDialogOpen.setFalse();

  deletedCareerStepId.set(null);
}, 'closeDeleteCareerStepDialog');

export const openDeleteCareerStep = action((stepId: string) => {
  deletedCareerStepId.set(stepId);

  isDeleteCareerStepDialogOpen.setTrue();
}, 'openDeleteCareerStep');

export const setDeleteCareerStepDialogOpen = action(
  (stepId: string, shouldOpen: boolean) => {
    if (shouldOpen) {
      openDeleteCareerStep(stepId);

      return;
    }

    closeDeleteCareerStepDialog();
  },
  'setDeleteCareerStepDialogOpen',
);

export const isCareerStepDeleteDialogOpen = (stepId: string): boolean =>
  isDeleteCareerStepDialogOpen() && deletedCareerStepId() === stepId;

export const deleteCareerStep = action(async () => {
  const stepId = deletedCareerStepId();
  if (!stepId) return;

  const index = pipe(careerSteps() ?? [], findIndex(hasCareerStepId(stepId)));
  const step = (careerSteps() ?? [])[index];
  const isSearchEmpty = careerStepsQuery().length === 0;

  closeDeleteCareerStepDialog();

  if (isSearchEmpty && step) {
    removeFromCareerSteps(stepId);
  }

  try {
    await wrap(clientApi.deleteCareerStep(stepId));
  } catch {
    if (isSearchEmpty && step !== undefined) {
      restoreToCareerSteps({ step, atIndex: index });
    }

    toast.error(
      `Could not delete career step “${step?.position ?? 'career step'}”.`,
    );

    return;
  }

  toast.success(
    `Career step “${step?.position ?? 'career step'}” was deleted.`,
  );

  await wrap(refetchCareerSteps());
}, 'deleteCareerStep').extend(withAsync());

export const deleteCareerStepConfirmLabel = computed(() => {
  if (!deleteCareerStep.ready()) return 'Deleting';

  return 'Delete';
}, 'deleteCareerStepConfirmLabel');
