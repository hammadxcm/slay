import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: true,
    minify: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
    noExternal: ['picocolors'],
  },
  {
    entry: ['src/api.ts'],
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: false,
    minify: true,
    dts: true,
    noExternal: ['picocolors'],
  },
]);
