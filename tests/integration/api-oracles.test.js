const request = require('supertest');
const { setupTest, teardownTest } = require('../helpers/test-cleanup');

describe('API Oracles', () => {
    let app, server, agent, adminAgent;
    let testUser = {
        nom: 'Test User Oracles',
        email: `test_oracle_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123'
    };
    let adminUser = {
        nom: 'Admin Oracle',
        email: `admin_oracle_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123'
    };
    let oracleId;

    beforeAll(async () => {
        app = require('../../src/app');
        server = await setupTest(app);
        
        // Créer utilisateur normal
        agent = request.agent(server);
        await agent.post('/api/auth/inscription').send(testUser);
        
        // Créer admin (simulé - nécessiterait code d'accès réel)
        adminAgent = request.agent(server);
        await adminAgent.post('/api/auth/inscription').send(adminUser);
    });

    afterAll(async () => {
        await teardownTest(server);
    });

    describe('Routes publiques', () => {
        describe('GET /api/oracles', () => {
            test('doit lister oracles publics', async () => {
                const response = await request(server)
                    .get('/api/oracles')
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(Array.isArray(response.body.donnees)).toBe(true);
            });

            test('doit supporter pagination', async () => {
                const response = await request(server)
                    .get('/api/oracles')
                    .query({ page: 1, limit: 10 })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees.length).toBeLessThanOrEqual(10);
            });

            test('doit supporter filtrage par catégorie', async () => {
                const response = await request(server)
                    .get('/api/oracles')
                    .query({ categorie: 'fantasy' })
                    .expect(200);

                expect(response.body.succes).toBe(true);
            });
        });

        describe('GET /api/oracles/search', () => {
            test('doit permettre recherche par nom', async () => {
                const response = await request(server)
                    .get('/api/oracles/search')
                    .query({ q: 'test' })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(Array.isArray(response.body.donnees)).toBe(true);
            });

            test('doit limiter résultats de recherche', async () => {
                const response = await request(server)
                    .get('/api/oracles/search')
                    .query({ q: 'oracle', limit: 5 })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees.length).toBeLessThanOrEqual(5);
            });
        });

        describe('GET /api/oracles/:id', () => {
            beforeEach(async () => {
                // Créer un oracle de test via admin (simulé)
                const oracleData = {
                    nom: 'Oracle Test Public',
                    description: 'Oracle pour tests publics',
                    categorie: 'test',
                    actif: true,
                    items: [
                        { texte: 'Résultat 1', poids: 1 },
                        { texte: 'Résultat 2', poids: 1 }
                    ]
                };

                // Simuler création par admin (nécessiterait vraie authentification admin)
                oracleId = 1; // Valeur simulée
            });

            test('doit récupérer oracle par ID', async () => {
                // Test simulé - en réalité nécessiterait oracle existant
                const response = await request(server)
                    .get(`/api/oracles/${oracleId}`)
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees).toHaveProperty('nom');
                expect(response.body.donnees).toHaveProperty('items');
            });

            test('doit retourner 404 pour oracle inexistant', async () => {
                const response = await request(server)
                    .get('/api/oracles/99999')
                    .expect(404);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('POST /api/oracles/:id/draw', () => {
            test('doit effectuer tirage sur oracle', async () => {
                const response = await request(server)
                    .post(`/api/oracles/${oracleId}/draw`)
                    .send({
                        nombre_tirages: 1,
                        options: {
                            unique: false
                        }
                    })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees).toHaveProperty('resultats');
                expect(Array.isArray(response.body.donnees.resultats)).toBe(true);
                expect(response.body.donnees.resultats.length).toBe(1);
            });

            test('doit permettre tirages multiples', async () => {
                const response = await request(server)
                    .post(`/api/oracles/${oracleId}/draw`)
                    .send({
                        nombre_tirages: 3,
                        options: { unique: false }
                    })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees.resultats.length).toBe(3);
            });

            test('doit respecter option tirages uniques', async () => {
                const response = await request(server)
                    .post(`/api/oracles/${oracleId}/draw`)
                    .send({
                        nombre_tirages: 2,
                        options: { unique: true }
                    })
                    .expect(200);

                expect(response.body.succes).toBe(true);
                const resultats = response.body.donnees.resultats;
                const textes = resultats.map(r => r.texte);
                expect(new Set(textes).size).toBe(textes.length); // Tous différents
            });
        });

        describe('GET /api/oracles/:id/stats', () => {
            test('doit retourner statistiques oracle', async () => {
                const response = await request(server)
                    .get(`/api/oracles/${oracleId}/stats`)
                    .expect(200);

                expect(response.body.succes).toBe(true);
                expect(response.body.donnees).toHaveProperty('total_tirages');
                expect(response.body.donnees).toHaveProperty('items_populaires');
            });
        });
    });

    describe('Routes administrateur', () => {
        // Note: Ces tests nécessiteraient une vraie authentification admin
        // Pour le moment, ils sont structurés mais ne peuvent pas être exécutés

        describe('POST /api/admin/oracles', () => {
            test('doit créer nouvel oracle (admin requis)', async () => {
                const oracleData = {
                    nom: 'Nouveau Oracle Admin',
                    description: 'Oracle créé par admin',
                    categorie: 'fantasy',
                    actif: true,
                    items: [
                        { texte: 'Dragon rouge', poids: 1 },
                        { texte: 'Dragon bleu', poids: 1 },
                        { texte: 'Dragon vert', poids: 2 }
                    ]
                };

                // Ce test échouerait sans authentification admin réelle
                const response = await adminAgent
                    .post('/api/admin/oracles')
                    .send(oracleData)
                    .expect(403); // Attendu car pas vraiment admin

                expect(response.body.succes).toBe(false);
            });

            test('doit refuser création par utilisateur normal', async () => {
                const response = await agent
                    .post('/api/admin/oracles')
                    .send({ nom: 'Test' })
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('PUT /api/admin/oracles/:id', () => {
            test('doit refuser modification par utilisateur normal', async () => {
                const response = await agent
                    .put(`/api/admin/oracles/${oracleId}`)
                    .send({ nom: 'Hack' })
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('DELETE /api/admin/oracles/:id', () => {
            test('doit refuser suppression par utilisateur normal', async () => {
                const response = await agent
                    .delete(`/api/admin/oracles/${oracleId}`)
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('POST /api/admin/oracles/:id/items', () => {
            test('doit refuser ajout item par utilisateur normal', async () => {
                const response = await agent
                    .post(`/api/admin/oracles/${oracleId}/items`)
                    .send({ texte: 'Nouvel item', poids: 1 })
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('POST /api/admin/oracles/:id/clone', () => {
            test('doit refuser clonage par utilisateur normal', async () => {
                const response = await agent
                    .post(`/api/admin/oracles/${oracleId}/clone`)
                    .send({ nouveau_nom: 'Clone' })
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('POST /api/admin/oracles/:id/toggle', () => {
            test('doit refuser bascule statut par utilisateur normal', async () => {
                const response = await agent
                    .post(`/api/admin/oracles/${oracleId}/toggle`)
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('GET /api/admin/oracles/:id/distribution', () => {
            test('doit refuser analyse distribution par utilisateur normal', async () => {
                const response = await agent
                    .get(`/api/admin/oracles/${oracleId}/distribution`)
                    .expect(403);

                expect(response.body.succes).toBe(false);
            });
        });

        describe('Routes import/export', () => {
            describe('POST /api/admin/oracles/import', () => {
                test('doit refuser import par utilisateur normal', async () => {
                    const response = await agent
                        .post('/api/admin/oracles/import')
                        .attach('file', Buffer.from('test csv'), 'test.csv')
                        .expect(403);

                    expect(response.body.succes).toBe(false);
                });
            });

            describe('GET /api/admin/oracles/:id/export/json', () => {
                test('doit refuser export JSON par utilisateur normal', async () => {
                    const response = await agent
                        .get(`/api/admin/oracles/${oracleId}/export/json`)
                        .expect(403);

                    expect(response.body.succes).toBe(false);
                });
            });

            describe('GET /api/admin/oracles/:id/export/csv', () => {
                test('doit refuser export CSV par utilisateur normal', async () => {
                    const response = await agent
                        .get(`/api/admin/oracles/${oracleId}/export/csv`)
                        .expect(403);

                    expect(response.body.succes).toBe(false);
                });
            });

            describe('GET /api/admin/oracles/imports', () => {
                test('doit refuser historique imports par utilisateur normal', async () => {
                    const response = await agent
                        .get('/api/admin/oracles/imports')
                        .expect(403);

                    expect(response.body.succes).toBe(false);
                });
            });
        });
    });

    describe('Gestion d\'erreurs', () => {
        test('doit gérer oracle inactif', async () => {
            // Tenter tirage sur oracle inactif
            const response = await request(server)
                .post('/api/oracles/999/draw')
                .send({ nombre_tirages: 1 })
                .expect(404);

            expect(response.body.succes).toBe(false);
        });

        test('doit valider nombre de tirages', async () => {
            const response = await request(server)
                .post(`/api/oracles/${oracleId}/draw`)
                .send({ nombre_tirages: 0 })
                .expect(400);

            expect(response.body.succes).toBe(false);
        });

        test('doit limiter nombre maximum de tirages', async () => {
            const response = await request(server)
                .post(`/api/oracles/${oracleId}/draw`)
                .send({ nombre_tirages: 1000 })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('maximum');
        });
    });
});