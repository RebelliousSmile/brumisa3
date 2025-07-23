/**
 * Factory pour créer des contextes de test unitaire configurables
 * Principe SOLID : Dependency Inversion - Inversion des dépendances
 * 
 * Contrairement au TestFactory (pour tests d'intégration), celui-ci se concentre
 * sur les tests unitaires avec mocks et stubs.
 */

class UnitTestFactory {
    /**
     * Crée un contexte de test unitaire standard
     * @param {Object} config - Configuration personnalisée
     * @returns {Object} - Contexte de test configuré
     */
    static createUnitTestContext(config = {}) {
        const {
            mockDatabase = true,
            mockFs = true,
            mockExternalServices = true,
            testDataPath = './tests/fixtures',
            environment = 'test'
        } = config;

        return {
            environment,
            mockDatabase,
            mockFs,
            mockExternalServices,
            testDataPath,
            
            // Méthodes de commodité pour créer des mocks
            createDatabaseMock() {
                return {
                    query: jest.fn(),
                    get: jest.fn(),
                    run: jest.fn(),
                    all: jest.fn(),
                    close: jest.fn().mockResolvedValue(),
                    
                    // Méthodes spécifiques pour simuler des réponses
                    mockQueryResponse: function(response) {
                        this.query.mockResolvedValue(response);
                        return this;
                    },
                    
                    mockGetResponse: function(response) {
                        this.get.mockResolvedValue(response);
                        return this;
                    },
                    
                    mockError: function(error) {
                        this.query.mockRejectedValue(error);
                        this.get.mockRejectedValue(error);
                        this.run.mockRejectedValue(error);
                        return this;
                    }
                };
            },
            
            createFileSystemMock() {
                return {
                    readFileSync: jest.fn(),
                    writeFileSync: jest.fn(),
                    existsSync: jest.fn().mockReturnValue(true),
                    mkdirSync: jest.fn(),
                    unlinkSync: jest.fn(),
                    
                    // Méthodes de commodité
                    mockFileExists: function(filename, exists = true) {
                        this.existsSync.mockImplementation((path) => 
                            path.includes(filename) ? exists : true
                        );
                        return this;
                    },
                    
                    mockFileContent: function(filename, content) {
                        this.readFileSync.mockImplementation((path) => 
                            path.includes(filename) ? content : 'default content'
                        );
                        return this;
                    }
                };
            },
            
            createEmailServiceMock() {
                return {
                    sendEmail: jest.fn().mockResolvedValue({ success: true }),
                    validateEmail: jest.fn().mockReturnValue(true),
                    
                    mockSendSuccess: function() {
                        this.sendEmail.mockResolvedValue({ success: true, messageId: 'test-123' });
                        return this;
                    },
                    
                    mockSendFailure: function(error = 'Email sending failed') {
                        this.sendEmail.mockRejectedValue(new Error(error));
                        return this;
                    }
                };
            },
            
            createPdfServiceMock() {
                return {
                    generatePdf: jest.fn().mockResolvedValue({ 
                        success: true, 
                        pdfPath: '/tmp/test.pdf',
                        buffer: Buffer.from('fake pdf content')
                    }),
                    
                    mockGenerationSuccess: function(customResponse = {}) {
                        const defaultResponse = {
                            success: true,
                            pdfPath: '/tmp/test.pdf',
                            buffer: Buffer.from('fake pdf content')
                        };
                        this.generatePdf.mockResolvedValue({ ...defaultResponse, ...customResponse });
                        return this;
                    },
                    
                    mockGenerationFailure: function(error = 'PDF generation failed') {
                        this.generatePdf.mockRejectedValue(new Error(error));
                        return this;
                    }
                };
            }
        };
    }

    /**
     * Crée un contexte pour les tests de services
     * @param {string} serviceName - Nom du service testé
     * @param {Object} config - Configuration
     */
    static createServiceTestContext(serviceName, config = {}) {
        const baseContext = this.createUnitTestContext(config);
        
        // Configuration spécifique selon le service
        const serviceConfigs = {
            PersonnageService: {
                dependencies: ['database', 'validation'],
                mockDatabase: true,
                mockValidation: true
            },
            
            EmailService: {
                dependencies: ['smtp', 'templates'],
                mockExternalServices: true,
                mockTemplates: true
            },
            
            PdfService: {
                dependencies: ['pdfKit', 'templates', 'filesystem'],
                mockFs: true,
                mockPdfKit: true
            },
            
            OracleService: {
                dependencies: ['database', 'random'],
                mockDatabase: true,
                mockRandom: true
            }
        };
        
        const serviceConfig = serviceConfigs[serviceName] || {};
        
        return {
            ...baseContext,
            serviceName,
            ...serviceConfig,
            
            // Méthodes spécifiques au service
            createServiceMocks() {
                const mocks = {};
                
                if (serviceConfig.dependencies) {
                    serviceConfig.dependencies.forEach(dep => {
                        switch (dep) {
                            case 'database':
                                mocks.database = baseContext.createDatabaseMock();
                                break;
                            case 'filesystem':
                                mocks.fs = baseContext.createFileSystemMock();
                                break;
                            case 'email':
                                mocks.email = baseContext.createEmailServiceMock();
                                break;
                            case 'pdf':
                                mocks.pdf = baseContext.createPdfServiceMock();
                                break;
                            default:
                                mocks[dep] = jest.fn();
                        }
                    });
                }
                
                return mocks;
            }
        };
    }

    /**
     * Crée un contexte pour les tests de modèles/entités
     * @param {string} modelName - Nom du modèle testé
     * @param {Object} config - Configuration
     */
    static createModelTestContext(modelName, config = {}) {
        return {
            ...this.createUnitTestContext(config),
            modelName,
            
            // Données de test par défaut pour différents modèles
            getDefaultTestData() {
                const testData = {
                    Utilisateur: {
                        nom: 'Test User',
                        email: 'test@example.com',
                        motDePasse: 'password123',
                        role: 'UTILISATEUR',
                        type_compte: 'STANDARD'
                    },
                    
                    Personnage: {
                        nom: 'Test Character',
                        systeme_jeu: 'dnd5',
                        niveau: 1,
                        classe: 'Fighter',
                        attributs: { force: 16, dexterite: 14 }
                    },
                    
                    Oracle: {
                        nom: 'Test Oracle',
                        categorie: 'fantasy',
                        actif: true,
                        items: [
                            { texte: 'Résultat 1', poids: 1 },
                            { texte: 'Résultat 2', poids: 2 }
                        ]
                    }
                };
                
                return testData[modelName] || {};
            },
            
            // Crée des variations des données de test
            createTestVariations(baseData, variations = {}) {
                return Object.keys(variations).map(key => ({
                    name: key,
                    data: { ...baseData, ...variations[key] }
                }));
            }
        };
    }

    /**
     * Crée un contexte pour les tests de composants frontend
     * @param {string} componentName - Nom du composant testé
     * @param {Object} config - Configuration
     */
    static createComponentTestContext(componentName, config = {}) {
        return {
            ...this.createUnitTestContext(config),
            componentName,
            mockDom: true,
            
            // Mock du DOM et des API browser
            createDomMocks() {
                const domMocks = {
                    document: {
                        createElement: jest.fn(),
                        getElementById: jest.fn(),
                        querySelector: jest.fn(),
                        querySelectorAll: jest.fn(),
                        addEventListener: jest.fn()
                    },
                    
                    window: {
                        addEventListener: jest.fn(),
                        fetch: jest.fn(),
                        localStorage: {
                            getItem: jest.fn(),
                            setItem: jest.fn(),
                            removeItem: jest.fn()
                        }
                    }
                };
                
                // Ajouter les mocks au global scope si nécessaire
                if (typeof global !== 'undefined') {
                    global.document = domMocks.document;
                    global.window = domMocks.window;
                }
                
                return domMocks;
            }
        };
    }

    /**
     * Crée un contexte pour les tests de performance/benchmarks
     * @param {Object} config - Configuration
     */
    static createPerformanceTestContext(config = {}) {
        return {
            ...this.createUnitTestContext(config),
            
            // Outils pour mesurer les performances
            benchmark: {
                // Mesure le temps d'exécution d'une fonction
                async timeFunction(fn, iterations = 1) {
                    const start = process.hrtime.bigint();
                    
                    for (let i = 0; i < iterations; i++) {
                        await fn();
                    }
                    
                    const end = process.hrtime.bigint();
                    const durationMs = Number(end - start) / 1000000; // Convert to milliseconds
                    
                    return {
                        totalTime: durationMs,
                        averageTime: durationMs / iterations,
                        iterations
                    };
                },
                
                // Mesure l'utilisation mémoire
                measureMemory(fn) {
                    const before = process.memoryUsage();
                    const result = fn();
                    const after = process.memoryUsage();
                    
                    return {
                        result,
                        memoryDelta: {
                            heapUsed: after.heapUsed - before.heapUsed,
                            heapTotal: after.heapTotal - before.heapTotal,
                            external: after.external - before.external
                        }
                    };
                }
            }
        };
    }

    /**
     * Crée un contexte pour les tests de régression
     * @param {Object} config - Configuration
     */
    static createRegressionTestContext(config = {}) {
        return {
            ...this.createUnitTestContext(config),
            
            // Outils pour les tests de régression
            regression: {
                // Compare le résultat actuel avec un snapshot
                compareWithSnapshot(result, snapshotName) {
                    expect(result).toMatchSnapshot(snapshotName);
                },
                
                // Vérifie qu'une fonction produit toujours le même résultat
                ensureConsistentOutput(fn, input, iterations = 10) {
                    const results = [];
                    for (let i = 0; i < iterations; i++) {
                        results.push(fn(input));
                    }
                    
                    // Tous les résultats doivent être identiques
                    const firstResult = results[0];
                    results.forEach((result, index) => {
                        expect(result).toEqual(firstResult);
                    });
                    
                    return firstResult;
                }
            }
        };
    }
}

module.exports = UnitTestFactory;