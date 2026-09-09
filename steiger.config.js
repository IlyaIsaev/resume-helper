import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ['**/routeTree.gen.ts', '**/*.test.ts', '**/*.test.tsx'],
  },
  {
    files: ['./src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
  {
    files: ['./src/app/routes/**'],
    rules: {
      'fsd/no-reserved-folder-names': 'off',
    },
  },
]);
