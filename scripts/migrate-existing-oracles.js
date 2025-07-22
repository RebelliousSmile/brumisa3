#!/usr/bin/env node

/**
 * Script pour migrer les oracles existants avec leur système de jeu
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = require('../src/database/db');

async function migrerOraclesExistants() {
    console.log('🎮 Migration des oracles existants avec système de jeu');
    console.log('====================================================\n');

    try {
        // 1. Récupérer tous les oracles existants
        const oracles = await db.all(`
            SELECT id, name 
            FROM oracles 
            WHERE game_system IS NULL
        `);

        console.log(`📋 Oracles à migrer : ${oracles.length}\n`);

        if (oracles.length === 0) {
            console.log('✅ Aucun oracle à migrer, tous ont déjà un système de jeu défini');
            return true;
        }

        let migres = 0;

        // 2. Migrer chaque oracle selon son nom
        for (const oracle of oracles) {
            let gameSystem = null;
            
            console.log(`🔄 Migration: ${oracle.name}`);
            
            // Détecter le système de jeu basé sur le nom
            if (oracle.name.toLowerCase().includes('monsterhearts')) {
                gameSystem = 'monsterhearts';
            } else if (oracle.name.toLowerCase().includes('engrenages') || 
                      oracle.name.toLowerCase().includes('roue du temps')) {
                gameSystem = 'engrenages';
            } else if (oracle.name.toLowerCase().includes('metro') || 
                      oracle.name.toLowerCase().includes('2033')) {
                gameSystem = 'metro2033';
            } else if (oracle.name.toLowerCase().includes('mist') || 
                      oracle.name.toLowerCase().includes('engine')) {
                gameSystem = 'mistengine';
            }

            if (gameSystem) {
                await db.run(`
                    UPDATE oracles 
                    SET game_system = $1, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $2
                `, [gameSystem, oracle.id]);
                
                console.log(`   ✅ ${oracle.name} → ${gameSystem}`);
                migres++;
            } else {
                console.log(`   ⚠️  ${oracle.name} → système non détecté, reste NULL`);
            }
        }

        console.log(`\n📊 Résultats de migration:`);
        console.log(`   ✅ Migrés: ${migres}/${oracles.length}`);
        console.log(`   ⚠️  Non détectés: ${oracles.length - migres}/${oracles.length}`);

        // 3. Afficher un résumé par système
        console.log('\n📈 Résumé par système de jeu:');
        const resume = await db.all(`
            SELECT 
                game_system,
                COUNT(*) as nombre_oracles
            FROM oracles 
            GROUP BY game_system
            ORDER BY game_system
        `);

        for (const stat of resume) {
            const systeme = stat.game_system || 'Non défini';
            console.log(`   ${systeme}: ${stat.nombre_oracles} oracle(s)`);
        }

        return migres > 0;

    } catch (error) {
        console.log(`❌ Erreur lors de la migration: ${error.message}`);
        throw error;
    }
}

async function main() {
    try {
        const success = await migrerOraclesExistants();
        
        if (success) {
            console.log('\n🎉 Migration terminée avec succès !');
            console.log('💡 Étapes suivantes :');
            console.log('   1. Mettre à jour OracleService pour filtrer par système');
            console.log('   2. Créer une route /oracles/monsterhearts');
            console.log('   3. Modifier la page Monsterhearts pour afficher ses oracles');
        } else {
            console.log('\n✅ Aucune migration nécessaire');
        }
        
    } catch (error) {
        console.log('\n💥 Erreur fatale:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.log('Stack:', error.stack);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}