const db = require('../src/database/db');

/**
 * Script de debug pour vérifier l'état de la table oracles
 */
async function debugOracles() {
    console.log('=== Debug Oracles ===\n');
    
    try {
        // 1. Vérifier la structure de la table oracles
        console.log('1. Structure de la table oracles:');
        const tableInfo = await db.all(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'oracles' 
            ORDER BY ordinal_position
        `);
        console.table(tableInfo);
        
        // 2. Compter les oracles
        console.log('\n2. Nombre d\'oracles dans la table:');
        const count = await db.get('SELECT COUNT(*) as total FROM oracles');
        console.log(`Total: ${count.total} oracles\n`);
        
        // 3. Lister quelques oracles
        if (count.total > 0) {
            console.log('3. Premiers oracles:');
            const oracles = await db.all('SELECT * FROM oracles LIMIT 5');
            console.table(oracles);
        }
        
        // 4. Vérifier si la colonne game_system existe
        console.log('\n4. Vérification de la colonne game_system:');
        const hasGameSystem = tableInfo.some(col => col.column_name === 'game_system');
        console.log(`Colonne game_system présente: ${hasGameSystem ? 'OUI' : 'NON'}`);
        
        // 5. Si la colonne n'existe pas, afficher les migrations
        if (!hasGameSystem) {
            console.log('\n5. État des migrations:');
            try {
                const migrations = await db.all('SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 10');
                console.table(migrations);
            } catch (e) {
                console.log('Table migrations non trouvée');
            }
        }
        
        // 6. Tester la requête problématique
        console.log('\n6. Test de la requête problématique:');
        try {
            const testQuery = `
                SELECT 
                    o.*,
                    COUNT(oi.id) as total_items
                FROM oracles o
                LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
                WHERE o.is_active = $1
                GROUP BY o.id
                LIMIT 1
            `;
            const result = await db.get(testQuery, [true]);
            console.log('Requête sans game_system: OK');
            
            // Tester avec game_system si la colonne existe
            if (hasGameSystem) {
                const testQueryWithSystem = testQuery.replace('WHERE o.is_active = $1', 'WHERE o.is_active = $1 AND o.game_system = $2');
                const resultWithSystem = await db.get(testQueryWithSystem, [true, 'monsterhearts']);
                console.log('Requête avec game_system: OK');
            }
        } catch (error) {
            console.error('Erreur lors du test de requête:', error.message);
        }
        
        // 7. Vérifier les items
        console.log('\n7. Oracle items:');
        const itemCount = await db.get('SELECT COUNT(*) as total FROM oracle_items');
        console.log(`Total items: ${itemCount.total}`);
        
    } catch (error) {
        console.error('Erreur durant le debug:', error);
    } finally {
        await db.close();
    }
}

// Exécuter le debug
debugOracles().catch(console.error);