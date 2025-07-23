/**
 * Tests d'intégration API - Authentification
 * 
 * Objectif : Tester tous les endpoints d'authentification et de gestion de compte
 * - Inscription utilisateur (validation, erreurs)
 * - Connexion/déconnexion
 * - Gestion de profil utilisateur
 * - Récupération de mot de passe
 * - Statut de session
 * - Élévation de rôles (Premium/Admin)
 * 
 * Couverture : 19 tests d'authentification complets avec gestion des sessions
 * Architecture : Utilise les principes SOLID avec injection de dépendances
 */

const request = require('supertest');
const BaseApiTest = require('../helpers/BaseApiTest');
const TestFactory = require('../helpers/TestFactory');

class AuthApiTest extends BaseApiTest {
    createTestContext() {
        return TestFactory.createAuthTestContext(this.config);
    }

    async customSetup() {
        // Configuration spécifique aux tests d'authentification
        this.primaryTestUser = this.createTestUser();
        
        // Enregistrer l'utilisateur principal pour les tests de connexion
        await this.getAuthHelper().registerUser(this.getServer(), this.primaryTestUser);
    }
}

describe('API Authentification', () => {
    const testInstance = new AuthApiTest({
        timeout: 30000,
        cleanupUsers: true
    });
    
    let setupData;

    beforeAll(async () => {
        setupData = await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

    describe('POST /api/auth/inscription', () => {
        test('doit créer un nouveau compte utilisateur', async () => {
            const testUser = testInstance.createTestUser();
            const response = await request(testInstance.getServer())
                .post('/api/auth/inscription')
                .send(testUser);

            testInstance.assertApiResponse(response, 201, true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testUser.nom,
                email: testUser.email,
                role: 'UTILISATEUR'
            });
            expect(response.body.donnees.utilisateur).not.toHaveProperty('mot_de_passe');
        });

        test('doit refuser inscription avec email invalide', async () => {
            const testUser = testInstance.createTestUser({ email: 'email-invalide' });
            const response = await request(testInstance.getServer())
                .post('/api/auth/inscription')
                .send(testUser);

            testInstance.assertValidationError(response);
            expect(response.body.message).toContain('Format email invalide');
        });

        test('doit refuser inscription avec mot de passe trop court', async () => {
            const testUser = testInstance.createTestUser({ motDePasse: '123' });
            const response = await request(testInstance.getServer())
                .post('/api/auth/inscription')
                .send(testUser);

            testInstance.assertValidationError(response, 'motDePasse');
            expect(response.body.message).toContain('8 caractères');
        });

        test('doit refuser inscription avec email déjà existant', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/inscription')
                .send(testInstance.primaryTestUser);

            testInstance.assertApiResponse(response, 409, false);
            expect(response.body.message).toContain('existe déjà');
        });
    });

    describe('POST /api/auth/connexion', () => {
        test('doit connecter un utilisateur valide', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/connexion')
                .send({
                    email: testInstance.primaryTestUser.email,
                    motDePasse: testInstance.primaryTestUser.motDePasse
                });

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testInstance.primaryTestUser.nom,
                email: testInstance.primaryTestUser.email,
                role: 'UTILISATEUR'
            });
        });

        test('doit refuser connexion avec email invalide', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/connexion')
                .send({
                    email: 'inexistant@example.com',
                    motDePasse: testInstance.primaryTestUser.motDePasse
                });

            testInstance.assertAuthenticationRequired(response);
            expect(response.body.message).toContain('incorrect');
        });

        test('doit refuser connexion avec mot de passe invalide', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/connexion')
                .send({
                    email: testInstance.primaryTestUser.email,
                    motDePasse: 'mauvais-mot-de-passe'
                });

            testInstance.assertAuthenticationRequired(response);
            expect(response.body.message).toContain('incorrect');
        });
    });

    describe('GET /api/auth/statut', () => {
        let agent;

        beforeEach(async () => {
            agent = await testInstance.getAuthHelper().loginUser(
                testInstance.getServer(),
                testInstance.primaryTestUser
            );
        });

        test('doit retourner le statut de session valide', async () => {
            const response = await agent
                .get('/api/auth/statut');

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testInstance.primaryTestUser.nom,
                email: testInstance.primaryTestUser.email,
                role: 'UTILISATEUR'
            });
        });

        test('doit refuser accès sans session', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/auth/statut');

            testInstance.assertAuthenticationRequired(response);
        });
    });

    describe('GET /api/auth/profil', () => {
        let agent;

        beforeEach(async () => {
            agent = await testInstance.getAuthHelper().loginUser(
                testInstance.getServer(),
                testInstance.primaryTestUser
            );
        });

        test('doit retourner le profil utilisateur', async () => {
            const response = await agent
                .get('/api/auth/profil');

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toMatchObject({
                nom: testInstance.primaryTestUser.nom,
                email: testInstance.primaryTestUser.email,
                role: 'UTILISATEUR'
            });
            expect(response.body.donnees).toHaveProperty('date_creation');
            expect(response.body.donnees).not.toHaveProperty('mot_de_passe');
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/auth/profil');

            testInstance.assertAuthenticationRequired(response);
        });
    });

    describe('PUT /api/auth/profil', () => {
        let agent;

        beforeEach(async () => {
            agent = await testInstance.getAuthHelper().loginUser(
                testInstance.getServer(),
                testInstance.primaryTestUser
            );
        });

        test('doit mettre à jour le nom utilisateur', async () => {
            const nouveauNom = 'Nouveau Nom Test';
            const response = await agent
                .put('/api/auth/profil')
                .send({ nom: nouveauNom });

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees.nom).toBe(nouveauNom);
        });

        test('doit refuser nom trop court', async () => {
            const response = await agent
                .put('/api/auth/profil')
                .send({ nom: 'A' });

            testInstance.assertValidationError(response, 'nom');
            expect(response.body.message).toContain('2 caractères');
        });
    });

    describe('POST /api/auth/mot-de-passe-oublie', () => {
        test('doit accepter demande récupération mot de passe', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testInstance.primaryTestUser.email });

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.message).toContain('lien de récupération');
        });

        test('doit accepter même pour email inexistant (sécurité)', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: 'inexistant@example.com' });

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.message).toContain('lien de récupération');
        });

        test('doit refuser format email invalide', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: 'email-invalide' });

            testInstance.assertValidationError(response, 'email');
            expect(response.body.message).toContain('Format email invalide');
        });
    });

    describe('POST /api/auth/deconnexion', () => {
        let agent;

        beforeEach(async () => {
            agent = await testInstance.getAuthHelper().loginUser(
                testInstance.getServer(),
                testInstance.primaryTestUser
            );
        });

        test('doit déconnecter utilisateur', async () => {
            const response = await agent
                .post('/api/auth/deconnexion');

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.message).toContain('Déconnexion réussie');

            // Vérifier que la session est détruite
            const statusResponse = await agent.get('/api/auth/statut');
            testInstance.assertAuthenticationRequired(statusResponse);
        });
    });

    describe('POST /api/auth/passer-premium', () => {
        test('doit exiger authentification pour accès Premium', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/passer-premium')
                .send({ code_acces: 'code-quelconque' });

            testInstance.assertAuthenticationRequired(response);
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/auth/passer-premium')
                .send({ code_acces: 'test-code' });

            testInstance.assertAuthenticationRequired(response);
        });
    });
});