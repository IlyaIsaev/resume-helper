import { resolve } from 'node:path';

import { cloudflare } from '@cloudflare/vite-plugin';
import { reatom } from '@reatom/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const srcRoot = resolve(import.meta.dirname, 'src');

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
  plugins: [
    reatom(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    cloudflare(),
  ],
  resolve: {
    alias: {
      '@': srcRoot,
      '@/app': resolve(srcRoot, 'app'),
      '@/pages': resolve(srcRoot, 'pages'),
      '@/features': resolve(srcRoot, 'features'),
      '@/entities': resolve(srcRoot, 'entities'),
      '@/shared': resolve(srcRoot, 'shared'),
    },
  },
});
