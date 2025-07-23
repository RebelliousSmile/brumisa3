/**
 * Tests unitaires pour PdfService (Backend) - User Stories US004, US009, US012
 * Tests basés sur les user stories principales pour la génération PDF
 * Utilise l'architecture SOLID pour les tests unitaires
 */

const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');
const PdfService = require('../../src/services/PdfService');

// Mock des dépendances
jest.mock('../../src/models/Pdf');
jest.mock('../../src/models/Personnage');
jest.mock('../../src/services/TemplateService');
jest.mock('../../src/services/PdfKitService');
jest.mock('../../src/config/systemesJeu');
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    mkdir: jest.fn().mockResolvedValue(),
    promises: {
        copyFile: jest.fn(),
        unlink: jest.fn(),
        mkdir: jest.fn().mockResolvedValue()
    }
}));

const Pdf = require('../../src/models/Pdf');
const Personnage = require('../../src/models/Personnage');
const TemplateService = require('../../src/services/TemplateService');
const PdfKitService = require('../../src/services/PdfKitService');
const fs = require('fs');

class PdfServiceBackendTest extends BaseUnitTest {
    constructor() {
        super({
            mockDatabase: true,
            mockExternalServices: true
        });
        this.testContext = UnitTestFactory.createServiceTestContext('PdfService');
    }

    async customSetup() {
        // Mock du modèle PDF
        this.mockPdfModel = {
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
        this.mockPersonnageModel = {
            obtenirParId: jest.fn()
        };
        
        // Mock TemplateService
        this.mockTemplateService = {
            templateExiste: jest.fn(),
            rendreTemplate: jest.fn(),
            listerTemplates: jest.fn(),
            obtenirTypesTemplates: jest.fn()
        };
        
        // Mock PdfKitService
        this.mockPdfKitService = {
            generatePDF: jest.fn()
        };
        
        Pdf.mockImplementation(() => this.mockPdfModel);
        Personnage.mockImplementation(() => this.mockPersonnageModel);
        TemplateService.mockImplementation(() => this.mockTemplateService);
        PdfKitService.mockImplementation(() => this.mockPdfKitService);
        
        this.pdfService = new PdfService();
    }
}

describe('PdfService Backend - User Stories', () => {
    let testInstance;

    beforeAll(async () => {
        testInstance = new PdfServiceBackendTest();
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
            
            testInstance.mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await testInstance.pdfService.genererPdf(inputOptions);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfKitService.generatePDF, [expectedOptions]);
            testInstance.assertObjectStructure(result, { success: true });
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
            
            const pdfCree = testInstance.createTestData('pdf', {
                id: 456,
                personnage_id: null,
                utilisateur_id: null,
                type_pdf: 'document-generique',
                statut: 'EN_ATTENTE',
                progression: 0
            });
            
            testInstance.mockPdfModel.creer.mockResolvedValue(pdfCree);

            // Act
            const result = await testInstance.pdfService.genererDocumentGenerique(utilisateurId, options);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.creer, [
                expect.objectContaining({
                    personnage_id: null,
                    utilisateur_id: null,
                    type_pdf: 'document-generique',
                    statut: 'EN_ATTENTE',
                    progression: 0,
                    est_public: false
                })
            ]);
            testInstance.assertObjectStructure(result, pdfCree);
        });

        test('devrait générer un nom de fichier unique', () => {
            // Arrange
            const personnage = {
                nom: 'Luna & Darkwood/Test'
            };
            const typePdf = 'fiche_personnage';

            // Act
            const nomFichier = testInstance.pdfService.genererNomFichier(personnage, typePdf);

            // Assert
            expect(nomFichier).toMatch(/^Luna___Darkwood_Test_fiche_personnage_\d+\.pdf$/);
        });

        test('devrait utiliser le moteur PDF par défaut', () => {
            // Arrange & Act
            const defaultEngine = testInstance.pdfService.defaultEngine;

            // Assert
            testInstance.assertFunction(() => defaultEngine, null, 'pdfkit');
        });
    });

    describe('US009 - Historique des PDF générés (utilisateurs connectés uniquement)', () => {
        test('devrait lister les PDFs d\'un utilisateur connecté avec pagination', async () => {
            // Arrange - Seuls les utilisateurs connectés ont un historique
            const utilisateurId = 1; // Utilisateur connecté
            const mockPdfs = [
                testInstance.createTestData('pdf', { 
                    id: 1, 
                    nom_fichier: 'hero1.pdf', 
                    statut: 'TERMINE',
                    personnage_id: 123,
                    date_creation: new Date()
                }),
                testInstance.createTestData('pdf', { 
                    id: 2, 
                    nom_fichier: 'hero2.pdf', 
                    statut: 'EN_TRAITEMENT',
                    personnage_id: 124,
                    date_creation: new Date()
                })
            ];
            
            testInstance.mockPdfModel.count.mockResolvedValue(15);
            testInstance.mockPdfModel.lister.mockResolvedValue(mockPdfs);

            // Act
            const result = await testInstance.pdfService.listerParUtilisateur(
                utilisateurId, 
                {}, 
                { offset: 0, limite: 20 }
            );

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.count, [
                'utilisateur_id = ?',
                [utilisateurId]
            ]);
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.lister, [
                expect.objectContaining({
                    where: 'utilisateur_id = ?',
                    valeurs: [utilisateurId],
                    order: 'date_creation DESC',
                    limit: 20,
                    offset: 0
                })
            ]);
            testInstance.assertObjectStructure(result, {
                pdfs: mockPdfs,
                total: 15
            });
        });

        test('devrait filtrer par statut', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { statut: 'TERMINE' };
            
            testInstance.mockPdfModel.count.mockResolvedValue(8);
            testInstance.mockPdfModel.lister.mockResolvedValue([]);

            // Act
            await testInstance.pdfService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.lister, [
                expect.objectContaining({
                    where: 'utilisateur_id = ? AND statut = ?',
                    valeurs: [utilisateurId, 'TERMINE']
                })
            ]);
        });

        test('devrait filtrer par type de PDF', async () => {
            // Arrange
            const utilisateurId = 1;
            const filtres = { type_pdf: 'fiche_personnage' };
            
            testInstance.mockPdfModel.count.mockResolvedValue(5);
            testInstance.mockPdfModel.lister.mockResolvedValue([]);

            // Act
            await testInstance.pdfService.listerParUtilisateur(utilisateurId, filtres);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.lister, [
                expect.objectContaining({
                    where: 'utilisateur_id = ? AND type_pdf = ?',
                    valeurs: [utilisateurId, 'fiche_personnage']
                })
            ]);
        });

        test('devrait obtenir un PDF par ID', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                nom_fichier: 'test.pdf',
                statut: 'TERMINE'
            });
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);

            // Act
            const result = await testInstance.pdfService.obtenirParId(pdfId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.obtenirParId, [pdfId]);
            testInstance.assertObjectStructure(result, mockPdf);
        });

        test('devrait marquer un téléchargement', async () => {
            // Arrange
            const pdfId = 123;

            // Act
            await testInstance.pdfService.marquerTelechargement(pdfId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.incrementerTelechargements, [pdfId]);
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
            
            testInstance.mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await testInstance.pdfService.genererPdf(options);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfKitService.generatePDF, [options]);
            testInstance.assertObjectStructure(result, mockResult);
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
            
            testInstance.mockPdfKitService.generatePDF.mockResolvedValue(mockResult);

            // Act
            const result = await testInstance.pdfService.genererPdf(options);

            // Assert
            testInstance.assertMockCalledWith(fs.promises.copyFile, [
                '/temp/generated.pdf',
                '/custom/path/output.pdf'
            ]);
            expect(result.fullPath).toBe('/custom/path/output.pdf');
        });

        test('devrait générer un lien de partage temporaire', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                nom_fichier: 'test.pdf',
                statut: 'TERMINE'
            });
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);
            testInstance.mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await testInstance.pdfService.genererLienPartage(pdfId, 48);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.obtenirParId, [pdfId]);
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.mettreAJour, [
                pdfId,
                expect.objectContaining({
                    url_temporaire: expect.any(String),
                    date_expiration: expect.any(Date)
                })
            ]);
            testInstance.assertObjectStructure(result, {
                token: expect.any(String),
                url: expect.stringContaining('/api/pdfs/partage/'),
                date_expiration: expect.any(Date)
            });
        });

        test('devrait basculer la visibilité publique d\'un PDF', async () => {
            // Arrange
            const pdfId = 123;
            const utilisateurId = 1;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                utilisateur_id: utilisateurId,
                statut: 'TERMINE',
                est_public: false
            });
            
            const pdfMisAJour = { ...mockPdf, est_public: true };
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValueOnce(mockPdf)
                .mockResolvedValueOnce(pdfMisAJour);
            testInstance.mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await testInstance.pdfService.basculerVisibilitePublique(pdfId, utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.mettreAJour, [
                pdfId,
                { est_public: true }
            ]);
            expect(result.est_public).toBe(true);
        });

        test('devrait rejeter le changement de visibilité par un non-propriétaire', async () => {
            // Arrange
            const pdfId = 123;
            const utilisateurId = 1;
            const autreUtilisateur = 2;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                utilisateur_id: autreUtilisateur,
                statut: 'TERMINE',
                est_public: false
            });
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);

            // Act & Assert
            await testInstance.assertThrowsAsync(
                () => testInstance.pdfService.basculerVisibilitePublique(pdfId, utilisateurId),
                null,
                'Seul le propriétaire peut modifier la visibilité'
            );
        });
    });

    describe('Gestion des PDFs', () => {
        test('devrait supprimer un PDF et son fichier', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                nom_fichier: 'test.pdf',
                chemin_fichier: '/path/to/test.pdf'
            });
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValue(mockPdf);
            testInstance.mockPdfModel.supprimer.mockResolvedValue();
            fs.promises.unlink.mockResolvedValue();

            // Act
            const result = await testInstance.pdfService.supprimer(pdfId);

            // Assert
            testInstance.assertMockCalledWith(fs.promises.unlink, ['/path/to/test.pdf']);
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.supprimer, [pdfId]);
            testInstance.assertFunction(() => result, null, true);
        });

        test('devrait relancer la génération d\'un PDF en échec', async () => {
            // Arrange
            const pdfId = 123;
            const mockPdf = testInstance.createTestData('pdf', {
                id: pdfId,
                statut: 'ECHEC',
                personnage_id: 456,
                options_generation: JSON.stringify({ type: 'test' })
            });
            
            const mockPersonnage = testInstance.createTestData('personnage', {
                id: 456,
                nom: 'Test Hero'
            });
            
            const pdfRelance = { ...mockPdf, statut: 'EN_ATTENTE' };
            
            testInstance.mockPdfModel.obtenirParId.mockResolvedValueOnce(mockPdf)
                .mockResolvedValueOnce(pdfRelance);
            testInstance.mockPersonnageModel.obtenirParId.mockResolvedValue(mockPersonnage);
            testInstance.mockPdfModel.mettreAJour.mockResolvedValue();

            // Act
            const result = await testInstance.pdfService.relancerGeneration(pdfId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.mettreAJour, [
                pdfId,
                expect.objectContaining({
                    statut: 'EN_ATTENTE',
                    progression: 0,
                    erreur_message: null
                })
            ]);
            expect(result.statut).toBe('EN_ATTENTE');
        });

        test('devrait nettoyer les PDFs expirés', async () => {
            // Arrange
            const pdfsExpires = [
                testInstance.createTestData('pdf', { id: 1, nom_fichier: 'expired1.pdf' }),
                testInstance.createTestData('pdf', { id: 2, nom_fichier: 'expired2.pdf' })
            ];
            
            testInstance.mockPdfModel.lister.mockResolvedValue(pdfsExpires);
            testInstance.mockPdfModel.obtenirParId.mockResolvedValue({ chemin_fichier: '/path' });
            testInstance.mockPdfModel.supprimer.mockResolvedValue();
            fs.promises.unlink.mockResolvedValue();

            // Act
            const result = await testInstance.pdfService.nettoyerPdfsExpires();

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.lister, [{
                where: 'date_expiration < ? AND statut = ?',
                valeurs: [expect.any(Date), 'TERMINE']
            }]);
            testInstance.assertFunction(() => result, null, 2);
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
            
            testInstance.mockPdfModel.obtenirStatistiques.mockResolvedValue(mockStats);

            // Act
            const result = await testInstance.pdfService.obtenirStatistiques(utilisateurId);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.obtenirStatistiques, [utilisateurId]);
            testInstance.assertObjectStructure(result, mockStats);
        });

        test('devrait obtenir les types de PDF disponibles', () => {
            // Act
            const types = testInstance.pdfService.obtenirTypesPdf();

            // Assert
            testInstance.assertObjectStructure(types, {
                fiche_personnage: 'Fiche de personnage',
                fiche_pnj: 'Fiche PNJ',
                carte_reference: 'Carte de référence'
            });
        });

        test('devrait obtenir les PDFs publics récents', async () => {
            // Arrange
            const mockPdfsPublics = [
                testInstance.createTestData('pdf', {
                    id: 1,
                    nom_fichier: 'public1.pdf',
                    personnage_nom: 'Hero Public',
                    auteur_nom: 'Auteur Test'
                })
            ];
            
            testInstance.mockPdfModel.lister.mockResolvedValue(mockPdfsPublics);

            // Act
            const result = await testInstance.pdfService.obtenirPdfsPublicsRecents(6, 'UTILISATEUR');

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.lister, [
                expect.objectContaining({
                    where: 'statut = ? AND est_public = ?',
                    valeurs: ['TERMINE', true],
                    limit: 6
                })
            ]);
            expect(result).toHaveLength(1);
            testInstance.assertObjectStructure(result[0], {
                id: 1,
                nom_fichier: 'public1.pdf',
                personnage_nom: 'Hero Public',
                auteur_nom: 'Auteur Test'
            });
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
            
            const pdfCree = testInstance.createTestData('pdf', {
                id: 789,
                utilisateur_id: utilisateurId,
                type_pdf: 'document-generique',
                statut: 'EN_ATTENTE'
            });
            
            testInstance.mockPdfModel.creer.mockResolvedValue(pdfCree);

            // Act
            const result = await testInstance.pdfService.genererDocumentGenerique(utilisateurId, options);

            // Assert
            testInstance.assertMockCalledWith(testInstance.mockPdfModel.creer, [
                expect.objectContaining({
                    personnage_id: null,
                    utilisateur_id: utilisateurId,
                    systeme_jeu: 'monsterhearts',
                    type_pdf: 'document-generique',
                    statut: 'EN_ATTENTE'
                })
            ]);
            testInstance.assertObjectStructure(result, pdfCree);
        });

        test('devrait générer un nom de fichier pour document générique', () => {
            // Arrange
            const titre = 'Mon Document/Test';
            const systeme = 'monsterhearts';

            // Act
            const nomFichier = testInstance.pdfService.genererNomFichierDocumentGenerique(titre, systeme);

            // Assert
            expect(nomFichier).toMatch(/^user-system_rights-public_template-document-generique_monsterhearts_Mon_Document_Test_id-[a-f0-9]{8}\.pdf$/);
        });
    });
});