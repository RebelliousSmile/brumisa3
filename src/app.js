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
      logManager.warn('L\'application continuera en mode dégradé sans base de données');
      // Ne pas lever l'erreur - l'application peut fonctionner sans DB
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

    // Documentation JSDoc
    this.app.use('/docs', express.static(path.join(__dirname, '../docs'), {
      maxAge: config.server.env === 'production' ? '1d' : 0,
      etag: true
    }));

    // Logging des requêtes
    this.app.use(logManager.logRequest.bind(logManager));

    // Variables globales pour les templates
    this.app.use((req, res, next) => {
      res.locals.user = req.session.user || null;
      res.locals.messages = req.session.messages || {};
      res.locals.config = {
        appName: 'brumisa3.fr',
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

    // Favicon route
    this.app.get('/favicon.ico', (req, res) => {
      res.redirect(301, '/images/favicon.svg');
    });
    
    // Direct favicon.svg route with proper headers
    this.app.get('/images/favicon.svg', (req, res) => {
      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000'
      });
      res.sendFile(path.join(__dirname, '../public/images/favicon.svg'));
    });

    // Page d'accueil gérée par les routes web

    // Pages légales
    this.app.get('/mentions-legales', (req, res) => {
      res.render('mentions-legales', {
        title: 'Mentions légales - brumisa3.fr'
      });
    });

    this.app.get('/cgu', (req, res) => {
      res.render('cgu', {
        title: 'Conditions Générales d\'Utilisation - brumisa3.fr'
      });
    });

    // Routes API temporaires
    this.app.get('/api/home/donnees', (req, res) => {
      res.json({
        succes: true,
        donnees: {
          pdfs_recents: [],
          actualites: [],
          temoignages: [],
          statistiques: {
            nb_abonnes_newsletter: 0,
            nb_utilisateurs_inscrits: 1247,
            nb_contenus_ouverts_mois: 8932,
            nb_pdfs_stockes: 3456
          }
        }
      });
    });
    
    this.app.get('/api/dons/infos', (req, res) => {
      res.json({
        succes: true,
        donnees: {
          message: "Soutenez le développement de nouvelles fonctionnalités !",
          plateforme: "Ko-fi",
          url_don: "https://ko-fi.com/brumisa3",
          objectifs: [
            { description: "Hébergement serveur", montant: 10 },
            { description: "Nouveaux systèmes JDR", montant: 25 },
            { description: "Fonctionnalités avancées", montant: 50 }
          ]
        }
      });
    });

    // Newsletter inscription
    this.app.post('/api/newsletter/inscription', (req, res) => {
      res.json({
        succes: true,
        message: "Inscription à la newsletter réussie ! Vous serez averti des nouvelles fonctionnalités pour les 4 jeux de la plateforme."
      });
    });

    // Témoignages
    this.app.post('/api/temoignages', (req, res) => {
      res.json({
        succes: true,
        message: "Témoignage envoyé avec succès ! Il sera modéré avant publication."
      });
    });

    // Élévation de rôle
    this.app.post('/api/auth/elevation-role', (req, res) => {
      const { code } = req.body;
      
      // Codes temporaires pour développement
      if (code === '123456') {
        res.json({
          succes: true,
          message: "Rôle Premium débloqué !"
        });
      } else if (code === '789012') {
        res.json({
          succes: true,
          message: "Rôle Admin débloqué !"
        });
      } else {
        res.status(400).json({
          succes: false,
          message: "Code d'accès incorrect"
        });
      }
    });

    // Routes API (à monter AVANT les routes web)
    this.app.use('/api', require('./routes/api'));
    
    // Routes web principales
    this.app.use('/', require('./routes/web'));
    
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