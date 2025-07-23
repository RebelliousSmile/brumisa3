// Configuration globale pour Jest
// Forcer NODE_ENV=test AVANT de charger la config
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test', override: true });

// Polyfills pour Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill pour setImmediate (requis par Express/Node.js)
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock du logger pour éviter les erreurs pendant les tests
jest.mock('../src/utils/logManager', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  logRequest: jest.fn((req, res, next) => next())
}));

// Mock global robuste pour fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn().mockResolvedValue(),
    mkdir: jest.fn().mockResolvedValue(),
    stat: jest.fn().mockResolvedValue({ size: 1024000 }),
    unlink: jest.fn().mockResolvedValue(),
    copyFile: jest.fn().mockResolvedValue()
  }
}));

// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Mock global pour Alpine.js
global.Alpine = {
  store: jest.fn(() => ({
    requeteApi: jest.fn(),
    ajouterMessage: jest.fn(),
    config: { apiUrl: '/api' },
    utilisateur: null,
    messages: []
  }))
};

// Mock global pour window
if (typeof window === 'undefined') {
  global.window = {};
}

// Configuration de window.location seulement si nécessaire
if (!window.location || !window.location.origin) {
  const testOrigin = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3076}`;
  Object.defineProperty(window, 'location', {
    value: {
      origin: testOrigin,
      href: testOrigin
    },
    writable: true,
    configurable: true
  });
}

// Mock fetch global
global.fetch = jest.fn();

// Mock Navigator API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  }
});

// Variables globales pour les tests
global.APP_DATA = {
  utilisateur: null,
  systemes: {
    'monsterhearts': { nom: 'Monsterhearts' },
    'engrenages': { nom: 'Engrenages' },
    'metro2033': { nom: 'Metro 2033' },
    'mistengine': { nom: 'Mist Engine' }
  }
};

// Reset des mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});