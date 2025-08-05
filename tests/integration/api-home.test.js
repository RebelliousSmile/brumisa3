/**
 * Tests d'intégration API - Page d'accueil
 * 
 * Objectif : Tester les endpoints spécifiques à la page d'accueil
 * - Données d'accueil (statistiques, actualités)
 * - PDFs récents publics
 * - Témoignages approuvés
 * - Statistiques globales de la plateforme
 * - Actualités et nouveautés
 * - Systèmes de jeu disponibles
 * 
 * Couverture : Tous les contenus affichés sur la homepage principale
 */

const request = require('supertest');
const BaseApiTest = require('../helpers/BaseApiTest');
const TestFactory = require('../helpers/TestFactory');

/**
 * Classe de test pour les APIs de la page d'accueil
 * Principe SOLID : Single Responsibility - Tests spécifiques à l'accueil
 */
class HomeApiTest extends BaseApiTest {
    constructor() {
        super({
            timeout: 30000,
            cleanupUsers: true
        });
    }

    /**
     * Crée le contexte de test approprié (mix public/auth)
     */
    createTestContext() {
        return TestFactory.createTestContext(this.config);
    }

    /**
     * Setup personnalisé pour créer les utilisateurs de test
     */
    async customSetup() {
        // Créer utilisateur normal
        this.testUser = await this.createAndLoginUser({
            nom: 'Test User Home',
            email: `test_home_${Date.now()}@example.com`,
            motDePasse: 'motdepasse123'
        });

        // Créer admin simulé
        this.adminUser = await this.createAndLoginUser({
            nom: 'Admin Home',
            email: `admin_home_${Date.now()}@example.com`,
            motDePasse: 'motdepasse123'
        });
    }
}

// TEMPORAIREMENT DÉSACTIVÉ - Services backend non implémentés (Newsletter, Témoignages, etc.)
// TODO: Réactiver quand les services seront complètement implémentés
describe.skip('API Home et contenu public', () => {
    let testInstance;

    beforeAll(async () => {
        testInstance = new HomeApiTest();
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        if (testInstance) {
            await testInstance.baseTeardown();
        }
    });

    describe('GET /api/home/donnees', () => {
        test('doit retourner données page d\'accueil (public)', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/home/donnees')
                .expect(200);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees).toHaveProperty('statistiques');
            expect(response.body.donnees).toHaveProperty('actualites');
            expect(response.body.donnees).toHaveProperty('temoignages');
            expect(response.body.donnees).toHaveProperty('pdfs_populaires');
        });

        test('structure attendue données accueil', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/home/donnees')
                .expect(200);

            testInstance.assertApiResponse(response, 200, true);
            expect(response.body.donnees.statistiques).toMatchObject({
                total_utilisateurs: expect.any(Number),
                total_pdfs_generes: expect.any(Number),
                total_personnages: expect.any(Number),
                systemes_supportes: expect.any(Number)
            });
        });
    });

    describe('Newsletter', () => {
        describe('POST /api/newsletter/inscription', () => {
            test('doit permettre inscription newsletter', async () => {
                const inscriptionData = {
                    email: `newsletter_${Date.now()}@example.com`,
                    nom: 'Test Newsletter',
                    preferences: {
                        actualites: true,
                        nouveautes: true,
                        promotions: false
                    }
                };

                const response = await request(testInstance.getServer())
                    .post('/api/newsletter/inscription')
                    .send(inscriptionData)
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.message).toContain('newsletter');
            });

            test('doit valider format email', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/newsletter/inscription')
                    .send({
                        email: 'email-invalide',
                        nom: 'Test'
                    })
                    .expect(400);

                testInstance.assertValidationError(response, 'email');
            });

            test('doit refuser double inscription', async () => {
                const email = `double_${Date.now()}@example.com`;
                
                // Première inscription
                await request(testInstance.getServer())
                    .post('/api/newsletter/inscription')
                    .send({ email, nom: 'Test' })
                    .expect(200);

                // Seconde inscription
                const response = await request(testInstance.getServer())
                    .post('/api/newsletter/inscription')
                    .send({ email, nom: 'Test' })
                    .expect(409);

                testInstance.assertApiResponse(response, 409, false);
                expect(response.body.message).toContain('déjà inscrit');
            });
        });

        describe('POST /api/newsletter/desinscription/:token', () => {
            test('doit permettre désinscription avec token valide', async () => {
                // En réalité nécessiterait un vrai token généré
                const fakeToken = 'token-test-desinscription';
                
                const response = await request(testInstance.getServer())
                    .post(`/api/newsletter/desinscription/${fakeToken}`)
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.message).toContain('désinscrit');
            });

            test('doit refuser token invalide', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/newsletter/desinscription/token-invalide')
                    .expect(404);

                testInstance.assertApiResponse(response, 404, false);
            });
        });
    });

    describe('Actualités', () => {
        describe('GET /api/actualites', () => {
            test('doit lister actualités publiques', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/actualites')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(Array.isArray(response.body.donnees)).toBe(true);
            });

            test('doit supporter pagination', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/actualites')
                    .query({ page: 1, limit: 5 })
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.donnees.length).toBeLessThanOrEqual(5);
            });

            test('structure attendue actualités', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/actualites')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                if (response.body.donnees.length > 0) {
                    expect(response.body.donnees[0]).toMatchObject({
                        id: expect.any(Number),
                        titre: expect.any(String),
                        contenu: expect.any(String),
                        date_publication: expect.any(String),
                        auteur: expect.any(String)
                    });
                }
            });
        });

        describe('GET /api/actualites/rss', () => {
            test('doit retourner flux RSS', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/actualites/rss')
                    .expect(200);

                expect(response.headers['content-type']).toContain('xml');
                expect(response.text).toContain('<?xml');
                expect(response.text).toContain('<rss');
            });
        });

        describe('POST /api/actualites', () => {
            test('doit refuser création par utilisateur normal', async () => {
                const response = await testInstance.testUser.agent
                    .post('/api/actualites')
                    .send({
                        titre: 'Test Actualité',
                        contenu: 'Contenu de test'
                    })
                    .expect(403);

                testInstance.assertInsufficientPermissions(response);
            });
        });
    });

    describe('Témoignages', () => {
        describe('GET /api/temoignages', () => {
            test('doit lister témoignages approuvés', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/temoignages')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(Array.isArray(response.body.donnees)).toBe(true);
            });

            test('structure attendue témoignages', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/temoignages')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                if (response.body.donnees.length > 0) {
                    expect(response.body.donnees[0]).toMatchObject({
                        id: expect.any(Number),
                        nom: expect.any(String),
                        message: expect.any(String),
                        note: expect.any(Number),
                        date_creation: expect.any(String)
                    });
                    // Ne doit pas exposer email ou statut
                    expect(response.body.donnees[0]).not.toHaveProperty('email');
                    expect(response.body.donnees[0]).not.toHaveProperty('statut');
                }
            });
        });

        describe('POST /api/temoignages', () => {
            test('doit permettre ajout témoignage public', async () => {
                const temoignageData = {
                    nom: 'Jean Testeur',
                    email: `temoignage_${Date.now()}@example.com`,
                    message: 'Excellent service, très pratique pour mes parties de JDR !',
                    note: 5
                };

                const response = await request(testInstance.getServer())
                    .post('/api/temoignages')
                    .send(temoignageData)
                    .expect(201);

                testInstance.assertApiResponse(response, 201, true);
                expect(response.body.message).toContain('modération');
            });

            test('doit valider données témoignage', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/temoignages')
                    .send({
                        nom: '', // Nom vide
                        message: 'Test'
                    })
                    .expect(400);

                testInstance.assertValidationError(response);
            });

            test('doit valider note entre 1 et 5', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/temoignages')
                    .send({
                        nom: 'Test',
                        email: 'test@example.com',
                        message: 'Test message',
                        note: 10 // Note invalide
                    })
                    .expect(400);

                testInstance.assertValidationError(response, 'note');
            });

            test('doit filtrer contenu inapproprié', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/temoignages')
                    .send({
                        nom: 'Test',
                        email: 'test@example.com',
                        message: 'Message avec mots inappropriés: spam, hack, virus',
                        note: 3
                    })
                    .expect(400);

                testInstance.assertValidationError(response);
                expect(response.body.message).toContain('inapproprié');
            });
        });
    });

    describe('Informations dons', () => {
        describe('GET /api/dons/infos', () => {
            test('doit retourner informations dons publiques', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/dons/infos')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.donnees).toHaveProperty('objectifs');
                expect(response.body.donnees).toHaveProperty('paliers');
                expect(response.body.donnees).toHaveProperty('donateurs_recents');
            });

            test('structure attendue informations dons', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/dons/infos')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.donnees.objectifs).toMatchObject({
                    montant_cible: expect.any(Number),
                    montant_actuel: expect.any(Number),
                    pourcentage: expect.any(Number)
                });

                expect(Array.isArray(response.body.donnees.paliers)).toBe(true);
                expect(Array.isArray(response.body.donnees.donateurs_recents)).toBe(true);
            });

            test('ne doit pas exposer informations sensibles donateurs', async () => {
                const response = await request(testInstance.getServer())
                    .get('/api/dons/infos')
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                const donateurs = response.body.donnees.donateurs_recents;
                if (donateurs.length > 0) {
                    // Doit masquer emails et montants exacts
                    expect(donateurs[0]).not.toHaveProperty('email');
                    expect(donateurs[0]).not.toHaveProperty('montant_exact');
                    expect(donateurs[0]).toHaveProperty('nom'); // Pseudonyme ou initiales
                    expect(donateurs[0]).toHaveProperty('date');
                }
            });
        });
    });

    describe('Visibilité PDFs', () => {
        describe('POST /api/pdfs/:id/basculer-visibilite', () => {
            test('doit permettre bascule visibilité par propriétaire', async () => {
                // Nécessiterait d'abord créer un PDF
                const pdfId = 1; // Simulé

                const response = await testInstance.testUser.agent
                    .post(`/api/pdfs/${pdfId}/basculer-visibilite`)
                    .expect(200);

                testInstance.assertApiResponse(response, 200, true);
                expect(response.body.message).toContain('visibilité');
            });

            test('doit refuser modification par autre utilisateur', async () => {
                const autreUser = await testInstance.createAndLoginUser({
                    nom: 'Autre User',
                    email: `autre_${Date.now()}@example.com`,
                    motDePasse: 'motdepasse123'
                });

                const response = await autreUser.agent
                    .post('/api/pdfs/1/basculer-visibilite')
                    .expect(404);

                testInstance.assertApiResponse(response, 404, false);
            });

            test('doit refuser accès sans authentification', async () => {
                const response = await request(testInstance.getServer())
                    .post('/api/pdfs/1/basculer-visibilite')
                    .expect(401);

                testInstance.assertAuthenticationRequired(response);
            });
        });
    });

    describe('Gestion d\'erreurs contenu public', () => {
        test('doit gérer ressources inexistantes gracieusement', async () => {
            const routes = [
                '/api/actualites/99999',
                '/api/temoignages/99999'
            ];

            for (const route of routes) {
                const response = await request(testInstance.getServer())
                    .get(route)
                    .expect(404);

                testInstance.assertApiResponse(response, 404, false);
            }
        });

        test('doit valider paramètres de pagination', async () => {
            const response = await request(testInstance.getServer())
                .get('/api/actualites')
                .query({ page: -1, limit: 1000 })
                .expect(400);

            testInstance.assertValidationError(response);
            expect(response.body.message).toContain('pagination');
        });

        test('doit limiter taille des requêtes', async () => {
            const longMessage = 'x'.repeat(10000); // Message très long

            const response = await request(testInstance.getServer())
                .post('/api/temoignages')
                .send({
                    nom: 'Test',
                    email: 'test@example.com',
                    message: longMessage,
                    note: 5
                })
                .expect(400);

            testInstance.assertValidationError(response);
            expect(response.body.message).toContain('trop long');
        });
    });
});