/**
 * Tests unitaires pour UtilisateurService (Backend) - User Stories US005, US013
 * Tests basés sur les user stories d'authentification et gestion admin
 * Utilise l'architecture SOLID pour les tests unitaires
 */

const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');
const UtilisateurService = require('../../src/services/UtilisateurService');

// Mock des dépendances
jest.mock('../../src/models/Utilisateur');
jest.mock('../../src/database/db');

const Utilisateur = require('../../src/models/Utilisateur');
const crypto = require('crypto');

class UtilisateurServiceBackendTest extends BaseUnitTest {
    constructor() {
        super({
            mockDatabase: true,
            mockExternalServices: true
        });
        this.testContext = UnitTestFactory.createServiceTestContext('UtilisateurService');
    }

    async customSetup() {
        // Mock du modèle Utilisateur
        this.mockUtilisateurModel = {
            create: jest.fn(),
            update: jest.fn(),
            obtenirParId: jest.fn(),
            obtenirParEmail: jest.fn(),
            obtenirParToken: jest.fn(),
            findAll: jest.fn(),
            count: jest.fn(),
            compterParRole: jest.fn(),
            verifierMotDePasse: jest.fn(),
            convertPlaceholders: jest.fn()
        };
        
        Utilisateur.mockImplementation(() => this.mockUtilisateurModel);
        
        this.utilisateurService = new UtilisateurService();
    }
}

describe('UtilisateurService Backend - User Stories', () => {
    let testInstance;

    beforeAll(async () => {
        testInstance = new UtilisateurServiceBackendTest();
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('US005 - Connexion pour sauvegarder', () => {
        test('devrait créer un nouveau compte utilisateur', async () => {
            // Arrange
            const donnees = {
                nom: 'Test User',
                email: 'test@example.com',
                motDePasse: 'password123'
            };
            
            const utilisateurCree = testInstance.createTestData('user', {
                id: 123,
                nom: 'Test User',
                email: 'test@example.com',
                role: 'UTILISATEUR',
                actif: true,
                date_creation: new Date()
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null);
            testInstance.mockUtilisateurModel.create.mockResolvedValue(utilisateurCree);

            // Act
            const result = await testInstance.utilisateurService.creer(donnees);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.obtenirParEmail, ['test@example.com']);
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.create, [
                expect.objectContaining({
                    nom: 'Test User',
                    email: 'test@example.com',
                    mot_de_passe: 'password123',
                    role: 'UTILISATEUR',
                    actif: true
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurCree);
        });

        test('devrait rejeter la création avec un email déjà existant', async () => {
            // Arrange
            const donnees = {
                nom: 'Test User',
                email: 'existing@example.com',
                motDePasse: 'password123'
            };
            
            const utilisateurExistant = testInstance.createTestData('user', {
                id: 456,
                email: 'existing@example.com'
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateurExistant);

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.utilisateurService.creer(donnees),
                null,
                'Un utilisateur avec cet email existe déjà'
            );
        });

        test('devrait authentifier un utilisateur avec des identifiants valides', async () => {
            // Arrange
            const email = 'test@example.com';
            const motDePasse = 'password123';
            
            const utilisateur = testInstance.createTestData('user', {
                id: 123,
                email: 'test@example.com',
                nom: 'Test User',
                mot_de_passe: '$2b$10$hashedpassword',
                actif: true
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.verifierMotDePasse.mockResolvedValue(true);

            // Act
            const result = await testInstance.utilisateurService.authentifier(email, motDePasse);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.obtenirParEmail, ['test@example.com']);
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.verifierMotDePasse, [
                'password123',
                '$2b$10$hashedpassword'
            ]);
            testInstance.assertObjectStructure(result, utilisateur);
        });

        test('devrait rejeter l\'authentification avec un mot de passe incorrect', async () => {
            // Arrange
            const email = 'test@example.com';
            const motDePasse = 'wrongpassword';
            
            const utilisateur = testInstance.createTestData('user', {
                id: 123,
                email: 'test@example.com',
                mot_de_passe: '$2b$10$hashedpassword'
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.verifierMotDePasse.mockResolvedValue(false);

            // Act
            const result = await testInstance.utilisateurService.authentifier(email, motDePasse);

            // Assert
            testInstance.assertFunction(() => result, null, null);
        });

        test('devrait rejeter l\'authentification pour un email inexistant', async () => {
            // Arrange
            const email = 'nonexistent@example.com';
            const motDePasse = 'password123';
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null);

            // Act
            const result = await testInstance.utilisateurService.authentifier(email, motDePasse);

            // Assert
            testInstance.assertFunction(() => result, null, null);
        });

        test('devrait mettre à jour la dernière connexion', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                email: 'test@example.com'
            });
            
            const utilisateurMAJ = {
                ...utilisateurExistant,
                derniere_connexion: expect.any(Date)
            };
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue(utilisateurMAJ);

            // Act
            const result = await testInstance.utilisateurService.mettreAJourDerniereConnexion(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    derniere_connexion: expect.any(Date)
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurMAJ);
        });
    });

    describe('US013 - Gestion globale des utilisateurs (Admin)', () => {
        test('devrait lister tous les utilisateurs avec pagination', async () => {
            // Arrange
            const mockUtilisateurs = [
                testInstance.createTestData('user', { id: 1, nom: 'User 1', email: 'user1@example.com', role: 'UTILISATEUR' }),
                testInstance.createTestData('user', { id: 2, nom: 'User 2', email: 'user2@example.com', role: 'PREMIUM' }),
                testInstance.createTestData('user', { id: 3, nom: 'Admin', email: 'admin@example.com', role: 'ADMIN' })
            ];
            
            testInstance.mockUtilisateurModel.count.mockResolvedValue(25);
            testInstance.mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await testInstance.utilisateurService.lister(
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.count, [
                'date_suppression IS NULL',
                []
            ]);
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.findAll, [
                'date_suppression IS NULL',
                [],
                'date_creation DESC',
                20
            ]);
            testInstance.assertObjectStructure(result, {
                utilisateurs: mockUtilisateurs,
                total: 25
            });
        });

        test('devrait filtrer les utilisateurs par rôle', async () => {
            // Arrange
            const filtres = { role: 'PREMIUM' };
            const mockUtilisateurs = [
                testInstance.createTestData('user', { id: 2, nom: 'Premium User', email: 'premium@example.com', role: 'PREMIUM' })
            ];
            
            testInstance.mockUtilisateurModel.count.mockResolvedValue(5);
            testInstance.mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await testInstance.utilisateurService.lister(filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.findAll, [
                'role = ? AND date_suppression IS NULL',
                ['PREMIUM'],
                'date_creation DESC',
                20
            ]);
            testInstance.assertObjectStructure(result.utilisateurs, mockUtilisateurs);
        });

        test('devrait rechercher des utilisateurs par nom ou email', async () => {
            // Arrange
            const filtres = { recherche: 'john' };
            const mockUtilisateurs = [
                testInstance.createTestData('user', { id: 5, nom: 'John Doe', email: 'john@example.com', role: 'UTILISATEUR' })
            ];
            
            testInstance.mockUtilisateurModel.count.mockResolvedValue(1);
            testInstance.mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await testInstance.utilisateurService.lister(filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.findAll, [
                '(nom ILIKE ? OR email ILIKE ?) AND date_suppression IS NULL',
                ['%john%', '%john%'],
                'date_creation DESC',
                20
            ]);
            testInstance.assertObjectStructure(result.utilisateurs, mockUtilisateurs);
        });

        test('devrait mettre à jour le rôle d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const nouveauRole = 'PREMIUM';
            
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                role: 'UTILISATEUR'
            });
            
            const utilisateurMAJ = {
                ...utilisateurExistant,
                role: 'PREMIUM'
            };
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue(utilisateurMAJ);

            // Act
            const result = await testInstance.utilisateurService.mettreAJourRole(utilisateurId, nouveauRole);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    role: 'PREMIUM'
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurMAJ);
        });

        test('devrait rejeter un rôle invalide', async () => {
            // Arrange
            const utilisateurId = 123;
            const roleInvalide = 'SUPER_ADMIN';

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.utilisateurService.mettreAJourRole(utilisateurId, roleInvalide),
                null,
                'Rôle invalide'
            );
        });

        test('devrait désactiver un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                actif: true
            });
            
            const utilisateurDesactive = {
                ...utilisateurExistant,
                actif: false
            };
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue(utilisateurDesactive);

            // Act
            const result = await testInstance.utilisateurService.desactiver(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    actif: false
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurDesactive);
        });

        test('devrait réactiver un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                actif: false
            });
            
            const utilisateurReactive = {
                ...utilisateurExistant,
                actif: true
            };
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue(utilisateurReactive);

            // Act
            const result = await testInstance.utilisateurService.reactiver(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    actif: true
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurReactive);
        });

        test('devrait obtenir les statistiques des utilisateurs', async () => {
            // Arrange
            const mockStats = {
                total: 150,
                UTILISATEUR: 120,
                PREMIUM: 25,
                ADMIN: 5
            };
            
            testInstance.mockUtilisateurModel.compterParRole.mockResolvedValue(mockStats);

            // Act
            const result = await testInstance.utilisateurService.obtenirStatistiques();

            // Assert
            testInstance.assertMockCallCount(testInstance.mockUtilisateurModel.compterParRole, 1);
            testInstance.assertObjectStructure(result, mockStats);
        });

        test('devrait supprimer un utilisateur (soft delete)', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                email: 'test@example.com',
                nom: 'Test User'
            });
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue({ ...utilisateurExistant, supprime: true });

            // Act
            const result = await testInstance.utilisateurService.supprimer(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    email: `deleted_${utilisateurId}@example.com`,
                    nom: 'Utilisateur supprimé',
                    actif: false,
                    date_modification: expect.any(Date)
                })
            ]);
            testInstance.assertFunction(() => result, null, true);
        });
    });

    describe('Gestion des mots de passe et tokens', () => {
        test('devrait générer un token de récupération de mot de passe', async () => {
            // Arrange
            const email = 'test@example.com';
            const utilisateur = testInstance.createTestData('user', {
                id: 123,
                email: 'test@example.com',
                actif: true
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.update.mockResolvedValue({ ...utilisateur, token_recuperation: 'mocked_token' });

            // Act
            const result = await testInstance.utilisateurService.genererTokenRecuperation(email);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                123,
                expect.objectContaining({
                    token_recuperation: expect.any(String),
                    token_expiration: expect.any(Date)
                })
            ]);
            testInstance.assertObjectStructure(result, {
                token: expect.any(String),
                expiration: expect.any(Date)
            });
        });

        test('devrait valider un token de récupération valide', async () => {
            // Arrange
            const token = 'valid_token_123';
            const utilisateur = testInstance.createTestData('user', {
                id: 123,
                token_recuperation: token,
                token_expiration: new Date(Date.now() + 60 * 60 * 1000)
            });
            
            testInstance.mockUtilisateurModel.obtenirParToken.mockResolvedValue(utilisateur);

            // Act
            const result = await testInstance.utilisateurService.validerTokenRecuperation(token);

            // Assert
            testInstance.assertObjectStructure(result, utilisateur);
        });

        test('devrait rejeter un token expiré', async () => {
            // Arrange
            const token = 'expired_token_123';
            const utilisateur = testInstance.createTestData('user', {
                id: 123,
                token_recuperation: token,
                token_expiration: new Date(Date.now() - 60 * 60 * 1000)
            });
            
            testInstance.mockUtilisateurModel.obtenirParToken.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.update.mockResolvedValue({ id: 123, email: 'test@example.com' });

            // Act
            const result = await testInstance.utilisateurService.validerTokenRecuperation(token);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                123,
                expect.objectContaining({
                    token_recuperation: null,
                    token_expiration: null
                })
            ]);
            testInstance.assertFunction(() => result, null, null);
        });

        test('devrait mettre à jour le mot de passe d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const nouveauMotDePasse = 'newpassword123';
            const utilisateur = testInstance.createTestData('user', {
                id: utilisateurId,
                email: 'test@example.com'
            });
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            testInstance.mockUtilisateurModel.update.mockResolvedValue({ id: 123, email: 'test@example.com' });

            // Act
            const result = await testInstance.utilisateurService.mettreAJourMotDePasse(utilisateurId, nouveauMotDePasse);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    mot_de_passe: 'newpassword123',
                    token_recuperation: null,
                    token_expiration: null
                })
            ]);
            testInstance.assertFunction(() => result, null, true);
        });
    });

    describe('Validation des données', () => {
        test('devrait valider des données utilisateur correctes', () => {
            // Arrange
            const donneesValides = {
                nom: 'Test User',
                email: 'test@example.com',
                role: 'UTILISATEUR'
            };

            // Act & Assert - Ne devrait pas lever d'erreur
            expect(() => {
                testInstance.utilisateurService.validerDonnees(donneesValides);
            }).not.toThrow();
        });

        test('devrait rejeter un nom trop court', () => {
            // Arrange
            const donneesInvalides = {
                nom: 'A',
                email: 'test@example.com'
            };

            // Act & Assert
            testInstance.assertThrows(
                () => testInstance.utilisateurService.validerDonnees(donneesInvalides),
                donneesInvalides,
                'Le nom doit contenir au moins 2 caractères'
            );
        });

        test('devrait rejeter un email invalide', () => {
            // Arrange
            const donneesInvalides = {
                nom: 'Test User',
                email: 'invalid-email'
            };

            // Act & Assert
            testInstance.assertThrows(
                () => testInstance.utilisateurService.validerDonnees(donneesInvalides),
                donneesInvalides,
                'Format email invalide'
            );
        });

        test('devrait valider le format email', () => {
            // Arrange & Act
            const emailValide = testInstance.utilisateurService.validerFormatEmail('test@example.com');
            const emailInvalide = testInstance.utilisateurService.validerFormatEmail('invalid-email');

            // Assert
            testInstance.assertFunction(() => emailValide, null, true);
            testInstance.assertFunction(() => emailInvalide, null, false);
        });
    });

    describe('Fonctionnalités Premium', () => {
        test('devrait activer le statut Premium pour un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const montantDon = 5.00;
            
            const utilisateurExistant = testInstance.createTestData('user', {
                id: utilisateurId,
                role: 'UTILISATEUR'
            });
            
            const utilisateurPremium = {
                ...utilisateurExistant,
                role: 'PREMIUM',
                type_compte: 'PREMIUM',
                date_premium: expect.any(Date)
            };
            
            testInstance.mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            testInstance.mockUtilisateurModel.update.mockResolvedValue(utilisateurPremium);

            // Act
            const result = await testInstance.utilisateurService.activerPremium(utilisateurId, montantDon);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.update, [
                utilisateurId,
                expect.objectContaining({
                    role: 'PREMIUM',
                    type_compte: 'PREMIUM',
                    date_premium: expect.any(Date),
                    montant_don_total: 5.00
                })
            ]);
            testInstance.assertObjectStructure(result, utilisateurPremium);
        });

        test('devrait créer un compte donateur pour un don sans compte existant', async () => {
            // Arrange
            const email = 'donateur@example.com';
            const montantDon = 15.00;
            
            const compteCree = testInstance.createTestData('user', {
                id: 456,
                email: 'donateur@example.com',
                nom: 'Donateur donateur',
                role: 'PREMIUM',
                type_compte: 'PREMIUM_VIP'
            });
            
            testInstance.mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null);
            testInstance.mockUtilisateurModel.create.mockResolvedValue(compteCree);

            // Act
            const result = await testInstance.utilisateurService.creerCompteDonateur(email, montantDon);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockUtilisateurModel.create, [
                expect.objectContaining({
                    nom: 'Donateur donateur',
                    email: 'donateur@example.com',
                    role: 'PREMIUM',
                    type_compte: 'PREMIUM_VIP',
                    montant_don_total: 15.00,
                    compte_don_temporaire: true
                })
            ]);
            testInstance.assertObjectStructure(result, {
                ...compteCree,
                motDePasseTemporaire: expect.any(String)
            });
        });
    });
});