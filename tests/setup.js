// Setup global pour les tests Jest
const { TextEncoder, TextDecoder } = require('util');

// Polyfills pour Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock des variables d'environnement
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Configuration globale des timeouts
jest.setTimeout(10000);

// Mock des modules externes si nécessaire
global.console = {
  ...console,
  // Masque les logs pendant les tests sauf les erreurs
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};