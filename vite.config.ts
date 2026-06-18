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
  },
  test: {
    // The sim core is pure TS and runs headless under Node.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
