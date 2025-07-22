/**
 * Tests unitaires pour PersonnageService (Backend) - User Stories US002, US006-US008
 * Tests basés sur les user stories principales
 */

const PersonnageService = require('../../src/services/PersonnageService');

// Mock des dépendances
jest.mock('../../src/models/Personnage');
jest.mock('../../src/utils/systemesJeu');
jest.mock('../../src/database/db');

const Personnage = require('../../src/models/Personnage');
const systemesJeu = require('../../src/utils/systemesJeu');

describe('PersonnageService Backend - User Stories', () => {
    let personnageService;
    let mockPersonnageModel;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock du modèle Personnage
        mockPersonnageModel = {
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
        
        Personnage.mockImplementation(() => mockPersonnageModel);
        
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
        
        personnageService = new PersonnageService();
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
            
            const personnageCree = { id: 123, ...donnees, date_creation: new Date() };
            mockPersonnageModel.creer.mockResolvedValue(personnageCree);

            // Act
            const result = await personnageService.creer(donnees);

            // Assert
            expect(mockPersonnageModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    nom: 'Luna Darkwood',
                    concept: 'Vampire rebelle',
                    systeme_jeu: 'monsterhearts',
                    attributs: expect.any(Object),
                    competences: expect.any(Object)
                })
            );
            expect(result).toEqual(personnageCree);
        });

        test('devrait rejeter un personnage avec système invalide', async () => {
            // Arrange
            const donnees = {
                nom: 'Test',
                systeme_jeu: 'inexistant'
            };

            // Act & Assert
            await expect(personnageService.creer(donnees))
                .rejects.toThrow('Système de jeu invalide');
        });

        test('devrait appliquer les défauts du système lors de la création', async () => {
            // Arrange
            const donnees = {
                nom: 'Test Hero',
                concept: 'Test',
                systeme_jeu: 'monsterhearts'
            };
            
            mockPersonnageModel.creer.mockResolvedValue({ id: 1, ...donnees });

            // Act
            await personnageService.creer(donnees);

            // Assert
            expect(mockPersonnageModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    attributs: { hot: 0, cold: 0 },
                    competences: {},
                    infos_base: {},
                    inventaire: [],
                    notes: ''
                })
            );
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
            
            const brouillonSauvegarde = { id: 456, ...donneesBrouillon, est_brouillon: true };
            mockPersonnageModel.creer.mockResolvedValue(brouillonSauvegarde);

            // Act
            const result = await personnageService.sauvegarderBrouillon(donneesBrouillon);

            // Assert
            expect(mockPersonnageModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    nom: 'Brouillon Test',
                    systeme_jeu: 'monsterhearts',
                    est_brouillon: true
                })
            );
            expect(result).toEqual(brouillonSauvegarde);
        });

        test('devrait mettre à jour un brouillon existant', async () => {
            // Arrange
            const donneesMAJ = {
                id: 456,
                nom: 'Brouillon Modifié',
                systeme_jeu: 'monsterhearts'
            };
            
            const brouillonMAJ = { ...donneesMAJ, est_brouillon: true };
            mockPersonnageModel.mettreAJour.mockResolvedValue(brouillonMAJ);

            // Act
            const result = await personnageService.sauvegarderBrouillon(donneesMAJ);

            // Assert
            expect(mockPersonnageModel.mettreAJour).toHaveBeenCalledWith(
                456,
                expect.objectContaining({
                    nom: 'Brouillon Modifié',
                    est_brouillon: true
                })
            );
            expect(result).toEqual(brouillonMAJ);
        });

        test('devrait rejeter un brouillon sans nom ou système', async () => {
            // Arrange
            const donneesInvalides = { concept: 'Test sans nom' };

            // Act & Assert
            await expect(personnageService.sauvegarderBrouillon(donneesInvalides))
                .rejects.toThrow('Nom et système requis même pour un brouillon');
        });
    });

    describe('US006 - Gestion des personnages sauvegardés', () => {
        test('devrait lister les personnages d\'un utilisateur avec pagination', async () => {
            // Arrange
            const utilisateurId = 1;
            const mockPersonnages = [
                { id: 1, nom: 'Hero 1', systeme_jeu: 'monsterhearts' },
                { id: 2, nom: 'Hero 2', systeme_jeu: 'engrenages' }
            ];
            
            mockPersonnageModel.count.mockResolvedValue(25);
            mockPersonnageModel.findAll.mockResolvedValue(mockPersonnages);

            // Act
            const result = await personnageService.listerParUtilisateur(
                utilisateurId, 
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            expect(mockPersonnageModel.count).toHaveBeenCalledWith(
                'utilisateur_id = ?',
                [utilisateurId]
            );
            expect(mockPersonnageModel.findAll).toHaveBeenCalledWith(
                expect.stringContaining('utilisateur_id = ?'),
                [utilisateurId]
            );
            expect(result).toEqual({
                personnages: mockPersonnages,
                total: 25
            });
        });

        test('devrait filtrer par système de jeu', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { systeme_jeu: 'monsterhearts' };
            
            mockPersonnageModel.count.mockResolvedValue(5);
            mockPersonnageModel.findAll.mockResolvedValue([]);

            // Act
            await personnageService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            expect(mockPersonnageModel.findAll).toHaveBeenCalledWith(
                expect.stringContaining('systeme_jeu = ?'),
                [utilisateurId, 'monsterhearts']
            );
        });

        test('devrait rechercher par nom', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { nom: 'Luna' };
            
            mockPersonnageModel.count.mockResolvedValue(3);
            mockPersonnageModel.findAll.mockResolvedValue([]);

            // Act
            await personnageService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            expect(mockPersonnageModel.findAll).toHaveBeenCalledWith(
                expect.stringContaining('nom ILIKE ?'),
                [utilisateurId, '%Luna%']
            );
        });
    });

    describe('US007 - Modification de personnage existant', () => {
        test('devrait mettre à jour un personnage existant', async () => {
            // Arrange
            const personnageId = 123;
            const personnageExistant = {
                id: personnageId,
                nom: 'Ancien Nom',
                concept: 'Ancien Concept',
                systeme_jeu: 'monsterhearts'
            };
            
            const nouvellesDonnees = {
                nom: 'Nouveau Nom',
                concept: 'Nouveau Concept'
            };
            
            const personnageMisAJour = { ...personnageExistant, ...nouvellesDonnees };
            
            mockPersonnageModel.obtenirParId.mockResolvedValue(personnageExistant);
            mockPersonnageModel.mettreAJour.mockResolvedValue(personnageMisAJour);

            // Act
            const result = await personnageService.mettreAJour(personnageId, nouvellesDonnees);

            // Assert
            expect(mockPersonnageModel.obtenirParId).toHaveBeenCalledWith(personnageId);
            expect(mockPersonnageModel.mettreAJour).toHaveBeenCalledWith(
                personnageId,
                nouvellesDonnees
            );
            expect(result).toEqual(personnageMisAJour);
        });

        test('devrait rejeter la mise à jour d\'un personnage inexistant', async () => {
            // Arrange
            const personnageId = 999;
            mockPersonnageModel.obtenirParId.mockResolvedValue(null);

            // Act & Assert
            await expect(personnageService.mettreAJour(personnageId, {}))
                .rejects.toThrow('Personnage non trouvé');
        });
    });

    describe('US008 - Duplication de personnage', () => {
        test('devrait dupliquer un personnage avec nouveau nom', async () => {
            // Arrange
            const personnageOriginal = {
                id: 123,
                nom: 'Original',
                concept: 'Test Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 2, cold: 1 },
                utilisateur_id: 1,
                date_creation: new Date('2023-01-01'),
                date_modification: new Date('2023-01-02')
            };
            
            const nouveauNom = 'Copie de Original';
            const utilisateurId = 2;
            const personnageDuplique = { 
                id: 456, 
                nom: nouveauNom, 
                concept: 'Test Concept',
                systeme_jeu: 'monsterhearts',
                attributs: { hot: 2, cold: 1 },
                utilisateur_id: utilisateurId
            };
            
            mockPersonnageModel.obtenirParId.mockResolvedValue(personnageOriginal);
            mockPersonnageModel.creer.mockResolvedValue(personnageDuplique);

            // Act
            const result = await personnageService.dupliquer(123, nouveauNom, utilisateurId);

            // Assert
            expect(mockPersonnageModel.obtenirParId).toHaveBeenCalledWith(123);
            expect(mockPersonnageModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    nom: nouveauNom,
                    concept: 'Test Concept',
                    systeme_jeu: 'monsterhearts',
                    attributs: { hot: 2, cold: 1 },
                    utilisateur_id: utilisateurId
                })
            );
            expect(mockPersonnageModel.creer).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    id: expect.anything(),
                    date_creation: expect.anything(),
                    date_modification: expect.anything()
                })
            );
            expect(result).toEqual(personnageDuplique);
        });

        test('devrait rejeter la duplication d\'un personnage inexistant', async () => {
            // Arrange
            mockPersonnageModel.obtenirParId.mockResolvedValue(null);

            // Act & Assert
            await expect(personnageService.dupliquer(999, 'Nouveau Nom', 1))
                .rejects.toThrow('Personnage original non trouvé');
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
                personnageService.validerDonnees(donneesValides);
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
            expect(() => {
                personnageService.validerDonnees(donneesInvalides);
            }).toThrow();
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
                personnageService.validerDonnees(brouillonValide);
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
            
            mockPersonnageModel.obtenirStatistiques.mockResolvedValue(mockStats);

            // Act
            const result = await personnageService.obtenirStatistiques(utilisateurId);

            // Assert
            expect(mockPersonnageModel.obtenirStatistiques).toHaveBeenCalledWith(utilisateurId);
            expect(result).toEqual(mockStats);
        });

        test('devrait rechercher des personnages par terme', async () => {
            // Arrange
            const utilisateurId = 1;
            const terme = 'Luna';
            const mockResultats = [
                { id: 1, nom: 'Luna Darkwood' },
                { id: 2, nom: 'Luna Silver' }
            ];
            
            mockPersonnageModel.lister.mockResolvedValue(mockResultats);

            // Act
            const result = await personnageService.rechercher(utilisateurId, terme);

            // Assert
            expect(mockPersonnageModel.lister).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.stringContaining('nom ILIKE ? OR description ILIKE ?'),
                    valeurs: [utilisateurId, '%Luna%', '%Luna%'],
                    limit: 10
                })
            );
            expect(result).toEqual(mockResultats);
        });
    });
});