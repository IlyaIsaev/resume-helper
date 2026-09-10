import { reatomComponent } from '@reatom/react';

import { HOME_PATH } from '@/shared/config';

import { ThemeSwitcher } from './theme-switcher';
import { UserMenu } from './user-menu';

export const Header = reatomComponent(() => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <a
        href={HOME_PATH}
        className="text-xs tracking-[2px] uppercase text-muted-foreground"
      >
        Resume Helper
      </a>
      <div className="flex items-center gap-2">
        <UserMenu />
        <ThemeSwitcher />
      </div>
    </header>
  );
}, 'Header');
