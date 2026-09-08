import { DbClient } from '@tanstack/react-db';
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routerWithDbClient } from '@tanstack/react-router-with-db';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });
  const dbClient = new DbClient({ queryClient });

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      dbClient,
    },
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return routerWithDbClient(router, dbClient);
}
