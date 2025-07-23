/**
 * Script pour déboguer la configuration d'environnement de test
 */

// Forcer NODE_ENV=test AVANT tout import
process.env.NODE_ENV = 'test';

// Charger dotenv manuellement comme dans setup.js
require('dotenv').config({ path: '.env.test', override: true });

console.log('🔍 Configuration d\'environnement de test');
console.log('');

console.log('📋 NODE_ENV:', process.env.NODE_ENV);
console.log('');

console.log('🔗 Variables PostgreSQL trouvées dans process.env :');
const postgresVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT', 
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'DATABASE_URL'
];

postgresVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = varName.includes('PASSWORD') && value ? 
        `${value.substring(0, 3)}...` : value || 'NON DÉFINIE';
    console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('');

// Charger la config comme le fait l'application
console.log('⚙️ Configuration résultante (src/config.js):');
const config = require('../src/config');

console.log('   Host:', config.database.host);
console.log('   Port:', config.database.port);
console.log('   Database:', config.database.database);
console.log('   User:', config.database.user);
console.log('   Password:', config.database.password ? `${config.database.password.substring(0, 3)}...` : 'NON DÉFINI');
console.log('   SSL:', config.database.ssl);
console.log('   Connection String:', config.database.connectionString || 'NON DÉFINIE');

console.log('');

// Tester une connexion
console.log('🧪 Test de connexion avec cette configuration...');
const { Pool } = require('pg');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl,
    connectionTimeoutMillis: 5000,
});

pool.connect()
    .then(client => {
        console.log('✅ Connexion réussie !');
        return client.query('SELECT NOW() as current_time');
    })
    .then(result => {
        console.log('⏰ Heure base:', result.rows[0].current_time);
        return pool.end();
    })
    .then(() => {
        console.log('🔚 Connexion fermée proprement');
    })
    .catch(error => {
        console.log('❌ Erreur de connexion:', error.message);
        console.log('🔍 Code erreur:', error.code);
        console.log('🏠 Host tenté:', error.address || 'inconnu');
        console.log('🔌 Port tenté:', error.port || 'inconnu');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 Suggestions:');
            console.log('   1. Vérifier que PostgreSQL est démarré');
            console.log('   2. Vérifier les variables dans .env.test');
            console.log('   3. Vérifier la connectivité réseau');
        }
        
        pool.end().catch(() => {}); // Ignore les erreurs de fermeture
    });