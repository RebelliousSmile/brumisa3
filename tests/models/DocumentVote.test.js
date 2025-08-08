const DocumentVote = require('../../src/models/DocumentVote');
const Document = require('../../src/models/Document');
const Utilisateur = require('../../src/models/Utilisateur');

describe('DocumentVote Model', () => {
  let documentVote;
  let document;
  let utilisateur;

  beforeEach(() => {
    documentVote = new DocumentVote();
    document = new Document();
    utilisateur = new Utilisateur();
  });

  describe('Instanciation et configuration', () => {
    test('devrait créer une instance avec les bonnes propriétés', () => {
      expect(documentVote.tableName).toBe('document_votes');
      expect(documentVote.primaryKey).toBe('id');
      expect(documentVote.timestamps).toBe(true);
    });

    test('devrait avoir les bons champs fillable', () => {
      const expectedFillable = [
        'document_id',
        'utilisateur_id', 
        'qualite_generale',
        'utilite_pratique',
        'respect_gamme',
        'commentaire'
      ];
      expect(documentVote.fillable).toEqual(expectedFillable);
    });

    test('devrait avoir les bonnes conversions de types', () => {
      expect(documentVote.casts).toEqual({
        qualite_generale: 'integer',
        utilite_pratique: 'integer',
        respect_gamme: 'integer',
        date_creation: 'date'
      });
    });
  });

  describe('Validation Joi', () => {
    test('devrait valider des données correctes', () => {
      const validData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 4,
        utilite_pratique: 3,
        respect_gamme: 5,
        commentaire: 'Excellent document'
      };

      const schema = documentVote.getValidationSchema();
      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('devrait rejeter des notes invalides', () => {
      const invalidData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 6, // > 5
        utilite_pratique: 0, // < 1
        respect_gamme: 'invalid', // pas un nombre
        commentaire: 'Test'
      };

      const schema = documentVote.getValidationSchema();
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details).toHaveLength(3);
    });

    test('devrait rejeter un commentaire trop long', () => {
      const longComment = 'x'.repeat(1001);
      const invalidData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 3,
        utilite_pratique: 3,
        respect_gamme: 3,
        commentaire: longComment
      };

      const schema = documentVote.getValidationSchema();
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toEqual(['commentaire']);
    });

    test('devrait accepter un commentaire vide', () => {
      const validData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 3,
        utilite_pratique: 3,
        respect_gamme: 3,
        commentaire: ''
      };

      const schema = documentVote.getValidationSchema();
      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });
  });

  describe('Méthodes métier', () => {
    describe('calculerMoyennes', () => {
      test('devrait retourner des moyennes nulles pour aucun vote', async () => {
        // Mock findAll pour retourner un tableau vide
        documentVote.findAll = jest.fn().mockResolvedValue([]);

        const moyennes = await documentVote.calculerMoyennes(1);
        
        expect(moyennes).toEqual({
          nombre_votes: 0,
          qualite_generale_moyenne: 0,
          utilite_pratique_moyenne: 0,
          respect_gamme_moyenne: 0,
          moyenne_globale: 0
        });
      });

      test('devrait calculer correctement les moyennes', async () => {
        const mockVotes = [
          { qualite_generale: 4, utilite_pratique: 3, respect_gamme: 5 },
          { qualite_generale: 3, utilite_pratique: 4, respect_gamme: 4 },
          { qualite_generale: 5, utilite_pratique: 5, respect_gamme: 3 }
        ];

        documentVote.findAll = jest.fn().mockResolvedValue(mockVotes);

        const moyennes = await documentVote.calculerMoyennes(1);
        
        expect(moyennes.nombre_votes).toBe(3);
        expect(moyennes.qualite_generale_moyenne).toBe(4);
        expect(moyennes.utilite_pratique_moyenne).toBe(4);
        expect(moyennes.respect_gamme_moyenne).toBe(4);
        expect(moyennes.moyenne_globale).toBe(4);
      });

      test('devrait arrondir les moyennes à 2 décimales', async () => {
        const mockVotes = [
          { qualite_generale: 4, utilite_pratique: 3, respect_gamme: 3 },
          { qualite_generale: 3, utilite_pratique: 4, respect_gamme: 4 }
        ];

        documentVote.findAll = jest.fn().mockResolvedValue(mockVotes);

        const moyennes = await documentVote.calculerMoyennes(1);
        
        expect(moyennes.qualite_generale_moyenne).toBe(3.5);
        expect(moyennes.utilite_pratique_moyenne).toBe(3.5);
        expect(moyennes.respect_gamme_moyenne).toBe(3.5);
        expect(moyennes.moyenne_globale).toBe(3.5);
      });
    });

    describe('voterDocument', () => {
      test('devrait créer un vote avec des données valides', async () => {
        const mockCreate = jest.fn().mockResolvedValue({
          id: 1,
          document_id: 1,
          utilisateur_id: 1,
          qualite_generale: 4,
          utilite_pratique: 3,
          respect_gamme: 5,
          commentaire: 'Très bon'
        });

        documentVote.findOne = jest.fn().mockResolvedValue(null); // Pas de vote existant
        documentVote.create = mockCreate;

        const votes = {
          qualite_generale: 4,
          utilite_pratique: 3,
          respect_gamme: 5
        };

        const result = await documentVote.voterDocument(1, 1, votes, 'Très bon');

        expect(mockCreate).toHaveBeenCalledWith({
          document_id: 1,
          utilisateur_id: 1,
          qualite_generale: 4,
          utilite_pratique: 3,
          respect_gamme: 5,
          commentaire: 'Très bon'
        });
        expect(result.id).toBe(1);
      });

      test('devrait rejeter si un vote existe déjà', async () => {
        documentVote.findOne = jest.fn().mockResolvedValue({
          id: 1,
          document_id: 1,
          utilisateur_id: 1
        });

        const votes = {
          qualite_generale: 4,
          utilite_pratique: 3,
          respect_gamme: 5
        };

        await expect(documentVote.voterDocument(1, 1, votes, 'Test'))
          .rejects.toThrow('Un vote existe déjà. Utilisez modifierVote() pour le modifier.');
      });
    });

    describe('modifierVote', () => {
      test('devrait modifier un vote existant', async () => {
        const mockVote = {
          id: 1,
          document_id: 1,
          utilisateur_id: 1
        };

        const mockUpdate = jest.fn().mockResolvedValue({
          ...mockVote,
          qualite_generale: 5,
          utilite_pratique: 4,
          respect_gamme: 3,
          commentaire: 'Modifié'
        });

        documentVote.findOne = jest.fn().mockResolvedValue(mockVote);
        documentVote.update = mockUpdate;

        const nouveauxVotes = {
          qualite_generale: 5,
          utilite_pratique: 4,
          respect_gamme: 3
        };

        const result = await documentVote.modifierVote(1, 1, nouveauxVotes, 'Modifié');

        expect(mockUpdate).toHaveBeenCalledWith(1, {
          qualite_generale: 5,
          utilite_pratique: 4,
          respect_gamme: 3,
          commentaire: 'Modifié'
        });
      });

      test('devrait rejeter si aucun vote existe', async () => {
        documentVote.findOne = jest.fn().mockResolvedValue(null);

        const nouveauxVotes = {
          qualite_generale: 5,
          utilite_pratique: 4,
          respect_gamme: 3
        };

        await expect(documentVote.modifierVote(1, 1, nouveauxVotes, 'Test'))
          .rejects.toThrow('Aucun vote trouvé pour ce document et cet utilisateur');
      });
    });

    describe('getVotesUtilisateur', () => {
      test('devrait récupérer le vote d\'un utilisateur', async () => {
        const mockVote = {
          id: 1,
          document_id: 1,
          utilisateur_id: 1,
          qualite_generale: 4,
          utilite_pratique: 3,
          respect_gamme: 5
        };

        documentVote.findOne = jest.fn().mockResolvedValue(mockVote);

        const result = await documentVote.getVotesUtilisateur(1, 1);

        expect(documentVote.findOne).toHaveBeenCalledWith(
          'utilisateur_id = $1 AND document_id = $2',
          [1, 1]
        );
        expect(result).toEqual(mockVote);
      });

      test('devrait retourner null si aucun vote trouvé', async () => {
        documentVote.findOne = jest.fn().mockResolvedValue(null);

        const result = await documentVote.getVotesUtilisateur(1, 1);

        expect(result).toBeNull();
      });
    });

    describe('statistiquesVotes', () => {
      test('devrait retourner des statistiques complètes', async () => {
        const mockVotes = [
          {
            qualite_generale: 4,
            utilite_pratique: 3,
            respect_gamme: 5,
            commentaire: 'Excellent',
            date_creation: '2023-01-01'
          },
          {
            qualite_generale: 3,
            utilite_pratique: 4,
            respect_gamme: 4,
            commentaire: 'Bien',
            date_creation: '2023-01-02'
          },
          {
            qualite_generale: 5,
            utilite_pratique: 5,
            respect_gamme: 3,
            commentaire: '', // Commentaire vide
            date_creation: '2023-01-03'
          }
        ];

        documentVote.findAll = jest.fn().mockResolvedValue(mockVotes);
        documentVote.calculerMoyennes = jest.fn().mockResolvedValue({
          nombre_votes: 3,
          qualite_generale_moyenne: 4,
          utilite_pratique_moyenne: 4,
          respect_gamme_moyenne: 4,
          moyenne_globale: 4
        });

        const stats = await documentVote.statistiquesVotes(1);

        expect(stats.nombre_votes).toBe(3);
        expect(stats.moyenne_globale).toBe(4);
        
        // Vérifier la distribution
        expect(stats.distribution.qualite_generale[4]).toBe(1);
        expect(stats.distribution.qualite_generale[3]).toBe(1);
        expect(stats.distribution.qualite_generale[5]).toBe(1);

        // Vérifier les commentaires (doit filtrer les vides)
        expect(stats.commentaires).toHaveLength(2);
        expect(stats.commentaires[0].commentaire).toBe('Excellent');
        expect(stats.commentaires[1].commentaire).toBe('Bien');
      });

      test('devrait gérer le cas sans votes', async () => {
        documentVote.findAll = jest.fn().mockResolvedValue([]);
        documentVote.calculerMoyennes = jest.fn().mockResolvedValue({
          nombre_votes: 0,
          qualite_generale_moyenne: 0,
          utilite_pratique_moyenne: 0,
          respect_gamme_moyenne: 0,
          moyenne_globale: 0
        });

        const stats = await documentVote.statistiquesVotes(1);

        expect(stats.nombre_votes).toBe(0);
        expect(stats.commentaires).toHaveLength(0);
        expect(Object.keys(stats.distribution.qualite_generale)).toHaveLength(5);
      });
    });

    describe('supprimerVote', () => {
      test('devrait permettre à l\'utilisateur de supprimer son vote', async () => {
        const mockVote = {
          id: 1,
          document_id: 1,
          utilisateur_id: 1
        };

        documentVote.findOne = jest.fn().mockResolvedValue(mockVote);
        documentVote.delete = jest.fn().mockResolvedValue(true);

        const result = await documentVote.supprimerVote(1, 1, 1, false);

        expect(documentVote.delete).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
      });

      test('devrait permettre à un admin de supprimer n\'importe quel vote', async () => {
        const mockVote = {
          id: 1,
          document_id: 1,
          utilisateur_id: 2 // Autre utilisateur
        };

        documentVote.findOne = jest.fn().mockResolvedValue(mockVote);
        documentVote.delete = jest.fn().mockResolvedValue(true);

        const result = await documentVote.supprimerVote(1, 2, 1, true); // Admin

        expect(result).toBe(true);
      });

      test('devrait rejeter si utilisateur non admin tente de supprimer vote d\'autrui', async () => {
        const mockVote = {
          id: 1,
          document_id: 1,
          utilisateur_id: 2 // Autre utilisateur
        };

        documentVote.findOne = jest.fn().mockResolvedValue(mockVote);

        await expect(documentVote.supprimerVote(1, 2, 1, false))
          .rejects.toThrow('Vous ne pouvez supprimer que vos propres votes');
      });

      test('devrait rejeter si vote introuvable', async () => {
        documentVote.findOne = jest.fn().mockResolvedValue(null);

        await expect(documentVote.supprimerVote(1, 1, 1, false))
          .rejects.toThrow('Vote introuvable');
      });
    });
  });

  describe('Validation des critères', () => {
    test('devrait valider les 3 critères obligatoires', () => {
      const schema = documentVote.getValidationSchema();
      
      // Test avec tous les critères
      const validData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 3,
        utilite_pratique: 4,
        respect_gamme: 2
      };
      
      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('devrait rejeter si critère manquant', () => {
      const schema = documentVote.getValidationSchema();
      
      const invalidData = {
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 3,
        utilite_pratique: 4
        // respect_gamme manquant
      };
      
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details.some(d => d.path.includes('respect_gamme'))).toBe(true);
    });

    test('devrait valider la plage 1-5 pour tous les critères', () => {
      const schema = documentVote.getValidationSchema();
      
      // Test limites basses
      const { error: errorMin } = schema.validate({
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 1,
        utilite_pratique: 1,
        respect_gamme: 1
      });
      expect(errorMin).toBeUndefined();

      // Test limites hautes
      const { error: errorMax } = schema.validate({
        document_id: 1,
        utilisateur_id: 1,
        qualite_generale: 5,
        utilite_pratique: 5,
        respect_gamme: 5
      });
      expect(errorMax).toBeUndefined();
    });
  });
});