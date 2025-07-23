/**
 * Script pour diagnostiquer les problèmes d'expiration de token
 */

require('dotenv').config({ path: '.env.local' });

async function debugTokenExpiration() {
    console.log('🔍 Diagnostic d\'expiration de token de récupération');
    console.log('');

    const testEmail = 'internet@fxguillois.email';
    console.log(`📧 Email de test: ${testEmail}`);
    console.log('');

    try {
        const UtilisateurService = require('../src/services/UtilisateurService');
        const utilisateurService = new UtilisateurService();

        // Étape 1: Générer un nouveau token
        console.log('1️⃣ Génération d\'un nouveau token...');
        const tokenResult = await utilisateurService.genererTokenRecuperation(testEmail);
        
        if (!tokenResult) {
            console.log('❌ Aucun token généré (utilisateur non trouvé)');
            return;
        }

        console.log('✅ Token généré avec succès');
        console.log(`🔑 Token: ${tokenResult.token.substring(0, 8)}...`);
        console.log(`⏱️ Maintenant: ${new Date().toISOString()}`);
        console.log('');

        // Étape 2: Vérifier immédiatement
        console.log('2️⃣ Validation immédiate du token...');
        const validationImmediate = await utilisateurService.validerTokenRecuperation(tokenResult.token);
        
        if (validationImmediate) {
            console.log('✅ Token valide immédiatement');
            console.log(`⏱️ Expiration: ${validationImmediate.token_expiration}`);
            console.log(`⏱️ Maintenant: ${new Date().toISOString()}`);
            
            // Calculer le temps restant
            const expiration = new Date(validationImmediate.token_expiration);
            const maintenant = new Date();
            const tempsRestant = Math.floor((expiration - maintenant) / 1000 / 60); // en minutes
            console.log(`⏰ Temps restant: ${tempsRestant} minutes`);
        } else {
            console.log('❌ Token invalide immédiatement après création !');
        }
        console.log('');

        // Étape 3: Vérifier en base directement
        console.log('3️⃣ Vérification directe en base de données...');
        const Utilisateur = require('../src/models/Utilisateur');
        const utilisateurModel = new Utilisateur();
        
        const utilisateurDb = await utilisateurModel.obtenirParEmail(testEmail);
        if (utilisateurDb) {
            console.log('📊 Données en base:');
            console.log(`   Token DB: ${utilisateurDb.token_recuperation ? utilisateurDb.token_recuperation.substring(0, 8) + '...' : 'AUCUN'}`);
            console.log(`   Expiration DB: ${utilisateurDb.token_expiration || 'AUCUNE'}`);
            console.log(`   Token match: ${utilisateurDb.token_recuperation === tokenResult.token ? '✅' : '❌'}`);
            
            if (utilisateurDb.token_expiration) {
                const expirationDb = new Date(utilisateurDb.token_expiration);
                const maintenantDb = new Date();
                console.log(`   Expiration future: ${expirationDb > maintenantDb ? '✅' : '❌'}`);
                console.log(`   Différence: ${Math.floor((expirationDb - maintenantDb) / 1000 / 60)} minutes`);
            }
        } else {
            console.log('❌ Utilisateur non trouvé en base');
        }
        console.log('');

        // Étape 4: Test avec requête SQL directe
        console.log('4️⃣ Test avec requête SQL directe...');
        const db = require('../src/database/db');
        
        // Utiliser la même logique que obtenirParToken mais avec plus de debug
        const sqlResult = await db.get(
            'SELECT id, email, token_recuperation, token_expiration, NOW() as current_time FROM utilisateurs WHERE email = $1',
            [testEmail]
        );
        
        if (sqlResult) {
            console.log('🔍 Résultat SQL:');
            console.log(`   ID: ${sqlResult.id}`);
            console.log(`   Token DB: ${sqlResult.token_recuperation ? sqlResult.token_recuperation.substring(0, 8) + '...' : 'AUCUN'}`);
            console.log(`   Expiration DB: ${sqlResult.token_expiration}`);
            console.log(`   Heure DB: ${sqlResult.current_time}`);
            
            // Test de la condition d'expiration
            if (sqlResult.token_expiration) {
                const expirationTime = new Date(sqlResult.token_expiration);
                const currentTime = new Date();
                console.log(`   Expiration comme Date: ${expirationTime.toISOString()}`);
                console.log(`   Maintenant comme Date: ${currentTime.toISOString()}`);
                console.log(`   Token toujours valide: ${expirationTime > currentTime ? '✅' : '❌'}`);
            }
        }
        console.log('');

        // Étape 5: Test de la méthode obtenirParToken directement
        console.log('5️⃣ Test de obtenirParToken directement...');
        const directTokenTest = await utilisateurModel.obtenirParToken(tokenResult.token);
        
        if (directTokenTest) {
            console.log('✅ obtenirParToken fonctionne');
            console.log(`   Utilisateur: ${directTokenTest.email}`);
            console.log(`   Token: ${directTokenTest.token_recuperation.substring(0, 8)}...`);
        } else {
            console.log('❌ obtenirParToken ne retourne rien');
            
            // Debug plus approfondi
            console.log('🔍 Debug de la requête SQL:');
            const debugSql = `SELECT *, 
                                     NOW() as current_time,
                                     token_expiration as token_exp_formatted,
                                     (token_expiration > NOW()) as is_valid
                              FROM utilisateurs 
                              WHERE token_recuperation = $1`;
            
            const debugResult = await db.get(debugSql, [tokenResult.token]);
            
            if (debugResult) {
                console.log('   Résultat debug:');
                Object.keys(debugResult).forEach(key => {
                    console.log(`   ${key}: ${debugResult[key]}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error.message);
        console.error(error.stack);
    }
}

// Exécution
debugTokenExpiration()
    .then(() => {
        console.log('');
        console.log('✨ Diagnostic terminé !');
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });