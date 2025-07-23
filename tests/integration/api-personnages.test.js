const request = require('supertest');
const { setupTest, teardownTest } = require('../helpers/test-cleanup');

describe('API Personnages', () => {
    let app, server, agent;
    let testUser = {
        nom: 'Test User Personnages',
        email: `test_perso_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123'
    };
    let personnageId;

    beforeAll(async () => {
        app = require('../../src/app');
        server = await setupTest(app);
        
        // Créer utilisateur et se connecter
        agent = request.agent(server);
        await agent.post('/api/auth/inscription').send(testUser);
    });

    afterAll(async () => {
        await teardownTest(server);
    });

    describe('POST /api/personnages', () => {
        test('doit créer un nouveau personnage', async () => {
            const personnageData = {
                nom: 'Aragorn',
                systeme: 'dnd5',
                niveau: 5,
                classe: 'Rôdeur',
                race: 'Humain',
                caracteristiques: {
                    force: 16,
                    dexterite: 14,
                    constitution: 13
                }
            };

            const response = await agent
                .post('/api/personnages')
                .send(personnageData)
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toMatchObject({
                nom: personnageData.nom,
                systeme: personnageData.systeme,
                niveau: personnageData.niveau
            });
            
            personnageId = response.body.donnees.id;
        });

        test('doit refuser création sans authentification', async () => {
            const response = await request(server)
                .post('/api/personnages')
                .send({ nom: 'Test' })
                .expect(401);

            expect(response.body.succes).toBe(false);
        });

        test('doit valider les données requises', async () => {
            const response = await agent
                .post('/api/personnages')
                .send({})
                .expect(400);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('GET /api/personnages', () => {
        test('doit lister les personnages de l\'utilisateur', async () => {
            const response = await agent
                .get('/api/personnages')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
            expect(response.body.donnees.length).toBeGreaterThan(0);
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(server)
                .get('/api/personnages')
                .expect(401);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('GET /api/personnages/:id', () => {
        test('doit récupérer un personnage par ID', async () => {
            const response = await agent
                .get(`/api/personnages/${personnageId}`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toMatchObject({
                id: personnageId,
                nom: 'Aragorn',
                systeme: 'dnd5'
            });
        });

        test('doit retourner 404 pour personnage inexistant', async () => {
            const response = await agent
                .get('/api/personnages/99999')
                .expect(404);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('PUT /api/personnages/:id', () => {
        test('doit mettre à jour un personnage', async () => {
            const updateData = {
                nom: 'Aragorn Roi',
                niveau: 10
            };

            const response = await agent
                .put(`/api/personnages/${personnageId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toMatchObject(updateData);
        });

        test('doit refuser modification personnage d\'un autre utilisateur', async () => {
            // Créer un autre utilisateur
            const autreUser = {
                nom: 'Autre User',
                email: `autre_${Date.now()}@example.com`,
                motDePasse: 'motdepasse123'
            };
            
            const autreAgent = request.agent(server);
            await autreAgent.post('/api/auth/inscription').send(autreUser);

            const response = await autreAgent
                .put(`/api/personnages/${personnageId}`)
                .send({ nom: 'Hack' })
                .expect(404);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('POST /api/personnages/:id/dupliquer', () => {
        test('doit dupliquer un personnage', async () => {
            const response = await agent
                .post(`/api/personnages/${personnageId}/dupliquer`)
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.nom).toContain('Copie');
            expect(response.body.donnees.id).not.toBe(personnageId);
        });
    });

    describe('POST /api/personnages/brouillon', () => {
        test('doit sauvegarder un brouillon de personnage', async () => {
            const brouillonData = {
                nom: 'Brouillon Test',
                systeme: 'coc7',
                donnees_temporaires: {
                    competences: ['Investigation', 'Occultisme']
                }
            };

            const response = await agent
                .post('/api/personnages/brouillon')
                .send(brouillonData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('brouillon');
        });
    });

    describe('GET /api/personnages/rechercher', () => {
        test('doit permettre recherche par nom', async () => {
            const response = await agent
                .get('/api/personnages/rechercher')
                .query({ q: 'Aragorn' })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });

        test('doit limiter les résultats de recherche', async () => {
            const response = await agent
                .get('/api/personnages/rechercher')
                .query({ q: 'Test', limit: 5 })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.length).toBeLessThanOrEqual(5);
        });
    });

    describe('GET /api/personnages/statistiques', () => {
        test('doit retourner statistiques utilisateur', async () => {
            const response = await agent
                .get('/api/personnages/statistiques')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('total_personnages');
            expect(response.body.donnees).toHaveProperty('par_systeme');
            expect(typeof response.body.donnees.total_personnages).toBe('number');
        });
    });

    describe('POST /api/personnages/:id/pdf', () => {
        test('doit générer PDF depuis personnage', async () => {
            const response = await agent
                .post(`/api/personnages/${personnageId}/pdf`)
                .send({
                    template: 'standard',
                    options: {
                        format: 'A4',
                        couleur: true
                    }
                })
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('pdf_id');
            expect(response.body.donnees).toHaveProperty('statut');
        });
    });

    describe('GET /api/personnages/template/:systeme', () => {
        test('doit retourner template public par système', async () => {
            const response = await request(server)
                .get('/api/personnages/template/dnd5')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('template');
            expect(response.body.donnees).toHaveProperty('champs');
        });

        test('doit retourner 404 pour système inexistant', async () => {
            const response = await request(server)
                .get('/api/personnages/template/systeme-inexistant')
                .expect(404);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('DELETE /api/personnages/:id', () => {
        test('doit supprimer un personnage', async () => {
            const response = await agent
                .delete(`/api/personnages/${personnageId}`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('supprimé');

            // Vérifier que le personnage n'existe plus
            await agent
                .get(`/api/personnages/${personnageId}`)
                .expect(404);
        });
    });
});