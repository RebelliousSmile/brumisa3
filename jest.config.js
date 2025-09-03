export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  setupFilesAfterEnv: ['./tests/setup-jest.ts'],
  testMatch: [
    '**/tests/**/*.jest.{js,ts}',
    '**/tests/**/*.test.jest.{js,ts}'
  ],
  moduleNameMapping: {
    '^~/(.*)$': '<rootDir>/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  },
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    '!server/**/*.test.{js,ts}',
    '!server/**/*.spec.{js,ts}',
    '!**/node_modules/**',
    '!**/.nuxt/**',
    '!**/.output/**'
  ]
}