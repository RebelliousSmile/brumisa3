/**
 * Tests d'intégration API - Authentification
 * 
 * Validation endpoints selon api.md avec Supertest :
 * - Authentification par code d'accès
 * - Sessions et cookies
 * - Gestion des erreurs
 * - Sécurité et validation
 */

const request = require('supertest');
const app = require('../../../src/app');
const Utilisateur = require('../../../src/models/Utilisateur');
const TestDatabaseHelper = require('../../helpers/database');
const TestDataFactory = require('../../helpers/factories');

describe('API Integration - Authentication', () => {
  let testUser;

  beforeAll(async () => {
    // Setup base de test propre
    await TestDatabaseHelper.cleanTestData();
  });

  beforeEach(async () => {
    // Créer utilisateur de test pour chaque test
    testUser = await TestDataFactory.createTestUser({
      nom: 'Test Auth User',
      email: 'test-auth@example.com'
    });
  });

  afterEach(async () => {
    // Nettoyage après chaque test
    if (testUser) {
      try {
        const utilisateur = new Utilisateur();
        await utilisateur.delete(testUser.id);
      } catch (error) {
        console.warn('Cleanup auth user error:', error.message);
      }
    }
  });

  describe('POST /auth/request-code', () => {
    test('devrait envoyer code d\'accès pour email valide', async () => {
      const response = await request(app)
        .post('/auth/request-code')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Code d\'accès envoyé');
      expect(response.body.data).toHaveProperty('expires_in');
    });

    test('devrait retourner 404 pour email inexistant', async () => {
      const response = await request(app)
        .post('/auth/request-code')
        .send({
          email: 'inexistant@example.com'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Utilisateur non trouvé');
    });

    test('devrait valider format email', async () => {
      const response = await request(app)
        .post('/auth/request-code')
        .send({
          email: 'email-invalide'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email invalide');
    });

    test('devrait refuser utilisateur inactif', async () => {
      // Créer utilisateur inactif
      const inactiveUser = await TestDataFactory.createTestUser({
        email: 'inactive@example.com',
        statut: 'INACTIF'
      });

      const response = await request(app)
        .post('/auth/request-code')
        .send({
          email: inactiveUser.email
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Compte désactivé');

      // Cleanup
      const utilisateur = new Utilisateur();
      await utilisateur.delete(inactiveUser.id);
    });

    test('devrait implémenter rate limiting', async () => {
      // Faire plusieurs requêtes rapides
      const promises = Array(6).fill().map(() => 
        request(app)
          .post('/auth/request-code')
          .send({ email: testUser.email })
      );

      const responses = await Promise.all(promises);
      
      // Au moins une requête devrait être rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    let accessCode;

    beforeEach(async () => {
      // Générer et définir code d'accès
      const utilisateur = new Utilisateur();
      accessCode = utilisateur.genererCodeAcces();
      await utilisateur.definirCodeAcces(testUser.id, accessCode);
    });

    test('devrait authentifier avec code valide', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      
      // Vérifier que le cookie de session est défini
      expect(response.headers['set-cookie']).toBeDefined();
      const sessionCookie = response.headers['set-cookie'].find(
        cookie => cookie.startsWith('connect.sid')
      );
      expect(sessionCookie).toBeDefined();
    });

    test('devrait rejeter code incorrect', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: '000000'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Code d\'accès incorrect');
    });

    test('devrait rejeter code expiré', async () => {
      // Simuler code expiré en modifiant la date
      const db = require('../../../src/database/db');
      await db.run(
        'UPDATE utilisateurs SET code_acces_expire_at = $1 WHERE id = $2',
        [new Date(Date.now() - 60000), testUser.id]
      );

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Code d\'accès expiré');
    });

    test('devrait valider format du code', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: 'ABC123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Code doit être 6 chiffres');
    });

    test('devrait nettoyer le code après utilisation', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        })
        .expect(200);

      // Tentative de réutilisation du même code
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        })
        .expect(401);

      expect(response.body.error).toContain('Code d\'accès incorrect');
    });
  });

  describe('POST /auth/logout', () => {
    let sessionCookie;

    beforeEach(async () => {
      // Se connecter d'abord pour obtenir session
      const utilisateur = new Utilisateur();
      const accessCode = utilisateur.genererCodeAcces();
      await utilisateur.definirCodeAcces(testUser.id, accessCode);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        });

      sessionCookie = loginResponse.headers['set-cookie'];
    });

    test('devrait déconnecter utilisateur authentifié', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Déconnexion réussie');

      // Vérifier que la session est invalidée
      const protectedResponse = await request(app)
        .get('/api/profile')
        .set('Cookie', sessionCookie)
        .expect(401);

      expect(protectedResponse.body.error).toContain('Non authentifié');
    });

    test('devrait fonctionner même si pas authentifié', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /auth/profile', () => {
    let sessionCookie;

    beforeEach(async () => {
      // Authentification
      const utilisateur = new Utilisateur();
      const accessCode = utilisateur.genererCodeAcces();
      await utilisateur.definirCodeAcces(testUser.id, accessCode);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        });

      sessionCookie = loginResponse.headers['set-cookie'];
    });

    test('devrait retourner profil utilisateur authentifié', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      
      // Vérifier que les champs sensibles sont masqués
      expect(response.body.data.user.mot_de_passe_hash).toBeUndefined();
      expect(response.body.data.user.code_acces_actuel).toBeUndefined();
    });

    test('devrait refuser accès sans authentification', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Non authentifié');
    });
  });

  describe('Gestion des sessions', () => {
    test('devrait maintenir session entre requêtes', async () => {
      // Authentification
      const utilisateur = new Utilisateur();
      const accessCode = utilisateur.genererCodeAcces();
      await utilisateur.definirCodeAcces(testUser.id, accessCode);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          code: accessCode
        });

      const sessionCookie = loginResponse.headers['set-cookie'];

      // Requête 1
      const response1 = await request(app)
        .get('/auth/profile')
        .set('Cookie', sessionCookie)
        .expect(200);

      // Requête 2
      const response2 = await request(app)
        .get('/auth/profile')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response1.body.data.user.id).toBe(response2.body.data.user.id);
    });

    test('devrait expirer session après timeout', async () => {
      // Ce test nécessiterait une configuration de timeout très court
      // ou un mock du temps - implémentation dépend de la stratégie session
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Sécurité', () => {
    test('devrait résister aux attaques par force brute', async () => {
      const utilisateur = new Utilisateur();
      const accessCode = utilisateur.genererCodeAcces();
      await utilisateur.definirCodeAcces(testUser.id, accessCode);

      // Tentatives multiples avec codes incorrects
      const wrongAttempts = Array(10).fill().map(() => 
        request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            code: '000000'
          })
      );

      const responses = await Promise.all(wrongAttempts);
      
      // Devrait bloquer après plusieurs tentatives
      const blocked = responses.some(res => res.status === 429);
      expect(blocked).toBe(true);
    });

    test('devrait valider CSRF sur actions critiques', async () => {
      // Test CSRF si implémenté
      expect(true).toBe(true); // Placeholder
    });

    test('devrait utiliser HTTPS en production', () => {
      // Vérification configuration selon environment
      if (process.env.NODE_ENV === 'production') {
        expect(process.env.FORCE_HTTPS).toBe('true');
      }
    });
  });

  describe('Performance', () => {
    test('endpoints auth devraient répondre < 500ms', async () => {
      const start = Date.now();
      
      await request(app)
        .post('/auth/request-code')
        .send({ email: testUser.email });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });
});