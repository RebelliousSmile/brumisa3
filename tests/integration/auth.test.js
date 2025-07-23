const request = require('supertest');
const crypto = require('crypto');
const app = require('../../src/app');
const db = require('../../src/database/db');
const { setupTest, teardownTest, cleanupTestData } = require('../helpers/test-cleanup');

describe('Authentication API Integration Tests', () => {
    let server;
    let testUser;

    beforeAll(async () => {
        // Initialiser l'app et nettoyer les données de test
        server = await setupTest(app);
    });

    beforeEach(async () => {
        // Créer un utilisateur de test pour chaque test
        const email = `test_${crypto.randomBytes(8).toString('hex')}@example.com`;
        const nom = 'Test User';
        const motDePasse = 'testPassword123!';

        // Insérer directement en base pour éviter les dépendances
        // Utiliser un hash simple pour les tests
        const simpleHash = require('crypto').createHash('sha256').update(motDePasse).digest('hex');
        const result = await db.get(
            `INSERT INTO utilisateurs (nom, email, mot_de_passe, role, actif) 
             VALUES ($1, $2, $3, 'UTILISATEUR', true) 
             RETURNING id, nom, email, role, actif`,
            [nom, email, simpleHash]
        );

        testUser = { ...result, password: motDePasse };
    });

    afterEach(async () => {
        // Nettoyer l'utilisateur de test
        if (testUser?.id) {
            await db.run('DELETE FROM utilisateurs WHERE id = $1', [testUser.id]);
        }
    });

    afterAll(async () => {
        // Nettoyer après les tests
        if (app.server) {
            await app.shutdown();
        }
    });

    describe('POST /api/auth/mot-de-passe-oublie', () => {
        test('should generate and persist password reset token for existing user', async () => {
            // Act: Demander la récupération de mot de passe
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            // Assert: Vérifier la réponse
            expect(response.body).toHaveProperty('succes', true);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Si cet email existe');

            // CRUCIAL: Vérifier que le token est bien persisté en base
            const userInDb = await db.get(
                'SELECT id, email, token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb).toBeTruthy();
            expect(userInDb.token_recuperation).toBeTruthy();
            expect(userInDb.token_expiration).toBeTruthy();

            // Vérifier que le token fait 64 caractères (32 bytes en hex)
            expect(userInDb.token_recuperation).toHaveLength(64);

            // Vérifier que l'expiration est dans le futur (environ 1 heure)
            const expiration = new Date(userInDb.token_expiration);
            const now = new Date();
            const diffMinutes = Math.floor((expiration - now) / (1000 * 60));
            
            expect(diffMinutes).toBeGreaterThan(50); // Au moins 50 minutes
            expect(diffMinutes).toBeLessThan(70); // Moins de 70 minutes
        });

        test('should not reveal if email does not exist', async () => {
            const fakeEmail = 'nonexistent@example.com';

            // Act
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: fakeEmail })
                .expect(200);

            // Assert: Même réponse que pour un email existant (sécurité)
            expect(response.body).toHaveProperty('succes', true);
            expect(response.body.message).toContain('Si cet email existe');
        });

        test('should not generate token for inactive user', async () => {
            // Arrange: Désactiver l'utilisateur
            await db.run(
                'UPDATE utilisateurs SET actif = false WHERE id = $1',
                [testUser.id]
            );

            // Act
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            // Assert: Même réponse (sécurité) mais pas de token généré
            expect(response.body).toHaveProperty('succes', true);
            
            // Vérifier qu'aucun token n'a été généré
            const userInDb = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBeNull();
        });

        test('should validate required email field', async () => {
            // Act: Requête sans email
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({})
                .expect(400);

            // Assert
            expect(response.body).toHaveProperty('succes', false);
            expect(response.body).toHaveProperty('erreur');
        });

        test('should validate email format', async () => {
            // Act: Email invalide
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: 'invalid-email' })
                .expect(400);

            // Assert
            expect(response.body).toHaveProperty('succes', false);
            expect(response.body).toHaveProperty('erreur');
        });

        test('should replace old token when generating new one', async () => {
            // Arrange: Générer un premier token
            await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            const firstToken = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            // Act: Générer un deuxième token
            await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            // Assert: Le token doit être différent
            const secondToken = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(secondToken.token_recuperation).toBeTruthy();
            expect(secondToken.token_recuperation).not.toBe(firstToken.token_recuperation);
        });
    });

    describe('Token Recovery Validation', () => {
        let resetToken;

        beforeEach(async () => {
            // Générer un token de récupération pour les tests
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            // Récupérer le token généré
            const userWithToken = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            resetToken = userWithToken.token_recuperation;
        });

        test('should validate fresh token correctly', async () => {
            // Utiliser le service directement pour tester la validation
            const UtilisateurService = require('../../src/services/UtilisateurService');
            const utilisateurService = new UtilisateurService();

            // Act
            const result = await utilisateurService.validerTokenRecuperation(resetToken);

            // Assert
            expect(result).toBeTruthy();
            expect(result.id).toBe(testUser.id);
            expect(result.email).toBe(testUser.email);
            expect(result.token_recuperation).toBe(resetToken);
        });

        test('should reject invalid token', async () => {
            const UtilisateurService = require('../../src/services/UtilisateurService');
            const utilisateurService = new UtilisateurService();

            const invalidToken = 'invalid_token_123';

            // Act
            const result = await utilisateurService.validerTokenRecuperation(invalidToken);

            // Assert
            expect(result).toBeNull();
        });

        test('should reject expired token', async () => {
            // Arrange: Expirer le token en modifiant sa date d'expiration
            await db.run(
                'UPDATE utilisateurs SET token_expiration = $1 WHERE id = $2',
                [new Date(Date.now() - 1000), testUser.id] // Expiré il y a 1 seconde
            );

            const UtilisateurService = require('../../src/services/UtilisateurService');
            const utilisateurService = new UtilisateurService();

            // Act
            const result = await utilisateurService.validerTokenRecuperation(resetToken);

            // Assert
            expect(result).toBeNull();

            // Vérifier que le token expiré a été nettoyé
            const cleanedUser = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(cleanedUser.token_recuperation).toBeNull();
            expect(cleanedUser.token_expiration).toBeNull();
        });

        test('should clean token after password reset', async () => {
            const UtilisateurService = require('../../src/services/UtilisateurService');
            const utilisateurService = new UtilisateurService();

            const newPassword = 'newSecurePassword123!';

            // Act: Réinitialiser le mot de passe
            await utilisateurService.mettreAJourMotDePasse(testUser.id, newPassword);

            // Assert: Vérifier que le token a été nettoyé
            const userAfterReset = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userAfterReset.token_recuperation).toBeNull();
            expect(userAfterReset.token_expiration).toBeNull();
        });
    });

    describe('Model Fillable Fields Validation', () => {
        test('should allow updating token_recuperation and token_expiration fields', async () => {
            const Utilisateur = require('../../src/models/Utilisateur');
            const utilisateurModel = new Utilisateur();

            const testToken = crypto.randomBytes(32).toString('hex');
            const testExpiration = new Date(Date.now() + 60 * 60 * 1000);

            // Act: Tenter de mettre à jour les champs de token
            const result = await utilisateurModel.update(testUser.id, {
                token_recuperation: testToken,
                token_expiration: testExpiration
            });

            // Assert: La mise à jour doit réussir
            expect(result).toBeTruthy();
            expect(result.id).toBe(testUser.id);

            // Vérifier en base que les champs ont été mis à jour
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(testToken);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(testExpiration.getTime());
        });

        test('should include token fields in fillable array', () => {
            const Utilisateur = require('../../src/models/Utilisateur');
            const utilisateurModel = new Utilisateur();

            // Assert: Vérifier que les champs sont dans fillable
            expect(utilisateurModel.fillable).toContain('token_recuperation');
            expect(utilisateurModel.fillable).toContain('token_expiration');
        });
    });

    describe('Email Service Integration', () => {
        test('should send password reset email when token is generated', async () => {
            // Ce test nécessiterait de mocker le service email ou d'utiliser un service de test
            // Pour l'instant, on vérifie juste que le processus ne lève pas d'erreur
            const response = await request(server)
                .post('/api/auth/mot-de-passe-oublie')
                .send({ email: testUser.email })
                .expect(200);

            expect(response.body.succes).toBe(true);
        });
    });

    afterEach(async () => {
        // Nettoyer les données de test après chaque test
        await cleanupTestData(testUser);
        testUser = null;
    });

    afterAll(async () => {
        // Fermer proprement toutes les connexions
        await teardownTest(server);
    });
});