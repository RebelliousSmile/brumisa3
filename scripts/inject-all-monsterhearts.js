#!/usr/bin/env node

/**
 * Script pour injecter tous les oracles Monsterhearts
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { execSync } = require('child_process');

const oracleFiles = [
    'oracles_monsterhearts_relations.json',
    'oracles_monsterhearts_monstruosites.json', 
    'oracles_monsterhearts_evenements.json'
];

console.log('🧛‍♀️ Injection complète des oracles Monsterhearts');
console.log('================================================\n');

console.log('✅ Oracle "Révélations" déjà injecté');

let success = 1; // Révélations déjà fait
let errors = 0;

for (const file of oracleFiles) {
    console.log(`📥 Injection de ${file}...`);
    try {
        execSync(`node scripts/inject-oracle-direct.js ${file}`, { stdio: 'inherit' });
        success++;
    } catch (error) {
        console.log(`❌ Erreur avec ${file}`);
        errors++;
    }
    console.log('');
}

console.log('📊 Résultats finaux:');
console.log(`   ✅ Réussis: ${success}/4 oracles Monsterhearts`);
console.log(`   ❌ Erreurs: ${errors}/4`);

if (success >= 3) {
    console.log('\n🎉 Oracles Monsterhearts prêts !');
    console.log('🌐 Voir tous les oracles: http://localhost:3074/oracles');
    console.log('🎲 Page d\'accueil: http://localhost:3074');
}