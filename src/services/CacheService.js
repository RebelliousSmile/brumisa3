const BaseService = require('./BaseService');

/**
 * Service de cache en mémoire pour optimiser les performances
 * Cache oracles, templates et données fréquemment accédées
 */
class CacheService extends BaseService {
    constructor() {
        super('CacheService');
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        
        // Configuration du cache
        this.config = {
            defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 300000, // 5 minutes par défaut
            maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000, // 1000 entrées max
            cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL) || 60000 // Nettoyage toutes les minutes
        };
        
        // Démarrer le nettoyage périodique
        this.startCleanupInterval();
        
        this.log('info', 'CacheService initialisé', {
            defaultTTL: this.config.defaultTTL,
            maxSize: this.config.maxSize
        });
    }

    /**
     * Stocke une valeur dans le cache
     * 
     * @param {string} key - Clé du cache
     * @param {*} value - Valeur à stocker
     * @param {number} ttl - Durée de vie en millisecondes (optionnel)
     */
    set(key, value, ttl = null) {
        try {
            // Vérifier la taille du cache
            if (this.cache.size >= this.config.maxSize) {
                this.evictOldest();
            }
            
            const actualTTL = ttl || this.config.defaultTTL;
            const expiresAt = Date.now() + actualTTL;
            
            this.cache.set(key, {
                value,
                expiresAt,
                createdAt: Date.now(),
                accessCount: 0
            });
            
            this.stats.sets++;
            
            this.log('debug', 'Cache SET', {
                key,
                ttl: actualTTL,
                size: this.cache.size
            });
            
        } catch (error) {
            this.logError(error, { key, operation: 'SET' });
        }
    }

    /**
     * Récupère une valeur du cache
     * 
     * @param {string} key - Clé du cache
     * @returns {*} Valeur ou null si non trouvée/expirée
     */
    get(key) {
        try {
            const entry = this.cache.get(key);
            
            if (!entry) {
                this.stats.misses++;
                this.log('debug', 'Cache MISS', { key });
                return null;
            }
            
            // Vérifier expiration
            if (entry.expiresAt < Date.now()) {
                this.cache.delete(key);
                this.stats.misses++;
                this.log('debug', 'Cache EXPIRED', { key });
                return null;
            }
            
            // Mettre à jour les stats d'accès
            entry.accessCount++;
            this.stats.hits++;
            
            this.log('debug', 'Cache HIT', { 
                key, 
                accessCount: entry.accessCount 
            });
            
            return entry.value;
            
        } catch (error) {
            this.logError(error, { key, operation: 'GET' });
            this.stats.misses++;
            return null;
        }
    }

    /**
     * Vérifie si une clé existe dans le cache (sans l'accéder)
     * 
     * @param {string} key - Clé à vérifier
     * @returns {boolean} True si existe et valide
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        // Vérifier expiration
        if (entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }

    /**
     * Supprime une entrée du cache
     * 
     * @param {string} key - Clé à supprimer
     * @returns {boolean} True si supprimée
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            this.log('debug', 'Cache DELETE', { key });
        }
        return deleted;
    }

    /**
     * Vide tout le cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.log('info', 'Cache vidé', { previousSize: size });
    }

    /**
     * Récupère ou calcule une valeur avec cache
     * 
     * @param {string} key - Clé du cache
     * @param {Function} calculator - Fonction pour calculer la valeur si non en cache
     * @param {number} ttl - Durée de vie personnalisée (optionnel)
     * @returns {*} Valeur cachée ou calculée
     */
    async getOrSet(key, calculator, ttl = null) {
        try {
            // Essayer de récupérer du cache
            const cached = this.get(key);
            if (cached !== null) {
                return cached;
            }
            
            // Calculer la valeur
            this.log('debug', 'Cache COMPUTE', { key });
            const value = await calculator();
            
            // Stocker dans le cache
            this.set(key, value, ttl);
            
            return value;
            
        } catch (error) {
            this.logError(error, { key, operation: 'GET_OR_SET' });
            
            // En cas d'erreur, essayer de calculer sans cache
            if (typeof calculator === 'function') {
                return await calculator();
            }
            
            throw error;
        }
    }

    /**
     * Supprime les entrées expirées
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt < now) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.log('debug', 'Cache nettoyé', { 
                cleaned, 
                remaining: this.cache.size 
            });
        }
        
        return cleaned;
    }

    /**
     * Supprime l'entrée la plus ancienne (LRU approximatif)
     */
    evictOldest() {
        let oldest = null;
        let oldestTime = Date.now();
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldest = key;
            }
        }
        
        if (oldest) {
            this.cache.delete(oldest);
            this.log('debug', 'Cache éviction', { key: oldest });
        }
    }

    /**
     * Démarre le nettoyage périodique
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    /**
     * Obtient les statistiques du cache
     * 
     * @returns {Object} Statistiques complètes
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;
            
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size,
            maxSize: this.config.maxSize,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Estime l'usage mémoire du cache
     * 
     * @returns {Object} Estimation de la mémoire utilisée
     */
    getMemoryUsage() {
        try {
            let totalSize = 0;
            let entryCount = 0;
            
            for (const [key, entry] of this.cache.entries()) {
                // Estimation approximative de la taille en mémoire
                totalSize += key.length * 2; // String UTF-16
                totalSize += JSON.stringify(entry.value).length * 2; // Value estimate
                totalSize += 64; // Metadata overhead estimate
                entryCount++;
            }
            
            return {
                estimatedBytes: totalSize,
                estimatedKB: Math.round(totalSize / 1024),
                entryCount
            };
        } catch {
            return {
                estimatedBytes: -1,
                estimatedKB: -1,
                entryCount: this.cache.size
            };
        }
    }

    /**
     * Reset les statistiques
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        this.log('info', 'Statistiques cache réinitialisées');
    }

    /**
     * Génère des clés de cache standardisées
     */
    static generateKey(prefix, ...parts) {
        return `${prefix}:${parts.filter(p => p != null).join(':')}`;
    }

    /**
     * Clés prédéfinies pour les cas d'usage courants
     */
    static Keys = {
        ORACLE: (systeme, type) => CacheService.generateKey('oracle', systeme, type),
        TEMPLATE: (systeme, template) => CacheService.generateKey('template', systeme, template),
        SYSTEM_CONFIG: (systeme) => CacheService.generateKey('system', systeme),
        USER_STATS: (userId) => CacheService.generateKey('user_stats', userId),
        DOCUMENT_STATS: (documentId) => CacheService.generateKey('doc_stats', documentId),
        PDF_TEMPLATES: (systeme) => CacheService.generateKey('pdf_templates', systeme)
    };

    /**
     * Durées de vie prédéfinies
     */
    static TTL = {
        SHORT: 60000,      // 1 minute
        MEDIUM: 300000,    // 5 minutes
        LONG: 900000,      // 15 minutes
        VERY_LONG: 3600000, // 1 heure
        DAILY: 86400000    // 24 heures
    };
}

module.exports = CacheService;