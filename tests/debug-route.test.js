const request = require('supertest');
const express = require('express');
const path = require('path');

describe('Debug - Route principale', () => {
    test('vérifier que le middleware fonctionne', () => {
        const app = express();
        const SystemeUtils = require('../src/utils/SystemeUtils');
        
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
    
    test('vérifier la route index avec ViewModel et ThemeService', () => {
        const app = express();
        const SystemeUtils = require('../src/utils/SystemeUtils');
        
        app.use(express.json());
        
        app.get('/', (req, res) => {
            const systemesData = SystemeUtils.getAllSystemes();
            console.log('SystemesJeu dans route:', {
                isArray: Array.isArray(systemesData),
                length: systemesData.length,
                firstCode: systemesData[0]?.code
            });
            
            // Tester l'intégration avec la nouvelle architecture
            const SystemThemeService = require('../src/services/SystemThemeService');
            const SystemCardViewModel = require('../src/viewModels/SystemCardViewModel');
            
            const viewModel = new SystemCardViewModel(SystemThemeService);
            const mainColumnCodes = ['monsterhearts', 'metro2033', 'zombiology'];
            const secondColumnCodes = ['engrenages', 'mistengine'];
            const systemCards = viewModel.groupByColumns(mainColumnCodes, secondColumnCodes, systemesData);
            
            res.json({
                success: true,
                systemesCount: systemesData.length,
                mainColumnCount: systemCards.mainColumn.length,
                secondColumnCount: systemCards.secondColumn.length,
                firstMainSystem: systemCards.mainColumn[0]?.code,
                firstSecondSystem: systemCards.secondColumn[0]?.code
            });
        });
        
        return request(app)
            .get('/')
            .expect(200)
            .then(response => {
                console.log('Route index response data:', response.body);
                expect(response.body.success).toBe(true);
                expect(response.body.systemesCount).toBe(5);
                expect(response.body.mainColumnCount).toBe(3);
                expect(response.body.secondColumnCount).toBe(2);
                expect(response.body.firstMainSystem).toBe('monsterhearts');
                expect(response.body.firstSecondSystem).toBe('engrenages');
            });
    });
});