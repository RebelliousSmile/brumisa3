/**
 * Tests d'intégration PDF - Génération documents CHARACTER
 * 
 * Validation génération par type/système selon testing.md :
 * - Génération fiches personnages par système JDR
 * - Application des thèmes visuels
 * - Performance et qualité PDF
 * - Gestion des erreurs
 */

const PdfService = require('../../../src/services/PdfService');
const DocumentFactory = require('../../../src/services/DocumentFactory');
const SystemThemeService = require('../../../src/services/SystemThemeService');
const TestDataFactory = require('../../helpers/factories');
const TestDatabaseHelper = require('../../helpers/database');
const fs = require('fs-extra');
const path = require('path');

describe('PDF Integration - Character Generation', () => {
  let pdfService;
  let testUser;
  let testPersonnage;
  let outputDir;

  beforeAll(async () => {
    // Setup services
    pdfService = new PdfService();
    outputDir = path.join(__dirname, '..', '..', '..', 'output', 'test');
    
    // Assurer que le répertoire de sortie existe
    await fs.ensureDir(outputDir);
    
    // Nettoyer données test
    await TestDatabaseHelper.cleanTestData();
  });

  beforeEach(async () => {
    // Créer données de test
    testUser = await TestDataFactory.createTestUser({
      role: 'PREMIUM'
    });
  });

  afterEach(async () => {
    // Nettoyage des fichiers PDF générés
    try {
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        if (file.startsWith('test-') && file.endsWith('.pdf')) {
          await fs.unlink(path.join(outputDir, file));
        }
      }
    } catch (error) {
      console.warn('Cleanup PDF files error:', error.message);
    }

    // Nettoyage base de données
    if (testPersonnage) {
      const Personnage = require('../../../src/models/Personnage');
      const personnage = new Personnage();
      await personnage.delete(testPersonnage.id);
    }
    
    if (testUser) {
      const Utilisateur = require('../../../src/models/Utilisateur');
      const utilisateur = new Utilisateur();
      await utilisateur.delete(testUser.id);
    }
  });

  describe('Génération fiches Monsterhearts', () => {
    beforeEach(async () => {
      testPersonnage = await TestDataFactory.createTestCharacter(
        'monsterhearts', 
        testUser.id,
        {
          donnees_personnage: {
            archetype: 'vampire',
            stats: { hot: 1, cold: 0, volatile: -1, dark: 2 },
            moves: ['Hypnotic', 'Cold as Ice'],
            harm: { physical: 0, emotional: 0 },
            strings: { held: 0, given: 0 }
          }
        }
      );
    });

    test('devrait générer fiche vampire complète', async () => {
      const startTime = Date.now();
      
      const result = await pdfService.genererFichePersonnage(testPersonnage);
      
      const generationTime = Date.now() - startTime;

      // Vérifications de base
      expect(result).toBeDefined();
      expect(result.chemin_fichier).toBeDefined();
      expect(fs.existsSync(result.chemin_fichier)).toBe(true);

      // Vérification performance (< 2s selon TODO.md)
      expect(generationTime).toBeLessThan(2000);

      // Vérification taille fichier (PDF non vide)
      const stats = await fs.stat(result.chemin_fichier);
      expect(stats.size).toBeGreaterThan(1000); // Au moins 1KB

      // Vérification nom fichier
      expect(path.basename(result.chemin_fichier)).toMatch(
        /test-.*-vampire.*-monsterhearts-\d+\.pdf/
      );
    });

    test('devrait appliquer thème Monsterhearts (gothique romantique)', async () => {
      const result = await pdfService.genererFichePersonnage(testPersonnage);
      
      expect(result).toBeDefined();
      expect(fs.existsSync(result.chemin_fichier)).toBe(true);

      // Vérifier métadonnées PDF contiennent le thème
      // (nécessiterait une libraire de parsing PDF pour validation complète)
      expect(result.theme_applique).toBe('monsterhearts');
    });

    test('devrait inclure toutes les données personnage', async () => {
      const personnageComplet = await TestDataFactory.createTestCharacter(
        'monsterhearts',
        testUser.id,
        {
          donnees_personnage: {
            archetype: 'werewolf',
            stats: { hot: -1, cold: 1, volatile: 2, dark: 0 },
            moves: ['Primal Dominance', 'Scent of Blood'],
            harm: { physical: 1, emotional: 2 },
            conditions: ['Scared', 'Angry'],
            advances: ['Take a move from another skin'],
            darkest_self: 'Description du côté sombre'
          }
        }
      );

      const result = await pdfService.genererFichePersonnage(personnageComplet);

      expect(result).toBeDefined();
      expect(fs.existsSync(result.chemin_fichier)).toBe(true);

      // Le PDF devrait être plus gros avec plus de données
      const stats = await fs.stat(result.chemin_fichier);
      expect(stats.size).toBeGreaterThan(5000); // Au moins 5KB pour fiche complète

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnage = new Personnage();
      await personnage.delete(personnageComplet.id);
    });

    test('devrait gérer données manquantes gracieusement', async () => {
      const personnageMinimal = await TestDataFactory.createTestCharacter(
        'monsterhearts',
        testUser.id,
        {
          donnees_personnage: {
            archetype: 'chosen' // Données minimales
          }
        }
      );

      const result = await pdfService.genererFichePersonnage(personnageMinimal);

      expect(result).toBeDefined();
      expect(fs.existsSync(result.chemin_fichier)).toBe(true);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnage = new Personnage();
      await personnage.delete(personnageMinimal.id);
    });
  });

  describe('Génération fiches autres systèmes JDR', () => {
    const systemesTests = [
      {
        systeme: 'engrenages',
        archetype: 'investigateur',
        donnees: {
          competences: { investigation: 3, combat: 1 },
          equipements: ['Revolver', 'Carnet'],
          contacts: ['Inspecteur Holmes']
        }
      },
      {
        systeme: 'zombiology',
        archetype: 'survivant',
        donnees: {
          stats: { force: 2, dexterite: 1, constitution: 3 },
          competences: ['Survie', 'Combat'],
          equipement: ['Machette', 'Sac de survie']
        }
      }
    ];

    test.each(systemesTests)('devrait générer fiche $systeme', async ({ systeme, archetype, donnees }) => {
      const personnage = await TestDataFactory.createTestCharacter(
        systeme,
        testUser.id,
        {
          donnees_personnage: {
            archetype: archetype,
            ...donnees
          }
        }
      );

      const startTime = Date.now();
      const result = await pdfService.genererFichePersonnage(personnage);
      const generationTime = Date.now() - startTime;

      // Vérifications standard
      expect(result).toBeDefined();
      expect(result.chemin_fichier).toBeDefined();
      expect(fs.existsSync(result.chemin_fichier)).toBe(true);
      expect(generationTime).toBeLessThan(2000);

      // Vérification nom fichier contient système
      expect(path.basename(result.chemin_fichier)).toContain(systeme);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage.id);
    });
  });

  describe('Thèmes visuels par système', () => {
    test('devrait appliquer couleurs correctes par système', async () => {
      const systemTheme = new SystemThemeService();
      
      const themeMonsterhearts = await systemTheme.obtenirTheme('monsterhearts');
      expect(themeMonsterhearts.couleurs.primaire).toMatch(/#[0-9A-F]{6}/i);
      
      const themeZombiology = await systemTheme.obtenirTheme('zombiology');
      expect(themeZombiology.couleurs.primaire).toMatch(/#[0-9A-F]{6}/i);
      
      // Les thèmes devraient être différents
      expect(themeMonsterhearts.couleurs.primaire).not.toBe(themeZombiology.couleurs.primaire);
    });

    test('devrait utiliser polices appropriées par système', async () => {
      const systemTheme = new SystemThemeService();
      
      const themeMonsterhearts = await systemTheme.obtenirTheme('monsterhearts');
      expect(themeMonsterhearts.polices.principale).toBeDefined();
      expect(themeMonsterhearts.polices.texte).toBeDefined();
    });
  });

  describe('Performance et optimisation', () => {
    test('génération multiple devrait être optimisée', async () => {
      const personnages = await Promise.all([
        TestDataFactory.createTestCharacter('monsterhearts', testUser.id),
        TestDataFactory.createTestCharacter('monsterhearts', testUser.id),
        TestDataFactory.createTestCharacter('monsterhearts', testUser.id)
      ]);

      const startTime = Date.now();
      
      const results = await Promise.all(
        personnages.map(p => pdfService.genererFichePersonnage(p))
      );

      const totalTime = Date.now() - startTime;
      
      // 3 PDFs devraient prendre moins de 5 secondes total
      expect(totalTime).toBeLessThan(5000);
      
      // Tous devraient être générés
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(fs.existsSync(result.chemin_fichier)).toBe(true);
      });

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      for (const p of personnages) {
        await personnageModel.delete(p.id);
      }
    });

    test('devrait utiliser cache pour thèmes', async () => {
      const personnage1 = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);
      const personnage2 = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);

      const startTime = Date.now();
      
      // Premier PDF charge le thème
      await pdfService.genererFichePersonnage(personnage1);
      
      // Deuxième PDF devrait utiliser le thème en cache
      await pdfService.genererFichePersonnage(personnage2);
      
      const totalTime = Date.now() - startTime;
      
      // Avec cache, devrait être plus rapide
      expect(totalTime).toBeLessThan(3000);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage1.id);
      await personnageModel.delete(personnage2.id);
    });
  });

  describe('Gestion d\'erreurs', () => {
    test('devrait gérer système JDR inexistant', async () => {
      const personnageInvalide = {
        id: 999,
        nom: 'Personnage Invalide',
        systeme_jeu: 'systeme_inexistant',
        utilisateur_id: testUser.id,
        donnees_personnage: {}
      };

      await expect(pdfService.genererFichePersonnage(personnageInvalide))
        .rejects.toThrow(/Système.*non supporté|non trouvé/);
    });

    test('devrait gérer erreur d\'écriture fichier', async () => {
      const personnage = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);
      
      // Mock erreur fs
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn().mockRejectedValue(new Error('Disk full'));

      await expect(pdfService.genererFichePersonnage(personnage))
        .rejects.toThrow(/écriture|fichier/);

      // Restore
      fs.writeFile = originalWriteFile;

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage.id);
    });

    test('devrait nettoyer fichiers temporaires en cas d\'erreur', async () => {
      const personnage = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);
      
      // Forcer une erreur en milieu de génération
      const documentFactory = new DocumentFactory();
      const originalCreate = documentFactory.creerDocument;
      documentFactory.creerDocument = jest.fn().mockImplementation(() => {
        throw new Error('Forced error for cleanup test');
      });

      try {
        await pdfService.genererFichePersonnage(personnage);
      } catch (error) {
        // Erreur attendue
      }

      // Vérifier qu'aucun fichier temporaire ne traîne
      const tempFiles = await fs.readdir(outputDir);
      const tempPdfs = tempFiles.filter(f => f.includes('temp') && f.endsWith('.pdf'));
      expect(tempPdfs).toHaveLength(0);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage.id);
    });
  });

  describe('Qualité PDF', () => {
    test('devrait générer PDF avec métadonnées correctes', async () => {
      const personnage = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);
      
      const result = await pdfService.genererFichePersonnage(personnage);
      
      // Vérification basique de structure PDF
      const pdfBuffer = await fs.readFile(result.chemin_fichier);
      const pdfString = pdfBuffer.toString('binary');
      
      // Un PDF valide commence par %PDF
      expect(pdfString.startsWith('%PDF')).toBe(true);
      
      // Devrait contenir métadonnées titre
      expect(pdfString).toContain(personnage.nom);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage.id);
    });

    test('PDF devrait être lisible par visualiseurs standards', async () => {
      const personnage = await TestDataFactory.createTestCharacter('monsterhearts', testUser.id);
      
      const result = await pdfService.genererFichePersonnage(personnage);
      
      // Vérifications format PDF standard
      const pdfBuffer = await fs.readFile(result.chemin_fichier);
      
      // Taille raisonnable (entre 1KB et 1MB)
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.length).toBeLessThan(1024 * 1024);

      // Cleanup
      const Personnage = require('../../../src/models/Personnage');
      const personnageModel = new Personnage();
      await personnageModel.delete(personnage.id);
    });
  });
});