// Configuration globale pour Jest
require('dotenv').config({ path: '.env.test' });

// Polyfills pour Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// Mock global pour window - seulement si pas déjà défini
if (!window.location) {
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3076',
      href: 'http://localhost:3076'
    },
    writable: true
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