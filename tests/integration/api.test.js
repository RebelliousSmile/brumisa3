/**
 * Tests d'intégration API - Endpoints publics uniquement
 * 
 * Objectif : Tester les API endpoints qui ne nécessitent AUCUNE authentification
 * - Homepage API (données d'accueil)
 * - Donations API (informations de dons)
 * - Newsletter API (inscription newsletter)
 * - Testimonials API (soumission témoignages)
 * - Health Check API (statut système)
 * - Redirections (favicon)
 * 
 * Statut : ✅ 100% des tests passent (6/6 + 4 skipped)
 * Note : Tests d'élévation de rôles déplacés vers api-donations.test.js
 * Architecture : Utilise les principes SOLID avec injection de dépendances
 */

const request = require('supertest');
const path = require('path');
const BaseApiTest = require('../helpers/BaseApiTest');
const TestFactory = require('../helpers/TestFactory');

class PublicApiTest extends BaseApiTest {
    createTestContext() {
        return TestFactory.createPublicApiTestContext(this.config);
    }

    async customSetup() {
        // Pas besoin d'authentification pour les endpoints publics
        // Le contexte public est suffisant
    }
}

describe('API Integration Tests', () => {
    const testInstance = new PublicApiTest({
        timeout: 30000,
        cleanupUsers: false // Pas d'utilisateurs pour les tests publics
    });

    let setupData;

    beforeAll(async () => {
        setupData = await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

  describe('Homepage API', () => {
    test('GET /api/home/donnees should return homepage data', async () => {
      const response = await request(testInstance.getServer())
        .get('/api/home/donnees');

      testInstance.assertApiResponse(response, 200, true);
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
      const response = await request(testInstance.getServer())
        .get('/api/dons/infos');

      testInstance.assertApiResponse(response, 200, true);
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
      const response = await request(testInstance.getServer())
        .post('/api/newsletter/inscription')
        .send({
          email: 'test@example.com',
          nom: 'Test User'
        });

      testInstance.assertApiResponse(response, 200, true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('4 jeux de la plateforme');
    });
  });

  describe('Testimonials API', () => {
    test('POST /api/temoignages should handle testimonial submission', async () => {
      const response = await request(testInstance.getServer())
        .post('/api/temoignages')
        .send({
          nom: 'Test User',
          email: 'test@example.com',
          systeme_utilise: 'monsterhearts',
          note: 5,
          titre: 'Excellent outil',
          contenu: 'Très pratique pour créer des fiches'
        });

      testInstance.assertApiResponse(response, 200, true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('modéré');
    });
  });

  // Tests Role Elevation déplacés vers api-donations.test.js car liés au système de dons

  describe('Static Pages', () => {
    test.skip('GET / should return homepage', async () => {
      const response = await request(testInstance.getServer())
        .get('/')
        .expect(200);

      expect(response.text).toContain('brumisater');
      expect(response.text).toContain('EMBARK ON AN EXCITING');
    });

    test.skip('GET /mentions-legales should return legal page', async () => {
      const response = await request(testInstance.getServer())
        .get('/mentions-legales')
        .expect(200);

      expect(response.text).toContain('Mentions Légales');
      expect(response.text).toContain('brumisater');
    });

    test.skip('GET /cgu should return terms page', async () => {
      const response = await request(testInstance.getServer())
        .get('/cgu')
        .expect(200);

      expect(response.text).toContain('Conditions Générales');
      expect(response.text).toContain('brumisater');
    });
  });

  describe('Error Handling', () => {
    test.skip('GET /nonexistent should return 404', async () => {
      const response = await request(testInstance.getServer())
        .get('/nonexistent')
        .expect(404);

      expect(response.text).toContain('Page non trouvée');
      expect(response.text).toContain('brumisater');
    });
  });

  describe('Health Check', () => {
    test('GET /health should return system status', async () => {
      const response = await request(testInstance.getServer())
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
      const response = await request(testInstance.getServer())
        .get('/favicon.ico')
        .expect(301);

      expect(response.headers.location).toBe('/images/favicon.svg');
    });
  });
});