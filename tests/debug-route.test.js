const request = require('supertest');
const express = require('express');
const path = require('path');

describe('Debug - Route principale', () => {
    test('vérifier que le middleware fonctionne', () => {
        const app = express();
        const { SystemeUtils } = require('../src/config/systemesJeu');
        
        // Simuler le middleware exact
        app.use((req, res, next) => {
            res.locals.utilisateur = req.session?.utilisateur || null;
            res.locals.systemesJeu = SystemeUtils.getAllSystemes();
            res.locals.config = {
                appName: 'Générateur PDF JDR',
                version: '1.0.0'
            };
            next();
        });
        
        // Route de test
        app.get('/test', (req, res) => {
            res.json({
                hasSystemesJeu: !!res.locals.systemesJeu,
                isArray: Array.isArray(res.locals.systemesJeu),
                length: res.locals.systemesJeu?.length || 0,
                firstSystem: res.locals.systemesJeu?.[0]?.code || null
            });
        });
        
        return request(app)
            .get('/test')
            .expect(200)
            .then(response => {
                console.log('Debug middleware result:', response.body);
                expect(response.body.hasSystemesJeu).toBe(true);
                expect(response.body.isArray).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
            });
    });
    
    test('vérifier la route index avec données explicites', () => {
        const app = express();
        const { SystemeUtils } = require('../src/config/systemesJeu');
        
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '../src/views'));
        
        // Middleware de session mock
        app.use((req, res, next) => {
            req.session = {};
            next();
        });
        
        app.get('/', (req, res) => {
            const systemesData = SystemeUtils.getAllSystemes();
            console.log('SystemesJeu dans route:', {
                isArray: Array.isArray(systemesData),
                length: systemesData.length,
                firstCode: systemesData[0]?.code
            });
            
            res.render('index', {
                title: 'Test',
                systemesJeu: systemesData,
                meta: { description: 'test', keywords: 'test' }
            });
        });
        
        return request(app)
            .get('/')
            .expect(200)
            .then(response => {
                console.log('Route index response status:', response.status);
            });
    });
});