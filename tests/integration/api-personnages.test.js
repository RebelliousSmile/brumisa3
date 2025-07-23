/**
 * Tests d'intégration API - Gestion des personnages
 * 
 * Objectif : Tester tous les endpoints CRUD pour les personnages de JDR
 * - Création de personnages (validation systèmes de jeu)
 * - Listage et récupération de personnages
 * - Modification et suppression
 * - Duplication de personnages
 * - Sauvegarde de brouillons
 * - Recherche de personnages
 * - Génération de PDF
 * - Templates par système de jeu
 * - Statistiques utilisateur
 * 
 * Couverture : CRUD complet avec authentification et validation métier
 * Architecture : Utilise les principes SOLID avec injection de dépendances
 */

const request = require('supertest');
const BaseApiTest = require('../helpers/BaseApiTest');
const TestFactory = require('../helpers/TestFactory');

class PersonnagesApiTest extends BaseApiTest {
    createTestContext() {
        return TestFactory.createAuthTestContext(this.config);
    }

    async customSetup() {
        // Créer et connecter un utilisateur pour les tests CRUD
        const result = await this.createAndLoginUser({
            nom: 'Test User Personnages'
        });
        this.authenticatedAgent = result.agent;
        this.testUser = result.user;
        
        // Variable pour stocker l'ID du personnage créé
        this.personnageId = null;
    }
}

describe('API Personnages', () => {
    const testInstance = new PersonnagesApiTest({
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

    describe('POST /api/personnages', () => {
        test('doit créer un nouveau personnage', async () => {
            const personnageData = {
                nom: 'Lydia',
                systeme_jeu: 'monsterhearts',
                skin: 'vampire',
                attributs: {
                    hot: 2,
                    cold: 1,
                    volatile: -1,
                    dark: 2
                },
                donnees_personnage: {
                    description: 'Vampire séduisante du lycée'
                }
            };

            const response = await testInstance.authenticatedAgent
                .post('/api/personnages')
                .send(personnageData);

            testInstance.assertApiResponse(response, 201, true);
            expect(response.body.donnees).toMatchObject({
                nom: personnageData.nom,
                systeme_jeu: personnageData.systeme_jeu,
                skin: personnageData.skin
            });
            
            testInstance.personnageId = response.body.donnees.id;
        });

        test('doit refuser création sans authentification', async () => {
            const response = await request(testInstance.getServer())
                .post('/api/personnages')
                .send({ nom: 'Test' });

            testInstance.assertAuthenticationRequired(response);
        });

        test('doit valider les données requises', async () => {
            const response = await testInstance.authenticatedAgent
                .post('/api/personnages')
                .send({});

            testInstance.assertValidationError(response);
        });
    });

    describe('GET /api/personnages', () => {
        test('doit lister les personnages de l\'utilisateur', async () => {
            const response = await testInstance.authenticatedAgent
                .get('/api/personnages');

            testInstance.assertApiResponse(response, 200, true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
            expect(response.body.donnees.length).toBeGreaterThan(0);
        });

        test('doit refuser accès sans authentification', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/personnages');

            testInstance.assertAuthenticationRequired(response);
        });
    });

    describe('GET /api/personnages/:id', () => {
        test('doit récupérer un personnage par ID', async () => {
            const response = await testInstance.authenticatedAgent
                .get(`/api/personnages/${testInstance.personnageId}`);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toHaveProperty('id', testInstance.personnageId);
            expect(response.body.donnees).toHaveProperty('nom');
        });

        test('doit retourner 404 pour personnage inexistant', async () => {
            const response = await testInstance.authenticatedAgent
                .get('/api/personnages/99999');

            testInstance.assertApiResponse(response, 404, false);
        });
    });

    describe('PUT /api/personnages/:id', () => {
        test('doit mettre à jour un personnage', async () => {
            const updateData = {
                nom: 'Lydia Modifiée',
                niveau: 10
            };

            const response = await testInstance.authenticatedAgent
                .put(`/api/personnages/${testInstance.personnageId}`)
                .send(updateData);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toMatchObject(updateData);
        });

        test('doit refuser modification personnage d\'un autre utilisateur', async () => {
            // Créer un autre utilisateur
            const autreResult = await testInstance.createAndLoginUser({
                nom: 'Autre User'
            });

            const response = await autreResult.agent
                .put(`/api/personnages/${testInstance.personnageId}`)
                .send({ nom: 'Hack' });

            testInstance.assertApiResponse(response, 404, false);
        });
    });

    describe('POST /api/personnages/:id/dupliquer', () => {
        test('doit dupliquer un personnage', async () => {
            const response = await testInstance.authenticatedAgent
                .post(`/api/personnages/${testInstance.personnageId}/dupliquer`);

            testInstance.assertApiResponse(response, 201, true);
            expect(response.body.donnees.nom).toContain('Copie');
            expect(response.body.donnees.id).not.toBe(testInstance.personnageId);
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

            const response = await testInstance.authenticatedAgent
                .post('/api/personnages/brouillon')
                .send(brouillonData);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.message).toContain('brouillon');
        });
    });

    describe('GET /api/personnages/rechercher', () => {
        test('doit permettre recherche par nom', async () => {
            const response = await testInstance.authenticatedAgent
                .get('/api/personnages/rechercher')
                .query({ q: 'Lydia' });

            testInstance.assertApiResponse(response, 200, true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });

        test('doit limiter les résultats de recherche', async () => {
            const response = await testInstance.authenticatedAgent
                .get('/api/personnages/rechercher')
                .query({ q: 'Test', limit: 5 });

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees.length).toBeLessThanOrEqual(5);
        });
    });

    describe('GET /api/personnages/statistiques', () => {
        test('doit retourner statistiques utilisateur', async () => {
            const response = await testInstance.authenticatedAgent
                .get('/api/personnages/statistiques');

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toHaveProperty('total_personnages');
            expect(response.body.donnees).toHaveProperty('par_systeme');
            expect(typeof response.body.donnees.total_personnages).toBe('number');
        });
    });

    describe('POST /api/personnages/:id/pdf', () => {
        test('doit générer PDF depuis personnage', async () => {
            const response = await testInstance.authenticatedAgent
                .post(`/api/personnages/${testInstance.personnageId}/pdf`)
                .send({
                    template: 'standard',
                    options: {
                        format: 'A4',
                        couleur: true
                    }
                });

            testInstance.assertApiResponse(response, 201, true);
            expect(response.body.donnees).toHaveProperty('pdf_id');
            expect(response.body.donnees).toHaveProperty('statut');
        });
    });

    describe('GET /api/personnages/template/:systeme', () => {
        test('doit retourner template public par système', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/personnages/template/dnd5');

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toHaveProperty('template');
            expect(response.body.donnees).toHaveProperty('champs');
        });

        test('doit retourner 404 pour système inexistant', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/personnages/template/systeme-inexistant');

            testInstance.assertApiResponse(response, 404, false);
        });
    });

    describe('DELETE /api/personnages/:id', () => {
        test('doit supprimer un personnage', async () => {
            const response = await testInstance.authenticatedAgent
                .delete(`/api/personnages/${testInstance.personnageId}`);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.message).toContain('supprimé');

            // Vérifier que le personnage n'existe plus
            const checkResponse = await testInstance.authenticatedAgent
                .get(`/api/personnages/${testInstance.personnageId}`);
            testInstance.assertApiResponse(checkResponse, 404, false);
        });
    });
});