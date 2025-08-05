/**
 * Script de test pour vérifier la gestion de l'expiration de session
 */

const fetch = require('node-fetch');
const config = require('../src/config/config');

async function testerExpirationSession() {
    const baseUrl = `http://localhost:${config.PORT || 3076}`;
    
    console.log('🔍 Test de la gestion d\'expiration de session');
    console.log('================================================');
    
    try {
        // Test 1: Accès à une page protégée sans session (requête web)
        console.log('\n1. Test accès page protégée sans session (requête web)');
        const response1 = await fetch(`${baseUrl}/mes-documents`, {
            redirect: 'manual',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        
        console.log(`Status: ${response1.status}`);
        console.log(`Location: ${response1.headers.get('location')}`);
        
        if (response1.status === 302 && response1.headers.get('location')?.includes('/connexion')) {
            console.log('✅ Redirection vers connexion OK');
        } else {
            console.log('❌ Redirection incorrecte');
        }
        
        // Test 2: Accès à une API sans session (requête API)
        console.log('\n2. Test accès API sans session (requête JSON)');
        const response2 = await fetch(`${baseUrl}/api/personnages`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Status: ${response2.status}`);
        
        if (response2.status === 401) {
            const data = await response2.json();
            console.log(`Message: ${data.message}`);
            console.log('✅ Erreur API 401 OK');
        } else {
            console.log('❌ Réponse API incorrecte');
        }
        
        // Test 3: Test redirection avec paramètre
        console.log('\n3. Test URL de redirection avec paramètre');
        const response3 = await fetch(`${baseUrl}/admin`, {
            redirect: 'manual',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        
        console.log(`Status: ${response3.status}`);
        console.log(`Location: ${response3.headers.get('location')}`);
        
        const location = response3.headers.get('location');
        if (location && location.includes('/connexion?redirect=')) {
            console.log('✅ URL de redirection avec paramètre OK');
        } else {
            console.log('❌ URL de redirection incorrecte');
        }
        
    } catch (error) {
        console.error('❌ Erreur durant le test:', error.message);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    testerExpirationSession();
}

module.exports = { testerExpirationSession };