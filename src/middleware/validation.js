/**
 * Middleware de validation des requêtes
 * Valide les données d'entrée selon des schémas définis
 */

const Joi = require('joi');
const logger = require('../utils/logManager');

/**
 * Crée un middleware de validation pour les requêtes
 * @param {Object} schema - Schéma de validation Joi { body, params, query }
 * @param {Object} options - Options de validation
 * @returns {Function} Middleware Express
 */
function validateRequest(schema, options = {}) {
    return (req, res, next) => {
        try {
            const validationOptions = {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true,
                ...options
            };
            
            const toValidate = {};
            
            // Validation du body
            if (schema.body) {
                toValidate.body = req.body;
            }
            
            // Validation des paramètres d'URL
            if (schema.params) {
                toValidate.params = req.params;
            }
            
            // Validation des query parameters
            if (schema.query) {
                toValidate.query = req.query;
            }
            
            // Validation des headers si nécessaire
            if (schema.headers) {
                toValidate.headers = req.headers;
            }
            
            const fullSchema = Joi.object(schema);
            const { error, value } = fullSchema.validate(toValidate, validationOptions);
            
            if (error) {
                const errorDetails = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));
                
                logger.warn('Validation échouée', {
                    url: req.originalUrl,
                    method: req.method,
                    errors: errorDetails,
                    userId: req.user ? req.user.id : null
                });
                
                if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                    return res.status(422).json({
                        success: false,
                        message: 'Données invalides',
                        errors: errorDetails
                    });
                }
                
                // Pour les requêtes web, rediriger avec message d'erreur
                req.flash('error', 'Données invalides : ' + errorDetails.map(e => e.message).join(', '));
                return res.redirect('back');
            }
            
            // Remplacer les données validées et nettoyées
            if (value.body) req.body = value.body;
            if (value.params) req.params = value.params;
            if (value.query) req.query = value.query;
            
            next();
            
        } catch (err) {
            logger.error('Erreur validation middleware', { error: err.message });
            next(err);
        }
    };
}

/**
 * Schémas de validation réutilisables
 */
const schemas = {
    // Identifiants
    id: Joi.number().integer().positive(),
    uuid: Joi.string().uuid(),
    email: Joi.string().email().max(255),
    
    // Pagination
    pagination: {
        query: {
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            sort: Joi.string().valid('asc', 'desc').default('desc'),
            sortBy: Joi.string().alphanum().max(50)
        }
    },
    
    // Authentification
    login: {
        body: {
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            rememberMe: Joi.boolean().default(false)
        }
    },
    
    register: {
        body: {
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
            codeAcces: Joi.string().min(6).max(20).required(),
            acceptCgu: Joi.boolean().valid(true).required()
        }
    },
    
    // Personnage
    personnage: {
        body: {
            nom: Joi.string().min(1).max(100).required(),
            description: Joi.string().max(5000).allow(''),
            systeme: Joi.string().valid('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology').required(),
            donnees: Joi.object().required(),
            visibilite: Joi.string().valid('prive', 'public').default('prive')
        }
    },
    
    // Document PDF
    document: {
        body: {
            type: Joi.string().valid('CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE').required(),
            systeme: Joi.string().valid('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology').required(),
            titre: Joi.string().min(1).max(200).required(),
            donnees: Joi.object().required(),
            options: Joi.object().default({})
        }
    },
    
    // Oracle
    oracle: {
        body: {
            nom: Joi.string().min(1).max(100).required(),
            description: Joi.string().max(1000).allow(''),
            systeme: Joi.string().valid('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology').required(),
            categories: Joi.array().items(
                Joi.object({
                    nom: Joi.string().min(1).max(50).required(),
                    items: Joi.array().items(Joi.string().max(500)).min(1).required()
                })
            ).min(1).required()
        }
    }
};

/**
 * Middleware pour valider les fichiers uploadés
 * @param {Object} options - Options de validation des fichiers
 * @returns {Function} Middleware Express
 */
function validateFiles(options = {}) {
    return (req, res, next) => {
        try {
            const {
                required = false,
                maxSize = 5 * 1024 * 1024, // 5MB par défaut
                allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
                maxFiles = 1
            } = options;
            
            const files = req.files || [];
            
            if (required && files.length === 0) {
                return res.status(422).json({
                    success: false,
                    message: 'Fichier requis'
                });
            }
            
            if (files.length > maxFiles) {
                return res.status(422).json({
                    success: false,
                    message: `Maximum ${maxFiles} fichier(s) autorisé(s)`
                });
            }
            
            for (const file of files) {
                if (file.size > maxSize) {
                    return res.status(422).json({
                        success: false,
                        message: `Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`
                    });
                }
                
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(422).json({
                        success: false,
                        message: `Type de fichier non autorisé: ${file.mimetype}`
                    });
                }
            }
            
            next();
            
        } catch (err) {
            logger.error('Erreur validation fichiers', { error: err.message });
            next(err);
        }
    };
}

module.exports = {
    validateRequest,
    validateFiles,
    schemas
};