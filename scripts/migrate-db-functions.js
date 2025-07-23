/**
 * Fonctions utilitaires pour les migrations de base de données
 * Partagées entre migrate-db.js et init-test-db.js
 */

const path = require('path');
const fs = require('fs').promises;

// Import de la base de données (doit être configuré avant appel)
const db = require('../src/database/db');

/**
 * Exécuter une migration SQL
 */
async function executerMigration(fichierMigration) {
    const cheminFichier = path.join(__dirname, '..', 'src', 'database', 'migrations', fichierMigration);
    
    try {
        const contenuSQL = await fs.readFile(cheminFichier, 'utf-8');
        
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

module.exports = {
    executerMigration,
    listerMigrations,
    verifierTablesOracles
};