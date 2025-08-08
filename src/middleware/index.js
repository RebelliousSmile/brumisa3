/**
 * Index des middlewares
 * Point d'entrée centralisé pour tous les middlewares
 */

const auth = require('./auth');
const errors = require('./errors');
const validation = require('./validation');

module.exports = {
    // Authentification
    requireAuth: auth.requireAuth,
    requireAdmin: auth.requireAdmin,
    requirePremium: auth.requirePremium,
    optionalAuth: auth.optionalAuth,
    
    // Gestion d'erreurs
    handleError: errors.handleError,
    handleNotFound: errors.handleNotFound,
    asyncHandler: errors.asyncHandler,
    createError: errors.createError,
    
    // Validation
    validateRequest: validation.validateRequest,
    validateFiles: validation.validateFiles,
    schemas: validation.schemas
};