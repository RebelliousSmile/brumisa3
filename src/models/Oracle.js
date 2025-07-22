const BaseModel = require('./BaseModel');
const OracleItem = require('./OracleItem');

/**
 * Modèle Oracle - Gestion des collections pour tirages pondérés
 */
class Oracle extends BaseModel {
    constructor() {
        super('oracles', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'name', 'description', 'premium_required', 'filters', 
            'is_active', 'created_by'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'total_weight', 'created_at', 'updated_at'];
        
        // Conversions automatiques
        this.casts = {
            premium_required: 'boolean',
            is_active: 'boolean',
            total_weight: 'integer',
            filters: 'json',
            created_at: 'date',
            updated_at: 'date'
        };
        
        // Gestion automatique des timestamps
        this.timestamps = true;
        
        // Instance du modèle OracleItem pour relations
        this.oracleItemModel = new OracleItem();
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Nom requis
        if (!data.name || data.name.trim().length < 3) {
            erreurs.push('Nom requis (minimum 3 caractères)');
        }

        // Nom unique
        if (data.name) {
            const existing = await this.findOne('name = ?', [data.name.trim()]);
            if (existing && (operation === 'create' || existing.id !== data.id)) {
                erreurs.push('Nom déjà utilisé');
            }
        }

        // Validation des filtres si présents
        if (data.filters) {
            try {
                if (typeof data.filters === 'string') {
                    JSON.parse(data.filters);
                }
            } catch (e) {
                erreurs.push('Format de filtres invalide (doit être un JSON valide)');
            }
        }

        // Utilisateur créateur existant si spécifié
        if (data.created_by && operation === 'create') {
            const Utilisateur = require('./Utilisateur');
            const utilisateurModel = new Utilisateur();
            const utilisateur = await utilisateurModel.findById(data.created_by);
            if (!utilisateur) {
                erreurs.push('Utilisateur créateur introuvable');
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
        // Normaliser le nom
        if (data.name) {
            data.name = data.name.trim();
        }

        // Valeurs par défaut
        if (data.premium_required === undefined) {
            data.premium_required = false;
        }
        
        if (data.is_active === undefined) {
            data.is_active = true;
        }

        return data;
    }

    /**
     * Hook avant mise à jour
     */
    async beforeUpdate(data) {
        // Normaliser le nom
        if (data.name) {
            data.name = data.name.trim();
        }

        return data;
    }

    /**
     * Récupère un oracle avec ses items
     */
    async findWithItems(id, includeInactive = false) {
        const oracle = await this.findById(id);
        if (!oracle) {
            return null;
        }

        const whereClause = includeInactive ? 
            'oracle_id = ?' : 
            'oracle_id = ? AND is_active = ?';
        const params = includeInactive ? [id] : [id, true];

        const items = await this.oracleItemModel.findAll(
            whereClause, 
            params,
            'weight DESC, value ASC'
        );

        return {
            ...oracle,
            items: items || []
        };
    }

    /**
     * Récupère les oracles actifs selon les permissions utilisateur
     */
    async findAccessible(userRole = 'UTILISATEUR', limit = null) {
        let whereClause = 'is_active = ?';
        let params = [true];

        // Les utilisateurs standards ne voient que les oracles non-premium
        if (userRole === 'UTILISATEUR') {
            whereClause += ' AND premium_required = ?';
            params.push(false);
        }

        return await this.findAll(
            whereClause,
            params,
            'name ASC',
            limit
        );
    }

    /**
     * Recherche d'oracles par nom ou description
     */
    async rechercher(query, userRole = 'UTILISATEUR', limit = 20) {
        let whereClause = 'is_active = ? AND (name ILIKE ? OR description ILIKE ?)';
        let params = [true, `%${query}%`, `%${query}%`];

        // Les utilisateurs standards ne voient que les oracles non-premium
        if (userRole === 'UTILISATEUR') {
            whereClause += ' AND premium_required = ?';
            params.push(false);
        }

        return await this.findAll(
            whereClause,
            params,
            'name ASC',
            limit
        );
    }

    /**
     * Statistiques d'un oracle
     */
    async getStats(id) {
        const db = require('../database/db');
        
        const statsQuery = `
            SELECT 
                COUNT(oi.id) as total_items,
                COUNT(CASE WHEN oi.is_active THEN 1 END) as active_items,
                COALESCE(SUM(oi.weight), 0) as total_weight,
                COALESCE(draw_stats.total_draws, 0) as total_draws,
                COALESCE(draw_stats.unique_users, 0) as unique_users,
                COALESCE(draw_stats.last_draw, NULL) as last_draw
            FROM oracles o
            LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
            LEFT JOIN (
                SELECT 
                    oracle_id,
                    COUNT(*) as total_draws,
                    COUNT(DISTINCT user_id) as unique_users,
                    MAX(created_at) as last_draw
                FROM oracle_draws 
                WHERE oracle_id = $1
                GROUP BY oracle_id
            ) draw_stats ON o.id = draw_stats.oracle_id
            WHERE o.id = $1
            GROUP BY o.id, draw_stats.total_draws, draw_stats.unique_users, draw_stats.last_draw
        `;

        const result = await db.get(statsQuery, [id]);
        return result || {
            total_items: 0,
            active_items: 0,
            total_weight: 0,
            total_draws: 0,
            unique_users: 0,
            last_draw: null
        };
    }

    /**
     * Clone un oracle avec ses items
     */
    async cloner(id, newName, adminUserId) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            // Récupérer l'oracle source
            const sourceOracle = await this.findWithItems(id, true);
            if (!sourceOracle) {
                throw new Error('Oracle source introuvable');
            }

            // Créer le nouvel oracle
            const oracleData = {
                name: newName,
                description: sourceOracle.description ? `Clone de: ${sourceOracle.description}` : `Clone de: ${sourceOracle.name}`,
                premium_required: sourceOracle.premium_required,
                filters: sourceOracle.filters,
                is_active: true,
                created_by: adminUserId
            };

            const newOracle = await this.create(oracleData);

            // Cloner les items
            for (const item of sourceOracle.items) {
                await this.oracleItemModel.create({
                    oracle_id: newOracle.id,
                    value: item.value,
                    weight: item.weight,
                    metadata: item.metadata,
                    is_active: item.is_active
                });
            }

            return await this.findWithItems(newOracle.id);
        });
    }

    /**
     * Désactive un oracle et ses items
     */
    async desactiver(id) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            // Désactiver l'oracle
            await this.update(id, { is_active: false });
            
            // Désactiver tous ses items
            const { sql, params } = this.convertPlaceholders(
                'UPDATE oracle_items SET is_active = ? WHERE oracle_id = ?',
                [false, id]
            );
            await tx.run(sql, params);
            
            return await this.findById(id);
        });
    }

    /**
     * Réactive un oracle et ses items
     */
    async reactiver(id) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            // Réactiver l'oracle
            await this.update(id, { is_active: true });
            
            // Réactiver tous ses items
            const { sql, params } = this.convertPlaceholders(
                'UPDATE oracle_items SET is_active = ? WHERE oracle_id = ?',
                [true, id]
            );
            await tx.run(sql, params);
            
            return await this.findById(id);
        });
    }

    /**
     * Supprime un oracle et toutes ses données associées
     */
    async supprimerCompletement(id) {
        const db = require('../database/db');
        
        return await db.transaction(async (tx) => {
            // Supprimer l'historique des tirages
            await tx.run('DELETE FROM oracle_draws WHERE oracle_id = $1', [id]);
            
            // Supprimer l'historique des modifications
            await tx.run('DELETE FROM oracle_edit_history WHERE oracle_id = $1', [id]);
            
            // Supprimer les brouillons
            await tx.run('DELETE FROM oracle_drafts WHERE oracle_id = $1', [id]);
            
            // Supprimer les imports liés
            await tx.run('UPDATE oracle_imports SET oracle_id = NULL WHERE oracle_id = $1', [id]);
            
            // Supprimer les assignations de catégories
            await tx.run('DELETE FROM oracle_category_assignments WHERE oracle_id = $1', [id]);
            
            // Les items sont supprimés automatiquement par CASCADE
            // Supprimer l'oracle lui-même
            return await this.delete(id);
        });
    }

    /**
     * Liste des oracles avec leurs statistiques de base
     */
    async listerAvecStats(userRole = 'UTILISATEUR', page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const db = require('../database/db');
        
        let whereClause = 'o.is_active = $1';
        let params = [true];
        let paramCount = 1;

        // Filtre pour utilisateurs standards
        if (userRole === 'UTILISATEUR') {
            paramCount++;
            whereClause += ` AND o.premium_required = $${paramCount}`;
            params.push(false);
        }

        const query = `
            SELECT 
                o.*,
                COUNT(oi.id) as total_items,
                COUNT(CASE WHEN oi.is_active THEN 1 END) as active_items,
                COALESCE(draw_stats.total_draws, 0) as total_draws
            FROM oracles o
            LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
            LEFT JOIN (
                SELECT oracle_id, COUNT(*) as total_draws
                FROM oracle_draws 
                GROUP BY oracle_id
            ) draw_stats ON o.id = draw_stats.oracle_id
            WHERE ${whereClause}
            GROUP BY o.id, draw_stats.total_draws
            ORDER BY o.name ASC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        params.push(limit, offset);
        const rows = await db.all(query, params);
        
        // Compte total pour pagination
        const totalQuery = `
            SELECT COUNT(*) as count 
            FROM oracles o 
            WHERE ${whereClause}
        `;
        const totalResult = await db.get(totalQuery, params.slice(0, paramCount));
        const total = totalResult.count;

        return {
            data: rows.map(row => this.castAttributes(row)),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    /**
     * Filtre les données selon les permissions utilisateur
     */
    filterByPermission(oracle, userRole = 'UTILISATEUR') {
        if (!oracle) return oracle;

        const filtered = { ...oracle };

        // Utilisateurs standards : masquer certaines informations
        if (userRole === 'UTILISATEUR') {
            delete filtered.total_weight;
            delete filtered.filters;
            delete filtered.created_by;
            
            // Masquer les poids des items si présents
            if (filtered.items) {
                filtered.items = filtered.items.map(item => {
                    const filteredItem = { ...item };
                    delete filteredItem.weight;
                    
                    // Filtrer les métadonnées sensibles si configuré
                    if (filteredItem.metadata && filteredItem.metadata.admin_only) {
                        delete filteredItem.metadata.admin_only;
                    }
                    
                    return filteredItem;
                });
            }
        }

        return filtered;
    }
}

module.exports = Oracle;