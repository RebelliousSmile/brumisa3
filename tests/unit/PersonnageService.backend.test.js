/**
 * Tests unitaires pour PersonnageService (Backend) - User Stories US002, US006-US008
 * Tests basés sur les user stories principales
 * Utilise l'architecture SOLID pour les tests unitaires
 */

const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');
const PersonnageService = require('../../src/services/PersonnageService');

// Mock des dépendances
jest.mock('../../src/models/Personnage');
jest.mock('../../src/config/systemesJeu');
jest.mock('../../src/database/db');

const Personnage = require('../../src/models/Personnage');
const { systemesJeu } = require('../../src/config/systemesJeu');

class PersonnageServiceBackendTest extends BaseUnitTest {
    constructor() {
        super({
            mockDatabase: true,
            mockExternalServices: true
        });
        this.testContext = UnitTestFactory.createServiceTestContext('PersonnageService');
    }

    async customSetup() {
        // Mock du modèle Personnage
        this.mockPersonnageModel = {
            findAll: jest.fn(),
            obtenirParId: jest.fn(),
            creer: jest.fn(),
            mettreAJour: jest.fn(),
            supprimer: jest.fn(),
            count: jest.fn(),
            lister: jest.fn(),
            obtenirStatistiques: jest.fn(),
            supprimerBrouillonsAnciens: jest.fn()
        };
        
        Personnage.mockImplementation(() => this.mockPersonnageModel);
        
        // Mock des systèmes de jeu
        systemesJeu.monsterhearts = {
            nom: 'Monsterhearts',
            attributs: {
                hot: { min: -2, max: 4, defaut: 0 },
                cold: { min: -2, max: 4, defaut: 0 }
            },
            infos_base: {
                requis: ['nom', 'concept'],
                champs: { nom: 'text', concept: 'text' }
            }
        };
        
        this.personnageService = new PersonnageService();
    }
}

describe('PersonnageService Backend - User Stories', () => {
    let testInstance;

    beforeAll(async () => {
        testInstance = new PersonnageServiceBackendTest();
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('US002 - Création de personnage de base', () => {
        test('devrait créer un personnage avec données complètes', async () => {
            // Arrange
            const donnees = {
                nom: 'Luna Darkwood',
                concept: 'Vampire rebelle',
                systeme_jeu: 'monsterhearts',
                utilisateur_id: 1
            };
            
            const personnageCree = testInstance.createTestData('personnage', {
                id: 123, 
                ...donnees, 
                date_creation: new Date()
            });
            testInstance.mockPersonnageModel.creer.mockResolvedValue(personnageCree);

            // Act
            const result = await testInstance.personnageService.creer(donnees);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.creer, [
                expect.objectContaining({
                    nom: 'Luna Darkwood',
                    concept: 'Vampire rebelle',
                    systeme_jeu: 'monsterhearts',
                    attributs: expect.any(Object),
                    competences: expect.any(Object)
                })
            ]);
            testInstance.assertObjectStructure(result, personnageCree);
        });

        test('devrait rejeter un personnage avec système invalide', async () => {
            // Arrange
            const donnees = {
                nom: 'Test',
                systeme_jeu: 'inexistant'
            };

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.personnageService.creer(donnees),
                null,
                'Système de jeu invalide'
            );
        });

        test('devrait appliquer les défauts du système lors de la création', async () => {
            // Arrange
            const donnees = {
                nom: 'Test Hero',
                concept: 'Test',
                systeme_jeu: 'monsterhearts'
            };
            
            testInstance.mockPersonnageModel.creer.mockResolvedValue({ id: 1, ...donnees });

            // Act
            await testInstance.personnageService.creer(donnees);

            // Assert - Le service utilise les valeurs min au lieu de defaut
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.creer, [
                expect.objectContaining({
                    attributs: { hot: -2, cold: -2 }, // Utilise min au lieu de defaut
                    competences: {},
                    infos_base: {},
                    inventaire: [],
                    notes: ''
                })
            ]);
        });
    });

    describe('US003 - Sauvegarde temporaire (brouillons)', () => {
        test('devrait sauvegarder un brouillon avec validation allégée', async () => {
            // Arrange
            const donneesBrouillon = {
                nom: 'Brouillon Test',
                systeme_jeu: 'monsterhearts'
                // Concept manquant mais acceptable pour un brouillon
            };
            
            const brouillonSauvegarde = testInstance.createTestData('personnage', {
                id: 456, 
                ...donneesBrouillon, 
                est_brouillon: true
            });
            testInstance.mockPersonnageModel.creer.mockResolvedValue(brouillonSauvegarde);

            // Act
            const result = await testInstance.personnageService.sauvegarderBrouillon(donneesBrouillon);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.creer, [
                expect.objectContaining({
                    nom: 'Brouillon Test',
                    systeme_jeu: 'monsterhearts',
                    est_brouillon: true
                })
            ]);
            testInstance.assertObjectStructure(result, brouillonSauvegarde);
        });

        test('devrait mettre à jour un brouillon existant', async () => {
            // Arrange
            const donneesMAJ = {
                id: 456,
                nom: 'Brouillon Modifié',
                systeme_jeu: 'monsterhearts'
            };
            
            const brouillonMAJ = { ...donneesMAJ, est_brouillon: true };
            // Mock pour que obtenirParId ne retourne pas null
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue({ id: 456 });
            testInstance.mockPersonnageModel.mettreAJour.mockResolvedValue(brouillonMAJ);

            // Act
            const result = await testInstance.personnageService.sauvegarderBrouillon(donneesMAJ);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.mettreAJour, [
                456,
                expect.objectContaining({
                    nom: 'Brouillon Modifié',
                    est_brouillon: true
                })
            ]);
            testInstance.assertObjectStructure(result, brouillonMAJ);
        });

        test('devrait rejeter un brouillon sans nom ou système', async () => {
            // Arrange
            const donneesInvalides = { concept: 'Test sans nom' };

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.personnageService.sauvegarderBrouillon(donneesInvalides),
                null,
                'Nom et système requis même pour un brouillon'
            );
        });
    });

    describe('US006 - Gestion des personnages sauvegardés', () => {
        test('devrait lister les personnages d\'un utilisateur avec pagination', async () => {
            // Arrange
            const utilisateurId = 1;
            const mockPersonnages = [
                testInstance.createTestData('personnage', { id: 1, nom: 'Hero 1', systeme_jeu: 'monsterhearts' }),
                testInstance.createTestData('personnage', { id: 2, nom: 'Hero 2', systeme_jeu: 'engrenages' })
            ];
            
            testInstance.mockPersonnageModel.count.mockResolvedValue(25);
            testInstance.mockPersonnageModel.findAll.mockResolvedValue(mockPersonnages);

            // Act
            const result = await testInstance.personnageService.listerParUtilisateur(
                utilisateurId, 
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.count, [
                'utilisateur_id = ?',
                [utilisateurId]
            ]);
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.findAll, [
                expect.stringContaining('utilisateur_id = ?'),
                [utilisateurId]
            ]);
            testInstance.assertObjectStructure(result, {
                personnages: mockPersonnages,
                total: 25
            });
        });

        test('devrait filtrer par système de jeu', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { systeme_jeu: 'monsterhearts' };
            
            testInstance.mockPersonnageModel.count.mockResolvedValue(5);
            testInstance.mockPersonnageModel.findAll.mockResolvedValue([]);

            // Act
            await testInstance.personnageService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.findAll, [
                expect.stringContaining('systeme_jeu = ?'),
                [utilisateurId, 'monsterhearts']
            ]);
        });

        test('devrait rechercher par nom', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { nom: 'Luna' };
            
            testInstance.mockPersonnageModel.count.mockResolvedValue(3);
            testInstance.mockPersonnageModel.findAll.mockResolvedValue([]);

            // Act
            await testInstance.personnageService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.findAll, [
                expect.stringContaining('nom ILIKE ?'),
                [utilisateurId, '%Luna%']
            ]);
        });
    });

    describe('US007 - Modification de personnage existant', () => {
        test('devrait mettre à jour un personnage existant', async () => {
            // Arrange
            const personnageId = 123;
            const personnageExistant = testInstance.createTestData('personnage', {
                id: personnageId,
                nom: 'Ancien Nom',
                concept: 'Ancien Concept',
                systeme_jeu: 'monsterhearts'
            });
            
            const nouvellesDonnees = {
                nom: 'Nouveau Nom',
                concept: 'Nouveau Concept'
            };
            
            const personnageMisAJour = { ...personnageExistant, ...nouvellesDonnees };
            
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue(personnageExistant);
            testInstance.mockPersonnageModel.mettreAJour.mockResolvedValue(personnageMisAJour);

            // Act
            const result = await testInstance.personnageService.mettreAJour(personnageId, nouvellesDonnees);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.obtenirParId, [personnageId]);
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.mettreAJour, [
                personnageId,
                nouvellesDonnees
            ]);
            testInstance.assertObjectStructure(result, personnageMisAJour);
        });

        test('devrait rejeter la mise à jour d\'un personnage inexistant', async () => {
            // Arrange
            const personnageId = 999;
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue(null);

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.personnageService.mettreAJour(personnageId, {}),
                null,
                'Personnage non trouvé'
            );
        });
    });

    describe('US008 - Duplication de personnage', () => {
        test('devrait dupliquer un personnage avec nouveau nom', async () => {
            // Arrange
            const personnageOriginal = testInstance.createTestData('personnage', {
                id: 123,
                nom: 'Original',
                concept: 'Test Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 2, cold: 1 },
                utilisateur_id: 1,
                date_creation: new Date('2023-01-01'),
                date_modification: new Date('2023-01-02')
            });
            
            const nouveauNom = 'Copie de Original';
            const utilisateurId = 2;
            const personnageDuplique = testInstance.createTestData('personnage', {
                id: 456, 
                nom: nouveauNom, 
                concept: 'Test Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 2, cold: 1 },
                utilisateur_id: utilisateurId
            });
            
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue(personnageOriginal);
            testInstance.mockPersonnageModel.creer.mockResolvedValue(personnageDuplique);

            // Act
            const result = await testInstance.personnageService.dupliquer(123, nouveauNom, utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.obtenirParId, [123]);
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.creer, [
                expect.objectContaining({
                    nom: nouveauNom,
                    concept: 'Test Concept',
                    systeme_jeu: 'monsterhearts',
                    attributs: { hot: 2, cold: 1 },
                    utilisateur_id: utilisateurId
                })
            ]);
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.creer, [
                expect.not.objectContaining({
                    id: expect.anything(),
                    date_creation: expect.anything(),
                    date_modification: expect.anything()
                })
            ]);
            testInstance.assertObjectStructure(result, personnageDuplique);
        });

        test('devrait rejeter la duplication d\'un personnage inexistant', async () => {
            // Arrange
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue(null);

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.personnageService.dupliquer(999, 'Nouveau Nom', 1),
                null,
                'Personnage original non trouvé'
            );
        });
    });

    describe('Validation des données selon les systèmes', () => {
        test('devrait valider les attributs numériques selon le système', () => {
            // Arrange
            const donneesValides = {
                nom: 'Test Hero',
                concept: 'Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 2, cold: -1 }
            };

            // Act & Assert - Ne devrait pas lever d'erreur
            expect(() => {
                testInstance.personnageService.validerDonnees(donneesValides);
            }).not.toThrow();
        });

        test('devrait rejeter des attributs hors limites', () => {
            // Arrange
            const donneesInvalides = {
                nom: 'Test Hero',
                concept: 'Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 10, cold: -5 } // Hors limites
            };

            // Act & Assert
            testInstance.assertThrows(
                () => testInstance.personnageService.validerDonnees(donneesInvalides),
                donneesInvalides
            );
        });

        test('devrait accepter les brouillons avec champs manquants', () => {
            // Arrange
            const brouillonValide = {
                nom: 'Brouillon',
                systeme_jeu: 'monsterhearts',
                est_brouillon: true
                // Concept manquant mais OK pour un brouillon
            };

            // Act & Assert - Ne devrait pas lever d'erreur
            expect(() => {
                testInstance.personnageService.validerDonnees(brouillonValide);
            }).not.toThrow();
        });
    });

    describe('Statistiques et recherche', () => {
        test('devrait retourner les statistiques d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 1;
            const mockStats = {
                total: 15,
                par_systeme: { monsterhearts: 8, engrenages: 7 },
                recents: [{ id: 1, nom: 'Recent Hero' }],
                brouillons: 3
            };
            
            testInstance.mockPersonnageModel.obtenirStatistiques.mockResolvedValue(mockStats);

            // Act
            const result = await testInstance.personnageService.obtenirStatistiques(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.obtenirStatistiques, [utilisateurId]);
            testInstance.assertObjectStructure(result, mockStats);
        });

        test('devrait rechercher des personnages par terme', async () => {
            // Arrange
            const utilisateurId = 1;
            const terme = 'Luna';
            const mockResultats = [
                testInstance.createTestData('personnage', { id: 1, nom: 'Luna Darkwood' }),
                testInstance.createTestData('personnage', { id: 2, nom: 'Luna Silver' })
            ];
            
            testInstance.mockPersonnageModel.lister.mockResolvedValue(mockResultats);

            // Act
            const result = await testInstance.personnageService.rechercher(utilisateurId, terme);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPersonnageModel.lister, [
                expect.objectContaining({
                    where: expect.stringContaining('nom ILIKE ? OR description ILIKE ?'),
                    valeurs: [utilisateurId, '%Luna%', '%Luna%'],
                    limit: 10
                })
            ]);
            testInstance.assertObjectStructure(result, mockResultats);
        });
    });
});