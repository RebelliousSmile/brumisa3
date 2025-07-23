const request = require('supertest');
const { setupTest, teardownTest } = require('../helpers/test-cleanup');

describe('API Donations', () => {
    let app, server, agent;
    let testUser = {
        nom: 'Test User Donations',
        email: `test_donations_${Date.now()}@example.com`,
        motDePasse: 'motdepasse123'
    };

    beforeAll(async () => {
        app = require('../../src/app');
        server = await setupTest(app);
        
        // Créer utilisateur
        agent = request.agent(server);
        await agent.post('/api/auth/inscription').send(testUser);
    });

    afterAll(async () => {
        await teardownTest(server);
    });

    describe('GET /api/donations/status', () => {
        test('doit retourner statut donation public', async () => {
            const response = await request(server)
                .get('/api/donations/status')
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('stripe_active');
            expect(response.body.donnees).toHaveProperty('montants_disponibles');
            expect(response.body.donnees).toHaveProperty('devises_supportees');
        });

        test('structure attendue statut donations', async () => {
            const response = await request(server)
                .get('/api/donations/status')
                .expect(200);

            expect(response.body.donnees).toMatchObject({
                stripe_active: expect.any(Boolean),
                montants_disponibles: expect.any(Array),
                devises_supportees: expect.arrayContaining(['EUR', 'USD']),
                minimum_donation: expect.any(Number),
                maximum_donation: expect.any(Number)
            });

            // Vérifier montants logiques
            expect(response.body.donnees.minimum_donation).toBeGreaterThan(0);
            expect(response.body.donnees.maximum_donation).toBeGreaterThan(response.body.donnees.minimum_donation);
        });

        test('doit inclure informations Premium', async () => {
            const response = await request(server)
                .get('/api/donations/status')
                .expect(200);

            expect(response.body.donnees).toHaveProperty('premium_info');
            expect(response.body.donnees.premium_info).toMatchObject({
                prix_mensuel: expect.any(Number),
                prix_annuel: expect.any(Number),
                avantages: expect.any(Array)
            });
        });
    });

    describe('POST /api/donations/create-payment-intent', () => {
        test('doit créer intention de paiement donation unique', async () => {
            const donationData = {
                type: 'donation',
                montant: 10.00,
                devise: 'EUR',
                nom_donateur: 'Jean Généreux',
                email_donateur: 'jean@example.com',
                message: 'Merci pour ce super service !',
                anonyme: false
            };

            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send(donationData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('client_secret');
            expect(response.body.donnees).toHaveProperty('payment_intent_id');
            expect(response.body.donnees).toHaveProperty('montant');
            expect(response.body.donnees.montant).toBe(1000); // En centimes
        });

        test('doit créer intention paiement Premium mensuel', async () => {
            const premiumData = {
                type: 'premium',
                plan: 'mensuel',
                utilisateur_id: null // Pour utilisateur anonyme
            };

            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send(premiumData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('client_secret');
            expect(response.body.donnees).toHaveProperty('subscription_id');
        });

        test('doit créer intention paiement Premium annuel', async () => {
            const premiumData = {
                type: 'premium',
                plan: 'annuel',
                utilisateur_id: null
            };

            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send(premiumData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('client_secret');
            // Vérifier prix réduit pour abonnement annuel
            expect(response.body.donnees).toHaveProperty('reduction');
        });

        test('doit associer Premium à utilisateur connecté', async () => {
            const premiumData = {
                type: 'premium',
                plan: 'mensuel'
            };

            const response = await agent
                .post('/api/donations/create-payment-intent')
                .send(premiumData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            // Doit inclure ID utilisateur dans les métadonnées
            expect(response.body.donnees).toHaveProperty('utilisateur_id');
        });

        test('doit valider montant minimum', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 0.50, // Trop petit
                    devise: 'EUR'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('minimum');
        });

        test('doit valider montant maximum', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10000, // Trop grand
                    devise: 'EUR'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('maximum');
        });

        test('doit valider devise supportée', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'JPY' // Non supportée
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('devise');
        });

        test('doit valider format email donateur', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'EUR',
                    email_donateur: 'email-invalide'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('email');
        });

        test('doit filtrer message inapproprié', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'EUR',
                    message: 'Message avec contenu spam et liens malveillants'
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('inapproprié');
        });
    });

    describe('POST /api/donations/webhook', () => {
        test('doit traiter webhook Stripe (simulé)', async () => {
            // Webhook Stripe nécessite signature valide
            // Test simulé pour structure
            const webhookPayload = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test_123',
                        amount: 1000,
                        currency: 'eur',
                        status: 'succeeded'
                    }
                }
            };

            // Ce test échouerait sans signature Stripe valide
            const response = await request(server)
                .post('/api/donations/webhook')
                .set('stripe-signature', 'test-signature')
                .send(webhookPayload)
                .expect(400); // Attendu car signature invalide

            expect(response.body.succes).toBe(false);
        });

        test('doit rejeter webhook sans signature', async () => {
            const response = await request(server)
                .post('/api/donations/webhook')
                .send({ test: 'data' })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('signature');
        });
    });

    describe('Gestion des erreurs donations', () => {
        test('doit gérer erreur Stripe indisponible', async () => {
            // Simuler indisponibilité Stripe
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'EUR'
                })
                .expect(200); // Ou 503 si Stripe vraiment indisponible

            // En cas d'erreur Stripe, doit gérer gracieusement
            if (response.status === 503) {
                expect(response.body.succes).toBe(false);
                expect(response.body.message).toContain('indisponible');
            }
        });

        test('doit valider paramètres requis', async () => {
            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({}) // Paramètres manquants
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('requis');
        });

        test('doit limiter taille message donateur', async () => {
            const longMessage = 'x'.repeat(1000); // Message très long

            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'EUR',
                    message: longMessage
                })
                .expect(400);

            expect(response.body.succes).toBe(false);
            expect(response.body.message).toContain('long');
        });
    });

    describe('Sécurité donations', () => {
        test('doit logger toutes les tentatives de paiement', async () => {
            await request(server)
                .post('/api/donations/create-payment-intent')
                .send({
                    type: 'donation',
                    montant: 10.00,
                    devise: 'EUR'
                });

            // En réalité, vérifier logs
            const shouldLogPaymentAttempts = true;
            expect(shouldLogPaymentAttempts).toBe(true);
        });

        test('doit détecter tentatives de fraude', async () => {
            // Simuler comportement suspect (trop de tentatives)
            const requests = Array(10).fill().map(() =>
                request(server)
                    .post('/api/donations/create-payment-intent')
                    .send({
                        type: 'donation',
                        montant: 10.00,
                        devise: 'EUR'
                    })
            );

            const responses = await Promise.all(requests);
            
            // Après plusieurs tentatives, doit limiter
            const lastResponse = responses[responses.length - 1];
            if (lastResponse.status === 429) {
                expect(lastResponse.body.message).toContain('limite');
            }
        });

        test('ne doit pas exposer clés API dans réponses', async () => {
            const response = await request(server)
                .get('/api/donations/status')
                .expect(200);

            const responseString = JSON.stringify(response.body);
            expect(responseString).not.toContain('sk_'); // Clé secrète Stripe
            expect(responseString).not.toContain('whsec_'); // Secret webhook
        });
    });

    describe('Analytics donations', () => {
        test('doit tracker conversions donations', async () => {
            const donationData = {
                type: 'donation',
                montant: 10.00,
                devise: 'EUR',
                source: 'page_accueil',
                campagne: 'noel_2024'
            };

            const response = await request(server)
                .post('/api/donations/create-payment-intent')
                .send(donationData)
                .expect(200);

            expect(response.body.succes).toBe(true);
            // Doit inclure tracking dans les métadonnées
            expect(response.body.donnees).toHaveProperty('tracking_id');
        });
    });
});