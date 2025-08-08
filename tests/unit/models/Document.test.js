/**
 * Tests unitaires pour le modèle Document
 * 
 * Validation complète selon testing.md :
 * - Configuration modèle
 * - Validation types (6 types selon flux-generation-pdf.md)
 * - Workflows anonyme/connecté
 * - Relations système JDR
 * - Visibilité et modération
 */

const Document = require('../../../src/models/Document');
const db = require('../../../src/database/db');
const Joi = require('joi');

// Mock des dépendances
jest.mock('../../../src/database/db');
jest.mock('../../../src/utils/logManager');

describe('Document Model', () => {
  let document;

  beforeEach(() => {
    jest.clearAllMocks();
    document = new Document();
  });

  describe('Configuration du modèle', () => {
    test('devrait avoir les propriétés de base correctes', () => {
      expect(document.tableName).toBe('documents');
      expect(document.primaryKey).toBe('id');
      expect(document.timestamps).toBe(true);
    });

    test('devrait définir les champs fillable correctement', () => {
      expect(document.fillable).toContain('type');
      expect(document.fillable).toContain('titre');
      expect(document.fillable).toContain('systeme_jeu');
      expect(document.fillable).toContain('donnees');
      expect(document.fillable).toContain('visibilite');
    });

    test('devrait définir les casts appropriés', () => {
      expect(document.casts).toHaveProperty('donnees', 'json');
      expect(document.casts).toHaveProperty('date_publication', 'date');
    });
  });

  describe('Validation des types de documents', () => {
    const typesValides = ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE'];
    
    test('devrait accepter tous les types valides', async () => {
      for (const type of typesValides) {
        const validData = {
          type: type,
          titre: `Test ${type}`,
          systeme_jeu: 'monsterhearts',
          donnees: { test: true },
          statut: 'ACTIF'
        };

        await expect(document.validate(validData, 'create')).resolves.toBe(true);
      }
    });

    test('devrait rejeter type invalide', async () => {
      const invalidData = {
        type: 'TYPE_INEXISTANT',
        titre: 'Test Document',
        systeme_jeu: 'monsterhearts',
        donnees: {},
        statut: 'ACTIF'
      };

      await expect(document.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });

    test('devrait rejeter titre vide', async () => {
      const invalidData = {
        type: 'CHARACTER',
        titre: '',
        systeme_jeu: 'monsterhearts',
        donnees: {}
      };

      await expect(document.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });

    test('devrait rejeter système JDR vide', async () => {
      const invalidData = {
        type: 'CHARACTER',
        titre: 'Test Document',
        systeme_jeu: '',
        donnees: {}
      };

      await expect(document.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });
  });

  describe('Validation des statuts et visibilité', () => {
    const statutsValides = ['BROUILLON', 'ACTIF', 'ARCHIVE', 'SUPPRIME'];
    const visibilitesValides = ['PRIVE', 'PUBLIC', 'PARTAGE'];

    test('devrait accepter tous les statuts valides', async () => {
      for (const statut of statutsValides) {
        const validData = {
          type: 'CHARACTER',
          titre: 'Test Document',
          systeme_jeu: 'monsterhearts',
          donnees: {},
          statut: statut
        };

        await expect(document.validate(validData, 'create')).resolves.toBe(true);
      }
    });

    test('devrait accepter toutes les visibilités valides', async () => {
      for (const visibilite of visibilitesValides) {
        const validData = {
          type: 'CHARACTER',
          titre: 'Test Document',
          systeme_jeu: 'monsterhearts',
          donnees: {},
          visibilite: visibilite
        };

        await expect(document.validate(validData, 'create')).resolves.toBe(true);
      }
    });
  });

  describe('Hooks lifecycle', () => {
    beforeEach(() => {
      db.get.mockResolvedValue({ id: 1, titre: 'Test Document' });
      db.run.mockResolvedValue({ rowCount: 1 });
    });

    test('beforeCreate devrait définir valeurs par défaut', async () => {
      const documentData = {
        type: 'CHARACTER',
        titre: 'Nouveau Document',
        systeme_jeu: 'monsterhearts',
        donnees: {}
      };

      const result = await document.beforeCreate(documentData);

      expect(result.statut).toBe('BROUILLON');
      expect(result.visibilite).toBe('PRIVE');
      expect(result.uuid).toBeDefined();
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('beforeCreate devrait préserver valeurs existantes', async () => {
      const documentData = {
        type: 'CHARACTER',
        titre: 'Document Existant',
        systeme_jeu: 'monsterhearts',
        donnees: {},
        statut: 'ACTIF',
        visibilite: 'PUBLIC'
      };

      const result = await document.beforeCreate(documentData);

      expect(result.statut).toBe('ACTIF');
      expect(result.visibilite).toBe('PUBLIC');
    });

    test('afterCreate devrait logger la création', async () => {
      const createdDoc = {
        id: 1,
        type: 'CHARACTER',
        titre: 'Document Créé'
      };

      // Test que la méthode ne lance pas d'erreur
      await expect(document.afterCreate(createdDoc)).resolves.toBe(createdDoc);
    });

    test('beforeUpdate devrait mettre à jour date_modification', async () => {
      const updateData = {
        titre: 'Titre Modifié'
      };

      const result = await document.beforeUpdate(updateData);

      expect(result.date_modification).toBeDefined();
      expect(result.date_modification).toBeInstanceOf(Date);
    });
  });

  describe('Relations', () => {
    test('getUtilisateur devrait retourner le propriétaire', async () => {
      const mockUser = {
        id: 1,
        nom: 'Propriétaire',
        email: 'owner@example.com'
      };

      db.get.mockResolvedValue(mockUser);

      const result = await document.getUtilisateur(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.nom).toBe('Propriétaire');
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM utilisateurs'),
        [1]
      );
    });

    test('getPersonnage devrait retourner personnage associé', async () => {
      const mockPersonnage = {
        id: 1,
        nom: 'Personnage Test',
        systeme_jeu: 'monsterhearts'
      };

      db.get.mockResolvedValue(mockPersonnage);

      const result = await document.getPersonnage(1);

      expect(result).toBeDefined();
      expect(result.nom).toBe('Personnage Test');
    });

    test('getSystemeJeu devrait retourner système JDR', async () => {
      const mockSysteme = {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts 2',
        statut: 'ACTIF'
      };

      db.get.mockResolvedValue(mockSysteme);

      const result = await document.getSystemeJeu('monsterhearts');

      expect(result).toBeDefined();
      expect(result.nom_complet).toBe('Monsterhearts 2');
    });

    test('getDocumentVotes devrait retourner votes du document', async () => {
      const mockVotes = [
        { id: 1, qualite_generale: 4, utilisateur_id: 1 },
        { id: 2, qualite_generale: 5, utilisateur_id: 2 }
      ];

      db.all.mockResolvedValue(mockVotes);

      const result = await document.getDocumentVotes(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('getModerationHistorique devrait retourner historique modération', async () => {
      const mockHistorique = [
        { 
          id: 1, 
          action: 'APPROBATION', 
          commentaire: 'Document approuvé',
          created_at: new Date()
        }
      ];

      db.all.mockResolvedValue(mockHistorique);

      const result = await document.getModerationHistorique(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].action).toBe('APPROBATION');
    });
  });

  describe('Méthodes de visibilité', () => {
    beforeEach(() => {
      // Setup pour requêtes de visibilité
      db.all.mockResolvedValue([
        { id: 1, titre: 'Document Public 1', visibilite: 'PUBLIC' },
        { id: 2, titre: 'Document Public 2', visibilite: 'PUBLIC' }
      ]);
    });

    test('findPublics devrait retourner documents publics seulement', async () => {
      const result = await document.findPublics();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('visibilite = $1'),
        ['PUBLIC']
      );
    });

    test('findBySysteme devrait filtrer par système JDR', async () => {
      const result = await document.findBySysteme('monsterhearts');

      expect(result).toBeDefined();
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('systeme_jeu = $1'),
        ['monsterhearts']
      );
    });

    test('findByType devrait filtrer par type', async () => {
      const result = await document.findByType('CHARACTER');

      expect(result).toBeDefined();
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('type = $1'),
        ['CHARACTER']
      );
    });

    test('findVisibleBy devrait retourner documents visibles par utilisateur', async () => {
      const userId = 1;
      const result = await document.findVisibleBy(userId);

      expect(result).toBeDefined();
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('visibilite = $1 OR utilisateur_id = $2'),
        ['PUBLIC', userId]
      );
    });
  });

  describe('Workflow anonyme/connecté', () => {
    test('peutEtreModifiePar devrait autoriser le propriétaire', () => {
      const doc = { utilisateur_id: 1, statut: 'ACTIF' };
      const user = { id: 1, role: 'UTILISATEUR' };

      const result = document.peutEtreModifiePar(doc, user);
      expect(result).toBe(true);
    });

    test('peutEtreModifiePar devrait autoriser les admins', () => {
      const doc = { utilisateur_id: 2, statut: 'ACTIF' };
      const user = { id: 1, role: 'ADMIN' };

      const result = document.peutEtreModifiePar(doc, user);
      expect(result).toBe(true);
    });

    test('peutEtreModifiePar devrait refuser utilisateur non propriétaire', () => {
      const doc = { utilisateur_id: 2, statut: 'ACTIF' };
      const user = { id: 1, role: 'UTILISATEUR' };

      const result = document.peutEtreModifiePar(doc, user);
      expect(result).toBe(false);
    });

    test('peutEtreModifiePar devrait refuser document supprimé', () => {
      const doc = { utilisateur_id: 1, statut: 'SUPPRIME' };
      const user = { id: 1, role: 'UTILISATEUR' };

      const result = document.peutEtreModifiePar(doc, user);
      expect(result).toBe(false);
    });

    test('estAnonyme devrait détecter document sans utilisateur', () => {
      const docAnonyme = { utilisateur_id: null };
      const docConnecte = { utilisateur_id: 1 };

      expect(document.estAnonyme(docAnonyme)).toBe(true);
      expect(document.estAnonyme(docConnecte)).toBe(false);
    });
  });

  describe('Méthodes de recherche et tri', () => {
    test('findWithFilters devrait appliquer filtres multiples', async () => {
      const filters = {
        systeme_jeu: 'monsterhearts',
        type: 'CHARACTER',
        visibilite: 'PUBLIC'
      };

      db.all.mockResolvedValue([{ id: 1, titre: 'Document filtré' }]);

      const result = await document.findWithFilters(filters);

      expect(result).toBeDefined();
      expect(db.all).toHaveBeenCalledWith(
        expect.stringMatching(/WHERE.*AND.*AND/),
        ['monsterhearts', 'CHARACTER', 'PUBLIC']
      );
    });

    test('findRecents devrait trier par date création', async () => {
      const limit = 10;
      db.all.mockResolvedValue([
        { id: 1, titre: 'Document récent', created_at: new Date() }
      ]);

      const result = await document.findRecents(limit);

      expect(result).toBeDefined();
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC LIMIT'),
        [limit]
      );
    });

    test('countByFilters devrait compter documents filtrés', async () => {
      const filters = { systeme_jeu: 'monsterhearts' };
      db.get.mockResolvedValue({ count: 42 });

      const result = await document.countByFilters(filters);

      expect(result).toBe(42);
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*)'),
        ['monsterhearts']
      );
    });
  });

  describe('Validation métier spécifique par type', () => {
    test('validerDonneesCharacter devrait valider données personnage', () => {
      const donneesValides = {
        niveau: 5,
        experience: 1200,
        stats: { force: 10, dexterite: 8 }
      };

      const result = document.validerDonneesCharacter(donneesValides);
      expect(result.valid).toBe(true);
    });

    test('validerDonneesTown devrait valider données ville', () => {
      const donneesValides = {
        population: 1000,
        atmosphere: 'Mystérieuse',
        lieux_importants: ['Taverne', 'Temple']
      };

      const result = document.validerDonneesTown(donneesValides);
      expect(result.valid).toBe(true);
    });

    test('validerDonneesDanger devrait valider données danger', () => {
      const donneesValides = {
        niveau_menace: 'Elevé',
        consequences: ['Mort', 'Blessures'],
        solutions: ['Combat', 'Fuite']
      };

      const result = document.validerDonneesDanger(donneesValides);
      expect(result.valid).toBe(true);
    });
  });

  describe('Méthodes de statistiques', () => {
    test('getStatistiquesGlobales devrait retourner stats système', async () => {
      db.get
        .mockResolvedValueOnce({ count: 100 })  // Total documents
        .mockResolvedValueOnce({ count: 75 })   // Documents publics
        .mockResolvedValueOnce({ count: 25 });  // Documents récents

      const stats = await document.getStatistiquesGlobales();

      expect(stats).toBeDefined();
      expect(stats.total_documents).toBe(100);
      expect(stats.documents_publics).toBe(75);
      expect(stats.documents_recents).toBe(25);
    });

    test('getStatistiquesParSysteme devrait grouper par système JDR', async () => {
      db.all.mockResolvedValue([
        { systeme_jeu: 'monsterhearts', count: 50 },
        { systeme_jeu: 'engrenages', count: 30 },
        { systeme_jeu: 'zombiology', count: 20 }
      ]);

      const stats = await document.getStatistiquesParSysteme();

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
      expect(stats[0].systeme_jeu).toBe('monsterhearts');
      expect(stats[0].count).toBe(50);
    });
  });
});