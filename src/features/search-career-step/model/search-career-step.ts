import {
  action,
  atom,
  sleep,
  withAbort,
  withChangeHook,
  withInit,
  withSearchParams,
  wrap,
} from '@reatom/core';

import { careerStepsQuery } from '@/entities/career-step';
import { CAREER_STEPS_PATH } from '@/shared/config';

export const CAREER_STEPS_QUERY_SEARCH_KEY = 'q' as const;

export const careerStepsQueryFromSearchParam = (value?: string): string =>
  value ?? '';

export const careerStepsQueryToSearchParam = (
  value: string,
): string | undefined => (value.length === 0 ? undefined : value);

export const careerStepsSearchDraft = atom('', 'careerStepsSearchDraft').extend(
  withInit(() => careerStepsQuery()),
);

careerStepsQuery.extend(
  withSearchParams(CAREER_STEPS_QUERY_SEARCH_KEY, {
    parse: careerStepsQueryFromSearchParam,
    serialize: careerStepsQueryToSearchParam,
    replace: true,
    path: `${CAREER_STEPS_PATH}/*`,
  }),
  withChangeHook((query) => {
    careerStepsSearchDraft.set(query);
  }),
);

export const searchCareerSteps = action(async (query: string) => {
  careerStepsSearchDraft.set(query);

  await wrap(sleep(300));

  if (careerStepsSearchDraft() !== query) return;

  careerStepsQuery.set(query);
}, 'searchCareerSteps').extend(withAbort());

export const changeCareerStepsQuery = action(
  (event: { target: { value: string } }) => {
    searchCareerSteps(event.target.value);
  },
  'changeCareerStepsQuery',
);
