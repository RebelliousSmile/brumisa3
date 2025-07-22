const db = require('../src/database/db');
const OracleService = require('../src/services/OracleService');

/**
 * Script de validation finale pour s'assurer que le système d'oracles fonctionne correctement
 */
async function testOraclesFinal() {
    console.log('=== Tests Finaux du Système d\'Oracles ===\n');
    
    try {
        // Test 1: Vérifier les données en base
        console.log('1. Vérification des données en base:');
        const totalOracles = await db.get('SELECT COUNT(*) as total FROM oracles WHERE is_active = $1', [true]);
        const totalItems = await db.get('SELECT COUNT(*) as total FROM oracle_items WHERE is_active = $1', [true]);
        const oraclesWithSystem = await db.get('SELECT COUNT(*) as total FROM oracles WHERE is_active = $1 AND game_system IS NOT NULL', [true]);
        
        console.log(`✓ Oracles actifs: ${totalOracles.total}`);
        console.log(`✓ Items actifs: ${totalItems.total}`);
        console.log(`✓ Oracles avec système: ${oraclesWithSystem.total}`);
        
        if (totalOracles.total === 0) {
            console.log('⚠ Aucun oracle trouvé - injectez des données de test');
            return;
        }
        
        // Test 2: Service OracleService
        console.log('\n2. Test du service Oracle:');
        const oracleService = new OracleService();
        
        // Test liste générale
        const listeGenerale = await oracleService.listerOraclesAccessibles('UTILISATEUR', 1, 20);
        console.log(`✓ Liste générale: ${listeGenerale.data.length} oracles (total: ${listeGenerale.pagination.total})`);
        
        // Test recherche
        const recherche = await oracleService.rechercherOracles('arme', 'UTILISATEUR', 10);
        console.log(`✓ Recherche 'arme': ${recherche.length} résultats`);
        
        // Test oracle spécifique
        if (listeGenerale.data.length > 0) {
            const premierOracle = listeGenerale.data[0];
            const oracleAvecItems = await oracleService.obtenirOracle(premierOracle.id, 'UTILISATEUR', true);
            console.log(`✓ Oracle spécifique: ${oracleAvecItems.name} avec ${oracleAvecItems.items?.length || 0} items`);
            
            // Test tirage
            if (oracleAvecItems.items && oracleAvecItems.items.length > 0) {
                const tirage = await oracleService.effectuerTirage(premierOracle.id, 3, null, true, 'UTILISATEUR');
                console.log(`✓ Tirage effectué: ${tirage.results.length} résultats`);
                console.log(`  Résultats: ${tirage.results.map(r => r.value).join(', ')}`);
            }
        }
        
        // Test 3: Vérification des systèmes de jeu
        console.log('\n3. Vérification des systèmes de jeu:');
        const systemesDisponibles = await db.all(`
            SELECT game_system, COUNT(*) as count 
            FROM oracles 
            WHERE is_active = $1 AND game_system IS NOT NULL 
            GROUP BY game_system
        `, [true]);
        
        systemesDisponibles.forEach(sys => {
            console.log(`✓ ${sys.game_system}: ${sys.count} oracles`);
        });
        
        // Test 4: Test des oracles par système
        if (systemesDisponibles.length > 0) {
            console.log('\n4. Test oracles par système:');
            const premierSysteme = systemesDisponibles[0].game_system;
            const oraclesSysteme = await oracleService.listerOraclesParSysteme(premierSysteme, 'UTILISATEUR', 1, 20);
            console.log(`✓ Oracles pour ${premierSysteme}: ${oraclesSysteme.data.length} trouvés`);
        }
        
        // Test 5: Statistiques
        console.log('\n5. Test des statistiques:');
        if (listeGenerale.data.length > 0) {
            const stats = await oracleService.obtenirStatistiques(listeGenerale.data[0].id, 'UTILISATEUR');
            console.log(`✓ Statistiques oracle: ${stats.total_items} items, ${stats.total_draws} tirages`);
        }
        
        console.log('\n🎉 Tous les tests passent ! Le système d\'oracles fonctionne correctement.');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await db.close();
    }
}

// Exécuter les tests
testOraclesFinal().catch(console.error);