#!/usr/bin/env node

/**
 * Script d'injection directe d'oracles (contourne BaseModel)
 * Usage: node scripts/inject-oracle-direct.js fichier.json
 */

const path = require('path');
const fs = require('fs').promises;

// Configuration de l'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = require('../src/database/db');

/**
 * Injection directe d'oracle
 */
async function injecterOracle(fichierJSON) {
    console.log(`📂 Lecture de ${fichierJSON}...`);
    
    // Lire le fichier
    const contenu = await fs.readFile(fichierJSON, 'utf-8');
    const donnees = JSON.parse(contenu);
    
    console.log(`🎲 Oracle: ${donnees.oracle.name}`);
    console.log(`📋 Éléments: ${donnees.items.length}`);
    
    return await db.transaction(async (tx) => {
        // 1. Créer l'oracle
        const oracleResult = await db.get(`
            INSERT INTO oracles (name, description, premium_required, is_active, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name
        `, [
            donnees.oracle.name,
            donnees.oracle.description || null,
            donnees.oracle.premium_required || false,
            donnees.oracle.is_active !== false,
            1 // ID admin par défaut
        ]);
        
        console.log(`   ✅ Oracle créé (ID: ${oracleResult.id})`);
        
        // 2. Créer les éléments
        let totalWeight = 0;
        for (const item of donnees.items) {
            await db.run(`
                INSERT INTO oracle_items (oracle_id, value, weight, metadata, is_active)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                oracleResult.id,
                item.value,
                item.weight || 1,
                item.metadata ? JSON.stringify(item.metadata) : null,
                item.is_active !== false
            ]);
            
            totalWeight += item.weight || 1;
        }
        
        console.log(`   🎯 ${donnees.items.length} éléments ajoutés (poids total: ${totalWeight})`);
        
        // 3. Mettre à jour le poids total
        await db.run(`
            UPDATE oracles SET total_weight = $1 WHERE id = $2
        `, [totalWeight, oracleResult.id]);
        
        return oracleResult;
    });
}

async function main() {
    const fichier = process.argv[2];
    
    if (!fichier) {
        console.log('Usage: node scripts/inject-oracle-direct.js fichier.json');
        process.exit(1);
    }
    
    console.log('🎲 Injection directe d\'oracle');
    console.log('=============================\n');
    
    try {
        const oracle = await injecterOracle(fichier);
        
        console.log('\n🎉 Oracle injecté avec succès !');
        console.log(`   📝 Nom: ${oracle.name}`);
        console.log(`   🆔 ID: ${oracle.id}`);
        console.log(`   🌐 URL: http://localhost:3074/oracles/${oracle.id}`);
        
    } catch (error) {
        console.log('\n❌ Erreur:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.log('\nStack:', error.stack);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}