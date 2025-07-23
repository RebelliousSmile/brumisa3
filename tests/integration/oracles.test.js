/**
 * Tests d'intégration pour l'API Oracles - Migration vers Jest
 */
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/db');
const { setupTest, teardownTest, cleanupTestData } = require('../helpers/test-cleanup');

describe('Oracles API Integration Tests', () => {
    let server;
    let adminSession = {};
    let userSession = {};
    let testOracleId;
    
    beforeAll(async () => {
        server = await setupTest(app);
        
        // Créer un utilisateur admin pour les tests
        const adminUser = {
            nom: 'Admin Test',
            email: 'admin@test.com',
            mot_de_passe: 'password123',
            role: 'ADMIN'
        };
        
        // Inscription admin
        const adminSignup = await request(app)
            .post('/api/auth/inscription')
            .send(adminUser);
            
        expect(adminSignup.status).toBe(201);
        
        // Connexion admin
        const adminLogin = await request(app)
            .post('/api/auth/connexion')
            .send({
                email: adminUser.email,
                mot_de_passe: adminUser.mot_de_passe
            });
            
        expect(adminLogin.status).toBe(200);
        adminSession.cookie = adminLogin.headers['set-cookie'];
        
        // Créer un utilisateur standard
        const standardUser = {
            nom: 'User Test',
            email: 'user@test.com',
            mot_de_passe: 'password123',
            role: 'UTILISATEUR'
        };
        
        const userSignup = await request(app)
            .post('/api/auth/inscription')
            .send(standardUser);
            
        const userLogin = await request(app)
            .post('/api/auth/connexion')
            .send({
                email: standardUser.email,
                mot_de_passe: standardUser.mot_de_passe
            });
            
        userSession.cookie = userLogin.headers['set-cookie'];
    });
    
    afterAll(async () => {
        // Nettoyer la base de test
        if (testOracleId) {
            await db.run('DELETE FROM oracle_draws WHERE oracle_id = $1', [testOracleId]);
            await db.run('DELETE FROM oracle_items WHERE oracle_id = $1', [testOracleId]);
            await db.run('DELETE FROM oracles WHERE id = $1', [testOracleId]);
        }
        
        await db.run('DELETE FROM utilisateurs WHERE email LIKE \'%@test.com\'');
        await teardownTest(server);
    });

    describe('GET /api/oracles', () => {
        it('devrait lister les oracles disponibles', async () => {
            const response = await request(server)
                .get('/api/oracles')
                .expect(200);
                
            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('items');
            expect(response.body.donnees).toHaveProperty('pagination');
        });
        
        it('devrait supporter la pagination', async () => {
            const response = await request(server)
                .get('/api/oracles?page=1&limite=5')
                .expect(200);
                
            expect(response.body.donnees.pagination.page).toBe(1);
            expect(response.body.donnees.pagination.limite).toBe(5);
        });
    });

    describe('POST /api/admin/oracles', () => {
        it('devrait créer un oracle en tant qu\'admin', async () => {
            const newOracle = {
                name: 'Test Oracle Integration',
                description: 'Oracle de test pour les tests d\'intégration',
                premium_required: false,
                is_active: true
            };
            
            const response = await request(server)
                .post('/api/admin/oracles')
                .set('Cookie', adminSession.cookie)
                .send(newOracle)
                .expect(201);
                
            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.name).toBe(newOracle.name);
            testOracleId = response.body.donnees.id;
        });
        
        it('devrait rejeter la création par un utilisateur standard', async () => {
            const newOracle = {
                name: 'Oracle Non Autorisé',
                description: 'Ne devrait pas être créé'
            };
            
            await request(app)
                .post('/api/admin/oracles')
                .set('Cookie', userSession.cookie)
                .send(newOracle)
                .expect(403);
        });
        
        it('devrait valider les champs obligatoires', async () => {
            const invalidOracle = {
                description: 'Pas de nom'
            };
            
            await request(app)
                .post('/api/admin/oracles')
                .set('Cookie', adminSession.cookie)
                .send(invalidOracle)
                .expect(400);
        });
    });

    describe('POST /api/admin/oracles/:id/items', () => {
        it('devrait ajouter des éléments à un oracle', async () => {
            const newItem = {
                value: 'Épée Magique',
                weight: 15,
                metadata: { type: 'arme', rarity: 'rare' },
                is_active: true
            };
            
            const response = await request(server)
                .post(`/api/admin/oracles/${testOracleId}/items`)
                .set('Cookie', adminSession.cookie)
                .send(newItem)
                .expect(201);
                
            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.value).toBe(newItem.value);
            expect(response.body.donnees.weight).toBe(newItem.weight);
        });
        
        it('devrait ajouter plusieurs éléments pour les tests de tirage', async () => {
            const items = [
                { value: 'Dague Simple', weight: 30, metadata: { type: 'arme', rarity: 'commune' } },
                { value: 'Arc Long', weight: 25, metadata: { type: 'arme', rarity: 'commune' } },
                { value: 'Bâton de Pouvoir', weight: 5, metadata: { type: 'arme', rarity: 'legendaire' } }
            ];
            
            for (const item of items) {
                await request(app)
                    .post(`/api/admin/oracles/${testOracleId}/items`)
                    .set('Cookie', adminSession.cookie)
                    .send(item)
                    .expect(201);
            }
        });
    });

    describe('POST /api/oracles/:id/draw', () => {
        it('devrait effectuer un tirage simple', async () => {
            const drawRequest = {
                count: 1,
                withReplacement: true
            };
            
            const response = await request(server)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            expect(response.body.succes).toBe(true);
            expect(response.body.donnees.results).toHaveLength(1);
            expect(response.body.donnees.results[0]).toHaveProperty('value');
            expect(response.body.donnees.draw_info.oracle_id).toBe(testOracleId);
        });
        
        it('devrait effectuer un tirage multiple', async () => {
            const drawRequest = {
                count: 3,
                withReplacement: true
            };
            
            const response = await request(server)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            expect(response.body.donnees.results).toHaveLength(3);
        });
        
        it('devrait respecter le mode sans remise', async () => {
            const drawRequest = {
                count: 4, // Tous les éléments disponibles
                withReplacement: false
            };
            
            const response = await request(server)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            const results = response.body.donnees.results;
            expect(results).toHaveLength(4);
            
            // Vérifier l'unicité
            const values = results.map(r => r.value);
            const uniqueValues = [...new Set(values)];
            expect(uniqueValues).toHaveLength(4);
        });
        
        it('devrait valider les paramètres de tirage', async () => {
            // Nombre trop élevé
            await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send({ count: 101 })
                .expect(400);
                
            // Nombre négatif
            await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send({ count: -1 })
                .expect(400);
        });
        
        it('devrait filtrer les données selon les permissions', async () => {
            // Utilisateur standard - ne devrait pas voir les poids
            const userResponse = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .set('Cookie', userSession.cookie)
                .send({ count: 1 })
                .expect(200);
                
            expect(userResponse.body.donnees.results[0]).not.toHaveProperty('weight');
            
            // Admin - devrait voir les poids
            const adminResponse = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .set('Cookie', adminSession.cookie)
                .send({ count: 1 })
                .expect(200);
                
            expect(adminResponse.body.donnees.results[0]).toHaveProperty('weight');
        });
    });

    describe('GET /api/oracles/:id/stats', () => {
        it('devrait retourner les statistiques d\'un oracle', async () => {
            const response = await request(server)
                .get(`/api/oracles/${testOracleId}/stats`)
                .expect(200);
                
            expect(response.body.succes).toBe(true);
            expect(response.body.donnees).toHaveProperty('total_items');
            expect(response.body.donnees).toHaveProperty('active_items');
            expect(response.body.donnees).toHaveProperty('total_draws');
        });
        
        it('devrait filtrer les stats selon les permissions', async () => {
            // Utilisateur standard
            const userResponse = await request(app)
                .get(`/api/oracles/${testOracleId}/stats`)
                .set('Cookie', userSession.cookie)
                .expect(200);
                
            expect(userResponse.body.donnees).not.toHaveProperty('unique_users');
            
            // Admin
            const adminResponse = await request(app)
                .get(`/api/oracles/${testOracleId}/stats`)
                .set('Cookie', adminSession.cookie)
                .expect(200);
                
            expect(adminResponse.body.donnees).toHaveProperty('unique_users');
        });
    });

    describe('GET /api/oracles/search', () => {
        it('devrait rechercher des oracles par nom', async () => {
            const response = await request(server)
                .get('/api/oracles/search?q=Test')
                .expect(200);
                
            expect(response.body.succes).toBe(true);
            expect(Array.isArray(response.body.donnees)).toBe(true);
        });
        
        it('devrait valider la longueur de la requête', async () => {
            await request(app)
                .get('/api/oracles/search?q=a') // Trop court
                .expect(400);
        });
    });

    describe('PUT /api/admin/oracles/:id', () => {
        it('devrait modifier un oracle existant', async () => {
            const updates = {
                name: 'Test Oracle Modifié',
                description: 'Description mise à jour'
            };
            
            const response = await request(server)
                .put(`/api/admin/oracles/${testOracleId}`)
                .set('Cookie', adminSession.cookie)
                .send(updates)
                .expect(200);
                
            expect(response.body.donnees.name).toBe(updates.name);
        });
        
        it('devrait rejeter les modifications par un utilisateur standard', async () => {
            await request(app)
                .put(`/api/admin/oracles/${testOracleId}`)
                .set('Cookie', userSession.cookie)
                .send({ name: 'Hack Attempt' })
                .expect(403);
        });
    });

    describe('POST /api/admin/oracles/:id/toggle', () => {
        it('devrait basculer le statut d\'un oracle', async () => {
            // Désactiver
            const response1 = await request(app)
                .post(`/api/admin/oracles/${testOracleId}/toggle`)
                .set('Cookie', adminSession.cookie)
                .expect(200);
                
            expect(response1.body.donnees.is_active).toBe(false);
            
            // Réactiver
            const response2 = await request(app)
                .post(`/api/admin/oracles/${testOracleId}/toggle`)
                .set('Cookie', adminSession.cookie)
                .expect(200);
                
            expect(response2.body.donnees.is_active).toBe(true);
        });
    });

    describe('POST /api/admin/oracles/:id/clone', () => {
        it('devrait cloner un oracle avec ses éléments', async () => {
            const cloneRequest = {
                newName: 'Clone de Test Oracle'
            };
            
            const response = await request(server)
                .post(`/api/admin/oracles/${testOracleId}/clone`)
                .set('Cookie', adminSession.cookie)
                .send(cloneRequest)
                .expect(201);
                
            expect(response.body.donnees.name).toBe(cloneRequest.newName);
            expect(response.body.donnees.items.length).toBeGreaterThan(0);
            
            // Nettoyer le clone
            const cloneId = response.body.donnees.id;
            await db.run('DELETE FROM oracle_items WHERE oracle_id = $1', [cloneId]);
            await db.run('DELETE FROM oracles WHERE id = $1', [cloneId]);
        });
    });

    describe('Gestion des erreurs', () => {
        it('devrait gérer les oracles inexistants', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            
            await request(app)
                .get(`/api/oracles/${fakeId}`)
                .expect(404);
                
            await request(app)
                .post(`/api/oracles/${fakeId}/draw`)
                .send({ count: 1 })
                .expect(404);
        });
        
        it('devrait gérer les permissions manquantes', async () => {
            await request(app)
                .post('/api/admin/oracles')
                .send({ name: 'Unauthorized' })
                .expect(401);
        });
    });

    describe('Test de charge basique', () => {
        it('devrait gérer plusieurs tirages simultanés', async () => {
            const promises = [];
            const concurrentRequests = 10;
            
            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(
                    request(app)
                        .post(`/api/oracles/${testOracleId}/draw`)
                        .send({ count: 1, withReplacement: true })
                );
            }
            
            const responses = await Promise.all(promises);
            
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.succes).toBe(true);
            });
        });
    });
});