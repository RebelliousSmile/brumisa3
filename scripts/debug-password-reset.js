/**
 * Diagnostic complet de la récupération de mot de passe
 */

const http = require('http');
const db = require('../src/database/db');

async function debugPasswordReset() {
    const testEmail = 'activation@brumisa3.fr';
    console.log(`🔍 Diagnostic complet pour: ${testEmail}\n`);
    
    try {
        // 1. Vérifier l'utilisateur en base
        await db.init();
        console.log('1️⃣ Vérification utilisateur en base...');
        
        const user = await db.get(
            'SELECT id, nom, email, role, actif, token_recuperation, token_expiration FROM utilisateurs WHERE email = $1',
            [testEmail]
        );
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé en base');
            return;
        }
        
        console.log('✅ Utilisateur trouvé:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Nom: ${user.nom}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Actif: ${user.actif}`);
        console.log(`   Token actuel: ${user.token_recuperation || 'Aucun'}`);
        console.log('');
        
        // 2. Tester l'endpoint API avec monitoring
        console.log('2️⃣ Test endpoint API avec monitoring...');
        
        const postData = JSON.stringify({ email: testEmail });
        
        const options = {
            hostname: 'localhost',
            port: 3074,
            path: '/api/auth/mot-de-passe-oublie',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        await new Promise((resolve, reject) => {
            console.log('📡 Envoi requête...');
            
            const req = http.request(options, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', async () => {
                    try {
                        const response = JSON.parse(body);
                        
                        console.log(`📥 Réponse API:`);
                        console.log(`   Status: ${res.statusCode}`);
                        console.log(`   Message: ${response.message}`);
                        console.log(`   Succès: ${response.succes}`);
                        console.log('');
                        
                        // 3. Vérifier les changements en base après l'appel
                        console.log('3️⃣ Vérification changements en base...');
                        
                        const userAfter = await db.get(
                            'SELECT token_recuperation, token_expiration FROM utilisateurs WHERE email = $1',
                            [testEmail]
                        );
                        
                        console.log('📊 État après appel API:');
                        console.log(`   Token avant: ${user.token_recuperation || 'Aucun'}`);
                        console.log(`   Token après: ${userAfter.token_recuperation || 'Aucun'}`);
                        console.log(`   Expiration: ${userAfter.token_expiration || 'Aucune'}`);
                        
                        if (userAfter.token_recuperation && userAfter.token_recuperation !== user.token_recuperation) {
                            console.log('✅ Token généré avec succès');
                            console.log(`🔗 URL attendue: ${process.env.BASE_URL}/reinitialiser-mot-de-passe/${userAfter.token_recuperation}`);
                        } else {
                            console.log('❌ Aucun token généré - problème dans l\'API');
                        }
                        
                        resolve();
                    } catch (error) {
                        console.log('❌ Erreur parsing réponse:', error.message);
                        console.log('Réponse brute:', body);
                        reject(error);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.log('❌ Erreur requête:', error.message);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('💥 Erreur:', error.message);
    } finally {
        await db.close();
    }
}

debugPasswordReset().then(() => {
    console.log('\n✨ Diagnostic terminé');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
});