import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { collectionOptions, useDbClient } from '@tanstack/react-db';
import type { QueryClient } from '@tanstack/react-query';
import {
  createCareerStep,
  deleteCareerStep,
  updateCareerStep,
} from './functions';
import { careerStepListQueryKeyRoot } from './list-query';
import { type CareerStep, careerStepToFormValues } from './schema';

export const careerStepCollection = collectionOptions(
  'career-steps',
  (client) => {
    const queryClient = client.requireDependency<QueryClient>('queryClient');

    async function invalidateCareerStepList() {
      await queryClient.invalidateQueries({
        queryKey: careerStepListQueryKeyRoot,
      });
    }

    return queryCollectionOptions({
      id: 'career-steps',
      queryKey: ['career-steps', 'collection'],
      queryClient,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      queryFn: async () => [] as CareerStep[],
      getKey: (item) => item.id,
      onInsert: async ({ transaction }) => {
        const { modified } = transaction.mutations[0];
        await createCareerStep({
          data: {
            id: modified.id,
            ...careerStepToFormValues(modified),
          },
        });
        await invalidateCareerStepList();
      },
      onUpdate: async ({ transaction }) => {
        const { original, modified } = transaction.mutations[0];
        await updateCareerStep({
          data: {
            id: original.id,
            ...careerStepToFormValues(modified),
          },
        });
        await invalidateCareerStepList();
      },
      onDelete: async ({ transaction }) => {
        const { original } = transaction.mutations[0];
        await deleteCareerStep({ data: { id: original.id } });
        await invalidateCareerStepList();
      },
    });
  },
);

export function useCareerStepCollection() {
  return useDbClient().collection(careerStepCollection);
}

export async function ensureCareerStepInCollection(
  collection: ReturnType<typeof useCareerStepCollection>,
  step: CareerStep,
) {
  await collection.preload();
  if (collection.get(step.id)) return;
  collection.utils.writeUpsert(step);
}

export async function persistCareerStepMutation(tx: {
  isPersisted: { promise: Promise<unknown> };
}) {
  await tx.isPersisted.promise;
}

export type { CareerStep };
