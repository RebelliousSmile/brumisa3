const crypto = require('crypto');

/**
 * Service de gestion des tokens pour utilisateurs anonymes
 * Permet la génération PDF sécurisée sans compte utilisateur
 */
class AnonymousTokenService {
    constructor() {
        // Cache en mémoire des tokens (en production, utiliser Redis)
        this.tokens = new Map();
        this.cleanupInterval = null;
        this.startCleanup();
    }

    /**
     * Génère un token temporaire pour utilisateur anonyme
     * @param {string} sessionId - ID de session ou fingerprint
     * @param {Object} limitations - Limitations spécifiques
     * @returns {Object} Token et informations
     */
    generateToken(sessionId = null, limitations = {}) {
        const token = crypto.randomBytes(32).toString('hex');
        const now = Date.now();
        
        const tokenData = {
            token,
            sessionId: sessionId || this.generateSessionId(),
            createdAt: now,
            expiresAt: now + (30 * 60 * 1000), // 30 minutes
            usageCount: 0,
            maxUsage: limitations.maxUsage || 5, // Max 5 PDFs par token
            maxSizeKB: limitations.maxSizeKB || 500, // Max 500KB par PDF
            allowedSystems: limitations.allowedSystems || ['monsterhearts'],
            lastUsed: null,
            rateLimitWindow: now,
            rateLimitCount: 0
        };

        this.tokens.set(token, tokenData);
        
        return {
            token,
            sessionId: tokenData.sessionId,
            expiresIn: 30 * 60, // 30 minutes en secondes
            limitations: {
                maxUsage: tokenData.maxUsage,
                maxSizeKB: tokenData.maxSizeKB,
                allowedSystems: tokenData.allowedSystems
            }
        };
    }

    /**
     * Valide un token et vérifie les limitations
     * @param {string} token - Token à valider
     * @param {string} system - Système de jeu demandé
     * @returns {Object} Résultat de validation
     */
    validateToken(token, system = 'monsterhearts') {
        const tokenData = this.tokens.get(token);
        
        if (!tokenData) {
            return { valid: false, reason: 'TOKEN_NOT_FOUND' };
        }

        const now = Date.now();

        // Vérifier expiration
        if (now > tokenData.expiresAt) {
            this.tokens.delete(token);
            return { valid: false, reason: 'TOKEN_EXPIRED' };
        }

        // Vérifier nombre d'utilisations
        if (tokenData.usageCount >= tokenData.maxUsage) {
            return { valid: false, reason: 'USAGE_LIMIT_EXCEEDED' };
        }

        // Vérifier système autorisé
        if (!tokenData.allowedSystems.includes(system)) {
            return { valid: false, reason: 'SYSTEM_NOT_ALLOWED' };
        }

        // Rate limiting (max 2 requêtes par minute)
        const rateLimitWindow = 60 * 1000; // 1 minute
        if (now - tokenData.rateLimitWindow > rateLimitWindow) {
            tokenData.rateLimitWindow = now;
            tokenData.rateLimitCount = 0;
        }

        if (tokenData.rateLimitCount >= 2) {
            return { valid: false, reason: 'RATE_LIMIT_EXCEEDED' };
        }

        return {
            valid: true,
            tokenData,
            remainingUsage: tokenData.maxUsage - tokenData.usageCount,
            sessionId: tokenData.sessionId
        };
    }

    /**
     * Marque un token comme utilisé
     * @param {string} token - Token utilisé
     * @param {number} pdfSizeKB - Taille du PDF généré
     * @returns {boolean} Succès de l'opération
     */
    markTokenUsed(token, pdfSizeKB = 0) {
        const tokenData = this.tokens.get(token);
        
        if (!tokenData) {
            return false;
        }

        // Vérifier la taille limite
        if (pdfSizeKB > tokenData.maxSizeKB) {
            return false;
        }

        tokenData.usageCount++;
        tokenData.lastUsed = Date.now();
        tokenData.rateLimitCount++;

        // Si usage épuisé, supprimer le token
        if (tokenData.usageCount >= tokenData.maxUsage) {
            this.tokens.delete(token);
        }

        return true;
    }

    /**
     * Révoque un token spécifique
     * @param {string} token - Token à révoquer
     * @returns {boolean} Succès de l'opération
     */
    revokeToken(token) {
        return this.tokens.delete(token);
    }

    /**
     * Révoque tous les tokens d'une session
     * @param {string} sessionId - ID de session
     * @returns {number} Nombre de tokens révoqués
     */
    revokeSessionTokens(sessionId) {
        let revokedCount = 0;
        
        for (const [token, tokenData] of this.tokens.entries()) {
            if (tokenData.sessionId === sessionId) {
                this.tokens.delete(token);
                revokedCount++;
            }
        }
        
        return revokedCount;
    }

    /**
     * Obtient les statistiques d'usage d'un token
     * @param {string} token - Token à analyser
     * @returns {Object|null} Statistiques ou null si non trouvé
     */
    getTokenStats(token) {
        const tokenData = this.tokens.get(token);
        
        if (!tokenData) {
            return null;
        }

        return {
            usageCount: tokenData.usageCount,
            maxUsage: tokenData.maxUsage,
            remainingUsage: tokenData.maxUsage - tokenData.usageCount,
            createdAt: tokenData.createdAt,
            expiresAt: tokenData.expiresAt,
            lastUsed: tokenData.lastUsed,
            allowedSystems: tokenData.allowedSystems
        };
    }

    /**
     * Génère un ID de session unique
     * @returns {string} ID de session
     */
    generateSessionId() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Nettoie automatiquement les tokens expirés
     */
    startCleanup() {
        // Nettoyer toutes les 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredTokens();
        }, 5 * 60 * 1000);
    }

    /**
     * Nettoie les tokens expirés
     * @returns {number} Nombre de tokens supprimés
     */
    cleanupExpiredTokens() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [token, tokenData] of this.tokens.entries()) {
            if (now > tokenData.expiresAt) {
                this.tokens.delete(token);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Nettoyage: ${cleanedCount} tokens anonymes expirés supprimés`);
        }

        return cleanedCount;
    }

    /**
     * Obtient les statistiques globales
     * @returns {Object} Statistiques globales
     */
    getGlobalStats() {
        const now = Date.now();
        let activeTokens = 0;
        let totalUsage = 0;

        for (const tokenData of this.tokens.values()) {
            if (now <= tokenData.expiresAt) {
                activeTokens++;
            }
            totalUsage += tokenData.usageCount;
        }

        return {
            activeTokens,
            totalTokens: this.tokens.size,
            totalUsage,
            averageUsage: totalUsage / Math.max(this.tokens.size, 1)
        };
    }

    /**
     * Arrête le service de nettoyage
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * Obtient les erreurs en français
     * @param {string} reason - Raison de l'erreur
     * @returns {string} Message d'erreur
     */
    static getErrorMessage(reason) {
        const messages = {
            TOKEN_NOT_FOUND: 'Token non valide ou expiré',
            TOKEN_EXPIRED: 'Token expiré, veuillez recharger la page',
            USAGE_LIMIT_EXCEEDED: 'Limite d\'utilisation atteinte pour ce token',
            SYSTEM_NOT_ALLOWED: 'Système de jeu non autorisé pour ce token',
            RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez patienter',
            PDF_TOO_LARGE: 'Document trop volumineux pour un utilisateur anonyme'
        };

        return messages[reason] || 'Erreur de validation du token';
    }
}

module.exports = AnonymousTokenService;