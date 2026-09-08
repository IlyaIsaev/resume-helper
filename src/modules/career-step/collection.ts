import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { collectionOptions, useDbClient } from '@tanstack/react-db';
import type { QueryClient } from '@tanstack/react-query';
import {
  createCareerStep,
  deleteCareerStep,
  listCareerSteps,
  updateCareerStep,
} from './functions';
import {
  type CareerStep,
  careerStepFromFormValues,
  careerStepToFormValues,
  toCareerStep,
} from './schema';

export const careerStepCollection = collectionOptions(
  'career-steps',
  (client) =>
    queryCollectionOptions({
      id: 'career-steps',
      queryKey: ['career-steps'],
      queryClient: client.requireDependency<QueryClient>('queryClient'),
      queryFn: async () => {
        const steps = await listCareerSteps();
        return steps.map(toCareerStep);
      },
      getKey: (item) => item.id,
      onInsert: async ({ transaction }) => {
        const { modified } = transaction.mutations[0];
        await createCareerStep({
          data: {
            id: modified.id,
            ...careerStepToFormValues(modified),
          },
        });
      },
      onUpdate: async ({ transaction }) => {
        const { original, modified } = transaction.mutations[0];
        await updateCareerStep({
          data: {
            id: original.id,
            ...careerStepToFormValues(modified),
          },
        });
      },
      onDelete: async ({ transaction }) => {
        const { original } = transaction.mutations[0];
        await deleteCareerStep({ data: { id: original.id } });
      },
    }),
);

export function useCareerStepCollection() {
  return useDbClient().collection(careerStepCollection);
}

export async function persistCareerStepMutation(tx: {
  isPersisted: { promise: Promise<unknown> };
}) {
  await tx.isPersisted.promise;
}

export type { CareerStep };
