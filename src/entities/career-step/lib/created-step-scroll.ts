export type CreatedStepScrollAction =
  | { type: 'idle' }
  | { type: 'wait' }
  | { type: 'fetchNext' }
  | { type: 'scroll'; index: number };

export const createdStepScrollAction = ({
  scrollToId,
  itemIds,
  status,
}: {
  scrollToId: string | null;
  itemIds: ReadonlyArray<string>;
  status: {
    isFetching: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
}): CreatedStepScrollAction => {
  if (scrollToId === null) return { type: 'idle' };

  const index = itemIds.indexOf(scrollToId);
  if (index >= 0) return { type: 'scroll', index };
  if (status.isFetching || status.isFetchingNextPage) return { type: 'wait' };
  if (status.hasNextPage) return { type: 'fetchNext' };
  return { type: 'wait' };
};
