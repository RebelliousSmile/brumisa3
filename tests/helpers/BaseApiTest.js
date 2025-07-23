/**
 * Classe de base pour tous les tests d'API
 * Principe SOLID : Liskov Substitution - Classes enfants substituables
 */

const TestFactory = require('./TestFactory');

class BaseApiTest {
    constructor(config = {}) {
        this.config = {
            timeout: 30000,
            retryAttempts: 1,
            cleanupUsers: true,
            ...config
        };
        
        this.testContext = null;
        this.setupData = null;
        this.testUsers = [];
    }

    /**
     * Configuration Jest pour la classe
     * @returns {Object} - Configuration Jest
     */
    static getJestConfig() {
        return {
            testTimeout: 30000,
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
            testEnvironment: 'node'
        };
    }

    /**
     * Setup de base - à appeler dans beforeAll()
     * Peut être surchargé par les classes enfants
     */
    async baseSetup() {
        try {
            // Créer le contexte de test approprié
            this.testContext = this.createTestContext();
            
            // Initialiser le contexte
            this.setupData = await this.testContext.setup();
            
            // Setup spécifique à la classe enfant
            await this.customSetup();
            
            return this.setupData;
        } catch (error) {
            console.error('Erreur dans baseSetup:', error);
            throw error;
        }
    }

    /**
     * Teardown de base - à appeler dans afterAll()
     * Peut être surchargé par les classes enfants
     */
    async baseTeardown() {
        try {
            // Cleanup spécifique à la classe enfant
            await this.customTeardown();
            
            // Cleanup des utilisateurs de test si activé
            if (this.config.cleanupUsers && this.setupData?.database) {
                await this.setupData.database.cleanupTestUsers(this.testUsers);
            }
            
            // Teardown du contexte
            if (this.testContext && this.setupData) {
                await this.testContext.teardown(this.setupData);
            }
        } catch (error) {
            console.error('Erreur dans baseTeardown:', error);
        }
    }

    /**
     * Crée le contexte de test approprié
     * DOIT être surchargé par les classes enfants
     * @returns {Object} - Contexte de test
     */
    createTestContext() {
        return TestFactory.createTestContext(this.config);
    }

    /**
     * Setup personnalisé pour la classe enfant
     * Peut être surchargé (optionnel)
     */
    async customSetup() {
        // Implémentation par défaut : ne rien faire
    }

    /**
     * Teardown personnalisé pour la classe enfant  
     * Peut être surchargé (optionnel)
     */
    async customTeardown() {
        // Implémentation par défaut : ne rien faire
    }

    /**
     * Obtient le serveur de test
     * @returns {Object} - Instance du serveur
     */
    getServer() {
        return this.setupData?.server;
    }

    /**
     * Obtient l'URL du serveur de test
     * @returns {string} - URL du serveur
     */
    getServerUrl() {
        return this.setupData?.url;
    }

    /**
     * Obtient l'instance de l'app
     * @returns {Object} - Instance Express
     */
    getApp() {
        return this.setupData?.app;
    }

    /**
     * Obtient le helper de base de données
     * @returns {DatabaseTestHelper}
     */
    getDatabaseHelper() {
        return this.setupData?.database;
    }

    /**
     * Obtient le helper d'authentification
     * @returns {AuthTestHelper}
     */
    getAuthHelper() {
        return this.setupData?.auth;
    }

    /**
     * Crée un utilisateur de test et l'ajoute à la liste de nettoyage
     * @param {Object} overrides - Données à surcharger
     * @returns {Object} - Données utilisateur
     */
    createTestUser(overrides = {}) {
        const authHelper = this.getAuthHelper();
        if (!authHelper) {
            throw new Error('AuthHelper non disponible pour cette classe de test');
        }
        
        const userData = authHelper.createTestUserData(overrides);
        this.testUsers.push(userData);
        return userData;
    }

    /**
     * Crée et connecte un utilisateur de test
     * @param {Object} overrides - Données à surcharger
     * @returns {Promise<Object>} - { user, agent, response }
     */
    async createAndLoginUser(overrides = {}) {
        const authHelper = this.getAuthHelper();
        if (!authHelper) {
            throw new Error('AuthHelper non disponible pour cette classe de test');
        }
        
        const result = await authHelper.createAndLoginUser(this.getServer(), overrides);
        this.testUsers.push(result.user);
        return result;
    }

    /**
     * Exécute un test avec retry automatique
     * @param {Function} testFn - Fonction de test à exécuter
     * @param {number} maxAttempts - Nombre max de tentatives
     */
    async withRetry(testFn, maxAttempts = null) {
        const attempts = maxAttempts || this.config.retryAttempts;
        let lastError;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                return await testFn();
            } catch (error) {
                lastError = error;
                
                if (attempt < attempts) {
                    console.warn(`Tentative ${attempt}/${attempts} échouée, retry...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        throw lastError;
    }

    /**
     * Assertions communes pour les réponses API
     * @param {Object} response - Réponse HTTP
     * @param {number} expectedStatus - Status attendu
     * @param {boolean} expectedSuccess - Succès attendu (body.succes)
     */
    assertApiResponse(response, expectedStatus = 200, expectedSuccess = true) {
        expect(response.status).toBe(expectedStatus);
        expect(response.body).toHaveProperty('succes', expectedSuccess);
        
        if (expectedSuccess) {
            expect(response.body).toHaveProperty('donnees');
        } else {
            expect(response.body).toHaveProperty('message');
        }
    }

    /**
     * Assertions pour les erreurs d'authentification
     * @param {Object} response - Réponse HTTP
     */
    assertAuthenticationRequired(response) {
        this.assertApiResponse(response, 401, false);
        expect(response.body.message).toMatch(/authentification|authentifié/i);
    }

    /**
     * Assertions pour les erreurs de permissions
     * @param {Object} response - Réponse HTTP
     */
    assertInsufficientPermissions(response) {
        this.assertApiResponse(response, 403, false);
        expect(response.body.message).toMatch(/permission|autorisé|accès/i);
    }

    /**
     * Assertions pour les erreurs de validation
     * @param {Object} response - Réponse HTTP
     * @param {string} field - Champ en erreur (optionnel)
     */
    assertValidationError(response, field = null) {
        this.assertApiResponse(response, 400, false);
        
        if (field) {
            expect(response.body.message.toLowerCase()).toContain(field.toLowerCase());
        }
    }

    /**
     * Obtient un summary des données de test créées
     * @returns {Object} - Résumé des données de test
     */
    getTestSummary() {
        return {
            testUsers: this.testUsers.length,
            serverUrl: this.getServerUrl(),
            configUsed: this.config
        };
    }
}

module.exports = BaseApiTest;