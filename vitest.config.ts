import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'tests/**/*.test.{js,ts,tsx}',
      'composables/**/*.test.{js,ts,tsx}',
      'server/**/*.test.{js,ts,tsx}',
      'components/**/*.test.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      '.nuxt',
      '.output',
      'coverage'
    ],
    testTimeout: 10000,
    typecheck: {
      enabled: false
    },
    deps: {
      inline: ['pinia']
    }
  },
  esbuild: {
    target: 'node18'
  },
  define: {
    'process.env.NODE_ENV': '"test"'
  }
})