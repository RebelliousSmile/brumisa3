/**
 * Tests unitaires pour UtilisateurService (Backend) - User Stories US005, US013
 * Tests basés sur les user stories d'authentification et gestion admin
 */

const UtilisateurService = require('../../src/services/UtilisateurService');

// Mock des dépendances
jest.mock('../../src/models/Utilisateur');
jest.mock('../../src/database/db');

const Utilisateur = require('../../src/models/Utilisateur');
const crypto = require('crypto');

describe('UtilisateurService Backend - User Stories', () => {
    let utilisateurService;
    let mockUtilisateurModel;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock du modèle Utilisateur
        mockUtilisateurModel = {
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
        
        Utilisateur.mockImplementation(() => mockUtilisateurModel);
        
        utilisateurService = new UtilisateurService();
    });

    describe('US005 - Connexion pour sauvegarder', () => {
        test('devrait créer un nouveau compte utilisateur', async () => {
            // Arrange
            const donnees = {
                nom: 'Test User',
                email: 'test@example.com',
                motDePasse: 'password123'
            };
            
            const utilisateurCree = {
                id: 123,
                nom: 'Test User',
                email: 'test@example.com',
                role: 'UTILISATEUR',
                actif: true,
                date_creation: new Date()
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null); // Pas d'utilisateur existant
            mockUtilisateurModel.create.mockResolvedValue(utilisateurCree);

            // Act
            const result = await utilisateurService.creer(donnees);

            // Assert
            expect(mockUtilisateurModel.obtenirParEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUtilisateurModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    nom: 'Test User',
                    email: 'test@example.com',
                    mot_de_passe: 'password123',
                    role: 'UTILISATEUR',
                    actif: true
                })
            );
            expect(result).toEqual(utilisateurCree);
        });

        test('devrait rejeter la création avec un email déjà existant', async () => {
            // Arrange
            const donnees = {
                nom: 'Test User',
                email: 'existing@example.com',
                motDePasse: 'password123'
            };
            
            const utilisateurExistant = {
                id: 456,
                email: 'existing@example.com'
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateurExistant);

            // Act & Assert
            await expect(utilisateurService.creer(donnees))
                .rejects.toThrow('Un utilisateur avec cet email existe déjà');
        });

        test('devrait authentifier un utilisateur avec des identifiants valides', async () => {
            // Arrange
            const email = 'test@example.com';
            const motDePasse = 'password123';
            
            const utilisateur = {
                id: 123,
                email: 'test@example.com',
                nom: 'Test User',
                mot_de_passe: '$2b$10$hashedpassword',
                actif: true
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            mockUtilisateurModel.verifierMotDePasse.mockResolvedValue(true);

            // Act
            const result = await utilisateurService.authentifier(email, motDePasse);

            // Assert
            expect(mockUtilisateurModel.obtenirParEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUtilisateurModel.verifierMotDePasse).toHaveBeenCalledWith(
                'password123',
                '$2b$10$hashedpassword'
            );
            expect(result).toEqual(utilisateur);
        });

        test('devrait rejeter l\'authentification avec un mot de passe incorrect', async () => {
            // Arrange
            const email = 'test@example.com';
            const motDePasse = 'wrongpassword';
            
            const utilisateur = {
                id: 123,
                email: 'test@example.com',
                mot_de_passe: '$2b$10$hashedpassword'
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            mockUtilisateurModel.verifierMotDePasse.mockResolvedValue(false);

            // Act
            const result = await utilisateurService.authentifier(email, motDePasse);

            // Assert
            expect(result).toBeNull();
        });

        test('devrait rejeter l\'authentification pour un email inexistant', async () => {
            // Arrange
            const email = 'nonexistent@example.com';
            const motDePasse = 'password123';
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null);

            // Act
            const result = await utilisateurService.authentifier(email, motDePasse);

            // Assert
            expect(result).toBeNull();
        });

        test('devrait mettre à jour la dernière connexion', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = {
                id: utilisateurId,
                email: 'test@example.com'
            };
            
            const utilisateurMAJ = {
                ...utilisateurExistant,
                derniere_connexion: expect.any(Date)
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue(utilisateurMAJ);

            // Act
            const result = await utilisateurService.mettreAJourDerniereConnexion(utilisateurId);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    derniere_connexion: expect.any(Date)
                })
            );
            expect(result).toEqual(utilisateurMAJ);
        });
    });

    describe('US013 - Gestion globale des utilisateurs (Admin)', () => {
        test('devrait lister tous les utilisateurs avec pagination', async () => {
            // Arrange
            const mockUtilisateurs = [
                { id: 1, nom: 'User 1', email: 'user1@example.com', role: 'UTILISATEUR' },
                { id: 2, nom: 'User 2', email: 'user2@example.com', role: 'PREMIUM' },
                { id: 3, nom: 'Admin', email: 'admin@example.com', role: 'ADMIN' }
            ];
            
            mockUtilisateurModel.count.mockResolvedValue(25);
            mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await utilisateurService.lister(
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            expect(mockUtilisateurModel.count).toHaveBeenCalledWith(
                'date_suppression IS NULL',
                []
            );
            expect(mockUtilisateurModel.findAll).toHaveBeenCalledWith(
                'date_suppression IS NULL',
                [],
                'date_creation DESC',
                20
            );
            expect(result).toEqual({
                utilisateurs: mockUtilisateurs,
                total: 25
            });
        });

        test('devrait filtrer les utilisateurs par rôle', async () => {
            // Arrange
            const filtres = { role: 'PREMIUM' };
            const mockUtilisateurs = [
                { id: 2, nom: 'Premium User', email: 'premium@example.com', role: 'PREMIUM' }
            ];
            
            mockUtilisateurModel.count.mockResolvedValue(5);
            mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await utilisateurService.lister(filtres);

            // Assert
            expect(mockUtilisateurModel.findAll).toHaveBeenCalledWith(
                'role = ? AND date_suppression IS NULL',
                ['PREMIUM'],
                'date_creation DESC',
                20
            );
            expect(result.utilisateurs).toEqual(mockUtilisateurs);
        });

        test('devrait rechercher des utilisateurs par nom ou email', async () => {
            // Arrange
            const filtres = { recherche: 'john' };
            const mockUtilisateurs = [
                { id: 5, nom: 'John Doe', email: 'john@example.com', role: 'UTILISATEUR' }
            ];
            
            mockUtilisateurModel.count.mockResolvedValue(1);
            mockUtilisateurModel.findAll.mockResolvedValue(mockUtilisateurs);

            // Act
            const result = await utilisateurService.lister(filtres);

            // Assert
            expect(mockUtilisateurModel.findAll).toHaveBeenCalledWith(
                '(nom ILIKE ? OR email ILIKE ?) AND date_suppression IS NULL',
                ['%john%', '%john%'],
                'date_creation DESC',
                20
            );
            expect(result.utilisateurs).toEqual(mockUtilisateurs);
        });

        test('devrait mettre à jour le rôle d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const nouveauRole = 'PREMIUM';
            
            const utilisateurExistant = {
                id: utilisateurId,
                role: 'UTILISATEUR'
            };
            
            const utilisateurMAJ = {
                ...utilisateurExistant,
                role: 'PREMIUM'
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue(utilisateurMAJ);

            // Act
            const result = await utilisateurService.mettreAJourRole(utilisateurId, nouveauRole);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    role: 'PREMIUM'
                })
            );
            expect(result).toEqual(utilisateurMAJ);
        });

        test('devrait rejeter un rôle invalide', async () => {
            // Arrange
            const utilisateurId = 123;
            const roleInvalide = 'SUPER_ADMIN';

            // Act & Assert
            await expect(utilisateurService.mettreAJourRole(utilisateurId, roleInvalide))
                .rejects.toThrow('Rôle invalide');
        });

        test('devrait désactiver un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = {
                id: utilisateurId,
                actif: true
            };
            
            const utilisateurDesactive = {
                ...utilisateurExistant,
                actif: false
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue(utilisateurDesactive);

            // Act
            const result = await utilisateurService.desactiver(utilisateurId);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    actif: false
                })
            );
            expect(result).toEqual(utilisateurDesactive);
        });

        test('devrait réactiver un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = {
                id: utilisateurId,
                actif: false
            };
            
            const utilisateurReactive = {
                ...utilisateurExistant,
                actif: true
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue(utilisateurReactive);

            // Act
            const result = await utilisateurService.reactiver(utilisateurId);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    actif: true
                })
            );
            expect(result).toEqual(utilisateurReactive);
        });

        test('devrait obtenir les statistiques des utilisateurs', async () => {
            // Arrange
            const mockStats = {
                total: 150,
                UTILISATEUR: 120,
                PREMIUM: 25,
                ADMIN: 5
            };
            
            mockUtilisateurModel.compterParRole.mockResolvedValue(mockStats);

            // Act
            const result = await utilisateurService.obtenirStatistiques();

            // Assert
            expect(mockUtilisateurModel.compterParRole).toHaveBeenCalled();
            expect(result).toEqual(mockStats);
        });

        test('devrait supprimer un utilisateur (soft delete)', async () => {
            // Arrange
            const utilisateurId = 123;
            const utilisateurExistant = {
                id: utilisateurId,
                email: 'test@example.com',
                nom: 'Test User'
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue();

            // Act
            const result = await utilisateurService.supprimer(utilisateurId);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    email: `deleted_${utilisateurId}@example.com`,
                    nom: 'Utilisateur supprimé',
                    actif: false,
                    date_suppression: expect.any(Date)
                })
            );
            expect(result).toBe(true);
        });
    });

    describe('Gestion des mots de passe et tokens', () => {
        test('devrait générer un token de récupération de mot de passe', async () => {
            // Arrange
            const email = 'test@example.com';
            const utilisateur = {
                id: 123,
                email: 'test@example.com',
                actif: true
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(utilisateur);
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            mockUtilisateurModel.update.mockResolvedValue();

            // Act
            const result = await utilisateurService.genererTokenRecuperation(email);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                123,
                expect.objectContaining({
                    token_recuperation: expect.any(String),
                    token_expiration: expect.any(Date)
                })
            );
            expect(result).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    expiration: expect.any(Date)
                })
            );
        });

        test('devrait valider un token de récupération valide', async () => {
            // Arrange
            const token = 'valid_token_123';
            const utilisateur = {
                id: 123,
                token_recuperation: token,
                token_expiration: new Date(Date.now() + 60 * 60 * 1000) // 1 heure dans le futur
            };
            
            mockUtilisateurModel.obtenirParToken.mockResolvedValue(utilisateur);

            // Act
            const result = await utilisateurService.validerTokenRecuperation(token);

            // Assert
            expect(result).toEqual(utilisateur);
        });

        test('devrait rejeter un token expiré', async () => {
            // Arrange
            const token = 'expired_token_123';
            const utilisateur = {
                id: 123,
                token_recuperation: token,
                token_expiration: new Date(Date.now() - 60 * 60 * 1000) // 1 heure dans le passé
            };
            
            mockUtilisateurModel.obtenirParToken.mockResolvedValue(utilisateur);
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            mockUtilisateurModel.update.mockResolvedValue();

            // Act
            const result = await utilisateurService.validerTokenRecuperation(token);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                123,
                expect.objectContaining({
                    token_recuperation: null,
                    token_expiration: null
                })
            );
            expect(result).toBeNull();
        });

        test('devrait mettre à jour le mot de passe d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const nouveauMotDePasse = 'newpassword123';
            const utilisateur = {
                id: utilisateurId,
                email: 'test@example.com'
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateur);
            mockUtilisateurModel.update.mockResolvedValue();

            // Act
            const result = await utilisateurService.mettreAJourMotDePasse(utilisateurId, nouveauMotDePasse);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    mot_de_passe: 'newpassword123',
                    token_recuperation: null,
                    token_expiration: null
                })
            );
            expect(result).toBe(true);
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
                utilisateurService.validerDonnees(donneesValides);
            }).not.toThrow();
        });

        test('devrait rejeter un nom trop court', () => {
            // Arrange
            const donneesInvalides = {
                nom: 'A',
                email: 'test@example.com'
            };

            // Act & Assert
            expect(() => {
                utilisateurService.validerDonnees(donneesInvalides);
            }).toThrow('Le nom doit contenir au moins 2 caractères');
        });

        test('devrait rejeter un email invalide', () => {
            // Arrange
            const donneesInvalides = {
                nom: 'Test User',
                email: 'invalid-email'
            };

            // Act & Assert
            expect(() => {
                utilisateurService.validerDonnees(donneesInvalides);
            }).toThrow('Format email invalide');
        });

        test('devrait valider le format email', () => {
            // Arrange & Act
            const emailValide = utilisateurService.validerFormatEmail('test@example.com');
            const emailInvalide = utilisateurService.validerFormatEmail('invalid-email');

            // Assert
            expect(emailValide).toBe(true);
            expect(emailInvalide).toBe(false);
        });
    });

    describe('Fonctionnalités Premium', () => {
        test('devrait activer le statut Premium pour un utilisateur', async () => {
            // Arrange
            const utilisateurId = 123;
            const montantDon = 5.00;
            
            const utilisateurExistant = {
                id: utilisateurId,
                role: 'UTILISATEUR'
            };
            
            const utilisateurPremium = {
                ...utilisateurExistant,
                role: 'PREMIUM',
                type_compte: 'PREMIUM',
                date_premium: expect.any(Date)
            };
            
            mockUtilisateurModel.obtenirParId.mockResolvedValue(utilisateurExistant);
            mockUtilisateurModel.update.mockResolvedValue(utilisateurPremium);

            // Act
            const result = await utilisateurService.activerPremium(utilisateurId, montantDon);

            // Assert
            expect(mockUtilisateurModel.update).toHaveBeenCalledWith(
                utilisateurId,
                expect.objectContaining({
                    role: 'PREMIUM',
                    type_compte: 'PREMIUM',
                    date_premium: expect.any(Date),
                    montant_don_total: 5.00
                })
            );
            expect(result).toEqual(utilisateurPremium);
        });

        test('devrait créer un compte donateur pour un don sans compte existant', async () => {
            // Arrange
            const email = 'donateur@example.com';
            const montantDon = 15.00;
            
            const compteCree = {
                id: 456,
                email: 'donateur@example.com',
                nom: 'Donateur donateur',
                role: 'PREMIUM',
                type_compte: 'PREMIUM_VIP'
            };
            
            mockUtilisateurModel.obtenirParEmail.mockResolvedValue(null);
            mockUtilisateurModel.create.mockResolvedValue(compteCree);

            // Act
            const result = await utilisateurService.creerCompteDonateur(email, montantDon);

            // Assert
            expect(mockUtilisateurModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    nom: 'Donateur donateur',
                    email: 'donateur@example.com',
                    role: 'PREMIUM',
                    type_compte: 'PREMIUM_VIP',
                    montant_don_total: 15.00,
                    compte_don_temporaire: true
                })
            );
            expect(result).toEqual(
                expect.objectContaining({
                    ...compteCree,
                    motDePasseTemporaire: expect.any(String)
                })
            );
        });
    });
});