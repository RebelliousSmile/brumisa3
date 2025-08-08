const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Service de logging production avec Winston
 * Configuration avancée pour production avec rotation et niveaux
 */
class LoggingService {
    constructor() {
        this.logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
        
        this.logger = this.createLogger();
        this.setupEventHandlers();
    }

    /**
     * Assure que le répertoire de logs existe
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Crée le logger Winston configuré
     */
    createLogger() {
        const isProduction = process.env.NODE_ENV === 'production';
        const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');
        
        // Format personnalisé pour la production
        const productionFormat = winston.format.combine(
            winston.format.timestamp({
                format: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                const logEntry = {
                    timestamp,
                    level: level.toUpperCase(),
                    service: service || 'brumisater',
                    message,
                    pid: process.pid,
                    environment: process.env.NODE_ENV,
                    ...meta
                };
                
                return JSON.stringify(logEntry);
            })
        );
        
        // Format pour le développement (plus lisible)
        const developmentFormat = winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                const metaStr = Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : '';
                return `[${timestamp}] ${level} [${service || 'brumisater'}]: ${message}${metaStr}`;
            })
        );
        
        const transports = [];
        
        // Console transport (toujours présent)
        transports.push(new winston.transports.Console({
            level: logLevel,
            format: isProduction ? productionFormat : developmentFormat,
            handleExceptions: true,
            handleRejections: true
        }));
        
        if (isProduction) {
            // Transport pour les erreurs (fichier séparé)
            transports.push(new winston.transports.File({
                filename: path.join(this.logDir, 'error.log'),
                level: 'error',
                format: productionFormat,
                maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB par défaut
                maxFiles: parseInt(process.env.LOG_MAX_FILES) || 10,
                tailable: true
            }));
            
            // Transport pour tous les logs
            transports.push(new winston.transports.File({
                filename: path.join(this.logDir, 'combined.log'),
                format: productionFormat,
                maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB par défaut
                maxFiles: parseInt(process.env.LOG_MAX_FILES) || 14,
                tailable: true
            }));
            
            // Transport pour les logs d'accès (performance)
            transports.push(new winston.transports.File({
                filename: path.join(this.logDir, 'access.log'),
                level: 'http',
                format: productionFormat,
                maxsize: 5242880, // 5MB
                maxFiles: 7,
                tailable: true
            }));
        }
        
        return winston.createLogger({
            level: logLevel,
            format: productionFormat,
            transports,
            exitOnError: false,
            
            // Rejections et exceptions
            exceptionHandlers: [
                new winston.transports.File({
                    filename: path.join(this.logDir, 'exceptions.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            ],
            
            rejectionHandlers: [
                new winston.transports.File({
                    filename: path.join(this.logDir, 'rejections.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            ]
        });
    }

    /**
     * Configure les gestionnaires d'événements
     */
    setupEventHandlers() {
        // Événements du logger
        this.logger.on('error', (error) => {
            console.error('Erreur du logger Winston:', error);
        });
        
        // Gestionnaire pour les erreurs non attrapées
        process.on('uncaughtException', (error) => {
            this.logger.error('Exception non attrapée', {
                error: error.message,
                stack: error.stack,
                fatal: true
            });
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Promise rejetée non gérée', {
                reason: reason?.message || reason,
                promise: promise.toString(),
                fatal: false
            });
        });
    }

    /**
     * Méthodes de logging simplifiées
     */
    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    http(message, meta = {}) {
        this.logger.http(message, meta);
    }

    /**
     * Log structuré pour les requêtes HTTP
     */
    logRequest(req, res, responseTime) {
        this.http('HTTP Request', {
            method: req.method,
            url: req.url,
            path: req.path,
            statusCode: res.statusCode,
            responseTime: responseTime + 'ms',
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.session?.userId || null,
            referer: req.get('Referer')
        });
    }

    /**
     * Log structuré pour les erreurs d'application
     */
    logError(error, context = {}) {
        this.error(error.message || 'Erreur inconnue', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            ...context
        });
    }

    /**
     * Log structuré pour les métriques de performance
     */
    logPerformance(operation, duration, meta = {}) {
        const level = duration > 2000 ? 'warn' : 'info';
        
        this.logger.log(level, `Performance: ${operation}`, {
            operation,
            duration: duration + 'ms',
            isSlowOperation: duration > 1000,
            ...meta
        });
    }

    /**
     * Log structuré pour les événements business
     */
    logBusinessEvent(event, data = {}) {
        this.info(`Business Event: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...data
        });
    }

    /**
     * Log structuré pour la sécurité
     */
    logSecurity(event, details = {}) {
        this.warn(`Security Event: ${event}`, {
            event,
            security: true,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    /**
     * Crée un logger enfant avec contexte
     */
    child(context = {}) {
        return {
            debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
            info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
            warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
            error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
            http: (message, meta = {}) => this.http(message, { ...context, ...meta })
        };
    }

    /**
     * Obtient le logger Winston brut
     */
    getLogger() {
        return this.logger;
    }

    /**
     * Middleware Express pour logging automatique
     */
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Log de début de requête
            this.debug('Request started', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            // Hook sur la fin de réponse
            const originalEnd = res.end;
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                
                // Log de fin de requête
                this.logRequest(req, res, responseTime);
                
                // Log des erreurs 4xx/5xx
                if (res.statusCode >= 400) {
                    const level = res.statusCode >= 500 ? 'error' : 'warn';
                    this.logger.log(level, `HTTP ${res.statusCode}`, {
                        method: req.method,
                        url: req.url,
                        statusCode: res.statusCode,
                        responseTime: responseTime + 'ms',
                        ip: req.ip
                    });
                }
                
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }

    /**
     * Ferme proprement le logger
     */
    async close() {
        return new Promise((resolve) => {
            this.logger.end(() => {
                resolve();
            });
        });
    }

    /**
     * Méthode statique pour créer une instance singleton
     */
    static create() {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    /**
     * Niveaux de log disponibles
     */
    static get Levels() {
        return {
            ERROR: 'error',
            WARN: 'warn',
            INFO: 'info',
            HTTP: 'http',
            DEBUG: 'debug'
        };
    }
}

// Créer et exporter l'instance singleton
const loggingService = LoggingService.create();

module.exports = {
    LoggingService,
    logger: loggingService
};

// Exporter aussi le logger pour compatibilité
module.exports.default = loggingService;