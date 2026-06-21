import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Capacitor serves the built web app from a file:// origin, so relative asset
// paths are required for the Android/iOS shells.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
    // three.js is inherently large; it lives in its own cacheable vendor chunk and is
    // lazy-loaded (App lazy-imports the render layer), so it's off the initial parse path.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          return 'vendor';
        },
      },
    },
  },
  test: {
    // The sim core is pure TS and runs headless under Node.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
