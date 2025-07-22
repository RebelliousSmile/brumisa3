#!/usr/bin/env node

/**
 * Script rapide pour injecter tous les oracles Monsterhearts
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { execSync } = require('child_process');

const oracleFiles = [
    'oracles_monsterhearts_revelations.json',
    'oracles_monsterhearts_relations.json', 
    'oracles_monsterhearts_monstruosites.json',
    'oracles_monsterhearts_evenements.json'
];

console.log('🎲 Injection rapide des oracles Monsterhearts');
console.log('==============================================\n');

let success = 0;
let errors = 0;

for (const file of oracleFiles) {
    console.log(`📥 Injection de ${file}...`);
    try {
        execSync(`node scripts/injecter-oracle.js --fichier=${file}`, { stdio: 'inherit' });
        success++;
    } catch (error) {
        console.log(`❌ Erreur avec ${file}`);
        errors++;
    }
    console.log('');
}

console.log('📊 Résultats:');
console.log(`   ✅ Réussis: ${success}/${oracleFiles.length}`);
console.log(`   ❌ Erreurs: ${errors}/${oracleFiles.length}`);

if (success > 0) {
    console.log('\n🎉 Oracles Monsterhearts disponibles sur: http://localhost:3074/oracles');
}