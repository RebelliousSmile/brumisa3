const path = require('path');
require('dotenv').config();

const config = {
  // Serveur
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Base de données PostgreSQL
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || 'brumisa3',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? true : false,
    connectionString: process.env.DATABASE_URL || null
  },

  // Sessions
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    name: 'brumisa3',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24h
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  },

  // Codes d'accès
  auth: {
    codes: {
      premium: process.env.CODE_PREMIUM || '123456',
      admin: process.env.CODE_ADMIN || '789012'
    },
    roles: {
      UTILISATEUR: 'UTILISATEUR',
      PREMIUM: 'PREMIUM', 
      ADMIN: 'ADMIN'
    }
  },

  // Répertoires
  directories: {
    data: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
    output: process.env.OUTPUT_DIR || path.join(__dirname, '..', 'output'),
    uploads: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
    logs: process.env.LOG_DIR || path.join(__dirname, '..', 'logs'),
    public: path.join(__dirname, '..', 'public'),
    views: path.join(__dirname, 'views')
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: true,
      filename: 'app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    },
    console: {
      enabled: process.env.NODE_ENV === 'development'
    }
  },

  // Sécurité
  security: {
    rateLimit: {
      windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 min
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"]
        }
      }
    }
  },

  // PDF
  pdf: {
    timeout: parseInt(process.env.PDF_TIMEOUT) || 30000, // 30s
    maxSize: parseInt(process.env.PDF_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
    options: {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    },
    cleanup: {
      maxAge: 24 * 60 * 60 * 1000, // 24h
      interval: 60 * 60 * 1000 // 1h
    }
  },

  // Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },

  // API
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 30000
  }
};

// Validation de l'environnement
if (config.server.env === 'production') {
  if (config.session.secret === 'your-super-secret-session-key-change-in-production') {
    throw new Error('SESSION_SECRET doit être changé en production');
  }
  
  if (config.auth.codes.premium === '123456' || config.auth.codes.admin === '789012') {
    console.warn('⚠️  ATTENTION: Changez les codes d\'accès par défaut en production');
  }
}

module.exports = config;