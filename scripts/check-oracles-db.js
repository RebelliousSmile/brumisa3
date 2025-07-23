#!/usr/bin/env node

const db = require('../src/database/db');

async function checkOracles() {
    try {
        const oracles = await db.all('SELECT id, name, game_system FROM oracles ORDER BY game_system, name');
        console.log('Oracles en base de données :');
        console.log('===========================');
        
        let currentSystem = null;
        for (const oracle of oracles) {
            if (oracle.game_system !== currentSystem) {
                console.log(`\n🎮 Système : ${oracle.game_system || 'Non défini'}`);
                console.log('----------------------------');
                currentSystem = oracle.game_system;
            }
            console.log(`  ${oracle.id}: ${oracle.name}`);
        }
        
        // Statistiques
        console.log('\n📊 Statistiques par système :');
        console.log('===============================');
        const stats = await db.all(`
            SELECT game_system, COUNT(*) as count 
            FROM oracles 
            GROUP BY game_system 
            ORDER BY game_system
        `);
        
        for (const stat of stats) {
            const system = stat.game_system || 'Non défini';
            console.log(`  ${system}: ${stat.count} oracle(s)`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error.message);
        process.exit(1);
    }
}

checkOracles();