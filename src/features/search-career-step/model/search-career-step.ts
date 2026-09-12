import { action, sleep, withAbort, wrap } from '@reatom/core';

import { careerStepsQuery, refetchCareerSteps } from '@/entities/career-step';

export const searchCareerSteps = action(async (query: string) => {
  careerStepsQuery.set(query);

  await wrap(sleep(300));

  await wrap(refetchCareerSteps());
}, 'searchCareerSteps').extend(withAbort());

export const changeCareerStepsQuery = action(
  (event: { target: { value: string } }) => {
    searchCareerSteps(event.target.value);
  },
  'changeCareerStepsQuery',
);
