export type CreatedStepScrollAction =
  | { type: 'idle' }
  | { type: 'wait' }
  | { type: 'fetchNext' }
  | { type: 'scroll'; index: number };

export function createdStepScrollAction(
  scrollToId: string | null,
  itemIds: readonly string[],
  status: {
    isFetching: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  },
): CreatedStepScrollAction {
  if (scrollToId === null) return { type: 'idle' };

  const index = itemIds.indexOf(scrollToId);
  if (index >= 0) return { type: 'scroll', index };
  if (status.isFetching || status.isFetchingNextPage) return { type: 'wait' };
  if (status.hasNextPage) return { type: 'fetchNext' };
  return { type: 'wait' };
}
