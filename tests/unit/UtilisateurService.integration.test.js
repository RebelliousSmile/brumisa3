/**
 * Tests d'intégration pour UtilisateurService avec pattern SOLID
 * Principe SOLID : Single Responsibility - Tests focalisés sur une seule responsabilité
 */

const crypto = require('crypto');
const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');
const UtilisateurService = require('../../src/services/UtilisateurService');
const db = require('../../src/database/db');

class UtilisateurServiceIntegrationTest extends BaseUnitTest {
    constructor() {
        super({ mockDatabase: false, mockExternalServices: false }); // Tests d'intégration avec vraie DB
        this.testContext = UnitTestFactory.createServiceTestContext('UtilisateurService');
        this.utilisateurService = null;
        this.testUser = null;
    }

    async customSetup() {
        this.utilisateurService = new UtilisateurService();
    }

    async createTestUser() {
        const email = `test_${crypto.randomBytes(8).toString('hex')}@example.com`;
        const nom = 'Test User';
        const motDePasse = 'testPassword123!';

        return await this.utilisateurService.creer({
            nom,
            email,
            mot_de_passe: motDePasse,
            role: 'UTILISATEUR'
        });
    }

    async cleanupTestUser() {
        if (this.testUser?.id) {
            await db.run('DELETE FROM utilisateurs WHERE id = $1', [this.testUser.id]);
        }
    }
}

describe('UtilisateurService Integration Tests', () => {
    let testInstance;

    beforeAll(async () => {
        testInstance = new UtilisateurServiceIntegrationTest();
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });

    beforeEach(async () => {
        testInstance.testUser = await testInstance.createTestUser();
    });

    afterEach(async () => {
        await testInstance.cleanupTestUser();
    });

    describe('Token Recovery Management', () => {
        test('should generate and persist token correctly', async () => {
            // Act
            const result = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);

            // Assert
            testInstance.assertObjectStructure(result, {
                token: expect.any(String),
                expiration: expect.any(Date)
            });
            expect(result.token).toHaveLength(64); // 32 bytes en hex

            // Vérifier la persistance en base
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testInstance.testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(result.token);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(result.expiration.getTime());
        });

        test('should validate token correctly after generation', async () => {
            // Arrange
            const tokenResult = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);

            // Act
            const validation = await testInstance.utilisateurService.validerTokenRecuperation(tokenResult.token);

            // Assert
            testInstance.assertObjectStructure(validation, {
                id: testInstance.testUser.id,
                email: testInstance.testUser.email,
                token_recuperation: tokenResult.token
            });
        });

        test('should return null for non-existent email', async () => {
            // Act & Assert
            await testInstance.assertAsyncFunction(
                (email) => testInstance.utilisateurService.genererTokenRecuperation(email),
                'nonexistent@example.com',
                null
            );
        });

        test('should return null for inactive user', async () => {
            // Arrange: Désactiver l'utilisateur
            await testInstance.utilisateurService.mettreAJour(testInstance.testUser.id, { actif: false });

            // Act & Assert
            await testInstance.assertAsyncFunction(
                (email) => testInstance.utilisateurService.genererTokenRecuperation(email),
                testInstance.testUser.email,
                null
            );
        });

        test('should replace existing token when generating new one', async () => {
            // Arrange
            const firstToken = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);
            
            // Act
            const secondToken = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);

            // Assert
            expect(secondToken.token).not.toBe(firstToken.token);
            
            // Vérifier que seul le nouveau token est en base
            const userInDb = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testInstance.testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(secondToken.token);
        });

        test('should handle token expiration correctly', async () => {
            // Arrange: Créer un token et l'expirer manuellement
            const tokenResult = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);
            
            // Expirer le token en base
            await db.run(
                'UPDATE utilisateurs SET token_expiration = $1 WHERE id = $2',
                [new Date(Date.now() - 1000), testInstance.testUser.id]
            );

            // Act & Assert
            await testInstance.assertAsyncFunction(
                (token) => testInstance.utilisateurService.validerTokenRecuperation(token),
                tokenResult.token,
                null
            );

            // Vérifier que le token expiré a été nettoyé
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testInstance.testUser.id]
            );

            expect(userInDb.token_recuperation).toBeNull();
            expect(userInDb.token_expiration).toBeNull();
        });

        test('should clean token after password update', async () => {
            // Arrange
            const tokenResult = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);
            
            // Act: Mettre à jour le mot de passe
            await testInstance.utilisateurService.mettreAJourMotDePasse(testInstance.testUser.id, 'newPassword123!');

            // Assert: Le token doit être nettoyé
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testInstance.testUser.id]
            );

            expect(userInDb.token_recuperation).toBeNull();
            expect(userInDb.token_expiration).toBeNull();
        });
    });

    describe('Model Field Validation', () => {
        test('should successfully update token fields through service', async () => {
            const testToken = crypto.randomBytes(32).toString('hex');
            const testExpiration = new Date(Date.now() + 60 * 60 * 1000);

            // Act: Utiliser la méthode mettreAJour du service
            const result = await testInstance.utilisateurService.mettreAJour(testInstance.testUser.id, {
                token_recuperation: testToken,
                token_expiration: testExpiration
            });

            // Assert
            testInstance.assertObjectStructure(result, {
                id: testInstance.testUser.id
            });

            // Vérifier en base
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testInstance.testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(testToken);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(testExpiration.getTime());
        });

        test('should filter out non-allowed fields correctly', async () => {
            // Act: Essayer de mettre à jour des champs non autorisés
            const result = await testInstance.utilisateurService.mettreAJour(testInstance.testUser.id, {
                id: 999, // Champ protégé
                date_creation: new Date(), // Champ protégé
                nom: 'Nouveau nom', // Champ autorisé
                champ_inexistant: 'valeur' // Champ inexistant
            });

            // Assert: Seuls les champs autorisés doivent être mis à jour
            expect(result.nom).toBe('Nouveau nom');
            expect(result.id).toBe(testInstance.testUser.id); // ID inchangé
        });
    });

    describe('Token Security Tests', () => {
        test('should generate cryptographically secure tokens', async () => {
            // Arrange: Générer plusieurs tokens
            const tokens = [];
            for (let i = 0; i < 5; i++) {
                const result = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);
                tokens.push(result.token);
            }

            // Assert: Tous les tokens doivent être différents
            const uniqueTokens = new Set(tokens);
            expect(uniqueTokens.size).toBe(tokens.length);

            // Vérifier que les tokens sont bien hexadécimaux
            tokens.forEach(token => {
                expect(token).toMatch(/^[a-f0-9]{64}$/);
            });
        });

        test('should set appropriate expiration time', async () => {
            const beforeGeneration = new Date();
            
            // Act
            const result = await testInstance.utilisateurService.genererTokenRecuperation(testInstance.testUser.email);
            
            const afterGeneration = new Date();

            // Assert: L'expiration doit être dans environ 1 heure
            const expectedExpiration = new Date(beforeGeneration.getTime() + 60 * 60 * 1000);
            const actualExpiration = result.expiration;

            // Tolérance de 1 minute
            const tolerance = 60 * 1000;
            expect(actualExpiration.getTime()).toBeGreaterThan(expectedExpiration.getTime() - tolerance);
            expect(actualExpiration.getTime()).toBeLessThan(expectedExpiration.getTime() + tolerance);
        });
    });

    describe('Error Handling', () => {
        test('should handle database errors gracefully', async () => {
            // Arrange: Utiliser un ID utilisateur inexistant
            const fakeId = 99999;

            // Act & Assert
            await testInstance.assertThrowsAsync(
                async (id) => testInstance.utilisateurService.mettreAJour(id, {
                    token_recuperation: 'test',
                    token_expiration: new Date()
                }),
                fakeId,
                'Utilisateur non trouvé'
            );
        });

        test('should validate email format in genererTokenRecuperation', async () => {
            // Act & Assert: Tester avec un email malformé
            await testInstance.assertAsyncFunction(
                (email) => testInstance.utilisateurService.genererTokenRecuperation(email),
                'invalid-email',
                null
            );
        });
    });
});