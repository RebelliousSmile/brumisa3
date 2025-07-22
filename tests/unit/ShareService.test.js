/**
 * Tests unitaires pour ShareService - User Story US010
 * Partage de personnage (Premium)
 */

const ShareService = require('../../src/services/ShareService');

// Mock des services dépendants
jest.mock('../../src/services/UtilisateurService');
jest.mock('../../src/services/PersonnageService');

const UtilisateurService = require('../../src/services/UtilisateurService');
const PersonnageService = require('../../src/services/PersonnageService');

describe('ShareService - US010 Partage de personnage Premium', () => {
    let shareService;
    let mockUtilisateurService;
    let mockPersonnageService;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock UtilisateurService
        mockUtilisateurService = {
            obtenirParId: jest.fn()
        };
        UtilisateurService.mockImplementation(() => mockUtilisateurService);
        
        // Mock PersonnageService
        mockPersonnageService = {
            obtenirParId: jest.fn()
        };
        PersonnageService.mockImplementation(() => mockPersonnageService);
        
        shareService = new ShareService();
        
        // Mock des méthodes de base de données
        shareService.sauvegarderPartage = jest.fn();
        shareService.obtenirPartageParToken = jest.fn();
        shareService.obtenirPartageParId = jest.fn();
        shareService.listerPartages = jest.fn();
        shareService.compterPartages = jest.fn();
        shareService.mettreAJourPartageEnBase = jest.fn();
        shareService.incrementerVues = jest.fn();
    });

    describe('Création de lien de partage', () => {
        test('devrait créer un lien de partage pour un utilisateur Premium', async () => {
            // Arrange
            const personnageId = 123;
            const utilisateurId = 456;
            
            const utilisateurPremium = {
                id: utilisateurId,
                role: 'PREMIUM',
                nom: 'User Premium'
            };
            
            const personnage = {
                id: personnageId,
                nom: 'Luna Darkwood',
                utilisateur_id: utilisateurId,
                systeme_jeu: 'monsterhearts'
            };
            
            const partageCreer = {
                id: 789,
                personnage_id: personnageId,
                utilisateur_id: utilisateurId,
                token: 'abc123def456',
                date_expiration: expect.any(Date)
            };
            
            mockUtilisateurService.obtenirParId.mockResolvedValue(utilisateurPremium);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnage);
            shareService.sauvegarderPartage.mockResolvedValue(partageCreer);

            // Act
            const result = await shareService.creerLienPartage(personnageId, utilisateurId);

            // Assert
            expect(mockUtilisateurService.obtenirParId).toHaveBeenCalledWith(utilisateurId);
            expect(mockPersonnageService.obtenirParId).toHaveBeenCalledWith(personnageId);
            expect(shareService.sauvegarderPartage).toHaveBeenCalledWith(
                expect.objectContaining({
                    personnage_id: personnageId,
                    utilisateur_id: utilisateurId,
                    token: expect.any(String),
                    date_expiration: expect.any(Date),
                    permissions: expect.any(Object),
                    titre_personnalise: 'Luna Darkwood',
                    actif: true
                })
            );
            expect(result).toEqual(
                expect.objectContaining({
                    id: 789,
                    token: expect.any(String),
                    url: expect.stringContaining('/partage/'),
                    url_complete: expect.stringContaining('/partage/'),
                    date_expiration: expect.any(Date)
                })
            );
        });

        test('devrait rejeter la création pour un utilisateur non Premium', async () => {
            // Arrange
            const personnageId = 123;
            const utilisateurId = 456;
            
            const utilisateurStandard = {
                id: utilisateurId,
                role: 'UTILISATEUR',
                nom: 'User Standard'
            };
            
            mockUtilisateurService.obtenirParId.mockResolvedValue(utilisateurStandard);

            // Act & Assert
            await expect(shareService.creerLienPartage(personnageId, utilisateurId))
                .rejects.toThrow('Fonctionnalité réservée aux membres Premium');
        });

        test('devrait rejeter si le personnage n\'appartient pas à l\'utilisateur', async () => {
            // Arrange
            const personnageId = 123;
            const utilisateurId = 456;
            const autreUtilisateurId = 789;
            
            const utilisateurPremium = {
                id: utilisateurId,
                role: 'PREMIUM'
            };
            
            const personnageAutreUser = {
                id: personnageId,
                nom: 'Luna Darkwood',
                utilisateur_id: autreUtilisateurId
            };
            
            mockUtilisateurService.obtenirParId.mockResolvedValue(utilisateurPremium);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnageAutreUser);

            // Act & Assert
            await expect(shareService.creerLienPartage(personnageId, utilisateurId))
                .rejects.toThrow('Vous ne pouvez partager que vos propres personnages');
        });

        test('devrait permettre à un admin de partager n\'importe quel personnage', async () => {
            // Arrange
            const personnageId = 123;
            const adminId = 456;
            const autreUtilisateurId = 789;
            
            const admin = {
                id: adminId,
                role: 'ADMIN'
            };
            
            const personnageAutreUser = {
                id: personnageId,
                nom: 'Luna Darkwood',
                utilisateur_id: autreUtilisateurId
            };
            
            const partageCreer = {
                id: 999,
                token: 'admin_token'
            };
            
            mockUtilisateurService.obtenirParId.mockResolvedValue(admin);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnageAutreUser);
            shareService.sauvegarderPartage.mockResolvedValue(partageCreer);

            // Act
            const result = await shareService.creerLienPartage(personnageId, adminId);

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    id: 999,
                    token: expect.any(String)
                })
            );
        });

        test('devrait créer un lien avec options personnalisées', async () => {
            // Arrange
            const personnageId = 123;
            const utilisateurId = 456;
            const options = {
                dureeJours: 14,
                titre: 'Mon personnage partagé',
                description: 'Une description custom',
                motDePasse: 'secret123',
                limiteVues: 10,
                permissions: {
                    voir_notes: true,
                    permettre_copie: true
                }
            };
            
            const utilisateurPremium = {
                id: utilisateurId,
                role: 'PREMIUM'
            };
            
            const personnage = {
                id: personnageId,
                nom: 'Luna',
                utilisateur_id: utilisateurId
            };
            
            const partageCreer = { id: 789, token: 'custom_token' };
            
            mockUtilisateurService.obtenirParId.mockResolvedValue(utilisateurPremium);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnage);
            shareService.sauvegarderPartage.mockResolvedValue(partageCreer);

            // Act
            const result = await shareService.creerLienPartage(personnageId, utilisateurId, options);

            // Assert
            expect(shareService.sauvegarderPartage).toHaveBeenCalledWith(
                expect.objectContaining({
                    titre_personnalise: 'Mon personnage partagé',
                    description: 'Une description custom',
                    mot_de_passe: 'secret123',
                    limite_vues: 10,
                    permissions: expect.objectContaining({
                        voir_notes: true,
                        permettre_copie: true,
                        voir_attributs: true // Valeur par défaut
                    })
                })
            );
        });
    });

    describe('Accès aux personnages partagés', () => {
        test('devrait permettre l\'accès à un personnage via token valide', async () => {
            // Arrange
            const token = 'valid_token_123';
            const partage = {
                id: 789,
                personnage_id: 123,
                utilisateur_id: 456,
                token,
                actif: true,
                date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
                titre_personnalise: 'Personnage partagé',
                description: 'Description du partage',
                permissions: {
                    voir_attributs: true,
                    voir_notes: false
                },
                nb_vues: 5
            };
            
            const personnage = {
                id: 123,
                nom: 'Luna Darkwood',
                attributs: { hot: 2, cold: 1 },
                notes: 'Notes privées',
                utilisateur_id: 456
            };
            
            const proprietaire = {
                id: 456,
                nom: 'Propriétaire'
            };
            
            shareService.obtenirPartageParToken.mockResolvedValue(partage);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnage);
            mockUtilisateurService.obtenirParId.mockResolvedValue(proprietaire);
            shareService.incrementerVues.mockResolvedValue();

            // Act
            const result = await shareService.obtenirPersonnagePartage(token);

            // Assert
            expect(shareService.obtenirPartageParToken).toHaveBeenCalledWith(token);
            expect(mockPersonnageService.obtenirParId).toHaveBeenCalledWith(123);
            expect(shareService.incrementerVues).toHaveBeenCalledWith(789);
            
            // Vérifier que les permissions sont appliquées
            expect(result.personnage.attributs).toEqual({ hot: 2, cold: 1 });
            expect(result.personnage.notes).toBeUndefined(); // Masqué par permissions
            expect(result.personnage.utilisateur_id).toBeUndefined(); // Toujours masqué
            
            expect(result.partage).toEqual(
                expect.objectContaining({
                    id: 789,
                    titre: 'Personnage partagé',
                    proprietaire: { nom: 'Propriétaire', id: 456 },
                    nb_vues: 6
                })
            );
        });

        test('devrait rejeter l\'accès à un partage expiré', async () => {
            // Arrange
            const token = 'expired_token';
            const partageExpire = {
                id: 789,
                token,
                actif: true,
                date_expiration: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
                nb_vues: 0
            };
            
            shareService.obtenirPartageParToken.mockResolvedValue(partageExpire);

            // Act & Assert
            await expect(shareService.obtenirPersonnagePartage(token))
                .rejects.toThrow('Ce lien de partage a expiré');
        });

        test('devrait rejeter l\'accès à un partage désactivé', async () => {
            // Arrange
            const token = 'disabled_token';
            const partageDesactive = {
                id: 789,
                token,
                actif: false,
                date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            
            shareService.obtenirPartageParToken.mockResolvedValue(partageDesactive);

            // Act & Assert
            await expect(shareService.obtenirPersonnagePartage(token))
                .rejects.toThrow('Ce lien de partage a été désactivé');
        });

        test('devrait rejeter l\'accès sans mot de passe requis', async () => {
            // Arrange
            const token = 'protected_token';
            const partageProtege = {
                id: 789,
                token,
                actif: true,
                date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
                mot_de_passe: 'secret123'
            };
            
            shareService.obtenirPartageParToken.mockResolvedValue(partageProtege);

            // Act & Assert
            await expect(shareService.obtenirPersonnagePartage(token, {}))
                .rejects.toThrow('Mot de passe requis');
        });

        test('devrait permettre l\'accès avec le bon mot de passe', async () => {
            // Arrange
            const token = 'protected_token';
            const partageProtege = {
                id: 789,
                personnage_id: 123,
                utilisateur_id: 456,
                token,
                actif: true,
                date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
                mot_de_passe: 'secret123',
                permissions: {},
                titre_personnalise: 'Protégé',
                nb_vues: 0
            };
            
            const personnage = { id: 123, nom: 'Luna' };
            const proprietaire = { id: 456, nom: 'Owner' };
            
            shareService.obtenirPartageParToken.mockResolvedValue(partageProtege);
            mockPersonnageService.obtenirParId.mockResolvedValue(personnage);
            mockUtilisateurService.obtenirParId.mockResolvedValue(proprietaire);
            shareService.incrementerVues.mockResolvedValue();

            // Act
            const result = await shareService.obtenirPersonnagePartage(token, {
                motDePasse: 'secret123'
            });

            // Assert
            expect(result.personnage).toEqual(expect.objectContaining({ nom: 'Luna' }));
            expect(result.partage.titre).toBe('Protégé');
        });
    });

    describe('Gestion des partages', () => {
        test('devrait lister les partages d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 456;
            const mockPartages = [
                {
                    id: 1,
                    personnage_id: 123,
                    token: 'token1',
                    titre_personnalise: 'Partage 1',
                    date_creation: new Date()
                },
                {
                    id: 2,
                    personnage_id: 124,
                    token: 'token2',
                    titre_personnalise: 'Partage 2',
                    date_creation: new Date()
                }
            ];
            
            const personnage1 = { id: 123, nom: 'Luna', systeme_jeu: 'monsterhearts' };
            const personnage2 = { id: 124, nom: 'Marcus', systeme_jeu: 'engrenages' };
            
            shareService.listerPartages.mockResolvedValue(mockPartages);
            shareService.compterPartages.mockResolvedValue(2);
            mockPersonnageService.obtenirParId
                .mockResolvedValueOnce(personnage1)
                .mockResolvedValueOnce(personnage2);

            // Act
            const result = await shareService.listerPartagesUtilisateur(utilisateurId);

            // Assert
            expect(shareService.listerPartages).toHaveBeenCalledWith({
                where: 'utilisateur_id = ? AND actif = ?',
                valeurs: [utilisateurId, true],
                order: 'date_creation DESC',
                limit: 20,
                offset: 0
            });
            
            expect(result.partages).toHaveLength(2);
            expect(result.partages[0]).toEqual(
                expect.objectContaining({
                    id: 1,
                    personnage_nom: 'Luna',
                    personnage_systeme: 'monsterhearts',
                    url_partage: '/partage/token1',
                    est_expire: expect.any(Boolean)
                })
            );
            expect(result.total).toBe(2);
        });

        test('devrait mettre à jour un partage existant', async () => {
            // Arrange
            const partageId = 789;
            const utilisateurId = 456;
            const donnees = {
                titre_personnalise: 'Nouveau titre',
                description: 'Nouvelle description',
                permissions: {
                    voir_notes: true
                }
            };
            
            const partageExistant = {
                id: partageId,
                utilisateur_id: utilisateurId,
                token: 'token123'
            };
            
            const partageMAJ = {
                ...partageExistant,
                ...donnees
            };
            
            shareService.obtenirPartageParId.mockResolvedValue(partageExistant);
            shareService.mettreAJourPartageEnBase.mockResolvedValue(partageMAJ);

            // Act
            const result = await shareService.mettreAJourPartage(partageId, utilisateurId, donnees);

            // Assert
            expect(shareService.mettreAJourPartageEnBase).toHaveBeenCalledWith(
                partageId,
                expect.objectContaining({
                    titre_personnalise: 'Nouveau titre',
                    description: 'Nouvelle description',
                    permissions: expect.objectContaining({
                        voir_notes: true,
                        voir_attributs: true // Valeurs par défaut ajoutées
                    })
                })
            );
            expect(result).toEqual(partageMAJ);
        });

        test('devrait supprimer un partage (soft delete)', async () => {
            // Arrange
            const partageId = 789;
            const utilisateurId = 456;
            
            const partageExistant = {
                id: partageId,
                utilisateur_id: utilisateurId
            };
            
            const utilisateur = { id: utilisateurId, role: 'PREMIUM' };
            
            shareService.obtenirPartageParId.mockResolvedValue(partageExistant);
            mockUtilisateurService.obtenirParId.mockResolvedValue(utilisateur);
            shareService.mettreAJourPartageEnBase.mockResolvedValue();

            // Act
            const result = await shareService.supprimerPartage(partageId, utilisateurId);

            // Assert
            expect(shareService.mettreAJourPartageEnBase).toHaveBeenCalledWith(
                partageId,
                expect.objectContaining({
                    actif: false,
                    date_suppression: expect.any(Date)
                })
            );
            expect(result).toBe(true);
        });
    });

    describe('Utilitaires et validations', () => {
        test('devrait générer un token unique', () => {
            // Act
            const token1 = shareService.genererTokenPartage();
            const token2 = shareService.genererTokenPartage();

            // Assert
            expect(token1).toMatch(/^[a-f0-9]{32}$/);
            expect(token2).toMatch(/^[a-f0-9]{32}$/);
            expect(token1).not.toBe(token2);
        });

        test('devrait valider et normaliser les permissions', () => {
            // Arrange
            const permissionsCustom = {
                voir_notes: true,
                permettre_copie: true
            };

            // Act
            const result = shareService.validerPermissions(permissionsCustom);

            // Assert
            expect(result).toEqual({
                voir_attributs: true,
                voir_competences: true,
                voir_inventaire: true,
                voir_notes: true, // Custom
                voir_infos_privees: false,
                permettre_copie: true, // Custom
                permettre_export_pdf: true
            });
        });

        test('devrait appliquer les permissions au personnage', () => {
            // Arrange
            const personnage = {
                id: 123,
                nom: 'Luna',
                attributs: { hot: 2 },
                competences: { seduction: 3 },
                inventaire: ['épée'],
                notes: 'Notes privées',
                infos_privees: 'Secret',
                utilisateur_id: 456
            };
            
            const permissions = {
                voir_attributs: true,
                voir_competences: false,
                voir_inventaire: true,
                voir_notes: false,
                voir_infos_privees: false
            };

            // Act
            const result = shareService.appliquerPermissions(personnage, permissions);

            // Assert
            expect(result.nom).toBe('Luna');
            expect(result.attributs).toEqual({ hot: 2 });
            expect(result.competences).toBeUndefined();
            expect(result.inventaire).toEqual(['épée']);
            expect(result.notes).toBeUndefined();
            expect(result.infos_privees).toBeUndefined();
            expect(result.utilisateur_id).toBeUndefined(); // Toujours masqué
        });
    });
});