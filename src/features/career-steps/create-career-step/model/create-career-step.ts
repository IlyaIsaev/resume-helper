import {
  action,
  computed,
  reatomBoolean,
  reatomForm,
  withCallHook,
  wrap,
} from '@reatom/core';

import {
  addToCareerSteps,
  careerStepSchema,
  careerStepsQuery,
  emptyCareerStepValues,
  refetchCareerSteps,
  requestScrollToCreatedCareerStep,
} from '@/entities/career-step';
import { clientApi } from '@/shared/api';
import { toast } from '@/shared/ui';

import { reatomCareerDateRange } from './career-date-part';

export const isCreateCareerStepDialogOpen = reatomBoolean(
  false,
  'isCreateCareerStepDialogOpen',
);

export const openCreateCareerStep = isCreateCareerStepDialogOpen.setTrue;

export const closeCreateCareerStepDialog = action(() => {
  isCreateCareerStepDialogOpen.setFalse();

  createCareerStepForm.reset();
}, 'closeCreateCareerStepDialog');

export const setCreateCareerStepDialogOpen = action((shouldOpen: boolean) => {
  if (shouldOpen) {
    openCreateCareerStep();

    return;
  }

  closeCreateCareerStepDialog();
}, 'setCreateCareerStepDialogOpen');

export const createCareerStepForm = reatomForm(emptyCareerStepValues, {
  name: 'createCareerStepForm',
  validateOnBlur: true,
  validateOnChange: true,
  schema: careerStepSchema,
  onSubmit: async (value) => {
    const id = crypto.randomUUID();

    try {
      return await wrap(
        clientApi.createCareerStep({
          id,
          position: value.position,
          dates: value.dates,
          description: value.description,
          technologies: value.technologies,
        }),
      );
    } catch (error) {
      toast.error(`Could not create career step “${value.position}”.`);

      throw error;
    }
  },
});

const syncCreatedCareerStep = action(
  async (created: {
    id: string;
    position: string;
    startedOn: string;
    endedOn: string | null;
    description: string;
    technologies: string;
    createdAt: string;
  }) => {
    if (careerStepsQuery().length === 0) {
      addToCareerSteps(created);
    }

    requestScrollToCreatedCareerStep(created.id);

    await wrap(refetchCareerSteps());
  },
  'syncCreatedCareerStep',
);

createCareerStepForm.submit.onFulfill.extend(
  withCallHook(({ payload: created }) => {
    if (!created) return;

    closeCreateCareerStepDialog();

    toast.success(`Career step “${created.position}” was created.`);

    void wrap(syncCreatedCareerStep(created));
  }),
);

export const createCareerStepDateParts = reatomCareerDateRange(
  createCareerStepForm.fields.dates.from,
  createCareerStepForm.fields.dates.to,
  'createCareerStepDateParts',
);

export const isCreateCareerStepSubmitDisabled = computed(() => {
  if (!createCareerStepForm.submit.ready()) return true;
  if (createCareerStepForm.validation().errors.length > 0) return true;
  if (!createCareerStepForm.focus().dirty) return true;

  return false;
}, 'isCreateCareerStepSubmitDisabled');

export const createCareerStepSubmitLabel = computed(() => {
  if (!createCareerStepForm.submit.ready()) return 'Saving';

  return 'Save career step';
}, 'createCareerStepSubmitLabel');
