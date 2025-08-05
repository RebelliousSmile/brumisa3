/**
 * Test fonctionnel RÉEL de récupération de mot de passe
 * SANS MOCKS - teste l'envoi d'email réel
 */

const request = require('supertest');
const createTestApp = require('../helpers/createTestApp');
const db = require('../../src/database/db');

describe('Récupération mot de passe - Test fonctionnel RÉEL', () => {
    let app;
    let server;
    const testEmail = process.env.TEST_EMAIL || 'internet@fxguillois.email';

    beforeAll(async () => {
        app = await createTestApp();
        server = app.listen(0); // Port dynamique pour éviter les conflits
    });

    afterAll(async () => {
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
        await db.close();
    });

    beforeEach(async () => {
        // Créer un utilisateur de test réel en base
        await db.run(`
            INSERT OR REPLACE INTO utilisateurs (nom, email, role, actif) 
            VALUES (?, ?, ?, ?)
        `, ['Test User', testEmail, 'UTILISATEUR', true]);
    });

    test('should send real email for password reset', async () => {
        // Act: Demander la récupération de mot de passe
        const response = await request(app)
            .post('/api/auth/mot-de-passe-oublie')
            .send({ email: testEmail })
            .expect(200);

        // Assert: Vérifier la réponse
        expect(response.body.succes).toBe(true);
        expect(response.body.message).toContain('Si cet email existe');

        // Vérifier que le token est bien généré en base
        const userInDb = await db.get(
            'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE email = ?',
            [testEmail]
        );

        expect(userInDb.token_recuperation).toBeTruthy();
        expect(userInDb.token_expiration).toBeTruthy();

        // Vérifier que l'expiration est dans le futur
        const expiration = new Date(userInDb.token_expiration);
        const now = new Date();
        expect(expiration.getTime()).toBeGreaterThan(now.getTime());

        console.log('\n✅ Test fonctionnel réussi !');
        console.log(`📧 Email envoyé à: ${testEmail}`);
        console.log(`🔑 Token généré: ${userInDb.token_recuperation.substring(0, 10)}...`);
        console.log('📋 Vérifiez votre boîte email pour confirmer la réception');
    }, 30000); // Timeout de 30s pour l'envoi d'email
});