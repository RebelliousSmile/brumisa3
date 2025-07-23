/**
 * Classe de base pour tous les tests unitaires
 * Principe SOLID : Liskov Substitution - Classes enfants substituables
 * 
 * Fournit une infrastructure commune pour les tests unitaires :
 * - Méthodes d'assertion spécialisées
 * - Gestion des mocks et stubs
 * - Méthodes utilitaires pour les tests unitaires
 * - Configuration Jest centralisée
 */

class BaseUnitTest {
    constructor(config = {}) {
        this.config = {
            timeout: 5000, // Plus court pour les tests unitaires
            mockDatabase: true,
            mockExternalServices: true,
            ...config
        };
        
        this.mocks = new Map();
        this.spies = new Map();
    }

    /**
     * Configuration Jest pour la classe
     * @returns {Object} - Configuration Jest
     */
    static getJestConfig() {
        return {
            testTimeout: 5000, // Timeout plus court pour les tests unitaires
            testEnvironment: 'node',
            clearMocks: true,
            restoreMocks: true
        };
    }

    /**
     * Setup de base - à appeler dans beforeAll() ou beforeEach()
     */
    async baseSetup() {
        try {
            // Configuration spécifique aux tests unitaires
            this.setupMocks();
            
            // Setup spécifique à la classe enfant
            await this.customSetup();
            
            return { success: true };
        } catch (error) {
            console.error('Erreur dans baseSetup:', error);
            throw error;
        }
    }

    /**
     * Teardown de base - à appeler dans afterAll() ou afterEach()
     */
    async baseTeardown() {
        try {
            // Cleanup spécifique à la classe enfant
            await this.customTeardown();
            
            // Nettoyer tous les mocks
            this.clearAllMocks();
            
        } catch (error) {
            console.error('Erreur dans baseTeardown:', error);
        }
    }

    /**
     * Configuration des mocks - à surcharger si nécessaire
     */
    setupMocks() {
        // Configuration par défaut des mocks communs
        if (this.config.mockDatabase) {
            this.mockDatabase();
        }
        
        if (this.config.mockExternalServices) {
            this.mockExternalServices();
        }
    }

    /**
     * Mock de la base de données
     */
    mockDatabase() {
        const dbMock = {
            query: jest.fn(),
            get: jest.fn(),
            run: jest.fn(),
            all: jest.fn(),
            close: jest.fn().mockResolvedValue()
        };
        
        this.mocks.set('database', dbMock);
        
        // Mock du module db si nécessaire
        jest.doMock('../../src/database/db', () => dbMock);
    }

    /**
     * Mock des services externes
     */
    mockExternalServices() {
        // Mock des services externes courants
        const externalMocks = {
            fs: {
                readFileSync: jest.fn(),
                writeFileSync: jest.fn(),
                existsSync: jest.fn().mockReturnValue(true)
            },
            path: {
                join: jest.fn((...args) => args.join('/')),
                resolve: jest.fn((...args) => args.join('/'))
            }
        };
        
        this.mocks.set('external', externalMocks);
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
     * Obtient un mock spécifique
     * @param {string} name - Nom du mock
     * @returns {Object} - Mock correspondant
     */
    getMock(name) {
        return this.mocks.get(name);
    }

    /**
     * Ajoute un mock personnalisé
     * @param {string} name - Nom du mock
     * @param {Object} mock - Objet mock
     */
    addMock(name, mock) {
        this.mocks.set(name, mock);
    }

    /**
     * Crée un spy Jest avec suivi
     * @param {Object} object - Objet à espionner
     * @param {string} method - Méthode à espionner
     * @returns {jest.SpyInstance}
     */
    createSpy(object, method) {
        const spy = jest.spyOn(object, method);
        this.spies.set(`${object.constructor.name}.${method}`, spy);
        return spy;
    }

    /**
     * Nettoie tous les mocks et spies
     */
    clearAllMocks() {
        // Nettoyer les spies
        for (const spy of this.spies.values()) {
            spy.mockRestore();
        }
        this.spies.clear();
        
        // Nettoyer les mocks
        this.mocks.clear();
        
        // Nettoyer les mocks Jest
        jest.clearAllMocks();
        jest.restoreAllMocks();
    }

    /**
     * Assertions pour les fonctions
     * @param {Function} fn - Fonction à tester
     * @param {*} input - Paramètre d'entrée
     * @param {*} expectedOutput - Sortie attendue
     */
    assertFunction(fn, input, expectedOutput) {
        const result = fn(input);
        expect(result).toEqual(expectedOutput);
    }

    /**
     * Assertions pour les fonctions asynchrones
     * @param {Function} fn - Fonction async à tester
     * @param {*} input - Paramètre d'entrée
     * @param {*} expectedOutput - Sortie attendue
     */
    async assertAsyncFunction(fn, input, expectedOutput) {
        const result = await fn(input);
        expect(result).toEqual(expectedOutput);
    }

    /**
     * Assertions pour les erreurs
     * @param {Function} fn - Fonction qui doit lever une erreur
     * @param {*} input - Paramètre d'entrée
     * @param {string} expectedError - Message d'erreur attendu
     */
    assertThrows(fn, input, expectedError = null) {
        if (expectedError === null) {
            expect(() => fn(input)).toThrow();
        } else {
            expect(() => fn(input)).toThrow(expectedError);
        }
    }

    /**
     * Assertions pour les erreurs asynchrones
     * @param {Function} fn - Fonction async qui doit lever une erreur
     * @param {*} input - Paramètre d'entrée
     * @param {string} expectedError - Message d'erreur attendu
     */
    async assertThrowsAsync(fn, input, expectedError = null) {
        if (expectedError === null) {
            await expect(fn(input)).rejects.toThrow();
        } else {
            await expect(fn(input)).rejects.toThrow(expectedError);
        }
    }

    /**
     * Vérifie qu'un mock a été appelé avec des paramètres spécifiques
     * @param {jest.Mock} mockFn - Fonction mockée
     * @param {Array} expectedArgs - Arguments attendus
     * @param {number} callIndex - Index de l'appel (0 par défaut)
     */
    assertMockCalledWith(mockFn, expectedArgs, callIndex = 0) {
        expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
        if (callIndex > 0) {
            expect(mockFn).toHaveBeenNthCalledWith(callIndex + 1, ...expectedArgs);
        }
    }

    /**
     * Vérifie le nombre d'appels d'un mock
     * @param {jest.Mock} mockFn - Fonction mockée
     * @param {number} expectedCalls - Nombre d'appels attendu
     */
    assertMockCallCount(mockFn, expectedCalls) {
        expect(mockFn).toHaveBeenCalledTimes(expectedCalls);
    }

    /**
     * Vérifie qu'un objet a la structure attendue
     * @param {Object} obj - Objet à vérifier
     * @param {Object} expectedStructure - Structure attendue
     */
    assertObjectStructure(obj, expectedStructure) {
        expect(obj).toMatchObject(expectedStructure);
    }

    /**
     * Vérifie qu'un array contient les éléments attendus
     * @param {Array} array - Array à vérifier
     * @param {Array} expectedItems - Éléments attendus
     */
    assertArrayContains(array, expectedItems) {
        expect(array).toEqual(expect.arrayContaining(expectedItems));
    }

    /**
     * Utilitaire pour créer des données de test
     * @param {string} type - Type de données ('user', 'personnage', etc.)
     * @param {Object} overrides - Données à surcharger
     * @returns {Object} - Données de test
     */
    createTestData(type, overrides = {}) {
        const testData = {
            user: {
                id: 1,
                nom: 'Test User',
                email: 'test@example.com',
                role: 'UTILISATEUR',
                type_compte: 'STANDARD'
            },
            personnage: {
                id: 1,
                nom: 'Test Character',
                systeme_jeu: 'dnd5',
                niveau: 1,
                utilisateur_id: 1
            },
            oracle: {
                id: 1,
                nom: 'Test Oracle',
                categorie: 'fantasy',
                actif: true,
                items: []
            },
            pdf: {
                id: 1,
                nom_fichier: 'test.pdf',
                statut: 'TERMINE',
                utilisateur_id: 1,
                personnage_id: null,
                type_pdf: 'fiche_personnage',
                progression: 100,
                date_creation: new Date(),
                est_public: false
            }
        };

        return {
            ...testData[type] || {},
            ...overrides
        };
    }

    /**
     * Obtient un summary des tests effectués
     * @returns {Object} - Résumé des tests
     */
    getTestSummary() {
        return {
            mocksCreated: this.mocks.size,
            spiesCreated: this.spies.size,
            configUsed: this.config
        };
    }
}

module.exports = BaseUnitTest;