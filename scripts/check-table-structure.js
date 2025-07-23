// Forcer NODE_ENV=test AVANT tout import
process.env.NODE_ENV = 'test';

// Charger la configuration de test
require('dotenv').config({ path: '.env.test' });

const db = require('../src/database/db');

async function checkTable() {
    try {
        const cols = await db.all(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'utilisateurs' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Structure actuelle table utilisateurs:');
        cols.forEach(c => {
            console.log(`  ✅ ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}) default: ${c.column_default || 'NULL'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkTable();