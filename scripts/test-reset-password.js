/**
 * Test spécifique de récupération de mot de passe avec une adresse réelle
 */

const http = require('http');

// Utilisez votre vraie adresse email ici
const REAL_EMAIL = 'internet@fxguillois.email'; // ou l'email que vous voulez tester

async function testPasswordReset(email) {
    console.log(`🔑 Test récupération mot de passe pour: ${email}\n`);
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: email
        });

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

        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Message: ${response.message}`);
                    console.log(`Succès: ${response.succes ? 'Oui' : 'Non'}`);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Demande envoyée avec succès');
                        console.log('📧 Vérifiez votre boîte email !');
                        
                        // Donner des détails sur où chercher
                        console.log('\n📋 Détails à vérifier:');
                        console.log('   - Boîte de réception');
                        console.log('   - Dossier spam/courrier indésirable'); 
                        console.log('   - Expéditeur: activation@brumisa3.fr');
                        console.log('   - Sujet: Réinitialisation de votre mot de passe');
                    } else {
                        console.log('❌ Échec de la demande');
                        console.log(`Erreur: ${response.message || 'Inconnue'}`);
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.log('❌ Erreur parsing réponse:', error.message);
                    console.log('Réponse brute:', body);
                    reject(error);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Erreur requête:', err.message);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

// Test avec l'email réel
testPasswordReset(REAL_EMAIL).then(() => {
    console.log('\n✨ Test terminé');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur:', error.message);
    process.exit(1);
});