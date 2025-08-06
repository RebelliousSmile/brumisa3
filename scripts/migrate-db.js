#!/usr/bin/env node

/**
 * Script de migration optimisé - Exécute uniquement les migrations fonctionnelles
 */

const path = require('path');
const fs = require('fs').promises;

// Configuration de l'environnement
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

console.log(`📁 Migration utilise l'environnement: ${process.env.NODE_ENV || 'development'} (${envFile})`);

// Import de la base de données
const db = require('../src/database/db');

/**
 * Liste des migrations dans l'ordre optimisé
 */
const MIGRATIONS_OPTIMISEES = [
    '000_add_auth_fields.sql',
    '001_add_system_rights_and_anonymous_users.sql', 
    '001b_finalize_anonymous_user.sql',
    '003_add_game_system_to_oracles.sql',
    '004_create_documents_system.sql',
    '005_update_tables.sql',
    '006_add_config_data.sql',
    '007_create_voting_and_moderation.sql',
    '008_insert_document_configuration.sql'
];

/**
 * Exécuter une migration SQL
 */
async function executerMigration(fichierMigration) {
    const cheminFichier = path.join(__dirname, '..', 'src', 'database', 'migrations', fichierMigration);
    
    console.log(`📄 Lecture de ${fichierMigration}...`);
    
    try {
        const contenuSQL = await fs.readFile(cheminFichier, 'utf-8');
        
        console.log(`🔄 Exécution de la migration...`);
        
        // Initialiser la base de données si nécessaire
        if (!db.isConnected) {
            await db.init();
        }

        // Diviser le fichier SQL en commandes individuelles
        const commandesBrutes = contenuSQL.split(';');
        console.log(`  📋 ${commandesBrutes.length} commandes trouvées`);
        
        const commandes = commandesBrutes
            .map(cmd => cmd.trim())
            .map(cmd => {
                // Enlever les commentaires de ligne mais garder la commande
                const lignes = cmd.split('\n');
                const lignesFiltrées = lignes.filter(ligne => !ligne.trim().startsWith('--') && ligne.trim() !== '');
                return lignesFiltrées.join('\n').trim();
            })
            .filter(cmd => cmd.length > 0 && cmd !== '');
        
        console.log(`  📋 ${commandes.length} commandes valides après filtrage`);
        
        // Exécuter chaque commande séparément
        for (let i = 0; i < commandes.length; i++) {
            const commande = commandes[i];
            if (commande.trim()) {
                console.log(`  ${i + 1}/${commandes.length} > ${commande.substring(0, 80)}...`);
                await db.run(commande);
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
 * Vérifier qu'une migration existe
 */
async function verifierMigration(fichierMigration) {
    const cheminFichier = path.join(__dirname, '..', 'src', 'database', 'migrations', fichierMigration);
    try {
        await fs.access(cheminFichier);
        return true;
    } catch {
        return false;
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🗄️  Gestionnaire de migrations optimisé');
    console.log('=========================================\n');
    
    console.log('🎯 Exécution des migrations dans l\'ordre optimisé...\n');
    
    let success = 0;
    let errors = 0;
    let skipped = 0;
    
    for (const migration of MIGRATIONS_OPTIMISEES) {
        const exists = await verifierMigration(migration);
        
        if (!exists) {
            console.log(`⏭️  Migration ${migration} ignorée (fichier non trouvé)`);
            skipped++;
            continue;
        }
        
        const result = await executerMigration(migration);
        if (result) {
            success++;
        } else {
            errors++;
        }
        console.log(''); // Ligne vide entre les migrations
    }
    
    console.log('📊 Résultats des migrations optimisées:');
    console.log(`   ✅ Réussies: ${success}/${MIGRATIONS_OPTIMISEES.length}`);
    console.log(`   ❌ Erreurs: ${errors}/${MIGRATIONS_OPTIMISEES.length}`);
    console.log(`   ⏭️  Ignorées: ${skipped}/${MIGRATIONS_OPTIMISEES.length}`);
    
    if (success > 0) {
        console.log('\n🎉 Migrations optimisées terminées !');
        console.log('\n📋 État du système après migration:');
        console.log('   • Tables utilisateurs, personnages, pdfs étendues');
        console.log('   • Tables documents, témoignages, newsletter créées');
        console.log('   • Système de votes sur documents opérationnel');
        console.log('   • Système de modération et mise en avant activé');
        console.log('   • Configuration des types de documents par système JDR');
        console.log('   • Utilisateur anonyme (ID=0) configuré');
    }
}

// Lancement
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Erreur fatale:', error.message);
        process.exit(1);
    });
}