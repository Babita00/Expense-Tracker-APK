/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the built bundle works from the file:// style
  // origin an Android WebView serves it from.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The default `forks` pool cannot spawn workers on this machine; threads
    // starts reliably and the suite has no cross-file shared state.
    pool: 'threads',
  },
})
