import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      reportOnFailure: true,
      reporter: ['html'],
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.module.ts'],
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite(),
  ],
});
