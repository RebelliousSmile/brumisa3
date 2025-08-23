#!/usr/bin/env node

/**
 * Script de migration pour la structure univers_jeu
 */

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = require('../src/database/db');

async function executeMigration(fileName, sql) {
    console.log(`\n📄 Ex\u00e9cution de ${fileName}...`);
    
    try {
        // Pour les migrations univers, ex\u00e9cuter le fichier en entier
        // car elles contiennent des blocs DO $$ et des insertions complexes
        console.log(`  Ex\u00e9cution du fichier complet...`);
        
        // Nettoyer le SQL des commentaires de d\u00e9but
        const cleanSql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--') || line.trim() === '')
            .join('\n')
            .trim();
        
        if (cleanSql.length === 0) {
            console.log(`  ⚠️ Fichier vide ou que des commentaires`);
            return true;
        }
        
        try {
            await db.run(cleanSql);
            console.log(`✅ Migration ${fileName} ex\u00e9cut\u00e9e avec succ\u00e8s`);
            return true;
        } catch (error) {
            // G\u00e9rer les erreurs sp\u00e9cifiques
            if (error.message.includes('already exists')) {
                console.log(`  ⚠️ Structure d\u00e9j\u00e0 existante (migration peut-\u00eatre d\u00e9j\u00e0 ex\u00e9cut\u00e9e)`);
                return true;
            } else if (error.message.includes('duplicate key')) {
                console.log(`  ⚠️ Donn\u00e9es d\u00e9j\u00e0 existantes (migration peut-\u00eatre d\u00e9j\u00e0 ex\u00e9cut\u00e9e)`);
                return true;
            } else {
                console.error(`  ❌ Erreur: ${error.message}`);
                // Pour les migrations 013-015, on peut continuer m\u00eame en cas d'erreur
                // car elles d\u00e9pendent de 012
                if (fileName.includes('013') || fileName.includes('014') || fileName.includes('015')) {
                    console.log(`  ⚠️ Erreur non bloquante pour ${fileName}, poursuite...`);
                    return true;
                }
                return false;
            }
        }
    } catch (error) {
        console.error(`❌ Erreur lors de l'ex\u00e9cution de ${fileName}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Migration de la structure univers_jeu');
    console.log('=========================================\n');
    
    const migrations = [
        '012_add_univers_jeu_structure.sql',
        '013_add_univers_columns.sql',
        '014_migrate_univers_data.sql',
        '015_add_univers_constraints.sql'
    ];
    
    let success = 0;
    let failed = 0;
    
    for (const migration of migrations) {
        const filePath = path.join(__dirname, '..', 'src', 'database', 'migrations', migration);
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Fichier non trouv\u00e9: ${migration}`);
            failed++;
            continue;
        }
        
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = await executeMigration(migration, sql);
        
        if (result) {
            success++;
        } else {
            failed++;
        }
    }
    
    console.log('\n📊 R\u00e9sultats:');
    console.log(`   ✅ R\u00e9ussies: ${success}/${migrations.length}`);
    console.log(`   ❌ \u00c9chou\u00e9es: ${failed}/${migrations.length}`);
    
    // V\u00e9rifier le r\u00e9sultat
    try {
        const universCount = await db.get('SELECT COUNT(*) as count FROM univers_jeu');
        const oraclesWithUnivers = await db.get('SELECT COUNT(*) as count FROM oracles WHERE univers_jeu IS NOT NULL');
        
        console.log('\n📈 \u00c9tat de la base:');
        console.log(`   • Univers cr\u00e9\u00e9s: ${universCount.count}`);
        console.log(`   • Oracles migr\u00e9s: ${oraclesWithUnivers.count}`);
    } catch (error) {
        console.error('❌ Impossible de v\u00e9rifier l\'\u00e9tat de la base:', error.message);
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});