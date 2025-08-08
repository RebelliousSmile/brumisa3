/**
 * Middleware de gestion d'erreurs
 * Centralise la gestion des erreurs de l'application
 */

const logger = require('../utils/logManager');

/**
 * Gestion centralisée des erreurs HTTP
 * @param {Error} err - Erreur capturée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function handleError(err, req, res, next) {
    // Log de l'erreur avec contexte
    const errorContext = {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user.id : null
    };
    
    // Déterminer le niveau de log selon le type d'erreur
    if (err.status >= 400 && err.status < 500) {
        logger.warn('Erreur client', errorContext);
    } else {
        logger.error('Erreur serveur', errorContext);
    }
    
    // Éviter de traiter plusieurs fois la même erreur
    if (res.headersSent) {
        return next(err);
    }
    
    // Déterminer le statut HTTP
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Format de réponse selon le type de requête
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        // Requête AJAX/API - réponse JSON
        const response = {
            success: false,
            message: getErrorMessage(err, isProduction),
            status: status
        };
        
        // En développement, ajouter plus de détails
        if (!isProduction) {
            response.error = err.message;
            response.stack = err.stack;
        }
        
        return res.status(status).json(response);
    }
    
    // Requête web - template EJS
    const templateData = {
        title: 'Erreur - brumisater',
        error: {
            status: status,
            message: getErrorMessage(err, isProduction)
        },
        user: req.user || null
    };
    
    // Template selon le type d'erreur
    if (status === 404) {
        return res.status(404).render('errors/404', templateData);
    } else if (status === 403) {
        return res.status(403).render('errors/403', templateData);
    } else {
        return res.status(status).render('errors/500', templateData);
    }
}

/**
 * Middleware pour capturer les routes non trouvées (404)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function handleNotFound(req, res, next) {
    logger.warn('Page non trouvée', { 
        url: req.originalUrl,
        method: req.method,
        ip: req.ip 
    });
    
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(404).json({
            success: false,
            message: 'Ressource non trouvée',
            status: 404
        });
    }
    
    return res.status(404).render('errors/404', {
        title: 'Page non trouvée - brumisater',
        error: {
            status: 404,
            message: 'La page demandée n\'existe pas'
        },
        user: req.user || null
    });
}

/**
 * Obtient un message d'erreur adapté selon l'environnement
 * @param {Error} err - Erreur
 * @param {boolean} isProduction - Mode production
 * @returns {string} Message d'erreur
 */
function getErrorMessage(err, isProduction) {
    if (err.message && !isProduction) {
        return err.message;
    }
    
    // Messages génériques pour la production
    const status = err.status || err.statusCode || 500;
    
    switch (status) {
        case 400:
            return 'Requête invalide';
        case 401:
            return 'Authentification requise';
        case 403:
            return 'Accès interdit';
        case 404:
            return 'Ressource non trouvée';
        case 422:
            return 'Données invalides';
        case 429:
            return 'Trop de requêtes';
        case 500:
            return 'Erreur interne du serveur';
        case 503:
            return 'Service temporairement indisponible';
        default:
            return 'Une erreur est survenue';
    }
}

/**
 * Middleware pour valider les erreurs asynchrones
 * Wrap les handlers async pour capturer automatiquement les erreurs
 * @param {Function} fn - Fonction async à wrapper
 * @returns {Function} Handler Express sécurisé
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Crée une erreur HTTP avec status
 * @param {string} message - Message d'erreur
 * @param {number} status - Code de statut HTTP
 * @returns {Error} Erreur HTTP
 */
function createError(message, status = 500) {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = {
    handleError,
    handleNotFound,
    asyncHandler,
    createError
};