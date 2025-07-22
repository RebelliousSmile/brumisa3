const BaseService = require('./BaseService');
const Oracle = require('../models/Oracle');
const OracleItem = require('../models/OracleItem');
const db = require('../database/db');

/**
 * Service Oracle - Logique métier pour les tirages pondérés
 */
class OracleService extends BaseService {
    constructor() {
        super('OracleService');
        this.oracleModel = new Oracle();
        this.oracleItemModel = new OracleItem();
    }

    /**
     * Effectue un tirage pondéré depuis un oracle
     * @param {string} oracleId - ID de l'oracle
     * @param {number} count - Nombre d'éléments à tirer
     * @param {object} filters - Filtres à appliquer
     * @param {boolean} withReplacement - Permet les doublons
     * @param {string} userRole - Rôle de l'utilisateur
     * @param {number|null} userId - ID utilisateur pour historique
     * @param {string|null} sessionId - ID session pour utilisateurs anonymes
     * @param {string|null} ipAddress - Adresse IP
     * @param {string|null} userAgent - User agent
     * @returns {Promise<Object>} Résultat du tirage
     */
    async effectuerTirage(oracleId, count = 1, filters = null, withReplacement = true, userRole = 'UTILISATEUR', userId = null, sessionId = null, ipAddress = null, userAgent = null) {
        try {
            // Validation des paramètres
            if (count < 1 || count > 100) {
                throw new Error('Le nombre d\'éléments à tirer doit être entre 1 et 100');
            }

            // Récupérer l'oracle
            const oracle = await this.oracleModel.findById(oracleId);
            if (!oracle) {
                throw new Error('Oracle introuvable');
            }

            // Vérifier les permissions
            if (oracle.premium_required && userRole === 'UTILISATEUR') {
                throw new Error('Accès premium requis pour cet oracle');
            }

            if (!oracle.is_active) {
                throw new Error('Oracle désactivé');
            }

            // Récupérer les items actifs avec filtres
            const items = await this.oracleItemModel.findActiveWithFilters(oracleId, filters);
            if (items.length === 0) {
                throw new Error('Aucun élément disponible avec ces critères');
            }

            // Effectuer le tirage
            const results = withReplacement ? 
                await this._tirageAvecRemise(items, count) : 
                await this._tirageSansRemise(items, count);

            // Enregistrer dans l'historique
            await this._enregistrerTirage({
                oracle_id: oracleId,
                user_id: userId,
                session_id: sessionId,
                results: results,
                filters_applied: filters,
                draw_count: count,
                ip_address: ipAddress,
                user_agent: userAgent
            });

            // Filtrer les données selon les permissions
            const filteredResults = results.map(result => 
                this._filtrerResultatSelonPermissions(result, userRole)
            );

            this.log('info', `Tirage effectué`, {
                oracle_id: oracleId,
                count: count,
                filters: filters,
                user_role: userRole,
                results_count: filteredResults.length
            });

            return {
                results: filteredResults,
                draw_info: {
                    oracle_id: oracleId,
                    oracle_name: oracle.name,
                    timestamp: new Date().toISOString(),
                    filters_applied: filters,
                    total_items_available: items.length,
                    draw_count: count,
                    with_replacement: withReplacement
                }
            };

        } catch (error) {
            this.logError(error, { oracle_id: oracleId, count, filters });
            throw error;
        }
    }

    /**
     * Tirage pondéré avec remise (doublons possibles)
     * @private
     */
    async _tirageAvecRemise(items, count) {
        if (items.length === 0) {
            return [];
        }

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) {
            // Fallback : tirage uniforme si tous les poids sont à 0
            return this._tirageUniforme(items, count, true);
        }

        const results = [];
        
        for (let i = 0; i < count; i++) {
            const random = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            
            for (const item of items) {
                cumulativeWeight += item.weight;
                if (random <= cumulativeWeight) {
                    results.push({
                        id: item.id,
                        value: item.value,
                        weight: item.weight,
                        metadata: item.metadata
                    });
                    break;
                }
            }
        }

        return results;
    }

    /**
     * Tirage pondéré sans remise (pas de doublons)
     * @private
     */
    async _tirageSansRemise(items, count) {
        if (items.length === 0) {
            return [];
        }

        const availableItems = [...items];
        const results = [];
        const maxCount = Math.min(count, availableItems.length);

        for (let i = 0; i < maxCount; i++) {
            const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
            
            if (totalWeight === 0) {
                // Fallback : tirage uniforme sur les éléments restants
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                const selectedItem = availableItems.splice(randomIndex, 1)[0];
                results.push({
                    id: selectedItem.id,
                    value: selectedItem.value,
                    weight: selectedItem.weight,
                    metadata: selectedItem.metadata
                });
                continue;
            }

            const random = Math.random() * totalWeight;
            let cumulativeWeight = 0;
            
            for (let j = 0; j < availableItems.length; j++) {
                cumulativeWeight += availableItems[j].weight;
                if (random <= cumulativeWeight) {
                    const selectedItem = availableItems.splice(j, 1)[0];
                    results.push({
                        id: selectedItem.id,
                        value: selectedItem.value,
                        weight: selectedItem.weight,
                        metadata: selectedItem.metadata
                    });
                    break;
                }
            }
        }

        return results;
    }

    /**
     * Tirage uniforme (fallback)
     * @private
     */
    _tirageUniforme(items, count, withReplacement = true) {
        const results = [];
        const availableItems = withReplacement ? items : [...items];
        const maxCount = withReplacement ? count : Math.min(count, availableItems.length);

        for (let i = 0; i < maxCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const selectedItem = withReplacement ? 
                availableItems[randomIndex] : 
                availableItems.splice(randomIndex, 1)[0];
                
            results.push({
                id: selectedItem.id,
                value: selectedItem.value,
                weight: selectedItem.weight,
                metadata: selectedItem.metadata
            });
        }

        return results;
    }

    /**
     * Enregistre le tirage dans l'historique
     * @private
     */
    async _enregistrerTirage(drawData) {
        try {
            const query = `
                INSERT INTO oracle_draws (
                    oracle_id, user_id, session_id, results, filters_applied, 
                    draw_count, ip_address, user_agent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

            await db.run(query, [
                drawData.oracle_id,
                drawData.user_id,
                drawData.session_id,
                JSON.stringify(drawData.results),
                drawData.filters_applied ? JSON.stringify(drawData.filters_applied) : null,
                drawData.draw_count,
                drawData.ip_address,
                drawData.user_agent
            ]);

        } catch (error) {
            // Log l'erreur mais ne fait pas échouer le tirage
            this.logError(error, { context: 'enregistrement_historique_tirage' });
        }
    }

    /**
     * Filtre les résultats selon les permissions utilisateur
     * @private
     */
    _filtrerResultatSelonPermissions(result, userRole) {
        const filtered = {
            id: result.id,
            value: result.value,
            metadata: result.metadata || {}
        };

        // Les utilisateurs premium et admin voient les poids
        if (userRole === 'PREMIUM' || userRole === 'ADMIN') {
            filtered.weight = result.weight;
        }

        // Filtrer les métadonnées sensibles pour les utilisateurs standards
        if (userRole === 'UTILISATEUR' && filtered.metadata) {
            const publicMetadata = { ...filtered.metadata };
            delete publicMetadata.admin_only;
            delete publicMetadata.internal;
            filtered.metadata = publicMetadata;
        }

        return filtered;
    }

    /**
     * Récupère les oracles accessibles à un utilisateur
     */
    async listerOraclesAccessibles(userRole = 'UTILISATEUR', page = 1, limit = 20) {
        try {
            const result = await this.oracleModel.listerAvecStats(userRole, page, limit);
            
            // Filtrer les données selon les permissions
            result.data = result.data.map(oracle => 
                this.oracleModel.filterByPermission(oracle, userRole)
            );

            this.log('info', 'Liste des oracles récupérée', {
                user_role: userRole,
                page,
                limit,
                total: result.pagination.total
            });

            return result;

        } catch (error) {
            this.logError(error, { user_role: userRole, page, limit });
            throw error;
        }
    }

    /**
     * Récupère un oracle avec ses détails
     */
    async obtenirOracle(oracleId, userRole = 'UTILISATEUR', includeItems = false) {
        try {
            const oracle = includeItems ? 
                await this.oracleModel.findWithItems(oracleId) : 
                await this.oracleModel.findById(oracleId);

            if (!oracle) {
                throw new Error('Oracle introuvable');
            }

            // Vérifier les permissions
            if (oracle.premium_required && userRole === 'UTILISATEUR') {
                throw new Error('Accès premium requis');
            }

            // Filtrer selon les permissions
            const filteredOracle = this.oracleModel.filterByPermission(oracle, userRole);

            this.log('info', 'Oracle récupéré', {
                oracle_id: oracleId,
                user_role: userRole,
                include_items: includeItems
            });

            return filteredOracle;

        } catch (error) {
            this.logError(error, { oracle_id: oracleId, user_role: userRole });
            throw error;
        }
    }

    /**
     * Recherche d'oracles
     */
    async rechercherOracles(query, userRole = 'UTILISATEUR', limit = 20) {
        try {
            if (!query || query.trim().length < 2) {
                throw new Error('Requête de recherche trop courte (minimum 2 caractères)');
            }

            const oracles = await this.oracleModel.rechercher(query, userRole, limit);

            // Filtrer selon les permissions
            const filteredOracles = oracles.map(oracle => 
                this.oracleModel.filterByPermission(oracle, userRole)
            );

            this.log('info', 'Recherche d\'oracles effectuée', {
                query,
                user_role: userRole,
                results_count: filteredOracles.length
            });

            return filteredOracles;

        } catch (error) {
            this.logError(error, { query, user_role: userRole });
            throw error;
        }
    }

    /**
     * Statistiques d'usage d'un oracle
     */
    async obtenirStatistiques(oracleId, userRole = 'UTILISATEUR') {
        try {
            // Vérifier l'existence et les permissions
            const oracle = await this.oracleModel.findById(oracleId);
            if (!oracle) {
                throw new Error('Oracle introuvable');
            }

            if (oracle.premium_required && userRole === 'UTILISATEUR') {
                throw new Error('Accès premium requis');
            }

            // Récupérer les statistiques
            const stats = await this.oracleModel.getStats(oracleId);

            // Filtrer selon les permissions (admins voient tout, autres ont une vue limitée)
            if (userRole !== 'ADMIN') {
                delete stats.unique_users;
            }

            this.log('info', 'Statistiques d\'oracle récupérées', {
                oracle_id: oracleId,
                user_role: userRole
            });

            return stats;

        } catch (error) {
            this.logError(error, { oracle_id: oracleId, user_role: userRole });
            throw error;
        }
    }

    /**
     * Valide les filtres de tirage
     */
    validateFilters(filters, oracle) {
        if (!filters || Object.keys(filters).length === 0) {
            return true;
        }

        // Validation basique du format JSON
        if (typeof filters !== 'object') {
            throw new Error('Les filtres doivent être un objet JSON valide');
        }

        // Validation des valeurs de filtres
        Object.entries(filters).forEach(([key, value]) => {
            if (key.includes('$') || key.includes('.')) {
                throw new Error('Clés de filtres non autorisées');
            }

            if (Array.isArray(value)) {
                if (value.length === 0 || value.length > 50) {
                    throw new Error('Tableau de filtres invalide');
                }
            }
        });

        return true;
    }

    /**
     * Génère des statistiques de distribution des tirages
     */
    async analyserDistribution(oracleId, userRole = 'ADMIN', limite = 30) {
        try {
            if (userRole !== 'ADMIN') {
                throw new Error('Accès administrateur requis');
            }

            const query = `
                SELECT 
                    item_id,
                    item_value,
                    COUNT(*) as draw_count,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
                FROM (
                    SELECT 
                        (result->>'id')::uuid as item_id,
                        result->>'value' as item_value
                    FROM oracle_draws, 
                         jsonb_array_elements(results) as result
                    WHERE oracle_id = $1
                    AND created_at >= NOW() - INTERVAL '${limite} days'
                ) draws
                GROUP BY item_id, item_value
                ORDER BY draw_count DESC
                LIMIT 100
            `;

            const distribution = await db.all(query, [oracleId]);

            this.log('info', 'Analyse de distribution effectuée', {
                oracle_id: oracleId,
                periode_jours: limite,
                items_analyses: distribution.length
            });

            return distribution;

        } catch (error) {
            this.logError(error, { oracle_id: oracleId, user_role: userRole });
            throw error;
        }
    }

    /**
     * Liste les oracles accessibles pour un système de jeu spécifique
     * @param {string} gameSystem - Code du système de jeu
     * @param {string} userRole - Rôle de l'utilisateur
     * @param {number} page - Page pour la pagination
     * @param {number} limit - Nombre d'éléments par page
     * @returns {Promise<Object>} Liste paginée des oracles
     */
    async listerOraclesParSysteme(gameSystem, userRole = 'UTILISATEUR', page = 1, limit = 20) {
        try {
            const result = await this.oracleModel.listerAvecStatsParSysteme(gameSystem, userRole, page, limit);
            
            // Filtrer les données selon les permissions
            result.data = result.data.map(oracle => 
                this.oracleModel.filterByPermission(oracle, userRole)
            );

            this.log('info', 'Liste des oracles par système récupérée', {
                game_system: gameSystem,
                user_role: userRole,
                page,
                limit,
                total: result.pagination.total
            });

            return result;
        } catch (error) {
            this.logError(error, { game_system: gameSystem, user_role: userRole, page, limit });
            throw error;
        }
    }
}

module.exports = OracleService;