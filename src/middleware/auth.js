/**
 * Middleware d'authentification
 * Gère l'authentification des utilisateurs et les sessions
 */

const logger = require('../utils/logManager');

/**
 * Middleware pour vérifier l'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express  
 * @param {Function} next - Fonction next
 */
function requireAuth(req, res, next) {
    try {
        if (req.session && req.session.utilisateur) {
            // Utilisateur authentifié
            req.user = req.session.utilisateur;
            return next();
        }
        
        // Utilisateur non authentifié
        logger.warn('Tentative accès non autorisé', { 
            path: req.path,
            ip: req.ip 
        });
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // Requête AJAX
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        
        // Redirection page login
        req.session.redirectAfterLogin = req.originalUrl;
        return res.redirect('/auth/connexion');
        
    } catch (error) {
        logger.error('Erreur middleware auth', { error: error.message });
        return next(error);
    }
}

/**
 * Middleware pour vérifier les droits administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function requireAdmin(req, res, next) {
    try {
        if (!req.user) {
            return requireAuth(req, res, next);
        }
        
        if (req.user.role !== 'admin') {
            logger.warn('Tentative accès admin non autorisé', { 
                userId: req.user.id,
                path: req.path 
            });
            
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({
                    success: false,
                    message: 'Droits administrateur requis'
                });
            }
            
            return res.status(403).render('errors/403', {
                message: 'Accès interdit - Droits administrateur requis'
            });
        }
        
        return next();
        
    } catch (error) {
        logger.error('Erreur middleware admin', { error: error.message });
        return next(error);
    }
}

/**
 * Middleware pour vérifier les droits Premium
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function requirePremium(req, res, next) {
    try {
        if (!req.user) {
            return requireAuth(req, res, next);
        }
        
        const now = new Date();
        const premiumExpiry = new Date(req.user.premium_expires_at);
        
        if (!req.user.premium_expires_at || premiumExpiry < now) {
            logger.warn('Tentative accès premium non autorisé', { 
                userId: req.user.id,
                premiumExpiry: req.user.premium_expires_at 
            });
            
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({
                    success: false,
                    message: 'Abonnement Premium requis',
                    premiumRequired: true
                });
            }
            
            return res.redirect('/systemes/support?premium=required');
        }
        
        return next();
        
    } catch (error) {
        logger.error('Erreur middleware premium', { error: error.message });
        return next(error);
    }
}

/**
 * Middleware pour gérer l'authentification optionnelle
 * Définit req.user si authentifié, sinon continue normalement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function optionalAuth(req, res, next) {
    try {
        if (req.session && req.session.utilisateur) {
            req.user = req.session.utilisateur;
        }
        return next();
        
    } catch (error) {
        logger.error('Erreur middleware auth optionnel', { error: error.message });
        return next(error);
    }
}

module.exports = {
    requireAuth,
    requireAdmin,
    requirePremium,
    optionalAuth
};