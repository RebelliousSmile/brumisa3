/**
 * Script de test avec l'email réel de l'utilisateur
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
require('dotenv').config({ path: '.env.local' });

// Fonction helper pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        status: res.statusCode,
                        data: JSON.parse(data)
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (options.data) {
            req.write(JSON.stringify(options.data));
        }
        
        req.end();
    });
}

async function testWithRealUserEmail() {
    const baseUrl = 'https://brumisa3.fr'; // Toujours tester en production
    const realEmail = process.env.ADMIN_EMAIL || 'internet@fxguillois.email';
    
    console.log('🧪 Test avec l\'email réel de l\'utilisateur');
    console.log(`📧 Email testé: ${realEmail}`);
    console.log(`🌐 URL: ${baseUrl}`);
    console.log('');

    try {
        console.log('1️⃣ Test avec email réel...');
        const response = await makeRequest(`${baseUrl}/api/auth/mot-de-passe-oublie`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { email: realEmail }
        });

        console.log('📨 Réponse serveur:', response.data);
        console.log(`📊 Status HTTP: ${response.status}`);
        
        if (response.data.succes) {
            console.log('');
            console.log('✅ SUCCÈS ! Email traité par le serveur');
            console.log('🔍 Actions à vérifier:');
            console.log(`   1. Dashboard Resend: chercher ${realEmail}`);
            console.log(`   2. Boîte email: ${realEmail}`);
            console.log('   3. Dossier spam/indésirables');
            console.log('   4. Logs de l\'application');
        } else {
            console.log('');
            console.log('❌ ERREUR détectée:');
            console.log(`   Message: ${response.data.message}`);
            console.log(`   Type: ${response.data.type || 'inconnu'}`);
            
            if (response.data.type === 'erreur_interne') {
                console.log('');
                console.log('💡 Causes possibles:');
                console.log('   • Problème de template email');
                console.log('   • Erreur Resend API');
                console.log('   • Configuration manquante');
                console.log('   • Utilisateur inexistant dans la base');
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la requête:', error.message);
    }
}

async function testUserExists() {
    console.log('');
    console.log('2️⃣ Vérification existence utilisateur en local...');
    
    try {
        const UtilisateurService = require('../src/services/UtilisateurService');
        const utilisateurService = new UtilisateurService();
        
        const realEmail = process.env.ADMIN_EMAIL || 'internet@fxguillois.email';
        const tokenResult = await utilisateurService.genererTokenRecuperation(realEmail);
        
        if (tokenResult) {
            console.log('✅ Utilisateur trouvé en base locale:', {
                nom: tokenResult.utilisateur.nom,
                token_length: tokenResult.token.length
            });
        } else {
            console.log('❌ Utilisateur non trouvé en base locale');
            console.log('💡 L\'utilisateur pourrait exister seulement en production');
        }
        
    } catch (error) {
        console.log('⚠️ Impossible de vérifier localement:', error.message);
    }
}

// Exécution
console.log('🚀 Test d\'email de récupération avec utilisateur réel\n');

testWithRealUserEmail()
    .then(() => testUserExists())
    .then(() => {
        console.log('');
        console.log('✨ Test terminé !');
        console.log('');
        console.log('📋 Récapitulatif du diagnostic:');
        console.log('   1. activation@brumisa3.fr → utilisateur inexistant');
        console.log('   2. internet@fxguillois.email → à tester');
        console.log('   3. Vérifier les logs Resend pour confirmation');
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });