/**
 * Tests unitaires pour PdfService (Backend) - User Stories US004, US009, US012
 * Tests basés sur les user stories principales pour la génération PDF
 */

const PdfService = require('../../src/services/PdfService');

// Mock des dépendances
jest.mock('../../src/models/Pdf');
jest.mock('../../src/models/Personnage');
jest.mock('../../src/services/TemplateService');
jest.mock('../../src/services/PdfKitService');
jest.mock('../../src/utils/systemesJeu');

const Pdf = require('../../src/models/Pdf');
const Personnage = require('../../src/models/Personnage');
const TemplateService = require('../../src/services/TemplateService');
const PdfKitService = require('../../src/services/PdfKitService');
const fs = require('fs');

describe('PdfService Backend - User Stories', () => {
    let pdfService;
    let mockPdfModel;
    let mockPersonnageModel;
    let mockTemplateService;
    let mockPdfKitService;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock du modèle PDF
        mockPdfModel = {
            creer: jest.fn(),
            obtenirParId: jest.fn(),
            obtenirParToken: jest.fn(),
            mettreAJour: jest.fn(),
            supprimer: jest.fn(),
            lister: jest.fn(),
            count: jest.fn(),
            obtenirStatistiques: jest.fn(),
            incrementerTelechargements: jest.fn(),
            obtenirRecents: jest.fn()
        };
        
        // Mock du modèle Personnage
        mockPersonnageModel = {
            obtenirParId: jest.fn()
        };
        
        // Mock TemplateService
        mockTemplateService = {
            templateExiste: jest.fn(),
            rendreTemplate: jest.fn(),
            listerTemplates: jest.fn(),
            obtenirTypesTemplates: jest.fn()
        };
        
        // Mock PdfKitService
        mockPdfKitService = {
            generatePDF: jest.fn()
        };
        
        Pdf.mockImplementation(() => mockPdfModel);
        Personnage.mockImplementation(() => mockPersonnageModel);
        TemplateService.mockImplementation(() => mockTemplateService);
        PdfKitService.mockImplementation(() => mockPdfKitService);
        
        pdfService = new PdfService();
    });

    describe('US004 - Génération PDF anonyme', () => {
        test('devrait générer un PDF anonyme sans personnage sauvegardé', async () => {
            // Arrange - Utilisateurs anonymes génèrent directement des PDF avec des données temporaires
            const utilisateurId = null; // Anonyme
            const expectedOptions = {
                system: 'monsterhearts',
                template: 'fiche-personnage',
                titre: 'Document',
                userId: null,
                systemRights: 'private',
                data: {}
            };
            
            const inputOptions = {
                systeme: 'monsterhearts',
                type_pdf: 'fiche_personnage',
                donnees: {
                    nom: 'Luna Darkwood',
                    concept: 'Vampire rebelle',
                    attributs: { hot: 2, cold: 1 }
                },
                template: 'fiche-personnage'
            };
            
            const mockResult = {
                success: true,
                fullPath: '/temp/anonymous_fiche.pdf',
                size: 1024000
            };
            
            mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await pdfService.genererPdf(inputOptions);

            // Assert
            expect(mockPdfKitService.generatePDF).toHaveBeenCalledWith(expectedOptions);
            expect(result.success).toBe(true);
            expect(result.fullPath).toContain('anonymous_fiche.pdf');
        });

        test('devrait générer un document générique pour utilisateur anonyme', async () => {
            // Arrange
            const utilisateurId = null; // Anonyme
            const options = {
                systeme: 'monsterhearts',
                type_pdf: 'document-generique',
                donnees: { 
                    titre: 'Ma Fiche Temporaire',
                    nom: 'Test Hero',
                    attributs: { hot: 1, cold: 2 }
                },
                template: 'document-generique',
                est_public: false
            };
            
            const pdfCree = {
                id: 456,
                personnage_id: null, // Pas de personnage pour les anonymes
                utilisateur_id: null,
                type_pdf: 'document-generique',
                statut: 'EN_ATTENTE',
                progression: 0
            };
            
            mockPdfModel.creer.mockResolvedValue(pdfCree);

            // Act
            const result = await pdfService.genererDocumentGenerique(utilisateurId, options);

            // Assert
            expect(mockPdfModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    personnage_id: null, // Pas de personnage pour les anonymes
                    utilisateur_id: null,
                    type_pdf: 'document-generique',
                    statut: 'EN_ATTENTE',
                    progression: 0,
                    est_public: false
                })
            );
            expect(result).toEqual(pdfCree);
        });

        test('devrait générer un nom de fichier unique', () => {
            // Arrange
            const personnage = {
                nom: 'Luna & Darkwood/Test'
            };
            const typePdf = 'fiche_personnage';

            // Act
            const nomFichier = pdfService.genererNomFichier(personnage, typePdf);

            // Assert
            expect(nomFichier).toMatch(/^Luna___Darkwood_Test_fiche_personnage_\d+\.pdf$/);
        });

        test('devrait déterminer le moteur PDF approprié', () => {
            // Arrange & Act
            const enginePDFKit = pdfService.determineEngine('monsterhearts', 'plan-classe-instructions', 'pdfkit');
            const engineAuto = pdfService.determineEngine('monsterhearts', 'plan-classe-instructions', 'auto');

            // Assert
            expect(enginePDFKit).toBe('pdfkit');
            expect(engineAuto).toBe('pdfkit');
        });
    });

    describe('US009 - Historique des PDF générés (utilisateurs connectés uniquement)', () => {
        test('devrait lister les PDFs d\'un utilisateur connecté avec pagination', async () => {
            // Arrange - Seuls les utilisateurs connectés ont un historique
            const utilisateurId = 1; // Utilisateur connecté
            const mockPdfs = [
                { 
                    id: 1, 
                    nom_fichier: 'hero1.pdf', 
                    statut: 'TERMINE',
                    personnage_id: 123, // Lié à un personnage sauvegardé
                    date_creation: new Date()
                },
                { 
                    id: 2, 
                    nom_fichier: 'hero2.pdf', 
                    statut: 'EN_TRAITEMENT',
                    personnage_id: 124,
                    date_creation: new Date()
                }
            ];
            
            mockPdfModel.count.mockResolvedValue(15);
            mockPdfModel.lister.mockResolvedValue(mockPdfs);

            // Act
            const result = await pdfService.listerParUtilisateur(
                utilisateurId, 
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            expect(mockPdfModel.count).toHaveBeenCalledWith(
                'utilisateur_id = ?',
                [utilisateurId]
            );
            expect(mockPdfModel.lister).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: 'utilisateur_id = ?',
                    valeurs: [utilisateurId],
                    order: 'date_creation DESC',
                    limit: 20,
                    offset: 0
                })
            );
            expect(result).toEqual({
                pdfs: mockPdfs,
                total: 15
            });
        });

        test('devrait filtrer par statut', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { statut: 'TERMINE' };
            
            mockPdfModel.count.mockResolvedValue(8);
            mockPdfModel.lister.mockResolvedValue([]);

            // Act
            await pdfService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            expect(mockPdfModel.lister).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: 'utilisateur_id = ? AND statut = ?',
                    valeurs: [utilisateurId, 'TERMINE']
                })
            );
        });

        test('devrait filtrer par type de PDF', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { type_pdf: 'fiche_personnage' };
            
            mockPdfModel.count.mockResolvedValue(5);
            mockPdfModel.lister.mockResolvedValue([]);

            // Act
            await pdfService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            expect(mockPdfModel.lister).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: 'utilisateur_id = ? AND type_pdf = ?',
                    valeurs: [utilisateurId, 'fiche_personnage']
                })
            );
        });

        test('devrait obtenir un PDF par ID', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = {
                id: pdfId,
                nom_fichier: 'test.pdf',
                statut: 'TERMINE'
            };
            
            mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);

            // Act
            const result = await pdfService.obtenirParId(pdfId);

            // Assert
            expect(mockPdfModel.obtenirParId).toHaveBeenCalledWith(pdfId);
            expect(result).toEqual(mockPdf);
        });

        test('devrait marquer un téléchargement', async () => {
            // Arrange
            const pdfId = 123;

            // Act
            await pdfService.marquerTelechargement(pdfId);

            // Assert
            expect(mockPdfModel.incrementerTelechargements).toHaveBeenCalledWith(pdfId);
        });
    });

    describe('US012 - Génération PDF avancée (Premium)', () => {
        test('devrait générer un PDF avec options avancées', async () => {
            // Arrange
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Fiche Premium',
                userId: 1,
                systemRights: 'premium',
                data: { custom: 'data' }
            };
            
            const mockResult = {
                success: true,
                fullPath: '/path/to/generated.pdf',
                size: 1024000
            };
            
            mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await pdfService.genererPdf(options);

            // Assert
            expect(mockPdfKitService.generatePDF).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockResult);
        });

        test('devrait copier le fichier vers un chemin spécifique', async () => {
            // Arrange
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                cheminFichier: '/custom/path/output.pdf'
            };
            
            const mockResult = {
                success: true,
                fullPath: '/temp/generated.pdf'
            };
            
            mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await pdfService.genererPdf(options);

            // Assert
            expect(fs.promises.copyFile).toHaveBeenCalledWith(
                '/temp/generated.pdf',
                '/custom/path/output.pdf'
            );
            expect(result.fullPath).toBe('/custom/path/output.pdf');
        });

        test('devrait générer un lien de partage temporaire', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = {
                id: pdfId,
                nom_fichier: 'test.pdf',
                statut: 'TERMINE'
            };
            
            mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);
            mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await pdfService.genererLienPartage(pdfId, 48);

            // Assert
            expect(mockPdfModel.obtenirParId).toHaveBeenCalledWith(pdfId);
            expect(mockPdfModel.mettreAJour).toHaveBeenCalledWith(
                pdfId,
                expect.objectContaining({
                    url_temporaire: expect.any(String),
                    date_expiration: expect.any(Date)
                })
            );
            expect(result).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    url: expect.stringContaining('/api/pdfs/partage/'),
                    date_expiration: expect.any(Date)
                })
            );
        });

        test('devrait basculer la visibilité publique d\'un PDF', async () => {
            // Arrange
            const pdfId = 123;
            const utilisateurId = 1;
            const mockPdf = {
                id: pdfId,
                utilisateur_id: utilisateurId,
                statut: 'TERMINE',
                est_public: false
            };
            
            const pdfMisAJour = { ...mockPdf, est_public: true };
            
            mockPdfModel.obtenirParId.mockResolvedValueOnce(mockPdf)
                .mockResolvedValueOnce(pdfMisAJour);
            mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await pdfService.basculerVisibilitePublique(pdfId, utilisateurId);

            // Assert
            expect(mockPdfModel.mettreAJour).toHaveBeenCalledWith(
                pdfId,
                { est_public: true }
            );
            expect(result.est_public).toBe(true);
        });

        test('devrait rejeter le changement de visibilité par un non-propriétaire', async () => {
            // Arrange
            const pdfId = 123;
            const utilisateurId = 1;
            const autreUtilisateur = 2;
            const mockPdf = {
                id: pdfId,
                utilisateur_id: autreUtilisateur,
                statut: 'TERMINE',
                est_public: false
            };
            
            mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);

            // Act & Assert
            await expect(pdfService.basculerVisibilitePublique(pdfId, utilisateurId))
                .rejects.toThrow('Seul le propriétaire peut modifier la visibilité');
        });
    });

    describe('Gestion des PDFs', () => {
        test('devrait supprimer un PDF et son fichier', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = {
                id: pdfId,
                nom_fichier: 'test.pdf',
                chemin_fichier: '/path/to/test.pdf'
            };
            
            mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);
            mockPdfModel.supprimer.mockResolvedValue();
            fs.promises.unlink.mockResolvedValue();

            // Act
            const result = await pdfService.supprimer(pdfId);

            // Assert
            expect(fs.promises.unlink).toHaveBeenCalledWith('/path/to/test.pdf');
            expect(mockPdfModel.supprimer).toHaveBeenCalledWith(pdfId);
            expect(result).toBe(true);
        });

        test('devrait relancer la génération d\'un PDF en échec', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = {
                id: pdfId,
                statut: 'ECHEC',
                personnage_id: 456,
                options_generation: JSON.stringify({ type: 'test' })
            };
            
            const mockPersonnage = {
                id: 456,
                nom: 'Test Hero'
            };
            
            const pdfRelance = { ...mockPdf, statut: 'EN_ATTENTE' };
            
            mockPdfModel.obtenirParId.mockResolvedValueOnce(mockPdf)
                .mockResolvedValueOnce(pdfRelance);
            mockPersonnageModel.obtenirParId.mockResolvedValue(mockPersonnage);
            mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await pdfService.relancerGeneration(pdfId);

            // Assert
            expect(mockPdfModel.mettreAJour).toHaveBeenCalledWith(
                pdfId,
                expect.objectContaining({
                    statut: 'EN_ATTENTE',
                    progression: 0,
                    erreur_message: null
                })
            );
            expect(result.statut).toBe('EN_ATTENTE');
        });

        test('devrait nettoyer les PDFs expirés', async () => {
            // Arrange
            const maintenant = new Date();
            const pdfsExpires = [
                { id: 1, nom_fichier: 'expired1.pdf' },
                { id: 2, nom_fichier: 'expired2.pdf' }
            ];
            
            mockPdfModel.lister.mockResolvedValue(pdfsExpires);
            mockPdfModel.obtenirParId.mockResolvedValue({ chemin_fichier: '/path' });
            mockPdfModel.supprimer.mockResolvedValue();
            fs.promises.unlink.mockResolvedValue();

            // Act
            const result = await pdfService.nettoyerPdfsExpires();

            // Assert
            expect(mockPdfModel.lister).toHaveBeenCalledWith({
                where: 'date_expiration < ? AND statut = ?',
                valeurs: [expect.any(Date), 'TERMINE']
            });
            expect(result).toBe(2);
        });
    });

    describe('Statistiques et métadonnées', () => {
        test('devrait obtenir les statistiques d\'un utilisateur', async () => {
            // Arrange
            const utilisateurId = 1;
            const mockStats = {
                total: 25,
                ce_mois: 8,
                par_type: { fiche_personnage: 20, fiche_pnj: 5 },
                recents: []
            };
            
            mockPdfModel.obtenirStatistiques.mockResolvedValue(mockStats);

            // Act
            const result = await pdfService.obtenirStatistiques(utilisateurId);

            // Assert
            expect(mockPdfModel.obtenirStatistiques).toHaveBeenCalledWith(utilisateurId);
            expect(result).toEqual(mockStats);
        });

        test('devrait obtenir les types de PDF disponibles', () => {
            // Act
            const types = pdfService.obtenirTypesPdf();

            // Assert
            expect(types).toEqual(
                expect.objectContaining({
                    fiche_personnage: 'Fiche de personnage',
                    fiche_pnj: 'Fiche PNJ',
                    carte_reference: 'Carte de référence'
                })
            );
        });

        test('devrait obtenir les PDFs publics récents', async () => {
            // Arrange
            const mockPdfsPublics = [
                {
                    id: 1,
                    nom_fichier: 'public1.pdf',
                    personnage_nom: 'Hero Public',
                    auteur_nom: 'Auteur Test'
                }
            ];
            
            mockPdfModel.lister.mockResolvedValue(mockPdfsPublics);

            // Act
            const result = await pdfService.obtenirPdfsPublicsRecents(6, 'UTILISATEUR');

            // Assert
            expect(mockPdfModel.lister).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: 'statut = ? AND est_public = ?',
                    valeurs: ['TERMINE', true],
                    limit: 6
                })
            );
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(
                expect.objectContaining({
                    id: 1,
                    nom_fichier: 'public1.pdf'
                })
            );
        });
    });

    describe('Génération de documents génériques', () => {
        test('devrait démarrer la génération d\'un document générique', async () => {
            // Arrange
            const utilisateurId = 1;
            const options = {
                systeme: 'monsterhearts',
                type_pdf: 'document-generique',
                donnees: { titre: 'Test Document' },
                template: 'document-generique'
            };
            
            const pdfCree = {
                id: 789,
                utilisateur_id: utilisateurId,
                type_pdf: 'document-generique',
                statut: 'EN_ATTENTE'
            };
            
            mockPdfModel.creer.mockResolvedValue(pdfCree);

            // Act
            const result = await pdfService.genererDocumentGenerique(utilisateurId, options);

            // Assert
            expect(mockPdfModel.creer).toHaveBeenCalledWith(
                expect.objectContaining({
                    personnage_id: null,
                    utilisateur_id: utilisateurId,
                    systeme_jeu: 'monsterhearts',
                    type_pdf: 'document-generique',
                    statut: 'EN_ATTENTE'
                })
            );
            expect(result).toEqual(pdfCree);
        });

        test('devrait générer un nom de fichier pour document générique', () => {
            // Arrange
            const titre = 'Mon Document/Test';
            const systeme = 'monsterhearts';

            // Act
            const nomFichier = pdfService.genererNomFichierDocumentGenerique(titre, systeme);

            // Assert
            expect(nomFichier).toMatch(/^user-system_rights-public_template-document-generique_monsterhearts_Mon_Document_Test_id-[a-f0-9]{8}\.pdf$/);
        });
    });
});