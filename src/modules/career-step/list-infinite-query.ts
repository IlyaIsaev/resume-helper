import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { listCareerSteps } from './functions';
import {
  CAREER_STEP_PAGE_SIZE,
  type CareerStepListCursor,
  type CareerStepSort,
  careerStepListInfiniteQueryKey,
} from './list-query';
import { toCareerStep } from './schema';

export function careerStepListInfiniteQueryOptions(
  query: string,
  sort: CareerStepSort,
) {
  return infiniteQueryOptions({
    queryKey: careerStepListInfiniteQueryKey(query, sort),
    queryFn: async ({ pageParam }) => {
      const page = await listCareerSteps({
        data: {
          query,
          sort,
          cursor: pageParam,
          limit: CAREER_STEP_PAGE_SIZE,
        },
      });

      return {
        items: page.items.map(toCareerStep),
        nextCursor: page.nextCursor,
      };
    },
    initialPageParam: null as CareerStepListCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}
