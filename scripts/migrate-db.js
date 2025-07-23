#!/usr/bin/env node

/**
 * Script d'exécution des migrations de base de données
 */

const path = require('path');
const fs = require('fs').promises;

// Configuration de l'environnement selon NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

console.log(`📁 Migration utilise l'environnement: ${process.env.NODE_ENV || 'development'} (${envFile})`);

// Import de la base de données
const db = require('../src/database/db');

/**
 * Exécuter une migration SQL
 */
async function executerMigration(fichierMigration) {
    const cheminFichier = path.join(__dirname, '..', 'src', 'database', 'migrations', fichierMigration);
    
    console.log(`📄 Lecture de ${fichierMigration}...`);
    
    try {
        const contenuSQL = await fs.readFile(cheminFichier, 'utf-8');
        
        console.log(`🔄 Exécution de la migration...`);
        
        // Pour les migrations PostgreSQL complexes, exécuter le fichier entier
        // car il peut contenir des fonctions avec des point-virgules internes
        if (contenuSQL.includes('CREATE OR REPLACE FUNCTION') || contenuSQL.includes('$$')) {
            // Exécuter le fichier complet pour les fonctions PL/pgSQL
            await db.run(contenuSQL);
        } else {
            // Diviser le fichier SQL en commandes individuelles pour les commandes simples
            const commandes = contenuSQL
                .split(';')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
            
            for (const commande of commandes) {
                if (commande.trim()) {
                    await db.run(commande);
                }
            }
        }
        
        console.log(`✅ Migration ${fichierMigration} exécutée avec succès`);
        return true;
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`❌ Fichier ${fichierMigration} non trouvé`);
        } else {
            console.log(`❌ Erreur lors de l'exécution de ${fichierMigration}:`);
            console.log(`   ${error.message}`);
        }
        return false;
    }
}

/**
 * Lister les migrations disponibles
 */
async function listerMigrations() {
    const dossierMigrations = path.join(__dirname, '..', 'src', 'database', 'migrations');
    
    try {
        const fichiers = await fs.readdir(dossierMigrations);
        const migrations = fichiers
            .filter(f => f.endsWith('.sql'))
            .sort();
        
        return migrations;
    } catch (error) {
        console.log('❌ Impossible de lire le dossier migrations');
        return [];
    }
}

/**
 * Vérifier l'état des tables oracles
 */
async function verifierTablesOracles() {
    try {
        const result = await db.get(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'oracles'
            ) as table_exists
        `);
        
        return result.table_exists;
    } catch (error) {
        return false;
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🗄️  Gestionnaire de migrations de base de données');
    console.log('================================================\n');
    
    const args = process.argv.slice(2);
    const commande = args[0];
    
    if (commande === 'list') {
        console.log('📋 Migrations disponibles:');
        const migrations = await listerMigrations();
        migrations.forEach((migration, index) => {
            console.log(`   ${index + 1}. ${migration}`);
        });
        return;
    }
    
    if (commande === 'check') {
        console.log('🔍 Vérification de l\'état des tables...');
        const tablesOracles = await verifierTablesOracles();
        console.log(`   Tables oracles: ${tablesOracles ? '✅ Créées' : '❌ Manquantes'}`);
        return;
    }
    
    if (commande === 'oracles') {
        console.log('🎲 Migration spécifique pour les oracles...');
        const success = await executerMigration('002_add_oracles_system.sql');
        
        if (success) {
            console.log('\n🎉 Tables d\'oracles créées !');
            console.log('💡 Vous pouvez maintenant utiliser:');
            console.log('   node scripts/injecter-oracle.js --fichier=oracle.json');
        }
        return;
    }
    
    if (commande && commande.endsWith('.sql')) {
        console.log(`🎯 Exécution de la migration spécifique: ${commande}`);
        await executerMigration(commande);
        return;
    }
    
    // Mode auto : exécuter toutes les migrations
    console.log('🚀 Exécution de toutes les migrations...\n');
    
    const migrations = await listerMigrations();
    let success = 0;
    let errors = 0;
    
    for (const migration of migrations) {
        const result = await executerMigration(migration);
        if (result) {
            success++;
        } else {
            errors++;
        }
        console.log(''); // Ligne vide entre les migrations
    }
    
    console.log('📊 Résultats des migrations:');
    console.log(`   ✅ Réussies: ${success}/${migrations.length}`);
    console.log(`   ❌ Erreurs: ${errors}/${migrations.length}`);
    
    if (success > 0) {
        console.log('\n🎉 Migrations terminées !');
    }
}

/**
 * Afficher l'aide
 */
function afficherAide() {
    console.log(`
🗄️  Gestionnaire de migrations de base de données
================================================

Usage:
  node scripts/migrate-db.js [commande]

Commandes:
  (aucune)           Exécuter toutes les migrations
  oracles            Créer uniquement les tables d'oracles  
  list               Lister les migrations disponibles
  check              Vérifier l'état des tables
  [fichier.sql]      Exécuter une migration spécifique
  help               Afficher cette aide

Exemples:
  # Exécuter toutes les migrations
  node scripts/migrate-db.js
  
  # Créer les tables d'oracles uniquement
  node scripts/migrate-db.js oracles
  
  # Vérifier l'état des tables
  node scripts/migrate-db.js check
  
  # Lister les migrations
  node scripts/migrate-db.js list
`);
}

// Gestion des arguments d'aide
if (process.argv.includes('--help') || process.argv.includes('help')) {
    afficherAide();
    process.exit(0);
}

// Lancement
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Erreur fatale:', error.message);
        process.exit(1);
    });
}