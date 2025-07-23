const request = require('supertest');
const { setupTest, teardownTest } = require('../helpers/test-cleanup');

describe('API Authentification', () => {
    let app, server;
    let testUser = {
        nom: 'Test User',
        email: `test_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123',
        confirmationMotDePasse: 'motdepasse123'
    };

    beforeAll(async () => {
        app = require('../../src/app');
        server = await setupTest(app);
    });

    afterAll(async () => {
        await teardownTest(server);
    });

    describe('POST /api/auth/inscription', () => {
        test('doit créer un nouveau compte utilisateur', async () => {
            const response = await request(server)
                .post('/api/auth/inscription')
                .send(testUser)
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testUser.nom,
                email: testUser.email,
                role: 'UTILISATEUR'
            });
            expect(response.body.donnees.utilisateur).not.toHaveProperty('mot_de_passe');
        });

        test('doit refuser inscription avec email invalide', async () => {
            const response = await request(server)
                .post('/api/auth/inscription')
                .send({
                    ...testUser,
                    email: 'email-invalide'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('Format email invalide');
        });

        test('doit refuser inscription avec mot de passe trop court', async () => {
            const response = await request(server)
                .post('/api/auth/inscription')
                .send({
                    ...testUser,
                    email: `test_court_${Date.now()}@example.com`,
                    motDePasse: '123'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('8 caractères');
        });

        test('doit refuser inscription avec email déjà existant', async () => {
            const response = await request(server)
                .post('/api/auth/inscription')
                .send(testUser)
                .expect(409);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('existe déjà');
        });
    });

    describe('POST /api/auth/connexion', () => {
        test('doit connecter un utilisateur valide', async () => {
            const response = await request(server)
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testUser.nom,
                email: testUser.email,
                role: 'UTILISATEUR'
            });
        });

        test('doit refuser connexion avec email invalide', async () => {
            const response = await request(server)
                .post('/api/auth/connexion')
                .send({
                    email: 'inexistant@example.com',
                    motDePasse: testUser.motDePasse
                })
                .expect(401);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('incorrect');
        });

        test('doit refuser connexion avec mot de passe invalide', async () => {
            const response = await request(server)
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: 'mauvais-mot-de-passe'
                })
                .expect(401);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('incorrect');
        });
    });

    describe('GET /api/auth/statut', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(server);
            await agent
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                });
        });

        test('doit retourner le statut de session valide', async () => {
            const response = await agent
                .get('/api/auth/statut')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.utilisateur).toMatchObject({
                nom: testUser.nom,
                email: testUser.email,
                role: 'UTILISATEUR'
            });
        });

        test('doit refuser accès sans session', async () => {
            const response = await request(server)
                .get('/api/auth/statut')
                .expect(401);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('authentifié');
        });
    });

    describe('GET /api/auth/profil', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(server);
            await agent
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                });
        });

        test('doit retourner le profil utilisateur', async () => {
            const response = await agent
                .get('/api/auth/profil')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toMatchObject({
                nom: testUser.nom,
                email: testUser.email,
                role: 'UTILISATEUR'
            });
            expect(response.body.donnees).toHaveProperty('date_creation');
            expect(response.body.donnees).not.toHaveProperty('mot_de_passe');
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(server)
                .get('/api/auth/profil')
                .expect(401);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('PUT /api/auth/profil', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(server);
            await agent
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                });
        });

        test('doit mettre à jour le nom utilisateur', async () => {
            const nouveauNom = 'Nouveau Nom Test';
            const response = await agent
                .put('/api/auth/profil')
                .send({ nom: nouveauNom })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.nom).toBe(nouveauNom);
        });

        test('doit refuser nom trop court', async () => {
            const response = await agent
                .put('/api/auth/profil')
                .send({ nom: 'A' })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('2 caractères');
        });
    });

    describe('POST /api/auth/mot-de-passe-oublie', () => {
        test('doit accepter demande récupération mot de passe', async () => {
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('lien de récupération');
        });

        test('doit accepter même pour email inexistant (sécurité)', async () => {
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: 'inexistant@example.com' })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('lien de récupération');
        });

        test('doit refuser format email invalide', async () => {
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: 'email-invalide' })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('Format email invalide');
        });
    });

    describe('POST /api/auth/deconnexion', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(server);
            await agent
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                });
        });

        test('doit déconnecter utilisateur', async () => {
            const response = await agent
                .post('/api/auth/deconnexion')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('Déconnexion réussie');

            // Vérifier que la session est détruite
            await agent
                .get('/api/auth/statut')
                .expect(401);
        });
    });

    describe('POST /api/auth/elevation-role', () => {
        let agent;

        beforeEach(async () => {
            agent = request.agent(server);
            await agent
                .post('/api/auth/connexion')
                .send({
                    email: testUser.email,
                    motDePasse: testUser.motDePasse
                });
        });

        test('doit refuser code d\'accès invalide', async () => {
            const response = await agent
                .post('/api/auth/elevation-role')
                .send({ code_acces: 'code-invalide' })
                .expect(401);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('invalide');
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(server)
                .post('/api/auth/elevation-role')
                .send({ code_acces: 'test-code' })
                .expect(401);

            expect(response.body.succes).toBe(false);
        });
    });
});