import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
  },
  {
    files: ['./src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
  {
    files: ['./src/features', './src/features/**'],
    rules: {
      'fsd/repetitive-naming': 'off',
    },
  },
  {
    files: ['./src/features/create-career-step/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/features/delete-career-step/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/features/search-career-step/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/entities/career-step/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
]);
