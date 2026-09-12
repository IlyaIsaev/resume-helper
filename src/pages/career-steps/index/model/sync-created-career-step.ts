import { action, withCallHook, wrap } from '@reatom/core';

import {
  addToCareerSteps,
  careerStepsQuery,
  refetchCareerSteps,
  requestScrollToCreatedCareerStep,
} from '@/entities/career-step';
import { careerStepCreated } from '@/features/create-career-step';
import type { CareerStep } from '@/shared/api';

const syncCreatedCareerStep = action(async (created: CareerStep) => {
  if (careerStepsQuery().length === 0) {
    addToCareerSteps(created);
  }

  requestScrollToCreatedCareerStep(created.id);

  await wrap(refetchCareerSteps());
}, 'syncCreatedCareerStep');

careerStepCreated.extend(
  withCallHook((created) => {
    void wrap(syncCreatedCareerStep(created));
  }),
);
