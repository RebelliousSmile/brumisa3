const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const db = require('../../src/database/db');

describe('Oracles API Integration Tests', () => {
    let adminSession = {};
    let userSession = {};
    let testOracleId;
    
    before(async () => {
        // Assurer que la base est initialisée
        await db.init();
        
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
            
        expect(adminSignup.status).to.equal(201);
        
        // Connexion admin
        const adminLogin = await request(app)
            .post('/api/auth/connexion')
            .send({
                email: adminUser.email,
                mot_de_passe: adminUser.mot_de_passe
            });
            
        expect(adminLogin.status).to.equal(200);
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
    
    after(async () => {
        // Nettoyer la base de test
        if (testOracleId) {
            await db.run('DELETE FROM oracle_draws WHERE oracle_id = $1', [testOracleId]);
            await db.run('DELETE FROM oracle_items WHERE oracle_id = $1', [testOracleId]);
            await db.run('DELETE FROM oracles WHERE id = $1', [testOracleId]);
        }
        
        await db.run('DELETE FROM utilisateurs WHERE email LIKE \'%@test.com\'');
        await db.close();
    });

    describe('GET /api/oracles', () => {
        it('devrait lister les oracles disponibles', async () => {
            const response = await request(app)
                .get('/api/oracles')
                .expect(200);
                
            expect(response.body.succes).to.be.true;
            expect(response.body.donnees).to.have.property('items');
            expect(response.body.donnees).to.have.property('pagination');
        });
        
        it('devrait supporter la pagination', async () => {
            const response = await request(app)
                .get('/api/oracles?page=1&limite=5')
                .expect(200);
                
            expect(response.body.donnees.pagination.page).to.equal(1);
            expect(response.body.donnees.pagination.limite).to.equal(5);
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
            
            const response = await request(app)
                .post('/api/admin/oracles')
                .set('Cookie', adminSession.cookie)
                .send(newOracle)
                .expect(201);
                
            expect(response.body.succes).to.be.true;
            expect(response.body.donnees.name).to.equal(newOracle.name);
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
            
            const response = await request(app)
                .post(`/api/admin/oracles/${testOracleId}/items`)
                .set('Cookie', adminSession.cookie)
                .send(newItem)
                .expect(201);
                
            expect(response.body.succes).to.be.true;
            expect(response.body.donnees.value).to.equal(newItem.value);
            expect(response.body.donnees.weight).to.equal(newItem.weight);
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
            
            const response = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            expect(response.body.succes).to.be.true;
            expect(response.body.donnees.results).to.have.length(1);
            expect(response.body.donnees.results[0]).to.have.property('value');
            expect(response.body.donnees.draw_info.oracle_id).to.equal(testOracleId);
        });
        
        it('devrait effectuer un tirage multiple', async () => {
            const drawRequest = {
                count: 3,
                withReplacement: true
            };
            
            const response = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            expect(response.body.donnees.results).to.have.length(3);
        });
        
        it('devrait respecter le mode sans remise', async () => {
            const drawRequest = {
                count: 4, // Tous les éléments disponibles
                withReplacement: false
            };
            
            const response = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .send(drawRequest)
                .expect(200);
                
            const results = response.body.donnees.results;
            expect(results).to.have.length(4);
            
            // Vérifier l'unicité
            const values = results.map(r => r.value);
            const uniqueValues = [...new Set(values)];
            expect(uniqueValues).to.have.length(4);
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
                
            expect(userResponse.body.donnees.results[0]).to.not.have.property('weight');
            
            // Admin - devrait voir les poids
            const adminResponse = await request(app)
                .post(`/api/oracles/${testOracleId}/draw`)
                .set('Cookie', adminSession.cookie)
                .send({ count: 1 })
                .expect(200);
                
            expect(adminResponse.body.donnees.results[0]).to.have.property('weight');
        });
    });

    describe('GET /api/oracles/:id/stats', () => {
        it('devrait retourner les statistiques d\'un oracle', async () => {
            const response = await request(app)
                .get(`/api/oracles/${testOracleId}/stats`)
                .expect(200);
                
            expect(response.body.succes).to.be.true;
            expect(response.body.donnees).to.have.property('total_items');
            expect(response.body.donnees).to.have.property('active_items');
            expect(response.body.donnees).to.have.property('total_draws');
        });
        
        it('devrait filtrer les stats selon les permissions', async () => {
            // Utilisateur standard
            const userResponse = await request(app)
                .get(`/api/oracles/${testOracleId}/stats`)
                .set('Cookie', userSession.cookie)
                .expect(200);
                
            expect(userResponse.body.donnees).to.not.have.property('unique_users');
            
            // Admin
            const adminResponse = await request(app)
                .get(`/api/oracles/${testOracleId}/stats`)
                .set('Cookie', adminSession.cookie)
                .expect(200);
                
            expect(adminResponse.body.donnees).to.have.property('unique_users');
        });
    });

    describe('GET /api/oracles/search', () => {
        it('devrait rechercher des oracles par nom', async () => {
            const response = await request(app)
                .get('/api/oracles/search?q=Test')
                .expect(200);
                
            expect(response.body.succes).to.be.true;
            expect(Array.isArray(response.body.donnees)).to.be.true;
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
            
            const response = await request(app)
                .put(`/api/admin/oracles/${testOracleId}`)
                .set('Cookie', adminSession.cookie)
                .send(updates)
                .expect(200);
                
            expect(response.body.donnees.name).to.equal(updates.name);
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
                
            expect(response1.body.donnees.is_active).to.be.false;
            
            // Réactiver
            const response2 = await request(app)
                .post(`/api/admin/oracles/${testOracleId}/toggle`)
                .set('Cookie', adminSession.cookie)
                .expect(200);
                
            expect(response2.body.donnees.is_active).to.be.true;
        });
    });

    describe('POST /api/admin/oracles/:id/clone', () => {
        it('devrait cloner un oracle avec ses éléments', async () => {
            const cloneRequest = {
                newName: 'Clone de Test Oracle'
            };
            
            const response = await request(app)
                .post(`/api/admin/oracles/${testOracleId}/clone`)
                .set('Cookie', adminSession.cookie)
                .send(cloneRequest)
                .expect(201);
                
            expect(response.body.donnees.name).to.equal(cloneRequest.newName);
            expect(response.body.donnees.items).to.have.length.greaterThan(0);
            
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
                expect(response.status).to.equal(200);
                expect(response.body.succes).to.be.true;
            });
        });
    });
});