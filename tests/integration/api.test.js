const request = require('supertest');
const path = require('path');

// Importer l'application
const app = require('../../src/app');

describe('API Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Initialiser l'app pour les tests
    await app.initialize();
    server = app.instance;
  });

  afterAll(async () => {
    // Nettoyer après les tests
    if (app.server) {
      await app.shutdown();
    }
  });

  describe('Homepage API', () => {
    test('GET /api/home/donnees should return homepage data', async () => {
      const response = await request(server)
        .get('/api/home/donnees')
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body).toHaveProperty('donnees');
      
      const { donnees } = response.body;
      expect(donnees).toHaveProperty('pdfs_recents');
      expect(donnees).toHaveProperty('actualites');
      expect(donnees).toHaveProperty('temoignages');
      expect(donnees).toHaveProperty('statistiques');
      
      // Vérifier les nouvelles statistiques
      expect(donnees.statistiques).toHaveProperty('nb_utilisateurs_inscrits');
      expect(donnees.statistiques).toHaveProperty('nb_contenus_ouverts_mois');
      expect(donnees.statistiques).toHaveProperty('nb_pdfs_stockes');
      
      expect(typeof donnees.statistiques.nb_utilisateurs_inscrits).toBe('number');
      expect(typeof donnees.statistiques.nb_contenus_ouverts_mois).toBe('number');
      expect(typeof donnees.statistiques.nb_pdfs_stockes).toBe('number');
    });
  });

  describe('Donations API', () => {
    test('GET /api/dons/infos should return donation information', async () => {
      const response = await request(server)
        .get('/api/dons/infos')
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body).toHaveProperty('donnees');
      
      const { donnees } = response.body;
      expect(donnees).toHaveProperty('message');
      expect(donnees).toHaveProperty('plateforme');
      expect(donnees).toHaveProperty('url_don');
      expect(donnees).toHaveProperty('objectifs');
      
      expect(Array.isArray(donnees.objectifs)).toBe(true);
      expect(donnees.url_don).toContain('brumisa3');
    });
  });

  describe('Newsletter API', () => {
    test('POST /api/newsletter/inscription should handle newsletter signup', async () => {
      const response = await request(server)
        .post('/api/newsletter/inscription')
        .send({
          email: 'test@example.com',
          nom: 'Test User'
        })
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('4 jeux de la plateforme');
    });
  });

  describe('Testimonials API', () => {
    test('POST /api/temoignages should handle testimonial submission', async () => {
      const response = await request(server)
        .post('/api/temoignages')
        .send({
          nom: 'Test User',
          email: 'test@example.com',
          systeme_utilise: 'monsterhearts',
          note: 5,
          titre: 'Excellent outil',
          contenu: 'Très pratique pour créer des fiches'
        })
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('modéré');
    });
  });

  describe('Role Elevation API', () => {
    test('POST /api/auth/elevation-role should handle premium code', async () => {
      const response = await request(server)
        .post('/api/auth/elevation-role')
        .send({ code: '123456' })
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body.message).toContain('Premium');
    });

    test('POST /api/auth/elevation-role should handle admin code', async () => {
      const response = await request(server)
        .post('/api/auth/elevation-role')
        .send({ code: '789012' })
        .expect(200);

      expect(response.body).toHaveProperty('succes', true);
      expect(response.body.message).toContain('Admin');
    });

    test('POST /api/auth/elevation-role should reject invalid code', async () => {
      const response = await request(server)
        .post('/api/auth/elevation-role')
        .send({ code: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('succes', false);
      expect(response.body.message).toContain('incorrect');
    });
  });

  describe('Static Pages', () => {
    test('GET / should return homepage', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.text).toContain('brumisater');
      expect(response.text).toContain('EMBARK ON AN EXCITING');
    });

    test('GET /mentions-legales should return legal page', async () => {
      const response = await request(server)
        .get('/mentions-legales')
        .expect(200);

      expect(response.text).toContain('Mentions Légales');
      expect(response.text).toContain('brumisater');
    });

    test('GET /cgu should return terms page', async () => {
      const response = await request(server)
        .get('/cgu')
        .expect(200);

      expect(response.text).toContain('Conditions Générales');
      expect(response.text).toContain('brumisater');
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent should return 404', async () => {
      const response = await request(server)
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Page non trouvée');
      expect(response.text).toContain('brumisater');
    });
  });

  describe('Health Check', () => {
    test('GET /health should return system status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Favicon', () => {
    test('GET /favicon.ico should redirect to SVG', async () => {
      const response = await request(server)
        .get('/favicon.ico')
        .expect(301);

      expect(response.headers.location).toBe('/images/favicon.svg');
    });
  });
});