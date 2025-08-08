module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Patterns de tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/models/**/*.test.js'  // Support legacy
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/fixtures/'
  ],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!src/app.js',                    // Point d'entrée
    '!src/database/migrations/**',    // Scripts SQL
    '!src/database/seed.js',          // Données test
    '!src/scripts/**',                // Scripts utilitaires
    '!**/node_modules/**'
  ],
  
  // Seuils de couverture strictes selon TODO.md (Phase 5)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Exigences par composant critique
    'src/models/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Alias et résolution modules
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuration reporters
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Brumisater Test Results',
      outputPath: 'coverage/test-report.html',
      includeFailureMsg: true
    }]
  ],
  
  // Couverture détaillée
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  coverageDirectory: 'coverage',
  
  // Timeouts Windows-friendly
  testTimeout: 15000,
  maxWorkers: '50%',  // Performance Windows
  
  // Gestion erreurs async
  detectOpenHandles: true,
  forceExit: true
};