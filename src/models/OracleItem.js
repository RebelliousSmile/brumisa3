const BaseModel = require('./BaseModel');

/**
 * Modèle OracleItem - Gestion des items pondérés dans les oracles
 */
class OracleItem extends BaseModel {
    constructor() {
        super('oracle_items', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'oracle_id', 'value', 'weight', 'metadata', 'is_active'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'created_at'];
        
        // Conversions automatiques
        this.casts = {
            weight: 'integer',
            is_active: 'boolean',
            metadata: 'json',
            created_at: 'date'
        };
        
        // Pas de gestion automatique des timestamps (seulement created_at)
        this.timestamps = false;
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Oracle ID requis
        if (!data.oracle_id) {
            erreurs.push('ID Oracle requis');
        }

        // Valeur requise
        if (!data.value || data.value.trim().length === 0) {
            erreurs.push('Valeur requise');
        }

        // Poids valide
        if (data.weight !== undefined) {
            const weight = parseInt(data.weight);
            if (isNaN(weight) || weight < 0) {
                erreurs.push('Poids doit être un nombre positif ou zéro');
            }
        }

        // Oracle parent existant
        if (data.oracle_id) {
            const Oracle = require('./Oracle');
            const oracleModel = new Oracle();
            const oracle = await oracleModel.findById(data.oracle_id);
            if (!oracle) {
                erreurs.push('Oracle parent introuvable');
            }
        }

        // Validation des métadonnées si présentes
        if (data.metadata) {
            try {
                if (typeof data.metadata === 'string') {
                    JSON.parse(data.metadata);
                }
            } catch (e) {
                erreurs.push('Format de métadonnées invalide (doit être un JSON valide)');
            }
        }

        // Unicité de la valeur dans l'oracle (optionnel selon les besoins)
        if (data.oracle_id && data.value) {
            const whereClause = operation === 'create' ? 
                'oracle_id = ? AND value = ?' : 
                'oracle_id = ? AND value = ? AND id != ?';
            const params = operation === 'create' ? 
                [data.oracle_id, data.value.trim()] : 
                [data.oracle_id, data.value.trim(), data.id];
                
            const existing = await this.findOne(whereClause, params);
            if (existing) {
                erreurs.push('Cette valeur existe déjà dans cet oracle');
            }
        }

        if (erreurs.length > 0) {
            throw new Error(`Erreurs de validation: ${erreurs.join(', ')}`);
        }

        return true;
    }

    /**
     * Hook avant création
     */
    async beforeCreate(data) {
        // Normaliser la valeur
        if (data.value) {
            data.value = data.value.trim();
        }

        // Poids par défaut
        if (data.weight === undefined) {
            data.weight = 1;
        }

        // Statut actif par défaut
        if (data.is_active === undefined) {
            data.is_active = true;
        }

        return data;
    }

    /**
     * Hook avant mise à jour
     */
    async beforeUpdate(data) {
        // Normaliser la valeur
        if (data.value) {
            data.value = data.value.trim();
        }

        return data;
    }

    /**
     * Récupère tous les items d'un oracle
     */
    async findByOracle(oracleId, includeInactive = false) {
        const whereClause = includeInactive ? 
            'oracle_id = ?' : 
            'oracle_id = ? AND is_active = ?';
        const params = includeInactive ? [oracleId] : [oracleId, true];

        return await this.findAll(
            whereClause, 
            params,
            'weight DESC, value ASC'
        );
    }

    /**
     * Récupère les items actifs d'un oracle avec filtrage
     */
    async findActiveWithFilters(oracleId, filters = null) {
        let whereClause = 'oracle_id = ? AND is_active = ?';
        let params = [oracleId, true];

        // Application des filtres sur les métadonnées
        if (filters && Object.keys(filters).length > 0) {
            const filterConditions = [];
            
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    // Filtre avec plusieurs valeurs possibles
                    const orConditions = value.map(v => `metadata->>'${key}' = ?`);
                    filterConditions.push(`(${orConditions.join(' OR ')})`);
                    params.push(...value);
                } else {
                    // Filtre avec une seule valeur
                    filterConditions.push(`metadata->>'${key}' = ?`);
                    params.push(value);
                }
            });

            if (filterConditions.length > 0) {
                whereClause += ' AND ' + filterConditions.join(' AND ');
            }
        }

        return await this.findAll(
            whereClause, 
            params,
            'weight DESC, value ASC'
        );
    }

    /**
     * Récupère le poids total des items actifs d'un oracle
     */
    async getTotalWeight(oracleId, filters = null) {
        const db = require('../database/db');
        
        let whereClause = 'oracle_id = $1 AND is_active = $2';
        let params = [oracleId, true];
        let paramCount = 2;

        // Application des filtres
        if (filters && Object.keys(filters).length > 0) {
            const filterConditions = [];
            
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    const orConditions = value.map(() => {
                        paramCount++;
                        return `metadata->>'${key}' = $${paramCount}`;
                    });
                    filterConditions.push(`(${orConditions.join(' OR ')})`);
                    params.push(...value);
                } else {
                    paramCount++;
                    filterConditions.push(`metadata->>'${key}' = $${paramCount}`);
                    params.push(value);
                }
            });

            if (filterConditions.length > 0) {
                whereClause += ' AND ' + filterConditions.join(' AND ');
            }
        }

        const query = `SELECT COALESCE(SUM(weight), 0) as total_weight FROM oracle_items WHERE ${whereClause}`;
        const result = await db.get(query, params);
        
        return result ? parseInt(result.total_weight) : 0;
    }

    /**
     * Recherche d'items par valeur
     */
    async searchInOracle(oracleId, query, limit = 20) {
        return await this.findAll(
            'oracle_id = ? AND is_active = ? AND value ILIKE ?',
            [oracleId, true, `%${query}%`],
            'weight DESC, value ASC',
            limit
        );
    }

    /**
     * Met à jour le poids de plusieurs items
     */
    async updateWeights(updates) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            const promises = updates.map(update => {
                if (!update.id || update.weight === undefined) {
                    throw new Error('ID et poids requis pour chaque mise à jour');
                }
                
                return this.update(update.id, { weight: update.weight });
            });
            
            return await Promise.all(promises);
        });
    }

    /**
     * Duplique un item dans le même oracle ou un autre
     */
    async duplicate(itemId, targetOracleId = null) {
        const sourceItem = await this.findById(itemId);
        if (!sourceItem) {
            throw new Error('Item source introuvable');
        }

        const newItemData = {
            oracle_id: targetOracleId || sourceItem.oracle_id,
            value: `${sourceItem.value} (copie)`,
            weight: sourceItem.weight,
            metadata: sourceItem.metadata,
            is_active: sourceItem.is_active
        };

        return await this.create(newItemData);
    }

    /**
     * Import en lot d'items pour un oracle
     */
    async bulkImport(oracleId, items) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            const results = {
                success: 0,
                errors: [],
                items: []
            };

            for (let i = 0; i < items.length; i++) {
                try {
                    const itemData = {
                        oracle_id: oracleId,
                        value: items[i].value,
                        weight: items[i].weight || 1,
                        metadata: items[i].metadata || null,
                        is_active: items[i].is_active !== undefined ? items[i].is_active : true
                    };

                    const newItem = await this.create(itemData);
                    results.items.push(newItem);
                    results.success++;
                    
                } catch (error) {
                    results.errors.push({
                        index: i,
                        item: items[i],
                        error: error.message
                    });
                }
            }

            return results;
        });
    }

    /**
     * Désactive tous les items d'un oracle
     */
    async deactivateByOracle(oracleId) {
        const { sql, params } = this.convertPlaceholders(
            'UPDATE oracle_items SET is_active = ? WHERE oracle_id = ?',
            [false, oracleId]
        );
        
        const db = require('../database/db');
        return await db.run(sql, params);
    }

    /**
     * Réactive tous les items d'un oracle
     */
    async reactivateByOracle(oracleId) {
        const { sql, params } = this.convertPlaceholders(
            'UPDATE oracle_items SET is_active = ? WHERE oracle_id = ?',
            [true, oracleId]
        );
        
        const db = require('../database/db');
        return await db.run(sql, params);
    }

    /**
     * Supprime tous les items d'un oracle
     */
    async deleteByOracle(oracleId) {
        const { sql, params } = this.convertPlaceholders(
            'DELETE FROM oracle_items WHERE oracle_id = ?',
            [oracleId]
        );
        
        const db = require('../database/db');
        return await db.run(sql, params);
    }

    /**
     * Statistiques des items d'un oracle
     */
    async getOracleItemStats(oracleId) {
        const db = require('../database/db');
        
        const query = `
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN is_active THEN 1 END) as active_items,
                COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_items,
                COALESCE(SUM(weight), 0) as total_weight,
                COALESCE(SUM(CASE WHEN is_active THEN weight ELSE 0 END), 0) as active_weight,
                COALESCE(AVG(weight), 0) as average_weight,
                MIN(weight) as min_weight,
                MAX(weight) as max_weight
            FROM oracle_items 
            WHERE oracle_id = $1
        `;

        const result = await db.get(query, [oracleId]);
        
        return result ? {
            total_items: parseInt(result.total_items),
            active_items: parseInt(result.active_items),
            inactive_items: parseInt(result.inactive_items),
            total_weight: parseInt(result.total_weight),
            active_weight: parseInt(result.active_weight),
            average_weight: parseFloat(result.average_weight).toFixed(2),
            min_weight: parseInt(result.min_weight) || 0,
            max_weight: parseInt(result.max_weight) || 0
        } : null;
    }

    /**
     * Normalise les poids d'un oracle (redistribue pour totaliser 100)
     */
    async normalizeWeights(oracleId) {
        const items = await this.findByOracle(oracleId, false);
        if (items.length === 0) {
            return [];
        }

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) {
            return items;
        }

        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            const updatedItems = [];
            
            for (const item of items) {
                const normalizedWeight = Math.max(1, Math.round((item.weight / totalWeight) * 100));
                const updatedItem = await this.update(item.id, { weight: normalizedWeight });
                updatedItems.push(updatedItem);
            }
            
            return updatedItems;
        });
    }
}

module.exports = OracleItem;