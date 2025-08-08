const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const path = require('path');

// Configuration et utilitaires
const config = require('./config');
const logManager = require('./utils/logManager');
const { initializeDatabase, isDatabaseInitialized } = require('./database/init');

// Services de performance et sécurité
const SecurityService = require('./services/SecurityService');
const CacheService = require('./services/CacheService');
const QueueService = require('./services/QueueService');
const PerformanceMonitoringService = require('./services/PerformanceMonitoringService');
const PerformanceMiddleware = require('./middleware/performance');
const { LoggingService } = require('./services/LoggingService');

/**
 * Application principale avec optimisations performance et production
 */
class ProductionApp {
  constructor() {
    this.app = express();
    this.server = null;
    this.isShuttingDown = false;
    
    // Initialiser les services de performance
    this.securityService = new SecurityService();
    this.cache = new CacheService();
    this.queue = QueueService.create();
    this.performanceMonitoring = PerformanceMonitoringService.create();
    this.performanceMiddleware = PerformanceMiddleware.create();
    this.loggingService = LoggingService.create();
    
    logManager.info('Services de performance initialisés');
  }

  /**
   * Initialise l'application Express
   */
  async initialize() {
    try {
      logManager.info('Initialisation de l\'application avec optimisations production', {
        env: config.server.env,
        port: config.server.port,
        performanceTargets: {
          api: '500ms',
          pdf: '2000ms'
        }
      });

      // Vérification et initialisation de la base de données
      await this.initializeDatabase();

      // Configuration de base Express
      this.configureExpress();

      // Middlewares de performance (en premier pour mesurer tout)
      this.configurePerformanceMiddlewares();
      
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
      
      // Endpoints de monitoring
      this.configureMonitoringEndpoints();

      // Gestion des erreurs
      this.configureErrorHandling();

      logManager.info('Application production initialisée avec succès');

    } catch (error) {
      logManager.error('Erreur lors de l\'initialisation de l\'application:', error);
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
    }
  }

  /**
   * Configuration de base d'Express
   */
  configureExpress() {
    // Configuration Express optimisée pour production
    this.app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
    this.app.disable('x-powered-by');
    this.app.set('env', process.env.NODE_ENV || 'development');
    
    // Dossier des vues
    this.app.set('views', config.directories.views);
    this.app.set('view engine', 'ejs');
    
    // Optimisations EJS pour production
    if (process.env.NODE_ENV === 'production') {
      this.app.set('view cache', true);
    }
  }

  /**
   * Configure les middlewares de performance
   */
  configurePerformanceMiddlewares() {
    // Logging structuré (en premier pour capturer tout)
    this.app.use(this.loggingService.middleware());
    
    // Monitoring des performances
    this.app.use(this.performanceMonitoring.middleware());
    this.app.use(this.performanceMiddleware.monitorAPI());
    
    // Rate limiting adaptatif basé sur la performance
    this.app.use(this.performanceMiddleware.adaptiveRateLimit());
    
    logManager.info('Middlewares de performance configurés');
  }

  /**
   * Configure les middlewares de sécurité
   */
  configureSecurityMiddlewares() {
    // Configuration sécurité complète via SecurityService
    this.securityService.configureApp(this.app);
    
    // Rate limiting spécialisés
    this.app.use('/api/auth', this.securityService.getAuthRateLimit());
    this.app.use('/api/pdf', this.securityService.getPdfRateLimit());
    this.app.use('/upload', this.securityService.getUploadSecurityMiddleware());
    
    // Protection CSRF pour les formulaires
    this.app.use(this.securityService.getCsrfProtectionMiddleware());
    
    logManager.info('Middlewares de sécurité configurés');
  }

  /**
   * Configure les middlewares de parsing et session
   */
  configureParsingMiddlewares() {
    // Parsing des cookies
    this.app.use(cookieParser());

    // Parsing du body avec limites sécurisées
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Validation basique du JSON pour éviter les attaques
        if (buf && buf.length > 0) {
          try {
            JSON.parse(buf.toString());
          } catch (e) {
            this.securityService.logSecurityEvent('invalid_json_payload', {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              contentLength: buf.length
            });
          }
        }
      }
    }));
    
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Configuration des sessions sécurisées
    const sessionConfig = {
      secret: config.session.secret,
      name: config.session.name || 'brumisater.sid',
      resave: false,
      saveUninitialized: false,
      rolling: true, // Renouveler le cookie à chaque requête
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: config.session.maxAge || 24 * 60 * 60 * 1000, // 24h
        sameSite: 'strict'
      }
    };
    
    this.app.use(session(sessionConfig));
  }

  /**
   * Configuration des templates EJS
   */
  configureTemplates() {
    this.app.use(expressLayouts);
    this.app.set('layout', 'layouts/principal');
    this.app.set('layout extractScripts', true);
    this.app.set('layout extractStyles', true);
    
    // Variables globales pour les templates
    this.app.use((req, res, next) => {
      res.locals.currentUrl = req.originalUrl;
      res.locals.environment = process.env.NODE_ENV;
      res.locals.version = process.env.npm_package_version || '1.0.0';
      res.locals.buildTimestamp = Date.now();
      
      // Injecter les métriques de performance dans les templates
      res.locals.performanceMode = process.env.NODE_ENV === 'production';
      
      next();
    });
  }

  /**
   * Configure les middlewares applicatifs
   */
  configureApplicationMiddlewares() {
    // Fichiers statiques avec optimisations production
    const staticOptions = {
      maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Headers spécialisés selon le type de fichier
        if (path.endsWith('.css') || path.endsWith('.js')) {
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.pdf')) {
          res.set('Cache-Control', 'private, no-cache');
          res.set('Content-Disposition', 'inline');
        }
      }
    };
    
    this.app.use(express.static(config.directories.public, staticOptions));

    // Middlewares personnalisés de l'application
    const authMiddleware = require('./middleware/auth');
    const validationMiddleware = require('./middleware/validation');
    const errorMiddleware = require('./middleware/errors');

    this.app.use(authMiddleware);
    this.app.use(validationMiddleware);

    logManager.info('Middlewares applicatifs configurés');
  }

  /**
   * Configure les routes
   */
  configureRoutes() {
    // Routes web
    const webRoutes = require('./routes/web');
    this.app.use('/', webRoutes);

    // Routes API avec monitoring PDF
    const apiRoutes = require('./routes/api');
    this.app.use('/api', this.performanceMiddleware.monitorPDF(), apiRoutes);

    logManager.info('Routes configurées');
  }

  /**
   * Configure les endpoints de monitoring
   */
  configureMonitoringEndpoints() {
    // Health check complet
    this.app.get('/health', this.performanceMiddleware.getHealthCheckEndpoint());
    
    // Métriques détaillées (accès restreint en production)
    this.app.get('/metrics', this.performanceMiddleware.getMetricsEndpoint());
    
    // Endpoint simple pour load balancer
    this.app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    // Statistiques cache (développement uniquement)
    if (process.env.NODE_ENV !== 'production') {
      this.app.get('/cache-stats', (req, res) => {
        res.json(this.cache.getStats());
      });
      
      this.app.get('/queue-stats', (req, res) => {
        res.json(this.queue.getGlobalStats());
      });
    }
    
    logManager.info('Endpoints de monitoring configurés');
  }

  /**
   * Configure la gestion des erreurs
   */
  configureErrorHandling() {
    const errorMiddleware = require('./middleware/errors');
    
    // Middleware 404
    this.app.use((req, res, next) => {
      this.securityService.logSecurityEvent('404_not_found', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const error = new Error(`Page non trouvée: ${req.originalUrl}`);
      error.statusCode = 404;
      next(error);
    });
    
    // Gestionnaire d'erreur global avec logging
    this.app.use((error, req, res, next) => {
      const statusCode = error.statusCode || 500;
      
      // Log l'erreur avec contexte
      this.loggingService.logError(error, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.session?.userId,
        statusCode
      });
      
      // Réponse d'erreur
      if (req.accepts('json')) {
        res.status(statusCode).json({
          error: statusCode >= 500 ? 'Erreur interne du serveur' : error.message,
          timestamp: new Date().toISOString(),
          requestId: req.performanceId
        });
      } else {
        res.status(statusCode).render('errors/error', {
          title: `Erreur ${statusCode}`,
          message: statusCode >= 500 ? 'Une erreur interne s\'est produite' : error.message,
          statusCode,
          layout: 'layouts/principal'
        });
      }
    });
    
    logManager.info('Gestion des erreurs configurée');
  }

  /**
   * Démarre le serveur avec support HTTPS si configuré
   */
  async start() {
    const port = config.server.port;
    const host = config.server.host;
    
    try {
      await this.initialize();
      
      // Support HTTPS en production
      const sslConfig = this.securityService.getSSLConfig();
      if (sslConfig && process.env.NODE_ENV === 'production') {
        const https = require('https');
        this.server = https.createServer(sslConfig, this.app);
        this.server.listen(port, host, () => {
          logManager.info(`🚀 Serveur HTTPS démarré sur https://${host}:${port}`);
          logManager.info(`📊 Monitoring: https://${host}:${port}/health`);
          logManager.info(`🔒 Mode sécurisé: Production SSL activé`);
          this.logStartupMetrics();
        });
      } else {
        this.server = this.app.listen(port, host, () => {
          logManager.info(`🚀 Serveur HTTP démarré sur http://${host}:${port}`);
          logManager.info(`📊 Monitoring: http://${host}:${port}/health`);
          if (process.env.NODE_ENV === 'production') {
            logManager.warn('⚠️ ATTENTION: Serveur en production sans HTTPS');
          }
          this.logStartupMetrics();
        });
      }

      // Configuration serveur pour production
      this.server.keepAliveTimeout = 65000; // > load balancer timeout
      this.server.headersTimeout = 66000;   // > keepAliveTimeout
      
      // Gestion gracieuse de l'arrêt
      this.setupGracefulShutdown();

    } catch (error) {
      logManager.error('Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  }

  /**
   * Log les métriques de démarrage
   */
  logStartupMetrics() {
    const memUsage = process.memoryUsage();
    const cacheStats = this.cache.getStats();
    
    logManager.info('Application démarrée avec succès', {
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      memory: {
        heap: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      },
      cache: {
        size: cacheStats.size,
        maxSize: cacheStats.maxSize
      },
      performance: {
        apiTarget: '500ms',
        pdfTarget: '2000ms'
      }
    });
  }

  /**
   * Configuration de l'arrêt gracieux
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      logManager.info(`Signal ${signal} reçu, arrêt gracieux en cours...`);
      
      const timeout = parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT) || 30000;
      const forceExitTimer = setTimeout(() => {
        logManager.error('Arrêt forcé après timeout');
        process.exit(1);
      }, timeout);
      
      try {
        // Arrêter d'accepter de nouvelles connexions
        if (this.server) {
          this.server.close(() => {
            logManager.info('Serveur HTTP fermé');
          });
        }
        
        // Attendre que les queues se vident
        const queueStats = this.queue.getGlobalStats();
        if (queueStats.activeJobs > 0) {
          logManager.info(`Attente de ${queueStats.activeJobs} jobs actifs...`);
          
          const maxWait = 20000; // 20 secondes max
          const startWait = Date.now();
          
          while (Date.now() - startWait < maxWait) {
            const stats = this.queue.getGlobalStats();
            if (stats.activeJobs === 0) break;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Fermer les services
        await this.loggingService.close();
        
        clearTimeout(forceExitTimer);
        logManager.info('Arrêt gracieux terminé');
        process.exit(0);
        
      } catch (error) {
        logManager.error('Erreur lors de l\'arrêt gracieux:', error);
        clearTimeout(forceExitTimer);
        process.exit(1);
      }
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // PM2 reload

    // Gérer les erreurs non attrapées
    process.on('uncaughtException', (error) => {
      logManager.error('Exception non attrapée:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logManager.error('Promise rejetée non gérée:', { reason, promise });
    });
  }
}

// Export et démarrage
const app = new ProductionApp();

// Démarrer l'application si ce fichier est exécuté directement
if (require.main === module) {
  app.start().catch(error => {
    console.error('Erreur fatale lors du démarrage:', error);
    process.exit(1);
  });
}

module.exports = app;