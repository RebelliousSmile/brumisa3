/**
 * Utilitaires de nettoyage pour les tests d'intégration
 * Gère la fermeture propre des connexions et ressources
 */

const db = require('../../src/database/db');

/**
 * Nettoie les données de test créées pendant un test
 * @param {string} testUser - Email de l'utilisateur de test à supprimer
 */
async function cleanupTestData(testUser) {
    if (!testUser || !testUser.email) return;
    
    try {
        // Supprimer l'utilisateur de test et toutes ses données liées (CASCADE)
        await db.run(
            'DELETE FROM utilisateurs WHERE email = $1',
            [testUser.email]
        );
    } catch (error) {
        console.warn('Erreur lors du nettoyage des données de test:', error.message);
    }
}

/**
 * Ferme proprement toutes les connexions de base de données
 */
async function closeAllConnections() {
    try {
        // Fermer le pool de connexions de base de données (une seule fois)
        if (db && db.close && db.isConnected !== false) {
            await db.close();
        }
    } catch (error) {
        // Ignorer l'erreur "Called end on pool more than once"
        if (!error.message.includes('Called end on pool more than once')) {
            console.warn('Erreur lors de la fermeture des connexions:', error.message);
        }
    }
}

/**
 * Nettoyage global pour afterAll() dans les tests
 * @param {Object} server - Instance du serveur Express à fermer
 */
async function globalCleanup(server) {
    try {
        // Fermer le serveur Express si il existe
        if (server && server.close) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
        
        // Fermer les connexions de base de données
        await closeAllConnections();
        
        // Forcer le garbage collector si disponible
        if (global.gc) {
            global.gc();
        }
        
    } catch (error) {
        console.warn('Erreur lors du nettoyage global:', error.message);
    }
}

/**
 * Réinitialise les tables de test (utile pour beforeAll)
 */
async function resetTestTables() {
    try {
        // Supprimer tous les utilisateurs de test (qui ont des emails de test)
        await db.run(`
            DELETE FROM utilisateurs 
            WHERE email LIKE '%@example.com' 
            OR email LIKE 'test_%@%'
        `);
        
        // Remettre les séquences à zéro si nécessaire
        // await db.run("SELECT setval('utilisateurs_id_seq', 1, false)");
        
    } catch (error) {
        console.warn('Erreur lors de la réinitialisation des tables:', error.message);
    }
}

/**
 * Attend que tous les handles async soient fermés
 * @param {number} timeout - Timeout en ms (défaut: 5000)
 */
async function waitForHandlesToClose(timeout = 5000) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            resolve();
        }, timeout);
        
        // Dès que possible, résoudre plus tôt
        setImmediate(() => {
            clearTimeout(timer);
            resolve();
        });
    });
}

/**
 * Configuration recommandée pour beforeAll dans les tests
 */
async function setupTest(app) {
    await app.initialize();
    await resetTestTables();
    return app.instance;
}

/**
 * Configuration recommandée pour afterAll dans les tests
 */
async function teardownTest(server) {
    await globalCleanup(server);
    await waitForHandlesToClose(1000);
}

module.exports = {
    cleanupTestData,
    closeAllConnections,
    globalCleanup,
    resetTestTables,
    waitForHandlesToClose,
    setupTest,
    teardownTest
};