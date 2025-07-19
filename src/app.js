const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configuration et utilitaires
const config = require('./config');
const logManager = require('./utils/logManager');
const { initializeDatabase, isDatabaseInitialized } = require('./database/init');

class App {
  constructor() {
    this.app = express();
    this.server = null;
    this.isShuttingDown = false;
  }

  /**
   * Initialise l'application Express
   */
  async initialize() {
    try {
      logManager.info('Initialisation de l\'application', {
        env: config.server.env,
        port: config.server.port
      });

      // Vérification et initialisation de la base de données
      await this.initializeDatabase();

      // Configuration de base Express
      this.configureExpress();

      // Middlewares de sécurité
      this.configureSecurityMiddlewares();

      // Middlewares de session et parsing
      this.configureParsingMiddlewares();

      // Configuration des templates
      this.configureTemplates();

      // Middlewares applicatifs
      this.configureApplicationMiddlewares();

      // Routes
      this.configureRoutes();

      // Gestion des erreurs
      this.configureErrorHandling();

      logManager.info('Application initialisée avec succès');

    } catch (error) {
      logManager.error('Erreur initialisation application', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialise la base de données
   */
  async initializeDatabase() {
    try {
      const isInitialized = await isDatabaseInitialized();
      
      if (!isInitialized) {
        logManager.info('Base de données non initialisée - initialisation en cours...');
        await initializeDatabase();
      } else {
        logManager.info('Base de données déjà initialisée');
      }
    } catch (error) {
      logManager.error('Erreur initialisation base de données', { error: error.message });
      throw error;
    }
  }

  /**
   * Configuration de base d'Express
   */
  configureExpress() {
    // Configuration Express
    this.app.set('trust proxy', 1);
    this.app.disable('x-powered-by');
    
    // Dossier des vues
    this.app.set('views', config.directories.views);
    this.app.set('view engine', 'ejs');
  }

  /**
   * Middlewares de sécurité
   */
  configureSecurityMiddlewares() {
    // Helmet pour la sécurité des headers
    this.app.use(helmet(config.security.helmet));

    // Rate limiting
    const limiter = rateLimit(config.security.rateLimit);
    this.app.use('/api/', limiter);
    this.app.use('/auth/', limiter);
  }

  /**
   * Middlewares de parsing et session
   */
  configureParsingMiddlewares() {
    // Parsing des cookies
    this.app.use(cookieParser());

    // Parsing du body
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Configuration des sessions
    this.app.use(session({
      secret: config.session.secret,
      name: config.session.name,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.session.secure,
        httpOnly: config.session.httpOnly,
        maxAge: config.session.maxAge,
        sameSite: config.session.sameSite
      }
    }));
  }

  /**
   * Configuration des templates EJS
   */
  configureTemplates() {
    // Express EJS Layouts
    this.app.use(expressLayouts);
    this.app.set('layout', 'layouts/principal');
    this.app.set('layout extractScripts', true);
    this.app.set('layout extractStyles', true);
  }

  /**
   * Middlewares applicatifs
   */
  configureApplicationMiddlewares() {
    // Fichiers statiques
    this.app.use(express.static(config.directories.public, {
      maxAge: config.server.env === 'production' ? '1y' : 0,
      etag: true
    }));

    // Logging des requêtes
    this.app.use(logManager.logRequest.bind(logManager));

    // Variables globales pour les templates
    this.app.use((req, res, next) => {
      res.locals.user = req.session.user || null;
      res.locals.messages = req.session.messages || {};
      res.locals.config = {
        appName: 'Générateur PDF JDR',
        version: '1.0.0',
        env: config.server.env
      };
      
      // Clear messages after use
      delete req.session.messages;
      
      next();
    });
  }

  /**
   * Configuration des routes
   */
  configureRoutes() {
    // Route de santé
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      });
    });

    // Page d'accueil temporaire
    this.app.get('/', (req, res) => {
      res.render('index', {
        title: 'Générateur PDF JDR',
        description: 'Créez vos fiches de personnages pour vos JDR favoris'
      });
    });

    // Routes API (à implémenter)
    // this.app.use('/api', require('./routes/api'));
    
    // Routes d'authentification (à implémenter)  
    // this.app.use('/auth', require('./routes/auth'));
    
    // Routes des personnages (à implémenter)
    // this.app.use('/personnages', require('./routes/personnages'));
    
    // Routes des PDFs (à implémenter)
    // this.app.use('/pdf', require('./routes/pdf'));

    // 404 - Page non trouvée
    this.app.use((req, res) => {
      logManager.warn('Page non trouvée', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      
      res.status(404).render('errors/404', {
        title: 'Page non trouvée',
        url: req.originalUrl
      });
    });
  }

  /**
   * Gestion des erreurs
   */
  configureErrorHandling() {
    // Gestionnaire d'erreurs global
    this.app.use((error, req, res, next) => {
      logManager.logError(error, req);

      // En développement, on affiche la stack trace
      if (config.server.env === 'development') {
        return res.status(500).render('errors/500', {
          title: 'Erreur serveur',
          error: error,
          stack: error.stack
        });
      }

      // En production, on cache les détails
      res.status(500).render('errors/500', {
        title: 'Erreur serveur',
        error: { message: 'Une erreur inattendue s\'est produite' }
      });
    });

    // Gestion des rejections non capturées
    process.on('unhandledRejection', (reason, promise) => {
      logManager.error('Unhandled Rejection', {
        reason: reason.toString(),
        stack: reason.stack
      });
    });

    // Gestion des exceptions non capturées
    process.on('uncaughtException', (error) => {
      logManager.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Graceful shutdown
      this.shutdown();
    });
  }

  /**
   * Démarre le serveur
   */
  async start() {
    try {
      await this.initialize();

      this.server = this.app.listen(config.server.port, config.server.host, () => {
        logManager.info('Serveur démarré', {
          host: config.server.host,
          port: config.server.port,
          env: config.server.env,
          pid: process.pid
        });

        console.log(`🚀 Serveur démarré sur http://${config.server.host}:${config.server.port}`);
        console.log(`📝 Environment: ${config.server.env}`);
        console.log(`📊 Logs: ${config.directories.logs}`);
      });

      // Gestion propre de l'arrêt
      this.setupGracefulShutdown();

    } catch (error) {
      logManager.error('Erreur démarrage serveur', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Configuration de l'arrêt propre
   */
  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        logManager.info(`Signal ${signal} reçu - arrêt en cours...`);
        this.shutdown();
      });
    });
  }

  /**
   * Arrêt propre du serveur
   */
  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logManager.info('Début de l\'arrêt du serveur...');

    try {
      // Arrêt du serveur HTTP
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        logManager.info('Serveur HTTP arrêté');
      }

      // Fermeture de la base de données
      const db = require('./database/db');
      await db.close();

      logManager.info('Arrêt du serveur terminé');
      process.exit(0);

    } catch (error) {
      logManager.error('Erreur lors de l\'arrêt', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Getter pour l'instance Express
   */
  get instance() {
    return this.app;
  }
}

// Création de l'instance d'application
const app = new App();

// Démarrage automatique si exécuté directement
if (require.main === module) {
  app.start().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = app;