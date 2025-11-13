// Simple test setup without Nuxt dependencies
import { vi } from 'vitest'

// Mock process.env
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Global test setup
global.console = {
  ...global.console,
  // Suppress console outputs during tests if needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}