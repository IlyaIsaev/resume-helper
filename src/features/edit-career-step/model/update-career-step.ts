import {
  action,
  atom,
  computed,
  reatomForm,
  urlAtom,
  withCallHook,
  wrap,
} from '@reatom/core';

import {
  careerStep,
  careerStepSchema,
  careerStepToFormValues,
  EMPTY_CAREER_STEP_VALUES,
  initCareerStep,
  reatomCareerDateRange,
  refetchCareerSteps,
  updateInCareerSteps,
} from '@/entities/career-step';
import { clientApi } from '@/shared/api';
import { HOME_PATH } from '@/shared/config';
import { toast } from '@/shared/ui';

export const updatedCareerStepId = atom<string | null>(
  null,
  'updatedCareerStepId',
);

export const closeUpdateCareerStepDialog = action(() => {
  urlAtom.go(HOME_PATH);
}, 'closeUpdateCareerStepDialog');

export const setUpdateCareerStepDialogOpen = action((shouldOpen: boolean) => {
  if (shouldOpen) return;

  closeUpdateCareerStepDialog();
}, 'setUpdateCareerStepDialogOpen');

export const updateCareerStepForm = reatomForm(EMPTY_CAREER_STEP_VALUES, {
  name: 'updateCareerStepForm',
  validateOnBlur: true,
  validateOnChange: true,
  schema: careerStepSchema,
  onSubmit: async (value) => {
    const step = careerStep();
    if (!step) return;

    const previousPosition = step.position;
    const previous = step;

    updateInCareerSteps({
      ...step,
      position: value.position,
      startedOn: value.dates.from,
      endedOn: value.dates.to || null,
      description: value.description,
      technologies: value.technologies,
    });

    try {
      const updated = await wrap(
        clientApi.updateCareerStep(step.id, {
          position: value.position,
          dates: value.dates,
          description: value.description,
          technologies: value.technologies,
        }),
      );

      updateInCareerSteps(updated);

      toast.success(`Career step “${previousPosition}” was updated.`);

      await wrap(refetchCareerSteps());

      return updated;
    } catch {
      updateInCareerSteps(previous);

      toast.error(`Could not update career step “${previousPosition}”.`);
    }
  },
});

export const initUpdateCareerStepForm = action(() => {
  const step = careerStep();
  if (!step) return;

  updatedCareerStepId.set(step.id);

  updateCareerStepForm.reset(careerStepToFormValues(step));
}, 'initUpdateCareerStepForm');

export const loadEditCareerStep = async (stepId: string) => {
  const step = await wrap(clientApi.loadCareerStep(stepId));
  if (!step) return null;

  initCareerStep(step);
  initUpdateCareerStepForm();

  return step;
};

export const updateCareerStepDateParts = reatomCareerDateRange({
  fromField: updateCareerStepForm.fields.dates.from,
  toField: updateCareerStepForm.fields.dates.to,
  name: 'updateCareerStepDateParts',
});

export const isUpdateCareerStepSubmitDisabled = computed(() => {
  if (!updateCareerStepForm.submit.ready()) return true;
  if (updateCareerStepForm.validation().errors.length > 0) return true;
  if (!updateCareerStepForm.focus().dirty) return true;

  return false;
}, 'isUpdateCareerStepSubmitDisabled');

export const updateCareerStepSubmitLabel = computed(() => {
  if (!updateCareerStepForm.submit.ready()) return 'Updating';

  return 'Update career step';
}, 'updateCareerStepSubmitLabel');

updateCareerStepForm.submit.onFulfill.extend(
  withCallHook(({ payload: updated }) => {
    if (!updated) return;

    closeUpdateCareerStepDialog();
  }),
);
