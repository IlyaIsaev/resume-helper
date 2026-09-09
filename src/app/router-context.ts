import type { DbClient } from '@tanstack/react-db';
import type { QueryClient } from '@tanstack/react-query';

export type RouterContext = {
  queryClient: QueryClient;
  dbClient: DbClient;
};
