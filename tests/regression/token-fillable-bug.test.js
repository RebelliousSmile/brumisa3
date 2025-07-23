/**
 * Test de régression pour le bug des champs fillable du token de récupération
 * 
 * Ce test vérifie spécifiquement que le bug où les champs token_recuperation 
 * et token_expiration n'étaient pas dans fillable ne peut plus se reproduire.
 * 
 * Bug original: Les tokens étaient générés mais pas sauvegardés car les champs
 * n'étaient pas autorisés dans le modèle Utilisateur.
 */

const crypto = require('crypto');
const UtilisateurService = require('../../src/services/UtilisateurService');
const Utilisateur = require('../../src/models/Utilisateur');
const db = require('../../src/database/db');

describe('Regression: Token Fillable Fields Bug', () => {
    let utilisateurService;
    let utilisateurModel;
    let testUser;

    beforeAll(async () => {
        utilisateurService = new UtilisateurService();
        utilisateurModel = new Utilisateur();
    });

    beforeEach(async () => {
        // Créer un utilisateur de test
        const email = `test_${crypto.randomBytes(8).toString('hex')}@example.com`;
        const nom = 'Test User';
        const motDePasse = 'testPassword123!';

        testUser = await utilisateurService.creer({
            nom,
            email,
            mot_de_passe: motDePasse,
            role: 'UTILISATEUR'
        });
    });

    afterEach(async () => {
        if (testUser?.id) {
            await db.run('DELETE FROM utilisateurs WHERE id = $1', [testUser.id]);
        }
    });

    describe('Fillable Fields Configuration', () => {
        test('token_recuperation and token_expiration must be in fillable array', () => {
            // Ce test détecte directement le bug de configuration
            expect(utilisateurModel.fillable).toContain('token_recuperation');
            expect(utilisateurModel.fillable).toContain('token_expiration');
        });

        test('model should allow updating token fields directly', async () => {
            const testToken = crypto.randomBytes(32).toString('hex');
            const testExpiration = new Date(Date.now() + 60 * 60 * 1000);

            // Act: Utiliser directement le modèle (pas le service)
            const result = await utilisateurModel.update(testUser.id, {
                token_recuperation: testToken,
                token_expiration: testExpiration
            });

            // Assert: La mise à jour doit réussir
            expect(result).toBeTruthy();

            // Vérifier que les données sont bien en base
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(testToken);
            expect(new Date(userInDb.token_expiration).getTime()).toBe(testExpiration.getTime());
        });
    });

    describe('Service-Model Integration', () => {
        test('token generation should persist through full service chain', async () => {
            // Ce test reproduit exactement le scénario du bug original
            
            // Act: Générer un token via le service
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);

            // Assert: Le service doit retourner un token
            expect(tokenResult).toBeTruthy();
            expect(tokenResult.token).toBeTruthy();

            // CRUCIAL: Vérifier que le token est RÉELLEMENT en base
            // C'est cette vérification qui manquait et qui aurait détecté le bug
            const userInDb = await db.get(
                'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                [testUser.id]
            );

            expect(userInDb.token_recuperation).toBe(tokenResult.token);
            expect(userInDb.token_expiration).toBeTruthy();
        });

        test('token validation should work immediately after generation', async () => {
            // Reproduire le scénario exact du debug script
            
            // Step 1: Générer le token
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);
            expect(tokenResult).toBeTruthy();

            // Step 2: Valider immédiatement (c'était ça qui échouait)
            const validation = await utilisateurService.validerTokenRecuperation(tokenResult.token);
            
            // Cette assertion aurait échoué avec le bug original
            expect(validation).toBeTruthy();
            expect(validation.id).toBe(testUser.id);
            expect(validation.email).toBe(testUser.email);
        });

        test('obtenirParToken should find recently generated token', async () => {
            // Tester la méthode obtenirParToken du modèle directement
            
            // Arrange: Générer un token
            const tokenResult = await utilisateurService.genererTokenRecuperation(testUser.email);
            
            // Act: Utiliser obtenirParToken du modèle
            const foundUser = await utilisateurModel.obtenirParToken(tokenResult.token);
            
            // Assert: Le modèle doit trouver l'utilisateur
            expect(foundUser).toBeTruthy();
            expect(foundUser.id).toBe(testUser.id);
            expect(foundUser.token_recuperation).toBe(tokenResult.token);
        });
    });

    describe('Database Schema Validation', () => {
        test('database should have required token columns', async () => {
            // Vérifier que les colonnes existent bien en base
            const schemaInfo = await db.all(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'utilisateurs' 
                AND column_name IN ('token_recuperation', 'token_expiration')
                ORDER BY column_name
            `);

            expect(schemaInfo).toHaveLength(2);
            
            const tokenRecuperation = schemaInfo.find(col => col.column_name === 'token_recuperation');
            const tokenExpiration = schemaInfo.find(col => col.column_name === 'token_expiration');
            
            expect(tokenRecuperation).toBeTruthy();
            expect(tokenExpiration).toBeTruthy();
            
            // Les colonnes doivent être nullable (pour pouvoir être nulles après nettoyage)
            expect(tokenRecuperation.is_nullable).toBe('YES');
            expect(tokenExpiration.is_nullable).toBe('YES');
        });

        test('token expiration query should work with current database setup', async () => {
            // Tester la requête SQL exacte utilisée par obtenirParToken
            const testToken = crypto.randomBytes(32).toString('hex');
            const futureExpiration = new Date(Date.now() + 60 * 60 * 1000);
            
            // Insérer un token directement
            await db.run(
                'UPDATE utilisateurs SET token_recuperation = $1, token_expiration = $2 WHERE id = $3',
                [testToken, futureExpiration.toISOString(), testUser.id]
            );
            
            // Tester la requête avec condition d'expiration
            const result = await db.get(
                'SELECT * FROM utilisateurs WHERE token_recuperation = $1 AND token_expiration > NOW()',
                [testToken]
            );
            
            expect(result).toBeTruthy();
            expect(result.id).toBe(testUser.id);
        });
    });

    describe('Bug Reproduction Prevention', () => {
        test('should fail if fillable fields are removed (protection against regression)', () => {
            // Ce test échoue si quelqu'un retire les champs de fillable par erreur
            const requiredFields = ['token_recuperation', 'token_expiration'];
            
            requiredFields.forEach(field => {
                if (!utilisateurModel.fillable.includes(field)) {
                    fail(`REGRESSION DETECTED: Field '${field}' missing from Utilisateur.fillable array. ` +
                         `This would cause password reset tokens to not be saved to database.`);
                }
            });
        });

        test('should demonstrate the original bug scenario would fail without fix', async () => {
            // Simuler ce qui se passerait si les champs n'étaient pas fillable
            const originalFillable = [...utilisateurModel.fillable];
            
            // Retirer temporairement les champs (simulation du bug)
            utilisateurModel.fillable = originalFillable.filter(
                field => !['token_recuperation', 'token_expiration'].includes(field)
            );
            
            try {
                // Essayer de mettre à jour avec les champs non-fillable
                const result = await utilisateurModel.update(testUser.id, {
                    token_recuperation: 'test_token',
                    token_expiration: new Date()
                });
                
                // Vérifier que les champs n'ont PAS été mis à jour
                const userInDb = await db.get(
                    'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE id = $1',
                    [testUser.id]
                );
                
                // Avec les champs non-fillable, ils ne devraient pas être mis à jour
                expect(userInDb.token_recuperation).toBeNull();
                expect(userInDb.token_expiration).toBeNull();
                
            } finally {
                // Restaurer la configuration correcte
                utilisateurModel.fillable = originalFillable;
            }
        });
    });
});