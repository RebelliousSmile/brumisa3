const express = require('express');
const OracleController = require('../src/controllers/OracleController');
const OracleService = require('../src/services/OracleService');

/**
 * Script pour tester directement la route /oracles et identifier l'erreur 500
 */
async function testRouteOracles() {
    console.log('=== Test Route /oracles ===\n');
    
    try {
        // Test 1: Service direct
        console.log('1. Test du service Oracle direct:');
        const oracleService = new OracleService();
        
        try {
            const result = await oracleService.listerOraclesAccessibles('UTILISATEUR', 1, 20);
            console.log(`✓ Service OK: ${result.data.length} oracles trouvés`);
            console.log(`Total: ${result.pagination.total}, Pages: ${result.pagination.pages}`);
        } catch (error) {
            console.error('✗ Erreur service:', error.message);
            console.error('Stack service:', error.stack);
        }
        
        // Test 2: Contrôleur direct
        console.log('\n2. Test du contrôleur Oracle direct:');
        const oracleController = new OracleController();
        
        // Simuler une requête
        const mockReq = {
            query: {},
            session: {
                utilisateur: null
            }
        };
        
        const mockRes = {
            render: (template, data) => {
                console.log(`✓ Contrôleur OK: render('${template}')`);
                console.log(`- Titre: ${data.titre}`);
                console.log(`- Oracles: ${data.oracles ? data.oracles.length : 0}`);
                console.log(`- Pagination: ${JSON.stringify(data.pagination)}`);
            }
        };
        
        try {
            await oracleController.pageListeOracles(mockReq, mockRes);
        } catch (error) {
            console.error('✗ Erreur contrôleur:', error.message);
            console.error('Stack contrôleur:', error.stack);
        }
        
        // Test 3: Vérifier la vue EJS
        console.log('\n3. Vérification de la vue EJS:');
        const fs = require('fs');
        const path = require('path');
        
        const vueOraclesPath = path.join(__dirname, '..', 'src', 'views', 'oracles', 'liste.ejs');
        
        if (fs.existsSync(vueOraclesPath)) {
            console.log(`✓ Vue existe: ${vueOraclesPath}`);
            
            const contenuVue = fs.readFileSync(vueOraclesPath, 'utf8');
            if (contenuVue.includes('game_system')) {
                console.log('⚠ Vue contient des références à game_system');
            } else {
                console.log('✓ Vue ne référence pas game_system');
            }
        } else {
            console.error(`✗ Vue manquante: ${vueOraclesPath}`);
        }
        
        // Test 4: Vérifier les données dans la base
        console.log('\n4. Vérification données base:');
        const db = require('../src/database/db');
        
        const oraclesCount = await db.get('SELECT COUNT(*) as total FROM oracles WHERE is_active = $1', [true]);
        console.log(`Oracles actifs: ${oraclesCount.total}`);
        
        const premiumCount = await db.get('SELECT COUNT(*) as total FROM oracles WHERE is_active = $1 AND premium_required = $2', [true, false]);
        console.log(`Oracles gratuits: ${premiumCount.total}`);
        
        await db.close();
        
    } catch (error) {
        console.error('Erreur générale:', error);
    }
}

// Exécuter le test
testRouteOracles().catch(console.error);