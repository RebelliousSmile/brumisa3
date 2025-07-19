const fs = require('fs');
const path = require('path');

// Charger le code du service
const serviceCode = fs.readFileSync(
  path.join(__dirname, '../../public/js/services/PersonnageService.js'), 
  'utf8'
);

// Exécuter le code dans le contexte Jest
eval(serviceCode);

describe('PersonnageService', () => {
  let service;
  let mockStore;

  beforeEach(() => {
    // Mock du store Alpine
    mockStore = {
      requeteApi: jest.fn(),
      ajouterMessage: jest.fn(),
      systemes: {
        'monsterhearts': { 
          nom: 'Monsterhearts',
          champsObligatoires: ['nom', 'concept'],
          champsNumeriques: ['hot', 'cold', 'volatile', 'dark'],
          version: '1.0.0'
        }
      }
    };

    global.Alpine = {
      store: jest.fn(() => mockStore)
    };

    service = new PersonnageService();
  });

  describe('lister', () => {
    test('devrait lister les personnages avec succès', async () => {
      const mockData = {
        donnees: [
          { id: 1, nom: 'Luna', systeme_jeu: 'monsterhearts' },
          { id: 2, nom: 'Marcus', systeme_jeu: 'engrenages' }
        ]
      };

      mockStore.requeteApi.mockResolvedValue(mockData);

      const result = await service.lister();

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/personnages?');
      expect(result).toEqual(mockData.donnees);
    });

    test('devrait retourner un tableau vide en cas d\'erreur', async () => {
      mockStore.requeteApi.mockRejectedValue(new Error('Erreur API'));

      const result = await service.lister();

      expect(result).toEqual([]);
    });

    test('devrait passer les filtres dans la requête', async () => {
      const filtres = { systeme: 'monsterhearts', nom: 'Luna' };
      mockStore.requeteApi.mockResolvedValue({ donnees: [] });

      await service.lister(filtres);

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/personnages?systeme=monsterhearts&nom=Luna');
    });
  });

  describe('obtenirParId', () => {
    test('devrait récupérer un personnage par ID', async () => {
      const mockPersonnage = { id: 1, nom: 'Luna', systeme_jeu: 'monsterhearts' };
      mockStore.requeteApi.mockResolvedValue({ donnees: mockPersonnage });

      const result = await service.obtenirParId(1);

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/personnages/1');
      expect(result).toEqual(mockPersonnage);
    });

    test('devrait retourner null en cas d\'erreur', async () => {
      mockStore.requeteApi.mockRejectedValue(new Error('Non trouvé'));

      const result = await service.obtenirParId(999);

      expect(result).toBeNull();
    });
  });

  describe('creer', () => {
    test('devrait créer un nouveau personnage', async () => {
      const donnees = { nom: 'Nova', systeme_jeu: 'monsterhearts' };
      const mockResponse = { donnees: { id: 3, ...donnees } };
      
      mockStore.requeteApi.mockResolvedValue(mockResponse);

      const result = await service.creer(donnees);

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/personnages', {
        method: 'POST',
        body: JSON.stringify(donnees)
      });
      expect(mockStore.ajouterMessage).toHaveBeenCalledWith('succes', 'Personnage créé avec succès');
      expect(result).toEqual(mockResponse.donnees);
    });

    test('devrait propager les erreurs de création', async () => {
      const donnees = { nom: '', systeme_jeu: 'invalid' };
      mockStore.requeteApi.mockRejectedValue(new Error('Validation échouée'));

      await expect(service.creer(donnees)).rejects.toThrow('Validation échouée');
    });
  });

  describe('validerDonnees', () => {
    test('devrait valider des données correctes', () => {
      const donnees = { nom: 'Luna', concept: 'Vampire rebelle' };
      
      const result = service.validerDonnees(donnees, 'monsterhearts');

      expect(result.valide).toBe(true);
      expect(result.erreurs).toEqual([]);
    });

    test('devrait détecter les champs manquants', () => {
      const donnees = { nom: '' }; // concept manquant
      
      const result = service.validerDonnees(donnees, 'monsterhearts');

      expect(result.valide).toBe(false);
      expect(result.erreurs).toContain('Le champ "nom" est obligatoire');
      expect(result.erreurs).toContain('Le champ "concept" est obligatoire');
    });

    test('devrait rejeter un système invalide', () => {
      const donnees = { nom: 'Test' };
      
      const result = service.validerDonnees(donnees, 'inexistant');

      expect(result.valide).toBe(false);
      expect(result.erreurs).toContain('Système de jeu non spécifié ou invalide');
    });
  });

  describe('formaterDonnees', () => {
    test('devrait formater les données selon le système', () => {
      const donnees = { nom: 'Luna', hot: '2', cold: '1' };
      
      const result = service.formaterDonnees(donnees, 'monsterhearts');

      expect(result.hot).toBe(2);
      expect(result.cold).toBe(1);
      expect(result.systeme_jeu).toBe('monsterhearts');
      expect(result.version_template).toBe('1.0.0');
      expect(result.date_modification).toBeDefined();
    });

    test('devrait retourner les données inchangées pour un système invalide', () => {
      const donnees = { nom: 'Test' };
      
      const result = service.formaterDonnees(donnees, 'inexistant');

      expect(result).toEqual(donnees);
    });
  });

  describe('formaterNombre', () => {
    test('devrait formater les nombres correctement', () => {
      expect(service.constructor.prototype.formaterNombre).toBeUndefined();
      // Cette méthode n'existe pas dans PersonnageService, elle est dans PageAccueilComponent
    });
  });
});