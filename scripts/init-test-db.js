#!/usr/bin/env node

/**
 * Script pour initialiser la base de données de test
 * Force l'utilisation de l'environnement de test
 */

// FORCER NODE_ENV=test AVANT tout import
process.env.NODE_ENV = 'test';

const path = require('path');

// Charger la configuration de test
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), override: true });

console.log('🧪 Initialisation de la base de données de test');
console.log('==============================================\n');

console.log(`📁 Environnement: ${process.env.NODE_ENV}`);
console.log(`🗄️  Base de données: ${process.env.POSTGRES_DB}`);
console.log(`🏠 Host: ${process.env.POSTGRES_HOST}`);
console.log('');

// Import des modules après configuration
const db = require('../src/database/db');

/**
 * Vérifier l'état des tables
 */
async function verifierTables() {
    try {
        const tablesResult = await db.all(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log(`📋 Tables existantes (${tablesResult.length}):`);
        if (tablesResult.length === 0) {
            console.log('   ❌ Aucune table trouvée');
        } else {
            tablesResult.forEach(table => {
                console.log(`   ✅ ${table.table_name}`);
            });
        }
        
        return tablesResult.length;
    } catch (error) {
        console.log('❌ Erreur lors de la vérification des tables:', error.message);
        return 0;
    }
}

/**
 * Initialiser les tables de base
 */
async function initialiserTablesBase() {
    console.log('\n🏗️  Initialisation des tables de base...');
    
    try {
        const { initializeDatabase } = require('../src/database/init');
        await initializeDatabase();
        console.log('   ✅ Tables de base créées');
        return true;
    } catch (error) {
        console.log('❌ Erreur lors de l\'initialisation:', error.message);
        return false;
    }
}

/**
 * Exécuter les migrations
 */
async function executerMigrations() {
    console.log('\n🔄 Exécution des migrations...');
    
    try {
        // Importer le script de migration
        const { executerMigration, listerMigrations } = require('./migrate-db-functions');
        
        const migrations = await listerMigrations();
        console.log(`📄 ${migrations.length} migration(s) trouvée(s)`);
        
        let success = 0;
        for (const migration of migrations) {
            console.log(`\n🔄 ${migration}...`);
            const result = await executerMigration(migration);
            if (result) {
                success++;
                console.log(`   ✅ Réussie`);
            } else {
                console.log(`   ❌ Échec`);
            }
        }
        
        console.log(`\n📊 Résultat: ${success}/${migrations.length} migrations réussies`);
        return success;
        
    } catch (error) {
        console.log('❌ Erreur lors des migrations:', error.message);
        return 0;
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        // Vérifier l'état initial
        const tablesInitiales = await verifierTables();
        
        if (tablesInitiales === 0) {
            console.log('\n🚀 Base de données vide, initialisation...');
            
            // Étape 1: Créer les tables de base
            const initOk = await initialiserTablesBase();
            if (!initOk) {
                throw new Error('Échec de l\'initialisation des tables de base');
            }
        } else {
            console.log('\n✅ Base de données déjà initialisée');
        }
        
        // Toujours appliquer les migrations (au cas où il y en a de nouvelles)
        console.log('\n🔄 Vérification des migrations...');
        await executerMigrations();
        
        // Vérifier l'état final
        console.log('\n🔍 Vérification finale...');
        await verifierTables();
        
        console.log('\n🎉 Base de données de test prête !');
        
    } catch (error) {
        console.error('\n💥 Erreur fatale:', error.message);
        process.exit(1);
    }
}

// Lancement si appelé directement
if (require.main === module) {
    main();
}