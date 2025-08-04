/**
 * Script pour tester la connexion à la base de données de test
 */

require('dotenv').config({ path: '.env.test' });
const { Pool } = require('pg');

async function testConnection() {
    console.log('Test de connexion à la base de données de test...\n');
    
    const config = {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        ssl: false,
        connectionTimeoutMillis: 5000
    };
    
    console.log('Configuration:');
    console.log('- Host:', config.host);
    console.log('- Port:', config.port);
    console.log('- Database:', config.database);
    console.log('- User:', config.user);
    console.log('- Password:', config.password ? '***' : 'non défini');
    console.log('- SSL:', config.ssl);
    
    const pool = new Pool(config);
    
    try {
        console.log('\nTentative de connexion...');
        const client = await pool.connect();
        
        console.log('✅ Connexion réussie !');
        
        // Test simple
        const result = await client.query('SELECT NOW() as time, current_database() as db');
        console.log('\nRésultat du test:');
        console.log('- Heure serveur:', result.rows[0].time);
        console.log('- Base de données:', result.rows[0].db);
        
        // Vérifier les tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('\nTables existantes:');
        tables.rows.forEach(row => {
            console.log('- ', row.table_name);
        });
        
        client.release();
        
    } catch (error) {
        console.error('\n❌ Erreur de connexion:');
        console.error('Type:', error.code || 'Inconnue');
        console.error('Message:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Le serveur PostgreSQL n\'est pas accessible.');
            console.error('Vérifiez votre connexion internet ou l\'adresse du serveur.');
        } else if (error.code === '28P01') {
            console.error('\n💡 Authentification échouée.');
            console.error('Vérifiez le nom d\'utilisateur et le mot de passe.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Connexion refusée.');
            console.error('Le serveur PostgreSQL n\'accepte pas les connexions sur ce port.');
        }
    } finally {
        await pool.end();
    }
}

// Exécuter le test
testConnection().catch(console.error);