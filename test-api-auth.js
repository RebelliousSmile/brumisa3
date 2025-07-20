// Utilisation du module http natif
const http = require('http');

function testAvecHttp(path, method, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 3081,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

async function testerAuthentification() {
    console.log('=== TEST DES ROUTES D\'AUTHENTIFICATION ===\n');
    
    // Test 1: Inscription avec données valides
    console.log('1. Test inscription avec données valides:');
    const donneesInscription = {
        nom: 'Test API User',
        email: `testapi${Date.now()}@test.com`,
        motDePasse: 'password123',
        confirmationMotDePasse: 'password123'
    };
    console.log('Données envoyées:', JSON.stringify(donneesInscription, null, 2));
    
    try {
        const result1 = await testAvecHttp('/api/auth/inscription', 'POST', donneesInscription);
        console.log('Réponse:', result1.status, JSON.stringify(result1.data, null, 2));
    } catch (error) {
        console.error('Erreur:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Connexion avec les mêmes identifiants
    console.log('2. Test connexion avec les identifiants créés:');
    const donneesConnexion = {
        email: donneesInscription.email,
        motDePasse: donneesInscription.motDePasse
    };
    console.log('Données envoyées:', JSON.stringify(donneesConnexion, null, 2));
    
    try {
        const result2 = await testAvecHttp('/api/auth/connexion', 'POST', donneesConnexion);
        console.log('Réponse:', result2.status, JSON.stringify(result2.data, null, 2));
    } catch (error) {
        console.error('Erreur:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Inscription avec données manquantes
    console.log('3. Test inscription avec données manquantes:');
    const donneesIncompletes = {
        email: 'incomplet@test.com'
    };
    console.log('Données envoyées:', JSON.stringify(donneesIncompletes, null, 2));
    
    try {
        const result3 = await testAvecHttp('/api/auth/inscription', 'POST', donneesIncompletes);
        console.log('Réponse:', result3.status, JSON.stringify(result3.data, null, 2));
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

testerAuthentification().catch(console.error);