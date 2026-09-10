import { reatomComponent } from '@reatom/react';

import { theme } from '@/shared/theme';
import { Toaster } from '@/shared/ui';

import { APP_ROUTE } from './routes';

export const App = reatomComponent(() => {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col">
        {APP_ROUTE.root.render()}
      </main>
      <Toaster theme={theme()} />
    </div>
  );
}, 'App');
