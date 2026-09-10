import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/shared/ui';

import {
  isDarkTheme,
  themeSwitcherLabel,
  toggleTheme,
} from '../model/theme-switcher';

export const ThemeSwitcher = reatomComponent(() => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={themeSwitcherLabel()}
      onClick={wrap(toggleTheme)}
    >
      {isDarkTheme() ? <Sun /> : <Moon />}
    </Button>
  );
}, 'ThemeSwitcher');
