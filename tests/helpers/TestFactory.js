/**
 * Factory pour créer des contextes de test configurables
 * Principe SOLID : Dependency Inversion - Inversion des dépendances
 */

const DatabaseTestHelper = require('./DatabaseTestHelper');
const ServerTestHelper = require('./ServerTestHelper');
const AuthTestHelper = require('./AuthTestHelper');

class TestFactory {
    /**
     * Crée un contexte de test complet avec injection de dépendances
     * @param {Object} config - Configuration personnalisée
     * @returns {Object} - Contexte de test configuré
     */
    static createTestContext(config = {}) {
        const {
            app = null, // Sera chargé dynamiquement si null
            database = new DatabaseTestHelper(),
            server = new ServerTestHelper(),
            auth = new AuthTestHelper(),
            environment = 'test'
        } = config;

        return {
            // Dépendances injectées
            database,
            server,
            auth,
            
            // Configuration
            environment,
            
            // App chargée à la demande (lazy loading)
            getApp() {
                if (!app) {
                    // Chargement dynamique pour éviter les imports prématurés
                    return require('../../src/app');
                }
                return app;
            },
            
            // Méthodes de commodité
            async setup() {
                const dbInit = await database.initialize();
                const appInstance = this.getApp();
                const { server: serverInstance, port, url } = await server.createTestServer(appInstance);
                
                return {
                    app: appInstance,
                    server: serverInstance,
                    port,
                    url,
                    database,
                    auth,
                    usingMocks: dbInit.usingMocks || false
                };
            },
            
            async teardown(context) {
                await auth.cleanup();
                await server.stopAllServers();
                await database.closeConnections();
            }
        };
    }

    /**
     * Crée un contexte pour les tests d'API publique (sans authentification)
     * @param {Object} config - Configuration
     */
    static createPublicApiTestContext(config = {}) {
        return this.createTestContext({
            ...config,
            // Pas besoin de helper d'auth complexe pour les tests publics
            auth: null
        });
    }

    /**
     * Crée un contexte pour les tests d'authentification
     * @param {Object} config - Configuration
     */
    static createAuthTestContext(config = {}) {
        return this.createTestContext({
            ...config,
            // AuthTestHelper complet avec toutes les fonctionnalités
            auth: config.auth || new AuthTestHelper()
        });
    }

    /**
     * Crée un contexte pour les tests Admin (avec utilisateurs pré-créés)
     * @param {Object} config - Configuration
     */
    static createAdminTestContext(config = {}) {
        const context = this.createTestContext(config);
        
        // Surcharger la méthode setup pour créer automatiquement un admin
        const originalSetup = context.setup.bind(context);
        context.setup = async function() {
            const baseContext = await originalSetup();
            
            // Créer automatiquement un utilisateur admin
            const adminAuth = await baseContext.auth.createAndLoginAdmin(baseContext.server);
            
            return {
                ...baseContext,
                admin: adminAuth
            };
        };
        
        return context;
    }

    /**
     * Crée un contexte de test avec base de données mockée
     * @param {Object} config - Configuration
     */
    static createMockedTestContext(config = {}) {
        // TODO: Implémenter MockDatabaseHelper si nécessaire
        return this.createTestContext({
            ...config,
            database: new DatabaseTestHelper() // Utiliser le helper normal pour l'instant
        });
    }

    /**
     * Crée un contexte de test pour les tests unitaires (sans serveur)
     * @param {Object} config - Configuration
     */
    static createUnitTestContext(config = {}) {
        return {
            database: config.database || new DatabaseTestHelper(),
            
            // Pas de serveur pour les tests unitaires
            server: null,
            auth: null,
            
            async setup() {
                await this.database.initialize();
                return { database: this.database };
            },
            
            async teardown() {
                await this.database.closeConnections();
            }
        };
    }

    /**
     * Crée un contexte de test optimisé pour les performances
     * @param {Object} config - Configuration
     */
    static createPerformanceTestContext(config = {}) {
        const context = this.createTestContext(config);
        
        // Configuration optimisée pour la vitesse
        const originalSetup = context.setup.bind(context);
        context.setup = async function() {
            const baseContext = await originalSetup();
            
            // Configuration serveur optimisée pour les tests de performance
            baseContext.server.timeout = 10000;
            baseContext.server.keepAliveTimeout = 1000;
            
            return baseContext;
        };
        
        return context;
    }

    /**
     * Utilitaire pour créer plusieurs contextes de test en parallèle
     * @param {Array<Object>} configs - Configurations multiples
     */
    static async createMultipleContexts(configs) {
        const contexts = configs.map(config => this.createTestContext(config));
        const setupPromises = contexts.map(context => context.setup());
        
        const results = await Promise.all(setupPromises);
        
        return results.map((result, index) => ({
            context: contexts[index],
            ...result
        }));
    }

    /**
     * Crée un contexte de test avec retry automatique en cas d'échec
     * @param {Object} config - Configuration
     * @param {number} maxRetries - Nombre max de tentatives
     */
    static createResilientTestContext(config = {}, maxRetries = 3) {
        const context = this.createTestContext(config);
        
        const originalSetup = context.setup.bind(context);
        context.setup = async function() {
            let lastError;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return await originalSetup();
                } catch (error) {
                    lastError = error;
                    console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error.message);
                    
                    if (attempt < maxRetries) {
                        // Attendre avant de réessayer
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }
            
            throw new Error(`Setup échoué après ${maxRetries} tentatives: ${lastError.message}`);
        };
        
        return context;
    }
}

module.exports = TestFactory;