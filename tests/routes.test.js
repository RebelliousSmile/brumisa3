const request = require('supertest');
const express = require('express');
const path = require('path');

// Configuration de base pour les tests
const app = express();

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));

// Middleware de test pour éviter les erreurs de session
app.use((req, res, next) => {
    req.session = {};
    next();
});

// Import des routes après configuration
const webRoutes = require('../src/routes/web');
app.use('/', webRoutes);

describe('Routes Web', () => {
    describe('GET /', () => {
        test('la page d\'accueil se charge sans erreur', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);
            
            // La page doit contenir le titre
            expect(response.text).toContain('Générateur PDF JDR');
        });

        test('la page d\'accueil contient les systèmes de jeu', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);
            
            // Vérifier que les systèmes sont mentionnés
            expect(response.text).toContain('Monsterhearts');
            expect(response.text).toContain('Metro 2033');
        });
    });

    describe('GET /systemes/:systeme', () => {
        test('affiche la page d\'un système valide', async () => {
            const response = await request(app)
                .get('/systemes/monsterhearts')
                .expect(200);
            
            expect(response.text).toContain('Monsterhearts');
        });

        test('retourne 404 pour un système inexistant', async () => {
            await request(app)
                .get('/systemes/inexistant')
                .expect(404);
        });
    });

    describe('Middleware systemesJeu', () => {
        test('le middleware injecte les données des systèmes', (done) => {
            const testApp = express();
            
            // Ajouter le middleware
            const webRoutes = require('../src/routes/web');
            testApp.use('/', webRoutes);
            
            // Route de test pour vérifier les locals
            testApp.get('/test-middleware', (req, res) => {
                res.json({
                    hasSystemes: !!res.locals.systemes,
                    hasSystemesJeu: !!res.locals.systemesJeu,
                    systemesJeuIsArray: Array.isArray(res.locals.systemesJeu),
                    systemesJeuLength: res.locals.systemesJeu ? res.locals.systemesJeu.length : 0
                });
            });
            
            request(testApp)
                .get('/test-middleware')
                .expect(200)
                .expect((res) => {
                    expect(res.body.hasSystemes).toBe(true);
                    expect(res.body.hasSystemesJeu).toBe(true);
                    expect(res.body.systemesJeuIsArray).toBe(true);
                    expect(res.body.systemesJeuLength).toBeGreaterThan(0);
                })
                .end(done);
        });
    });
});