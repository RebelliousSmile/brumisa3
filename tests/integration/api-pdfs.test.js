const request = require('supertest');
const { setupTest, teardownTest } = require('../helpers/test-cleanup');

describe('API PDFs', () => {
    let app, server, agent;
    let testUser = {
        nom: 'Test User PDFs',
        email: `test_pdf_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123'
    };
    let pdfId, tokenAnonyme;

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

    describe('POST /api/auth/token-anonyme', () => {
        test('doit générer token pour utilisateur anonyme', async () => {
            const response = await request(server)
                .post('/api/auth/token-anonyme')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('token');
            expect(response.body.donnees).toHaveProperty('expires_at');
            
            tokenAnonyme = response.body.donnees.token;
        });
    });

    describe('POST /api/pdfs/generer', () => {
        test('doit générer PDF pour utilisateur authentifié', async () => {
            const pdfData = {
                systeme: 'dnd5',
                template: 'fiche-personnage',
                donnees: {
                    nom: 'Gandalf',
                    classe: 'Magicien',
                    niveau: 20,
                    caracteristiques: {
                        force: 10,
                        intelligence: 20
                    }
                },
                options: {
                    format: 'A4',
                    couleur: true
                }
            };

            const response = await agent
                .post('/api/pdfs/generer')
                .send(pdfData)
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('id');
            expect(response.body.donnees).toHaveProperty('statut');
            expect(response.body.donnees.statut).toBe('en_cours');
            
            pdfId = response.body.donnees.id;
        });

        test('doit refuser génération sans authentification', async () => {
            const response = await request(server)
                .post('/api/pdfs/generer')
                .send({ systeme: 'dnd5' })
                .expect(401);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('POST /api/pdfs/document-generique/:systeme', () => {
        test('doit générer document générique pour utilisateur authentifié', async () => {
            const response = await agent
                .post('/api/pdfs/document-generique/dnd5')
                .send({
                    template: 'feuille-vierge',
                    options: { format: 'A4' }
                })
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('id');
        });
    });

    describe('POST /api/pdfs/document-generique-anonyme/:systeme', () => {
        test('doit générer document générique pour anonyme avec token', async () => {
            const response = await request(server)
                .post('/api/pdfs/document-generique-anonyme/dnd5')
                .set('Authorization', `Bearer ${tokenAnonyme}`)
                .send({
                    template: 'feuille-vierge',
                    options: { format: 'A4' }
                })
                .expect(201);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('id');
        });

        test('doit refuser génération anonyme sans token', async () => {
            const response = await request(server)
                .post('/api/pdfs/document-generique-anonyme/dnd5')
                .send({ template: 'test' })
                .expect(401);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('GET /api/pdfs', () => {
        test('doit lister les PDFs de l\'utilisateur', async () => {
            const response = await agent
                .get('/api/pdfs')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });

        test('doit supporter pagination', async () => {
            const response = await agent
                .get('/api/pdfs')
                .query({ page: 1, limit: 5 })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.length).toBeLessThanOrEqual(5);
        });
    });

    describe('GET /api/pdfs/:id', () => {
        test('doit récupérer détails d\'un PDF', async () => {
            const response = await agent
                .get(`/api/pdfs/${pdfId}`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toMatchObject({
                id: pdfId
            });
        });

        test('doit refuser accès PDF d\'un autre utilisateur', async () => {
            const autreAgent = request.agent(server);
            await autreAgent.post('/api/auth/inscription').send({
                nom: 'Autre User',
                email: `autre_pdf_${Date.now()}@example.com`,
                motDePasse: 'motdepasse123'
            });

            const response = await autreAgent
                .get(`/api/pdfs/${pdfId}`)
                .expect(404);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('GET /api/pdfs/:id/statut', () => {
        test('doit retourner statut génération PDF', async () => {
            const response = await request(server)
                .get(`/api/pdfs/${pdfId}/statut`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('statut');
            expect(['en_cours', 'termine', 'erreur']).toContain(response.body.donnees.statut);
        });
    });

    describe('POST /api/pdfs/:id/relancer', () => {
        test('doit relancer génération PDF échouée', async () => {
            const response = await agent
                .post(`/api/pdfs/${pdfId}/relancer`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('relancée');
        });
    });

    describe('POST /api/pdfs/:id/partager', () => {
        test('doit créer lien de partage', async () => {
            const response = await agent
                .post(`/api/pdfs/${pdfId}/partager`)
                .send({
                    duree: 24, // heures
                    mot_de_passe: 'secret123'
                })
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('lien_partage');
            expect(response.body.donnees).toHaveProperty('token');
        });
    });

    describe('GET /api/pdfs/partage/:token', () => {
        let tokenPartage;

        beforeEach(async () => {
            const shareResponse = await agent
                .post(`/api/pdfs/${pdfId}/partager`)
                .send({ duree: 1 });
            
            tokenPartage = shareResponse.body.donnees.token;
        });

        test('doit afficher PDF partagé avec token valide', async () => {
            const response = await request(server)
                .get(`/api/pdfs/partage/${tokenPartage}`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('pdf');
        });

        test('doit refuser token de partage invalide', async () => {
            const response = await request(server)
                .get('/api/pdfs/partage/token-invalide')
                .expect(404);

            expect(response.body.succes).toBe(false);
        });
    });

    describe('GET /api/pdfs/:id/telecharger', () => {
        test('doit permettre téléchargement par propriétaire', async () => {
            // Ce test nécessiterait que le PDF soit généré et prêt
            const response = await agent
                .get(`/api/pdfs/${pdfId}/telecharger`)
                .expect(200);

            expect(response.headers['content-type']).toContain('application/pdf');
        });
    });

    describe('POST /api/pdfs/preview-html', () => {
        test('doit générer prévisualisation HTML', async () => {
            const previewData = {
                systeme: 'dnd5',
                template: 'fiche-personnage',
                donnees: {
                    nom: 'Legolas',
                    classe: 'Rôdeur'
                }
            };

            const response = await agent
                .post('/api/pdfs/preview-html')
                .send(previewData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('html');
            expect(typeof response.body.donnees.html).toBe('string');
        });
    });

    describe('GET /api/pdfs/types', () => {
        test('doit retourner types de PDF disponibles (public)', async () => {
            const response = await request(server)
                .get('/api/pdfs/types')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });
    });

    describe('GET /api/pdfs/templates/:systeme', () => {
        test('doit lister templates pour un système', async () => {
            const response = await agent
                .get('/api/pdfs/templates/dnd5')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });
    });

    describe('GET /api/pdfs/types-templates', () => {
        test('doit retourner mapping types-templates', async () => {
            const response = await agent
                .get('/api/pdfs/types-templates')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(typeof response.body.donnees).toBe('object');
        });
    });

    describe('GET /api/pdfs/statistiques', () => {
        test('doit retourner statistiques PDFs utilisateur', async () => {
            const response = await agent
                .get('/api/pdfs/statistiques')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('total_pdfs');
            expect(response.body.donnees).toHaveProperty('par_statut');
        });
    });

    describe('POST /api/pdfs/:id/basculer-visibilite', () => {
        test('doit basculer visibilité d\'un PDF', async () => {
            const response = await agent
                .post(`/api/pdfs/${pdfId}/basculer-visibilite`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('visibilité');
        });
    });

    describe('DELETE /api/pdfs/:id', () => {
        test('doit supprimer un PDF', async () => {
            const response = await agent
                .delete(`/api/pdfs/${pdfId}`)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.message).toContain('supprimé');

            // Vérifier suppression
            await agent
                .get(`/api/pdfs/${pdfId}`)
                .expect(404);
        });
    });
});