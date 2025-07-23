/**
 * Tests d'intégration pour UtilisateurService
 * Ces tests utilisent la vraie base de données pour détecter les problèmes de configuration
 */

const crypto = require('crypto');
const UtilisateurService = require('../../src/services/UtilisateurService');
const db = require('../../src/database/db');

describe('UtilisateurService Integration Tests', () => {
    let utilisateurService;
    let testUser;

    beforeAll(async () => {
        utilisateurService = new UtilisateurService();
    });

    beforeEach(async () => {
        // Créer un utilisateur de test pour chaque test
        const email = `test_${crypto.randomBytes(8).toString('hex')}@example.com`;
        const nom = 'Test User';
        const motDePasse = 'testPassword123!';

        // Utiliser le service pour créer l'utilisateur
        testUser = await utilisateurService.creer({
            nom,
            email,
            mot_de_passe: motDePasse,
            role: 'UTILISATEUR'
        });
    });

    afterEach(async () => {
        // Nettoyer l'utilisateur de test
        if (testUser?.id) {
            await db.run('DELETE FROM utilisateurs WHERE id = $1', [testUser.id]);
        }
    });

    describe('Token Recovery Management', () => {
        test('should generate and persist token correctly', async () => {
            // Act
            const result = await utilisateurService.genererTokenRecuperation(testUser.email);

            // Assert
            expect(result).toBeTruthy();
            expect(result.token).toBeTruthy();
            expect(result.expiration).toBeInstanceOf(Date);
            expect(result.token).toHaveLength(64); // 32 bytes en hex

            // Vérifier la persistance en base
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(result.token);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(result.expiration.getTime());
        });

        test('should validate token correctly after generation', async () => {
            // Arrange
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);

            // Act
            const validation = await utilisateurService.validerTokenRecuperation(tokenResult.token);

            // Assert
            expect(validation).toBeTruthy();
            expect(validation.id).toBe(testUser.id);
            expect(validation.email).toBe(testUser.email);
            expect(validation.token_recuperation).toBe(tokenResult.token);
        });

        test('should return null for non-existent email', async () => {
            // Act
            const result = await utilisateurService.genererTokenRecuperation('nonexistent@example.com');

            // Assert
            expect(result).toBeNull();
        });

        test('should return null for inactive user', async () => {
            // Arrange: Désactiver l'utilisateur
            await utilisateurService.mettreAJour(testUser.id, { actif: false });

            // Act
            const result = await utilisateurService.genererTokenRecuperation(testUser.email);

            // Assert
            expect(result).toBeNull();
        });

        test('should replace existing token when generating new one', async () => {
            // Arrange
            const firstToken = await utilisateurService.genererTokenRecuperation(testUser.email);
            
            // Act
            const secondToken = await utilisateurService.genererTokenRecuperation(testUser.email);

            // Assert
            expect(secondToken.token).not.toBe(firstToken.token);
            
            // Vérifier que seul le nouveau token est en base
            const userInDb = await db.get(
                'SELECT token_recuperation FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(secondToken.token);
        });

        test('should handle token expiration correctly', async () => {
            // Arrange: Créer un token et l'expirer manuellement
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);
            
            // Expirer le token en base
            await db.run(
                'UPDATE utilisateurs SET token_expiration = $1 WHERE id = $2',
                [new Date(Date.now() - 1000), testUser.id]
            );

            // Act
            const validation = await utilisateurService.validerTokenRecuperation(tokenResult.token);

            // Assert
            expect(validation).toBeNull();

            // Vérifier que le token expiré a été nettoyé
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBeNull();
            expect(userInDb.token_expiration).toBeNull();
        });

        test('should clean token after password update', async () => {
            // Arrange
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);
            
            // Act: Mettre à jour le mot de passe
            await utilisateurService.mettreAJourMotDePasse(testUser.id, 'newPassword123!');

            // Assert: Le token doit être nettoyé
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
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
            const result = await utilisateurService.mettreAJour(testUser.id, {
                token_recuperation: testToken,
                token_expiration: testExpiration
            });

            // Assert
            expect(result).toBeTruthy();
            expect(result.id).toBe(testUser.id);

            // Vérifier en base
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(testToken);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(testExpiration.getTime());
        });

        test('should filter out non-allowed fields correctly', async () => {
            // Act: Essayer de mettre à jour des champs non autorisés
            const result = await utilisateurService.mettreAJour(testUser.id, {
                id: 999, // Champ protégé
                date_creation: new Date(), // Champ protégé
                nom: 'Nouveau nom', // Champ autorisé
                champ_inexistant: 'valeur' // Champ inexistant
            });

            // Assert: Seuls les champs autorisés doivent être mis à jour
            expect(result.nom).toBe('Nouveau nom');
            expect(result.id).toBe(testUser.id); // ID inchangé
        });
    });

    describe('Token Security Tests', () => {
        test('should generate cryptographically secure tokens', async () => {
            // Arrange: Générer plusieurs tokens
            const tokens = [];
            for (let i = 0; i < 5; i++) {
                const result = await utilisateurService.genererTokenRecuperation(testUser.email);
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
            const result = await utilisateurService.genererTokenRecuperation(testUser.email);
            
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
            await expect(
                utilisateurService.mettreAJour(fakeId, {
                    token_recuperation: 'test',
                    token_expiration: new Date()
                })
            ).rejects.toThrow('Utilisateur non trouvé');
        });

        test('should validate email format in genererTokenRecuperation', async () => {
            // Act & Assert: Tester avec un email malformé
            const result = await utilisateurService.genererTokenRecuperation('invalid-email');
            
            // Le service ne doit pas crasher, mais retourner null
            expect(result).toBeNull();
        });
    });
});