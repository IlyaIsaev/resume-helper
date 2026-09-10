import { atom, effect, withLocalStorage } from '@reatom/core';
import type { ValueOf } from 'es-toolkit/types';

const THEME_STORAGE_KEY = 'theme' as const;

export const THEME_MODE = {
  light: 'light',
  dark: 'dark',
} as const satisfies Record<string, string>;

export type ThemeMode = ValueOf<typeof THEME_MODE>;

export const theme = atom<ThemeMode>(THEME_MODE.light, 'theme').extend(
  withLocalStorage(THEME_STORAGE_KEY),
);

effect(() => {
  const themeMode = theme();

  document.documentElement.classList.toggle(
    'dark',
    themeMode === THEME_MODE.dark,
  );
}, 'theme.syncDocument');
