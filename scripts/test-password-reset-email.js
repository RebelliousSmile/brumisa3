/**
 * Script de test pour l'endpoint de récupération de mot de passe
 * Utilise automatiquement l'email configuré dans .env
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

async function testPasswordResetWithConfigEmail() {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3074';
    const testEmail = process.env.RESEND_FROM_EMAIL || 'activation@brumisa3.fr';
    
    console.log('🧪 Test de récupération de mot de passe');
    console.log(`📧 Email de test: ${testEmail}`);
    console.log(`🌐 URL de base: ${baseUrl}`);
    console.log('');

    try {
        // Test 1: Utiliser la route de test GET (développement uniquement)
        console.log('1️⃣ Test via la route GET de développement...');
        try {
            const response1 = await makeRequest(`${baseUrl}/api/auth/test-mot-de-passe-oublie`);
            console.log('✅ Route de test:', response1.data);
        } catch (error) {
            if (error.status === 404) {
                console.log('ℹ️ Route de test non disponible (probablement en production)');
            } else {
                console.log('❌ Erreur route de test:', error.data || error.message);
            }
        }
        
        console.log('');

        // Test 2: Test direct avec l'email configuré
        console.log('2️⃣ Test direct via POST...');
        const response2 = await makeRequest(`${baseUrl}/api/auth/mot-de-passe-oublie`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { email: testEmail }
        });

        console.log('✅ Réponse POST:', response2.data);
        
        // Vérifications
        if (response2.data.succes) {
            console.log('');
            console.log('🎉 Test réussi !');
            console.log('📧 Vérifiez votre boîte email:', testEmail);
            console.log('🔍 Consultez aussi les logs Resend pour confirmer l\'envoi');
        } else {
            console.log('⚠️ La requête a répondu mais avec succes=false');
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.data || error.message);
        
        if (error.status === 400) {
            console.log('💡 Vérifiez le format de l\'email dans votre .env.local');
        } else if (error.status === 500) {
            console.log('💡 Vérifiez la configuration de Resend et la base de données');
        }
    }
}

// Test avec un email invalide pour vérifier la sécurité
async function testWithInvalidEmail() {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3074';
    
    console.log('');
    console.log('3️⃣ Test de sécurité avec email inexistant...');
    
    try {
        const response = await makeRequest(`${baseUrl}/api/auth/mot-de-passe-oublie`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { email: 'utilisateur-inexistant@example.com' }
        });

        console.log('✅ Réponse sécurité:', response.data);
        
        if (response.data.succes && response.data.message.includes('Si cet email existe')) {
            console.log('🔒 Sécurité OK: La réponse ne révèle pas si l\'email existe');
        }
        
    } catch (error) {
        console.error('❌ Erreur test sécurité:', error.data || error.message);
    }
}

// Exécution des tests
console.log('🚀 Démarrage des tests d\'email de récupération de mot de passe\n');

testPasswordResetWithConfigEmail()
    .then(() => testWithInvalidEmail())
    .then(() => {
        console.log('');
        console.log('✨ Tests terminés !');
        console.log('');
        console.log('📋 Actions à vérifier :');
        console.log('  1. Email reçu dans la boîte:', process.env.RESEND_FROM_EMAIL);
        console.log('  2. Logs Resend dans le dashboard');
        console.log('  3. Logs de l\'application');
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });