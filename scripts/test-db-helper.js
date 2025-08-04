/**
 * Script pour tester le DatabaseTestHelper
 */

// Forcer l'environnement de test AVANT de charger les modules
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test', override: true });

const DatabaseTestHelper = require('../tests/helpers/DatabaseTestHelper');

async function testDatabaseHelper() {
    console.log('Test du DatabaseTestHelper...\n');
    
    const helper = new DatabaseTestHelper();
    
    try {
        console.log('1. Test isAvailable()...');
        const isAvailable = await helper.isAvailable();
        console.log('✅ isAvailable():', isAvailable);
        
        if (!isAvailable) {
            // Essayons de voir l'erreur exacte
            const db = require('../src/database/db');
            try {
                console.log('Debug: Tentative d\'initialisation directe...');
                await db.init();
                console.log('Debug: Init réussie, test query...');
                await db.query('SELECT 1');
                console.log('Debug: Query réussie !');
            } catch (error) {
                console.log('Debug: Erreur détaillée:', error.message);
            }
        }
        
        if (!isAvailable) {
            console.log('❌ La base n\'est pas détectée comme disponible par le helper');
            return;
        }
        
        console.log('\n2. Test initialize()...');
        const result = await helper.initialize();
        console.log('✅ initialize():', result);
        
        console.log('\n3. Test terminé avec succès !');
        
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        try {
            await helper.closeConnections();
        } catch (e) {
            // Ignorer les erreurs de fermeture
        }
    }
}

testDatabaseHelper().catch(console.error);