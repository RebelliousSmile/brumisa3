/**
 * Tests unitaires pour PdfService
 * 
 * Validation logique métier selon testing.md :
 * - Orchestration génération PDF
 * - Support des 6 types de documents
 * - Intégration avec DocumentFactory
 * - Gestion des thèmes par système JDR
 * - Performance et cache
 */

const PdfService = require('../../../src/services/PdfService');
const DocumentFactory = require('../../../src/services/DocumentFactory');
const SystemThemeService = require('../../../src/services/SystemThemeService');
const Pdf = require('../../../src/models/Pdf');
const fs = require('fs-extra');
const path = require('path');

// Mock des dépendances
jest.mock('../../../src/services/DocumentFactory');
jest.mock('../../../src/services/SystemThemeService');
jest.mock('../../../src/models/Pdf');
jest.mock('../../../src/utils/logManager');
jest.mock('fs-extra');

describe('PdfService', () => {
  let pdfService;
  let mockDocumentFactory;
  let mockSystemTheme;
  let mockPdfModel;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration des mocks
    mockDocumentFactory = new DocumentFactory();
    mockSystemTheme = new SystemThemeService();
    mockPdfModel = new Pdf();
    
    pdfService = new PdfService();
    
    // Mock par défaut pour fs-extra
    fs.ensureDir.mockResolvedValue(true);
    fs.writeFile.mockResolvedValue(true);
    fs.existsSync.mockReturnValue(false);
  });

  describe('Configuration du service', () => {
    test('devrait initialiser avec les bonnes propriétés', () => {
      expect(pdfService.documentFactory).toBeInstanceOf(DocumentFactory);
      expect(pdfService.systemTheme).toBeInstanceOf(SystemThemeService);
      expect(pdfService.pdfModel).toBeInstanceOf(Pdf);
    });

    test('devrait définir répertoires de sortie corrects', () => {
      const outputDir = pdfService.getOutputDirectory();
      expect(outputDir).toContain('output');
      expect(path.isAbsolute(outputDir)).toBe(true);
    });
  });

  describe('Génération PDF par type', () => {
    const typesDocuments = ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE'];
    
    beforeEach(() => {
      // Mock réponses standard
      mockDocumentFactory.creerDocument.mockResolvedValue({
        generatePdf: jest.fn().mockResolvedValue('/fake/path/test.pdf')
      });
      
      mockSystemTheme.obtenirTheme.mockResolvedValue({
        couleurs: { primaire: '#8B5CF6', secondaire: '#EC4899' },
        polices: { principale: 'Cinzel', texte: 'Crimson Text' }
      });

      mockPdfModel.create.mockResolvedValue({
        id: 1,
        titre: 'Test PDF',
        chemin_fichier: '/fake/path/test.pdf'
      });
    });

    test.each(typesDocuments)('devrait générer PDF pour type %s', async (type) => {
      const documentData = {
        type: type,
        titre: `Test ${type}`,
        systeme_jeu: 'monsterhearts',
        donnees: { test: true },
        utilisateur_id: 1
      };

      const result = await pdfService.genererDocument(documentData);

      expect(result).toBeDefined();
      expect(mockDocumentFactory.creerDocument).toHaveBeenCalledWith(type);
      expect(mockSystemTheme.obtenirTheme).toHaveBeenCalledWith('monsterhearts');
      expect(result.chemin_fichier).toBe('/fake/path/test.pdf');
    });

    test('devrait rejeter type de document invalide', async () => {
      const documentData = {
        type: 'INVALID_TYPE',
        titre: 'Test Invalid',
        systeme_jeu: 'monsterhearts'
      };

      await expect(pdfService.genererDocument(documentData))
        .rejects.toThrow('Type de document non supporté: INVALID_TYPE');
    });

    test('devrait rejeter système JDR invalide', async () => {
      mockSystemTheme.obtenirTheme.mockRejectedValue(new Error('Système non supporté'));

      const documentData = {
        type: 'CHARACTER',
        titre: 'Test Character',
        systeme_jeu: 'systeme_inexistant'
      };

      await expect(pdfService.genererDocument(documentData))
        .rejects.toThrow('Système non supporté');
    });
  });

  describe('Génération fiche personnage', () => {
    beforeEach(() => {
      mockDocumentFactory.creerDocument.mockResolvedValue({
        generatePdf: jest.fn().mockResolvedValue('/fake/path/character.pdf')
      });

      mockPdfModel.create.mockResolvedValue({
        id: 2,
        titre: 'Fiche Personnage',
        chemin_fichier: '/fake/path/character.pdf'
      });
    });

    test('devrait générer fiche personnage Monsterhearts', async () => {
      const personnageData = {
        id: 1,
        nom: 'Vampire Test',
        systeme_jeu: 'monsterhearts',
        archetype: 'vampire',
        stats: { hot: 1, cold: 0, volatile: -1, dark: 2 },
        utilisateur_id: 1
      };

      const result = await pdfService.genererFichePersonnage(personnageData);

      expect(result).toBeDefined();
      expect(result.titre).toContain('Fiche Personnage');
      expect(mockDocumentFactory.creerDocument).toHaveBeenCalledWith('CHARACTER');
    });

    test('devrait appliquer thème correct selon système JDR', async () => {
      const personnageData = {
        nom: 'Test Engrenages',
        systeme_jeu: 'engrenages',
        utilisateur_id: 1
      };

      await pdfService.genererFichePersonnage(personnageData);

      expect(mockSystemTheme.obtenirTheme).toHaveBeenCalledWith('engrenages');
    });

    test('devrait gérer données personnage manquantes', async () => {
      const personnageMinimal = {
        nom: 'Personnage Minimal',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      const result = await pdfService.genererFichePersonnage(personnageMinimal);

      expect(result).toBeDefined();
      // Devrait utiliser des valeurs par défaut
      const generateCall = mockDocumentFactory.creerDocument.mock.results[0].value.generatePdf.mock.calls[0];
      expect(generateCall[0]).toMatchObject({
        nom: 'Personnage Minimal',
        systeme_jeu: 'monsterhearts'
      });
    });
  });

  describe('Gestion des thèmes visuels', () => {
    const systemesJdr = ['monsterhearts', 'engrenages', 'metro2033', 'mist-engine', 'zombiology'];

    test.each(systemesJdr)('devrait charger thème pour %s', async (systeme) => {
      mockSystemTheme.obtenirTheme.mockResolvedValue({
        id: systeme,
        couleurs: { primaire: '#000', secondaire: '#FFF' },
        polices: { principale: 'Arial', texte: 'Times' }
      });

      const theme = await pdfService.obtenirThemeSysteme(systeme);

      expect(theme).toBeDefined();
      expect(theme.id).toBe(systeme);
      expect(theme.couleurs).toBeDefined();
      expect(theme.polices).toBeDefined();
      expect(mockSystemTheme.obtenirTheme).toHaveBeenCalledWith(systeme);
    });

    test('devrait utiliser cache pour thèmes fréquents', async () => {
      mockSystemTheme.obtenirTheme.mockResolvedValue({
        id: 'monsterhearts',
        couleurs: { primaire: '#8B5CF6' }
      });

      // Premier appel
      await pdfService.obtenirThemeSysteme('monsterhearts');
      
      // Deuxième appel (devrait utiliser le cache)
      await pdfService.obtenirThemeSysteme('monsterhearts');

      expect(mockSystemTheme.obtenirTheme).toHaveBeenCalledTimes(1);
    });

    test('devrait appliquer personnalisations utilisateur Premium', async () => {
      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1,
        utilisateur_role: 'PREMIUM',
        preferences_theme: {
          couleur_accent: '#FF0000',
          police_titre: 'Custom Font'
        }
      };

      await pdfService.genererDocument(documentData);

      // Vérifier que les préférences sont appliquées
      const generateCall = mockDocumentFactory.creerDocument.mock.results[0].value.generatePdf.mock.calls[0];
      expect(generateCall[1].couleur_accent).toBe('#FF0000');
    });
  });

  describe('Gestion des fichiers et chemins', () => {
    test('devrait créer répertoire de sortie si inexistant', async () => {
      fs.existsSync.mockReturnValue(false);

      const documentData = {
        type: 'CHARACTER',
        titre: 'Test Directory Creation',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await pdfService.genererDocument(documentData);

      expect(fs.ensureDir).toHaveBeenCalled();
    });

    test('devrait générer nom de fichier unique', () => {
      const nom1 = pdfService.genererNomFichier('Test Document', 'monsterhearts');
      const nom2 = pdfService.genererNomFichier('Test Document', 'monsterhearts');

      expect(nom1).toMatch(/^test-document-monsterhearts-\d+\.pdf$/);
      expect(nom2).toMatch(/^test-document-monsterhearts-\d+\.pdf$/);
      expect(nom1).not.toBe(nom2);
    });

    test('devrait nettoyer caractères spéciaux dans noms fichiers', () => {
      const nom = pdfService.genererNomFichier('Tést Àccénts & Spéçiaux!', 'monsterhearts');
      
      expect(nom).toMatch(/^test-accents-speciaux-monsterhearts-\d+\.pdf$/);
      expect(nom).not.toContain('&');
      expect(nom).not.toContain('!');
    });

    test('devrait gérer erreur création répertoire', async () => {
      fs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await expect(pdfService.genererDocument(documentData))
        .rejects.toThrow('Impossible de créer le répertoire de sortie');
    });
  });

  describe('Performance et optimisation', () => {
    test('devrait respecter limite de temps génération < 2s', async () => {
      const startTime = Date.now();
      
      const documentData = {
        type: 'CHARACTER',
        titre: 'Test Performance',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1,
        donnees: { complexite: 'normale' }
      };

      await pdfService.genererDocument(documentData);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });

    test('devrait détecter génération lente', async () => {
      // Mock génération lente
      mockDocumentFactory.creerDocument.mockResolvedValue({
        generatePdf: jest.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve('/slow.pdf'), 3000))
        )
      });

      const documentData = {
        type: 'GENERIQUE',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      const startTime = Date.now();
      await pdfService.genererDocument(documentData);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThan(2500);
      // Devrait logger un warning de performance
    });

    test('devrait optimiser documents simples', async () => {
      const documentSimple = {
        type: 'GENERIQUE',
        titre: 'Document Simple',
        systeme_jeu: 'monsterhearts',
        donnees: { contenu: 'Texte court' },
        utilisateur_id: 1
      };

      const result = await pdfService.genererDocument(documentSimple);

      expect(result).toBeDefined();
      // Pour documents simples, devrait utiliser template optimisé
      expect(mockDocumentFactory.creerDocument).toHaveBeenCalledWith('GENERIQUE');
    });
  });

  describe('Gestion d\'erreurs', () => {
    test('devrait gérer erreur DocumentFactory', async () => {
      mockDocumentFactory.creerDocument.mockRejectedValue(
        new Error('Factory error')
      );

      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await expect(pdfService.genererDocument(documentData))
        .rejects.toThrow('Erreur lors de la création du document');
    });

    test('devrait gérer erreur génération PDF', async () => {
      mockDocumentFactory.creerDocument.mockResolvedValue({
        generatePdf: jest.fn().mockRejectedValue(new Error('PDF generation failed'))
      });

      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await expect(pdfService.genererDocument(documentData))
        .rejects.toThrow('Erreur lors de la génération PDF');
    });

    test('devrait nettoyer fichiers temporaires en cas d\'erreur', async () => {
      const mockUnlink = jest.fn();
      fs.unlink = mockUnlink;

      mockDocumentFactory.creerDocument.mockResolvedValue({
        generatePdf: jest.fn().mockRejectedValue(new Error('Generation failed'))
      });

      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      try {
        await pdfService.genererDocument(documentData);
      } catch (error) {
        // Erreur attendue
      }

      // Devrait tenter de nettoyer les fichiers temporaires
      expect(mockUnlink).toHaveBeenCalled();
    });
  });

  describe('Méthodes utilitaires', () => {
    test('getSupportedTypes devrait retourner types supportés', () => {
      const types = pdfService.getSupportedTypes();
      
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('CHARACTER');
      expect(types).toContain('TOWN');
      expect(types).toContain('ORGANIZATION');
      expect(types).toContain('DANGER');
      expect(types).toContain('GENERIQUE');
      expect(types.length).toBe(6);
    });

    test('getSupportedSystems devrait retourner systèmes JDR supportés', () => {
      const systems = pdfService.getSupportedSystems();
      
      expect(Array.isArray(systems)).toBe(true);
      expect(systems).toContain('monsterhearts');
      expect(systems).toContain('engrenages');
      expect(systems).toContain('zombiology');
      expect(systems.length).toBeGreaterThanOrEqual(5);
    });

    test('validateDocumentData devrait valider données document', () => {
      const validData = {
        type: 'CHARACTER',
        titre: 'Test Validation',
        systeme_jeu: 'monsterhearts',
        donnees: {}
      };

      const result = pdfService.validateDocumentData(validData);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateDocumentData devrait rejeter données invalides', () => {
      const invalidData = {
        type: 'INVALID_TYPE',
        titre: '',
        systeme_jeu: 'unknown_system'
      };

      const result = pdfService.validateDocumentData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Type de document invalide');
      expect(result.errors).toContain('Titre requis');
    });
  });

  describe('Statistiques et monitoring', () => {
    test('devrait collecter métriques de génération', async () => {
      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await pdfService.genererDocument(documentData);

      const metrics = pdfService.getMetrics();
      
      expect(metrics.total_generated).toBeGreaterThan(0);
      expect(metrics.by_type.CHARACTER).toBeDefined();
      expect(metrics.by_system.monsterhearts).toBeDefined();
    });

    test('devrait tracker temps de génération moyen', async () => {
      const documentData = {
        type: 'CHARACTER',
        systeme_jeu: 'monsterhearts',
        utilisateur_id: 1
      };

      await pdfService.genererDocument(documentData);
      await pdfService.genererDocument(documentData);

      const metrics = pdfService.getMetrics();
      
      expect(metrics.average_generation_time).toBeDefined();
      expect(metrics.average_generation_time).toBeGreaterThan(0);
    });
  });
});