const db = require('../src/database/db');

/**
 * Script pour tester la requête problématique de la page /oracles
 */
async function testOracleQuery() {
    console.log('=== Test de la requête Oracle ===\n');
    
    try {
        // Simuler les paramètres de la requête
        const userRole = 'UTILISATEUR';
        const page = 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        
        let whereClause = 'o.is_active = $1';
        let params = [true];
        let paramCount = 1;
        
        // Filtre pour utilisateurs standards
        if (userRole === 'UTILISATEUR') {
            paramCount++;
            whereClause += ` AND o.premium_required = $${paramCount}`;
            params.push(false);
        }
        
        // Requête originale qui pose problème
        console.log('1. Test de la requête originale avec GROUP BY complet:');
        const queryFixed = `
            SELECT 
                o.id,
                o.name,
                o.description,
                o.premium_required,
                o.total_weight,
                o.filters,
                o.is_active,
                o.created_at,
                o.updated_at,
                o.created_by,
                o.game_system,
                COUNT(oi.id) as total_items,
                COUNT(CASE WHEN oi.is_active THEN 1 END) as active_items,
                COALESCE(draw_stats.total_draws, 0) as total_draws,
                u.nom as creator_name,
                u.id as creator_id,
                u.role as creator_role
            FROM oracles o
            LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
            LEFT JOIN (
                SELECT oracle_id, COUNT(*) as total_draws
                FROM oracle_draws 
                GROUP BY oracle_id
            ) draw_stats ON o.id = draw_stats.oracle_id
            LEFT JOIN utilisateurs u ON o.created_by = u.id
            WHERE ${whereClause}
            GROUP BY o.id, o.name, o.description, o.premium_required, o.total_weight, 
                     o.filters, o.is_active, o.created_at, o.updated_at, o.created_by, 
                     o.game_system, draw_stats.total_draws, u.nom, u.id, u.role
            ORDER BY o.name ASC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        
        params.push(limit, offset);
        
        try {
            const rows = await db.all(queryFixed, params);
            console.log(`✓ Requête réussie! ${rows.length} oracles récupérés\n`);
            
            if (rows.length > 0) {
                console.log('Premier oracle:');
                console.log({
                    id: rows[0].id,
                    name: rows[0].name,
                    game_system: rows[0].game_system,
                    total_items: rows[0].total_items,
                    active_items: rows[0].active_items
                });
            }
        } catch (error) {
            console.error('✗ Erreur sur la requête:', error.message);
        }
        
        // Test d'une version simplifiée
        console.log('\n2. Test d\'une requête simplifiée (sans GROUP BY sur toutes les colonnes):');
        const querySimplified = `
            WITH oracle_stats AS (
                SELECT 
                    o.id,
                    COUNT(oi.id) as total_items,
                    COUNT(CASE WHEN oi.is_active THEN 1 END) as active_items
                FROM oracles o
                LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
                GROUP BY o.id
            ),
            draw_stats AS (
                SELECT oracle_id, COUNT(*) as total_draws
                FROM oracle_draws 
                GROUP BY oracle_id
            )
            SELECT 
                o.*,
                os.total_items,
                os.active_items,
                COALESCE(ds.total_draws, 0) as total_draws,
                u.nom as creator_name,
                u.id as creator_id,
                u.role as creator_role
            FROM oracles o
            LEFT JOIN oracle_stats os ON o.id = os.id
            LEFT JOIN draw_stats ds ON o.id = ds.oracle_id
            LEFT JOIN utilisateurs u ON o.created_by = u.id
            WHERE ${whereClause}
            ORDER BY o.name ASC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        
        try {
            const rows2 = await db.all(querySimplified, params);
            console.log(`✓ Requête simplifiée réussie! ${rows2.length} oracles récupérés\n`);
        } catch (error) {
            console.error('✗ Erreur sur la requête simplifiée:', error.message);
        }
        
        // Test direct de la méthode du modèle
        console.log('3. Test direct de la méthode Oracle.listerAvecStats:');
        const Oracle = require('../src/models/Oracle');
        const oracleModel = new Oracle();
        
        try {
            const result = await oracleModel.listerAvecStats('UTILISATEUR', 1, 20);
            console.log(`✓ Méthode listerAvecStats réussie!`);
            console.log(`Oracles: ${result.data.length}`);
            console.log(`Total: ${result.pagination.total}`);
        } catch (error) {
            console.error('✗ Erreur sur listerAvecStats:', error.message);
            console.error('Stack:', error.stack);
        }
        
    } catch (error) {
        console.error('Erreur générale:', error);
    } finally {
        await db.close();
    }
}

// Exécuter le test
testOracleQuery().catch(console.error);