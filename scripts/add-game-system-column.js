#!/usr/bin/env node

/**
 * Script pour ajouter la colonne game_system à la table oracles
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = require('../src/database/db');

async function ajouterColonneGameSystem() {
    console.log('🎮 Ajout de la colonne game_system à la table oracles');
    console.log('====================================================\n');

    const requetes = [
        {
            nom: 'Ajout colonne game_system',
            sql: `
                ALTER TABLE oracles 
                ADD COLUMN IF NOT EXISTS game_system VARCHAR(50);
            `
        },
        {
            nom: 'Index sur game_system',
            sql: `
                CREATE INDEX IF NOT EXISTS idx_oracles_game_system ON oracles(game_system);
            `
        },
        {
            nom: 'Index composé game_system + is_active',
            sql: `
                CREATE INDEX IF NOT EXISTS idx_oracles_game_system_active ON oracles(game_system, is_active);
            `
        }
    ];

    let success = 0;
    let errors = 0;

    for (const requete of requetes) {
        console.log(`🔄 ${requete.nom}...`);
        
        try {
            await db.run(requete.sql);
            console.log(`   ✅ OK`);
            success++;
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
            errors++;
        }
    }

    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Réussies: ${success}/${requetes.length}`);
    console.log(`   ❌ Erreurs: ${errors}/${requetes.length}`);

    return success > 0;
}

async function main() {
    try {
        const success = await ajouterColonneGameSystem();
        
        if (success) {
            console.log('\n🎉 Colonne game_system ajoutée avec succès !');
            console.log('💡 Étapes suivantes :');
            console.log('   1. node scripts/migrate-existing-oracles.js');
            console.log('   2. Mettre à jour les services Oracle pour filtrer par système');
        } else {
            console.log('\n❌ Échec de l\'ajout de la colonne');
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