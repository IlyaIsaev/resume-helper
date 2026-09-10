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
    files: ['./src/pages/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/app/**'],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    files: ['./src/features/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/repetitive-naming': 'off',
    },
  },
  {
    files: ['./src/features/career-steps/update-career-step/**'],
    rules: {
      'fsd/forbidden-imports': 'off',
    },
  },
]);
