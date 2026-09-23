import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@hsmkit/crypto-tools': new URL('../crypto-tools/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
