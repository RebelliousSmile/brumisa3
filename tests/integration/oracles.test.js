/**
 * Tests d'intégration - Oracles (Architecture SOLID)
 * 
 * Tests complets de l'API Oracles avec architecture SOLID :
 * - Tests publics (listing, recherche)
 * - Tests d'administration (CRUD, gestion)
 * - Tests de tirages et statistiques
 * - Tests de charge et gestion d'erreurs
 * 
 * @jest-environment node
 */

const request = require('supertest');
const BaseApiTest = require('../helpers/BaseApiTest');
const TestFactory = require('../helpers/TestFactory');

class OraclesTest extends BaseApiTest {
    constructor() {
        super({
            timeout: 45000,
            retryAttempts: 2,
            cleanupUsers: true
        });
        
        // Données spécifiques aux tests d'oracles
        this.testOracleId = null;
        this.adminAuth = null;
        this.userAuth = null;
        this.testItems = [];
    }

    /**
     * Crée le contexte de test avec authentification admin et utilisateur
     */
    createTestContext() {
        return TestFactory.createAuthTestContext({
            environment: 'test'
        });
    }

    /**
     * Setup personnalisé pour les tests d'oracles
     */
    async customSetup() {
        const server = this.getServer();
        const authHelper = this.getAuthHelper();
        
        // Créer et connecter un admin
        this.adminAuth = await authHelper.createAndLoginAdmin(server);
        this.testUsers.push(this.adminAuth.user);
        
        // Créer et connecter un utilisateur standard
        this.userAuth = await authHelper.createAndLoginUser(server, {
            role: 'UTILISATEUR'
        });
        this.testUsers.push(this.userAuth.user);
        
        // Créer un oracle de test
        await this.createTestOracle();
    }

    /**
     * Cleanup personnalisé pour les données d'oracles
     */
    async customTeardown() {
        const db = this.getDatabaseHelper();
        
        if (this.testOracleId) {
            await db.execute('DELETE FROM oracle_draws WHERE oracle_id = $1', [this.testOracleId]);
            await db.execute('DELETE FROM oracle_items WHERE oracle_id = $1', [this.testOracleId]);
            await db.execute('DELETE FROM oracles WHERE id = $1', [this.testOracleId]);
        }
    }

    /**
     * Crée un oracle de test avec ses éléments
     */
    async createTestOracle() {
        const server = this.getServer();
        
        const oracleData = {
            name: 'Test Oracle Integration',
            description: 'Oracle de test pour les tests d\'intégration',
            premium_required: false,
            is_active: true
        };
        
        const response = await request(server)
            .post('/api/admin/oracles')
            .set('Cookie', this.adminAuth.agent.jar.getCookieString(this.getServerUrl()))
            .send(oracleData);
            
        this.assertApiResponse(response, 201);
        this.testOracleId = response.body.donnees.id;
        
        // Ajouter des éléments de test
        this.testItems = [
            { value: 'Épée Magique', weight: 15, metadata: { type: 'arme', rarity: 'rare' } },
            { value: 'Dague Simple', weight: 30, metadata: { type: 'arme', rarity: 'commune' } },
            { value: 'Arc Long', weight: 25, metadata: { type: 'arme', rarity: 'commune' } },
            { value: 'Bâton de Pouvoir', weight: 5, metadata: { type: 'arme', rarity: 'legendaire' } }
        ];
        
        for (const item of this.testItems) {
            const itemResponse = await request(server)
                .post(`/api/admin/oracles/${this.testOracleId}/items`)
                .set('Cookie', this.adminAuth.agent.jar.getCookieString(this.getServerUrl()))
                .send(item);
                
            this.assertApiResponse(itemResponse, 201);
        }
    }

    /**
     * Effectue une requête en tant qu'admin
     */
    async makeAdminRequest() {
        return request(this.getServer())
            .set('Cookie', this.adminAuth.agent.jar.getCookieString(this.getServerUrl()));
    }

    /**
     * Effectue une requête en tant qu'utilisateur standard
     */
    async makeUserRequest() {
        return request(this.getServer())
            .set('Cookie', this.userAuth.agent.jar.getCookieString(this.getServerUrl()));
    }

    /**
     * Effectue une requête publique (sans authentification)
     */
    async makePublicRequest() {
        return request(this.getServer());
    }
}

// Instance de la classe de test
const oraclesTest = new OraclesTest();

describe('Oracles API Integration Tests - Architecture SOLID', () => {
    beforeAll(async () => {
        await oraclesTest.baseSetup();
    });
    
    afterAll(async () => {
        await oraclesTest.baseTeardown();
    });

    describe('Tests d\'API publique - Listing des oracles', () => {
        it('devrait lister les oracles disponibles', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles');
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees).toHaveProperty('items');
            expect(response.body.donnees).toHaveProperty('pagination');
        });
        
        it('devrait supporter la pagination', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles?page=1&limite=5');
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees.pagination.page).toBe(1);
            expect(response.body.donnees.pagination.limite).toBe(5);
        });
    });

    describe('Tests d\'administration - Création d\'oracles', () => {
        it('devrait créer un oracle en tant qu\'admin', async () => {
            const newOracle = {
                name: 'Nouvel Oracle Test',
                description: 'Oracle créé pendant les tests',
                premium_required: false,
                is_active: true
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post('/api/admin/oracles')
                .send(newOracle);
                
            oraclesTest.assertApiResponse(response, 201);
            expect(response.body.donnees.name).toBe(newOracle.name);
            
            // Nettoyer l'oracle créé
            const oracleId = response.body.donnees.id;
            await oraclesTest.getDatabaseHelper().execute(
                'DELETE FROM oracles WHERE id = $1', [oracleId]
            );
        });
        
        it('devrait rejeter la création par un utilisateur standard', async () => {
            const newOracle = {
                name: 'Oracle Non Autorisé',
                description: 'Ne devrait pas être créé'
            };
            
            const response = await (await oraclesTest.makeUserRequest())
                .post('/api/admin/oracles')
                .send(newOracle);
                
            oraclesTest.assertInsufficientPermissions(response);
        });
        
        it('devrait valider les champs obligatoires', async () => {
            const invalidOracle = {
                description: 'Pas de nom'
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post('/api/admin/oracles')
                .send(invalidOracle);
                
            oraclesTest.assertValidationError(response, 'name');
        });
        
        it('devrait rejeter les tentatives sans authentification', async () => {
            const newOracle = {
                name: 'Oracle Anonyme',
                description: 'Tentative sans auth'
            };
            
            const response = await (await oraclesTest.makePublicRequest())
                .post('/api/admin/oracles')
                .send(newOracle);
                
            oraclesTest.assertAuthenticationRequired(response);
        });
    });

    describe('Tests d\'administration - Gestion des éléments', () => {
        it('devrait ajouter un élément à un oracle', async () => {
            const newItem = {
                value: 'Élément de Test',
                weight: 20,
                metadata: { type: 'objet', rarity: 'commune' },
                is_active: true
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/items`)
                .send(newItem);
                
            oraclesTest.assertApiResponse(response, 201);
            expect(response.body.donnees.value).toBe(newItem.value);
            expect(response.body.donnees.weight).toBe(newItem.weight);
        });
        
        it('devrait rejeter l\'ajout d\'éléments par un utilisateur standard', async () => {
            const newItem = {
                value: 'Élément Interdit',
                weight: 10
            };
            
            const response = await (await oraclesTest.makeUserRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/items`)
                .send(newItem);
                
            oraclesTest.assertInsufficientPermissions(response);
        });
        
        it('devrait valider les données d\'éléments', async () => {
            const invalidItem = {
                weight: 10
                // Pas de valeur
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/items`)
                .send(invalidItem);
                
            oraclesTest.assertValidationError(response, 'value');
        });
        
        it('devrait gérer les oracles inexistants', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const newItem = {
                value: 'Élément Test',
                weight: 10
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${fakeId}/items`)
                .send(newItem);
                
            oraclesTest.assertApiResponse(response, 404, false);
        });
    });

    describe('Tests de tirage - Fonctionnalités de tirage', () => {
        it('devrait effectuer un tirage simple', async () => {
            const drawRequest = {
                count: 1,
                withReplacement: true
            };
            
            const response = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send(drawRequest);
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees.results).toHaveLength(1);
            expect(response.body.donnees.results[0]).toHaveProperty('value');
            expect(response.body.donnees.draw_info.oracle_id).toBe(oraclesTest.testOracleId);
        });
        
        it('devrait effectuer un tirage multiple', async () => {
            const drawRequest = {
                count: 3,
                withReplacement: true
            };
            
            const response = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send(drawRequest);
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees.results).toHaveLength(3);
        });
        
        it('devrait respecter le mode sans remise', async () => {
            const drawRequest = {
                count: 4, // Tous les éléments disponibles
                withReplacement: false
            };
            
            const response = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send(drawRequest);
                
            oraclesTest.assertApiResponse(response, 200);
            const results = response.body.donnees.results;
            expect(results).toHaveLength(4);
            
            // Vérifier l'unicité
            const values = results.map(r => r.value);
            const uniqueValues = [...new Set(values)];
            expect(uniqueValues).toHaveLength(4);
        });
        
        it('devrait valider les paramètres de tirage', async () => {
            // Nombre trop élevé
            const highCountResponse = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send({ count: 101 });
                
            oraclesTest.assertValidationError(highCountResponse, 'count');
                
            // Nombre négatif
            const negativeCountResponse = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send({ count: -1 });
                
            oraclesTest.assertValidationError(negativeCountResponse, 'count');
        });
        
        it('devrait filtrer les données selon les permissions', async () => {
            // Utilisateur standard - ne devrait pas voir les poids
            const userResponse = await (await oraclesTest.makeUserRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send({ count: 1 });
                
            oraclesTest.assertApiResponse(userResponse, 200);
            expect(userResponse.body.donnees.results[0]).not.toHaveProperty('weight');
            
            // Admin - devrait voir les poids
            const adminResponse = await (await oraclesTest.makeAdminRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send({ count: 1 });
                
            oraclesTest.assertApiResponse(adminResponse, 200);
            expect(adminResponse.body.donnees.results[0]).toHaveProperty('weight');
        });
        
        it('devrait gérer les oracles inexistants pour les tirages', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            
            const response = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${fakeId}/draw`)
                .send({ count: 1 });
                
            oraclesTest.assertApiResponse(response, 404, false);
        });
    });

    describe('Tests de statistiques - Données d\'utilisation', () => {
        it('devrait retourner les statistiques d\'un oracle', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get(`/api/oracles/${oraclesTest.testOracleId}/stats`);
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees).toHaveProperty('total_items');
            expect(response.body.donnees).toHaveProperty('active_items');
            expect(response.body.donnees).toHaveProperty('total_draws');
        });
        
        it('devrait filtrer les stats selon les permissions', async () => {
            // Utilisateur standard
            const userResponse = await (await oraclesTest.makeUserRequest())
                .get(`/api/oracles/${oraclesTest.testOracleId}/stats`);
                
            oraclesTest.assertApiResponse(userResponse, 200);
            expect(userResponse.body.donnees).not.toHaveProperty('unique_users');
            
            // Admin
            const adminResponse = await (await oraclesTest.makeAdminRequest())
                .get(`/api/oracles/${oraclesTest.testOracleId}/stats`);
                
            oraclesTest.assertApiResponse(adminResponse, 200);
            expect(adminResponse.body.donnees).toHaveProperty('unique_users');
        });
        
        it('devrait gérer les oracles inexistants pour les stats', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            
            const response = await (await oraclesTest.makePublicRequest())
                .get(`/api/oracles/${fakeId}/stats`);
                
            oraclesTest.assertApiResponse(response, 404, false);
        });
    });

    describe('Tests de recherche - Fonctionnalités de recherche', () => {
        it('devrait rechercher des oracles par nom', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles/search?q=Test');
                
            oraclesTest.assertApiResponse(response, 200);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });
        
        it('devrait valider la longueur de la requête', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles/search?q=a'); // Trop court
                
            oraclesTest.assertValidationError(response);
        });
        
        it('devrait gérer les recherches sans résultats', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles/search?q=MotInexistantDansLaBase');
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees).toHaveLength(0);
        });
    });

    describe('Tests de modification - Mise à jour d\'oracles', () => {
        it('devrait modifier un oracle existant', async () => {
            const updates = {
                name: 'Test Oracle Modifié',
                description: 'Description mise à jour'
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .put(`/api/admin/oracles/${oraclesTest.testOracleId}`)
                .send(updates);
                
            oraclesTest.assertApiResponse(response, 200);
            expect(response.body.donnees.name).toBe(updates.name);
        });
        
        it('devrait rejeter les modifications par un utilisateur standard', async () => {
            const response = await (await oraclesTest.makeUserRequest())
                .put(`/api/admin/oracles/${oraclesTest.testOracleId}`)
                .send({ name: 'Hack Attempt' });
                
            oraclesTest.assertInsufficientPermissions(response);
        });
        
        it('devrait gérer les oracles inexistants pour la modification', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            
            const response = await (await oraclesTest.makeAdminRequest())
                .put(`/api/admin/oracles/${fakeId}`)
                .send({ name: 'Test' });
                
            oraclesTest.assertApiResponse(response, 404, false);
        });
    });

    describe('Tests de gestion de statut - Activation/Désactivation', () => {
        it('devrait basculer le statut d\'un oracle', async () => {
            // Désactiver
            const response1 = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/toggle`);
                
            oraclesTest.assertApiResponse(response1, 200);
            expect(response1.body.donnees.is_active).toBe(false);
            
            // Réactiver
            const response2 = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/toggle`);
                
            oraclesTest.assertApiResponse(response2, 200);
            expect(response2.body.donnees.is_active).toBe(true);
        });
        
        it('devrait rejeter la bascule par un utilisateur standard', async () => {
            const response = await (await oraclesTest.makeUserRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/toggle`);
                
            oraclesTest.assertInsufficientPermissions(response);
        });
    });

    describe('Tests de clonage - Duplication d\'oracles', () => {
        it('devrait cloner un oracle avec ses éléments', async () => {
            const cloneRequest = {
                newName: 'Clone de Test Oracle'
            };
            
            const response = await (await oraclesTest.makeAdminRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/clone`)
                .send(cloneRequest);
                
            oraclesTest.assertApiResponse(response, 201);
            expect(response.body.donnees.name).toBe(cloneRequest.newName);
            expect(response.body.donnees.items.length).toBeGreaterThan(0);
            
            // Nettoyer le clone
            const cloneId = response.body.donnees.id;
            await oraclesTest.getDatabaseHelper().execute(
                'DELETE FROM oracle_items WHERE oracle_id = $1', [cloneId]
            );
            await oraclesTest.getDatabaseHelper().execute(
                'DELETE FROM oracles WHERE id = $1', [cloneId]
            );
        });
        
        it('devrait rejeter le clonage par un utilisateur standard', async () => {
            const cloneRequest = {
                newName: 'Clone Non Autorisé'
            };
            
            const response = await (await oraclesTest.makeUserRequest())
                .post(`/api/admin/oracles/${oraclesTest.testOracleId}/clone`)
                .send(cloneRequest);
                
            oraclesTest.assertInsufficientPermissions(response);
        });
    });

    describe('Tests de gestion d\'erreurs - Robustesse', () => {
        it('devrait gérer les oracles inexistants', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            
            const getResponse = await (await oraclesTest.makePublicRequest())
                .get(`/api/oracles/${fakeId}`);
                
            oraclesTest.assertApiResponse(getResponse, 404, false);
        });
        
        it('devrait gérer les permissions manquantes', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .post('/api/admin/oracles')
                .send({ name: 'Unauthorized' });
                
            oraclesTest.assertAuthenticationRequired(response);
        });
        
        it('devrait gérer les paramètres malformés', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                .send({ count: 'invalid' });
                
            oraclesTest.assertValidationError(response);
        });
        
        it('devrait gérer les ID malformés', async () => {
            const response = await (await oraclesTest.makePublicRequest())
                .get('/api/oracles/invalid-uuid');
                
            oraclesTest.assertValidationError(response);
        });
    });

    describe('Tests de charge - Performance et concurrence', () => {
        it('devrait gérer plusieurs tirages simultanés', async () => {
            await oraclesTest.withRetry(async () => {
                const promises = [];
                const concurrentRequests = 10;
                
                for (let i = 0; i < concurrentRequests; i++) {
                    promises.push(
                        (await oraclesTest.makePublicRequest())
                            .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                            .send({ count: 1, withReplacement: true })
                    );
                }
                
                const responses = await Promise.all(promises);
                
                responses.forEach(response => {
                    oraclesTest.assertApiResponse(response, 200);
                });
            }, 3);
        });
        
        it('devrait maintenir la performance avec des requêtes séquentielles', async () => {
            const startTime = Date.now();
            const sequentialRequests = 5;
            
            for (let i = 0; i < sequentialRequests; i++) {
                const response = await (await oraclesTest.makePublicRequest())
                    .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                    .send({ count: 1, withReplacement: true });
                    
                oraclesTest.assertApiResponse(response, 200);
            }
            
            const duration = Date.now() - startTime;
            
            // Vérifier que les requêtes ne prennent pas trop de temps
            expect(duration).toBeLessThan(10000); // 10 secondes max
        });
        
        it('devrait gérer les timeouts avec retry', async () => {
            // Test avec timeout réduit pour vérifier la gestion des erreurs
            await oraclesTest.withRetry(async () => {
                const response = await (await oraclesTest.makePublicRequest())
                    .post(`/api/oracles/${oraclesTest.testOracleId}/draw`)
                    .timeout(5000) // 5 secondes de timeout
                    .send({ count: 1 });
                    
                oraclesTest.assertApiResponse(response, 200);
            });
        });
    });
    
    describe('Résumé des tests', () => {
        it('devrait afficher un résumé des données de test', () => {
            const summary = oraclesTest.getTestSummary();
            
            expect(summary.testUsers).toBeGreaterThan(0);
            expect(summary.serverUrl).toBeDefined();
            expect(summary.configUsed).toBeDefined();
            
            console.log('Résumé des tests d\'oracles:', {
                utilisateursCreés: summary.testUsers,
                serveurUrl: summary.serverUrl,
                oracleTestId: oraclesTest.testOracleId,
                élémentsTest: oraclesTest.testItems.length
            });
        });
    });
});