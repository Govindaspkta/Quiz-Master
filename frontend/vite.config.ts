/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

// Emergency import
const react = require('@vitejs/plugin-react')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react.default ? react.default() : react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})