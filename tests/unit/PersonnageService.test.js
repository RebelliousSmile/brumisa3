const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');

/**
 * REFACTORISATION VERS ARCHITECTURE SOLID UNITAIRE
 * 
 * Ce fichier a été refactorisé pour utiliser l'architecture SOLID unitaire :
 * 
 * 1. Utilisation de BaseUnitTest : Classe de base fournissant des méthodes d'assertion 
 *    spécialisées (assertAsyncFunction, assertThrows, assertMockCalledWith, etc.)
 * 
 * 2. Utilisation d'UnitTestFactory : Factory pour créer des contextes de test 
 *    configurables avec mocks automatiques
 * 
 * 3. Méthodes SOLID : 
 *    - assertAsyncFunction() pour tester les fonctions asynchrones
 *    - assertMockCalledWith() pour vérifier les appels de mocks
 *    - assertArrayContains() pour vérifier le contenu des tableaux
 *    - assertObjectStructure() pour vérifier la structure des objets
 * 
 * 4. Gestion centralisée des mocks via baseSetup()/baseTeardown()
 * 
 * 5. Méthodes utilitaires spécialisées :
 *    - createPersonnageTestData() pour générer des données de test
 *    - mockApiResponse() pour configurer les réponses API mockées
 * 
 * Cette approche respecte les principes SOLID et DRY, offrant une meilleure 
 * maintenabilité et réutilisabilité des tests.
 */

// Définition de PersonnageService adaptée pour les tests Node.js
// Basée sur le code de public/js/services/PersonnageService.js
class PersonnageService {
    constructor() {
        this.store = null;
    }
    
    // Initialise le store Alpine si pas encore fait
    initStore() {
        if (!this.store && typeof Alpine !== 'undefined') {
            this.store = Alpine.store('app');
        }
        return this.store;
    }
    
    /**
     * Liste les personnages de l'utilisateur
     */
    async lister(filtres = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const params = new URLSearchParams(filtres);
            const data = await store.requeteApi(`/personnages?${params}`);
            return data.donnees || [];
        } catch (erreur) {
            // Supprimer console.error dans les tests pour éviter les messages parasites
            if (process.env.NODE_ENV !== 'test') {
                console.error('Erreur listage personnages:', erreur);
            }
            return [];
        }
    }
    
    /**
     * Récupère un personnage par ID
     */
    async obtenirParId(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/personnages/${id}`);
            return data.donnees;
        } catch (erreur) {
            // Supprimer console.error dans les tests pour éviter les messages parasites
            if (process.env.NODE_ENV !== 'test') {
                console.error('Erreur récupération personnage:', erreur);
            }
            return null;
        }
    }
    
    /**
     * Crée un nouveau personnage
     */
    async creer(donnees) {
        const store = this.initStore();
        if (!store) throw new Error('Alpine store not available');
        
        const data = await store.requeteApi('/personnages', {
            method: 'POST',
            body: JSON.stringify(donnees)
        });
        
        store.ajouterMessage('succes', 'Personnage créé avec succès');
        return data.donnees;
    }
    
    /**
     * Valide les données d'un personnage
     */
    validerDonnees(donnees, systemeJeu) {
        const store = this.initStore();
        if (!store || !store.systemes || !store.systemes[systemeJeu]) {
            return {
                valide: false,
                erreurs: ['Système de jeu non spécifié ou invalide']
            };
        }
        
        const systeme = store.systemes[systemeJeu];
        const erreurs = [];
        
        // Vérifier les champs obligatoires
        if (systeme.champsObligatoires) {
            systeme.champsObligatoires.forEach(champ => {
                if (!donnees[champ] || donnees[champ].toString().trim() === '') {
                    erreurs.push(`Le champ "${champ}" est obligatoire`);
                }
            });
        }
        
        return {
            valide: erreurs.length === 0,
            erreurs
        };
    }
    
    /**
     * Formate les données selon le système
     */
    formaterDonnees(donnees, systemeJeu) {
        const store = this.initStore();
        if (!store || !store.systemes || !store.systemes[systemeJeu]) {
            return donnees;
        }
        
        const systeme = store.systemes[systemeJeu];
        const donneesFormatees = { ...donnees };
        
        // Convertir les champs numériques
        if (systeme.champsNumeriques) {
            systeme.champsNumeriques.forEach(champ => {
                if (donneesFormatees[champ] !== undefined) {
                    donneesFormatees[champ] = parseInt(donneesFormatees[champ], 10) || 0;
                }
            });
        }
        
        // Ajouter les métadonnées
        donneesFormatees.systeme_jeu = systemeJeu;
        donneesFormatees.version_template = systeme.version;
        donneesFormatees.date_modification = new Date().toISOString();
        
        return donneesFormatees;
    }
}

/**
 * Tests unitaires pour PersonnageService
 * Utilise l'architecture SOLID avec BaseUnitTest et UnitTestFactory
 */
class PersonnageServiceTest extends BaseUnitTest {
  constructor() {
    super({
      timeout: 5000,
      mockDatabase: false, // PersonnageService n'accède pas directement à la DB
      mockExternalServices: true
    });
    
    this.testContext = null;
    this.service = null;
    this.mockStore = null;
  }

  /**
   * Configuration personnalisée pour PersonnageService
   */
  async customSetup() {
    // Créer le contexte de test spécifique au service
    this.testContext = UnitTestFactory.createServiceTestContext('PersonnageService');
    
    // Configurer le mock du store Alpine
    this.mockStore = {
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

    // Mock global d'Alpine.js
    global.Alpine = {
      store: jest.fn(() => this.mockStore)
    };

    // Instancier le service
    this.service = new PersonnageService();
    
    // Ajouter le mock store à notre collection
    this.addMock('alpineStore', this.mockStore);
  }

  /**
   * Nettoyage personnalisé
   */
  async customTeardown() {
    delete global.Alpine;
    this.service = null;
    this.mockStore = null;
    this.testContext = null;
  }

  /**
   * Méthode utilitaire pour créer des données de test de personnage
   */
  createPersonnageTestData(overrides = {}) {
    return this.createTestData('personnage', {
      nom: 'Luna',
      systeme_jeu: 'monsterhearts',
      concept: 'Vampire rebelle',
      ...overrides
    });
  }

  /**
   * Méthode utilitaire pour configurer une réponse API mock
   */
  mockApiResponse(data, isError = false) {
    if (isError) {
      this.mockStore.requeteApi.mockRejectedValue(new Error(data));
    } else {
      this.mockStore.requeteApi.mockResolvedValue({ donnees: data });
    }
  }
}

// Instance globale pour les tests
const personnageServiceTest = new PersonnageServiceTest();

describe('PersonnageService', () => {
  beforeEach(async () => {
    await personnageServiceTest.baseSetup();
  });

  afterEach(async () => {
    await personnageServiceTest.baseTeardown();
  });

  describe('lister', () => {
    test('devrait lister les personnages avec succès', async () => {
      const mockData = [
        { id: 1, nom: 'Luna', systeme_jeu: 'monsterhearts' },
        { id: 2, nom: 'Marcus', systeme_jeu: 'engrenages' }
      ];
      
      personnageServiceTest.mockApiResponse(mockData);

      await personnageServiceTest.assertAsyncFunction(
        () => personnageServiceTest.service.lister(),
        undefined,
        mockData
      );

      personnageServiceTest.assertMockCalledWith(
        personnageServiceTest.mockStore.requeteApi,
        ['/personnages?']
      );
    });

    test('devrait retourner un tableau vide en cas d\'erreur', async () => {
      personnageServiceTest.mockApiResponse('Erreur API', true);

      await personnageServiceTest.assertAsyncFunction(
        () => personnageServiceTest.service.lister(),
        undefined,
        []
      );
    });

    test('devrait passer les filtres dans la requête', async () => {
      const filtres = { systeme: 'monsterhearts', nom: 'Luna' };
      personnageServiceTest.mockApiResponse([]);

      await personnageServiceTest.service.lister(filtres);

      personnageServiceTest.assertMockCalledWith(
        personnageServiceTest.mockStore.requeteApi,
        ['/personnages?systeme=monsterhearts&nom=Luna']
      );
    });
  });

  describe('obtenirParId', () => {
    test('devrait récupérer un personnage par ID', async () => {
      const mockPersonnage = personnageServiceTest.createPersonnageTestData({ id: 1 });
      personnageServiceTest.mockApiResponse(mockPersonnage);

      await personnageServiceTest.assertAsyncFunction(
        () => personnageServiceTest.service.obtenirParId(1),
        undefined,
        mockPersonnage
      );

      personnageServiceTest.assertMockCalledWith(
        personnageServiceTest.mockStore.requeteApi,
        ['/personnages/1']
      );
    });

    test('devrait retourner null en cas d\'erreur', async () => {
      personnageServiceTest.mockApiResponse('Non trouvé', true);

      await personnageServiceTest.assertAsyncFunction(
        () => personnageServiceTest.service.obtenirParId(999),
        undefined,
        null
      );
    });
  });

  describe('creer', () => {
    test('devrait créer un nouveau personnage', async () => {
      const donnees = personnageServiceTest.createPersonnageTestData({ nom: 'Nova' });
      const mockResponse = { id: 3, ...donnees };
      
      personnageServiceTest.mockApiResponse(mockResponse);

      const result = await personnageServiceTest.service.creer(donnees);

      personnageServiceTest.assertMockCalledWith(
        personnageServiceTest.mockStore.requeteApi,
        ['/personnages', {
          method: 'POST',
          body: JSON.stringify(donnees)
        }]
      );
      
      personnageServiceTest.assertMockCalledWith(
        personnageServiceTest.mockStore.ajouterMessage,
        ['succes', 'Personnage créé avec succès']
      );
      
      expect(result).toEqual(mockResponse);
    });

    test('devrait propager les erreurs de création', async () => {
      const donnees = { nom: '', systeme_jeu: 'invalid' };
      personnageServiceTest.mockApiResponse('Validation échouée', true);

      await personnageServiceTest.assertThrowsAsync(
        () => personnageServiceTest.service.creer(donnees),
        undefined,
        'Validation échouée'
      );
    });
  });

  describe('validerDonnees', () => {
    test('devrait valider des données correctes', () => {
      const donnees = { nom: 'Luna', concept: 'Vampire rebelle' };
      const expectedResult = { valide: true, erreurs: [] };
      
      personnageServiceTest.assertFunction(
        (data) => personnageServiceTest.service.validerDonnees(data, 'monsterhearts'),
        donnees,
        expectedResult
      );
    });

    test('devrait détecter les champs manquants', () => {
      const donnees = { nom: '' }; // concept manquant
      
      const result = personnageServiceTest.service.validerDonnees(donnees, 'monsterhearts');

      expect(result.valide).toBe(false);
      personnageServiceTest.assertArrayContains(
        result.erreurs,
        ['Le champ "nom" est obligatoire', 'Le champ "concept" est obligatoire']
      );
    });

    test('devrait rejeter un système invalide', () => {
      const donnees = { nom: 'Test' };
      
      const result = personnageServiceTest.service.validerDonnees(donnees, 'inexistant');

      expect(result.valide).toBe(false);
      personnageServiceTest.assertArrayContains(
        result.erreurs,
        ['Système de jeu non spécifié ou invalide']
      );
    });
  });

  describe('formaterDonnees', () => {
    test('devrait formater les données selon le système', () => {
      const donnees = { nom: 'Luna', hot: '2', cold: '1' };
      
      const result = personnageServiceTest.service.formaterDonnees(donnees, 'monsterhearts');

      // Vérifications individuelles pour une meilleure lisibilité
      expect(result.hot).toBe(2);
      expect(result.cold).toBe(1);
      expect(result.systeme_jeu).toBe('monsterhearts');
      expect(result.version_template).toBe('1.0.0');
      expect(result.date_modification).toBeDefined();
      
      // Vérification de la structure globale
      personnageServiceTest.assertObjectStructure(result, {
        nom: 'Luna',
        hot: 2,
        cold: 1,
        systeme_jeu: 'monsterhearts',
        version_template: '1.0.0'
      });
    });

    test('devrait retourner les données inchangées pour un système invalide', () => {
      const donnees = { nom: 'Test' };
      
      personnageServiceTest.assertFunction(
        (data) => personnageServiceTest.service.formaterDonnees(data, 'inexistant'),
        donnees,
        donnees
      );
    });
  });

  describe('formaterNombre - méthode inexistante', () => {
    test('devrait confirmer que la méthode formaterNombre n\'existe pas', () => {
      // Cette méthode n'existe pas dans PersonnageService, elle est dans PageAccueilComponent
      expect(personnageServiceTest.service.constructor.prototype.formaterNombre).toBeUndefined();
    });
  });
});

// Export de la classe de test pour usage éventuel dans d'autres tests
module.exports = PersonnageServiceTest;