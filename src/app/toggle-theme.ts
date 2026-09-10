import { action, computed } from '@reatom/core';

import { THEME_MODE, theme } from '@/shared/theme';

export const isDarkTheme = computed(
  () => theme() === THEME_MODE.dark,
  'isDarkTheme',
);

export const themeSwitcherLabel = computed(() => {
  if (isDarkTheme()) return 'Switch to light theme';

  return 'Switch to dark theme';
}, 'themeSwitcherLabel');

export const toggleTheme = action(() => {
  theme.set((themeMode) =>
    themeMode === THEME_MODE.dark ? THEME_MODE.light : THEME_MODE.dark,
  );
}, 'toggleTheme');
