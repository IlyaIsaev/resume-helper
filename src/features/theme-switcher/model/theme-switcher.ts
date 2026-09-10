import { action, computed } from '@reatom/core';

import { ThemeMode, theme } from '@/shared/theme';

export const isDarkTheme = computed(
  () => theme() === ThemeMode.dark,
  'isDarkTheme',
);

export const themeSwitcherLabel = computed(() => {
  if (isDarkTheme()) return 'Switch to light theme';

  return 'Switch to dark theme';
}, 'themeSwitcherLabel');

export const toggleTheme = action(() => {
  theme.set((themeMode) =>
    themeMode === ThemeMode.dark ? ThemeMode.light : ThemeMode.dark,
  );
}, 'toggleTheme');
