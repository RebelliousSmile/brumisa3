const SystemeJeu = require('../../src/models/SystemeJeu');

describe('SystemeJeu Model', () => {
  let systemeJeu;

  beforeEach(() => {
    systemeJeu = new SystemeJeu();
  });

  describe('Instanciation et configuration', () => {
    test('devrait créer une instance avec les bonnes propriétés', () => {
      expect(systemeJeu.tableName).toBe('systemes_jeu');
      expect(systemeJeu.primaryKey).toBe('id');
      expect(systemeJeu.timestamps).toBe(true);
    });

    test('devrait avoir les bons champs fillable', () => {
      const expectedFillable = [
        'id',
        'nom_complet',
        'description',
        'site_officiel',
        'version_supportee',
        'structure_donnees',
        'statut',
        'message_maintenance',
        'ordre_affichage',
        'couleur_theme',
        'icone'
      ];
      expect(systemeJeu.fillable).toEqual(expectedFillable);
    });

    test('devrait avoir les bonnes conversions de types', () => {
      expect(systemeJeu.casts).toEqual({
        structure_donnees: 'json',
        ordre_affichage: 'integer',
        date_derniere_maj_structure: 'date',
        date_creation: 'date',
        date_modification: 'date'
      });
    });
  });

  describe('Constantes statiques', () => {
    test('devrait avoir les bons statuts', () => {
      expect(SystemeJeu.STATUTS).toEqual({
        ACTIF: 'ACTIF',
        MAINTENANCE: 'MAINTENANCE',
        DEPRECIE: 'DEPRECIE',
        BETA: 'BETA'
      });
    });

    test('devrait avoir les systèmes supportés', () => {
      const expectedSystemes = [
        'monsterhearts',
        'engrenages', 
        'metro2033',
        'mistengine',
        'zombiology'
      ];
      expect(SystemeJeu.SYSTEMES_SUPPORTES).toEqual(expectedSystemes);
    });

    test('devrait avoir les types de documents', () => {
      const expectedTypes = [
        'CHARACTER',
        'TOWN',
        'GROUP', 
        'ORGANIZATION',
        'DANGER',
        'GENERIQUE'
      ];
      expect(SystemeJeu.TYPES_DOCUMENTS).toEqual(expectedTypes);
    });
  });

  describe('Validation Joi', () => {
    test('devrait valider des données correctes', () => {
      const validData = {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts',
        description: 'Un jeu sur l\'adolescence monstrueuse',
        site_officiel: 'https://example.com',
        version_supportee: '2.0',
        structure_donnees: {
          CHARACTER: {
            champs_requis: ['skin', 'hot'],
            template_pdf: 'monsterhearts_character'
          }
        },
        statut: 'ACTIF',
        ordre_affichage: 1,
        couleur_theme: '#8B0000',
        icone: 'fa-heart'
      };

      const schema = systemeJeu.getValidationSchema();
      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('devrait rejeter un ID système non supporté', () => {
      const invalidData = {
        id: 'systeme_inexistant',
        nom_complet: 'Système Test'
      };

      const schema = systemeJeu.getValidationSchema();
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toEqual(['id']);
    });

    test('devrait rejeter une couleur theme mal formatée', () => {
      const invalidData = {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts',
        couleur_theme: 'rouge' // Doit être #RRGGBB
      };

      const schema = systemeJeu.getValidationSchema();
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toEqual(['couleur_theme']);
    });

    test('devrait accepter une couleur theme valide', () => {
      const validData = {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts',
        couleur_theme: '#FF0000'
      };

      const schema = systemeJeu.getValidationSchema();
      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('devrait rejeter un statut invalide', () => {
      const invalidData = {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts',
        statut: 'STATUT_INEXISTANT'
      };

      const schema = systemeJeu.getValidationSchema();
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toEqual(['statut']);
    });

    test('devrait valider tous les statuts possibles', () => {
      const statuts = Object.values(SystemeJeu.STATUTS);
      
      statuts.forEach(statut => {
        const data = {
          id: 'monsterhearts',
          nom_complet: 'Monsterhearts',
          statut: statut
        };

        const schema = systemeJeu.getValidationSchema();
        const { error } = schema.validate(data);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Validation métier', () => {
    test('devrait valider une structure de données correcte', async () => {
      const validData = {
        structure_donnees: {
          CHARACTER: {
            champs_requis: ['nom'],
            template_pdf: 'default'
          },
          ORGANIZATION: {
            champs_requis: ['nom', 'type'],
            template_pdf: 'org_template'
          }
        }
      };

      const isValid = await systemeJeu.businessValidation(validData, 'create');
      expect(isValid).toBe(true);
    });

    test('devrait rejeter une structure avec type de document invalide', async () => {
      const invalidData = {
        structure_donnees: {
          TYPE_INEXISTANT: {
            champs_requis: ['nom']
          }
        }
      };

      await expect(systemeJeu.businessValidation(invalidData, 'create'))
        .rejects.toThrow('Type de document invalide dans structure_donnees: TYPE_INEXISTANT');
    });

    test('devrait exiger un message pour statut MAINTENANCE', async () => {
      const invalidData = {
        statut: SystemeJeu.STATUTS.MAINTENANCE,
        message_maintenance: ''
      };

      await expect(systemeJeu.businessValidation(invalidData, 'create'))
        .rejects.toThrow('Un message de maintenance est requis lorsque le système est en maintenance');
    });

    test('devrait accepter un statut MAINTENANCE avec message', async () => {
      const validData = {
        statut: SystemeJeu.STATUTS.MAINTENANCE,
        message_maintenance: 'Maintenance en cours'
      };

      const isValid = await systemeJeu.businessValidation(validData, 'create');
      expect(isValid).toBe(true);
    });
  });

  describe('Méthodes métier', () => {
    describe('getSystemesActifs', () => {
      test('devrait récupérer seulement les systèmes actifs', async () => {
        const mockSystemes = [
          { id: 'monsterhearts', statut: 'ACTIF' },
          { id: 'engrenages', statut: 'ACTIF' }
        ];

        systemeJeu.findAll = jest.fn().mockResolvedValue(mockSystemes);

        const result = await systemeJeu.getSystemesActifs();

        expect(systemeJeu.findAll).toHaveBeenCalledWith(
          'statut = $1',
          ['ACTIF'],
          'ordre_affichage ASC, nom_complet ASC'
        );
        expect(result).toEqual(mockSystemes);
      });
    });

    describe('mettreEnMaintenance', () => {
      test('devrait mettre un système en maintenance', async () => {
        const mockUpdate = jest.fn().mockResolvedValue({
          id: 'monsterhearts',
          statut: 'MAINTENANCE',
          message_maintenance: 'Maintenance programmée'
        });

        systemeJeu.update = mockUpdate;

        const result = await systemeJeu.mettreEnMaintenance('monsterhearts', 'Maintenance programmée');

        expect(mockUpdate).toHaveBeenCalledWith('monsterhearts', {
          statut: 'MAINTENANCE',
          message_maintenance: 'Maintenance programmée'
        });
        expect(result.statut).toBe('MAINTENANCE');
      });

      test('devrait rejeter si message vide', async () => {
        await expect(systemeJeu.mettreEnMaintenance('monsterhearts', ''))
          .rejects.toThrow('Un message de maintenance est requis');
      });
    });

    describe('sortirMaintenance', () => {
      test('devrait sortir un système de maintenance', async () => {
        const mockUpdate = jest.fn().mockResolvedValue({
          id: 'monsterhearts',
          statut: 'ACTIF',
          message_maintenance: ''
        });

        systemeJeu.update = mockUpdate;

        const result = await systemeJeu.sortirMaintenance('monsterhearts');

        expect(mockUpdate).toHaveBeenCalledWith('monsterhearts', {
          statut: 'ACTIF',
          message_maintenance: ''
        });
        expect(result.statut).toBe('ACTIF');
      });
    });

    describe('estDisponible', () => {
      test('devrait retourner true pour système actif', async () => {
        systemeJeu.findById = jest.fn().mockResolvedValue({
          id: 'monsterhearts',
          statut: 'ACTIF'
        });

        const result = await systemeJeu.estDisponible('monsterhearts');
        expect(result).toBe(true);
      });

      test('devrait retourner false pour système en maintenance', async () => {
        systemeJeu.findById = jest.fn().mockResolvedValue({
          id: 'monsterhearts',
          statut: 'MAINTENANCE'
        });

        const result = await systemeJeu.estDisponible('monsterhearts');
        expect(result).toBe(false);
      });

      test('devrait retourner false pour système inexistant', async () => {
        systemeJeu.findById = jest.fn().mockResolvedValue(null);

        const result = await systemeJeu.estDisponible('inexistant');
        expect(result).toBe(false);
      });
    });

    describe('getStructureDocument', () => {
      test('devrait récupérer la structure pour un type spécifique', async () => {
        const mockSysteme = {
          id: 'monsterhearts',
          structure_donnees: {
            CHARACTER: {
              champs_requis: ['skin', 'hot'],
              template_pdf: 'monsterhearts_character'
            },
            TOWN: {
              champs_requis: ['nom', 'description'],
              template_pdf: 'monsterhearts_town'
            }
          }
        };

        systemeJeu.findById = jest.fn().mockResolvedValue(mockSysteme);

        const result = await systemeJeu.getStructureDocument('monsterhearts', 'CHARACTER');

        expect(result).toEqual({
          champs_requis: ['skin', 'hot'],
          template_pdf: 'monsterhearts_character'
        });
      });

      test('devrait retourner null pour type inexistant', async () => {
        const mockSysteme = {
          id: 'monsterhearts',
          structure_donnees: {
            CHARACTER: { champs_requis: ['skin'] }
          }
        };

        systemeJeu.findById = jest.fn().mockResolvedValue(mockSysteme);

        const result = await systemeJeu.getStructureDocument('monsterhearts', 'TYPE_INEXISTANT');

        expect(result).toBeNull();
      });

      test('devrait retourner null pour système inexistant', async () => {
        systemeJeu.findById = jest.fn().mockResolvedValue(null);

        const result = await systemeJeu.getStructureDocument('inexistant', 'CHARACTER');

        expect(result).toBeNull();
      });
    });

    describe('mettreAJourStructure', () => {
      test('devrait mettre à jour la structure avec validation', async () => {
        const nouvelleStructure = {
          CHARACTER: {
            champs_requis: ['skin', 'hot', 'cold'],
            template_pdf: 'monsterhearts_v2'
          }
        };

        const mockUpdate = jest.fn().mockResolvedValue({
          id: 'monsterhearts',
          structure_donnees: nouvelleStructure
        });

        systemeJeu.update = mockUpdate;

        const result = await systemeJeu.mettreAJourStructure('monsterhearts', nouvelleStructure);

        expect(mockUpdate).toHaveBeenCalledWith('monsterhearts', expect.objectContaining({
          structure_donnees: nouvelleStructure,
          date_derniere_maj_structure: expect.any(String)
        }));
      });

      test('devrait rejeter structure avec type invalide', async () => {
        const structureInvalide = {
          TYPE_INVALIDE: {
            champs_requis: ['test']
          }
        };

        await expect(systemeJeu.mettreAJourStructure('monsterhearts', structureInvalide))
          .rejects.toThrow('Type de document invalide: TYPE_INVALIDE');
      });
    });
  });

  describe('Configuration par défaut', () => {
    test('devrait avoir une configuration par défaut valide', () => {
      const config = SystemeJeu.getConfigurationParDefaut();
      
      expect(config).toHaveProperty('structure_donnees');
      expect(config).toHaveProperty('statut', 'BETA');
      expect(config).toHaveProperty('ordre_affichage', 999);
      expect(config).toHaveProperty('couleur_theme', '#333333');
      expect(config).toHaveProperty('icone', 'fa-gamepad');

      // Vérifier que la structure contient les types de base
      expect(config.structure_donnees).toHaveProperty('CHARACTER');
      expect(config.structure_donnees).toHaveProperty('ORGANIZATION');
      expect(config.structure_donnees).toHaveProperty('GENERIQUE');
    });
  });

  describe('Hook beforeUpdate', () => {
    test('devrait mettre à jour date_derniere_maj_structure si structure_donnees modifiée', async () => {
      const data = {
        structure_donnees: { CHARACTER: { test: true } }
      };

      const result = await systemeJeu.beforeUpdate(data);

      expect(result.date_derniere_maj_structure).toBeDefined();
      expect(typeof result.date_derniere_maj_structure).toBe('string');
    });

    test('ne devrait pas modifier date_derniere_maj_structure si structure_donnees non modifiée', async () => {
      const data = {
        nom_complet: 'Nouveau nom'
      };

      const result = await systemeJeu.beforeUpdate(data);

      expect(result.date_derniere_maj_structure).toBeUndefined();
    });
  });
});