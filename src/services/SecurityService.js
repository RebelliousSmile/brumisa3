const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const BaseService = require('./BaseService');

/**
 * Service de sécurité pour la production
 * Configure HTTPS, headers de sécurité, rate limiting
 */
class SecurityService extends BaseService {
    constructor() {
        super('SecurityService');
        
        this.config = {
            isProduction: process.env.NODE_ENV === 'production',
            httpsEnabled: process.env.HTTPS_ENABLED === 'true',
            forceHttps: process.env.FORCE_HTTPS === 'true',
            corsOrigin: process.env.CORS_ORIGIN,
            trustProxy: process.env.TRUST_PROXY === 'true',
            helmetEnabled: process.env.HELMET_ENABLED !== 'false', // Activé par défaut
            rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutes
            rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
            rateLimitSkipSuccess: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
        };
        
        this.log('info', 'SecurityService initialisé', {
            isProduction: this.config.isProduction,
            httpsEnabled: this.config.httpsEnabled,
            helmetEnabled: this.config.helmetEnabled
        });
    }

    /**
     * Obtient la configuration SSL pour Express
     */
    getSSLConfig() {
        if (!this.config.httpsEnabled) {
            return null;
        }
        
        const fs = require('fs');
        const path = require('path');
        
        try {
            const certPath = process.env.SSL_CERT_PATH;
            const keyPath = process.env.SSL_KEY_PATH;
            
            if (!certPath || !keyPath) {
                throw new Error('Chemins SSL manquants dans les variables d\'environnement');
            }
            
            return {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath)
            };
            
        } catch (error) {
            this.logError(error, { context: 'SSL configuration' });
            return null;
        }
    }

    /**
     * Middleware de redirection HTTPS forcée
     */
    forceHttpsMiddleware() {
        if (!this.config.forceHttps || !this.config.isProduction) {
            return (req, res, next) => next();
        }
        
        return (req, res, next) => {
            // Vérifier si la requête arrive via HTTPS
            const isHttps = req.secure || 
                           req.headers['x-forwarded-proto'] === 'https' ||
                           req.headers['x-forwarded-ssl'] === 'on';
            
            if (!isHttps) {
                const redirectUrl = `https://${req.get('Host')}${req.originalUrl}`;
                
                this.log('info', 'Redirection HTTPS forcée', {
                    from: `http://${req.get('Host')}${req.originalUrl}`,
                    to: redirectUrl,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
                
                return res.redirect(301, redirectUrl);
            }
            
            next();
        };
    }

    /**
     * Configuration Helmet pour les headers de sécurité
     */
    getHelmetConfig() {
        if (!this.config.helmetEnabled) {
            return null;
        }
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const domain = new URL(baseUrl).hostname;
        
        return helmet({
            // Content Security Policy
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: [
                        "'self'", 
                        "'unsafe-inline'", // Pour Tailwind CSS
                        'https://fonts.googleapis.com',
                        'https://cdnjs.cloudflare.com'
                    ],
                    fontSrc: [
                        "'self'",
                        'https://fonts.gstatic.com',
                        'https://cdnjs.cloudflare.com'
                    ],
                    scriptSrc: [
                        "'self'",
                        "'unsafe-inline'", // Alpine.js inline scripts
                        'https://cdnjs.cloudflare.com',
                        'https://js.stripe.com'
                    ],
                    imgSrc: [
                        "'self'",
                        'data:',
                        'blob:',
                        'https:'
                    ],
                    connectSrc: [
                        "'self'",
                        'https://api.stripe.com'
                    ],
                    frameSrc: [
                        "'self'",
                        'https://js.stripe.com'
                    ],
                    formAction: ["'self'"],
                    baseUri: ["'self'"],
                    objectSrc: ["'none'"]
                },
                reportOnly: !this.config.isProduction // Report seulement en dev
            },
            
            // HTTP Strict Transport Security
            hsts: {
                maxAge: 31536000, // 1 an
                includeSubDomains: true,
                preload: true
            },
            
            // X-Frame-Options
            frameguard: {
                action: 'sameorigin'
            },
            
            // X-Content-Type-Options
            noSniff: true,
            
            // X-XSS-Protection
            xssFilter: true,
            
            // Referrer Policy
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin'
            },
            
            // Hide X-Powered-By
            hidePoweredBy: true,
            
            // Permission Policy
            permittedCrossDomainPolicies: false
        });
    }

    /**
     * Configuration CORS
     */
    getCorsConfig() {
        const corsOrigin = this.config.corsOrigin;
        
        return {
            origin: (origin, callback) => {
                // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);
                
                if (corsOrigin) {
                    // Vérifier si l'origin est autorisé
                    const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
                    if (allowedOrigins.includes(origin)) {
                        return callback(null, true);
                    } else {
                        this.log('warn', 'Origin CORS non autorisé', { origin });
                        return callback(new Error('Non autorisé par CORS'), false);
                    }
                }
                
                // En développement, autoriser tout
                if (!this.config.isProduction) {
                    return callback(null, true);
                }
                
                // En production sans CORS_ORIGIN défini, refuser
                return callback(new Error('CORS non configuré'), false);
            },
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With', 
                'Content-Type', 
                'Accept',
                'Authorization',
                'X-CSRF-Token'
            ]
        };
    }

    /**
     * Rate limiting général
     */
    getGeneralRateLimit() {
        return rateLimit({
            windowMs: this.config.rateLimitWindow * 60 * 1000, // minutes en ms
            max: this.config.rateLimitMax,
            message: {
                error: 'Trop de requêtes, veuillez réessayer plus tard.',
                retryAfter: this.config.rateLimitWindow
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                // Skip si succès et option activée
                return this.config.rateLimitSkipSuccess && req.method === 'GET';
            },
            keyGenerator: (req) => {
                // Utiliser IP + User-Agent pour plus de précision
                return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
            },
            handler: (req, res) => {
                this.log('warn', 'Rate limit dépassé', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    method: req.method
                });
                
                res.status(429).json({
                    error: 'Trop de requêtes',
                    message: 'Veuillez réessayer dans quelques minutes.',
                    retryAfter: this.config.rateLimitWindow * 60
                });
            }
        });
    }

    /**
     * Rate limiting strict pour l'authentification
     */
    getAuthRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // Maximum 5 tentatives par IP
            message: {
                error: 'Trop de tentatives de connexion, compte temporairement verrouillé.',
                retryAfter: 15
            },
            skipSuccessfulRequests: true,
            handler: (req, res) => {
                this.log('error', 'Rate limit auth dépassé', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    suspiciousActivity: true
                });
                
                res.status(429).json({
                    error: 'Compte temporairement verrouillé',
                    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
                    retryAfter: 15 * 60
                });
            }
        });
    }

    /**
     * Rate limiting pour la génération PDF
     */
    getPdfRateLimit() {
        return rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 10, // Maximum 10 PDFs par 5 minutes
            message: {
                error: 'Limite de génération PDF atteinte.',
                retryAfter: 5
            },
            keyGenerator: (req) => {
                // Par utilisateur si connecté, sinon par IP
                return req.session?.userId || req.ip;
            },
            handler: (req, res) => {
                this.log('warn', 'Rate limit PDF dépassé', {
                    userId: req.session?.userId,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                res.status(429).json({
                    error: 'Limite de génération atteinte',
                    message: 'Veuillez patienter avant de générer un nouveau PDF.',
                    retryAfter: 5 * 60
                });
            }
        });
    }

    /**
     * Middleware de configuration proxy
     */
    getTrustProxyMiddleware() {
        return (req, res, next) => {
            if (this.config.trustProxy) {
                // Configurer Express pour faire confiance aux proxies
                req.app.set('trust proxy', true);
            }
            next();
        };
    }

    /**
     * Middleware de sécurité pour les uploads
     */
    getUploadSecurityMiddleware() {
        return (req, res, next) => {
            // Vérifier les types de fichiers autorisés
            if (req.file) {
                const allowedMimeTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'text/plain',
                    'application/json'
                ];
                
                if (!allowedMimeTypes.includes(req.file.mimetype)) {
                    this.log('warn', 'Type de fichier non autorisé', {
                        mimetype: req.file.mimetype,
                        originalName: req.file.originalname,
                        ip: req.ip
                    });
                    
                    return res.status(400).json({
                        error: 'Type de fichier non autorisé'
                    });
                }
                
                // Vérifier la taille
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (req.file.size > maxSize) {
                    return res.status(400).json({
                        error: 'Fichier trop volumineux'
                    });
                }
            }
            
            next();
        };
    }

    /**
     * Middleware anti-CSRF simple
     */
    getCsrfProtectionMiddleware() {
        return (req, res, next) => {
            // Skip pour GET, HEAD, OPTIONS
            if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                return next();
            }
            
            // Skip pour les API avec token
            if (req.path.startsWith('/api/') && req.headers.authorization) {
                return next();
            }
            
            // Vérifier le token CSRF
            const token = req.body._csrf || req.headers['x-csrf-token'];
            const sessionToken = req.session?.csrfToken;
            
            if (!token || !sessionToken || token !== sessionToken) {
                this.log('warn', 'Token CSRF invalide', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    hasToken: !!token,
                    hasSessionToken: !!sessionToken
                });
                
                return res.status(403).json({
                    error: 'Token CSRF invalide ou manquant'
                });
            }
            
            next();
        };
    }

    /**
     * Génère un token CSRF
     */
    generateCsrfToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Middleware pour injecter le token CSRF
     */
    getInjectCsrfMiddleware() {
        return (req, res, next) => {
            if (!req.session.csrfToken) {
                req.session.csrfToken = this.generateCsrfToken();
            }
            
            // Rendre le token disponible dans les vues
            res.locals.csrfToken = req.session.csrfToken;
            
            next();
        };
    }

    /**
     * Log les événements de sécurité
     */
    logSecurityEvent(event, details = {}) {
        this.log('warn', `Security Event: ${event}`, {
            event,
            security: true,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    /**
     * Configuration complète de sécurité pour Express
     */
    configureApp(app) {
        // Trust proxy si configuré
        if (this.config.trustProxy) {
            app.set('trust proxy', 1);
        }
        
        // Headers de sécurité
        const helmetConfig = this.getHelmetConfig();
        if (helmetConfig) {
            app.use(helmetConfig);
        }
        
        // Redirection HTTPS forcée
        app.use(this.forceHttpsMiddleware());
        
        // Rate limiting général
        app.use(this.getGeneralRateLimit());
        
        // CSRF protection
        app.use(this.getInjectCsrfMiddleware());
        
        this.log('info', 'Configuration de sécurité appliquée');
        
        return app;
    }
}

module.exports = SecurityService;