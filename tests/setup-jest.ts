// Jest test setup
import { jest } from '@jest/globals'

// Mock process.env
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Global Jest setup
global.console = {
  ...global.console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}