const fs = require('fs');
const path = require('path');

// Charger le code du composant
const componentCode = fs.readFileSync(
  path.join(__dirname, '../../public/js/components/PageAccueilComponent.js'), 
  'utf8'
);

describe('PageAccueilComponent', () => {
  let component;
  let mockStore;

  beforeEach(() => {
    // Mock du store Alpine
    mockStore = {
      requeteApi: jest.fn(),
      ajouterMessage: jest.fn()
    };

    global.Alpine = {
      store: jest.fn(() => mockStore)
    };

    // Mock window.AlpineComponents
    global.window = global.window || {};
    global.window.AlpineComponents = {};

    // Exécuter le code du composant
    eval(componentCode);

    // Créer une instance du composant
    component = window.AlpineComponents.pageAccueil();
  });

  describe('initialisation', () => {
    test('devrait avoir les propriétés initiales correctes', () => {
      expect(component.pdfsRecents).toEqual([]);
      expect(component.actualites).toEqual([]);
      expect(component.temoignages).toEqual([]);
      expect(component.emailNewsletter).toBe('');
      expect(component.nomNewsletter).toBe('');
      expect(component.newsletterInscrit).toBe(false);
    });
  });

  describe('chargerDonneesAccueil', () => {
    test('devrait charger les données avec succès', async () => {
      const mockData = {
        succes: true,
        donnees: {
          pdfs_recents: [{ id: 1, nom: 'Test PDF' }],
          actualites: [{ id: 1, titre: 'Test News' }],
          temoignages: [{ id: 1, nom: 'Test User' }],
          statistiques: { nb_utilisateurs_inscrits: 1247 }
        }
      };

      mockStore.requeteApi.mockResolvedValue(mockData);

      await component.chargerDonneesAccueil();

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/home/donnees');
      expect(component.pdfsRecents).toEqual(mockData.donnees.pdfs_recents);
      expect(component.actualites).toEqual(mockData.donnees.actualites);
      expect(component.temoignages).toEqual(mockData.donnees.temoignages);
      expect(component.statistiques).toEqual(mockData.donnees.statistiques);
    });

    test('devrait gérer les erreurs de chargement', async () => {
      mockStore.requeteApi.mockRejectedValue(new Error('Erreur API'));

      await component.chargerDonneesAccueil();

      expect(mockStore.ajouterMessage).toHaveBeenCalledWith(
        'erreur', 
        'Impossible de charger les données de la page'
      );
    });
  });

  describe('inscrireNewsletter', () => {
    beforeEach(() => {
      component.emailNewsletter = 'test@example.com';
      component.nomNewsletter = 'Test User';
    });

    test('devrait inscrire à la newsletter avec succès', async () => {
      const mockResponse = {
        succes: true,
        message: 'Inscription réussie'
      };

      mockStore.requeteApi.mockResolvedValue(mockResponse);

      await component.inscrireNewsletter();

      expect(mockStore.requeteApi).toHaveBeenCalledWith('/newsletter/inscription', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          nom: 'Test User'
        })
      });

      expect(component.newsletterInscrit).toBe(true);
      expect(component.emailNewsletter).toBe('');
      expect(component.nomNewsletter).toBe('');
      expect(mockStore.ajouterMessage).toHaveBeenCalledWith('succes', 'Inscription réussie');
    });

    test('ne devrait pas permettre une double inscription simultanée', async () => {
      component.chargementNewsletter = true;

      await component.inscrireNewsletter();

      expect(mockStore.requeteApi).not.toHaveBeenCalled();
    });

    test('devrait gérer les erreurs d\'inscription', async () => {
      mockStore.requeteApi.mockRejectedValue(new Error('Erreur inscription'));

      await component.inscrireNewsletter();

      expect(mockStore.ajouterMessage).toHaveBeenCalledWith(
        'erreur', 
        'Erreur lors de l\'inscription à la newsletter'
      );
      expect(component.chargementNewsletter).toBe(false);
    });
  });

  describe('formaterNombre', () => {
    test('devrait formater les grands nombres avec K', () => {
      expect(component.formaterNombre(1247)).toBe('1K');
      expect(component.formaterNombre(8932)).toBe('9K');
      expect(component.formaterNombre(3456)).toBe('3K');
    });

    test('devrait formater les très grands nombres avec M', () => {
      expect(component.formaterNombre(1500000)).toBe('1.5M');
      expect(component.formaterNombre(2000000)).toBe('2.0M');
    });

    test('devrait retourner le nombre tel quel pour les petits nombres', () => {
      expect(component.formaterNombre(999)).toBe('999');
      expect(component.formaterNombre(500)).toBe('500');
      expect(component.formaterNombre(0)).toBe('0');
    });

    test('devrait gérer les valeurs nulles ou undefined', () => {
      expect(component.formaterNombre(null)).toBe('0');
      expect(component.formaterNombre(undefined)).toBe('0');
      expect(component.formaterNombre('')).toBe('0');
    });
  });

  describe('formaterDate', () => {
    test('devrait formater une date en français', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const result = component.formaterDate(date);
      
      expect(result).toMatch(/15 janvier 2024/);
    });
  });

  describe('formaterTailleFichier', () => {
    test('devrait formater les tailles de fichier', () => {
      expect(component.formaterTailleFichier(1024)).toBe('1 Ko');
      expect(component.formaterTailleFichier(1048576)).toBe('1 Mo');
      expect(component.formaterTailleFichier(500)).toBe('500 o');
      expect(component.formaterTailleFichier(null)).toBe('N/A');
    });
  });

  describe('genererEtoiles', () => {
    test('devrait générer des étoiles pour une note', () => {
      expect(component.genererEtoiles(5)).toBe('★★★★★');
      expect(component.genererEtoiles(3)).toBe('★★★☆☆');
      expect(component.genererEtoiles(0)).toBe('☆☆☆☆☆');
    });
  });

  describe('partagerPdf', () => {
    const mockPdf = {
      id: 'test-id',
      personnage_nom: 'Luna',
      systeme_jeu: 'monsterhearts'
    };

    test('devrait utiliser l\'API Web Share si disponible', () => {
      const mockShare = jest.fn();
      global.navigator.share = mockShare;

      component.partagerPdf(mockPdf);

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Fiche Luna - monsterhearts',
        text: 'Découvrez cette fiche de personnage créée avec brumisa3.fr',
        url: 'http://localhost:3076/pdfs/test-id'
      });
    });

    test('devrait utiliser le clipboard en fallback', () => {
      global.navigator.share = undefined;
      const mockWriteText = jest.fn().mockResolvedValue();
      global.navigator.clipboard.writeText = mockWriteText;

      component.partagerPdf(mockPdf);

      expect(mockWriteText).toHaveBeenCalledWith('http://localhost:3076/pdfs/test-id');
    });
  });
});